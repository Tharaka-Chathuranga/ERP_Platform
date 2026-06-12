import { useState } from "react";
import {
  Badge,
  Button,
  Card,
  Grid,
  Group,
  Loader,
  Table,
  Text,
  TextInput,
} from "@mantine/core";
import { IconBuildingStore, IconPlus, IconSearch } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../components/PageHeader";
import { EmptyState } from "../../components/EmptyState";
import { useAuth } from "../../auth/AuthContext";
import { listItems } from "../../api/store/items";
import type { Item } from "../../types";
import { StockPanel } from "./StockPanel";
import { CreateItemModal } from "./CreateItemModal";

export function ItemsPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Item | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const items = useQuery({
    queryKey: ["items", search],
    queryFn: () => listItems(search || undefined),
  });

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
            {isAdmin && (
              <Button leftSection={<IconPlus size={16} />} onClick={() => setCreateOpen(true)}>
                New item
              </Button>
            )}
          </Group>
        }
      />

      <Grid align="flex-start">
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Card withBorder radius="md" padding="lg">
            <TextInput
              leftSection={<IconSearch size={16} />}
              placeholder="Search item code or name…"
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              mb="md"
            />
            {items.isLoading ? (
              <Loader />
            ) : !items.data || items.data.content.length === 0 ? (
              <EmptyState title="No items" description="Create an item to start tracking stock." />
            ) : (
              <Table highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Code</Table.Th>
                    <Table.Th>Name</Table.Th>
                    <Table.Th>UoM</Table.Th>
                    <Table.Th>Flags</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {items.data.content.map((item) => (
                    <Table.Tr
                      key={item.id}
                      bg={selected?.id === item.id ? "var(--mantine-color-brand-0)" : undefined}
                      style={{ cursor: "pointer" }}
                      onClick={() => setSelected(item)}
                    >
                      <Table.Td fw={600}>{item.itemCode}</Table.Td>
                      <Table.Td>{item.name}</Table.Td>
                      <Table.Td>{item.unitOfMeasure}</Table.Td>
                      <Table.Td>
                        <Group gap={4}>
                          {item.criticalItem && (
                            <Badge size="xs" color="red" variant="light">
                              Critical
                            </Badge>
                          )}
                          {item.approvalRequiredForIssue && (
                            <Badge size="xs" color="yellow" variant="light">
                              Approval
                            </Badge>
                          )}
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
          </Card>
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
    </div>
  );
}
