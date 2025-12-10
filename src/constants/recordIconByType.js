import {
  CreditCardIcon,
  FullBodyIcon,
  KeyIcon,
  LockIcon,
  NoteIcon,
  PasswordIcon,
  UserIcon,
  PassPhraseIcon
} from '../lib-react-components'
import { WifiIcon } from '../lib-react-components/icons/WifiIcon'

export const RECORD_ICON_BY_TYPE = {
  all: KeyIcon,
  login: UserIcon,
  identity: FullBodyIcon,
  creditCard: CreditCardIcon,
  note: NoteIcon,
  custom: LockIcon,
  password: PasswordIcon,
  wifiPassword: WifiIcon,
  passPhrase: PassPhraseIcon
}
