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
 * @param {HTMLImageElement} image - The image to detect faces in
 * @returns {Array} Array of face detections with landmarks and descriptors
 */
export const detectFaces = async (image) => {
  if (!modelsLoaded) {
    await loadModels();
  }
  
  try {
    const detections = await faceapi
      .detectAllFaces(image, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptors();
    
    return detections.map((detection, index) => ({
      id: `face_${index}`,
      box: detection.detection.box,
      landmarks: detection.landmarks,
      descriptor: detection.descriptor,
      confidence: detection.detection.score
    }));
  } catch (error) {
    console.error('Error detecting faces:', error);
    throw error;
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
