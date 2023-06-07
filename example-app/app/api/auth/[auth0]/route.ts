import { handleAuth } from '@auth0/nextjs-auth0/edge';

export const GET = handleAuth({
  onError(req: Request, error: Error) {
    console.error(error);
  }
});

export const runtime = 'edge';
