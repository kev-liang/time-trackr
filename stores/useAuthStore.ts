import type { Session } from "@supabase/supabase-js";
import { create } from "zustand";

import { analytics } from "@/lib/analytics";
import {
  getSession,
  onAuthStateChange,
  signInAnonymously,
  signInWithApple as appleSignIn,
  signInWithGoogle as googleSignIn,
  signOut as authSignOut,
} from "@/lib/supabase-auth";

type AuthState = {
  session: Session | null;
  loading: boolean;
};

type AuthActions = {
  initialize: () => () => void;
  signInWithApple: () => Promise<void>;
  signInWithGoogle: (idToken: string) => Promise<void>;
  signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  session: null,
  loading: true,

  initialize: () => {
    getSession().then(async (session) => {
      if (!session) {
        await signInAnonymously();
        analytics.capture("auth_signed_in", { method: "anonymous" });
      } else {
        set({ session, loading: false });
      }
    });

    const subscription = onAuthStateChange((session) => {
      set({ session, loading: false });
      if (session) {
        analytics.identify(session.user.id, {
          is_anonymous: session.user.is_anonymous ?? true,
        });
      }
    });

    return () => subscription.unsubscribe();
  },

  signInWithApple: async () => {
    await appleSignIn();
    analytics.capture("auth_signed_in", { method: "apple" });
  },

  signInWithGoogle: async (idToken: string) => {
    await googleSignIn(idToken);
    analytics.capture("auth_signed_in", { method: "google" });
  },

  signOut: async () => {
    analytics.capture("auth_signed_out");
    await authSignOut();
    set({ session: null });
  },
}));
