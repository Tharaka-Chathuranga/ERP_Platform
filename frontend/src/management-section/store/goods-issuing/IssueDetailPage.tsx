import { useEffect, useState } from "react";
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Group,
  Loader,
  Modal,
  NumberInput,
  Select,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconArrowBackUp,
  IconCheck,
  IconChevronLeft,
  IconClipboardList,
  IconHourglass,
  IconPackageExport,
  IconPlus,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import { PageHeader } from "@ui/layout/PageHeader";
import { QueryBoundary } from "@ui/feedback/QueryBoundary";
import { useAuth } from "@auth/AuthContext";
import { useItemLabels, useUserLabels } from "@core/hooks/useLookups";
import { qk } from "@core/queryKeys";
import type { IssueStatus } from "@core/types";

const STATUS_META: Record<
  IssueStatus,
  { label: string; bg: string; border: string; badge: string; icon: React.ReactNode; iconColor: string }
> = {
  DRAFT:            { label: "Draft",            bg: "var(--mantine-color-gray-light)",   border: "var(--mantine-color-gray-5)",   badge: "gray",   icon: <IconClipboardList size={28} />, iconColor: "gray"   },
  PENDING_APPROVAL: { label: "Pending approval", bg: "var(--mantine-color-yellow-light)", border: "var(--mantine-color-yellow-5)", badge: "yellow", icon: <IconHourglass size={28} />,     iconColor: "yellow" },
  APPROVED:         { label: "Approved",         bg: "var(--mantine-color-green-light)",  border: "var(--mantine-color-green-5)",  badge: "green",  icon: <IconCheck size={28} />,         iconColor: "green"  },
  ISSUED:           { label: "Issued",           bg: "var(--mantine-color-blue-light)",   border: "var(--mantine-color-blue-5)",   badge: "blue",   icon: <IconPackageExport size={28} />, iconColor: "blue"   },
  REJECTED:         { label: "Rejected",         bg: "var(--mantine-color-red-light)",    border: "var(--mantine-color-red-5)",    badge: "red",    icon: <IconX size={28} />,             iconColor: "red"    },
  RETURNED:         { label: "Returned",         bg: "var(--mantine-color-teal-light)",   border: "var(--mantine-color-teal-5)",   badge: "teal",   icon: <IconArrowBackUp size={28} />,   iconColor: "teal"   },
};
import {
  decideIssueLines,
  getIssue,
  issueDocument,
  returnIssueItems,
  type IssueAllocationInput,
  type LineDecisionInput,
  type ReturnLineInput,
} from "@store/goods-issuing/issuing.api";
import { getItem } from "@store/inventory/items.api";
import type { Location } from "@core/types";
import { notifyError, notifySuccess } from "@core/notify";
import { IssueApprovalList } from "./IssueApprovalList";
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
  const [issueOpen, setIssueOpen] = useState(false);

  const { data: issue, isLoading, error } = useQuery({
    queryKey: qk.issue(id),
    queryFn: () => getIssue(id),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: qk.issue(id) });
    qc.invalidateQueries({ queryKey: qk.issues() });
  };

  const decideLines = useMutation({
    mutationFn: (decisions: LineDecisionInput[]) => decideIssueLines(id, userId!, decisions),
    onSuccess: () => { notifySuccess("Approval decisions saved"); invalidate(); },
    onError: notifyError,
  });

  return (
    <div>
      <PageHeader title={issue?.issueNumber ?? "Goods issue"} />

      <Group mb="md">
        <Button
          variant="default"
          leftSection={<IconChevronLeft size={16} />}
          onClick={() => navigate("/issuing")}
        >
          Back
        </Button>
      </Group>

      <QueryBoundary
        loading={isLoading}
        error={error}
        isEmpty={!issue}
        empty={<Text>Not found.</Text>}
      >
        {issue && (() => {
          const meta = STATUS_META[issue.status];
          const total = issue.lines.length;
          const approved = issue.lines.filter((l) => l.approvalStatus === "APPROVED").length;
          const rejected = issue.lines.filter((l) => l.approvalStatus === "REJECTED").length;
          const pending = issue.lines.filter((l) => l.approvalStatus === "PENDING").length;
          const canReturn =
            (issue.status === "ISSUED" || issue.status === "RETURNED") &&
            issue.lines.some((l) => l.returnable);

          return (
          <>
            <IssueProgress status={issue.status} mb="lg" />

            <Card
              withBorder
              radius="md"
              padding={0}
              style={{ borderColor: meta.border, borderWidth: 1.5, position: "relative", overflow: "visible" }}
            >
              {/* Floating status icon */}
              <Box style={{ position: "absolute", top: -20, right: -20, zIndex: 1 }}>
                <ThemeIcon
                  size={40}
                  radius="xl"
                  color={meta.iconColor}
                  variant="filled"
                  style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.18)" }}
                >
                  {meta.icon}
                </ThemeIcon>
              </Box>

              {/* Coloured header */}
              <Box
                p="lg"
                bg={meta.bg}
                style={{ borderRadius: "calc(var(--mantine-radius-md) - 1px) calc(var(--mantine-radius-md) - 1px) 0 0" }}
              >
                <Group justify="space-between" align="flex-start" wrap="nowrap">
                  <Stack gap={6}>
                    <Badge color={meta.badge} variant="filled" size="md">
                      {meta.label}
                    </Badge>
                    <Title order={4}>Goods Issue</Title>
                  </Stack>
                  <Stack gap={2} align="flex-end">
                    <Text size="sm" fw={500}>{userLabel(issue.borrowingUserId)}</Text>
                    <Text size="xs" c="dimmed">Store keeper · {userLabel(issue.storeKeeperId)}</Text>
                    {issue.approvedByUserId && (
                      <Text size="xs" c="dimmed">
                        Approved by {userLabel(issue.approvedByUserId)}
                        {issue.approvedAt ? ` · ${dayjs(issue.approvedAt).format("MMM D, YYYY")}` : ""}
                      </Text>
                    )}
                  </Stack>
                </Group>
              </Box>

              {/* Item summary */}
              <Group gap="xl" px="lg" py="lg">
                <Stat label="Total items" value={total} />
                <Stat label="Approved" value={approved} color="green" />
                <Stat label="Rejected" value={rejected} color="red" />
                <Stat label="Pending" value={pending} color="yellow.7" />
              </Group>

              <Divider />

              {/* Items — approval checklist while pending, otherwise the decided list */}
              <Box p="lg">
                <Title order={5} mb="sm">
                  {isAdmin && issue.status === "PENDING_APPROVAL" ? "Items needing approval" : "Items"}
                </Title>
                {isAdmin && issue.status === "PENDING_APPROVAL" ? (
                  <IssueApprovalList
                    lines={issue.lines}
                    itemLabel={itemLabel}
                    submitting={decideLines.isPending}
                    onSubmit={(decisions) => decideLines.mutate(decisions)}
                  />
                ) : (
                  <IssueItemCards lines={issue.lines} itemLabel={itemLabel} />
                )}
              </Box>

              {/* Document actions */}
              {(issue.status === "APPROVED" || canReturn) && (
                <>
                  <Divider />
                  <Group justify="flex-end" p="lg">
                    {issue.status === "APPROVED" && (
                      <Button
                        leftSection={<IconPackageExport size={16} />}
                        onClick={() => setIssueOpen(true)}
                      >
                        Issue stock
                      </Button>
                    )}
                    {canReturn && (
                      <Button variant="light" onClick={() => setReturnsOpen(true)}>
                        Record return
                      </Button>
                    )}
                  </Group>
                </>
              )}
            </Card>

            <IssueStockModal
              opened={issueOpen}
              onClose={() => setIssueOpen(false)}
              issueId={id}
              lines={issue.lines
                .filter((l) => l.approvalStatus === "APPROVED")
                .map((l) => ({
                  lineId: l.id,
                  itemId: l.itemId,
                  label: itemLabel(l.itemId),
                  quantity: l.quantity,
                }))}
              onDone={invalidate}
            />

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
          );
        })()}
      </QueryBoundary>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <Stack gap={2}>
      <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
        {label}
      </Text>
      <Text fw={700} size="lg" c={color}>
        {value}
      </Text>
    </Stack>
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

