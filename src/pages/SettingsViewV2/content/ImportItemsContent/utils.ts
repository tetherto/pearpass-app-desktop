import { ImportOptionType } from './types'

/**
 * Safely parses file content as a JSON object.
 *
 * Returns the parsed object, or `null` when the content is not a string,
 * is not valid JSON, or does not decode to a plain object (e.g. an array or
 * a primitive). Parsing here lets callers reuse the result instead of
 * re-parsing the same file content downstream.
 */
export const parseJsonContent = (
  fileContent: string | ArrayBuffer
): Record<string, unknown> | null => {
  if (typeof fileContent !== 'string') return null

  try {
    const parsed = JSON.parse(fileContent)
    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>
    }
    return null
  } catch {
    return null
  }
}

/**
 * Determines whether an uploaded export needs a password before it can be
 * imported.
 *
 * Bitwarden ships two encrypted variants:
 *  - account-restricted exports set `encrypted: true` only — they are encrypted
 *    with the account key and can only be re-imported on the same Bitwarden
 *    account, so a password can never decrypt them
 *  - password-protected exports set both `encrypted` and `passwordProtected` —
 *    this is the only variant `decryptBitwardenJson` supports
 *
 * So for Bitwarden we require `passwordProtected === true`; otherwise an
 * account-restricted export would falsely gate on a password screen that can
 * never succeed.
 */
export const detectIsEncrypted = (
  importType: ImportOptionType,
  fileType: string,
  parsedJson: Record<string, unknown> | null
): boolean => {
  if (fileType !== 'json' || !parsedJson) return false

  if (importType === ImportOptionType.Bitwarden) {
    return parsedJson.encrypted === true && parsedJson.passwordProtected === true
  }

  return parsedJson.encrypted === true
}
