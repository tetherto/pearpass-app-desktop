param(
  [string]$SecretPath,
  [string]$StatePath,
  [string]$Token,
  [int]$DelayMs
)

try {
  $expected = ''

  try {
    if (-not (Test-Path -LiteralPath $SecretPath)) {
      exit 0
    }

    $expected = [System.IO.File]::ReadAllText($SecretPath, [System.Text.Encoding]::UTF8)
  } finally {
    Remove-Item -LiteralPath $SecretPath -Force -ErrorAction SilentlyContinue
  }

  Start-Sleep -Milliseconds $DelayMs

  $currentToken = ''
  try {
    if (Test-Path -LiteralPath $StatePath) {
      $currentToken = [System.IO.File]::ReadAllText($StatePath, [System.Text.Encoding]::UTF8)
    }
  } catch {
    $currentToken = ''
  }

  if (-not [string]::Equals($currentToken, $Token, [System.StringComparison]::Ordinal)) {
    exit 0
  }

  $clipboardText = ''
  try {
    $clipboardText = Get-Clipboard -Raw
  } catch {
    $clipboardText = ''
  }

  if ([string]::Equals($clipboardText, $expected, [System.StringComparison]::Ordinal)) {
    Set-Clipboard -Value ''
  }

  $latestToken = ''
  try {
    if (Test-Path -LiteralPath $StatePath) {
      $latestToken = [System.IO.File]::ReadAllText($StatePath, [System.Text.Encoding]::UTF8)
    }
  } catch {
    $latestToken = ''
  }

  if ([string]::Equals($latestToken, $Token, [System.StringComparison]::Ordinal)) {
    Remove-Item -LiteralPath $StatePath -Force -ErrorAction SilentlyContinue
  }
} catch {
  exit 1
}
