const OpenAI = require('openai');
const OpenAIRepository = require('./repositories/OpenAIRepository');
const ConversationService = require('./services/ConversationService');
const ChatIntentHandler = require('./handlers/ChatIntentHandler');
const LaunchRequestHandler = require('./handlers/LaunchRequestHandler');
const HelpIntentHandler = require('./handlers/HelpIntentHandler');
const CancelAndStopIntentHandler = require('./handlers/CancelAndStopIntentHandler');
const FallbackIntentHandler = require('./handlers/FallbackIntentHandler');
const SessionEndedRequestHandler = require('./handlers/SessionEndedRequestHandler');
const ErrorHandler = require('./handlers/ErrorHandler');

/**
 * Dependency Injection Container
 * Creates and wires up all dependencies
 */
class DependencyContainer {
    constructor(config = {}) {
        this.config = {
            openaiApiKey: config.openaiApiKey || process.env.OPENAI_API_KEY,
            openaiModel: config.openaiModel || process.env.OPENAI_MODEL,
            maxTokens: config.maxTokens || process.env.MAX_TOKENS,
            temperature: config.temperature || process.env.TEMPERATURE
        };

        this.instances = {};
    }

    /**
     * Get or create OpenAI client
     */
    getOpenAIClient() {
        if (!this.instances.openaiClient) {
            this.instances.openaiClient = new OpenAI({
                apiKey: this.config.openaiApiKey
            });
        }
        return this.instances.openaiClient;
    }

    /**
     * Get or create OpenAI Repository
     */
    getOpenAIRepository() {
        if (!this.instances.openaiRepository) {
            this.instances.openaiRepository = new OpenAIRepository(
                this.getOpenAIClient()
            );
        }
        return this.instances.openaiRepository;
    }

    /**
     * Get or create Conversation Service
     */
    getConversationService() {
        if (!this.instances.conversationService) {
            this.instances.conversationService = new ConversationService(
                this.getOpenAIRepository()
            );
        }
        return this.instances.conversationService;
    }

    /**
     * Get all request handlers with dependencies injected
     */
    getRequestHandlers() {
        return [
            new LaunchRequestHandler(),
            new ChatIntentHandler(this.getConversationService()),
            new HelpIntentHandler(),
            new CancelAndStopIntentHandler(),
            new FallbackIntentHandler(),
            new SessionEndedRequestHandler()
        ];
    }

    /**
     * Get error handlers
     */
    getErrorHandlers() {
        return [
            new ErrorHandler()
        ];
    }
}

module.exports = DependencyContainer;
