/**
 * Electron Preload Script
 * يوفر واجهة آمنة بين Renderer Process و Main Process
 */

const { contextBridge, ipcRenderer } = require('electron');

// تعريض API آمن للـ Renderer Process
contextBridge.exposeInMainWorld('electronAPI', {
    // النسخ الاحتياطي
    saveBackup: (data) => ipcRenderer.invoke('save-backup', data),
    loadBackup: () => ipcRenderer.invoke('load-backup'),
    
    // الإصدار
    getVersion: () => '3.5.0',
    
    // معلومات النظام
    platform: process.platform,
    
    // الطباعة
    print: () => window.print()
});

// استقبال الأحداث من Main Process
ipcRenderer.on('backup-data', () => {
    window.dispatchEvent(new Event('electron-backup'));
});

ipcRenderer.on('restore-data', () => {
    window.dispatchEvent(new Event('electron-restore'));
});

console.log('✅ Electron Preload Script loaded');
