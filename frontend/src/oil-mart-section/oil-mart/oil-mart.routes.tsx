import { Route } from "react-router-dom";
import { RequirePermission } from "@auth/RequirePermission";
import { OILMART_VIEW } from "@auth/permissions";
import {
  NewOilMartReceiptPage,
  NewOilMartSalePage,
  OilMartClientDetailPage,
  OilMartClientsPage,
  OilMartItemDetailPage,
  OilMartItemsPage,
  OilMartOverviewPage,
  OilMartReceiptDetailPage,
  OilMartReceiptsPage,
  OilMartSaleDetailPage,
  OilMartSalesPage,
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
    <Route path="oil-mart/sales" element={<OilMartSalesPage />} />
    <Route path="oil-mart/sales/new" element={<NewOilMartSalePage />} />
    <Route path="oil-mart/sales/:saleId" element={<OilMartSaleDetailPage />} />
  </Route>
);
