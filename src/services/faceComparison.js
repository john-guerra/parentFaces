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
 * Enhanced version with better numerical stability
 * @param {Array} vecA - First vector
 * @param {Array} vecB - Second vector
 * @returns {number} Cosine similarity (-1 to 1)
 */
export const cosineSimilarity = (vecA, vecB) => {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same length');
  }
  
  // Convert to regular arrays if needed to ensure consistency
  const arrA = Array.isArray(vecA) ? vecA : Array.from(vecA);
  const arrB = Array.isArray(vecB) ? vecB : Array.from(vecB);
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < arrA.length; i++) {
    dotProduct += arrA[i] * arrB[i];
    normA += arrA[i] * arrA[i];
    normB += arrB[i] * arrB[i];
  }
  
  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);
  
  // Enhanced numerical stability check
  if (normA < 1e-10 || normB < 1e-10) {
    return 0;
  }
  
  const similarity = dotProduct / (normA * normB);
  
  // Clamp to valid range to handle floating point precision issues
  return Math.max(-1, Math.min(1, similarity));
};

/**
 * Calculate Euclidean distance between two face descriptors
 * @param {Array|Float32Array} desc1 - First descriptor
 * @param {Array|Float32Array} desc2 - Second descriptor
 * @returns {number} Euclidean distance
 */
export const euclideanDistance = (desc1, desc2) => {
  if (desc1.length !== desc2.length) {
    throw new Error('Descriptors must have the same length');
  }
  
  let sum = 0;
  for (let i = 0; i < desc1.length; i++) {
    const diff = desc1[i] - desc2[i];
    sum += diff * diff;
  }
  
  return Math.sqrt(sum);
};

/**
 * Compare faces using face-api.js descriptors with Euclidean distance
 * Based on face-api.js documentation recommendations
 * @param {Object|Array} face1 - First face object with descriptor and box, or descriptor array
 * @param {Object|Array} face2 - Second face object with descriptor and box, or descriptor array
 * @returns {Object} Similarity metrics
 */
export const comparefaces = (face1, face2) => {
  const results = {
    euclideanDistance: 0,
    euclideanSimilarity: 0,
    cosineSimilarity: 0,
    combinedScore: 0,
    isMatch: false
  };
  
  // Handle both face objects and plain descriptor arrays
  let desc1, desc2;
  
  if (Array.isArray(face1) || face1 instanceof Float32Array) {
    desc1 = face1;
  } else if (face1 && face1.descriptor) {
    desc1 = face1.descriptor;
  } else {
    console.warn('comparefaces: face1 is invalid or missing descriptor');
    return results;
  }
  
  if (Array.isArray(face2) || face2 instanceof Float32Array) {
    desc2 = face2;
  } else if (face2 && face2.descriptor) {
    desc2 = face2.descriptor;
  } else {
    console.warn('comparefaces: face2 is invalid or missing descriptor');
    return results;
  }
  
  if (!desc1 || !desc2 || desc1.length !== desc2.length) {
    console.warn('comparefaces: Descriptor validation failed', {
      desc1Length: desc1?.length,
      desc2Length: desc2?.length
    });
    return results;
  }
  
  try {
    const arr1 = Array.from(desc1);
    const arr2 = Array.from(desc2);
    
    // 1. Calculate Euclidean distance (face-api.js recommended method)
    const distance = euclideanDistance(arr1, arr2);
    results.euclideanDistance = distance;
    
    // 2. face-api.js recommends threshold of 0.6 for matching
    // Distance < 0.6 = likely same person
    // Distance > 0.6 = likely different people
    results.isMatch = distance < 0.6;
    
    // 3. Convert distance to similarity score (0-1 range)
    // Use a more sophisticated mapping based on typical face recognition distances
    if (distance <= 0.4) {
      // Very high similarity for very close faces
      results.euclideanSimilarity = 1.0 - (distance / 0.4) * 0.15; // 0.85-1.0 range
    } else if (distance <= 0.6) {
      // Good similarity for distances in the "match" range
      results.euclideanSimilarity = 0.6 + ((0.6 - distance) / 0.2) * 0.25; // 0.6-0.85 range
    } else if (distance <= 1.0) {
      // Moderate similarity for higher distances
      results.euclideanSimilarity = 0.3 + ((1.0 - distance) / 0.4) * 0.3; // 0.3-0.6 range
    } else {
      // Low similarity for very high distances
      results.euclideanSimilarity = Math.max(0, 0.3 - ((distance - 1.0) / 0.5) * 0.3); // 0.0-0.3 range
    }
    
    // 4. Also calculate cosine similarity for comparison
    results.cosineSimilarity = cosineSimilarity(arr1, arr2);
    
    // 5. Use Euclidean-based similarity as the primary score
    results.combinedScore = results.euclideanSimilarity;
    
  } catch (error) {
    console.error('Error in comparefaces:', error);
    // Return zero similarity on error rather than throwing
    results.euclideanDistance = Infinity;
    results.euclideanSimilarity = 0;
    results.cosineSimilarity = 0;
    results.combinedScore = 0;
    results.isMatch = false;
  }
  
  return results;
};

/**
 * Analyze family resemblance
 * @param {Array} parents - Array of parent face objects
 * @param {Array} children - Array of child face objects
 * @returns {Array} Resemblance analysis for each child
 */
export const analyzeFamilyResemblance = (parents, children) => {
  console.log('analyzeFamilyResemblance called with:', { parents, children });
  
  // Validate inputs
  if (!Array.isArray(parents) || !Array.isArray(children)) {
    console.error('analyzeFamilyResemblance: Invalid input - parents or children is not an array', { 
      parents: parents, 
      children: children,
      parentsType: typeof parents,
      childrenType: typeof children
    });
    return [];
  }
  
  if (parents.length === 0 || children.length === 0) {
    console.warn('analyzeFamilyResemblance: Empty parents or children array');
    return [];
  }
  
  const results = [];
  
  children.forEach((child, childIndex) => {
    const childResult = {
      childFace: { ...child, childIndex }, // Add childIndex to the face object
      parentSimilarities: [],
      mostSimilarParent: null,
      confidence: 0
    };
    
    // Compare child with each parent
    parents.forEach(parent => {
      const similarity = comparefaces(child, parent);
      childResult.parentSimilarities.push({
        parent: parent,
        similarity: similarity.combinedScore,
        details: similarity
      });
    });
    
    // Find the most similar parent
    if (childResult.parentSimilarities.length > 0) {
      const bestMatch = childResult.parentSimilarities.reduce((best, current) => 
        current.similarity > best.similarity ? current : best
      );
      
      childResult.mostSimilarParent = bestMatch.parent;
      childResult.confidence = bestMatch.similarity;
    }
    
    results.push(childResult);
  });
  
  console.log('analyzeFamilyResemblance returning:', results);
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
