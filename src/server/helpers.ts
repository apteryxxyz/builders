import type z from 'zod';
import { fromZodError as makeValidationError } from 'zod-validation-error';

export async function createTimeoutPromise(timeout: number, error: Error) {
  return new Promise<never>((_resolve, reject) => {
    setTimeout(() => {
      reject(error);
    }, timeout);
  });
}

export function fromZodError(error: z.ZodError) {
  return makeValidationError(error).message.replace('Validation error: ', '');
}
