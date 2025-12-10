import { css } from 'styled-components'

import { applyGlobalStyles } from './src/utils/applyGlobalStyles'

export const setFontsAndResetCSS = () => {
  applyGlobalStyles(css`
    @font-face {
      font-family: 'Humble Nostalgia';
      src: url('assets/fonts/humbleNostalgia/HumbleNostalgia.otf')
        format('OpenType');
      font-weight: normal;
      font-style: normal;
    }

    @font-face {
      font-family: 'Inter';
      font-style: normal;
      font-weight: 100 900;
      font-display: swap;
      src: url('assets/fonts/inter/Inter-VariableFont_opsz,wght.ttf')
        format('truetype');
    }

    :root {
      --title-bar-height: 30px;
    }

    pear-ctrl[data-platform='darwin'] {
      margin-top: 12px;
      margin-left: 10px;
    }

    html,
    body,
    div,
    span,
    applet,
    object,
    iframe,
    h1,
    h2,
    h3,
    h4,
    h5,
    h6,
    p,
    blockquote,
    pre,
    a,
    abbr,
    acronym,
    address,
    big,
    cite,
    code,
    del,
    dfn,
    em,
    img,
    ins,
    kbd,
    q,
    s,
    samp,
    small,
    strike,
    strong,
    sub,
    sup,
    tt,
    var,
    b,
    u,
    i,
    center,
    dl,
    dt,
    dd,
    ol,
    ul,
    li,
    fieldset,
    form,
    label,
    legend,
    table,
    caption,
    tbody,
    tfoot,
    thead,
    tr,
    th,
    td,
    article,
    aside,
    canvas,
    details,
    embed,
    figure,
    figcaption,
    footer,
    header,
    hgroup,
    menu,
    nav,
    output,
    ruby,
    section,
    summary,
    time,
    mark,
    audio,
    video {
      margin: 0;
      padding: 0;
      border: 0;
      font-size: 100%;
      font: inherit;
      vertical-align: baseline;
    }
    article,
    aside,
    details,
    figcaption,
    figure,
    footer,
    header,
    hgroup,
    menu,
    nav,
    section {
      display: block;
    }

    * {
      box-sizing: border-box;
    }
    html {
      height: 100%;
      display: flex;
      padding-top: var(--title-bar-height);
    }
    body {
      line-height: 1;
      flex: 1;
    }
    #root {
      height: 100%;
    }
    #bar {
      backdrop-filter: blur(64px);
      -webkit-app-region: drag;
      height: var(--title-bar-height);
      padding: 0;
      color: ${({ theme }) => theme.colors.white.mode1};
      white-space: nowrap;
      position: fixed;
      z-index: 10000;
      width: 100%;
      left: 0;
      top: 0;
    }
    ol,
    ul {
      list-style: none;
    }
    blockquote,
    q {
      quotes: none;
    }
    blockquote:before,
    blockquote:after,
    q:before,
    q:after {
      content: '';
      content: none;
    }
    table {
      border-collapse: collapse;
      border-spacing: 0;
    }
    input {
      background-color: transparent;
      border: none;
    }
    input:focus {
      outline: none;
    }

    *::-webkit-scrollbar {
      display: none;
    }
  `)
}
