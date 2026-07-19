import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { newLine, type EditableLine } from "@ui/primitives/LineItemsEditor";
import { useAuth } from "@auth/AuthContext";
import { useUsers } from "@core/hooks/useUsers";
import { qk } from "@core/queryKeys";
import { notifyError, notifySuccess } from "@core/notify";
import { createIssue } from "../../../../api";

export function useNewIssue() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { userId } = useAuth();

  const [department, setDepartment] = useState<string | null>(null);
  const [borrowingUserId, setBorrowingUserId] = useState<string | null>(null);
  const [lines, setLines] = useState<EditableLine[]>([newLine(false, true)]);

  const users = useUsers(department ?? undefined);
  const selectedUser = useMemo(
    () => users.data?.find((u) => u.id === borrowingUserId) ?? null,
    [users.data, borrowingUserId],
  );

  const validLines = lines.filter((l) => l.itemId && l.quantity !== "" && Number(l.quantity) > 0);
  const canSubmit = !!department && !!borrowingUserId && !!userId && validLines.length > 0;

  const mutation = useMutation({
    mutationFn: () =>
      createIssue({
        borrowingUserId: borrowingUserId!,
        storeKeeperId: userId!,
        lines: validLines.map((l) => ({
          itemId: l.itemId!,
          quantity: Number(l.quantity),
          returnable: !!l.returnable,
        })),
      }),
    onSuccess: (issue) => {
      notifySuccess(`Issue ${issue.issueNumber} created`);
      qc.invalidateQueries({ queryKey: qk.issues() });
      navigate(`/issuing/${issue.id}`);
    },
    onError: notifyError,
  });

  function handleDepartment(value: string | null) {
    setDepartment(value);
    setBorrowingUserId(null);
  }

  return {
    navigate,
    department,
    handleDepartment,
    borrowingUserId,
    setBorrowingUserId,
    lines,
    setLines,
    selectedUser,
    canSubmit,
    mutation,
  };
}
