import { Button, Group, Loader, Text } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { PageHeader } from "@ui/layout/PageHeader";
import { NcrProgress } from "../../components";
import { useNonconformityDetail } from "./hooks/use-nonconformity-detail";
import { NonconformityDetailCard } from "./nonconformity-detail-card";
import { DispositionModal } from "./disposition-modal";
import { NoteModal } from "./note-modal";

export function NonconformityDetailPage() {
  const {
    navigate,
    canReview,
    ncrQuery,
    ncr,
    siblingIds,
    currentIndex,
    prevId,
    nextId,
    startReview,
    disposition,
    reject,
    closeReport,
    dispositionOpen,
    setDispositionOpen,
    rejectOpen,
    setRejectOpen,
    closeOpen,
    setCloseOpen,
  } = useNonconformityDetail();

  if (ncrQuery.isLoading) return <Loader />;
  if (!ncr) return <Text>Not found.</Text>;

  return (
    <div>
      <PageHeader title="Nonconformity report" />

      <Group mb="md">
        <Button variant="default" leftSection={<IconChevronLeft size={16} />} onClick={() => navigate("/nonconformities")}>
          Back
        </Button>
      </Group>

      <NcrProgress status={ncr.status} mb="lg" />

      <NonconformityDetailCard
        ncr={ncr}
        canReview={canReview}
        onStartReview={() => startReview.mutate()}
        startReviewPending={startReview.isPending}
        onOpenReject={() => setRejectOpen(true)}
        onOpenDisposition={() => setDispositionOpen(true)}
        onOpenClose={() => setCloseOpen(true)}
      />

      <Group justify="space-between">
        <Button variant="default" leftSection={<IconChevronLeft size={16} />} disabled={!prevId} onClick={() => prevId && navigate(`/nonconformities/${prevId}`)}>
          Previous
        </Button>
        <Text size="sm" c="dimmed">
          {currentIndex >= 0 ? `${currentIndex + 1} of ${siblingIds.length}` : ""}
        </Text>
        <Button variant="default" rightSection={<IconChevronRight size={16} />} disabled={!nextId} onClick={() => nextId && navigate(`/nonconformities/${nextId}`)}>
          Next
        </Button>
      </Group>

      <DispositionModal
        opened={dispositionOpen}
        onClose={() => setDispositionOpen(false)}
        submitting={disposition.isPending}
        onSubmit={(type, note) => disposition.mutate({ type, note })}
      />
      <NoteModal
        opened={rejectOpen}
        onClose={() => setRejectOpen(false)}
        title="Reject nonconformity"
        label="Reason for rejection"
        confirmLabel="Reject"
        confirmColor="red"
        submitting={reject.isPending}
        onSubmit={(note) => reject.mutate(note)}
      />
      <NoteModal
        opened={closeOpen}
        onClose={() => setCloseOpen(false)}
        title="Verify & close"
        label="Verification of conformity (ISO 8.7.1)"
        confirmLabel="Close report"
        submitting={closeReport.isPending}
        onSubmit={(note) => closeReport.mutate(note)}
      />
    </div>
  );
}
