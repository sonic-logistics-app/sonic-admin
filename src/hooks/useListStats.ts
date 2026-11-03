"use client";

import { useCallback, useEffect, useState } from "react";
import { getListStats } from "@/lib/api/admin/ops";

/** Counts for the cards above a list. `reload` refreshes them after an action changes the data. */
export function useListStats(kind: "users" | "drivers" | "orders") {
  const [counts, setCounts] = useState<Record<string, number> | null>(null);

  const reload = useCallback(() => {
    getListStats(kind)
      .then(({ data }) => setCounts(data.counts))
      .catch(() => setCounts(null)); // a failed count just leaves the cards blank
  }, [kind]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { counts, reload };
}
