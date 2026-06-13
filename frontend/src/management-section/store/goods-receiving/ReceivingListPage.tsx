import { useMemo } from "react";
import { Badge, Button } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { PageHeader } from "@ui/layout/PageHeader";
import { EmptyState } from "@ui/feedback/EmptyState";
import { DataTable, type Column } from "@ui/data/DataTable";
import { qk } from "@core/queryKeys";
import type { Receival } from "@core/types";
import { listReceivals } from "@store/goods-receiving/receiving.api";
import { listSuppliers } from "@store/inventory/suppliers.api";

export function ReceivingListPage() {
  const navigate = useNavigate();
  const { data, isLoading, error } = useQuery({
    queryKey: qk.receivals(),
    queryFn: () => listReceivals(),
  });
  const suppliers = useQuery({ queryKey: qk.suppliers(), queryFn: listSuppliers });

  const supplierName = useMemo(() => {
    const map = new Map(suppliers.data?.map((s) => [s.id, `${s.code} — ${s.name}`]));
    return (id?: string, name?: string) => (id ? map.get(id) ?? id.slice(0, 8) : name ?? "—");
  }, [suppliers.data]);

  const columns: Column<Receival>[] = [
    { header: "Receival №", emphasis: true, render: (r) => r.receivalNumber },
    {
      header: "Supplier",
      render: (r) => (
        <>
          {supplierName(r.supplierId, r.supplierName)}
          {!r.supplierId && r.supplierName && (
            <Badge ml="xs" size="xs" variant="light" color="gray">
              Unregistered
            </Badge>
          )}
        </>
      ),
    },
    { header: "PO №", render: (r) => r.poNumber || "—" },
    { header: "Invoice", render: (r) => r.invoiceNumber || "—" },
    { header: "Lines", render: (r) => r.lines.length },
    { header: "Received", render: (r) => dayjs(r.receivedAt).format("YYYY-MM-DD") },
    {
      header: "GRN",
      render: (r) =>
        r.goodReceiveNoteId ? (
          <Badge size="sm" variant="light" color="green">
            Generated
          </Badge>
        ) : (
          <Badge size="sm" variant="light" color="yellow">
            Pending
          </Badge>
        ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Receiving"
        actions={
          <Button leftSection={<IconPlus size={16} />} onClick={() => navigate("/receiving/new")}>
            New item receival
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={data?.content}
        rowKey={(r) => r.id}
        onRowClick={(r) => navigate(`/receiving/${r.id}`)}
        loading={isLoading}
        error={error}
        empty={
          <EmptyState
            title="No receivals yet"
            description="Receive items into the store — stock is updated immediately and a GRN is generated automatically."
            action={
              <Button variant="light" onClick={() => navigate("/receiving/new")}>
                New item receival
              </Button>
            }
          />
        }
      />
    </div>
  );
}
