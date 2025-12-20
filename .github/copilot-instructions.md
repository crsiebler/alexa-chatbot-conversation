# Alexa ChatGPT Conversation Skill - AI Coding Instructions

## Project Overview

This is an AWS Lambda-based Alexa skill that integrates with OpenAI's ChatGPT API, enabling natural conversations through Alexa devices. The architecture uses the ASK SDK and follows a clean dependency injection pattern.

**Key Flow**: Alexa Device → ASK SDK → Lambda Handler → ConversationService → OpenAIRepository → OpenAI API

**Deployment Status**: ✅ Fully automated CI/CD pipeline with Terraform + ASK CLI  
**Lambda ARN**: `arn:aws:lambda:us-west-2:981374387644:function:alexa-chatbot-conversation`  
**Runtime**: Node.js 20.x

## Architecture Patterns

### Dependency Injection Container

All dependencies are wired through [DependencyContainer.js](lambda/src/DependencyContainer.js). This is the single source of truth for object instantiation:

```javascript
// Never instantiate handlers directly - always use container
const container = new DependencyContainer(config);
const handlers = container.getRequestHandlers();
```

**When adding new handlers**: Register them in `getRequestHandlers()` with their injected dependencies.

### Repository Pattern for External APIs

External API calls go through repositories ([OpenAIRepository.js](lambda/src/repositories/OpenAIRepository.js)). This enables:
- Easy mocking in unit tests
- Centralized API configuration (model, tokens, temperature from env vars)
- Separation of business logic from API details

### Conversation State Management

Conversation history is stored in Alexa session attributes (key: `conversationHistory`). The [ConversationService](lambda/src/services/ConversationService.js) manages:
- History trimming (max 10 messages via `maxHistoryLength`)
- Message formatting for OpenAI API
- Context preservation across turns

**Important**: Session attributes are ephemeral - they reset when the session ends.

## Handler Structure

Handlers follow ASK SDK conventions with two required methods:

```javascript
canHandle(handlerInput) // Returns boolean
async handle(handlerInput) // Returns response
```

**Pattern**: All handlers extend the same structure and are registered in `lambda/index.js` via the container.

See examples in [lambda/src/handlers/](lambda/src/handlers/).

## Testing Conventions

### Unit Tests ([tests/unit/](tests/unit/))

- Mock external dependencies using Jest mocks
- Test services in isolation (see [ConversationService.test.js](tests/unit/ConversationService.test.js))
- Use `beforeEach` to reset mocks between tests

```javascript
// Standard mock pattern
mockOpenAIRepository = {
    getChatCompletion: jest.fn()
};
```

### Integration Tests ([tests/integration/](tests/integration/))

- Set environment variables before requiring the lambda module
- Test full Alexa request/response flow with mock events
- Use Lambda callback pattern: `handler(event, {}, (error, response) => ...)`

**Run tests**: `npm test` (uses Jest as configured in [package.json](package.json))

## Development Environment

- **Node.js Version**: 20.x (specified in [.nvmrc](.nvmrc) and [package.json](package.json))
- **Package Manager**: npm
- **Use nvm**: Run `nvm use` to switch to the correct Node version
- **AWS Region**: us-west-2 (configured in Terraform variables)

## Environment Variables

All OpenAI configuration comes from environment variables with defaults:

- `OPENAI_API_KEY` (required, no default)
- `OPENAI_MODEL` (default: `gpt-3.5-turbo`)
- `MAX_TOKENS` (default: `150`)
- `TEMPERATURE` (default: `0.7`)

**Set via Terraform**: These are configured in [terraform/lambda.tf](terraform/lambda.tf) environment block, sourced from variables.

## Infrastructure & Deployment

### Hybrid Deployment Architecture

The project uses a **two-stage deployment** approach:

1. **Terraform** → AWS Infrastructure (Lambda, IAM, permissions)
2. **ASK CLI** → Alexa Skill (interaction model, skill manifest, endpoint configuration)

This separation provides:
- Industry-standard IaC for AWS resources
- Automated Alexa skill deployment
- Full end-to-end CI/CD automation

### Terraform Structure

AWS infrastructure is managed by Terraform in [terraform/](terraform/):

