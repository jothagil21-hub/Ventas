import type { NextAuthConfig } from "next-auth";

export type AppRole = "ADMIN" | "SELLER";

declare module "next-auth" {
  interface User {
    role: AppRole;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: AppRole;
    };
  }
}

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = !!auth?.user;
      const role = auth?.user?.role;

      const isPublic =
        pathname.startsWith("/login") ||
        pathname.startsWith("/api/auth") ||
        pathname.startsWith("/uploads");

      if (!isLoggedIn && !isPublic) return false;
      if (isLoggedIn && pathname.startsWith("/login")) {
        return Response.redirect(new URL("/consulta", request.nextUrl));
      }

      const adminOnly =
        pathname.startsWith("/admin") ||
        pathname.startsWith("/productos") ||
        pathname.startsWith("/categorias") ||
        pathname.startsWith("/sucursales") ||
        pathname.startsWith("/inventario/ajuste") ||
        pathname.startsWith("/inventario/traslado");

      if (isLoggedIn && adminOnly && role !== "ADMIN") {
        return Response.redirect(new URL("/consulta", request.nextUrl));
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as AppRole;
      return session;
    },
  },
  trustHost: true,
} satisfies NextAuthConfig;
