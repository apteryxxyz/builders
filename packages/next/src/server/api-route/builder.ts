import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ApiError } from '@/shared/api-error';
import { Transform } from '@/shared/transform';
import type { Awaitable } from '@/shared/types';
import { fromZodError } from '../zod-error';
import type { ApiRoute } from './types';

function success<TData>(data: TData) {
  return NextResponse.json({ success: true as const, data });
}

function error(...params: ConstructorParameters<typeof ApiError>) {
  const error = new ApiError(...params).toObject();
  return NextResponse.json(
    { success: false as const, error },
    { status: error.status },
  );
}

export interface ApiRouteBuilderOptions {
  params?: z.AnyZodObject | z.ZodRecord;
  search?: z.AnyZodObject | z.ZodRecord;
  body?: {
    accepts: Transform.SupportedContentType;
    schema: z.ZodTypeAny;
  };
}

/**
 * A builder for easily creating API routes with params, search and body validation, error handling, and complete type safety.
 * @example
 * ```ts
 * import { ApiRouteBuilder } from '@builders/next/server';
 * import { z } from 'zod';
 *
 * export const POST = new ApiRouteBuilder()
 *   .setParams(z.object({ id: z.string() }))
 *   .setBody('application/json', z.object({ title: z.string() }))
 *   .setDefinition(({ params, body }) => ({ id: params.id, title: body.title }));
 * ```
 * @remarks
 * There are four ways you could use your new API route:
 *
 * 1. Manual Fetch: You can make a fetch request to the API route directly in your code, although it's recommended to consider any one of the following options.
 *
 * 2. `executeApiRoute` Function: A function which wraps on the server the API route and manages success status handling.
 *
 * 3. `useApiRouteQuery` Hook: Similar to the `useQuery` hook in `react-query`, but note that it is not identical.
 *
 * 4. `useApiRouteMutation` Hook: Similar to the `useMutation` hook in `react-query`, but note that it is not identical.
 */

export class ApiRouteBuilder<TOptions extends ApiRouteBuilderOptions> {
  private readonly options: Readonly<TOptions>;

  public constructor(options?: TOptions) {
    this.options = Object.freeze(options ?? {}) as TOptions;
  }

  /**
   * Sets the URL parameters schema for the API route.
   * @param params The URL parameters Zod object schema.
   */
  public setParams<TParams extends z.AnyZodObject | z.ZodRecord>(
    params: TParams,
  ) {
    const typeName = String(params?._def?.typeName);
    if (typeName !== 'ZodObject' && typeName !== 'ZodRecord')
      throw new TypeError(
        "Parameter of 'setParams' must be a Zod object or record schema",
      );

    return new ApiRouteBuilder<Omit<TOptions, 'params'> & { params: TParams }>({
      ...this.options,
      params,
    });
  }

  /**
   * Sets the URL search parameters schema for the API route.
   * @param search The URL search parameters Zod object or record schema.
   */
  public setSearch<TSearch extends z.AnyZodObject | z.ZodRecord>(
    search: TSearch,
  ) {
    const typeName = String(search?._def?.typeName);
    if (typeName !== 'ZodObject' && typeName !== 'ZodRecord')
      throw new TypeError(
        "Parameter of 'setSearch' must be a Zod object or record schema",
      );

    return new ApiRouteBuilder<Omit<TOptions, 'search'> & { search: TSearch }>({
      ...this.options,
      search,
    });
  }

  /**
   * Sets the request body schema for the API route as a string.
   * @param accepts The accepted content type of the request body.
   * @param body The request body Zod string schema.
   */
  public setBody<TAccepts extends 'text/plain', TSchema extends z.ZodString>(
    accepts: TAccepts,
    body: TSchema,
  ): ApiRouteBuilder<
    Omit<TOptions, 'body'> & {
      body: {
        accepts: TAccepts;
        schema: TSchema;
      };
    }
  >;

  /**
   * Sets the request body schema for the API route as a JSON Object.
   * @param accepts The accepted content type of the request body.
   * @param body The request body Zod schema.
   */
  public setBody<
    TAccepts extends 'application/json',
    TSchema extends z.ZodTypeAny,
  >(
    accepts: TAccepts,
    body: TSchema,
  ): ApiRouteBuilder<
    Omit<TOptions, 'body'> & {
      body: {
        accepts: TAccepts;
        schema: TSchema;
      };
    }
  >;

