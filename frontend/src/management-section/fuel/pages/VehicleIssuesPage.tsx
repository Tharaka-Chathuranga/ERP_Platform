import { useMemo, useState } from "react";
import { Button } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { PageHeader } from "@ui/layout/PageHeader";
import { EmptyState } from "@ui/feedback/EmptyState";
import { DataTable, TableToolbar, type Column } from "@ui/data";
import { useUsers } from "@core/hooks/useUsers";
import { useCan } from "@auth/useCan";
import { FUEL_VIEW } from "@auth/permissions";
import { qk } from "@core/queryKeys";
import type { VehicleFuelIssue } from "@core/types";
import { listVehicleIssues, listVehicles } from "./fuel.api";

export function VehicleIssuesPage() {
  const navigate = useNavigate();
  const can = useCan();
  const canCreate = can(FUEL_VIEW);

  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [vehicleId, setVehicleId] = useState<string | null>(null);

  // Vehicle filter is server-side; date + text search are client-side
  const issues = useQuery({
    queryKey: qk.vehicleIssues(vehicleId ?? "ALL"),
    queryFn: () => listVehicleIssues({ vehicleId: vehicleId ?? undefined }),
  });
  const vehicles = useQuery({ queryKey: qk.vehicles(), queryFn: () => listVehicles() });
  const users = useUsers();

  const vehicleNumber = useMemo(() => {
    const map = new Map(vehicles.data?.content.map((v) => [v.id, v.vehicleNumber]));
    return (id: string) => map.get(id) ?? "—";
  }, [vehicles.data]);

  const userName = useMemo(() => {
    const map = new Map(users.data?.map((u) => [u.id, u.displayName || u.username]));
    return (id: string) => map.get(id) ?? "—";
  }, [users.data]);

  // km/L computation: consecutive odometer pairs per vehicle (ascending order)
  const kmPerLitreById = useMemo(() => {
    const all = issues.data?.content ?? [];
    const ascending = [...all].reverse();
    const lastByVehicle = new Map<string, { km: number; litres: number }>();
    const result = new Map<string, number>();
    for (const issue of ascending) {
      const prev = lastByVehicle.get(issue.vehicleId);
      if (prev !== undefined && issue.odometerReadingKm != null) {
        const kmDriven = issue.odometerReadingKm - prev.km;
        if (kmDriven > 0) result.set(issue.id, kmDriven / prev.litres);
      }
      if (issue.odometerReadingKm != null) {
        lastByVehicle.set(issue.vehicleId, { km: issue.odometerReadingKm, litres: issue.litresIssued });
      }
    }
    return result;
  }, [issues.data]);

  // Client-side filter by date range and text search
  const filteredIssues = useMemo(() => {
    const all = issues.data?.content ?? [];
    const [from, to] = dateRange;
    const q = search.trim().toLowerCase();
    return all.filter((i) => {
      const issued = dayjs(i.issuedAt);
      if (from && issued.isBefore(dayjs(from).startOf("day"))) return false;
      if (to && issued.isAfter(dayjs(to).endOf("day"))) return false;
      if (q) {
        const vNum = vehicleNumber(i.vehicleId).toLowerCase();
        const issuer = userName(i.issuingUserId).toLowerCase();
        const receiver = userName(i.receivingUserId).toLowerCase();
        if (!vNum.includes(q) && !issuer.includes(q) && !receiver.includes(q)) return false;
      }
      return true;
    });
  }, [issues.data, dateRange, search, vehicleNumber, userName]);

  const vehicleFilterOptions = useMemo(() => [
    { label: "All vehicles", value: "ALL" },
    ...(vehicles.data?.content.map((v) => ({ value: v.id, label: v.vehicleNumber })) ?? []),
  ], [vehicles.data]);

  const columns: Column<VehicleFuelIssue>[] = [
    { header: "Issued at", render: (i) => dayjs(i.issuedAt).format("MMM D, YYYY HH:mm") },
    { header: "Vehicle", emphasis: true, render: (i) => vehicleNumber(i.vehicleId) },
    { header: "Before (L)", align: "right", render: (i) => i.vehicleReadingBeforeIssueLitres },
    { header: "Issued (L)", align: "right", render: (i) => i.litresIssued },
    { header: "Odometer (km)", align: "right", render: (i) => i.odometerReadingKm != null ? i.odometerReadingKm.toLocaleString() : "—" },
    { header: "km / L", align: "right", render: (i) => { const v = kmPerLitreById.get(i.id); return v != null ? v.toFixed(2) : "—"; } },
    { header: "Issued by", render: (i) => userName(i.issuingUserId) },
    { header: "Received by", render: (i) => userName(i.receivingUserId) },
  ];

  return (
    <div>
      <PageHeader title="Vehicle fuel issues" />

      <TableToolbar
        search={{ value: search, onChange: setSearch, placeholder: "Search vehicle, issuer or receiver…" }}
        filters={[
          {
            type: "daterange",
            label: "Date",
            value: dateRange,
            onChange: setDateRange,
          },
          {
            type: "select",
            label: "Vehicle",
            value: vehicleId ?? "ALL",
            onChange: (v) => setVehicleId(v === "ALL" ? null : v),
            options: vehicleFilterOptions,
          },
        ]}
        actions={
          canCreate ? (
            <Button leftSection={<IconPlus size={16} />} onClick={() => navigate("/fuel/issues/new")}>
              New issue
            </Button>
          ) : undefined
        }
      />

      <DataTable
        columns={columns}
        data={filteredIssues}
        rowKey={(i) => i.id}
        loading={issues.isLoading}
        error={issues.error}
        empty={<EmptyState title="No fuel issues" description="No vehicle fuel issues match the current filter." />}
      />
    </div>
  );
}
