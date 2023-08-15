/*
 * This file is used to rate limit the graphql queries
 * see https://www.npmjs.com/package/graphql-rate-limit-directive
 */

// This is not necessary, it exists to demonstrate when we check the rate limit usage
import { RateLimiterMemory } from 'rate-limiter-flexible';
import {
  defaultKeyGenerator,
  defaultPointsCalculator,
  rateLimitDirective,
  RateLimitKeyGenerator,
  RateLimitOnLimit,
  RateLimitPointsCalculator,
} from 'graphql-rate-limit-directive';
import logger from '@/logger/logger';
import { GraphQLContext } from '@/apolloServer/context';

/**
 * Calculate the number of points to consume.
 *
 */
const pointsCalculator: RateLimitPointsCalculator<GraphQLContext> = (
  directiveArgs,
  source,
  args,
  context,
  info
) => {
  // we don't want to rate limit the api key
  if (context.api_key) return 0;
  return defaultPointsCalculator(directiveArgs, source, args, context, info);
};

/**
 * Specify how a rate limited field should determine uniqueness/isolation of operations
 * Uses the combination of user specific data (their ip) along the type and field being accessed.
 */
const keyGenerator: RateLimitKeyGenerator<GraphQLContext> = (
  directiveArgs,
  source,
  args,
  context,
  info
) =>
  `${context.user_id}::${defaultKeyGenerator(
    directiveArgs,
    source,
    args,
    context,
    info
  )}`;

/**
 * Error thrown when a rate limit has been exceeded.
 *
 * Enables additional logging and reporting of the incident.
 *
 */
class RateLimitError extends Error {
  constructor(msBeforeNextReset: number, user_id?: string) {
    // Determine when the rate limit will be reset so the client can try again
    const resetAt = new Date();
    resetAt.setTime(resetAt.getTime() + msBeforeNextReset);

    super(
      `Too many requests. Try again at ${resetAt.toISOString()}! This incident will be reported.`
    );

    logger.warn(`Too many requests of user ${user_id}!`, {
      is_incident_report: true,
      incident_time: new Date().toISOString(),
    });
  }
}

const onLimit: RateLimitOnLimit<GraphQLContext> = (resource, _, __, ___, context) => {
  throw new RateLimitError(resource.msBeforeNext, context.user_id);
};

export const { rateLimitDirectiveTransformer } = rateLimitDirective({
  keyGenerator,
  pointsCalculator,
  onLimit,
  limiterClass: RateLimiterMemory,
});
