# Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a family face comparison web application that helps parents determine which child looks more like which parent.

## Key Technologies
- **React** with ES6 (no TypeScript)
- **Vite** for build tooling
- **face-api.js** for face detection
- **@xenova/transformers** for face embeddings and similarity comparison
- **Client-side only** - no backend or cloud services

## Code Style Guidelines
- Use ES6+ features (arrow functions, destructuring, async/await)
- Prefer functional components with hooks
- Use modern JavaScript (no TypeScript)
- Keep components small and focused
- Use descriptive variable names for ML operations

## ML Pipeline
1. Upload family photo(s)
2. Detect faces using face-api.js
3. Extract face embeddings using transformers.js
4. Compare embeddings to determine similarity
5. Display results showing which parent each child resembles most

## File Structure
- `/src/components/` - React components
- `/src/services/` - ML services (face detection, embedding extraction)
- `/src/utils/` - Helper functions
- `/public/models/` - ML model files (face-api.js models)
