import { Box, Card, Checkbox, Collapse, Table } from "@mantine/core";
import { Fragment, useMemo, useState, type ReactNode } from "react";
import { QueryBoundary } from "@ui/feedback/QueryBoundary";

export interface Column<T> {
  header: ReactNode;
  render: (row: T) => ReactNode;
  width?: number | string;
  align?: "left" | "center" | "right";
  emphasis?: boolean;
}

export interface Selection<T> {
  /** Currently selected row keys. */
  selected: Set<string>;
  /** Called with the next selection whenever it changes. */
  onChange: (next: Set<string>) => void;
  /** Optional per-row guard; rows returning false can't be selected. */
  selectable?: (row: T) => boolean;
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
  /** Pass to render a leading checkbox column with select-all support. */
  selection?: Selection<T>;
  /** Highlights the row whose key matches (master/detail selection). */
  activeRowKey?: string;
  /** Returns a background CSS value for a given row; ignored when activeRowKey matches. */
  rowBg?: (row: T) => string | undefined;
  /** Returns content to show in a collapsible detail row revealed on hover. */
  expandOnHover?: (row: T) => ReactNode;
}

// Dimmed, uppercase column headers — the shared list-table look.
const TH = { c: "dimmed", fz: "xs", tt: "uppercase", fw: 600 } as const;

export function DataTable<T>({
  columns,
  data,
  rowKey,
  onRowClick,
  loading,
  error,
  empty,
  withCard = true,
  selection,
  activeRowKey,
  rowBg,
  expandOnHover,
}: DataTableProps<T>) {
  const rows = data ?? [];
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const totalCols = columns.length + (selection ? 1 : 0);
  const selectableRows = useMemo(
    () => (selection?.selectable ? rows.filter(selection.selectable) : rows),
    [rows, selection],
  );
  const allSelected =
    !!selection && selectableRows.length > 0 && selectableRows.every((r) => selection.selected.has(rowKey(r)));
  const someSelected =
    !!selection && selectableRows.some((r) => selection.selected.has(rowKey(r))) && !allSelected;

  const toggleAll = () =>
    selection?.onChange(allSelected ? new Set() : new Set(selectableRows.map(rowKey)));
  const toggleOne = (key: string) => {
    if (!selection) return;
    const next = new Set(selection.selected);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    selection.onChange(next);
  };

  const table = (
    <QueryBoundary loading={loading} error={error} isEmpty={rows.length === 0} empty={empty}>
      <Box style={{ overflowX: "auto" }}>
        <Table
          highlightOnHover={!!onRowClick || !!expandOnHover}
          verticalSpacing="md"
          horizontalSpacing="lg"
          withRowBorders
          style={{ minWidth: 480 }}
        >
          <Table.Thead>
            <Table.Tr>
              {selection && (
                <Table.Th w={48}>
                  <Checkbox
                    aria-label="Select all"
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={toggleAll}
                  />
                </Table.Th>
              )}
              {columns.map((c, i) => (
                <Table.Th key={i} w={c.width} ta={c.align} {...TH}>
                  {c.header}
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.map((row) => {
              const key = rowKey(row);
              const canSelect = !selection?.selectable || selection.selectable(row);
              return (
                <Fragment key={key}>
                  <Table.Tr
                    bg={activeRowKey === key ? "var(--mantine-color-brand-light)" : rowBg?.(row)}
                    style={onRowClick ? { cursor: "pointer" } : undefined}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    onMouseEnter={expandOnHover ? () => setHoveredKey(key) : undefined}
                    onMouseLeave={expandOnHover ? (e) => {
                      const rel = e.relatedTarget as HTMLElement | null;
                      if (!rel?.closest?.(`[data-expand-key="${key}"]`)) setHoveredKey(null);
                    } : undefined}
                  >
                    {selection && (
                      <Table.Td onClick={(e) => e.stopPropagation()}>
                        {canSelect && (
                          <Checkbox
                            aria-label="Select row"
                            checked={selection.selected.has(key)}
                            onChange={() => toggleOne(key)}
                          />
                        )}
                      </Table.Td>
                    )}
                    {columns.map((c, i) => (
                      <Table.Td key={i} fw={c.emphasis ? 600 : undefined} ta={c.align}>
                        {c.render(row)}
                      </Table.Td>
                    ))}
                  </Table.Tr>
                  {expandOnHover && (
                    <Table.Tr
                      data-expand-key={key}
                      onMouseEnter={() => setHoveredKey(key)}
                      onMouseLeave={() => setHoveredKey(null)}
                    >
                      <Table.Td colSpan={totalCols} p={0}>
                        <Collapse in={hoveredKey === key}>
                          {expandOnHover(row)}
                        </Collapse>
                      </Table.Td>
                    </Table.Tr>
                  )}
                </Fragment>
              );
            })}
          </Table.Tbody>
        </Table>
      </Box>
    </QueryBoundary>
  );

  return withCard ? (
    <Card withBorder radius="md" padding={0}>
      {table}
    </Card>
  ) : (
    table
  );
}
