import { Router } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

router.post('/', async (req, res) => {
  const { message, history } = req.body;
  
  if (!message) {
    return res.status(400).json({ text: "Message is required." });
  }

  const lowerMsg = message.toLowerCase();

  try {
    let responseText = "";
    let toolCalls: any[] = [];

    // INTENT: Burn Rate / Runway
    if (lowerMsg.includes('burn') || lowerMsg.includes('runway') || lowerMsg.includes('cash')) {
        toolCalls.push({
           name: 'getBurnRate',
           args: {},
           id: 'call_' + Math.random().toString(36).substr(2,9)
        });
        responseText = "I'm checking the latest financial metrics for you.";
    } 
    // INTENT: Breakdown
    else if (lowerMsg.includes('breakdown') || lowerMsg.includes('spend') || lowerMsg.includes('category')) {
         toolCalls.push({
           name: 'getCategoryAnalysis',
           args: {},
           id: 'call_' + Math.random().toString(36).substr(2,9)
        });
        responseText = "Analyzing the spending categories now.";
    }
    // INTENT: Log Transaction
    else if (lowerMsg.includes('spent') || lowerMsg.includes('log') || lowerMsg.includes('expense')) {
        const amountMatch = message.match(/\d+/);
        const amount = amountMatch ? parseInt(amountMatch[0]) : 0;
        
        toolCalls.push({
           name: 'logTransaction',
           args: {
             type: 'OUTFLOW',
             amount: amount,
             description: message,
             date: new Date().toISOString().split('T')[0],
             categoryName: 'Uncategorized'
           },
           id: 'call_' + Math.random().toString(36).substr(2,9)
        });
        responseText = `I'll draft that transaction for ${amount}. Please confirm details.`;
    }
    else {
        responseText = "I can help you track expenses, check burn rate, or analyze spending. What would you like to do?";
    }

    res.json({
        text: responseText,
        toolCalls: toolCalls
    });

  } catch (e) {
    res.status(500).json({ text: "I encountered a system error." });
  }
});

export default router;
