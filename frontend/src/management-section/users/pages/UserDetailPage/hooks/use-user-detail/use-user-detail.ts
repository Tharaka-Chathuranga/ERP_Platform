import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { qk } from "@core/queryKeys";
import { notifyError, notifySuccess } from "@core/notify";
import { disableUser, enableUser, getUser, resetUserPassword } from "../../../../api";

export function useUserDetail() {
  const { id = "" } = useParams();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const { data: user, isLoading, error } = useQuery({
    queryKey: qk.adminUser(id),
    queryFn: () => getUser(id),
    enabled: !!id,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: qk.adminUser(id) });
    qc.invalidateQueries({ queryKey: qk.adminUsers() });
    qc.invalidateQueries({ queryKey: qk.adminSummary() });
  };

  const toggle = useMutation({
    mutationFn: () => (user!.enabled ? disableUser(id) : enableUser(id)),
    onSuccess: () => {
      notifySuccess("User updated");
      invalidate();
    },
    onError: notifyError,
  });

  const reset = useMutation({
    mutationFn: () => resetUserPassword(id, newPassword),
    onSuccess: () => {
      notifySuccess("Password reset");
      setResetting(false);
      setNewPassword("");
    },
    onError: notifyError,
  });

  return {
    id,
    user,
    isLoading,
    error,
    editing,
    setEditing,
    resetting,
    setResetting,
    newPassword,
    setNewPassword,
    toggle,
    reset,
  };
}
