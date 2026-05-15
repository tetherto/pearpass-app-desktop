export type ImportState = 'default' | 'upload' | 'inputPassword'

export enum ImportOptionType {
  OnePassword = '1password',
  Bitwarden = 'bitwarden',
  KeePass = 'keepass',
  KeePassKDBX = 'keepass-kdbx',
  LastPass = 'lastpass',
  NordPass = 'nordpass',
  ProtonPass = 'protonpass',
  Unencrypted = 'unencrypted',
  Encrypted = 'encrypted'
}

export type ImportOption = {
  title: string
  type: ImportOptionType
  description: string
  testId?: string
  accepts: string[]
  supportLink?: string
  learnMoreUrl?: string
}

export type FileInfo = {
  fileContent: string | ArrayBuffer
  fileType: string
  filename: string
  size: number
  isEncrypted: boolean
  parsedJson: Record<string, unknown> | null
}
