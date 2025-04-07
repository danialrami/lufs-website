# LUFS Website

## Features
- Interactive 3D audio visualization using WebGL
- Audio playback and analysis with Web Audio API
- Browser compatibility testing
- Responsive design with support for various devices
- Performance optimization based on device capabilities

## Tech Stack
- HTML/CSS/JavaScript
- WebGL for 3D visualizations
- Web Audio API for audio processing

## Project Structure
- `/js/` - JavaScript source files:
  - `audio-controller.js` - Handles audio playback and analysis
  - `browser-tester.js` - Tests browser capabilities and optimizes accordingly
  - `visualizer.js` - Creates visual effects using WebGL
  - `main.js` - Entry point for the application

## Browser Compatibility
The project includes a browser testing module that checks for:
- WebGL support
- Web Audio API support
- ES6 support
- Touch capabilities
- Performance metrics
- Device type detection

## Getting Started
1. Clone the repository
2. Open index.html in your browser, or set up a local server

## Development
The project includes functions for development purposes, such as:
- `generateSampleAudio()` in main.js (for development use only)

## Notes
- Fallback visual and audio options are provided for browsers lacking WebGL or Web Audio API support