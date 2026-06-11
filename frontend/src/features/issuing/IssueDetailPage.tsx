import { useState } from "react";
import {
  Badge,
  Button,
  Card,
  Group,
  Loader,
  Modal,
  NumberInput,
  SimpleGrid,
  Stack,
  Stepper,
  Table,
  Text,
} from "@mantine/core";
import { IconArrowLeft, IconCheck, IconPackageExport, IconX } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../../components/PageHeader";
import { StatusBadge } from "../../components/StatusBadge";
import { useAuth } from "../../auth/AuthContext";
import { useItemLabels, useUserLabels } from "../../hooks/useLookups";
import {
  approveIssue,
  getIssue,
  issueDocument,
  rejectIssue,
  returnIssueItems,
  type ReturnLineInput,
} from "../../api/store/issues";
import { notifyError, notifySuccess } from "../../lib/notify";
import type { IssueStatus } from "../../types";

const STEP_INDEX: Record<IssueStatus, number> = {
  DRAFT: 0,
  PENDING_APPROVAL: 1,
  APPROVED: 2,
  ISSUED: 3,
  RETURNED: 3,
  REJECTED: 1,
};

export function IssueDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { userId, isAdmin } = useAuth();
  const itemLabel = useItemLabels();
  const userLabel = useUserLabels();
  const [returnsOpen, setReturnsOpen] = useState(false);

  const { data: issue, isLoading } = useQuery({
    queryKey: ["issue", id],
    queryFn: () => getIssue(id),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["issue", id] });
    qc.invalidateQueries({ queryKey: ["issues"] });
  };

  const approve = useMutation({
    mutationFn: () => approveIssue(id, userId!),
    onSuccess: () => { notifySuccess("Issue approved"); invalidate(); },
    onError: notifyError,
  });
  const reject = useMutation({
    mutationFn: () => rejectIssue(id, userId!),
    onSuccess: () => { notifySuccess("Issue rejected"); invalidate(); },
    onError: notifyError,
  });
  const doIssue = useMutation({
    mutationFn: () => issueDocument(id),
    onSuccess: () => { notifySuccess("Stock issued"); invalidate(); },
    onError: notifyError,
  });

  if (isLoading) return <Loader />;
  if (!issue) return <Text>Not found.</Text>;

  const active = STEP_INDEX[issue.status];

  return (
    <div>
      <PageHeader
        title={issue.issueNumber}
        subtitle="Issue document"
        actions={
          <Group>
            <Button
              variant="default"
              leftSection={<IconArrowLeft size={16} />}
              onClick={() => navigate("/issuing")}
            >
              Back
            </Button>
            {isAdmin && issue.status === "PENDING_APPROVAL" && (
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
            {issue.status === "APPROVED" && (
              <Button
                leftSection={<IconPackageExport size={16} />}
                loading={doIssue.isPending}
                onClick={() => doIssue.mutate()}
              >
                Issue stock
              </Button>
            )}
            {(issue.status === "ISSUED" || issue.status === "RETURNED") &&
              issue.lines.some((l) => l.returnable) && (
                <Button variant="light" onClick={() => setReturnsOpen(true)}>
                  Record return
                </Button>
              )}
          </Group>
        }
      />

      <Card withBorder radius="md" padding="lg" mb="lg">
        <SimpleGrid cols={{ base: 2, sm: 3 }} mb="lg">
          <Field label="Status" value={<StatusBadge status={issue.status} />} />
          <Field label="Borrowing user" value={userLabel(issue.borrowingUserId)} />
          <Field label="Store keeper" value={userLabel(issue.storeKeeperId)} />
        </SimpleGrid>
        <Stepper active={active} size="sm">
          <Stepper.Step label="Draft" />
          <Stepper.Step
            label={issue.status === "REJECTED" ? "Rejected" : "Approval"}
            color={issue.status === "REJECTED" ? "red" : undefined}
          />
          <Stepper.Step label="Approved" />
          <Stepper.Step label="Issued" />
        </Stepper>
      </Card>

      <Card withBorder radius="md" padding="lg">
        <Text fw={600} mb="sm">
          Lines
        </Text>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Item</Table.Th>
              <Table.Th>Quantity</Table.Th>
              <Table.Th>Returnable</Table.Th>
              <Table.Th>Returned</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {issue.lines.map((l) => (
              <Table.Tr key={l.id}>
                <Table.Td>{itemLabel(l.itemId)}</Table.Td>
                <Table.Td>{l.quantity}</Table.Td>
                <Table.Td>
                  {l.returnable ? <Badge variant="light">Yes</Badge> : <Text c="dimmed">No</Text>}
                </Table.Td>
                <Table.Td>{l.returnedQuantity}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Card>

      <ReturnsModal
        opened={returnsOpen}
        onClose={() => setReturnsOpen(false)}
        issueId={id}
        lines={issue.lines
          .filter((l) => l.returnable)
          .map((l) => ({
            itemId: l.itemId,
            label: itemLabel(l.itemId),
            outstanding: l.quantity - l.returnedQuantity,
          }))}
        onDone={invalidate}
      />
    </div>
  );
}

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

interface ReturnRow {
  itemId: string;
  label: string;
  outstanding: number;
}

function ReturnsModal({
  opened,
  onClose,
  issueId,
  lines,
  onDone,
}: {
  opened: boolean;
  onClose: () => void;
  issueId: string;
  lines: ReturnRow[];
  onDone: () => void;
}) {
  const [qty, setQty] = useState<Record<string, number | "">>({});

  const mutation = useMutation({
    mutationFn: () => {
      const payload: ReturnLineInput[] = lines
        .map((l) => ({ itemId: l.itemId, quantity: Number(qty[l.itemId] || 0) }))
        .filter((l) => l.quantity > 0);
      return returnIssueItems(issueId, payload);
    },
    onSuccess: () => {
      notifySuccess("Return recorded");
      setQty({});
      onClose();
      onDone();
    },
    onError: notifyError,
  });

  const anyQty = lines.some((l) => Number(qty[l.itemId] || 0) > 0);

  return (
    <Modal opened={opened} onClose={onClose} title="Record return" centered>
      <Stack>
        {lines.map((l) => (
          <Group key={l.itemId} justify="space-between">
            <div>
              <Text size="sm">{l.label}</Text>
              <Text size="xs" c="dimmed">
                Outstanding: {l.outstanding}
              </Text>
            </div>
            <NumberInput
              w={120}
              min={0}
              max={l.outstanding}
              value={qty[l.itemId] ?? ""}
              onChange={(v) =>
                setQty((p) => ({ ...p, [l.itemId]: v === "" ? "" : Number(v) }))
              }
            />
          </Group>
        ))}
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={mutation.isPending} disabled={!anyQty} onClick={() => mutation.mutate()}>
            Record
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
