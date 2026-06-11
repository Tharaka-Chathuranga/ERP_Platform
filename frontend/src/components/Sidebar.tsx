import { Badge, Divider, Group, NavLink, Stack, Text, UnstyledButton } from "@mantine/core";
import {
  IconAlertTriangle,
  IconBuildingWarehouse,
  IconClipboardList,
  IconHome,
  IconLogout,
  IconPackageExport,
  IconPackageImport,
} from "@tabler/icons-react";
import { NavLink as RouterNavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const NAV = [
  { to: "/dashboard", label: "Home", icon: IconHome },
  { to: "/receiving", label: "Receiving", icon: IconPackageImport },
  { to: "/issuing", label: "Issuing", icon: IconPackageExport },
  { to: "/store", label: "Store", icon: IconBuildingWarehouse },
  { to: "/defects", label: "Defects", icon: IconAlertTriangle },
  { to: "/requests", label: "Requests", icon: IconClipboardList },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { username, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Stack h="100%" justify="space-between" gap={4}>
      <Stack gap={4}>
        {NAV.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to || location.pathname.startsWith(to + "/");
          return (
            <NavLink
              key={to}
              component={RouterNavLink}
              to={to}
              label={label}
              active={active}
              leftSection={<Icon size={18} />}
              onClick={onNavigate}
              variant="light"
            />
          );
        })}
      </Stack>

      <div>
        <Divider mb="sm" />
        <Group justify="space-between" px="xs" mb="xs" wrap="nowrap">
          <div style={{ minWidth: 0 }}>
            <Text size="sm" fw={600} truncate>
              {username}
            </Text>
            <Badge size="xs" variant="light" color={role === "ADMIN" ? "grape" : "blue"}>
              {role}
            </Badge>
          </div>
          <UnstyledButton
            onClick={() => {
              logout();
              navigate("/login");
            }}
            aria-label="Logout"
          >
            <IconLogout size={18} />
          </UnstyledButton>
        </Group>
      </div>
    </Stack>
  );
}
