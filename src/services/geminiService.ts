import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { GEMINI_CHAT_MODEL, TEAM_NAME } from '../constants';

// Ensure API_KEY is accessed correctly. This will be set in the environment.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("Gemini API Key not found. Please set the API_KEY environment variable.");
  // This error will be caught by the UI if initialization fails.
}

const ai = new GoogleGenAI({ apiKey: API_KEY! }); // Use non-null assertion as we check above.

const systemInstruction = `You are "Toasty", the official AI mascot for ${TEAM_NAME}, a passionate and friendly local soccer team. Your goal is to engage with fans, answer their questions about the team (you can be creative and make up fun, plausible details if you don't have specific info, always staying positive about ${TEAM_NAME}), share fun soccer facts, and generally build excitement. Keep your tone enthusiastic, positive, and suitable for all ages. When asked about specific match results or player stats not provided, you can say something like, "That's a great question! I'm still getting all the latest stats from the coach, but I can tell you ${TEAM_NAME} always plays with heart and a bit of sizzle!" or "While I don't have the exact numbers on that, I know every player gives 110% for ${TEAM_NAME}!". Be concise and conversational. Use emojis to add personality where appropriate, especially fire emojis 🔥.`;

const geminiService = {
  startChatSession: (): Chat => {
    if (!API_KEY) {
      throw new Error("Gemini API Key not configured.");
    }
    try {
      const chat: Chat = ai.chats.create({
        model: GEMINI_CHAT_MODEL,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7, // For creative but not too wild responses
        },
      });
      return chat;
    } catch (error) {
      console.error("Error creating chat session:", error);
      throw new Error("Could not initialize chat with Gemini. Please check API key and configuration.");
    }
  },

  sendMessageToChat: async (chat: Chat, message: string): Promise<string> => {
    if (!API_KEY) {
      throw new Error("Gemini API Key not configured.");
    }
    try {
      const response: GenerateContentResponse = await chat.sendMessage({ message });
      // The .text property directly provides the string output.
      return response.text;
    } catch (error) {
      console.error("Error sending message to Gemini:", error);
      // Provide a user-friendly error message
      if (error instanceof Error && error.message.includes('429')) {
         return "I'm a bit busy right now! Please try again in a moment. 🔥";
      }
      return "Sorry, I had a little hiccup trying to respond. Can you try asking something else?";
    }
  },

  generateText: async (prompt: string): Promise<string> => {
    if (!API_KEY) {
      throw new Error("Gemini API Key not configured.");
    }
    try {
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: GEMINI_CHAT_MODEL,
        contents: prompt,
        config: {
          systemInstruction: systemInstruction, // You can have a default or more general one here
          temperature: 0.7,
        }
      });
      return response.text;
    } catch (error) {
      console.error("Error generating text with Gemini:", error);
      throw new Error("Could not generate text from Gemini.");
    }
  }
};

export { geminiService };