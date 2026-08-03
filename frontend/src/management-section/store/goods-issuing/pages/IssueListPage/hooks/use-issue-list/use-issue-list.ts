import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useUsers } from "@core/hooks/useUsers";
import type { IssueStatus, UserSummary } from "@core/types";
import { listIssues } from "../../../../api";

export function useIssueList() {
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const query = useQuery({
    queryKey: ["issues", filter],
    queryFn: () => listIssues(filter === "ALL" ? undefined : (filter as IssueStatus)),
  });

  const { data: users } = useUsers();
  const userById = useMemo(() => {
    const map = new Map<string, UserSummary>();
    users?.forEach((u) => map.set(u.id, u));
    return map;
  }, [users]);

  const nameOf = (id: string) => {
    const u = userById.get(id);
    return u?.displayName || u?.username || id.slice(0, 8);
  };

  const term = search.trim().toLowerCase();
  const rows = (query.data?.content ?? []).filter(
    (i) =>
      !term ||
      i.issueNumber.toLowerCase().includes(term) ||
      nameOf(i.borrowingUserId).toLowerCase().includes(term),
  );

  return { filter, setFilter, search, setSearch, selected, setSelected, query, userById, nameOf, rows, term };
}
