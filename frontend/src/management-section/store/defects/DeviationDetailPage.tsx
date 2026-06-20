import { useState } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Group,
  Loader,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconQuestionMark,
  IconX,
} from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@ui/layout/PageHeader";
import { DataTable, TableToolbar, type Column } from "@ui/data";
import { useAuth } from "@auth/AuthContext";
import { useCan } from "@auth/useCan";
import { DEFECT_APPROVE } from "@auth/permissions";
import { useItemLabels, useUserLabels } from "@core/hooks/useLookups";
import dayjs from "dayjs";
import {
  approveDeviation,
  getDeviation,
  listDeviations,
  rejectDeviation,
} from "@store/defects/deviations.api";
import { notifyError, notifySuccess } from "@core/notify";
import type { DeviationItem } from "@core/types";

const STATUS_META = {
  PENDING:  { bg: "var(--mantine-color-yellow-light)", border: "var(--mantine-color-yellow-5)", badge: "yellow" as const, icon: <IconQuestionMark size={28} />, iconColor: "yellow" as const },
  APPROVED: { bg: "var(--mantine-color-green-light)",  border: "var(--mantine-color-green-5)",  badge: "green"  as const, icon: <IconCheck size={28} />,        iconColor: "green"  as const },
  REJECTED: { bg: "var(--mantine-color-red-light)",    border: "var(--mantine-color-red-5)",    badge: "red"    as const, icon: <IconX size={28} />,             iconColor: "red"    as const },
};

const STAGE_META = {
  INCOMING:    { label: "Incoming",    color: "blue"   as const },
  IN_PROGRESS: { label: "In progress", color: "orange" as const },
  FINAL:       { label: "Final",       color: "teal"   as const },
};

export function DeviationDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { userId } = useAuth();
  const can = useCan();
  const canApprove = can(DEFECT_APPROVE);
  const itemLabel = useItemLabels();
  const userLabel = useUserLabels();

  const [search, setSearch] = useState("");

  const { data: dev, isLoading } = useQuery({
    queryKey: ["deviation", id],
    queryFn: () => getDeviation(id),
  });

  const { data: siblings } = useQuery({
    queryKey: ["deviations", dev?.stage],
    queryFn: () => listDeviations(dev!.stage),
    enabled: !!dev,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["deviation", id] });
    qc.invalidateQueries({ queryKey: ["deviations"] });
  };

  const approve = useMutation({
    mutationFn: () => approveDeviation(id, userId!),
    onSuccess: () => { notifySuccess("Defect report approved"); invalidate(); },
    onError: notifyError,
  });
  const reject = useMutation({
    mutationFn: () => rejectDeviation(id, userId!),
    onSuccess: () => { notifySuccess("Defect report rejected"); invalidate(); },
    onError: notifyError,
  });

  if (isLoading) return <Loader />;
  if (!dev) return <Text>Not found.</Text>;

  const isPending = dev.status === "PENDING";
  const statusMeta = STATUS_META[dev.status];
  const stageMeta = STAGE_META[dev.stage];

  const siblingIds = siblings?.map((d) => d.id) ?? [];
  const currentIndex = siblingIds.indexOf(id);
  const prevId = currentIndex > 0 ? siblingIds[currentIndex - 1] : null;
  const nextId = currentIndex >= 0 && currentIndex < siblingIds.length - 1 ? siblingIds[currentIndex + 1] : null;

  const itemColumns: Column<DeviationItem>[] = [
    { header: "Item", emphasis: true, render: (it) => itemLabel(it.itemId) },
    { header: "Quantity", align: "right", render: (it) => it.quantity },
  ];

  return (
    <div>
      <PageHeader title="Defect report" />

      <Group mb="md">
        <Button variant="default" leftSection={<IconChevronLeft size={16} />} onClick={() => navigate("/defects")}>
          Back
        </Button>
      </Group>

      <Card
        withBorder
        radius="md"
        padding={0}
        mb="md"
        style={{ borderColor: statusMeta.border, borderWidth: 1.5, position: "relative", overflow: "visible" }}
      >
        {/* Status notification badge on top-right border */}
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
                <Badge color={statusMeta.badge} variant="filled" size="md">{dev.status}</Badge>
                <Badge color={stageMeta.color} variant="light" size="md">{stageMeta.label}</Badge>
              </Group>
              <Title order={4}>Defect Report</Title>
            </Stack>
            <Stack gap={2} align="flex-end">
              <Text size="sm" fw={500}>{userLabel(dev.requestedByUserId)}</Text>
              <Text size="xs" c="dimmed">{dayjs(dev.requestedAt).format("MMM D, YYYY [at] HH:mm")}</Text>
              {dev.status !== "PENDING" && dev.approvedByUserId && (
                <Text size="xs" c="dimmed">
                  {dev.status === "APPROVED" ? "Approved" : "Rejected"} by {userLabel(dev.approvedByUserId)}
                  {dev.approvedAt ? ` · ${dayjs(dev.approvedAt).format("MMM D, YYYY")}` : ""}
                </Text>
              )}
            </Stack>
          </Group>
        </Box>

        <Stack gap={0} px="lg" py="lg">
          {dev.reason && (
            <Box mb="md">
              <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={4}>Reason</Text>
              <Text size="sm" c="dimmed" style={{ fontStyle: "italic" }}>&ldquo;{dev.reason}&rdquo;</Text>
            </Box>
          )}

          <Group gap="xl">
            <Stack gap={2}>
              <Text size="xs" c="dimmed" tt="uppercase" fw={600}>Items affected</Text>
              <Text fw={700} size="lg">{dev.items.length}</Text>
            </Stack>
            <Stack gap={2}>
              <Text size="xs" c="dimmed" tt="uppercase" fw={600}>Total quantity</Text>
              <Text fw={700} size="lg">{dev.items.reduce((s, it) => s + it.quantity, 0)}</Text>
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
            data={dev.items.filter(it => {
              const term = search.trim().toLowerCase();
              return !term || itemLabel(it.itemId).toLowerCase().includes(term);
            })}
            rowKey={(it) => it.itemId}
          />
        </Box>

        {canApprove && isPending && (
          <>
            <Divider />
            <Group justify="space-between" p="lg">
              <Button variant="light" color="red" leftSection={<IconX size={16} />} loading={reject.isPending} onClick={() => reject.mutate()}>
                Reject
              </Button>
              <Button color="green" leftSection={<IconCheck size={16} />} loading={approve.isPending} onClick={() => approve.mutate()}>
                Approve
              </Button>
            </Group>
          </>
        )}
      </Card>

      {/* Previous / Next navigation */}
      <Group justify="space-between">
        <Button variant="default" leftSection={<IconChevronLeft size={16} />} disabled={!prevId} onClick={() => prevId && navigate(`/defects/${prevId}`)}>
          Previous
        </Button>
        <Text size="sm" c="dimmed">
          {currentIndex >= 0 ? `${currentIndex + 1} of ${siblingIds.length}` : ""}
        </Text>
        <Button variant="default" rightSection={<IconChevronRight size={16} />} disabled={!nextId} onClick={() => nextId && navigate(`/defects/${nextId}`)}>
          Next
        </Button>
      </Group>
    </div>
  );
}
