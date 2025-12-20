const Alexa = require('ask-sdk-core');

/**
 * Cancel and Stop Intent Handler
 * Handles exit requests
 */
class CancelAndStopIntentHandler {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    }

    handle(handlerInput) {
        const speakOutput = 'Goodbye! Thanks for chatting with me.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
}

module.exports = CancelAndStopIntentHandler;
