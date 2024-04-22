import { MutationResolvers } from '@/util/generated/types/graphql';

export const mealMutations: MutationResolvers = {
  updateMeal: async (_, args, { prisma }) => {
    await prisma.meal.update({
      where: { id: args.id },
      data: {
        description: args.description,
        ...(args.name !== undefined && { name: args.name?.toString() }),
      },
    });

    return { success: true };
  },
};
