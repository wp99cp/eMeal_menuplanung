import {
  MutationResolvers,
  QueryResolvers,
  Resolvers,
} from '@/util/generated/types/graphql';
import { userMutations, userQueries } from '@/graphql/resolvers/user';

const queries: QueryResolvers = {
  ...userQueries,
};

const mutations: MutationResolvers = {
  ...userMutations,
};

export const resolvers: Resolvers = {
  Query: { ...queries },
  Mutation: { ...mutations },
};
