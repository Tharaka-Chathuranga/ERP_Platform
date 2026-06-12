import { AppShell, Avatar, Burger, Group, Menu, Text, Title } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { IconLogout } from "@tabler/icons-react";
import { Outlet, useNavigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { PageTitleProvider, usePageTitle } from "./PageTitle";
import { useAuth } from "../auth/AuthContext";

/** The current page's title, shown in the shared header (set via PageHeader). */
function HeaderTitle() {
  const { title } = usePageTitle();
  return (
    <Title order={3} fw={700} fz="xl" lineClamp={1} pl="md">
      {title}
    </Title>
  );
}

/** App shell: brand header with the signed-in user, a collapsible left sidebar,
 *  and the routed content. The header is shared by every page. */
export function AppLayout() {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
  const isMobile = useMediaQuery("(max-width: 48em)");
  const { username, role, logout } = useAuth();
  const navigate = useNavigate();

  // On mobile the navbar is a full-width overlay; on desktop it can shrink to an icon rail.
  const expanded = isMobile || desktopOpened;
  const initials = (username ?? "?").trim().slice(0, 2).toUpperCase();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <PageTitleProvider>
    <AppShell
      layout="alt"
      header={{ height: 56 }}
      navbar={{
        width: expanded ? 240 : 72,
        breakpoint: "sm",
        collapsed: { mobile: !mobileOpened, desktop: false },
      }}
      padding="lg"
    >
      <AppShell.Header withBorder={false}>
        <Group h="100%" px="md" gap="sm" wrap="nowrap">
          <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="sm" />

          <HeaderTitle />

          {/* User avatar + menu, pinned to the top-right corner. */}
          <Menu position="bottom-end" withArrow shadow="md" width={200}>
            <Menu.Target>
              <Group gap="xs" ml="auto" wrap="nowrap" style={{ cursor: "pointer" }}>
                <div style={{ textAlign: "right", lineHeight: 1.2 }}>
                  <Text size="sm" fw={600} visibleFrom="xs">
                    {username}
                  </Text>
                  <Text size="xs" c="dimmed" visibleFrom="xs">
                    {role === "ADMIN" ? "Administrator" : "Store Keeper"}
                  </Text>
                </div>
                <Avatar color="brand" radius="xl" size={36}>
                  {initials}
                </Avatar>
              </Group>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>Signed in as {username}</Menu.Label>
              <Menu.Item
                color="red"
                leftSection={<IconLogout size={16} />}
                onClick={handleLogout}
              >
                Logout
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="sm" style={{ overflow: "visible" }}>
        <Sidebar
          collapsed={!expanded}
          onToggle={toggleDesktop}
          onNavigate={mobileOpened ? toggleMobile : undefined}
        />
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
    </PageTitleProvider>
  );
}
