import { Prisma as PrismaExtension } from '@prisma/client/extension';
import { Camp, Prisma } from '@prisma/client';

export default PrismaExtension.defineExtension((client) => {
  return client.$extends({
    name: 'Camp Extension',
    model: {
      camp: {
        /**
         * Creates a camp with some additional default values,
         * that prisma does not support yet to define via schema.
         *
         * @param camp_name the name of the camp.
         * @param ownerId the id of the user that owns the camp.
         * @param camp_data the camp data to create the camp with.
         *
         */
        async createCamp(
          camp_name: string,
          ownerId: string,
          camp_data?: Partial<Omit<Prisma.CampCreateInput, 'name' | 'id'>>
        ): Promise<Camp> {
          return await super.camp.create({
            data: {
              name: camp_name,
              description: '',
              year: 2023,
              participantCount: { total: 12 },
              campSettings: { exportSettings: {} },
              days: [{ date: new Date() }],
              ...camp_data,
              owner: { connect: { id: ownerId } },
            },
          });
        },
      },
    },
  });
});
