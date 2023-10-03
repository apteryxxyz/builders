import type { NextRequest } from 'next/server';

export namespace Transform {
  /**
   * List of the supported content types.
   */
  export const supportedContentTypes = [
    'application/json',
    'text/plain',
  ] as const;

  /**
   * A type union of the supported content types.
   */
  export type SupportedContentType = (typeof supportedContentTypes)[number];

  /**
   * Extracts the request body from a request object.
   * @param type The expected content type.
   * @param request The request object.
   */
  export function parseRequestBody(
    type: SupportedContentType,
    request: NextRequest,
  ) {
    switch (type) {
      case 'application/json':
        return request.json() as Promise<unknown>;
      case 'text/plain':
        return request.text();
    }
  }

  /**
   * Converts a body value to a string value that can be sent as a response with the given content type.
   * @param type The content type.
   * @param data The body value.
   */
  export function stringifyRequestBody(
    type: SupportedContentType,
    data: unknown,
  ) {
    switch (type) {
      case 'application/json':
        return JSON.stringify(data);
      case 'text/plain':
        return String(data);
    }
  }

  /**
   * Determines the content type of a request body.
   * @param body The request body.
   */
  export function determineContentType(body: unknown): SupportedContentType {
    if (typeof body === 'string') return 'text/plain';
    return 'application/json';
  }

  /**
   * Inserts parameters into a path.
   * @param path The path to insert the parameters into.
   * @param params The parameters to insert.
   */
  export function insertParamsIntoPath(
    path: string,
    params: Record<string, unknown>,
  ) {
    return path.replace(/\[(\w+)\]/g, (_, name) => {
      const value = params[name];
      if (value === undefined) throw new Error(`Missing parameter "${name}"`);
      return String(value);
    });
  }
}
