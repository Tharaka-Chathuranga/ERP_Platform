import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@auth/AuthContext";
import { qk } from "@core/queryKeys";
import { getLowStockItems } from "@store/inventory";
import { listNonconformities } from "@store/nonconformities";
import { listCountRequests } from "@store/count-adjustments";
import { listReceivals } from "@store/goods-receiving";

export function useStorekeeperOverview() {
  const { username } = useAuth();
  const lowStock = useQuery({ queryKey: qk.lowStock(), queryFn: getLowStockItems });
  const openNonconformities = useQuery({ queryKey: qk.nonconformities("INCOMING"), queryFn: () => listNonconformities("INCOMING") });
  const recentReceivals = useQuery({ queryKey: qk.receivals(), queryFn: () => listReceivals() });
  const pendingCounts = useQuery({ queryKey: qk.countRequests("PENDING"), queryFn: () => listCountRequests("PENDING") });

  return { username, lowStock, openNonconformities, recentReceivals, pendingCounts };
}
