import 'next-auth';
import 'next-auth/jwt';
import { User } from '@/util/generated/prisma/client';

declare module 'next-auth' {
  interface Session {
    user: User;
  }
}

// Read more at: https://next-auth.js.org/getting-started/typescript#module-augmentation
declare module 'next-auth/jwt' {
  interface JWT {}
}