interface IssueLineRow {
  lineId: string;
  itemId: string;
  label: string;
  quantity: number;
}

interface Alloc {
  rack: string;
  row: string;
  column: string;
  quantity: number | "";
}

const slotKey = (l: Location) => [l.rack, l.row, l.column].join("|");
const slotText = (l: Pick<Location, "rack" | "row" | "column">) =>
  [l.rack, l.row, l.column].filter(Boolean).join(" / ") || "(unspecified)";

/** Choose which storage slot(s) each approved line is drawn from, then issue. */
function IssueStockModal({
  opened,
  onClose,
  issueId,
  lines,
  onDone,
}: {
  opened: boolean;
  onClose: () => void;
  issueId: string;
  lines: IssueLineRow[];
  onDone: () => void;
}) {
  const itemIds = [...new Set(lines.map((l) => l.itemId))];
  const itemsQuery = useQuery({
    queryKey: ["issue-stock-items", issueId, itemIds],
    queryFn: () => Promise.all(itemIds.map((id) => getItem(id))),
    enabled: opened && lines.length > 0,
  });
  const locationsByItem = new Map<string, Location[]>();
  (itemsQuery.data ?? []).forEach((it) => locationsByItem.set(it.id, it.locations ?? []));

  const [allocs, setAllocs] = useState<Record<string, Alloc[]>>({});
  const lineKey = lines.map((l) => l.lineId).join(",");

  useEffect(() => {
    if (opened) {
      const init: Record<string, Alloc[]> = {};
      lines.forEach((l) => {
        init[l.lineId] = [{ rack: "", row: "", column: "", quantity: l.quantity }];
      });
      setAllocs(init);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, lineKey]);

  const setRow = (lineId: string, idx: number, patch: Partial<Alloc>) =>
    setAllocs((p) => ({
      ...p,
      [lineId]: (p[lineId] ?? []).map((r, i) => (i === idx ? { ...r, ...patch } : r)),
    }));
  const addRow = (lineId: string) =>
    setAllocs((p) => ({
      ...p,
      [lineId]: [...(p[lineId] ?? []), { rack: "", row: "", column: "", quantity: "" }],
    }));
  const removeRow = (lineId: string, idx: number) =>
    setAllocs((p) => ({ ...p, [lineId]: (p[lineId] ?? []).filter((_, i) => i !== idx) }));

  const allocatedFor = (lineId: string) =>
    (allocs[lineId] ?? []).reduce((s, r) => s + Number(r.quantity || 0), 0);

  const valid = lines.every((line) => {
    const rows = allocs[line.lineId] ?? [];
    return (
      rows.length > 0 &&
      rows.every((r) => r.rack || r.row || r.column) &&
      allocatedFor(line.lineId) === line.quantity
    );
  });

  const mutation = useMutation({
    mutationFn: () => {
      const payload: IssueAllocationInput[] = lines.flatMap((line) =>
        (allocs[line.lineId] ?? []).map((r) => ({
          lineId: line.lineId,
          rack: r.rack || undefined,
          row: r.row || undefined,
          column: r.column || undefined,
          quantity: Number(r.quantity || 0),
        })),
      );
      return issueDocument(issueId, payload);
    },
    onSuccess: () => {
      notifySuccess("Stock issued");
      onClose();
      onDone();
    },
    onError: notifyError,
  });

  return (
    <Modal opened={opened} onClose={onClose} title="Issue stock — choose locations" centered size="lg">
      {itemsQuery.isLoading ? (
        <Group justify="center" py="lg">
          <Loader size="sm" />
        </Group>
      ) : (
        <Stack>
          {lines.map((line) => {
            const slots = (locationsByItem.get(line.itemId) ?? []).filter(
              (l) => (l.quantity ?? 0) > 0,
            );
            const rows = allocs[line.lineId] ?? [];
            const allocated = allocatedFor(line.lineId);
            const remaining = line.quantity - allocated;
            return (
              <Card key={line.lineId} withBorder radius="sm" padding="sm">
                <Group justify="space-between" mb="xs">
                  <Text size="sm" fw={600}>
                    {line.label}
                  </Text>
                  <Text size="xs" c={remaining === 0 ? "green" : "red"}>
                    {allocated} / {line.quantity} allocated
                  </Text>
                </Group>
                {slots.length === 0 && (
                  <Text size="xs" c="red" mb="xs">
                    No location stock for this item — receive it into a location first.
                  </Text>
                )}
                <Stack gap="xs">
                  {rows.map((r, idx) => (
                    <Group key={idx} gap="xs" wrap="nowrap">
                      <Select
                        flex={1}
                        placeholder="Location"
                        data={slots.map((s) => ({
                          value: slotKey(s),
                          label: `${slotText(s)} (${s.quantity ?? 0} avail)`,
                        }))}
                        value={r.rack || r.row || r.column ? slotKey({ rack: r.rack, row: r.row, column: r.column, primary: false, quantity: 0 }) : null}
                        onChange={(v) => {
                          const s = slots.find((x) => slotKey(x) === v);
                          setRow(line.lineId, idx, {
                            rack: s?.rack ?? "",
                            row: s?.row ?? "",
                            column: s?.column ?? "",
                          });
                        }}
                      />
                      <NumberInput
                        w={110}
                        min={0}
                        placeholder="Qty"
                        value={r.quantity}
                        onChange={(v) =>
                          setRow(line.lineId, idx, { quantity: v === "" ? "" : Number(v) })
                        }
                      />
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        onClick={() => removeRow(line.lineId, idx)}
                        disabled={rows.length === 1}
                        aria-label="Remove allocation"
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  ))}
                </Stack>
                <Button
                  mt="xs"
                  variant="subtle"
                  size="xs"
                  leftSection={<IconPlus size={14} />}
                  onClick={() => addRow(line.lineId)}
                >
                  Add another location
                </Button>
              </Card>
            );
          })}
          <Group justify="flex-end">
            <Button variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button loading={mutation.isPending} disabled={!valid} onClick={() => mutation.mutate()}>
              Issue stock
            </Button>
          </Group>
        </Stack>
      )}
    </Modal>
  );
}
