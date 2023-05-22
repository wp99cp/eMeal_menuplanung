import { PrismaClient } from './src/util/generated/prisma/client';

const prisma = new PrismaClient();

async function main() {
  // insert the user:  demo_user
  // with the password: demo-user_Pass$123

  await prisma.user.upsert({
    where: { username: 'demo_user' },
    update: {},
    create: {
      email: 'demo_user@exampe.com',
      name: 'Alice',
      username: 'demo_user',
      emailVerified: new Date(),
      registeredAt: new Date(),
      accounts: {
        create: {
          provider: 'email',
          providerAccountId: 'demo_user@exampe.com',
          type: 'credentials',
          // this is the hash of the password using the bcrypt algorithm
          password: '$2a$10$wYEBRL32xUxvG7Qzo0h8p.gIbgzt4GnMbUahm3nHu97LVNWAfMxOS',
          emailVerified: true,
        },
      },
    },
  });
}

main()
  .then(async () => await prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
