import { useState } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Group,
  Loader,
  Modal,
  Select,
  Stack,
  Text,
  Textarea,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconChevronLeft,
  IconChevronRight,
  IconGavel,
  IconHourglass,
  IconLock,
  IconX,
} from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import { PageHeader } from "@ui/layout/PageHeader";
import { DataTable, TableToolbar, type Column } from "@ui/data";
import { useAuth } from "@auth/AuthContext";
import { useCan } from "@auth/useCan";
import { NCR_REVIEW } from "@auth/permissions";
import { useItemLabels, useUserLabels } from "@core/hooks/useLookups";
import { qk } from "@core/queryKeys";
import { notifyError, notifySuccess } from "@core/notify";
import type { DispositionType, NonconformityItem } from "@core/types";
import {
  closeNonconformity,
  dispositionNonconformity,
  getNonconformity,
  listNonconformities,
  rejectNonconformity,
  startNonconformityReview,
} from "../api";
import {
  DETECTION_STAGE_META,
  DISPOSITION_LABELS,
  DISPOSITION_OPTIONS,
  NcrProgress,
  STATUS_META,
} from "../components";

export function NonconformityDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { userId } = useAuth();
  const can = useCan();
  const canReview = can(NCR_REVIEW);
  const itemLabel = useItemLabels();
  const userLabel = useUserLabels();

  const [search, setSearch] = useState("");
  const [dispositionOpen, setDispositionOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [closeOpen, setCloseOpen] = useState(false);

  const { data: ncr, isLoading } = useQuery({
    queryKey: qk.nonconformity(id),
    queryFn: () => getNonconformity(id),
  });

  const { data: siblings } = useQuery({
    queryKey: qk.nonconformities(ncr?.detectionStage),
    queryFn: () => listNonconformities(ncr!.detectionStage),
    enabled: !!ncr,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: qk.nonconformity(id) });
    qc.invalidateQueries({ queryKey: qk.nonconformities() });
  };

  const startReview = useMutation({
    mutationFn: () => startNonconformityReview(id),
    onSuccess: () => { notifySuccess("Review started"); invalidate(); },
    onError: notifyError,
  });
  const disposition = useMutation({
    mutationFn: (input: { type: DispositionType; note: string }) =>
      dispositionNonconformity(id, userId!, input.type, input.note),
    onSuccess: () => { notifySuccess("Disposition recorded"); setDispositionOpen(false); invalidate(); },
    onError: notifyError,
  });
  const reject = useMutation({
    mutationFn: (note: string) => rejectNonconformity(id, userId!, note),
    onSuccess: () => { notifySuccess("Report rejected"); setRejectOpen(false); invalidate(); },
    onError: notifyError,
  });
  const closeReport = useMutation({
    mutationFn: (note: string) => closeNonconformity(id, userId!, note),
    onSuccess: () => { notifySuccess("Report closed"); setCloseOpen(false); invalidate(); },
    onError: notifyError,
  });

  if (isLoading) return <Loader />;
  if (!ncr) return <Text>Not found.</Text>;

  const statusMeta = STATUS_META[ncr.status];
  const stageMeta = DETECTION_STAGE_META[ncr.detectionStage];

  const siblingIds = siblings?.map((d) => d.id) ?? [];
  const currentIndex = siblingIds.indexOf(id);
  const prevId = currentIndex > 0 ? siblingIds[currentIndex - 1] : null;
  const nextId = currentIndex >= 0 && currentIndex < siblingIds.length - 1 ? siblingIds[currentIndex + 1] : null;

  const itemColumns: Column<NonconformityItem>[] = [
    { header: "Item", emphasis: true, render: (it) => itemLabel(it.itemId) },
    { header: "Quantity", align: "right", render: (it) => it.quantity },
  ];

  return (
    <div>
      <PageHeader title="Nonconformity report" />

      <Group mb="md">
        <Button variant="default" leftSection={<IconChevronLeft size={16} />} onClick={() => navigate("/nonconformities")}>
          Back
        </Button>
      </Group>

      <NcrProgress status={ncr.status} mb="lg" />

      <Card
        withBorder
        radius="md"
        padding={0}
        mb="md"
        style={{ borderColor: statusMeta.border, borderWidth: 1.5, position: "relative", overflow: "visible" }}
      >
        {/* Floating status icon */}
        <Box style={{ position: "absolute", top: -20, right: -20, zIndex: 1 }}>
          <ThemeIcon size={40} radius="xl" color={statusMeta.iconColor} variant="filled"
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.18)" }}>
            {statusMeta.icon}
          </ThemeIcon>
        </Box>

        {/* Coloured header */}
        <Box p="lg" bg={statusMeta.bg} style={{ borderRadius: "calc(var(--mantine-radius-md) - 1px) calc(var(--mantine-radius-md) - 1px) 0 0" }}>
          <Group justify="space-between" align="flex-start" wrap="nowrap">
            <Stack gap={6}>
              <Group gap="xs">
                <Badge color={statusMeta.badge} variant="filled" size="md">{statusMeta.label}</Badge>
                <Badge color={stageMeta.color} variant="light" size="md">{stageMeta.title}</Badge>
                {ncr.dispositionType && (
                  <Badge color="green" variant="outline" size="md">{DISPOSITION_LABELS[ncr.dispositionType]}</Badge>
                )}
              </Group>
              <Title order={4}>Nonconformity Report</Title>
            </Stack>
            <Stack gap={2} align="flex-end">
              <Text size="sm" fw={500}>{userLabel(ncr.reportedByUserId)}</Text>
              <Text size="xs" c="dimmed">Raised {dayjs(ncr.reportedAt).format("MMM D, YYYY [at] HH:mm")}</Text>
              {ncr.reviewedByUserId && (
                <Text size="xs" c="dimmed">
                  {ncr.status === "REJECTED" ? "Rejected" : "Reviewed"} by {userLabel(ncr.reviewedByUserId)}
                  {ncr.reviewedAt ? ` · ${dayjs(ncr.reviewedAt).format("MMM D, YYYY")}` : ""}
                </Text>
              )}
              {ncr.closedByUserId && (
                <Text size="xs" c="dimmed">
                  Closed by {userLabel(ncr.closedByUserId)}
                  {ncr.closedAt ? ` · ${dayjs(ncr.closedAt).format("MMM D, YYYY")}` : ""}
                </Text>
              )}
            </Stack>
          </Group>
        </Box>

        <Stack gap="md" px="lg" py="lg">
          {ncr.description && (
            <Box>
              <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={4}>Description</Text>
              <Text size="sm" c="dimmed" style={{ fontStyle: "italic" }}>&ldquo;{ncr.description}&rdquo;</Text>
            </Box>
          )}
          {ncr.reviewNote && (
            <Box>
              <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={4}>Review note (deciding authority)</Text>
              <Text size="sm">{ncr.reviewNote}</Text>
            </Box>
          )}
          {ncr.verificationNote && (
            <Box>
              <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={4}>Closure verification</Text>
              <Text size="sm">{ncr.verificationNote}</Text>
            </Box>
          )}

          <Group gap="xl">
            <Stack gap={2}>
              <Text size="xs" c="dimmed" tt="uppercase" fw={600}>Items affected</Text>
              <Text fw={700} size="lg">{ncr.items.length}</Text>
            </Stack>
            <Stack gap={2}>
              <Text size="xs" c="dimmed" tt="uppercase" fw={600}>Total quantity</Text>
              <Text fw={700} size="lg">{ncr.items.reduce((s, it) => s + it.quantity, 0)}</Text>
            </Stack>
          </Group>
        </Stack>

        <Divider />

        {/* Affected items */}
        <Box p="lg">
          <Title order={5} mb="sm">Affected items</Title>
          <TableToolbar search={{ value: search, onChange: setSearch, placeholder: "Search item…" }} />
          <DataTable
            withCard={false}
            columns={itemColumns}
            data={ncr.items.filter((it) => {
              const term = search.trim().toLowerCase();
              return !term || itemLabel(it.itemId).toLowerCase().includes(term);
            })}
            rowKey={(it) => it.itemId}
          />
        </Box>

        {/* Stage-gated actions */}
        {canReview && ncr.status === "RAISED" && (
          <>
            <Divider />
            <Group justify="flex-end" p="lg">
              <Button leftSection={<IconHourglass size={16} />} loading={startReview.isPending} onClick={() => startReview.mutate()}>
                Start review
              </Button>
            </Group>
          </>
        )}
        {canReview && ncr.status === "UNDER_REVIEW" && (
          <>
            <Divider />
            <Group justify="space-between" p="lg">
              <Button variant="light" color="red" leftSection={<IconX size={16} />} onClick={() => setRejectOpen(true)}>
                Reject
              </Button>
              <Button color="green" leftSection={<IconGavel size={16} />} onClick={() => setDispositionOpen(true)}>
                Record disposition
              </Button>
            </Group>
          </>
        )}
        {canReview && ncr.status === "DISPOSITIONED" && (
          <>
            <Divider />
            <Group justify="flex-end" p="lg">
              <Button leftSection={<IconLock size={16} />} onClick={() => setCloseOpen(true)}>
                Verify &amp; close
              </Button>
            </Group>
          </>
        )}
      </Card>

      {/* Previous / Next navigation */}
      <Group justify="space-between">
        <Button variant="default" leftSection={<IconChevronLeft size={16} />} disabled={!prevId} onClick={() => prevId && navigate(`/nonconformities/${prevId}`)}>
          Previous
        </Button>
        <Text size="sm" c="dimmed">
          {currentIndex >= 0 ? `${currentIndex + 1} of ${siblingIds.length}` : ""}
        </Text>
        <Button variant="default" rightSection={<IconChevronRight size={16} />} disabled={!nextId} onClick={() => nextId && navigate(`/nonconformities/${nextId}`)}>
          Next
        </Button>
      </Group>

      <DispositionModal
        opened={dispositionOpen}
        onClose={() => setDispositionOpen(false)}
        submitting={disposition.isPending}
        onSubmit={(type, note) => disposition.mutate({ type, note })}
      />
      <NoteModal
        opened={rejectOpen}
        onClose={() => setRejectOpen(false)}
        title="Reject nonconformity"
        label="Reason for rejection"
        confirmLabel="Reject"
        confirmColor="red"
        submitting={reject.isPending}
        onSubmit={(note) => reject.mutate(note)}
      />
      <NoteModal
        opened={closeOpen}
        onClose={() => setCloseOpen(false)}
        title="Verify & close"
        label="Verification of conformity (ISO 8.7.1)"
        confirmLabel="Close report"
        submitting={closeReport.isPending}
        onSubmit={(note) => closeReport.mutate(note)}
      />
    </div>
  );
}

