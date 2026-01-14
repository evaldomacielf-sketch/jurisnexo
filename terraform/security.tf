# ==========================================
# SECURITY GROUPS
# ==========================================

# ECS Tasks Security Group
resource "aws_security_group" "ecs_tasks" {
  name        = "${var.project_name}-${var.environment}-ecs-tasks-sg"
  description = "Allow inbound access from the ALB only"
  vpc_id      = aws_vpc.main.id

  ingress {
    protocol        = "tcp"
    from_port       = 8080 # Backend port
    to_port         = 8080
    security_groups = [aws_security_group.alb.id]
    description     = "Allow Backend Access from ALB"
  }
  
  ingress {
    protocol        = "tcp"
    from_port       = 3000 // Prometheus/Grafana ports if needed, but they have their own SGs
    to_port         = 3000
    security_groups = [aws_security_group.alb.id]
    description     = "Allow Grafana Access from ALB"
  }

  egress {
    protocol    = "-1"
    from_port   = 0
    to_port     = 0
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-ecs-tasks-sg"
  }
}
