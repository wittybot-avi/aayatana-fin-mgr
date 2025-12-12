
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

// --- Roles Static Definition ---
const INITIAL_ROLES: RoleDefinition[] = [
  { name: 'Admin', permissions: ADMIN_PERMISSIONS },
  { name: 'Founder', permissions: WRITE_ACCESS_PERMISSIONS },
  { name: 'Viewer', permissions: READ_ONLY_PERMISSIONS },
  { name: 'Employee', permissions: LIMITED_USER_PERMISSIONS },
  { name: 'Manager', permissions: LIMITED_USER_PERMISSIONS },
];

// --- SEED DATA ---

const INITIAL_USERS: User[] = [
  { 
    id: 'u1', 
    username: 'Admin', 
    password: 'Admin@123', 
    name: 'System Admin', 
    role: 'Admin', 
    isFirstLogin: false, 
    permissions: ADMIN_PERMISSIONS 
  },
  { 
    id: 'u2', 
    username: 'Avinash', 
    password: 'Avinash@123', 
    name: 'Avinash Gowda', 
    role: 'Founder', 
    isFirstLogin: false, 
    permissions: WRITE_ACCESS_PERMISSIONS 
  },
  { 
    id: 'u3', 
    username: 'Vinutha', 
    password: 'Vinutha@123', 
    name: 'Vinutha J', 
    role: 'Founder', 
    isFirstLogin: false, 
    permissions: READ_ONLY_PERMISSIONS 
  },
  { 
    id: 'u4', 
    username: 'Shrikanth', 
    password: 'Shrikanth@123', 
    name: 'Shrikanth Rao', 
    role: 'Founder', 
    isFirstLogin: false, 
    permissions: READ_ONLY_PERMISSIONS 
  }
];

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

const INITIAL_PROJECTS = ['Business', 'VoltEdge', 'EcoTrace360', 'VoltVault', 'EcoMetrics', 'EcoMetricsESG'];

// Helper to get current year for seed data
const curYear = new Date().getFullYear();
const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 1, date: `${curYear}-04-05`, type: TransactionType.INFLOW, categoryId: 11, amount: 5000000, mode: PaymentMode.ACCOUNT_TRANSFER, description: 'Seed Funding Tranche 1', projectTag: 'Business', createdAt: new Date().toISOString() },
  { id: 2, date: `${curYear}-04-15`, type: TransactionType.OUTFLOW, categoryId: 6, amount: 25000, mode: PaymentMode.CREDIT_CARD, description: 'AWS Credits', projectTag: 'VoltEdge', createdAt: new Date().toISOString() },
  { id: 3, date: `${curYear}-05-10`, type: TransactionType.OUTFLOW, categoryId: 1, amount: 150000, mode: PaymentMode.ACCOUNT_TRANSFER, description: 'PCB Prototyping', projectTag: 'VoltEdge', createdAt: new Date().toISOString() },
  { id: 4, date: `${curYear}-06-01`, type: TransactionType.OUTFLOW, categoryId: 5, amount: 450000, mode: PaymentMode.ACCOUNT_TRANSFER, description: 'Engineering Salaries', projectTag: 'Business', createdAt: new Date().toISOString() },
];

class DataStore {
  private users: User[] = INITIAL_USERS;
  private roles: RoleDefinition[] = INITIAL_ROLES;
  private categories: ChartOfAccount[] = INITIAL_CATEGORIES;
  private transactions: Transaction[] = INITIAL_TRANSACTIONS;
  private grants: Grant[] = [];
  private headcount: Headcount[] = [];
  private investors: InvestorCapital[] = [];
  private projectTags: string[] = INITIAL_PROJECTS;

  constructor() {
    // Mock initialization
  }

  // --- Auth & User Methods ---
  
  async authenticate(username: string, password: string): Promise<User | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const user = this.users.find(u => u.username.toLowerCase() === username.toLowerCase());
    
