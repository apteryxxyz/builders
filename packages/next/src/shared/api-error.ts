/**
 * Custom error class that represents an error that is thrown by either an API route or a server action.
 */
export class ApiError extends Error {
  /**
   * @param status The HTTP status code to hint what kind of error this is.
   * @param message A human-readable message that describes the error.
   */
  public constructor(
    /** The HTTP status code to hint what kind of error this is. */
    public readonly status: number,
    /** A human-readable message that describes the error. */
    public override readonly message: string,
  ) {
    super(message);
  }

  /**
   * Converts this error to a plain object that can be serialised to JSON.
   */
  public toObject() {
    return {
      status: this.status,
      message: this.message,
    };
  }

  /**
   * Creates an instance of this error from a plain object.
   * @param object The plain object to create an instance from.
   */
  public static fromObject(object: ReturnType<ApiError['toObject']>) {
    return new ApiError(object.status, object.message);
  }
}
