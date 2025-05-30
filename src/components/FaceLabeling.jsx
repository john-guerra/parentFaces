import { useState, useRef, useEffect, useCallback } from 'react';
import './FaceLabeling.css';

const roleOptions = [
  { value: 'parent1', label: 'Parent 1', color: '#007bff' },
  { value: 'parent2', label: 'Parent 2', color: '#28a745' },
  { value: 'child', label: 'Child', color: '#ffc107' }
];

const FaceLabeling = ({ image, detectedFaces, onLabelsComplete, onRedetectFaces }) => {
  const canvasRef = useRef(null);
  const [labels, setLabels] = useState({});
  const [currentFaceIndex, setCurrentFaceIndex] = useState(0);
  const [threshold, setThreshold] = useState(0.5);
  const [isRedetecting, setIsRedetecting] = useState(false);

  const getRoleColor = useCallback((role) => {
    const roleOption = roleOptions.find(r => r.value === role);
    return roleOption ? roleOption.color : '#ffffff';
  }, []);

  // Create face thumbnail
  const createFaceThumbnail = useCallback((face) => {
    if (!image || !face.box) return null;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const size = 80;
    
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
    
    // Ensure crop dimensions are within image bounds
    cropX = Math.max(0, Math.min(cropX, image.width - cropWidth));
    cropY = Math.max(0, Math.min(cropY, image.height - cropHeight));
    cropWidth = Math.min(cropWidth, image.width - cropX);
    cropHeight = Math.min(cropHeight, image.height - cropY);
    
    ctx.drawImage(
      image,
      cropX, cropY, cropWidth, cropHeight,
      0, 0, size, size
    );
    
    return canvas.toDataURL();
  }, [image]);

  const handleRedetect = async () => {
    if (!onRedetectFaces) return;
    
    setIsRedetecting(true);
    try {
      await onRedetectFaces(threshold);
      setLabels({}); // Reset labels when redetecting
      setCurrentFaceIndex(0);
    } catch (error) {
      console.error('Error redetecting faces:', error);
    }
    setIsRedetecting(false);
  };

  useEffect(() => {
    const drawFacesOnCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas || !image) return;

      const ctx = canvas.getContext('2d');
      
      // Set canvas dimensions to match image
      canvas.width = image.width;
      canvas.height = image.height;
      
      // Draw the image
      ctx.drawImage(image, 0, 0);
      
      // Draw face boxes
      detectedFaces.forEach((face, index) => {
        const { box } = face;
        const isCurrentFace = index === currentFaceIndex;
        const label = labels[face.id];
        
        // Set box style
        ctx.strokeStyle = isCurrentFace ? '#ff0000' : (label ? getRoleColor(label) : '#ffffff');
        ctx.lineWidth = isCurrentFace ? 3 : 2;
        ctx.fillStyle = isCurrentFace ? 'rgba(255, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';
        
        // Draw box
        ctx.fillRect(box.x, box.y, box.width, box.height);
        ctx.strokeRect(box.x, box.y, box.width, box.height);
        
        // Draw label if assigned
        if (label) {
          const roleOption = roleOptions.find(r => r.value === label);
          if (roleOption) {
            ctx.fillStyle = roleOption.color;
            ctx.font = '16px Arial';
            ctx.fillText(roleOption.label, box.x, box.y - 5);
          }
        }
        
        // Draw face number
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(`${index + 1}`, box.x + 5, box.y + 20);
      });
    };

    if (image && detectedFaces.length > 0) {
      drawFacesOnCanvas();
    }
  }, [image, detectedFaces, currentFaceIndex, labels, getRoleColor]);

  const handleLabelChange = (faceId, role) => {
    const newLabels = { ...labels, [faceId]: role };
    setLabels(newLabels);
    
    // Move to next unlabeled face
    const nextUnlabeledIndex = detectedFaces.findIndex((face, index) => 
      index > currentFaceIndex && !newLabels[face.id]
    );
    
    if (nextUnlabeledIndex !== -1) {
      setCurrentFaceIndex(nextUnlabeledIndex);
    } else {
      // All faces processed, stay on current face
      // The complete button will appear when conditions are met
    }
  };

  const handleComplete = () => {
    // Group faces by role
    const groupedFaces = {
      parents: [],
      children: []
    };
    
    detectedFaces.forEach(face => {
      const role = labels[face.id];
      if (role === 'parent1' || role === 'parent2') {
        groupedFaces.parents.push({ ...face, role });
      } else if (role === 'child') {
        groupedFaces.children.push({ ...face, role });
      }
    });
    
    onLabelsComplete(groupedFaces);
  };

  const canComplete = () => {
    const labeledFaces = Object.values(labels);
    const hasParents = labeledFaces.some(label => label === 'parent1' || label === 'parent2');
    const hasChildren = labeledFaces.some(label => label === 'child');
    return hasParents && hasChildren;
  };

  if (!detectedFaces || detectedFaces.length === 0) {
    return (
      <div className="face-labeling">
        <div className="no-faces">
          <h3>No faces detected</h3>
          <p>Please try uploading a different photo with clear faces.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="face-labeling">
      <h3>Label Family Members</h3>
      <p>Click on each face or use the controls below to identify who is who.</p>
      
      <div className="labeling-container">
        <div className="canvas-container">
          <canvas 
            ref={canvasRef}
            className="face-canvas"
            onClick={(e) => {
              // Handle canvas click to select faces
              const rect = canvasRef.current.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              
              // Scale coordinates to match canvas size
              const scaleX = canvasRef.current.width / rect.width;
              const scaleY = canvasRef.current.height / rect.height;
              const canvasX = x * scaleX;
              const canvasY = y * scaleY;
              
              // Find clicked face
              const clickedFaceIndex = detectedFaces.findIndex(face => {
                const { box } = face;
                return canvasX >= box.x && canvasX <= box.x + box.width &&
                       canvasY >= box.y && canvasY <= box.y + box.height;
              });
              
              if (clickedFaceIndex !== -1) {
                setCurrentFaceIndex(clickedFaceIndex);
              }
            }}
          />
        </div>
        
        <div className="labeling-controls">
          <div className="threshold-controls">
            <label htmlFor="threshold-slider">
              Face Detection Sensitivity: {(threshold * 100).toFixed(0)}%
            </label>
            <input
              id="threshold-slider"
              type="range"
              min="0.1"
              max="0.9"
              step="0.05"
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value))}
              className="threshold-slider"
            />
            <div className="threshold-value">
              Lower = More faces detected (may include false positives)
            </div>
            <button 
              onClick={handleRedetect}
              disabled={isRedetecting}
              className="redetect-btn"
            >
              {isRedetecting ? 'Detecting...' : 'Re-detect Faces'}
            </button>
          </div>

          <div className="current-face">
            <h4>
              Labeling Face {currentFaceIndex + 1} of {detectedFaces.length}
            </h4>
            {detectedFaces[currentFaceIndex] && (
              <img 
                src={createFaceThumbnail(detectedFaces[currentFaceIndex])} 
                alt={`Face ${currentFaceIndex + 1}`}
                className="face-thumbnail"
              />
            )}
            <div className="role-buttons">
              {roleOptions.map(role => (
                <button
                  key={role.value}
                  className={`role-btn ${labels[detectedFaces[currentFaceIndex]?.id] === role.value ? 'active' : ''}`}
                  style={{ borderColor: role.color }}
                  onClick={() => handleLabelChange(detectedFaces[currentFaceIndex].id, role.value)}
                >
                  {role.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="navigation">
            <button 
              onClick={() => setCurrentFaceIndex(Math.max(0, currentFaceIndex - 1))}
              disabled={currentFaceIndex === 0}
              className="nav-btn"
            >
              ← Previous
            </button>
            <button 
              onClick={() => setCurrentFaceIndex(Math.min(detectedFaces.length - 1, currentFaceIndex + 1))}
              disabled={currentFaceIndex === detectedFaces.length - 1}
              className="nav-btn"
            >
              Next →
            </button>
          </div>
          
          <div className="progress">
            <p>
              Labeled: {Object.keys(labels).length} / {detectedFaces.length} faces
            </p>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${(Object.keys(labels).length / detectedFaces.length) * 100}%` }}
              />
            </div>
          </div>
          
          {canComplete() && (
            <button 
              onClick={handleComplete}
              className="complete-btn"
            >
              Analyze Family Resemblance
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FaceLabeling;
