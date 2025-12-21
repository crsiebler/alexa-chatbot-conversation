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
GitHub Actions (CI/CD)
   ├─ Terraform → AWS Lambda (Node.js)
   └─ ASK CLI → Alexa Skill (manifest + interaction model)
```

**Hybrid Approach**: Terraform manages AWS infrastructure (Lambda, IAM), ASK CLI manages Alexa skill configuration. Both deploy automatically on push to `main`.

## Features

- 🗣️ Natural conversation with ChatGPT through Alexa
- 💬 Multi-turn dialogue support with conversation history
- 🔄 Automatic deployment via GitHub Actions with Terraform
- 🎯 Context-aware responses
- ⚡ Fast response times with optimized token usage
- 🏗️ Infrastructure as Code with Terraform for reliable, repeatable deployments
- 🔒 Secure IAM role management with least-privilege principles
- 🧩 Modular architecture with dependency injection for easy testing
- ✅ Comprehensive unit and integration tests
- 🚀 Latest Node.js 20.x runtime for optimal performance

## Prerequisites

- Node.js 20.x (specified in `.nvmrc`)
- AWS Account with appropriate permissions
- OpenAI API key
- Amazon Developer Account (for Alexa Skills)
- [Terraform](https://www.terraform.io/downloads) >= 1.0 (for local deployment)
- [ASK CLI](https://developer.amazon.com/en-US/docs/alexa/smapi/quick-start-alexa-skills-kit-command-line-interface.html) (for local skill deployment)

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
1. Set invocation name: "chat bot"
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
   - "Open chat bot"
   - "Tell me a joke"
   - "What is the capital of France?"

## NPM Scripts

Convenient commands for development and deployment:

### Testing
```bash
npm test                  # Run all tests
npm run test:watch        # Run tests in watch mode
npm run test:coverage     # Generate coverage report
```

### Skill Deployment
```bash
npm run deploy:skill      # Deploy skill manifest + interaction model
npm run deploy:skill-only # Deploy skill manifest only
npm run deploy:model      # Deploy interaction model only
npm run skill:dialog      # Interactive testing in terminal
npm run skill:validate    # Check skill for certification issues
npm run skill:status      # View skill deployment status
```

### Terraform (Local)
```bash
npm run tf:init          # Initialize Terraform
npm run tf:plan          # Preview infrastructure changes
npm run tf:apply         # Apply infrastructure changes
npm run tf:destroy       # Tear down infrastructure
```

## GitHub Actions CI/CD

### Setting up Automated Deployment

The repository includes a Terraform-based CI/CD pipeline that deploys on every push to `main`.

1. Go to your GitHub repository settings
2. Navigate to "Secrets and variables" → "Actions"
3. Add the following secrets:

**AWS Credentials:**
   - `AWS_ACCESS_KEY_ID`: Your AWS access key
   - `AWS_SECRET_ACCESS_KEY`: Your AWS secret key
   - `AWS_REGION`: Your AWS region (e.g., us-west-2)

**OpenAI:**
   - `OPENAI_API_KEY`: Your OpenAI API key

**ASK CLI (for automated skill deployment):**
   - `ASK_ACCESS_TOKEN`: From `~/.ask/cli_config`
   - `ASK_REFRESH_TOKEN`: From `~/.ask/cli_config`
   - `ASK_VENDOR_ID`: From `~/.ask/cli_config`

Optional secrets for customization:
   - `OPENAI_MODEL`: ChatGPT model (default: gpt-3.5-turbo)
   - `MAX_TOKENS`: Max response tokens (default: 150)
   - `TEMPERATURE`: Response creativity (default: 0.7)

**Note**: See [docs/ASK_CLI_SETUP.md](docs/ASK_CLI_SETUP.md) for detailed ASK CLI authentication setup.

### Automatic Deployment

Every push to the `main` branch will automatically:

**Infrastructure (Terraform):**
1. Install Lambda dependencies (`npm ci --production`)
2. Initialize Terraform (with S3 remote state backend)
3. Import existing resources (bootstrap phase)
4. Plan infrastructure changes
5. Apply changes to AWS (Lambda function, IAM role, S3 bucket, DynamoDB table)
6. Capture Lambda ARN

**Skill Configuration (ASK CLI):**
7. Install ASK CLI
8. Configure credentials from GitHub Secrets
9. Update skill manifest with Lambda ARN
10. Deploy skill manifest and interaction model to Alexa

The workflow is idempotent and safe to run multiple times. Terraform uses S3 for remote state storage with DynamoDB locking for team collaboration.

## Usage

### Starting a Conversation

"Alexa, open chat bot"

Alexa will respond with "Go ahead." and wait for your question.

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
│   ├── copilot-instructions.md      # AI coding instructions
│   └── workflows/
│       └── terraform-deploy.yml     # Terraform + ASK CLI CI/CD workflow
├── .ask/
│   └── ask-states.json              # ASK CLI state (skill ID)
├── lambda/
│   ├── index.js                     # Lambda entry point
│   └── src/
│       ├── DependencyContainer.js   # Dependency injection container
│       ├── handlers/                # Alexa request handlers
│       │   ├── LaunchRequestHandler.js
│       │   ├── ChatIntentHandler.js
│       │   ├── HelpIntentHandler.js
│       │   ├── CancelAndStopIntentHandler.js
│       │   ├── FallbackIntentHandler.js
│       │   ├── SessionEndedRequestHandler.js
│       │   └── ErrorHandler.js
│       ├── services/                # Business logic
│       │   └── ConversationService.js
│       └── repositories/            # Data access layer
│           └── OpenAIRepository.js
├── tests/
│   ├── unit/                        # Unit tests
│   │   └── ConversationService.test.js
│   └── integration/                 # Integration tests
│       └── lambda.test.js
├── skill-package/
│   ├── skill.json                   # Skill manifest
│   ├── README.md                    # Configuration guide
│   └── interactionModels/
│       └── custom/
│           └── en-US.json           # Interaction model
├── terraform/
│   ├── main.tf                      # Terraform provider config
│   ├── backend.tf                   # S3 remote state configuration
│   ├── variables.tf                 # Input variables
│   ├── outputs.tf                   # Output values
│   ├── lambda.tf                    # Lambda & IAM resources
│   ├── state-infrastructure.tf      # S3 bucket & DynamoDB table for state
│   ├── terraform.tfvars.example     # Example variables
│   └── README.md                    # Terraform documentation
├── docs/
│   ├── ASK_CLI_SETUP.md             # ASK CLI authentication guide
│   ├── REMOTE_STATE_SETUP.md        # Terraform remote state setup
│   └── FUTURE_ENHANCEMENTS.md       # Future feature documentation
├── skill-package/
│   └── assets/
│       └── images/
│           ├── small-icon.png       # 108x108 skill icon
│           └── large-icon.png       # 512x512 skill icon
├── ask-resources.json               # ASK CLI project configuration
├── .nvmrc                           # Node.js version specification
├── .env.example                     # Environment variables template
├── .gitignore                       # Git ignore file
├── package.json                     # Node.js dependencies
└── README.md                        # This file
```

