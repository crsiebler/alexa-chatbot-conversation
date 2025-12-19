# IAM Role for Lambda Execution
resource "aws_iam_role" "lambda_execution_role" {
  name = "${var.function_name}-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = {
    Name        = "${var.function_name}-execution-role"
    Application = "alexa-chatbot-conversation"
    ManagedBy   = "Terraform"
  }
}

# Attach AWS Lambda Basic Execution Policy
resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  role       = aws_iam_role.lambda_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Data source to create deployment package
data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../lambda"
  output_path = "${path.module}/function.zip"
  excludes    = ["*.md"]
}

# Lambda Function
resource "aws_lambda_function" "alexa_chatbot" {
  filename         = data.archive_file.lambda_zip.output_path
  function_name    = var.function_name
  role            = aws_iam_role.lambda_execution_role.arn
  handler         = "index.handler"
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  runtime         = var.lambda_runtime
  timeout         = var.lambda_timeout
  memory_size     = var.lambda_memory_size

  environment {
    variables = {
      OPENAI_API_KEY = var.openai_api_key
      OPENAI_MODEL   = var.openai_model
      MAX_TOKENS     = tostring(var.max_tokens)
      TEMPERATURE    = tostring(var.temperature)
    }
  }

  tags = {
    Name        = var.function_name
    Application = "alexa-chatbot-conversation"
    ManagedBy   = "Terraform"
  }
}

# Lambda Permission for Alexa Skills Kit
resource "aws_lambda_permission" "alexa_skill_trigger" {
  statement_id  = "AllowExecutionFromAlexa"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.alexa_chatbot.function_name
  principal     = "alexa-appkit.amazon.com"
}
