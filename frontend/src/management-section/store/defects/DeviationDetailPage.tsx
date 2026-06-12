import {
  Button,
  Card,
  Group,
  Loader,
  SimpleGrid,
  Table,
  Text,
} from "@mantine/core";
import { IconArrowLeft, IconArrowRight, IconCheck, IconX } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@ui/layout/PageHeader";
import { StatusBadge } from "@ui/feedback/StatusBadge";
import { useAuth } from "@auth/AuthContext";
import { useItemLabels, useUserLabels } from "@core/hooks/useLookups";
import {
  advanceDeviationStage,
  approveDeviation,
  getDeviation,
  rejectDeviation,
} from "@store/defects/deviations.api";
import { notifyError, notifySuccess } from "@core/notify";
import type { DeviationStage } from "@core/types";

const NEXT_STAGE: Record<DeviationStage, DeviationStage | null> = {
  INCOMING: "IN_PROGRESS",
  IN_PROGRESS: "FINAL",
  FINAL: null,
};

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
        {label}
      </Text>
      <Text>{value ?? "—"}</Text>
    </div>
  );
}

export function DeviationDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { userId, isAdmin } = useAuth();
  const itemLabel = useItemLabels();
  const userLabel = useUserLabels();

  const { data: dev, isLoading } = useQuery({
    queryKey: ["deviation", id],
    queryFn: () => getDeviation(id),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["deviation", id] });
    qc.invalidateQueries({ queryKey: ["deviations"] });
  };

  const approve = useMutation({
    mutationFn: () => approveDeviation(id, userId!),
    onSuccess: () => { notifySuccess("Approved"); invalidate(); },
    onError: notifyError,
  });
  const reject = useMutation({
    mutationFn: () => rejectDeviation(id, userId!),
    onSuccess: () => { notifySuccess("Rejected"); invalidate(); },
    onError: notifyError,
  });
  const advance = useMutation({
    mutationFn: (stage: DeviationStage) => advanceDeviationStage(id, stage),
    onSuccess: () => { notifySuccess("Stage advanced"); invalidate(); },
    onError: notifyError,
  });

  if (isLoading) return <Loader />;
  if (!dev) return <Text>Not found.</Text>;

  const next = NEXT_STAGE[dev.stage];

  return (
    <div>
      <PageHeader
        title="Defect report"
        actions={
          <Group>
            <Button
              variant="default"
              leftSection={<IconArrowLeft size={16} />}
              onClick={() => navigate("/defects")}
            >
              Back
            </Button>
            {isAdmin && (
              <>
                {dev.status === "PENDING" && (
                  <>
                    <Button
                      color="green"
                      leftSection={<IconCheck size={16} />}
                      loading={approve.isPending}
                      onClick={() => approve.mutate()}
                    >
                      Approve
                    </Button>
                    <Button
                      color="red"
                      variant="light"
                      leftSection={<IconX size={16} />}
                      loading={reject.isPending}
                      onClick={() => reject.mutate()}
                    >
                      Reject
                    </Button>
                  </>
                )}
                {next && (
                  <Button
                    variant="light"
                    rightSection={<IconArrowRight size={16} />}
                    loading={advance.isPending}
                    onClick={() => advance.mutate(next)}
                  >
                    Move to {next.replace(/_/g, " ")}
                  </Button>
                )}
              </>
            )}
          </Group>
        }
      />

      <Card withBorder radius="md" padding="lg" mb="lg">
        <SimpleGrid cols={{ base: 2, sm: 3 }}>
          <Field label="Status" value={<StatusBadge status={dev.status} />} />
          <Field label="Stage" value={<StatusBadge status={dev.stage} />} />
          <Field label="Reported by" value={userLabel(dev.requestedByUserId)} />
        </SimpleGrid>
        <Field label="Reason" value={dev.reason} />
      </Card>

      <Card withBorder radius="md" padding="lg">
        <Text fw={600} mb="sm">
          Affected items
        </Text>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Item</Table.Th>
              <Table.Th>Quantity</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {dev.items.map((it, idx) => (
              <Table.Tr key={idx}>
                <Table.Td>{itemLabel(it.itemId)}</Table.Td>
                <Table.Td>{it.quantity}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Card>
    </div>
  );
}
