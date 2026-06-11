import { NavLink, Stack, Tooltip } from "@mantine/core";
import { NavLink as RouterNavLink, useLocation } from "react-router-dom";
import { NAV } from "../lib/nav";

/**
 * Main navigation. When `collapsed` the labels are hidden and each entry shrinks
 * to an icon rail with a hover tooltip; otherwise it shows the full icon+label.
 */
export function Sidebar({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const location = useLocation();

  return (
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
  );
}
