const Alexa = require('ask-sdk-core');

/**
 * Fallback Intent Handler
 * Handles unrecognized inputs
 */
class FallbackIntentHandler {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    }

    handle(handlerInput) {
        const speakOutput = 'Sorry, I didn\'t understand that. You can ask me any question. What would you like to know?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('What would you like to ask?')
            .getResponse();
    }
}

module.exports = FallbackIntentHandler;
