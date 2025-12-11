
import { 
  Transaction, 
  TransactionType, 
  PaymentMode, 
  ChartOfAccount, 
  Grant, 
  InvestorCapital, 
  Headcount,
  User,
  RoleDefinition,
  PERMISSIONS,
  READ_ONLY_PERMISSIONS,
  WRITE_ACCESS_PERMISSIONS,
  ADMIN_PERMISSIONS,
  LIMITED_USER_PERMISSIONS
} from '../types';

// --- Seed Data ---

const INITIAL_CATEGORIES: ChartOfAccount[] = [
  { id: 1, category: 'R&D', subcategory: 'Electronics' },
  { id: 2, category: 'R&D', subcategory: 'Software' },
  { id: 3, category: 'IP', subcategory: 'Patents' },
  { id: 4, category: 'Salaries', subcategory: 'Founders' },
  { id: 5, category: 'Salaries', subcategory: 'Engineers' },
  { id: 6, category: 'Infra', subcategory: 'Cloud/SaaS' },
  { id: 7, category: 'Travel', subcategory: 'Business' },
  { id: 8, category: 'Legal', subcategory: 'Compliance' },
  { id: 9, category: 'Revenue', subcategory: 'Consulting' },
  { id: 10, category: 'Revenue', subcategory: 'Product' },
  { id: 11, category: 'Capital', subcategory: 'Investment' }, 
];

const INITIAL_GRANTS: Grant[] = [
  { id: 1, name: 'DeepTech Startup Grant', totalSanctioned: 5000000, amountReceived: 2500000, amountUtilized: 1200000, deadline: '2025-12-31' },
];

const INITIAL_INVESTORS: InvestorCapital[] = [
  { id: 1, investorName: 'Angel Syndicate A', dateReceived: '2024-01-15', amount: 10000000, instrument: 'iSAFE' },
];

const INITIAL_HEADCOUNT: Headcount[] = [
  { id: 1, name: 'Avinash Gowda', role: 'Founder & CEO', ctcMonthly: 0, startDate: '2023-01-01', allocationPercent: 100 },
  { id: 2, name: 'Vinutha J', role: 'Co-founder & MD', ctcMonthly: 0, startDate: '2023-01-01', allocationPercent: 100 },
  { id: 3, name: 'Shrikanth Rao', role: 'Co-founder & COO', ctcMonthly: 0, startDate: '2023-01-01', allocationPercent: 100 },
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  { 
    id: 1, 
    date: '2024-09-01', 
    type: TransactionType.INFLOW, 
    categoryId: 9, 
    amount: 500000, 
    mode: PaymentMode.ACCOUNT_TRANSFER, 
    description: 'Consulting Project Alpha', 
    projectTag: 'EcoTrace360',
    userId: 'u2',
    createdAt: new Date().toISOString()
  },
  { 
    id: 2, 
    date: '2024-09-05', 
    type: TransactionType.OUTFLOW, 
    categoryId: 6, 
    amount: 15000, 
    mode: PaymentMode.CREDIT_CARD, 
    vendor: 'AWS', 
    description: 'Cloud Hosting', 
    projectTag: 'VoltEdge',
    userId: 'u2',
    createdAt: new Date().toISOString()
  },
  { 
    id: 3, 
    date: '2024-09-10', 
    type: TransactionType.OUTFLOW, 
    categoryId: 1, 
    amount: 45000, 
    mode: PaymentMode.UPI, 
    vendor: 'DigiKey', 
    description: 'Microcontrollers', 
    projectTag: 'VoltVault',
    grantId: 1,
    userId: 'u2',
    createdAt: new Date().toISOString()
  },
];

const INITIAL_ROLES: RoleDefinition[] = [
  { name: 'Admin', permissions: ADMIN_PERMISSIONS },
  { name: 'Founder', permissions: WRITE_ACCESS_PERMISSIONS },
  { name: 'Viewer', permissions: READ_ONLY_PERMISSIONS },
  { name: 'Employee', permissions: LIMITED_USER_PERMISSIONS },
  { name: 'Manager', permissions: LIMITED_USER_PERMISSIONS },
];

const INITIAL_USERS: User[] = [
  {
    id: 'u1',
    username: 'Admin',
    password: 'Admin@123',
    name: 'System Admin',
    role: 'Admin',
    isFirstLogin: true,
    permissions: ADMIN_PERMISSIONS 
  },
  {
    id: 'u2',
    username: 'Avinash',
    password: 'Avinash@123',
    name: 'Avinash Gowda',
    role: 'Founder',
    email: 'avinash@aayatana.tech',
    isFirstLogin: true,
    permissions: WRITE_ACCESS_PERMISSIONS 
  },
  {
    id: 'u3',
    username: 'Vinutha',
    password: 'Vinutha@123',
    name: 'Vinutha J',
    role: 'Founder',
    email: 'vinutha@aayatana.tech',
    isFirstLogin: true,
    permissions: READ_ONLY_PERMISSIONS 
  },
  {
    id: 'u4',
    username: 'Shrikanth',
    password: 'Shrikanth@123',
    name: 'Shrikanth Rao',
    role: 'Founder',
    email: 'shrikanth@aayatana.tech',
    isFirstLogin: true,
    permissions: READ_ONLY_PERMISSIONS 
  }
];

