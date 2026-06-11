import { Button, Card, Grid, Group, SimpleGrid, Stack, Text } from "@mantine/core";
import {
  IconAlertTriangle,
  IconClipboardList,
  IconPackageExport,
  IconPackageImport,
  IconBuildingWarehouse,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../components/PageHeader";
import { StatCard } from "../../components/StatCard";
import { useAuth } from "../../auth/AuthContext";
import { listIssues } from "../../api/store/issues";
import { listDeviations } from "../../api/store/deviations";
import { listGoodsReceipts } from "../../api/store/receiving";
import { listItems } from "../../api/store/items";

export function DashboardHome() {
  const { username } = useAuth();
  const navigate = useNavigate();

  const pendingIssues = useQuery({
    queryKey: ["issues", "PENDING_APPROVAL"],
    queryFn: () => listIssues("PENDING_APPROVAL"),
  });
  const openDeviations = useQuery({
    queryKey: ["deviations", "INCOMING"],
    queryFn: () => listDeviations("INCOMING"),
  });
  const recentGrns = useQuery({ queryKey: ["grns"], queryFn: () => listGoodsReceipts() });
  const items = useQuery({ queryKey: ["items", ""], queryFn: () => listItems() });

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${username ?? ""}`}
        subtitle="Your store at a glance"
      />

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} mb="lg">
        <StatCard
          label="Pending approvals"
          value={pendingIssues.data?.totalElements ?? "—"}
          icon={<IconPackageExport size={24} />}
          color="yellow"
          to="/issuing"
          hint="Issues awaiting approval"
        />
        <StatCard
          label="Incoming defects"
          value={openDeviations.data?.length ?? "—"}
          icon={<IconAlertTriangle size={24} />}
          color="red"
          to="/defects"
          hint="Deviation reports to triage"
        />
        <StatCard
          label="Goods receipts"
          value={recentGrns.data?.totalElements ?? "—"}
          icon={<IconPackageImport size={24} />}
          color="teal"
          to="/receiving"
          hint="Total GRNs"
        />
        <StatCard
          label="Catalog items"
          value={items.data?.totalElements ?? "—"}
          icon={<IconBuildingWarehouse size={24} />}
          color="brand"
          to="/store"
          hint="Active items"
        />
      </SimpleGrid>

      <Grid>
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Card withBorder radius="md" padding="lg" h="100%">
            <Text fw={600} mb="md">
              Quick actions
            </Text>
            <Group>
              <Button
                leftSection={<IconPackageImport size={16} />}
                onClick={() => navigate("/receiving/new")}
              >
                New goods receipt
              </Button>
              <Button
                leftSection={<IconPackageExport size={16} />}
                variant="light"
                onClick={() => navigate("/issuing/new")}
              >
                New issue
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
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 5 }}>
          <Card withBorder radius="md" padding="lg" h="100%">
            <Text fw={600} mb="md">
              Sections
            </Text>
            <Stack gap="xs">
              <SectionLink
                icon={<IconClipboardList size={16} />}
                label="Process borrow requests"
                onClick={() => navigate("/requests")}
              />
              <SectionLink
                icon={<IconBuildingWarehouse size={16} />}
                label="Manage items & stock"
                onClick={() => navigate("/store")}
              />
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>
    </div>
  );
}

function SectionLink({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button variant="subtle" justify="flex-start" leftSection={icon} onClick={onClick} fullWidth>
      {label}
    </Button>
  );
}
