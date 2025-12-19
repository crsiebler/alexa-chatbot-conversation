# Future Enhancement: Configurable OpenAI API Key via Alexa Skill

## Overview

Currently, the OpenAI API key is configured as an environment variable in the Lambda function. To make this more flexible and user-friendly, we can allow users to configure their own API key through the Alexa Skill interface.

## Implementation Approach

### 1. Use Account Linking

The most secure way is to implement Account Linking in the Alexa Skill:

```json
{
  "accountLinking": {
    "type": "AUTH_CODE",
    "authorizationUrl": "https://your-auth-server.com/authorize",
    "domains": ["your-domain.com"],
    "accessTokenUrl": "https://your-auth-server.com/token",
    "clientId": "your-client-id",
    "scopes": ["openai:apikey"],
    "accessTokenScheme": "HTTP_BASIC"
  }
}
```

### 2. Store API Key Securely

- Use AWS Secrets Manager or Parameter Store to store user-specific API keys
- Associate keys with Alexa user IDs
- Retrieve key in Lambda based on the user making the request

### 3. Modify DependencyContainer

Update the DependencyContainer to accept API key from Alexa session:

```javascript
class DependencyContainer {
    constructor(config = {}) {
        this.config = {
            openaiApiKey: config.openaiApiKey || 
                          config.userProvidedKey || 
                          process.env.OPENAI_API_KEY,
            // ... other config
        };
    }
}
```

### 4. Update Lambda Handler

Extract API key from account linking token or session attributes:

```javascript
exports.handler = async (event, context) => {
    // Extract user API key from account linking
    const accessToken = event.session?.user?.accessToken;
    let userApiKey = null;
    
    if (accessToken) {
        // Decrypt/retrieve user's API key from secure storage
        userApiKey = await getUserApiKey(accessToken);
    }
    
    // Create container with user-specific configuration
    const container = new DependencyContainer({
        openaiApiKey: userApiKey
    });
    
    return Alexa.SkillBuilders.custom()
        .addRequestHandlers(...container.getRequestHandlers())
        .addErrorHandlers(...container.getErrorHandlers())
        .lambda()(event, context);
};
```

## Benefits

- Users can use their own OpenAI API keys and billing
- No shared API key management needed
- Users control their own usage and costs
- More scalable for production deployment

## Alternative: Skill Configuration

A simpler approach using Alexa Skill Personalization:

1. User provides API key through Alexa app
2. Store in DynamoDB with user ID
3. Lambda retrieves from DynamoDB per request

## Implementation Status

This is a **future enhancement**. Current implementation uses environment variables for simplicity. The modular architecture with dependency injection makes this enhancement straightforward to implement when needed.

## Files to Modify

- `lambda/src/DependencyContainer.js` - Accept user-specific API key
- `lambda/index.js` - Extract and pass user API key
- `skill-package/skill.json` - Add account linking configuration
- Add AWS Secrets Manager or DynamoDB integration

## Testing

The current test structure already supports this through dependency injection:

```javascript
const container = new DependencyContainer({
    openaiApiKey: 'user-specific-key'
});
```
