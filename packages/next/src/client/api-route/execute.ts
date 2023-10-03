import type { ApiRoute } from '@/server/api-route/types';
import { ApiError } from '@/shared/api-error';
import { Transform } from '@/shared/transform';

/**
 * Immediately a fetch request to an API route, returns the data if successful, otherwise throws an error.
 * @param method The HTTP method to use.
 * @param path The path of the route to invoke.
 * @typeParam TApiRoute The type of the route to invoke, required to infer the payload and data types.
 * @example
 * ```tsx
 * import { executeApiRoute } from '@builders/next/client';
 * import type { GET } from '@/app/posts/[id]/route';
 *
 * export default async function ViewPostPage({ params }: { params: { id: string } }) {
 *   const post = await executeApiRoute<typeof GET>('GET', `/api/posts/${params.id}`);
 *
 *   return <div>{JSON.stringify(post)}</div>;
 * }
 * ```
 */
export function executeApiRoute<
  TApiRoute extends ApiRoute.WithoutPayload<any>,
  TData = ApiRoute.ExtractData<TApiRoute>,
>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  path: string,
): Promise<TData>;

/**
 * Immediately a fetch request to an API route with a payload, returns the data if successful, otherwise throws an error.
 * @param method The HTTP method to use.
 * @param path The path of the route to invoke.
 * @param payload The payload to pass to the route.
 * @typeParam TApiRoute The type of the route to invoke, required to infer the payload and data types.
 * @example
 * ```tsx
 * import { executeApiRoute } from '@builders/next/client';
 * import type { PUT } from '@/app/posts/route';
 * export default function CreatePostPage() {
 *   return <button onClick={() => executeApiRoute<PUT>('PUT', '/api/posts', { body: { title: 'Hello World' } })}>Create Post</button>;
 * }
 * ```
 */
export function executeApiRoute<
  TApiRoute extends ApiRoute.WithPayload<any, any, any, any>,
  TParams = ApiRoute.ExtractParams<TApiRoute>,
  TSearch = ApiRoute.ExtractSearch<TApiRoute>,
  TBody = ApiRoute.ExtractBody<TApiRoute>,
  TPayload extends ApiRoute.RequestPayload<
    TParams,
    TSearch,
    TBody
  > = ApiRoute.RequestPayload<TParams, TSearch, TBody>,
  TData = ApiRoute.ExtractData<TApiRoute>,
>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  path: string,
  payload: TPayload,
): Promise<TData>;

export async function executeApiRoute<
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
>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  path: string,
  payload?: TPayload,
) {
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
      return json.data;
    } else {
      throw ApiError.fromObject(json.error);
    }
  } catch (cause) {
    let error: ApiError;
    if (cause instanceof ApiError) {
      error = cause;
    } else {
      const message = cause instanceof Error ? cause.message : String(cause);
      error = new ApiError(0, message);
    }

    throw error;
  }
}
