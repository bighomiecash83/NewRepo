// Backend/functions/services/pubsubClient.js
// Pub/Sub client for publishing jobs and events

const { PubSub } = require('@google-cloud/pubsub');

let pubsub = null;

function getPubSub() {
  if (!pubsub) {
    pubsub = new PubSub({
      projectId: process.env.GCP_PROJECT_ID || process.env.GCLOUD_PROJECT,
    });
  }
  return pubsub;
}

async function publishJob(topicName, data) {
  try {
    const ps = getPubSub();
    const topic = ps.topic(topicName);
    
    const messageId = await topic.publishJSON(data);
    console.log(`✓ Published message to ${topicName}: ${messageId}`);
    
    return { success: true, messageId };
  } catch (error) {
    console.error(`✗ Failed to publish to ${topicName}:`, error);
    throw error;
  }
}

async function publishRelease(releaseData) {
  return publishJob('releases-queue', {
    type: 'RELEASE_CREATE',
    payload: releaseData,
    timestamp: new Date().toISOString(),
  });
}

async function publishBotCommand(botCommand) {
  return publishJob('bots-commands', {
    type: 'BOT_COMMAND',
    payload: botCommand,
    timestamp: new Date().toISOString(),
  });
}

async function publishRevenueSync(revenueData) {
  return publishJob('revenue-sync', {
    type: 'REVENUE_UPDATE',
    payload: revenueData,
    timestamp: new Date().toISOString(),
  });
}

module.exports = {
  getPubSub,
  publishJob,
  publishRelease,
  publishBotCommand,
  publishRevenueSync,
};
