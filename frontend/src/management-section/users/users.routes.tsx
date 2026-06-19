import { Route } from "react-router-dom";
import { RequirePermission } from "@auth/RequirePermission";
import { UserDetailPage } from "./UserDetailPage";
import { UserListPage } from "./UserListPage";

/** User-management routes, guarded by the `user:manage` permission. */
export const usersRoutes = (
  <Route element={<RequirePermission perform="user:manage" />}>
    <Route path="users" element={<UserListPage />} />
    <Route path="users/:id" element={<UserDetailPage />} />
  </Route>
);
