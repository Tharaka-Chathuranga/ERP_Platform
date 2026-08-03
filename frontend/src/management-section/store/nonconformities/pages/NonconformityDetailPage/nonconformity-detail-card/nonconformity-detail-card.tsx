import { Badge, Box, Button, Card, Divider, Group, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { IconGavel, IconHourglass, IconLock, IconX } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useUserLabels } from "@core/hooks/useLookups";
import type { NonconformityReport } from "@core/types";
import { DETECTION_STAGE_META, DISPOSITION_LABELS, STATUS_META } from "../../../components";
import { AffectedItems } from "./affected-items";
import { Stat } from "./stat";

interface NonconformityDetailCardProps {
  ncr: NonconformityReport;
  canReview: boolean;
  onStartReview: () => void;
  startReviewPending: boolean;
  onOpenReject: () => void;
  onOpenDisposition: () => void;
  onOpenClose: () => void;
}

export function NonconformityDetailCard({
  ncr,
  canReview,
  onStartReview,
  startReviewPending,
  onOpenReject,
  onOpenDisposition,
  onOpenClose,
}: NonconformityDetailCardProps) {
  const userLabel = useUserLabels();

  const statusMeta = STATUS_META[ncr.status];
  const stageMeta = DETECTION_STAGE_META[ncr.detectionStage];

  return (
    <Card
      withBorder
      radius="md"
      padding={0}
      mb="md"
      style={{ borderColor: statusMeta.border, borderWidth: 1.5, position: "relative", overflow: "visible" }}
    >
      <Box style={{ position: "absolute", top: -20, right: -20, zIndex: 1 }}>
        <ThemeIcon size={40} radius="xl" color={statusMeta.iconColor} variant="filled"
          style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.18)" }}>
          {statusMeta.icon}
        </ThemeIcon>
      </Box>

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
          <Stat label="Items affected" value={ncr.items.length} />
          <Stat label="Total quantity" value={ncr.items.reduce((s, it) => s + it.quantity, 0)} />
        </Group>
      </Stack>

      <Divider />

      <Box p="lg">
        <Title order={5} mb="sm">Affected items</Title>
        <AffectedItems items={ncr.items} />
      </Box>

      {canReview && ncr.status === "RAISED" && (
        <>
          <Divider />
          <Group justify="flex-end" p="lg">
            <Button leftSection={<IconHourglass size={16} />} loading={startReviewPending} onClick={onStartReview}>
              Start review
            </Button>
          </Group>
        </>
      )}
      {canReview && ncr.status === "UNDER_REVIEW" && (
        <>
          <Divider />
          <Group justify="space-between" p="lg">
            <Button variant="light" color="red" leftSection={<IconX size={16} />} onClick={onOpenReject}>
              Reject
            </Button>
            <Button color="green" leftSection={<IconGavel size={16} />} onClick={onOpenDisposition}>
              Record disposition
            </Button>
          </Group>
        </>
      )}
      {canReview && ncr.status === "DISPOSITIONED" && (
        <>
          <Divider />
          <Group justify="flex-end" p="lg">
            <Button leftSection={<IconLock size={16} />} onClick={onOpenClose}>
              Verify &amp; close
            </Button>
          </Group>
        </>
      )}
    </Card>
  );
}
