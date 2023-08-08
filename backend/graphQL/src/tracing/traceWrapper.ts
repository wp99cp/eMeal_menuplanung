import { trace } from '@opentelemetry/api';

/**
 *
 * A generic, typed wrapper for tracing functions using OpenTelemetry.
 *
 * @param fn - The function to be traced.
 * @param fnName - The name of the function to be traced.
 *
 * @returns The wrapped function result.
 *
 */
export const traceWrapper =
  <T extends unknown[], U>(fn: (..._: T) => U, fnName?: string): ((...__: T) => U) =>
  (...args: T): U => {
    const tracer = trace.getTracer('graphQL-backend');
    const span = tracer.startSpan(fnName || fn.name);
    const result = fn(...args);
    span.end();
    return result;
  };
/**
 *
 * A generic, typed wrapper for tracing async functions using OpenTelemetry.
 *
 * @param fn - The function to be traced (must be async).
 * @param fnName - The name of the function to be traced.
 *
 * @returns The wrapped function result.
 *
 */
export const asyncTraceWrapper =
  <T extends unknown[], U>(
    fn: (..._: T) => Promise<U>,
    fnName?: string
  ): ((...__: T) => Promise<U>) =>
  async (...args: T): Promise<U> => {
    const tracer = trace.getTracer('graphQL-backend');
    const span = tracer.startSpan(fnName || fn.name);
    const result = await fn(...args);
    span.end();
    return result;
  };
