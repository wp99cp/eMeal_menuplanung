import { inputRuleWithContext } from '@/util/shield/customFunctions';
import { isUsernameUnique } from '@/util/functions';

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

/**
 *
 * Validates the pagination input field, ensuring it meets the specified requirements.
 *
 * @param limit_max - The maximum number of items that can be returned in a single query.
 *
 * @returns A Yup object schema for validating the pagination.
 *
 */
export const paginationLimitation = (limit_max = 10) =>
  inputRuleWithContext()(
    (yup) =>
      yup.object({
        pagination: yup.object({
          limit: yup.number().min(1).max(limit_max),
          offset: yup.number().min(0),
        }),
      }),
    { abortEarly: true }
  );
