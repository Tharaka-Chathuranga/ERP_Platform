import { Route } from "react-router-dom";
import { RequirePermission } from "@auth/RequirePermission";
import { OILMART_VIEW } from "@auth/permissions";
import {
  NewOilMartQuotationPage,
  NewOilMartReceiptPage,
  OilMartClientDetailPage,
  OilMartClientsPage,
  OilMartItemDetailPage,
  OilMartItemsPage,
  OilMartOverviewPage,
  OilMartQuotationDetailPage,
  OilMartQuotationsPage,
  OilMartReceiptDetailPage,
  OilMartReceiptsPage,
  OilMartStockPage,
  OilMartSuppliersPage,
} from "./index";

export const oilMartRoutes = (
  <Route element={<RequirePermission perform={OILMART_VIEW} />}>
    <Route path="oil-mart" element={<OilMartOverviewPage />} />
    <Route path="oil-mart/items" element={<OilMartItemsPage />} />
    <Route path="oil-mart/items/:itemId" element={<OilMartItemDetailPage />} />
    <Route path="oil-mart/suppliers" element={<OilMartSuppliersPage />} />
    <Route path="oil-mart/clients" element={<OilMartClientsPage />} />
    <Route path="oil-mart/clients/:clientId" element={<OilMartClientDetailPage />} />
    <Route path="oil-mart/stock" element={<OilMartStockPage />} />
    <Route path="oil-mart/receipts" element={<OilMartReceiptsPage />} />
    <Route path="oil-mart/receipts/new" element={<NewOilMartReceiptPage />} />
    <Route path="oil-mart/receipts/:receiptId" element={<OilMartReceiptDetailPage />} />
    <Route path="oil-mart/quotations" element={<OilMartQuotationsPage />} />
    <Route path="oil-mart/quotations/new" element={<NewOilMartQuotationPage />} />
    <Route path="oil-mart/quotations/:quotationId" element={<OilMartQuotationDetailPage />} />
    <Route
      path="oil-mart/quotations/:quotationId/edit"
      element={<NewOilMartQuotationPage />}
    />
  </Route>
);
