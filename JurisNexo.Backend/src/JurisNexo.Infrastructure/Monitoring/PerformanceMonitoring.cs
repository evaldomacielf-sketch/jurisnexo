using System.Diagnostics;
using Amazon.CloudWatch;
using Amazon.CloudWatch.Model;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace JurisNexo.Infrastructure.Monitoring;

public class PerformanceMonitoringMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<PerformanceMonitoringMiddleware> _logger;
    private readonly IMetricsPublisher _metricsPublisher;

    public PerformanceMonitoringMiddleware(
        RequestDelegate next,
        ILogger<PerformanceMonitoringMiddleware> logger,
        IMetricsPublisher metricsPublisher)
    {
        _next = next;
        _logger = logger;
        _metricsPublisher = metricsPublisher;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var sw = Stopwatch.StartNew();
        var requestId = Guid.NewGuid().ToString();

        context.Items["RequestId"] = requestId;

        try
        {
            await _next(context);
        }
        finally
        {
            sw.Stop();

            var metrics = new RequestMetrics
            {
                RequestId = requestId,
                Method = context.Request.Method,
                Path = context.Request.Path,
                StatusCode = context.Response.StatusCode,
                Duration = sw.ElapsedMilliseconds,
                Timestamp = DateTime.UtcNow
            };

            // Fire and forget metrics publishing to avoid blocking request
            _ = _metricsPublisher.PublishAsync(metrics).ConfigureAwait(false);

            _logger.LogInformation(
                "Request completed: {Method} {Path} {StatusCode} in {Duration}ms (RequestId: {RequestId})",
                metrics.Method,
                metrics.Path,
                metrics.StatusCode,
                metrics.Duration,
                requestId);
        }
    }
}

public interface IMetricsPublisher
{
    Task PublishAsync(RequestMetrics metrics);
}

public class CloudWatchMetricsPublisher : IMetricsPublisher
{
    private readonly IAmazonCloudWatch _cloudWatch;
    private readonly string _namespace;
    private readonly ILogger<CloudWatchMetricsPublisher> _logger;

    public CloudWatchMetricsPublisher(
        IAmazonCloudWatch cloudWatch, 
        IConfiguration configuration,
        ILogger<CloudWatchMetricsPublisher> logger)
    {
        _cloudWatch = cloudWatch;
        _namespace = configuration["Monitoring:MetricsNamespace"] ?? "JurisNexo/Production";
        _logger = logger;
    }

    public async Task PublishAsync(RequestMetrics metrics)
    {
        try 
        {
            var request = new PutMetricDataRequest
            {
                Namespace = _namespace,
                MetricData = new List<MetricDatum>
                {
                    new MetricDatum
                    {
                        MetricName = "ResponseTime",
                        Value = metrics.Duration,
                        Unit = StandardUnit.Milliseconds,
                        TimestampUtc = metrics.Timestamp,
                        Dimensions = new List<Dimension>
                        {
                            new Dimension { Name = "Method", Value = metrics.Method },
                            new Dimension { Name = "Path", Value = metrics.Path }, // Be careful with cardinality here!
                            new Dimension { Name = "StatusCode", Value = metrics.StatusCode.ToString() }
                        }
                    },
                    new MetricDatum
                    {
                        MetricName = "RequestCount",
                        Value = 1,
                        Unit = StandardUnit.Count,
                        TimestampUtc = metrics.Timestamp,
                        Dimensions = new List<Dimension>
                        {
                            new Dimension { Name = "StatusCode", Value = metrics.StatusCode.ToString() }
                        }
                    }
                }
            };

            await _cloudWatch.PutMetricDataAsync(request);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to publish metrics to CloudWatch");
        }
    }
}

public record RequestMetrics
{
    public string RequestId { get; init; } = string.Empty;
    public string Method { get; init; } = string.Empty;
    public string Path { get; init; } = string.Empty;
    public int StatusCode { get; init; }
    public long Duration { get; init; }
    public DateTime Timestamp { get; init; }
}
