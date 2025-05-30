# 👨‍👩‍👧‍👦 Family Face Match

A web application that uses AI to analyze family photos and determine which parent each child resembles most. Built with React and powered by advanced machine learning models that run entirely in your browser.

## ✨ Features

- **Face Detection**: Automatically detects faces in uploaded family photos
- **Family Member Labeling**: Easy interface to identify parents and children
- **AI-Powered Comparison**: Uses face-api.js descriptors to calculate facial similarity
- **Detailed Results**: Shows similarity scores and confidence levels
- **Privacy First**: All processing happens locally in your browser - photos never leave your device
- **Responsive Design**: Works on desktop and mobile devices

## 🚀 Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd parentFaces
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 🛠️ Technologies Used

- **React** - UI framework with ES6 (no TypeScript)
- **Vite** - Fast build tool and development server
- **face-api.js** - Face detection and recognition
- **@xenova/transformers** - Machine learning models
- **react-dropzone** - File upload interface

## 📖 How It Works

1. **Upload**: Drop a family photo containing parents and children
2. **Detection**: AI automatically detects all faces in the image
3. **Labeling**: Identify which faces belong to parents vs children
4. **Analysis**: Advanced algorithms compare facial features between family members
5. **Results**: See which parent each child resembles most, with confidence scores

## 🔧 Development

### Project Structure

```
src/
├── components/          # React components
│   ├── PhotoUpload.jsx  # File upload interface
│   ├── FaceLabeling.jsx # Face identification interface
│   └── ResemblanceResults.jsx # Results display
├── services/           # ML services
│   ├── faceDetection.js # Face detection using face-api.js
│   └── faceComparison.js # Face similarity analysis
├── utils/             # Helper functions
│   └── helpers.js     # Utility functions
└── App.jsx           # Main application component
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎯 Machine Learning Pipeline

1. **Face Detection**: Uses TinyFaceDetector for fast face detection
2. **Landmark Detection**: Extracts 68 facial landmarks for each face
3. **Feature Extraction**: Generates 128-dimensional face descriptors
4. **Similarity Calculation**: Uses Euclidean distance to compare faces
5. **Confidence Scoring**: Converts distance to similarity percentage

## 📱 Usage Tips

- **Photo Quality**: Use clear, well-lit photos with visible faces
- **Family Size**: Works best with 2-6 people in the photo
- **Face Size**: Faces should be at least 40x40 pixels for accurate detection
- **Angles**: Front-facing photos work better than profile shots

## 🔒 Privacy & Security

- **Local Processing**: All AI computations happen in your browser
- **No Data Collection**: Photos are never uploaded to any server
- **No Storage**: Images are only held in memory during analysis
- **Open Source**: Full transparency in how your data is processed

## 🐛 Troubleshooting

**No faces detected:**
- Ensure faces are clearly visible and well-lit
- Try a different photo with larger faces
- Check that faces are front-facing

**Poor similarity results:**
- Use photos where all family members are clearly visible
- Ensure good lighting and image quality
- Avoid photos with sunglasses or face coverings

## 🚧 Future Enhancements

- Support for multiple photos per person
- Age progression analysis
- Extended family comparison (grandparents, siblings)
- Facial feature breakdown (eyes, nose, mouth similarities)
- Export results as shareable images

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## ⚠️ Disclaimer

This application is for entertainment purposes only. Actual genetic resemblance involves many factors not captured in facial photos. Results should not be used for any legal, medical, or official purposes.+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
