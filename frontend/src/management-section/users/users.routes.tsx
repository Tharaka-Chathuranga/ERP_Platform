import { Route } from "react-router-dom";
import { RequirePermission } from "@auth/RequirePermission";
import { USER_MANAGE } from "@auth/permissions";
import { UserDetailPage } from "./pages/UserDetailPage";
import { UserListPage } from "./pages/UserListPage";

/** User-management routes, guarded by the `user:manage` permission. */
export const usersRoutes = (
  <Route element={<RequirePermission perform={USER_MANAGE} />}>
    <Route path="users" element={<UserListPage />} />
    <Route path="users/:id" element={<UserDetailPage />} />
  </Route>
);
