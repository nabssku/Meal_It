import { PrismaClient } from '@prisma/client';
import { PrismaNeonHttp } from '@prisma/adapter-neon';
import bcrypt from 'bcryptjs';

const DATABASE_URL = process.env.DATABASE_URL!;

async function main() {
  const adapter = new PrismaNeonHttp(DATABASE_URL, { arrayMode: false, fullResults: true });
  const prisma = new PrismaClient({ adapter } as any);

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
  
  console.log('');
  console.log('📧 Email   : admin@mealit.com');
  console.log('🔑 Password: Admin@Mealit123');
  
  await prisma.$disconnect();
}

main().catch(e => { 
  console.error('❌ Error:', e.message); 
  process.exit(1); 
});
