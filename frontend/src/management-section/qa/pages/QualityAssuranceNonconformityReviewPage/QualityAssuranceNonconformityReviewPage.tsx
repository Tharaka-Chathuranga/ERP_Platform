import { PageHeader } from "@ui/layout/PageHeader";
import { useNonconformityReview } from "./hooks/use-nonconformity-review";
import { NonconformityReviewTable } from "./nonconformity-review-table";

export function QualityAssuranceNonconformityReviewPage() {
  const {
    navigate,
    search,
    setSearch,
    stageFilter,
    setStageFilter,
    statusFilter,
    setStatusFilter,
    userLabel,
    rows,
    isLoading,
    error,
  } = useNonconformityReview();

  return (
    <div>
      <PageHeader title="Nonconformity review" />

      <NonconformityReviewTable
        rows={rows}
        isLoading={isLoading}
        error={error}
        search={search}
        setSearch={setSearch}
        stageFilter={stageFilter}
        setStageFilter={setStageFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        userLabel={userLabel}
        onRowClick={(d) => navigate(`/nonconformities/${d.id}`)}
      />
    </div>
  );
}
