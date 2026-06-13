import { useQuery } from "@tanstack/react-query";
import { qk } from "@core/queryKeys";
import { listItems } from "@store/inventory/items.api";

export function useItems(search?: string) {
  return useQuery({
    queryKey: qk.items(search),
    queryFn: () => listItems(search),
    staleTime: 30_000,
  });
}
