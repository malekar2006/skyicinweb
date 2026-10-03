/**
 * نظام الإشعارات - Sky Icon Travel & Tourism
 * Notifications System
 */

// تخزين الإشعارات
let notifications = [];
let unreadCount = 0;

// أنواع الإشعارات
const NotificationType = {
    INFO: 'info',
    SUCCESS: 'success',
    WARNING: 'warning',
    ERROR: 'error',
    BOOKING: 'booking',
    PAYMENT: 'payment',
    INVOICE: 'invoice'
};

// تهيئة نظام الإشعارات
function initNotifications() {
    loadNotifications();
    updateNotificationBadge();
    setupNotificationListeners();
}

// تحميل الإشعارات من localStorage
function loadNotifications() {
    const stored = localStorage.getItem('notifications');
    if (stored) {
        notifications = JSON.parse(stored);
        calculateUnreadCount();
    } else {
        // إشعارات افتراضية للتجربة
        notifications = [
            {
                id: generateId(),
                type: NotificationType.SUCCESS,
                title: 'مرحباً في النظام',
                message: 'تم تسجيل دخولك بنجاح إلى نظام سكاي آيكون',
                timestamp: Date.now(),
                read: false,
                icon: 'check-circle'
            }
        ];
        saveNotifications();
    }
}

// حفظ الإشعارات في localStorage
function saveNotifications() {
    localStorage.setItem('notifications', JSON.stringify(notifications));
    calculateUnreadCount();
    updateNotificationBadge();
}

// حساب عدد الإشعارات غير المقروءة
function calculateUnreadCount() {
    unreadCount = notifications.filter(n => !n.read).length;
}

