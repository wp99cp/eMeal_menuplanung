import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: User;
  }

  interface User {
    id: string;
    username: string;
    name: string;
    email: string;
    image: string | null;
    emailVerified: Date | null;
    shareEmail: boolean;
  }
}

// Read more at: https://next-auth.js.org/getting-started/typescript#module-augmentation

declare module 'next-auth/jwt' {
  interface JWT {}
}
