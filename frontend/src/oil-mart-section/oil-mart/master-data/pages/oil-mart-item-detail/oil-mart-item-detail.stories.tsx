import type { Meta, StoryObj } from "@storybook/react";
import { http, HttpResponse } from "msw";
import { OilMartItemDetailPage } from "./oil-mart-item-detail";

const meta: Meta<typeof OilMartItemDetailPage> = {
  title: "Oil Mart/Master Data/OilMartItemDetailPage",
  component: OilMartItemDetailPage,
  parameters: {
    layout: "fullscreen",
    route: "/oil-mart/items/itm-engine-15w40",
    routePath: "/oil-mart/items/:itemId",
  },
};

export default meta;
type Story = StoryObj<typeof OilMartItemDetailPage>;

export const AsSalesManager: Story = { parameters: { role: "OIL_MART_SALES_MANAGER" } };

export const AsSalesAssistant: Story = { parameters: { role: "OIL_MART_SALES_ASSISTANT" } };

export const LowStockItem: Story = { parameters: { route: "/oil-mart/items/itm-gear-ep90" } };

export const NotFound: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("/api/oilmart/items/:itemId", () =>
          HttpResponse.json({ detail: "Oil not found" }, { status: 404 }),
        ),
      ],
    },
  },
};
