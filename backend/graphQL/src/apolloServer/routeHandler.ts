import { Express } from 'express';

/**
 * Sets up API routes for the Express application.
 *
 * @param app - The Express application instance.
 */
export const addRouteHandlers = (app: Express) => {
  // Route handler for `/health` endpoint
  app.get('/health', (req, res) => {
    res.status(200).send('Okay!');
  });
};
