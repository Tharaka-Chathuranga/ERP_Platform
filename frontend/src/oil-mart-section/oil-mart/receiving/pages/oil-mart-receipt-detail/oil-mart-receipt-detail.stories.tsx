import type { Meta, StoryObj } from "@storybook/react";
import { http, HttpResponse } from "msw";
import { OilMartReceiptDetailPage } from "./oil-mart-receipt-detail";

const meta: Meta<typeof OilMartReceiptDetailPage> = {
  title: "Oil Mart/Receiving/OilMartReceiptDetailPage",
  component: OilMartReceiptDetailPage,
  parameters: {
    layout: "fullscreen",
    route: "/oil-mart/receipts/rcp-1",
    routePath: "/oil-mart/receipts/:receiptId",
  },
};

export default meta;
type Story = StoryObj<typeof OilMartReceiptDetailPage>;

export const SingleLine: Story = {};

export const MultiLine: Story = { parameters: { route: "/oil-mart/receipts/rcp-2" } };

export const NotFound: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("/api/oilmart/receipts/:receiptId", () =>
          HttpResponse.json({ detail: "Receipt not found" }, { status: 404 }),
        ),
      ],
    },
  },
};
