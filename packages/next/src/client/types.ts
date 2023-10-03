import type { ApiError } from '@/shared/api-error';

/* QUERY */

export interface QueryBaseResult<TData> {
  /** The current status of the query. */
  status: 'loading' | 'success' | 'error';
  /** Whether the query is currently loading. */
  isLoading: boolean;
  /** Whether the query is finished successfully. */
  isSuccess: boolean;
  /** Whether the query has errored. */
  isError: boolean;
  /** The data returned from the query, if any. */
  data: TData | undefined;
  /** The error produced by the query, if any. */
  error: ApiError | undefined;
}

/** See {@link QueryBaseResult} for documentation. */
export interface QueryLoadingResult<TData> extends QueryBaseResult<TData> {
  status: 'loading';
  isLoading: true;
  isSuccess: false;
  isError: false;
  data: undefined;
  error: undefined;
}

/** See {@link QueryBaseResult} for documentation. */
export interface QuerySuccessResult<TData> extends QueryBaseResult<TData> {
  status: 'success';
  isLoading: false;
  isSuccess: true;
  isError: false;
  data: TData;
  error: undefined;
}

/** See {@link QueryBaseResult} for documentation. */
export interface QueryErrorResult<TData> extends QueryBaseResult<TData> {
  status: 'error';
  isLoading: false;
  isSuccess: false;
  isError: true;
  data: undefined;
  error: ApiError;
}

/** See {@link QueryBaseResult} for documentation. */
export type QueryResult<TData> =
  | QueryLoadingResult<TData>
  | QuerySuccessResult<TData>
  | QueryErrorResult<TData>;

/* MUTATION */

export interface MutationBaseResult<TPayload, TData> {
  /** The function to call to trigger the mutation. */
  mutate: TPayload extends undefined ? () => void : (payload: TPayload) => void;
  /** The function to call to trigger the mutation, and get the result. */
  mutateAsync: TPayload extends undefined
    ? () => Promise<TData>
    : (payload: TPayload) => Promise<TData>;
  /** The current status of the mutation. */
  status: 'idle' | 'loading' | 'success' | 'error';
  /** Whether the mutation is currently idle. */
  isIdle: boolean;
  /** Whether the mutation is currently loading. */
  isLoading: boolean;
  /** Whether the mutation is finished successfully. */
  isSuccess: boolean;
  /** Whether the mutation has errored. */
  isError: boolean;
  /** The data returned from the mutation, if any. */
  data: TData | undefined;
  /** The error produced by the mutation, if any. */
  error: ApiError | undefined;
}

/** See {@link MutationBaseResult} for documentation. */
export interface MutationIdleResult<TPayload, TData>
  extends MutationBaseResult<TPayload, TData> {
  status: 'idle';
  isIdle: true;
  isLoading: false;
  isSuccess: false;
  isError: false;
  data: undefined;
  error: undefined;
}

/** See {@link MutationBaseResult} for documentation. */
export interface MutationPendingResult<TPayload, TData>
  extends MutationBaseResult<TPayload, TData> {
  status: 'loading';
  isIdle: false;
  isLoading: true;
  isSuccess: false;
  isError: false;
  data: undefined;
  error: undefined;
}

/** See {@link MutationBaseResult} for documentation. */
export interface MutationSuccessResult<TPayload, TData>
  extends MutationBaseResult<TPayload, TData> {
  status: 'success';
  isIdle: false;
  isLoading: false;
  isSuccess: true;
  isError: false;
  data: TData;
  error: undefined;
}

/** See {@link MutationBaseResult} for documentation. */
export interface MutationErrorResult<TPayload, TData>
  extends MutationBaseResult<TPayload, TData> {
  status: 'error';
  isIdle: false;
  isLoading: false;
  isSuccess: false;
  isError: true;
  data: undefined;
  error: ApiError;
}

/** See {@link MutationBaseResult} for documentation. */
export type MutationResult<TPayload, TData> =
  | MutationIdleResult<TPayload, TData>
  | MutationPendingResult<TPayload, TData>
  | MutationSuccessResult<TPayload, TData>
  | MutationErrorResult<TPayload, TData>;
