import { useState } from "react";
import { Button, Group, Modal, PasswordInput, Select, Stack, TextInput } from "@mantine/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { qk } from "@core/queryKeys";
import { notifyError, notifySuccess } from "@core/notify";
import { DepartmentSelect } from "@ui/primitives/DepartmentSelect";
import type { AdminUser } from "@core/types";
import { createUser, updateUser } from "./users.api";

const ROLES = [
  { value: "ADMIN", label: "Admin" },
  { value: "STORE_KEEPER", label: "Store keeper" },
];

interface UserFormModalProps {
  opened: boolean;
  onClose: () => void;
  /** When provided the modal edits this user; otherwise it creates a new one. */
  user?: AdminUser | null;
}

export function UserFormModal({ opened, onClose, user }: UserFormModalProps) {
  const qc = useQueryClient();
  const editing = !!user;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<string | null>("STORE_KEEPER");
  const [department, setDepartment] = useState<string | null>(null);

  // Load the editing target's values when a different user is opened.
  const [loadedId, setLoadedId] = useState<string | null>(null);
  const currentId = user?.id ?? null;
  if (opened && currentId !== loadedId) {
    setLoadedId(currentId);
    setUsername(user?.username ?? "");
    setPassword("");
    setDisplayName(user?.displayName ?? "");
    setRole(user?.role ?? "STORE_KEEPER");
    setDepartment(user?.department ?? null);
  }

  const mutation = useMutation({
    mutationFn: () =>
      editing
        ? updateUser(user!.id, {
            displayName: displayName || undefined,
            role: role!,
            department: department || undefined,
          })
        : createUser({
            username,
            password,
            displayName: displayName || undefined,
            role: role!,
            department: department || undefined,
          }),
    onSuccess: () => {
      notifySuccess(editing ? "User updated" : "User created");
      qc.invalidateQueries({ queryKey: qk.adminUsers() });
      if (editing) qc.invalidateQueries({ queryKey: qk.adminUser(user!.id) });
      qc.invalidateQueries({ queryKey: qk.adminSummary() });
      onClose();
    },
    onError: notifyError,
  });

  const valid = editing
    ? !!role
    : username.trim().length > 0 && password.length >= 8 && !!role;

  return (
    <Modal opened={opened} onClose={onClose} title={editing ? "Edit user" : "New user"} centered>
      <Stack>
        {!editing && (
          <>
            <TextInput
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.currentTarget.value)}
              required
            />
            <PasswordInput
              label="Password"
              description="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              required
            />
          </>
        )}
        <TextInput
          label="Display name"
          value={displayName}
          onChange={(e) => setDisplayName(e.currentTarget.value)}
        />
        <Select label="Role" data={ROLES} value={role} onChange={setRole} allowDeselect={false} />
        <DepartmentSelect label="Department" value={department} onChange={setDepartment} />
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={mutation.isPending} disabled={!valid} onClick={() => mutation.mutate()}>
            {editing ? "Save" : "Create"}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
