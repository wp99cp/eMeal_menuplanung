import { SubscriptionResolvers } from '@/util/generated/types/graphql';
import { GraphQLContext } from '@/apolloServer/context';
import { getCampById } from '@/resolvers/camp/common';
import logger from '@/logger/logger';

export const campSubscriptions: SubscriptionResolvers = {
  camp: {
    subscribe: (_, args, { prisma }: GraphQLContext) => {
      logger.debug('Subscribing to camp with id: ', args);
      logger.debug(JSON.stringify(args));
      // logger.debug('Subscribing to camp with id: ', camp_id);
      return prisma.camp.eventStream(args.id);
    },

    resolve: (
      _: undefined,
      { id: camp_id }: { id: string },
      { prisma }: GraphQLContext
    ) => getCampById(camp_id, prisma),
  },
};
