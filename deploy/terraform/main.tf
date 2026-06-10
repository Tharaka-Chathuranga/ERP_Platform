# ──────────────────────────────────────────────────────────────────────────────
# Core infrastructure: networking lookups, ECR, secrets, RDS, EC2 app host.
# Deploys into the account's DEFAULT VPC to keep this self-contained. For a
# hardened setup, swap the data sources below for a purpose-built VPC module.
# ──────────────────────────────────────────────────────────────────────────────

data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# Latest Amazon Linux 2023 AMI (SSM Agent preinstalled).
data "aws_ssm_parameter" "al2023" {
  name = "/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64"
}

# ── Container registry ────────────────────────────────────────────────────────
resource "aws_ecr_repository" "app" {
  name                 = "${var.project_name}-app"
  image_tag_mutability = "MUTABLE" # 'latest' is re-tagged each deploy
  force_delete         = true

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_lifecycle_policy" "app" {
  repository = aws_ecr_repository.app.name
  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep last 15 images, expire older untagged ones"
      selection = {
        tagStatus   = "untagged"
        countType   = "imageCountMoreThan"
        countNumber = 15
      }
      action = { type = "expire" }
    }]
  })
}

# ── Logs ──────────────────────────────────────────────────────────────────────
resource "aws_cloudwatch_log_group" "app" {
  name              = "/${var.project_name}/app"
  retention_in_days = 30
}

# ── Security groups ───────────────────────────────────────────────────────────
resource "aws_security_group" "app" {
  name        = "${var.project_name}-app-sg"
  description = "App host: inbound HTTP only; no SSH (access via SSM)."
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = [var.allowed_http_cidr]
  }

  egress {
    description = "All outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "db" {
  name        = "${var.project_name}-db-sg"
  description = "RDS: PostgreSQL reachable only from the app host."
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description     = "PostgreSQL from app host"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.app.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# ── Secrets (DB creds + JWT signing key) ──────────────────────────────────────
resource "random_password" "db" {
  length  = 24
  special = false # avoid URL-encoding headaches in the JDBC URL
}

resource "random_password" "jwt" {
  length  = 48
  special = false # >= 32 chars as required by the app
}

resource "aws_secretsmanager_secret" "db" {
  name = "${var.project_name}/db"
}

resource "aws_secretsmanager_secret" "app" {
  name = "${var.project_name}/app"
}

# ── Database ──────────────────────────────────────────────────────────────────
resource "aws_db_subnet_group" "db" {
  name       = "${var.project_name}-db-subnets"
  subnet_ids = data.aws_subnets.default.ids
}

resource "aws_db_instance" "db" {
  identifier     = "${var.project_name}-postgres"
  engine         = "postgres"
  engine_version = var.db_engine_version
  instance_class = var.db_instance_class

  allocated_storage = var.db_allocated_storage
  # Storage autoscaling is disabled (0) for Free Plan compatibility. Raise this
  # above allocated_storage to re-enable headroom once the account is upgraded.
  max_allocated_storage = 0
  storage_type          = "gp3"
  storage_encrypted     = true

  db_name  = var.db_name
  username = var.db_username
  password = random_password.db.result

  db_subnet_group_name   = aws_db_subnet_group.db.name
  vpc_security_group_ids = [aws_security_group.db.id]
  publicly_accessible    = false
  multi_az               = var.db_multi_az

  backup_retention_period = var.db_backup_retention_days
  deletion_protection     = false # set true once you have real data
  skip_final_snapshot     = true  # set false (+ final_snapshot_identifier) for prod
  apply_immediately       = true
}

# Store connection details only after RDS exists (we need its endpoint).
resource "aws_secretsmanager_secret_version" "db" {
  secret_id = aws_secretsmanager_secret.db.id
  secret_string = jsonencode({
    username = var.db_username
    password = random_password.db.result
    host     = aws_db_instance.db.address
    port     = aws_db_instance.db.port
    dbname   = var.db_name
  })
}

resource "aws_secretsmanager_secret_version" "app" {
  secret_id     = aws_secretsmanager_secret.app.id
  secret_string = jsonencode({ jwt_secret = random_password.jwt.result })
}

# ── EC2 app host ──────────────────────────────────────────────────────────────
resource "aws_instance" "app" {
  ami                         = data.aws_ssm_parameter.al2023.value
  instance_type               = var.instance_type
  subnet_id                   = data.aws_subnets.default.ids[0]
  vpc_security_group_ids      = [aws_security_group.app.id]
  iam_instance_profile        = aws_iam_instance_profile.app.name
  associate_public_ip_address = true

  user_data_replace_on_change = true
  user_data = templatefile("${path.module}/../ec2-user-data.sh.tftpl", {
    aws_region     = var.aws_region
    ecr_repo_url   = aws_ecr_repository.app.repository_url
    db_secret_arn  = aws_secretsmanager_secret.db.arn
    app_secret_arn = aws_secretsmanager_secret.app.arn
    app_log_group  = aws_cloudwatch_log_group.app.name
  })

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
    encrypted   = true
  }

  metadata_options {
    http_tokens = "required" # IMDSv2 only
  }

  tags = {
    Name = "${var.project_name}-app" # CI targets this tag via SSM
  }

  # Secrets/DB must exist before the host boots and tries to start the app.
  depends_on = [
    aws_secretsmanager_secret_version.db,
    aws_secretsmanager_secret_version.app,
    aws_db_instance.db,
  ]
}
