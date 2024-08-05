import logger from '@/logger/logger';
import { GraphQLContext } from '@/apolloServer/context';
import { QueryResolvers } from '@/util/generated/types/graphql';
import { getCampById, getQuerySelections } from '@/util/prisma/utils/camp';

export const campQueries: QueryResolvers<GraphQLContext> = {
  camps: () => {
    throw new Error('Resolver not implemented');
  },

  camp: async (parent, args, context, info) => {
    const selections = getQuerySelections(info);
    logger.debug(`camp query selections: ${JSON.stringify(selections)}`);

    const camp = await getCampById(args.id, context, selections);

    return {
      id: camp.id as string,
      name: camp.name as string,
      description: camp.description as string,
      year: camp.year as number,
    };
  },

  /*
  camps: async (_, args, context) => {
    const { criteria, pagination } = args;
    const { user_id, prisma } = context;

    if (!user_id) throw new Error('No user_id set. Are you using a api key?');
    logger.debug(`Fetching camps for user ${user_id}`);

    const { partialCampName } = criteria || {};

    const [camps, count] = await prisma.camp.findManyAndCount({
      where: {
        name: { contains: partialCampName || '', mode: 'insensitive' },
        ownerUserId: user_id,
      },
      include: {
        days: {
          orderBy: [{ date: 'asc' }, { id: 'asc' }],
        },
      },
      ...prisma_pagination_filer(pagination),
      orderBy: [{ year: 'desc' }, { id: 'asc' }],
    });

    logger.debug(`Found ${camps.length} camps for user ${user_id}`);

    return {
      camps,
      total: count,
    };
  },
  */

  /*
   * Access Control is handled by the graphql-shield middleware
   */
  // camp: async (_, { id }, { prisma }) => getCampById(id, prisma),
};
