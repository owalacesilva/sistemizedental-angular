/** Envelope every legacy `*.query()` endpoint returns. */
export interface Paginated<T> {
  readonly rows: readonly T[];
  readonly count: number;
}

/** Query string every legacy server-side table sends. */
export interface PageQuery {
  /** 1-based. */
  readonly page: number;
  readonly limit: number;
  readonly offset: number;
  /** `<column>-<asc|desc>`, as the legacy DataTables adapter built it. */
  readonly order?: string;
}

/** Turns a 1-based page into the `page`/`limit`/`offset` trio the API expects. */
export function pageQuery(page: number, limit: number, order?: string): PageQuery {
  const safePage = Math.max(1, page);
  return { page: safePage, limit, offset: (safePage - 1) * limit, order };
}
