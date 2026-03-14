import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/business/login",
  },
  providers: [
    Credentials({
      id: "business",
      name: "Business",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) return null;

        const business = await prisma.business.findUnique({
          where: { email: credentials.email as string },
        });

        if (!business) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          business.passwordHash
        );

        if (!isValid) return null;

        return {
          id: business.id,
          name: business.name,
          email: business.email,
          role: "business",
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
});
