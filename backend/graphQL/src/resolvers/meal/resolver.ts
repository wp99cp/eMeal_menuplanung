import { Meal, Resolvers } from '@/util/generated/types/graphql';

export const mealResolvers: Resolvers = {
  Meal: {
    recipes: async (parent: Meal, _, context) => {
      const { prisma } = context;

      return (
        await prisma.recipe.findMany({
          where: {
            mealId: parent.id,
          },
          include: {
            ingredients: true,
          },
        })
      ).map((recipe) => ({
        ...recipe,
        ingredients: recipe.ingredients?.map((ingredient) => ({
          name: ingredient?.name || '',
          amount: {
            value: ingredient?.amount,
            unit: ingredient?.unit,
          },

          isFreshProduct: ingredient?.isFresh,
        })),
      }));
    },
  },
};
