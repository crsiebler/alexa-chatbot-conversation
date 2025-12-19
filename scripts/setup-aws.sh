#!/bin/bash

# AWS Lambda Setup Script for Alexa ChatGPT Conversation Skill
# This script creates the necessary AWS resources for the Lambda function

set -e

echo "==================================="
echo "AWS Lambda Setup for Alexa Skill"
echo "==================================="

# Load environment variables from .env file if it exists
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Check required environment variables
if [ -z "$AWS_REGION" ]; then
    echo "Error: AWS_REGION not set"
    exit 1
fi

if [ -z "$OPENAI_API_KEY" ]; then
    echo "Error: OPENAI_API_KEY not set"
    exit 1
fi

FUNCTION_NAME=${LAMBDA_FUNCTION_NAME:-alexa-chatbot-conversation}
RUNTIME=${LAMBDA_RUNTIME:-nodejs18.x}
HANDLER="index.handler"

echo "Function Name: $FUNCTION_NAME"
echo "Region: $AWS_REGION"
echo ""

# Step 1: Create IAM role if it doesn't exist
echo "Step 1: Creating IAM role for Lambda..."

ROLE_NAME="lambda-alexa-execution-role"
TRUST_POLICY='{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}'

if aws iam get-role --role-name $ROLE_NAME 2>/dev/null; then
    echo "Role $ROLE_NAME already exists"
else
    aws iam create-role \
        --role-name $ROLE_NAME \
        --assume-role-policy-document "$TRUST_POLICY"
    
    # Attach basic Lambda execution policy
    aws iam attach-role-policy \
        --role-name $ROLE_NAME \
        --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
    
    echo "Waiting for role to be available..."
    sleep 10
fi

ROLE_ARN=$(aws iam get-role --role-name $ROLE_NAME --query 'Role.Arn' --output text)
echo "Role ARN: $ROLE_ARN"
echo ""

# Step 2: Build and package the Lambda function
echo "Step 2: Building Lambda deployment package..."

npm install --production

mkdir -p deploy
cp -r lambda/* deploy/
cp -r node_modules deploy/

cd deploy
zip -r ../function.zip . > /dev/null
cd ..
rm -rf deploy

echo "Deployment package created: function.zip"
echo ""

# Step 3: Create or update Lambda function
echo "Step 3: Creating/Updating Lambda function..."

if aws lambda get-function --function-name $FUNCTION_NAME 2>/dev/null; then
    echo "Updating existing function..."
    aws lambda update-function-code \
        --function-name $FUNCTION_NAME \
        --zip-file fileb://function.zip
    
    aws lambda update-function-configuration \
        --function-name $FUNCTION_NAME \
        --environment "Variables={OPENAI_API_KEY=$OPENAI_API_KEY,OPENAI_MODEL=${OPENAI_MODEL:-gpt-3.5-turbo},MAX_TOKENS=${MAX_TOKENS:-150},TEMPERATURE=${TEMPERATURE:-0.7}}" \
        --timeout 30 \
        --memory-size 256
else
    echo "Creating new function..."
    aws lambda create-function \
        --function-name $FUNCTION_NAME \
        --runtime $RUNTIME \
        --role $ROLE_ARN \
        --handler $HANDLER \
        --zip-file fileb://function.zip \
        --timeout 30 \
        --memory-size 256 \
        --environment "Variables={OPENAI_API_KEY=$OPENAI_API_KEY,OPENAI_MODEL=${OPENAI_MODEL:-gpt-3.5-turbo},MAX_TOKENS=${MAX_TOKENS:-150},TEMPERATURE=${TEMPERATURE:-0.7}}"
fi

echo ""

# Step 4: Add Alexa trigger permission
echo "Step 4: Adding Alexa Skills Kit trigger permission..."

aws lambda add-permission \
    --function-name $FUNCTION_NAME \
    --statement-id "alexa-skill-trigger" \
    --action "lambda:InvokeFunction" \
    --principal "alexa-appkit.amazon.com" \
    2>/dev/null || echo "Permission already exists"

echo ""

# Step 5: Get Lambda ARN
LAMBDA_ARN=$(aws lambda get-function --function-name $FUNCTION_NAME --query 'Configuration.FunctionArn' --output text)

echo "==================================="
echo "Setup Complete!"
echo "==================================="
echo ""
echo "Lambda Function ARN: $LAMBDA_ARN"
echo ""
echo "Next steps:"
echo "1. Copy the Lambda ARN above"
echo "2. Go to https://developer.amazon.com/alexa/console/ask"
echo "3. Create a new skill or update your existing skill"
echo "4. Set the endpoint to the Lambda ARN"
echo "5. Build and test your skill"
echo ""
echo "GitHub Secrets needed for CI/CD:"
echo "  - AWS_ACCESS_KEY_ID"
echo "  - AWS_SECRET_ACCESS_KEY"
echo "  - AWS_REGION: $AWS_REGION"
echo "  - OPENAI_API_KEY"
echo ""
