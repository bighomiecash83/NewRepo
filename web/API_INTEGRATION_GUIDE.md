# 🔌 DMF Music Platform - API Integration Guide

## Overview

This document defines the API endpoints required by the Next.js frontend to function. All endpoints are consumed by the service layer in `src/lib/api.ts`.

## Base Configuration

```
Base URL: http://localhost:5001  (configurable via NEXT_PUBLIC_API_URL)
Protocol: HTTP (Development), HTTPS (Production)
Content-Type: application/json
Authentication: JWT Bearer Token (header: Authorization: Bearer <token>)
```

## API Modules & Endpoints

### 1. Artists Module

#### List All Artists
```http
GET /api/artists
```

**Response (200 OK):**
```json
[
  {
    "id": "artist_1",
    "name": "The Weeknd",
    "email": "theweeknd@example.com",
    "bio": "Canadian singer and songwriter",
    "imageUrl": "https://example.com/weeknd.jpg",
    "genre": "Pop/R&B",
    "totalTracks": 45,
    "totalStreams": 2500000,
    "totalRevenue": 125000,
    "dateJoined": "2023-01-15T10:00:00Z"
  },
  {
    "id": "artist_2",
    "name": "SZA",
    "email": "sza@example.com",
    "bio": "American rapper and singer",
    "imageUrl": "https://example.com/sza.jpg",
    "genre": "Hip-Hop/Pop",
    "totalTracks": 28,
    "totalStreams": 1800000,
    "totalRevenue": 95000,
    "dateJoined": "2023-02-10T10:00:00Z"
  }
]
```

#### Get Single Artist
```http
GET /api/artists/:id
```

**Response (200 OK):**
```json
{
  "id": "artist_1",
  "name": "The Weeknd",
  "email": "theweeknd@example.com",
  "bio": "Canadian singer and songwriter",
  "imageUrl": "https://example.com/weeknd.jpg",
  "genre": "Pop/R&B",
  "totalTracks": 45,
  "totalStreams": 2500000,
  "totalRevenue": 125000,
  "dateJoined": "2023-01-15T10:00:00Z",
  "releases": [
    {
      "id": "release_1",
      "title": "Blinding Lights",
      "releaseDate": "2019-11-29T00:00:00Z",
      "streamCount": 500000,
      "revenue": 25000
    }
  ]
}
```

#### Create Artist
```http
POST /api/artists
Content-Type: application/json

{
  "name": "New Artist",
  "email": "artist@example.com",
  "bio": "Artist biography",
  "genre": "Pop",
  "imageUrl": "https://example.com/image.jpg"
}
```

**Response (201 Created):**
```json
{
  "id": "artist_new_123",
  "name": "New Artist",
  "email": "artist@example.com",
  "bio": "Artist biography",
  "genre": "Pop",
  "imageUrl": "https://example.com/image.jpg",
  "totalTracks": 0,
  "totalStreams": 0,
  "totalRevenue": 0,
  "dateJoined": "2024-01-20T10:00:00Z"
}
```

#### Update Artist
```http
PUT /api/artists/:id
Content-Type: application/json

{
  "name": "Updated Name",
  "bio": "Updated biography",
  "imageUrl": "https://example.com/new-image.jpg"
}
```

**Response (200 OK):**
```json
{
  "id": "artist_1",
  "name": "Updated Name",
  ...
}
```

#### Delete Artist
```http
DELETE /api/artists/:id
```

**Response (204 No Content)**

---

### 2. Releases Module

#### List All Releases
```http
GET /api/releases
```

