import { ActionIcon, Box, NavLink, Stack, Tooltip } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { NavLink as RouterNavLink, useLocation } from "react-router-dom";
import { NAV } from "../lib/nav";

/**
 * Main navigation. When `collapsed` the labels are hidden and each entry shrinks
 * to an icon rail with a hover tooltip; otherwise it shows the full icon+label.
 * The expand/minimize toggle floats on the sidebar's right edge at the top.
 */
export function Sidebar({
  collapsed = false,
  onToggle,
  onNavigate,
}: {
  collapsed?: boolean;
  onToggle?: () => void;
  onNavigate?: () => void;
}) {
  const location = useLocation();

  return (
    <Box pos="relative" h="100%">
      {onToggle && (
        <Tooltip label={collapsed ? "Expand sidebar" : "Minimize sidebar"} position="right" withArrow>
          <ActionIcon
            variant="default"
            radius="xl"
            size="md"
            onClick={onToggle}
            visibleFrom="sm"
            aria-label="Toggle sidebar"
            style={{
              position: "absolute",
              top: 0,
              right: -28,
              zIndex: 1000,
              boxShadow: "var(--mantine-shadow-sm)",
            }}
          >
            {collapsed ? <IconChevronRight size={16} /> : <IconChevronLeft size={16} />}
          </ActionIcon>
        </Tooltip>
      )}

      <Stack gap={4}>
        {NAV.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to || location.pathname.startsWith(to + "/");
          const link = (
            <NavLink
              key={to}
              component={RouterNavLink}
              to={to}
              label={collapsed ? undefined : label}
              active={active}
              leftSection={<Icon size={20} />}
              onClick={onNavigate}
              variant="light"
              aria-label={label}
              styles={
                collapsed
                  ? { section: { marginInlineEnd: 0 }, body: { display: "none" } }
                  : undefined
              }
              style={collapsed ? { justifyContent: "center" } : undefined}
            />
          );

          return collapsed ? (
            <Tooltip key={to} label={label} position="right" withArrow>
              {link}
            </Tooltip>
          ) : (
            link
          );
        })}
      </Stack>
    </Box>
  );
}
