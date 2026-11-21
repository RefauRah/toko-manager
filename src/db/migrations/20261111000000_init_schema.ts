import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // Users table
  await knex.schema.createTable("users", (table) => {
    table.string("id").primary();
    table.string("name").notNullable();
    table.string("email").notNullable().unique();
    table.string("password_hash").notNullable();
    table.string("image").nullable();
    table.timestamps(true, true);
  });

  // Stores table
  await knex.schema.createTable("stores", (table) => {
    table.string("id").primary();
    table.string("name").notNullable();
    table.string("address").nullable();
    table.string("phone").nullable();
    table.string("subscription_tier").defaultTo("free"); // free, pro, enterprise
    table.date("subscription_expires_at").nullable();
    table.boolean("is_suspended").defaultTo(false);
    table.timestamps(true, true);
  });

  // Store members table
  await knex.schema.createTable("store_members", (table) => {
    table.string("id").primary();
    table.string("store_id").notNullable().references("id").inTable("stores").onDelete("CASCADE");
    table.string("user_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
    table.string("role").notNullable().defaultTo("cashier"); // owner, manager, cashier
    table.boolean("is_active").defaultTo(true);
    table.timestamp("joined_at").defaultTo(knex.fn.now());
  });

  // Product categories table
  await knex.schema.createTable("product_categories", (table) => {
    table.string("id").primary();
    table.string("store_id").notNullable().references("id").inTable("stores").onDelete("CASCADE");
    table.string("name").notNullable();
    table.string("description").nullable();
    table.timestamps(true, true);
  });

  // Products table
  await knex.schema.createTable("products", (table) => {
    table.string("id").primary();
    table.string("store_id").notNullable().references("id").inTable("stores").onDelete("CASCADE");
    table.string("category_id").nullable().references("id").inTable("product_categories").onDelete("SET NULL");
    table.string("name").notNullable();
    table.string("sku").nullable();
    table.decimal("purchase_price", 14, 2).notNullable().defaultTo(0);
    table.decimal("selling_price", 14, 2).notNullable().defaultTo(0);
    table.integer("stock_quantity").notNullable().defaultTo(0);
    table.integer("min_stock_alert").notNullable().defaultTo(5);
    table.boolean("is_active").defaultTo(true);
    table.timestamps(true, true);
  });

  // Stock movements table
  await knex.schema.createTable("stock_movements", (table) => {
    table.string("id").primary();
    table.string("product_id").notNullable().references("id").inTable("products").onDelete("CASCADE");
    table.string("store_id").notNullable().references("id").inTable("stores").onDelete("CASCADE");
    table.string("type").notNullable(); // in, out, adjustment
    table.integer("quantity").notNullable();
    table.string("reference").nullable();
    table.string("notes").nullable();
    table.string("created_by").nullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });

  // Transactions table
  await knex.schema.createTable("transactions", (table) => {
    table.string("id").primary();
    table.string("store_id").notNullable().references("id").inTable("stores").onDelete("CASCADE");
    table.string("cashier_id").nullable().references("id").inTable("users");
    table.string("invoice_number").notNullable().unique();
    table.decimal("total_amount", 14, 2).notNullable();
    table.decimal("discount_amount", 14, 2).defaultTo(0);
    table.decimal("final_amount", 14, 2).notNullable();
    table.string("payment_method").defaultTo("cash"); // cash, transfer, ewallet
    table.decimal("paid_amount", 14, 2).defaultTo(0);
    table.decimal("change_amount", 14, 2).defaultTo(0);
    table.string("notes").nullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });

  // Transaction items table
  await knex.schema.createTable("transaction_items", (table) => {
    table.string("id").primary();
    table.string("transaction_id").notNullable().references("id").inTable("transactions").onDelete("CASCADE");
    table.string("product_id").nullable().references("id").inTable("products").onDelete("SET NULL");
    table.string("product_name").notNullable();
    table.integer("quantity").notNullable();
    table.decimal("unit_price", 14, 2).notNullable();
    table.decimal("purchase_price", 14, 2).notNullable();
    table.decimal("subtotal", 14, 2).notNullable();
  });

  // Expense categories table
  await knex.schema.createTable("expense_categories", (table) => {
    table.string("id").primary();
    table.string("store_id").notNullable().references("id").inTable("stores").onDelete("CASCADE");
    table.string("name").notNullable();
    table.boolean("is_default").defaultTo(false);
    table.timestamps(true, true);
  });

  // Expenses table
  await knex.schema.createTable("expenses", (table) => {
    table.string("id").primary();
    table.string("store_id").notNullable().references("id").inTable("stores").onDelete("CASCADE");
    table.string("category_id").nullable().references("id").inTable("expense_categories").onDelete("SET NULL");
    table.decimal("amount", 14, 2).notNullable();
    table.string("description").notNullable();
    table.date("expense_date").notNullable();
    table.string("created_by").nullable();
    table.timestamps(true, true);
  });

  // Employees table
  await knex.schema.createTable("employees", (table) => {
    table.string("id").primary();
    table.string("store_id").notNullable().references("id").inTable("stores").onDelete("CASCADE");
    table.string("user_id").nullable().references("id").inTable("users").onDelete("SET NULL");
    table.string("name").notNullable();
    table.string("phone").nullable();
    table.string("position").notNullable();
    table.decimal("base_salary", 14, 2).notNullable().defaultTo(0);
    table.date("join_date").notNullable();
    table.boolean("is_active").defaultTo(true);
    table.timestamps(true, true);
  });

  // Attendance table
  await knex.schema.createTable("attendance", (table) => {
    table.string("id").primary();
    table.string("employee_id").notNullable().references("id").inTable("employees").onDelete("CASCADE");
    table.string("store_id").notNullable().references("id").inTable("stores").onDelete("CASCADE");
    table.date("date").notNullable();
    table.string("check_in").nullable();
    table.string("check_out").nullable();
    table.decimal("overtime_hours", 5, 2).defaultTo(0);
    table.string("status").defaultTo("present"); // present, absent, sick, leave
    table.string("notes").nullable();
  });

  // Salary payments table
  await knex.schema.createTable("salary_payments", (table) => {
    table.string("id").primary();
    table.string("employee_id").notNullable().references("id").inTable("employees").onDelete("CASCADE");
    table.string("store_id").notNullable().references("id").inTable("stores").onDelete("CASCADE");
    table.integer("year").notNullable();
    table.integer("month").notNullable(); // 1-12
    table.decimal("base_salary", 14, 2).notNullable();
    table.decimal("overtime_pay", 14, 2).defaultTo(0);
    table.decimal("deductions", 14, 2).defaultTo(0);
    table.string("deduction_notes").nullable();
    table.decimal("total_salary", 14, 2).notNullable();
    table.date("payment_date").nullable();
    table.string("status").defaultTo("pending"); // pending, paid
    table.string("paid_by").nullable();
    table.timestamps(true, true);
  });

  // Subscription payments table
  await knex.schema.createTable("subscription_payments", (table) => {
    table.string("id").primary();
    table.string("store_id").notNullable().references("id").inTable("stores").onDelete("CASCADE");
    table.string("tier").notNullable(); // pro, enterprise
    table.decimal("amount", 14, 2).notNullable();
    table.string("payment_proof").nullable(); // image / path
    table.string("bank_name").nullable();
    table.string("account_number").nullable();
    table.string("account_holder").nullable();
    table.string("status").defaultTo("pending"); // pending, confirmed, rejected
    table.string("notes").nullable();
    table.string("confirmed_by").nullable();
    table.date("period_start").nullable();
    table.date("period_end").nullable();
    table.timestamps(true, true);
  });

  // Platform admins table
  await knex.schema.createTable("platform_admins", (table) => {
    table.string("id").primary();
    table.string("user_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
    table.string("role").defaultTo("admin"); // super_admin, admin, support
    table.boolean("is_active").defaultTo(true);
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });

  // Platform settings table
  await knex.schema.createTable("platform_settings", (table) => {
    table.string("id").primary();
    table.string("key").notNullable().unique();
    table.text("value").notNullable();
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });

  // Platform announcements table
  await knex.schema.createTable("platform_announcements", (table) => {
    table.string("id").primary();
    table.string("title").notNullable();
    table.text("message").notNullable();
    table.string("target").defaultTo("all"); // all, free, pro, enterprise
    table.boolean("is_active").defaultTo(true);
    table.string("created_by").nullable();
    table.date("expires_at").nullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("platform_announcements");
  await knex.schema.dropTableIfExists("platform_settings");
  await knex.schema.dropTableIfExists("platform_admins");
  await knex.schema.dropTableIfExists("subscription_payments");
  await knex.schema.dropTableIfExists("salary_payments");
  await knex.schema.dropTableIfExists("attendance");
  await knex.schema.dropTableIfExists("employees");
  await knex.schema.dropTableIfExists("expenses");
  await knex.schema.dropTableIfExists("expense_categories");
  await knex.schema.dropTableIfExists("transaction_items");
  await knex.schema.dropTableIfExists("transactions");
  await knex.schema.dropTableIfExists("stock_movements");
  await knex.schema.dropTableIfExists("products");
  await knex.schema.dropTableIfExists("product_categories");
  await knex.schema.dropTableIfExists("store_members");
  await knex.schema.dropTableIfExists("stores");
  await knex.schema.dropTableIfExists("users");
}
