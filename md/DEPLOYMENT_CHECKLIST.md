# Deployment Checklist - Transaction Intelligence & Beta User Flow

Use this checklist to deploy Steps 7-9 fixes to production.

---

## Pre-Deployment

### Code Review
- [ ] Review `lib/services/merchantNormalizer.ts`
- [ ] Review `lib/data/merchantCategories.ts`
- [ ] Review all new components (3 files)
- [ ] Review all new API routes (3 files)
- [ ] Review database migration SQL
- [ ] Review modified files (app/page.tsx, API routes)

### Testing - Staging Environment
- [ ] Run database migration successfully
- [ ] Verify all tables created with correct schema
- [ ] Test POST /api/profile/card-mappings
- [ ] Test GET /api/profile/card-mappings
- [ ] Test POST /api/transactions/correct-category
- [ ] Test POST /api/feedback
- [ ] Verify CardMappingModal renders
- [ ] Verify CategoryCorrectionModal renders
- [ ] Verify BetaFeedbackWidget renders
- [ ] Test mobile responsiveness
- [ ] Verify analytics events fire in PostHog
- [ ] Check error handling for all APIs
- [ ] Test with invalid inputs
- [ ] Verify authentication checks work

### Performance Testing
- [ ] Database query performance acceptable
- [ ] API response times <500ms
- [ ] No N+1 query issues
- [ ] Indexes created successfully
- [ ] Page load time unchanged

### Security Review
- [ ] All API routes require authentication
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention verified
- [ ] XSS prevention in components
- [ ] CSRF protection enabled
- [ ] Rate limiting applied
- [ ] Audit logging implemented

---

## Deployment - Stage 1: Database

### Backup
- [ ] Create full database backup
- [ ] Verify backup is restorable
- [ ] Document backup location
- [ ] Set backup retention policy

### Migration
- [ ] Update Prisma schema with new models
- [ ] Run `npx prisma migrate deploy` in production
- [ ] Verify all tables created
- [ ] Verify all indexes created
- [ ] Check foreign key constraints
- [ ] Run `npx prisma generate`
- [ ] Verify no migration errors

### Validation
- [ ] Query new tables successfully
- [ ] Verify existing data intact
- [ ] Check application still works
- [ ] Monitor error logs for 15 minutes

**Rollback Plan:** If issues, run DROP TABLE statements and restore from backup

---

## Deployment - Stage 2: Backend (APIs)

### Deploy API Routes
- [ ] Deploy new API endpoints
- [ ] Verify /api/profile/card-mappings responds
- [ ] Verify /api/transactions/correct-category responds
- [ ] Verify /api/feedback responds
- [ ] Check authentication works
- [ ] Test with real user account

### Deploy Services
- [ ] Deploy merchantNormalizer service
- [ ] Deploy merchant category database
- [ ] Verify imports work correctly
- [ ] Test normalization logic

### Validation
- [ ] Make test API calls
- [ ] Verify responses are correct
- [ ] Check error handling
- [ ] Monitor error logs for 15 minutes
- [ ] Verify existing APIs still work

**Rollback Plan:** Revert to previous deployment, APIs return 503

---

## Deployment - Stage 3: Frontend (Components)

### Deploy Components
- [ ] Deploy CardMappingModal
- [ ] Deploy CategoryCorrectionModal
- [ ] Deploy BetaFeedbackWidget
- [ ] Verify components render
- [ ] Test modal open/close
- [ ] Test form submissions

### Deploy Landing Page Updates
- [ ] Deploy FAQ section
- [ ] Deploy Security section
- [ ] Verify responsive layout
- [ ] Test all links work
- [ ] Check mobile view

### Validation
- [ ] Test complete user flow
- [ ] Verify no console errors
- [ ] Check mobile responsiveness
- [ ] Test on different browsers
- [ ] Monitor error logs for 15 minutes

**Rollback Plan:** Revert frontend deployment, hide components with feature flags

---

## Deployment - Stage 4: Analytics

### Verify Events
- [ ] Test recommendation_completed fires
- [ ] Test plaid_connected fires
- [ ] Test card_mapping_completed fires
- [ ] Test category_corrected fires
- [ ] Test beta_feedback_submitted fires

### PostHog Verification
- [ ] Events appear in PostHog dashboard
- [ ] Event properties are correct
- [ ] No duplicate events
- [ ] User identification works
- [ ] Session recording works

### Validation
- [ ] Perform each action and verify event
- [ ] Check event properties match schema
- [ ] Verify no performance impact
- [ ] Monitor for 30 minutes

**Rollback Plan:** Analytics failures don't affect user experience, can be fixed post-deployment

---

## Post-Deployment

### Immediate (First Hour)
- [ ] Monitor error logs continuously
- [ ] Check database performance
- [ ] Verify API response times
- [ ] Watch for user reports
- [ ] Check analytics dashboard
- [ ] Test critical user flows

