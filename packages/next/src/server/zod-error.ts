import type { z } from 'zod';
import { fromZodError as transformZodError } from 'zod-validation-error';

export function fromZodError(error: z.ZodError) {
  return transformZodError(error).message.replace('Validation error: ', '');
}
