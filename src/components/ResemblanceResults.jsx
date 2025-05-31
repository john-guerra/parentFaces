import { formatSimilarityScore, getSimilarityDescription } from '../utils/helpers';
import VisualExplanation from './VisualExplanation';
import SimilarityChart from './SimilarityChart';
import ValidationResults from './ValidationResults';
import PairwiseMatrix from './PairwiseMatrix';
import './ResemblanceResults.css';

const ResemblanceResults = ({ results, image, onReset, validationData, photoCount = 1 }) => {
  if (!results || !Array.isArray(results) || results.length === 0) {
    return (
      <div className="resemblance-results">
        <div className="no-results">
          <h3>No results available</h3>
          <p>Please upload a photo and label the family members.</p>
        </div>
      </div>
    );
  }

  const renderFaceImage = (face, size = 80) => {
    if (!image || !face.box) return null;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = size;
    canvas.height = size;
    
    // Calculate aspect ratio and crop dimensions
    const { box } = face;
    const aspectRatio = box.width / box.height;
    let cropWidth = box.width;
    let cropHeight = box.height;
    let cropX = box.x;
    let cropY = box.y;
    
    // Make it square by cropping the larger dimension
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

  // Collect all faces for the pairwise matrix
  const getAllFaces = () => {
    const allFaces = [];
    
    // Safety check: ensure results is an array
    if (!Array.isArray(results) || results.length === 0) {
      return allFaces;
    }
    
    // Add all parents from the first result (they should be the same across all results)
    if (results.length > 0 && results[0].parentSimilarities) {
      results[0].parentSimilarities.forEach(ps => {
        if (!allFaces.find(face => face.role === ps.parent.role)) {
          allFaces.push(ps.parent);
        }
      });
    }
    
    // Add all children
    results.forEach(result => {
      if (result && result.childFace) {
        allFaces.push(result.childFace);
      }
    });
    
    return allFaces;
  };

  const allFaces = getAllFaces();

  return (
    <div className="resemblance-results">
      <div className="results-header">
        <h2>👨‍👩‍👧‍👦 Family Resemblance Analysis</h2>
        <p>Here's who your children look most like!</p>
      </div>

      <div className="results-grid">
        {results.map((result, index) => {
          // Safely get child index, fallback to array index + 1
          const childIndex = result.childFace?.childIndex ?? index;
          const childLabel = `Child ${childIndex + 1}`;
          
          return (
            <div key={index} className="child-result">
              <div className="child-info">
                <div className="face-preview">
                  <img 
                    src={renderFaceImage(result.childFace)} 
                    alt={childLabel}
                    className="face-img"
                  />
                </div>
                <h3>{childLabel}</h3>
              </div>

              <div className="resemblance-analysis">
                <div className="best-match">
                  <div className="match-header">
                    <h4>🏆 Most Similar To:</h4>
                    <div className="parent-match">
                      <div className="parent-preview">
                        <img 
                          src={renderFaceImage(result.mostSimilarParent)} 
                          alt="Most similar parent"
                          className="face-img"
                        />
                      </div>
                      <div className="match-info">
                        <span className="parent-label">
                          {result.mostSimilarParent.role === 'parent1' ? 'Parent 1' : 'Parent 2'}
                        </span>
                        <div className="similarity-score">
                          <span className="score">{formatSimilarityScore(result.confidence)}</span>
                          <span className="description">{getSimilarityDescription(result.confidence)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="all-comparisons">
                  <h5>Detailed Comparison:</h5>
                  <div className="comparison-list">
                    {result.parentSimilarities
                      .sort((a, b) => b.similarity - a.similarity)
                      .map((comparison, idx) => (
                        <div key={idx} className="comparison-item">
                          <div className="comparison-parent">
                            <img 
                              src={renderFaceImage(comparison.parent, 40)} 
                              alt={`Parent ${comparison.parent.role === 'parent1' ? '1' : '2'}`}
                              className="small-face-img"
                            />
                            <span>{comparison.parent.role === 'parent1' ? 'Parent 1' : 'Parent 2'}</span>
                          </div>
                          <div className="comparison-score">
                            <div className="score-bar">
                              <div 
                                className="score-fill"
                                style={{ width: `${comparison.similarity * 100}%` }}
                              />
                            </div>
                            <div className="score-details">
                              <span className="percentage">{formatSimilarityScore(comparison.similarity)}</span>
                              <span className="decimal">({comparison.similarity.toFixed(3)})</span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="results-actions">
        <button onClick={onReset} className="reset-btn">
          📸 Analyze Another Photo
        </button>
        <button 
          onClick={() => window.print()} 
          className="print-btn"
        >
          🖨️ Print Results
        </button>
      </div>

      {/* Visual Explanation Component */}
      <VisualExplanation />

      {/* Similarity Chart Component */}
      <SimilarityChart results={results} image={image} />

      {/* Pairwise Matrix Component */}
      <PairwiseMatrix allFaces={allFaces} image={image} />

      {/* Validation Results Component (for multiple photos) */}
      {photoCount > 1 && (
        <ValidationResults 
          validationData={validationData} 
          photoCount={photoCount} 
        />
      )}

      <div className="methodology">
        <details>
          <summary>How does this work?</summary>
          <div className="methodology-content">
            <p>
              Our family resemblance analysis uses advanced computer vision and machine learning:
            </p>
            <ul>
              <li><strong>Face Detection:</strong> We identify and locate faces in your photo using face-api.js neural networks</li>
              <li><strong>Feature Extraction:</strong> Each face is converted into a 128-dimensional numerical vector (descriptor) that captures unique facial characteristics like eye shape, nose structure, jawline, and overall facial geometry</li>
              <li><strong>Similarity Comparison:</strong> We use Euclidean distance measurement (recommended by face-api.js) to compare faces:
                <ul className="sub-list">
                  <li>Calculate Euclidean distance between 128-dimensional face descriptors</li>
                  <li>Distance &lt; 0.6 indicates likely match (same person or close family)</li>
                  <li>Convert distance to similarity percentage using sophisticated mapping</li>
                  <li>Euclidean distance is the standard method for face recognition systems</li>
                </ul>
              </li>
              <li><strong>Confidence Scoring:</strong> Results are ranked by similarity percentage, with the highest-scoring parent identified as the best match</li>
              <li><strong>Privacy:</strong> All processing happens in your browser - no photos are uploaded to servers</li>
            </ul>
            <div className="technical-details">
              <h4>Technical Details:</h4>
              <p><strong>Algorithm:</strong> Euclidean distance in 128-dimensional feature space</p>
              <p><strong>Models:</strong> Pre-trained face-api.js neural networks for feature extraction</p>
              <p><strong>Similarity Range:</strong> 0% (no resemblance) to 100% (identical features)</p>
              <p><strong>Typical Family Scores:</strong> 40-80% similarity between related family members</p>
              <p><strong>Advantage:</strong> Euclidean distance is the industry standard for face recognition</p>
            </div>
            <p className="disclaimer">
              <em>Note: This is for entertainment purposes. Actual genetic resemblance involves many factors not captured in photos, including 3D facial structure, expressions, aging, and non-visible genetic traits.</em>
            </p>
          </div>
        </details>
      </div>
    </div>
  );
};

export default ResemblanceResults;
