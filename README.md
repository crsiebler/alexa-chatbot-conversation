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
- 🔄 Automatic deployment via GitHub Actions
- 🎯 Context-aware responses
- ⚡ Fast response times with optimized token usage

## Prerequisites

- Node.js 18.x or higher
- AWS Account with Lambda access
- OpenAI API key
- Amazon Developer Account (for Alexa Skills)

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

Copy the example environment file and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env` and add:
- `OPENAI_API_KEY`: Your OpenAI API key
- `AWS_REGION`: Your preferred AWS region (default: us-east-1)
- AWS credentials for initial setup

### 4. Deploy to AWS Lambda

Run the setup script to create the Lambda function and necessary AWS resources:

```bash
./scripts/setup-aws.sh
```

This script will:
- Create an IAM role for Lambda execution
- Package your code and dependencies
- Create/update the Lambda function
- Configure Alexa Skills Kit trigger
- Output the Lambda ARN for your Alexa skill

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

## GitHub Actions Deployment

### Setting up CI/CD

1. Go to your GitHub repository settings
2. Navigate to "Secrets and variables" → "Actions"
3. Add the following secrets:
   - `AWS_ACCESS_KEY_ID`: Your AWS access key
   - `AWS_SECRET_ACCESS_KEY`: Your AWS secret key
   - `AWS_REGION`: Your AWS region (e.g., us-east-1)
   - `OPENAI_API_KEY`: Your OpenAI API key

### Automatic Deployment

Every push to the `main` branch will automatically:
1. Install dependencies
2. Create a deployment package
3. Update the Lambda function code
4. Update environment variables
5. Publish a new version

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
│       └── deploy.yml           # GitHub Actions workflow
├── lambda/
│   └── index.js                 # Lambda function handler
├── skill-package/
│   ├── skill.json               # Skill manifest
│   └── interactionModels/
│       └── custom/
│           └── en-US.json       # Interaction model
├── scripts/
│   └── setup-aws.sh             # AWS setup script
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore file
├── package.json                 # Node.js dependencies
└── README.md                    # This file
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
- Uses GPT-3.5-turbo for fast, cost-effective responses
- Configured with 150 max tokens and 0.7 temperature

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
