
export enum TransactionType {
  INFLOW = 'INFLOW',
  OUTFLOW = 'OUTFLOW',
}

export enum PaymentMode {
  UPI = 'UPI',
  CREDIT_CARD = 'Credit Card',
  ACCOUNT_TRANSFER = 'Account Transfer',
  OTHER = 'Other',
}

export interface ChartOfAccount {
  id: number;
  category: string;
  subcategory?: string;
  notes?: string;
}

export interface Grant {
  id: number;
  name: string;
  totalSanctioned: number;
  amountReceived: number;
  amountUtilized: number;
  deadline?: string;
  notes?: string;
}

export interface InvestorCapital {
  id: number;
  investorName: string;
  dateReceived: string;
  amount: number;
  instrument: string; // iSAFE, Equity, Grant, CCD
  usageNotes?: string;
}

export interface Headcount {
  id: number;
  name: string;
  role: string;
  ctcMonthly: number;
  startDate: string;
  allocationPercent: number;
  notes?: string;
}

export interface Transaction {
  id: number;
  date: string;
  type: TransactionType;
  categoryId: number;
  vendor?: string;
  description?: string;
  amount: number;
  mode: PaymentMode | string;
  projectTag?: string;
  grantId?: number | null;
  receiptUrl?: string;
  userId?: string; // For RLS
  createdAt: string;
}

export interface DashboardMetrics {
  currentCashBalance: number;
  monthlyBurn: number;
  runwayMonths: number;
  totalOutflowLastMonth: number;
}

// --- Auth & User Management ---

export interface User {
  id: string;
  username: string; // Used for login
  password?: string; // Mock password storage
  name: string;
  role: string;
  email?: string;
  phone?: string;
  isFirstLogin: boolean;
  permissions: string[];
}

export interface RoleDefinition {
  name: string;
  permissions: string[];
}

export const PERMISSIONS = {
  MANAGE_USERS: 'manage_users',
  VIEW_FINANCIALS: 'view_financials', // View all financials
  VIEW_OWN_FINANCIALS: 'view_own_financials', // View only own entries
  EDIT_TRANSACTIONS: 'edit_transactions',
  VIEW_REPORTS: 'view_reports',
  MANAGE_GRANTS: 'manage_grants',
  MANAGE_HEADCOUNT: 'manage_headcount',
  MANAGE_CAPITAL: 'manage_capital'
};

// Permission Sets
export const READ_ONLY_PERMISSIONS = [
  PERMISSIONS.VIEW_FINANCIALS,
  PERMISSIONS.VIEW_REPORTS
];

export const WRITE_ACCESS_PERMISSIONS = [
  PERMISSIONS.VIEW_FINANCIALS,
  PERMISSIONS.VIEW_REPORTS,
  PERMISSIONS.EDIT_TRANSACTIONS,
  PERMISSIONS.MANAGE_GRANTS,
  PERMISSIONS.MANAGE_HEADCOUNT,
  PERMISSIONS.MANAGE_CAPITAL
];

export const LIMITED_USER_PERMISSIONS = [
  PERMISSIONS.VIEW_OWN_FINANCIALS,
  PERMISSIONS.EDIT_TRANSACTIONS // Can add/edit own
];

export const ADMIN_PERMISSIONS = [
  ...WRITE_ACCESS_PERMISSIONS,
  PERMISSIONS.MANAGE_USERS
];