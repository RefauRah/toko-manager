export type UserRole = "owner" | "manager" | "cashier";
export type SubscriptionTier = "free" | "pro" | "enterprise";
export type AdminRole = "super_admin" | "admin" | "support";

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  created_at: string;
}

export interface Store {
  id: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  subscription_tier: SubscriptionTier;
  subscription_expires_at?: string | null;
  is_suspended: boolean;
  created_at: string;
}

export interface StoreMember {
  id: string;
  store_id: string;
  user_id: string;
  role: UserRole;
  is_active: boolean;
  joined_at: string;
}

export interface Product {
  id: string;
  store_id: string;
  category_id?: string | null;
  category_name?: string | null;
  name: string;
  sku?: string | null;
  purchase_price: number;
  selling_price: number;
  stock_quantity: number;
  min_stock_alert: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductCategory {
  id: string;
  store_id: string;
  name: string;
  description?: string | null;
  created_at: string;
}

export interface TransactionItem {
  id: string;
  transaction_id: string;
  product_id?: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  purchase_price: number;
  subtotal: number;
}

export interface Transaction {
  id: string;
  store_id: string;
  cashier_id?: string | null;
  cashier_name?: string | null;
  invoice_number: string;
  total_amount: number;
  discount_amount: number;
  final_amount: number;
  payment_method: "cash" | "transfer" | "ewallet";
  paid_amount: number;
  change_amount: number;
  notes?: string | null;
  created_at: string;
  items?: TransactionItem[];
}

export interface ExpenseCategory {
  id: string;
  store_id: string;
  name: string;
  is_default: boolean;
  created_at: string;
}

export interface Expense {
  id: string;
  store_id: string;
  category_id?: string | null;
  category_name?: string | null;
  amount: number;
  description: string;
  expense_date: string;
  created_by?: string | null;
  creator_name?: string | null;
  created_at: string;
}

export interface Employee {
  id: string;
  store_id: string;
  user_id?: string | null;
  name: string;
  phone?: string | null;
  position: string;
  base_salary: number;
  join_date: string;
  is_active: boolean;
  created_at: string;
}

export interface Attendance {
  id: string;
  employee_id: string;
  employee_name?: string;
  store_id: string;
  date: string;
  check_in?: string | null;
  check_out?: string | null;
  overtime_hours: number;
  status: "present" | "absent" | "sick" | "leave";
  notes?: string | null;
}

export interface SalaryPayment {
  id: string;
  employee_id: string;
  employee_name?: string;
  employee_position?: string;
  store_id: string;
  year: number;
  month: number;
  base_salary: number;
  overtime_pay: number;
  deductions: number;
  deduction_notes?: string | null;
  total_salary: number;
  payment_date?: string | null;
  status: "pending" | "paid";
  paid_by?: string | null;
  created_at: string;
}

export interface SubscriptionPayment {
  id: string;
  store_id: string;
  store_name?: string;
  tier: "pro" | "enterprise";
  amount: number;
  payment_proof?: string | null;
  bank_name?: string | null;
  account_number?: string | null;
  account_holder?: string | null;
  status: "pending" | "confirmed" | "rejected";
  notes?: string | null;
  confirmed_by?: string | null;
  period_start?: string | null;
  period_end?: string | null;
  created_at: string;
}

export interface AuthSession {
  user: {
    id: string;
    name: string;
    email: string;
  };
  store?: {
    id: string;
    name: string;
    tier: SubscriptionTier;
    expires_at?: string | null;
    is_suspended: boolean;
    role: UserRole;
  } | null;
  isPlatformAdmin?: boolean;
  adminRole?: AdminRole | null;
}
