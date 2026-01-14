# ==========================================
# NETWORK OUTPUTS
# ==========================================

output "vpc_id" {
  description = "The ID of the VPC"
  value       = aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "List of public subnet IDs"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "List of private subnet IDs"
  value       = aws_subnet.private[*].id
}

output "nat_gateway_ips" {
  description = "List of Elastic IPs associated with NAT Gateways"
  value       = aws_eip.nat[*].public_ip
}

# ==========================================
# DATABASE OUTPUTS
# ==========================================

output "rds_endpoint" {
  description = "The connection endpoint for the RDS instance"
  value       = aws_db_instance.main.address
}

output "rds_port" {
  description = "The connection port for the RDS instance"
  value       = aws_db_instance.main.port
}

output "redis_primary_endpoint" {
  description = "The primary endpoint for the Redis replication group"
  value       = aws_elasticache_replication_group.redis.primary_endpoint_address
}

output "redis_port" {
  description = "The port for the Redis replication group"
  value       = aws_elasticache_replication_group.redis.port
}

# ==========================================
# LOAD BALANCER & CDN OUTPUTS
# ==========================================

output "alb_dns_name" {
  description = "The DNS name of the Application Load Balancer"
  value       = aws_lb.main.dns_name
}

output "alb_arn" {
  description = "The ARN of the Application Load Balancer"
  value       = aws_lb.main.arn
}

output "cloudfront_domain_name" {
  description = "The domain name of the CloudFront distribution"
  value       = aws_cloudfront_distribution.main.domain_name
}

output "cloudfront_distribution_id" {
  description = "The ID of the CloudFront distribution"
  value       = aws_cloudfront_distribution.main.id
}

output "s3_website_bucket" {
  description = "The name of the S3 bucket for the frontend"
  value       = aws_s3_bucket.frontend.id
}

# ==========================================
# ECS OUTPUTS
# ==========================================

output "ecs_cluster_name" {
  description = "The name of the ECS cluster"
  value       = aws_ecs_cluster.main.name
}

output "ecs_cluster_id" {
  description = "The ARN of the ECS cluster"
  value       = aws_ecs_cluster.main.id
}

output "backend_service_name" {
  description = "The name of the backend ECS service"
  value       = aws_ecs_service.backend.name
}

output "monitoring_service_dns" {
  description = "Internal DNS name for Prometheus"
  value       = "prometheus.${aws_service_discovery_private_dns_namespace.main.name}"
}

output "grafana_url" {
  description = "Public URL for Grafana Dashboard"
  value       = "https://monitoring.${var.domain_name}"
}

# ==========================================
# MONITORING OUTPUTS
# ==========================================

output "cloudwatch_dashboard_name" {
  description = "Name of the main CloudWatch dashboard"
  value       = aws_cloudwatch_dashboard.main.dashboard_name
}

output "sns_alerts_topic_arn" {
  description = "The ARN of the SNS topic for alerts"
  value       = aws_sns_topic.alerts.arn
}
