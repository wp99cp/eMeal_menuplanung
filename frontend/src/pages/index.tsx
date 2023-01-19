import { getSession } from 'next-auth/react';
import { NextPage, NextPageContext } from 'next';
import { useMutation } from '@apollo/client';
import UserOperations from '@/graphql/operations/user';
import { CreateUserNameData, CreateUserNameVars } from '@/util/types';

const Home: NextPage = () => {
  const [createUsername, _] = useMutation<
    CreateUserNameData,
    CreateUserNameVars
  >(UserOperations.Mutation.createUser);

  const onSubmit = async () => {
    const { data } = await createUsername({
      variables: { username: 'fsdfs' },
    });

    if (!data?.createUser.success) {
      throw new Error();
    }

    // reloadSession();
  };

  return (
    <div>
      <br></br>

      <button onClick={() => onSubmit()}>Update User...</button>
    </div>
  );
};

export async function getServerSideProps(ctx: NextPageContext) {
  const session = await getSession(ctx);

  return {
    props: {
      session,
    },
  };
}

export default Home;
