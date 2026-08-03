import { Box, Stack, Text } from "@mantine/core";
import { DataTable } from "@ui/data";
import type { CountAdjustmentRequest } from "@core/types";
import { buildCountRequestsColumns } from "./count-requests-columns";

interface CountRequestsTableProps {
  data: CountAdjustmentRequest[];
  loading: boolean;
  error: unknown;
  itemLabel: (id: string) => string;
  userLabel: (id: string) => string;
  canApprove: boolean;
  busy: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function CountRequestsTable({
  data,
  loading,
  error,
  itemLabel,
  userLabel,
  canApprove,
  busy,
  onApprove,
  onReject,
}: CountRequestsTableProps) {
  const columns = buildCountRequestsColumns({ itemLabel, userLabel, canApprove, busy, onApprove, onReject });

  return (
    <DataTable<CountAdjustmentRequest>
      data={data}
      loading={loading}
      error={error}
      rowKey={(r) => r.id}
      columns={columns}
      expandOnHover={(r) => (
        <Box px="lg" py="sm" bg="var(--mantine-color-default-hover)">
          <Stack gap={2}>
            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>Reason</Text>
            <Text size="sm">{r.reason ?? "No reason provided"}</Text>
          </Stack>
        </Box>
      )}
    />
  );
}
