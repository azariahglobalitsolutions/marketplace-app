import time

from flask import request
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST

REQUEST_COUNT = Counter(
    "http_requests_total",
    "Total HTTP requests",
    ["method", "route", "status_code"],
)

REQUEST_LATENCY = Histogram(
    "http_request_duration_seconds",
    "HTTP request latency",
    ["method", "route", "status_code"],
    buckets=(0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5),
)


def metrics_middleware(app):
    @app.before_request
    def start_timer():
        request._start_time = time.time()

    @app.after_request
    def record_metrics(response):
        if request.path == "/metrics":
            return response

        route = request.url_rule.rule if request.url_rule else request.path
        labels = {
            "method": request.method,
            "route": route,
            "status_code": str(response.status_code),
        }
        elapsed = time.time() - getattr(request, "_start_time", time.time())
        REQUEST_LATENCY.labels(**labels).observe(elapsed)
        REQUEST_COUNT.labels(**labels).inc()
        return response

    @app.route("/metrics")
    def metrics():
        return generate_latest(), 200, {"Content-Type": CONTENT_TYPE_LATEST}
