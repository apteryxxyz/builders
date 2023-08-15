export type ServerActionErrorKind =
  // "Action", an error that came from the action itself
  | 'Action'
  // "Timeout", an error that was caused by the action taking too long
  | 'Timeout'
  // "Validation", an error that was caused by the action input failing validation
  | 'Validation';

export class ServerActionError extends Error {
  public kind: ServerActionErrorKind;

  public constructor(kind: ServerActionErrorKind, message: string) {
    super(message);
    this.kind = kind;
  }

  public override get name() {
    return `ServerActionError(${this.kind})`;
  }

  public toObject() {
    return {
      kind: this.kind,
      message: this.message,
    };
  }

  public static fromObject(
    object: ReturnType<typeof ServerActionError.prototype.toObject>
  ) {
    return new ServerActionError(object.kind, object.message);
  }
}
