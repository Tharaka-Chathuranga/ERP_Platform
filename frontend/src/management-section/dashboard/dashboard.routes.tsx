import { Route } from "react-router-dom";
import { RequirePermission } from "@auth/RequirePermission";
import { OverviewPage } from "./OverviewPage";

/** Admin overview route, guarded by the `dashboard:admin` permission. */
export const dashboardRoutes = (
  <Route element={<RequirePermission perform="dashboard:admin" />}>
    <Route path="overview" element={<OverviewPage />} />
  </Route>
);
