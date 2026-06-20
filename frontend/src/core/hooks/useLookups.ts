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

/** A predicate telling whether an item is flagged critical (the `criticalItem`
 *  flag on the item). Unknown ids are treated as not critical. */
export function useCriticalItems() {
  const { data } = useItems();
  return useMemo(() => {
    const critical = new Set<string>();
    data?.content.forEach((i) => {
      if (i.criticalItem) critical.add(i.id);
    });
    return (id: string) => critical.has(id);
  }, [data]);
}

/** Maps an item id to just its item code (falls back to a short id). */
export function useItemCodes() {
  const { data } = useItems();
  return useMemo(() => {
    const map = new Map<string, string>();
    data?.content.forEach((i) => map.set(i.id, i.itemCode));
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
