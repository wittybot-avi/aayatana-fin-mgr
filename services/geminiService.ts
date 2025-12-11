import { User } from "../types";
import { api } from "./api";

// Replaced direct Gemini usage with backend call to support architecture requirements
export const sendMessageToAgent = async (message: string, history: any[] = [], user?: User) => {
  try {
    const response = await api.post('/agent', {
        message,
        history,
        userId: user?.id
    });
    
    // The backend now returns { text, toolCalls }
    return response;

  } catch (error) {
    console.error("Agent Error:", error);
    return { text: "I encountered a connection error with the server.", toolCalls: [] };
  }
};
