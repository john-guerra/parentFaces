import './VisualExplanation.css';

const VisualExplanation = () => {
  return (
    <div className="visual-explanation">
      <h3>🔬 How Face Comparison Works</h3>
      
      <div className="explanation-steps">
        <div className="step">
          <div className="step-number">1</div>
          <div className="step-content">
            <h4>Face Detection</h4>
            <p>AI identifies and locates faces in your photo using advanced computer vision</p>
            <div className="step-visual">
              <div className="face-detection-demo">
                <div className="photo-frame">
                  <div className="detected-face face-1"></div>
                  <div className="detected-face face-2"></div>
                  <div className="detected-face face-3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="step">
          <div className="step-number">2</div>
          <div className="step-content">
            <h4>Feature Extraction</h4>
            <p>Each face is analyzed for key features like eye shape, nose structure, and facial geometry</p>
            <div className="step-visual">
              <div className="feature-extraction-demo">
                <div className="face-outline">
                  <div className="feature-point eye-left"></div>
                  <div className="feature-point eye-right"></div>
                  <div className="feature-point nose"></div>
                  <div className="feature-point mouth"></div>
                  <div className="feature-point jaw-left"></div>
                  <div className="feature-point jaw-right"></div>
                </div>
                <div className="arrow">→</div>
                <div className="feature-vector">
                  <div className="vector-bar" style={{height: '60%'}}></div>
                  <div className="vector-bar" style={{height: '40%'}}></div>
                  <div className="vector-bar" style={{height: '80%'}}></div>
                  <div className="vector-bar" style={{height: '30%'}}></div>
                  <div className="vector-bar" style={{height: '70%'}}></div>
                  <div className="vector-bar" style={{height: '50%'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="step">
          <div className="step-number">3</div>
          <div className="step-content">
            <h4>Similarity Calculation</h4>
            <p>Mathematical algorithms compare feature vectors to determine facial similarity</p>
            <div className="step-visual">
              <div className="similarity-demo">
                <div className="comparison">
                  <div className="face-vector child">
                    <span>Child</span>
                    <div className="vector-mini">
                      <div className="bar" style={{height: '60%'}}></div>
                      <div className="bar" style={{height: '40%'}}></div>
                      <div className="bar" style={{height: '80%'}}></div>
                    </div>
                  </div>
                  <div className="vs">VS</div>
                  <div className="face-vector parent">
                    <span>Parent</span>
                    <div className="vector-mini">
                      <div className="bar" style={{height: '55%'}}></div>
                      <div className="bar" style={{height: '45%'}}></div>
                      <div className="bar" style={{height: '75%'}}></div>
                    </div>
                  </div>
                </div>
                <div className="similarity-score">
                  <span className="score-label">Similarity Score:</span>
                  <span className="score-value">87%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="technical-details">
        <details>
          <summary>Technical Details</summary>
          <div className="tech-content">
            <h5>Face Detection Algorithm:</h5>
            <ul>
              <li><strong>TinyFaceDetector:</strong> Lightweight neural network for real-time face detection</li>
              <li><strong>68-Point Landmarks:</strong> Precise facial feature mapping</li>
              <li><strong>Recognition Network:</strong> 128-dimensional face embeddings</li>
            </ul>
            
            <h5>Similarity Calculation:</h5>
            <ul>
              <li><strong>Euclidean Distance:</strong> Measures difference between face embeddings</li>
              <li><strong>Normalization:</strong> Converts distance to 0-100% similarity scale</li>
              <li><strong>Threshold:</strong> Higher scores indicate stronger resemblance</li>
            </ul>
          </div>
        </details>
      </div>
    </div>
  );
};

export default VisualExplanation;
