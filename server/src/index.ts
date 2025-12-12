import express from 'express';
import cors from 'cors';
import dashboardRoutes from './routes/dashboard';
import transactionRoutes from './routes/transactions';
import agentRoutes from './routes/agent';
import setupSeed from './seed';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors() as any);
app.use(express.json() as any);

// --- IN-MEMORY DATA STORE ---
export const MEMORY_DB = {
  users: [
    {
      id: 1,
      username: 'Admin',
      password: 'Admin@123',
      name: 'System Admin',
      role: 'Admin',
      isFirstLogin: false,
      permissions: JSON.stringify(['manage_users', 'view_financials', 'edit_transactions', 'manage_grants', 'manage_headcount', 'manage_capital'])
    },
    {
      id: 2,
      username: 'Avinash',
      password: 'Avinash@123',
      name: 'Avinash Gowda',
      role: 'Founder',
      isFirstLogin: false,
      permissions: JSON.stringify(['view_financials', 'edit_transactions', 'manage_grants', 'manage_headcount', 'manage_capital'])
    },
    {
      id: 3,
      username: 'Vinutha',
      password: 'Vinutha@123',
      name: 'Vinutha J',
      role: 'Founder',
      isFirstLogin: false,
      permissions: JSON.stringify(['view_financials', 'view_reports'])
    }
  ],
  categories: [
    { id: 1, category: 'R&D', subcategory: 'Electronics' },
    { id: 2, category: 'R&D', subcategory: 'Software' },
    { id: 3, category: 'Salaries', subcategory: 'Founders' },
    { id: 4, category: 'Revenue', subcategory: 'Product' }
  ],
  transactions: [] as any[],
  grants: [] as any[],
  headcount: [] as any[],
  investors: [] as any[]
};

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Chart of accounts routes
app.get('/api/chart-of-accounts', async (_req, res) => {
  res.json(MEMORY_DB.categories);
});

app.post('/api/chart-of-accounts', async (req, res) => {
  const { category, subcategory, notes } = req.body;
  const newCat = { id: Date.now(), category, subcategory, notes };
  MEMORY_DB.categories.push(newCat);
  res.status(201).json(newCat);
});

// Mount modular routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/agent', agentRoutes);

// Auth Login Route
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const user = MEMORY_DB.users.find(u => u.username === username);

  if (!user || user.password !== password) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const { password: _, ...safeUser } = user;
  const permissions = JSON.parse(safeUser.permissions || '[]');
  
  res.json({
      message: 'Login successful',
      user: {
        id: safeUser.id,
        username: safeUser.username,
        role: safeUser.role,
        permissions: permissions
      }
  });
});

// Users Route
app.get('/api/users', async (req, res) => {
  const safeUsers = MEMORY_DB.users.map(u => {
      const { password, ...rest } = u;
      return { ...rest, permissions: JSON.parse(rest.permissions || '[]') };
  });
  res.json(safeUsers);
});

// Start Server
app.listen(Number(PORT), '0.0.0.0', async () => {
  console.log(`Server running on http://127.0.0.1:${PORT} (In-Memory Mode)`);
});