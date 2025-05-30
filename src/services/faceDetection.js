import * as faceapi from 'face-api.js';

let modelsLoaded = false;

/**
 * Load face-api.js models
 */
export const loadModels = async () => {
  if (modelsLoaded) return;
  
  try {
    // Use import.meta.env.BASE_URL to get the correct base path for Vite
    const BASE_URL = import.meta.env.BASE_URL || '/';
    const MODEL_URL = `${BASE_URL}models`;
    
    console.log('Loading models from:', MODEL_URL);
    
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
    ]);
    
    modelsLoaded = true;
    console.log('Face-api.js models loaded successfully');
  } catch (error) {
    console.error('Error loading face-api.js models:', error);
    throw error;
  }
};

/**
 * Detect faces in an image
 * Enhanced version with better error handling and robustness
 * @param {HTMLImageElement} image - The image to detect faces in
 * @param {number} threshold - Detection confidence threshold (0.1 to 0.9)
 * @returns {Array} Array of face detections with landmarks and descriptors
 */
export const detectFaces = async (image, threshold = 0.5) => {
  if (!modelsLoaded) {
    await loadModels();
  }
  
  try {
    // Enhanced validation
    if (!image || !image.complete || image.naturalWidth === 0) {
      throw new Error('Invalid image provided for face detection');
    }
    
    // Clamp threshold to valid range
    const clampedThreshold = Math.max(0.1, Math.min(0.9, threshold));
    
    console.log(`Detecting faces with threshold ${clampedThreshold}...`);
    
    const detections = await faceapi
      .detectAllFaces(image, new faceapi.TinyFaceDetectorOptions({
        inputSize: 416,
        scoreThreshold: clampedThreshold
      }))
      .withFaceLandmarks()
      .withFaceDescriptors();
    
    console.log(`Detected ${detections.length} faces with threshold ${clampedThreshold}`);
    
    // Enhanced: Filter out detections with invalid descriptors
    const validDetections = detections.filter(detection => {
      if (!detection.descriptor) {
        console.warn('Face detection missing descriptor, skipping');
        return false;
      }
      
      if (detection.descriptor.length !== 128) {
        console.warn(`Face descriptor has unexpected length: ${detection.descriptor.length}, skipping`);
        return false;
      }
      
      // Check for NaN or Infinity values in descriptor
      const hasInvalidValues = Array.from(detection.descriptor).some(val => 
        !isFinite(val) || isNaN(val)
      );
      
      if (hasInvalidValues) {
        console.warn('Face descriptor contains invalid values, skipping');
        return false;
      }
      
      return true;
    });
    
    console.log(`${validDetections.length} valid face detections after filtering`);
    
    return validDetections.map((detection, index) => ({
      id: `face_${index}`,
      box: detection.detection.box,
      landmarks: detection.landmarks,
      descriptor: detection.descriptor,
      confidence: detection.detection.score
    }));
    
  } catch (error) {
    console.error('Error detecting faces:', error);
    throw new Error(`Face detection failed: ${error.message}`);
  }
};

/**
 * Calculate similarity between two face descriptors
 * @param {Float32Array} descriptor1 - First face descriptor
 * @param {Float32Array} descriptor2 - Second face descriptor
 * @returns {number} Similarity score (0-1, higher is more similar)
 */
export const calculateSimilarity = (descriptor1, descriptor2) => {
  if (!descriptor1 || !descriptor2) return 0;
  
  // Calculate Euclidean distance
  const distance = faceapi.euclideanDistance(descriptor1, descriptor2);
  
  // Convert distance to similarity (0-1 scale)
  // Lower distance = higher similarity
  const similarity = Math.max(0, 1 - distance);
  
  return similarity;
};

/**
 * Find the most similar face from a list of candidates
 * @param {Object} targetFace - The face to compare against
 * @param {Array} candidateFaces - Array of candidate faces
 * @returns {Object} Best match with similarity score
 */
export const findBestMatch = (targetFace, candidateFaces) => {
  if (!targetFace || !candidateFaces || candidateFaces.length === 0) {
    return null;
  }
  
  let bestMatch = null;
  let highestSimilarity = 0;
  
  candidateFaces.forEach(candidate => {
    const similarity = calculateSimilarity(targetFace.descriptor, candidate.descriptor);
    if (similarity > highestSimilarity) {
      highestSimilarity = similarity;
      bestMatch = {
        face: candidate,
        similarity: similarity
      };
    }
  });
  
  return bestMatch;
};
