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
import { api } from './api';

// --- Roles Static Definition ---
const INITIAL_ROLES: RoleDefinition[] = [
  { name: 'Admin', permissions: ADMIN_PERMISSIONS },
  { name: 'Founder', permissions: WRITE_ACCESS_PERMISSIONS },
  { name: 'Viewer', permissions: READ_ONLY_PERMISSIONS },
  { name: 'Employee', permissions: LIMITED_USER_PERMISSIONS },
  { name: 'Manager', permissions: LIMITED_USER_PERMISSIONS },
];

class DataStore {
  private roles: RoleDefinition[] = INITIAL_ROLES;
  private projectTags: string[] = ['Business', 'VoltEdge', 'EcoTrace360', 'VoltVault', 'EcoMetrics', 'EcoMetricsESG'];
  private categoriesCache: ChartOfAccount[] = [];

  constructor() {
    this.refreshCategories();
  }

  private async refreshCategories() {
    try {
        const cats = await api.get('/chart-of-accounts');
        if (cats && Array.isArray(cats)) {
          this.categoriesCache = cats;
        }
    } catch (e) { console.error("Failed to load categories", e); }
  }

  // --- Auth & User Methods ---
  
  async authenticate(username: string, password: string): Promise<User | null> {
    try {
      const result = await api.post('/login', { username, password });
      return result;
    } catch (e) {
      return null;
    }
  }

  async updateUserProfile(id: string, updates: Partial<User>) {
    console.warn("User update API not fully implemented in MVP");
    return true;
  }

  async updateUserPermissions(id: string, permissions: string[]) {
     console.warn("User perm update API not fully implemented in MVP");
  }

  async changePassword(id: string, newPassword: string) {
     console.warn("Password change API not fully implemented in MVP");
  }

  async resetPasswordRequest(usernameOrEmail: string): Promise<boolean> {
     return true; // Mock
  }

  // --- User Management (Admin) ---
  
  async getUsers() { 
      try {
        const users = await api.get('/users');
        return Array.isArray(users) ? users : [];
      } catch(e) { return []; }
  }
  
  async addUser(user: Omit<User, 'id'>) {
      console.warn("Add user API not fully implemented in MVP");
      return { ...user, id: 'temp' };
  }
  
  async deleteUser(id: string) {
      console.warn("Delete user API not fully implemented in MVP");
  }

  getRoles() { return this.roles; }

  // --- Transactions ---
  async getTransactions(user?: User, filter?: { type?: TransactionType, projectTag?: string, categoryId?: number }) {
    const params: any = {};
    if (user && !user.permissions.includes(PERMISSIONS.VIEW_FINANCIALS)) {
        params.userId = user.id;
    }
    if (filter?.type) params.type = filter.type;
    if (filter?.projectTag) params.projectTag = filter.projectTag;
    if (filter?.categoryId) params.categoryId = filter.categoryId;

    const txs = await api.get('/transactions', params);
    
    // Map backend response to Frontend types
    // Amount comes as string from Prisma Decimal, convert to Number
    return txs.map((t: any) => ({
        ...t,
        amount: Number(t.amount),
        date: new Date(t.date).toISOString().split('T')[0] // normalize
    }));
  }

  async addTransaction(tx: Omit<Transaction, 'id' | 'createdAt'>) {
    const newTx = await api.post('/transactions', tx);
    
    // Check Project Tags
    if (tx.projectTag && !this.projectTags.includes(tx.projectTag)) {
        this.projectTags.push(tx.projectTag);
    }
    return newTx;
  }

  async deleteTransaction(id: number) {
     await api.delete(`/transactions/${id}`);
  }

  // --- Investors ---
  async getInvestors() { 
      const inv = await api.get('/investors');
      return inv.map((i: any) => ({...i, amount: Number(i.amount)}));
  }

  async addInvestor(investor: Omit<InvestorCapital, 'id'>) {
    const newInv = await api.post('/investors', investor);
    
    // Create linked transaction
    const categories = this.getCategories();
    let capitalCategory = categories.find(c => c.category === 'Capital');
    
    // Fallback if cache empty or category not found
    if (!capitalCategory) {
       capitalCategory = { id: 11, category: 'Capital', subcategory: 'Investment' }; 
    }

    await this.addTransaction({
      date: investor.dateReceived,
      type: TransactionType.INFLOW,
      categoryId: capitalCategory.id,
      amount: investor.amount,
      mode: PaymentMode.ACCOUNT_TRANSFER,
      description: `Investment from ${investor.investorName} (${investor.instrument})`,
      projectTag: 'Business',
      userId: 'admin' // In real app use current user
    } as any);

    return newInv;
  }

  // --- Grants ---
  async getGrants() { 
      const grants = await api.get('/grants');
      return grants.map((g: any) => ({
          ...g,
          totalSanctioned: Number(g.totalSanctioned),
          amountReceived: Number(g.amountReceived),
          amountUtilized: Number(g.amountUtilized)
      }));
  }

  async addGrant(grant: Omit<Grant, 'id'>) {
    return await api.post('/grants', grant);
  }

  // --- Headcount ---
  async getHeadcount() { 
      const hc = await api.get('/headcount');
      return hc.map((h: any) => ({ ...h, ctcMonthly: Number(h.ctcMonthly) }));
  }
  
  async addHeadcount(member: Omit<Headcount, 'id'>) {
     return await api.post('/headcount', member);
  }

  async updateHeadcount(id: number, updates: Partial<Headcount>) {
     // Placeholder for PUT functionality
     console.log("Updated HC", id, updates);
  }

  // --- Analytics ---
  async getDashboardMetrics() {
    return await api.get('/dashboard/metrics');
  }

  async getCategoryBreakdown() {
    return await api.get('/dashboard/breakdown');
  }

  getCategories() { return this.categoriesCache; }
  getProjectTags() { return this.projectTags; }
}

export const db = new DataStore();
