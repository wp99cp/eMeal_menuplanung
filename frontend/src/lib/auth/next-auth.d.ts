import 'next-auth';
import 'next-auth/jwt';
import { User as _User } from '@/util/generated/prisma/client';

declare module 'next-auth' {
  interface Session {
    user: User;
  }

  type User = User & _User;
}
