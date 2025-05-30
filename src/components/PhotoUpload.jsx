import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { isValidImageFile, formatFileSize } from '../utils/helpers';
import './PhotoUpload.css';

const PhotoUpload = ({ onImageUpload, isProcessing }) => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [error, setError] = useState('');

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

    // For now, we'll only handle one file at a time
    const file = validFiles[0];
    
    try {
      setUploadedFiles([file]);
      await onImageUpload(file);
    } catch (err) {
      setError('Error processing image: ' + err.message);
    }
  }, [onImageUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: false,
    disabled: isProcessing
  });

  const removeFile = () => {
    setUploadedFiles([]);
    setError('');
  };

  return (
    <div className="photo-upload">
      <div 
        {...getRootProps()} 
        className={`dropzone ${isDragActive ? 'active' : ''} ${isProcessing ? 'disabled' : ''}`}
      >
        <input {...getInputProps()} />
        
        <div className="upload-content">
          <div className="upload-icon">📸</div>
          
          {uploadedFiles.length === 0 ? (
            <>
              <h3>Upload Family Photo</h3>
              <p>
                {isDragActive 
                  ? 'Drop the image here...' 
                  : 'Drag & drop a family photo here, or click to select'
                }
              </p>
              <p className="upload-hint">
                Best results with clear photos showing all family members' faces
              </p>
            </>
          ) : (
            <div className="uploaded-file">
              <h3>✅ Photo Uploaded</h3>
              <p>{uploadedFiles[0].name}</p>
              <p className="file-size">{formatFileSize(uploadedFiles[0].size)}</p>
              {!isProcessing && (
                <button onClick={removeFile} className="remove-btn">
                  Remove
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
