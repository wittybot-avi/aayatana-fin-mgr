import { Router } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

router.get('/', async (req, res) => {
  const { userId, type, projectTag, categoryId } = req.query;
  
  const where: any = {};
  if (userId) where.userId = String(userId);
  if (type) where.type = String(type);
  if (projectTag) where.projectTag = String(projectTag);
  if (categoryId) where.categoryId = Number(categoryId);

  try {
    const txs = await prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
      include: { category: true } 
    });
    res.json(txs);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

router.post('/', async (req, res) => {
  try {
    const { date, amount, categoryId, userId, ...rest } = req.body;
    
    // Ensure numeric/date conversions are safe
    const tx = await prisma.transaction.create({
      data: {
        ...rest,
        userId: userId ? String(userId) : null,
        date: new Date(date),
        amount: Number(amount),
        categoryId: Number(categoryId)
      }
    });

    // Update grant utilization if linked
    if (tx.grantId) {
       const grant = await prisma.grant.findUnique({ where: { id: tx.grantId }});
       if (grant) {
         // Fix: Handle Prisma Decimal type safely by converting to string before Number()
         const currentUtilized = grant.amountUtilized ? Number(grant.amountUtilized.toString()) : 0;
         const newAmount = currentUtilized + Number(amount);
         
         await prisma.grant.update({
           where: { id: tx.grantId },
           data: { amountUtilized: newAmount }
         });
       }
    }

    res.json(tx);
  } catch (e) {
    console.error("Transaction Create Error:", e);
    res.status(500).json({ error: "Failed to create transaction" });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.transaction.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Failed to delete" });
  }
});

export default router;
