import { useEffect, useMemo, useRef, useState } from 'react'

import { generateOtpCodesByIds } from 'pearpass-lib-vault'

import { createAlignedInterval } from '../utils/alignedInterval'

/**
 * Polls OTP codes for records that have otpPublic data.
 * Synced to wall-clock seconds and refreshes instantly on HOTP updates.
 *
 * @param {Array} records
 * @returns {Object} Map of recordId → { code, timeRemaining, recordId }
 */
export const useOtpCodes = (records) => {
  const [otpCodes, setOtpCodes] = useState({})
  const recordsRef = useRef(records)
  recordsRef.current = records

  const otpRecordCount = useMemo(
    () => records?.filter((r) => r.otpPublic).length ?? 0,
    [records]
  )

  useEffect(() => {
    if (!otpRecordCount) return

    const refresh = async () => {
      const current = recordsRef.current
      if (!current?.length) return

      const ids = current.filter((r) => r.otpPublic).map((r) => r.id)
      if (!ids.length) return

      try {
        const results = await generateOtpCodesByIds(ids)
        const codesMap = {}
        for (const result of results) {
          codesMap[result.recordId] = result
        }
        setOtpCodes(codesMap)
      } catch {
        // Will retry on next tick
      }
    }

    refresh()
    const cleanup = createAlignedInterval(refresh)

    const handleHotpUpdate = () => refresh()
    window.addEventListener('otp-code-updated', handleHotpUpdate)

    return () => {
      cleanup()
      window.removeEventListener('otp-code-updated', handleHotpUpdate)
    }
  }, [otpRecordCount])

  return otpCodes
}
