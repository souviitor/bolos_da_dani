// prisma/seed.ts
import { PrismaClient, Category } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  await prisma.user.upsert({
    where: { email: 'admin@bolosdadani.com' },
    update: {},
    create: {
      email: 'admin@bolosdadani.com',
      password: hashedPassword,
      name: 'Dani',
      role: 'ADMIN',
    },
  });

  // Create default settings
  await prisma.settings.upsert({
    where: { key: 'pix_key' },
    update: {},
    create: { key: 'pix_key', value: '11999999999' },
  });

  await prisma.settings.upsert({
    where: { key: 'whatsapp_number' },
    update: {},
    create: { key: 'whatsapp_number', value: '5511999999999' },
  });

  await prisma.settings.upsert({
    where: { key: 'pix_name' },
    update: {},
    create: { key: 'pix_name', value: 'Danielle Oliveira' },
  });

  // Create sample products
  const products = [
    {
      name: 'Bolo de Chocolate Belga',
      description: 'Bolo úmido de chocolate belga com ganache cremosa e raspas de chocolate. Recheado com brigadeiro gourmet e cobertura de trufa.',
      price: 89.90,
      imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop',
      category: Category.CAKE,
    },
    {
      name: 'Bolo Red Velvet',
      description: 'Clássico bolo red velvet com cream cheese frosting, macio e aveludado. Decorado com migalhas vermelhas e flores comestíveis.',
      price: 95.00,
      imageUrl: 'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?w=400&h=300&fit=crop',
      category: Category.CAKE,
    },
    {
      name: 'Coxinha de Frango',
      description: 'Coxinha artesanal recheada com frango desfiado temperado e catupiry. Massa levinha e crocante por fora, cremosa por dentro.',
      price: 7.50,
      imageUrl: 'https://images.unsplash.com/photo-1625937286074-9ca519d5d9df?w=400&h=300&fit=crop',
      category: Category.SAVORY,
    },
    {
      name: 'Pão de Queijo Artesanal',
      description: 'Pão de queijo mineiro tradicional, feito com polvilho azedo e queijo meia-cura. Crocante por fora, macio e puxento por dentro.',
      price: 5.00,
      imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=300&fit=crop',
      category: Category.BREAD,
    },
    {
      name: 'Bolo de Morango com Chantilly',
      description: 'Bolo branco e fofo recheado com morangos frescos e chantilly artesanal. Decorado com morangos inteiros e calda especial.',
      price: 85.00,
      imageUrl: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=300&fit=crop',
      category: Category.CAKE,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.name },
      update: {},
      create: product,
    }).catch(() => prisma.product.create({ data: product }));
  }

  console.log('✅ Seed completed successfully!');
  console.log('📧 Admin email: admin@bolosdadani.com');
  console.log('🔑 Admin password: admin123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
