import { useState } from "react";
import { Button, Card, Group, Text } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@ui/layout/PageHeader";
import { QueryBoundary } from "@ui/feedback/QueryBoundary";
import { TableToolbar } from "@ui/data";
import { useCan } from "@auth/useCan";
import { ITEM_EDIT } from "@auth/permissions";
import { qk } from "@core/queryKeys";
import { notifyError, notifySuccess } from "@core/notify";
import { deactivateItem, getItem } from "@store/inventory/items.api";
import { ItemEditModal } from "./ItemEditModal";
import { StockPanel } from "./StockPanel";

export function ItemDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const can = useCan();
  const canEdit = can(ITEM_EDIT);
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);

  const { data: item, isLoading, error } = useQuery({
    queryKey: ["item", id],
    queryFn: () => getItem(id),
  });

  const deactivate = useMutation({
    mutationFn: () => deactivateItem(id),
    onSuccess: () => {
      notifySuccess("Item deactivated");
      qc.invalidateQueries({ queryKey: ["items"] });
      qc.invalidateQueries({ queryKey: ["item", id] });
      qc.invalidateQueries({ queryKey: qk.adminSummary() });
      navigate("/store");
    },
    onError: notifyError,
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
            <Group gap="xs">
              <Button variant="default" onClick={() => setEditing(true)}>
                Edit
              </Button>
              {item.status === "ACTIVE" && (
                <Button color="red" variant="light" loading={deactivate.isPending} onClick={() => deactivate.mutate()}>
                  Deactivate
                </Button>
              )}
            </Group>
          ) : undefined
        }
      />

      <QueryBoundary loading={isLoading} error={error} isEmpty={!item} empty={<Text>Not found.</Text>}>
        {item && (
          <Card withBorder radius="md" padding="lg">
            <StockPanel item={item} showHeader={false} />
          </Card>
        )}
      </QueryBoundary>

      <ItemEditModal item={editing ? item ?? null : null} onClose={() => setEditing(false)} />
    </div>
  );
}
