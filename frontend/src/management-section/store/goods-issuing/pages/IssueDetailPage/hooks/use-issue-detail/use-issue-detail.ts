import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { useAuth } from "@auth/AuthContext";
import { qk } from "@core/queryKeys";
import { notifyError, notifySuccess } from "@core/notify";
import { decideIssueLines, getIssue, type LineDecisionInput } from "../../../../api";

export function useIssueDetail() {
  const { id = "" } = useParams();
  const qc = useQueryClient();
  const { userId, isAdmin } = useAuth();
  const [returnsOpen, setReturnsOpen] = useState(false);
  const [issueOpen, setIssueOpen] = useState(false);

  const query = useQuery({ queryKey: qk.issue(id), queryFn: () => getIssue(id) });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: qk.issue(id) });
    qc.invalidateQueries({ queryKey: qk.issues() });
  };

  const decideLines = useMutation({
    mutationFn: (decisions: LineDecisionInput[]) => decideIssueLines(id, userId!, decisions),
    onSuccess: () => {
      notifySuccess("Approval decisions saved");
      invalidate();
    },
    onError: notifyError,
  });

  return { id, isAdmin, query, invalidate, decideLines, returnsOpen, setReturnsOpen, issueOpen, setIssueOpen };
}
