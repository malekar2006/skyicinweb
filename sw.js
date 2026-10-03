// ========================================
// Service Worker - سكاي آيكون
// إصدار محسّن للعمل بدون إنترنت
// ========================================

const CACHE_VERSION = 'sky-icon-v3.6.0';
const CACHE_NAME = `sky-icon-cache-${CACHE_VERSION}`;

// الملفات الأساسية للتخزين المؤقت
const CORE_FILES = [
    '/',
    '/index.html',
    '/css/style.css',
    '/css/modules.css',
    '/js/app.js',
    '/js/dashboard.js',
    '/js/accounts.js',
    '/js/journal.js',
    '/js/invoices.js',
    '/js/vouchers.js',
    '/js/bookings.js',
    '/js/customers.js',
    '/js/suppliers.js',
    '/js/reports.js',
    '/js/settings.js',
    '/js/print.js',
    '/js/notifications.js',
    '/js/profile.js',
    '/js/users.js',
    '/js/auth.js',
    '/js/activity-log.js',
    '/js/currencies.js',
    '/js/accounts-currency.js',
    '/js/currency.js',
    '/js/currency-manager.js',
    '/js/multi-currency-reports.js',
    '/js/sent-passports.js',
    '/js/advanced-search.js',
    '/js/follow-up.js',
    '/images/logo.png'
];

// الملفات الخارجية (CDN)
const EXTERNAL_FILES = [
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;900&display=swap'
];

// تثبيت Service Worker
self.addEventListener('install', (event) => {
    console.log('[SW] تثبيت Service Worker...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] فتح التخزين المؤقت');
                
                // تخزين الملفات الأساسية
                cache.addAll(CORE_FILES).catch(err => {
                    console.error('[SW] خطأ في تخزين الملفات الأساسية:', err);
                });
                
                // تخزين الملفات الخارجية
                cache.addAll(EXTERNAL_FILES).catch(err => {
                    console.error('[SW] خطأ في تخزين الملفات الخارجية:', err);
                });
                
                return cache;
            })
            .then(() => {
                console.log('[SW] تم التثبيت بنجاح');
                return self.skipWaiting();
            })
    );
});

// تفعيل Service Worker
self.addEventListener('activate', (event) => {
    console.log('[SW] تفعيل Service Worker...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        // حذف التخزينات المؤقتة القديمة
                        if (cacheName !== CACHE_NAME) {
                            console.log('[SW] حذف التخزين المؤقت القديم:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('[SW] تم التفعيل بنجاح');
                return self.clients.claim();
            })
    );
});

// اعتراض الطلبات
self.addEventListener('fetch', (event) => {
    // تجاهل الطلبات غير HTTP/HTTPS
    if (!event.request.url.startsWith('http')) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                // إرجاع الملف من التخزين المؤقت إذا وجد
                if (cachedResponse) {
                    // محاولة تحديث النسخة في الخلفية
                    fetch(event.request)
                        .then((response) => {
                            if (response && response.status === 200) {
                                caches.open(CACHE_NAME).then((cache) => {
                                    cache.put(event.request, response);
                                });
                            }
                        })
                        .catch(() => {
                            // تجاهل الأخطاء (نحن غير متصلين)
                        });
                    
                    return cachedResponse;
                }
                
                // جلب الملف من الإنترنت وتخزينه
                return fetch(event.request)
                    .then((response) => {
                        // التحقق من صحة الاستجابة
                        if (!response || response.status !== 200 || response.type === 'error') {
                            return response;
                        }
                        
                        // نسخ الاستجابة
                        const responseToCache = response.clone();
                        
                        // تخزين الملف
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    })
                    .catch((error) => {
                        console.error('[SW] خطأ في جلب الملف:', event.request.url, error);
                        
                        // إرجاع صفحة offline إذا كانت متوفرة
                        if (event.request.mode === 'navigate') {
                            return caches.match('/index.html');
                        }
                        
                        throw error;
                    });
            })
    );
});

// الاستماع للرسائل
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        caches.delete(CACHE_NAME).then(() => {
            console.log('[SW] تم مسح التخزين المؤقت');
        });
    }
});

// مزامنة الخلفية
self.addEventListener('sync', (event) => {
    console.log('[SW] مزامنة الخلفية:', event.tag);
    
    if (event.tag === 'sync-data') {
        event.waitUntil(
            syncData()
        );
    }
});

// دالة مزامنة البيانات
async function syncData() {
    console.log('[SW] بدء مزامنة البيانات...');
    
    try {
        // هنا يمكن إضافة منطق مزامنة البيانات مع الخادم
        // مثلاً: رفع البيانات المحفوظة محلياً
        
        // في الوقت الحالي، النظام يعمل محلياً بالكامل
        console.log('[SW] المزامنة غير مطلوبة - النظام محلي');
        
        return Promise.resolve();
    } catch (error) {
        console.error('[SW] خطأ في مزامنة البيانات:', error);
        return Promise.reject(error);
    }
}

// إشعارات Push (اختياري للمستقبل)
self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : 'إشعار جديد من سكاي آيكون',
        icon: '/images/logo.png',
        badge: '/images/logo.png',
        vibrate: [200, 100, 200],
        dir: 'rtl',
        lang: 'ar'
    };
    
    event.waitUntil(
        self.registration.showNotification('سكاي آيكون', options)
    );
});

// النقر على الإشعار
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow('/')
    );
});

console.log('[SW] Service Worker تم تحميله بنجاح - الإصدار:', CACHE_VERSION);
