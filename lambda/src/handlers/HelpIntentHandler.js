const Alexa = require('ask-sdk-core');

/**
 * Help Intent Handler
 * Provides help information to the user
 */
class HelpIntentHandler {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    }

    handle(handlerInput) {
        const speakOutput = 'You can ask me any question, and I\'ll use ChatGPT to provide an answer. For example, you can say: tell me a joke, or what is the capital of France? What would you like to know?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('What would you like to ask?')
            .getResponse();
    }
}

module.exports = HelpIntentHandler;
