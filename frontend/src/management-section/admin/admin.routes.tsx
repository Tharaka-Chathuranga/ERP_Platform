import { Route } from "react-router-dom";
import { OverviewPage } from "./OverviewPage";

/** Overview route — accessible to all authenticated users; renders role-specific content. */
export const adminRoutes = (
  <Route path="overview" element={<OverviewPage />} />
);
