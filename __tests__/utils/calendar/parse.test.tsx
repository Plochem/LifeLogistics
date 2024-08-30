import parseICal from '@/utils/calendar/parse'

describe('Importing Calendar', () => {
  it('throws error for invalid ical', () => {
    expect(() => parseICal('asdf')).toThrow()
  })
})
