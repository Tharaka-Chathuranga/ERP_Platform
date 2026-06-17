import { useMemo, useState } from "react";
import { Anchor, Badge, Group, MultiSelect, Select } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { IconArrowLeft } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import { PageHeader } from "@ui/layout/PageHeader";
import { DataTable, type Column } from "@ui/data";
import { EmptyState } from "@ui/feedback/EmptyState";
import { useItemCodes } from "@core/hooks/useLookups";
import { qk } from "@core/queryKeys";
import type { MovementType, StockMovement } from "@core/types";
import { listMovements } from "./movements.api";
import { isOutbound } from "./movementStats";

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

  const [types, setTypes] = useState<string[]>([]);
  const [itemId, setItemId] = useState<string | null>(null);
  const [range, setRange] = useState<[Date | null, Date | null]>([null, null]);

  const rows = all.data?.content ?? [];

  // Item options, deduped from whatever actually moved.
  const itemOptions = useMemo(() => {
    const ids = [...new Set(rows.map((m) => m.itemId))];
    return ids
      .map((id) => ({ value: id, label: itemCode(id) }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [rows, itemCode]);

  const [from, to] = range;
  const visible = rows.filter((m) => {
    if (types.length && !types.includes(m.type)) return false;
    if (itemId && m.itemId !== itemId) return false;
    if (from && dayjs(m.occurredAt).isBefore(dayjs(from).startOf("day"))) return false;
    if (to && dayjs(m.occurredAt).isAfter(dayjs(to).endOf("day"))) return false;
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

      <Anchor component={Link} to="/movements" size="sm" mb="md" display="inline-block">
        <Group gap={4}>
          <IconArrowLeft size={16} />
          Back to overview
        </Group>
      </Anchor>

      <Group mb="md" align="flex-end" wrap="wrap">
        <MultiSelect
          label="Type"
          placeholder="All types"
          data={TYPES.map((t) => ({ value: t, label: t.replace(/_/g, " ") }))}
          value={types}
          onChange={setTypes}
          clearable
          w={260}
        />
        <Select
          label="Item"
          placeholder="All items"
          data={itemOptions}
          value={itemId}
          onChange={setItemId}
          clearable
          searchable
          w={220}
        />
        <DatePickerInput
          type="range"
          label="Date range"
          placeholder="Any date"
          value={range}
          onChange={setRange}
          clearable
          w={260}
        />
      </Group>

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
