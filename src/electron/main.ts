import { app, BrowserWindow } from "electron";
import path from "path";

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
});