import { useMemo, useState } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { useCan } from "@auth/useCan";
import { ITEM_EDIT } from "@auth/permissions";
import { getOnHand, listItems } from "../../../../api";

export function useItems() {
  const can = useCan();
  const canEdit = can(ITEM_EDIT);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [createOpen, setCreateOpen] = useState(false);
  const [flagFilter, setFlagFilter] = useState("ALL");

  const items = useQuery({
    queryKey: ["items", search],
    queryFn: () => listItems(search || undefined),
  });

  const itemList = items.data?.content ?? [];

  const categoryOptions = useMemo(() => {
    const cats = Array.from(
      new Set(itemList.map((i) => i.category).filter(Boolean) as string[]),
    ).sort();
    return [
      { label: "All categories", value: "ALL" },
      ...cats.map((c) => ({ label: c, value: c })),
    ];
  }, [itemList]);

  const filteredItems = itemList.filter((i) => {
    if (categoryFilter !== "ALL" && i.category !== categoryFilter) return false;
    if (statusFilter !== "ALL" && i.status !== statusFilter) return false;
    if (flagFilter === "CRITICAL" && !i.criticalItem) return false;
    if (flagFilter === "APPROVAL" && !i.approvalRequiredForIssue) return false;
    return true;
  });

  const onHandQueries = useQueries({
    queries: itemList.map((item) => ({
      queryKey: ["onHand", item.id],
      queryFn: () => getOnHand(item.id),
      staleTime: 30_000,
    })),
  });

  const onHandMap: Record<string, number> = {};
  onHandQueries.forEach((q, i) => {
    const id = itemList[i]?.id;
    if (id && q.data != null) onHandMap[id] = q.data.quantityOnHand;
  });

  return {
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    flagFilter,
    setFlagFilter,
    createOpen,
    setCreateOpen,
    canEdit,
    items,
    filteredItems,
    onHandMap,
    categoryOptions,
  };
}
