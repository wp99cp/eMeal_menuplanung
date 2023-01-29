import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getSession } from 'next-auth/react';

const gotoOnboardingPage = (req: NextRequest) => {
  // check for infinite redirects by checking if the request is for onboarding page
  if (req.url.includes('/app/profile/onboarding')) {
    return NextResponse.next();
  }

  const onboardingPage = '/app/profile/onboarding';
  const onboardingPageUrl = new URL(onboardingPage, req.nextUrl.origin);
  return NextResponse.redirect(onboardingPageUrl);
};

const gotoSignInPage = (req: NextRequest) => {
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

const gotoAppPage = (req: NextRequest) => {
  if (req.url === '/app') {
    return NextResponse.next();
  }

  const appPage = '/app';
  const appPageUrl = new URL(appPage, req.nextUrl.origin);
  return NextResponse.redirect(appPageUrl);
};

const getSessionFromRequest = async (req: NextRequest) => {
  const requestForNextAuth = {
    headers: {
      cookie: req.headers.get('cookie'),
    },
  };

  //@ts-ignore Validate session
  return await getSession({ req: requestForNextAuth });
};

const isAuthorized = async (req: NextRequest): Promise<boolean> => {
  const session = await getSessionFromRequest(req);
  return !!session?.user;
};

const isNewUser = async (req: NextRequest): Promise<boolean> => {
  const session = await getSessionFromRequest(req);
  return !!session?.user?.newUser;
};

export const config = {
  matcher: ['/app/:path*', '/auth/signin', '/auth/signup'],
};

export const middleware = async (req: NextRequest) => {
  if (!(await isAuthorized(req))) return gotoSignInPage(req);

  function setRedirectToApp() {
    const redirectUrl =
      req.nextUrl.searchParams.get('callbackUrl') || req.nextUrl.origin + '/app';
    return NextResponse.redirect(redirectUrl);
  }

  if (req.nextUrl.pathname === '/auth/signup') return setRedirectToApp();
  if (req.nextUrl.pathname === '/auth/signin') return setRedirectToApp();

  if (req.nextUrl.pathname.includes('/profile/onboarding') && !(await isNewUser(req)))
    return gotoAppPage(req);
  if (req.nextUrl.pathname.includes('/app') && (await isNewUser(req)))
    return gotoOnboardingPage(req);

  // Continue to requested page
  return NextResponse.next();
};
