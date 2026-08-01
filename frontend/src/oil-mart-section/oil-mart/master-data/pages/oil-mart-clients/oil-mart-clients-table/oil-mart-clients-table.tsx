import { DataTable } from "@ui/data";
import { EmptyState } from "@ui/feedback/EmptyState";
import type { OilMartClient } from "@core/types";
import { buildOilMartClientsColumns } from "./oil-mart-clients-columns";

interface OilMartClientsTableProps {
  data: OilMartClient[];
  loading?: boolean;
  error?: unknown;
  canManage: boolean;
  onEdit: (client: OilMartClient) => void;
  onRowClick?: (client: OilMartClient) => void;
}

export function OilMartClientsTable({
  data,
  loading,
  error,
  canManage,
  onEdit,
  onRowClick,
}: OilMartClientsTableProps) {
  return (
    <DataTable
      columns={buildOilMartClientsColumns(canManage, onEdit)}
      data={data}
      rowKey={(client) => client.id}
      loading={loading}
      error={error}
      onRowClick={onRowClick}
      empty={
        <EmptyState
          title="No clients"
          description="Add the clients this oil mart buys stock from."
        />
      }
    />
  );
}
