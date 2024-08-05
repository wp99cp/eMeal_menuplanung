import { Prisma } from '@prisma/client';

/* eslint-disable @typescript-eslint/no-explicit-any */
export const findManyAndCount = Prisma.defineExtension((client) =>
  client.$extends({
    name: 'findManyAndCount',
    model: {
      $allModels: {
        findManyAndCount<Model, Args>(
          this: Model,
          args: Prisma.Exact<Args, Prisma.Args<Model, 'findMany'>>
        ): Promise<
          [
            Prisma.Result<Model, Args, 'findMany'>,
            number,
            Args extends { take: number } ? number : undefined
          ]
        > {
          return client.$transaction([
            (this as any).findMany(args),
            (this as any).count({ where: (args as any).where }),
          ]) as any;
        },
      },
    },
  })
);
/* eslint-enable @typescript-eslint/no-explicit-any */
