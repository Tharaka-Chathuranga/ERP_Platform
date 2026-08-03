import { Grid, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import {
  IconAlertHexagon,
  IconAlertTriangle,
  IconBug,
  IconClipboardCheck,
  IconCoin,
  IconPackageExport,
  IconPackageImport,
  IconThumbUp,
} from "@tabler/icons-react";
import { StatCard } from "@ui/feedback/StatCard";
import { MovementTrendChart } from "../../../components/MovementTrendChart";
import { TopMoversChart } from "../../../components/TopMoversChart";
import { FuelEfficiencySection, FuelOverviewSection, FuelTankCapacitySection, StockHealthSection, TodayIssuesCard, TodayReceivalsCard } from "../../../components/overview";
import { WelcomeBanner } from "../welcome-banner";
import { SectionDivider } from "../section-divider";
import { useAdminOverview } from "./use-admin-overview";
import { currency } from "./format";

export function AdminOverview() {
  const { username, itemCode, trend, moverDays, setMoverDays, topMovers, s } = useAdminOverview();

  return (
    <Stack gap="xl">

      <WelcomeBanner>
        <Title order={2} fw={700} mb={4}>
          👋 Welcome back, {username}
        </Title>
        <Text c="dimmed" fz="sm">
          Here is your inventory overview for today.
        </Text>
      </WelcomeBanner>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
        <StatCard label="Received" value={s?.receivalCount ?? 0} icon={<IconPackageImport size={22} />} color="teal" to="/receiving" hint="Total receivals" />
        <StatCard label="Issued" value={s?.issuedCount ?? 0} icon={<IconPackageExport size={22} />} color="blue" to="/issuing" hint="Total issues" />
        <StatCard label="Low stock · critical" value={s?.lowStockCriticalItemCount ?? 0} icon={<IconAlertHexagon size={22} />} color="red" to="/warnings" hint="Critical & below reorder" />
        <StatCard label="Low stock · normal" value={s?.lowStockNormalItemCount ?? 0} icon={<IconAlertTriangle size={22} />} color="orange" to="/warnings" hint="Below reorder level" />
        <StatCard label="Inventory value" value={s ? currency.format(s.totalInventoryValue) : "—"} icon={<IconCoin size={22} />} color="teal" />
        <StatCard label="Pending approvals" value={s?.pendingIssueApprovalCount ?? 0} icon={<IconThumbUp size={22} />} color="yellow" />
        <StatCard label="Open nonconformities" value={s?.openNonconformityCount ?? 0} icon={<IconBug size={22} />} color="grape" to="/nonconformities" />
        <StatCard label="Count requests" value={s?.pendingCountAdjustmentCount ?? 0} icon={<IconClipboardCheck size={22} />} color="indigo" to="/count-requests" hint="Awaiting approval" />
      </SimpleGrid>

      <Grid>
        <Grid.Col span={{ base: 12, lg: 7 }}>
          <MovementTrendChart data={trend.data ?? []} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 5 }}>
          <TopMoversChart data={topMovers.data ?? []} itemLabel={itemCode} days={moverDays} onDaysChange={setMoverDays} />
        </Grid.Col>
      </Grid>

      <div>
        <SectionDivider label="Today's movements" />
        <Grid>
          <Grid.Col span={{ base: 12, lg: 6 }}>
            <TodayReceivalsCard />
          </Grid.Col>
          <Grid.Col span={{ base: 12, lg: 6 }}>
            <TodayIssuesCard />
          </Grid.Col>
        </Grid>
      </div>

      <div>
        <SectionDivider label="Stock health" />
        <Stack gap="lg">
          <StockHealthSection />
        </Stack>
      </div>

      <div>
        <SectionDivider label="Fuel" />
        <Stack gap="lg">
          <FuelOverviewSection />
          <FuelTankCapacitySection />
          <FuelEfficiencySection />
        </Stack>
      </div>
    </Stack>
  );
}
