import { GraphQLClient } from 'graphql-request';
import gql from 'graphql-tag';
import { Camp } from '../../src/util/generated/prisma/client';
import { Client, createClient, SubscribePayload } from 'graphql-ws';
import { print } from 'graphql';
import { map, Observable } from 'rxjs';
import WebSocket = require('ws');

const GRAPHQL_ENDPOINT = 'http://localhost:4000/graphql';
const GRAPHQL_ENDPOINT_WS = 'ws://localhost:4000/graphql';

const GRAPHQL_API_KEY = process.env.GRAPHQL_API_KEY;
export const client = new GraphQLClient(GRAPHQL_ENDPOINT, {
  headers: {
    'x-api-key': GRAPHQL_API_KEY as string,
  },
});

export const wsClient = createClient({
  url: GRAPHQL_ENDPOINT_WS,
  webSocketImpl: WebSocket,
  connectionParams: async () => ({ 'x-api-key': GRAPHQL_API_KEY as string }),
});

export const clientWithoutAuth = new GraphQLClient(GRAPHQL_ENDPOINT);
export const getCampByID = async (client: GraphQLClient, campId: string) => {
  const CAMP = gql`
    query getCamp($campId: ID!) {
      camp(id: $campId) {
        id
        name
        description
      }
    }
  `;

  type ListCampsResponse = { camp: Camp };
  const variables = { campId };

  const resp = await client.request<ListCampsResponse>(CAMP, variables);
  if (!resp) throw new Error('No response');
  return resp.camp;
};
export const createNewCamp = async (
  client: GraphQLClient,
  name: string,
  description = ''
) => {
  const CREATE_CAMP = gql`
    mutation createCamp($name: String!, $description: String!) {
      createCamp(name: $name, description: $description) {
        node {
          id
          name
          description
        }
      }
    }
  `;

  type CreateCampResponse = { createCamp: { node: Camp } };
  const variables = { name, description };

  const resp = await client.request<CreateCampResponse>(CREATE_CAMP, variables);
  if (!resp) throw new Error('No response');
  return resp.createCamp.node.id;
};

export const updateCamp = async (
  client: GraphQLClient,
  campId: string,
  name: string,
  description = ''
) => {
  const UPDATE_CAMP = gql`
    mutation updateCamp($id: ID!, $name: String!, $description: String!) {
      updateCamp(id: $id, name: $name, description: $description) {
        success
      }
    }
  `;
  type UpdateCampResponse = { updateCamp: { success: boolean } };

  const variables = { id: campId, name, description };
  const resp = await client.request<UpdateCampResponse>(UPDATE_CAMP, variables);
  if (!resp) throw new Error('No response');

  return resp.updateCamp.success;
};

function toObservable(client: Client, payload: SubscribePayload) {
  return new Observable((observer) =>
    client.subscribe(payload, {
      next: (data) => observer.next(data.data as unknown),
      error: (err) => observer.error(err),
      complete: () => observer.complete(),
    })
  );
}

export const subscribeToCamp = (client: Client, campId: string): Observable<Camp> => {
  const SUBSCRIBE_TO_CAMP = gql`
    subscription subscribeToCamp($campId: ID!) {
      camp(id: $campId) {
        id
        name
        description
      }
    }
  `;

  const variables = { campId };
  const operation = { query: print(SUBSCRIBE_TO_CAMP), variables };
  return toObservable(client, operation).pipe(
    map((r: unknown) => (r as { camp: Camp }).camp)
  );
};
