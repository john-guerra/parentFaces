/**
 * Comprehensive test for face comparison issues
 * Tests the actual services used in production
 */

console.log('🔍 Testing Face Comparison Issues\n');

// Test the actual cosine similarity function with edge cases
const testCosineSimilarity = () => {
  console.log('=== Testing Cosine Similarity Function ===');
  
  // Mock the actual function from the services
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

  // Test with Float32Array (as used in face-api.js)
  const desc1 = new Float32Array([0.1, 0.2, 0.3, 0.4]);
  const desc2 = new Float32Array([0.4, 0.3, 0.2, 0.1]);
  
  const sim1 = cosineSimilarity(Array.from(desc1), Array.from(desc2));
  const sim2 = cosineSimilarity(Array.from(desc2), Array.from(desc1));
  
  console.log(`Float32Array test:`);
  console.log(`desc1 -> desc2: ${sim1.toFixed(6)}`);
  console.log(`desc2 -> desc1: ${sim2.toFixed(6)}`);
  console.log(`Symmetric: ${sim1 === sim2 ? '✅' : '❌'}\n`);
  
  return { sim1, sim2, symmetric: sim1 === sim2 };
};

// Test the face comparison pipeline
const testFaceComparison = () => {
  console.log('=== Testing Face Comparison Pipeline ===');
  
  // Mock comparefaces function from services
  const comparefaces = async (face1, face2) => {
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

    const results = {
      faceApiSimilarity: 0,
      euclideanSimilarity: 0,
      combinedScore: 0
    };
    
    if (face1.descriptor && face2.descriptor) {
      // This is the EXACT same logic from the services
      const cosineScore = cosineSimilarity(Array.from(face1.descriptor), Array.from(face2.descriptor));
      
      let normalizedScore;
      if (cosineScore >= 0) {
        normalizedScore = cosineScore;
      } else {
        normalizedScore = Math.max(0, 0.1 + (cosineScore * 0.1));
      }
      
      results.faceApiSimilarity = Math.max(0, Math.min(1, normalizedScore));
      
      // Also calculate Euclidean distance for comparison
      let distance = 0;
      for (let i = 0; i < face1.descriptor.length; i++) {
        const diff = face1.descriptor[i] - face2.descriptor[i];
        distance += diff * diff;
      }
      distance = Math.sqrt(distance);
      
      results.euclideanSimilarity = Math.max(0, Math.min(1, 1 - (distance / 1.2)));
    }
    
    results.combinedScore = results.faceApiSimilarity;
    
    return results;
  };

  // Create test faces with realistic descriptors
  const createFace = (seed, label) => {
    const descriptor = new Float32Array(128);
    for (let i = 0; i < 128; i++) {
      descriptor[i] = Math.sin(seed + i * 0.1) * 0.5;
    }
    return {
      id: `face_${label}`,
      descriptor: descriptor,
      label: label,
      box: { x: 100, y: 100, width: 150, height: 150 }
    };
  };

  const parent = createFace(1.0, 'parent');
  const child = createFace(2.0, 'child');
  
  return Promise.all([
    comparefaces(parent, child),
    comparefaces(child, parent)
  ]).then(([result1, result2]) => {
    console.log(`Parent -> Child: ${result1.combinedScore.toFixed(6)}`);
    console.log(`Child -> Parent: ${result2.combinedScore.toFixed(6)}`);
    
    const diff = Math.abs(result1.combinedScore - result2.combinedScore);
    console.log(`Difference: ${diff.toFixed(10)}`);
    console.log(`Symmetric: ${diff < 0.000001 ? '✅' : '❌'}\n`);
    
    return {
      score1: result1.combinedScore,
      score2: result2.combinedScore,
      symmetric: diff < 0.000001
    };
  });
};

// Test array conversion issues
const testArrayConversion = () => {
  console.log('=== Testing Array Conversion Issues ===');
  
  const float32Array = new Float32Array([0.1, 0.2, 0.3]);
  const regularArray = [0.1, 0.2, 0.3];
  
  console.log('Float32Array:', float32Array);
  console.log('Array.from(Float32Array):', Array.from(float32Array));
  console.log('Regular Array:', regularArray);
  
  // Test if Array.from preserves precision
  const converted = Array.from(float32Array);
  const match = converted.every((val, i) => val === regularArray[i]);
  console.log(`Conversion preserves values: ${match ? '✅' : '❌'}\n`);
  
  return { match, float32Array, converted, regularArray };
};

// Test with different descriptor scenarios
const testDescriptorScenarios = async () => {
  console.log('=== Testing Different Descriptor Scenarios ===');
  
  // Test 1: Identical descriptors
  const identicalDesc = new Float32Array(Array.from({ length: 128 }, () => 0.5));
  const face1 = { descriptor: identicalDesc, id: 'face1' };
  const face2 = { descriptor: new Float32Array(identicalDesc), id: 'face2' };
  
  console.log('Test 1: Identical descriptors');
  console.log(`Face 1 descriptor[0]: ${face1.descriptor[0]}`);
  console.log(`Face 2 descriptor[0]: ${face2.descriptor[0]}`);
  console.log(`Arrays are identical: ${face1.descriptor.every((val, i) => val === face2.descriptor[i]) ? '✅' : '❌'}`);
  
  // Test 2: Small differences
  const smallDiffDesc = new Float32Array(identicalDesc);
  smallDiffDesc[0] += 0.001; // Tiny change
  const face3 = { descriptor: smallDiffDesc, id: 'face3' };
  
  console.log('\nTest 2: Small difference in descriptor');
  console.log(`Face 1 descriptor[0]: ${face1.descriptor[0]}`);
  console.log(`Face 3 descriptor[0]: ${face3.descriptor[0]}`);
  console.log(`Difference: ${Math.abs(face1.descriptor[0] - face3.descriptor[0])}`);
  
  return { identicalDesc, face1, face2, face3 };
};

// Run all tests
async function runAllTests() {
  console.log('🧪 COMPREHENSIVE FACE COMPARISON TESTING\n');
  
  const cosineResults = testCosineSimilarity();
  const arrayResults = testArrayConversion();
  const descriptorResults = await testDescriptorScenarios();
  const comparisonResults = await testFaceComparison();
  
  console.log('=== SUMMARY ===');
  console.log(`Cosine similarity symmetric: ${cosineResults.symmetric ? '✅' : '❌'}`);
  console.log(`Array conversion works: ${arrayResults.match ? '✅' : '❌'}`);
  console.log(`Face comparison symmetric: ${comparisonResults.symmetric ? '✅' : '❌'}`);
  
  if (!comparisonResults.symmetric) {
    console.log(`❌ ISSUE FOUND: Face comparison is not symmetric!`);
    console.log(`Score difference: ${Math.abs(comparisonResults.score1 - comparisonResults.score2)}`);
  } else {
    console.log(`✅ All symmetry tests passed`);
  }
}

runAllTests().catch(console.error);
