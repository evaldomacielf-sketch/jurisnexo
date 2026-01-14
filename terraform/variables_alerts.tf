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
