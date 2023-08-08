import { QueryResolvers } from '@/util/generated/types/graphql';
import logger from '@/logger/logger';

export const campQueries: QueryResolvers = {
  camps: async (_, args, context) => {
    const { user_id, prisma } = context;

    logger.info(`Fetching camps for user ${user_id}`);

    const user = await prisma.user.findUnique({
      where: {
        id: user_id,
      },
      select: {
        campsOwned: true,
        accessibleCamps: true,
      },
    });

    if (!user) throw new Error('User not found');

    return user.campsOwned.concat(user.accessibleCamps);
  },
};
