"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useSearchParams } from "next/navigation";

export function useAuth() {
  const { data: session, status } = useSession();

  return {
    user: session?.user ?? null,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    signIn: (callbackUrl?: string) =>
      signIn("google", { callbackUrl: callbackUrl || "/library" }),
    signOut: () => signOut({ callbackUrl: "/" }),
  };
}

export function useAuthWithRedirect() {
  const auth = useAuth();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect_to");

  return {
    ...auth,
    signIn: () =>
      auth.signIn(redirectTo || "/library"),
    redirectTo,
  };
}
