import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { oilMartItems } from "@oilmart/mocks";
import { ItemFormModal } from "./item-form-modal";

const meta: Meta<typeof ItemFormModal> = {
  title: "Oil Mart/Master Data/ItemFormModal",
  component: ItemFormModal,
  args: { opened: true, onClose: fn(), onSubmit: fn() },
};

export default meta;
type Story = StoryObj<typeof ItemFormModal>;

export const Create: Story = {};

export const Edit: Story = { args: { item: oilMartItems[2] } };

export const Submitting: Story = { args: { item: oilMartItems[0], submitting: true } };
