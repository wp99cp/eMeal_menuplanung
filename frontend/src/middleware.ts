import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getSession } from 'next-auth/react';

export async function middleware(req: NextRequest) {
  const requestForNextAuth = {
    headers: {
      cookie: req.headers.get('cookie'),
    },
  };

  //@ts-ignore
  const session = await getSession({ req: requestForNextAuth });

  if (session) {
    // TODO: validate your session here, e.g. check if the user is admin or not

    return NextResponse.next();
  } else {
    // the user is not logged in, redirect to the sign-in page
    const signInPage = '/api/auth/signin';
    const signInUrl = new URL(signInPage, req.nextUrl.origin);
    signInUrl.searchParams.append('callbackUrl', req.url);
    return NextResponse.redirect(signInUrl);
  }
}

export const config = {
  matcher: ['/app/:path*'], //  '/auth/your-profile'
};
