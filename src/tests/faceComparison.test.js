import { cosineSimilarity, comparefaces } from '../services/faceComparison.js';

/**
 * Unit tests for face comparison functionality
 * Run with: npm test or node src/tests/faceComparison.test.js
 */

// Simple test runner
class TestRunner {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  test(name, testFn) {
    this.tests.push({ name, testFn });
  }

  async run() {
    console.log('🧪 Running Face Comparison Tests\n');
    
    for (const { name, testFn } of this.tests) {
      try {
        await testFn();
        console.log(`✅ ${name}`);
        this.passed++;
      } catch (error) {
        console.log(`❌ ${name}`);
        console.log(`   Error: ${error.message}\n`);
        this.failed++;
      }
    }

    console.log(`\n📊 Test Results: ${this.passed} passed, ${this.failed} failed`);
    
    if (this.failed > 0) {
      console.log('\n🚨 Some tests failed! Please review the similarity calculation.');
    } else {
      console.log('\n🎉 All tests passed! Similarity calculation is working correctly.');
    }
  }
}

// Test helper functions
const assertEqual = (actual, expected, tolerance = 0.001) => {
  if (Math.abs(actual - expected) > tolerance) {
    throw new Error(`Expected ${expected}, but got ${actual}`);
  }
};

const assertBetween = (value, min, max) => {
  if (value < min || value > max) {
    throw new Error(`Expected value between ${min} and ${max}, but got ${value}`);
  }
};

// Create test runner
const runner = new TestRunner();

// Test 1: Cosine similarity basic functionality
runner.test('Cosine similarity - identical vectors should return 1.0', () => {
  const vec1 = [1, 2, 3, 4, 5];
  const vec2 = [1, 2, 3, 4, 5];
  const similarity = cosineSimilarity(vec1, vec2);
  assertEqual(similarity, 1.0);
});

// Test 2: Cosine similarity with perpendicular vectors
runner.test('Cosine similarity - perpendicular vectors should return 0.0', () => {
  const vec1 = [1, 0];
  const vec2 = [0, 1];
  const similarity = cosineSimilarity(vec1, vec2);
  assertEqual(similarity, 0.0);
});

// Test 3: Cosine similarity with opposite vectors
runner.test('Cosine similarity - opposite vectors should return -1.0', () => {
  const vec1 = [1, 2, 3];
  const vec2 = [-1, -2, -3];
  const similarity = cosineSimilarity(vec1, vec2);
  assertEqual(similarity, -1.0);
});

// Test 4: Face descriptor similarity (realistic case)
runner.test('Face descriptors - similar faces should have high similarity', async () => {
  // Simulate similar face descriptors (like family members)
  const face1 = {
    descriptor: new Float32Array([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8]),
    box: { x: 0, y: 0, width: 100, height: 100 }
  };
  
  const face2 = {
    descriptor: new Float32Array([0.11, 0.19, 0.31, 0.41, 0.49, 0.61, 0.69, 0.81]),
    box: { x: 0, y: 0, width: 100, height: 100 }
  };

  const result = await comparefaces(face1, face2);
  
  // Should be high similarity (> 0.8 for similar faces)
  assertBetween(result.faceApiSimilarity, 0.8, 1.0);
  assertBetween(result.combinedScore, 0.8, 1.0);
});

// Test 5: Face descriptor dissimilarity (realistic case)
runner.test('Face descriptors - different faces should have lower similarity', async () => {
  // Simulate different face descriptors
  const face1 = {
    descriptor: new Float32Array([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8]),
    box: { x: 0, y: 0, width: 100, height: 100 }
  };
  
  const face2 = {
    descriptor: new Float32Array([0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1]),
    box: { x: 0, y: 0, width: 100, height: 100 }
  };

  const result = await comparefaces(face1, face2);
  
  // Should be lower similarity (< 0.5 for different faces)
  assertBetween(result.faceApiSimilarity, 0.0, 0.5);
  assertBetween(result.combinedScore, 0.0, 0.5);
});

