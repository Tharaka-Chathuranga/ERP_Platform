import { Text } from "@mantine/core";
import { DataTable } from "@ui/data";
import type { LowStockItem } from "@core/types";
import { buildWarningsColumns } from "./warnings-columns";

interface WarningsTableProps {
  data: LowStockItem[];
  loading: boolean;
  error: unknown;
}

export function WarningsTable({ data, loading, error }: WarningsTableProps) {
  return (
    <DataTable<LowStockItem>
      data={data}
      loading={loading}
      error={error}
      rowKey={(r) => r.itemId}
      empty={<Text c="dimmed" p="md">Nothing below reorder level — all good.</Text>}
      columns={buildWarningsColumns()}
    />
  );
}
