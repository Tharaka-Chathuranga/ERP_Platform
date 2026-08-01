import type { Meta, StoryObj } from "@storybook/react";
import { http, HttpResponse } from "msw";
import { NewOilMartSalePage } from "./new-oil-mart-sale";

const meta: Meta<typeof NewOilMartSalePage> = {
  title: "Oil Mart/Selling/NewOilMartSalePage",
  component: NewOilMartSalePage,
  parameters: {
    layout: "fullscreen",
    route: "/oil-mart/sales/new",
    role: "OIL_MART_ASSISTANT",
  },
};

export default meta;
type Story = StoryObj<typeof NewOilMartSalePage>;

export const Blank: Story = {};

export const NoClientsYet: Story = {
  parameters: {
    msw: { handlers: [http.get("/api/oilmart/clients", () => HttpResponse.json([]))] },
  },
};

export const NoPriceConfigured: Story = {
  parameters: {
    msw: {
      handlers: [http.get("/api/oilmart/items/:itemId/price", () => HttpResponse.json(null))],
    },
  },
};

export const SaveRejected: Story = {
  parameters: {
    msw: {
      handlers: [
        http.post("/api/oilmart/sales", () =>
          HttpResponse.json({ detail: "Unknown client" }, { status: 400 }),
        ),
      ],
    },
  },
};
