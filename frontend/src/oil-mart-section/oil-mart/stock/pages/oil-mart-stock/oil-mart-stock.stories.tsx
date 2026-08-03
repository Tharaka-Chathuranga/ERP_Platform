import type { Meta, StoryObj } from "@storybook/react";
import { http, HttpResponse } from "msw";
import { OilMartStockPage } from "./oil-mart-stock";

const meta: Meta<typeof OilMartStockPage> = {
  title: "Oil Mart/Stock/OilMartStockPage",
  component: OilMartStockPage,
  parameters: { layout: "fullscreen", route: "/oil-mart/stock" },
};

export default meta;
type Story = StoryObj<typeof OilMartStockPage>;

export const AsSalesAssistant: Story = { parameters: { role: "OIL_MART_SALES_ASSISTANT" } };

export const AsSalesManager: Story = { parameters: { role: "OIL_MART_SALES_MANAGER" } };

export const NoStock: Story = {
  parameters: { msw: { handlers: [http.get("/api/oilmart/stock", () => HttpResponse.json([]))] } },
};

export const LoadFailed: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("/api/oilmart/stock", () =>
          HttpResponse.json({ detail: "Stock service unavailable" }, { status: 503 }),
        ),
      ],
    },
  },
};
