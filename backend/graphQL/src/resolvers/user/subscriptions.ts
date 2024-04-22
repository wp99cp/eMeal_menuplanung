import { SubscriptionResolvers } from '@/util/generated/types/graphql';
import { GraphQLContext } from '@/apolloServer/context';

export const userSubscriptions: SubscriptionResolvers = {
  user: {
    subscribe: (_, __, { user_id, prisma }: GraphQLContext) =>
      prisma.user.eventStream(user_id),

    resolve: ({ user_id }: { user_id: string }, _: any, { prisma }: GraphQLContext) => {
      return prisma.user.findUnique({ where: { id: user_id } });
    },
  },
};