// Helper to simulate DB delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

class DataStore {
  private categories: ChartOfAccount[] = INITIAL_CATEGORIES;
  private grants: Grant[] = INITIAL_GRANTS;
  private investors: InvestorCapital[] = INITIAL_INVESTORS;
  private headcount: Headcount[] = INITIAL_HEADCOUNT;
  private transactions: Transaction[] = INITIAL_TRANSACTIONS;
  private users: User[] = INITIAL_USERS;
  private roles: RoleDefinition[] = INITIAL_ROLES;
  private projectTags: string[] = ['Business', 'VoltEdge', 'EcoTrace360', 'VoltVault', 'EcoMetrics', 'EcoMetricsESG'];
  private nextTransactionId = 100;

  constructor() {
    const savedTx = localStorage.getItem('transactions');
    if (savedTx) {
      this.transactions = JSON.parse(savedTx);
      this.nextTransactionId = Math.max(...this.transactions.map(t => t.id), 100) + 1;
    }
    
    const savedUsers = localStorage.getItem('users');
    if (savedUsers) {
      this.users = JSON.parse(savedUsers);
    }
    
    const savedInvestors = localStorage.getItem('investors');
    if (savedInvestors) {
      this.investors = JSON.parse(savedInvestors);
    }

    const savedTags = localStorage.getItem('projectTags');
    if (savedTags) {
      this.projectTags = JSON.parse(savedTags);
    }
    
    const savedGrants = localStorage.getItem('grants');
    if (savedGrants) this.grants = JSON.parse(savedGrants);

    const savedHeadcount = localStorage.getItem('headcount');
    if (savedHeadcount) this.headcount = JSON.parse(savedHeadcount);
  }

  private persist() {
    localStorage.setItem('transactions', JSON.stringify(this.transactions));
  }
  
  private persistUsers() {
    localStorage.setItem('users', JSON.stringify(this.users));
  }

  private persistInvestors() {
    localStorage.setItem('investors', JSON.stringify(this.investors));
  }

  private persistTags() {
    localStorage.setItem('projectTags', JSON.stringify(this.projectTags));
  }

  private persistGrants() {
    localStorage.setItem('grants', JSON.stringify(this.grants));
  }

  private persistHeadcount() {
    localStorage.setItem('headcount', JSON.stringify(this.headcount));
  }

  // --- Auth & User Methods ---
  
  async authenticate(username: string, password: string): Promise<User | null> {
    await delay(500);
    const user = this.users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (user && user.password === password) {
      const { password, ...safeUser } = user;
      return safeUser as User;
    }
    return null;
  }

  async updateUserProfile(id: string, updates: Partial<User>) {
    await delay(300);
    this.users = this.users.map(u => {
      if (u.id === id) {
        return { ...u, ...updates };
      }
      return u;
    });
    this.persistUsers();
    
    const updated = this.users.find(u => u.id === id);
    if (updated) {
       const { password, ...safeUser } = updated;
       return safeUser;
    }
    return null;
  }

  async updateUserPermissions(id: string, permissions: string[]) {
    await delay(200);
    this.users = this.users.map(u => {
      if (u.id === id) {
        return { ...u, permissions };
      }
      return u;
    });
    this.persistUsers();
  }

  async changePassword(id: string, newPassword: string) {
    await delay(300);
    this.users = this.users.map(u => {
      if (u.id === id) {
        return { ...u, password: newPassword, isFirstLogin: false };
      }
      return u;
    });
    this.persistUsers();
  }

  async resetPasswordRequest(usernameOrEmail: string): Promise<boolean> {
    await delay(800);
    const user = this.users.find(u => 
      u.username.toLowerCase() === usernameOrEmail.toLowerCase() || 
      (u.email && u.email.toLowerCase() === usernameOrEmail.toLowerCase())
    );
    return !!user;
  }

  // --- User Management (Admin) ---
  
  getUsers() { return this.users.map(({password, ...u}) => u); }
  
  async addUser(user: Omit<User, 'id'>) {
     const newUser = { ...user, id: Math.random().toString(36).substr(2, 9) };
     this.users.push(newUser);
     this.persistUsers();
     return newUser;
  }
  
  async deleteUser(id: string) {
    this.users = this.users.filter(u => u.id !== id);
    this.persistUsers();
  }

  getRoles() { return this.roles; }

