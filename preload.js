// ========================================
// Electron Preload Script
// سكاي آيكون - النظام المحاسبي المتكامل
// ========================================

const { contextBridge, ipcRenderer } = require('electron');

// تعريض APIs آمنة للنافذة
contextBridge.exposeInMainWorld('electronAPI', {
    // معلومات التطبيق
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),
    getAppPath: () => ipcRenderer.invoke('get-app-path'),
    
    // حالة البيئة
    isDev: process.argv.includes('--dev'),
    platform: process.platform,
    
    // معلومات النظام
    versions: {
        node: process.versions.node,
        chrome: process.versions.chrome,
        electron: process.versions.electron
    }
});

console.log('✅ Preload script loaded successfully');
