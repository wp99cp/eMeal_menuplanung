import { QueryResolvers } from '@/util/generated/types/graphql';

export const campQueries: QueryResolvers = {
  camps: async (_, args, context) => {

    const { user_id, prisma } = context;

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
