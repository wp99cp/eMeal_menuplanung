import {
  MutationResolvers,
  QueryResolvers,
  Resolvers,
  SubscriptionResolvers,
} from '@/util/generated/types/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import { userQueries } from '@/resolvers/user/query';
import { userMutations } from '@/resolvers/user/mutations';
import { userSubscriptions } from '@/resolvers/user/subscriptions';
import { campQueries } from '@/resolvers/camp/query';
import { campResolvers } from '@/resolvers/camp/resolver';
import { customScalars } from '@/resolvers/customScalar';
import { mealResolvers } from '@/resolvers/meal/resolver';
import { campSubscriptions } from '@/resolvers/camp/subscription';
import { campMutations } from '@/resolvers/camp/mutations';
import { mealMutations } from '@/resolvers/meal/mutations';

const queries: QueryResolvers = {
  ...userQueries,
  ...campQueries,
};

const resolvers: Resolvers = {
  ...campResolvers,
  ...mealResolvers,
};

const mutations: MutationResolvers = {
  ...userMutations,
  ...campMutations,
  ...mealMutations,
};

const subscriptions: SubscriptionResolvers = {
  ...userSubscriptions,
  ...campSubscriptions,
};

export const graphqlResolver: Resolvers = {
  Query: { ...queries },
  Mutation: { ...mutations },
  Subscription: { ...subscriptions },
  ...resolvers,
  ...customScalars,
  JSON: GraphQLJSONObject,
};
