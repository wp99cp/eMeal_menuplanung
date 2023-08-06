import { rule } from 'graphql-shield';
import { GraphQLContext } from '@/util/types/types';
import { Rule } from 'graphql-shield/typings/rules';
import { inputRuleWithContext } from '@/util/shield/customFunctions';
import { isUsernameUnique } from '@/util/functions';

/**
 *
 * Checks if the user is authenticated using an API key or using as session
 * token. The session token is verified by the apolloServer middleware.
 *
 * @param _ - The parent object of the GraphQL resolver (unused).
 * @param __ - The arguments provided to the GraphQL resolver (unused).
 * @param ctx - The GraphQL context object that contains the API key and user ID.
 *
 * @returns A boolean indicating whether the user is authenticated or an error message if not authorized.
 *
 */
export const isAuthenticated: Rule = rule()(async (_, __, ctx: GraphQLContext) => {
  if (ctx.api_key || ctx.user_id) return true;
  return 'Not authorised to access this resource!';
});

/**
 *
 * Checks if the GraphQL context object contains a user ID.
 * If the user is authenticated using a session token, the user_id is automatically included,
 * however, if the API key is used, the user_id must be passed as a header.
 *
 * @param _ - The parent object of the GraphQL resolver (unused).
 * @param __ - The arguments provided to the GraphQL resolver (unused).
 * @param ctx - The GraphQL context object that contains the user ID.
 *
 * @returns A boolean indicating whether the user ID is present or an error message if not found.
 *
 */
export const hasUserId: Rule = rule()(async (_, __, ctx: GraphQLContext) => {
  if (ctx.user_id) return true;
  return 'No user_id set. Are you using a api key?';
});

/**
 *
 * Checks if the GraphQL context object contains a valid API key for accessing a resource.
 * For API endpoints guarded by this rule, authentication using session tokens is not permitted.
 * Used to guard backend-only routes.
 *
 * @param _ - The parent object of the GraphQL resolver (unused).
 * @param __ - The arguments provided to the GraphQL resolver (unused).
 * @param ctx - The GraphQL context object that contains the API key.
 *
 * @returns A boolean indicating whether the API key is valid or an error message if not authorized.
 *
 */
export const apiKeyOnly: Rule = rule()((_, __, ctx: GraphQLContext) => {
  if (ctx.api_key) return true;
  return 'Not authorised to access this resource! Please provide an API key.';
});

/**
 *
 * Validates the username input field, ensuring it meets the specified requirements.
 * It checks the length, character pattern, and uniqueness of the username.
 *
 * A valid username is at least 5 characters long, contains a maximum of 20 characters,
 * and consists only of letters, numbers, dashes, and underscores. Additionally,
 * the username must be unique across all registered users within the database.
 *
 * @param yup - The Yup object for schema validation.
 * @param ctx - The GraphQL context containing the necessary data for validation.
 *
 * @returns A Yup object schema for validating the username.
 *
 */
export const passedValidUsername = inputRuleWithContext()(
  (yup, ctx) =>
    yup.object({
      username: yup
        .string()
        .min(5, 'Username must be at least 5 characters long')
        .max(20, 'Username cannot exceed 20 characters')
        .matches(/^[A-Za-z0-9_-]+$/, 'Invalid characters used')
        .test(
          'isUsernameUnique',
          'Username must be unique across all users',
          (username) => isUsernameUnique(username, ctx)
        ),
    }),
  { abortEarly: true }
);

export const paginationLimitation = (limit_max = 10) =>
  inputRuleWithContext()(
    (yup) =>
      yup.object({
        pagination: yup.object({
          limit: yup.number().min(1).max(limit_max),
          offset: yup.number().min(0).default(0),
        }),
      }),
    { abortEarly: true }
  );
