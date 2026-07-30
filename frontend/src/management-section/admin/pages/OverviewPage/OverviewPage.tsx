import { useOverview } from "./hooks/use-overview";
import { AdminOverview } from "./overview-admin";
import { StorekeeperOverview } from "./overview-storekeeper";
import { QualityAssuranceOverview } from "./overview-quality-assurance";

export function OverviewPage() {
  const { role } = useOverview();

  if (role === "QUALITY_ASSURANCE") return <QualityAssuranceOverview />;
  if (role === "STORE_KEEPER") return <StorekeeperOverview />;

  return <AdminOverview />;
}
