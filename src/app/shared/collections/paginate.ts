export interface PageSlice<T> {
  readonly rows: readonly T[];
  /** Clamped into range, so a shrinking list can never leave you on a blank page. */
  readonly page: number;
  readonly totalPages: number;
}

/**
 * Slices an in-memory list into a page. Used by the tables whose whole data set
 * already fits in the client — the roster, the bills, the tenders — where a
 * round trip per page would be wasted work.
 */
export function paginate<T>(rows: readonly T[], page: number, pageSize: number): PageSlice<T> {
  const size = Math.max(1, pageSize);
  const totalPages = Math.max(1, Math.ceil(rows.length / size));
  const safePage = Math.min(Math.max(1, Math.trunc(page) || 1), totalPages);
  const start = (safePage - 1) * size;

  return { rows: rows.slice(start, start + size), page: safePage, totalPages };
}
