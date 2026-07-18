import { Route } from "react-router-dom";
import { RequirePermission } from "@auth/RequirePermission";
import { STOCK_VIEW, NCR_VIEW, DASHBOARD_ADMIN, COUNT_REQUEST } from "@auth/permissions";
import { ReceivingListPage, NewReceivalPage, ReceivalDetailPage } from "./goods-receiving";
import { IssueListPage, NewIssuePage, IssueDetailPage } from "./goods-issuing";
import { ItemsPage, ItemDetailPage, SuppliersPage, WarningsPage } from "./inventory";
import { NonconformityBoardPage, NewNonconformityPage, NonconformityDetailPage, NonconformityItemsPage } from "./nonconformities";
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
      <Route path="store/:id" element={<ItemDetailPage />} />
      <Route path="store/suppliers" element={<SuppliersPage />} />

      <Route path="movements" element={<StockMovementsPage />} />
      <Route path="movements/detail" element={<StockMovementDetailPage />} />

      <Route path="warnings" element={<WarningsPage />} />

      <Route path="requests" element={<RequestListPage />} />
      <Route path="requests/:id" element={<RequestDetailPage />} />
    </Route>

    {/* Nonconformities — raised by store keepers, reviewed by QA; both need the board. */}
    <Route element={<RequirePermission perform={NCR_VIEW} />}>
      <Route path="nonconformities" element={<NonconformityBoardPage />} />
      <Route path="nonconformities/new" element={<NewNonconformityPage />} />
      <Route path="nonconformities/:id" element={<NonconformityDetailPage />} />
    </Route>
    <Route element={<RequirePermission perform={DASHBOARD_ADMIN} />}>
      <Route path="nonconformities/items" element={<NonconformityItemsPage />} />
    </Route>

    <Route element={<RequirePermission perform={COUNT_REQUEST} />}>
      <Route path="count-requests" element={<CountRequestsPage />} />
    </Route>
  </>
);
