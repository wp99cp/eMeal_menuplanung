import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks';
import { PrismaInstrumentation } from '@prisma/instrumentation';
import { Resource } from '@opentelemetry/resources';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { GraphQLInstrumentation } from '@opentelemetry/instrumentation-graphql';
import packageVersion from '../../package.json';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { context } from '@opentelemetry/api';
import { WinstonInstrumentation } from '@opentelemetry/instrumentation-winston';

// Export the tracing
const contextManager = new AsyncHooksContextManager().enable();
context.setGlobalContextManager(contextManager);

// Initialize provider and identify this particular service
// (in this case, we're implementing a federated gateway)
const provider = new NodeTracerProvider({
  resource: Resource.default().merge(
    new Resource({
      // Replace with any string to identify this service in your system
      'service.name': 'graphQL-backend',
      container: 'graphQL-backend',
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
      // ignore the metrics endpoint
      ignoreIncomingRequestHook: (req) => !!req.url?.match(/metrics/),
    }),
    new GraphQLInstrumentation(),
    new PrismaInstrumentation(),
    new FetchInstrumentation(),
    new WinstonInstrumentation(),
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
