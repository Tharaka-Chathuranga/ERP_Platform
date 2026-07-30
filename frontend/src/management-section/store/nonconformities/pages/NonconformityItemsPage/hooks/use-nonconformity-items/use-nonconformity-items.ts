import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useItemLabels } from "@core/hooks/useLookups";
import { qk } from "@core/queryKeys";
import type { DetectionStage } from "@core/types";
import { getNonconformityItems } from "../../../../api";

export const NONCONFORMITY_ITEM_FILTERS = ["ALL", "INCOMING", "IN_PROGRESS", "FINAL"] as const;

export type NonconformityItemFilter = (typeof NONCONFORMITY_ITEM_FILTERS)[number];

export function useNonconformityItems() {
  const itemLabel = useItemLabels();
  const [filter, setFilter] = useState<NonconformityItemFilter>("ALL");
  const [search, setSearch] = useState("");

  const detectionStage = filter === "ALL" ? undefined : (filter as DetectionStage);
  const query = useQuery({
    queryKey: qk.nonconformityItems(filter),
    queryFn: () => getNonconformityItems(detectionStage),
  });

  const term = search.trim().toLowerCase();
  const filtered = (query.data ?? []).filter(
    (r) =>
      !term ||
      itemLabel(r.itemId).toLowerCase().includes(term) ||
      (r.description ?? "").toLowerCase().includes(term),
  );

  return { filter, setFilter, search, setSearch, query, itemLabel, filtered };
}
