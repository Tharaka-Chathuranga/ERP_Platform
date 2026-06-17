import { Button, Card, Group, SimpleGrid, Text, ThemeIcon } from "@mantine/core";
import {
  IconAlertTriangle,
  IconPackageExport,
  IconPackageImport,
  IconBuildingWarehouse,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@ui/layout/PageHeader";
import { StatCard } from "@ui/feedback/StatCard";
import { useAuth } from "@auth/AuthContext";
import { listIssues } from "@store/goods-issuing/issuing.api";
import { listDeviations } from "@store/defects/deviations.api";
import { listReceivals } from "@store/goods-receiving/receiving.api";
import { listItems } from "@store/inventory/items.api";
import { NAV } from "@nav/nav.registry";

export function DashboardHome() {
  const { username, isAdmin } = useAuth();
  const navigate = useNavigate();

  const pendingIssues = useQuery({
    queryKey: ["issues", "PENDING_APPROVAL"],
    queryFn: () => listIssues("PENDING_APPROVAL"),
  });
  const openDeviations = useQuery({
    queryKey: ["deviations", "INCOMING"],
    queryFn: () => listDeviations("INCOMING"),
  });
  const recentReceivals = useQuery({ queryKey: ["receivals"], queryFn: () => listReceivals() });
  const items = useQuery({ queryKey: ["items", ""], queryFn: () => listItems() });

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${username ?? ""} 👋`}
      />

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} mb="lg">
        <StatCard
          label="Pending approvals"
          value={pendingIssues.data?.totalElements ?? 0}
          icon={<IconPackageExport size={22} />}
          color="yellow"
        />
        <StatCard
          label="Incoming defects"
          value={openDeviations.data?.length ?? 0}
          icon={<IconAlertTriangle size={22} />}
          color="red"
        />
        <StatCard
          label="Receivals"
          value={recentReceivals.data?.totalElements ?? 0}
          icon={<IconPackageImport size={22} />}
          color="teal"
        />
        <StatCard
          label="Catalog items"
          value={items.data?.totalElements ?? 0}
          icon={<IconBuildingWarehouse size={22} />}
          color="brand"
        />
      </SimpleGrid>

      <Card withBorder radius="md" padding="lg" mb="lg">
        <Text fw={600} mb="md">
          Quick actions
        </Text>
        <Group>
          <Button
            leftSection={<IconPackageImport size={16} />}
            onClick={() => navigate("/receiving/new")}
          >
            New item receival
          </Button>
          <Button
            leftSection={<IconPackageExport size={16} />}
            variant="light"
            onClick={() => navigate("/issuing/new")}
          >
            New goods issue
          </Button>
          <Button
            leftSection={<IconAlertTriangle size={16} />}
            variant="light"
            color="red"
            onClick={() => navigate("/defects/new")}
          >
            Report defect
          </Button>
        </Group>
      </Card>

      {/* One box per sidebar section, kept in sync via the shared NAV list. */}
      <Text fw={600} mb="sm">
        Sections
      </Text>
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
        {NAV.filter((n) => n.to !== "/dashboard" && (!n.adminOnly || isAdmin)).map(({ to, label, icon: Icon, color, description }) => (
          <Card
            key={to}
            withBorder
            radius="md"
            padding="lg"
            onClick={() => navigate(to)}
            style={{ cursor: "pointer", height: "100%" }}
          >
            <ThemeIcon color={color} variant="light" size={44} radius="md" mb="sm">
              <Icon size={24} />
            </ThemeIcon>
            <Text fw={600}>{label}</Text>
            <Text size="xs" c="dimmed">
              {description}
            </Text>
          </Card>
        ))}
      </SimpleGrid>
    </div>
  );
}
