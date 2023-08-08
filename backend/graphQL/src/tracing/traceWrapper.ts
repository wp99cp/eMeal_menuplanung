import { trace } from '@opentelemetry/api';

const tracer = trace.getTracer('graphQL-backend');

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
  (...args: T): U =>
    tracer.startActiveSpan(fnName || fn.name || 'traceWrapper', (span) => {
      const result = fn(...args);

      // if U is of type Promise, end the span when the promise resolves
      if (result instanceof Promise) result.then(() => span.end());
      else span.end(); // else end the span immediately

      return result;
    });
