import { useQuery } from "@tanstack/react-query";
import { listUsers } from "@auth/users.api";
import { qk } from "@core/queryKeys";

/** Users, optionally scoped to a single department. */
export function useUsers(department?: string) {
  return useQuery({
    queryKey: qk.users(department),
    queryFn: () => listUsers(department),
    staleTime: 60_000,
  });
}
