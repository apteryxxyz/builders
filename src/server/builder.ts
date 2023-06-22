import { ms } from 'enhanced-ms';
import { LRUCache } from 'lru-cache';
import objectHash from 'object-hash';
import { ZodType, z } from 'zod';
import { ServerActionError } from '../common/error';
import { ServerAction } from '../common/types';
import { createTimeoutPromise, fromZodError } from './helpers';

type Input = ZodType;
type Cache = { max: number; ttl: string };
type Timeout = { after: string };

/**
 * Represents the options that can be passed to a server action builder.
 */
export interface ServerActionBuilderOptions<
    TInput extends Input | undefined = Input,
    TCache extends Cache | undefined = Cache,
    TTimeout extends Timeout | undefined = Timeout
> {
    input?: TInput;
    cache?: TCache;
    timeout?: TTimeout;
}

/**
 * A builder to create server actions.
 */
export interface ServerActionBuilder<
    TOptions extends ServerActionBuilderOptions
> {
    /**
     * Add an input parser to the action, without it the action will only accept `undefined` as input.
     * @param input The zod parser to use for VALIDATE INPUT.
     * @returns A new server action builder with the input parser added.
     */
    input<TInput extends Input>(
        input: TInput | ((_: typeof z) => TInput)
    ): ServerActionBuilder<TOptions & { input: TInput }>;

    /**
     * Add caching to the action, caches the output of the action for a specific amount of time.
     * @param cache Cache options.
     * @returns A new server action builder with caching added.
     */
    cache<TCache extends Cache>(
        cache: TCache
    ): ServerActionBuilder<TOptions & { cache: TCache }>;

    /**
     * Add a timeout to the action, if the action takes longer than the timeout to execute, it will be cancelled.
     * @param timeout Timeout options.
     * @returns A new server action builder with a timeout added.
     */
    timeout<TTimeout extends Timeout>(
        timeout: TTimeout
    ): ServerActionBuilder<TOptions & { timeout: TTimeout }>;

    /**
     * Define the action that will be executed, then return the final server action.
     * @param action The action to wrap.
     * @returns The server action.
     */
    definition<
        TInput extends TOptions['input'] extends Input
            ? z.output<TOptions['input']>
            : undefined,
        TData
    >(
        action: (input: TInput) => Promise<TData>
    ): ServerAction<TInput, TData>;
}

function success<TData>(data: TData) {
    return { success: true as const, data };
}

function error(...params: ConstructorParameters<typeof ServerActionError>) {
    return {
        success: false as const,
        error: new ServerActionError(...params).toObject(),
    };
}

/**
 * Create a new server action builder, you will probably rather use the already exported `serverAction` builder.
 * @param options Partial options to start the builder with.
 * @returns A new server action builder.
 */
export const createServerActionBuilder = <
    TOptions extends ServerActionBuilderOptions
>(
    options: TOptions = {} as TOptions
): ServerActionBuilder<TOptions> => ({
    input: input => {
        const schema = typeof input === 'function' ? input(z) : input;
        const type = Object.getPrototypeOf(schema.constructor).name;
        if (type !== 'ZodType')
            throw new TypeError("Parameter 'input' must be a zod type");

        return createServerActionBuilder({ ...options, input: schema });
    },

    cache: cache => {
        if (typeof cache !== 'object' || cache === null)
            throw new TypeError("Parameter 'cache' must be an object");
        if (typeof cache.max !== 'number' || cache.max <= 0)
            throw new TypeError(
                "Parameter 'cache.max' must be a number greater than zero"
            );
        if (typeof cache.ttl !== 'string' || (ms(cache.ttl) ?? 0) <= 0)
            throw new TypeError(
                "Parameter 'cache.ttl' must be a string that parses to a number greater than zero"
            );

        return createServerActionBuilder({ ...options, cache });
    },

    timeout: timeout => {
        if (typeof timeout !== 'object' || timeout === null)
            throw new TypeError("Parameter 'timeout' must be an object");
        if (typeof timeout.after !== 'string' || (ms(timeout.after) ?? 0) <= 0)
            throw new TypeError(
                "Parameter 'timeout.after' must be a string that parses to a number greater than zero"
            );
        return createServerActionBuilder({ ...options, timeout });
    },

    definition: action => {
        if (
            typeof action !== 'function' ||
            action.constructor.name !== 'AsyncFunction'
        )
            throw new TypeError("Parameter 'action' must be an async function");

        type TInput = Parameters<typeof action>[0];
        type TData = Awaited<ReturnType<typeof action>>;

        const timeout =
            (options.timeout?.after && ms(options.timeout.after)) || 0;
        const cache =
            options.cache &&
            new LRUCache<string, any, unknown>({
                max: options.cache.max,
                ttl: ms(options.cache.ttl) ?? 0,
            });

        async function serverAction(input: TInput) {
            /* -- CACHE GET START -- */
            const identifier = objectHash(input ?? null);
            const existing = cache?.get(identifier) as TData | undefined;
            if (existing) return success(existing);
            /* -- CACHE GET END -- */

            /* -- VALIDATE INPUT START -- */
            const parsed = options.input?.safeParse(input);
            if (parsed && !parsed.success)
                return error('Validation', fromZodError(parsed.error));
            if (parsed) input = parsed.data;
            /* -- VALIDATE INPUT END -- */

            let promise = action(input);

            /* -- TIMEOUT START -- */
            if (timeout > 0)
                promise = Promise.race([
                    promise,
                    createTimeoutPromise(
                        timeout,
                        new ServerActionError(
                            'Timeout',
                            `Server action timed out after ${
                                timeout / 1_000
                            } seconds`
                        )
                    ),
                ]);
            /* -- TIMEOUT END -- */

            const output = await promise
                .then(success)
                .catch((error_: Error | ServerActionError) => {
                    if (error_ instanceof ServerActionError)
                        return error(error_.kind, error_.message);
                    return error('Action', error_.message);
                });
            if (!output.success) return output;

            /* -- CACHE SET START -- */
            if (cache) cache.set(identifier, output.data);
            /* -- CACHE SET END -- */

            return output;
        }

        return Object.assign(serverAction, {
            __sa: true as const,
        }) as ServerAction<TInput, TData>;
    },
});

/**
 * Create a new server action builder.
 * @returns A new server action builder.
 */
export const createServerAction = () => createServerActionBuilder({});
