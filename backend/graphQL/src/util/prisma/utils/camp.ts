import { GraphQLContext } from '@/apolloServer/context';
import { GraphQLResolveInfo } from 'graphql/type';
import { Camp } from '@prisma/client';

/*
 * Returns the selections from the query as a flat array
 */
export const getQuerySelections = ({ fieldNodes }: GraphQLResolveInfo): string[] => {
  return fieldNodes
    .map((node) => node.selectionSet?.selections)
    .flat()
    .map((selection) =>
      typeof selection === 'object' && 'name' in selection ? selection.name.value : ''
    );
};

export const getCampById = async (
  id: string,
  context: GraphQLContext,
  selections: string[]
) => {
  const { prisma } = context;
  return (await prisma.camp.findUniqueOrThrow({
    where: { id },
    select: {
      ...selections.reduce((acc, selection) => ({ ...acc, [selection]: true }), {}),
    },
  })) as Camp;
};
