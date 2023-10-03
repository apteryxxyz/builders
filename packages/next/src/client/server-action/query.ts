import { useCallback, useEffect, useState } from 'react';
import type { ServerAction } from '@/server/server-action/types';
import { ApiError } from '@/shared/api-error';
import type { QueryResult } from '../types';

/**
 * A hook to invoke a server action and manage the query state of the request. The action is invoked immediately on mount.
 * @param action The action to execute.
 * @example
 * ```tsx
 * import { useServerActionQuery } from '@builders/next/client';
 * import { getPosts } from '@/server/posts/actions';
 *
 * export default function ViewPostsPage() {
 *   const { data, error, isLoading, isError } = useServerActionQuery(getPosts);
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (isError) return <div>Error! {error.message}</div>;
 *   return <div>{JSON.stringify(data)}</div>;
 * }
 * ```
 */
export function useServerActionQuery<TData>(
  action: ServerAction.WithoutInput<TData>,
): QueryResult<TData>;

/**
 * A hook to invoke a server action with an input and manage the query state of the request. The action is invoked immediately on mount.
 * @param action The action to execute.
 * @param input The input to pass to the action.
 * @example
 * ```tsx
 * import { useServerActionQuery } from '@builders/next/client';
 * import { getPost } from '@/server/posts/actions';
 *
 * export default function ViewPostPage({ params }: { params: { id: string } }) {
 *   const { data, isLoading, isError } = useServerActionQuery(getPost, params.id);
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (isError) return <div>Error!</div>;
 *   return <div>{JSON.stringify(data)}</div>;
 * }
 * ```
 */
export function useServerActionQuery<TInput, TData>(
  action: ServerAction.WithInput<TInput, TData>,
  input: TInput,
): QueryResult<TData>;

export function useServerActionQuery<TInput, TData>(
  action: ServerAction<TInput, TData>,
  input?: TInput,
) {
  type TResult = QueryResult<TData>;

  const [status, setStatus] = useState<TResult['status']>('loading');
  const [data, setData] = useState<TData | undefined>();
  const [error, setError] = useState<ApiError | undefined>();

  const fetchData = useCallback(
    async (input: TInput) => {
      setStatus('loading');
      setData(undefined);
      setError(undefined);

      try {
        const response = await action(input);

        if (response.success) {
          setStatus('success');
          setData(response.data);
          return response.data;
        } else {
          throw ApiError.fromObject(response.error);
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
    [action, setStatus, setData, setError],
  );

  useEffect(() => {
    void fetchData(input!);
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
