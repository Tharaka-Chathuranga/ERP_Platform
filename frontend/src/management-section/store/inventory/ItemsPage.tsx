import { useMemo, useState } from "react";
import { Badge, Button, Group, Text } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@ui/layout/PageHeader";
import { EmptyState } from "@ui/feedback/EmptyState";
import { DataTable, TableToolbar, type Column } from "@ui/data";
import { useCan } from "@auth/useCan";
import { ITEM_EDIT } from "@auth/permissions";
import { getOnHand, listItems } from "@store/inventory/items.api";
import type { Item } from "@core/types";
import { CreateItemModal } from "./CreateItemModal";

export function ItemsPage() {
  const can = useCan();
  const canEdit = can(ITEM_EDIT);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [createOpen, setCreateOpen] = useState(false);

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

  const [flagFilter, setFlagFilter] = useState("ALL");

  const STATUS_OPTIONS = [
    { label: "All statuses", value: "ALL" },
    { label: "Active", value: "ACTIVE" },
    { label: "Inactive", value: "INACTIVE" },
  ];

  const FLAG_OPTIONS = [
    { label: "All flags", value: "ALL" },
    { label: "Critical", value: "CRITICAL" },
    { label: "Approval required", value: "APPROVAL" },
  ];

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

  const columns: Column<Item>[] = [
    { header: "Code", emphasis: true, render: (i) => i.itemCode },
    { header: "Name", render: (i) => i.name },
    { header: "Category", render: (i) => i.category ?? "—" },
    { header: "Description", render: (i) => i.description ? (
      <Text size="sm" lineClamp={1}>{i.description}</Text>
    ) : "—" },
    { header: "UoM", render: (i) => i.unitOfMeasure },
    {
      header: "Qty on hand",
      align: "right",
      render: (i) => onHandMap[i.id] != null ? onHandMap[i.id] : "—",
    },
    {
      header: "Reorder level",
      align: "right",
      render: (i) => i.reorderLevel > 0 ? i.reorderLevel : "—",
    },
    {
      header: "Flags",
      render: (i) => (
        <Group gap={4}>
          {i.criticalItem && (
            <Badge size="xs" color="red" variant="light">Critical</Badge>
          )}
          {i.approvalRequiredForIssue && (
            <Badge size="xs" color="yellow" variant="light">Approval</Badge>
          )}
        </Group>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Store" />

      <TableToolbar
        filters={[
          { label: "Category", value: categoryFilter, onChange: setCategoryFilter, options: categoryOptions },
          { label: "Status", value: statusFilter, onChange: setStatusFilter, options: STATUS_OPTIONS },
          { label: "Flag", value: flagFilter, onChange: setFlagFilter, options: FLAG_OPTIONS },
        ]}
        search={{ value: search, onChange: setSearch, placeholder: "Search item code or name…" }}
        actions={
          canEdit ? (
            <Button leftSection={<IconPlus size={16} />} onClick={() => setCreateOpen(true)}>
              New item
            </Button>
          ) : undefined
        }
      />

      <DataTable
        columns={columns}
        data={filteredItems}
        rowKey={(i) => i.id}
        onRowClick={(i) => navigate(`/store/${i.id}`)}
        loading={items.isLoading}
        error={items.error}
        rowBg={(i) => {
          const qty = onHandMap[i.id];
          if (qty != null && i.reorderLevel > 0 && qty <= i.reorderLevel) {
            return "var(--mantine-color-red-light)";
          }
          return undefined;
        }}
        empty={<EmptyState title="No items" description="Create an item to start tracking stock." />}
      />

      <CreateItemModal opened={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
