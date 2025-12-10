import { isPearWorker } from './isPearWorker'

describe('isPearWorker', () => {
  let originalPear

  beforeEach(() => {
    originalPear = global.Pear
  })

  afterEach(() => {
    if (originalPear !== undefined) {
      global.Pear = originalPear
    } else {
      delete global.Pear
    }
  })

  test('should return true when Pear is defined', () => {
    global.Pear = {}

    expect(isPearWorker()).toBe(true)
  })

  test('should return false when Pear is undefined', () => {
    delete global.Pear

    expect(isPearWorker()).toBe(false)
  })
})
