const { ipcRenderer } = require('electron');

const screenshotBtn = document.getElementById('screenshotBtn');
const startRecordBtn = document.getElementById('startRecordBtn');
const stopRecordBtn = document.getElementById('stopRecordBtn');
const startIntervalBtn = document.getElementById('startIntervalBtn');
const stopIntervalBtn = document.getElementById('stopIntervalBtn');
const selectFolderBtn = document.getElementById('selectFolderBtn');
const folderPathElement = document.getElementById('folderPath');
const statusDiv = document.getElementById('status');

function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
}

// Request initial folder path
ipcRenderer.send('get-screenshot-folder');

// Handle folder path updates
ipcRenderer.on('screenshot-folder-updated', (event, path) => {
    folderPathElement.textContent = `Screenshot Folder: ${path}`;
});

selectFolderBtn.addEventListener('click', () => {
    ipcRenderer.send('select-screenshot-folder');
});

screenshotBtn.addEventListener('click', () => {
    ipcRenderer.send('take-screenshot');
});

startRecordBtn.addEventListener('click', () => {
    ipcRenderer.send('start-recording');
    startRecordBtn.disabled = true;
    stopRecordBtn.disabled = false;
});

stopRecordBtn.addEventListener('click', () => {
    ipcRenderer.send('stop-recording');
    startRecordBtn.disabled = false;
    stopRecordBtn.disabled = true;
});

startIntervalBtn.addEventListener('click', () => {
    ipcRenderer.send('start-interval-screenshots');
    startIntervalBtn.disabled = true;
    stopIntervalBtn.disabled = false;
});

stopIntervalBtn.addEventListener('click', () => {
    ipcRenderer.send('stop-interval-screenshots');
    startIntervalBtn.disabled = false;
    stopIntervalBtn.disabled = true;
});

ipcRenderer.on('screenshot-complete', (event, data) => {
    if (data.success) {
        showStatus(`Screenshot saved to: ${data.path}`, 'success');
    } else {
        showStatus(`Error: ${data.error}`, 'error');
    }
});

ipcRenderer.on('recording-started', (event, data) => {
    if (data.success) {
        showStatus(`Recording started. Saving to: ${data.path}`, 'recording');
    } else {
        showStatus(`Error: ${data.error}`, 'error');
        startRecordBtn.disabled = false;
        stopRecordBtn.disabled = true;
    }
});

ipcRenderer.on('recording-stopped', (event, data) => {
    if (data.success) {
        showStatus('Recording stopped successfully', 'success');
    } else {
        showStatus(`Error: ${data.error}`, 'error');
    }
});

ipcRenderer.on('interval-screenshot', (event, data) => {
    if (data.success) {
        if (data.message) {
            showStatus(`${data.message}. Screenshots saved to: ${data.path}`, 'interval');
        } else {
            showStatus(`Interval screenshot saved: ${data.path}`, 'interval');
        }
    } else {
        showStatus(`Error: ${data.error}`, 'error');
    }
}); 