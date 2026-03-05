import { useCallback, useEffect, useRef, useState } from 'react'

import { generateHotpNext, generateOtpCodesByIds } from 'pearpass-lib-vault'

/**
 * @param {{
 *   recordId: string,
 *   otpPublic: {
 *     type: 'TOTP' | 'HOTP',
 *     digits: number,
 *     period?: number,
 *     issuer?: string,
 *     label?: string,
 *     currentCode: string | null,
 *     timeRemaining?: number | null
 *   } | undefined
 * }} params
 * @returns {{
 *   code: string | null,
 *   timeRemaining: number | null,
 *   type: 'TOTP' | 'HOTP' | null,
 *   period: number | null,
 *   generateNext: (() => Promise<void>) | null,
 *   isLoading: boolean
 * }}
 */
export const useOtp = ({ recordId, otpPublic }) => {
  const [code, setCode] = useState(otpPublic?.currentCode ?? null)
  const [timeRemaining, setTimeRemaining] = useState(
    otpPublic?.timeRemaining ?? null
  )
  const [isLoading, setIsLoading] = useState(false)

  const expiresAtRef = useRef(null)

  // Initialize expiresAt from initial timeRemaining
  useEffect(() => {
    if (
      otpPublic?.type === 'TOTP' &&
      otpPublic?.timeRemaining !== null &&
      otpPublic?.timeRemaining !== undefined
    ) {
      expiresAtRef.current = Date.now() + otpPublic.timeRemaining * 1000
      setCode(otpPublic.currentCode)
      setTimeRemaining(otpPublic.timeRemaining)
    }
  }, [recordId])

  // TOTP: 1-second tick for countdown + refresh on expiry
  useEffect(() => {
    if (otpPublic?.type !== 'TOTP' || !recordId) {
      return
    }

    const tick = async () => {
      if (!expiresAtRef.current) {
        return
      }

      const remaining = Math.max(
        0,
        Math.ceil((expiresAtRef.current - Date.now()) / 1000)
      )

      setTimeRemaining(remaining)

      if (remaining <= 0) {
        try {
          const results = await generateOtpCodesByIds([recordId])
          const result = results?.[0]

          if (result) {
            setCode(result.code)
            const period = otpPublic.period || 30
            expiresAtRef.current = Date.now() + period * 1000
            setTimeRemaining(period)
          }
        } catch {
          // Code will be stale until next tick retries
        }
      }
    }

    tick()

    const intervalId = setInterval(tick, 1000)

    return () => clearInterval(intervalId)
  }, [recordId, otpPublic?.type, otpPublic?.period])

  // HOTP: generateNext callback
  const generateNext = useCallback(async () => {
    if (otpPublic?.type !== 'HOTP' || !recordId) {
      return
    }

    setIsLoading(true)

    try {
      const result = await generateHotpNext(recordId)

      if (result) {
        setCode(result.code)
      }
    } finally {
      setIsLoading(false)
    }
  }, [recordId, otpPublic?.type])

  if (!otpPublic) {
    return {
      code: null,
      timeRemaining: null,
      type: null,
      period: null,
      generateNext: null,
      isLoading: false
    }
  }

  return {
    code,
    timeRemaining,
    type: otpPublic.type,
    period: otpPublic.period ?? null,
    generateNext: otpPublic.type === 'HOTP' ? generateNext : null,
    isLoading
  }
}
