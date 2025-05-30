/**
 * Lazy loading wrapper for face detection services
 * This helps reduce the initial bundle size by loading face-api.js only when needed
 */

let faceDetectionModule = null;

/**
 * Lazy load the face detection module
 * @returns {Promise} Face detection module
 */
const loadFaceDetectionModule = async () => {
  if (!faceDetectionModule) {
    console.log('Loading face detection module...');
    faceDetectionModule = await import('./faceDetection.js');
    console.log('Face detection module loaded');
  }
  return faceDetectionModule;
};

/**
 * Lazy load face comparison module
 */
let faceComparisonModule = null;

const loadFaceComparisonModule = async () => {
  if (!faceComparisonModule) {
    console.log('Loading face comparison module...');
    faceComparisonModule = await import('./faceComparison.js');
    console.log('Face comparison module loaded');
  }
  return faceComparisonModule;
};

/**
 * Load models with lazy loading
 */
export const loadModels = async () => {
  const module = await loadFaceDetectionModule();
  return module.loadModels();
};

/**
 * Detect faces with lazy loading
 * @param {HTMLImageElement} image - The image to detect faces in
 * @param {number} threshold - Detection confidence threshold
 * @returns {Array} Array of face detections
 */
export const detectFaces = async (image, threshold = 0.5) => {
  const module = await loadFaceDetectionModule();
  return module.detectFaces(image, threshold);
};

/**
 * Compare faces with lazy loading
 * @param {Object} face1 - First face object
 * @param {Object} face2 - Second face object
 * @returns {Object} Similarity results
 */
export const comparefaces = async (face1, face2) => {
  const module = await loadFaceComparisonModule();
  return module.comparefaces(face1, face2);
};

/**
 * Analyze family resemblance with lazy loading
 * @param {Array} parents - Array of parent faces
 * @param {Array} children - Array of child faces
 * @returns {Array} Resemblance analysis
 */
export const analyzeFamilyResemblance = async (parents, children) => {
  const module = await loadFaceComparisonModule();
  return module.analyzeFamilyResemblance(parents, children);
};

/**
 * Validate across multiple photos with lazy loading
 * @param {Array} allPhotos - Array of photos with results
 * @returns {Object} Validation report
 */
export const validateAcrossMultiplePhotos = async (allPhotos) => {
  const module = await loadFaceComparisonModule();
  return module.validateAcrossMultiplePhotos(allPhotos);
};

/**
 * Initialize embedding model with lazy loading
 */
export const initializeEmbeddingModel = async () => {
  const module = await loadFaceComparisonModule();
  return module.initializeEmbeddingModel();
};
