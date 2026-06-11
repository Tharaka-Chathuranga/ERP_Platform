import { useMemo } from "react";
import { useItems } from "./useItems";
import { useUsers } from "./useUsers";

/** Maps an item id to a short "CODE — Name" label (falls back to a short id). */
export function useItemLabels() {
  const { data } = useItems();
  return useMemo(() => {
    const map = new Map<string, string>();
    data?.content.forEach((i) => map.set(i.id, `${i.itemCode} — ${i.name}`));
    return (id: string) => map.get(id) ?? id.slice(0, 8);
  }, [data]);
}

/** Maps a user id to a display name (falls back to a short id). */
export function useUserLabels() {
  const { data } = useUsers();
  return useMemo(() => {
    const map = new Map<string, string>();
    data?.forEach((u) => map.set(u.id, u.displayName || u.username));
    return (id: string) => map.get(id) ?? id.slice(0, 8);
  }, [data]);
}
