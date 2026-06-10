terraform {
  required_version = ">= 1.6"
  required_providers {
    aws    = { source = "hashicorp/aws", version = "~> 5.0" }
    random = { source = "hashicorp/random", version = "~> 3.6" }
    tls    = { source = "hashicorp/tls", version = "~> 4.0" }
  }

  # Remote state is recommended for a team. To use S3 state, uncomment and
  # create the bucket/table first, then `terraform init -migrate-state`.
  # backend "s3" {
  #   bucket         = "YOUR-tf-state-bucket"
  #   key            = "erp/terraform.tfstate"
  #   region         = "eu-central-1"
  #   dynamodb_table = "YOUR-tf-locks"
  #   encrypt        = true
  # }
}

provider "aws" {
  region = var.aws_region
  default_tags {
    tags = {
      Project   = var.project_name
      ManagedBy = "terraform"
    }
  }
}
