const DependencyContainer = require('../../lambda/src/DependencyContainer');
const ConversationService = require('../../lambda/src/services/ConversationService');

describe('ConversationService', () => {
    let mockOpenAIRepository;
    let conversationService;

    beforeEach(() => {
        // Mock OpenAI Repository
        mockOpenAIRepository = {
            getChatCompletion: jest.fn()
        };
        conversationService = new ConversationService(mockOpenAIRepository);
    });

    describe('processMessage', () => {
        it('should process a message and return response with updated history', async () => {
            const mockResponse = 'This is a test response';
            mockOpenAIRepository.getChatCompletion.mockResolvedValue(mockResponse);

            const result = await conversationService.processMessage('Hello', []);

            expect(result).toHaveProperty('response', mockResponse);
            expect(result).toHaveProperty('conversationHistory');
            expect(result.conversationHistory).toHaveLength(2);
            expect(result.conversationHistory[0]).toEqual({
                role: 'user',
                content: 'Hello'
            });
            expect(result.conversationHistory[1]).toEqual({
                role: 'assistant',
                content: mockResponse
            });
        });

        it('should maintain existing conversation history', async () => {
            const existingHistory = [
                { role: 'user', content: 'Previous message' },
                { role: 'assistant', content: 'Previous response' }
            ];
            mockOpenAIRepository.getChatCompletion.mockResolvedValue('New response');

            const result = await conversationService.processMessage('New message', existingHistory);

            expect(result.conversationHistory).toHaveLength(4);
            expect(result.conversationHistory[0]).toEqual(existingHistory[0]);
        });

        it('should trim history when exceeding max length', async () => {
            const longHistory = Array.from({ length: 10 }, (_, i) => ({
                role: i % 2 === 0 ? 'user' : 'assistant',
                content: `Message ${i}`
            }));
            mockOpenAIRepository.getChatCompletion.mockResolvedValue('Response');

            const result = await conversationService.processMessage('New message', longHistory);

            expect(result.conversationHistory.length).toBeLessThanOrEqual(10);
        });

        it('should throw error when OpenAI fails', async () => {
            mockOpenAIRepository.getChatCompletion.mockRejectedValue(new Error('API Error'));

            await expect(
                conversationService.processMessage('Hello', [])
            ).rejects.toThrow('API Error');
        });
    });

    describe('trimHistory', () => {
        it('should not trim history below max length', () => {
            const history = [
                { role: 'user', content: 'Message 1' },
                { role: 'assistant', content: 'Response 1' }
            ];

            const result = conversationService.trimHistory(history);

            expect(result).toHaveLength(2);
            expect(result).toEqual(history);
        });

        it('should trim history to max length', () => {
            const history = Array.from({ length: 15 }, (_, i) => ({
                role: i % 2 === 0 ? 'user' : 'assistant',
                content: `Message ${i}`
            }));

            const result = conversationService.trimHistory(history);

            expect(result).toHaveLength(10);
            expect(result[0].content).toBe('Message 5');
        });
    });
});
