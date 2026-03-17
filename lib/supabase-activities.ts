import { supabase } from "@/lib/supabase";
import type { Activity } from "@/stores/useActivityStore";

type ActivityRow = {
  id: string;
  title: string;
  start: string;
  end: string;
  color: string;
};

function rowToActivity(row: ActivityRow): Activity {
  return {
    id: row.id,
    title: row.title,
    start: row.start,
    end: row.end,
    color: row.color,
  };
}

export async function fetchActivities(): Promise<Activity[]> {
  const { data, error } = await supabase
    .from("activities")
    .select("id, title, start, end, color")
    .order("start", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(rowToActivity);
}

export async function insertActivity(
  activity: Omit<Activity, "id">,
): Promise<Activity> {
  const { data: { session } } = await supabase.auth.getSession();
  const { data, error } = await supabase
    .from("activities")
    .insert({
      title: activity.title,
      start: activity.start,
      end: activity.end,
      color: activity.color,
      user_id: session?.user?.id,
    })
    .select("id, title, start, end, color")
    .single();

  if (error) throw error;
  return rowToActivity(data);
}

export async function updateActivity(
  id: string,
  updates: Partial<Omit<Activity, "id">>,
): Promise<void> {
  const { error } = await supabase
    .from("activities")
    .update(updates)
    .eq("id", id);

  if (error) throw error;
}

export async function deleteActivity(id: string): Promise<void> {
  const { error } = await supabase
    .from("activities")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function bulkRenameActivities(
  oldTitle: string,
  newTitle: string,
): Promise<void> {
  const { error } = await supabase
    .from("activities")
    .update({ title: newTitle })
    .eq("title", oldTitle);

  if (error) throw error;
}
