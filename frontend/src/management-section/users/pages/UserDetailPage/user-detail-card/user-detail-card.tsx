import { Card } from "@mantine/core";
import { DefinitionList } from "@ui/data/DefinitionList";
import { StatusBadge } from "@ui/feedback/StatusBadge";
import type { AdminUser } from "@core/types";

interface UserDetailCardProps {
  user: AdminUser;
}

export function UserDetailCard({ user }: UserDetailCardProps) {
  return (
    <Card withBorder radius="md" padding="lg">
      <DefinitionList
        items={[
          { label: "Username", value: user.username },
          { label: "Display name", value: user.displayName },
          { label: "Role", value: user.role.replace(/_/g, " ") },
          { label: "Department", value: user.department },
          {
            label: "Status",
            value: <StatusBadge status={user.enabled ? "ACTIVE" : "INACTIVE"} />,
          },
        ]}
      />
    </Card>
  );
}
