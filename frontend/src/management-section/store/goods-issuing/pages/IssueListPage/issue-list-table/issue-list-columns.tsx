import dayjs from "dayjs";
import { PersonCell, StackedCell, type Column } from "@ui/data";
import { StatusBadge } from "@ui/feedback/StatusBadge";
import type { Issue, UserSummary } from "@core/types";

interface IssueListColumnsOptions {
  userById: Map<string, UserSummary>;
  nameOf: (id: string) => string;
}

export function buildIssueListColumns({ userById, nameOf }: IssueListColumnsOptions): Column<Issue>[] {
  return [
    {
      header: "Borrowing user",
      render: (i) => (
        <PersonCell
          name={nameOf(i.borrowingUserId)}
          subtitle={userById.get(i.borrowingUserId)?.department ?? "No department"}
        />
      ),
    },
    {
      header: "Issue",
      render: (i) => (
        <StackedCell
          primary={i.issueNumber}
          secondary={`${i.lines.length} ${i.lines.length === 1 ? "item" : "items"}`}
        />
      ),
    },
    { header: "Store keeper", render: (i) => nameOf(i.storeKeeperId) },
    { header: "Status", render: (i) => <StatusBadge status={i.status} /> },
    {
      header: "Activity",
      render: (i) => {
        const when = i.issuedAt ?? i.approvedAt;
        return when ? (
          <StackedCell
            primary={dayjs(when).format("MMM DD, YYYY")}
            secondary={dayjs(when).format("h:mm A")}
          />
        ) : (
          "—"
        );
      },
    },
  ];
}
