import { useMemo, useState } from "react";
import {
  Button,
  Card,
  Grid,
  Group,
  LoadingOverlay,
  Stack,
  Text,
} from "@mantine/core";
import { IconArrowLeft, IconExternalLink } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@ui/layout/PageHeader";
import { DepartmentSelect } from "@ui/primitives/DepartmentSelect";
import { UserSelect } from "@ui/primitives/UserSelect";
import { LineItemsEditor, newLine, type EditableLine } from "@ui/primitives/LineItemsEditor";
import { DefinitionList } from "@ui/data/DefinitionList";
import { StatusBadge } from "@ui/feedback/StatusBadge";
import { useAuth } from "@auth/AuthContext";
import { useUsers } from "@core/hooks/useUsers";
import { useItemLabels, useUserLabels } from "@core/hooks/useLookups";
import { qk } from "@core/queryKeys";
import { notifyError, notifySuccess } from "@core/notify";
import { createIssue } from "@store/goods-issuing/issuing.api";
import type { Issue } from "@core/types";
import { IssueItemCards } from "./IssueItemCards";
import { IssueProgress } from "./IssueProgress";

const roleLabel = (role: string) => (role === "ADMIN" ? "Administrator" : "Store Keeper");


export function NewIssuePage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { userId } = useAuth();
  const itemLabel = useItemLabels();
  const userLabel = useUserLabels();

  const [active, setActive] = useState(0);
  const [department, setDepartment] = useState<string | null>(null);
  const [borrowingUserId, setBorrowingUserId] = useState<string | null>(null);
  const [lines, setLines] = useState<EditableLine[]>([newLine(false, true)]);
  const [created, setCreated] = useState<Issue | null>(null);

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
      setCreated(issue);
      setActive(1);
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

      <IssueProgress status={created?.status ?? "DRAFT"} mb="lg" />

      {active === 0 && (
        <Card withBorder radius="md" padding="lg" pos="relative">
          <LoadingOverlay
            visible={mutation.isPending}
            overlayProps={{ blur: 1 }}
            loaderProps={{ children: "Creating issue…" }}
          />
          <Stack>
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
              <Card withBorder radius="md" padding="sm" bg="var(--mantine-color-brand-0)">
                <DefinitionList
                  items={[
                    { label: "User", value: selectedUser.displayName || selectedUser.username },
                    { label: "Username", value: selectedUser.username },
                    { label: "Role", value: roleLabel(selectedUser.role) },
                    { label: "Department", value: selectedUser.department },
                  ]}
                />
              </Card>
            )}

            <div>
              <Text fw={600} mb="xs">
                Items
              </Text>
              <LineItemsEditor lines={lines} onChange={setLines} showReturnable />
            </div>

            <Group justify="flex-end">
              <Button variant="default" onClick={() => navigate("/issuing")}>
                Cancel
              </Button>
              <Button
                onClick={() => mutation.mutate()}
                loading={mutation.isPending}
                disabled={!canSubmit}
              >
                Next
              </Button>
            </Group>
          </Stack>
        </Card>
      )}

      {active === 1 && created && (
        <Stack>
          <Card withBorder radius="md" padding="lg">
            <Group justify="space-between" align="flex-start" mb="md">
              <div>
                <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                  Issue
                </Text>
                <Text fw={700} size="lg">
                  {created.issueNumber}
                </Text>
              </div>
              <StatusBadge status={created.status} />
            </Group>
            <DefinitionList
              items={[
                {
                  label: "Borrowing user",
                  value: selectedUser?.displayName || userLabel(created.borrowingUserId),
                },
                { label: "Department", value: department },
                { label: "Store keeper", value: userLabel(created.storeKeeperId) },
                { label: "Items", value: created.lines.length },
              ]}
            />
          </Card>

          <Card withBorder radius="md" padding="lg">
            <Text fw={600} mb="sm">
              Issued items
            </Text>
            <IssueItemCards lines={created.lines} itemLabel={itemLabel} />
          </Card>

          <Group justify="flex-end">
            <Button
              variant="default"
              leftSection={<IconArrowLeft size={16} />}
              onClick={() => navigate("/issuing")}
            >
              Back to list
            </Button>
            <Button
              leftSection={<IconExternalLink size={16} />}
              onClick={() => navigate(`/issuing/${created.id}`)}
            >
              Issue the items
            </Button>
          </Group>
        </Stack>
      )}
    </div>
  );
}
