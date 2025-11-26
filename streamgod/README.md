# Streamgod Worker

Cloud Run worker service that consumes async jobs from Pub/Sub queues and processes them.

## Features

- **Release Distribution**: Subscribes to `releases-queue`, distributes releases to music platforms
- **Bot Commands**: Subscribes to `bots-commands`, manages bot fleet state
- **Audit Logging**: Records all operations in MongoDB for compliance and debugging
- **Graceful Shutdown**: Properly closes connections on SIGTERM/SIGINT
- **Health Checks**: Exposes `/health` endpoint for Cloud Run health verification

## Environment Variables

```bash
FIREBASE_PROJECT_ID=dmf-music-platform-5f1a5
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/dmf_analytics
PORT=8080
```

## Architecture

```
Pub/Sub (releases-queue)
    ↓
[streamgod-worker]
    ↓
    ├→ Firestore (read release metadata)
    ├→ MongoDB (write distribution events, audit log)
    └→ ACK/NACK message

Pub/Sub (bots-commands)
    ↓
[streamgod-worker]
    ↓
    ├→ MongoDB (update bot state, audit log)
    └→ ACK/NACK message
```

## Local Development

```bash
cd streamgod
npm install
export FIREBASE_PROJECT_ID=dmf-music-platform-5f1a5
export MONGO_URI=mongodb://localhost:27017
npm start
```

## Deployment

Built and deployed via GitHub Actions. The workflow:

1. Builds Node.js application
2. Creates Docker image
3. Pushes to Google Artifact Registry
4. Deploys to Cloud Run with:
   - No public ingress (service-to-service auth only)
   - 2 CPU, 2GB RAM per instance
   - Max 100 instances for auto-scaling
   - VPC connector for Mongo Atlas access

## Message Formats

### Release Distribution Job

```json
{
  "releaseId": "uuid",
  "title": "Song Title",
  "artistId": "artist-uuid",
  "releaseDate": "2024-01-15",
  "type": "publish"
}
```

### Bot Command

```json
{
  "botId": "bot-001",
  "command": "start|stop|restart",
  "params": {
    "userId": "user-123"
  }
}
```

## Error Handling

- **Message Processing Errors**: NACK message (will retry per subscription config)
- **MongoDB Errors**: Log and NACK
- **Firestore Errors**: Log and NACK
- **Subscription Errors**: Log and continue listening

## Monitoring

- **Pub/Sub Metrics**: Message age, ack rate, processing latency
- **Cloud Run Metrics**: CPU, memory, request count, error rate
- **Custom Metrics**: Distribution success rate, bot command latency

Connect to Cloud Logging to view real-time worker output.
