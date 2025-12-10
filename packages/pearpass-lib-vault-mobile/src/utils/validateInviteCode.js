import { Validator } from 'pear-apps-utils-validator'

import { logger } from './logger'

const INVITE_CODE_REGEX = /^[a-zA-Z0-9]*(?:\/[a-zA-Z0-9]*)?$/
const INVITE_CODE_MIN_LENGTH = 100

export const inviteCodeSchema = Validator.object({
  code: Validator.string().refine((value) => {
    const isValid =
      value.length > INVITE_CODE_MIN_LENGTH && INVITE_CODE_REGEX.test(value)

    if (!isValid) {
      return 'Invalid invite code format'
    }

    return null
  })
})

export const validateInviteCode = (code) => {
  const errors = inviteCodeSchema.validate({
    code
  })

  if (errors) {
    logger.error(`Invalid invite code: ${JSON.stringify(errors, null, 2)}`)

    throw new Error(`Invalid invite code: ${JSON.stringify(errors, null, 2)}`)
  }

  return code
}
