import { useMemo, useState } from "react";
import { ActionIcon, Box, Button, Card, Divider, Grid, Group, LoadingOverlay, ThemeIcon } from "@mantine/core";
import { IconChevronLeft, IconChevronRight, IconUser, IconX } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@ui/layout/PageHeader";
import { StepHeading } from "@ui/layout/StepHeading";
import { DepartmentSelect } from "@ui/primitives/DepartmentSelect";
import { UserSelect } from "@ui/primitives/UserSelect";
import { LineItemsEditor, newLine, type EditableLine } from "@ui/primitives/LineItemsEditor";
import { DefinitionList } from "@ui/data/DefinitionList";
import { useAuth } from "@auth/AuthContext";
import { useUsers } from "@core/hooks/useUsers";
import { qk } from "@core/queryKeys";
import { notifyError, notifySuccess } from "@core/notify";
import { createIssue } from "../api";
import { IssueProgress } from "../components/IssueProgress";

const roleLabel = (role: string) => (role === "ADMIN" ? "Administrator" : "Store Keeper");

export function NewIssuePage() {
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

  // Department drives the user list, so a department change clears the user.
  function handleDepartment(value: string | null) {
    setDepartment(value);
    setBorrowingUserId(null);
  }

  return (
    <div>
      <PageHeader title="New goods issue" />

      <Group mb="md">
        <Button variant="default" leftSection={<IconChevronLeft size={16} />} onClick={() => navigate("/issuing")}>
          Back
        </Button>
      </Group>

      <IssueProgress status="DRAFT" mb="lg" />

      <Card withBorder radius="md" padding={0} pos="relative">
        <LoadingOverlay
          visible={mutation.isPending}
          overlayProps={{ blur: 1 }}
          loaderProps={{ children: "Creating issue…" }}
        />

        {/* Step 1 — Who is borrowing */}
        <Box p="xl">
          <StepHeading number={1} title="Who is borrowing the items?" />
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <DepartmentSelect
                label="Department"
                value={department}
                onChange={handleDepartment}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <UserSelect
                label="Borrowing user"
                value={borrowingUserId}
                onChange={setBorrowingUserId}
                department={department ?? undefined}
                disabled={!department}
                placeholder={department ? "Select user" : "Select a department first"}
              />
            </Grid.Col>
          </Grid>

          {selectedUser && (
            <Card withBorder radius="md" padding="sm" mt="md" bg="var(--mantine-color-brand-light)">
              <Group justify="space-between" align="flex-start" wrap="nowrap">
                <Group gap="sm" align="flex-start" wrap="nowrap" style={{ flex: 1 }}>
                  <ThemeIcon size={40} radius="xl" variant="light" color="brand">
                    <IconUser size={22} />
                  </ThemeIcon>
                  <Box style={{ flex: 1 }}>
                    <DefinitionList
                      items={[
                        { label: "User", value: selectedUser.displayName || selectedUser.username },
                        { label: "Username", value: selectedUser.username },
                        { label: "Role", value: roleLabel(selectedUser.role) },
                        { label: "Department", value: selectedUser.department },
                      ]}
                    />
                  </Box>
                </Group>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  aria-label="Remove selected user"
                  onClick={() => setBorrowingUserId(null)}
                >
                  <IconX size={16} />
                </ActionIcon>
              </Group>
            </Card>
          )}
        </Box>

        {/* Step 2 — Items */}
        <Divider />
        <Box p="xl">
          <StepHeading number={2} title="Which items are being issued?" />
          <LineItemsEditor lines={lines} onChange={setLines} showReturnable />
        </Box>

        {/* Submit */}
        <Box p="xl" pt={0}>
          <Group justify="space-between">
            <Button variant="default" onClick={() => navigate("/issuing")}>
              Cancel
            </Button>
            <Button
              radius="md"
              rightSection={<IconChevronRight size={16} />}
              onClick={() => mutation.mutate()}
              loading={mutation.isPending}
              disabled={!canSubmit}
            >
              Create issue
            </Button>
          </Group>
        </Box>
      </Card>
    </div>
  );
}
