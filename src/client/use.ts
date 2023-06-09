'use client';

import { useCallback, useRef, useState } from 'react';
import { ServerActionError } from '../common/error';
import type {
    ServerAction,
    ServerActionDataType,
    ServerActionInputType,
} from '../common/types';

/**
 * Prepare a server action to be executed later. Returns a function that can be called to execute the action, along with the current pending state, data state and error state.
 * @param action The server action to execute.
 * @returns An object containing the execute function, the pending state, the data state and the error state.
 * @example
 * const { execute, isPending, data, error } = useServerAction(action);
 * // ...
 * useEffect(() => {
 *   execute(input);
 * }, []);
 * // ...
 * if (isPending) return <p>Loading...</p>;
 * if (error) return <p>Error: {error}</p>;
 * if (data) return <p>Data: {data}</p>;
 * return <p>Not yet executed</p>;
 */
export function useServerAction<
    TAction extends ServerAction<any, any>,
    TInput extends ServerActionInputType<TAction>,
    TData extends ServerActionDataType<TAction>
>(action: TAction) {
    const doAction = useRef(action);

    const [isPending, setIsPending] = useState(false);
    const [data, setData] = useState<TData | null>(null);
    const [error, setError] = useState<ServerActionError | null>(null);

    const execute = useCallback(async (input: TInput) => {
        setIsPending(true);
        if (error !== null) setError(null);
        if (data !== null) setData(null);

        const output = await doAction.current(input);
        if (output.success) setData(output.data);
        else setError(ServerActionError.fromObject(output.error));
        setIsPending(false);
    }, []);

    return {
        /**
         * Execute the server action.
         * @param input The input to pass to the server action.
         */
        execute,
        /**
         * Whether the server action is currently pending.
         */
        isPending,
        /**
         * The data returned by the server action, if any.
         */
        data,
        /**
         * The error returned by the server action, if any.
         */
        error,
    };
}
