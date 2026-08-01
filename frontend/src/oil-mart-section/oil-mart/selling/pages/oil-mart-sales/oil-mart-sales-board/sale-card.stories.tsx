import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { anOilMartSale, oilMartSaleByStatus } from "@oilmart/mocks";
import { SaleCard } from "./sale-card";

const meta: Meta<typeof SaleCard> = {
  title: "Oil Mart/Selling/SaleCard",
  component: SaleCard,
  args: { sale: oilMartSaleByStatus("QUOTATION"), onClick: fn() },
  decorators: [(Story) => <div style={{ maxWidth: 280 }}><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof SaleCard>;

export const Quotation: Story = {};

export const WithPriceOverride: Story = { args: { sale: oilMartSaleByStatus("ORDERED") } };

export const ExpiringSoon: Story = {
  args: {
    sale: anOilMartSale({
      validUntil: new Date(Date.now() + 86_400_000).toISOString().slice(0, 10),
    }),
  },
};

export const Invoiced: Story = { args: { sale: oilMartSaleByStatus("INVOICED") } };
