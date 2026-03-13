import { useMemo, useState } from 'react'

import { useLingui } from '@lingui/react'
import { html } from 'htm/react'
import { colors } from 'pearpass-lib-ui-theme-provider'
import { useRecords, isExpiring, groupOtpRecords } from 'pearpass-lib-vault'

import {
  EmptyState,
  EmptyStateCTAs,
  EmptyStateDescription,
  EmptyStatePrimaryButton,
  EmptyStateSecondaryButton,
  EmptyStateTextGroup,
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
import { useCreateOrEditRecord } from '../../hooks/useCreateOrEditRecord'
import {
  AuthenticatorIllustration,
  PlusIcon,
  SaveIcon
} from '../../lib-react-components'

export const AuthenticatorView = () => {
  const { i18n } = useLingui()
  const { navigate } = useRouter()
  const { handleCreateOrEditRecord } = useCreateOrEditRecord()
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

  const handleRecordClick = (record) => {
    // Stay in authenticator view, just open the sidebar
    navigate('vault', {
      recordId: record.id,
      recordType: 'authenticator'
    })
  }

  const { totpGroups, hotpRecords } = useMemo(
    () => groupOtpRecords(otpRecords),
    [otpRecords]
  )

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
              <${AuthenticatorIllustration} width="100%" height="151" />

              <${EmptyStateTextGroup}>
                <${Title}>${i18n._('No codes saved')}<///>
                <${EmptyStateDescription}>
                  ${i18n._(
                    'Save your first authenticator code or import your codes from another authenticator app.'
                  )}
                <//>
              <//>

              <${EmptyStateCTAs}>
                <${EmptyStatePrimaryButton}
                  onClick=${() => handleCreateOrEditRecord({ recordType: 'login' })}
                >
                  <${PlusIcon} size="16" color=${colors.grey500.mode1} />
                  ${i18n._('Add Code')}
                <//>
                <${EmptyStateSecondaryButton}
                  onClick=${() => navigate('settings', { initialTab: 'vault' })}
                >
                  <${SaveIcon} size="16" color=${colors.primary400.mode1} />
                  ${i18n._('Import Codes')}
                <//>
              <//>
            <//>
          `
        : html`
            <${ListWrapper}>
              ${totpGroups.map(
                ({ period, records: groupRecords }, groupIndex) => {
                  const timeRemaining =
                    groupRecords[0]?.otpPublic?.timeRemaining ?? null

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

                      ${groupRecords.map(
                        (record) => html`
                          <${Record}
                            key=${record.id}
                            testId="authenticator-record-item"
                            dataId=${`${record.type}-list-item`}
                            record=${record}
                            otpCode=${record.otpPublic?.currentCode ?? null}
                            onClick=${() => handleRecordClick(record)}
                            onSelect=${() => {}}
                          />
                        `
                      )}
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

                  ${hotpRecords.map(
                    (record) => html`
                      <${Record}
                        key=${record.id}
                        testId="authenticator-record-item"
                        dataId=${`${record.type}-list-item`}
                        record=${record}
                        otpCode=${record.otpPublic?.currentCode ?? null}
                        onClick=${() => handleRecordClick(record)}
                        onSelect=${() => {}}
                      />
                    `
                  )}
                </div>
              `}
            <//>
          `}
    <//>
  `
}
