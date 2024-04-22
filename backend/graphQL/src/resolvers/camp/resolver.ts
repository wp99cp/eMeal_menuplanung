import { Camp, CampDay, MealUsageType, Resolvers } from '@/util/generated/types/graphql';
import { MealUsage } from '@prisma/client';

const getMealUsageGraphqlType = (mealUsage?: MealUsage): MealUsageType => {
  throw new Error('Unknown meal usage type');
};

export const campResolvers: Resolvers = {
  CampDay: {
    meals: async (parent: CampDay, _, context) => {
      // retrieve campId from parent object
      // this is a bit hacky, as it brakes the type safety of the generated types
      if (!('campId' in parent)) throw new Error('CampDay is missing campId field');
      const camp_id = parent.campId as string;

      const { prisma } = context;
      const meals = await prisma.meal.findMany({
        where: {
          mealUsage: {
            some: {
              campId: camp_id,
              date: parent.date,
            },
          },
        },
      });

      return meals.map((meal) => {
        return {
          ...meal,
          campId: camp_id,
        };
      });
    },
  },

  Camp: {
    days: async (parent: Camp) => {
      // we add the campId to the CampDay object here, because we need it in the meals resolver
      return parent.days?.map((day) => ({ ...day, campId: parent.id })) || [];
    },
  },
};
