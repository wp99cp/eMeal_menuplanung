import { Camp, SubscriptionResolvers } from '@/util/generated/types/graphql';

import { resolveOnChange } from '@/util/prisma/extensions/subscribe';
import { getCampById } from '@/resolvers/camp/common';

export const campSubscriptions: SubscriptionResolvers = {
  camp: {
    subscribe: async (_, { id: campId }, { prisma }) => {
      // get all the ids of the meals of the camp
      const mealIds = await prisma.meal.findMany({
        where: { campIds: { hasSome: [campId] } },
        select: { id: true },
      });

      const recipeIds = await prisma.recipe.findMany({
        where: { campIds: { hasSome: [campId] } },
        select: { id: true },
      });

      // listen to changes of the camp and all meals of the camp
      const campS = await prisma.camp.notifyOnChange([campId]);
      const mealS = await prisma.meal.notifyOnChange(mealIds.map((meal) => meal.id));
      const recipeS = await prisma.recipe.notifyOnChange(
        recipeIds.map((recipe) => recipe.id)
      );

      return resolveOnChange<Camp>([campS, mealS, recipeS], () =>
        getCampById(campId, prisma)
      );
    },
    resolve: (parent: Promise<Camp>) => parent,
  },
};
