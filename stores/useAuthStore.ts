import type { Session } from "@supabase/supabase-js";
import { create } from "zustand";

import {
  getSession,
  onAuthStateChange,
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
    getSession().then((session) => {
      set({ session, loading: false });
    });

    const subscription = onAuthStateChange((session) => {
      set({ session, loading: false });
    });

    return () => subscription.unsubscribe();
  },

  signInWithApple: async () => {
    await appleSignIn();
  },

  signInWithGoogle: async (idToken: string) => {
    await googleSignIn(idToken);
  },

  signOut: async () => {
    await authSignOut();
    set({ session: null });
  },
}));
