import {
  Meal,
  MultiplicationFactorTypes as MultiplicationFactorTypesGraphQL,
  Resolvers,
} from '@/util/generated/types/graphql';
import { MultiplicationFactorTypes as MultiplicationFactorTypesPrisma } from '@prisma/client';

export const multiplicationFactorToGraphqlType = (
  multiplicationFactor: MultiplicationFactorTypesPrisma | null | undefined
): MultiplicationFactorTypesGraphQL => {
  const multiplicationFactorMap = {
    [MultiplicationFactorTypesPrisma.TOTAL]: MultiplicationFactorTypesGraphQL.Total,
    [MultiplicationFactorTypesPrisma.FIXED]: MultiplicationFactorTypesGraphQL.Fixed,
    [MultiplicationFactorTypesPrisma.VEGETARIANS]:
      MultiplicationFactorTypesGraphQL.Vegetarians,
    [MultiplicationFactorTypesPrisma.VEGANS]: MultiplicationFactorTypesGraphQL.Vegans,
    [MultiplicationFactorTypesPrisma.LEADERS]: MultiplicationFactorTypesGraphQL.Leaders,
  };

  if (multiplicationFactor && multiplicationFactor in multiplicationFactorMap) {
    return multiplicationFactorMap[multiplicationFactor];
  }

  // default to total
  return MultiplicationFactorTypesGraphQL.Total;
};

export const mealResolvers: Resolvers = {
  Meal: {
    recipes: async (parent: Meal, _, context) => {
      const { prisma } = context;

      return (
        await prisma.recipe.findMany({
          where: {
            mealId: parent.id,
          },
        })
      ).map((recipe) => ({
        ...recipe,
        ingredients: recipe.ingredients?.map((ingredient) => ({
          uuid: ingredient.uuid,
          name: ingredient?.name || '',
          amount: {
            value: ingredient?.amount?.value,
            unit: ingredient?.amount?.unit,
            multiplicationFactorOverride: multiplicationFactorToGraphqlType(
              ingredient?.amount?.multiplicationFactorOverride
            ),
          },
          description: ingredient?.description || '',

          isFreshProduct: ingredient?.isFreshProduct,
          storeName: ingredient?.storeName,
          isOverriden: false,
          isDeleted: false,
        })),
      }));
    },
  },
};
