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
/* eslint-disable @typescript-eslint/no-explicit-any */
export const inputRuleWithContext = inputRule as unknown as <T>(
  _name?: string
) => (
  _schema: (
    _yup: typeof Yup,
    _ctx: GraphQLContext
  ) => Yup.BaseSchema<T, import('yup/lib/types.js').AnyObject, any>,
  _options?:
    | import('yup/lib/types.js').ValidateOptions<import('yup/lib/types.js').AnyObject>
    | undefined
) => InputRule<T>;
/* eslint-enable @typescript-eslint/no-explicit-any */
