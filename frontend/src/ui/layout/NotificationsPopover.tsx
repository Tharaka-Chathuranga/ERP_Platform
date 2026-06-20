import { useState } from "react";
import {
  ActionIcon,
  Badge,
  Box,
  Center,
  Divider,
  Group,
  Popover,
  ScrollArea,
  Stack,
  Text,
  ThemeIcon,
  UnstyledButton,
} from "@mantine/core";
import {
  IconAlertHexagon,
  IconAlertTriangle,
  IconBell,
  IconCircleCheck,
  IconInfoCircle,
} from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { useNotifications, type AppNotification } from "./useNotifications";

function severityColor(severity: AppNotification["severity"]) {
  if (severity === "error") return "red";
  if (severity === "warning") return "orange";
  return "blue";
}

function SeverityIcon({ severity }: { severity: AppNotification["severity"] }) {
  const color = severityColor(severity);
  const icon =
    severity === "error" ? (
      <IconAlertHexagon size={16} />
    ) : severity === "warning" ? (
      <IconAlertTriangle size={16} />
    ) : (
      <IconInfoCircle size={16} />
    );
  return (
    <ThemeIcon size={32} radius="xl" color={color} variant="light" style={{ flexShrink: 0 }}>
      {icon}
    </ThemeIcon>
  );
}

function NotificationItem({
  notification,
  onClose,
}: {
  notification: AppNotification;
  onClose: () => void;
}) {
  const navigate = useNavigate();

  return (
    <UnstyledButton
      w="100%"
      p="sm"
      style={{ borderRadius: 8 }}
      onClick={() => {
        navigate(notification.href);
        onClose();
      }}
    >
      <Group gap="sm" align="flex-start" wrap="nowrap">
        <SeverityIcon severity={notification.severity} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <Text size="sm" fw={600} lh={1.3}>
            {notification.title}
          </Text>
          <Text size="xs" c="dimmed" mt={2} lh={1.4}>
            {notification.description}
          </Text>
        </div>
      </Group>
    </UnstyledButton>
  );
}

export function NotificationsPopover() {
  const [opened, setOpened] = useState(false);
  const notifications = useNotifications();

  return (
    <Popover
      opened={opened}
      onChange={setOpened}
      position="bottom-end"
      width={360}
      shadow="md"
      withArrow
    >
      <Popover.Target>
        <ActionIcon
          variant="subtle"
          size="lg"
          aria-label="Notifications"
          onClick={() => setOpened((o) => !o)}
          style={{ position: "relative", overflow: "visible" }}
        >
          <IconBell size={18} />
          {notifications.length > 0 && (
            <Box
              style={{
                position: "absolute",
                top: 1,
                right: 1,
                minWidth: 16,
                height: 16,
                borderRadius: 8,
                backgroundColor: "var(--mantine-color-red-6)",
                color: "#fff",
                fontSize: 10,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 4px",
                lineHeight: 1,
                pointerEvents: "none",
              }}
            >
              {notifications.length}
            </Box>
          )}
        </ActionIcon>
      </Popover.Target>

      <Popover.Dropdown p={0}>
        <Group px="md" py="sm" justify="space-between">
          <Text fw={600} size="sm">
            Notifications
          </Text>
          {notifications.length > 0 && (
            <Badge size="sm" color="red" variant="light">
              {notifications.length} active
            </Badge>
          )}
        </Group>

        <Divider />

        {notifications.length === 0 ? (
          <Center py="xl">
            <Stack align="center" gap="xs">
              <ThemeIcon size={40} radius="xl" color="green" variant="light">
                <IconCircleCheck size={22} />
              </ThemeIcon>
              <Text size="sm" c="dimmed">
                All clear — no alerts
              </Text>
            </Stack>
          </Center>
        ) : (
          <ScrollArea.Autosize mah={400}>
            <Stack gap={0} p="xs">
              {notifications.map((n, i) => (
                <div key={n.id}>
                  {i > 0 && <Divider mx="sm" />}
                  <NotificationItem notification={n} onClose={() => setOpened(false)} />
                </div>
              ))}
            </Stack>
          </ScrollArea.Autosize>
        )}
      </Popover.Dropdown>
    </Popover>
  );
}
