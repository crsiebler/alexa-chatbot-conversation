# Terraform State Storage Infrastructure
#
# This file defines the S3 bucket and DynamoDB table used for storing
# Terraform state remotely. These resources must exist BEFORE enabling
# the backend configuration in backend.tf.

resource "aws_s3_bucket" "terraform_state" {
  bucket = "alexa-chatbot-terraform-state-981374387644"

  tags = {
    Name        = "Terraform State Bucket"
    Application = "alexa-chatbot-conversation"
    ManagedBy   = "Terraform"
  }
}

resource "aws_s3_bucket_versioning" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_dynamodb_table" "terraform_lock" {
  name         = "alexa-chatbot-terraform-lock"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }

  tags = {
    Name        = "Terraform State Lock Table"
    Application = "alexa-chatbot-conversation"
    ManagedBy   = "Terraform"
  }
}
