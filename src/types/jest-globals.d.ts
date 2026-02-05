declare const jest: typeof import('@jest/globals').jest

declare function describe(
  name: string,
  fn: () => void
): void

declare function it(
  name: string,
  fn: () => void | Promise<void>
): void

declare function test(
  name: string,
  fn: () => void | Promise<void>
): void

declare function beforeEach(fn: () => void | Promise<void>): void
declare function afterEach(fn: () => void | Promise<void>): void

interface Matchers<R = void> {
  toBe(expected: unknown): R
  toEqual(expected: unknown): R
  toBeTruthy(): R
  toBeFalsy(): R
  toBeNull(): R
  toBeUndefined(): R
  toContain(expected: unknown): R
  toHaveLength(expected: number): R
}

declare function expect<T = unknown>(actual: T): Matchers<void>

declare namespace expect {
  function arrayContaining<T = unknown>(items: T[]): T[]
}
