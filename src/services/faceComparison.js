// Note: For now, we'll focus on face-api.js descriptors for face comparison
// Transformers.js can be added later for enhanced features

/**
 * Initialize the embedding model (simplified version)
 */
export const initializeEmbeddingModel = async () => {
  // For now, we'll rely on face-api.js descriptors
  // This can be enhanced later with proper vision models
  console.log('Using face-api.js descriptors for face comparison');
  return Promise.resolve(true);
};

/**
 * Extract face image to canvas and get pixel data
 * @param {HTMLImageElement} image - Source image
 * @param {Object} faceBox - Face bounding box {x, y, width, height}
 * @returns {HTMLCanvasElement} Canvas with cropped face
 */
export const extractFaceImage = (image, faceBox) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Set canvas size to face dimensions
  canvas.width = faceBox.width;
  canvas.height = faceBox.height;
  
  // Draw the cropped face onto the canvas
  ctx.drawImage(
    image,
    faceBox.x, faceBox.y, faceBox.width, faceBox.height,
    0, 0, faceBox.width, faceBox.height
  );
  
  return canvas;
};

/**
 * Convert canvas to base64 for embedding extraction
 * @param {HTMLCanvasElement} canvas - Face canvas
 * @returns {string} Base64 encoded image
 */
export const canvasToBase64 = (canvas) => {
  return canvas.toDataURL('image/jpeg', 0.8);
};

/**
 * Calculate cosine similarity between two vectors
 * @param {Array} vecA - First vector
 * @param {Array} vecB - Second vector
 * @returns {number} Cosine similarity (-1 to 1)
 */
export const cosineSimilarity = (vecA, vecB) => {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same length');
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);
  
  if (normA === 0 || normB === 0) {
    return 0;
  }
  
  return dotProduct / (normA * normB);
};

/**
 * Compare faces using face-api.js descriptors
 * @param {Object} face1 - First face object with descriptor and box
 * @param {Object} face2 - Second face object with descriptor and box
 * @returns {Object} Similarity metrics
 */
export const comparefaces = async (face1, face2) => {
  const results = {
    faceApiSimilarity: 0,
    euclideanSimilarity: 0,
    combinedScore: 0
  };
  
  // Face-api.js descriptor similarity
  if (face1.descriptor && face2.descriptor) {
    // Calculate cosine similarity between descriptors (preferred method)
    // Cosine similarity measures the angle between vectors, making it more robust
    // to variations in lighting and normalization differences
    const cosineScore = cosineSimilarity(Array.from(face1.descriptor), Array.from(face2.descriptor));
    
    // Convert cosine similarity (-1 to 1) to 0-1 scale
    // Cosine similarity of 1 = identical, 0 = orthogonal, -1 = opposite
    results.faceApiSimilarity = Math.max(0, (cosineScore + 1) / 2);
    
    // Also calculate Euclidean distance for comparison
    let distance = 0;
    for (let i = 0; i < face1.descriptor.length; i++) {
      const diff = face1.descriptor[i] - face2.descriptor[i];
      distance += diff * diff;
    }
    distance = Math.sqrt(distance);
    results.euclideanSimilarity = Math.max(0, 1 - (distance / 1.2));
  }
  
  // Use cosine similarity as the primary score
  results.combinedScore = results.faceApiSimilarity;
  
  return results;
};

/**
 * Analyze family resemblance
 * @param {Array} parents - Array of parent face objects
 * @param {Array} children - Array of child face objects
 * @returns {Array} Resemblance analysis for each child
 */
export const analyzeFamilyResemblance = async (parents, children) => {
  const results = [];
  
  for (const child of children) {
    const childResult = {
      childFace: child,
      parentSimilarities: [],
      mostSimilarParent: null,
      confidence: 0
    };
    
    // Compare child with each parent
    for (const parent of parents) {
      const similarity = await comparefaces(child, parent);
      childResult.parentSimilarities.push({
        parent: parent,
        similarity: similarity.combinedScore,
        details: similarity
      });
    }
    
    // Find the most similar parent
    if (childResult.parentSimilarities.length > 0) {
      const bestMatch = childResult.parentSimilarities.reduce((best, current) => 
        current.similarity > best.similarity ? current : best
      );
      
      childResult.mostSimilarParent = bestMatch.parent;
      childResult.confidence = bestMatch.similarity;
    }
    
    results.push(childResult);
  }
  
  return results;
};
