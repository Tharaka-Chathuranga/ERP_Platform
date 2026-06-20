import { Route } from "react-router-dom";
import { RequirePermission } from "@auth/RequirePermission";
import { STOCK_VIEW, DEFECT_VIEW, DASHBOARD_ADMIN, COUNT_REQUEST } from "@auth/permissions";
import { ReceivingListPage, NewReceivalPage, ReceivalDetailPage } from "./goods-receiving";
import { IssueListPage, NewIssuePage, IssueDetailPage } from "./goods-issuing";
import { ItemsPage, SuppliersPage, WarningsPage } from "./inventory";
import { DeviationBoardPage, NewDeviationPage, DeviationDetailPage, DefectItemsPage } from "./defects";
import { RequestListPage, RequestDetailPage } from "./borrow-requests";
import { StockMovementsPage, StockMovementDetailPage } from "./stock-movements";
import { CountRequestsPage } from "./count-adjustments";

export const storeRoutes = (
  <>
    {/* Core store operations — guarded on `stock:view`, matching the sidebar so a
        hidden entry is also unreachable by URL. */}
    <Route element={<RequirePermission perform={STOCK_VIEW} />}>
      <Route path="receiving" element={<ReceivingListPage />} />
      <Route path="receiving/new" element={<NewReceivalPage />} />
      <Route path="receiving/:id" element={<ReceivalDetailPage />} />

      <Route path="issuing" element={<IssueListPage />} />
      <Route path="issuing/new" element={<NewIssuePage />} />
      <Route path="issuing/:id" element={<IssueDetailPage />} />

      <Route path="store" element={<ItemsPage />} />
      <Route path="store/suppliers" element={<SuppliersPage />} />

      <Route path="movements" element={<StockMovementsPage />} />
      <Route path="movements/detail" element={<StockMovementDetailPage />} />

      <Route path="warnings" element={<WarningsPage />} />

      <Route path="requests" element={<RequestListPage />} />
      <Route path="requests/:id" element={<RequestDetailPage />} />
    </Route>

    {/* Defects — reported by store keepers, reviewed by QA; both need the board. */}
    <Route element={<RequirePermission perform={DEFECT_VIEW} />}>
      <Route path="defects" element={<DeviationBoardPage />} />
      <Route path="defects/new" element={<NewDeviationPage />} />
      <Route path="defects/:id" element={<DeviationDetailPage />} />
    </Route>
    <Route element={<RequirePermission perform={DASHBOARD_ADMIN} />}>
      <Route path="defects/items" element={<DefectItemsPage />} />
    </Route>

    <Route element={<RequirePermission perform={COUNT_REQUEST} />}>
      <Route path="count-requests" element={<CountRequestsPage />} />
    </Route>
  </>
);
