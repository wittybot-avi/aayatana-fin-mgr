import express from 'express';
import cors from 'cors';
import { prisma } from './lib/prisma';
import dashboardRoutes from './routes/dashboard';
import transactionRoutes from './routes/transactions';
import agentRoutes from './routes/agent';
import setupSeed from './seed';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors() as any);
app.use(express.json() as any);

// Routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/agent', agentRoutes);

// Auth Login Route
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (user && user.password === password) {
      const { password, ...safeUser } = user;
      // Parse permissions from string
      const permissions = JSON.parse(safeUser.permissions || '[]');
      res.json({ ...safeUser, permissions });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Auth error" });
  }
});

// Users Route
app.get('/api/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    const safeUsers = users.map(u => {
      const { password, ...rest } = u;
      return { ...rest, permissions: JSON.parse(rest.permissions || '[]') };
    });
    res.json(safeUsers);
  } catch (e) {
     res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Chart of Accounts
app.get('/api/chart-of-accounts', async (req, res) => {
  const data = await prisma.chartOfAccount.findMany();
  res.json(data);
});

// Grants
app.get('/api/grants', async (req, res) => {
  const data = await prisma.grant.findMany();
  res.json(data);
});
app.post('/api/grants', async (req, res) => {
  const data = await prisma.grant.create({ data: req.body });
  res.json(data);
});

// Headcount
app.get('/api/headcount', async (req, res) => {
  const data = await prisma.headcount.findMany();
  res.json(data);
});
app.post('/api/headcount', async (req, res) => {
  const data = await prisma.headcount.create({ data: req.body });
  res.json(data);
});

// Investors
app.get('/api/investors', async (req, res) => {
  const data = await prisma.investorCapital.findMany();
  res.json(data);
});
app.post('/api/investors', async (req, res) => {
  const data = await prisma.investorCapital.create({ data: req.body });
  res.json(data);
});

// Start Server
app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  await setupSeed(prisma);
});
