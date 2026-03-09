import { useCallback, useEffect, useState } from 'react'

import { generateHotpNext, generateOtpCodesByIds } from 'pearpass-lib-vault'

import { createAlignedInterval } from '../utils/alignedInterval'

export const useOtp = ({ recordId, otpPublic }) => {
  const [code, setCode] = useState(otpPublic?.currentCode ?? null)
  const [timeRemaining, setTimeRemaining] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  // TOTP: call worklet every second to get fresh code + timeRemaining
  useEffect(() => {
    if (otpPublic?.type !== 'TOTP' || !recordId) return

    const refresh = async () => {
      try {
        const results = await generateOtpCodesByIds([recordId])
        const result = results?.[0]

        if (result) {
          setCode(result.code)
          setTimeRemaining(result.timeRemaining)
        }
      } catch {
        // Will retry on next interval tick
      }
    }

    refresh()

    const cleanup = createAlignedInterval(() => {
      void refresh()
    })

    return cleanup
  }, [recordId, otpPublic?.type])

  // HOTP: generateNext callback
  const generateNext = useCallback(async () => {
    if (otpPublic?.type !== 'HOTP' || !recordId) return
    setIsLoading(true)
    try {
      const result = await generateHotpNext(recordId)
      if (result) {
        setCode(result.code)
        window.dispatchEvent(new CustomEvent('otp-code-updated'))
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
