import { useCan } from "@auth/useCan";
import { DASHBOARD_OVERVIEW, OILMART_VIEW, type Permission } from "@auth/permissions";

const LANDING_ROUTES: { permission: Permission; to: string }[] = [
  { permission: DASHBOARD_OVERVIEW, to: "/overview" },
  { permission: OILMART_VIEW, to: "/oil-mart" },
];

export function useLandingRoute(): string | null {
  const can = useCan();
  return LANDING_ROUTES.find(({ permission }) => can(permission))?.to ?? null;
}
