import { ImportOptionType } from './types'

/**
 * Bitwarden's `KdfType` enum:
 *   0 = PBKDF2-SHA256 (fast)
 *   1 = Argon2id      (deliberately slow — can take minutes on lower-end devices)
 */
const BITWARDEN_KDF_ARGON2 = 1

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

/**
 * Whether a password-protected Bitwarden export uses Argon2id as its KDF.
 *
 * Bitwarden's Argon2 defaults (64 MiB memory, 3 iterations, parallelism 4) are
 * deliberately memory-hard and can take **minutes** to derive a key on lower-
 * end devices, vs. effectively instant for PBKDF2. We surface a heads-up on
 * the password screen so the user doesn't think the app has hung.
 *
 * Returns false for any non-Bitwarden export, for unencrypted JSON, or when
 * the KDF metadata is missing.
 */
export const isArgon2BitwardenExport = (
  parsedJson: Record<string, unknown> | null
): boolean => parsedJson?.kdfType === BITWARDEN_KDF_ARGON2
