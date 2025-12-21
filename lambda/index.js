const Alexa = require('ask-sdk-core');
const DependencyContainer = require('./src/DependencyContainer');

// Log environment configuration (excluding sensitive data)
console.log('Lambda initialized with config:', {
    hasOpenAIKey: !!process.env.OPENAI_API_KEY,
    openAIKeyLength: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0,
    model: process.env.OPENAI_MODEL || 'default',
    maxTokens: process.env.MAX_TOKENS || 'default',
    temperature: process.env.TEMPERATURE || 'default'
});

// Initialize dependency container
const container = new DependencyContainer();

// Export handler for AWS Lambda
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(...container.getRequestHandlers())
    .addErrorHandlers(...container.getErrorHandlers())
    .lambda();

// Export container for testing
exports.container = container;
