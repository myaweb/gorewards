# PowerShell script to fix all crypto imports
# Replaces crypto.randomBytes with Edge Runtime compatible version

$files = @(
  "lib/services/performanceMonitor.ts",
  "lib/services/merchantNormalizer.ts",
  "lib/services/inputValidator.ts",
  "lib/services/errorMonitor.ts",
  "lib/services/confidenceScorer.ts",
  "lib/services/adminAuthenticator.ts",
  "lib/services/webhookVerifier.ts"
)

foreach ($file in $files) {
  if (Test-Path $file) {
    Write-Host "Processing $file..."
    $content = Get-Content $file -Raw
    
    # Replace import
    $content = $content -replace "import crypto from 'crypto'", "import { generateCorrelationId, generateSessionId } from '../utils/crypto'"
    
    # Replace crypto.randomBytes(16).toString('hex')
    $content = $content -replace "crypto\.randomBytes\(16\)\.toString\('hex'\)", "generateCorrelationId()"
    
    # Replace crypto.randomBytes(32).toString('hex')
    $content = $content -replace "crypto\.randomBytes\(32\)\.toString\('hex'\)", "generateSessionId()"
    
    # Save
    Set-Content -Path $file -Value $content -NoNewline
    Write-Host "✓ Fixed $file"
  }
}

Write-Host "`n✅ All files fixed!"
