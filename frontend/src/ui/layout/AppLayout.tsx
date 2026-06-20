import { ActionIcon, AppShell, Avatar, Burger, Divider, Group, Menu, Text, useMantineColorScheme } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { IconLogout, IconMoon, IconSun } from "@tabler/icons-react";
import { Outlet, useNavigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { NotificationsPopover } from "./NotificationsPopover";
import { useAuth } from "@auth/AuthContext";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrator",
  STORE_KEEPER: "Store Keeper",
  QUALITY_ASSURANCE: "Quality Assurance",
};

export function AppLayout() {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
  const isMobile = useMediaQuery("(max-width: 48em)");
  const { username, role, logout } = useAuth();
  const navigate = useNavigate();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  const expanded = isMobile || desktopOpened;
  const initials = (username ?? "?").trim().slice(0, 2).toUpperCase();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <AppShell
        layout="alt"
        header={{ height: 64 }}
        navbar={{
          width: expanded ? 260 : 72,
          breakpoint: "sm",
          collapsed: { mobile: !mobileOpened, desktop: false },
        }}
        padding="lg"
        styles={{
          navbar: {
            borderRight: "1px solid var(--mantine-color-default-border)",
          },
          main: {
            paddingTop: "var(--app-shell-header-height, 0rem)",
          },
        }}
      >
        <AppShell.Header withBorder={false}>
          <Group h="100%" px="lg" gap="sm" wrap="nowrap">
            <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="sm" />

            <Group gap="sm" ml="auto" wrap="nowrap" align="center">
              <NotificationsPopover />
              <ActionIcon
                variant="subtle"
                size="lg"
                aria-label="Toggle color scheme"
                onClick={toggleColorScheme}
              >
                {colorScheme === "dark" ? <IconSun size={18} /> : <IconMoon size={18} />}
              </ActionIcon>
              <Divider orientation="vertical" style={{ height: 28 }} />
              <Menu position="bottom-end" withArrow shadow="md" width={200}>
                <Menu.Target>
                  <Group gap="xs" wrap="nowrap" style={{ cursor: "pointer" }}>
                    <div style={{ textAlign: "right", lineHeight: 1.2 }}>
                      <Text size="sm" fw={600} visibleFrom="xs">
                        {username}
                      </Text>
                      <Text size="xs" c="dimmed" visibleFrom="xs">
                        {ROLE_LABELS[role ?? ""] ?? "Store Keeper"}
                      </Text>
                    </div>
                    <Avatar color="brand" radius="xl" size={38}>
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
  );
}
