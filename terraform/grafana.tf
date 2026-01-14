# ==========================================
# GRAFANA CONFIGURATION
# ==========================================

# ECS Task Definition for Grafana
resource "aws_ecs_task_definition" "grafana" {
  family                   = "${var.project_name}-${var.environment}-grafana"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "512"
  memory                   = "1024"
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn # Expecting from ecs.tf
  task_role_arn            = aws_iam_role.ecs_task.arn           # Expecting from ecs.tf

  container_definitions = jsonencode([
    {
      name      = "grafana"
      image     = "grafana/grafana:latest"
      essential = true

      portMappings = [
        {
          containerPort = 3000
          protocol      = "tcp"
        }
      ]

      environment = [
        {
          name  = "GF_SERVER_ROOT_URL"
          value = "https://monitoring.${var.domain_name}"
        },
        {
          name  = "GF_SECURITY_ADMIN_USER"
          value = "admin"
        },
        {
          name  = "GF_INSTALL_PLUGINS"
          value = "grafana-clock-panel,grafana-piechart-panel"
        }
      ]

      secrets = [
        {
          name      = "GF_SECURITY_ADMIN_PASSWORD"
          valueFrom = var.grafana_admin_password_secret_arn
        }
      ]

      mountPoints = [
        {
          sourceVolume  = "grafana-data"
          containerPath = "/var/lib/grafana"
          readOnly      = false
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ecs.name # Expecting from ecs.tf
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "grafana"
        }
      }

      healthCheck = {
        command     = ["CMD-SHELL", "wget --quiet --tries=1 --spider http://localhost:3000/api/health || exit 1"]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 60
      }
    }
  ])

  volume {
    name = "grafana-data"

    efs_volume_configuration {
      file_system_id     = aws_efs_file_system.grafana_data.id
      transit_encryption = "ENABLED"
      authorization_config {
        access_point_id = aws_efs_access_point.grafana_data.id
      }
    }
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-grafana"
  }
}

# EFS for Grafana
resource "aws_efs_file_system" "grafana_data" {
  creation_token = "${var.project_name}-${var.environment}-grafana-data"
  encrypted      = true

  tags = {
    Name = "${var.project_name}-${var.environment}-grafana-data"
  }
}

resource "aws_efs_access_point" "grafana_data" {
  file_system_id = aws_efs_file_system.grafana_data.id

  posix_user {
    gid = 472
    uid = 472
  }

  root_directory {
    path = "/data"
    creation_info {
      owner_gid   = 472
      owner_uid   = 472
      permissions = "755"
    }
  }
}

# EFS Mount Targets for Grafana (Missing in user request but critical)
resource "aws_efs_mount_target" "grafana_data" {
  count           = length(aws_subnet.private)
  file_system_id  = aws_efs_file_system.grafana_data.id
  subnet_id       = aws_subnet.private[count.index].id
  security_groups = [aws_security_group.efs.id]
}

# Security Group for Grafana
resource "aws_security_group" "grafana" {
  name        = "${var.project_name}-${var.environment}-grafana-sg"
  description = "Security group for Grafana"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
    description     = "Allow access from ALB"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-grafana-sg"
  }
}

# Grafana Service
resource "aws_ecs_service" "grafana" {
  name            = "${var.project_name}-${var.environment}-grafana"
  cluster         = aws_ecs_cluster.main.id # Expecting from ecs.tf
  task_definition = aws_ecs_task_definition.grafana.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = aws_subnet.private[*].id
    security_groups  = [aws_security_group.grafana.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.grafana.arn
    container_name   = "grafana"
    container_port   = 3000
  }

  # explicit dependency on ALB listener to avoid race conditions
  depends_on = [aws_lb_listener.https] 

  tags = {
    Name = "${var.project_name}-${var.environment}-grafana"
  }
}

# ALB Target Group for Grafana
resource "aws_lb_target_group" "grafana" {
  name        = "${var.project_name}-${var.environment}-grafana-tg"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    path                = "/api/health"
    matcher             = "200"
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-grafana-tg"
  }
}

# ALB Listener Rule for Grafana
resource "aws_lb_listener_rule" "grafana" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 100

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.grafana.arn
  }

  condition {
    host_header {
      values = ["monitoring.${var.domain_name}"]
    }
  }
}
