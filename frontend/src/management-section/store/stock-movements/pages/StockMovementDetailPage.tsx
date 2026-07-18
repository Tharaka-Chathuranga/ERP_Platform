import { useMemo, useState } from "react";
import { Badge, Button } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import { PageHeader } from "@ui/layout/PageHeader";
import { DataTable, TableToolbar, type Column } from "@ui/data";
import { EmptyState } from "@ui/feedback/EmptyState";
import { useItemCodes } from "@core/hooks/useLookups";
import { qk } from "@core/queryKeys";
import type { MovementType, StockMovement } from "@core/types";
import { listMovements } from "../api";
import { isOutbound } from "../utils/movementStats";

const TYPES: MovementType[] = [
  "RECEIPT",
  "ISSUE",
  "ADJUSTMENT_IN",
  "ADJUSTMENT_OUT",
  "TRANSFER_IN",
  "TRANSFER_OUT",
];

function MovementTypeBadge({ type }: { type: MovementType }) {
  return (
    <Badge color={isOutbound(type) ? "red" : "green"} variant="light" radius="sm">
      {type.replace(/_/g, " ")}
    </Badge>
  );
}

export function StockMovementDetailPage() {
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

  const columns: Column<StockMovement>[] = [
    { header: "Item code", emphasis: true, render: (m) => itemCode(m.itemId) },
    { header: "Type", render: (m) => <MovementTypeBadge type={m.type} /> },
    { header: "Quantity", align: "right", render: (m) => m.quantity.toLocaleString() },
    { header: "Unit cost", align: "right", render: (m) => m.unitCost ?? "—" },
    { header: "Reference", render: (m) => m.reference || "—" },
    { header: "When", render: (m) => dayjs(m.occurredAt).format("YYYY-MM-DD HH:mm") },
  ];

  return (
    <div>
      <PageHeader title="Movement detail" />

      <TableToolbar
        leftSection={
          <Button component={Link} to="/movements" variant="default" leftSection={<IconArrowLeft size={16} />}>
            Back to overview
          </Button>
        }
        filters={[
          { label: "Type", value: typeFilter, onChange: setTypeFilter, options: typeOptions },
          { label: "Item", value: itemFilter, onChange: setItemFilter, options: itemOptions },
          { type: "daterange", label: "Date", value: range, onChange: setRange },
        ]}
        search={{ value: search, onChange: setSearch, placeholder: "Search item code or reference…" }}
        searchPosition="right"
      />

      <DataTable
        columns={columns}
        data={visible}
        rowKey={(m) => m.id}
        loading={all.isLoading}
        error={all.error}
        empty={
          <EmptyState
            title="No stock movements match"
            description="Adjust the filters, or record receiving and issuing to populate the ledger."
          />
        }
      />
    </div>
  );
}
