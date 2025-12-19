# Terraform Infrastructure for Alexa ChatGPT Skill

This directory contains Terraform configurations to deploy and manage the AWS infrastructure for the Alexa ChatGPT Conversation Skill.

## What Gets Deployed

- **IAM Role**: Lambda execution role with CloudWatch Logs permissions
- **Lambda Function**: Node.js function with the Alexa Skill handler
- **Lambda Permission**: Allows Alexa Skills Kit to invoke the function
- **Environment Variables**: OpenAI API key and configuration

## Prerequisites

- [Terraform](https://www.terraform.io/downloads) >= 1.0
- AWS credentials configured (via environment variables or AWS CLI)
- OpenAI API key

## Local Deployment

### 1. Install Dependencies

First, install the Node.js dependencies in the project root:

```bash
cd ..
npm install
cd terraform
```

### 2. Configure Variables

Copy the example variables file and customize it:

```bash
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars` with your values:

```hcl
aws_region     = "us-east-1"
openai_api_key = "sk-your-actual-openai-key"
openai_model   = "gpt-3.5-turbo"
max_tokens     = 150
temperature    = 0.7
```

**Note**: Never commit `terraform.tfvars` to version control as it contains secrets.

### 3. Initialize Terraform

```bash
terraform init
```

### 4. Review the Plan

```bash
terraform plan
```

### 5. Apply Changes

```bash
terraform apply
```

After successful deployment, Terraform will output the Lambda function ARN:

```
lambda_function_arn = "arn:aws:lambda:us-east-1:123456789012:function:alexa-chatbot-conversation"
```

Copy this ARN and update `skill-package/skill.json` with it.

## GitHub Actions Deployment

The infrastructure is automatically deployed via GitHub Actions on every push to the `main` branch.

### Required GitHub Secrets

Configure these secrets in your repository settings:

- `AWS_ACCESS_KEY_ID`: Your AWS access key
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret key
- `AWS_REGION`: AWS region (e.g., `us-east-1`)
- `OPENAI_API_KEY`: Your OpenAI API key

Optional secrets:
- `OPENAI_MODEL`: Model to use (default: `gpt-3.5-turbo`)
- `MAX_TOKENS`: Maximum response tokens (default: `150`)
- `TEMPERATURE`: Response creativity (default: `0.7`)

## Managing Infrastructure

### Update Lambda Code

When you push changes to the `lambda/` directory, Terraform will automatically detect the changes and redeploy the function:

```bash
terraform plan  # Shows code changes
terraform apply # Deploys updated code
```

### Update Environment Variables

Modify `terraform.tfvars` or pass variables via command line:

```bash
terraform apply -var="openai_model=gpt-4"
```

### Destroy Infrastructure

To remove all resources:

```bash
terraform destroy
```

## Terraform State Management

By default, Terraform stores state locally in `terraform.tfstate`. For production use, consider using remote state storage:

### S3 Backend (Recommended)

Uncomment the backend configuration in `main.tf`:

```hcl
backend "s3" {
  bucket = "your-terraform-state-bucket"
  key    = "alexa-chatbot/terraform.tfstate"
  region = "us-east-1"
}
```

Then initialize with:

```bash
terraform init -migrate-state
```

## Terraform Commands Reference

- `terraform init` - Initialize Terraform and download providers
- `terraform fmt` - Format Terraform files
- `terraform validate` - Validate configuration syntax
- `terraform plan` - Preview changes
- `terraform apply` - Apply changes
- `terraform destroy` - Destroy all resources
- `terraform output` - Show output values
- `terraform state list` - List resources in state

## Troubleshooting

### Permission Denied

Ensure your AWS credentials have the following permissions:
- `iam:CreateRole`, `iam:AttachRolePolicy`
- `lambda:CreateFunction`, `lambda:UpdateFunctionCode`, `lambda:AddPermission`
- `logs:CreateLogGroup` (via attached policy)

### Lambda Deployment Package Too Large

If you get a size error, the deployment package (including node_modules) is too large. Consider:
- Using Lambda Layers for dependencies
- Removing unused dependencies
- Using `npm install --production`

### State Locked

If Terraform state is locked (usually from interrupted apply):

```bash
terraform force-unlock <lock-id>
```

## Files

- `main.tf` - Terraform and provider configuration
- `variables.tf` - Input variable definitions
- `outputs.tf` - Output value definitions
- `lambda.tf` - Lambda function and IAM resources
- `terraform.tfvars.example` - Example variables file
- `terraform.tfvars` - Your actual variables (gitignored)
