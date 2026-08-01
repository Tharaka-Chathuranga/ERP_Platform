import type { Meta, StoryObj } from "@storybook/react";
import { http, HttpResponse } from "msw";
import { OilMartClientDetailPage } from "./oil-mart-client-detail";

const meta: Meta<typeof OilMartClientDetailPage> = {
  title: "Oil Mart/Master Data/OilMartClientDetailPage",
  component: OilMartClientDetailPage,
  parameters: {
    layout: "fullscreen",
    route: "/oil-mart/clients/cli-southern-transport",
    routePath: "/oil-mart/clients/:clientId",
  },
};

export default meta;
type Story = StoryObj<typeof OilMartClientDetailPage>;

export const WithSalesHistory: Story = {};

export const NoSalesYet: Story = {
  parameters: {
    route: "/oil-mart/clients/cli-coastal-fisheries",
    msw: {
      handlers: [http.get("/api/oilmart/clients/:clientId/sales", () => HttpResponse.json([]))],
    },
  },
};

export const NotFound: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("/api/oilmart/clients/:clientId", () =>
          HttpResponse.json({ detail: "Client not found" }, { status: 404 }),
        ),
      ],
    },
  },
};