**Response (200 OK):**
```json
[
  {
    "id": "release_1",
    "title": "Blinding Lights",
    "artistId": "artist_1",
    "artistName": "The Weeknd",
    "releaseDate": "2019-11-29T00:00:00Z",
    "status": "live",
    "platforms": ["spotify", "apple_music", "youtube"],
    "coverArtUrl": "https://example.com/cover.jpg",
    "streamCount": 500000,
    "revenue": 25000,
    "createdAt": "2019-11-20T10:00:00Z"
  },
  {
    "id": "release_2",
    "title": "Dawn FM",
    "artistId": "artist_1",
    "artistName": "The Weeknd",
    "releaseDate": "2022-01-07T00:00:00Z",
    "status": "live",
    "platforms": ["spotify", "apple_music", "youtube", "tidal"],
    "coverArtUrl": "https://example.com/cover2.jpg",
    "streamCount": 800000,
    "revenue": 40000,
    "createdAt": "2021-12-20T10:00:00Z"
  }
]
```

#### Get Single Release
```http
GET /api/releases/:id
```

**Response (200 OK):**
```json
{
  "id": "release_1",
  "title": "Blinding Lights",
  "artistId": "artist_1",
  "artistName": "The Weeknd",
  "releaseDate": "2019-11-29T00:00:00Z",
  "status": "live",
  "platforms": ["spotify", "apple_music", "youtube"],
  "coverArtUrl": "https://example.com/cover.jpg",
  "description": "Album description",
  "tracks": [
    {
      "id": "track_1",
      "title": "Blinding Lights",
      "duration": 200,
      "streams": 250000,
      "revenue": 12500
    }
  ],
  "streamCount": 500000,
  "revenue": 25000,
  "createdAt": "2019-11-20T10:00:00Z"
}
```

#### Create Release
```http
POST /api/releases
Content-Type: application/json

{
  "title": "New Album",
  "artistId": "artist_1",
  "description": "Album description",
  "releaseDate": "2024-02-15T00:00:00Z",
  "coverArtUrl": "https://example.com/cover.jpg",
  "platforms": ["spotify", "apple_music"]
}
```

**Response (201 Created):**
```json
{
  "id": "release_new_123",
  "title": "New Album",
  "artistId": "artist_1",
  "artistName": "The Weeknd",
  "status": "draft",
  "releaseDate": "2024-02-15T00:00:00Z",
  "platforms": ["spotify", "apple_music"],
  "streamCount": 0,
  "revenue": 0,
  "createdAt": "2024-01-20T10:00:00Z"
}
```

#### Schedule Release
```http
POST /api/releases/:id/schedule
Content-Type: application/json

{
  "releaseDate": "2024-03-01T00:00:00Z"
}
```

**Response (200 OK):**
```json
{
  "id": "release_1",
  "status": "scheduled",
  "releaseDate": "2024-03-01T00:00:00Z",
  ...
}
```

#### Publish Release
```http
POST /api/releases/:id/publish
```

**Response (200 OK):**
```json
{
  "id": "release_1",
  "status": "live",
  "publishedAt": "2024-02-15T10:00:00Z",
  ...
}
```

---

### 3. Revenue Module

#### Get Revenue Summary
```http
GET /api/revenue/summary
```

**Response (200 OK):**
```json
{
  "totalRevenue": 45230,
  "pendingPayouts": 8450,
  "thisMonth": 12500,
  "lastMonth": 18900,
  "topArtist": {
    "id": "artist_1",
    "name": "The Weeknd",
    "revenue": 15000,
    "growth": 12.5
  },
  "period": {
    "startDate": "2024-01-01T00:00:00Z",
    "endDate": "2024-01-31T23:59:59Z"
  }
}
```

#### Get Revenue by Artist
```http
GET /api/revenue/artist/:id
```

**Response (200 OK):**
```json
{
  "artistId": "artist_1",
  "artistName": "The Weeknd",
  "totalRevenue": 125000,
  "thisMonth": 15000,
  "growth": 12.5,
  "byPlatform": {
    "spotify": 62500,
    "apple_music": 37500,
    "youtube": 18750,
    "tidal": 6250
  },
  "topRelease": {
    "id": "release_1",
    "title": "Blinding Lights",
    "revenue": 25000
  }
}
```

