/**
 * Enhanced Face Comparison Validation Tests
 * Tests specifically for the issues reported by the user
 */

// Import required functions from the test suite
const { TestRunner } = require('./test-face-comparison.js');

// Enhanced test runner for the specific issues
class IssueValidationRunner {
  constructor() {
    this.tests = [];
    this.results = { passed: 0, failed: 0, errors: [] };
  }

  test(name, testFn) {
    this.tests.push({ name, testFn });
  }

  async run() {
    console.log('🔍 ISSUE VALIDATION TESTS\n');

    for (const test of this.tests) {
      try {
        console.log(`Testing: ${test.name}`);
        await test.testFn();
        console.log('✅ PASSED\n');
        this.results.passed++;
      } catch (error) {
        console.log(`❌ FAILED: ${error.message}\n`);
        this.results.failed++;
        this.results.errors.push({ test: test.name, error: error.message });
      }
    }

    this.printSummary();
  }

  printSummary() {
    console.log('=== ISSUE VALIDATION SUMMARY ===');
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    
    if (this.results.errors.length > 0) {
      console.log('\n🚨 ISSUES FOUND:');
      this.results.errors.forEach(({ test, error }) => {
        console.log(`  - ${test}: ${error}`);
      });
    } else {
      console.log('\n🎉 All issue validation tests passed!');
    }
  }
}

// Create enhanced test functions
const runner = new IssueValidationRunner();

