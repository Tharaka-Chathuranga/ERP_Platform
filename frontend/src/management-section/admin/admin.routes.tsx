import { Route } from "react-router-dom";
import { RequirePermission } from "@auth/RequirePermission";
import { DASHBOARD_OVERVIEW } from "@auth/permissions";
import { OverviewPage } from "./pages/OverviewPage";

export const adminRoutes = (
  <Route element={<RequirePermission perform={DASHBOARD_OVERVIEW} />}>
    <Route path="overview" element={<OverviewPage />} />
  </Route>
);
