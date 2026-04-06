require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  const studentPassword = await bcrypt.hash('student123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@gmail.com' },
    update: { passwordHash: adminPassword, role: 'admin' },
    create: {
      name: 'Admin User',
      email: 'admin@gmail.com',
      passwordHash: adminPassword,
      role: 'admin'
    }
  });

  const student = await prisma.user.upsert({
    where: { email: 'student@gmail.com' },
    update: { passwordHash: studentPassword, role: 'student', rollNo: 'S001' },
    create: {
      name: 'Student User',
      email: 'student@gmail.com',
      rollNo: 'S001',
      passwordHash: studentPassword,
      role: 'student'
    }
  });

  console.log('Admin:', admin.email, 'admin123');
  console.log('Student:', student.email, 'student123');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
