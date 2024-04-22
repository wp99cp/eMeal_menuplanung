import { PrismaClient } from '@/apolloServer/context';
import { Camp } from '@/util/generated/types/graphql';

export const getCampById = async (
  campId: string,
  prisma: PrismaClient
): Promise<Camp> => {
  const camp = await prisma.camp.findUnique({
    where: { id: campId },
    include: { days: { orderBy: { date: 'asc' } } },
  });
  if (!camp) throw new Error(`Camp with id ${campId} not found`);
  return camp;
};