// Test 6: Identical face descriptors should return 100% similarity
runner.test('Face descriptors - identical faces should return 100% similarity', async () => {
  const descriptor = new Float32Array([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8]);
  
  const face1 = {
    descriptor: descriptor,
    box: { x: 0, y: 0, width: 100, height: 100 }
  };
  
  const face2 = {
    descriptor: new Float32Array(descriptor), // Copy the same descriptor
    box: { x: 0, y: 0, width: 100, height: 100 }
  };

  const result = await comparefaces(face1, face2);
  
  // Should be exactly 1.0 (100% similarity)
  assertEqual(result.faceApiSimilarity, 1.0, 0.001);
  assertEqual(result.combinedScore, 1.0, 0.001);
});

// Test 7: Normalized vectors test
runner.test('Cosine similarity - normalized vectors maintain correct range', () => {
  // Test with various normalized vectors
  const tests = [
    { vec1: [0.6, 0.8], vec2: [0.8, 0.6], expectedMin: 0.8, expectedMax: 1.0 },
    { vec1: [1, 0, 0], vec2: [0, 1, 0], expectedMin: -0.1, expectedMax: 0.1 },
    { vec1: [0.5, 0.5, 0.5], vec2: [0.5, 0.5, 0.5], expectedMin: 0.99, expectedMax: 1.0 }
  ];

  tests.forEach(({ vec1, vec2, expectedMin, expectedMax }) => {
    const similarity = cosineSimilarity(vec1, vec2);
    assertBetween(similarity, expectedMin, expectedMax);
  });
});

// Test 8: Edge cases
runner.test('Cosine similarity - handles edge cases correctly', () => {
  // Zero vectors
  const zeroVec = [0, 0, 0];
  const normalVec = [1, 2, 3];
  
  const similarity = cosineSimilarity(zeroVec, normalVec);
  assertEqual(similarity, 0.0); // Should return 0 for zero vectors
});

// Test 9: Face descriptor range validation
runner.test('Face comparison results are within valid range [0, 1]', async () => {
  // Test with random-like descriptors
  const face1 = {
    descriptor: new Float32Array(Array.from({ length: 128 }, () => Math.random() - 0.5)),
    box: { x: 0, y: 0, width: 100, height: 100 }
  };
  
  const face2 = {
    descriptor: new Float32Array(Array.from({ length: 128 }, () => Math.random() - 0.5)),
    box: { x: 0, y: 0, width: 100, height: 100 }
  };

  const result = await comparefaces(face1, face2);
  
  // All similarity scores should be between 0 and 1
  assertBetween(result.faceApiSimilarity, 0.0, 1.0);
  assertBetween(result.euclideanSimilarity, 0.0, 1.0);
  assertBetween(result.combinedScore, 0.0, 1.0);
});

// Test 10: Performance test with typical face descriptor size
runner.test('Performance test - handles standard face descriptor size efficiently', async () => {
  const startTime = performance.now();
  
  // face-api.js typically uses 128-dimensional descriptors
  const face1 = {
    descriptor: new Float32Array(128).fill(0.5),
    box: { x: 0, y: 0, width: 100, height: 100 }
  };
  
  const face2 = {
    descriptor: new Float32Array(128).fill(0.6),
    box: { x: 0, y: 0, width: 100, height: 100 }
  };

  const result = await comparefaces(face1, face2);
  const endTime = performance.now();
  
  const duration = endTime - startTime;
  
  // Should complete within reasonable time (< 10ms)
  if (duration > 10) {
    throw new Error(`Face comparison took too long: ${duration}ms`);
  }
  
  // Verify result is valid
  assertBetween(result.combinedScore, 0.0, 1.0);
});

// Export for programmatic use
export { runner, TestRunner };

// Run tests if this file is executed directly
if (typeof window === 'undefined' && import.meta.url === `file://${process.argv[1]}`) {
  runner.run();
}
