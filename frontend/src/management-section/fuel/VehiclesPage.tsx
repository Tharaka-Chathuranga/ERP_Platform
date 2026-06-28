import { useMemo, useState } from "react";
import { ActionIcon, Badge, Button } from "@mantine/core";
import { IconPencil, IconPlus } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@ui/layout/PageHeader";
import { EmptyState } from "@ui/feedback/EmptyState";
import { DataTable, TableToolbar, type Column } from "@ui/data";
import { useUsers } from "@core/hooks/useUsers";
import { useCan } from "@auth/useCan";
import { DASHBOARD_ADMIN, FUEL_MANAGE } from "@auth/permissions";
import { qk } from "@core/queryKeys";
import type { Vehicle } from "@core/types";
import { listVehicles } from "./fuel.api";
import { VehicleFormModal } from "./VehicleFormModal";

export function VehiclesPage() {
  const navigate = useNavigate();
  const can = useCan();
  const canManage = can(FUEL_MANAGE);
  const canViewEfficiency = can(DASHBOARD_ADMIN);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Vehicle | undefined>();

  const vehicles = useQuery({
    queryKey: qk.vehicles(search || undefined),
    queryFn: () => listVehicles(search || undefined),
  });
  const users = useUsers();
  const userName = useMemo(() => {
    const map = new Map(users.data?.map((u) => [u.id, u.displayName || u.username]));
    return (id?: string) => (id ? map.get(id) ?? "—" : "—");
  }, [users.data]);

  const filteredVehicles = useMemo(() => {
    const all = vehicles.data?.content ?? [];
    if (statusFilter === "ALL") return all;
    return all.filter((v) => v.status === statusFilter);
  }, [vehicles.data, statusFilter]);

  const columns: Column<Vehicle>[] = [
    { header: "Vehicle no.", emphasis: true, render: (v) => v.vehicleNumber },
    { header: "Capacity", align: "right", render: (v) => `${v.fullTankCapacityLitres} L` },
    { header: "Driver", render: (v) => userName(v.driverUserId) },
    { header: "Description", render: (v) => v.description ?? "—" },
    {
      header: "Status",
      render: (v) => (
        <Badge color={v.status === "ACTIVE" ? "teal" : "gray"} variant="light" radius="sm">
          {v.status}
        </Badge>
      ),
    },
    ...(canManage
      ? [
          {
            header: "",
            align: "right" as const,
            render: (v: Vehicle) => (
              <ActionIcon
                variant="subtle"
                color="gray"
                aria-label="Edit vehicle"
                onClick={(e) => { e.stopPropagation(); setEditing(v); }}
              >
                <IconPencil size={16} />
              </ActionIcon>
            ),
          },
        ]
      : []),
  ];

  return (
    <div>
      <PageHeader title="Vehicles" />

      <TableToolbar
        search={{ value: search, onChange: setSearch, placeholder: "Search vehicle number…" }}
        filters={[
          {
            label: "Status",
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: "All statuses", value: "ALL" },
              { label: "Active", value: "ACTIVE" },
              { label: "Inactive", value: "INACTIVE" },
            ],
          },
        ]}
        actions={
          canManage ? (
            <Button leftSection={<IconPlus size={16} />} onClick={() => setCreateOpen(true)}>
              New vehicle
            </Button>
          ) : undefined
        }
      />

      <DataTable
        columns={columns}
        data={filteredVehicles}
        rowKey={(v) => v.id}
        loading={vehicles.isLoading}
        error={vehicles.error}
        empty={<EmptyState title="No vehicles" description="Add a vehicle to start issuing fuel." />}
        onRowClick={canViewEfficiency ? (v) => navigate(`/fuel/efficiency/${v.id}`) : undefined}
      />

      <VehicleFormModal opened={createOpen} onClose={() => setCreateOpen(false)} />
      <VehicleFormModal opened={!!editing} onClose={() => setEditing(undefined)} vehicle={editing} />
    </div>
  );
}
