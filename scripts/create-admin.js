const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('Admin@Mealit123', 10);
  
  const existing = await prisma.user.findUnique({ where: { email: 'admin@mealit.com' } });
  if (existing) {
    await prisma.user.update({ 
      where: { email: 'admin@mealit.com' }, 
      data: { role: 'admin', password, name: 'Superadmin' } 
    });
    console.log('✅ Admin account updated!');
  } else {
    await prisma.user.create({ 
      data: { 
        email: 'admin@mealit.com', 
        name: 'Superadmin', 
        password, 
        role: 'admin', 
        allergies: [], 
        preferences: [] 
      } 
    });
    console.log('✅ Admin account created!');
  }
  
  console.log('📧 Email: admin@mealit.com');
  console.log('🔑 Password: Admin@Mealit123');
  
  await prisma.$disconnect();
}

main().catch(e => { 
  console.error('❌ Error:', e.message); 
  process.exit(1); 
});
