/**
 * نظام تصفية العملات - Currency Filter System
 * يوفر آلية موحدة لتصفية البيانات حسب العملة في جميع أنحاء النظام
 * Version: 1.0.0
 */

// ========================================
// المتغير العام لتخزين العملة المختارة
// ========================================
let globalCurrencyFilter = 'all'; // all, YER, SAR, USD

// ========================================
// دوال إدارة تصفية العملات
// ========================================

/**
 * تعيين العملة المختارة للتصفية
 * @param {string} currency - رمز العملة (all, YER, SAR, USD)
 */
function setGlobalCurrencyFilter(currency) {
    console.log('🔄 تغيير العملة إلى:', currency);
    
    globalCurrencyFilter = currency;
    localStorage.setItem('currencyFilter', currency);
    
    // إغلاق القائمة
    const menu = document.getElementById('currencyFilterMenu');
    if (menu) {
        menu.style.display = 'none';
    }
    
    // تحديث واجهة المستخدم
    updateCurrencyFilterUI();
    
    // إعادة تحميل الصفحة الحالية
    refreshCurrentView();
    
    console.log('✅ تم تحديث العملة بنجاح إلى:', currency);
}

/**
 * الحصول على العملة المختارة
 * @returns {string} رمز العملة الحالي
 */
function getGlobalCurrencyFilter() {
    // تحميل من localStorage إذا لم يكن محملاً
    if (!globalCurrencyFilter) {
        globalCurrencyFilter = localStorage.getItem('currencyFilter') || 'all';
    }
    return globalCurrencyFilter;
}

/**
 * تحديث واجهة المستخدم لعرض العملة المختارة
 */
function updateCurrencyFilterUI() {
    const filterBadge = document.getElementById('currencyFilterBadge');
    if (filterBadge) {
        const currency = getGlobalCurrencyFilter();
        if (currency === 'all') {
            filterBadge.textContent = 'جميع العملات';
            filterBadge.style.background = 'var(--secondary-color)';
        } else {
            const currencyInfo = CURRENCIES[currency];
            filterBadge.textContent = currencyInfo ? currencyInfo.name : currency;
            filterBadge.style.background = 'var(--primary-color)';
        }
    }
}

/**
 * إعادة تحميل المحتوى الحالي
 */
function refreshCurrentView() {
    // الحصول على الصفحة النشطة الحالية
    const activeNavItem = document.querySelector('.nav-item.active');
    const content = document.getElementById('content');
    
    // فحص إذا كان هناك تقرير مفتوح
    if (content) {
        const cardTitle = content.querySelector('.card-title');
        if (cardTitle) {
            const titleText = cardTitle.textContent.trim();
            
            // التحقق من نوع التقرير المفتوح
            if (titleText.includes('قائمة الدخل')) {
                if (typeof generateIncomeStatement === 'function') {
                    generateIncomeStatement();
                    return;
                }
            } else if (titleText.includes('الميزانية العمومية')) {
                if (typeof generateBalanceSheet === 'function') {
                    generateBalanceSheet();
                    return;
                }
            } else if (titleText.includes('ميزان المراجعة')) {
                if (typeof generateTrialBalance === 'function') {
                    generateTrialBalance();
                    return;
                }
            } else if (titleText.includes('التدفقات النقدية')) {
                if (typeof generateCashFlow === 'function') {
                    generateCashFlow();
                    return;
                }
            }
        }
    }
    
    if (activeNavItem) {
        const page = activeNavItem.getAttribute('data-page');
        
        // استدعاء دالة التحميل المناسبة حسب الصفحة
        switch(page) {
            case 'dashboard':
                if (typeof loadDashboard === 'function') loadDashboard();
                break;
            case 'accounts':
                if (typeof loadAccounts === 'function') loadAccounts();
                break;
            case 'journal':
                if (typeof loadJournal === 'function') loadJournal();
                break;
            case 'invoices':
                if (typeof loadInvoices === 'function') loadInvoices();
                break;
            case 'vouchers':
                if (typeof loadVouchers === 'function') loadVouchers();
                break;
            case 'bookings':
                if (typeof loadBookings === 'function') loadBookings();
                break;
            case 'customers':
                if (typeof loadCustomers === 'function') loadCustomers();
                break;
            case 'suppliers':
                if (typeof loadSuppliers === 'function') loadSuppliers();
                break;
            case 'reports':
                if (typeof loadReports === 'function') loadReports();
                break;
            default:
                // إذا لم تكن هناك دالة معروفة، أعد تحميل لوحة التحكم
                if (typeof loadDashboard === 'function') loadDashboard();
        }
    } else {
        // إذا لم يكن هناك صفحة نشطة، أعد تحميل لوحة التحكم
        if (typeof loadDashboard === 'function') loadDashboard();
    }
}

