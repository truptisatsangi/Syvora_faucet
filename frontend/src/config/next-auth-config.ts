import NextAuth, { NextAuthConfig, User } from "next-auth";
import Credential from "next-auth/providers/credentials";
import Github from "next-auth/providers/github";
import Google from "next-auth/providers/google";

import { getConfig } from "../config/config";

const { backendUrl } = getConfig();

export const authOptions: NextAuthConfig = {
  providers: [
    Github({
      clientId: process.env.NEXT_PUBLIC_GITHUB_AUTH_CLIENT_ID as string,
      clientSecret: process.env.NEXT_PUBLIC_GITHUB_AUTH_CLIENT_SECRET as string,
      name: "GitHub",
    }),
    Google({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_AUTH_CLIENT_ID as string,
      clientSecret: process.env.NEXT_PUBLIC_GOOGLE_AUTH_CLIENT_SECRET as string,
      name: "Google",
    }),
    Credential({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        firstName: { label: "First Name", type: "text" },
        lastName: { label: "Last Name", type: "text" },
        mode: { label: "Mode", type: "text" },
      },
      async authorize(credentials) {
        const { email, password, firstName, lastName, mode } = credentials ?? {};

        if (!email || !password || !mode) {
          console.error("[🔐 AUTH ERROR] Missing required credentials.");
          return null;
        }

        try {
          const existsRes = await fetch(`${backendUrl}/auth/userExists?email=${email}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          });

          if (!existsRes.ok) {
            console.error("[❌ AUTH ERROR] Failed to check user existence:", await existsRes.text());
            return null;
          }

          const { exists: userExists } = await existsRes.json();
          console.log(`[🔄 USER EXISTS] ${userExists ? "User found" : "User not found"} for ${email}`);

          if (mode === "signin" && !userExists) {
            console.warn("[⚠️ AUTH WARNING] Tried to sign in, but user does not exist.");
            return null;
          }

          if (mode === "signup" && userExists) {
            console.warn("[⚠️ AUTH WARNING] Tried to sign up, but user already exists.");
            return null;
          }

          const endpoint = mode === "signin" ? "/auth/signin" : "/auth/signup";
          const requestBody =
            mode === "signin"
              ? { email, password }
              : { email, password, firstName, lastName };

          const response = await fetch(`${backendUrl}${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
          });

          if (!response.ok) {
            const errorData = await response.json();
            console.error(`[❌ AUTH ERROR] ${mode} failed:`, errorData.message);
            return null;
          }

          const data = await response.json();
          console.log("[✅ AUTH SUCCESS] User authenticated:", data.user);

          return {
            id: data.user.id.toString(),
            email: data.user.email,
            name: `${data.user.firstName ?? ""} ${data.user.lastName ?? ""}`.trim(),
            image: null,
          } as User;

        } catch (error) {
          console.error("[❌ AUTH ERROR] Unexpected error:", error);
          return null;
        }
      }

    }),
  ],
  callbacks: {
    async signIn({ account, profile, credentials }) {
      console.log("[📥 CALLBACK] signIn triggered");
      if (account?.provider === "google") {
        const googleSignInData = {
          provider: account.provider,
          userName: profile?.username,
          firstName: profile?.given_name,
          lastName: profile?.family_name,
          email: profile?.email,
          image: profile?.picture,
        };
        console.log("[🔐 Google OAuth] Sign-in details:", googleSignInData);
      }

      if (account?.provider === "github") {
        const githubSignInData = {
          provider: account.provider,
          userName: profile?.username,
          firstName: profile?.login,
          lastName: "",
          email: profile?.email,
          image: profile?.avatar_url,
        };
        console.log("[🔐 GitHub OAuth] Sign-in details:", githubSignInData);
      }

      if (account?.provider === "credentials") {
        const credentialSignInData = {
          provider: account.provider,
          userName: credentials?.username,
          firstName: credentials?.firstName,
          lastName: credentials?.lastName,
          email: credentials?.email,
          image: credentials?.picture,
        };
        console.log("[🔐 Credentials] Sign-in details:", credentialSignInData);
      }

      return true;
    },
    async jwt({ token, account, profile, user }) {
      console.log("[📥 CALLBACK] jwt triggered");

      if (account?.provider === "google" && profile) {
        token.signInData = {
          provider: account.provider,
          userName: profile?.username,
          firstName: profile.given_name,
          lastName: profile.family_name,
          email: profile.email,
          image: profile.picture,
        };
        console.log("[🔐 Google OAuth] Token data set:", token.signInData);
      }

      if (account?.provider === "github" && profile) {
        token.signInData = {
          provider: account.provider,
          userName: profile?.username,
          firstName: profile.login,
          lastName: "",
          email: profile.email,
          image: profile.avatar_url,
        };
        console.log("[🔐 GitHub OAuth] Token data set:", token.signInData);
      }

      if (account?.provider === "credentials" && user) {
        console.log("[🔐 Credentials] Token data set for user:", user);
        token.signInData = {
          provider: account.provider,
          email: user.email,
        };
      }

      return token;
    },
    async session({ session, token }) {
      console.log("[📥 CALLBACK] session triggered");
      if (token?.signInData) {
        session.user = {
          ...session.user,
          ...token.signInData,
        };
        console.log("[💾 SESSION DATA] Enriched session user:", session.user);
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXT_PUBLIC_AUTH_SECRET,
};

export const { auth, handlers, signIn, signOut } = NextAuth(authOptions);

export async function getServerSession() {
  const session = await auth();
  console.log("[📡 SERVER SESSION] Retrieved session:", session);
  return session;
}
