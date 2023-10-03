import type { ApiError } from '@/shared/api-error';

/**
 * A server action is a function that can be called from the client. It is executed on the server and returns a response. This type represents a built server action.
 * @typeParam TInput The type of the input to the action.
 * @typeParam TData The type of the data returned by the action.
 */
export type ServerAction<TInput, TData> = TInput extends undefined
  ? ServerAction.WithoutInput<TData>
  : ServerAction.WithInput<TInput, TData>;

export namespace ServerAction {
  /** See {@link ServerAction} for documentation. */
  export type WithoutInput<TData> = () => Promise<ResponsePayload<TData>>;

  /** See {@link ServerAction} for documentation. */
  export type WithInput<TInput, TData> = (
    input: TInput,
  ) => Promise<ResponsePayload<TData>>;

  /**
   * Represents the response payload of a server action.
   * @typeParam TData The type of the data returned by the action.
   */
  export type ResponsePayload<TData> =
    | {
        success: true;
        data: TData;
      }
    | {
        success: false;
        error: ReturnType<ApiError['toObject']>;
      };

  /**
   * Extracts the input type from a server action.
   * @typeParam TServerAction The type of the server action.
   */
  export type ExtractInput<TServerAction> = TServerAction extends ServerAction<
    infer U,
    infer _1
  >
    ? U
    : never;

  /**
   * Extracts the data type from a server action.
   * @typeParam TServerAction The type of the server action.
   */
  export type ExtractData<TServerAction> = TServerAction extends ServerAction<
    infer _1,
    infer U
  >
    ? U
    : never;
}
