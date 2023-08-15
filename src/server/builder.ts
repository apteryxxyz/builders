import { ms } from 'enhanced-ms';
import type { ZodType } from 'zod';
import { z } from 'zod';
import { ServerActionError } from '../common/error';
import type { ServerAction } from '../common/types';
import { createTimeoutPromise, fromZodError } from './helpers';

type Input = ZodType;
interface Timeout {
  after: string;
}

/**
 * Represents the options that can be passed to a server action builder.
 */
export interface ServerActionBuilderOptions<
  TInput extends Input | undefined = Input,
  TTimeout extends Timeout | undefined = Timeout
> {
  input?: TInput;
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
  input: (input) => {
    const schema = typeof input === 'function' ? input(z) : input;

    const prototype = Object.getPrototypeOf(
      schema.constructor //
    ) as { name: string };
    if (prototype.name !== 'ZodType')
      throw new TypeError("Parameter 'input' must be a zod type");

    return createServerActionBuilder({ ...options, input: schema });
  },

  timeout: (timeout) => {
    if (typeof timeout !== 'object' || timeout === null)
      throw new TypeError("Parameter 'timeout' must be an object");
    if (typeof timeout.after !== 'string' || (ms(timeout.after) ?? 0) <= 0)
      throw new TypeError(
        "Parameter 'timeout.after' must be a string that parses to a number greater than zero"
      );
    return createServerActionBuilder({ ...options, timeout });
  },

  definition: (action) => {
    if (
      typeof action !== 'function' ||
      action.constructor.name !== 'AsyncFunction'
    )
      throw new TypeError("Parameter 'action' must be an async function");

    type TInput = Parameters<typeof action>[0];
    type TData = Awaited<ReturnType<typeof action>>;

    const after = options.timeout?.after;
    const timeout = (after ? ms(after) : 0) ?? 0;

    return async function serverAction(input: TInput) {
      /* -- VALIDATE INPUT START -- */
      const parsed = options.input?.safeParse(input);
      if (parsed && !parsed.success)
        return error('Validation', fromZodError(parsed.error));
      if (parsed) input = parsed.data as typeof input;
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
              `Server action timed out after ${timeout / 1_000} seconds`
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

      return output;
    } as ServerAction<TInput, TData>;
  },
});

/**
 * Create a new server action builder.
 * @returns A new server action builder.
 */
export const createServerAction = () => createServerActionBuilder({});
