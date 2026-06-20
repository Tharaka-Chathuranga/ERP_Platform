import { ActionIcon, Box, Divider, Group, NavLink, Stack, Text, Tooltip } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useMemo } from "react";
import { NavLink as RouterNavLink, useLocation } from "react-router-dom";
import { useCan } from "@auth/useCan";
import { GROUP_META, NAV, type NavItem } from "@nav/nav.registry";

type NavBlock =
  | { kind: "leaf"; item: NavItem }
  | { kind: "group"; name: string; items: NavItem[] };

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
  const can = useCan();

  const items = useMemo(
    () => NAV.filter((n) => !n.requiredPermission || can(n.requiredPermission)),
    [can],
  );

  const blocks = useMemo<NavBlock[]>(() => {
    const out: NavBlock[] = [];
    const seen = new Set<string>();
    for (const item of items) {
      if (!item.group) {
        out.push({ kind: "leaf", item });
      } else if (!seen.has(item.group)) {
        seen.add(item.group);
        out.push({
          kind: "group",
          name: item.group,
          items: items.filter((i) => i.group === item.group),
        });
      }
    }
    return out;
  }, [items]);

  const activeTo = useMemo(() => {
    let best: string | null = null;
    for (const { to } of items) {
      const matches = location.pathname === to || location.pathname.startsWith(to + "/");
      if (matches && to.length > (best?.length ?? -1)) best = to;
    }
    return best;
  }, [items, location.pathname]);

  const isActive = (to: string) => to === activeTo;

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

      {/* Brand mark */}
      <Group
        h={52}
        mb="xs"
        px={collapsed ? 0 : "xs"}
        justify={collapsed ? "center" : "flex-start"}
        align="center"
        gap="sm"
        wrap="nowrap"
      >
        <Box
          style={{
            width: 34,
            height: 34,
            borderRadius: 8,
            background: "linear-gradient(135deg, var(--mantine-color-brand-5) 0%, var(--mantine-color-brand-8) 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            boxShadow: "0 2px 8px rgba(44, 75, 128, 0.3)",
          }}
        >
          <Text fw={800} fz={16} c="white" lh={1} style={{ userSelect: "none" }}>
            E
          </Text>
        </Box>
        {!collapsed && (
          <div>
            <Text fw={700} fz="sm" lh={1.2} c="dark.8">
              ERP Platform
            </Text>
            <Text fz={10} c="dimmed" lh={1.3} style={{ letterSpacing: "0.02em" }}>
              Enterprise Resource
            </Text>
          </div>
        )}
      </Group>

      <Divider mb="sm" />

      {collapsed ? (
        <Stack gap={4}>
          {items.map(({ to, label, icon: Icon }) => (
            <Tooltip key={to} label={label} position="right" withArrow>
              <NavLink
                component={RouterNavLink}
                to={to}
                active={isActive(to)}
                leftSection={<Icon size={20} />}
                onClick={onNavigate}
                variant="light"
                aria-label={label}
                styles={{ section: { marginInlineEnd: 0 }, body: { display: "none" } }}
                style={{ justifyContent: "center" }}
              />
            </Tooltip>
          ))}
        </Stack>
      ) : (
        <Stack gap={4}>
          {blocks.map((block) => {
            if (block.kind === "leaf") {
              const { to, label, icon: Icon } = block.item;
              return (
                <NavLink
                  key={to}
                  component={RouterNavLink}
                  to={to}
                  label={label}
                  active={isActive(to)}
                  leftSection={<Icon size={20} />}
                  onClick={onNavigate}
                  variant="light"
                />
              );
            }

            const meta = GROUP_META[block.name];
            const GroupIcon = meta?.icon;
            const groupActive = block.items.some((i) => isActive(i.to));
            return (
              <NavLink
                key={block.name}
                label={block.name}
                leftSection={GroupIcon ? <GroupIcon size={20} /> : undefined}
                childrenOffset={28}
                defaultOpened={groupActive}
                variant="light"
              >
                {block.items.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    component={RouterNavLink}
                    to={to}
                    label={label}
                    active={isActive(to)}
                    leftSection={<Icon size={18} />}
                    onClick={onNavigate}
                    variant="light"
                  />
                ))}
              </NavLink>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}
