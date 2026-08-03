import { Button, Group } from "@mantine/core";
import { IconChevronLeft } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@ui/layout/PageHeader";
import { IssueProgress } from "../../components/IssueProgress";
import { NewIssueForm } from "./new-issue-form";

export function NewIssuePage() {
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader title="New goods issue" />

      <Group mb="md">
        <Button variant="default" leftSection={<IconChevronLeft size={16} />} onClick={() => navigate("/issuing")}>
          Back
        </Button>
      </Group>

      <IssueProgress status="DRAFT" mb="lg" />

      <NewIssueForm />
    </div>
  );
}
