variable "aws_region" {
  description = "AWS region to deploy into."
  type        = string
  default     = "eu-central-1"
}

variable "project_name" {
  description = "Short name used to prefix/tag resources."
  type        = string
  default     = "erp"
}

variable "github_repo" {
  description = "GitHub repo allowed to deploy, as 'owner/name' (used in the OIDC trust policy)."
  type        = string
  # e.g. "enlear/ERP-Platform"
}

variable "allowed_http_cidr" {
  description = "CIDR allowed to reach the app over HTTP (port 80). Lock this to your office/VPN; 0.0.0.0/0 = public."
  type        = string
  default     = "0.0.0.0/0"
}

variable "instance_type" {
  description = "EC2 instance type for the app host."
  type        = string
  default     = "t3.small"
}

variable "db_instance_class" {
  description = "RDS instance class."
  type        = string
  default     = "db.t4g.micro"
}

variable "db_allocated_storage" {
  description = "RDS allocated storage in GB."
  type        = number
  default     = 20
}

variable "db_name" {
  description = "Initial database name."
  type        = string
  default     = "erp"
}

variable "db_username" {
  description = "Master DB username."
  type        = string
  default     = "erp"
}

variable "db_engine_version" {
  description = "PostgreSQL major.minor version (must be available in the region; see `aws rds describe-db-engine-versions`)."
  type        = string
  default     = "16.9"
}

variable "db_multi_az" {
  description = "Run RDS in Multi-AZ (higher availability, ~2x cost)."
  type        = bool
  default     = false
}

variable "db_backup_retention_days" {
  description = "Automated backup retention in days. AWS Free Plan accounts must use 0 (backups disabled); raise to 7+ after upgrading the account."
  type        = number
  default     = 0
}
