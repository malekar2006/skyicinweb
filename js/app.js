// ========================================
// بيانات الشركة
// ========================================
const COMPANY_INFO = {
    name: 'سكاي آيكون للسفريات والسياحة وخدمات الحج والعمرة',
    location: 'صنعاء - ذهبان - مقابل كهرباء ذهبان - جوار سوق القات',
    phones: {
        office: [
            '783003636',
            '783003838',
            '783003939',
            '0101127338'
        ]
    },
    logo: 'images/logo.png'
};

// ========================================
// نظام العملات المتعدد
// ========================================
const CURRENCIES = {
    YER: { code: 'YER', name: 'ريال يمني', symbol: 'ر.ي', rate: 1 },
    SAR: { code: 'SAR', name: 'ريال سعودي', symbol: 'ر.س', rate: 142 },
    USD: { code: 'USD', name: 'دولار أمريكي', symbol: '$', rate: 530 }
};

// العملة الافتراضية (الريال اليمني كعملة أساسية)
const BASE_CURRENCY = 'YER';

// ========================================
// تهيئة التطبيق
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    // تهيئة القوائم
    initNavigation();
    
    // تهيئة أزرار الهيدر
    initHeaderButtons();
    
    // تهيئة القائمة الجانبية
    initSidebar();
    
    // تهيئة الملف الشخصي
    if (typeof initProfile === 'function') {
        initProfile();
    }
    
    // تحميل الصفحة الافتراضية
    loadPage('dashboard');
    
    // تهيئة قاعدة البيانات
    initDatabase();
});

// تهيئة أزرار الهيدر
function initHeaderButtons() {
    document.querySelectorAll('.header-actions button[data-action]').forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.getAttribute('data-action');
            handleAction(action);
        });
    });
}

// ========================================
// نظام التنقل بين الصفحات
// ========================================
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // إزالة الفئة النشطة من جميع العناصر
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // إضافة الفئة النشطة للعنصر المحدد
            this.classList.add('active');
            
            // تحميل الصفحة أو الإجراء
            const page = this.getAttribute('data-page');
            const action = this.getAttribute('data-action');
            
            if (page) {
                loadPage(page);
            } else if (action) {
                handleAction(action);
            }
        });
    });
}

// معالجة الإجراءات الخاصة
function handleAction(action) {
    const pageTitle = document.getElementById('pageTitle');
    
    const actionTitles = {
        'users': 'إدارة المستخدمين',
        'activity': 'سجل النشاط',
        'statistics': 'إحصائيات المستخدمين',
        'search': 'الاستعلام المتقدم',
        'currency': 'إدارة العملات',
        'service-pricing': 'تسعير الخدمات',
        'customer-statements': 'كشف حساب عميل',
        'supplier-statements': 'كشف حساب مورد',
        'all-customers-statements': 'كشف حساب جميع العملاء',
        'all-suppliers-statements': 'كشف حساب جميع الموردين',
        'profile': 'الملف الشخصي',
        'notifications': 'الإشعارات',
        'followup': 'المتابعة'
    };
    
    pageTitle.textContent = actionTitles[action] || 'النظام';
    
    switch(action) {
        case 'users':
            showUsersManagement();
            break;
        case 'activity':
            showActivityLog();
            break;
        case 'statistics':
            showUserStatistics();
            break;
        case 'search':
            showAdvancedSearch();
            break;
        case 'currency':
            showCurrencySettings();
            break;
        case 'service-pricing':
            loadServicePricing();
            break;
        case 'customer-statements':
            loadCustomerStatements();
            break;
        case 'supplier-statements':
            loadSupplierStatements();
            break;
        case 'all-customers-statements':
            loadAllCustomersStatements();
            break;
        case 'all-suppliers-statements':
            loadAllSuppliersStatements();
            break;
        case 'profile':
            showProfile();
            break;
        case 'notifications':
            showNotificationPanel();
            break;
        case 'followup':
            showFollowUp();
            break;
        default:
            console.warn('إجراء غير معروف:', action);
    }
}

