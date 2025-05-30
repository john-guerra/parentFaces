/**
 * Enhanced test suite using actual face-api.js similarity calculations
 * This tests the real algorithms used in production
 */

const { cosineSimilarity, comparefaces } = require('../services/faceComparison.js');

/**
 * Test helper to create face objects with realistic descriptors
 */
const createTestFace = (descriptor, label = 'test') => ({
  id: `face_${Math.random()}`,
  box: { x: 100, y: 100, width: 150, height: 150 },
  descriptor: new Float32Array(descriptor),
  confidence: 0.9,
  label: label
});

/**
 * Generate realistic face descriptor (similar to face-api.js output)
 */
const generateRealisticDescriptor = (seed = 1) => {
  const descriptor = new Array(128);
  for (let i = 0; i < 128; i++) {
    // Generate values in realistic range for face descriptors (-0.5 to 0.5)
    descriptor[i] = (Math.sin(seed + i * 0.1) * 0.5);
  }
  return descriptor;
};

/**
 * Test cosine similarity with realistic face descriptors
 */
export const testCosineSimilarityWithFaces = () => {
  console.log('🧪 Testing Cosine Similarity with Realistic Face Descriptors');
  
  // Test 1: Identical faces should be very similar
  const face1 = generateRealisticDescriptor(1);
  const face2 = [...face1]; // Copy
  const identicalSimilarity = cosineSimilarity(face1, face2);
  console.log(`✓ Identical faces similarity: ${identicalSimilarity.toFixed(4)} (should be 1.0)`);
  
  // Test 2: Very similar faces (slight variations)
  const face3 = face1.map(val => val + (Math.random() - 0.5) * 0.01); // Add small noise
  const similarSimilarity = cosineSimilarity(face1, face3);
  console.log(`✓ Similar faces similarity: ${similarSimilarity.toFixed(4)} (should be > 0.95)`);
  
  // Test 3: Different but related faces (family members)
  const face4 = generateRealisticDescriptor(10);
  const familySimilarity = cosineSimilarity(face1, face4);
  console.log(`✓ Family member similarity: ${familySimilarity.toFixed(4)} (should be 0.3-0.7)`);
  
  // Test 4: Completely different faces
  const face5 = generateRealisticDescriptor(100);
  const differentSimilarity = cosineSimilarity(face1, face5);
  console.log(`✓ Different faces similarity: ${differentSimilarity.toFixed(4)} (should be < 0.5)`);
  
  return {
    identical: identicalSimilarity,
    similar: similarSimilarity,
    family: familySimilarity,
    different: differentSimilarity
  };
};

/**
 * Test symmetry of face comparison (A->B should equal B->A)
 */
export const testFaceComparisonSymmetry = async () => {
  console.log('🧪 Testing Face Comparison Symmetry');
  
  const parentFace = createTestFace(generateRealisticDescriptor(1), 'parent');
  const childFace = createTestFace(generateRealisticDescriptor(2), 'child');
  
  // Compare parent to child
  const parentToChild = await comparefaces(parentFace, childFace);
  
  // Compare child to parent (should be identical)
  const childToParent = await comparefaces(childFace, parentFace);
  
  console.log(`Parent->Child similarity: ${parentToChild.combinedScore.toFixed(4)}`);
  console.log(`Child->Parent similarity: ${childToParent.combinedScore.toFixed(4)}`);
  
  const difference = Math.abs(parentToChild.combinedScore - childToParent.combinedScore);
  console.log(`Difference: ${difference.toFixed(6)} (should be near 0)`);
  
  if (difference < 0.001) {
    console.log('✅ Symmetry test PASSED');
  } else {
    console.log('❌ Symmetry test FAILED - comparison is not symmetric!');
  }
  
  return {
    parentToChild: parentToChild.combinedScore,
    childToParent: childToParent.combinedScore,
    isSymmetric: difference < 0.001
  };
};

/**
 * Test consistency with label swapping
 */
export const testLabelSwappingConsistency = async () => {
  console.log('🧪 Testing Label Swapping Consistency');
  
  // Create three faces: two parents and one child
  const mom = createTestFace(generateRealisticDescriptor(1), 'mom');
  const dad = createTestFace(generateRealisticDescriptor(2), 'dad');
  const child = createTestFace(generateRealisticDescriptor(1.5), 'child'); // More similar to mom
  
  // Scenario 1: Normal labels (mom/dad = parents, child = child)
  const momChildSim1 = await comparefaces(mom, child);
  const dadChildSim1 = await comparefaces(dad, child);
  
  // Scenario 2: Swap labels (child = parent, mom/dad = children)
  const childMomSim2 = await comparefaces(child, mom);
  const childDadSim2 = await comparefaces(child, dad);
  
  console.log('Scenario 1 (Normal):');
  console.log(`  Mom-Child: ${momChildSim1.combinedScore.toFixed(4)}`);
  console.log(`  Dad-Child: ${dadChildSim1.combinedScore.toFixed(4)}`);
  
  console.log('Scenario 2 (Swapped):');
  console.log(`  Child-Mom: ${childMomSim2.combinedScore.toFixed(4)}`);
  console.log(`  Child-Dad: ${childDadSim2.combinedScore.toFixed(4)}`);
  
  const momDiff = Math.abs(momChildSim1.combinedScore - childMomSim2.combinedScore);
  const dadDiff = Math.abs(dadChildSim1.combinedScore - childDadSim2.combinedScore);
  
  console.log(`Mom comparison difference: ${momDiff.toFixed(6)}`);
  console.log(`Dad comparison difference: ${dadDiff.toFixed(6)}`);
  
  const isConsistent = momDiff < 0.001 && dadDiff < 0.001;
  
  if (isConsistent) {
    console.log('✅ Label swapping consistency test PASSED');
  } else {
    console.log('❌ Label swapping consistency test FAILED');
  }
  
  return {
    normalMomChild: momChildSim1.combinedScore,
    normalDadChild: dadChildSim1.combinedScore,
    swappedChildMom: childMomSim2.combinedScore,
    swappedChildDad: childDadSim2.combinedScore,
    isConsistent: isConsistent
  };
};

/**
 * Run all enhanced tests
 */
export const runEnhancedTests = async () => {
  console.log('🚀 Running Enhanced Face Comparison Tests with Realistic Data\n');
  
  const results = {
    similarity: testCosineSimilarityWithFaces(),
    symmetry: await testFaceComparisonSymmetry(),
    labelConsistency: await testLabelSwappingConsistency()
  };
  
  console.log('\n📊 Test Summary:');
  console.log(`Similarity test completed: ${results.similarity ? '✅' : '❌'}`);
  console.log(`Symmetry test: ${results.symmetry.isSymmetric ? '✅' : '❌'}`);
  console.log(`Label consistency test: ${results.labelConsistency.isConsistent ? '✅' : '❌'}`);
  
  return results;
};
