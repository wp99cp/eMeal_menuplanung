import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getSession } from 'next-auth/react';

const redirectToSignInPage = (req: NextRequest) => {
  // check for infinite redirects by checking if the request is for the signin page
  if (req.url.includes('/auth/signin') || req.url.includes('/auth/signup')) {
    return NextResponse.next();
  }

  // the user is not logged in, redirect to the sign-in page
  const signInPage = '/api/auth/signin';
  const signInUrl = new URL(signInPage, req.nextUrl.origin);
  signInUrl.searchParams.append('callbackUrl', req.url);
  return NextResponse.redirect(signInUrl);
};

const isAuthorized = async (req: NextRequest): Promise<boolean> => {
  const requestForNextAuth = {
    headers: {
      cookie: req.headers.get('cookie'),
    },
  };

  //@ts-ignore Validate session
  const session = await getSession({ req: requestForNextAuth });

  console.log('Session: ', !!session?.user);

  return !!session?.user;
};

export const config = {
  matcher: ['/app/:path*', '/auth/signin', '/auth/signup'],
};

export const middleware = async (req: NextRequest) => {
  if (!(await isAuthorized(req))) return redirectToSignInPage(req);

  switch (req.nextUrl.pathname) {
    case '/app/signup':
    case '/auth/signin': {
      const redirectUrl =
        req.nextUrl.searchParams.get('callbackUrl') ||
        req.nextUrl.origin + '/app';
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Continue to requested page
  return NextResponse.next();
};
