import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { qk } from "@core/queryKeys";
import type { FuelTank } from "@core/types";
import { listTanks } from "../../../../api";

export function useFuelTanks() {
  const query = useQuery({ queryKey: qk.fuelTanks(), queryFn: listTanks });

  const [readingTank, setReadingTank] = useState<FuelTank | undefined>();
  const [editTank, setEditTank] = useState<FuelTank | undefined>();

  const tanks = query.data ?? [];

  return {
    query,
    tanks,
    readingTank,
    setReadingTank,
    editTank,
    setEditTank,
  };
}
