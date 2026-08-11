import { describe, expect, it } from 'vitest';

import { paginate } from './paginate';

const ROWS = Array.from({ length: 23 }, (_, index) => index + 1);

describe('paginate', () => {
  it('returns the requested slice', () => {
    expect(paginate(ROWS, 2, 10).rows).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
  });

  it('reports the page count', () => {
    expect(paginate(ROWS, 1, 10).totalPages).toBe(3);
    expect(paginate(ROWS, 1, 25).totalPages).toBe(1);
  });

  it('clamps a page past the end back into range', () => {
    const slice = paginate(ROWS, 99, 10);

    expect(slice.page).toBe(3);
    expect(slice.rows).toEqual([21, 22, 23]);
  });

  it('clamps a page below the first', () => {
    expect(paginate(ROWS, 0, 10).page).toBe(1);
    expect(paginate(ROWS, -4, 10).page).toBe(1);
  });

  it('survives an empty list', () => {
    const slice = paginate([], 1, 10);

    expect(slice.rows).toEqual([]);
    expect(slice.totalPages).toBe(1);
  });

  it('treats a nonsensical page size as one row per page', () => {
    expect(paginate(ROWS, 1, 0).rows).toEqual([1]);
  });
});
