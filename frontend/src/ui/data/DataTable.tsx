import { Card, Table } from "@mantine/core";
import type { ReactNode } from "react";
import { QueryBoundary } from "@ui/feedback/QueryBoundary";

export interface Column<T> {
  header: ReactNode;
  render: (row: T) => ReactNode;
  width?: number | string;
  align?: "left" | "center" | "right";
  emphasis?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[] | undefined;
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  loading?: boolean;
  error?: unknown;
  empty?: ReactNode;
  withCard?: boolean;
}

export function DataTable<T>({
  columns,
  data,
  rowKey,
  onRowClick,
  loading,
  error,
  empty,
  withCard = true,
}: DataTableProps<T>) {
  const table = (
    <QueryBoundary loading={loading} error={error} isEmpty={!data || data.length === 0} empty={empty}>
      <Table highlightOnHover={!!onRowClick}>
        <Table.Thead>
          <Table.Tr>
            {columns.map((c, i) => (
              <Table.Th key={i} w={c.width} ta={c.align}>
                {c.header}
              </Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {data?.map((row) => (
            <Table.Tr
              key={rowKey(row)}
              style={onRowClick ? { cursor: "pointer" } : undefined}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns.map((c, i) => (
                <Table.Td key={i} fw={c.emphasis ? 600 : undefined} ta={c.align}>
                  {c.render(row)}
                </Table.Td>
              ))}
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </QueryBoundary>
  );

  return withCard ? (
    <Card withBorder radius="md" padding="lg">
      {table}
    </Card>
  ) : (
    table
  );
}
