import { Route } from "react-router-dom";
import { RequirePermission } from "@auth/RequirePermission";
import { QaDashboardPage } from "./QaDashboardPage";
import { QaDefectReviewPage } from "./QaDefectReviewPage";

/** Quality-assurance routes, guarded by the `dashboard:qa` permission. */
export const qaRoutes = (
  <Route element={<RequirePermission perform="dashboard:qa" />}>
    <Route path="qa" element={<QaDashboardPage />} />
    <Route path="qa/defects" element={<QaDefectReviewPage />} />
  </Route>
);
