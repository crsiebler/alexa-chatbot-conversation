output "lambda_function_arn" {
  description = "ARN of the Lambda function for Alexa Skill configuration"
  value       = aws_lambda_function.alexa_chatbot.arn
}

output "lambda_function_name" {
  description = "Name of the Lambda function"
  value       = aws_lambda_function.alexa_chatbot.function_name
}

output "lambda_function_invoke_arn" {
  description = "Invoke ARN of the Lambda function"
  value       = aws_lambda_function.alexa_chatbot.invoke_arn
}

output "iam_role_arn" {
  description = "ARN of the IAM role for Lambda execution"
  value       = aws_iam_role.lambda_execution_role.arn
}
