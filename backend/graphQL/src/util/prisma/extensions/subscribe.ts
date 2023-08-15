import { Prisma } from '@prisma/client';
import { Db, ObjectId } from 'mongodb';
import { AsyncIterableX, from } from 'ix/asynciterable';
import { map, mergeWith } from 'ix/asynciterable/operators';

/**
 *
 * Run the resolve function for every change on any of the given async iterables
 * and returns the result of the resolveFn.
 *
 *
 * @param first
 * @param others
 * @param resolveFn - The function to run on every change.
 *
 */
export const resolveOnChange = <T>(
  [first, ...others]: AsyncIterableX<unknown>[],
  resolveFn: () => Promise<T>
): AsyncIterableX<T> =>
  others.reduce((acc, curr) => acc.pipe(mergeWith(curr)), first).pipe(map(resolveFn));

/**
 * @param mongoClient - The MongoDB client to use for the change stream.
 */
type SubscribeExtensionArgs = {
  mongoClient: Promise<Db>;
};

const notifyOnChange = ({ mongoClient: mongoClientPromise }: SubscribeExtensionArgs) =>
  async function <
    PrismaModelType,
    ResultType extends Prisma.Result<
      PrismaModelType,
      Prisma.Args<PrismaModelType, 'findMany'>['select'],
      'findMany'
    > & {
      id: string;
    }
  >(
    this: PrismaModelType,
    documentKeys: string[] = [],
    action: 'insert' | 'update' | 'any' = 'any'
  ): Promise<AsyncIterableX<ResultType>> {
    const ctx = Prisma.getExtensionContext(this);
    if (!ctx.$name) throw new Error('Invalid model');
    const model_name = ctx.$name;

    const mongoClient = await mongoClientPromise;
    const changeStream = mongoClient.collection<ResultType>(model_name).watch([
      {
        $match: {
          ...(documentKeys.length >= 0
            ? {
                'documentKey._id': { $in: documentKeys.map((key) => new ObjectId(key)) },
              }
            : {}),
          ...(action === 'any' ? {} : { operationType: action }),
        },
      },
    ]);

    return from(changeStream as AsyncIterable<ResultType>);
  };

/**
 * Returns a Prisma extension that adds a notifyOnChange function to every model.
 *
 * The notifyOnChange function returns an async iterable that yields the changed model,
 * under the hood it uses MongoDB change streams to listen for changes.
 *
 * @param args - The arguments for the extension.
 */
export const withChangeListener = (args: SubscribeExtensionArgs) =>
  Prisma.defineExtension((client) =>
    client.$extends({
      name: 'subscribe',
      model: { $allModels: { notifyOnChange: notifyOnChange(args) } },
    })
  );
