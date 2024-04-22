import { Prisma } from '@prisma/client';
import { PubSub, withFilter } from 'graphql-subscriptions';
import logger from '@/logger/logger';
import { FilterFn, ResolverFn } from 'graphql-subscriptions/dist/with-filter';
import crypto from 'crypto';

// TODO: Use a more scalable pubsub implementation
const pubsub = new PubSub();

const withAsyncIteratorFilter = (asyncIteratorFn: ResolverFn, filterFn: FilterFn) => ({
  [Symbol.asyncIterator]: withFilter(asyncIteratorFn, filterFn),
});

export const withSubscriptions = () =>
  Prisma.defineExtension((client) =>
    client.$extends({
      name: 'subscriptions',
      model: {
        user: {
          eventStream: (user_id: string | undefined) => {
            if (!user_id) throw new Error('uid is required');

            const id = crypto.randomUUID();

            process.nextTick(() =>
              pubsub.publish(`user_${user_id}`, {
                user_id,
                event: 'init',
                initial_id: id,
              })
            );

            return withAsyncIteratorFilter(
              () =>
                pubsub.asyncIterator<{ user_id: string; event: string }>(
                  `user_${user_id}`
                ),
              (e) => e.user_id === user_id && (e.event !== 'init' || e.initial_id === id)
            );
          },
        },

        camp: {
          eventStream: (camp_id: string | undefined) => {
            if (!camp_id) throw new Error('Camp id is required');

            const id = crypto.randomUUID();

            process.nextTick(() =>
              pubsub.publish(`camp_${camp_id}`, {
                camp_id,
                event: 'init',
                initial_id: id,
              })
            );

            return withAsyncIteratorFilter(
              () =>
                pubsub.asyncIterator<{ camp_id: string; event: string }>(
                  `camp_${camp_id}`
                ),
              (e) => e.camp_id === camp_id && (e.event !== 'init' || e.initial_id === id)
            );
          },
        },
      },

      query: {
        ingredient: {
          // unimplemented
          update: () => {
            throw new Error('Not implemented');
          },
          delete: () => {
            throw new Error('Not implemented');
          },
          updateMany: () => {
            throw new Error('Not implemented');
          },
          deleteMany: () => {
            throw new Error('Not implemented');
          },
          upsert: () => {
            throw new Error('Not implemented');
          },
        },

        recipe: {
          // unimplemented
          update: () => {
            throw new Error('Not implemented');
          },
          delete: () => {
            throw new Error('Not implemented');
          },
          updateMany: () => {
            throw new Error('Not implemented');
          },
          deleteMany: () => {
            throw new Error('Not implemented');
          },
          upsert: () => {
            throw new Error('Not implemented');
          },
        },

        meal: {
          // unimplemented
          async update({ args, query }) {
            const meal = await query(args);
            if (!meal || !meal.id) throw new Error('meal not found');

            // get meal usages
            const mealUsages = await client.mealUsage.findMany({
              where: { mealId: meal.id },
            });

            // get camp ids
            await Promise.all(
              mealUsages.map((mu) =>
                pubsub.publish(`camp_${mu.campId}`, {
                  camp_id: mu.campId,
                  operation: 'update',
                })
              )
            );

            return meal;
          },
          delete: () => {
            throw new Error('Not implemented');
          },
          updateMany: () => {
            throw new Error('Not implemented');
          },
          deleteMany: () => {
            throw new Error('Not implemented');
          },
          upsert: () => {
            throw new Error('Not implemented');
          },
        },

        mealUsage: {
          // unimplemented
          update: () => {
            throw new Error('Not implemented');
          },
          delete: () => {
            throw new Error('Not implemented');
          },
          updateMany: () => {
            throw new Error('Not implemented');
          },
          deleteMany: () => {
            throw new Error('Not implemented');
          },
          upsert: () => {
            throw new Error('Not implemented');
          },
        },

        day: {
          async update({ args, query }) {
            const day = await query(args);
            if (!day || !day.campId || !day.date) throw new Error('day not found');

            logger.debug('day updated: ' + day.campId + ' ' + day.date);
            await pubsub.publish(`camp_${day.campId}`, {
              camp_id: day.campId,
              operation: 'update',
            });
            return day;
          },

          async delete({ args, query }) {
            const day = await query(args);
            if (!day || !day.campId || !day.date) throw new Error('day not found');

            logger.debug('day deleted: ' + day.campId + ' ' + day.date);
            await pubsub.publish(`camp_${day.campId}`, {
              camp_id: day.campId,
              operation: 'delete',
            });
            return day;
          },

          // unimplemented
          updateMany: undefined,
          deleteMany: undefined,
          upsert: undefined,
        },

        user: {
          async update({ args, query }) {
            const user = await query(args);
            if (!user || !user.id) throw new Error('user not found');

            logger.debug('user updated: ' + user.id);
            await pubsub.publish(`user_${user.id}`, {
              user_id: user.id,
              operation: 'update',
            });
            return user;
          },

          async delete({ args, query }) {
            const user = await query(args);
            if (!user || !user.id) throw new Error('user not found');

            logger.debug('user deleted: ' + user.id);
            await pubsub.publish(`user_${user.id}`, {
              user_id: user.id,
              operation: 'delete',
            });
            return user;
          },

          // unimplemented
          updateMany: undefined,
          deleteMany: undefined,
          upsert: undefined,
        },

        camp: {
          async update({ args, query }) {
            const camp = await query(args);

            logger.debug('camp updated: ' + camp.id);
            await pubsub.publish(`camp_${camp.id}`, {
              camp_id: camp.id,
              operation: 'update',
            });
            return camp;
          },

          async delete({ args, query }) {
            const camp = await query(args);

            logger.debug('camp deleted: ' + camp.id);
            await pubsub.publish(`camp_${camp.id}`, {
              camp_id: camp.id,
              operation: 'delete',
            });
            return camp;
          },

          // unimplemented
          updateMany: undefined,
          deleteMany: undefined,
          upsert: undefined,
        },
      },
    })
  );
