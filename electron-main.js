// ========================================
// Electron Main Process
// سكاي آيكون - النظام المحاسبي المتكامل
// ========================================

const { app, BrowserWindow, Menu, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');

// متغيرات عامة
let mainWindow;
const isDev = process.argv.includes('--dev');

// إنشاء النافذة الرئيسية
function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1024,
        minHeight: 768,
        title: 'سكاي آيكون - النظام المحاسبي المتكامل',
        icon: path.join(__dirname, 'images', 'logo.png'),
        backgroundColor: '#ffffff',
        show: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, 'preload.js'),
            webSecurity: true,
            allowRunningInsecureContent: false
        },
        autoHideMenuBar: !isDev,
        frame: true,
        titleBarStyle: 'default'
    });

    // تحميل الملف الرئيسي
    mainWindow.loadFile('index.html');

    // فتح DevTools في وضع التطوير فقط
    if (isDev) {
        mainWindow.webContents.openDevTools();
    }

    // إظهار النافذة عند الجاهزية
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        mainWindow.focus();
    });

    // حدث إغلاق النافذة
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // منع التنقل خارج التطبيق
    mainWindow.webContents.on('will-navigate', (event, url) => {
        const appURL = mainWindow.webContents.getURL();
        const appOrigin = new URL(appURL).origin;
        const targetOrigin = new URL(url).origin;
        
        if (targetOrigin !== appOrigin && !url.startsWith('file://')) {
            event.preventDefault();
            shell.openExternal(url);
        }
    });

    // فتح الروابط الخارجية في المتصفح الافتراضي
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });

    createMenu();
}

