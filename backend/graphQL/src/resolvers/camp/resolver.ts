import { Camp, CampDay, Resolvers } from '@/util/generated/types/graphql';

export const campResolvers: Resolvers = {
  CampDay: {
    meals: async (parent: CampDay, _, context) => {
      // retrieve campId from parent object
      // this is a bit hacky, as it brakes the type safety of the generated types
      if (!('campId' in parent)) throw new Error('CampDay is missing campId field');
      const camp_id = parent.campId as string;

      const { prisma } = context;
      return await prisma.meal.findMany({
        where: {
          campId: camp_id,
          date: parent.date,
        },
        orderBy: [{ date: 'asc' }, { id: 'asc' }],
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
