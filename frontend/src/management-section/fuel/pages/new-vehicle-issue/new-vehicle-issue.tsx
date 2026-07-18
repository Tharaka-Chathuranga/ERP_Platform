import { Button, Group } from "@mantine/core";
import { IconChevronLeft } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@ui/layout/PageHeader";
import { FuelIssueForm } from "./fuel-issue-form";

export function NewVehicleIssuePage() {
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader title="New vehicle fuel issue" />

      <Group mb="md">
        <Button variant="default" leftSection={<IconChevronLeft size={16} />} onClick={() => navigate("/fuel/issues")}>
          Back
        </Button>
      </Group>

      <FuelIssueForm />
    </div>
  );
}
