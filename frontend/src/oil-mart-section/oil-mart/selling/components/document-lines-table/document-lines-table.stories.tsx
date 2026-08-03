import type { Meta, StoryObj } from "@storybook/react";
import { anOilMartQuotation } from "@oilmart/mocks";
import { DocumentLinesTable } from "./document-lines-table";

const lines = anOilMartQuotation().lines;

const meta: Meta<typeof DocumentLinesTable> = {
  title: "Oil Mart/Selling/DocumentLinesTable",
  component: DocumentLinesTable,
  args: { lines, showProfit: true },
};

export default meta;
type Story = StoryObj<typeof DocumentLinesTable>;

export const WithProfit: Story = {};

export const WithoutProfit: Story = { args: { showProfit: false } };

export const MixedUnitsAndFractions: Story = {
  args: {
    lines: [
      { ...lines[0], id: "l1", quantityLitres: 25.5 },
      { ...lines[0], id: "l2", quantityLitres: 120, unitOfMeasure: "PK", discountPercent: 2.5 },
      { ...lines[0], id: "l3", quantityLitres: 3, unitOfMeasure: "DRUM", isPriceOverride: true },
    ],
  },
};
