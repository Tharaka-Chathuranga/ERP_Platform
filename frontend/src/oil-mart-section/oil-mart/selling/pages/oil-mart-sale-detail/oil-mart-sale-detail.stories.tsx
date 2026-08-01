import type { Meta, StoryObj } from "@storybook/react";
import { http, HttpResponse } from "msw";
import { OilMartSaleDetailPage } from "./oil-mart-sale-detail";

const meta: Meta<typeof OilMartSaleDetailPage> = {
  title: "Oil Mart/Selling/OilMartSaleDetailPage",
  component: OilMartSaleDetailPage,
  parameters: {
    layout: "fullscreen",
    routePath: "/oil-mart/sales/:saleId",
    route: "/oil-mart/sales/sale-ordered",
  },
};

export default meta;
type Story = StoryObj<typeof OilMartSaleDetailPage>;

export const QuotationAsAssistant: Story = {
  parameters: { route: "/oil-mart/sales/sale-quotation", role: "OIL_MART_ASSISTANT" },
};

export const OrderedAsManager: Story = { parameters: { role: "STORES_MANAGER" } };

export const OrderedAsAssistant: Story = { parameters: { role: "OIL_MART_ASSISTANT" } };

export const ApprovedAsAssistant: Story = {
  parameters: { route: "/oil-mart/sales/sale-approved", role: "OIL_MART_ASSISTANT" },
};

export const DispatchedAsAssistant: Story = {
  parameters: { route: "/oil-mart/sales/sale-dispatched", role: "OIL_MART_ASSISTANT" },
};

export const Invoiced: Story = { parameters: { route: "/oil-mart/sales/sale-invoiced" } };

export const Rejected: Story = { parameters: { route: "/oil-mart/sales/sale-rejected" } };

export const Cancelled: Story = { parameters: { route: "/oil-mart/sales/sale-cancelled" } };

export const ApprovalRejectedByBackend: Story = {
  parameters: {
    role: "STORES_MANAGER",
    msw: {
      handlers: [
        http.post("/api/oilmart/sales/:saleId/approve", () =>
          HttpResponse.json(
            { detail: "Only an ORDERED sale can be approved (current: APPROVED)" },
            { status: 409 },
          ),
        ),
      ],
    },
  },
};

export const NotFound: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("/api/oilmart/sales/:saleId", () =>
          HttpResponse.json({ detail: "Sale not found" }, { status: 404 }),
        ),
      ],
    },
  },
};
