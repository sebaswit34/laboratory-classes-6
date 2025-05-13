const { app, BrowserWindow } = require('electron');
const { spawn } = require('child_process');
const http = require('http');

let mainWindow;
let serverProcess;

function createWindow() {
    console.log(">> Tworzenie okna Electron...");
    mainWindow = new BrowserWindow({
        width: 1024,
        height: 768,
        webPreferences: {
            contextIsolation: true
        }
    });

    mainWindow.loadURL('http://localhost:3000');
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

function waitForServer(url, callback) {
    console.log(">> Oczekiwanie na serwer: " + url);
    const interval = setInterval(() => {
        http.get(url, (res) => {
            if (res.statusCode === 200) {
                clearInterval(interval);
                console.log(">> Serwer gotowy!");
                callback();
            }
        }).on('error', () => {
            process.stdout.write('.');
        });
    }, 500);
}

app.whenReady().then(() => {
    console.log(">> Aplikacja Electron gotowa.");


    console.log(">> Uruchamianie backendu przez 'npm start'...");
    serverProcess = spawn('npm', ['start'], {
        shell: true,
        cwd: __dirname,
        stdio: 'inherit'
    });

    waitForServer('http://localhost:3000', createWindow);
});

app.on('window-all-closed', () => {
    if (serverProcess) {
        serverProcess.kill();
        console.log(">> Backend zakończony.");
    }

    if (process.platform !== 'darwin') {
        app.quit();
    }
});
