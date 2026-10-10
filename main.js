const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        backgroundColor: '#1e1e1e',
        icon: path.join(__dirname, 'icon.png'), // Bạn có thể thêm icon sau
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    // Ẩn thanh menu mặc định của trình duyệt Electron cho gọn gàng giống VS Code
    mainWindow.setMenuBarVisibility(false);

    // Load file giao diện chính
    mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});
