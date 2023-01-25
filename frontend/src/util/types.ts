import {
  FetchResult,
  MutationFunctionOptions,
  QueryResult,
} from '@apollo/client';

export interface UpdateUserData {
  updateUser: {
    success: boolean;
    error: string;
  };
}

export interface CheckUsername {
  checkUsername: {
    success: boolean;
    error: string;
  };
}

export interface CheckUsernameVars {
  username: string;
}
export interface UpdateUserVars {
  username: string;
  shareEmail?: boolean;
}

export type UpdateUserMutation = (
  options?: MutationFunctionOptions<UpdateUserData, UpdateUserVars> | undefined
) => Promise<FetchResult<UpdateUserData>>;

export type CheckUsernameQuery = QueryResult<CheckUsername, CheckUsernameVars>;
