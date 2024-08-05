import {
  MutationResolvers,
  QueryResolvers,
  Resolvers,
  SubscriptionResolvers,
} from '@/util/generated/types/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import { userQueries } from '@/resolver/user/query';
import { userMutations } from '@/resolver/user/mutations';
import { userSubscriptions } from '@/resolver/user/subscriptions';
import { campQueries } from '@/resolver/camp/query';
import { resolvers as campResolvers } from '@/resolver/camp/resolver';
import { customScalars } from '@/resolver/customScalar';
import { mealResolvers } from '@/resolver/meal/resolver';
import { campSubscriptions } from '@/resolver/camp/subscription';
import { campMutations } from '@/resolver/camp/mutations';
import { mealMutations } from '@/resolver/meal/mutations';
import { GraphQLContext } from '@/apolloServer/context';

const queries: QueryResolvers<GraphQLContext> = {
  ...userQueries,
  ...campQueries,
};

const resolvers: Resolvers<GraphQLContext> = {
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
