import { useState } from "react";
import {
  Anchor,
  Button,
  Card,
  Group,
  Modal,
  PasswordInput,
  Stack,
} from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { qk } from "@core/queryKeys";
import { notifyError, notifySuccess } from "@core/notify";
import { AppButton } from "@ui/buttons/AppButton";
import { DefinitionList } from "@ui/data/DefinitionList";
import { QueryBoundary } from "@ui/feedback/QueryBoundary";
import { StatusBadge } from "@ui/feedback/StatusBadge";
import { PageHeader } from "@ui/layout/PageHeader";
import {
  disableUser,
  enableUser,
  getAdminUser,
  resetUserPassword,
} from "./users.admin.api";
import { UserFormModal } from "./UserFormModal";

export function UserDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const { data: user, isLoading, error } = useQuery({
    queryKey: qk.adminUser(id),
    queryFn: () => getAdminUser(id),
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

  return (
    <div>
      <PageHeader
        title="User"
        actions={
          user && (
            <Group>
              <AppButton label="Edit" variant="default" onClick={() => setEditing(true)} />
              <AppButton
                label="Reset password"
                variant="default"
                onClick={() => setResetting(true)}
              />
              <AppButton
                label={user.enabled ? "Disable" : "Enable"}
                color={user.enabled ? "red" : "green"}
                variant="light"
                loading={toggle.isPending}
                onClick={() => toggle.mutate()}
              />
            </Group>
          )
        }
      />

      <Anchor
        component="button"
        type="button"
        mb="md"
        onClick={() => navigate("/admin/users")}
        style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
      >
        <IconArrowLeft size={16} /> Back to users
      </Anchor>

      <QueryBoundary loading={isLoading} error={error}>
        {user && (
          <Card withBorder radius="md" padding="lg">
            <DefinitionList
              items={[
                { label: "Username", value: user.username },
                { label: "Display name", value: user.displayName },
                { label: "Role", value: user.role.replace(/_/g, " ") },
                { label: "Department", value: user.department },
                {
                  label: "Status",
                  value: <StatusBadge status={user.enabled ? "ACTIVE" : "INACTIVE"} />,
                },
              ]}
            />
          </Card>
        )}
      </QueryBoundary>

      <UserFormModal opened={editing} onClose={() => setEditing(false)} user={user} />

      <Modal opened={resetting} onClose={() => setResetting(false)} title="Reset password" centered>
        <Stack>
          <PasswordInput
            label="New password"
            description="At least 8 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.currentTarget.value)}
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setResetting(false)}>
              Cancel
            </Button>
            <Button
              loading={reset.isPending}
              disabled={newPassword.length < 8}
              onClick={() => reset.mutate()}
            >
              Reset
            </Button>
          </Group>
        </Stack>
      </Modal>
    </div>
  );
}
