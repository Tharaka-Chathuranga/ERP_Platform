import { Route } from "react-router-dom";
import { RequirePermission } from "@auth/RequirePermission";
import { ReceivingListPage, NewReceivalPage, ReceivalDetailPage } from "./goods-receiving";
import { IssueListPage, NewIssuePage, IssueDetailPage } from "./goods-issuing";
import { ItemsPage, SuppliersPage, WarningsPage } from "./inventory";
import { DeviationBoardPage, NewDeviationPage, DeviationDetailPage, DefectItemsPage } from "./defects";
import { RequestListPage, RequestDetailPage } from "./borrow-requests";
import { StockMovementsPage, StockMovementDetailPage } from "./stock-movements";
import { CountRequestsPage } from "./count-adjustments";

export const storeRoutes = (
  <>
    <Route path="receiving" element={<ReceivingListPage />} />
    <Route path="receiving/new" element={<NewReceivalPage />} />
    <Route path="receiving/:id" element={<ReceivalDetailPage />} />

    <Route path="issuing" element={<IssueListPage />} />
    <Route path="issuing/new" element={<NewIssuePage />} />
    <Route path="issuing/:id" element={<IssueDetailPage />} />

    <Route path="store" element={<ItemsPage />} />
    <Route path="store/suppliers" element={<SuppliersPage />} />

    <Route path="defects" element={<DeviationBoardPage />} />
    <Route path="defects/new" element={<NewDeviationPage />} />
    <Route element={<RequirePermission perform="dashboard:admin" />}>
      <Route path="defects/items" element={<DefectItemsPage />} />
    </Route>
    <Route path="defects/:id" element={<DeviationDetailPage />} />

    <Route path="movements" element={<StockMovementsPage />} />
    <Route path="movements/detail" element={<StockMovementDetailPage />} />

    <Route element={<RequirePermission perform="stock:view" />}>
      <Route path="warnings" element={<WarningsPage />} />
    </Route>
    <Route element={<RequirePermission perform="count:request" />}>
      <Route path="count-requests" element={<CountRequestsPage />} />
    </Route>

    <Route path="requests" element={<RequestListPage />} />
    <Route path="requests/:id" element={<RequestDetailPage />} />
  </>
);