/**
 * إنشاء قائمة تصفية العملات
 * @returns {string} HTML للقائمة
 */
function generateCurrencyFilterDropdown() {
    const currentFilter = getGlobalCurrencyFilter();
    
    return `
        <div class="currency-filter-dropdown" style="position: relative; display: inline-block;">
            <button class="btn btn-sm" onclick="toggleCurrencyFilterMenu()" style="background: var(--secondary-color); color: white; padding: 8px 15px; border-radius: 6px;">
                <i class="fas fa-filter"></i>
                <span id="currencyFilterBadge">${currentFilter === 'all' ? 'جميع العملات' : CURRENCIES[currentFilter].name}</span>
                <i class="fas fa-chevron-down" style="margin-right: 5px; font-size: 10px;"></i>
            </button>
            
            <div id="currencyFilterMenu" class="currency-filter-menu" style="display: none; position: absolute; top: 100%; left: 0; background: white; border: 1px solid #ddd; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 1000; min-width: 180px; margin-top: 5px;">
                <div onclick="setGlobalCurrencyFilter('all')" style="padding: 12px 15px; cursor: pointer; border-bottom: 1px solid #f0f0f0; ${currentFilter === 'all' ? 'background: #f5f5f5; font-weight: bold;' : ''}" onmouseover="this.style.background='#f5f5f5'" onmouseout="this.style.background='${currentFilter === 'all' ? '#f5f5f5' : 'white'}'">
                    <i class="fas fa-globe" style="margin-left: 10px; color: var(--secondary-color);"></i>
                    جميع العملات
                </div>
                <div onclick="setGlobalCurrencyFilter('YER')" style="padding: 12px 15px; cursor: pointer; border-bottom: 1px solid #f0f0f0; ${currentFilter === 'YER' ? 'background: #f5f5f5; font-weight: bold;' : ''}" onmouseover="this.style.background='#f5f5f5'" onmouseout="this.style.background='${currentFilter === 'YER' ? '#f5f5f5' : 'white'}'">
                    <i class="fas fa-coins" style="margin-left: 10px; color: #4caf50;"></i>
                    ${CURRENCIES.YER.name}
                </div>
                <div onclick="setGlobalCurrencyFilter('SAR')" style="padding: 12px 15px; cursor: pointer; border-bottom: 1px solid #f0f0f0; ${currentFilter === 'SAR' ? 'background: #f5f5f5; font-weight: bold;' : ''}" onmouseover="this.style.background='#f5f5f5'" onmouseout="this.style.background='${currentFilter === 'SAR' ? '#f5f5f5' : 'white'}'">
                    <i class="fas fa-coins" style="margin-left: 10px; color: #2196f3;"></i>
                    ${CURRENCIES.SAR.name}
                </div>
                <div onclick="setGlobalCurrencyFilter('USD')" style="padding: 12px 15px; cursor: pointer; ${currentFilter === 'USD' ? 'background: #f5f5f5; font-weight: bold;' : ''}" onmouseover="this.style.background='#f5f5f5'" onmouseout="this.style.background='${currentFilter === 'USD' ? '#f5f5f5' : 'white'}'">
                    <i class="fas fa-coins" style="margin-left: 10px; color: #ff9800;"></i>
                    ${CURRENCIES.USD.name}
                </div>
            </div>
        </div>
    `;
}

/**
 * إظهار/إخفاء قائمة العملات
 */
function toggleCurrencyFilterMenu() {
    const menu = document.getElementById('currencyFilterMenu');
    if (menu) {
        menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    }
}

// إغلاق القائمة عند النقر خارجها
document.addEventListener('click', function(event) {
    const menu = document.getElementById('currencyFilterMenu');
    const dropdown = document.querySelector('.currency-filter-dropdown');
    
    if (menu && dropdown && !dropdown.contains(event.target)) {
        menu.style.display = 'none';
    }
});

