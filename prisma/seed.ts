import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing database for clean workspace...');

  // Clear existing records
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();
  await prisma.director.deleteMany();
  await prisma.client.deleteMany();
  await prisma.auditor.deleteMany();
  await prisma.shareholder.deleteMany();
  await prisma.shareTransfer.deleteMany();
  await prisma.shareCapital.deleteMany();
  await prisma.registeredOffice.deleteMany();
  await prisma.resolution.deleteMany();
  await prisma.annualFiling.deleteMany();
  await prisma.shareCertificate.deleteMany();
  await prisma.alterationRecord.deleteMany();
  await prisma.documentTemplate.deleteMany();
  await prisma.templateField.deleteMany();

  console.log('Seeding clean default admin user...');

  // Create Default Admin User
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.create({
    data: {
      name: 'Admin Demo',
      email: 'admindemo@gmail.com',
      password: hashedPassword,
      role: 'admin',
      status: 'Active'
    }
  });

  // Create Default Client User
  const clientHashedPassword = await bcrypt.hash('user123', 10);
  await prisma.user.create({
    data: {
      name: 'User Demo',
      email: 'userdemo@gmail.com',
      password: clientHashedPassword,
      role: 'client',
      status: 'Active'
    }
  });

  console.log('Database cleared and default users seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });