import { useState } from "react";
import { Anchor, Badge, Button, Card, Grid, Group, Text, TextInput } from "@mantine/core";
import { IconBuildingStore, IconPlus, IconSearch } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@ui/layout/PageHeader";
import { EmptyState } from "@ui/feedback/EmptyState";
import { DataTable, type Column } from "@ui/data";
import { useCan } from "@auth/useCan";
import { qk } from "@core/queryKeys";
import { notifyError, notifySuccess } from "@core/notify";
import { deactivateItem, listItems } from "@store/inventory/items.api";
import type { Item } from "@core/types";
import { StockPanel } from "./StockPanel";
import { CreateItemModal } from "./CreateItemModal";
import { ItemEditModal } from "./ItemEditModal";

export function ItemsPage() {
  const can = useCan();
  const canEdit = can("item:edit");
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Item | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);

  const items = useQuery({
    queryKey: ["items", search],
    queryFn: () => listItems(search || undefined),
  });

  const deactivate = useMutation({
    mutationFn: (id: string) => deactivateItem(id),
    onSuccess: () => {
      notifySuccess("Item deactivated");
      qc.invalidateQueries({ queryKey: ["items"] });
      qc.invalidateQueries({ queryKey: qk.adminSummary() });
    },
    onError: notifyError,
  });

  const columns: Column<Item>[] = [
    { header: "Code", emphasis: true, render: (i) => i.itemCode },
    { header: "Name", render: (i) => i.name },
    { header: "UoM", render: (i) => i.unitOfMeasure },
    {
      header: "Flags",
      render: (i) => (
        <Group gap={4}>
          {i.criticalItem && (
            <Badge size="xs" color="red" variant="light">
              Critical
            </Badge>
          )}
          {i.approvalRequiredForIssue && (
            <Badge size="xs" color="yellow" variant="light">
              Approval
            </Badge>
          )}
        </Group>
      ),
    },
  ];

  if (canEdit) {
    columns.push({
      header: "",
      align: "right",
      render: (i) => (
        <Group gap="xs" justify="flex-end" wrap="nowrap" onClick={(e) => e.stopPropagation()}>
          <Anchor component="button" type="button" onClick={() => setEditing(i)}>
            Edit
          </Anchor>
          {i.status === "ACTIVE" && (
            <Anchor component="button" type="button" c="red" onClick={() => deactivate.mutate(i.id)}>
              Deactivate
            </Anchor>
          )}
        </Group>
      ),
    });
  }

  return (
    <div>
      <PageHeader
        title="Store"
        actions={
          <Group>
            <Button
              variant="default"
              leftSection={<IconBuildingStore size={16} />}
              onClick={() => navigate("/store/suppliers")}
            >
              Suppliers
            </Button>
            {canEdit && (
              <Button leftSection={<IconPlus size={16} />} onClick={() => setCreateOpen(true)}>
                New item
              </Button>
            )}
          </Group>
        }
      />

      <Grid align="flex-start">
        <Grid.Col span={{ base: 12, md: 7 }}>
          <TextInput
            leftSection={<IconSearch size={16} />}
            placeholder="Search item code or name…"
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            mb="md"
          />
          <DataTable
            columns={columns}
            data={items.data?.content}
            rowKey={(i) => i.id}
            onRowClick={setSelected}
            activeRowKey={selected?.id}
            loading={items.isLoading}
            error={items.error}
            empty={<EmptyState title="No items" description="Create an item to start tracking stock." />}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 5 }}>
          <Card withBorder radius="md" padding="lg">
            {selected ? (
              <StockPanel item={selected} />
            ) : (
              <Text c="dimmed">Select an item to view stock and post movements.</Text>
            )}
          </Card>
        </Grid.Col>
      </Grid>

      <CreateItemModal opened={createOpen} onClose={() => setCreateOpen(false)} />
      <ItemEditModal item={editing} onClose={() => setEditing(null)} />
    </div>
  );
}
