import { Badge, Box, Button, Card, Divider, Group, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { IconPackageExport } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useItemLabels, useUserLabels } from "@core/hooks/useLookups";
import type { Issue } from "@core/types";
import { IssueApprovalList } from "../../../components/IssueApprovalList";
import { IssueItemCards } from "../../../components/IssueItemCards";
import { IssueProgress } from "../../../components/IssueProgress";
import type { LineDecisionInput } from "../../../api";
import { STATUS_META } from "./status-meta";
import { Stat } from "./issue-stat";
import { IssueStockModal } from "../issue-stock-modal";
import { ReturnsModal } from "../returns-modal";

interface IssueDetailCardProps {
  issue: Issue;
  issueId: string;
  isAdmin: boolean;
  decideLinesPending: boolean;
  onDecide: (decisions: LineDecisionInput[]) => void;
  issueOpen: boolean;
  setIssueOpen: (open: boolean) => void;
  returnsOpen: boolean;
  setReturnsOpen: (open: boolean) => void;
  onDone: () => void;
}

export function IssueDetailCard({
  issue,
  issueId,
  isAdmin,
  decideLinesPending,
  onDecide,
  issueOpen,
  setIssueOpen,
  returnsOpen,
  setReturnsOpen,
  onDone,
}: IssueDetailCardProps) {
  const itemLabel = useItemLabels();
  const userLabel = useUserLabels();

  const meta = STATUS_META[issue.status];
  const total = issue.lines.length;
  const approved = issue.lines.filter((l) => l.approvalStatus === "APPROVED").length;
  const rejected = issue.lines.filter((l) => l.approvalStatus === "REJECTED").length;
  const pending = issue.lines.filter((l) => l.approvalStatus === "PENDING").length;
  const canReturn =
    (issue.status === "ISSUED" || issue.status === "RETURNED") && issue.lines.some((l) => l.returnable);

  return (
    <>
      <IssueProgress status={issue.status} mb="lg" />

      <Card
        withBorder
        radius="md"
        padding={0}
        style={{ borderColor: meta.border, borderWidth: 1.5, position: "relative", overflow: "visible" }}
      >
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

        <Group gap="xl" px="lg" py="lg">
          <Stat label="Total items" value={total} />
          <Stat label="Approved" value={approved} color="green" />
          <Stat label="Rejected" value={rejected} color="red" />
          <Stat label="Pending" value={pending} color="yellow.7" />
        </Group>

        <Divider />

        <Box p="lg">
          <Title order={5} mb="sm">
            {isAdmin && issue.status === "PENDING_APPROVAL" ? "Items needing approval" : "Items"}
          </Title>
          {isAdmin && issue.status === "PENDING_APPROVAL" ? (
            <IssueApprovalList
              lines={issue.lines}
              itemLabel={itemLabel}
              submitting={decideLinesPending}
              onSubmit={onDecide}
            />
          ) : (
            <IssueItemCards lines={issue.lines} itemLabel={itemLabel} />
          )}
        </Box>

        {(issue.status === "APPROVED" || canReturn) && (
          <>
            <Divider />
            <Group justify="flex-end" p="lg">
              {issue.status === "APPROVED" && (
                <Button leftSection={<IconPackageExport size={16} />} onClick={() => setIssueOpen(true)}>
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
        issueId={issueId}
        lines={issue.lines
          .filter((l) => l.approvalStatus === "APPROVED")
          .map((l) => ({ lineId: l.id, itemId: l.itemId, label: itemLabel(l.itemId), quantity: l.quantity }))}
        onDone={onDone}
      />

      <ReturnsModal
        opened={returnsOpen}
        onClose={() => setReturnsOpen(false)}
        issueId={issueId}
        lines={issue.lines
          .filter((l) => l.returnable && l.approvalStatus === "APPROVED")
          .map((l) => ({ itemId: l.itemId, label: itemLabel(l.itemId), outstanding: l.quantity - l.returnedQuantity }))}
        onDone={onDone}
      />
    </>
  );
}
