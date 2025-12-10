export function applyGlobalStyles(styles) {
  const styleSheet = document.createElement('style')
  styleSheet.innerHTML = styles
  document.head.appendChild(styleSheet)
}
