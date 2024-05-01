// this is the logger for the browser
import pino from 'pino';
import { log_endpoint } from '@/app/log_endpoint/actions';
import type { LokiOptions } from 'pino-loki';
import build from '@/build';
import { trace } from '@opentelemetry/api';

let logger = pino();

if (process.env.NEXT_RUNTIME === 'nodejs') {
  console.log('Registering server logger');

  const transport = pino.transport<LokiOptions>({
    target: 'pino-loki',
    options: {
      batching: true,
      replaceTimestamp: true,
      labels: {
        container: 'nextjs-frontend',
        version: build.version,
        branch: build.git.branch,
        commit: build.git.hash,
      },
      interval: 5,
      host: 'http://loki:3100',
    },
  });

  logger = pino(
    {
      formatters: {
        log: (log) => {
          const trace_id = log.trace_id || trace.getActiveSpan()?.spanContext().traceId;
          const span_id = log.span_id || trace.getActiveSpan()?.spanContext().spanId;
          const trace_flags =
            log.trace_flags || trace.getActiveSpan()?.spanContext().traceFlags;
          return {
            ...log,
            ...(trace_id && { trace_id }),
            ...(span_id && { span_id }),
            ...(trace_flags && { trace_flags }),
          };
        },
      },
    },
    transport
  );
  logger.info('Server logger initialized');
} else if (process.env.NEXT_RUNTIME === 'edge') {
  console.log('Registering edge logger');
} else {
  console.log('Registering browser logger');

  // a unique identifier for all logs of the current page
  // (this will be renewed on every page load or page navigation)
  const unique_id = crypto.randomUUID().replace(/-/g, '');

  logger = pino({
    browser: {
      transmit: {
        level: 'debug',
        send: async (level: string, logEvent: any) => {
          const msg = logEvent.messages[0];

          const browser = navigator.userAgent;
          const current_path = window.location.pathname;

          await log_endpoint({
            msg,
            level,
            browser,
            current_path,
            frontend_page_id: unique_id,
          });
        },
      },
    },
  });
}

export default logger;
