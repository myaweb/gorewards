# Crypto Import Fix Script

Bu dosyalar `crypto.randomBytes` kullanıyor ve Edge Runtime uyumlu hale getirilmeli:

## Değiştirilecek Pattern

**Eski:**
```typescript
import crypto from 'crypto'
const correlationId = crypto.randomBytes(16).toString('hex')
const sessionId = crypto.randomBytes(32).toString('hex')
```

**Yeni:**
```typescript
import { generateCorrelationId, generateSessionId } from '@/lib/utils/crypto'
const correlationId = generateCorrelationId()
const sessionId = generateSessionId()
```

## Dosya Listesi

### ✅ Tamamlanan
1. lib/middleware/securityHeaders.ts
2. lib/middleware/security.ts

### 🔄 Yapılacak
3. lib/middleware/adminAuth.ts
4. lib/services/rateLimiter.ts
5. lib/services/performanceMonitor.ts
6. lib/services/merchantNormalizer.ts
7. lib/services/inputValidator.ts
8. lib/services/errorMonitor.ts
9. lib/services/confidenceScorer.ts
10. lib/services/adminAuthenticator.ts
11. lib/services/tokenEncryptor.ts (özel durum - IV generation)
12. lib/services/webhookVerifier.ts
