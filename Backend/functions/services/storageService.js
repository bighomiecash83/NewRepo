/**
 * Cloud Storage helper for DMF Music Platform
 * Handles uploads and references to cover art and other media
 */

const admin = require('firebase-admin');

const bucket = admin.storage().bucket();

/**
 * Generate signed URL for cloud storage file
 * @param {string} filePath - Path to file in Cloud Storage
 * @param {number} expiryHours - Hours until URL expires (default 24)
 */
async function getSignedUrl(filePath, expiryHours = 24) {
  try {
    const file = bucket.file(filePath);
    const [url] = await file.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + expiryHours * 60 * 60 * 1000,
    });
    return url;
  } catch (err) {
    console.error('Error generating signed URL:', err);
    throw err;
  }
}

/**
 * Get metadata for a file in Cloud Storage
 * @param {string} filePath - Path to file
 */
async function getFileMetadata(filePath) {
  try {
    const file = bucket.file(filePath);
    const [metadata] = await file.getMetadata();
    return metadata;
  } catch (err) {
    console.error('Error getting file metadata:', err);
    throw err;
  }
}

/**
 * Delete file from Cloud Storage
 * @param {string} filePath - Path to file to delete
 */
async function deleteFile(filePath) {
  try {
    await bucket.file(filePath).delete();
    console.log('Deleted:', filePath);
  } catch (err) {
    console.error('Error deleting file:', err);
    throw err;
  }
}

/**
 * List files in a directory
 * @param {string} dirPath - Directory path (e.g., 'uploads/covers/')
 */
async function listFiles(dirPath) {
  try {
    const [files] = await bucket.getFiles({ prefix: dirPath });
    return files.map(f => ({
      name: f.name,
      size: f.metadata.size,
      updated: f.metadata.updated,
    }));
  } catch (err) {
    console.error('Error listing files:', err);
    throw err;
  }
}

/**
 * Get public URL for a file (assumes public bucket)
 * @param {string} filePath - Path to file
 */
function getPublicUrl(filePath) {
  return `https://storage.googleapis.com/dmf-music-platform.appspot.com/${filePath}`;
}

/**
 * Get resized image URLs (assumes resize extension created these)
 * @param {string} originalFileName - Original file name (without extension)
 */
function getResizedImageUrls(originalFileName) {
  const sizes = ['200x200', '600x600', '1200x1200'];
  const urls = {};
  sizes.forEach(size => {
    const resizePath = `resized_images/${originalFileName}_${size}.jpg`;
    urls[size] = getPublicUrl(resizePath);
  });
  return urls;
}

module.exports = {
  getSignedUrl,
  getFileMetadata,
  deleteFile,
  listFiles,
  getPublicUrl,
  getResizedImageUrls,
};
