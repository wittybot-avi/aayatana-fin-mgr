import { Router } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

router.get('/metrics', async (req, res) => {
  try {
    // 1. Calculate Cash Balance
    const inflowAgg = await prisma.transaction.aggregate({
      where: { type: 'INFLOW' },
      _sum: { amount: true }
    });
    const outflowAgg = await prisma.transaction.aggregate({
      where: { type: 'OUTFLOW' },
      _sum: { amount: true }
    });
    
    // Prisma returns Decimals or null
    const inflow = Number(inflowAgg._sum.amount?.toString() || 0);
    const outflow = Number(outflowAgg._sum.amount?.toString() || 0);
    const currentCashBalance = inflow - outflow;

    // 2. Calculate Burn (Last 3 months)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const recentBurnAgg = await prisma.transaction.aggregate({
      where: { 
        type: 'OUTFLOW',
        date: { gte: threeMonthsAgo }
      },
      _sum: { amount: true }
    });
    const recentBurn = Number(recentBurnAgg._sum.amount?.toString() || 0);
    const monthlyBurn = recentBurn > 0 ? recentBurn / 3 : 0;

    // 3. Runway
    const runwayMonths = monthlyBurn > 0 ? currentCashBalance / monthlyBurn : 0;

    res.json({
      currentCashBalance,
      monthlyBurn,
      runwayMonths,
      totalOutflowLastMonth: recentBurn / 3 // Approx
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to calculate metrics" });
  }
});

router.get('/breakdown', async (req, res) => {
  try {
    const txs = await prisma.transaction.findMany({
      where: { type: 'OUTFLOW' },
      include: { category: true }
    });

    const breakdown: Record<string, number> = {};
    txs.forEach(t => {
      const name = t.category?.category || 'Uncategorized';
      // Safe Decimal conversion
      breakdown[name] = (breakdown[name] || 0) + Number(t.amount.toString());
    });

    const result = Object.entries(breakdown).map(([name, value]) => ({ name, value }));
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch breakdown" });
  }
});

export default router;
