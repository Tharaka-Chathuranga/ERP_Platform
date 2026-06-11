import { AppShell, Burger, Group, Text, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";

/** App shell: brand header + collapsible left sidebar + routed content. */
export function AppLayout() {
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 56 }}
      navbar={{ width: 240, breakpoint: "sm", collapsed: { mobile: !opened } }}
      padding="lg"
    >
      <AppShell.Header>
        <Group h="100%" px="md" gap="sm">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <Title order={4} c="brand">
            ERP Platform
          </Title>
          <Text size="sm" c="dimmed">
            Store Keeper
          </Text>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="sm">
        <Sidebar onNavigate={opened ? toggle : undefined} />
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
