import { Route } from "react-router-dom";
import { RequirePermission } from "@auth/RequirePermission";
import { DASHBOARD_ADMIN } from "@auth/permissions";
import { AdminAnalyticsPage } from "./AdminAnalyticsPage";

/** Admin analytics route, guarded by the `dashboard:admin` permission. */
export const adminRoutes = (
  <Route element={<RequirePermission perform={DASHBOARD_ADMIN} />}>
    <Route path="overview" element={<AdminAnalyticsPage />} />
  </Route>
);
