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
        console.log('ChatIntent: Starting handler');
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const userMessage = Alexa.getSlotValue(handlerInput.requestEnvelope, 'message');
        
        console.log('ChatIntent: User message:', userMessage);
        
        // Get existing conversation history
        const conversationHistory = sessionAttributes[CONVERSATION_HISTORY_KEY] || [];
        
        console.log('ChatIntent: Conversation history length:', conversationHistory.length);
        
        try {
            // Process message through conversation service
            console.log('ChatIntent: Calling conversation service');
            const result = await this.conversationService.processMessage(userMessage, conversationHistory);
            
            console.log('ChatIntent: Received response from OpenAI');
            
            // Save updated conversation history
            sessionAttributes[CONVERSATION_HISTORY_KEY] = result.conversationHistory;
            handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
            
            return handlerInput.responseBuilder
                .speak(result.response)
                .reprompt('Do you have another question?')
                .getResponse();
                
        } catch (error) {
            console.error('ChatIntent Error:', error);
            console.error('ChatIntent Error Stack:', error.stack);
            console.error('ChatIntent Error Message:', error.message);
            const errorMessage = 'Sorry, I encountered an error while processing your request. Please try again.';
            
            return handlerInput.responseBuilder
                .speak(errorMessage)
                .reprompt('Would you like to try asking something else?')
                .getResponse();
        }
    }
}

module.exports = ChatIntentHandler;
