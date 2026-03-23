import { useMemo } from "react";

import { useSubscriptionStore } from "@/stores/useSubscriptionStore";

export function useBottomSheetSnapPoints(
  pickerField: "start" | "end" | null,
): number[] {
  const isPro = useSubscriptionStore((s) => s.isPro);

  return useMemo(() => {
    const base = pickerField !== null ? 520 : 300;
    return [isPro ? base : base + 100];
  }, [pickerField, isPro]);
}