// ========================================
// تحميل الصفحات
// ========================================
function loadPage(page) {
    const content = document.getElementById('content');
    const mainContent = document.getElementById('mainContent');
    const pageTitle = document.getElementById('pageTitle');
    
    // إخفاء mainContent وإظهار content
    content.style.display = 'block';
    mainContent.style.display = 'none';
    
    // تحديث عنوان الصفحة
    const titles = {
        dashboard: 'لوحة التحكم',
        accounts: 'شجرة الحسابات',
        journal: 'القيود المحاسبية',
        invoices: 'الفواتير',
        vouchers: 'السندات',
        bookings: 'الحجوزات',
        customers: 'العملاء',
        suppliers: 'الموردين',
        passports: 'الجوازات المرسلة',
        reports: 'التقارير المالية',
        settings: 'الإعدادات'
    };
    
    pageTitle.textContent = titles[page] || 'لوحة التحكم';
    
    // تحميل محتوى الصفحة
    switch(page) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'accounts':
            loadAccounts();
            break;
        case 'journal':
            loadJournal();
            break;
        case 'invoices':
            loadInvoices();
            break;
        case 'vouchers':
            loadVouchers();
            break;
        case 'bookings':
            loadBookings();
            break;
        case 'customers':
            loadCustomers();
            break;
        case 'suppliers':
            loadSuppliers();
            break;
        case 'passports':
            loadSentPassports();
            break;
        case 'reports':
            loadReports();
            break;
        case 'settings':
            loadSettings();
            break;
        default:
            loadDashboard();
    }
}

// ========================================
// تحميل محتوى الوحدات
// ========================================
function loadModulePage() {
    const content = document.getElementById('content');
    const mainContent = document.getElementById('mainContent');
    
    // إخفاء content وإظهار mainContent
    content.style.display = 'none';
    mainContent.style.display = 'block';
}

// ========================================
// القائمة الجانبية (Sidebar)
// ========================================
function initSidebar() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    
    menuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('active');
    });
    
    // إغلاق القائمة عند النقر خارجها في الشاشات الصغيرة
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 768) {
            if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                sidebar.classList.remove('active');
            }
        }
    });
}

// ========================================
// تهيئة قاعدة البيانات
// ========================================
function initDatabase() {
    // التحقق من وجود بيانات في localStorage
    if (!localStorage.getItem('skyicon_initialized')) {
        // إنشاء البيانات الافتراضية
        createDefaultData();
        localStorage.setItem('skyicon_initialized', 'true');
    }
    
    // تهيئة وحدة المستخدمين (في كل مرة)
    if (typeof initUsers === 'function') {
        initUsers();
    }
}

// ========================================
// إنشاء البيانات الافتراضية
// ========================================
function createDefaultData() {
    // شجرة الحسابات الافتراضية
    const defaultAccounts = [
        // الأصول
        { id: '1', code: '1', name: 'الأصول', type: 'main', parent: null, debit: 0, credit: 0 },
        { id: '11', code: '11', name: 'أصول متداولة', type: 'sub', parent: '1', debit: 0, credit: 0 },
        { id: '111', code: '111', name: 'النقدية', type: 'sub', parent: '11', debit: 0, credit: 0 },
        { id: '1111', code: '1111', name: 'الخزينة', type: 'detail', parent: '111', debit: 0, credit: 0 },
        { id: '1112', code: '1112', name: 'البنك', type: 'detail', parent: '111', debit: 0, credit: 0 },
        { id: '112', code: '112', name: 'العملاء', type: 'sub', parent: '11', debit: 0, credit: 0 },
        
        // الخصوم
        { id: '2', code: '2', name: 'الخصوم', type: 'main', parent: null, debit: 0, credit: 0 },
        { id: '21', code: '21', name: 'خصوم متداولة', type: 'sub', parent: '2', debit: 0, credit: 0 },
        { id: '211', code: '211', name: 'الموردين', type: 'detail', parent: '21', debit: 0, credit: 0 },
        
        // حقوق الملكية
        { id: '3', code: '3', name: 'حقوق الملكية', type: 'main', parent: null, debit: 0, credit: 0 },
        { id: '31', code: '31', name: 'رأس المال', type: 'detail', parent: '3', debit: 0, credit: 0 },
        { id: '32', code: '32', name: 'الأرباح المحتجزة', type: 'detail', parent: '3', debit: 0, credit: 0 },
        
        // الإيرادات
        { id: '4', code: '4', name: 'الإيرادات', type: 'main', parent: null, debit: 0, credit: 0 },
        { id: '41', code: '41', name: 'إيرادات التشغيل', type: 'sub', parent: '4', debit: 0, credit: 0 },
        { id: '411', code: '411', name: 'إيرادات حجوزات الطيران', type: 'detail', parent: '41', debit: 0, credit: 0 },
        { id: '412', code: '412', name: 'إيرادات خدمات الحج والعمرة', type: 'detail', parent: '41', debit: 0, credit: 0 },
        { id: '413', code: '413', name: 'إيرادات حجوزات الفنادق', type: 'detail', parent: '41', debit: 0, credit: 0 },
        
        // المصروفات
        { id: '5', code: '5', name: 'المصروفات', type: 'main', parent: null, debit: 0, credit: 0 },
        { id: '51', code: '51', name: 'مصروفات التشغيل', type: 'sub', parent: '5', debit: 0, credit: 0 },
        { id: '511', code: '511', name: 'الرواتب والأجور', type: 'detail', parent: '51', debit: 0, credit: 0 },
        { id: '512', code: '512', name: 'الإيجارات', type: 'detail', parent: '51', debit: 0, credit: 0 },
        { id: '513', code: '513', name: 'مصروفات التسويق', type: 'detail', parent: '51', debit: 0, credit: 0 }
    ];
    
    localStorage.setItem('accounts', JSON.stringify(defaultAccounts));
    
    // القيود المحاسبية
    localStorage.setItem('journal_entries', JSON.stringify([]));
    
    // الفواتير
    localStorage.setItem('invoices', JSON.stringify([]));
    
    // السندات
    localStorage.setItem('vouchers', JSON.stringify([]));
    
    // الحجوزات
    localStorage.setItem('bookings', JSON.stringify([]));
    
    // العملاء
    localStorage.setItem('customers', JSON.stringify([]));
    
    // الموردين
    localStorage.setItem('suppliers', JSON.stringify([]));
    
    // الجوازات المرسلة
    localStorage.setItem('sentPassports', JSON.stringify([]));
    
    // الإعدادات
    const settings = {
        fiscalYear: new Date().getFullYear(),
        currency: 'ريال يمني',
        companyInfo: COMPANY_INFO
    };
    localStorage.setItem('settings', JSON.stringify(settings));
}

