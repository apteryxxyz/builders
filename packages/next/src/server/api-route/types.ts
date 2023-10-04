import type { ApiError } from '@/shared/api-error';

/**
 * An API route is a function that can be accessed by the client using the fetch API. This type represents a built API route.
 * @remarks
 * API routes built using the {@link ApiRouteBuilder} are callable from the server by simply passing the payload as an argument.
 * @typeParam TParams The type of the route's URL parameters.
 * @typeParam TSearch The type of the route's URL search parameters.
 * @typeParam TBody The type of the route's request body.
 * @typeParam TData The type of the data returned by the route.
 */
export type ApiRoute<TParams, TSearch, TBody, TData> = Exclude<
  TParams | TSearch | TBody,
  undefined
> extends never
  ? ApiRoute.WithoutPayload<TData>
  : ApiRoute.WithPayload<TParams, TSearch, TBody, TData>;

export namespace ApiRoute {
  /** See {@link ApiRoute} for documentation, represents usage on the server. */
  export type WithoutPayload<TData> = () => Promise<TData>;

  /** See {@link ApiRoute} for documentation, represents usage on the server. */
  export type WithPayload<TParams, TSearch, TBody, TData> = (
    payload: RequestPayload<TParams, TSearch, TBody>,
  ) => Promise<TData>;

  /**
   * Represents the request payload of an API route.
   * @typeParam TParams The type of the route's URL parameters.
   * @typeParam TSearch The type of the route's URL search parameters.
   * @typeParam TBody The type of the route's request body.
   */
  export type RequestPayload<TParams, TSearch, TBody> =
    TParams extends undefined
      ? TSearch extends undefined
        ? TBody extends undefined
          ? { params?: undefined; search?: undefined; body?: undefined }
          : { params?: undefined; search?: undefined; body: TBody }
        : TBody extends undefined
        ? { params?: undefined; search: TSearch; body?: undefined }
        : { params?: undefined; search: TSearch; body: TBody }
      : TSearch extends undefined
      ? TBody extends undefined
        ? { params: TParams; search?: undefined; body?: undefined }
        : { params: TParams; search?: undefined; body: TBody }
      : TBody extends undefined
      ? { params: TParams; search: TSearch; body?: undefined }
      : { params: TParams; search: TSearch; body: TBody };

  /**
   * Represents the response payload of a API route.
   * @typeParam TData The type of the data returned by the route.
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
   * Extracts the URL parameters type from a API route.
   * @typeParam TApiRoute The type of the API route.
   */
  export type ExtractParams<TApiRoute> = TApiRoute extends ApiRoute<
    infer U,
    infer _1,
    infer _2,
    infer _3
  >
    ? U
    : never;

  /**
   * Extracts the URL search parameters type from a API route.
   * @typeParam TApiRoute The type of the API route.
   */
  export type ExtractSearch<TApiRoute> = TApiRoute extends ApiRoute<
    infer _1,
    infer U,
    infer _2,
    infer _3
  >
    ? U
    : never;

  /**
   * Extracts the request body type from a API route.
   * @typeParam TApiRoute The type of the API route.
   */
  export type ExtractBody<TApiRoute> = TApiRoute extends ApiRoute<
    infer _1,
    infer _2,
    infer U,
    infer _3
  >
    ? U
    : never;

  /**
   * Extracts the data type from a API route.
   * @typeParam TApiRoute The type of the API route.
   */
  export type ExtractData<TApiRoute> = TApiRoute extends ApiRoute<
    infer _1,
    infer _2,
    infer _3,
    infer U
  >
    ? U
    : never;

  /**
   * Extracts the request payload type from a API route.
   * @typeParam TApiRoute The type of the API route.
   */
  export type ExtractPayload<TApiRoute> = TApiRoute extends ApiRoute<
    infer U,
    infer V,
    infer W,
    infer _1
  >
    ? RequestPayload<U, V, W>
    : never;
}
