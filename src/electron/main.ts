import { app, BrowserWindow } from "electron";
import path from "path";
import { exec } from "child_process";

app.on("ready", () => {
  const mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.setMenuBarVisibility(false);
  mainWindow.center();
  mainWindow.maximize();
  mainWindow.setBackgroundColor("rgb(68, 180, 255)");

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5123');
  } else {
    mainWindow.loadFile(path.join(app.getAppPath(), "/dist-react/index.html"));
  }

  // Execute the .cmd file
  const cmdPath = path.join(app.getAppPath(), 'printer-manager', 'escpos-printer.cmd');
  exec(cmdPath, (error, stdout, stderr) => {
    
    if (error) {
      console.error(`Error executing script: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
  });
});