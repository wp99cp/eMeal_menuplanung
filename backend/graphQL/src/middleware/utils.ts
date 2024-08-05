import { IRules, rule } from 'graphql-shield';
import logger from '@/logger/logger';
import util from 'util';

/**
 * Merges multiple rules into one.
 *
 * Query, Mutation and Subscription rules are merged separately.
 * All other rules are overwritten by the last rule.
 *
 * Example:
 *```
 * {
 *    Query: {
 *      users: rule1,
 *      user: rule2,
 *    },
 *
 *    OtherRule: rule3,
 *    OtherRuleNested: {
 *      NestedRule: rule4,
 *    },
 *
 *  }
 *  ```
 *
 *  and
 * ```
 * {
 *
 *    Query: {
 *      users: rule4,
 *      camps: rule5,
 *    },
 *
 *    OtherRule: rule6,
 *
 *    OtherRuleNested: {
 *      NestedRule2: rule7,
 *    },
 *
 *  }
 *  ```
 *
 *  will be merged into:
 * ```
 * {
 *    Query: {
 *      users: rule4,
 *      user: rule2,
 *      camps: rule5,
 *    },
 *
 *    OtherRule: rule6,
 *
 *    OtherRuleNested: {
 *      # NestedRule2: rule7, --> will not be in the final result
 *      NestedRule2: rule7,
 *    }
 *
 *  }
 *  ```
 *
 * @param rules
 */
export const merge_rules = (...rules: IRules[]): IRules => {
  return rules.reduce((acc, rule) => {
    let acc_new = { ...acc, ...rule };

    if ('Query' in rule && 'Query' in acc) {
      acc_new = { ...acc_new, Query: { ...acc.Query, ...rule.Query } };
    }

    if ('Mutation' in rule && 'Mutation' in acc) {
      acc_new = { ...acc_new, Mutation: { ...acc.Mutation, ...rule.Mutation } };
    }

    if ('Subscription' in rule && 'Subscription' in acc) {
      acc_new = {
        ...acc_new,
        Subscription: { ...acc.Subscription, ...rule.Subscription },
      };
    }

    return acc_new;
  });
};

/* eslint-disable @typescript-eslint/no-explicit-any */
const removeKeys = (obj: any, keysToRemove: string[]): any => {
  if (Array.isArray(obj)) {
    return obj.map((item) => removeKeys(item, keysToRemove));
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      if (!keysToRemove.includes(key)) {
        acc[key] = removeKeys(obj[key], keysToRemove);
      }
      return acc;
    }, {} as any);
  }
  return obj;
};
/* eslint-enable @typescript-eslint/no-explicit-any */

export const print_rules = (name: string, rules: IRules) => {
  const cleanedRules = removeKeys(rules, ['fragment', 'func']);
  logger.debug(
    `\n\n============================\nGraphQL Shield ${name} Rules:\n============================\n\n${util.inspect(
      cleanedRules,
      { showHidden: false, compact: true, colors: true, depth: null }
    )}\n`
  );
  logger.debug('\n\n============================\n============================\n');
};

export const default_deny = (rule_name: string, message_prefix: string) =>
  rule(rule_name)(async (_, __, ___, info) => {
    logger.error(`${message_prefix} failed for ${info.fieldName}`);
    return false;
  });
