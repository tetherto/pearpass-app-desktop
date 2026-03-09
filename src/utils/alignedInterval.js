/**
 * Creates an interval that fires aligned to whole-second boundaries.
 * All callers across the app fire at the same wall-clock second,
 * keeping multiple OTP displays in sync.
 *
 * @param {() => void} callback
 * @returns {() => void} cleanup function
 */
export const createAlignedInterval = (callback) => {
  let id = null

  const scheduleNext = () => {
    id = setTimeout(
      () => {
        callback()
        scheduleNext()
      },
      1000 - (Date.now() % 1000)
    )
  }

  scheduleNext()

  return () => clearTimeout(id)
}
