import { QueryResolvers } from '@/util/generated/types/graphql';
import logger from '@/logger/logger';
import { prisma_pagination_filer } from '@/util/prisma/utils/pagination_filter';
import { getCampById } from '@/resolvers/camp/common';

export const campQueries: QueryResolvers = {
  camps: async (_, args, context) => {
    const { criteria, pagination } = args;
    const { user_id, prisma } = context;

    logger.debug(`Fetching camps for user ${user_id}`);

    const { partialCampName } = criteria || {};

    const camps = await prisma.camp.findMany({
      where: {
        name: { contains: partialCampName || '', mode: 'insensitive' },
        ownerId: user_id,
      },
      include: {
        days: { orderBy: { date: 'asc' } },
      },
      ...prisma_pagination_filer(pagination),
      orderBy: { year: 'desc' },
    });

    logger.debug(`Found ${camps.length} camps for user ${user_id}`);

    return camps;
  },

  /*
   * Access Control is handled by the graphql-shield middleware
   */
  camp: async (_, { id }, { prisma }) => getCampById(id, prisma),
};
