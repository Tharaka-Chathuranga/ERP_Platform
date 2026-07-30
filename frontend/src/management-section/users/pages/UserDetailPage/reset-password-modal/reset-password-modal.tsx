import { Button, Group, Modal, PasswordInput, Stack } from "@mantine/core";

interface ResetPasswordModalProps {
  opened: boolean;
  onClose: () => void;
  newPassword: string;
  onNewPasswordChange: (value: string) => void;
  loading: boolean;
  onSubmit: () => void;
}

export function ResetPasswordModal({
  opened,
  onClose,
  newPassword,
  onNewPasswordChange,
  loading,
  onSubmit,
}: ResetPasswordModalProps) {
  return (
    <Modal opened={opened} onClose={onClose} title="Reset password" centered>
      <Stack>
        <PasswordInput
          label="New password"
          description="At least 8 characters"
          value={newPassword}
          onChange={(e) => onNewPasswordChange(e.currentTarget.value)}
        />
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={loading} disabled={newPassword.length < 8} onClick={onSubmit}>
            Reset
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
