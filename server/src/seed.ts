import { PrismaClient } from '@prisma/client';

export default async function setupSeed(prisma: PrismaClient) {
  const count = await prisma.user.count();
  if (count > 0) return;

  console.log("Seeding database...");

  // Seed Users
  await prisma.user.create({
    data: {
      username: 'Admin',
      password: 'Admin@123',
      name: 'System Admin',
      role: 'Admin',
      isFirstLogin: true,
      permissions: JSON.stringify(['manage_users', 'view_financials', 'edit_transactions', 'manage_grants', 'manage_headcount', 'manage_capital'])
    }
  });

  await prisma.user.create({
    data: {
      username: 'Avinash',
      password: 'Avinash@123',
      name: 'Avinash Gowda',
      role: 'Founder',
      isFirstLogin: true,
      permissions: JSON.stringify(['view_financials', 'edit_transactions', 'manage_grants', 'manage_headcount', 'manage_capital'])
    }
  });
  
  await prisma.user.create({
    data: {
      username: 'Vinutha',
      password: 'Vinutha@123',
      name: 'Vinutha J',
      role: 'Founder',
      isFirstLogin: true,
      permissions: JSON.stringify(['view_financials', 'view_reports'])
    }
  });
  
  await prisma.user.create({
    data: {
      username: 'Shrikanth',
      password: 'Shrikanth@123',
      name: 'Shrikanth Rao',
      role: 'Founder',
      isFirstLogin: true,
      permissions: JSON.stringify(['view_financials', 'view_reports'])
    }
  });

  // Seed Categories
  const categories = [
    { category: 'R&D', subcategory: 'Electronics' },
    { category: 'R&D', subcategory: 'Software' },
    { category: 'IP', subcategory: 'Patents' },
    { category: 'Salaries', subcategory: 'Founders' },
    { category: 'Salaries', subcategory: 'Engineers' },
    { category: 'Infra', subcategory: 'Cloud/SaaS' },
    { category: 'Travel', subcategory: 'Business' },
    { category: 'Legal', subcategory: 'Compliance' },
    { category: 'Revenue', subcategory: 'Consulting' },
    { category: 'Revenue', subcategory: 'Product' },
    { category: 'Capital', subcategory: 'Investment' },
  ];

  for (const cat of categories) {
    await prisma.chartOfAccount.create({ data: cat });
  }

  console.log("Seeding complete.");
}
