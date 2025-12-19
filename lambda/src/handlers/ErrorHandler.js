/**
 * Error Handler
 * Handles all errors gracefully
 */
class ErrorHandler {
    canHandle() {
        return true;
    }

    handle(handlerInput, error) {
        console.error(`Error handled: ${error.message}`);
        console.error(`Error stack: ${error.stack}`);
        
        const speakOutput = 'Sorry, I had trouble doing what you asked. Please try again.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('Please try again.')
            .getResponse();
    }
}

module.exports = ErrorHandler;
