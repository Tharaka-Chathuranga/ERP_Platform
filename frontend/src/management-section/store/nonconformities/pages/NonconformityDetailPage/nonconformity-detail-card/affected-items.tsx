import { useState } from "react";
import { DataTable, TableToolbar, type Column } from "@ui/data";
import { useItemLabels } from "@core/hooks/useLookups";
import type { NonconformityItem } from "@core/types";

export function AffectedItems({ items }: { items: NonconformityItem[] }) {
  const itemLabel = useItemLabels();
  const [search, setSearch] = useState("");

  const columns: Column<NonconformityItem>[] = [
    { header: "Item", emphasis: true, render: (it) => itemLabel(it.itemId) },
    { header: "Quantity", align: "right", render: (it) => it.quantity },
  ];

  return (
    <>
      <TableToolbar search={{ value: search, onChange: setSearch, placeholder: "Search item…" }} />
      <DataTable
        withCard={false}
        columns={columns}
        data={items.filter((it) => {
          const term = search.trim().toLowerCase();
          return !term || itemLabel(it.itemId).toLowerCase().includes(term);
        })}
        rowKey={(it) => it.itemId}
      />
    </>
  );
}
