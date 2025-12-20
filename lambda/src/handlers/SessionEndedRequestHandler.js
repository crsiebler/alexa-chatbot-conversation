const Alexa = require('ask-sdk-core');

/**
 * Session Ended Request Handler
 * Handles session cleanup
 */
class SessionEndedRequestHandler {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    }

    handle(handlerInput) {
        console.log(`Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        return handlerInput.responseBuilder.getResponse();
    }
}

module.exports = SessionEndedRequestHandler;
