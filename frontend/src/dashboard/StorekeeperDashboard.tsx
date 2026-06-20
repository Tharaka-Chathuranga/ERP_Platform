import { Button, Card, Group, SimpleGrid, Text, ThemeIcon } from "@mantine/core";
import {
  IconAlertHexagon,
  IconAlertTriangle,
  IconClipboardCheck,
  IconPackageExport,
  IconPackageImport,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@auth/AuthContext";
import { useCan } from "@auth/useCan";
import { Can } from "@auth/Can";
import { STOCK_VIEW, DEFECT_VIEW } from "@auth/permissions";
import { qk } from "@core/queryKeys";
import { listDeviations } from "@store/defects/deviations.api";
import { listReceivals } from "@store/goods-receiving/receiving.api";
import { getLowStockItems } from "@store/inventory/items.api";
import { listCountRequests } from "@store/count-adjustments/count-requests.api";
import { PageHeader } from "@ui/layout/PageHeader";
import { StatCard } from "@ui/feedback/StatCard";
import { NAV } from "@nav/nav.registry";

export function StorekeeperDashboard() {
  const { username } = useAuth();
  const can = useCan();
  const navigate = useNavigate();

  const lowStock = useQuery({ queryKey: qk.lowStock(), queryFn: getLowStockItems });
  const openDefects = useQuery({
    queryKey: qk.deviations("INCOMING"),
    queryFn: () => listDeviations("INCOMING"),
  });
  const recentReceivals = useQuery({ queryKey: qk.receivals(), queryFn: () => listReceivals() });
  const pendingCountRequests = useQuery({
    queryKey: qk.countRequests("PENDING"),
    queryFn: () => listCountRequests("PENDING"),
  });

  return (
    <div>
      <PageHeader title={`Welcome back, ${username ?? ""}`} />

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} mb="lg">
        <StatCard
          label="Low stock items"
          value={lowStock.data?.length ?? 0}
          icon={<IconAlertHexagon size={22} />}
          color="red"
          to="/warnings"
          hint="Below reorder level"
        />
        <StatCard
          label="Pending count requests"
          value={pendingCountRequests.data?.length ?? 0}
          icon={<IconClipboardCheck size={22} />}
          color="indigo"
          to="/count-requests"
        />
        <StatCard
          label="Open defects"
          value={openDefects.data?.length ?? 0}
          icon={<IconAlertTriangle size={22} />}
          color="orange"
          to="/defects"
        />
        <StatCard
          label="Total receivals"
          value={recentReceivals.data?.totalElements ?? 0}
          icon={<IconPackageImport size={22} />}
          color="teal"
          to="/receiving"
        />
      </SimpleGrid>

      <Card withBorder radius="md" padding="lg" mb="lg">
        <Text fw={600} mb="md">
          Quick actions
        </Text>
        <Group wrap="wrap">
          <Can perform={STOCK_VIEW}>
            <Button
              leftSection={<IconPackageImport size={16} />}
              onClick={() => navigate("/receiving/new")}
            >
              New receival
            </Button>
          </Can>
          <Can perform={STOCK_VIEW}>
            <Button
              leftSection={<IconPackageExport size={16} />}
              variant="light"
              onClick={() => navigate("/issuing/new")}
            >
              Issue goods
            </Button>
          </Can>
          <Can perform={DEFECT_VIEW}>
            <Button
              leftSection={<IconAlertTriangle size={16} />}
              variant="light"
              color="red"
              onClick={() => navigate("/defects/new")}
            >
              Report defect
            </Button>
          </Can>
        </Group>
      </Card>

      <Text fw={600} mb="sm">
        Sections
      </Text>
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
        {NAV.filter(
          (n) => n.to !== "/dashboard" && (!n.requiredPermission || can(n.requiredPermission)),
        ).map(({ to, label, icon: Icon, color, description }) => (
          <Card
            key={to}
            withBorder
            radius="md"
            padding="lg"
            onClick={() => navigate(to)}
            style={{ cursor: "pointer" }}
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
