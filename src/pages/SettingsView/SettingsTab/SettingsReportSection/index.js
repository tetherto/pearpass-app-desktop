import { html } from 'htm/react'

import { ButtonWrapper, Form } from './styles'
import { CardSingleSetting } from '../../../../components/CardSingleSetting'
import { ButtonSecondary, TextArea } from '../../../../lib-react-components'

/**
 * @param {{
 *    onSubmitReport: () => void,
 *    message: string,
 *    title: string,
 *    buttonText: string,
 *    textAreaPlaceholder: string,
 *    textAreaOnChange: (value: string) => void
 *  }} props
 */
export const SettingsReportSection = ({
  onSubmitReport,
  message,
  title,
  description,
  buttonText,
  textAreaPlaceholder,
  textAreaOnChange
}) => html`
  <${CardSingleSetting}
    testId="settings-card-report"
    title=${title}
    description=${description}
  >
    <${Form}
      onSubmit=${(e) => {
        e.preventDefault()
        onSubmitReport()
      }}
    >
      <${TextArea}
        testId="settings-report-textarea"
        value=${message}
        onChange=${(value) => textAreaOnChange(value)}
        variant="report"
        placeholder=${textAreaPlaceholder}
      />
      <${ButtonWrapper}>
        <${ButtonSecondary} type="submit" testId="settings-report-send-button">
          ${buttonText}
        <//>
      <//>
    <//>
  <//>
`
