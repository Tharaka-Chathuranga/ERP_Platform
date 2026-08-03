import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useItemCodes } from "@core/hooks/useLookups";
import { qk } from "@core/queryKeys";
import type { MovementType } from "@core/types";
import { listMovements } from "../../../../api";

const TYPES: MovementType[] = [
  "RECEIPT",
  "ISSUE",
  "ADJUSTMENT_IN",
  "ADJUSTMENT_OUT",
  "TRANSFER_IN",
  "TRANSFER_OUT",
];

export function useStockMovementDetail() {
  const itemCode = useItemCodes();
  const all = useQuery({ queryKey: qk.allMovements(), queryFn: listMovements });

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [itemFilter, setItemFilter] = useState("ALL");
  const [range, setRange] = useState<[Date | null, Date | null]>([null, null]);

  const rows = all.data?.content ?? [];

  const typeOptions = [
    { value: "ALL", label: "All types" },
    ...TYPES.map((t) => ({ value: t, label: t.replace(/_/g, " ") })),
  ];

  const itemOptions = useMemo(() => {
    const ids = [...new Set(rows.map((m) => m.itemId))];
    return [
      { value: "ALL", label: "All items" },
      ...ids.map((id) => ({ value: id, label: itemCode(id) })).sort((a, b) => a.label.localeCompare(b.label)),
    ];
  }, [rows, itemCode]);

  const [from, to] = range;
  const term = search.trim().toLowerCase();
  const visible = rows.filter((m) => {
    if (typeFilter !== "ALL" && m.type !== typeFilter) return false;
    if (itemFilter !== "ALL" && m.itemId !== itemFilter) return false;
    if (from && dayjs(m.occurredAt).isBefore(dayjs(from).startOf("day"))) return false;
    if (to && dayjs(m.occurredAt).isAfter(dayjs(to).endOf("day"))) return false;
    if (term && !itemCode(m.itemId).toLowerCase().includes(term) && !(m.reference ?? "").toLowerCase().includes(term)) return false;
    return true;
  });

  return {
    itemCode,
    all,
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    itemFilter,
    setItemFilter,
    range,
    setRange,
    visible,
    typeOptions,
    itemOptions,
  };
}
