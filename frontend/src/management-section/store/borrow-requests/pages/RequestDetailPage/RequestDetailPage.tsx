import { Loader, Text } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@ui/layout/PageHeader";
import { useRequestDetail } from "./hooks/use-request-detail";
import { RequestDetailActions } from "./request-detail-actions";
import { RequestDetailCard } from "./request-detail-card";

export function RequestDetailPage() {
  const navigate = useNavigate();
  const { isAdmin, userLabel, query, approve, reject } = useRequestDetail();
  const req = query.data;

  if (query.isLoading) return <Loader />;
  if (!req) return <Text>Not found.</Text>;

  return (
    <div>
      <PageHeader
        title="Borrow request"
        actions={
          <RequestDetailActions
            request={req}
            isAdmin={isAdmin}
            approvePending={approve.isPending}
            rejectPending={reject.isPending}
            onBack={() => navigate("/requests")}
            onApprove={() => approve.mutate()}
            onReject={() => reject.mutate()}
          />
        }
      />

      <RequestDetailCard
        request={req}
        userLabel={userLabel}
        onViewIssue={() => navigate(`/issuing/${req.issueId}`)}
      />
    </div>
  );
}
