import React from 'react';
import './ValidationResults.css';

const ValidationResults = ({ validationData, photoCount }) => {
  if (!validationData || photoCount < 2) {
    return null;
  }

  const { isValid, confidence, consistencyScore, recommendations } = validationData;

  const getConfidenceColor = (score) => {
    if (score >= 0.9) return '#28a745';
    if (score >= 0.7) return '#ffc107';
    return '#dc3545';
  };

  const getConfidenceText = (score) => {
    if (score >= 0.9) return 'High';
    if (score >= 0.7) return 'Medium';
    return 'Low';
  };

  return (
    <div className="validation-results">
      <div className="validation-header">
        <h3>🔍 Multi-Photo Validation</h3>
        <p>Analysis across {photoCount} photos</p>
      </div>

      <div className="validation-metrics">
        <div className="metric">
          <div className="metric-label">Consistency Score</div>
          <div 
            className="metric-value"
            style={{ color: getConfidenceColor(consistencyScore) }}
          >
            {Math.round(consistencyScore * 100)}%
          </div>
        </div>

        <div className="metric">
          <div className="metric-label">Confidence Level</div>
          <div 
            className="metric-value"
            style={{ color: getConfidenceColor(confidence) }}
          >
            {getConfidenceText(confidence)}
          </div>
        </div>

        <div className="metric">
          <div className="metric-label">Validation Status</div>
          <div 
            className={`metric-value ${isValid ? 'valid' : 'invalid'}`}
          >
            {isValid ? '✅ Passed' : '⚠️ Inconsistent'}
          </div>
        </div>
      </div>

      {recommendations && recommendations.length > 0 && (
        <div className="validation-recommendations">
          <h4>Recommendations:</h4>
          <ul>
            {recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="validation-explanation">
        <p>
          <strong>Multi-photo validation</strong> compares results across different images 
          to ensure consistency and improve accuracy. Higher consistency scores indicate 
          more reliable family resemblance analysis.
        </p>
      </div>
    </div>
  );
};

export default ValidationResults;
