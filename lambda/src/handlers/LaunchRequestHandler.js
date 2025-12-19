const Alexa = require('ask-sdk-core');

/**
 * Launch Request Handler
 * Handles the initial skill launch
 */
class LaunchRequestHandler {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    }

    handle(handlerInput) {
        const speakOutput = 'Welcome to ChatGPT Conversation! You can ask me anything, and I\'ll use ChatGPT to respond. What would you like to talk about?';
        
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('What would you like to ask?')
            .getResponse();
    }
}

module.exports = LaunchRequestHandler;