- [lambda.tf](terraform/lambda.tf): Lambda function, IAM role, Alexa trigger permission
- [variables.tf](terraform/variables.tf): Configuration with sensible defaults
- [outputs.tf](terraform/outputs.tf): Exports Lambda ARN for Alexa skill configuration

**Deploy locally**: `terraform init && terraform plan && terraform apply` (from `terraform/` directory)

#### Lambda Packaging

Terraform automatically zips the `lambda/` directory (excluding `*.md` files) via `archive_file` data source. The package must include:
- `lambda/index.js` (entry point)
- `lambda/src/` (all source code)
- `node_modules/` (dependencies from `npm install`)

**Runtime**: Node.js 20.x as specified in `terraform/variables.tf`

### ASK CLI Structure

Alexa skill deployment is managed by ASK CLI:

- [ask-resources.json](ask-resources.json): ASK CLI project configuration
- [.ask/ask-states.json](.ask/ask-states.json): Deployment state (skill ID, hashes)
- [skill-package/](skill-package/): Skill manifest and interaction models

**Deploy locally**: `ask deploy` (after running `ask configure`)

**Setup guide**: See [docs/ASK_CLI_SETUP.md](docs/ASK_CLI_SETUP.md) for authentication and GitHub Secrets configuration

### CI/CD Pipeline

GitHub Actions automatically deploys on push to `main` in this order:

1. **Install dependencies** (`npm ci`)
2. **Terraform deploy** → Lambda function + IAM role
3. **Capture Lambda ARN** from Terraform output
4. **Update skill manifest** with Lambda ARN (via `jq`)
5. **ASK CLI deploy** → Alexa skill

See workflow at [.github/workflows/terraform-deploy.yml](.github/workflows/terraform-deploy.yml).

**Required GitHub Secrets**:
- AWS: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`
- OpenAI: `OPENAI_API_KEY`
- ASK CLI: `ASK_ACCESS_TOKEN`, `ASK_REFRESH_TOKEN`, `ASK_VENDOR_ID`, `ASK_SKILL_ID`

## Alexa Skill Configuration

The skill manifest and interaction model are in [skill-package/](skill-package/):

- **Invocation name**: "chat conversation"
- **Primary intent**: `ChatIntent` with `AMAZON.SearchQuery` slot named `message`
- **Endpoint**: Lambda ARN (auto-injected during CI/CD deployment)

**Key detail**: The `ChatIntent` uses `AMAZON.SearchQuery` slot type to capture free-form user input, enabling natural conversation.

**Deployment**: ASK CLI automatically deploys the skill on every push to `main`. No manual Alexa Developer Console interaction required after initial setup.

## Common Workflows

### Adding a New Intent

1. Create handler in `lambda/src/handlers/NewIntentHandler.js`
2. Implement `canHandle()` and `handle()` methods
3. Register in `DependencyContainer.getRequestHandlers()`
4. Add intent to [skill-package/interactionModels/custom/en-US.json](skill-package/interactionModels/custom/en-US.json)
5. Write unit tests mocking dependencies
6. Push to `main` - CI/CD will deploy both Lambda and skill

### Modifying OpenAI Behavior

1. Update defaults in `OpenAIRepository.getChatCompletion()` or
2. Change Terraform variables in `terraform.tfvars` (gitignored) or GitHub Secrets
3. Redeploy: Push to `main` or run `terraform apply` locally

### Setting Up ASK CLI (First Time)

1. Run `ask configure` locally to authenticate
2. Extract tokens from `~/.ask/cli_config`
3. Add GitHub Secrets: `ASK_ACCESS_TOKEN`, `ASK_REFRESH_TOKEN`, `ASK_VENDOR_ID`, `ASK_SKILL_ID`
4. See detailed guide: [docs/ASK_CLI_SETUP.md](docs/ASK_CLI_SETUP.md)

**Note**: All secrets are now configured and the full CI/CD pipeline is operational.

### Debugging Lambda Locally

1. Set environment variables in your shell or test file
2. Run tests: `npm test`
3. For integration tests, see mock Alexa events in [tests/integration/lambda.test.js](tests/integration/lambda.test.js)

**Note**: Integration tests do NOT call the real OpenAI API - mock the repository in unit tests for API testing.
