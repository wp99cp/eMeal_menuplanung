import { Camp, CampDay, MealUsageType, Resolvers } from '@/util/generated/types/graphql';
import { MealUsage, MealUsageTypes } from '@prisma/client';
import { multiplicationFactorToGraphqlType } from '@/resolvers/meal/resolver';

const getMealUsageGraphqlType = (mealUsage?: MealUsage): MealUsageType => {
  const mealUsageTypeMap = {
    [MealUsageTypes.BREAKFAST]: MealUsageType.Breakfast,
    [MealUsageTypes.MORNING_SNACK]: MealUsageType.MorningSnack,
    [MealUsageTypes.LUNCH]: MealUsageType.Lunch,
    [MealUsageTypes.DINNER]: MealUsageType.Dinner,
    [MealUsageTypes.AFTERNOON_SNACK]: MealUsageType.AfternoonSnack,
    [MealUsageTypes.EVENING_SNACK]: MealUsageType.EveningSnack,
  };

  if (mealUsage?.type && mealUsage.type in mealUsageTypeMap) {
    return mealUsageTypeMap[mealUsage.type];
  }

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
      return (
        await prisma.meal.findMany({
          where: {
            mealUsages: {
              some: {
                campId: camp_id,
                date: parent.date,
              },
            },
          },
        })
      ).map((meal) => {
        const mealUsage = meal.mealUsages?.find(
          (usage) =>
            usage.campId == camp_id &&
            usage.date.toISOString() == parent.date.toISOString()
        );

        return {
          ...meal,
          multiplicationFactor: multiplicationFactorToGraphqlType(
            meal.multiplicationFactor
          ),
          multiplicationFactorAdjusted: false,
          usageType: getMealUsageGraphqlType(mealUsage),
          needsPreparation: mealUsage?.needsPreparation || false,
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
