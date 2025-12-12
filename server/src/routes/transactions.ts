import { Router } from 'express';
import { MEMORY_DB } from '../index';

const router = Router();

router.get('/', async (req, res) => {
  const { userId, type, projectTag, categoryId } = req.query;
  
  let txs = [...MEMORY_DB.transactions];

  if (userId) txs = txs.filter(t => t.userId === String(userId));
  if (type) txs = txs.filter(t => t.type === String(type));
  if (projectTag) txs = txs.filter(t => t.projectTag === String(projectTag));
  if (categoryId) txs = txs.filter(t => t.categoryId === Number(categoryId));

  // Sort desc
  txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  res.json(txs);
});

router.post('/', async (req, res) => {
  try {
    const { date, amount, categoryId, userId, type, mode, ...rest } = req.body;
    
    const newTx = {
      id: Date.now(),
      ...rest,
      type,
      mode: mode || null,
      userId: userId ? String(userId) : null,
      date: new Date(date),
      amount: Number(amount),
      categoryId: Number(categoryId),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    MEMORY_DB.transactions.push(newTx);
    res.json(newTx);
  } catch (e) {
    console.error("Transaction Create Error:", e);
    res.status(500).json({ error: "Failed to create transaction" });
  }
});

router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);
  MEMORY_DB.transactions = MEMORY_DB.transactions.filter(t => t.id !== id);
  res.json({ success: true });
});

export default router;
