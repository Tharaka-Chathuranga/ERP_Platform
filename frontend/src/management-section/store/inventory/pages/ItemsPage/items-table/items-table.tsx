import { EmptyState } from "@ui/feedback/EmptyState";
import { DataTable } from "@ui/data";
import type { Item } from "@core/types";
import { buildItemsColumns } from "./items-columns";

interface ItemsTableProps {
  data: Item[];
  loading: boolean;
  error: unknown;
  onHandMap: Record<string, number>;
  onRowClick: (item: Item) => void;
}

export function ItemsTable({ data, loading, error, onHandMap, onRowClick }: ItemsTableProps) {
  const columns = buildItemsColumns({ onHandMap });

  return (
    <DataTable
      columns={columns}
      data={data}
      rowKey={(i) => i.id}
      onRowClick={onRowClick}
      loading={loading}
      error={error}
      rowBg={(i) => {
        const qty = onHandMap[i.id];
        if (qty != null && i.reorderLevel > 0 && qty <= i.reorderLevel) {
          return "var(--mantine-color-red-light)";
        }
        return undefined;
      }}
      empty={<EmptyState title="No items" description="Create an item to start tracking stock." />}
    />
  );
}
