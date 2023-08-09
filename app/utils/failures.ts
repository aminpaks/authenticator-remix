export interface Failure<T = any> {
  details: T;
  cause?: unknown;
}

export function withReason<T>(details: T): (reason: unknown) => Failure<T> {
  return (reason) => failureFrom(details, typeof reason === 'object' ? String(reason) : reason);
}

export function failureFrom<T>(details: T, cause?: unknown): Failure<T> {
  return {details, cause};
}
