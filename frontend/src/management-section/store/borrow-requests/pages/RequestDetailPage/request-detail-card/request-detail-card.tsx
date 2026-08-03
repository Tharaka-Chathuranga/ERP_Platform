import { Button, Card, SimpleGrid } from "@mantine/core";
import { IconExternalLink } from "@tabler/icons-react";
import dayjs from "dayjs";
import { StatusBadge } from "@ui/feedback/StatusBadge";
import type { BorrowRequest } from "@core/types";
import { Field } from "./request-field";

interface RequestDetailCardProps {
  request: BorrowRequest;
  userLabel: (id: string) => string;
  onViewIssue: () => void;
}

export function RequestDetailCard({ request, userLabel, onViewIssue }: RequestDetailCardProps) {
  return (
    <Card withBorder radius="md" padding="lg">
      <SimpleGrid cols={{ base: 2, sm: 3 }} mb="md">
        <Field label="Status" value={<StatusBadge status={request.status} />} />
        <Field label="Requested by" value={userLabel(request.requestedByUserId)} />
        <Field label="Requested at" value={dayjs(request.requestedAt).format("YYYY-MM-DD HH:mm")} />
        {request.approvedByUserId && (
          <Field label="Approved by" value={userLabel(request.approvedByUserId)} />
        )}
      </SimpleGrid>
      <Field label="Reason" value={request.reason} />
      <Button
        mt="md"
        variant="subtle"
        leftSection={<IconExternalLink size={16} />}
        onClick={onViewIssue}
      >
        View linked issue
      </Button>
    </Card>
  );
}