### First Day
- [ ] Review error logs every 2 hours
- [ ] Check database growth rate
- [ ] Monitor API usage patterns
- [ ] Collect user feedback
- [ ] Verify analytics data quality
- [ ] Check performance metrics

### First Week
- [ ] Daily error log review
- [ ] Track feature adoption rates
- [ ] Monitor merchant recognition accuracy
- [ ] Review user corrections
- [ ] Analyze beta feedback
- [ ] Optimize based on data

---

## Success Criteria

### Technical
- [ ] Zero critical errors
- [ ] <5 minor errors per day
- [ ] API response times <500ms
- [ ] Database queries <100ms
- [ ] Page load time unchanged
- [ ] Mobile performance good

### User Adoption
- [ ] 10+ users map bank accounts (Week 1)
- [ ] 50+ transactions normalized (Week 1)
- [ ] 5+ category corrections (Week 1)
- [ ] 3+ beta feedback submissions (Week 1)

### Quality
- [ ] 80%+ merchant recognition accuracy
- [ ] <20% transactions need review
- [ ] Positive user feedback
- [ ] No major bugs reported

---

## Rollback Triggers

Execute rollback if:
- [ ] Critical errors affecting >10% of users
- [ ] Database performance degraded >50%
- [ ] API response times >2 seconds
- [ ] Data corruption detected
- [ ] Security vulnerability discovered
- [ ] User complaints spike >5x normal

---

## Rollback Procedure

### Step 1: Disable Features (5 min)
```typescript
// In environment variables or feature flags
ENABLE_CARD_MAPPING=false
ENABLE_CATEGORY_CORRECTION=false
ENABLE_BETA_FEEDBACK=false
ENABLE_TRANSACTION_INTELLIGENCE=false
```

### Step 2: Revert Frontend (10 min)
```bash
# Revert to previous deployment
git revert <commit-hash>
npm run build
# Deploy previous version
```

### Step 3: Revert Backend (10 min)
```bash
# Revert API changes
git revert <commit-hash>
# Redeploy previous version
```

### Step 4: Rollback Database (30 min)
```sql
-- Only if absolutely necessary
DROP TABLE IF EXISTS "BetaFeedback";
DROP TABLE IF EXISTS "CardMapping";
DROP TABLE IF EXISTS "Transaction";

-- Restore from backup if data corruption
-- (Follow backup restoration procedure)
```

### Step 5: Verify Rollback
- [ ] Application works normally
- [ ] No errors in logs
- [ ] Users can access all features
- [ ] Performance restored

**Total Rollback Time:** <1 hour

---

## Communication Plan

### Before Deployment
**To:** Engineering Team  
**Message:** "Deploying transaction intelligence layer today. Staged deployment over 4 hours. Monitor #engineering-alerts channel."

### During Deployment
**To:** Support Team  
**Message:** "New features deploying: card mapping, category correction, beta feedback. May see questions. Documentation in Notion."

### After Deployment
**To:** All Users (if successful)  
**Message:** "New features available! Map your bank accounts, correct transaction categories, and share feedback. Check your dashboard."

### If Issues Arise
**To:** Engineering Team  
**Message:** "Issue detected in [component]. Rolling back [stage]. ETA [time]."

**To:** Users (if major issue)  
**Message:** "We're experiencing technical difficulties. Working on a fix. Your data is safe."

---

## Monitoring Dashboards

### Create Alerts
- [ ] High error rate (>10 errors/min)
- [ ] Slow API responses (>1s)
- [ ] Database connection issues
- [ ] Plaid API failures
- [ ] Low merchant recognition (<70%)

### Dashboard Widgets
- [ ] Transaction sync rate
- [ ] Merchant recognition accuracy
- [ ] Category correction rate
- [ ] Beta feedback count
- [ ] API response times
- [ ] Error rates by endpoint

---

## Documentation Updates

### Update After Deployment
- [ ] Add new features to user documentation
- [ ] Update API documentation
- [ ] Add troubleshooting guides
- [ ] Update support team knowledge base
- [ ] Create video tutorials (optional)

---

## Sign-off

### Required Approvals
- [ ] Engineering Lead
- [ ] Product Manager
- [ ] DevOps Lead
- [ ] Security Review (if required)

### Deployment Authorization
- [ ] Scheduled maintenance window (if needed)
- [ ] Stakeholders notified
- [ ] Support team briefed
- [ ] Rollback plan reviewed

**Deployment Date:** _______________  
**Deployment Time:** _______________  
**Deployed By:** _______________  
**Verified By:** _______________

---

## Post-Deployment Report

### Metrics to Collect
- Deployment duration: _______
- Downtime (if any): _______
- Errors encountered: _______
- Rollbacks performed: _______
- User impact: _______

### Lessons Learned
- What went well: _______________________
- What could improve: _______________________
- Action items: _______________________

---

**Last Updated:** March 13, 2026  
**Version:** 1.0  
**Status:** Ready for deployment
