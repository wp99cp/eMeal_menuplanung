import { inputRule } from 'graphql-shield';
import { InputRule } from 'graphql-shield/typings/rules';
import * as Yup from 'yup';
import { GraphQLContext } from '@/apolloServer/context';

/**
 *
 * This is a temporary solution until
 * https://github.com/dimatill/graphql-shield/issues/1315
 * is fixed.
 *
 */
export const inputRuleWithContext = inputRule as unknown as <T>(
  name?: string
) => (
  schema: (
    yup: typeof Yup,
    ctx: GraphQLContext
  ) => Yup.BaseSchema<T, import('yup/lib/types.js').AnyObject, any>,
  options?:
    | import('yup/lib/types.js').ValidateOptions<import('yup/lib/types.js').AnyObject>
    | undefined
) => InputRule<T>;
