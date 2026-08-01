import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { oilMartClients } from "@oilmart/mocks";
import { ClientFormModal } from "./client-form-modal";

const meta: Meta<typeof ClientFormModal> = {
  title: "Oil Mart/Master Data/ClientFormModal",
  component: ClientFormModal,
  args: { opened: true, onClose: fn(), onSubmit: fn() },
};

export default meta;
type Story = StoryObj<typeof ClientFormModal>;

export const Create: Story = {};

export const Edit: Story = { args: { client: oilMartClients[0] } };

export const Submitting: Story = { args: { client: oilMartClients[2], submitting: true } };
