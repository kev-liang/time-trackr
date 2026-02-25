import { supabase } from "@/lib/supabase";
import type { ActivityHistoryItem } from "@/stores/useActivityHistoryStore";

type HistoryRow = {
  id: string;
  name: string;
  color: string | null;
  last_used: string | null;
  pinned: boolean;
};

function rowToItem(row: HistoryRow): ActivityHistoryItem {
  return {
    id: row.id,
    name: row.name,
    color: row.color ?? undefined,
    lastUsed: row.last_used ?? undefined,
    pinned: row.pinned,
  };
}

export async function fetchActivityHistory(): Promise<ActivityHistoryItem[]> {
  const { data, error } = await supabase
    .from("activity_history")
    .select("id, name, color, last_used, pinned")
    .order("last_used", { ascending: false, nullsFirst: false });

  if (error) throw error;
  return (data ?? []).map(rowToItem);
}

export async function insertActivityHistoryItem(
  item: Omit<ActivityHistoryItem, "id">,
): Promise<ActivityHistoryItem> {
  const { data: { session } } = await supabase.auth.getSession();
  const { data, error } = await supabase
    .from("activity_history")
    .insert({
      name: item.name,
      color: item.color ?? null,
      last_used: item.lastUsed ?? null,
      pinned: item.pinned,
      user_id: session?.user?.id,
    })
    .select("id, name, color, last_used, pinned")
    .single();

  if (error) throw error;
  return rowToItem(data);
}

export async function updateActivityHistoryItem(
  id: string,
  updates: Partial<{ name: string; color: string | null; last_used: string | null; pinned: boolean }>,
): Promise<void> {
  const { error } = await supabase
    .from("activity_history")
    .update(updates)
    .eq("id", id);

  if (error) throw error;
}

export async function deleteActivityHistoryItem(id: string): Promise<void> {
  const { error } = await supabase
    .from("activity_history")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
