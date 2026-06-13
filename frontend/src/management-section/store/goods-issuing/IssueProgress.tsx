import { Stepper } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import type { IssueStatus } from "@core/types";

const ACTIVE_STEP: Record<IssueStatus, number> = {
  DRAFT: 0,
  PENDING_APPROVAL: 1,
  APPROVED: 2,
  ISSUED: 4,
  RETURNED: 4,
  REJECTED: 1,
};

export function IssueProgress({ status, ...rest }: { status: IssueStatus } & Record<string, unknown>) {
  const rejected = status === "REJECTED";
  return (
    <Stepper active={ACTIVE_STEP[status]} size="sm" {...rest}>
      <Stepper.Step label="Issue Request" description="Requested" />
      <Stepper.Step
        label={rejected ? "Rejected" : "Pending Approval"}
        description={rejected ? "Request rejected" : "Awaiting approval"}
        color={rejected ? "red" : undefined}
        icon={rejected ? <IconX size={18} /> : undefined}
      />
      <Stepper.Step label="Approved" description="Cleared to issue" />
      <Stepper.Step
        label={status === "RETURNED" ? "Returned" : "Issued"}
        description={status === "RETURNED" ? "Stock returned" : "Stock issued"}
      />
    </Stepper>
  );
}
