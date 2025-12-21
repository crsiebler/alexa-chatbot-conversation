# Terraform Backend Configuration
# 
# This configures Terraform to store state in S3 with DynamoDB locking.

terraform {
  backend "s3" {
    bucket         = "alexa-chatbot-terraform-state-981374387644"
    key            = "terraform.tfstate"
    region         = "us-west-2"
    encrypt        = true
    dynamodb_table = "alexa-chatbot-terraform-lock"
  }
}
