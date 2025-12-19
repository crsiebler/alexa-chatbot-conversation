const Alexa = require('ask-sdk-core');
const OpenAI = require('openai');

// Session attributes keys
const CONVERSATION_HISTORY_KEY = 'conversationHistory';

// Initialize OpenAI client lazily
let openai = null;
function getOpenAIClient() {
    if (!openai) {
        openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
    }
    return openai;
}

// Launch Request Handler
const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'Welcome to ChatGPT Conversation! You can ask me anything, and I\'ll use ChatGPT to respond. What would you like to talk about?';
        
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('What would you like to ask?')
            .getResponse();
    }
};

// Chat Intent Handler
const ChatIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ChatIntent';
    },
    async handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const userMessage = Alexa.getSlotValue(handlerInput.requestEnvelope, 'message');
        
        // Initialize or retrieve conversation history
        let conversationHistory = sessionAttributes[CONVERSATION_HISTORY_KEY] || [];
        
        // Add user message to history
        conversationHistory.push({
            role: 'user',
            content: userMessage
        });
        
        try {
            // Call OpenAI Chat Completions API
            const completion = await getOpenAIClient().chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: conversationHistory,
                max_tokens: 150,
                temperature: 0.7
            });
            
            const assistantMessage = completion.choices[0].message.content;
            
            // Add assistant response to history
            conversationHistory.push({
                role: 'assistant',
                content: assistantMessage
            });
            
            // Keep only last 10 messages to prevent token limit issues
            if (conversationHistory.length > 10) {
                conversationHistory = conversationHistory.slice(-10);
            }
            
            // Save conversation history
            sessionAttributes[CONVERSATION_HISTORY_KEY] = conversationHistory;
            handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
            
            return handlerInput.responseBuilder
                .speak(assistantMessage)
                .reprompt('Do you have another question?')
                .getResponse();
                
        } catch (error) {
            console.error('OpenAI API Error:', error);
            const errorMessage = 'Sorry, I encountered an error while processing your request. Please try again.';
            
            return handlerInput.responseBuilder
                .speak(errorMessage)
                .reprompt('Would you like to try asking something else?')
                .getResponse();
        }
    }
};

// Help Intent Handler
const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'You can ask me any question, and I\'ll use ChatGPT to provide an answer. For example, you can say: tell me a joke, or what is the capital of France? What would you like to know?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('What would you like to ask?')
            .getResponse();
    }
};

// Cancel and Stop Intent Handler
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Goodbye! Thanks for chatting with me.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

// Fallback Intent Handler
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Sorry, I didn\'t understand that. You can ask me any question. What would you like to know?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('What would you like to ask?')
            .getResponse();
    }
};

// Session Ended Request Handler
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        return handlerInput.responseBuilder.getResponse();
    }
};

// Generic Error Handler
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.error(`Error handled: ${error.message}`);
        console.error(`Error stack: ${error.stack}`);
        
        const speakOutput = 'Sorry, I had trouble doing what you asked. Please try again.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('Please try again.')
            .getResponse();
    }
};

// Lambda Handler
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        ChatIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler
    )
    .addErrorHandlers(ErrorHandler)
    .lambda();
