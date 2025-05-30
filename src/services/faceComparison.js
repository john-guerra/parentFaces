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
    // Calculate cosine similarity between descriptors
    const cosineScore = cosineSimilarity(Array.from(face1.descriptor), Array.from(face2.descriptor));
    
    // For face descriptors, cosine similarity ranges from -1 to 1
    // We need to map this to a more intuitive 0-1 scale for similarity percentage
    // However, for face recognition, negative values are rare and indicate very different faces
    // We'll use a more sophisticated mapping:
    
    let normalizedScore;
    if (cosineScore >= 0) {
      // Positive cosine similarity: map 0-1 to 0-1 with emphasis on higher values
      normalizedScore = cosineScore;
    } else {
      // Negative cosine similarity: map to very low similarity (0-0.1)
      normalizedScore = Math.max(0, 0.1 + (cosineScore * 0.1));
    }
    
    // Ensure the result is within [0, 1] range
    results.faceApiSimilarity = Math.max(0, Math.min(1, normalizedScore));
    
    // Also calculate Euclidean distance for comparison
    let distance = 0;
    for (let i = 0; i < face1.descriptor.length; i++) {
      const diff = face1.descriptor[i] - face2.descriptor[i];
      distance += diff * diff;
    }
    distance = Math.sqrt(distance);
    
    // For face descriptors, typical distances range from 0 to ~1.2
    // Map this to similarity score (lower distance = higher similarity)
    results.euclideanSimilarity = Math.max(0, Math.min(1, 1 - (distance / 1.2)));
  }
  
  // Use cosine similarity as the primary score (it's more robust for face recognition)
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

/**
 * Validate family resemblance across multiple photos
 * @param {Array} allPhotos - Array of images with their analysis results
 * @returns {Object} Validation report with consistency metrics
 */
export const validateAcrossMultiplePhotos = async (allPhotos) => {
  if (allPhotos.length < 2) {
    return { isValid: true, confidence: 1.0, message: 'Single photo - no validation needed' };
  }

  const validationResults = {
    isValid: true,
    confidence: 0,
    consistencyScore: 0,
    photoResults: [],
    recommendations: []
  };

  // Analyze each photo and extract parent-child relationships
  const photoAnalyses = [];
  
  for (let i = 0; i < allPhotos.length; i++) {
    const photo = allPhotos[i];
    // This would be the results from analyzeFamilyResemblance for each photo
    photoAnalyses.push(photo.resemblanceResults);
  }

  // Compare consistency across photos
  if (photoAnalyses.length >= 2) {
    let consistentMatches = 0;
    let totalComparisons = 0;

    // For each child, check if they consistently match the same parent across photos
    // This is a simplified validation - in a real implementation, you'd need more sophisticated matching
    for (let childIndex = 0; childIndex < photoAnalyses[0].length; childIndex++) {
      const firstPhotoResult = photoAnalyses[0][childIndex];
      let isConsistent = true;

      for (let photoIndex = 1; photoIndex < photoAnalyses.length; photoIndex++) {
        const currentPhotoResult = photoAnalyses[photoIndex][childIndex];
        
        if (currentPhotoResult && firstPhotoResult.mostSimilarParent) {
          // Check if the same parent is identified as most similar
          // This is simplified - real implementation would need face matching across photos
          if (currentPhotoResult.mostSimilarParent.label !== firstPhotoResult.mostSimilarParent.label) {
            isConsistent = false;
          }
        }
        totalComparisons++;
      }

      if (isConsistent) {
        consistentMatches++;
      }
    }

    validationResults.consistencyScore = totalComparisons > 0 ? consistentMatches / totalComparisons : 1.0;
    validationResults.confidence = validationResults.consistencyScore;

    if (validationResults.consistencyScore < 0.7) {
      validationResults.isValid = false;
      validationResults.recommendations.push('Results vary significantly across photos. Consider using clearer images or photos with better lighting.');
    } else if (validationResults.consistencyScore < 0.9) {
      validationResults.recommendations.push('Good consistency across photos. Results are reliable.');
    } else {
      validationResults.recommendations.push('Excellent consistency across all photos. High confidence in results.');
    }
  }

  return validationResults;
};
