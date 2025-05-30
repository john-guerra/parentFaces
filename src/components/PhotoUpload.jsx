import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { isValidImageFile, formatFileSize } from '../utils/helpers';
import './PhotoUpload.css';

const PhotoUpload = ({ onImageUpload, onMultipleImagesUpload, isProcessing }) => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [error, setError] = useState('');
  const [uploadMode, setUploadMode] = useState('single'); // 'single' or 'multiple'

  const loadDemoImage = useCallback(async () => {
    setError('');
    try {
      // Use a local demo image instead of external URL for better reliability
      const demoUrl = `${import.meta.env.BASE_URL || '/'}demo/obama-family.jpg`;
      const response = await fetch(demoUrl);
      if (!response.ok) {
        throw new Error('Demo image not found');
      }
      const blob = await response.blob();
      const file = new File([blob], 'obama-family.jpg', { type: 'image/jpeg' });
      
      setUploadedFiles([file]);
      await onImageUpload(file);
    } catch (err) {
      console.warn('Demo image not available:', err.message);
      setError('Demo image not available. Please upload your own family photo.');
    }
  }, [onImageUpload]);

  const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
    setError('');
    
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      setError('Please upload valid image files (JPEG, PNG, GIF, WebP)');
      return;
    }

    // Filter for valid image files
    const validFiles = acceptedFiles.filter(isValidImageFile);
    
    if (validFiles.length === 0) {
      setError('No valid image files found');
      return;
    }

    setUploadedFiles(validFiles);
    
    try {
      if (uploadMode === 'single' || validFiles.length === 1) {
        await onImageUpload(validFiles[0]);
      } else {
        await onMultipleImagesUpload(validFiles);
      }
    } catch (err) {
      setError('Error processing image(s): ' + err.message);
    }
  }, [onImageUpload, onMultipleImagesUpload, uploadMode]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: uploadMode === 'multiple',
    disabled: isProcessing
  });

  const removeFile = (index = null) => {
    if (index !== null) {
      setUploadedFiles(files => files.filter((_, i) => i !== index));
    } else {
      setUploadedFiles([]);
    }
    setError('');
  };

  return (
    <div className="photo-upload">
      {/* Upload Mode Toggle */}
      <div className="upload-mode-toggle">
        <label className="mode-label">
          <input 
            type="radio" 
            value="single" 
            checked={uploadMode === 'single'}
            onChange={(e) => setUploadMode(e.target.value)}
            disabled={isProcessing}
          />
          Single Photo
        </label>
        <label className="mode-label">
          <input 
            type="radio" 
            value="multiple" 
            checked={uploadMode === 'multiple'}
            onChange={(e) => setUploadMode(e.target.value)}
            disabled={isProcessing}
          />
          Multiple Photos (for validation)
        </label>
      </div>

      <div 
        {...getRootProps()} 
        className={`dropzone ${isDragActive ? 'active' : ''} ${isProcessing ? 'disabled' : ''}`}
      >
        <input {...getInputProps()} />
        
        <div className="upload-content">
          <div className="upload-icon">📸</div>
          
          {uploadedFiles.length === 0 ? (
            <>
              <h3>Upload Family Photo{uploadMode === 'multiple' ? 's' : ''}</h3>
              <p>
                {isDragActive 
                  ? 'Drop the image(s) here...' 
                  : `Drag & drop ${uploadMode === 'multiple' ? 'family photos' : 'a family photo'} here, or click to select`
                }
              </p>
              <p className="upload-hint">
                {uploadMode === 'multiple' 
                  ? 'Upload multiple photos of the same family for better accuracy validation'
                  : 'Best results with clear photos showing all family members\' faces'
                }
              </p>
              
              {/* Demo Image Button */}
              <button 
                onClick={loadDemoImage} 
                className="demo-btn"
                disabled={isProcessing}
                type="button"
              >
                Try with Demo Photo (Obama Family)
              </button>
            </>
          ) : (
            <div className="uploaded-files">
              <h3>✅ Photo{uploadedFiles.length > 1 ? 's' : ''} Uploaded</h3>
              
              {uploadMode === 'single' || uploadedFiles.length === 1 ? (
                <div className="single-file">
                  <p>{uploadedFiles[0].name}</p>
                  <p className="file-size">{formatFileSize(uploadedFiles[0].size)}</p>
                </div>
              ) : (
                <div className="multiple-files">
                  <p>{uploadedFiles.length} photos selected</p>
                  <div className="file-list">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="file-item">
                        <span className="file-name">{file.name}</span>
                        <span className="file-size">{formatFileSize(file.size)}</span>
                        {!isProcessing && (
                          <button 
                            onClick={() => removeFile(index)} 
                            className="remove-file-btn"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {!isProcessing && (
                <button onClick={() => removeFile()} className="remove-btn">
                  Remove All
                </button>
              )}
            </div>
          )}
          
          {isProcessing && (
            <div className="processing">
              <div className="spinner"></div>
              <p>Analyzing faces...</p>
            </div>
          )}
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default PhotoUpload;
