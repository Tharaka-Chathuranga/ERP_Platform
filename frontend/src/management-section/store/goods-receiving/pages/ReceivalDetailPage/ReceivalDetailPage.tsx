import { Button, Text } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@ui/layout/PageHeader";
import { QueryBoundary } from "@ui/feedback/QueryBoundary";
import { useReceivalDetail } from "./hooks/use-receival-detail";
import { ReceivalDetailCard } from "./receival-detail-card";

export function ReceivalDetailPage() {
  const navigate = useNavigate();
  const { receivalQuery, suppliersQuery, grnQuery, search, setSearch } = useReceivalDetail();
  const receival = receivalQuery.data;

  return (
    <div>
      <PageHeader
        title={receival?.receivalNumber ?? "Receival"}
        actions={
          <Button
            variant="default"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => navigate("/receiving")}
          >
            Back
          </Button>
        }
      />

      <QueryBoundary
        loading={receivalQuery.isLoading}
        error={receivalQuery.error}
        isEmpty={!receival}
        empty={<Text>Not found.</Text>}
      >
        {receival && (
          <ReceivalDetailCard
            receival={receival}
            suppliers={suppliersQuery.data}
            grn={grnQuery.data}
            search={search}
            onSearchChange={setSearch}
          />
        )}
      </QueryBoundary>
    </div>
  );
}