// ========================================
// دوال التصفية حسب العملة
// ========================================

/**
 * تصفية الفواتير حسب العملة
 * @param {Array} invoices - قائمة الفواتير
 * @returns {Array} الفواتير المصفاة
 */
function filterInvoicesByCurrency(invoices) {
    const filter = getGlobalCurrencyFilter();
    if (filter === 'all') return invoices;
    return invoices.filter(inv => inv.currency === filter);
}

/**
 * تصفية السندات حسب العملة
 * @param {Array} vouchers - قائمة السندات
 * @returns {Array} السندات المصفاة
 */
function filterVouchersByCurrency(vouchers) {
    const filter = getGlobalCurrencyFilter();
    if (filter === 'all') return vouchers;
    return vouchers.filter(v => v.currency === filter);
}

/**
 * تصفية القيود حسب العملة
 * @param {Array} entries - قائمة القيود
 * @returns {Array} القيود المصفاة
 */
function filterJournalEntriesByCurrency(entries) {
    const filter = getGlobalCurrencyFilter();
    if (filter === 'all') return entries;
    return entries.filter(e => e.currency === filter);
}

/**
 * تصفية الحجوزات حسب العملة
 * @param {Array} bookings - قائمة الحجوزات
 * @returns {Array} الحجوزات المصفاة
 */
function filterBookingsByCurrency(bookings) {
    const filter = getGlobalCurrencyFilter();
    if (filter === 'all') return bookings;
    return bookings.filter(b => b.currency === filter);
}

/**
 * حساب المجموع حسب العملة
 * @param {Array} items - قائمة العناصر
 * @param {string} field - اسم الحقل المراد جمعه
 * @returns {number} المجموع
 */
function sumByCurrency(items, field) {
    const filter = getGlobalCurrencyFilter();
    const filtered = filter === 'all' ? items : items.filter(item => item.currency === filter);
    return filtered.reduce((sum, item) => sum + (parseFloat(item[field]) || 0), 0);
}

/**
 * حساب الإيرادات حسب العملة المختارة
 * @returns {number} إجمالي الإيرادات
 */
function getTotalRevenueFiltered() {
    const accounts = getData('accounts') || [];
    const journalEntries = getData('journal_entries') || [];
    const filter = getGlobalCurrencyFilter();
    
    let total = 0;
    
    // تصفية القيود حسب العملة
    const filteredEntries = filter === 'all' ? journalEntries : journalEntries.filter(e => e.currency === filter);
    
    filteredEntries.forEach(entry => {
        entry.items.forEach(item => {
            const account = accounts.find(acc => acc.id === item.accountId || acc.id === item.account_id);
            if (account && account.code.startsWith('4')) { // حسابات الإيرادات
                total += item.credit - item.debit;
            }
        });
    });
    
    return total;
}

/**
 * حساب المصروفات حسب العملة المختارة
 * @returns {number} إجمالي المصروفات
 */
function getTotalExpensesFiltered() {
    const accounts = getData('accounts') || [];
    const journalEntries = getData('journal_entries') || [];
    const filter = getGlobalCurrencyFilter();
    
    let total = 0;
    
    // تصفية القيود حسب العملة
    const filteredEntries = filter === 'all' ? journalEntries : journalEntries.filter(e => e.currency === filter);
    
    filteredEntries.forEach(entry => {
        entry.items.forEach(item => {
            const account = accounts.find(acc => acc.id === item.accountId || acc.id === item.account_id);
            if (account && account.code.startsWith('5')) { // حسابات المصروفات
                total += item.debit - item.credit;
            }
        });
    });
    
    return total;
}

/**
 * حساب صافي الربح حسب العملة المختارة
 * @returns {number} صافي الربح/الخسارة
 */
function getNetProfitFiltered() {
    return getTotalRevenueFiltered() - getTotalExpensesFiltered();
}

// ========================================
// تهيئة نظام التصفية
// ========================================

// تحميل العملة المحفوظة عند بدء التطبيق
document.addEventListener('DOMContentLoaded', function() {
    const savedFilter = localStorage.getItem('currencyFilter');
    if (savedFilter) {
        globalCurrencyFilter = savedFilter;
    }
    
    updateCurrencyFilterUI();
});

console.log('✅ نظام تصفية العملات جاهز - Currency Filter System Ready');
