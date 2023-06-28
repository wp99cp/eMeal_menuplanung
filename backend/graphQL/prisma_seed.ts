import { MealUsageTypes, Prisma, PrismaClient } from './src/util/generated/prisma/client';
import * as crypto from 'crypto';
import { hashSync } from 'bcrypt';
import CampExtension from './src/util/prisma/extensions/CampExtension';

const prisma = new PrismaClient().$extends(CampExtension);

/**
 *
 * Create a deterministic BSON ObjectId-like string for a given key.
 *
 * This function generates an id in a deterministic manner based on the provided key.
 * The same key will always produce the same id, allowing for deterministic seeding
 * of the database. The generated id is a 12-byte BSON type encoded as a hexadecimal
 * string.
 *
 * Note: This key generator is intended for mock data creation and
 * should not be used in production.
 *
 *
 * @param key The key used to generate the id. Repeated calls with the same key
 * will produce the same id.
 *
 * @returns The generated id as a hexadecimal string.
 *
 */
const deterministicObjectIdGenerator = (key: string) => {
  // fixed timestamp to generate the objectId: 2023-06-28T12:00:00.000Z
  const FIXED_TIMESTAMP = new Date('2023-06-28T12:00:00.000Z');

  const timestamp = Math.floor(FIXED_TIMESTAMP.getTime() / 1000);
  const hash = crypto.createHash('sha256').update(key).digest('base64').substring(0, 8);

  const twelveByteObjectId = Buffer.alloc(12);
  twelveByteObjectId.writeUInt32BE(timestamp, 0);
  twelveByteObjectId.write(hash, 4, 8, 'base64');

  return twelveByteObjectId.toString('hex');
};

const createDemoUsers = async (number_of_users: number) => {
  const DEMO_USER_PASSWORD = 'demo_user_123';

  const ids = [];

  for (let i = 1; i <= number_of_users; i++) {
    const username = `demo_user_${i}`;
    const email = `${username}@demo.emeal.ch`;
    const name = `Demo User ${i}`;

    const id = deterministicObjectIdGenerator(username);

    const data: Prisma.UserCreateInput = {
      email,
      name,
      username,
      emailVerified: new Date(),
      registeredAt: new Date(),
    };

    await prisma.user.upsert({
      where: { id },
      update: data,
      create: {
        id,
        ...data,
        accounts: {
          create: {
            provider: 'email',
            providerAccountId: email,
            type: 'credentials',
            // this is the hash of the password using the bcrypt algorithm
            password: hashSync(DEMO_USER_PASSWORD, 10),
            emailVerified: true,
          },
        },
      },
    });

    ids.push(id);
  }

  return ids;
};

const REALISTIC_CAMP_NAMES = [
  'Sommerlager 2023',
  'Pfila 2023 - Sinai',
  'HELA Cevi Züri 11',
];

const createMeal = async (campId: string, date: string, type: MealUsageTypes) => {
  const meal_name = 'Demo Meal 1';
  const owner_email = 'demo_user_1@demo.emeal.ch';

  const id = deterministicObjectIdGenerator(meal_name);

  const data: Prisma.MealCreateInput = {
    name: meal_name,
    description: 'This is a demo camp.',
    mealUsages: {
      campId: campId,
      date: date,
      type: type,
    },
  };

  await prisma.meal.upsert({
    where: { id: id },
    update: data,
    create: {
      id: id,
      ...data,
      owner: {
        connect: { email: owner_email },
      },
      camps: {
        connect: { id: campId },
      },
    },
  });

  return id;
};

async function main() {
  const ids = await createDemoUsers(4);

  const camp_name = REALISTIC_CAMP_NAMES[0];

  const camp = await prisma.camp.createCamp(camp_name, ids[0], {
    id: deterministicObjectIdGenerator(camp_name),
    description: 'This is a demo camp.',
  });

  const { id } = await prisma.camp.createCamp(REALISTIC_CAMP_NAMES[1], ids[0]);
  const camp_data = await prisma.camp.findUnique({ where: { id } });

  console.log(typeof camp_data);

  //         const id = deterministicObjectIdGenerator(camp_name);
  // const campId = await createCamp(camp_name, dates);
  // console.log(`Created demo camp with id ${campId}`);

  // const mealId = await createMeal(campId, dates[0], MealUsageTypes.BREAKFAST);
}

main()
  .then(async () => await prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
