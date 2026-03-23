import { create } from "zustand";

import { getIsPro } from "@/lib/purchases";

type SubscriptionStore = {
  isPro: boolean;
  checkSubscription: () => Promise<void>;
};

export const useSubscriptionStore = create<SubscriptionStore>((set) => ({
  isPro: false,
  checkSubscription: async () => {
    const pro = await getIsPro();
    set({ isPro: pro });
  },
}));
