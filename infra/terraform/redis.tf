resource "google_redis_instance" "cache" {
  name               = "jurisnexo-redis"
  tier               = "STANDARD_HA"  # High Availability
  memory_size_gb     = 5
  region             = "southamerica-east1"
  
  redis_version      = "REDIS_7_0"
  display_name       = "JurisNexo Cache"
  
  # Network
  authorized_network = google_compute_network.vpc.id
  connect_mode       = "PRIVATE_SERVICE_ACCESS"
  
  # Persistence
  persistence_config {
    persistence_mode    = "RDB"
    rdb_snapshot_period = "TWELVE_HOURS"
  }
  
  # Maintenance
  maintenance_policy {
    weekly_maintenance_window {
      day = "SUNDAY"
      start_time {
        hours   = 3
        minutes = 0
      }
    }
  }
  
  labels = {
    environment = "production"
    app         = "jurisnexo"
  }
}

output "redis_host" {
  value     = google_redis_instance.cache.host
  sensitive = false
}

output "redis_port" {
  value = google_redis_instance.cache.port
}
