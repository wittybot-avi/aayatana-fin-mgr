import { Router } from 'express';
import { MEMORY_DB } from '../index';

const router = Router();

router.get('/metrics', async (req, res) => {
  try {
    const txs = MEMORY_DB.transactions;

    // 1. Calculate Cash Balance
    const inflow = txs.filter(t => t.type === 'INFLOW').reduce((sum, t) => sum + (t.amount || 0), 0);
    const outflow = txs.filter(t => t.type === 'OUTFLOW').reduce((sum, t) => sum + (t.amount || 0), 0);
    const currentCashBalance = inflow - outflow;

    // 2. Calculate Burn (Last 3 months)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const recentBurn = txs
      .filter(t => t.type === 'OUTFLOW' && new Date(t.date) >= threeMonthsAgo)
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const monthlyBurn = recentBurn > 0 ? recentBurn / 3 : 0;

    // 3. Runway
    const runwayMonths = monthlyBurn > 0 ? currentCashBalance / monthlyBurn : 0;

    res.json({
      currentCashBalance,
      monthlyBurn,
      runwayMonths,
      totalOutflowLastMonth: recentBurn / 3
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to calculate metrics" });
  }
});

router.get('/breakdown', async (req, res) => {
  try {
    const txs = MEMORY_DB.transactions.filter(t => t.type === 'OUTFLOW');
    const cats = MEMORY_DB.categories;

    const breakdown: Record<string, number> = {};
    txs.forEach(t => {
      const cat = cats.find(c => c.id === t.categoryId);
      const name = cat ? cat.category : 'Uncategorized';
      breakdown[name] = (breakdown[name] || 0) + (t.amount || 0);
    });

    const result = Object.entries(breakdown).map(([name, value]) => ({ name, value }));
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch breakdown" });
  }
});

export default router;
