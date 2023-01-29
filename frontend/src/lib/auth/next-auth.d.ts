import 'next-auth';
import 'next-auth/jwt';
import { User as _User } from '@/util/generated/prisma/client';

declare module 'next-auth' {
  type User = User & _User;
}

// Read more at: https://next-auth.js.org/getting-started/typescript#module-augmentation
declare module 'next-auth/jwt' {
  interface JWT {}
}
