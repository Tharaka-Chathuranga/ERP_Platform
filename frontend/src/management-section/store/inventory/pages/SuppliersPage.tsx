import { useState } from "react";
import { Anchor, Button, Card, Grid, Text } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@ui/layout/PageHeader";
import { StatusBadge } from "@ui/feedback/StatusBadge";
import { EmptyState } from "@ui/feedback/EmptyState";
import { DataTable, TableToolbar, type Column } from "@ui/data";
import { useCan } from "@auth/useCan";
import { useItemLabels } from "@core/hooks/useLookups";
import { SUPPLIER_MANAGE } from "@auth/permissions";
import { notifyError, notifySuccess } from "@core/notify";
import {
  activateSupplier,
  deactivateSupplier,
  listSupplierItems,
  listSuppliers,
} from "../api";
import type { Supplier, SupplierItem } from "@core/types";
import { SupplierFormModal } from "../components/SupplierFormModal";

export function SuppliersPage() {
  const qc = useQueryClient();
  const canManage = useCan()(SUPPLIER_MANAGE);
  const itemLabel = useItemLabels();
  const [selected, setSelected] = useState<Supplier | null>(null);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");

  const suppliers = useQuery({ queryKey: ["suppliers"], queryFn: listSuppliers });
  const supplierItems = useQuery({
    queryKey: ["supplierItems", selected?.id],
    queryFn: () => listSupplierItems(selected!.id),
    enabled: !!selected,
  });

  const toggle = useMutation({
    mutationFn: (s: Supplier) =>
      s.status === "ACTIVE" ? deactivateSupplier(s.id) : activateSupplier(s.id),
    onSuccess: () => {
      notifySuccess("Supplier updated");
      qc.invalidateQueries({ queryKey: ["suppliers"] });
    },
    onError: notifyError,
  });

  const supplierColumns: Column<Supplier>[] = [
    { header: "Code", emphasis: true, render: (s) => s.code },
    { header: "Name", render: (s) => s.name },
    { header: "Status", render: (s) => <StatusBadge status={s.status} /> },
  ];

  if (canManage) {
    supplierColumns.push({
      header: "",
      align: "right",
      render: (s) => (
        <Anchor
          component="button"
          type="button"
          c={s.status === "ACTIVE" ? "red" : "green"}
          onClick={(e) => {
            e.stopPropagation();
            if (!toggle.isPending) toggle.mutate(s);
          }}
        >
          {s.status === "ACTIVE" ? "Deactivate" : "Activate"}
        </Anchor>
      ),
    });
  }

  const itemColumns: Column<SupplierItem>[] = [
    { header: "Item", render: (si) => itemLabel(si.itemId) },
    { header: "Supplier SKU", render: (si) => si.supplierSku || "—" },
    { header: "Lead days", render: (si) => si.leadTimeDays ?? "—" },
  ];

  const term = search.trim().toLowerCase();
  const filteredSuppliers = (suppliers.data ?? []).filter(
    (s) => s.code.toLowerCase().includes(term) || s.name.toLowerCase().includes(term),
  );

  return (
    <div>
      <PageHeader title="Suppliers" />

      <TableToolbar
        search={{ value: search, onChange: setSearch, placeholder: "Search code or name…" }}
        actions={
          canManage && (
            <Button leftSection={<IconPlus size={16} />} onClick={() => setCreating(true)}>
              New supplier
            </Button>
          )
        }
      />

      <Grid align="flex-start">
        <Grid.Col span={{ base: 12, md: 6 }}>
          <DataTable
            columns={supplierColumns}
            data={filteredSuppliers}
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

      <SupplierFormModal opened={creating} onClose={() => setCreating(false)} />
    </div>
  );
}
