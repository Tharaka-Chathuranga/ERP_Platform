import { Button, Text } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@ui/layout/PageHeader";
import { QueryBoundary } from "@ui/feedback/QueryBoundary";
import { TableToolbar } from "@ui/data";
import { useItemDetail } from "./hooks/use-item-detail";
import { ItemDetailCard } from "./item-detail-card";
import { ItemEditModal } from "../../components/ItemEditModal";

export function ItemDetailPage() {
  const navigate = useNavigate();
  const { canEdit, editing, setEditing, item, isLoading, error } = useItemDetail();

  return (
    <div>
      <PageHeader title={item?.itemCode ?? "Item"} />

      <TableToolbar
        leftSection={
          <Button variant="default" leftSection={<IconArrowLeft size={16} />} onClick={() => navigate("/store")}>
            Back to items
          </Button>
        }
        actions={
          canEdit && item ? (
            <Button variant="default" onClick={() => setEditing(true)}>
              Edit
            </Button>
          ) : undefined
        }
      />

      <QueryBoundary loading={isLoading} error={error} isEmpty={!item} empty={<Text>Not found.</Text>}>
        {item && <ItemDetailCard item={item} />}
      </QueryBoundary>

      <ItemEditModal item={editing ? item ?? null : null} onClose={() => setEditing(false)} />
    </div>
  );
}
