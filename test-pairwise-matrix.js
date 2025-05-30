// Test script for pairwise matrix functionality
import { computePairwiseMatrix, getMatrixStatistics, getFaceDisplayLabel } from '../src/services/pairwiseComparison.js';

// Mock face data for testing
const mockFaces = [
  {
    role: 'parent1',
    box: { x: 100, y: 100, width: 80, height: 80 },
    descriptor: new Float32Array(128).fill(0.1) // Mock descriptor
  },
  {
    role: 'parent2', 
    box: { x: 200, y: 100, width: 80, height: 80 },
    descriptor: new Float32Array(128).fill(0.2) // Mock descriptor
  },
  {
    role: 'child',
    box: { x: 150, y: 200, width: 70, height: 70 },
    descriptor: new Float32Array(128).fill(0.15) // Mock descriptor
  },
  {
    role: 'child',
    box: { x: 250, y: 200, width: 70, height: 70 },
    descriptor: new Float32Array(128).fill(0.18) // Mock descriptor
  }
];

async function testPairwiseMatrix() {
  console.log('🧪 Testing Pairwise Matrix Functionality...\n');
  
  try {
    // Test 1: Basic matrix computation
    console.log('1. Testing matrix computation...');
    const matrixData = await computePairwiseMatrix(mockFaces);
    
    if (!matrixData) {
      throw new Error('Matrix computation returned null');
    }
    
    console.log(`✅ Matrix computed successfully`);
    console.log(`   - Matrix size: ${matrixData.faceCount}x${matrixData.faceCount}`);
    console.log(`   - Number of comparisons: ${matrixData.similarities.length}`);
    
    // Test 2: Matrix properties
    console.log('\n2. Testing matrix properties...');
    const { matrix, faceCount } = matrixData;
    
    // Check diagonal elements (should be 1.0)
    let diagonalCorrect = true;
    for (let i = 0; i < faceCount; i++) {
      if (Math.abs(matrix[i][i] - 1.0) > 0.001) {
        diagonalCorrect = false;
        break;
      }
    }
    
    // Check symmetry
    let isSymmetric = true;
    for (let i = 0; i < faceCount; i++) {
      for (let j = i + 1; j < faceCount; j++) {
        if (Math.abs(matrix[i][j] - matrix[j][i]) > 0.001) {
          isSymmetric = false;
          break;
        }
      }
    }
    
    console.log(`✅ Diagonal elements correct: ${diagonalCorrect}`);
    console.log(`✅ Matrix is symmetric: ${isSymmetric}`);
    
    // Test 3: Statistics computation
    console.log('\n3. Testing statistics computation...');
    const stats = getMatrixStatistics(matrixData);
    
    if (!stats) {
      throw new Error('Statistics computation returned null');
    }
    
    console.log(`✅ Statistics computed successfully`);
    console.log(`   - Mean similarity: ${stats.mean.toFixed(3)}`);
    console.log(`   - Min similarity: ${stats.min.toFixed(3)}`);
    console.log(`   - Max similarity: ${stats.max.toFixed(3)}`);
    console.log(`   - Standard deviation: ${stats.standardDeviation.toFixed(3)}`);
    
    // Test 4: Face labeling
    console.log('\n4. Testing face labeling...');
    const labels = mockFaces.map((face, index) => getFaceDisplayLabel(face, index));
    console.log(`✅ Face labels: ${labels.join(', ')}`);
    
    // Test 5: Expected label patterns
    const expectedLabels = ['Parent 1', 'Parent 2', 'Child 1', 'Child 2'];
    const labelsMatch = labels.every((label, index) => label === expectedLabels[index]);
    console.log(`✅ Labels match expected pattern: ${labelsMatch}`);
    
    console.log('\n🎉 All tests passed! Pairwise matrix functionality is working correctly.');
    
    return {
      success: true,
      matrixData,
      statistics: stats,
      labels
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the test if this file is executed directly
if (typeof window === 'undefined') {
  testPairwiseMatrix().then(result => {
    if (result.success) {
      console.log('\n📊 Sample Matrix:');
      const { matrix } = result.matrixData;
      for (let i = 0; i < matrix.length; i++) {
        const row = matrix[i].map(val => val.toFixed(2)).join('  ');
        console.log(`   ${row}`);
      }
    }
    process.exit(result.success ? 0 : 1);
  });
}

export { testPairwiseMatrix };
