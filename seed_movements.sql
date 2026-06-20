-- Demo data for the Stock Movements dashboard.
-- Idempotent: re-running replaces only the rows it owns (created_by = 'seed').
BEGIN;

-- ── Items (a realistic spread; some flagged critical) ──────────────────
INSERT INTO store.items (id, itemcode, name, unit_of_measure, unit_price, category,
                         reorder_level, is_critical_item, quantity_on_hand, created_by)
VALUES
  (gen_random_uuid(), 'STL-PIPE', 'Steel Pipe 2in',   'M',   12.00, 'Raw material', 40,  TRUE,  35, 'seed'),
  (gen_random_uuid(), 'CU-WIRE',  'Copper Wire 4mm',  'M',    8.00, 'Raw material', 30,  TRUE,   8, 'seed'),
  (gen_random_uuid(), 'SEAL-KIT', 'Hydraulic Seal Kit','EA',  5.00, 'Spare part',   15,  TRUE,   4, 'seed'),
  (gen_random_uuid(), 'BOLT-M8',  'Bolt M8 x 40',     'EA',   0.50, 'Fastener',    100, FALSE, 280, 'seed'),
  (gen_random_uuid(), 'GLOVE-L',  'Safety Gloves L',  'PR',   2.00, 'Consumable',   50, FALSE,  90, 'seed'),
  (gen_random_uuid(), 'PAINT-W',  'White Paint 5L',   'EA',  15.00, 'Consumable',   10, FALSE,  37, 'seed')
ON CONFLICT (itemcode) DO NOTHING;

-- ── Movements (all six types; clustered in the current week) ────────────
DELETE FROM store.stock_movements WHERE created_by = 'seed';

INSERT INTO store.stock_movements (id, item_id, type, quantity, unit_cost, reference, occurred_at, created_at, created_by)
SELECT gen_random_uuid(), i.id, m.type, m.qty, m.cost, m.ref, m.ts, m.ts, 'seed'
FROM (VALUES
  -- Earlier this month
  ('STL-PIPE','RECEIPT',        50, 12.00, 'GRN-1001', TIMESTAMPTZ '2026-06-02 09:00:00+00'),
  ('CU-WIRE', 'RECEIPT',        30,  8.00, 'GRN-1001', TIMESTAMPTZ '2026-06-02 09:05:00+00'),
  ('SEAL-KIT','RECEIPT',        20,  5.00, 'GRN-1001', TIMESTAMPTZ '2026-06-02 09:10:00+00'),
  ('BOLT-M8', 'RECEIPT',       200,  0.50, 'GRN-1001', TIMESTAMPTZ '2026-06-02 09:15:00+00'),
  ('GLOVE-L', 'RECEIPT',       100,  2.00, 'GRN-1002', TIMESTAMPTZ '2026-06-04 10:00:00+00'),
  ('PAINT-W', 'RECEIPT',        40, 15.00, 'GRN-1002', TIMESTAMPTZ '2026-06-04 10:05:00+00'),
  ('CU-WIRE', 'ISSUE',          18,  NULL, 'GI-2001',  TIMESTAMPTZ '2026-06-04 14:00:00+00'),
  ('STL-PIPE','ISSUE',          20,  NULL, 'GI-2002',  TIMESTAMPTZ '2026-06-06 11:00:00+00'),
  ('BOLT-M8', 'ISSUE',          60,  NULL, 'GI-2002',  TIMESTAMPTZ '2026-06-06 11:05:00+00'),
  ('SEAL-KIT','ADJUSTMENT_OUT',  4,  NULL, 'ADJ-301',  TIMESTAMPTZ '2026-06-06 16:30:00+00'),
  ('CU-WIRE', 'ISSUE',          15,  NULL, 'GI-2003',  TIMESTAMPTZ '2026-06-09 09:30:00+00'),
  ('GLOVE-L', 'ISSUE',          30,  NULL, 'GI-2003',  TIMESTAMPTZ '2026-06-09 09:35:00+00'),
  ('ITM-A',   'TRANSFER_IN',    10,  NULL, 'TRN-401',  TIMESTAMPTZ '2026-06-09 13:00:00+00'),
  ('STL-PIPE','ISSUE',          25,  NULL, 'GI-2004',  TIMESTAMPTZ '2026-06-11 10:00:00+00'),
  ('BOLT-M8', 'ISSUE',          40,  NULL, 'GI-2004',  TIMESTAMPTZ '2026-06-11 10:05:00+00'),
  ('PAINT-W', 'ADJUSTMENT_IN',   5,  NULL, 'ADJ-302',  TIMESTAMPTZ '2026-06-11 15:00:00+00'),
  ('CU-WIRE', 'TRANSFER_OUT',   10,  NULL, 'TRN-402',  TIMESTAMPTZ '2026-06-12 11:00:00+00'),
  ('ITM-B',   'ISSUE',           3,  NULL, 'GI-2005',  TIMESTAMPTZ '2026-06-12 12:00:00+00'),
  ('SEAL-KIT','ISSUE',          12,  NULL, 'GI-2006',  TIMESTAMPTZ '2026-06-13 09:00:00+00'),
  ('PAINT-W', 'ISSUE',          10,  NULL, 'GI-2006',  TIMESTAMPTZ '2026-06-13 09:05:00+00'),
  -- This week (Sun 14th onward)
  ('STL-PIPE','ISSUE',          15,  NULL, 'GI-2007',  TIMESTAMPTZ '2026-06-14 08:30:00+00'),
  ('CU-WIRE', 'ISSUE',          12,  NULL, 'GI-2007',  TIMESTAMPTZ '2026-06-14 08:35:00+00'),
  ('BOLT-M8', 'RECEIPT',       150,  0.50, 'GRN-1003', TIMESTAMPTZ '2026-06-14 10:00:00+00'),
  ('GLOVE-L', 'ISSUE',          25,  NULL, 'GI-2008',  TIMESTAMPTZ '2026-06-14 13:00:00+00'),
  ('SEAL-KIT','TRANSFER_OUT',    6,  NULL, 'TRN-403',  TIMESTAMPTZ '2026-06-14 15:00:00+00'),
  ('STL-PIPE','RECEIPT',        30, 12.00, 'GRN-1004', TIMESTAMPTZ '2026-06-15 09:00:00+00'),
  ('CU-WIRE', 'RECEIPT',        10,  8.00, 'GRN-1004', TIMESTAMPTZ '2026-06-15 09:05:00+00'),
  ('BOLT-M8', 'ISSUE',          70,  NULL, 'GI-2009',  TIMESTAMPTZ '2026-06-15 10:30:00+00'),
  ('SEAL-KIT','ISSUE',          10,  NULL, 'GI-2009',  TIMESTAMPTZ '2026-06-15 10:35:00+00'),
  ('PAINT-W', 'ISSUE',           8,  NULL, 'GI-2010',  TIMESTAMPTZ '2026-06-15 11:00:00+00'),
  ('GLOVE-L', 'ADJUSTMENT_OUT',  5,  NULL, 'ADJ-303',  TIMESTAMPTZ '2026-06-15 14:00:00+00'),
  ('ITM-A',   'TRANSFER_IN',    20,  NULL, 'TRN-404',  TIMESTAMPTZ '2026-06-15 16:00:00+00')
) AS m(code, type, qty, cost, ref, ts)
JOIN store.items i ON i.itemcode = m.code;

COMMIT;
