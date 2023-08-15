import logger from '@/logger/logger';
import {
  SubscriptionResolvers,
  User as GraphQLUser,
} from '@/util/generated/types/graphql';

export const userSubscriptions: SubscriptionResolvers = {
  user: {
    subscribe: (_, __, { prisma }) => {
      return prisma.user.notifyOnChange();
    },
    resolve: (user: any): GraphQLUser => {
      logger.debug(`userCreated event received: ${JSON.stringify(user)}`);
      return user;
    },
  },
};
