resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "${var.project_name}-${var.environment}-overview"

  dashboard_body = jsonencode({
    widgets = [
      # ==========================================
      # ECS METRICS
      # ==========================================
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/ECS", "CPUUtilization", "ClusterName", "${var.project_name}-${var.environment}-cluster", "ServiceName", "${var.project_name}-${var.environment}-backend", { stat = "Average", label = "CPU Average" }],
            [".", ".", ".", ".", ".", ".", { stat = "Maximum", label = "CPU Max" }],
            [".", "MemoryUtilization", ".", ".", ".", ".", { stat = "Average", label = "Memory Average" }],
            [".", ".", ".", ".", ".", ".", { stat = "Maximum", label = "Memory Max" }]
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          title  = "ECS - CPU & Memory"
          yAxis = {
            left = {
              min = 0
              max = 100
            }
          }
        }
      },
      
      # ==========================================
      # ALB METRICS
      # ==========================================
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/ApplicationELB", "TargetResponseTime", "LoadBalancer", aws_lb.main.arn_suffix, { stat = "Average", label = "Response Time (avg)" }],
            [".", ".", ".", ".", { stat = "p99", label = "Response Time (p99)" }],
            [".", "RequestCount", ".", ".", { stat = "Sum", label = "Request Count" }]
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          title  = "ALB - Performance"
        }
      },
      
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/ApplicationELB", "HTTPCode_Target_2XX_Count", "LoadBalancer", aws_lb.main.arn_suffix, { stat = "Sum", label = "2XX" }],
            [".", "HTTPCode_Target_4XX_Count", ".", ".", { stat = "Sum", label = "4XX" }],
            [".", "HTTPCode_Target_5XX_Count", ".", ".", { stat = "Sum", label = "5XX" }]
          ]
          period = 300
          stat   = "Sum"
          region = var.aws_region
          title  = "ALB - HTTP Status Codes"
        }
      },
      
      # ==========================================
      # RDS METRICS
      # ==========================================
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/RDS", "CPUUtilization", "DBInstanceIdentifier", aws_db_instance.main.id, { stat = "Average" }],
            [".", "DatabaseConnections", ".", ".", { stat = "Average" }],
            [".", "FreeableMemory", ".", ".", { stat = "Average" }],
            [".", "FreeStorageSpace", ".", ".", { stat = "Average" }]
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          title  = "RDS - Database Health"
        }
      },
      
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/RDS", "ReadLatency", "DBInstanceIdentifier", aws_db_instance.main.id, { stat = "Average", label = "Read Latency" }],
            [".", "WriteLatency", ".", ".", { stat = "Average", label = "Write Latency" }],
            [".", "ReadThroughput", ".", ".", { stat = "Average", label = "Read Throughput" }],
            [".", "WriteThroughput", ".", ".", { stat = "Average", label = "Write Throughput" }]
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          title  = "RDS - I/O Performance"
        }
      },
      
      # ==========================================
      # ELASTICACHE METRICS
      # ==========================================
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/ElastiCache", "CPUUtilization", "CacheClusterId", "${var.project_name}-${var.environment}-redis-001", { stat = "Average" }], # Assuming default node ID pattern
            [".", "DatabaseMemoryUsagePercentage", ".", ".", { stat = "Average" }],
            [".", "CurrConnections", ".", ".", { stat = "Average" }],
            [".", "Evictions", ".", ".", { stat = "Sum" }]
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          title  = "ElastiCache - Redis Health"
        }
      },
      
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/ElastiCache", "CacheHits", "CacheClusterId", "${var.project_name}-${var.environment}-redis-001", { stat = "Sum", label = "Cache Hits" }],
            [".", "CacheMisses", ".", ".", { stat = "Sum", label = "Cache Misses" }]
          ]
          period = 300
          stat   = "Sum"
          region = var.aws_region
          title  = "ElastiCache - Hit Rate"
        }
      },
      
      # ==========================================
      # CLOUDFRONT METRICS
      # ==========================================
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/CloudFront", "Requests", "DistributionId", aws_cloudfront_distribution.main.id, "Region", "Global", { stat = "Sum" }],
            [".", "BytesDownloaded", ".", ".", ".", ".", { stat = "Sum" }],
            [".", "BytesUploaded", ".", ".", ".", ".", { stat = "Sum" }]
          ]
          period = 300
          stat   = "Sum"
          region = "us-east-1" # CloudFront metrics are always in us-east-1
          title  = "CloudFront - Traffic"
        }
      },
      
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/CloudFront", "4xxErrorRate", "DistributionId", aws_cloudfront_distribution.main.id, "Region", "Global", { stat = "Average", label = "4XX Rate" }],
            [".", "5xxErrorRate", ".", ".", ".", ".", { stat = "Average", label = "5XX Rate" }]
          ]
          period = 300
          stat   = "Average"
          region = "us-east-1"
          title  = "CloudFront - Error Rates"
        }
      },
      
      # ==========================================
      # LOGS INSIGHTS
      # ==========================================
      {
        type = "log"
        properties = {
          query   = "SOURCE '/ecs/${var.project_name}-${var.environment}' | fields @timestamp, @message | filter @message like /ERROR/ | sort @timestamp desc | limit 20"
          region  = var.aws_region
          title   = "Recent Errors"
        }
      }
    ]
  })
}

# CloudWatch Log Groups
resource "aws_cloudwatch_log_group" "application" {
  name              = "/application/${var.project_name}-${var.environment}"
  retention_in_days = var.environment == "production" ? 30 : 7
  kms_key_id        = var.kms_key_id != "" ? var.kms_key_id : null

  tags = {
    Name = "${var.project_name}-${var.environment}-app-logs"
  }
}

# CloudWatch Log Metric Filters
resource "aws_cloudwatch_log_metric_filter" "error_count" {
  name           = "${var.project_name}-${var.environment}-error-count"
  log_group_name = aws_cloudwatch_log_group.application.name
  pattern        = "[time, request_id, level = ERROR*, ...]"

  metric_transformation {
    name      = "ErrorCount"
    namespace = "${var.project_name}/${var.environment}"
    value     = "1"
    unit      = "Count"
  }
}

resource "aws_cloudwatch_log_metric_filter" "fatal_count" {
  name           = "${var.project_name}-${var.environment}-fatal-count"
  log_group_name = aws_cloudwatch_log_group.application.name
  pattern        = "[time, request_id, level = FATAL*, ...]"

  metric_transformation {
    name      = "FatalCount"
    namespace = "${var.project_name}/${var.environment}"
    value     = "1"
    unit      = "Count"
  }
}

resource "aws_cloudwatch_log_metric_filter" "response_time" {
  name           = "${var.project_name}-${var.environment}-response-time"
  log_group_name = aws_cloudwatch_log_group.application.name
  pattern        = "[time, request_id, level, method, path, status, duration]"

  metric_transformation {
    name      = "ResponseTime"
    namespace = "${var.project_name}/${var.environment}"
    value     = "$duration"
    unit      = "Milliseconds"
  }
}
