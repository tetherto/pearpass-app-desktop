import { useMemo, useState } from 'react'

import { useLingui } from '@lingui/react'
import { html } from 'htm/react'
import {
  useRecords,
  useOtpCodes,
  isExpiring,
  OTP_TYPE
} from 'pearpass-lib-vault'

import {
  EmptyState,
  GroupDivider,
  GroupHeader,
  GroupLabel,
  GroupLabelText,
  GroupTimeValue,
  Header,
  ListWrapper,
  Title,
  Wrapper
} from './styles'
import { InputSearch } from '../../components/InputSearch'
import { Record } from '../../components/Record'
import { TimerCircle } from '../../components/TimerCircle'
import { useRouter } from '../../context/RouterContext'

export const AuthenticatorView = () => {
  const { i18n } = useLingui()
  const { navigate } = useRouter()
  const [searchValue, setSearchValue] = useState('')

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

  // Client-side filter as safety net
  const otpRecords = useMemo(
    () => (records || []).filter((r) => r.otpPublic),
    [records]
  )

  const { otpCodes } = useOtpCodes(otpRecords)

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
      if (record.otpPublic?.type === OTP_TYPE.HOTP) {
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

                  const expiring = isExpiring(timeRemaining)

                  return html`
                    <div key=${period}>
                      ${groupIndex > 0 && html`<${GroupDivider} />`}
                      <${GroupHeader}>
                        <${TimerCircle}
                          timeRemaining=${timeRemaining}
                          period=${period}
                        />
                        <${GroupLabel}>
                          <${GroupLabelText}>
                            ${i18n._('Codes expiring in')}${' '}
                          <//>
                          <${GroupTimeValue} $expiring=${expiring}>
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
