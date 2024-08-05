import { QueryResolvers } from '@/util/generated/types/graphql';
import logger from '@/logger/logger';
import { GraphQLContext } from '@/apolloServer/context';

export const userQueries: QueryResolvers<GraphQLContext> = {
  checkUsername: async (_, args, context) => {
    const { username } = args;
    const { user_id } = context;

    if (!user_id)
      return { success: false, error: 'No user_id set. Are you using a api key?' };

    if (!username) return { success: false, error: 'Username is required' };

    return { success: true };
  },

  /*
  users: async (_, args, context) => {
    const { criteria, pagination } = args;
    const { user_id, prisma, api_key } = context;

    const [users, count] = await prisma.user.findManyAndCount({
      where: {
        username: { contains: criteria?.partialUsername || '', mode: 'insensitive' },
        ...(!!user_id && { id: { not: user_id } }),
        ...(!!api_key && { isHiddenUser: false }),
      },
      ...prisma_pagination_filer(pagination),
      orderBy: [{ id: 'asc' }],
    });

    return {
      users: users?.map((user) => ({
        id: user.id,
        username: user.username,
        email: user.shareEmail ? user.email : null,
      })) || [],
      total: count,
    };
  },
  */

  user: async (_, args, context) => {
    logger.debug('user query', args);

    const { id } = args;
    const { user_id, prisma, api_key } = context;

    if (!user_id) throw new Error('No user_id set. Are you using a api key?');

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        shareEmail: true,
        isHiddenUser: true,
      },
    });

    if (!user) throw new Error('User not found');

    if (user.isHiddenUser && !api_key)
      throw new Error(
        'Not authorised to access this resource! Please provide an API key.'
      );

    return {
      id: user.id,
      username: user.username,
      email: user.shareEmail ? user.email : null,
    };
  },
};
