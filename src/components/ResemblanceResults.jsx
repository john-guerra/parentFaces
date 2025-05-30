import { formatSimilarityScore, getSimilarityDescription } from '../utils/helpers';
import './ResemblanceResults.css';

const ResemblanceResults = ({ results, image, onReset }) => {
  if (!results || results.length === 0) {
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

  return (
    <div className="resemblance-results">
      <div className="results-header">
        <h2>👨‍👩‍👧‍👦 Family Resemblance Analysis</h2>
        <p>Here's who your children look most like!</p>
      </div>

      <div className="results-grid">
        {results.map((result, index) => (
          <div key={index} className="child-result">
            <div className="child-info">
              <div className="face-preview">
                <img 
                  src={renderFaceImage(result.childFace)} 
                  alt={`Child ${index + 1}`}
                  className="face-img"
                />
              </div>
              <h3>Child {index + 1}</h3>
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
        ))}
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

      <div className="methodology">
        <details>
          <summary>How does this work?</summary>
          <div className="methodology-content">
            <p>
              Our family resemblance analysis uses advanced computer vision and machine learning:
            </p>
            <ul>
              <li><strong>Face Detection:</strong> We identify and locate faces in your photo using face-api.js</li>
              <li><strong>Feature Extraction:</strong> Each face is analyzed for key features like eye shape, nose structure, and facial geometry</li>
              <li><strong>Similarity Comparison:</strong> We compare facial features between children and parents using mathematical similarity algorithms</li>
              <li><strong>Confidence Scoring:</strong> Results are scored based on multiple facial characteristics</li>
            </ul>
            <p className="disclaimer">
              <em>Note: This is for entertainment purposes. Actual genetic resemblance involves many factors not captured in photos.</em>
            </p>
          </div>
        </details>
      </div>
    </div>
  );
};

export default ResemblanceResults;
