import { comparefaces } from './faceComparison.js';

/**
 * Compute pairwise similarities between all faces regardless of role
 * @param {Array} allFaces - Array of all face objects (parents + children)
 * @returns {Object} Matrix data and face information
 */
export const computePairwiseMatrix = (allFaces) => {
  if (!allFaces || allFaces.length < 2) {
    return null;
  }

  const faceCount = allFaces.length;
  const matrix = Array(faceCount).fill(null).map(() => Array(faceCount).fill(0));
  const similarities = [];

  // Compute pairwise similarities
  for (let i = 0; i < faceCount; i++) {
    for (let j = i + 1; j < faceCount; j++) {
      try {
        const result = comparefaces(allFaces[i], allFaces[j]);
        const similarity = result.combinedScore;
        
        // Store in matrix (symmetric)
        matrix[i][j] = similarity;
        matrix[j][i] = similarity;
        
        // Store detailed comparison
        similarities.push({
          face1Index: i,
          face2Index: j,
          face1: allFaces[i],
          face2: allFaces[j],
          similarity: similarity,
          details: result
        });
      } catch (error) {
        console.error(`Error comparing faces ${i} and ${j}:`, error);
        matrix[i][j] = 0;
        matrix[j][i] = 0;
      }
    }
    // Diagonal elements (self-similarity) = 1
    matrix[i][i] = 1.0;
  }

  return {
    matrix,
    similarities,
    faces: allFaces,
    faceCount
  };
};

/**
 * Get face label for display
 * @param {Object} face - Face object
 * @param {number} index - Face index in the overall face array
 * @returns {string} Display label
 */
export const getFaceDisplayLabel = (face, index) => {
  if (face.role === 'parent1') return 'Parent 1';
  if (face.role === 'parent2') return 'Parent 2';
  if (face.role === 'child') {
    // For children, we need to count properly among all children
    // This will be overridden by the component if needed
    return `Child ${index + 1}`;
  }
  return `Face ${index + 1}`;
};

/**
 * Get statistics from the pairwise matrix
 * @param {Object} matrixData - Result from computePairwiseMatrix
 * @returns {Object} Statistics
 */
export const getMatrixStatistics = (matrixData) => {
  if (!matrixData || !matrixData.similarities) {
    return null;
  }

  const { similarities, faceCount } = matrixData;
  const values = similarities.map(s => s.similarity);
  
  if (values.length === 0) {
    return null;
  }

  const sum = values.reduce((a, b) => a + b, 0);
  const mean = sum / values.length;
  const sortedValues = [...values].sort((a, b) => a - b);
  const min = sortedValues[0];
  const max = sortedValues[sortedValues.length - 1];
  const median = sortedValues.length % 2 === 0
    ? (sortedValues[sortedValues.length / 2 - 1] + sortedValues[sortedValues.length / 2]) / 2
    : sortedValues[Math.floor(sortedValues.length / 2)];

  // Calculate standard deviation
  const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  return {
    totalComparisons: values.length,
    faceCount,
    mean: mean,
    median: median,
    min: min,
    max: max,
    standardDeviation: stdDev,
    range: max - min
  };
};
