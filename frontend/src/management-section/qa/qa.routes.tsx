import { Route } from "react-router-dom";
import { RequirePermission } from "@auth/RequirePermission";
import { DASHBOARD_QA } from "@auth/permissions";
import { QualityAssuranceDashboardPage } from "./QualityAssuranceDashboardPage";
import { QualityAssuranceDefectReviewPage } from "./QualityAssuranceDefectReviewPage";

/** Quality-assurance routes, guarded by the `dashboard:qa` permission. */
export const qaRoutes = (
  <Route element={<RequirePermission perform={DASHBOARD_QA} />}>
    <Route path="qa" element={<QualityAssuranceDashboardPage />} />
    <Route path="qa/defects" element={<QualityAssuranceDefectReviewPage />} />
  </Route>
);
