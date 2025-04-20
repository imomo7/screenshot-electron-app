# Screen Capture App

A desktop application built with Electron that allows you to take screenshots, record your screen, and take interval screenshots.

## Features

- 📸 Take screenshots with customizable quality settings
- 🎥 Record your screen with FFmpeg
- ⏱️ Take interval screenshots automatically
- 📁 Customize screenshot save location
- 🎨 Modern and intuitive user interface
- 💾 Save screenshots in high quality PNG format
- 🎬 Save recordings in MP4 format

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- FFmpeg (for screen recording)

## Installation

1. Clone the repository:
```bash
git clone [your-repository-url]
cd screenshot-electron-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the application:
```bash
npm start
```

## Project Structure

```
screenshot-electron-app/
├── main.js           # Main process file
├── renderer.js       # Renderer process file
├── index.html        # Main application window
├── index.css         # Styles for the application
└── package.json      # Project configuration and dependencies
```

## Usage

### Taking Screenshots
1. Click the "Take Screenshot" button to capture your screen
2. Screenshots are automatically saved to the selected folder

### Screen Recording
1. Click "Start Recording" to begin recording your screen
2. Click "Stop Recording" when you're done
3. Recordings are saved in MP4 format

### Interval Screenshots
1. Click "Start Interval Screenshots" to begin taking screenshots automatically
2. Screenshots will be taken every 10 seconds
3. Click "Stop Interval Screenshots" to stop the automatic capture

### Changing Screenshot Folder
1. Click "Select Screenshot Folder" to choose where screenshots are saved
2. Select your desired folder in the file dialog

## Development

### Running in Development Mode
```bash
npm run dev
```

### Building the Application
```bash
npm run build
```

## Technologies Used

- Electron
- Node.js
- FFmpeg
- HTML/CSS/JavaScript

## License

[Your License Here]

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request 