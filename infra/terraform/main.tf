terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = "jurisnexo-prod"
  region  = "southamerica-east1"
}

# --- VPC & Networking ---
resource "google_compute_network" "vpc" {
  name                    = "jurisnexo-vpc"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "subnet" {
  name          = "jurisnexo-subnet"
  network       = google_compute_network.vpc.id
  ip_cidr_range = "10.0.0.0/24"
  region        = "southamerica-east1"
  
  private_ip_google_access = true
}

# --- GKE Cluster (Autopilot) ---
# Note: Previous scripts used Standard Cluster. Autopilot manages nodes automatically.
resource "google_container_cluster" "primary" {
  name     = "jurisnexo-cluster"
  location = "southamerica-east1"
  
  enable_autopilot = true
  
  network    = google_compute_network.vpc.id
  subnetwork = google_compute_subnetwork.subnet.id
  
  ip_allocation_policy {
    cluster_ipv4_cidr_block  = "/16"
    services_ipv4_cidr_block = "/22"
  }
  
  release_channel {
    channel = "REGULAR"
  }
  
  workload_identity_config {
    workload_pool = "jurisnexo-prod.svc.id.goog"
  }
}

# --- Cloud SQL (PostgreSQL) ---
resource "google_sql_database_instance" "main" {
  name             = "jurisnexo-db"
  database_version = "POSTGRES_15"
  region           = "southamerica-east1"
  
  settings {
    tier              = "db-custom-4-16384"
    availability_type = "REGIONAL"
    
    backup_configuration {
      enabled    = true
      start_time = "03:00"
    }
    
    ip_configuration {
      ipv4_enabled    = false
      private_network = google_compute_network.vpc.id
    }
  }
  
  deletion_protection = true # Recommended for production
}

resource "google_sql_database" "database" {
  name     = "jurisnexo"
  instance = google_sql_database_instance.main.name
}
