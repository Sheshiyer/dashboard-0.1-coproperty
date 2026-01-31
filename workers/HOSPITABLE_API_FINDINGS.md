# Hospitable API v2 Investigation Findings
**Date:** 2026-01-31
**Status:** Phase 1 Scoping Complete

---

## 🔍 Token Scope Analysis

### Current Token Scopes
```
- pat:read
- pat:write
```

**Token Expiry:** 2027-01-31 (364 days remaining)

### Missing Required Scopes
```
❌ financials:read
❌ reviews:read
❌ messages:read
```

**Impact:** Cannot access enhanced financial data, reviews, or messages endpoints with current token.

**Action Required:** Regenerate Personal Access Token with additional scopes at https://app.hospitable.com/settings/api

---

## 📊 Endpoint Testing Results

### ✅ Working Endpoints

| Endpoint | Status | Notes |
|----------|--------|-------|
| `GET /properties` | ✅ 200 OK | Returns 10 properties per page |
| `GET /properties?include=images` | ✅ 200 OK | Returns `picture` field (single URL), NOT `images[]` array |
| `GET /reservations?properties[]=xxx&include=financials` | ✅ 200 OK | Requires `properties[]` parameter |

**Key Finding - Property Images:**
- The `?include=images` parameter does NOT return an `images[]` array
- Instead, properties have a single `picture` field with URL
- Example: `https://a0.muscache.com/im/pictures/hosting/Hosting-xxx/original/xxx.jpeg?aki_policy=small`

### ❌ Not Found Endpoints

| Endpoint | Status | Notes |
|----------|--------|-------|
| `GET /reservation-messages` | ❌ 404 | Endpoint does not exist |
| `GET /messages` | ❌ 404 | Endpoint does not exist |
| `GET /reviews` | ❌ 404 | Endpoint does not exist |

**Key Finding:** These endpoints are NOT available in Hospitable API v2.

---

## 📖 Documentation Research

### Messages API
According to official docs:
- **Endpoint:** `GET /reservations/{id}/messages` (per-reservation messages)
- **Docs:** https://developer.hospitable.com/docs/public-api-docs/n6jr1z9iwhm8w-get-reservation-messages
- **Send Messages:** `POST /reservations/{id}/messages` available
- **Rate Limits:** 2 messages/min per reservation, 50 messages per 5 minutes
- **Required Scope:** `messages:read` (currently missing)

**No global messages endpoint exists** - messages are scoped to individual reservations.

### Reviews API
According to official docs:
- **Write Endpoint:** `POST /reviews/{id}/response` (respond to reviews)
- **Docs:** https://developer.hospitable.com/docs/public-api-docs/tgwl6ft55d71i-respond-to-a-review
- **Read Endpoint:** NOT FOUND in API v2
- **Webhooks:** `review.created` webhook available
- **Required Scope:** `reviews:write` for responses

**No GET endpoint for listing reviews exists** - only webhook-based notification + response capability.

### Financials
- **Current State:** Already using `financials.guest_total` and `financials.host_payout`
- **Enhanced Fields:** Need `financials:read` scope to access detailed breakdown
- **Include Parameter:** `?include=financials` works but may require scope for full data

---

## 🔄 Revised Implementation Strategy

### Phase 1A: What We CAN Implement (No Scope Changes)

#### 1. Property Images Enhancement ✅
**Status:** Implementable now with current token

```typescript
// Properties already return a picture field
interface Property {
  // ... existing fields
  picture?: string  // Primary property image URL
}
```

**Implementation:**
- Update `Property` interface to include `picture` field
- Display property thumbnails in dashboard using existing data
- No new API calls needed - data already returned

**Effort:** < 1 hour

---

### Phase 1B: Requires Token Regeneration

#### 2. Reservation Messages (Per-Reservation)
**Endpoint:** `GET /reservations/{reservation_id}/messages`
**Required Scope:** `messages:read`

**Implementation:**
```typescript
async getReservationMessages(reservationId: string): Promise<Message[]> {
  const response = await this.fetch<HospitableResponse<any>>(
    `/reservations/${reservationId}/messages`,
    { ttl: 300 }
  )
  // Transform to Message[] format
}
```

**Cache Strategy:**
- Key: `messages:reservation:{id}`
- TTL: 5 minutes
- Invalidation: Manual sync endpoint

**UI Impact:**
- Message thread view in reservation detail page
- Unread message count badges
- Guest communication history timeline

**Effort:** 1-2 days

---

#### 3. Enhanced Financial Data
**Endpoint:** `GET /reservations?include=financials`
**Required Scope:** `financials:read` (possibly - needs testing)

**Current Access:** Basic `guest_total` and `host_payout` already working
**Enhanced Access:** Detailed breakdown of fees, taxes, cleaning fees

**Implementation:**
- Update existing `getReservations()` and `getReservation()` methods
- Extend `Reservation` interface with detailed financials
- No new endpoints - just enhanced existing data

**Effort:** 0.5 days (minor update to existing code)

---

### Phase 2: Webhook-Based Features

#### 4. Reviews via Webhooks (Read-Only)
**No GET endpoint exists** - Reviews must be captured via webhooks

**Webhook Event:** `review.created`
**Webhook Endpoint:** `POST /api/webhooks/hospitable`

