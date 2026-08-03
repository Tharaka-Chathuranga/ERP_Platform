import { Anchor, Group } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { AppButton } from "@ui/buttons/AppButton";
import { QueryBoundary } from "@ui/feedback/QueryBoundary";
import { PageHeader } from "@ui/layout/PageHeader";
import { UserFormModal } from "../../components/UserFormModal";
import { useUserDetail } from "./hooks/use-user-detail";
import { UserDetailCard } from "./user-detail-card";
import { ResetPasswordModal } from "./reset-password-modal";

export function UserDetailPage() {
  const navigate = useNavigate();
  const {
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
  } = useUserDetail();

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
        onClick={() => navigate("/users")}
        style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
      >
        <IconArrowLeft size={16} /> Back to users
      </Anchor>

      <QueryBoundary loading={isLoading} error={error}>
        {user && <UserDetailCard user={user} />}
      </QueryBoundary>

      <UserFormModal opened={editing} onClose={() => setEditing(false)} user={user} />

      <ResetPasswordModal
        opened={resetting}
        onClose={() => setResetting(false)}
        newPassword={newPassword}
        onNewPasswordChange={setNewPassword}
        loading={reset.isPending}
        onSubmit={() => reset.mutate()}
      />
    </div>
  );
}
