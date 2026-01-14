# X-Ray Sampling Rule
resource "aws_xray_sampling_rule" "main" {
  rule_name      = "${var.project_name}-${var.environment}-sampling-rule"
  priority       = 1000
  version        = 1
  reservoir_size = 1
  fixed_rate     = 0.05
  url_path       = "*"
  host           = "*"
  http_method    = "*"
  service_type   = "*"
  service_name   = "*"
  resource_arn   = "*"

  attributes = {
    Environment = var.environment
  }
}

# X-Ray Group
resource "aws_xray_group" "main" {
  group_name        = "${var.project_name}-${var.environment}"
  filter_expression = "service(\"JurisNexo.API\") AND responsetime >= 2"

  insights_configuration {
    insights_enabled      = true
    notifications_enabled = true
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-xray-group"
  }
}
