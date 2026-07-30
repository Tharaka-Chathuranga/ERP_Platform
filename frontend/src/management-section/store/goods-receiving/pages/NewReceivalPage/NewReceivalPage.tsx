import { Button, Group } from "@mantine/core";
import { IconChevronLeft } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@ui/layout/PageHeader";
import { NewReceivalForm } from "./new-receival-form";

export function NewReceivalPage() {
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader title="New item receival" />

      <Group mb="md">
        <Button variant="default" leftSection={<IconChevronLeft size={16} />} onClick={() => navigate("/receiving")}>
          Back
        </Button>
      </Group>

      <NewReceivalForm />
    </div>
  );
}
