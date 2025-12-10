export class Color {
  constructor(mode1, option1, dark, white) {
    this.mode1 = mode1
    this.option1 = option1 || mode1
    this.dark = dark || mode1
    this.white = white || mode1
  }
}

export const colors = {
  black: new Color('#050B06'),
  white: new Color('#F6F6F6'),
  primary100: new Color('#949A83'),
  primary200: new Color('#99A578'),
  primary300: new Color('#A3BB62'),
  primary400: new Color('#BADE5B', '#B0D944', '#B0D944', '#B0D944'),
  primary500: new Color('#B2DD40'),
  secondary100: new Color('#A5BFC0'),
  secondary200: new Color('#779FA1'),
  secondary300: new Color('#5F8587'),
  secondary400: new Color('#2A3B3C'),
  secondary500: new Color('#202C2D'),
  cyan100: new Color('#98A7AB'),
  cyan200: new Color('#8FADB4'),
  cyan300: new Color('#85B3BE'),
  cyan400: new Color('#73BED0'),
  cyan500: new Color('#60CAE3'),
  grey100: new Color('#BABABA'),
  grey200: new Color('#999999'),
  grey300: new Color('#666666'),
  grey350: new Color('#393939'),
  grey400: new Color('#303030'),
  grey500: new Color('#232323'),
  blue100: new Color('#C3D4EB'),
  blue200: new Color('#BCD3F2'),
  blue300: new Color('#8CB8F2'),
  blue400: new Color('#478DEB'),
  blue500: new Color('#1970E6'),
  categoryAll: new Color('#779FA1', '#2A8962', '#7AAF7B', '#7AAF7B'),
  categoryLogin: new Color('#D567FA', '#A0996B', '#E6AA68', '#6E9700'),
  categoryIdentity: new Color('#D65C5E', '#E5ED97', '#E9BCB7', '#C2E2AA'),
  categoryCreditCard: new Color('#8A63FF', '#CECECE', '#BEBEBE', '#E6E8AC'),
  categoryNote: new Color('#F2BA40', '#8FBC7F', '#6E9700', '#2A8962'),
  categoryCustom: new Color('#496FF9', '#496FF9', '#C3A2D2', '#ACB1E8'),
  categoryPassword: new Color('#ED8E1A', '#ED8E1A', '#9ACEBF', '#F6DC85'),
  categoryWifiPassword: new Color('#779FA1', '#2A8962', '#F3EF72', '#7AAF9B'),
  categoryPassPhrase: new Color('#779FA1', '#2A8962', '#55C357', '#7AAF9B'),
  errorRed: new Color('#D13B3D', '#D13B3D', '#D65C5E', '#D65C5E'),
  errorGreen: new Color('#76D944'),
  errorYellow: new Color('#FFAE00', '#F2BA40', '#F2BA40', '#F2BA40')
}
