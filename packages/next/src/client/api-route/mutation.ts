import { useCallback, useState } from 'react';
import type { ApiRoute } from '@/server/api-route/types';
import { ApiError } from '@/shared/api-error';
import { Transform } from '@/shared/transform';
import type { MutationResult } from '../types';

/**
 * A hook to manage the mutation state of the API route request. This hook returns a object containing a `mutate` function that can be called to invoke the route.
 * @param method The HTTP method to use.
 * @param path The path of the route to invoke.
 * @typeParam TApiRoute The type of the route to invoke, required to infer the payload and data types.
 * @example
 * ```tsx
 * import { useApiRouteMutation } from '@builders/next/client';
 * import type { PATCH } from '@/app/posts/[id]/route';
 *
 * export default function EditPostPage({ params }: { params: { id: string } }) {
 *   const { mutate, data, error, isIdle, isLoading, isError } =
 *     useApiRouteMutation<typeof PATCH>('PATCH', `/api/posts/[id]`, { params });
 *
 *   if (isIdle) return <button onClick={() => mutate({ body: { title: 'Hello, world!' } })}>Edit Post</button>;
 *   if (isLoading) return <div>Loading...</div>;
 *   if (isError) return <div>Error! {error.message}</div>;
 *   return <div>{JSON.stringify(data)}</div>;
 * }
 * ```
 */
export function useApiRouteMutation<
  TApiRoute extends ApiRoute<any, any, any, any>,
  TParams = ApiRoute.ExtractParams<TApiRoute>,
  TSearch = ApiRoute.ExtractSearch<TApiRoute>,
  TBody = ApiRoute.ExtractBody<TApiRoute>,
  TPayload extends ApiRoute.RequestPayload<
    TParams,
    TSearch,
    TBody
  > = ApiRoute.RequestPayload<TParams, TSearch, TBody>,
  TData = ApiRoute.ExtractData<TApiRoute>,
>(method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE', path: string) {
  type TResult = MutationResult<TPayload, TData>;

  const [status, setStatus] = useState<TResult['status']>('idle');
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
    [method],
  );

  const mutate = useCallback(
    (payload: TPayload) => void fetchData(payload),
    [fetchData],
  );

  const mutateAsync = useCallback(
    async (payload: TPayload) => {
      const result = await fetchData(payload);
      if (result instanceof ApiError) throw result;
      return result;
    },
    [fetchData],
  );

  return {
    mutate,
    mutateAsync,
    status,
    data,
    error,
    isIdle: status === 'idle',
    isLoading: status === 'loading',
    isSuccess: status === 'success',
    isError: status === 'error',
  } as TResult;
}
