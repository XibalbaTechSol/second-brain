import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@second-brain/database";
import crypto from "crypto";

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
    /**
     * 🛡️ Sentinel: RESTRICTED TO DEV/TEST ENVIRONMENTS
     *
     * The CredentialsProvider below allows passwordless login and automatic user creation.
     * This is intended for development convenience only.
     * EXPOSING THIS IN PRODUCTION IS A CRITICAL SECURITY VULNERABILITY.
     */
    ...(process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test' ? [
      CredentialsProvider({
        name: "Credentials",
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" }
        },
        async authorize(credentials) {
          if (!credentials?.email) return null;

          // "Ignore security" - auto create or just find
          let user = await prisma.user.findUnique({
            where: { email: credentials.email }
          });

          if (!user) {
            user = await prisma.user.create({
              data: {
                id: crypto.randomUUID(),
                email: credentials.email,
                name: credentials.email.split('@')[0],
                trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 day trial
                subscription: {
                  create: {
                    tier: 'FREE'
                  }
                }
              }
            });
          }

          return user;
        }
      })
    ] : [])
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
