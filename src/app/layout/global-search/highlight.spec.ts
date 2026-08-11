import { describe, expect, it } from 'vitest';

import { highlight } from './highlight';

describe('highlight', () => {
  it('splits around the match, ignoring case', () => {
    expect(highlight('Marina Alves', 'mar')).toEqual([
      { text: 'Mar', match: true },
      { text: 'ina Alves', match: false },
    ]);
  });

  it('marks every occurrence', () => {
    expect(highlight('ana banana', 'an').filter((part) => part.match)).toHaveLength(3);
  });

  it('returns the whole string when there is nothing to match', () => {
    expect(highlight('Marina Alves', '   ')).toEqual([{ text: 'Marina Alves', match: false }]);
  });

  it('treats regex metacharacters as literal text', () => {
    expect(highlight('a+b', '+')).toEqual([
      { text: 'a', match: false },
      { text: '+', match: true },
      { text: 'b', match: false },
    ]);
  });

  it('drops the empty pieces a leading match produces', () => {
    expect(highlight('Alves', 'Alves')).toEqual([{ text: 'Alves', match: true }]);
  });
});
