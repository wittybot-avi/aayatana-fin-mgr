import { GoogleGenAI, Type } from "@google/genai";
import { db } from "./dataStore";
import { TransactionType, PaymentMode, User, PERMISSIONS } from "../types";

// Initialize Gemini Client
// NOTE: In a real app, API Key should not be exposed client-side. 
// This is for the demo/MVP environment where backend is not available.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Tool Definitions ---

const logTransactionTool = {
  name: "logTransaction",
  description: "Log a new financial transaction (inflow or outflow).",
  parameters: {
    type: Type.OBJECT,
    properties: {
      type: { type: Type.STRING, enum: ["INFLOW", "OUTFLOW"], description: "Type of transaction" },
      amount: { type: Type.NUMBER, description: "Amount in INR" },
      description: { type: Type.STRING, description: "Short description" },
      vendor: { type: Type.STRING, description: "Vendor name" },
      date: { type: Type.STRING, description: "YYYY-MM-DD" },
      categoryName: { type: Type.STRING, description: "Category (e.g. Travel, R&D)" },
      projectTag: { type: Type.STRING, description: "Project tag" }
    },
    required: ["type", "amount", "description"]
  }
};

const getBurnRateTool = {
  name: "getBurnRate",
  description: "Get current burn rate, runway, and cash balance.",
  parameters: { type: Type.OBJECT, properties: {} }
};

const getCategoryAnalysisTool = {
  name: "getCategoryAnalysis",
  description: "Get spending breakdown by category.",
  parameters: { type: Type.OBJECT, properties: {} }
};

const tools = [
    { functionDeclarations: [logTransactionTool, getBurnRateTool, getCategoryAnalysisTool] }
];

export const sendMessageToAgent = async (message: string, history: any[], user?: User) => {
  if (!process.env.API_KEY) {
    return { text: "API Key not configured. Please check your environment variables.", toolCalls: [] };
  }

  const systemInstruction = `You are a Finance Assistant for Aayatana Tech. 
  Current Date: ${new Date().toISOString().split('T')[0]}.
  User: ${user?.name || 'Guest'}.
  ${user && !user.permissions.includes(PERMISSIONS.EDIT_TRANSACTIONS) ? 'USER IS READ-ONLY. DENY WRITE REQUESTS.' : ''}
  Format currency in INR (₹). Be concise.`;

  try {
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: systemInstruction,
        tools: tools
      },
      history: history.map(h => ({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.text }]
      }))
    });

    const result = await chat.sendMessage({ message: message });
    
    // Check for Function Calls
    const functionCalls = result.functionCalls;
    
    if (functionCalls && functionCalls.length > 0) {
      const toolOutputs: any[] = [];
      const toolCallRecords: any[] = []; // For UI display

      for (const call of functionCalls) {
        let functionResponse = {};
        const args = call.args as any;

        if (call.name === "logTransaction") {
           if (user && !user.permissions.includes(PERMISSIONS.EDIT_TRANSACTIONS)) {
              functionResponse = { status: "error", message: "Permission Denied" };
           } else {
              const categories = db.getCategories();
              const cat = categories.find(c => c.category.toLowerCase().includes((args.categoryName as string || '').toLowerCase()));
              
              const newTx = await db.addTransaction({
                type: args.type as TransactionType,
                amount: args.amount as number,
                description: args.description as string,
                vendor: (args.vendor as string) || 'Unknown',
                date: (args.date as string) || new Date().toISOString().split('T')[0],
                categoryId: cat ? cat.id : 1,
                mode: PaymentMode.OTHER,
                projectTag: args.projectTag as string || 'Business'
              });
              functionResponse = { status: "success", txId: newTx.id, message: "Logged successfully" };
           }
        } else if (call.name === "getBurnRate") {
            functionResponse = await db.getDashboardMetrics();
        } else if (call.name === "getCategoryAnalysis") {
            functionResponse = await db.getCategoryBreakdown();
        }

        toolOutputs.push({
            name: call.name,
            response: functionResponse,
            id: call.id
        });
        
        toolCallRecords.push({ name: call.name, args: call.args });
      }

      // Send tool output back to model
      const finalResult = await chat.sendMessage({
          message: toolOutputs.map(output => ({
              functionResponse: {
                  name: output.name,
                  response: output.response,
                  id: output.id
              }
          }))
      });
      
      return {
          text: finalResult.text,
          toolCalls: toolCallRecords
      };
    }

    return { text: result.text, toolCalls: [] };

  } catch (error) {
    console.error("Gemini Error:", error);
    return { text: "I encountered an error processing your request.", toolCalls: [] };
  }
};