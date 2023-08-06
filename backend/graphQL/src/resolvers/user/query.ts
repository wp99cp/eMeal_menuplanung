import { QueryResolvers } from '@/util/generated/types/graphql';
import { prisma_pagination_filer } from '@/util/prisma/utils/pagination_filter';

export const userQueries: QueryResolvers = {
  checkUsername: async (_, args, context) => {
    const { username } = args;
    const { user_id } = context;

    if (!user_id)
      return { success: false, error: 'No user_id set. Are you using a api key?' };

    if (!username) return { success: false, error: 'Username is required' };

    return { success: true };
  },

  users: async (_, args, context) => {
    const { criteria, pagination } = args;
    const { user_id, prisma, api_key } = context;

    if (!user_id) throw new Error('No user_id set. Are you using a api key?');

    // TODO: implement rate limit

    const users = await prisma.user.findMany({
      where: {
        username: { contains: criteria?.partialUsername || '', mode: 'insensitive' },
        ...(!!user_id && { id: { not: user_id } }),
        ...(!!api_key && { isHiddenUser: false }),
      },
      ...prisma_pagination_filer(pagination),
    });

    return (
      users?.map((user) => ({
        id: user.id,
        username: user.username,
        email: user.shareEmail ? user.email : null,
      })) || []
    );
  },
};
