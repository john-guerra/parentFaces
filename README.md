# 👨‍👩‍👧‍👦 Family Face Match

A web application that uses AI to determine which parent each child resembles most. Upload family photos and get instant analysis showing family resemblance patterns!

**🌐 Live Demo:** [https://john-guerra.github.io/parentFaces/](https://john-guerra.github.io/parentFaces/)

## ✨ Features

### Core Functionality
- **AI-Powered Face Detection** - Automatically detects faces in family photos
- **Family Resemblance Analysis** - Compares children's faces with parents using advanced algorithms
- **Visual Results** - Clear, easy-to-understand results with similarity percentages
- **Privacy-First** - All processing happens in your browser, photos never leave your device

### New Features (Latest Update)
- **📸 Multiple Photo Support** - Upload multiple family photos for validation and improved accuracy
- **🧪 Built-in Testing** - Comprehensive unit test suite to validate face comparison accuracy
- **👥 Demo Image** - Try the app instantly with the Obama family portrait
- **📊 Validation Results** - Multi-photo consistency checking with confidence metrics
- **🎯 Enhanced Accuracy** - Improved similarity calculation with proper cosine similarity mapping
- **🔧 Threshold Control** - Adjustable face detection sensitivity (10-90%)

## 🛠️ Technology Stack

- **Frontend:** React 18 with ES6+ (no TypeScript)
- **Build Tool:** Vite
- **AI/ML Libraries:**
  - `face-api.js` - Face detection and feature extraction
  - `@xenova/transformers` - Advanced face embeddings (planned)
- **Deployment:** GitHub Pages
- **Styling:** Modern CSS with responsive design

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/john-guerra/parentFaces.git
   cd parentFaces
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173/parentFaces/`

### Building for Production
```bash
npm run build
```

### Running Tests
```bash
# Run unit tests for face comparison algorithms
node test-face-comparison.js

# Or open the browser-based test runner
npm run dev
# Then navigate to http://localhost:5173/parentFaces/test-runner.html
```

## 📋 How to Use

### Single Photo Analysis
1. **Upload a family photo** with at least 2 people (parents and children)
2. **Label the faces** by identifying who is a parent vs child
3. **View results** showing which parent each child resembles most

### Multiple Photo Validation (New!)
1. **Switch to "Multiple Photos" mode** using the toggle
2. **Upload 2-5 family photos** with the same people
3. **Label faces** in the primary photo
4. **View validation results** showing consistency across photos

### Try the Demo
Click **"Try with Demo Photo (Obama Family)"** to instantly see the app in action with a pre-loaded family portrait.

## 🧠 How It Works

### Face Detection Pipeline
1. **Image Processing** - Upload and load family photos
2. **Face Detection** - Locate faces using face-api.js neural networks
3. **Feature Extraction** - Convert faces to 128-dimensional descriptors
4. **Similarity Analysis** - Calculate cosine similarity between face vectors
5. **Result Ranking** - Identify the most similar parent for each child

### Similarity Algorithm
```javascript
// Cosine similarity in 128-dimensional space
similarity = (A·B) / (||A|| × ||B||)

// Where:
// A·B = dot product of face vectors
// ||A|| = magnitude of vector A
// Result ranges from -1 to 1, mapped to 0-100% similarity
```

### Accuracy Metrics
- **Identical faces:** 95-100% similarity
- **Family members:** 35-75% similarity  
- **Unrelated individuals:** 0-35% similarity

## 🧪 Testing & Validation

### Unit Test Coverage
- ✅ Cosine similarity mathematical correctness
- ✅ Face descriptor comparison accuracy
- ✅ Similarity range validation [0, 1]
- ✅ Edge case handling (zero vectors, negative similarity)
- ✅ Performance benchmarks (<10ms per comparison)
- ✅ Multi-photo consistency validation

### Test Files
- `test-face-comparison.js` - Node.js test runner
- `test-runner.html` - Browser-based test interface
- `src/tests/faceComparison.test.js` - Test suite module

## 📊 File Structure

```
parentFaces/
├── public/
│   ├── demo/
│   │   └── obama-family.jpg          # Demo image
│   └── models/                       # face-api.js AI models
├── src/
│   ├── components/
│   │   ├── PhotoUpload.jsx           # Multi-photo upload interface
│   │   ├── FaceLabeling.jsx          # Face identification UI
│   │   ├── ResemblanceResults.jsx    # Results display
│   │   ├── ValidationResults.jsx     # Multi-photo validation (NEW)
│   │   ├── SimilarityChart.jsx       # Visual similarity charts
│   │   └── VisualExplanation.jsx     # Process explanation
│   ├── services/
│   │   ├── faceDetection.js          # Face detection logic
│   │   └── faceComparison.js         # Similarity algorithms
│   ├── tests/                        # Unit test suite (NEW)
│   └── utils/
│       └── helpers.js                # Utility functions
├── test-face-comparison.js           # Node.js test runner (NEW)
└── test-runner.html                  # Browser test interface (NEW)
```

## 🎯 Configuration

### Face Detection Sensitivity
Adjust the detection threshold (10-90%) using the slider in the face labeling interface:
- **High sensitivity (10-30%)** - Detects more faces, may include false positives
- **Medium sensitivity (40-60%)** - Balanced detection (recommended)
- **Low sensitivity (70-90%)** - Only detects very clear faces

### Similarity Thresholds
- **High confidence:** >70% similarity
- **Medium confidence:** 40-70% similarity  
- **Low confidence:** <40% similarity

## ⚡ Performance

### Optimized Loading
- **Fast Initial Load** - Only 282 kB initial bundle (69% smaller than before)
- **Lazy Loading** - Face detection libraries load on demand
- **Smart Caching** - Vendor libraries cached separately for better performance
- **Mobile Optimized** - Efficient loading on mobile networks

### Bundle Analysis
- Main app: 206 kB (64 kB gzipped)
- Face-API (lazy): 637 kB (155 kB gzipped)
- React vendor: 11 kB (4 kB gzipped)
- Other vendor: 60 kB (17 kB gzipped)

## 🔧 Development

### Adding New Features
1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and add tests
3. Run test suite: `node test-face-comparison.js`
4. Commit and push: `git push origin feature/your-feature`
5. Create pull request

### Code Style Guidelines
- Use ES6+ features (arrow functions, destructuring, async/await)
- Prefer functional components with hooks
- Keep components small and focused
- Use descriptive variable names for ML operations
- Add unit tests for new algorithms

## 🚀 Deployment

### GitHub Pages (Automatic)
```bash
npm run deploy
```

### Manual Deployment
```bash
npm run build
# Upload dist/ folder to your hosting provider
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📋 Documentation

- **[Product Requirements Document (PRD)](PRD.md)** - Comprehensive technical and functional requirements
- **[Development Guidelines](DEVELOPMENT_GUIDELINES.md)** - Best practices for coding and contributing
- **[Changelog](CHANGELOG.md)** - Version history and updates
- **[Fixes Completed](FIXES_COMPLETED.md)** - Technical fixes and improvements

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **face-api.js** - For powerful client-side face detection
- **@xenova/transformers** - For advanced ML capabilities
- **React community** - For excellent documentation and ecosystem
- **The Obama family** - For providing an excellent demo photo

## 🐛 Issues & Support

Found a bug or have a feature request? Please [open an issue](https://github.com/john-guerra/parentFaces/issues) on GitHub.

For questions or support, feel free to reach out!

---

**Built with ❤️ using React, face-api.js, and modern web technologies**

*All processing happens in your browser - your photos never leave your device!*
