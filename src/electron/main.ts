import { app, BrowserWindow, ipcMain } from "electron";
import * as path from "path";
import Recibo from "./receipt";

app.on("ready", () => {
  const mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  mainWindow.setMenuBarVisibility(false);
  mainWindow.center();
  mainWindow.maximize();
  mainWindow.setBackgroundColor("rgb(68, 180, 255)");

  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:5123");
  } else {
    mainWindow.loadFile(path.join(app.getAppPath(), "/dist-react/index.html"));
  }

  ipcMain.handle("get-printers", async () => {
    const printers = await mainWindow.webContents.getPrintersAsync();
    return printers.map((printer) => printer.name);
  });

  ipcMain.handle("print-receipt", async (_, { printerName, data }) => {
    try {
      await Recibo(printerName, data);
      return { success: true };
    } catch (error: any) {
      console.error("Error printing receipt:", error);
      return { success: false, error: error.message };
    }
  });
});
