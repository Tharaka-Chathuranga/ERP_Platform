import { Button, Group } from "@mantine/core";
import { IconChevronLeft } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@ui/layout/PageHeader";
import { NewNonconformityForm } from "./new-nonconformity-form";

export function NewNonconformityPage() {
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader title="Report nonconformity" />

      <Group mb="md">
        <Button variant="default" leftSection={<IconChevronLeft size={16} />} onClick={() => navigate("/nonconformities")}>
          Back
        </Button>
      </Group>

      <NewNonconformityForm />
    </div>
  );
}
