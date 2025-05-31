import React, { useState, useEffect } from 'react';
import { computePairwiseMatrix, getMatrixStatistics } from '../services/pairwiseComparison';
import { formatSimilarityScore } from '../utils/helpers';
import './PairwiseMatrix.css';

const PairwiseMatrix = ({ allFaces, image }) => {
  const [matrixData, setMatrixData] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!allFaces || allFaces.length < 2) {
      setMatrixData(null);
      setStatistics(null);
      return;
    }

    const computeMatrix = () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = computePairwiseMatrix(allFaces);
        setMatrixData(data);
        
        if (data) {
          const stats = getMatrixStatistics(data);
          setStatistics(stats);
        }
      } catch (err) {
        console.error('Error computing pairwise matrix:', err);
        setError('Failed to compute similarity matrix');
      } finally {
        setLoading(false);
      }
    };

    computeMatrix();
  }, [allFaces]);

  const renderFaceImage = (face, size = 40) => {
    if (!image || !face.box) return null;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = size;
    canvas.height = size;
    
    const { box } = face;
    const aspectRatio = box.width / box.height;
    let cropWidth = box.width;
    let cropHeight = box.height;
    let cropX = box.x;
    let cropY = box.y;
    
    // Center crop to square
    if (aspectRatio > 1) {
      cropWidth = box.height;
      cropX = box.x + (box.width - box.height) / 2;
    } else {
      cropHeight = box.width;
      cropY = box.y + (box.height - box.width) / 2;
    }
    
    ctx.drawImage(
      image,
      cropX, cropY, cropWidth, cropHeight,
      0, 0, size, size
    );
    
    return canvas.toDataURL();
  };

  const getSimilarityColor = (similarity) => {
    // Color scale from red (low similarity) to green (high similarity)
    const hue = similarity * 120; // 0 = red, 120 = green
    const saturation = 70;
    const lightness = 85;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  const getSimilarityTextColor = (similarity) => {
    // Use dark text for better contrast
    return similarity > 0.6 ? '#2d5016' : '#333';
  };

  if (!allFaces || allFaces.length < 2) {
    return (
      <div className="pairwise-matrix">
        <h3>Face Similarity Matrix</h3>
        <p className="no-data">Need at least 2 faces to show similarity matrix</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="pairwise-matrix">
        <h3>Face Similarity Matrix</h3>
        <div className="loading">Computing similarities...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pairwise-matrix">
        <h3>Face Similarity Matrix</h3>
        <div className="error">{error}</div>
      </div>
    );
  }

  if (!matrixData) {
    return null;
  }

  const { matrix, faces } = matrixData;

  // Local helper function to properly label faces based on their position in our specific array
  const getLocalFaceLabel = (face, index) => {
    if (face.role === 'parent1') return 'Parent 1';
    if (face.role === 'parent2') return 'Parent 2';
    if (face.role === 'child') {
      // Count child index by looking at how many children come before this one
      let childIndex = 0;
      for (let i = 0; i < index; i++) {
        if (faces[i].role === 'child') {
          childIndex++;
        }
      }
      return `Child ${childIndex + 1}`;
    }
    return `Face ${index + 1}`;
  };

  return (
    <div className="pairwise-matrix">
      <h3>Face Similarity Matrix</h3>
      <p className="description">
        This matrix shows similarity scores between all detected faces. 
        Higher scores (greener) indicate more similar faces.
      </p>
      
      <div className="matrix-container">
        <div className="matrix-grid" style={{ gridTemplateColumns: `80px repeat(${faces.length}, 1fr)` }}>
          {/* Empty top-left corner */}
          <div className="matrix-cell header-corner"></div>
          
          {/* Column headers */}
          {faces.map((face, index) => (
            <div key={`header-${index}`} className="matrix-cell header-col">
              <div className="face-header">
                {image && (
                  <img 
                    src={renderFaceImage(face, 30)} 
                    alt={getLocalFaceLabel(face, index)}
                    className="face-thumbnail"
                  />
                )}
                <span className="face-label">{getLocalFaceLabel(face, index)}</span>
              </div>
            </div>
          ))}
          
          {/* Matrix rows */}
          {faces.map((rowFace, rowIndex) => (
            <React.Fragment key={`row-${rowIndex}`}>
              {/* Row header */}
              <div className="matrix-cell header-row">
                <div className="face-header">
                  {image && (
                    <img 
                      src={renderFaceImage(rowFace, 30)} 
                      alt={getLocalFaceLabel(rowFace, rowIndex)}
                      className="face-thumbnail"
                    />
                  )}
                  <span className="face-label">{getLocalFaceLabel(rowFace, rowIndex)}</span>
                </div>
              </div>
              
              {/* Data cells */}
              {faces.map((colFace, colIndex) => {
                const similarity = matrix[rowIndex][colIndex];
                const isDiagonal = rowIndex === colIndex;
                
                return (
                  <div 
                    key={`cell-${rowIndex}-${colIndex}`}
                    className={`matrix-cell data-cell ${isDiagonal ? 'diagonal' : ''}`}
                    style={{
                      backgroundColor: isDiagonal ? '#f0f0f0' : getSimilarityColor(similarity),
                      color: isDiagonal ? '#666' : getSimilarityTextColor(similarity)
                    }}
                    title={`${getLocalFaceLabel(rowFace, rowIndex)} vs ${getLocalFaceLabel(colFace, colIndex)}: ${formatSimilarityScore(similarity)}`}
                  >
                    {isDiagonal ? '—' : formatSimilarityScore(similarity)}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {statistics && (
        <div className="matrix-statistics">
          <h4>Matrix Statistics</h4>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Comparisons:</span>
              <span className="stat-value">{statistics.totalComparisons}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Average:</span>
              <span className="stat-value">{formatSimilarityScore(statistics.mean)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Range:</span>
              <span className="stat-value">
                {formatSimilarityScore(statistics.min)} - {formatSimilarityScore(statistics.max)}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Std Dev:</span>
              <span className="stat-value">{formatSimilarityScore(statistics.standardDeviation)}</span>
            </div>
          </div>
        </div>
      )}

      <div className="legend">
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: getSimilarityColor(0.2) }}></div>
          <span>Low similarity</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: getSimilarityColor(0.5) }}></div>
          <span>Medium similarity</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: getSimilarityColor(0.8) }}></div>
          <span>High similarity</span>
        </div>
      </div>
    </div>
  );
};

export default PairwiseMatrix;
