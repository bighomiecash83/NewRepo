/**
 * DMF Music Platform — Firebase Extensions & Monitoring Setup
 * 
 * This file documents the extensions and monitoring configuration
 * for the DMF platform. It's not directly deployed but serves as
 * a reference for setup and configuration.
 */

module.exports = {
  project: 'dmf-music-platform',
  
  extensions: {
    // 1. Image Resizing Extension
    resizeImages: {
      name: 'firebase/storage-resize-images',
      description: 'Automatically creates thumbnails and resized versions of cover art',
      config: {
        bucket: 'dmf-music-platform.appspot.com',
        sizes: '200x200,600x600,1200x1200',
        outputDir: 'resized_images',
        inputDir: 'uploads/covers',
        deleteOriginal: false,
      },
      installCommand: 'firebase ext:install firebase/storage-resize-images --project dmf-music-platform',
    },

    // 2. Email Trigger Extension (SendGrid)
    sendEmail: {
      name: 'firebase/firestore-send-email',
      description: 'Send emails via SendGrid when documents are added to Firestore',
      config: {
        firestoreCollection: 'mail',
        sendGridApiKey: 'YOUR_SENDGRID_API_KEY_HERE',
        defaultFromEmail: 'no-reply@dmf-music-platform.com',
        defaultFromName: 'DMF Music Platform',
      },
      installCommand: 'firebase ext:install firebase/firestore-send-email --project dmf-music-platform',
      usageExample: `
        // In any Cloud Function or web app:
        const { getFirestore, collection, addDoc } = require('firebase-admin/firestore');
        const db = getFirestore();
        
        await addDoc(collection(db, 'mail'), {
          to: 'artist@example.com',
          message: {
            subject: 'Welcome to DMF!',
            html: '<h1>Welcome!</h1><p>Thanks for joining.</p>',
          },
        });
      `,
    },
  },

  monitoring: {
    dashboard: {
      name: 'DMF Functions Performance',
      description: 'Monitor Cloud Functions error rates and latencies',
      createCommand: 'Navigate to Google Cloud Console > Monitoring > Dashboards > Create Dashboard',
      charts: [
        {
          title: 'Function Error Rate',
          metric: 'cloudfunctions.googleapis.com/function/execution_count',
          filter: 'metric.labels.status="failed"',
          aggregator: 'RATE(sum)',
          groupBy: 'resource.labels.function_name',
          timeWindow: '5m',
        },
        {
          title: 'Function Latency (ms)',
          metric: 'cloudfunctions.googleapis.com/function/execution_time',
          filter: 'resource.type="cloud_function"',
          aggregator: 'mean',
          groupBy: 'resource.labels.function_name',
          timeWindow: '5m',
        },
      ],
    },

    alerts: [
      {
        displayName: 'High Error Rate Alert',
        condition: {
          metric: 'cloudfunctions.googleapis.com/function/execution_count',
          filter: 'metric.labels.status="failed" AND resource.type="cloud_function"',
          aggregator: 'RATE(sum)',
          timeWindow: '1m',
          comparison: 'COMPARISON_GT',
          threshold: 0.01, // 1 error per 100 invocations
        },
        notificationChannels: ['email', 'slack'], // Configure in Cloud Console
      },
      {
        displayName: 'High Latency Alert',
        condition: {
          metric: 'cloudfunctions.googleapis.com/function/execution_time',
          filter: 'resource.type="cloud_function"',
          aggregator: 'mean',
          timeWindow: '5m',
          comparison: 'COMPARISON_GT',
          threshold: 1000, // 1000ms = 1 second
        },
        notificationChannels: ['email', 'slack'],
      },
    ],
  },

  firestore: {
    collections: {
      mail: {
        description: 'Trigger emails via SendGrid extension',
        docSchema: {
          to: 'string (recipient email)',
          message: {
            subject: 'string',
            html: 'string (HTML body)',
          },
          // OR use SendGrid template:
          template: {
            name: 'string (template ID or name)',
            data: 'object (template variables)',
          },
        },
      },
    },
  },

  cloudStorage: {
    buckets: {
      default: {
        name: 'dmf-music-platform.appspot.com',
        folders: [
          {
            name: 'uploads/covers',
            description: 'Cover art uploads (will be resized automatically)',
          },
          {
            name: 'resized_images',
            description: 'Auto-generated resized versions (200x200, 600x600, 1200x1200)',
          },
        ],
      },
    },
  },
};
