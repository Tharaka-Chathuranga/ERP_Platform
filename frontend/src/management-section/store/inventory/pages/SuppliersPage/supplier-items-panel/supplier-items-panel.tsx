import { Card, Text } from "@mantine/core";
import { DataTable } from "@ui/data";
import type { Supplier, SupplierItem } from "@core/types";
import { buildSupplierItemColumns } from "./supplier-items-columns";

interface SupplierItemsPanelProps {
  selected: Supplier | null;
  data: SupplierItem[] | undefined;
  loading: boolean;
  error: unknown;
  itemLabel: (id: string) => string;
}

export function SupplierItemsPanel({ selected, data, loading, error, itemLabel }: SupplierItemsPanelProps) {
  const itemColumns = buildSupplierItemColumns({ itemLabel });

  return (
    <Card withBorder radius="md" padding="lg">
      {!selected ? (
        <Text c="dimmed">Select a supplier to see its items.</Text>
      ) : (
        <>
          <Text fw={600} mb="sm">
            {selected.name} — supplied items
          </Text>
          <DataTable
            withCard={false}
            columns={itemColumns}
            data={data}
            rowKey={(si) => si.id}
            loading={loading}
            error={error}
            empty={
              <Text c="dimmed" size="sm">
                No items linked.
              </Text>
            }
          />
        </>
      )}
    </Card>
  );
}
