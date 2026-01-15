variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  validation {
    condition     = contains(["dev", "staging", "production"], var.environment)
    error_message = "Environment must be dev, staging, or production."
  }
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "jurisnexo"
}

# VPC Configuration
variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "Number of availability zones"
  type        = number
  default     = 2
}

# ECS Configuration
variable "ecs_task_cpu" {
  description = "ECS task CPU units"
  type        = number
  default     = 512
}

variable "ecs_task_memory" {
  description = "ECS task memory (MB)"
  type        = number
  default     = 1024
}

variable "ecs_desired_count" {
  description = "Desired number of ECS tasks"
  type        = number
  default     = 2
}

variable "ecs_max_capacity" {
  description = "Maximum number of ECS tasks"
  type        = number
  default     = 10
}

# RDS Configuration
variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.medium"
}

variable "db_allocated_storage" {
  description = "RDS allocated storage (GB)"
  type        = number
  default     = 100
}

variable "db_max_allocated_storage" {
  description = "RDS maximum allocated storage (GB)"
  type        = number
  default     = 500
}

variable "db_backup_retention_period" {
  description = "Number of days to retain backups"
  type        = number
  default     = 30
}

# ElastiCache Configuration
variable "elasticache_node_type" {
  description = "ElastiCache node type"
  type        = string
  default     = "cache.t3.micro"
}

variable "elasticache_num_cache_nodes" {
  description = "Number of cache nodes"
  type        = number
  default     = 2
}

# Domain Configuration
variable "domain_name" {
  description = "Domain name"
  type        = string
  default     = "jurisnexo.com"
}

variable "certificate_arn" {
  description = "ACM certificate ARN"
  type        = string
}

# Secrets
variable "db_username" {
  description = "Database username"
  type        = string
  default     = "postgres"
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

variable "jwt_secret_key" {
  description = "JWT secret key"
  type        = string
  sensitive   = true
}

variable "sns_topic_arn" {
  description = "SNS Topic ARN for alarms"
  type        = string
  default     = ""
}

variable "redis_auth_token" {
  description = "Redis Auth Token (min 16 chars)"
  type        = string
  sensitive   = true
}

variable "access_logs_bucket" {
  description = "S3 Bucket for ALB/Flow logs"
  type        = string
  default     = "jurisnexo-logs"
}

variable "kms_key_id" {
  description = "KMS Key ID for encryption"
  type        = string
  default     = ""
}

variable "alert_emails" {
  description = "List of email addresses for alerts"
  type        = list(string)
  default     = []
}

variable "slack_webhook_url" {
  description = "Slack Webhook URL for alerts"
  type        = string
  default     = ""
  sensitive   = true
}

variable "grafana_admin_password_secret_arn" {
  description = "ARN of the secret containing Grafana admin password"
  type        = string
}
