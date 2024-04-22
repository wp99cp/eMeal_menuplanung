import { MutationResolvers } from '@/util/generated/types/graphql';
import { GraphQLContext } from '@/apolloServer/context';
import logger from '@/logger/logger';

export const campMutations: MutationResolvers = {
  updateCamp: async (_, args, { prisma }: GraphQLContext) => {
    await prisma.camp.update({
      where: { id: args.id },
      data: {
        description: args.description,
        ...(args.name !== undefined && { name: args.name?.toString() }),
      },
    });

    return { success: true };
  },

  updateDay: async (_, args, { prisma }: GraphQLContext) => {
    logger.debug('Mutation.updateDay');
    logger.debug(JSON.stringify(args));

    // check if the camp exists
    const camp = await prisma.camp.findUnique({
      where: { id: args.camp_id },
    });

    if (!camp) return { success: false, error: 'Camp not found!' };

    // check if the day exists
    const day = await prisma.day.findUnique({
      where: {
        campId_date: {
          campId: args.camp_id,
          date: args.date,
        },
      },
    });

    if (!day) return { success: false, error: `Day ${args.date} not found!` };

    await prisma.day.update({
      where: {
        campId_date: {
          campId: args.camp_id,
          date: args.date,
        },
      },
      data: {
        ...(args.description !== undefined && {
          description: args.description?.toString(),
        }),
      },
    });

    return { success: true };
  },
};