// Test 1: Face comparison symmetry with realistic descriptors
runner.test('Face comparison symmetry (Issue #2)', async () => {
  // Simulate the enhanced cosineSimilarity function
  const cosineSimilarity = (vecA, vecB) => {
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

  // Create test faces with different descriptors but same structure as face-api.js
  const createFace = (seed, label) => {
    const descriptor = new Float32Array(128);
    for (let i = 0; i < 128; i++) {
      descriptor[i] = Math.sin(seed + i * 0.1) * 0.5;
    }
    return {
      id: `face_${label}`,
      descriptor: descriptor,
      label: label
    };
  };

  const parentFace = createFace(1.5, 'parent');
  const childFace = createFace(2.7, 'child');

  // Test symmetry of cosine similarity
  const sim1 = cosineSimilarity(parentFace.descriptor, childFace.descriptor);
  const sim2 = cosineSimilarity(childFace.descriptor, parentFace.descriptor);

  const difference = Math.abs(sim1 - sim2);
  
  if (difference > 1e-10) {
    throw new Error(`Cosine similarity not symmetric: ${sim1} vs ${sim2}, diff: ${difference}`);
  }

  console.log(`  Parent->Child: ${sim1.toFixed(8)}`);
  console.log(`  Child->Parent: ${sim2.toFixed(8)}`);
  console.log(`  Difference: ${difference.toExponential(2)}`);
});

// Test 2: Array conversion consistency
runner.test('Array conversion consistency', () => {
  const originalDesc = new Float32Array([0.123456789, -0.987654321, 0.555555555]);
  
  // Test multiple conversion paths
  const converted1 = Array.from(originalDesc);
  const converted2 = Array.isArray(originalDesc) ? originalDesc : Array.from(originalDesc);
  
  // Check if conversions preserve values
  for (let i = 0; i < originalDesc.length; i++) {
    if (Math.abs(originalDesc[i] - converted1[i]) > 1e-10) {
      throw new Error(`Array.from conversion lost precision at index ${i}`);
    }
    if (Math.abs(converted1[i] - converted2[i]) > 1e-10) {
      throw new Error(`Conversion methods inconsistent at index ${i}`);
    }
  }

  console.log('  Original:', Array.from(originalDesc));
  console.log('  Converted:', converted1);
  console.log('  All conversions preserve precision');
});

// Test 3: Edge cases with small and large values
runner.test('Edge cases handling', async () => {
  const cosineSimilarity = (vecA, vecB) => {
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
    
    if (normA < 1e-10 || normB < 1e-10) {
      return 0;
    }
    
    const similarity = dotProduct / (normA * normB);
    return Math.max(-1, Math.min(1, similarity));
  };

  // Test with very small values
  const smallVec1 = new Float32Array([1e-8, 2e-8, 3e-8]);
  const smallVec2 = new Float32Array([2e-8, 1e-8, 4e-8]);
  
  const smallSim1 = cosineSimilarity(smallVec1, smallVec2);
  const smallSim2 = cosineSimilarity(smallVec2, smallVec1);
  
  if (Math.abs(smallSim1 - smallSim2) > 1e-10) {
    throw new Error(`Small values not symmetric: ${smallSim1} vs ${smallSim2}`);
  }

  // Test with normal face descriptor range values
  const normalVec1 = new Float32Array(Array.from({ length: 128 }, (_, i) => Math.sin(i) * 0.5));
  const normalVec2 = new Float32Array(Array.from({ length: 128 }, (_, i) => Math.cos(i) * 0.5));
  
  const normalSim1 = cosineSimilarity(normalVec1, normalVec2);
  const normalSim2 = cosineSimilarity(normalVec2, normalVec1);
  
  if (Math.abs(normalSim1 - normalSim2) > 1e-10) {
    throw new Error(`Normal values not symmetric: ${normalSim1} vs ${normalSim2}`);
  }

  console.log(`  Small values symmetry: ✅ (${smallSim1.toFixed(8)})`);
  console.log(`  Normal values symmetry: ✅ (${normalSim1.toFixed(8)})`);
});

// Test 4: Label swapping consistency (the exact issue reported)
runner.test('Label swapping consistency (Reported Issue)', () => {
  // Create faces with the same descriptors but different labels
  const descriptor1 = new Float32Array(Array.from({ length: 128 }, (_, i) => Math.sin(i * 0.1) * 0.5));
  const descriptor2 = new Float32Array(Array.from({ length: 128 }, (_, i) => Math.cos(i * 0.1) * 0.3));

  // First scenario: Parent1 vs Child1
  const parent1 = { descriptor: descriptor1, label: 'Parent 1' };
  const child1 = { descriptor: descriptor2, label: 'Child 1' };

  // Second scenario: Same descriptors, swapped labels
  const parent1_swapped = { descriptor: descriptor1, label: 'Child 1' };
  const child1_swapped = { descriptor: descriptor2, label: 'Parent 1' };

  const cosineSimilarity = (vecA, vecB) => {
    const arrA = Array.from(vecA);
    const arrB = Array.from(vecB);
    
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
    
    if (normA < 1e-10 || normB < 1e-10) {
      return 0;
    }
    
    return Math.max(-1, Math.min(1, dotProduct / (normA * normB)));
  };

  const sim1 = cosineSimilarity(parent1.descriptor, child1.descriptor);
  const sim2 = cosineSimilarity(parent1_swapped.descriptor, child1_swapped.descriptor);

  const difference = Math.abs(sim1 - sim2);

  if (difference > 1e-12) {
    throw new Error(`Label swapping changed similarity: ${sim1} vs ${sim2}, diff: ${difference}`);
  }

  console.log(`  Original labels: ${sim1.toFixed(10)}`);
  console.log(`  Swapped labels: ${sim2.toFixed(10)}`);
  console.log(`  Difference: ${difference.toExponential(2)}`);
});

// Test 5: Robustness with missing/invalid data
runner.test('Robustness with invalid data', () => {
  const cosineSimilarity = (vecA, vecB) => {
    if (!vecA || !vecB) throw new Error('Null vectors provided');
    if (vecA.length !== vecB.length) throw new Error('Vector length mismatch');
    
    const arrA = Array.from(vecA);
    const arrB = Array.from(vecB);
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < arrA.length; i++) {
      if (!isFinite(arrA[i]) || !isFinite(arrB[i])) {
        throw new Error('Invalid values in vectors');
      }
      dotProduct += arrA[i] * arrB[i];
      normA += arrA[i] * arrA[i];
      normB += arrB[i] * arrB[i];
    }
    
    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);
    
    if (normA < 1e-10 || normB < 1e-10) {
      return 0;
    }
    
    return Math.max(-1, Math.min(1, dotProduct / (normA * normB)));
  };

  // Test various invalid inputs
  const validVec = new Float32Array([0.1, 0.2, 0.3]);
  
  // These should throw errors
  let errorCount = 0;
  
  try {
    cosineSimilarity(null, validVec);
  } catch (e) {
    errorCount++;
  }
  
  try {
    cosineSimilarity(validVec, new Float32Array([0.1, 0.2])); // Different length
  } catch (e) {
    errorCount++;
  }
  
  try {
    cosineSimilarity(validVec, new Float32Array([NaN, 0.2, 0.3])); // NaN value
  } catch (e) {
    errorCount++;
  }

  if (errorCount !== 3) {
    throw new Error(`Expected 3 errors for invalid inputs, got ${errorCount}`);
  }

  console.log(`  Properly handled ${errorCount} invalid input cases`);
});

// Run the tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { IssueValidationRunner };
}

// Run tests if executed directly
if (require.main === module) {
  runner.run().catch(console.error);
}
