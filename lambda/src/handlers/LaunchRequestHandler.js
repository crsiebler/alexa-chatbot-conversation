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
        const speakOutput = 'Go ahead.';
        
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('Go ahead.')
            .getResponse();
    }
}

module.exports = LaunchRequestHandler;
