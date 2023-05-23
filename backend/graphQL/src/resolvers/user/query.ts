import { QueryResolvers } from '@/util/generated/types/graphql';

export const userQueries: QueryResolvers = {
  checkUsername: async (_, args, context) => {
    const { username } = args;
    const { user_id } = context;

    if (!user_id)
      return { success: false, error: 'No user_id set. Are you using a api key?' };

    if (!username) return { success: false, error: 'Username is required' };

    return { success: true };
  },
};
