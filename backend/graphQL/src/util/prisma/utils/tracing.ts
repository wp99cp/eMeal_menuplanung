import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks';
import * as api from '@opentelemetry/api';
import { PrismaInstrumentation } from '@prisma/instrumentation';
import { Resource } from '@opentelemetry/resources';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { GraphQLInstrumentation } from '@opentelemetry/instrumentation-graphql';
import packageVersion from '../../../../package.json';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';

// Export the tracing
const contextManager = new AsyncHooksContextManager().enable();
api.context.setGlobalContextManager(contextManager);

// Initialize provider and identify this particular service
// (in this case, we're implementing a federated gateway)
const provider = new NodeTracerProvider({
  resource: Resource.default().merge(
    new Resource({
      // Replace with any string to identify this service in your system
      'service.name': 'graphQL-backend',
      'service.version': packageVersion.version,
    })
  ),
});

// Register the provider
provider.register();

registerInstrumentations({
  tracerProvider: provider,
  instrumentations: [
    new ExpressInstrumentation(),
    new HttpInstrumentation({
      ignoreIncomingRequestHook(req) {
        // ignore the metrics endpoint
        return !!req.url?.match(/metrics/);
      },
      requestHook: (span, request) => {
        span.setAttribute('custom request hook attribute', 'request');
      },
    }),
    new GraphQLInstrumentation(),
    new PrismaInstrumentation(),
  ],
});

// Configure how spans are processed and exported. In this case we're sending spans
// as we receive them to the console
provider.addSpanProcessor(
  new BatchSpanProcessor(
    new OTLPTraceExporter({
      url: 'http://tempo:4318/v1/traces',
      concurrencyLimit: 10, // an optional limit on pending requests
    }),
    {
      maxQueueSize: 1000,
      scheduledDelayMillis: 1000,
    }
  )
);
