import { Button, Group, Paper, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import {
  IconAlertHexagon,
  IconAlertTriangle,
  IconClipboardCheck,
  IconPackageExport,
  IconPackageImport,
} from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "@ui/data/DataTable";
import { StatusBadge } from "@ui/feedback/StatusBadge";
import { StatCard } from "@ui/feedback/StatCard";
import type { LowStockItem } from "@core/types";
import { WelcomeBanner } from "../welcome-banner";
import { SectionDivider } from "../section-divider";
import { useStorekeeperOverview } from "./use-storekeeper-overview";

export function StorekeeperOverview() {
  const navigate = useNavigate();
  const { username, lowStock, openNonconformities, recentReceivals, pendingCounts } = useStorekeeperOverview();

  return (
    <Stack gap="xl">

      <WelcomeBanner>
        <Title order={2} fw={700} mb={4}>
          👋 Welcome back, {username}
        </Title>
        <Text c="dimmed" fz="sm">
          Manage stock, receivals, and nonconformity reports from here.
        </Text>
      </WelcomeBanner>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
        <StatCard label="Low stock items" value={lowStock.data?.length ?? 0} icon={<IconAlertHexagon size={22} />} color="red" to="/warnings" hint="Below reorder level" />
        <StatCard label="Pending count requests" value={pendingCounts.data?.length ?? 0} icon={<IconClipboardCheck size={22} />} color="indigo" to="/count-requests" />
        <StatCard label="Open nonconformities" value={openNonconformities.data?.length ?? 0} icon={<IconAlertTriangle size={22} />} color="orange" to="/nonconformities" />
        <StatCard label="Total receivals" value={recentReceivals.data?.totalElements ?? 0} icon={<IconPackageImport size={22} />} color="teal" to="/receiving" />
      </SimpleGrid>

      <Paper p="lg" radius="md" withBorder>
        <Text fw={600} fz="xs" tt="uppercase" c="dimmed" mb="md" style={{ letterSpacing: "0.05em" }}>
          Quick actions
        </Text>
        <Group wrap="wrap">
          <Button leftSection={<IconPackageImport size={16} />} onClick={() => navigate("/receiving/new")}>
            New receival
          </Button>
          <Button leftSection={<IconPackageExport size={16} />} variant="light" onClick={() => navigate("/issuing/new")}>
            Issue goods
          </Button>
          <Button leftSection={<IconAlertTriangle size={16} />} variant="light" color="red" onClick={() => navigate("/nonconformities/new")}>
            Report nonconformity
          </Button>
        </Group>
      </Paper>

      <div>
        <SectionDivider label="Low-stock items" />
        <DataTable<LowStockItem>
          data={lowStock.data}
          loading={lowStock.isLoading}
          error={lowStock.error}
          rowKey={(r) => r.itemId}
          empty={<Text c="dimmed" p="md">Nothing below reorder level — all good.</Text>}
          columns={[
            { header: "Code", render: (r) => r.itemCode, emphasis: true },
            { header: "Name", render: (r) => r.name },
            { header: "On hand", render: (r) => `${r.quantityOnHand} ${r.unitOfMeasure}`, align: "right" },
            { header: "Reorder", render: (r) => r.reorderLevel, align: "right" },
            { header: "Flag", render: (r) => (r.criticalItem ? <StatusBadge status="CRITICAL" /> : null) },
          ]}
        />
      </div>
    </Stack>
  );
}
