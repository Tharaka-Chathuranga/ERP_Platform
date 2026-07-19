import { ActionIcon, Box, Button, Card, Divider, Grid, Group, LoadingOverlay, ThemeIcon } from "@mantine/core";
import { IconChevronRight, IconUser, IconX } from "@tabler/icons-react";
import { StepHeading } from "@ui/layout/StepHeading";
import { DepartmentSelect } from "@ui/primitives/DepartmentSelect";
import { UserSelect } from "@ui/primitives/UserSelect";
import { LineItemsEditor } from "@ui/primitives/LineItemsEditor";
import { DefinitionList } from "@ui/data/DefinitionList";
import { useNewIssue } from "../hooks/use-new-issue";

const roleLabel = (role: string) => (role === "ADMIN" ? "Administrator" : "Store Keeper");

export function NewIssueForm() {
  const {
    navigate,
    department,
    handleDepartment,
    borrowingUserId,
    setBorrowingUserId,
    lines,
    setLines,
    selectedUser,
    canSubmit,
    mutation,
  } = useNewIssue();

  return (
    <Card withBorder radius="md" padding={0} pos="relative">
      <LoadingOverlay
        visible={mutation.isPending}
        overlayProps={{ blur: 1 }}
        loaderProps={{ children: "Creating issue…" }}
      />

      <Box p="xl">
        <StepHeading number={1} title="Who is borrowing the items?" />
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <DepartmentSelect label="Department" value={department} onChange={handleDepartment} />
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

      <Divider />
      <Box p="xl">
        <StepHeading number={2} title="Which items are being issued?" />
        <LineItemsEditor lines={lines} onChange={setLines} showReturnable />
      </Box>

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
  );
}