  // --- Transactions ---
  async getTransactions(user?: User, filter?: { type?: TransactionType, projectTag?: string, categoryId?: number }) {
    await delay(300);
    let result = [...this.transactions];
    
    // Row Level Security (RLS)
    if (user && !user.permissions.includes(PERMISSIONS.VIEW_FINANCIALS) && user.permissions.includes(PERMISSIONS.VIEW_OWN_FINANCIALS)) {
      result = result.filter(t => t.userId === user.id);
    }

    if (filter?.type) result = result.filter(t => t.type === filter.type);
    if (filter?.projectTag) result = result.filter(t => t.projectTag === filter.projectTag);
    if (filter?.categoryId) result = result.filter(t => t.categoryId === filter.categoryId);
    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async addTransaction(tx: Omit<Transaction, 'id' | 'createdAt'>) {
    await delay(300);
    const newTx: Transaction = {
      ...tx,
      id: this.nextTransactionId++,
      createdAt: new Date().toISOString()
    };
    this.transactions.push(newTx);
    
    // Update Grants Utilisation
    if (newTx.grantId) {
      const grantIndex = this.grants.findIndex(g => g.id === newTx.grantId);
      if (grantIndex !== -1) {
        this.grants[grantIndex].amountUtilized += newTx.amount;
        this.persistGrants();
      }
    }

    // Dynamic Project Tag Check - Auto save new tags
    if (newTx.projectTag && newTx.projectTag !== '' && !this.projectTags.includes(newTx.projectTag)) {
      this.projectTags.push(newTx.projectTag);
      this.persistTags();
    }

    this.persist();
    return newTx;
  }

  async deleteTransaction(id: number) {
     this.transactions = this.transactions.filter(t => t.id !== id);
     this.persist();
  }

  // --- Investors ---
  getInvestors() { return this.investors; }

  async addInvestor(investor: Omit<InvestorCapital, 'id'>) {
    await delay(300);
    const newInv = {
      ...investor,
      id: Math.floor(Math.random() * 100000)
    };
    this.investors.push(newInv);
    this.persistInvestors();

    // Automatically create an INFLOW transaction
    const capitalCategory = this.categories.find(c => c.category === 'Capital');
    await this.addTransaction({
      date: newInv.dateReceived,
      type: TransactionType.INFLOW,
      categoryId: capitalCategory ? capitalCategory.id : 11,
      amount: newInv.amount,
      mode: PaymentMode.ACCOUNT_TRANSFER,
      description: `Investment from ${newInv.investorName} (${newInv.instrument})`,
      projectTag: 'Business',
      userId: 'admin'
    });

    return newInv;
  }

  // --- Grants ---
  getGrants() { return this.grants; }

  async addGrant(grant: Omit<Grant, 'id'>) {
    await delay(300);
    const newGrant = { ...grant, id: Math.floor(Math.random() * 100000), amountUtilized: 0 };
    this.grants.push(newGrant);
    this.persistGrants();
    return newGrant;
  }

  // --- Headcount ---
  getHeadcount() { return this.headcount; }
  
  async addHeadcount(member: Omit<Headcount, 'id'>) {
     await delay(300);
     const newMember = { ...member, id: Math.floor(Math.random() * 100000) };
     this.headcount.push(newMember);
     this.persistHeadcount();
     return newMember;
  }

  async updateHeadcount(id: number, updates: Partial<Headcount>) {
    await delay(200);
    this.headcount = this.headcount.map(h => h.id === id ? { ...h, ...updates } : h);
    this.persistHeadcount();
  }

  // --- Analytics ---
  async getDashboardMetrics() {
    await delay(200);
    const totalInflow = this.transactions
      .filter(t => t.type === TransactionType.INFLOW)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalOutflow = this.transactions
      .filter(t => t.type === TransactionType.OUTFLOW)
      .reduce((sum, t) => sum + t.amount, 0);

    const currentCashBalance = totalInflow - totalOutflow;

    const now = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(now.getMonth() - 3);

    const recentOutflows = this.transactions.filter(t => 
      t.type === TransactionType.OUTFLOW && 
      new Date(t.date) >= threeMonthsAgo
    );
    
    const recentBurn = recentOutflows.reduce((sum, t) => sum + t.amount, 0);
    const monthlyBurn = recentBurn > 0 ? recentBurn / 3 : 0; 

    const runwayMonths = monthlyBurn > 0 ? currentCashBalance / monthlyBurn : 0;

    return {
      currentCashBalance,
      monthlyBurn,
      runwayMonths,
      totalOutflowLastMonth: recentBurn / 3 
    };
  }

  async getCategoryBreakdown() {
    const breakdown: Record<string, number> = {};
    const outflows = this.transactions.filter(t => t.type === TransactionType.OUTFLOW);
    
    outflows.forEach(t => {
      const cat = this.categories.find(c => c.id === t.categoryId);
      const name = cat ? cat.category : 'Uncategorized';
      breakdown[name] = (breakdown[name] || 0) + t.amount;
    });

    return Object.entries(breakdown).map(([name, value]) => ({ name, value }));
  }

  getCategories() { return this.categories; }
  getProjectTags() { return this.projectTags; }
}

export const db = new DataStore();