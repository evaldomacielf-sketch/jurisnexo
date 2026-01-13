# --- Cloud Logging & Retention ---

resource "google_logging_project_bucket_config" "audit_logs" {
  project        = "jurisnexo-prod"
  location       = "global"
  bucket_id      = "_Default"
  
  # Retention: 30 days for analysis (Audit Logs)
  retention_days = 30
}

resource "google_storage_bucket" "long_term_logs" {
  name          = "jurisnexo-audit-logs-archive"
  location      = "SOUTHAMERICA-EAST1"
  storage_class = "NEARLINE"
  
  uniform_bucket_level_access = true
  
  # Encryption: Uses Google-managed keys by default (Standard)
  # For CMEK, we would add encryption { default_kms_key_name = ... }
  
  lifecycle_rule {
    condition {
      age = 365 # Keep logs for 1 year
    }
    action {
      type = "Delete"
    }
  }
  
  versioning {
    enabled = false
  }
}

# --- Cloud Armor Security Policy ---
# (Basic WAF already covered in setup-phase9, verifying here via IaC if needed)
resource "google_compute_security_policy" "policy" {
  name = "jurisnexo-security-policy"

  rule {
    action   = "deny(403)"
    priority = "1000"
    match {
      versioned_expr = "SRC_IPS_V1"
      config {
        src_ip_ranges = ["*"]
      }
    }
    description = "Deny malicious IPs (Placeholder)"
    preview     = true
  }

  rule {
    action   = "allow"
    priority = "2147483647"
    match {
      versioned_expr = "SRC_IPS_V1"
      config {
        src_ip_ranges = ["*"]
      }
    }
    description = "Default rule, allow all"
  }
}
