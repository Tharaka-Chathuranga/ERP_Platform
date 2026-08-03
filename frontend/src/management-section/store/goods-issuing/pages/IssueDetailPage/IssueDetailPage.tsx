import { Button, Group, Text } from "@mantine/core";
import { IconChevronLeft } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@ui/layout/PageHeader";
import { QueryBoundary } from "@ui/feedback/QueryBoundary";
import { useIssueDetail } from "./hooks/use-issue-detail";
import { IssueDetailCard } from "./issue-detail-card";

export function IssueDetailPage() {
  const navigate = useNavigate();
  const { id, isAdmin, query, invalidate, decideLines, returnsOpen, setReturnsOpen, issueOpen, setIssueOpen } =
    useIssueDetail();
  const issue = query.data;

  return (
    <div>
      <PageHeader title={issue?.issueNumber ?? "Goods issue"} />

      <Group mb="md">
        <Button variant="default" leftSection={<IconChevronLeft size={16} />} onClick={() => navigate("/issuing")}>
          Back
        </Button>
      </Group>

      <QueryBoundary loading={query.isLoading} error={query.error} isEmpty={!issue} empty={<Text>Not found.</Text>}>
        {issue && (
          <IssueDetailCard
            issue={issue}
            issueId={id}
            isAdmin={isAdmin}
            decideLinesPending={decideLines.isPending}
            onDecide={(decisions) => decideLines.mutate(decisions)}
            issueOpen={issueOpen}
            setIssueOpen={setIssueOpen}
            returnsOpen={returnsOpen}
            setReturnsOpen={setReturnsOpen}
            onDone={invalidate}
          />
        )}
      </QueryBoundary>
    </div>
  );
}
