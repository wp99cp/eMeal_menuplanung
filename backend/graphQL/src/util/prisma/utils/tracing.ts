import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { BasicTracerProvider, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks';
import * as api from '@opentelemetry/api';
import { PrismaInstrumentation } from '@prisma/instrumentation';
import { Resource } from '@opentelemetry/resources';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

// Export the tracing
export function otlpSetup() {
  const contextManager = new AsyncHooksContextManager().enable();

  api.context.setGlobalContextManager(contextManager);

  // Configure the trace provider
  const provider = new BasicTracerProvider({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: 'eMeal-graphQL-backend',
      [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0', // TODO: get correct version
    }),
  });

  const collectorOptions = {
    url: 'http://tempo:4318/v1/traces',
    concurrencyLimit: 10, // an optional limit on pending requests
  };

  const otlpExporter = new OTLPTraceExporter(collectorOptions);

  // Configure how spans are processed and exported. In this case we're sending spans
  // as we receive them to the console
  provider.addSpanProcessor(new SimpleSpanProcessor(otlpExporter));

  // Register your auto-instrumentors
  registerInstrumentations({
    tracerProvider: provider,
    instrumentations: [new PrismaInstrumentation()],
  });

  // Register the provider
  provider.register();
}
