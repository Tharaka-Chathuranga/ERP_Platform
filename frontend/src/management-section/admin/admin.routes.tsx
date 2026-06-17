import { Route } from "react-router-dom";
import { AdminOverviewPage } from "./overview/AdminOverviewPage";
import { AdminStorePage } from "./store/AdminStorePage";
import { SuppliersAdminPage } from "./suppliers/SuppliersAdminPage";
import { UserDetailPage } from "./users/UserDetailPage";
import { UserListPage } from "./users/UserListPage";

/** Admin section route subtree. Mounted under the RequireAdmin guard in App. */
export const adminRoutes = (
  <>
    <Route path="admin" element={<AdminOverviewPage />} />
    <Route path="admin/store" element={<AdminStorePage />} />
    <Route path="admin/users" element={<UserListPage />} />
    <Route path="admin/users/:id" element={<UserDetailPage />} />
    <Route path="admin/suppliers" element={<SuppliersAdminPage />} />
  </>
);
