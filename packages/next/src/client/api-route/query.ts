import { useCallback, useEffect, useState } from 'react';
import type { ApiRoute } from '@/server/api-route/types';
import { ApiError } from '@/shared/api-error';
import { Transform } from '@/shared/transform';
import type { QueryResult } from '../types';

/**
 * A hook to invoke an API route and manage the query state of the request. The route is invoked immediately on mount.
 * @param method The HTTP method to use.
 * @param path The path of the route to invoke.
 * @typeParam TApiRoute The type of the route to invoke, required to infer the payload and data types.
 * @example
 * ```tsx
 * import { useApiRouteQuery } from '@builders/next/client';
 * import type { GET } from '@/app/posts/route';
 *
 * export default function ViewPostsPage() {
 *   const { data, error, isLoading, isError } = useApiRouteQuery<typeof GET>('GET', '/api/posts');
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (isError) return <div>Error! {error.message}</div>;
 *   return <div>{JSON.stringify(data)}</div>;
 * }
 * ```
 */
export function useApiRouteQuery<
  TApiRoute extends ApiRoute.WithoutPayload<any>,
  TData = ApiRoute.ExtractData<TApiRoute>,
>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  path: string,
): QueryResult<TData>;

/**
 * A hook to invoke an API route with a payload and manage the query state of the request. The route is invoked immediately on mount.
 * @param method The HTTP method to use.
 * @param path The path of the route to invoke.
 * @param payload The payload to pass to the route.
 * @typeParam TApiRoute The type of the route to invoke, required to infer the payload and data types.
 * @example
 * ```tsx
 * import { useApiRouteQuery } from '@builders/next/client';
 * import type { GET } from '@/app/posts/[id]/route';
 *
 * export default function ViewPostPage({ params }: { params: { id: string } }) {
 *   const { data, error, isLoading, isError } = useApiRouteQuery<GET>('GET', `/api/posts/${params.id}`);
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (isError) return <div>Error! {error.message}</div>;
 *   return <div>{JSON.stringify(data)}</div>;
 * }
 * ```
 */
export function useApiRouteQuery<
  TApiRoute extends ApiRoute.WithPayload<any, any, any, any>,
  TParams = ApiRoute.ExtractParams<TApiRoute>,
  TSearch = ApiRoute.ExtractSearch<TApiRoute>,
  TBody = ApiRoute.ExtractBody<TApiRoute>,
  TData = ApiRoute.ExtractData<TApiRoute>,
  TPayload extends ApiRoute.RequestPayload<
    TParams,
    TSearch,
    TBody
  > = ApiRoute.RequestPayload<TParams, TSearch, TBody>,
>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  path: string,
  payload: TPayload,
): QueryResult<TData>;

export function useApiRouteQuery<
  TApiRoute extends ApiRoute<any, any, any, any>,
  TParams = ApiRoute.ExtractParams<TApiRoute>,
  TSearch = ApiRoute.ExtractSearch<TApiRoute>,
  TBody = ApiRoute.ExtractBody<TApiRoute>,
  TData = ApiRoute.ExtractData<TApiRoute>,
  TPayload extends ApiRoute.RequestPayload<
    TParams,
    TSearch,
    TBody
  > = ApiRoute.RequestPayload<TParams, TSearch, TBody>,
>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  path: string,
  payload?: TPayload,
) {
  type TResult = QueryResult<TData>;

  const [status, setStatus] = useState<TResult['status']>('loading');
  const [data, setData] = useState<TData | undefined>();
  const [error, setError] = useState<ApiError | undefined>();

  const fetchData = useCallback(
    async (payload: TPayload) => {
      setStatus('loading');
      setData(undefined);
      setError(undefined);

      try {
        const url = new URL(
          Transform.insertParamsIntoPath(path, payload?.params ?? {}),
          window.location.origin,
        );
        if (payload && payload.search)
          url.search = new URLSearchParams(payload.search).toString();

        let headers, body;
        if (payload && payload.body) {
          const type = Transform.determineContentType(payload.body);
          headers = new Headers({ 'Content-Type': type });
          body = Transform.stringifyRequestBody(type, payload.body);
        }

        const response = await fetch(url, { method, headers, body });
        if (!response.ok) throw new Error(response.statusText);

        const json = (await response.json()) as ApiRoute.ResponsePayload<TData>;

        if (json.success) {
          setData(json.data);
          setStatus('success');
          return json.data;
        } else {
          throw ApiError.fromObject(json.error);
        }
      } catch (cause) {
        let error: ApiError;
        if (cause instanceof ApiError) {
          error = cause;
        } else {
          const message =
            cause instanceof Error ? cause.message : String(cause);
          error = new ApiError(0, message);
        }

        setStatus('error');
        setError(error);
        return error;
      }
    },
    [method, path, setStatus, setData, setError],
  );

  useEffect(() => {
    void fetchData(payload!);
  }, []);

  return {
    status,
    isLoading: status === 'loading',
    isSuccess: status === 'success',
    isError: status === 'error',
    data,
    error,
  } as TResult;
}
