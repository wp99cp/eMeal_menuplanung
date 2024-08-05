import { CampResolvers, DayResolvers, Resolvers } from '@/util/generated/types/graphql';
import { GraphQLContext } from '@/apolloServer/context';

const campCampResolvers: CampResolvers<GraphQLContext> = {
  days: async (parent, _, { prisma }) => {
    const [days, count] = await prisma.day.findManyAndCount({
      where: {
        campId: parent.id,
      },
      orderBy: [{ date: 'asc' }],
    });

    return {
      edges: days.map((day) => ({
        node: {
          id: day.id,
          description: day.description,
          usedIn: parent,
          date: day.date,
        },
        cursor: day.id,
      })),

      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
      },
      totalCount: count,
    };
  },
};

const dayResolvers: DayResolvers<GraphQLContext> = {
  meals: async (parent, _, { prisma }) => {
    const campId = parent.usedIn?.id;
    if (!campId) throw new Error('Day is missing campId field');

    const [meals, count] = await prisma.meal.findManyAndCount({
      where: {
        day: {
          campId: campId,
          date: parent.date,
        },
      },
      orderBy: [{ name: 'asc' }],
    });

    return {
      edges: meals.map((meal) => ({
        node: {
          id: meal.id,
          name: meal.name,
          description: meal.description,
        },
        cursor: meal.id,
      })),
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
      },
      totalCount: count,
    };
  },
};

export const resolvers: Resolvers<GraphQLContext> = {
  Camp: campCampResolvers,
  Day: dayResolvers,
};
