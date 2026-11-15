const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("carsaiDesktop", {
  platform: process.platform,
  isDesktop: true,
  version: process.versions.electron,
});
