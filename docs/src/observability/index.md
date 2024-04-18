# Tracing and Metrics

We use OpenTelemetry to trace the GraphQL API. The traces are sent to a Tempo instance, which is running in a separate
docker container. The traces can be viewed using Grafana at [http://localhost:9000](http://localhost:9000).

Logs are stored in a Prometheus instance, which is running in a separate docker container. The logs can be viewed using
Grafana at [http://localhost:9000](http://localhost:9000).
