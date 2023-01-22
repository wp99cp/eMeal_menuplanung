'use client';

import { NextPage } from 'next';
import { useMutation } from '@apollo/client';
import { CreateUserNameData, CreateUserNameVars } from '@/util/types';
import UserOperations from '@/graphql/operations/user';
import { useSession } from 'next-auth/react';

const Page: NextPage = () => {
  // redirect to login page if not logged in

  const [createUsername, {}] = useMutation<
    CreateUserNameData,
    CreateUserNameVars
  >(UserOperations.Mutation.createUser);

  const session = useSession();

  return (
    <>
      <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="h-96 rounded-lg border-4 border-dashed border-gray-200"></div>
        </div>
      </div>
    </>
  );
};

export default Page;
