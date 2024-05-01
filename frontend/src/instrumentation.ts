import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { FetchInstrumentation, registerOTel } from '@vercel/otel';

export function register() {
  console.log('Registering OTel for environment:', process.env.NEXT_RUNTIME);
  console.log('Registering OTel');

  // this is necessary as https://github.com/vercel/next.js/discussions/34179
  if (process.env.NEXT_RUNTIME === 'edge') {
    console.log('Registering OTel for edge deployment');
    registerOTel({});
  } else if (process.env.NEXT_RUNTIME === 'nodejs') {
    registerOTel({
      serviceName: 'nextjs-frontend',
      attributes: { container: 'nextjs-frontend' },
      instrumentations: [new FetchInstrumentation()],
      spanProcessors: [
        new BatchSpanProcessor(
          new OTLPTraceExporter({
            url: 'http://tempo:4318/v1/traces',
            concurrencyLimit: 10, // an optional limit on pending requests
          }),
          {
            maxQueueSize: 1000,
            scheduledDelayMillis: 1000,
          }
        ),
      ],
    });
  }
}
