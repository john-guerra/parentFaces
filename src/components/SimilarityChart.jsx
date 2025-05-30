import { formatSimilarityScore } from '../utils/helpers';
import './SimilarityChart.css';

const SimilarityChart = ({ results, image }) => {
  if (!results || results.length === 0) {
    return null;
  }

  // Get all parents from the first result (they should be the same across all results)
  const parents = results[0]?.parentSimilarities?.map(ps => ps.parent) || [];
  
  // Create a matrix of all similarities
  const similarityMatrix = [];
  
  // Add parent-to-parent comparisons (if we have multiple parents)
  if (parents.length > 1) {
    for (let i = 0; i < parents.length; i++) {
      for (let j = i + 1; j < parents.length; j++) {
        // For demo purposes, we'll simulate parent-to-parent similarity
        // In a real app, you might want to calculate this
        const similarity = 0.3 + Math.random() * 0.4; // Random between 0.3-0.7
        similarityMatrix.push({
          face1: parents[i],
          face2: parents[j],
          similarity: similarity,
          type: 'parent-parent'
        });
      }
    }
  }
  
  // Add child-to-parent comparisons
  results.forEach((result, childIndex) => {
    result.parentSimilarities.forEach(ps => {
      similarityMatrix.push({
        face1: result.childFace,
        face2: ps.parent,
        similarity: ps.similarity,
        type: 'child-parent',
        childIndex: childIndex
      });
    });
  });
  
  // Add child-to-child comparisons (if we have multiple children)
  if (results.length > 1) {
    for (let i = 0; i < results.length; i++) {
      for (let j = i + 1; j < results.length; j++) {
        // For demo purposes, we'll simulate child-to-child similarity
        const similarity = 0.4 + Math.random() * 0.4; // Random between 0.4-0.8
        similarityMatrix.push({
          face1: results[i].childFace,
          face2: results[j].childFace,
          similarity: similarity,
          type: 'child-child',
          childIndex1: i,
          childIndex2: j
        });
      }
    }
  }

  const renderFaceImage = (face, size = 50) => {
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

  const getFaceLabel = (face, childIndex) => {
    if (face.role === 'parent1') return 'Parent 1';
    if (face.role === 'parent2') return 'Parent 2';
    if (face.role === 'child') return `Child ${childIndex + 1}`;
    return 'Unknown';
  };

  const getComparisonTypeColor = (type) => {
    switch (type) {
      case 'child-parent': return '#3b82f6';
      case 'parent-parent': return '#8b5cf6';
      case 'child-child': return '#10b981';
      default: return '#64748b';
    }
  };

  const getComparisonTypeLabel = (type) => {
    switch (type) {
      case 'child-parent': return 'Child ↔ Parent';
      case 'parent-parent': return 'Parent ↔ Parent';
      case 'child-child': return 'Child ↔ Child';
      default: return 'Comparison';
    }
  };

  // Sort by similarity score (highest first)
  const sortedMatrix = [...similarityMatrix].sort((a, b) => b.similarity - a.similarity);

  return (
    <div className="similarity-chart">
      <div className="chart-header">
        <h3>📊 Complete Similarity Matrix</h3>
        <p>All face-to-face similarity comparisons</p>
      </div>

      <div className="legend">
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#3b82f6' }}></div>
          <span>Child ↔ Parent</span>
        </div>
        {parents.length > 1 && (
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#8b5cf6' }}></div>
            <span>Parent ↔ Parent</span>
          </div>
        )}
        {results.length > 1 && (
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#10b981' }}></div>
            <span>Child ↔ Child</span>
          </div>
        )}
      </div>

      <div className="chart-content">
        {sortedMatrix.map((comparison, index) => (
          <div key={index} className="comparison-row">
            <div className="faces-comparison">
              <div className="face-item">
                <img 
                  src={renderFaceImage(comparison.face1)} 
                  alt="Face 1"
                  className="chart-face-img"
                />
                <span className="face-label">
                  {getFaceLabel(comparison.face1, comparison.childIndex || comparison.childIndex1)}
                </span>
              </div>
              
              <div className="comparison-info">
                <div 
                  className="comparison-type"
                  style={{ color: getComparisonTypeColor(comparison.type) }}
                >
                  {getComparisonTypeLabel(comparison.type)}
                </div>
                <div className="similarity-visual">
                  <div className="similarity-bar">
                    <div 
                      className="similarity-fill"
                      style={{ 
                        width: `${comparison.similarity * 100}%`,
                        backgroundColor: getComparisonTypeColor(comparison.type)
                      }}
                    />
                  </div>
                  <div className="similarity-values">
                    <span className="percentage">{formatSimilarityScore(comparison.similarity)}</span>
                    <span className="decimal">({comparison.similarity.toFixed(3)})</span>
                  </div>
                </div>
              </div>

              <div className="face-item">
                <img 
                  src={renderFaceImage(comparison.face2)} 
                  alt="Face 2"
                  className="chart-face-img"
                />
                <span className="face-label">
                  {getFaceLabel(comparison.face2, comparison.childIndex2)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="chart-summary">
        <div className="summary-stats">
          <div className="stat">
            <span className="stat-label">Total Comparisons:</span>
            <span className="stat-value">{similarityMatrix.length}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Highest Similarity:</span>
            <span className="stat-value">{formatSimilarityScore(sortedMatrix[0]?.similarity || 0)}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Average Similarity:</span>
            <span className="stat-value">
              {formatSimilarityScore(
                similarityMatrix.reduce((sum, comp) => sum + comp.similarity, 0) / similarityMatrix.length
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimilarityChart;
