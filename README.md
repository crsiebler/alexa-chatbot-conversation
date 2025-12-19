# Alexa ChatGPT Conversation Skill

Utilize Amazon Alexa devices to interface with ChatGPT Conversations. This skill enables natural, multi-turn conversations with ChatGPT through your Alexa device.

## Architecture

```
Alexa Device
   ↓
Alexa Skill (ASK SDK)
   ↓
AWS Lambda (Node.js)
   ↓
OpenAI Chat Completions API
   ↓
Alexa speaks response
```

## Deployment Strategy

```
GitHub (main branch)
   ↓
GitHub Actions
   ↓
AWS Lambda (Node.js)
   ↓
Alexa Skill (ARN endpoint)
```

## Features

- 🗣️ Natural conversation with ChatGPT through Alexa
- 💬 Multi-turn dialogue support with conversation history
- 🔄 Automatic deployment via GitHub Actions with Terraform
- 🎯 Context-aware responses
- ⚡ Fast response times with optimized token usage
- 🏗️ Infrastructure as Code with Terraform for reliable, repeatable deployments
- 🔒 Secure IAM role management with least-privilege principles

## Prerequisites

- Node.js 18.x or higher
- AWS Account with appropriate permissions
- OpenAI API key
- Amazon Developer Account (for Alexa Skills)
- [Terraform](https://www.terraform.io/downloads) >= 1.0 (for local deployment)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/crsiebler/alexa-chatbot-conversation.git
cd alexa-chatbot-conversation
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

For local Terraform deployment, copy the example variables file:

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars` with your actual values:
- `openai_api_key`: Your OpenAI API key (required)
- `aws_region`: Your preferred AWS region (default: us-east-1)

Optional OpenAI configuration:
- `openai_model`: ChatGPT model to use (default: gpt-3.5-turbo)
- `max_tokens`: Maximum response length (default: 150)
- `temperature`: Response creativity 0.0-1.0 (default: 0.7)

**Note**: `terraform.tfvars` is gitignored and should never be committed.

### 4. Deploy to AWS Lambda with Terraform

#### Option A: Local Deployment

Install [Terraform](https://www.terraform.io/downloads) and deploy:

```bash
cd terraform
terraform init
terraform plan
terraform apply
```

After deployment, Terraform outputs the Lambda ARN:
```
lambda_function_arn = "arn:aws:lambda:us-east-1:123456789012:function:alexa-chatbot-conversation"
```

#### Option B: Automated Deployment via GitHub Actions

Configure GitHub Secrets (see CI/CD section below), then push to the `main` branch. The Terraform workflow will automatically deploy all infrastructure.

### 5. Create Alexa Skill

1. Go to [Alexa Developer Console](https://developer.amazon.com/alexa/console/ask)
2. Click "Create Skill"
3. Choose:
   - Skill name: "ChatGPT Conversation"
   - Primary locale: English (US)
   - Model: Custom
   - Hosting: Provision your own
4. Click "Create skill"

### 6. Configure Skill

#### Upload Skill Package (Option 1)
1. In the Alexa Developer Console, go to "Build" tab
2. Click "Interaction Model" → "JSON Editor"
3. Copy the contents of `skill-package/interactionModels/custom/en-US.json`
4. Paste and save

#### Manual Configuration (Option 2)
1. Set invocation name: "chat conversation"
2. Create a custom intent named "ChatIntent" with:
   - Slot name: `message`
   - Slot type: `AMAZON.SearchQuery`
   - Sample utterances (from the interaction model)

### 7. Set Lambda Endpoint

1. In the Alexa Developer Console, go to "Endpoint"
2. Choose "AWS Lambda ARN"
3. Paste the Lambda ARN from step 4
4. Click "Save Endpoints"

### 8. Build and Test

1. Click "Build Model" in the Alexa Developer Console
2. Go to the "Test" tab
3. Enable testing for "Development"
4. Try these test phrases:
   - "Open chat conversation"
   - "Tell me a joke"
   - "What is the capital of France?"

## GitHub Actions CI/CD

### Setting up Automated Deployment

The repository includes a Terraform-based CI/CD pipeline that deploys on every push to `main`.

1. Go to your GitHub repository settings
2. Navigate to "Secrets and variables" → "Actions"
3. Add the following secrets:
   - `AWS_ACCESS_KEY_ID`: Your AWS access key
   - `AWS_SECRET_ACCESS_KEY`: Your AWS secret key
   - `AWS_REGION`: Your AWS region (e.g., us-east-1)
   - `OPENAI_API_KEY`: Your OpenAI API key

Optional secrets for customization:
   - `OPENAI_MODEL`: ChatGPT model (default: gpt-3.5-turbo)
   - `MAX_TOKENS`: Max response tokens (default: 150)
   - `TEMPERATURE`: Response creativity (default: 0.7)

### Automatic Deployment

Every push to the `main` branch will automatically:
1. Install npm dependencies
2. Initialize Terraform
3. Plan infrastructure changes
4. Apply changes to AWS (Lambda function, IAM role, permissions)
5. Output the Lambda ARN

The Terraform workflow is idempotent and safe to run multiple times.

## Usage

### Starting a Conversation

"Alexa, open chat conversation"

### Asking Questions

- "Tell me a joke"
- "What is artificial intelligence?"
- "How do I bake a cake?"
- "Explain quantum physics"

### Continuing the Conversation

The skill maintains context within a session, so you can ask follow-up questions:

- User: "Tell me about dogs"
- Alexa: [responds about dogs]
- User: "What about cats?"
- Alexa: [responds about cats, understanding the context]

## Project Structure

```
alexa-chatbot-conversation/
├── .github/
│   └── workflows/
│       └── terraform-deploy.yml     # Terraform CI/CD workflow
├── lambda/
│   └── index.js                     # Lambda function handler
├── skill-package/
│   ├── skill.json                   # Skill manifest
│   ├── README.md                    # Configuration guide
│   └── interactionModels/
│       └── custom/
│           └── en-US.json           # Interaction model
├── terraform/
│   ├── main.tf                      # Terraform provider config
│   ├── variables.tf                 # Input variables
│   ├── outputs.tf                   # Output values
│   ├── lambda.tf                    # Lambda & IAM resources
│   ├── terraform.tfvars.example     # Example variables
│   └── README.md                    # Terraform documentation
├── scripts/
│   └── setup-aws.sh                 # Legacy bash setup script
├── .env.example                     # Environment variables template
├── .gitignore                       # Git ignore file
├── package.json                     # Node.js dependencies
└── README.md                        # This file
```

## Lambda Function Details

The Lambda function (`lambda/index.js`) includes:

- **LaunchRequestHandler**: Welcomes users when they open the skill
- **ChatIntentHandler**: Processes user messages and queries ChatGPT
- **HelpIntentHandler**: Provides help information
- **CancelAndStopIntentHandler**: Handles exit requests
- **FallbackIntentHandler**: Handles unrecognized inputs
- **SessionEndedRequestHandler**: Cleans up when session ends
- **ErrorHandler**: Handles errors gracefully

### Conversation Management

- Maintains up to 10 messages in conversation history
- Automatically truncates older messages to prevent token limits
- Uses GPT-3.5-turbo by default (configurable via `OPENAI_MODEL`)
- Configurable response parameters via environment variables
- Lazy initialization of OpenAI client for better cold-start performance

## Troubleshooting

### Lambda Errors

Check CloudWatch Logs:
```bash
aws logs tail /aws/lambda/alexa-chatbot-conversation --follow
```

### OpenAI API Issues

- Verify your API key is valid
- Check your OpenAI account has available credits
- Ensure the Lambda function has the correct environment variable

### Alexa Skill Issues

- Verify the Lambda ARN is correctly set in the Alexa Developer Console
- Ensure the Lambda function has Alexa trigger permission
- Check that the interaction model is built successfully

## Cost Considerations

- **AWS Lambda**: Free tier includes 1M requests/month
- **OpenAI API**: Pay per token usage (GPT-3.5-turbo is ~$0.002 per 1K tokens)
- **Alexa Skills**: Free to develop and publish
- **Terraform State**: Consider using S3 backend (pennies per month)

## Infrastructure Management

This project uses **Terraform** for infrastructure as code. Benefits include:

- **Declarative Configuration**: Define desired state, not imperative steps
- **Version Control**: Track infrastructure changes in Git
- **Idempotent**: Safe to run multiple times
- **State Management**: Tracks actual vs. desired infrastructure
- **Collaboration**: Team members can review infrastructure changes in PRs

### Legacy Bash Script

The `scripts/setup-aws.sh` file is kept for reference but is deprecated. Use Terraform instead for:
- Better state tracking
- Easier rollback
- More reliable deployments
- Proper IAM management

## Security Notes

- Store sensitive credentials in GitHub Secrets, not in code
- The Lambda function only accepts requests from Alexa Skills Kit
- Environment variables are encrypted at rest in AWS Lambda
- Never commit `.env` file to version control

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

ISC

## Support

For issues and questions:
- Check the [Alexa Skills Kit documentation](https://developer.amazon.com/en-US/docs/alexa/ask-overviews/what-is-the-alexa-skills-kit.html)
- Review [OpenAI API documentation](https://platform.openai.com/docs/)
- Open an issue in this repository
