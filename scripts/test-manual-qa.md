# Manual QA Testing Checklist for BonusGo

## Overview
This checklist covers critical user flows and edge cases that should be manually tested after running the automated test suite.

## Pre-Testing Setup
- [ ] Ensure test database is seeded with sample data
- [ ] Verify all environment variables are set correctly
- [ ] Clear browser cache and cookies
- [ ] Test in both Chrome and Safari (primary Canadian browsers)

## 1. User Onboarding Flow

### New User Registration
- [ ] Sign up with valid email
- [ ] Verify email confirmation works
- [ ] Complete profile setup with valid data
- [ ] Test with various income levels ($30k, $75k, $150k+)
- [ ] Test with different credit score ranges
- [ ] Verify spending profile form accepts valid inputs
- [ ] Test form validation with invalid inputs

### Edge Cases
- [ ] Sign up with existing email (should show appropriate error)
- [ ] Leave required fields empty
- [ ] Enter negative income or spending amounts
- [ ] Enter extremely high values (>$1M income, >$50k monthly spending)
- [ ] Test with special characters in name fields
- [ ] Test with very long text inputs

## 2. Recommendation Engine

### Basic Recommendation Flow
- [ ] Generate recommendations with typical spending profile
- [ ] Verify recommendations match user preferences
- [ ] Check that annual fee limits are respected
- [ ] Confirm preferred point types influence results
- [ ] Verify signup bonus prioritization works

### Spending Pattern Testing
- [ ] Test with zero spending in all categories
- [ ] Test with high spending in single category
- [ ] Test with balanced spending across categories
- [ ] Test with unusual spending patterns (e.g., high entertainment, low grocery)

### Credit Profile Testing
- [ ] Test with excellent credit (should see premium cards)
- [ ] Test with fair credit (should see entry-level cards)
- [ ] Test with poor credit (should see secured/basic cards)
- [ ] Test income vs. card eligibility matching

### Edge Cases
- [ ] User with no preferred point types
- [ ] User with $0 annual fee limit
- [ ] User with very high annual fee tolerance ($1000+)
- [ ] User prioritizing signup bonus vs. long-term value
- [ ] Test with malformed spending data

## 3. Card Optimization Engine

### Portfolio Optimization
- [ ] Add multiple cards to user portfolio
- [ ] Generate optimization recommendations
- [ ] Verify best card per category calculations
- [ ] Check monthly/annual reward projections
- [ ] Test with cards having spending caps

### Edge Cases
- [ ] User with no cards in portfolio
- [ ] User with single card
- [ ] User with duplicate cards
- [ ] Cards with expired bonuses/multipliers
- [ ] Cards with complex spending limits

## 4. User Profile Management

### Profile Updates
- [ ] Update spending profile and verify recommendations change
- [ ] Update income and verify card eligibility changes
- [ ] Update preferred point types and verify impact
- [ ] Update annual fee tolerance

### Data Persistence
- [ ] Refresh page and verify data persists
- [ ] Log out and log back in
- [ ] Test concurrent sessions (multiple tabs)

## 5. Premium Features (if applicable)

### Subscription Flow
- [ ] Upgrade to premium subscription
- [ ] Verify premium features are unlocked
- [ ] Test billing portal access
- [ ] Test subscription cancellation

### Premium-Only Features
- [ ] Advanced optimization features
- [ ] Historical tracking
- [ ] Export functionality
- [ ] Priority support access

## 6. Admin Dashboard

### Card Data Management
- [ ] Add new card with bonuses and multipliers
- [ ] Update existing card information
- [ ] Deactivate/reactivate cards
- [ ] Bulk update operations

### Data Update Pipeline
- [ ] Create manual card updates
- [ ] Process pending updates
- [ ] Review update history
- [ ] Handle failed updates

### System Monitoring
- [ ] View system statistics
- [ ] Monitor recommendation performance
- [ ] Check error logs
- [ ] Review user activity

## 7. API Endpoints

### Recommendation API
- [ ] Test `/api/recommend` with valid profile
- [ ] Test with invalid/malformed data
- [ ] Test authentication requirements
- [ ] Verify response format and data types

### Optimization API
- [ ] Test `/api/optimize/cards` with spending profile
- [ ] Test with edge case spending patterns
- [ ] Verify calculation accuracy
- [ ] Test error handling

### Profile API
- [ ] Test profile CRUD operations
- [ ] Test data validation
- [ ] Test concurrent updates
- [ ] Verify data consistency

## 8. Performance Testing

### Load Testing
- [ ] Test with large card database (100+ cards)
- [ ] Test recommendation generation speed
- [ ] Test with complex user profiles
- [ ] Monitor memory usage during operations

### Response Times
- [ ] Recommendation generation < 3 seconds
- [ ] Profile updates < 1 second
- [ ] Page loads < 2 seconds
- [ ] API responses < 1 second

## 9. Security Testing

### Authentication
- [ ] Test unauthorized access to protected routes
- [ ] Verify JWT token expiration handling
- [ ] Test session management
- [ ] Verify user data isolation

### Data Validation
- [ ] Test SQL injection attempts
- [ ] Test XSS prevention
- [ ] Verify input sanitization
- [ ] Test CSRF protection

## 10. Browser Compatibility

### Desktop Testing
- [ ] Chrome (latest)
- [ ] Safari (latest)
- [ ] Firefox (latest)
- [ ] Edge (latest)

### Mobile Testing
- [ ] iOS Safari
- [ ] Android Chrome
- [ ] Responsive design verification
- [ ] Touch interaction testing

## 11. Error Handling

### Network Errors
- [ ] Test with slow network connection
- [ ] Test with intermittent connectivity
- [ ] Test offline behavior
- [ ] Verify error messages are user-friendly

### Server Errors
- [ ] Test database connection failures
- [ ] Test API timeout scenarios
- [ ] Test rate limiting
- [ ] Verify graceful degradation

## 12. Data Accuracy

### Calculation Verification
- [ ] Manually verify reward calculations
- [ ] Check multiplier applications
- [ ] Verify spending cap handling
- [ ] Confirm point valuations

### Recommendation Quality
- [ ] Verify recommendations make sense for user profile
- [ ] Check that explanations are accurate
- [ ] Confirm confidence scores are reasonable
- [ ] Test edge cases produce sensible results

## Post-Testing

### Documentation
- [ ] Document any bugs found
- [ ] Note performance issues
- [ ] Record user experience feedback
- [ ] Update test cases based on findings

### Regression Testing
- [ ] Re-test critical flows after bug fixes
- [ ] Verify no new issues introduced
- [ ] Confirm all automated tests still pass
- [ ] Update automated tests if needed

## Test Environment Cleanup
- [ ] Clear test data
- [ ] Reset database to clean state
- [ ] Clear application logs
- [ ] Document test results

---

## Notes
- Mark each item as complete with date and tester initials
- Document any issues found with severity level
- Include screenshots for UI-related issues
- Note any deviations from expected behavior
- Record performance metrics where applicable