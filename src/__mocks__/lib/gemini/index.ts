// Assuming a generic function, adjust if the actual client has specific exports
export const callGeminiApi = jest.fn().mockResolvedValue({ data: 'mock_gemini_response' });

// If it's a class:
// export const GeminiClient = jest.fn().mockImplementation(() => {
//   return {
//     generateContent: jest.fn().mockResolvedValue({ response: { text: () => 'mock_gemini_text' } })
//   };
// });
