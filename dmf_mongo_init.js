// DMF MongoDB Collections & Indexes Setup Script
// Run this in Atlas CLI: atlas shell
// Then paste into the MongoDB shell

// ===== SWITCH TO DMF DATABASE =====
use dmf_music_platform

// ===== CREATE COLLECTIONS =====
db.createCollection("artists")
db.createCollection("releases")
db.createCollection("services")
db.createCollection("plans")
db.createCollection("orders")
db.createCollection("payouts")
db.createCollection("bots")
db.createCollection("campaigns")
db.createCollection("events")

// ===== CREATE INDEXES FOR PERFORMANCE =====

// Artists collection indexes
db.artists.createIndex({ dmfArtistId: 1 }, { unique: true })
db.artists.createIndex({ email: 1 })
db.artists.createIndex({ createdAt: 1 })

// Releases collection indexes
db.releases.createIndex({ dmfReleaseId: 1 }, { unique: true })
db.releases.createIndex({ primaryArtistId: 1 })
db.releases.createIndex({ status: 1 })
db.releases.createIndex({ releaseDate: 1 })
db.releases.createIndex({ readinessScore: 1 })

// Services collection indexes
db.services.createIndex({ serviceType: 1 })
db.services.createIndex({ releaseId: 1 })

// Orders collection indexes
db.orders.createIndex({ artistId: 1 })
db.orders.createIndex({ status: 1 })
db.orders.createIndex({ createdAt: 1 })

// Payouts collection indexes
db.payouts.createIndex({ artistId: 1 })
db.payouts.createIndex({ period: 1 })
db.payouts.createIndex({ status: 1 })

// Bots collection indexes
db.bots.createIndex({ botId: 1 }, { unique: true })
db.bots.createIndex({ owner: 1 })
db.bots.createIndex({ status: 1 })

// Campaigns collection indexes
db.campaigns.createIndex({ campaignId: 1 }, { unique: true })
db.campaigns.createIndex({ releaseId: 1 })
db.campaigns.createIndex({ status: 1 })

// Events collection indexes
db.events.createIndex({ timestamp: 1 })
db.events.createIndex({ eventType: 1 })
db.events.createIndex({ entityId: 1 })

// ===== VERIFY SETUP =====
db.runCommand({ ping: 1 })
db.getCollectionNames()
db.artists.getIndexes()