function DispositionModal({
  opened,
  onClose,
  submitting,
  onSubmit,
}: {
  opened: boolean;
  onClose: () => void;
  submitting: boolean;
  onSubmit: (type: DispositionType, note: string) => void;
}) {
  const [type, setType] = useState<DispositionType | null>(null);
  const [note, setNote] = useState("");
  const valid = !!type && note.trim().length > 0;

  return (
    <Modal opened={opened} onClose={onClose} title="Record disposition" centered>
      <Stack>
        <Select
          label="Disposition"
          placeholder="Select a disposition"
          data={DISPOSITION_OPTIONS}
          value={type}
          onChange={(v) => setType(v as DispositionType | null)}
          comboboxProps={{ withinPortal: true }}
        />
        <Textarea
          label="Decision note"
          description="Recorded as the deciding authority's rationale (ISO 8.7.2)"
          autosize
          minRows={3}
          value={note}
          onChange={(e) => setNote(e.currentTarget.value)}
        />
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>Cancel</Button>
          <Button color="green" loading={submitting} disabled={!valid} onClick={() => type && onSubmit(type, note)}>
            Record disposition
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

function NoteModal({
  opened,
  onClose,
  title,
  label,
  confirmLabel,
  confirmColor,
  submitting,
  onSubmit,
}: {
  opened: boolean;
  onClose: () => void;
  title: string;
  label: string;
  confirmLabel: string;
  confirmColor?: string;
  submitting: boolean;
  onSubmit: (note: string) => void;
}) {
  const [note, setNote] = useState("");
  const valid = note.trim().length > 0;

  return (
    <Modal opened={opened} onClose={onClose} title={title} centered>
      <Stack>
        <Textarea
          label={label}
          autosize
          minRows={3}
          value={note}
          onChange={(e) => setNote(e.currentTarget.value)}
        />
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>Cancel</Button>
          <Button color={confirmColor} loading={submitting} disabled={!valid} onClick={() => onSubmit(note)}>
            {confirmLabel}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
