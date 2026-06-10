import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createItem,
  getStockLevels,
  listItems,
  listWarehouses,
  postMovement,
} from "../api/store";
import { apiErrorMessage } from "../api/client";
import type { Item, MovementType } from "../types";

export function ItemsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Item | null>(null);

  const itemsQuery = useQuery({
    queryKey: ["items", search],
    queryFn: () => listItems(search || undefined),
  });

  return (
    <div className="grid">
      <section className="card">
        <div className="card-head">
          <h2>Items</h2>
          <input
            placeholder="Search SKU or name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {itemsQuery.isLoading && <p className="muted">Loading…</p>}
        {itemsQuery.isError && <p className="error">{apiErrorMessage(itemsQuery.error)}</p>}

        <table className="table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Name</th>
              <th>UoM</th>
              <th>Reorder</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {itemsQuery.data?.content.map((item) => (
              <tr
                key={item.id}
                className={selected?.id === item.id ? "row selected" : "row"}
                onClick={() => setSelected(item)}
              >
                <td>{item.sku}</td>
                <td>{item.name}</td>
                <td>{item.unitOfMeasure}</td>
                <td>{item.reorderLevel}</td>
                <td>{item.status}</td>
              </tr>
            ))}
            {itemsQuery.data?.content.length === 0 && (
              <tr>
                <td colSpan={5} className="muted">No items yet — create one.</td>
              </tr>
            )}
          </tbody>
        </table>

        <CreateItemForm onCreated={() => qc.invalidateQueries({ queryKey: ["items"] })} />
      </section>

      <section className="card">
        <h2>{selected ? `Stock — ${selected.sku}` : "Stock"}</h2>
        {!selected && <p className="muted">Select an item to view stock and post movements.</p>}
        {selected && <StockPanel item={selected} />}
      </section>
    </div>
  );
}

function CreateItemForm({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [uom, setUom] = useState("EACH");
  const [reorder, setReorder] = useState("0");
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      createItem({
        sku,
        name,
        unitOfMeasure: uom,
        valuationMethod: "WEIGHTED_AVERAGE",
        reorderLevel: Number(reorder),
      }),
    onSuccess: () => {
      setSku(""); setName(""); setReorder("0"); setError(null); setOpen(false);
      onCreated();
    },
    onError: (e) => setError(apiErrorMessage(e)),
  });

  if (!open) {
    return <button className="link" onClick={() => setOpen(true)}>+ New item</button>;
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    mutation.mutate();
  }

  return (
    <form className="subform" onSubmit={onSubmit}>
      <h3>New item</h3>
      <div className="form-row">
        <input placeholder="SKU" value={sku} onChange={(e) => setSku(e.target.value)} required />
        <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="form-row">
        <input placeholder="Unit (EACH, KG…)" value={uom} onChange={(e) => setUom(e.target.value)} required />
        <input placeholder="Reorder level" type="number" value={reorder} onChange={(e) => setReorder(e.target.value)} />
      </div>
      {error && <div className="error">{error}</div>}
      <div className="form-actions">
        <button type="submit" disabled={mutation.isPending}>Create</button>
        <button type="button" className="link" onClick={() => setOpen(false)}>Cancel</button>
      </div>
    </form>
  );
}

function StockPanel({ item }: { item: Item }) {
  const qc = useQueryClient();
  const levels = useQuery({
    queryKey: ["levels", item.id],
    queryFn: () => getStockLevels(item.id),
  });
  const warehouses = useQuery({ queryKey: ["warehouses"], queryFn: listWarehouses });

  const [warehouseId, setWarehouseId] = useState("");
  const [type, setType] = useState<MovementType>("RECEIPT");
  const [quantity, setQuantity] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      postMovement({
        itemId: item.id,
        warehouseId: warehouseId || warehouses.data?.[0]?.id || "",
        type,
        quantity: Number(quantity),
      }),
    onSuccess: () => {
      setQuantity(""); setError(null);
      qc.invalidateQueries({ queryKey: ["levels", item.id] });
    },
    onError: (e) => setError(apiErrorMessage(e)),
  });

  const warehouseName = (id: string) =>
    warehouses.data?.find((w) => w.id === id)?.code ?? id.slice(0, 8);

  return (
    <div>
      <h3>On hand</h3>
      {levels.isLoading && <p className="muted">Loading…</p>}
      <table className="table">
        <thead>
          <tr><th>Warehouse</th><th>Qty on hand</th></tr>
        </thead>
        <tbody>
          {levels.data?.map((l) => (
            <tr key={l.warehouseId}>
              <td>{warehouseName(l.warehouseId)}</td>
              <td>{l.quantityOnHand}</td>
            </tr>
          ))}
          {levels.data?.length === 0 && (
            <tr><td colSpan={2} className="muted">No stock yet.</td></tr>
          )}
        </tbody>
      </table>

      <form
        className="subform"
        onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}
      >
        <h3>Post movement</h3>
        <div className="form-row">
          <select value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)}>
            <option value="">{warehouses.data?.length ? "Select warehouse" : "No warehouses"}</option>
            {warehouses.data?.map((w) => (
              <option key={w.id} value={w.id}>{w.code} — {w.name}</option>
            ))}
          </select>
          <select value={type} onChange={(e) => setType(e.target.value as MovementType)}>
            <option value="RECEIPT">Receipt (+)</option>
            <option value="ISSUE">Issue (−)</option>
            <option value="ADJUSTMENT_IN">Adjustment + </option>
            <option value="ADJUSTMENT_OUT">Adjustment −</option>
          </select>
          <input
            type="number" step="0.0001" min="0" placeholder="Quantity"
            value={quantity} onChange={(e) => setQuantity(e.target.value)} required
          />
        </div>
        {error && <div className="error">{error}</div>}
        <div className="form-actions">
          <button type="submit" disabled={mutation.isPending || !quantity}>Post</button>
        </div>
      </form>
    </div>
  );
}
