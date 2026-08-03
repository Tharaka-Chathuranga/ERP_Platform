import type { Meta, StoryObj } from "@storybook/react";
import { http, HttpResponse } from "msw";
import { NewOilMartReceiptPage } from "./new-oil-mart-receipt";

const meta: Meta<typeof NewOilMartReceiptPage> = {
  title: "Oil Mart/Receiving/NewOilMartReceiptPage",
  component: NewOilMartReceiptPage,
  parameters: {
    layout: "fullscreen",
    route: "/oil-mart/receipts/new",
    role: "OIL_MART_SALES_ASSISTANT",
  },
};

export default meta;
type Story = StoryObj<typeof NewOilMartReceiptPage>;

export const Blank: Story = {};

export const NoSuppliersYet: Story = {
  parameters: {
    msw: { handlers: [http.get("/api/oilmart/suppliers", () => HttpResponse.json([]))] },
  },
};

export const SaveRejected: Story = {
  parameters: {
    msw: {
      handlers: [
        http.post("/api/oilmart/receipts", () =>
          HttpResponse.json({ detail: "Supplier is inactive" }, { status: 400 }),
        ),
      ],
    },
  },
};
