import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { useCan } from "@auth/useCan";
import { ITEM_EDIT } from "@auth/permissions";
import { getItem } from "../../../../api";

export function useItemDetail() {
  const { id = "" } = useParams();
  const can = useCan();
  const canEdit = can(ITEM_EDIT);
  const [editing, setEditing] = useState(false);

  const { data: item, isLoading, error } = useQuery({
    queryKey: ["item", id],
    queryFn: () => getItem(id),
  });

  return { canEdit, editing, setEditing, item, isLoading, error };
}
