import { Exception, trace } from '@opentelemetry/api';

const tracer = trace.getTracer('graphQL-backend');

/**
 *
 * A generic and typed wrapper for tracing functions using OpenTelemetry.
 *
 *
 * @param fn - The function to be traced (can be synchronous or asynchronous).
 * @param fnName - The name of the function to be traced.
 *
 * @returns The wrapped function result.
 *
 */
export const traceWrapper =
  <T extends unknown[], U>(fn: (..._: T) => U, fnName?: string): ((...__: T) => U) =>
  (...args: T): U =>
    tracer.startActiveSpan(fnName || fn.name || 'traceWrapper', (span) => {
      let result;

      try {
        result = fn(...args);

        // if the result is a promise, we need to catch any
        // exceptions and record them before ending the span
        if (result instanceof Promise)
          result
            .catch((e) => {
              span.recordException(e);
              span.setAttribute('error', true);
            })
            .finally(() => span.end());
      } catch (e) {
        span.recordException(e as Exception);
        span.setAttribute('error', true);
        throw e;
      } finally {
        if (!(result instanceof Promise)) span.end();
      }

      return result;
    });

/**
 *
 * A decorator to wrap a method with the traceWrapper function.
 *
 * Example:
 *
 * ```typescript
 * class MyClass {
 *   @traceWrapperDecorator()
 *   myMethod() {
 *     // do something
 *   }
 * }
 * ```
 *
 *
 */
export const traceWrapperDecorator =
  () =>
  (_: never, propertyKey: string, descriptor: PropertyDescriptor): void => {
    descriptor.value = traceWrapper(descriptor.value, propertyKey);
  };
