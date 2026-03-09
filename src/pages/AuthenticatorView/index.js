import { useEffect, useMemo, useRef, useState } from 'react'

import { useLingui } from '@lingui/react'
import { html } from 'htm/react'
import { generateOtpCodesByIds, useRecords } from 'pearpass-lib-vault'

import {
  EmptyState,
  GroupDivider,
  GroupHeader,
  GroupLabel,
  GroupLabelText,
  GroupTimerRing,
  GroupTimeValue,
  Header,
  ListWrapper,
  TimerCircle,
  TimerCircleBg,
  TimerSvg,
  Title,
  Wrapper
} from './styles'
import { InputSearch } from '../../components/InputSearch'
import { getTimerUrgency } from '../../components/OtpCodeField/constants'
import { Record } from '../../components/Record'
import { useRouter } from '../../context/RouterContext'
import { createAlignedInterval } from '../../utils/alignedInterval'

const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * 5.5 // radius=5.5, ~34.558

export const AuthenticatorView = () => {
  const { i18n } = useLingui()
  const { navigate } = useRouter()
  const [searchValue, setSearchValue] = useState('')
  const [otpCodes, setOtpCodes] = useState({})
  const prevTimesRef = useRef({})
  const noTransitionPeriodsRef = useRef({})
  const rafRef = useRef(null)
  const [, forceUpdate] = useState(0)

  const { data: records } = useRecords({
    shouldSkip: true,
    variables: {
      filters: {
        hasOtp: true,
        searchPattern: searchValue
      },
      sort: { key: 'updatedAt', direction: 'desc' }
    }
  })

  const recordsRef = useRef(records)
  recordsRef.current = records

  // Client-side filter as safety net
  const otpRecords = useMemo(
    () => (records || []).filter((r) => r.otpPublic),
    [records]
  )

  useEffect(() => {
    if (!otpRecords.length) return

    const refresh = async () => {
      const currentRecords = recordsRef.current
      if (!currentRecords?.length) return

      const ids = currentRecords.filter((r) => r.otpPublic).map((r) => r.id)
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
  }, [otpRecords.length])

  // Two-phase render: after painting at exact position, enable transitions
  useEffect(() => {
    const hasAnyNoTransition = Object.values(
      noTransitionPeriodsRef.current
    ).some((v) => v === true)
    if (!hasAnyNoTransition) return

    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = requestAnimationFrame(() => {
        for (const key of Object.keys(noTransitionPeriodsRef.current)) {
          noTransitionPeriodsRef.current[key] = false
        }
        forceUpdate((v) => v + 1)
      })
    })

    return () => cancelAnimationFrame(rafRef.current)
  })

  const handleRecordClick = (record) => {
    // Stay in authenticator view, just open the sidebar
    navigate('vault', {
      recordId: record.id,
      recordType: 'authenticator'
    })
  }

  // Separate TOTP and HOTP records, group TOTP by period
  const { totpGroups, hotpRecords } = useMemo(() => {
    const groupMap = {}
    const hotp = []

    for (const record of otpRecords) {
      if (record.otpPublic?.type === 'HOTP') {
        hotp.push(record)
      } else {
        const period = record.otpPublic?.period ?? 30
        if (!groupMap[period]) {
          groupMap[period] = []
        }
        groupMap[period].push(record)
      }
    }

    const groups = Object.entries(groupMap)
      .map(([period, groupRecords]) => ({
        period: Number(period),
        records: groupRecords
      }))
      .sort((a, b) => a.period - b.period)

    return { totpGroups: groups, hotpRecords: hotp }
  }, [otpRecords])

  return html`
    <${Wrapper}>
      <${Header}>
        <${InputSearch}
          value=${searchValue}
          onChange=${(e) => setSearchValue(e.target.value)}
          quantity=${otpRecords.length}
          testId="authenticator-search-input"
        />
      <//>

      ${otpRecords.length === 0
        ? html`
            <${EmptyState}>
              <${Title}>${i18n._('No authenticator tokens')}<///>
              <span>
                ${i18n._(
                  'Add an authenticator secret key to a login record to see it here.'
                )}
              </span>
            <//>
          `
        : html`
            <${ListWrapper}>
              ${totpGroups.map(
                ({ period, records: groupRecords }, groupIndex) => {
                  const firstRecordOtp = otpCodes[groupRecords[0]?.id]
                  const timeRemaining =
                    firstRecordOtp?.timeRemaining ??
                    groupRecords[0]?.otpPublic?.timeRemaining ??
                    null

                  const prevTime = prevTimesRef.current[period] ?? null
                  const timeDiff =
                    prevTime !== null && timeRemaining !== null
                      ? Math.abs(prevTime - timeRemaining)
                      : null
                  if (
                    (timeDiff !== null && timeDiff > 1) ||
                    !(period in noTransitionPeriodsRef.current)
                  ) {
                    noTransitionPeriodsRef.current[period] = true
                  }
                  prevTimesRef.current[period] = timeRemaining

                  const noTransition =
                    noTransitionPeriodsRef.current[period] === true
                  const urgency = getTimerUrgency(timeRemaining, period)
                  // When noTransition: exact position; otherwise target one second ahead
                  const targetTime =
                    timeRemaining !== null
                      ? Math.max(
                          0,
                          noTransition ? timeRemaining : timeRemaining - 1
                        )
                      : 0
                  const progress =
                    timeRemaining !== null
                      ? (1 - targetTime / period) * CIRCLE_CIRCUMFERENCE
                      : 0

                  return html`
                    <div key=${period}>
                      ${groupIndex > 0 && html`<${GroupDivider} />`}
                      <${GroupHeader}>
                        <${GroupTimerRing}>
                          <${TimerSvg} viewBox="0 0 14 14">
                            <${TimerCircleBg} cx="7" cy="7" r="5.5" />
                            <${TimerCircle}
                              cx="7"
                              cy="7"
                              r="5.5"
                              $urgency=${urgency}
                              $dashOffset=${progress}
                              $noTransition=${noTransition}
                            />
                          <//>
                        <//>
                        <${GroupLabel}>
                          <${GroupLabelText}>
                            ${i18n._('Codes expiring in')}${' '}
                          <//>
                          <${GroupTimeValue} $urgency=${urgency}>
                            ${timeRemaining !== null
                              ? `${timeRemaining}s`
                              : `${period}s`}
                          <//>
                        <//>
                      <//>

                      ${groupRecords.map((record) => {
                        const otpData = otpCodes[record.id]
                        const code =
                          otpData?.code ?? record.otpPublic?.currentCode ?? null

                        return html`
                          <${Record}
                            key=${record.id}
                            testId="authenticator-record-item"
                            dataId=${`${record.type}-list-item`}
                            record=${record}
                            otpCode=${code}
                            onClick=${() => handleRecordClick(record)}
                            onSelect=${() => {}}
                          />
                        `
                      })}
                    </div>
                  `
                }
              )}
              ${hotpRecords.length > 0 &&
              html`
                <div>
                  ${totpGroups.length > 0 && html`<${GroupDivider} />`}
                  <${GroupHeader}>
                    <${GroupLabel}>
                      <${GroupLabelText}> ${i18n._('Counter-based')} <//>
                    <//>
                  <//>

                  ${hotpRecords.map((record) => {
                    const otpData = otpCodes[record.id]
                    const code =
                      otpData?.code ?? record.otpPublic?.currentCode ?? null

                    return html`
                      <${Record}
                        key=${record.id}
                        testId="authenticator-record-item"
                        dataId=${`${record.type}-list-item`}
                        record=${record}
                        otpCode=${code}
                        onClick=${() => handleRecordClick(record)}
                        onSelect=${() => {}}
                      />
                    `
                  })}
                </div>
              `}
            <//>
          `}
    <//>
  `
}