#### Get Revenue by Platform
```http
GET /api/revenue/platform/:platform
```

**Response (200 OK):**
```json
{
  "platform": "spotify",
  "totalRevenue": 125000,
  "thisMonth": 18750,
  "growth": 5.2,
  "topArtist": {
    "id": "artist_1",
    "name": "The Weeknd",
    "revenue": 62500
  },
  "artistCount": 45,
  "releaseCount": 120
}
```

#### Get Pending Payouts
```http
GET /api/revenue/pending
```

**Response (200 OK):**
```json
[
  {
    "id": "payout_1",
    "artistId": "artist_1",
    "artistName": "The Weeknd",
    "amount": 5000,
    "period": "2024-01",
    "status": "pending",
    "paymentMethod": "bank_transfer",
    "estimatedDate": "2024-02-15T00:00:00Z"
  },
  {
    "id": "payout_2",
    "artistId": "artist_2",
    "artistName": "SZA",
    "amount": 3450,
    "period": "2024-01",
    "status": "pending",
    "paymentMethod": "bank_transfer",
    "estimatedDate": "2024-02-15T00:00:00Z"
  }
]
```

---

### 4. Bots Module

#### Get Bot Status
```http
GET /api/bots/status
```

**Response (200 OK):**
```json
{
  "totalBots": 10000,
  "activeBots": 8500,
  "inactiveBots": 1500,
  "overallEngagement": 87.5,
  "systemHealth": "healthy",
  "lastUpdate": "2024-01-20T10:00:00Z"
}
```

#### Launch All Bots
```http
POST /api/bots/launch-all
```

**Response (200 OK):**
```json
{
  "message": "All bots launched successfully",
  "botsLaunched": 9200,
  "status": "running",
  "timestamp": "2024-01-20T10:05:00Z"
}
```

#### Pause All Bots
```http
POST /api/bots/pause-all
```

**Response (200 OK):**
```json
{
  "message": "All bots paused successfully",
  "botsPaused": 8500,
  "status": "paused",
  "timestamp": "2024-01-20T10:10:00Z"
}
```

#### Get Bot Metrics
```http
GET /api/bots/:id/metrics
```

**Response (200 OK):**
```json
{
  "botId": "bot_1",
  "name": "StreamGod Bot #1",
  "status": "active",
  "engagement": 9250,
  "engagementPercentage": 92.5,
  "uptime": 99.8,
  "performance": "excellent",
  "lastActivity": "2024-01-20T10:00:00Z",
  "stats": {
    "totalRequests": 50000,
    "successRate": 98.5,
    "avgResponseTime": 245
  }
}
```

#### Get Bot Recommendations
```http
GET /api/bots/recommendations
```

**Response (200 OK):**
```json
[
  {
    "id": "rec_1",
    "title": "Increase Engagement Bots",
    "description": "Increase bots focused on engagement by 15% for better results",
    "impact": "High",
    "priority": "High",
    "estimatedBoost": "15-20%"
  },
  {
    "id": "rec_2",
    "title": "Optimize Peak Hours",
    "description": "Schedule bot activity during peak hours (8-11 PM EST)",
    "impact": "Medium",
    "priority": "Medium",
    "estimatedBoost": "8-12%"
  }
]
```

---

### 5. Contracts Module

#### List All Contracts
```http
GET /api/contracts
```

**Response (200 OK):**
```json
[
  {
    "id": "contract_1",
    "artistId": "artist_1",
    "artistName": "The Weeknd",
    "type": "Distribution",
    "status": "active",
    "startDate": "2023-01-15T00:00:00Z",
    "endDate": "2025-01-14T23:59:59Z",
    "terms": {
      "royaltyPercentage": 75,
      "distributionFee": 15
    },
    "signedDate": "2023-01-15T10:00:00Z",
    "signedBy": "artist_1"
  },
  {
    "id": "contract_2",
    "artistId": "artist_2",
    "artistName": "SZA",
    "type": "Management",
    "status": "pending",
    "startDate": "2024-02-01T00:00:00Z",
    "endDate": "2026-01-31T23:59:59Z",
    "terms": {
      "managementFee": 20,
      "services": ["booking", "marketing", "accounting"]
    },
    "createdAt": "2024-01-20T10:00:00Z"
  }
]
```

