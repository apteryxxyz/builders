import { z } from 'zod';
import { ApiError } from '@/shared/api-error';
import type { Awaitable } from '@/shared/types';
import { fromZodError } from '../zod-error';
import type { ServerAction } from './types';

function success<TData>(data: TData) {
  return { success: true as const, data };
}

function error(...params: ConstructorParameters<typeof ApiError>) {
  return { success: false as const, error: new ApiError(...params).toObject() };
}

export interface ServerActionBuilderOptions {
  input?: z.ZodTypeAny;
}

/**
 * A builder for easily creating Next.js server actions with input validation, error handling, and complete type safety.
 * @example
 * ```ts
 * import { ServerActionBuilder } from '@builders/next/server';
 * import { z } from 'zod';
 *
 * export const getPost = new ServerActionBuilder()
 *   .setInput(z.string())
 *   .setDefinition(id => ({ id, title: 'Hello, world!' }));
 * ```
 * @remarks
 * There are four ways you could use your new server action:
 *
 * 1. Manual Call: You can use the server action like you normally would directly in your code, although it's recommended to consider any one of the following options.
 *
 * 2. `executeServerAction` Function: A function which wraps the server action and manages success and error handling.
 *
 * 3. `useServerActionQuery` Hook: This hook is akin to the `useQuery` hook in `react-query`, but note that it is not identical.
 *
 * 4. `useServerActionMutation` Hook: Similar to the `useMutation` hook in `react-query`, but with some differences.
 */
export class ServerActionBuilder<TOptions extends ServerActionBuilderOptions> {
  public readonly options: Readonly<TOptions>;

  public constructor(options?: TOptions) {
    this.options = Object.freeze(options ?? {}) as TOptions;
  }

  /**
   * Sets the schema for the server action's input.
   * @param input The Zod schema.
   */
  public setInput<TInput extends z.ZodTypeAny>(input: TInput) {
    if (!String(input?._def?.typeName))
      throw new TypeError("Parameter of 'setInput' must be a Zod schema");

    return new ServerActionBuilder<Omit<TOptions, 'input'> & { input: TInput }>(
      {
        ...this.options,
        input,
      },
    );
  }

  /**
   * Sets the function definition of the server action, this method builds the action and must be called last.
   * @param definition The function definition.
   */
  public setDefinition<
    TInput extends TOptions['input'] extends z.ZodType
      ? z.output<TOptions['input']>
      : undefined,
    TData,
  >(definition: (input: TInput) => Awaitable<TData>) {
    if (!(definition instanceof Function))
      throw new TypeError("Parameter of 'setDefinition' must be a function");

    const handler = async (...args: Parameters<typeof definition>) => {
      /* --- Input Start --- */
      let input = undefined as unknown as (typeof args)[0];
      if (this.options.input) {
        const parsedInput = this.options.input.safeParse(args[0]);
        if (parsedInput.success) input = parsedInput.data as (typeof args)[0];
        else return error(400, fromZodError(parsedInput.error));
      }
      /* --- Input End --- */

      /* --- Definition Start --- */
      try {
        const result = await definition(input);
        return success(result);
      } catch (cause) {
        if (cause instanceof ApiError)
          return error(cause.status, cause.message);
        return error(
          500,
          process.env['NODE_ENV'] === 'production'
            ? 'Internal server error'
            : String(Reflect.get(cause ?? {}, 'message') ?? cause),
        );
      }
      /* --- Definition End --- */
    };

    return handler as ServerAction<TInput, TData>;
  }
}
