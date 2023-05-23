import { ApolloServerPluginDrainWebSocketServerOptions } from '@/util/types/types';
import { ApolloServerPlugin } from '@apollo/server';

/**
 *
 * A plugin to drain the WebSocket server on server shutdown.
 *
 * @param options - The options for the plugin.
 * @returns The Apollo Server plugin.
 *
 */
export const ApolloServerPluginDrainWebSocketServer = (
  options: ApolloServerPluginDrainWebSocketServerOptions
): ApolloServerPlugin => {
  return {
    async serverWillStart() {
      return {
        async drainServer() {
          await options.disposableServer.dispose();
        },
      };
    },
  };
};