#### Get Single Contract
```http
GET /api/contracts/:id
```

**Response (200 OK):**
```json
{
  "id": "contract_1",
  "artistId": "artist_1",
  "artistName": "The Weeknd",
  "type": "Distribution",
  "status": "active",
  "startDate": "2023-01-15T00:00:00Z",
  "endDate": "2025-01-14T23:59:59Z",
  "terms": {
    "royaltyPercentage": 75,
    "distributionFee": 15,
    "paymentSchedule": "monthly"
  },
  "signedDate": "2023-01-15T10:00:00Z",
  "signedBy": "artist_1",
  "blockchainHash": "0x1234567890abcdef",
  "gavelStatus": "verified"
}
```

#### Create Contract
```http
POST /api/contracts
Content-Type: application/json

{
  "artistId": "artist_new",
  "type": "Management",
  "startDate": "2024-02-01T00:00:00Z",
  "endDate": "2026-01-31T23:59:59Z",
  "terms": {
    "managementFee": 20,
    "services": ["booking", "marketing"]
  }
}
```

**Response (201 Created):**
```json
{
  "id": "contract_new_123",
  "artistId": "artist_new",
  "type": "Management",
  "status": "pending",
  "startDate": "2024-02-01T00:00:00Z",
  "endDate": "2026-01-31T23:59:59Z",
  "terms": {
    "managementFee": 20,
    "services": ["booking", "marketing"]
  },
  "createdAt": "2024-01-20T10:00:00Z"
}
```

#### Sign Contract
```http
POST /api/contracts/:id/sign
Content-Type: application/json

{
  "signedBy": "artist_1",
  "signature": "digital_signature_hash"
}
```

**Response (200 OK):**
```json
{
  "id": "contract_1",
  "status": "active",
  "signedDate": "2024-01-20T10:00:00Z",
  "signedBy": "artist_1",
  "blockchainHash": "0xabcdef1234567890",
  "gavelStatus": "recorded"
}
```

---

## Error Handling

All endpoints should return appropriate HTTP status codes:

```
200 OK              - Request successful
201 Created         - Resource created successfully
204 No Content      - Request successful, no response body
400 Bad Request     - Invalid request parameters
401 Unauthorized    - Missing/invalid authentication
403 Forbidden       - Insufficient permissions
404 Not Found       - Resource not found
500 Server Error    - Internal server error
```

### Error Response Format
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "error details"
  }
}
```

---

## Authentication

All endpoints (except health checks) require JWT Bearer token:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Rate Limiting

Recommended rate limits:
- Public endpoints: 100 requests/minute
- Authenticated endpoints: 1000 requests/minute
- Bulk operations: 10 requests/minute

---

## Pagination (Optional)

For list endpoints that return large datasets:

```http
GET /api/artists?page=1&limit=50&sort=name&order=asc
```

**Response:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1250,
    "pages": 25
  }
}
```

---

## Implementation Checklist

- [ ] Artists CRUD endpoints
- [ ] Releases CRUD + scheduling + publishing
- [ ] Revenue aggregation queries
- [ ] Bot status + launch/pause + metrics + recommendations
- [ ] Contracts CRUD + signing + blockchain integration
- [ ] Authentication middleware
- [ ] Error handling
- [ ] Rate limiting
- [ ] Logging
- [ ] Tests (unit + integration)
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Performance optimization
- [ ] Security hardening

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Status**: Ready for Implementation ✅