  public setBody<
    TAccepts extends Transform.SupportedContentType,
    TSchema extends z.ZodTypeAny,
  >(accepts: TAccepts, schema: TSchema) {
    if (!Transform.supportedContentTypes.includes(accepts))
      throw new TypeError(
        "First parameter of 'setBody' must be an accept type",
      );

    const typeName = String(schema?._def?.typeName);
    if (!typeName)
      throw new TypeError("Second parameter of 'setBody' must be a Zod schema");
    if (accepts === 'text/plain' && typeName !== 'ZodString')
      throw new TypeError(
        "Schema of 'text/plain' body must be a Zod string schema",
      );

    return new ApiRouteBuilder<
      Omit<TOptions, 'body'> & {
        body: {
          accepts: TAccepts;
          schema: TSchema;
        };
      }
    >({
      ...this.options,
      body: { accepts, schema },
    });
  }

  /**
   * Sets the function definition of the API route, this method builds the action and must be called last.
   * @param definition The function definition.
   */
  public setDefinition<
    TParams extends TOptions['params'] extends z.AnyZodObject
      ? z.input<TOptions['params']>
      : undefined,
    TSearch extends TOptions['search'] extends z.AnyZodObject
      ? z.input<TOptions['search']>
      : undefined,
    TBody extends TOptions['body'] extends {
      schema: z.ZodTypeAny;
    }
      ? z.input<TOptions['body']['schema']>
      : undefined,
    TData,
    TPayload extends ApiRoute.RequestPayload<TParams, TSearch, TBody> & {
      request?: NextRequest;
    } = ApiRoute.RequestPayload<TParams, TSearch, TBody> & {
      request?: NextRequest;
    },
  >(definition: (payload: TPayload) => Awaitable<TData>) {
    if (!(definition instanceof Function))
      throw new TypeError("Parameter of 'setDefintion' must be a function");

    const executor = async (payload: TPayload) => {
      /* --- Params Start --- */
      let params;
      if (this.options.params) {
        const rawParams = payload && 'params' in payload ? payload.params : {};
        const parsedParams = this.options.params.safeParse(rawParams);
        if (parsedParams.success) params = parsedParams.data as TParams;
        else throw new ApiError(400, fromZodError(parsedParams.error));
      }
      /* --- Params End --- */

      /* --- Search Start --- */
      let search;
      if (this.options.search) {
        const rawSearch = payload && 'search' in payload ? payload.search : {};
        const parsedSearch = this.options.search.safeParse(rawSearch);
        if (parsedSearch.success) search = parsedSearch.data as TSearch;
        else throw new ApiError(400, fromZodError(parsedSearch.error));
      }
      /* --- Search End --- */

      /* --- Body Start --- */
      let body;
      if (this.options.body) {
        const rawBody = payload && 'body' in payload ? payload.body : undefined;
        const parsedBody = this.options.body.schema.safeParse(rawBody);
        if (parsedBody.success) body = parsedBody.data as TBody;
        else throw new ApiError(400, fromZodError(parsedBody.error));
      }
      /* --- Body End --- */

      /* --- Definition Start --- */
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        return definition({ params, search, body } as any);
      } catch (cause) {
        if (cause instanceof ApiError) throw cause;
        throw new ApiError(
          500,
          process.env['NODE_ENV'] === 'production'
            ? 'Internal server error'
            : String(Reflect.get(cause ?? {}, 'message') ?? cause),
        );
      }
      /* --- Definition End --- */
    };

    const handler = async (
      request: NextRequest | TPayload,
      other: { params: Record<string, string | string[]> },
    ) => {
      if (!(request instanceof Request)) {
        return executor(request);
      }

      /* --- Accepts Start --- */
      if (this.options.body) {
        const incomingType =
          request.headers.get('content-type') ?? 'text/plain';
        if (incomingType !== this.options.body.accepts)
          return error(415, 'Not acceptable content type');
      }
      /* --- Accepts End --- */

      // TODO: Referer and origin checks aka CORS

      /* --- Params, Search, Body Start --- */
      const params = other.params;
      const search = Object.fromEntries(
        request.nextUrl.searchParams as Iterable<readonly [PropertyKey, any]>,
      );
      const type = this.options.body?.accepts ?? 'text/plain';
      const body = this.options.body
        ? await Transform.parseRequestBody(type, request).catch(() => null)
        : undefined;
      /* --- Params, Search, Body End --- */

      /* --- Executor Start --- */
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const result = await executor({
          request,
          params,
          search,
          body,
        } as any);

        if (result instanceof NextResponse) return result;
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
      /* --- Executor End --- */
    };

    return handler as ApiRoute<TParams, TSearch, TBody, TData>;
  }
}
