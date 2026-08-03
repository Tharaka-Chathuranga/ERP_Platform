import type { Meta, StoryObj } from "@storybook/react";
import { http, HttpResponse } from "msw";
import { OilMartItemsPage } from "./oil-mart-items";

const meta: Meta<typeof OilMartItemsPage> = {
  title: "Oil Mart/Master Data/OilMartItemsPage",
  component: OilMartItemsPage,
  parameters: { layout: "fullscreen", route: "/oil-mart/items" },
};

export default meta;
type Story = StoryObj<typeof OilMartItemsPage>;

export const AsSalesManager: Story = { parameters: { role: "OIL_MART_SALES_MANAGER" } };

export const AsSalesAssistant: Story = { parameters: { role: "OIL_MART_SALES_ASSISTANT" } };

export const EmptyCatalogue: Story = {
  parameters: {
    msw: { handlers: [http.get("/api/oilmart/items", () => HttpResponse.json([]))] },
  },
};

export const LoadFailed: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("/api/oilmart/items", () =>
          HttpResponse.json({ detail: "Oil catalogue is unavailable" }, { status: 500 }),
        ),
      ],
    },
  },
};
