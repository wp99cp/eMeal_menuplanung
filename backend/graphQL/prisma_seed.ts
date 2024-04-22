import { Prisma, PrismaClient } from './src/util/generated/prisma/client';
import { faker } from '@faker-js/faker';

const logging = (...message: unknown[]) => {
  // eslint-disable-next-line no-console
  console.log(...message);
};

/**
 * Create a number of users with random data.
 *
 * @param prisma The prisma client.
 * @param num_users The number of users to create.
 *
 * @returns An array of user ids.
 */
async function createUsers(prisma: PrismaClient, num_users: number) {
  const uids: string[] = [];

  const promises = [];
  for (let i = 0; i < num_users; i++) {
    const first_name = faker.person.firstName();
    const last_name = faker.person.lastName();

    const username = `${first_name}.${last_name}`.toLowerCase();
    const email = `${username}@emeal.ch`;

    const userID = faker.string.uuid();

    uids.push(userID);
    promises.push(
      prisma.user.upsert({
        create: {
          id: userID,
          name: `${first_name} ${last_name}`,
          username: username,
          email: email,
          isHiddenUser: faker.datatype.boolean(),
          shareEmail: faker.datatype.boolean(),
        },
        update: {},
        where: {
          id: userID,
        },
      })
    );
  }

  await Promise.all(promises);
  return uids;
}

async function create_camp(
  prisma: PrismaClient,
  ownerID: string,
  campIds: string[],
  camp_day_map: Map<string, Date[]>
) {
  const campID = faker.string.uuid();
  campIds.push(campID);

  const participantCount = faker.number.int({ min: 0, max: 100 });
  const veganCount = faker.number.int({ min: 0, max: participantCount });
  const vegetarianCount = faker.number.int({
    min: 0,
    max: participantCount - veganCount,
  });

  await prisma.camp.upsert({
    create: {
      id: campID,
      name: faker.company.name(),
      description: faker.company.catchPhrase(),
      year: faker.date.future().getFullYear(),

      owner: {
        connect: {
          id: ownerID,
        },
      },

      participantCount: {
        create: {
          participantCount: participantCount,
          veganCount: veganCount,
          vegetarianCount: vegetarianCount,
        },
      },
    },
    update: {},
    where: {
      id: campID,
    },
  });

  const day_count = faker.number.int({ min: 0, max: 10 });
  let date = faker.date.future();
  const dates: Date[] = [];
  const days_promises = [];
  for (let o = 0; o < day_count; o++) {
    // increment date by one day
    date = new Date(date);
    date.setDate(date.getDate() + 1);

    const dayID = faker.string.uuid();
    dates.push(date);

    days_promises.push(
      prisma.day.upsert({
        create: {
          id: dayID,
          date: date,
          campId: campID,
        },
        update: {},
        where: {
          id: dayID,
        },
      })
    );
  }

  await Promise.all(days_promises);
  camp_day_map.set(campID, dates);
}

async function create_user_data(prisma: PrismaClient, uid: string) {
  const campIds: string[] = [];
  const camp_count = faker.number.int({ min: 0, max: 10 });

  const camp_day_map = new Map<string, Date[]>();

  // create camps in parallel
  const camp_promises = [];
  for (let i = 0; i < camp_count; i++) {
    camp_promises.push(create_camp(prisma, uid, campIds, camp_day_map));
  }
  await Promise.all(camp_promises);

  const mealIds: string[] = [];
  const ingredients: Prisma.IngredientCreateManyInput[] = [];

  const meal_count = faker.number.int({ min: 0, max: 20 });
  for (let i = 0; i < meal_count; i++) {
    const mealID = faker.string.uuid();
    mealIds.push(mealID);

    // create recipes
    const recipes: Prisma.RecipeCreateManyInput[] = [];
    const recipe_count = faker.number.int({ min: 0, max: 10 });
    for (let k = 0; k < recipe_count; k++) {
      const recipeID = faker.string.uuid();
      recipes.push({
        id: recipeID,
        name: faker.food.dish(),
        description: faker.food.description(),
        mealId: mealID,
      });

      const ingredient_count = faker.number.int({ min: 0, max: 20 });
      for (let j = 0; j < ingredient_count; j++) {
        ingredients.push({
          name: faker.food.ingredient(),
          amount: faker.number.float({ min: 0, max: 100 }),
          unit: faker.helpers.arrayElement(['g', 'kg', 'ml', 'l', 'pcs']),

          order: j,
          recipeId: recipeID,
        });
      }
    }

    await prisma.meal.upsert({
      create: {
        id: mealID,
        name: faker.food.dish(),
        description: faker.food.description(),

        ownerId: uid,

        keywords: [
          faker.food.ingredient(),
          faker.food.ingredient(),
          faker.food.ingredient(),
        ],
      },
      update: {},
      where: {
        id: mealID,
      },
    });

    await Promise.all(
      recipes.map((r) =>
        prisma.recipe.upsert({
          create: r,
          update: {},
          where: {
            id: r.id,
          },
        })
      )
    );

    await Promise.all(
      ingredients.map((i) =>
        prisma.ingredient.upsert({
          create: i,
          update: {},
          where: {
            recipeId_order: {
              order: i.order as number,
              recipeId: i.recipeId as string,
            },
          },
        })
      )
    );

    // generate random pairs between mealIds and campIds
    if (campIds.length === 0) continue;
    const pairs: [string, string][] = faker.helpers.shuffle(
      mealIds.map((mealId) =>
        faker.helpers.arrayElement(campIds.map((campId) => [mealId, campId]))
      )
    );

    const ingredients_promises = [];
    for (const [mealId, campId] of pairs) {
      const mealUsageId = faker.string.uuid();

      const dates = camp_day_map.get(campId) as Date[];
      if (dates.length === 0) continue;

      const date = faker.helpers.arrayElement(dates);

      ingredients_promises.push(
        prisma.mealUsage.upsert({
          create: {
            id: mealUsageId,
            mealId: mealId,
            campId: campId,
            date: date,
          },
          update: {},
          where: {
            id: mealUsageId,
          },
        })
      );
    }
    await Promise.all(ingredients_promises);
  }
}

async function main() {
  logging('Start seeding ...');

  faker.seed(42); // for deterministic data

  const prisma = new PrismaClient();

  // check if there is data in the database
  const userCount = await prisma.user.count();
  if (userCount > 0) {
    logging('Database already seeded.');
    return prisma;
  }

  // create users in parallel
  const uids: string[] = await createUsers(prisma, 1_000);
  await Promise.all(uids.map((uid) => create_user_data(prisma, uid)));

  logging('Seeding finished.');

  return prisma;
}

main()
  .then(async (prisma) => await prisma.$disconnect())
  .catch(async (e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  });
