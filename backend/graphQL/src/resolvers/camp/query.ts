import { CampAccessLevels, QueryResolvers } from '@/util/generated/types/graphql';
import logger from '@/logger/logger';
import { prisma_pagination_filer } from '@/util/prisma/utils/pagination_filter';
import { Prisma } from '@prisma/client';
import CampWhereInput = Prisma.CampWhereInput;

const campAccessFilter = (
  access: CampAccessLevels | null | undefined,
  user_id: string | undefined
) => {
  const filter: { OR: CampWhereInput[] } = { OR: [] };

  switch (access) {
    case CampAccessLevels.Owner:
      filter.OR.push({ owner: { id: user_id } });
      break;
    case CampAccessLevels.Member:
      filter.OR.push({ members: { some: { id: user_id } } });
      break;
    case CampAccessLevels.Viewer:
      filter.OR.push({ viewer: { some: { id: user_id } } });
      break;
    case CampAccessLevels.Any:
    default:
      filter.OR.push({ owner: { id: user_id } });
      filter.OR.push({ members: { some: { id: user_id } } });
      filter.OR.push({ viewer: { some: { id: user_id } } });
  }

  return filter;
};

export const campQueries: QueryResolvers = {
  camps: async (_, args, context) => {
    const { criteria, pagination } = args;
    const { user_id, prisma } = context;

    logger.debug(`Fetching camps for user ${user_id}`);

    const { partialCampName, access } = criteria || {};

    const camps = await prisma.camp.findMany({
      where: {
        name: { contains: partialCampName || '', mode: 'insensitive' },
        ...campAccessFilter(access, user_id),
      },
      ...prisma_pagination_filer(pagination),
    });

    logger.debug(`Found ${camps.length} camps for user ${user_id}`);

    return camps;
  },

  camp: async (_, args, context) => {
    const { id } = args;
    const { user_id, prisma } = context;

    logger.debug(`Fetching camp ${id} for user ${user_id}`);

    const camp = await prisma.camp.findUnique({
      where: {
        id,
        ...campAccessFilter(CampAccessLevels.Any, user_id),
      },
    });

    if (!camp) throw new Error('Camp not found');
    return camp;
  },
};
