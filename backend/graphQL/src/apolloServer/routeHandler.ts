import { Express } from 'express';
import { metricsContextFunction } from '@/apolloServer/context';

/**
 * Sets up API routes for the Express application.
 *
 * @param app - The Express application instance.
 */
export const addRouteHandlers = (app: Express) => {
  // Route handler for `/health` endpoint
  app.get('/health', (_, res) => {
    res.status(200).send('Okay!');
  });

  const { prisma } = metricsContextFunction();
  app.get('/metrics', async (req, res) => {
    const metrics = await prisma.$metrics.prometheus();
    res.end(metrics);
  });
};