// إنشاء القائمة
function createMenu() {
    const template = [
        {
            label: 'ملف',
            submenu: [
                {
                    label: 'الصفحة الرئيسية',
                    accelerator: 'CmdOrCtrl+H',
                    click: () => {
                        mainWindow.loadFile('index.html');
                    }
                },
                { type: 'separator' },
                {
                    label: 'نسخ احتياطي',
                    accelerator: 'CmdOrCtrl+B',
                    click: backupData
                },
                {
                    label: 'استعادة نسخة احتياطية',
                    click: restoreData
                },
                { type: 'separator' },
                {
                    label: 'إعادة تحميل',
                    accelerator: 'CmdOrCtrl+R',
                    click: () => {
                        mainWindow.reload();
                    }
                },
                { type: 'separator' },
                {
                    label: 'خروج',
                    accelerator: 'CmdOrCtrl+Q',
                    click: () => {
                        app.quit();
                    }
                }
            ]
        },
        {
            label: 'عرض',
            submenu: [
                {
                    label: 'تكبير',
                    accelerator: 'CmdOrCtrl+Plus',
                    role: 'zoomIn'
                },
                {
                    label: 'تصغير',
                    accelerator: 'CmdOrCtrl+-',
                    role: 'zoomOut'
                },
                {
                    label: 'حجم افتراضي',
                    accelerator: 'CmdOrCtrl+0',
                    role: 'resetZoom'
                },
                { type: 'separator' },
                {
                    label: 'ملء الشاشة',
                    accelerator: 'F11',
                    role: 'togglefullscreen'
                }
            ]
        },
        {
            label: 'نافذة',
            submenu: [
                {
                    label: 'تصغير',
                    accelerator: 'CmdOrCtrl+M',
                    role: 'minimize'
                },
                {
                    label: 'تكبير',
                    role: 'zoom'
                },
                { type: 'separator' },
                {
                    label: 'إغلاق',
                    accelerator: 'CmdOrCtrl+W',
                    role: 'close'
                }
            ]
        },
        {
            label: 'مساعدة',
            submenu: [
                {
                    label: 'حول النظام',
                    click: showAbout
                },
                {
                    label: 'دليل الاستخدام',
                    click: () => {
                        shell.openExternal('https://skyicon.com/help');
                    }
                },
                { type: 'separator' },
                {
                    label: 'الدعم الفني',
                    click: () => {
                        shell.openExternal('tel:+967777180875');
                    }
                },
                {
                    label: 'واتساب',
                    click: () => {
                        shell.openExternal('https://wa.me/967775222520');
                    }
                }
            ]
        }
    ];

    // إضافة قائمة المطورين في وضع التطوير
    if (isDev) {
        template.push({
            label: 'مطور',
            submenu: [
                {
                    label: 'أدوات المطور',
                    accelerator: 'CmdOrCtrl+Shift+I',
                    click: () => {
                        mainWindow.webContents.toggleDevTools();
                    }
                },
                {
                    label: 'مسح التخزين المؤقت',
                    click: () => {
                        mainWindow.webContents.session.clearCache();
                        mainWindow.webContents.session.clearStorageData();
                        mainWindow.reload();
                    }
                }
            ]
        });
    }

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

// نسخ احتياطي
async function backupData() {
    try {
        const { filePath } = await dialog.showSaveDialog(mainWindow, {
            title: 'نسخ احتياطي للبيانات',
            defaultPath: `sky-icon-backup-${new Date().toISOString().slice(0, 10)}.json`,
            filters: [
                { name: 'JSON Files', extensions: ['json'] },
                { name: 'All Files', extensions: ['*'] }
            ]
        });

        if (filePath) {
            // الحصول على البيانات من localStorage
            const data = await mainWindow.webContents.executeJavaScript(`
                JSON.stringify(localStorage);
            `);

            fs.writeFileSync(filePath, data, 'utf8');
            
            dialog.showMessageBox(mainWindow, {
                type: 'info',
                title: 'نجح النسخ الاحتياطي',
                message: 'تم حفظ النسخة الاحتياطية بنجاح',
                buttons: ['حسناً']
            });
        }
    } catch (error) {
        dialog.showErrorBox('خطأ', 'فشل إنشاء النسخة الاحتياطية: ' + error.message);
    }
}

// استعادة نسخة احتياطية
async function restoreData() {
    try {
        const { filePaths } = await dialog.showOpenDialog(mainWindow, {
            title: 'استعادة نسخة احتياطية',
            filters: [
                { name: 'JSON Files', extensions: ['json'] },
                { name: 'All Files', extensions: ['*'] }
            ],
            properties: ['openFile']
        });

        if (filePaths && filePaths.length > 0) {
            const data = fs.readFileSync(filePaths[0], 'utf8');
            const parsedData = JSON.parse(data);

            // استعادة البيانات إلى localStorage
            await mainWindow.webContents.executeJavaScript(`
                const data = ${JSON.stringify(parsedData)};
                Object.keys(data).forEach(key => {
                    localStorage.setItem(key, data[key]);
                });
            `);

            dialog.showMessageBox(mainWindow, {
                type: 'info',
                title: 'نجحت الاستعادة',
                message: 'تم استعادة البيانات بنجاح. سيتم إعادة تحميل النظام.',
                buttons: ['حسناً']
            }).then(() => {
                mainWindow.reload();
            });
        }
    } catch (error) {
        dialog.showErrorBox('خطأ', 'فشلت استعادة البيانات: ' + error.message);
    }
}

// حول النظام
function showAbout() {
    dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: 'حول النظام',
        message: 'سكاي آيكون - النظام المحاسبي المتكامل',
        detail: `الإصدار: 3.6.0
نظام محاسبي متكامل لإدارة وكالات السفر والسياحة وخدمات الحج والعمرة

سكاي آيكون للسفريات والسياحة
صنعاء - ذهبان - مقابل كه

الهواتف:
783003636
783003838
783003939
0101127338

© 2024 جميع الحقوق محفوظة`,
        buttons: ['حسناً'],
        noLink: true
    });
}

// عند جاهزية التطبيق
app.whenReady().then(() => {
    createMainWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createMainWindow();
        }
    });
});

// عند إغلاق جميع النوافذ
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// معالجة IPC
ipcMain.handle('get-app-version', () => {
    return app.getVersion();
});

ipcMain.handle('get-app-path', () => {
    return app.getAppPath();
});

console.log('✅ Electron Main Process started');
console.log('📦 App Version:', app.getVersion());
console.log('🏠 App Path:', app.getAppPath());
console.log('💾 User Data:', app.getPath('userData'));