**Implementation Strategy:**
1. Create webhook receiver endpoint
2. Listen for `review.created` events
3. Store review data in KV cache or D1 database
4. Display cached reviews in dashboard

**Storage:**
```typescript
// KV Storage
await cache.put(`review:${reviewId}`, JSON.stringify(review))
await cache.put(`reviews:property:${propertyId}`, JSON.stringify(reviewIds))
```

**Effort:** 2-3 days (webhook infrastructure + storage)

---

## 🚫 Features NOT Available in API v2

| Feature | Status | Alternative |
|---------|--------|-------------|
| List all messages globally | ❌ Not available | Iterate through reservations |
| List all reviews | ❌ Not available | Webhook-based capture only |
| Calendar/Availability API | 🔍 Unknown | Needs investigation |
| Smart lock codes | 🔍 Unknown | May be in reservation data |

---

## ✅ Recommended Immediate Actions

### 1. Regenerate Personal Access Token (30 min)
**Location:** https://app.hospitable.com/settings/api

**Required Scopes:**
- `pat:read` ✓ (existing)
- `pat:write` ✓ (existing)
- `messages:read` ⭐ ADD
- `financials:read` ⭐ ADD
- `reviews:write` ⭐ ADD (for future response capability)

**Update Locations:**
- `.env` file
- `workers/.dev.vars` file
- Cloudflare Workers secrets (production)

---

### 2. Quick Win: Property Images (< 1 hour)
Implement property thumbnails using existing `picture` field.

**Files to Modify:**
- `workers/src/services/hospitable.ts` - Add `picture` to Property interface
- Frontend components - Display property images

**No API changes needed** - data already returned.

---

### 3. Test Enhanced Financials (30 min)
After token regeneration, verify detailed financial breakdown:

```bash
# Test endpoint with new token
curl "https://public.api.hospitable.com/v2/reservations?properties[]=xxx&include=financials&limit=1" \
  -H "Authorization: Bearer NEW_TOKEN"
```

Check response for:
- `financials.channel_fee`
- `financials.cleaning_fee`
- `financials.host_service_fee`
- `financials.tax_amount`

---

### 4. Implement Reservation Messages (1-2 days)
After token regeneration:
- Add `getReservationMessages(id)` method
- Create message display UI in reservation detail view
- Add KV caching with 5-min TTL

---

## 📝 Updated Phase Plan

### Phase 1A: Zero Dependencies (Implement Now)
✅ Property images via existing `picture` field

**Deliverable:** Property cards with thumbnails

---

### Phase 1B: After Token Regeneration
1. ✅ Enhanced financial data (detailed breakdown)
2. ✅ Per-reservation messages API
3. ✅ Message thread UI in reservation detail

**Deliverable:** Complete financial reporting + guest communication tracking

---

### Phase 2: Webhook Infrastructure
1. ✅ Webhook receiver endpoint
2. ✅ Review data capture via webhooks
3. ✅ Review display UI

**Deliverable:** Real-time review monitoring and reputation management

---

### Phase 3: Advanced Features (Investigation Required)
1. 🔍 Calendar/Availability endpoints (if they exist)
2. 🔍 Smart lock integration (if available in reservation data)
3. 🔍 Other undocumented endpoints

**Deliverable:** TBD based on API exploration

---

## 📚 Reference Links

### Official Documentation
- [Developer Portal](https://developer.hospitable.com/)
- [API Introduction](https://developer.hospitable.com/docs/public-api-docs/d862b3ee512e6-introduction)
- [Get Reservation Messages](https://developer.hospitable.com/docs/public-api-docs/n6jr1z9iwhm8w-get-reservation-messages)
- [Respond to Review](https://developer.hospitable.com/docs/public-api-docs/tgwl6ft55d71i-respond-to-a-review)
- [Webhooks Documentation](https://developer.hospitable.com/docs/public-api-docs/k4ctofvqu0w8g-hospitable-api-v2)
- [Webhooks Help Article](https://help.hospitable.com/en/articles/10008203-webhooks-for-reservations-properties-messages-and-reviews)

### Authentication
- [API Settings](https://app.hospitable.com/settings/api)
- [Authentication Docs](https://developer.hospitable.com/docs/public-api-docs/xpyjv51qyelmp-authentication)

---

## 🎯 Success Metrics (Revised)

### Phase 1A Complete (Immediate)
- [ ] Property images displaying in dashboard
- [ ] Visual property cards with thumbnails

### Phase 1B Complete (After Token Update)
- [ ] Detailed financial breakdown per reservation
- [ ] Message threads visible per reservation
- [ ] Guest communication history tracked
- [ ] Cache hit rate >90% for messages

### Phase 2 Complete (Webhooks)
- [ ] Real-time review notifications working
- [ ] Review data stored and displayed
- [ ] Property ratings visible in dashboard

---

## 🚨 Key Findings Summary

1. **Token Scopes:** Current token missing `messages:read`, `financials:read`, `reviews:write`
2. **Messages API:** Per-reservation only (`/reservations/{id}/messages`), no global endpoint
3. **Reviews API:** No GET endpoint - webhook-based capture only
4. **Property Images:** Already available as `picture` field (single URL, not array)
5. **Enhanced Financials:** Likely already accessible, may need scope for full details

**Next Step:** Regenerate Personal Access Token with required scopes.
