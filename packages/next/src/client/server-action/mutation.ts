import { useCallback, useState } from 'react';
import type { ServerAction } from '@/server/server-action/types';
import { ApiError } from '@/shared/api-error';
import type { MutationResult } from '../types';

/**
 * A hook to manage the mutation state of the server action request. This hook returns a object containing a `mutate` function that can be called to invoke the action.
 * @param action The action to execute.
 * @example
 * ```tsx
 * import { useServerActionMutation } from '@builders/next/client';
 * import { updatePost } from '@/server/posts/actions';
 *
 * export default function EditPostPage({ params }: { params: { id: string } }) {
 *   const { mutate, data, error, isIdle, isLoading, isError } = useServerActionMutation(updatePost);
 *
 *   if (isIdle) return <button onClick={() => mutate({ id: params.id, title: 'Hello, world!' })}>Edit Post</button>;
 *   if (isLoading) return <div>Loading...</div>;
 *   if (isError) return <div>Error! {error.message}</div>;
 *   return <div>{JSON.stringify(data)}</div>;
 * }
 * ```
 */
export function useServerActionMutation<TInput, TData>(
  action: ServerAction<TInput, TData>,
) {
  type TResult = MutationResult<TInput, TData>;

  const [status, setStatus] = useState<TResult['status']>('idle');
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

  const mutate = useCallback(
    (input: TInput) => void fetchData(input),
    [fetchData],
  );

  const mutateAsync = useCallback(
    async (input: TInput) => {
      const result = await fetchData(input);
      if (result instanceof ApiError) throw result;
      return result;
    },
    [fetchData],
  );

  return {
    mutate,
    mutateAsync,
    status,
    isIdle: status === 'idle',
    isLoading: status === 'loading',
    isSuccess: status === 'success',
    isError: status === 'error',
    data,
    error,
  } as TResult;
}
