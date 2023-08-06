import { MealUsageTypes, PrismaClient } from './src/util/generated/prisma/client';
import * as crypto from 'crypto';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

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

async function main() {
  console.log('Start seeding ...');

  // seed faker
  faker.seed(42);

  let first_user_id = undefined;

  const NUM_USERS = 10_000;
  for (let i = 0; i < NUM_USERS; i++) {
    const first_name = faker.person.firstName();
    const last_name = faker.person.lastName();

    const username = `${first_name}.${last_name}`.toLowerCase();
    const email = `${username}@zh11.ch`;

    const userID = deterministicObjectIdGenerator(email);

    if (first_user_id === undefined) first_user_id = userID;

    await prisma.user.upsert({
      create: {
        id: userID,
        name: `${first_name} ${last_name}`,
        username: username,
        email: email,
      },
      update: {},
      where: {
        id: userID,
      },
    });
  }

  const campID = deterministicObjectIdGenerator('demo_camp');
  const day1_date = new Date('2023-06-28T12:00:00.000Z');
  const day2_date = new Date('2023-06-29T12:00:00.000Z');

  await prisma.camp.upsert({
    create: {
      id: campID,
      name: 'Demo Camp',
      description: 'This is a demo camp',
      year: 2023,

      days: [
        {
          description: 'Day 1',
          notes: 'This is a note',
          date: day1_date,
        },
        {
          description: 'Day 2',
          notes: 'This is a note',
          date: day2_date,
        },
      ],

      participantCount: {
        total: 100,
      },

      campSettings: {
        exportSettings: {},
      },

      owner: {
        connect: {
          id: first_user_id,
        },
      },
    },
    update: {},
    where: {
      id: campID,
    },
  });

  const mealID = deterministicObjectIdGenerator('demo_meal_1');
  await prisma.meal.upsert({
    create: {
      id: mealID,

      name: 'Demo Meal 1',
      description: 'This is a demo meal',
      keywords: [],

      preferredMealUsageTypes: [MealUsageTypes.BREAKFAST],

      mealUsages: [
        {
          campId: campID,
          date: day1_date,
          type: MealUsageTypes.BREAKFAST,
        },
        {
          campId: campID,
          date: day2_date,
          type: MealUsageTypes.BREAKFAST,
        },
      ],

      owner: {
        connect: {
          id: first_user_id,
        },
      },

      camps: {
        connect: {
          id: campID,
        },
      },

      recipes: {
        create: {
          id: deterministicObjectIdGenerator('demo_recipe_1'),

          name: 'Demo Recipe 1',
          description: 'This is a demo recipe',
          keywords: [],

          ingredients: [
            {
              name: 'Demo Ingredient 1',
              amount: {
                value: 10,
                unit: 'g',
              },
            },

            {
              name: 'Demo Ingredient 2',
              amount: {
                value: 10,
                unit: 'dl',
              },
            },
          ],

          owner: {
            connect: {
              id: first_user_id,
            },
          },

          camps: {
            connect: {
              id: campID,
            },
          },
        },
      },
    },

    update: {},
    where: {
      id: mealID,
    },
  });

  const campID2 = deterministicObjectIdGenerator('demo_camp_2');
  await prisma.camp.upsert({
    create: {
      id: campID2,
      name: 'Demo Camp 2',
      description: 'This is a demo camp 2',
      year: 2023,

      days: [
        {
          description: 'Day 1',
          notes: 'This is a note',
          date: day2_date,
        },
      ],

      participantCount: {
        total: 100,
      },

      campSettings: {
        exportSettings: {},
      },

      owner: {
        connect: {
          id: first_user_id,
        },
      },
    },
    update: {},
    where: {
      id: campID2,
    },
  });

  const mealID2 = deterministicObjectIdGenerator('demo_meal_2');
  await prisma.meal.upsert({
    create: {
      id: mealID2,

      name: 'Demo Meal 2',
      description: 'This is a demo meal',
      keywords: [],

      preferredMealUsageTypes: [MealUsageTypes.BREAKFAST],

      mealUsages: [
        {
          campId: campID2,
          date: day2_date,
          type: MealUsageTypes.LUNCH,
        },
      ],

      owner: {
        connect: {
          id: first_user_id,
        },
      },

      camps: {
        connect: {
          id: campID2,
        },
      },

      recipes: {
        create: {
          id: deterministicObjectIdGenerator('demo_recipe_2'),

          name: 'Demo Recipe 2',
          description: 'This is a demo recipe',
          keywords: [],

          ingredients: [
            {
              name: 'Demo Ingredient 1',
              amount: {
                value: 10,
                unit: 'g',
              },
            },

            {
              name: 'Demo Ingredient 2',
              amount: {
                value: 10,
                unit: 'dl',
              },
            },

            {
              name: 'Demo Ingredient 2',
              amount: {
                value: 10,
                unit: 'dl',
              },
            },
          ],

          owner: {
            connect: {
              id: first_user_id,
            },
          },

          camps: {
            connect: {
              id: campID2,
            },
          },
        },
      },
    },

    update: {},
    where: {
      id: mealID2,
    },
  });

  console.log('Seeding finished.');
}

main()
  .then(async () => await prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
