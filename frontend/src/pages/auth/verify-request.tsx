import {
  getCsrfToken,
  getProviders,
  getSession,
  signIn,
} from 'next-auth/react';
import { NextPageContext } from 'next';

function signin() {
  return (
    <div>
      <button onClick={() => signIn('google')}>Sign in with Google</button>
    </div>
  );
}

export default signin;

export async function getServerSideProps(context: NextPageContext) {
  const { req } = context;
  const session = await getSession({ req });

  if (session) {
    return {
      redirect: { destination: '/app/dashboard' },
    };
  }

  return {
    props: {
      providers: await getProviders(),
      csrfToken: await getCsrfToken(context),
    },
  };
}
