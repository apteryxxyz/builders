import type { ServerAction } from '@/server/server-action/types';
import { ApiError } from '@/shared/api-error';

/**
 * Executes a server action, returns the data if successful, otherwise throws an error.
 * @param action The action to execute.
 * @returns The data returned by the action if successful.
 * @example
 * ```tsx
 * import { executeServerAction } from '@builders/next/client';
 * import { getPost } from '@/server/posts/actions';
 *
 * export async function ViewPostPage({ params }: { params: { id: string } }) {
 *
 *   const post = await executeServerAction(getPost, params.id);
 *   return <div>{JSON.stringify(post)}</div>;
 * }
 * ```
 */
// @ts-expect-error - TS doesn't like the overloads
export function executeServerAction<TData>(
  action: ServerAction.WithoutInput<TData>,
): Promise<TData>;

/**
 * Executes a server action with an input, returns the data if successful, otherwise throws an error.
 * @param action The action to execute.
 * @param input The input to pass to the action.
 * @returns The data returned by the action if successful.
 * @example
 * ```tsx
 * import { executeServerAction } from '@builders/next/client';
 * import { createPost } from '@/server/posts/actions';
 *
 * export default async function CreatePostPage() {
 *   return <button onClick={() => executeServerAction(createPost, { title: 'Hello World' })}>Create Post</button>;
 * }
 * ```
 */
export function executeServerAction<TInput, TData>(
  action: ServerAction.WithInput<TInput, TData>,
  input: TInput,
): Promise<TData>;

export function executeServerAction<TInput, TData>(
  action: ServerAction<TInput, TData>,
  input: TInput extends undefined ? never : TInput,
) {
  return action(input).then((payload) => {
    if (payload.success) return payload.data;
    throw ApiError.fromObject(payload.error);
  });
}
