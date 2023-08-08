import { GraphQLFormattedError } from 'graphql/error';
import logger from '@/logger/logger';

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

  // Return only the message
  return {
    message: formattedError.message,
  };
};

/**
 * Exports the error to the logger.
 *
 * This function is used to export the error to the logger.
 *
 * @param formattedError - The formatted error object.
 */
export const WinstonApolloErrorExporter = (
  formattedError: GraphQLFormattedError
): GraphQLFormattedError => {
  logger.error(formattedError);
  return formattedError;
};

/**
 *
 * Composes multiple formatters into a single formatter.
 * The formatters are applied in the order they are passed in.
 *
 * @param formatters - The formatters to compose.
 *
 */
export const formatterComposer = (
  ...formatters: ((_: GraphQLFormattedError) => GraphQLFormattedError)[]
) => {
  return (formattedError: GraphQLFormattedError) => {
    return formatters.reduce(
      (formattedError, formatter) => formatter(formattedError),
      formattedError
    );
  };
};
