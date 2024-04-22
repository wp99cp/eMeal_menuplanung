import { SubscriptionResolvers } from '@/util/generated/types/graphql';
import { GraphQLContext } from '@/apolloServer/context';
import { getCampById } from '@/resolvers/camp/common';

export const campSubscriptions: SubscriptionResolvers = {
  camp: {
    subscribe: (_, { id: camp_id }, { prisma }: GraphQLContext) =>
      prisma.camp.eventStream(camp_id),

    resolve: ({ camp_id }: { camp_id: string }, _: any, { prisma }: GraphQLContext) =>
      getCampById(camp_id, prisma),
  },
};
