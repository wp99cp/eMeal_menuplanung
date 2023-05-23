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

const queries: QueryResolvers = {
  ...userQueries,
};

const mutations: MutationResolvers = {
  ...userMutations,
};

const subscriptions: SubscriptionResolvers = {
  ...userSubscriptions,
};

export const resolvers: Resolvers = {
  Query: { ...queries },
  Mutation: { ...mutations },
  Subscription: { ...subscriptions },
  JSON: GraphQLJSONObject,
};
