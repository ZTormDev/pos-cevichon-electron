const { contextBridge, ipcRenderer } = require("electron");
const os = require("os");

contextBridge.exposeInMainWorld("electron", {
  homeDir: () => os.homedir(),
  osVersion: () => os.arch(),
});

contextBridge.exposeInMainWorld("ipcRenderer", {
  send: (channel: string, data: any) => ipcRenderer.send(channel, data),
  on: (channel: string, func: Function) =>
    ipcRenderer.on(channel, (event: any, ...arg: any) => func(event, ...arg)),
  invoke: (channel: string, data?: any) => ipcRenderer.invoke(channel, data),
  // Add new method for printing
  print: (printerName: string, data: any) =>
    ipcRenderer.invoke("print-receipt", { printerName, data }),
});