// ========================================
// دوال مساعدة - LocalStorage
// ========================================

// حفظ البيانات
function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// قراءة البيانات
function getData(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}

// إضافة عنصر
function addItem(key, item) {
    const items = getData(key) || [];
    items.push(item);
    saveData(key, items);
    return item;
}

// تحديث عنصر
function updateItem(key, id, updatedItem) {
    const items = getData(key) || [];
    const index = items.findIndex(item => item.id === id);
    if (index !== -1) {
        items[index] = { ...items[index], ...updatedItem };
        saveData(key, items);
        return items[index];
    }
    return null;
}

// حذف عنصر
function deleteItem(key, id) {
    const items = getData(key) || [];
    const filtered = items.filter(item => item.id !== id);
    saveData(key, filtered);
    return filtered;
}

// البحث عن عنصر
function findItem(key, id) {
    const items = getData(key) || [];
    return items.find(item => item.id === id);
}

// ========================================
// دوال مساعدة - التنسيق
// ========================================

// تنسيق الأرقام (أرقام إنجليزية)
function formatNumber(num) {
    // استخدام en-US للحصول على أرقام إنجليزية (123456)
    return new Intl.NumberFormat('en-US', {
        useGrouping: false, // إزالة الفواصل
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(num);
}

// تنسيق العملة (بدون رمز - حسب المتطلبات الجديدة)
function formatCurrency(amount, currency = null) {
    // تنسيق الرقم
    const formatted = formatNumber(amount);
    
    // إذا لم يتم تحديد عملة، نحاول الحصول عليها بالترتيب:
    // 1. العملة المصفاة من نظام التصفية
    // 2. العملة الافتراضية من الإعدادات
    if (!currency) {
        // محاولة الحصول على العملة المصفاة
        if (typeof getGlobalCurrencyFilter === 'function') {
            const filter = getGlobalCurrencyFilter();
            if (filter && filter !== 'all' && CURRENCIES[filter]) {
                currency = filter;
            }
        }
        
        // إذا لم توجد عملة مصفاة، استخدم العملة الافتراضية من الإعدادات
        if (!currency && typeof getDefaultCurrency === 'function') {
            const defaultCurr = getDefaultCurrency();
            if (defaultCurr && defaultCurr !== 'all' && CURRENCIES[defaultCurr]) {
                currency = defaultCurr;
            }
        }
        
        // كحل أخير، استخدم الريال اليمني
        if (!currency) {
            currency = 'YER';
        }
    }
    
    // إذا تم تحديد عملة، نعرض رمزها
    if (currency && CURRENCIES[currency]) {
        return `${formatted} ${CURRENCIES[currency].symbol}`;
    }
    
    // بدون عملة، نعرض الرقم فقط
    return formatted;
}

// تحويل العملة إلى العملة الأساسية
function convertToBaseCurrency(amount, fromCurrency) {
    if (fromCurrency === BASE_CURRENCY) return amount;
    const currency = CURRENCIES[fromCurrency];
    return amount * currency.rate;
}

// تحويل من العملة الأساسية إلى عملة أخرى
function convertFromBaseCurrency(amount, toCurrency) {
    if (toCurrency === BASE_CURRENCY) return amount;
    const currency = CURRENCIES[toCurrency];
    return amount / currency.rate;
}

// الحصول على قائمة العملات (بدون رموز - حسب المتطلبات الجديدة)
function getCurrencyOptions(selectedCurrency = null) {
    const defaultCurr = selectedCurrency || (typeof getDefaultCurrency === 'function' ? getDefaultCurrency() : 'YER');
    return Object.values(CURRENCIES).map(curr => 
        `<option value="${curr.code}" ${curr.code === defaultCurr ? 'selected' : ''}>${curr.name}</option>`
    ).join('');
}

// تنسيق التاريخ
function formatDate(date) {
    const d = new Date(date);
    return d.toLocaleDateString('ar-YE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// تنسيق التاريخ قصير
function formatDateShort(date) {
    const d = new Date(date);
    return d.toLocaleDateString('ar-YE');
}

// تنسيق التاريخ والوقت
function formatDateTime(dateTime) {
    const d = new Date(dateTime);
    return d.toLocaleString('ar-YE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ========================================
// دوال مساعدة - Modal
// ========================================

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

// ========================================
// دوال مساعدة - Alerts
// ========================================

function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    
    const icon = {
        success: 'fa-check-circle',
        danger: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    }[type];
    
    alertDiv.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
    `;
    
    const content = document.getElementById('content');
    content.insertBefore(alertDiv, content.firstChild);
    
    // إزالة التنبيه بعد 5 ثوان
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// ========================================
// دوال مساعدة - معرفات فريدة
// ========================================

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function generateInvoiceNumber() {
    const invoices = getData('invoices') || [];
    const year = new Date().getFullYear();
    const count = invoices.filter(inv => inv.date.startsWith(year.toString())).length + 1;
    return `INV-${year}-${String(count).padStart(5, '0')}`;
}

function generateVoucherNumber(type) {
    const vouchers = getData('vouchers') || [];
    const year = new Date().getFullYear();
    const prefix = type === 'receipt' ? 'RCV' : 'PAY';
    const count = vouchers.filter(v => v.type === type && v.date.startsWith(year.toString())).length + 1;
    return `${prefix}-${year}-${String(count).padStart(5, '0')}`;
}

function generateJournalNumber() {
    const entries = getData('journal_entries') || [];
    const year = new Date().getFullYear();
    const count = entries.filter(e => e.date.startsWith(year.toString())).length + 1;
    return `JE-${year}-${String(count).padStart(5, '0')}`;
}

// ========================================
// دوال محاسبية مساعدة
// ========================================

// حساب رصيد حساب معين
function getAccountBalance(accountId, currency = null) {
    const account = findItem('accounts', accountId);
    if (!account) return 0;
    
    const journalEntries = getData('journal_entries') || [];
    
    // إذا لم يتم تمرير عملة، استخدم التصفية النشطة
    if (!currency) {
        if (typeof getGlobalCurrencyFilter === 'function') {
            const filter = getGlobalCurrencyFilter();
            currency = (filter && filter !== 'all') ? filter : null;
        }
    }
    
    let debit = 0;
    let credit = 0;
    
    journalEntries.forEach(entry => {
        // تصفية حسب العملة إذا كانت محددة
        if (currency && entry.currency && entry.currency !== currency) {
            return; // تخطي هذا القيد
        }
        
        entry.items.forEach(item => {
            if (item.accountId === accountId) {
                debit += parseFloat(item.debit) || 0;
                credit += parseFloat(item.credit) || 0;
            }
        });
    });
    
    // حسب نوع الحساب
    const accountCode = account.code;
    const firstDigit = accountCode.charAt(0);
    
    // الأصول والمصروفات (1، 5) - الرصيد المدين
    if (firstDigit === '1' || firstDigit === '5') {
        return debit - credit;
    }
    // الخصوم وحقوق الملكية والإيرادات (2، 3، 4) - الرصيد الدائن
    else {
        return credit - debit;
    }
}

// حساب إجمالي الإيرادات
function getTotalRevenue() {
    const accounts = getData('accounts') || [];
    const revenueAccounts = accounts.filter(acc => acc.code.startsWith('4'));
    let total = 0;
    
    revenueAccounts.forEach(acc => {
        total += getAccountBalance(acc.id);
    });
    
    return total;
}

// حساب إجمالي المصروفات
function getTotalExpenses() {
    const accounts = getData('accounts') || [];
    const expenseAccounts = accounts.filter(acc => acc.code.startsWith('5'));
    let total = 0;
    
    expenseAccounts.forEach(acc => {
        total += getAccountBalance(acc.id);
    });
    
    return total;
}

// حساب صافي الربح
function getNetProfit() {
    return getTotalRevenue() - getTotalExpenses();
}

// حساب رصيد الخزينة
function getCashBalance() {
    return getAccountBalance('1111');
}

// حساب رصيد البنك
function getBankBalance() {
    return getAccountBalance('1112');
}