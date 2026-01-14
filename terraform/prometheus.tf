# ==========================================
# PROMETHEUS CONFIGURATION
# ==========================================

# ECS Task Definition for Prometheus
resource "aws_ecs_task_definition" "prometheus" {
  family                   = "${var.project_name}-${var.environment}-prometheus"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "512"
  memory                   = "1024"
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn # Expecting from ecs.tf
  task_role_arn            = aws_iam_role.ecs_task.arn           # Expecting from ecs.tf

  container_definitions = jsonencode([
    {
      name      = "prometheus"
      image     = "prom/prometheus:latest"
      essential = true

      portMappings = [
        {
          containerPort = 9090
          protocol      = "tcp"
        }
      ]

      mountPoints = [
        {
          sourceVolume  = "prometheus-config"
          containerPath = "/etc/prometheus"
          readOnly      = true
        },
        {
          sourceVolume  = "prometheus-data"
          containerPath = "/prometheus"
          readOnly      = false
        }
      ]

      command = [
        "--config.file=/etc/prometheus/prometheus.yml",
        "--storage.tsdb.path=/prometheus",
        "--storage.tsdb.retention.time=15d",
        "--web.console.libraries=/usr/share/prometheus/console_libraries",
        "--web.console.templates=/usr/share/prometheus/consoles"
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ecs.name # Expecting from ecs.tf
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "prometheus"
        }
      }

      healthCheck = {
        command     = ["CMD-SHELL", "wget --quiet --tries=1 --spider http://localhost:9090/-/healthy || exit 1"]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 60
      }
    }
  ])

  volume {
    name = "prometheus-config"

    efs_volume_configuration {
      file_system_id     = aws_efs_file_system.prometheus_config.id
      transit_encryption = "ENABLED"
      authorization_config {
        access_point_id = aws_efs_access_point.prometheus_config.id
      }
    }
  }

  volume {
    name = "prometheus-data"

    efs_volume_configuration {
      file_system_id     = aws_efs_file_system.prometheus_data.id
      transit_encryption = "ENABLED"
      authorization_config {
        access_point_id = aws_efs_access_point.prometheus_data.id
      }
    }
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-prometheus"
  }
}

# EFS for Prometheus Config
resource "aws_efs_file_system" "prometheus_config" {
  creation_token = "${var.project_name}-${var.environment}-prometheus-config"
  encrypted      = true

  tags = {
    Name = "${var.project_name}-${var.environment}-prometheus-config"
  }
}

resource "aws_efs_access_point" "prometheus_config" {
  file_system_id = aws_efs_file_system.prometheus_config.id

  posix_user {
    gid = 65534
    uid = 65534
  }

  root_directory {
    path = "/config"
    creation_info {
      owner_gid   = 65534
      owner_uid   = 65534
      permissions = "755"
    }
  }
}

# EFS Mount Targets for Config
resource "aws_efs_mount_target" "prometheus_config" {
  count           = length(aws_subnet.private)
  file_system_id  = aws_efs_file_system.prometheus_config.id
  subnet_id       = aws_subnet.private[count.index].id
  security_groups = [aws_security_group.efs.id]
}

# EFS for Prometheus Data
resource "aws_efs_file_system" "prometheus_data" {
  creation_token = "${var.project_name}-${var.environment}-prometheus-data"
  encrypted      = true

  lifecycle_policy {
    transition_to_ia = "AFTER_30_DAYS"
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-prometheus-data"
  }
}

resource "aws_efs_access_point" "prometheus_data" {
  file_system_id = aws_efs_file_system.prometheus_data.id

  posix_user {
    gid = 65534
    uid = 65534
  }

  root_directory {
    path = "/data"
    creation_info {
      owner_gid   = 65534
      owner_uid   = 65534
      permissions = "755"
    }
  }
}

# EFS Mount Targets for Data
resource "aws_efs_mount_target" "prometheus_data" {
  count           = length(aws_subnet.private)
  file_system_id  = aws_efs_file_system.prometheus_data.id
  subnet_id       = aws_subnet.private[count.index].id
  security_groups = [aws_security_group.efs.id]
}

# EFS Security Group
resource "aws_security_group" "efs" {
  name        = "${var.project_name}-${var.environment}-efs-sg"
  description = "Security group for EFS"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 2049
    to_port         = 2049
    protocol        = "tcp"
    security_groups = [aws_security_group.prometheus.id]
    description     = "Allow NFS from Prometheus"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-efs-sg"
  }
}

# Service Discovery for Prometheus
resource "aws_service_discovery_service" "prometheus" {
  name = "prometheus"

  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.main.id # Expecting from ecs.tf
    
    dns_records {
      ttl  = 10
      type = "A"
    }

    routing_policy = "MULTIVALUE"
  }

  health_check_custom_config {
    failure_threshold = 1
  }
}

# Prometheus Service
resource "aws_ecs_service" "prometheus" {
  name            = "${var.project_name}-${var.environment}-prometheus"
  cluster         = aws_ecs_cluster.main.id # Expecting from ecs.tf
  task_definition = aws_ecs_task_definition.prometheus.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = aws_subnet.private[*].id
    security_groups  = [aws_security_group.prometheus.id]
    assign_public_ip = false
  }

  service_registries {
    registry_arn = aws_service_discovery_service.prometheus.arn
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-prometheus"
  }
}

# Security Group for Prometheus
resource "aws_security_group" "prometheus" {
  name        = "${var.project_name}-${var.environment}-prometheus-sg"
  description = "Security group for Prometheus"
  vpc_id      = aws_vpc.main.id

  # Ingress from Grafana (Commented out until Grafana SG is created)
  # ingress {
  #   from_port       = 9090
  #   to_port         = 9090
  #   protocol        = "tcp"
  #   security_groups = [aws_security_group.grafana.id]
  #   description     = "Allow access from Grafana"
  # }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-prometheus-sg"
  }
}
