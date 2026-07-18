import { Button, Group } from "@mantine/core";
import { IconChevronLeft } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@ui/layout/PageHeader";
import { FuelDeliveryForm } from "./fuel-delivery-form";

export function NewFuelDeliveryPage() {
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader title="Record fuel delivery" />

      <Group mb="md">
        <Button variant="default" leftSection={<IconChevronLeft size={16} />} onClick={() => navigate("/fuel/deliveries")}>
          Back
        </Button>
      </Group>

      <FuelDeliveryForm />
    </div>
  );
}
