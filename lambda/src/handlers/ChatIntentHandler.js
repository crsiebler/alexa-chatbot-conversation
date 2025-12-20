const Alexa = require('ask-sdk-core');

const CONVERSATION_HISTORY_KEY = 'conversationHistory';

/**
 * Chat Intent Handler
 * Handles user chat messages and integrates with ChatGPT
 */
class ChatIntentHandler {
    /**
     * @param {ConversationService} conversationService - Injected conversation service
     */
    constructor(conversationService) {
        this.conversationService = conversationService;
    }

    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ChatIntent';
    }

    async handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const userMessage = Alexa.getSlotValue(handlerInput.requestEnvelope, 'message');
        
        // Get existing conversation history
        const conversationHistory = sessionAttributes[CONVERSATION_HISTORY_KEY] || [];
        
        try {
            // Process message through conversation service
            const result = await this.conversationService.processMessage(userMessage, conversationHistory);
            
            // Save updated conversation history
            sessionAttributes[CONVERSATION_HISTORY_KEY] = result.conversationHistory;
            handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
            
            return handlerInput.responseBuilder
                .speak(result.response)
                .reprompt('Do you have another question?')
                .getResponse();
                
        } catch (error) {
            console.error('ChatIntent Error:', error);
            const errorMessage = 'Sorry, I encountered an error while processing your request. Please try again.';
            
            return handlerInput.responseBuilder
                .speak(errorMessage)
                .reprompt('Would you like to try asking something else?')
                .getResponse();
        }
    }
}

module.exports = ChatIntentHandler;
