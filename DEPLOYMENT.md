# Deploying the ERP Platform to AWS

This sets up a **single Docker image** (React SPA + Spring Boot API on one origin)
deployed to **EC2 + RDS PostgreSQL**, with a **GitHub Actions CI/CD pipeline** that
builds, pushes to ECR, and redeploys on every push to `main` — no manual image
uploads, no SSH, no long-lived AWS keys.

```
   git push main
        │
        ▼
 GitHub Actions ──OIDC──▶ AWS
   1. build image (Dockerfile)
   2. push  ──▶  Amazon ECR
   3. SSM SendCommand ──▶ EC2 host:  docker pull + restart
                                        │
                                        ▼
                              RDS PostgreSQL (private)
```

The app image serves the SPA from `/` and the API from `/api/*` on **port 8080**
(mapped to host **port 80**). Database credentials and the JWT secret live in
**AWS Secrets Manager** and are injected at container start — never baked into the
image.

---

## What's in this repo

| Path | Purpose |
|------|---------|
| `Dockerfile` | 3-stage build: React → Gradle (SPA bundled into the jar) → slim JRE |
| `.dockerignore` | Keeps the build context lean |
| `.github/workflows/deploy.yml` | CI/CD: build → ECR → SSM deploy |
| `deploy/ec2-user-data.sh.tftpl` | EC2 bootstrap + the `/opt/erp/deploy.sh` redeploy script |
| `deploy/terraform/` | All AWS infra: ECR, RDS, EC2, IAM, security groups, secrets, GitHub OIDC |

The app changes that make single-origin serving work:
`backend/.../config/WebConfig.java` (SPA fallback) and the `SecurityConfig.java`
update (API stays JWT-guarded, static shell is public).

---

## Prerequisites (once, on your machine)

- [Terraform](https://developer.hashicorp.com/terraform/install) ≥ 1.6
- AWS CLI v2, authenticated to **the target account** (`aws sts get-caller-identity`)
- A GitHub repository for this code (the pipeline runs there)

> The pipeline targets whichever AWS account your Terraform/AWS CLI points at —
> set that to your *other* account before running the steps below.

---

## Step 1 — Provision AWS infrastructure (Terraform)

```bash
cd deploy/terraform
cp terraform.tfvars.example terraform.tfvars
#   edit terraform.tfvars: set github_repo = "your-org/your-repo"
#   (optionally lock allowed_http_cidr to your office/VPN)

terraform init
terraform apply        # ~10-12 min, mostly RDS coming online
```

This creates the ECR repo, RDS PostgreSQL (private, encrypted, auto-backups),
the EC2 host (Docker + SSM, no SSH), Secrets Manager entries (random DB password
+ JWT key), and the GitHub OIDC deploy role.

When it finishes, note the outputs:

```bash
terraform output
```

You'll use these in Step 2:
- `github_deploy_role_arn`
- `aws_region`
- `ecr_repository_name`

---

## Step 2 — Wire up GitHub

In your GitHub repo → **Settings → Secrets and variables → Actions**:

**Secret:**
| Name | Value |
|------|-------|
| `AWS_DEPLOY_ROLE_ARN` | `github_deploy_role_arn` output |

**Variables** (the "Variables" tab, not Secrets):
| Name | Value |
|------|-------|
| `AWS_REGION` | `aws_region` output (e.g. `eu-central-1`) |
| `ECR_REPOSITORY` | `ecr_repository_name` output (e.g. `erp-app`) |

---

## Step 3 — Deploy

Push to `main` (or run the workflow manually from the **Actions** tab):

```bash
git add .
git commit -m "Add AWS deployment pipeline"
git push origin main
```

The workflow builds the image, pushes it to ECR, and issues an SSM command that
makes the EC2 host pull and start it. Flyway runs the `iam` and `store`
migrations against RDS automatically on first boot, and the default `admin/admin123`
user is created.

Open the app at the `app_url` Terraform output (`http://<ec2-public-ip>`).
Log in with `admin` / `admin123` and **change that password immediately**.

---

## Day-2 operations

- **Every deploy**: just push to `main`. The same flow runs; the container is
  replaced with zero manual steps. Each image is tagged with the git SHA, so a
  rollback is "re-run the old workflow" or deploy a prior SHA tag.
- **Logs**: CloudWatch log group `/erp/app` (or `docker logs erp` over an SSM
  session: `aws ssm start-session --target <instance-id>`).
- **DB credentials**: `aws secretsmanager get-secret-value --secret-id erp/db`.
- **Shell on the box (no SSH key needed)**:
  `aws ssm start-session --target <instance-id>`.

---

## Hardening checklist (before real data)

The defaults favor a quick, working first deploy. Tighten these for production:

1. **HTTPS** — today the app is plain HTTP on port 80. Put it behind an
   Application Load Balancer + ACM certificate, or run [Caddy](https://caddyserver.com/)
   on the host for automatic TLS. Point a domain at it.
2. **Lock inbound** — set `allowed_http_cidr` to your office/VPN instead of
   `0.0.0.0/0`.
3. **RDS safety** — set `deletion_protection = true` and `skip_final_snapshot = false`
   in `main.tf` once the DB holds anything you care about. Consider `db_multi_az = true`.
4. **Rotate the JWT secret / DB password** via Secrets Manager rotation, then
   redeploy.
5. **State** — enable the S3 remote backend in `versions.tf` so the Terraform
   state is shared and locked, not just on your laptop.
6. **Backups beyond RDS** — RDS keeps 7 days of automated backups; add periodic
   manual snapshots or AWS Backup if you need longer retention.

---

## Tear-down

```bash
cd deploy/terraform
terraform destroy
```

(With `deletion_protection`/`skip_final_snapshot` left at the defaults this also
removes the database — flip those first if you have data to keep.)
