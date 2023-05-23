import { inputRule } from 'graphql-shield';
import { InputRule } from 'graphql-shield/typings/rules';
import { GraphQLContext } from '../types/types';
import * as Yup from 'yup';

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
