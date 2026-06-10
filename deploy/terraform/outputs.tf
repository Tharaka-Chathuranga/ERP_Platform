output "app_url" {
  description = "Open this once the first deploy completes."
  value       = "http://${aws_instance.app.public_ip}"
}

output "ec2_public_ip" {
  value = aws_instance.app.public_ip
}

output "ecr_repository_url" {
  description = "Set this as the GitHub Actions variable ECR_REPOSITORY (repo name only) — see below."
  value       = aws_ecr_repository.app.repository_url
}

output "ecr_repository_name" {
  description = "GitHub Actions variable: ECR_REPOSITORY"
  value       = aws_ecr_repository.app.name
}

output "github_deploy_role_arn" {
  description = "GitHub Actions secret: AWS_DEPLOY_ROLE_ARN"
  value       = aws_iam_role.github_deploy.arn
}

output "aws_region" {
  description = "GitHub Actions variable: AWS_REGION"
  value       = var.aws_region
}

output "rds_endpoint" {
  value = aws_db_instance.db.endpoint
}

output "db_secret_name" {
  description = "Secrets Manager entry holding the DB credentials."
  value       = aws_secretsmanager_secret.db.name
}
