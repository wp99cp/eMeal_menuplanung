import { GraphQLFormattedError } from 'graphql/error';

/**
 *
 * Formats the GraphQL error before sending it to the client.
 *
 * @param formattedError - The formatted error object.
 *
 * @returns The formatted error object or a new error object if it matches a specific condition.
 *
 */
export const ApolloErrorFormatter = (
  formattedError: GraphQLFormattedError
): GraphQLFormattedError => {
  // Format errors before sending them to the client
  if (formattedError.message.startsWith('Database Error: ')) {
    return new Error('Internal server error');
  }

  // Clear out stack trace to avoid exposing sensitive information
  if (formattedError.extensions?.stacktrace) {
    delete formattedError.extensions.stacktrace;
  }

  // Return the original error
  return formattedError;
};
