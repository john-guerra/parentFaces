/**
 * Load image from file
 * @param {File} file - Image file
 * @returns {Promise<HTMLImageElement>} Loaded image element
 */
export const loadImageFromFile = (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Resize image to fit within max dimensions while maintaining aspect ratio
 * @param {HTMLImageElement} image - Source image
 * @param {number} maxWidth - Maximum width
 * @param {number} maxHeight - Maximum height
 * @returns {HTMLCanvasElement} Resized image canvas
 */
export const resizeImage = (image, maxWidth = 800, maxHeight = 600) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Calculate new dimensions maintaining aspect ratio
  let { width, height } = image;
  
  if (width > maxWidth) {
    height = (height * maxWidth) / width;
    width = maxWidth;
  }
  
  if (height > maxHeight) {
    width = (width * maxHeight) / height;
    height = maxHeight;
  }
  
  canvas.width = width;
  canvas.height = height;
  
  ctx.drawImage(image, 0, 0, width, height);
  
  return canvas;
};

/**
 * Convert file size to human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Check if file is a valid image
 * @param {File} file - File to check
 * @returns {boolean} True if valid image
 */
export const isValidImageFile = (file) => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  return validTypes.includes(file.type);
};

/**
 * Format similarity score as percentage
 * @param {number} score - Similarity score (0-1)
 * @returns {string} Formatted percentage
 */
export const formatSimilarityScore = (score) => {
  return `${Math.round(score * 100)}%`;
};

/**
 * Get similarity description based on score
 * @param {number} score - Similarity score (0-1)
 * @returns {string} Description of similarity level
 */
export const getSimilarityDescription = (score) => {
  if (score >= 0.8) return 'Very Strong Resemblance';
  if (score >= 0.6) return 'Strong Resemblance';
  if (score >= 0.4) return 'Moderate Resemblance';
  if (score >= 0.2) return 'Slight Resemblance';
  return 'Little Resemblance';
};

/**
 * Generate a unique ID
 * @returns {string} Unique identifier
 */
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
