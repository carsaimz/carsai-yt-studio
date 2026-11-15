const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("carsaiDesktop", {
  platform: process.platform,
  isDesktop: true,
  version: process.versions.electron,
  /**
   * Google OAuth loopback capture: opens the consent URL in the system
   * browser and resolves with the authorization code captured on
   * http://localhost:<port>/. Rejects on timeout/cancel.
   */
  oauthLoopback: (consentUrl, port, timeoutMs) =>
    ipcRenderer.invoke("carsai:oauth-loopback", consentUrl, port, timeoutMs),
});
