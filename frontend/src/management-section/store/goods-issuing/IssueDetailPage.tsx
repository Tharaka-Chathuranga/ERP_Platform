import { useState } from "react";
import {
  Button,
  Card,
  Group,
  Modal,
  NumberInput,
  Stack,
  Text,
} from "@mantine/core";
import { IconArrowLeft, IconCheck, IconPackageExport, IconX } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@ui/layout/PageHeader";
import { QueryBoundary } from "@ui/feedback/QueryBoundary";
import { StatusBadge } from "@ui/feedback/StatusBadge";
import { DefinitionList } from "@ui/data/DefinitionList";
import { useAuth } from "@auth/AuthContext";
import { useItemLabels, useUserLabels } from "@core/hooks/useLookups";
import { qk } from "@core/queryKeys";
import {
  approveIssue,
  decideIssueLines,
  getIssue,
  issueDocument,
  rejectIssue,
  returnIssueItems,
  type ReturnLineInput,
} from "@store/goods-issuing/issuing.api";
import { notifyError, notifySuccess } from "@core/notify";
import { IssueItemCards } from "./IssueItemCards";
import { IssueProgress } from "./IssueProgress";

export function IssueDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { userId, isAdmin } = useAuth();
  const itemLabel = useItemLabels();
  const userLabel = useUserLabels();
  const [returnsOpen, setReturnsOpen] = useState(false);

  const { data: issue, isLoading, error } = useQuery({
    queryKey: qk.issue(id),
    queryFn: () => getIssue(id),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: qk.issue(id) });
    qc.invalidateQueries({ queryKey: qk.issues() });
  };

  const approve = useMutation({
    mutationFn: () => approveIssue(id, userId!),
    onSuccess: () => { notifySuccess("All pending lines approved"); invalidate(); },
    onError: notifyError,
  });
  const reject = useMutation({
    mutationFn: () => rejectIssue(id, userId!),
    onSuccess: () => { notifySuccess("All pending lines rejected"); invalidate(); },
    onError: notifyError,
  });
  const decide = useMutation({
    mutationFn: (d: { lineId: string; approve: boolean }) => decideIssueLines(id, userId!, [d]),
    onSuccess: () => { notifySuccess("Line updated"); invalidate(); },
    onError: notifyError,
  });
  const doIssue = useMutation({
    mutationFn: () => issueDocument(id),
    onSuccess: () => { notifySuccess("Stock issued"); invalidate(); },
    onError: notifyError,
  });

  return (
    <div>
      <PageHeader
        title={issue?.issueNumber ?? "Goods issue"}
        actions={
          <Group>
            <Button
              variant="default"
              leftSection={<IconArrowLeft size={16} />}
              onClick={() => navigate("/issuing")}
            >
              Back
            </Button>
            {issue && isAdmin && issue.status === "PENDING_APPROVAL" && (
              <>
                <Button
                  color="green"
                  leftSection={<IconCheck size={16} />}
                  loading={approve.isPending}
                  onClick={() => approve.mutate()}
                >
                  Approve all
                </Button>
                <Button
                  color="red"
                  variant="light"
                  leftSection={<IconX size={16} />}
                  loading={reject.isPending}
                  onClick={() => reject.mutate()}
                >
                  Reject all
                </Button>
              </>
            )}
            {issue && issue.status === "APPROVED" && (
              <Button
                leftSection={<IconPackageExport size={16} />}
                loading={doIssue.isPending}
                onClick={() => doIssue.mutate()}
              >
                Issue stock
              </Button>
            )}
            {issue &&
              (issue.status === "ISSUED" || issue.status === "RETURNED") &&
              issue.lines.some((l) => l.returnable) && (
                <Button variant="light" onClick={() => setReturnsOpen(true)}>
                  Record return
                </Button>
              )}
          </Group>
        }
      />

      <QueryBoundary
        loading={isLoading}
        error={error}
        isEmpty={!issue}
        empty={<Text>Not found.</Text>}
      >
        {issue && (
          <>
            <Card withBorder radius="md" padding="lg" mb="lg">
              <DefinitionList
                cols={{ base: 2, sm: 3 }}
                items={[
                  { label: "Status", value: <StatusBadge status={issue.status} /> },
                  { label: "Borrowing user", value: userLabel(issue.borrowingUserId) },
                  { label: "Store keeper", value: userLabel(issue.storeKeeperId) },
                ]}
              />
              <IssueProgress status={issue.status} mt="lg" />
            </Card>

            <Card withBorder radius="md" padding="lg">
              <Text fw={600} mb="sm">
                Items
              </Text>
              <IssueItemCards
                lines={issue.lines}
                itemLabel={itemLabel}
                renderActions={(line) =>
                  isAdmin && line.approvalStatus === "PENDING" ? (
                    <Group gap="xs">
                      <Button
                        size="xs"
                        color="green"
                        variant="light"
                        leftSection={<IconCheck size={14} />}
                        loading={decide.isPending}
                        onClick={() => decide.mutate({ lineId: line.id, approve: true })}
                      >
                        Approve
                      </Button>
                      <Button
                        size="xs"
                        color="red"
                        variant="light"
                        leftSection={<IconX size={14} />}
                        loading={decide.isPending}
                        onClick={() => decide.mutate({ lineId: line.id, approve: false })}
                      >
                        Reject
                      </Button>
                    </Group>
                  ) : null
                }
              />
            </Card>

            <ReturnsModal
              opened={returnsOpen}
              onClose={() => setReturnsOpen(false)}
              issueId={id}
              lines={issue.lines
                .filter((l) => l.returnable && l.approvalStatus === "APPROVED")
                .map((l) => ({
                  itemId: l.itemId,
                  label: itemLabel(l.itemId),
                  outstanding: l.quantity - l.returnedQuantity,
                }))}
              onDone={invalidate}
            />
          </>
        )}
      </QueryBoundary>
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
