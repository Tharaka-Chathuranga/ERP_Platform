import { clientHandlers } from "./clients.handlers";
import { invoiceHandlers } from "./invoices.handlers";
import { itemHandlers } from "./items.handlers";
import { overviewHandlers } from "./overview.handlers";
import { receiptHandlers } from "./receipts.handlers";
import { quotationHandlers } from "./quotations.handlers";
import { stockHandlers } from "./stock.handlers";
import { supplierHandlers } from "./suppliers.handlers";

export const oilMartHandlers = [
  ...itemHandlers,
  ...supplierHandlers,
  ...clientHandlers,
  ...stockHandlers,
  ...receiptHandlers,
  ...quotationHandlers,
  ...invoiceHandlers,
  ...overviewHandlers,
];

export * from "./mock-db";
export {
  clientHandlers,
  invoiceHandlers,
  itemHandlers,
  overviewHandlers,
  quotationHandlers,
  receiptHandlers,
  stockHandlers,
  supplierHandlers,
};
