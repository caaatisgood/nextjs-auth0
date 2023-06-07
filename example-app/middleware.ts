import { withMiddlewareAuthRequired, getAccessToken } from '@auth0/nextjs-auth0/edge';
import { NextResponse } from 'next/server';

export default withMiddlewareAuthRequired(async (req) => {
  console.log('SESSION', await getAccessToken(req, NextResponse.next(), { refresh: true }));
});

export const config = {
  matcher: ['/page-router/profile-middleware', '/profile-middleware']
};
