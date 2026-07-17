import { useMemo, useState } from "react";
import { Badge, Button } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { PageHeader } from "@ui/layout/PageHeader";
import { EmptyState } from "@ui/feedback/EmptyState";
import { DataTable, TableToolbar, type Column } from "@ui/data";
import { useCan } from "@auth/useCan";
import { FUEL_MANAGE } from "@auth/permissions";
import { qk } from "@core/queryKeys";
import type { FuelPrice } from "@core/types";
import { listFuelPrices } from "../../api";
import { AddPriceModal } from "../../components/add-price-modal";

function isCurrent(price: FuelPrice): boolean {
  const today = dayjs();
  if (today.isBefore(dayjs(price.effectiveFrom))) return false;
  return !price.effectiveTo || !today.isAfter(dayjs(price.effectiveTo));
}

export function FuelPricesPage() {
  const can = useCan();
  const canManage = can(FUEL_MANAGE);
  const [addOpen, setAddOpen] = useState(false);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);

  const prices = useQuery({ queryKey: qk.fuelPrices(), queryFn: listFuelPrices });

  const filteredPrices = useMemo(() => {
    const all = prices.data ?? [];
    const [from, to] = dateRange;
    if (!from && !to) return all;
    return all.filter((p) => {
      const effectiveFrom = dayjs(p.effectiveFrom);
      if (from && p.effectiveTo && dayjs(p.effectiveTo).isBefore(dayjs(from).startOf("day"))) return false;
      if (to && effectiveFrom.isAfter(dayjs(to).endOf("day"))) return false;
      return true;
    });
  }, [prices.data, dateRange]);

  const columns: Column<FuelPrice>[] = [
    { header: "Unit price", emphasis: true, render: (p) => p.unitPrice },
    { header: "Effective from", render: (p) => dayjs(p.effectiveFrom).format("MMM D, YYYY") },
    { header: "Effective to", render: (p) => (p.effectiveTo ? dayjs(p.effectiveTo).format("MMM D, YYYY") : "Current") },
    {
      header: "",
      render: (p) => (isCurrent(p) ? <Badge color="teal" variant="light" radius="sm">Current</Badge> : null),
    },
    { header: "Note", render: (p) => p.note ?? "—" },
  ];

  return (
    <div>
      <PageHeader title="Fuel prices" />

      <TableToolbar
        filters={[
          {
            type: "daterange",
            label: "Effective period",
            value: dateRange,
            onChange: setDateRange,
          },
        ]}
        actions={
          canManage ? (
            <Button leftSection={<IconPlus size={16} />} onClick={() => setAddOpen(true)}>
              Add price
            </Button>
          ) : undefined
        }
      />

      <DataTable
        columns={columns}
        data={filteredPrices}
        rowKey={(p) => p.id}
        loading={prices.isLoading}
        error={prices.error}
        empty={<EmptyState title="No prices" description="Add a fuel price with its date range." />}
      />

      <AddPriceModal opened={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}
