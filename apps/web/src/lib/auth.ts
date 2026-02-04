import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@second-brain/database";
import { compare, hash } from "bcryptjs";
import { randomUUID } from "crypto";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events"
        }
      }
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        let user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (user) {
          // If user exists but has no password (e.g. Google auth), deny access
          if (!user.password) return null;

          const isValid = await compare(credentials.password, user.password);
          if (!isValid) return null;

          return user;
        }

        // User does not exist, create new one with hashed password
        const hashedPassword = await hash(credentials.password, 10);
        user = await prisma.user.create({
          data: {
            id: randomUUID(),
            email: credentials.email,
            password: hashedPassword,
            name: credentials.email.split('@')[0],
            trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 day trial
            subscription: {
              create: {
                tier: 'FREE'
              }
            }
          }
        });

        return user;
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async session({ session, token }) {
      if (session?.user) {
        (session.user as any).id = token.sub;
      }
      return session;
    }
  }
};
