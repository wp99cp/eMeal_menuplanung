import { Resolvers } from '@/util/generated/types/graphql';
import { GraphQLContext } from '@/apolloServer/context';

export const mealResolvers: Resolvers<GraphQLContext> = {
  Meal: {
    recipes: async (parent, _, { prisma }) => {
      const [recipes, count] = await prisma.recipe.findManyAndCount({
        where: {
          mealId: parent.id,
        },
        orderBy: [{ name: 'asc' }],
      });
      return {
        edges: recipes.map((recipe) => ({
          node: {
            id: recipe.id,
            name: recipe.name,
            description: recipe.description,
          },
          cursor: recipe.id,
        })),
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
        },
        totalCount: count,
      };
    },
  },

  Recipe: {
    ingredients: async (parent, _, { prisma }) => {
      const [ingredients, count] = await prisma.ingredient.findManyAndCount({
        where: {
          recipeId: parent.id,
        },
        orderBy: [{ name: 'asc' }],
      });
      return {
        edges: ingredients.map((ingredient) => ({
          node: {
            id: ingredient.id,
            name: ingredient.name,
          },
          cursor: ingredient.id,
        })),
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
        },
        totalCount: count,
      };
    },
  },
};
