import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getSession } from 'next-auth/react';
import { Session } from 'next-auth';
import { session } from 'next-auth/core/routes';

function redirectToSignInPage(req: NextRequest) {
  // the user is not logged in, redirect to the sign-in page
  const signInPage = '/api/auth/signin';
  const signInUrl = new URL(signInPage, req.nextUrl.origin);
  signInUrl.searchParams.append('callbackUrl', req.url);
  return NextResponse.redirect(signInUrl);
}

function validateSession(session: Session): boolean {
  return !!session?.user;
}

export async function middleware(req: NextRequest) {
  const requestForNextAuth = {
    headers: {
      cookie: req.headers.get('cookie'),
    },
  };

  //@ts-ignore Validate session
  const session = await getSession({ req: requestForNextAuth });
  if (!session || !validateSession(session)) return redirectToSignInPage(req);

  switch (req.nextUrl.pathname) {
    case '/auth/signin': {
      const redirectUrl =
        req.nextUrl.searchParams.get('callbackUrl') ||
        req.nextUrl.origin + '/app';
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Continue to requested page
  return NextResponse.next();
}

export const config = {
  matcher: ['/app/:path*', '/auth/signin'], //  '/auth/your-profile'
};
