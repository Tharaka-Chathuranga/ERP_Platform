import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@auth/AuthContext";
import { useCan } from "@auth/useCan";
import { NCR_REVIEW } from "@auth/permissions";
import { qk } from "@core/queryKeys";
import { notifyError, notifySuccess } from "@core/notify";
import type { DispositionType } from "@core/types";
import {
  closeNonconformity,
  dispositionNonconformity,
  getNonconformity,
  listNonconformities,
  rejectNonconformity,
  startNonconformityReview,
} from "../../../../api";

export function useNonconformityDetail() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { userId } = useAuth();
  const can = useCan();
  const canReview = can(NCR_REVIEW);

  const [dispositionOpen, setDispositionOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [closeOpen, setCloseOpen] = useState(false);

  const ncrQuery = useQuery({
    queryKey: qk.nonconformity(id),
    queryFn: () => getNonconformity(id),
  });
  const ncr = ncrQuery.data;

  const siblingsQuery = useQuery({
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

  const siblingIds = siblingsQuery.data?.map((d) => d.id) ?? [];
  const currentIndex = siblingIds.indexOf(id);
  const prevId = currentIndex > 0 ? siblingIds[currentIndex - 1] : null;
  const nextId = currentIndex >= 0 && currentIndex < siblingIds.length - 1 ? siblingIds[currentIndex + 1] : null;

  return {
    navigate,
    canReview,
    ncrQuery,
    ncr,
    siblingIds,
    currentIndex,
    prevId,
    nextId,
    startReview,
    disposition,
    reject,
    closeReport,
    dispositionOpen,
    setDispositionOpen,
    rejectOpen,
    setRejectOpen,
    closeOpen,
    setCloseOpen,
  };
}
