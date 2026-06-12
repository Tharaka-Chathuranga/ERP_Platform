import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import { AppLayout } from "./components/AppLayout";
import { LoginPage } from "./pages/LoginPage";
import { DashboardHome } from "./features/dashboard/DashboardHome";
import { ReceivingListPage } from "./features/receiving/ReceivingListPage";
import { NewReceivalPage } from "./features/receiving/NewReceivalPage";
import { ReceivalDetailPage } from "./features/receiving/ReceivalDetailPage";
import { IssueListPage } from "./features/issuing/IssueListPage";
import { NewIssuePage } from "./features/issuing/NewIssuePage";
import { IssueDetailPage } from "./features/issuing/IssueDetailPage";
import { ItemsPage } from "./features/store/ItemsPage";
import { SuppliersPage } from "./features/store/SuppliersPage";
import { DeviationBoardPage } from "./features/defects/DeviationBoardPage";
import { NewDeviationPage } from "./features/defects/NewDeviationPage";
import { DeviationDetailPage } from "./features/defects/DeviationDetailPage";
import { RequestListPage } from "./features/requests/RequestListPage";
import { RequestDetailPage } from "./features/requests/RequestDetailPage";
import type { ReactNode } from "react";

function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardHome />} />

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
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
