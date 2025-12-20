variable "aws_region" {
  description = "AWS region for Lambda deployment"
  type        = string
  default     = "us-west-2"
}

variable "function_name" {
  description = "Name of the Lambda function"
  type        = string
  default     = "alexa-chatbot-conversation"
}

variable "lambda_runtime" {
  description = "Lambda runtime version"
  type        = string
  default     = "nodejs20.x"
}

variable "openai_api_key" {
  description = "OpenAI API key for ChatGPT integration"
  type        = string
  sensitive   = true
}

variable "openai_model" {
  description = "OpenAI model to use"
  type        = string
  default     = "gpt-3.5-turbo"
}

variable "max_tokens" {
  description = "Maximum tokens for OpenAI responses"
  type        = number
  default     = 150
}

variable "temperature" {
  description = "Temperature for OpenAI responses (0.0-1.0)"
  type        = number
  default     = 0.7
}

variable "lambda_timeout" {
  description = "Lambda function timeout in seconds"
  type        = number
  default     = 30
}

variable "lambda_memory_size" {
  description = "Lambda function memory size in MB"
  type        = number
  default     = 256
}
