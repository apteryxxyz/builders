import { ServerActionError } from '../common/error';
import type { ServerAction } from '../common/types';

/**
 * Execute the server action immediately and return the output data, or throw an error if the action failed.
 * @param action The server action to execute.
 * @param input The input to pass to the server action.
 * @returns The output data of the server action.
 * @example
 * executeServerAction(action, input)
 *   .then(data => {}) // do something with the data
 *   .catch(error => {}) // handle the error
 */
export function executeServerAction<TInput, TData>(
    action: ServerAction<TInput, TData>,
    input: TInput
): Promise<TData>;
export function executeServerAction<TInput extends undefined, TData>(
    action: ServerAction<TInput, TData>
): Promise<TData>;
export async function executeServerAction<TInput, TData>(
    action: ServerAction<TInput, TData>,
    input?: TInput
) {
    if (typeof action !== 'function')
        throw new TypeError(
            "Parameter 'action' of 'executeServerAction' must be a server action built using next-sa"
        );

    return action(input!).then(output => {
        if (output.success) return output.data;
        throw ServerActionError.fromObject(output.error);
    });
}
