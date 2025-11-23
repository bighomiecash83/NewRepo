/**
 * Email helper for DMF Music Platform
 * Adds documents to Firestore 'mail' collection to trigger SendGrid emails
 */

const admin = require('firebase-admin');

const db = admin.firestore();

/**
 * Send a simple text/HTML email
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML body
 */
async function sendSimpleEmail(to, subject, html) {
  try {
    const docRef = await db.collection('mail').add({
      to,
      message: {
        subject,
        html,
      },
      timestamp: new Date(),
    });
    console.log('Email queued:', docRef.id);
    return docRef.id;
  } catch (err) {
    console.error('Error queuing email:', err);
    throw err;
  }
}

/**
 * Send email using SendGrid template
 * @param {string} to - Recipient email
 * @param {string} templateId - SendGrid template ID
 * @param {object} templateData - Variables for template
 */
async function sendTemplateEmail(to, templateId, templateData) {
  try {
    const docRef = await db.collection('mail').add({
      to,
      template: {
        name: templateId,
        data: templateData,
      },
      timestamp: new Date(),
    });
    console.log('Template email queued:', docRef.id);
    return docRef.id;
  } catch (err) {
    console.error('Error queuing template email:', err);
    throw err;
  }
}

/**
 * Send onboarding email to new artist
 */
async function sendArtistOnboardingEmail(email, artistName, loginUrl) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px;">
      <h1 style="color: #d4af37;">Welcome to DMF Music Platform!</h1>
      <p>Hi <strong>${artistName}</strong>,</p>
      <p>Your account is now ready. Start uploading your music and connecting with fans.</p>
      <p>
        <a href="${loginUrl}" style="background-color: #0b2545; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Log in now
        </a>
      </p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
      <footer style="font-size: 12px; color: #888;">
        <p>Questions? Contact support@dmf-music-platform.com</p>
        <p>&copy; 2025 DMF Music Platform. All rights reserved.</p>
      </footer>
    </div>
  `;

  return sendSimpleEmail(email, 'Welcome to DMF Music Platform!', html);
}

/**
 * Send payout notification
 */
async function sendPayoutNotification(email, artistName, amount, payoutDate) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px;">
      <h1 style="color: #d4af37;">Your Payout is Ready</h1>
      <p>Hi <strong>${artistName}</strong>,</p>
      <p>Great news! Your payout of <strong>$${amount.toFixed(2)}</strong> is scheduled for <strong>${payoutDate}</strong>.</p>
      <p>Check your dashboard for details.</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
      <footer style="font-size: 12px; color: #888;">
        <p>Questions? Contact support@dmf-music-platform.com</p>
        <p>&copy; 2025 DMF Music Platform. All rights reserved.</p>
      </footer>
    </div>
  `;

  return sendSimpleEmail(email, `Your Payout: $${amount.toFixed(2)}`, html);
}

/**
 * Send track upload confirmation
 */
async function sendTrackUploadConfirmation(email, artistName, trackName) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px;">
      <h1 style="color: #d4af37;">Track Uploaded Successfully</h1>
      <p>Hi <strong>${artistName}</strong>,</p>
      <p>Your track <strong>"${trackName}"</strong> has been uploaded and is now live on DMF Music Platform!</p>
      <p>Share it with your fans and watch your streams grow.</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
      <footer style="font-size: 12px; color: #888;">
        <p>Questions? Contact support@dmf-music-platform.com</p>
        <p>&copy; 2025 DMF Music Platform. All rights reserved.</p>
      </footer>
    </div>
  `;

  return sendSimpleEmail(email, `"${trackName}" is Now Live!`, html);
}

module.exports = {
  sendSimpleEmail,
  sendTemplateEmail,
  sendArtistOnboardingEmail,
  sendPayoutNotification,
  sendTrackUploadConfirmation,
};
