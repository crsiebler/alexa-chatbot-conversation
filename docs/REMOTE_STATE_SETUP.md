# Remote State Bootstrap Guide

This guide explains how to set up S3 remote state for Terraform.

## Why Remote State?

- **Persistent state** between GitHub Actions runs
- **State locking** prevents concurrent modifications
- **Team-ready** for multiple developers
- **Audit history** with S3 versioning

## One-Time Bootstrap Process

### Step 1: Comment Out Backend Configuration

The backend is already commented out in [terraform/backend.tf](terraform/backend.tf). Leave it that way for now.

### Step 2: Deploy State Infrastructure via GitHub Actions

Commit and push all changes to trigger GitHub Actions:

```bash
git add terraform/backend.tf terraform/state-infrastructure.tf docs/REMOTE_STATE_SETUP.md
git commit -m "feat: add S3 remote state infrastructure"
git push origin main
```

This will create:
- S3 bucket: `alexa-chatbot-terraform-state-981374387644`
- DynamoDB table: `alexa-chatbot-terraform-lock`

Wait for the GitHub Actions workflow to complete successfully.

### Step 3: Enable Backend Configuration

Uncomment the backend configuration in [terraform/backend.tf](terraform/backend.tf):

```terraform
terraform {
  backend "s3" {
    bucket         = "alexa-chatbot-terraform-state-981374387644"
    key            = "terraform.tfstate"
    region         = "us-west-2"
    encrypt        = true
    dynamodb_table = "alexa-chatbot-terraform-lock"
  }
}
```

### Step 4: Commit Backend Configuration

```bash
git add terraform/backend.tf
git commit -m "feat: enable S3 remote state backend"
git push origin main
```

GitHub Actions will:
1. Run `terraform init` (detects backend change)
2. Automatically migrate state to S3
3. Continue with normal plan/apply

### Step 5: Verify Remote State

Check that state is now stored in S3:

```bash
aws s3 ls s3://alexa-chatbot-terraform-state-981374387644/
```

You should see `terraform.tfstate` in the bucket.

## What Happens Next?

- ✅ All future deployments use remote state
- ✅ State persists between GitHub Actions runs
- ✅ No more import workarounds needed
- ✅ DynamoDB prevents concurrent modifications

## Troubleshooting

### Backend initialization error

If `terraform init` fails with backend errors:

1. Verify S3 bucket exists: `aws s3 ls s3://alexa-chatbot-terraform-state-981374387644/`
2. Verify DynamoDB table exists: `aws dynamodb describe-table --table-name alexa-chatbot-terraform-lock`
3. Check AWS credentials have S3 and DynamoDB permissions

### State migration failed

If state migration fails, manually migrate:

```bash
cd terraform
terraform init -migrate-state
```

Answer `yes` when prompted to copy existing state to the new backend.

## Cost

- **S3**: ~$0.023/month for storage (first 50 TB)
- **DynamoDB**: Free tier covers state locking (25 GB storage, 25 RCU/WCU)
- **Total**: Essentially free for this project
