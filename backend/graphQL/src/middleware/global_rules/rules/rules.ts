import { inputRule } from 'graphql-shield';

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
  inputRule('paginationLimitation')(
    (yup) =>
      yup.object({
        pagination: yup.object({
          limit: yup.number().min(1).max(limit_max),
          offset: yup.number().min(0),
        }),
      }),
    { abortEarly: true }
  );
