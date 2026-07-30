import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { newLine, type EditableLine } from "@ui/primitives/LineItemsEditor";
import { useAuth } from "@auth/AuthContext";
import { qk } from "@core/queryKeys";
import { notifyError, notifySuccess } from "@core/notify";
import type { DetectionStage } from "@core/types";
import { createNonconformity } from "../../../../api";

export function useNewNonconformity() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { userId } = useAuth();

  const [detectionStage, setDetectionStage] = useState<DetectionStage>("INCOMING");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [lines, setLines] = useState<EditableLine[]>([newLine()]);

  const isFinal = detectionStage === "FINAL";
  const reportedByUserId = isFinal ? selectedUserId : userId;

  const validLines = lines.filter((l) => l.itemId && l.quantity !== "" && Number(l.quantity) > 0);
  const canSubmit = !!reportedByUserId && validLines.length > 0;

  const mutation = useMutation({
    mutationFn: () => {
      const payload = {
        detectionStage,
        description: description || undefined,
        reportedByUserId: reportedByUserId!,
        items: validLines.map((l) => ({ itemId: l.itemId!, quantity: Number(l.quantity) })),
      };
      return createNonconformity(payload);
    },
    onSuccess: (d) => {
      notifySuccess("Nonconformity report raised");
      qc.invalidateQueries({ queryKey: qk.nonconformities() });
      navigate(`/nonconformities/${d.id}`);
    },
    onError: notifyError,
  });

  function selectStage(value: DetectionStage) {
    setDetectionStage(value);
    setSelectedUserId(null);
  }

  return {
    detectionStage,
    selectStage,
    selectedUserId,
    setSelectedUserId,
    description,
    setDescription,
    lines,
    setLines,
    isFinal,
    canSubmit,
    mutation,
  };
}
