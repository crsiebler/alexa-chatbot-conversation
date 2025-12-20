# Terraform Backend Configuration
# 
# This configures Terraform to store state in S3 with DynamoDB locking.
# 
# BOOTSTRAP INSTRUCTIONS:
# 1. First deployment: Keep this file commented out
# 2. Run: terraform init && terraform apply (creates S3 bucket and DynamoDB table)
# 3. Uncomment the backend configuration below
# 4. Run: terraform init -migrate-state (migrates local state to S3)
# 5. All subsequent runs will use remote state

# terraform {
#   backend "s3" {
#     bucket         = "alexa-chatbot-terraform-state-981374387644"
#     key            = "terraform.tfstate"
#     region         = "us-west-2"
#     encrypt        = true
#     dynamodb_table = "alexa-chatbot-terraform-lock"
#   }
# }
