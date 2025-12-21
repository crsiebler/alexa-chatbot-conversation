/**
 * OpenAI Repository
 * Handles all interactions with the OpenAI API using repository pattern
 */
class OpenAIRepository {
    /**
     * @param {Object} openaiClient - OpenAI client instance (injected dependency)
     */
    constructor(openaiClient) {
        this.client = openaiClient;
    }

    /**
     * Generate a chat completion based on conversation history
     * @param {Array} messages - Array of message objects with role and content
     * @param {Object} options - Configuration options (model, max_tokens, temperature)
     * @returns {Promise<string>} - The assistant's response
     */
    async getChatCompletion(messages, options = {}) {
        const {
            model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
            max_tokens = parseInt(process.env.MAX_TOKENS) || 150,
            temperature = parseFloat(process.env.TEMPERATURE) || 0.7
        } = options;

        console.log('OpenAI API Call:', {
            model,
            messageCount: messages.length,
            max_tokens,
            temperature
        });

        const completion = await this.client.chat.completions.create({
            model,
            messages,
            max_tokens,
            temperature
        });

        console.log('OpenAI Response:', {
            id: completion.id,
            model: completion.model,
            promptTokens: completion.usage?.prompt_tokens,
            completionTokens: completion.usage?.completion_tokens,
            totalTokens: completion.usage?.total_tokens
        });

        return completion.choices[0].message.content;
    }
}

module.exports = OpenAIRepository;
