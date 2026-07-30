import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useUserLabels } from "@core/hooks/useLookups";
import type { BorrowRequestStatus } from "@core/types";
import { listBorrowRequests } from "../../../../api";

export function useRequestList() {
  const userLabel = useUserLabels();
  const [filter, setFilter] = useState("ALL");
  const [newOpen, setNewOpen] = useState(false);

  const query = useQuery({
    queryKey: ["borrowRequests", filter],
    queryFn: () => listBorrowRequests(filter === "ALL" ? undefined : (filter as BorrowRequestStatus)),
  });

  return { filter, setFilter, newOpen, setNewOpen, query, userLabel };
}
