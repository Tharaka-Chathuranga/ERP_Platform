import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { useAuth } from "@auth/AuthContext";
import { useUserLabels } from "@core/hooks/useLookups";
import { notifyError, notifySuccess } from "@core/notify";
import { approveBorrowRequest, getBorrowRequest, rejectBorrowRequest } from "../../../../api";

export function useRequestDetail() {
  const { id = "" } = useParams();
  const qc = useQueryClient();
  const { userId, isAdmin } = useAuth();
  const userLabel = useUserLabels();

  const query = useQuery({
    queryKey: ["borrowRequest", id],
    queryFn: () => getBorrowRequest(id),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["borrowRequest", id] });
    qc.invalidateQueries({ queryKey: ["borrowRequests"] });
  };

  const approve = useMutation({
    mutationFn: () => approveBorrowRequest(id, userId!),
    onSuccess: () => { notifySuccess("Approved"); invalidate(); },
    onError: notifyError,
  });
  const reject = useMutation({
    mutationFn: () => rejectBorrowRequest(id, userId!),
    onSuccess: () => { notifySuccess("Rejected"); invalidate(); },
    onError: notifyError,
  });

  return { isAdmin, userLabel, query, invalidate, approve, reject };
}
