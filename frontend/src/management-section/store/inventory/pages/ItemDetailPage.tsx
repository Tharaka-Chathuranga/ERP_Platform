import { useState } from "react";
import { Button, Card, Text } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@ui/layout/PageHeader";
import { QueryBoundary } from "@ui/feedback/QueryBoundary";
import { TableToolbar } from "@ui/data";
import { useCan } from "@auth/useCan";
import { ITEM_EDIT } from "@auth/permissions";
import { getItem } from "@store/inventory/items.api";
import { ItemEditModal } from "./ItemEditModal";
import { StockPanel } from "./StockPanel";

export function ItemDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const can = useCan();
  const canEdit = can(ITEM_EDIT);
  const [editing, setEditing] = useState(false);

  const { data: item, isLoading, error } = useQuery({
    queryKey: ["item", id],
    queryFn: () => getItem(id),
  });

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
        {item && (
          <Card withBorder radius="md" padding="lg">
            <StockPanel item={item} />
          </Card>
        )}
      </QueryBoundary>

      <ItemEditModal item={editing ? item ?? null : null} onClose={() => setEditing(false)} />
    </div>
  );
}
