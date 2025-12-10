import { Validator } from 'pear-apps-utils-validator'

import { logger } from './logger'

export const deviceSchema = Validator.object({
  id: Validator.string().required(),
  vaultId: Validator.string().required(),
  name: Validator.string().required(),
  createdAt: Validator.number().required()
})

export const validateAndPrepareDevice = (device) => {
  const errors = deviceSchema.validate(device)

  if (errors) {
    logger.error(`Invalid device data: ${JSON.stringify(errors, null, 2)}`)

    throw new Error(`Invalid device data: ${JSON.stringify(errors, null, 2)}`)
  }

  return device
}
