import { SubscriptionResolvers } from '@/util/generated/types/graphql';
import { GraphQLContext } from '@/apolloServer/context';
import logger from '@/logger/logger';
import { getCampById } from '@/util/prisma/utils/camp';

export const campSubscriptions: SubscriptionResolvers<GraphQLContext> = {
  camp: {
    subscribe: (_, args, { prisma }: GraphQLContext) => {
      logger.debug('Subscribing to camp with id: ', args.id);
      return prisma.camp.eventStream(args.id);
    },

    resolve: (_: undefined, { id: camp_id }: { id: string }, ctx: GraphQLContext) =>
      getCampById(camp_id, ctx, ['id', 'name', 'description', 'year']),
  },
};
