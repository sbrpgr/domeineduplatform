import CredentialsProvider from 'next-auth/providers/credentials';
import { getServerSession } from 'next-auth/next';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import { getPrismaClient } from '@/lib/db';

const prisma = getPrismaClient();

export const authOptions = {
  ...(prisma ? { adapter: PrismaAdapter(prisma as never) } : {}),
  session: { strategy: 'jwt' as const },
  pages: {
    signIn: '/login'
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        if (prisma) {
          const user = await prisma.user.findUnique({ where: { email: credentials.email } });
          if (!user || !user.passwordHash) {
            return null;
          }

          const valid = await bcrypt.compare(credentials.password, user.passwordHash);
          if (!valid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name ?? 'User'
          };
        }

        if (credentials.email === 'demo@domain-glossary.com' && credentials.password === 'demo1234') {
          return {
            id: 'demo-user',
            email: credentials.email,
            name: 'Demo User'
          };
        }

        return null;
      }
    })
  ]
};

export function auth() {
  return getServerSession(authOptions as never);
}
