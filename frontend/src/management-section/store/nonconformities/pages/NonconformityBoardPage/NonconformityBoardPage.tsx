import { useNavigate } from "react-router-dom";
import { PageHeader } from "@ui/layout/PageHeader";
import { useNonconformityBoard } from "./hooks/use-nonconformity-board";
import { NonconformityBoardToolbar } from "./nonconformity-board-toolbar";
import { NonconformityBoard } from "./nonconformity-board";

export function NonconformityBoardPage() {
  const navigate = useNavigate();
  const { filters, setStatus, setDateRange } = useNonconformityBoard();

  return (
    <div>
      <PageHeader title="Nonconformity reports" />

      <NonconformityBoardToolbar
        status={filters.status}
        onStatusChange={setStatus}
        dateRange={filters.dateRange}
        onDateRangeChange={setDateRange}
        onCreate={() => navigate("/nonconformities/new")}
      />

      <NonconformityBoard filters={filters} />
    </div>
  );
}
