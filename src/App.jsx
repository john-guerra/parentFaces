import { useState, useEffect } from 'react';
import PhotoUpload from './components/PhotoUpload';
import FaceLabeling from './components/FaceLabeling';
import ResemblanceResults from './components/ResemblanceResults';
import { loadModels, detectFaces } from './services/faceDetection';
import { analyzeFamilyResemblance, initializeEmbeddingModel } from './services/faceComparison';
import { loadImageFromFile } from './utils/helpers';
import './App.css'

const AppStage = {
  UPLOAD: 'upload',
  LABELING: 'labeling',
  RESULTS: 'results'
};

function App() {
  const [currentStage, setCurrentStage] = useState(AppStage.UPLOAD);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [detectedFaces, setDetectedFaces] = useState([]);
  const [resemblanceResults, setResemblanceResults] = useState(null);
  const [error, setError] = useState('');
  const [modelsReady, setModelsReady] = useState(false);

  // Initialize ML models on app start
  useEffect(() => {
    const initializeModels = async () => {
      try {
        console.log('Initializing AI models...');
        await Promise.all([
          loadModels(),
          initializeEmbeddingModel()
        ]);
        setModelsReady(true);
        console.log('AI models ready!');
      } catch (error) {
        console.error('Failed to initialize models:', error);
        setError('Failed to load AI models. Please refresh the page.');
      }
    };

    initializeModels();
  }, []);

  const handleImageUpload = async (file) => {
    setIsProcessing(true);
    setError('');
    
    try {
      // Load image
      console.log('Loading image...');
      const image = await loadImageFromFile(file);
      setUploadedImage(image);
      
      // Detect faces
      console.log('Detecting faces...');
      const faces = await detectFaces(image);
      
      if (faces.length === 0) {
        setError('No faces detected in the image. Please try a different photo with clear faces.');
        setIsProcessing(false);
        return;
      }
      
      if (faces.length < 2) {
        setError('Please upload a photo with at least 2 people (parents and children).');
        setIsProcessing(false);
        return;
      }
      
      console.log(`Detected ${faces.length} faces`);
      setDetectedFaces(faces);
      setCurrentStage(AppStage.LABELING);
      
    } catch (error) {
      console.error('Error processing image:', error);
      setError('Error processing image: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLabelsComplete = async (groupedFaces) => {
    setIsProcessing(true);
    setError('');
    
    try {
      console.log('Analyzing family resemblance...');
      
      // Analyze resemblance
      const results = await analyzeFamilyResemblance(
        groupedFaces.parents,
        groupedFaces.children,
        uploadedImage
      );
      
      setResemblanceResults(results);
      setCurrentStage(AppStage.RESULTS);
      
    } catch (error) {
      console.error('Error analyzing resemblance:', error);
      setError('Error analyzing resemblance: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setCurrentStage(AppStage.UPLOAD);
    setUploadedImage(null);
    setDetectedFaces([]);
    setResemblanceResults(null);
    setError('');
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>👨‍👩‍👧‍👦 Family Face Match</h1>
        <p>Discover which parent your children resemble most using AI-powered face analysis</p>
      </header>

      <main className="app-main">
        {!modelsReady && (
          <div className="loading-models">
            <div className="spinner"></div>
            <p>Loading AI models... This may take a moment on first visit.</p>
          </div>
        )}

        {modelsReady && (
          <>
            {/* Progress indicator */}
            <div className="progress-indicator">
              <div className={`step ${currentStage === AppStage.UPLOAD ? 'active' : currentStage !== AppStage.UPLOAD ? 'completed' : ''}`}>
                <span className="step-number">1</span>
                <span className="step-label">Upload Photo</span>
              </div>
              <div className={`step ${currentStage === AppStage.LABELING ? 'active' : currentStage === AppStage.RESULTS ? 'completed' : ''}`}>
                <span className="step-number">2</span>
                <span className="step-label">Label Faces</span>
              </div>
              <div className={`step ${currentStage === AppStage.RESULTS ? 'active' : ''}`}>
                <span className="step-number">3</span>
                <span className="step-label">View Results</span>
              </div>
            </div>

            {/* Error display */}
            {error && (
              <div className="error-banner">
                <strong>Error:</strong> {error}
                <button onClick={() => setError('')} className="error-close">×</button>
              </div>
            )}

            {/* Main content based on current stage */}
            {currentStage === AppStage.UPLOAD && (
              <PhotoUpload 
                onImageUpload={handleImageUpload}
                isProcessing={isProcessing}
              />
            )}

            {currentStage === AppStage.LABELING && (
              <FaceLabeling 
                image={uploadedImage}
                detectedFaces={detectedFaces}
                onLabelsComplete={handleLabelsComplete}
              />
            )}

            {currentStage === AppStage.RESULTS && (
              <ResemblanceResults 
                results={resemblanceResults}
                image={uploadedImage}
                onReset={handleReset}
              />
            )}
          </>
        )}
      </main>

      <footer className="app-footer">
        <p>
          Built with ❤️ using React, face-api.js, and Transformers.js • 
          All processing happens in your browser - your photos never leave your device
        </p>
      </footer>
    </div>
  );
}

export default App
