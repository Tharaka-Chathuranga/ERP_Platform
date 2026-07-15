import { Route } from "react-router-dom";
import { RequirePermission } from "@auth/RequirePermission";
import { DEFECT_APPROVE } from "@auth/permissions";
import { QualityAssuranceDefectReviewPage } from "./pages/QualityAssuranceDefectReviewPage";

/** QA defect review — gated to users who can approve/reject defects. */
export const qaRoutes = (
  <Route element={<RequirePermission perform={DEFECT_APPROVE} />}>
    <Route path="qa/defects" element={<QualityAssuranceDefectReviewPage />} />
  </Route>
);
