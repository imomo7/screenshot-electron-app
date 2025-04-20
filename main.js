const { app, BrowserWindow, ipcMain, screen, desktopCapturer, nativeImage, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const ffmpeg = require('ffmpeg-static');
const { spawn } = require('child_process');

let mainWindow;
let recording = false;
let ffmpegProcess = null;
let intervalScreenshotTimer = null;
let screenshotFolder = app.getPath('pictures');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile('index.html');
  mainWindow.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Helper function to format date and time
function getFormattedDateTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
}

// Function to take a screenshot
async function takeScreenshot() {
  try {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.size;
    
    // Get screen sources with high quality settings
    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: {
        width: width * 2,  // Double the resolution for better quality
        height: height * 2
      }
    });
    
    const primarySource = sources[0];
    const formattedDateTime = getFormattedDateTime();
    const screenshotPath = path.join(screenshotFolder, `screenshot_${formattedDateTime}.png`);
    
    // Convert to native image and resize to original dimensions
    const image = nativeImage.createFromBuffer(primarySource.thumbnail.toPNG());
    const resizedImage = image.resize({
      width: width,
      height: height,
      quality: 'best'
    });
    
    // Save the image with high quality
    fs.writeFileSync(screenshotPath, resizedImage.toPNG());
    
    return { success: true, path: screenshotPath };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Screenshot folder handlers
ipcMain.on('get-screenshot-folder', (event) => {
  event.reply('screenshot-folder-updated', screenshotFolder);
});

ipcMain.on('select-screenshot-folder', async (event) => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
      title: 'Select Screenshot Folder'
    });

    if (!result.canceled && result.filePaths.length > 0) {
      screenshotFolder = result.filePaths[0];
      event.reply('screenshot-folder-updated', screenshotFolder);
    }
  } catch (error) {
    console.error('Error selecting folder:', error);
  }
});

// Screenshot handler
ipcMain.on('take-screenshot', async (event) => {
  const result = await takeScreenshot();
  event.reply('screenshot-complete', result);
});

// Interval screenshot handlers
ipcMain.on('start-interval-screenshots', async (event) => {
  if (!intervalScreenshotTimer) {
    // Take first screenshot immediately
    const result = await takeScreenshot();
    event.reply('interval-screenshot', result);
    
    // Set up interval for subsequent screenshots
    intervalScreenshotTimer = setInterval(async () => {
      const result = await takeScreenshot();
      event.reply('interval-screenshot', result);
    }, 10000); // 10 seconds interval
  }
});

ipcMain.on('stop-interval-screenshots', (event) => {
  if (intervalScreenshotTimer) {
    clearInterval(intervalScreenshotTimer);
    intervalScreenshotTimer = null;
    event.reply('interval-screenshot', { 
      success: true, 
      message: 'Interval screenshots stopped',
      path: screenshotFolder
    });
  }
});

// Screen recording handlers
ipcMain.on('start-recording', async (event) => {
  if (!recording) {
    try {
      const formattedDateTime = getFormattedDateTime();
      const outputPath = path.join(app.getPath('videos'), `recording_${formattedDateTime}.mp4`);
      
      // Get screen dimensions
      const displays = screen.getAllDisplays();
      const primaryDisplay = screen.getPrimaryDisplay();
      const { width, height } = primaryDisplay.size;
      
      // Start FFmpeg process for screen recording
      ffmpegProcess = spawn(ffmpeg, [
        '-f', 'gdigrab',
        '-framerate', '30',
        '-i', 'desktop',
        '-s', `${width}x${height}`,
        '-c:v', 'libx264',
        '-preset', 'ultrafast',
        '-pix_fmt', 'yuv420p',
        outputPath
      ]);

      recording = true;
      event.reply('recording-started', { success: true, path: outputPath });
    } catch (error) {
      event.reply('recording-started', { success: false, error: error.message });
    }
  }
});

ipcMain.on('stop-recording', async (event) => {
  if (recording && ffmpegProcess) {
    try {
      // Send 'q' to FFmpeg to stop recording
      ffmpegProcess.stdin.write('q');
      ffmpegProcess.stdin.end();
      
      // Wait for FFmpeg to finish
      await new Promise((resolve) => {
        ffmpegProcess.on('close', () => {
          resolve();
        });
      });
      
      recording = false;
      ffmpegProcess = null;
      event.reply('recording-stopped', { success: true });
    } catch (error) {
      event.reply('recording-stopped', { success: false, error: error.message });
    }
  }
}); 