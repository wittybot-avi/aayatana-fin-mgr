import OpenAI from "openai";
import { db } from "./dataStore";
import { TransactionType, PaymentMode, User, PERMISSIONS } from "../types";

// Initialize OpenAI Client
// Note: In a production environment, API calls should be routed through a backend to hide the key.
// For this client-side demo, we allow browser usage.
const openai = new OpenAI({
  apiKey: process.env.API_KEY || '', // Using API_KEY env var as per standard convention for the platform
  dangerouslyAllowBrowser: true
});

// --- Tool Definitions (OpenAI Format) ---

const tools = [
  {
    type: "function" as const,
    function: {
      name: "logTransaction",
      description: "Log a new financial transaction (inflow or outflow) into the system.",
      parameters: {
        type: "object",
        properties: {
          type: { 
            type: "string", 
            enum: ["INFLOW", "OUTFLOW"], 
            description: "Type of transaction" 
          },
          amount: { 
            type: "number", 
            description: "Amount in currency (INR)" 
          },
          description: { 
            type: "string", 
            description: "Short description of the expense or income" 
          },
          vendor: { 
            type: "string", 
            description: "Name of the vendor or payer" 
          },
          date: { 
            type: "string", 
            description: "Date of transaction in YYYY-MM-DD format" 
          },
          categoryName: { 
            type: "string", 
            description: "Category of the transaction (e.g., Travel, R&D, Salaries)" 
          },
          projectTag: { 
            type: "string", 
            description: "Project related to this transaction (e.g., VoltEdge, EcoTrace360)" 
          }
        },
        required: ["type", "amount", "description"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "getBurnRate",
      description: "Get the current average monthly burn rate, runway, and cash balance.",
      parameters: {
        type: "object",
        properties: {}
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "getCategoryAnalysis",
      description: "Get a breakdown of spending by category.",
      parameters: {
        type: "object",
        properties: {}
      }
    }
  }
];

export const sendMessageToAgent = async (message: string, history: any[], user?: User) => {
  if (!process.env.API_KEY) {
    return { 
      text: "Please configure your API_KEY to use the ChatGPT Agent.",
      toolCalls: []
    };
  }

  // System instructions with User Context
  const systemContent = `You are an expert Finance Assistant for Aayatana Tech. 
  You are speaking with ${user?.name || 'a user'}. 
  ${user && !user.permissions.includes(PERMISSIONS.EDIT_TRANSACTIONS) 
    ? 'CRITICAL: This user has READ-ONLY access. You MUST politely deny any requests to add, create, edit, or delete transactions or data.' 
    : ''}
  Current Date: ${new Date().toISOString().split('T')[0]}.
  Keep responses professional, concise, and helpful. Format currency in INR (₹).`;

  try {
    // Construct messages array for OpenAI
    // Filter out any internal tool call messages from history to keep it simple for this demo, 
    // or pass them if properly formatted. We will stick to simple user/assistant history.
    const apiMessages = [
      { role: "system", content: systemContent },
      ...history,
      { role: "user", content: message }
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // or gpt-3.5-turbo
      messages: apiMessages as any,
      tools: tools,
      tool_choice: "auto", 
    });

    const responseMessage = completion.choices[0].message;
    const toolCalls = responseMessage.tool_calls;

    if (toolCalls && toolCalls.length > 0) {
      const toolOutputs = [];
      
      for (const toolCall of toolCalls) {
        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments);
        let functionResponse = {};

        if (functionName === "logTransaction") {
          // --- Permission Check ---
          if (user && !user.permissions.includes(PERMISSIONS.EDIT_TRANSACTIONS)) {
             functionResponse = { 
               status: "error", 
               message: "PERMISSION DENIED: You have Read-Only access and cannot create transactions." 
             };
          } else {
            // Map category name to ID
            const categories = db.getCategories();
            const cat = categories.find(c => c.category.toLowerCase().includes((functionArgs.categoryName || '').toLowerCase()));
            const categoryId = cat ? cat.id : 1; // Default to first if not found

            const newTx = await db.addTransaction({
              type: functionArgs.type as TransactionType,
              amount: functionArgs.amount,
              description: functionArgs.description,
              vendor: functionArgs.vendor || 'Unknown',
              date: functionArgs.date || new Date().toISOString().split('T')[0],
              categoryId: categoryId,
              mode: PaymentMode.OTHER,
              projectTag: functionArgs.projectTag
            });
            functionResponse = { 
              status: "success", 
              id: newTx.id, 
              message: `Transaction logged: ${newTx.description} for ₹${newTx.amount}` 
            };
          }
        
        } else if (functionName === "getBurnRate") {
          const metrics = await db.getDashboardMetrics();
          functionResponse = metrics;

        } else if (functionName === "getCategoryAnalysis") {
          const breakdown = await db.getCategoryBreakdown();
          functionResponse = { breakdown };
        }

        // Add the tool result to the conversation
        apiMessages.push(responseMessage); // Add the assistant's tool_call message
        apiMessages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(functionResponse)
        });
      }

      // Get final response after tool execution
      const secondResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: apiMessages as any,
      });

      return {
        text: secondResponse.choices[0].message.content || "Done.",
        toolCalls: toolCalls
      };
    }

    return { text: responseMessage.content || "I didn't understand that.", toolCalls: [] };

  } catch (error) {
    console.error("OpenAI Agent Error:", error);
    return { text: "I encountered an error connecting to the AI service. Please check your network or API Key.", toolCalls: [] };
  }
};