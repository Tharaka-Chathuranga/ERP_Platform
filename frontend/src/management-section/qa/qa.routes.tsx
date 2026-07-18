import { Route } from "react-router-dom";
import { RequirePermission } from "@auth/RequirePermission";
import { NCR_REVIEW } from "@auth/permissions";
import { QualityAssuranceNonconformityReviewPage } from "./pages/QualityAssuranceNonconformityReviewPage";

/** QA nonconformity review — gated to users who can review/disposition NCRs. */
export const qaRoutes = (
  <Route element={<RequirePermission perform={NCR_REVIEW} />}>
    <Route path="qa/nonconformities" element={<QualityAssuranceNonconformityReviewPage />} />
  </Route>
);