## Lambda Function Architecture

The Lambda function uses a modular, testable architecture with dependency injection:

### Core Components

- **DependencyContainer**: Manages dependency injection and service creation
- **Handlers**: Individual handler classes for each Alexa request type
- **ConversationService**: Business logic for managing conversations
- **OpenAIRepository**: Data access layer for OpenAI API calls

### Design Patterns

- **Dependency Injection**: All dependencies injected through the container
- **Repository Pattern**: OpenAI API calls abstracted behind repository interface
- **Single Responsibility**: Each handler/service has one clear purpose
- **Testability**: All components can be unit tested with mocked dependencies

### Request Handlers

- **LaunchRequestHandler**: Responds with "Go ahead." when users open the skill
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
- OpenAI client injected as dependency for easy testing

## Testing

The project includes comprehensive unit and integration tests using Jest.

### Running Tests

```bash
npm test
```

### Test Structure

- **Unit Tests** (`tests/unit/`): Test individual components with mocked dependencies
  - `ConversationService.test.js`: Tests conversation logic and history management
  
- **Integration Tests** (`tests/integration/`): Test Lambda handler with actual Alexa events
  - `lambda.test.js`: Tests complete request/response flow for all intents

### Local Testing

You can test the Lambda function locally by calling it directly:

```javascript
const { handler } = require('./lambda/index');

// Create a mock Alexa LaunchRequest event
const event = {
  version: '1.0',
  session: { /* ... */ },
  request: {
    type: 'LaunchRequest',
    // ...
  }
};

// Invoke the handler
handler(event, {}, (error, response) => {
  console.log(response);
});
```

### Test Coverage

Run tests with coverage:

```bash
npm test -- --coverage
```

Coverage reports are generated in the `coverage/` directory.

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
- **S3 Remote State**: Minimal cost (~$0.02/month for state storage)
- **DynamoDB State Lock**: Free tier covers typical usage (25 GB storage, 25 WCU/RCU)

## Infrastructure Management

This project uses **Terraform with S3 remote state backend** for infrastructure as code. Benefits include:

- **Declarative Configuration**: Define desired state, not imperative steps
- **Version Control**: Track infrastructure changes in Git
- **Idempotent**: Safe to run multiple times
- **Remote State**: S3 backend with DynamoDB locking for team collaboration
- **State Persistence**: CI/CD pipeline maintains state between deployments
- **Collaboration**: Team members can review infrastructure changes in PRs

### Remote State Setup

The project uses S3 for Terraform state storage:
- **Bucket**: `alexa-chatbot-terraform-state-981374387644`
- **DynamoDB Lock Table**: `alexa-chatbot-terraform-lock`
- **Encryption**: AES256 server-side encryption enabled
- **Versioning**: Enabled for state history and rollback capability

See [docs/REMOTE_STATE_SETUP.md](docs/REMOTE_STATE_SETUP.md) for bootstrap instructions.

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