    if (user && user.password === password) {
      // Return user without password
      const { password, ...safeUser } = user;
      return safeUser as User;
    }
    return null;
  }

  async updateUserProfile(id: string, updates: Partial<User>) {
    const idx = this.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      this.users[idx] = { ...this.users[idx], ...updates };
      return true;
    }
    return false;
  }

  async updateUserPermissions(id: string, permissions: string[]) {
     const idx = this.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      this.users[idx] = { ...this.users[idx], permissions };
    }
  }

  async changePassword(id: string, newPassword: string) {
    const idx = this.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      this.users[idx].password = newPassword;
      this.users[idx].isFirstLogin = false; // flag updated
      return true;
    }
    throw new Error("User not found");
  }

  async resetPasswordRequest(usernameOrEmail: string): Promise<boolean> {
     return true; // Mock success
  }

  // --- User Management (Admin) ---
  
  async getUsers() { 
      // Return users without passwords
      return this.users.map(({ password, ...u }) => u as User);
  }
  
  async addUser(user: Omit<User, 'id'>) {
      const newUser = { ...user, id: Math.random().toString(36).substr(2, 9) };
      this.users.push(newUser as User);
      return newUser;
  }
  
  async deleteUser(id: string) {
      this.users = this.users.filter(u => u.id !== id);
  }

  getRoles() { return this.roles; }

  // --- Transactions ---

  async getTransactions(user?: User, filter?: { type?: TransactionType, projectTag?: string, categoryId?: number }) {
    await new Promise(resolve => setTimeout(resolve, 300));
    let result = [...this.transactions];

    // Row Level Security (Mock)
    if (user && !user.permissions.includes(PERMISSIONS.VIEW_FINANCIALS)) {
        result = result.filter(t => t.userId === user.id);
    }

    if (filter) {
      if (filter.type) result = result.filter(t => t.type === filter.type);
      if (filter.projectTag) result = result.filter(t => t.projectTag === filter.projectTag);
      if (filter.categoryId) result = result.filter(t => t.categoryId === filter.categoryId);
    }

    // Filter by Indian Financial Year (Current) as per IST
    const now = new Date();
    // Get components in IST
    const istDate = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const currentYear = istDate.getFullYear();
    const currentMonth = istDate.getMonth(); // 0-11
    
    let startYear, endYear;
    // Financial year starts April 1st
    // If Jan(0), Feb(1), Mar(2) -> FY is (Year-1) to (Year)
    if (currentMonth < 3) {
        startYear = currentYear - 1;
        endYear = currentYear;
    } else {
        startYear = currentYear;
        endYear = currentYear + 1;
    }
    
    const fyStart = `${startYear}-04-01`;
    const fyEnd = `${endYear}-03-31`;
    
    result = result.filter(t => t.date >= fyStart && t.date <= fyEnd);

    return result.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async addTransaction(tx: Omit<Transaction, 'id' | 'createdAt'>) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newTx: Transaction = {
      ...tx,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    this.transactions.unshift(newTx);
    
    // Dynamic Project Tags
    if (tx.projectTag && !this.projectTags.includes(tx.projectTag)) {
        this.projectTags.push(tx.projectTag);
    }

    // Update grant utilization if linked
    if (tx.grantId) {
       const grantIdx = this.grants.findIndex(g => g.id === tx.grantId);
       if (grantIdx !== -1) {
          this.grants[grantIdx].amountUtilized += tx.amount;
       }
    }

    return newTx;
  }

  async deleteTransaction(id: number) {
     this.transactions = this.transactions.filter(t => t.id !== id);
  }

  // --- Investors ---

  async getInvestors() { return [...this.investors]; }

  async addInvestor(investor: Omit<InvestorCapital, 'id'>) {
    const newInv = { ...investor, id: Date.now() };
    this.investors.push(newInv);
    
    // Create linked transaction
    const capitalCategory = this.categories.find(c => c.category === 'Capital') || this.categories[0];
    
    await this.addTransaction({
      date: investor.dateReceived,
      type: TransactionType.INFLOW,
      categoryId: capitalCategory.id,
      amount: investor.amount,
      mode: PaymentMode.ACCOUNT_TRANSFER,
      description: `Investment from ${investor.investorName} (${investor.instrument})`,
      projectTag: 'Business',
      userId: 'admin' 
    });

    return newInv;
  }

  // --- Grants ---

  async getGrants() { return [...this.grants]; }

  async addGrant(grant: Omit<Grant, 'id'>) {
    const newGrant = { ...grant, id: Date.now(), amountUtilized: 0 };
    this.grants.push(newGrant);
    return newGrant;
  }

  // --- Headcount ---

  async getHeadcount() { return [...this.headcount]; }
  
  async addHeadcount(member: Omit<Headcount, 'id'>) {
     const newMember = { ...member, id: Date.now() };
     this.headcount.push(newMember);
     return newMember;
  }

  async updateHeadcount(id: number, updates: Partial<Headcount>) {
     const idx = this.headcount.findIndex(h => h.id === id);
     if (idx !== -1) {
         this.headcount[idx] = { ...this.headcount[idx], ...updates };
     }
  }

  // --- Analytics ---

  async getDashboardMetrics() {
    const currentCashBalance = this.transactions.reduce((acc, t) => {
      return t.type === TransactionType.INFLOW ? acc + t.amount : acc - t.amount;
    }, 0);

    // Calculate burn (last 3 months avg) - Mock Logic
    const monthlyBurn = this.transactions
      .filter(t => t.type === TransactionType.OUTFLOW)
      .reduce((acc, t) => acc + t.amount, 0) / 3 || 0;

    const runwayMonths = monthlyBurn > 0 ? currentCashBalance / monthlyBurn : 0;
    
    // Last month outflow
    const totalOutflowLastMonth = this.transactions
        .filter(t => t.type === TransactionType.OUTFLOW)
        .slice(0, 5) // Mock: just take recent few
        .reduce((acc, t) => acc + t.amount, 0);

    return {
      currentCashBalance,
      monthlyBurn,
      runwayMonths,
      totalOutflowLastMonth
    };
  }

  async getCategoryBreakdown() {
    const breakdown: any = {};
    this.transactions
      .filter(t => t.type === TransactionType.OUTFLOW)
      .forEach(t => {
        const cat = this.categories.find(c => c.id === t.categoryId);
        const name = cat ? cat.category : 'Uncategorized';
        breakdown[name] = (breakdown[name] || 0) + t.amount;
      });
    
    return Object.keys(breakdown).map(name => ({ name, value: breakdown[name] }));
  }

  getCategories() { return this.categories; }
  getProjectTags() { return this.projectTags; }
}

export const db = new DataStore();
