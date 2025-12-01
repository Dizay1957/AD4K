import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import AppleProvider from "next-auth/providers/apple"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
    }
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required")
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.password) {
          throw new Error("Invalid email or password")
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          throw new Error("Invalid email or password")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      }
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        })]
      : []),
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ? [GitHubProvider({
          clientId: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
        })]
      : []),
    ...(process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET
      ? [AppleProvider({
          clientId: process.env.APPLE_CLIENT_ID,
          clientSecret: process.env.APPLE_CLIENT_SECRET,
        })]
      : []),
  ],
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        console.log("[NextAuth] signIn callback:", { 
          user: user?.email, 
          provider: account?.provider,
          accountId: account?.providerAccountId
        })
        // Allow all sign-ins
        return true
      } catch (error) {
        console.error("[NextAuth] signIn callback error:", error)
        return false
      }
    },
    async redirect({ url, baseUrl }) {
      console.log("[NextAuth] redirect callback:", { url, baseUrl })
      // If url is a callback URL, redirect to dashboard
      if (url.includes("/api/auth/callback")) {
        const redirectUrl = `${baseUrl}/dashboard`
        console.log("[NextAuth] Redirecting to dashboard:", redirectUrl)
        return redirectUrl
      }
      // If url is a relative URL, make it absolute
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`
      }
      // If url is on the same origin, allow it
      try {
        const urlObj = new URL(url)
        if (urlObj.origin === baseUrl) {
          return url
        }
      } catch {
        // Invalid URL, fallback to baseUrl
      }
      // Default: redirect to dashboard
      return `${baseUrl}/dashboard`
    },
    async jwt({ token, user, account }) {
      try {
        console.log("[NextAuth] jwt callback:", { 
          hasUser: !!user, 
          userEmail: user?.email,
          provider: account?.provider 
        })
        if (user) {
          token.id = user.id
        }
        return token
      } catch (error) {
        console.error("[NextAuth] jwt callback error:", error)
        return token
      }
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  debug: process.env.NODE_ENV === "development",
  logger: {
    error(code, metadata) {
      console.error("[NextAuth Error]", code, metadata)
    },
    warn(code) {
      console.warn("[NextAuth Warn]", code)
    },
    debug(code, metadata) {
      console.log("[NextAuth Debug]", code, metadata)
    },
  },
}

