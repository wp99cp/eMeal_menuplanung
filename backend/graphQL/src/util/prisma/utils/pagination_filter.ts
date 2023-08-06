import { InputMaybe, Pagination } from '@/util/generated/types/graphql';

export const prisma_pagination_filer = (
  pagination?: InputMaybe<Pagination> | undefined
) => ({
  skip: pagination?.offset ?? 0,
  take: pagination?.limit ?? 10,
});
