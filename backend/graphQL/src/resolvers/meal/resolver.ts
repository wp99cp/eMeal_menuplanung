import { Meal, Resolvers } from '@/util/generated/types/graphql';
import { Ingredient } from '@prisma/client';

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
          orderBy: [{ id: 'asc' }],
        })
      ).map((recipe) => ({
        ...recipe,
        ingredients: recipe.ingredients?.map((ingredient: Ingredient) => ({
          name: ingredient?.name || '',
          amount: {
            value: ingredient?.amount?.toNumber(),
            unit: ingredient?.unit,
          },

          isFreshProduct: ingredient?.isFresh,
        })),
      }));
    },
  },
};
