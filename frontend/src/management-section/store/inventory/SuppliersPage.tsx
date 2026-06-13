import { useState } from "react";
import { Button, Card, Grid, Text } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@ui/layout/PageHeader";
import { StatusBadge } from "@ui/feedback/StatusBadge";
import { EmptyState } from "@ui/feedback/EmptyState";
import { DataTable, type Column } from "@ui/data";
import { useItemLabels } from "@core/hooks/useLookups";
import { listSupplierItems, listSuppliers } from "@store/inventory/suppliers.api";
import type { Supplier, SupplierItem } from "@core/types";

export function SuppliersPage() {
  const navigate = useNavigate();
  const itemLabel = useItemLabels();
  const [selected, setSelected] = useState<Supplier | null>(null);

  const suppliers = useQuery({ queryKey: ["suppliers"], queryFn: listSuppliers });
  const supplierItems = useQuery({
    queryKey: ["supplierItems", selected?.id],
    queryFn: () => listSupplierItems(selected!.id),
    enabled: !!selected,
  });

  const supplierColumns: Column<Supplier>[] = [
    { header: "Code", emphasis: true, render: (s) => s.code },
    { header: "Name", render: (s) => s.name },
    { header: "Status", render: (s) => <StatusBadge status={s.status} /> },
  ];

  const itemColumns: Column<SupplierItem>[] = [
    { header: "Item", render: (si) => itemLabel(si.itemId) },
    { header: "Supplier SKU", render: (si) => si.supplierSku || "—" },
    { header: "Lead days", render: (si) => si.leadTimeDays ?? "—" },
  ];

  return (
    <div>
      <PageHeader
        title="Suppliers"
        actions={
          <Button
            variant="default"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => navigate("/store")}
          >
            Back to items
          </Button>
        }
      />

      <Grid align="flex-start">
        <Grid.Col span={{ base: 12, md: 6 }}>
          <DataTable
            columns={supplierColumns}
            data={suppliers.data}
            rowKey={(s) => s.id}
            onRowClick={setSelected}
            activeRowKey={selected?.id}
            loading={suppliers.isLoading}
            error={suppliers.error}
            empty={<EmptyState title="No suppliers" />}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
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
                  data={supplierItems.data}
                  rowKey={(si) => si.id}
                  loading={supplierItems.isLoading}
                  error={supplierItems.error}
                  empty={
                    <Text c="dimmed" size="sm">
                      No items linked.
                    </Text>
                  }
                />
              </>
            )}
          </Card>
        </Grid.Col>
      </Grid>
    </div>
  );
}
