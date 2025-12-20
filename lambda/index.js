const Alexa = require('ask-sdk-core');
const DependencyContainer = require('./src/DependencyContainer');

// Initialize dependency container
const container = new DependencyContainer();

// Export handler for AWS Lambda
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(...container.getRequestHandlers())
    .addErrorHandlers(...container.getErrorHandlers())
    .lambda();

// Export container for testing
exports.container = container;
