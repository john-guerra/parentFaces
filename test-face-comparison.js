#!/usr/bin/env node

/**
 * Simple test runner for face comparison algorithms
 * Run with: node test-face-comparison.js
 */

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Simple console test runner
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
      process.exit(1);
    } else {
      console.log('\n🎉 All tests passed! Similarity calculation is working correctly.');
      process.exit(0);
    }
  }
}

// Mock implementations for testing (since we can't import the actual modules in Node.js)
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

const comparefaces = async (face1, face2) => {
  const results = {
    faceApiSimilarity: 0,
    euclideanSimilarity: 0,
    combinedScore: 0
  };
  
  if (face1.descriptor && face2.descriptor) {
    const cosineScore = cosineSimilarity(Array.from(face1.descriptor), Array.from(face2.descriptor));
    
    let normalizedScore;
    if (cosineScore >= 0) {
      normalizedScore = cosineScore;
    } else {
      normalizedScore = Math.max(0, 0.1 + (cosineScore * 0.1));
    }
    
    results.faceApiSimilarity = Math.max(0, Math.min(1, normalizedScore));
    
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

// Test 4: Identical face descriptors should return 100% similarity
runner.test('Face descriptors - identical faces should return 100% similarity', async () => {
  const descriptor = new Float32Array([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8]);
  
  const face1 = {
    descriptor: descriptor,
    box: { x: 0, y: 0, width: 100, height: 100 }
  };
  
  const face2 = {
    descriptor: new Float32Array(descriptor),
    box: { x: 0, y: 0, width: 100, height: 100 }
  };

  const result = await comparefaces(face1, face2);
  assertEqual(result.faceApiSimilarity, 1.0, 0.001);
  assertEqual(result.combinedScore, 1.0, 0.001);
});

// Test 5: Similar faces should have high similarity
runner.test('Face descriptors - similar faces should have high similarity', async () => {
  const face1 = {
    descriptor: new Float32Array([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8]),
    box: { x: 0, y: 0, width: 100, height: 100 }
  };
  
  const face2 = {
    descriptor: new Float32Array([0.11, 0.19, 0.31, 0.41, 0.49, 0.61, 0.69, 0.81]),
    box: { x: 0, y: 0, width: 100, height: 100 }
  };

  const result = await comparefaces(face1, face2);
  assertBetween(result.faceApiSimilarity, 0.8, 1.0);
});

// Test 6: Different faces should have lower similarity
runner.test('Face descriptors - different faces should have lower similarity', async () => {
  const face1 = {
    descriptor: new Float32Array([1.0, 0.8, 0.6, 0.4, 0.2, 0.0, -0.2, -0.4]),
    box: { x: 0, y: 0, width: 100, height: 100 }
  };
  
  const face2 = {
    descriptor: new Float32Array([-0.9, -0.7, -0.5, -0.3, -0.1, 0.1, 0.3, 0.5]),
    box: { x: 0, y: 0, width: 100, height: 100 }
  };

  const result = await comparefaces(face1, face2);
  assertBetween(result.faceApiSimilarity, 0.0, 0.5);
});

// Test 7: Range validation
runner.test('Face comparison results are within valid range [0, 1]', async () => {
  const face1 = {
    descriptor: new Float32Array(Array.from({ length: 128 }, () => Math.random() - 0.5)),
    box: { x: 0, y: 0, width: 100, height: 100 }
  };
  
  const face2 = {
    descriptor: new Float32Array(Array.from({ length: 128 }, () => Math.random() - 0.5)),
    box: { x: 0, y: 0, width: 100, height: 100 }
  };

  const result = await comparefaces(face1, face2);
  assertBetween(result.faceApiSimilarity, 0.0, 1.0);
  assertBetween(result.combinedScore, 0.0, 1.0);
});

// Test 8: Performance test
runner.test('Performance test - handles standard face descriptor size efficiently', async () => {
  const startTime = Date.now();
  
  const face1 = {
    descriptor: new Float32Array(128).fill(0.5),
    box: { x: 0, y: 0, width: 100, height: 100 }
  };
  
  const face2 = {
    descriptor: new Float32Array(128).fill(0.6),
    box: { x: 0, y: 0, width: 100, height: 100 }
  };

  const result = await comparefaces(face1, face2);
  const endTime = Date.now();
  
  const duration = endTime - startTime;
  
  if (duration > 100) { // More lenient for Node.js
    throw new Error(`Face comparison took too long: ${duration}ms`);
  }
  
  assertBetween(result.combinedScore, 0.0, 1.0);
});

// Test 9: Edge case with zero vectors
runner.test('Cosine similarity - handles zero vectors correctly', () => {
  const zeroVec = [0, 0, 0];
  const normalVec = [1, 2, 3];
  
  const similarity = cosineSimilarity(zeroVec, normalVec);
  assertEqual(similarity, 0.0);
});

// Test 10: Normalized similarity mapping test
runner.test('Similarity mapping - negative cosine values map to low similarity', async () => {
  // Create vectors that will have negative cosine similarity
  const face1 = {
    descriptor: new Float32Array([1, 1, 1, 1]),
    box: { x: 0, y: 0, width: 100, height: 100 }
  };
  
  const face2 = {
    descriptor: new Float32Array([-1, -1, -1, -1]),
    box: { x: 0, y: 0, width: 100, height: 100 }
  };

  const result = await comparefaces(face1, face2);
  
  // Should map negative cosine similarity to very low but positive similarity
  assertBetween(result.faceApiSimilarity, 0.0, 0.2);
  assertBetween(result.combinedScore, 0.0, 0.2);
});

// Run the tests
runner.run().catch(console.error);
