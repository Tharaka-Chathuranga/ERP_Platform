import { useQuery } from "@tanstack/react-query";
import { listItems } from "@store/inventory/items.api";

/** Item list, optionally filtered by a search term (item code or name). */
export function useItems(search?: string) {
  return useQuery({
    queryKey: ["items", search ?? ""],
    queryFn: () => listItems(search),
    staleTime: 30_000,
  });
}
