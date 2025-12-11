
import { GoogleGenAI, FunctionDeclaration, Type, Tool } from "@google/genai";
import { db } from "./dataStore";
import { TransactionType, PaymentMode, User, PERMISSIONS } from "../types";

// Note: In a real production app, this call would go to a backend proxy.
// For this SPA architecture, we instantiate here.
// User must provide key or we assume process.env
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Tool Definitions ---

const logTransactionTool: FunctionDeclaration = {
  name: "logTransaction",
  description: "Log a new financial transaction (inflow or outflow) into the system.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      type: { type: Type.STRING, enum: ["INFLOW", "OUTFLOW"], description: "Type of transaction" },
      amount: { type: Type.NUMBER, description: "Amount in currency" },
      description: { type: Type.STRING, description: "Short description of the expense or income" },
      vendor: { type: Type.STRING, description: "Name of the vendor or payer" },
      date: { type: Type.STRING, description: "Date of transaction in YYYY-MM-DD format" },
      categoryName: { type: Type.STRING, description: "Category of the transaction (e.g., Travel, R&D, Salaries)" },
      projectTag: { type: Type.STRING, description: "Project related to this transaction (e.g., VoltEdge)" }
    },
    required: ["type", "amount", "description"]
  }
};

const getBurnRateTool: FunctionDeclaration = {
  name: "getBurnRate",
  description: "Get the current average monthly burn rate and runway.",
  parameters: {
    type: Type.OBJECT,
    properties: {}, 
  }
};

const getCategoryAnalysisTool: FunctionDeclaration = {
  name: "getCategoryAnalysis",
  description: "Get a breakdown of spending by category.",
  parameters: {
    type: Type.OBJECT,
    properties: {}, 
  }
};

const tools: Tool[] = [
  { functionDeclarations: [logTransactionTool, getBurnRateTool, getCategoryAnalysisTool] }
];

export const sendMessageToAgent = async (message: string, history: any[] = [], user?: User) => {
  if (!process.env.API_KEY) {
    return { 
      text: "Please configure your API_KEY in the environment or settings to use the Agent.",
      toolCalls: []
    };
  }

  // System instructions including user context
  const systemInstruction = `You are an expert Finance Assistant for Aayatana Tech. 
  You are speaking with ${user?.name || 'a user'}. 
  ${user && !user.permissions.includes(PERMISSIONS.EDIT_TRANSACTIONS) ? 'NOTE: This user has READ-ONLY access. Politely decline any requests to add, edit, or delete data.' : ''}
  Keep responses concise and helpful.`;

  try {
    // Map OpenAI-style history (role: 'user'|'assistant') to Gemini format (role: 'user'|'model')
    const geminiHistory = history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.text || msg.content }]
    }));

    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      history: geminiHistory,
      config: {
        tools: tools,
        systemInstruction: systemInstruction,
      }
    });

    const response = await chat.sendMessage({ message });
    
    // Check for function calls
    const toolCalls = response.functionCalls;
    
    if (toolCalls && toolCalls.length > 0) {
      const toolOutputs = [];
      
      for (const call of toolCalls) {
        let functionResponse = {};

        if (call.name === "logTransaction") {
          // Permission Check
          if (user && !user.permissions.includes(PERMISSIONS.EDIT_TRANSACTIONS)) {
             functionResponse = { status: "error", message: "Permission Denied. You have Read-Only access." };
          } else {
            const args = call.args as any;
            
            // Map category name to ID (Mock logic)
            const categories = db.getCategories();
            const cat = categories.find(c => c.category.toLowerCase().includes((args.categoryName || '').toLowerCase()));
            const categoryId = cat ? cat.id : 1; // Default to first if not found

            const newTx = await db.addTransaction({
              type: args.type as TransactionType,
              amount: args.amount,
              description: args.description,
              vendor: args.vendor || 'Unknown',
              date: args.date || new Date().toISOString().split('T')[0],
              categoryId: categoryId,
              mode: PaymentMode.OTHER,
              projectTag: args.projectTag,
              userId: user?.id
            });
            functionResponse = { status: "success", id: newTx.id, message: `Transaction logged successfully: ${newTx.description} for ${newTx.amount}` };
          }
        
        } else if (call.name === "getBurnRate") {
          const metrics = await db.getDashboardMetrics();
          functionResponse = metrics;

        } else if (call.name === "getCategoryAnalysis") {
          const breakdown = await db.getCategoryBreakdown();
          functionResponse = { breakdown };
        }

        toolOutputs.push({
          functionResponse: {
            name: call.name,
            id: call.id,
            response: functionResponse
          }
        });
      }

      // Send tool outputs back to model to get final natural language response
      const finalResult = await chat.sendMessage({ message: toolOutputs });
      return {
        text: finalResult.text,
        toolCalls: toolCalls // Return what was called for UI debugging/visibility
      };
    }

    return { text: response.text, toolCalls: [] };

  } catch (error) {
    console.error("Gemini Agent Error:", error);
    return { text: "I encountered an error connecting to the intelligence layer. Please try again.", toolCalls: [] };
  }
};