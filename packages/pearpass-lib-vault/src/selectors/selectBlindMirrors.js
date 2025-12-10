import { createSelector } from '@reduxjs/toolkit'

/**
 * Selector for blind mirrors state
 * @param {Object} state - Redux state
 * @returns {Object} Blind mirrors state
 */
export const selectBlindMirrors = (state) => state.blindMirrors

/**
 * Selector for blind mirrors data
 * @param {Object} state - Redux state
 * @returns {Array} Blind mirrors data
 */
export const selectBlindMirrorsData = createSelector(
  [selectBlindMirrors],
  (blindMirrors) => blindMirrors.data
)

/**
 * Selector for blind mirrors loading state
 * @param {Object} state - Redux state
 * @returns {boolean} Loading state
 */
export const selectBlindMirrorsLoading = createSelector(
  [selectBlindMirrors],
  (blindMirrors) => blindMirrors.isLoading
)

/**
 * Selector for blind mirrors error
 * @param {Object} state - Redux state
 * @returns {string|null} Error message
 */
export const selectBlindMirrorsError = createSelector(
  [selectBlindMirrors],
  (blindMirrors) => blindMirrors.error
)
