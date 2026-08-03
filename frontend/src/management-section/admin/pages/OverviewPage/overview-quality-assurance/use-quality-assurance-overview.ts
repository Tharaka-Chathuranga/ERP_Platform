import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@auth/AuthContext";
import { qk } from "@core/queryKeys";
import { getQaNonconformitySummary } from "@qa";

export function useQualityAssuranceOverview() {
  const { username } = useAuth();
  const summary = useQuery({ queryKey: qk.qaNonconformitySummary(), queryFn: getQaNonconformitySummary });
  const s = summary.data;

  return { username, s };
}
