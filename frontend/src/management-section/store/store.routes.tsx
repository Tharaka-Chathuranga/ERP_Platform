import { Route } from "react-router-dom";
import { ReceivingListPage, NewReceivalPage, ReceivalDetailPage } from "./goods-receiving";
import { IssueListPage, NewIssuePage, IssueDetailPage } from "./goods-issuing";
import { ItemsPage, SuppliersPage } from "./inventory";
import { DeviationBoardPage, NewDeviationPage, DeviationDetailPage } from "./defects";
import { RequestListPage, RequestDetailPage } from "./borrow-requests";

/** Route subtree owned by the Store management section. The app shell mounts
 *  this under the authenticated AppLayout — the section decides its own paths. */
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
    <Route path="defects/:id" element={<DeviationDetailPage />} />

    <Route path="requests" element={<RequestListPage />} />
    <Route path="requests/:id" element={<RequestDetailPage />} />
  </>
);
