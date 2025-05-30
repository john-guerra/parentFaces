/**
 * Test symmetry of face comparison algorithm
 */

// Simple cosine similarity function for testing
const cosineSimilarity = (vecA, vecB) => {
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

// Test face comparison function (simplified version)
const compareFaces = (face1, face2) => {
  const cosineScore = cosineSimilarity(Array.from(face1.descriptor), Array.from(face2.descriptor));
  
  let normalizedScore;
  if (cosineScore >= 0) {
    normalizedScore = cosineScore;
  } else {
    normalizedScore = Math.max(0, 0.1 + (cosineScore * 0.1));
  }
  
  return Math.max(0, Math.min(1, normalizedScore));
};

// Create test faces
const createTestFace = (descriptor, label) => ({
  id: `face_${label}`,
  descriptor: new Float32Array(descriptor),
  label: label
});

// Generate realistic face descriptors
const generateDescriptor = (seed) => {
  const descriptor = new Array(128);
  for (let i = 0; i < 128; i++) {
    descriptor[i] = Math.sin(seed + i * 0.1) * 0.5;
  }
  return descriptor;
};

console.log('🧪 Testing Face Comparison Symmetry\n');

// Test 1: Basic symmetry
console.log('Test 1: Basic Symmetry');
const faceA = createTestFace(generateDescriptor(1), 'Parent A');
const faceB = createTestFace(generateDescriptor(2), 'Child B');

const similarityAB = compareFaces(faceA, faceB);
const similarityBA = compareFaces(faceB, faceA);

console.log(`A -> B: ${similarityAB.toFixed(6)}`);
console.log(`B -> A: ${similarityBA.toFixed(6)}`);
console.log(`Symmetric: ${similarityAB === similarityBA ? '✅' : '❌'}`);
console.log(`Difference: ${Math.abs(similarityAB - similarityBA).toFixed(10)}\n`);

// Test 2: Label swapping (same descriptors, different labels)
console.log('Test 2: Label Swapping (Same Descriptors)');
const parent1 = createTestFace(generateDescriptor(10), 'Parent 1');
const child1 = createTestFace(generateDescriptor(20), 'Child 1');

// First comparison
const sim1 = compareFaces(parent1, child1);
console.log(`Parent 1 -> Child 1: ${sim1.toFixed(6)}`);

// Swap labels but keep same descriptors
const parent1_swapped = createTestFace(generateDescriptor(10), 'Child 1');
const child1_swapped = createTestFace(generateDescriptor(20), 'Parent 1');

const sim2 = compareFaces(parent1_swapped, child1_swapped);
console.log(`Child 1 -> Parent 1 (swapped): ${sim2.toFixed(6)}`);
console.log(`Same result: ${sim1 === sim2 ? '✅' : '❌'}`);
console.log(`Difference: ${Math.abs(sim1 - sim2).toFixed(10)}\n`);

console.log('🔍 Analysis: Cosine similarity should always be symmetric since cos(A,B) = cos(B,A)');
console.log('If asymmetry is detected, there may be an issue with the comparison algorithm.\n');