// تحديث شارة العدد
function updateNotificationBadge() {
    const badge = document.querySelector('.notification-badge');
    if (badge) {
        if (unreadCount > 0) {
            badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }
}

// إضافة إشعار جديد
function addNotification(type, title, message, icon = null) {
    const notification = {
        id: generateId(),
        type: type,
        title: title,
        message: message,
        timestamp: Date.now(),
        read: false,
        icon: icon || getDefaultIcon(type)
    };
    
    notifications.unshift(notification);
    saveNotifications();
    
    // عرض إشعار منبثق
    showToast(type, title, message);
    
    return notification.id;
}

// الحصول على الأيقونة الافتراضية حسب النوع
function getDefaultIcon(type) {
    const icons = {
        [NotificationType.INFO]: 'info-circle',
        [NotificationType.SUCCESS]: 'check-circle',
        [NotificationType.WARNING]: 'exclamation-triangle',
        [NotificationType.ERROR]: 'times-circle',
        [NotificationType.BOOKING]: 'plane',
        [NotificationType.PAYMENT]: 'money-bill-wave',
        [NotificationType.INVOICE]: 'file-invoice'
    };
    return icons[type] || 'bell';
}

// عرض إشعار منبثق (Toast)
function showToast(type, title, message) {
    const toast = document.createElement('div');
    toast.className = `notification-toast notification-${type}`;
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas fa-${getDefaultIcon(type)}"></i>
        </div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.body.appendChild(toast);
    
    // إضافة تأثير الظهور
    setTimeout(() => toast.classList.add('show'), 10);
    
    // إزالة بعد 5 ثوانٍ
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

// إعداد مستمعي الأحداث
function setupNotificationListeners() {
    // فتح قائمة الإشعارات
    const notificationBtn = document.querySelector('.notification-btn');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', toggleNotificationPanel);
    }
    
    // إغلاق عند النقر خارج القائمة
    document.addEventListener('click', (e) => {
        const panel = document.querySelector('.notification-panel');
        const btn = document.querySelector('.notification-btn');
        if (panel && !panel.contains(e.target) && !btn.contains(e.target)) {
            panel.classList.remove('show');
        }
    });
}

// فتح/إغلاق لوحة الإشعارات
function toggleNotificationPanel() {
    showNotificationPanel();
}

// عرض لوحة الإشعارات
function showNotificationPanel() {
    loadModulePage();
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = `
        <div class="page-header">
            <div class="header-content">
                <div>
                    <h1><i class="fas fa-bell"></i> الإشعارات</h1>
                    <p>جميع الإشعارات والتنبيهات</p>
                </div>
                <div class="header-actions">
                    <button class="btn btn-secondary" onclick="markAllAsRead()">
                        <i class="fas fa-check-double"></i>
                        تحديد الكل كمقروء
                    </button>
                    <button class="btn btn-danger" onclick="clearAllNotifications()">
                        <i class="fas fa-trash"></i>
                        مسح الكل
                    </button>
                </div>
            </div>
        </div>

        <div class="notifications-container">
            <div class="notifications-filters">
                <button class="filter-btn active" data-filter="all">
                    الكل (${notifications.length})
                </button>
                <button class="filter-btn" data-filter="unread">
                    غير المقروءة (${unreadCount})
                </button>
                <button class="filter-btn" data-filter="booking">
                    <i class="fas fa-plane"></i> حجوزات
                </button>
                <button class="filter-btn" data-filter="payment">
                    <i class="fas fa-money-bill-wave"></i> مدفوعات
                </button>
                <button class="filter-btn" data-filter="invoice">
                    <i class="fas fa-file-invoice"></i> فواتير
                </button>
            </div>

            <div class="notifications-list" id="notificationsList">
                ${renderNotificationsList()}
            </div>
        </div>
    `;
    
    // إعداد الفلاتر
    setupNotificationFilters();
}

// عرض قائمة الإشعارات
function renderNotificationsList(filter = 'all') {
    let filteredNotifications = notifications;
    
    if (filter === 'unread') {
        filteredNotifications = notifications.filter(n => !n.read);
    } else if (filter !== 'all') {
        filteredNotifications = notifications.filter(n => n.type === filter);
    }
    
    if (filteredNotifications.length === 0) {
        return `
            <div class="empty-state">
                <i class="fas fa-bell-slash"></i>
                <p>لا توجد إشعارات</p>
            </div>
        `;
    }
    
    return filteredNotifications.map(notification => `
        <div class="notification-item ${notification.read ? 'read' : 'unread'}" data-id="${notification.id}">
            <div class="notification-icon notification-${notification.type}">
                <i class="fas fa-${notification.icon}"></i>
            </div>
            <div class="notification-content" onclick="markAsRead('${notification.id}')">
                <div class="notification-header">
                    <h4>${notification.title}</h4>
                    <span class="notification-time">${formatNotificationTime(notification.timestamp)}</span>
                </div>
                <p>${notification.message}</p>
            </div>
            <button class="notification-delete" onclick="deleteNotification('${notification.id}')" title="حذف">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
}

// تنسيق وقت الإشعار
function formatNotificationTime(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'الآن';
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    if (hours < 24) return `منذ ${hours} ساعة`;
    if (days < 7) return `منذ ${days} يوم`;
    
    return new Date(timestamp).toLocaleDateString('ar-EG');
}

// إعداد فلاتر الإشعارات
function setupNotificationFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filter = btn.dataset.filter;
            const listContainer = document.getElementById('notificationsList');
            listContainer.innerHTML = renderNotificationsList(filter);
        });
    });
}

// تحديد إشعار كمقروء
function markAsRead(notificationId) {
    const notification = notifications.find(n => n.id === notificationId);
    if (notification && !notification.read) {
        notification.read = true;
        saveNotifications();
        showNotificationPanel(); // إعادة تحميل القائمة
    }
}

// تحديد جميع الإشعارات كمقروءة
function markAllAsRead() {
    notifications.forEach(n => n.read = true);
    saveNotifications();
    showNotificationPanel();
    showToast(NotificationType.SUCCESS, 'تم', 'تم تحديد جميع الإشعارات كمقروءة');
}

// حذف إشعار
function deleteNotification(notificationId) {
    if (confirm('هل تريد حذف هذا الإشعار؟')) {
        notifications = notifications.filter(n => n.id !== notificationId);
        saveNotifications();
        showNotificationPanel();
    }
}

// مسح جميع الإشعارات
function clearAllNotifications() {
    if (confirm('هل تريد حذف جميع الإشعارات؟')) {
        notifications = [];
        saveNotifications();
        showNotificationPanel();
        showToast(NotificationType.SUCCESS, 'تم', 'تم مسح جميع الإشعارات');
    }
}

// إشعارات الحجوزات
function notifyNewBooking(bookingType, customerName, referenceNo) {
    const types = {
        'flight': 'حجز طيران',
        'hajj': 'حجز حج',
        'umrah': 'حجز عمرة',
        'hotel': 'حجز فندق'
    };
    
    addNotification(
        NotificationType.BOOKING,
        'حجز جديد',
        `تم إنشاء ${types[bookingType]} جديد للعميل ${customerName} - رقم المرجع: ${referenceNo}`,
        'plane'
    );
}

// إشعارات الفواتير
function notifyNewInvoice(invoiceType, invoiceNo, amount) {
    const type = invoiceType === 'sales' ? 'مبيعات' : 'مشتريات';
    addNotification(
        NotificationType.INVOICE,
        `فاتورة ${type} جديدة`,
        `تم إنشاء فاتورة ${type} رقم ${invoiceNo} بمبلغ ${formatCurrency(amount)}`,
        'file-invoice'
    );
}

// إشعارات السندات
function notifyNewVoucher(voucherType, voucherNo, amount) {
    const type = voucherType === 'receipt' ? 'قبض' : 'صرف';
    addNotification(
        NotificationType.PAYMENT,
        `سند ${type} جديد`,
        `تم إنشاء سند ${type} رقم ${voucherNo} بمبلغ ${formatCurrency(amount)}`,
        'money-bill-wave'
    );
}

// تنسيق المبالغ المالية
function formatCurrency(amount, currency = 'YER') {
    const formatted = new Intl.NumberFormat('en-US', {
        useGrouping: false,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
    
    const currencySymbol = CURRENCIES && CURRENCIES[currency] ? CURRENCIES[currency].symbol : 'ر.ي';
    return `${formatted} ${currencySymbol}`;
}

// إنشاء معرف فريد
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// تهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', initNotifications);
