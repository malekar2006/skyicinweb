/**
 * ==============================================
 * نظام إدارة العملات المتعددة
 * Multi-Currency Management System
 * ==============================================
 * Sky Icon Travel & Tourism - Integrated Accounting System
 * النظام المحاسبي المتكامل - سكاي آيكون للسفريات والسياحة
 */

// ========================================
// تعريف العملات المدعومة
// ========================================
// ملاحظة: CURRENCIES معرّف في js/app.js
// لتجنب التكرار، نستخدم المتغير المعرّف هناك

// ========================================
// أسعار الصرف الافتراضية (مقابل الريال اليمني)
// Default Exchange Rates (against YER)
// ========================================
const DEFAULT_EXCHANGE_RATES = {
    YER: 1,          // الريال اليمني (العملة الأساسية)
    SAR: 665,        // 1 ريال سعودي = 665 ريال يمني (تقريباً)
    USD: 2500        // 1 دولار أمريكي = 2500 ريال يمني (تقريباً)
};

// ========================================
// الحصول على أسعار الصرف المخزنة
// ========================================
function getExchangeRates() {
    const settings = getData('settings') || {};
    return settings.exchangeRates || DEFAULT_EXCHANGE_RATES;
}

// ========================================
// حفظ أسعار الصرف
// ========================================
function saveExchangeRates(rates) {
    const settings = getData('settings') || {};
    settings.exchangeRates = rates;
    saveData('settings', settings);
}

// ========================================
// الحصول على العملة الافتراضية
// ========================================
function getDefaultCurrency() {
    const settings = getData('settings') || {};
    return settings.defaultCurrency || 'YER';
}

// ========================================
// تعيين العملة الافتراضية
// ========================================
function setDefaultCurrency(currency) {
    if (!CURRENCIES[currency]) {
        showAlert('عملة غير صحيحة', 'danger');
        return false;
    }
    
    const settings = getData('settings') || {};
    settings.defaultCurrency = currency;
    saveData('settings', settings);
    
    showAlert(`تم تعيين ${CURRENCIES[currency].name} كعملة افتراضية`, 'success');
    return true;
}

// ========================================
// تحويل العملات
// Convert Currency
// ========================================
function convertCurrency(amount, fromCurrency, toCurrency) {
    if (!amount || amount === 0) return 0;
    if (fromCurrency === toCurrency) return amount;
    
    const rates = getExchangeRates();
    
    // تحويل إلى الريال اليمني أولاً (العملة الأساسية)
    const amountInYER = amount * rates[fromCurrency];
    
    // ثم تحويل إلى العملة المطلوبة
    const result = amountInYER / rates[toCurrency];
    
    return result;
}

// ========================================
// تنسيق العملة للعرض
// Format Currency for Display
// ========================================
function formatCurrency(amount, currency = null) {
    // الحصول على معلومات العملة
    const currencyInfo = currency ? CURRENCIES[currency] : null;
    
    const formatted = new Intl.NumberFormat('en-US', {
        useGrouping: false,
        minimumFractionDigits: currencyInfo ? currencyInfo.decimals : 2,
        maximumFractionDigits: currencyInfo ? currencyInfo.decimals : 2
    }).format(amount || 0);
    
    // إذا تم تمرير عملة، نعرض رمزها
    if (currencyInfo) {
        return `${formatted} ${currencyInfo.symbol}`;
    }
    
    return formatted;
}

// ========================================
// إنشاء قائمة اختيار العملة
// Create Currency Select Dropdown
// ========================================
function createCurrencySelect(selectedCurrency = null, name = 'currency', includeAll = false) {
    if (!selectedCurrency) {
        selectedCurrency = getDefaultCurrency();
    }
    
    let options = '';
    
    if (includeAll) {
        options += `<option value="">جميع العملات</option>`;
    }
    
    Object.values(CURRENCIES).forEach(currency => {
        const selected = currency.code === selectedCurrency ? 'selected' : '';
        options += `
            <option value="${currency.code}" ${selected}>
                ${currency.name}
            </option>
        `;
    });
    
    return `
        <select class="form-control currency-select" name="${name}" id="${name}">
            ${options}
        </select>
    `;
}

// ========================================
// عرض المبلغ بجميع العملات
// Display Amount in All Currencies
// ========================================
function displayMultiCurrency(amount, baseCurrency = null) {
    if (!baseCurrency) {
        baseCurrency = getDefaultCurrency();
    }
    
    const html = [];
    
    Object.values(CURRENCIES).forEach(currency => {
        const convertedAmount = convertCurrency(amount, baseCurrency, currency.code);
        const isBase = currency.code === baseCurrency;
        
        html.push(`
            <div class="currency-display-item ${isBase ? 'base-currency' : ''}">
                <span class="currency-icon" style="color: ${currency.color}">
                    <i class="fas fa-${currency.icon}"></i>
                </span>
                <span class="currency-name">${currency.name}</span>
                <span class="currency-amount">${formatCurrency(convertedAmount, currency.code)}</span>
                ${isBase ? '<span class="badge badge-primary badge-sm">الأساسية</span>' : ''}
            </div>
        `);
    });
    
    return `<div class="multi-currency-display">${html.join('')}</div>`;
}

// ========================================
// حساب الإجمالي بعملة محددة
// Calculate Total in Specific Currency
// ========================================
function calculateTotalInCurrency(items, targetCurrency = null) {
    if (!targetCurrency) {
        targetCurrency = getDefaultCurrency();
    }
    
    let total = 0;
    
    items.forEach(item => {
        const itemCurrency = item.currency || 'YER';
        const convertedAmount = convertCurrency(item.amount || 0, itemCurrency, targetCurrency);
        total += convertedAmount;
    });
    
    return total;
}

// ========================================
// الحصول على أيقونة العملة
// ========================================
function getCurrencyIcon(currencyCode) {
    return CURRENCIES[currencyCode]?.icon || 'coins';
}

// ========================================
// الحصول على لون العملة
// ========================================
function getCurrencyColor(currencyCode) {
    return CURRENCIES[currencyCode]?.color || '#6b7280';
}

// ========================================
// عرض شارة العملة
// Display Currency Badge
// ========================================
function renderCurrencyBadge(currencyCode) {
    const currency = CURRENCIES[currencyCode];
    if (!currency) return '';
    
    return `
        <span class="currency-badge" style="background: ${currency.color}">
            <i class="fas fa-${currency.icon}"></i> ${currency.symbol}
        </span>
    `;
}

// ========================================
// إحصائيات العملات
// Currency Statistics
// ========================================
function getCurrencyStats() {
    const accounts = getData('accounts') || [];
    const invoices = getData('invoices') || [];
    const vouchers = getData('vouchers') || [];
    
    const stats = {};
    
    // تهيئة الإحصائيات
    Object.keys(CURRENCIES).forEach(code => {
        stats[code] = {
            accounts: 0,
            totalBalance: 0,
            invoices: 0,
            invoicesTotal: 0,
            vouchers: 0,
            vouchersTotal: 0
        };
    });
    
    // حساب إحصائيات الحسابات
    accounts.forEach(account => {
        const currency = account.currency || 'YER';
        if (stats[currency]) {
            stats[currency].accounts++;
            const balance = (account.debit || 0) - (account.credit || 0);
            stats[currency].totalBalance += balance;
        }
    });
    
    // حساب إحصائيات الفواتير
    invoices.forEach(invoice => {
        const currency = invoice.currency || 'YER';
        if (stats[currency]) {
            stats[currency].invoices++;
            stats[currency].invoicesTotal += invoice.total || 0;
        }
    });
    
    // حساب إحصائيات السندات
    vouchers.forEach(voucher => {
        const currency = voucher.currency || 'YER';
        if (stats[currency]) {
            stats[currency].vouchers++;
            stats[currency].vouchersTotal += voucher.amount || 0;
        }
    });
    
    return stats;
}

// ========================================
// تحويل البيانات القديمة لدعم العملات
// Migrate Old Data to Support Currencies
// ========================================
function migrateCurrencyData() {
    let updated = false;
    
    // تحديث الحسابات
    const accounts = getData('accounts') || [];
    accounts.forEach(account => {
        if (!account.currency) {
            account.currency = 'YER';
            updated = true;
        }
    });
    if (updated) {
        saveData('accounts', accounts);
    }
    
    // تحديث الفواتير
    updated = false;
    const invoices = getData('invoices') || [];
    invoices.forEach(invoice => {
        if (!invoice.currency) {
            invoice.currency = 'YER';
            updated = true;
        }
    });
    if (updated) {
        saveData('invoices', invoices);
    }
    
    // تحديث السندات
    updated = false;
    const vouchers = getData('vouchers') || [];
    vouchers.forEach(voucher => {
        if (!voucher.currency) {
            voucher.currency = 'YER';
            updated = true;
        }
    });
    if (updated) {
        saveData('vouchers', vouchers);
    }
    
    // تحديث الحجوزات
    updated = false;
    const bookings = getData('bookings') || [];
    bookings.forEach(booking => {
        if (!booking.currency) {
            booking.currency = 'YER';
            updated = true;
        }
    });
    if (updated) {
        saveData('bookings', bookings);
    }
    
    // تحديث القيود
    updated = false;
    const journalEntries = getData('journal_entries') || [];
    journalEntries.forEach(entry => {
        if (!entry.currency) {
            entry.currency = 'YER';
            updated = true;
        }
    });
    if (updated) {
        saveData('journal_entries', journalEntries);
    }
    
    console.log('✅ تم تحديث البيانات لدعم العملات المتعددة');
}

// ========================================
// إضافة أنماط CSS للعملات
// ========================================
function addCurrencyStyles() {
    if (document.getElementById('currency-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'currency-styles';
    style.textContent = `
        /* قائمة اختيار العملة */
        .currency-select {
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23f57c00' viewBox='0 0 16 16'%3E%3Cpath d='M11.251.068a.5.5 0 0 1 .227.58L9.677 6.5H13a.5.5 0 0 1 .364.843l-8 8.5a.5.5 0 0 1-.842-.49L6.323 9.5H3a.5.5 0 0 1-.364-.843l8-8.5a.5.5 0 0 1 .615-.09z'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: left 10px center;
            padding-left: 35px;
            font-weight: 600;
        }
        
        /* شارة العملة */
        .currency-badge {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            padding: 4px 10px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 700;
            color: white;
            white-space: nowrap;
        }
        
        /* عرض متعدد العملات */
        .multi-currency-display {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 12px;
            margin: 15px 0;
        }
        
        .currency-display-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 12px;
            background: #f9fafb;
            border: 2px solid #e5e7eb;
            border-radius: 10px;
            transition: all 0.3s;
        }
        
        .currency-display-item:hover {
            border-color: var(--primary);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }
        
        .currency-display-item.base-currency {
            background: linear-gradient(135deg, #fff9f0, #fef3e2);
            border-color: var(--primary);
            font-weight: 600;
        }
        
        .currency-icon {
            font-size: 20px;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: white;
            border-radius: 8px;
        }
        
        .currency-name {
            flex: 1;
            font-size: 13px;
            color: #6b7280;
        }
        
        .currency-amount {
            font-size: 15px;
            font-weight: 700;
            color: #1f2937;
        }
        
        /* جدول العملات */
        .currency-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        
        .currency-table th {
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            color: white;
            padding: 12px;
            text-align: center;
            font-weight: 600;
        }
        
        .currency-table td {
            padding: 12px;
            text-align: center;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .currency-table tr:hover {
            background: #f9fafb;
        }
        
        /* محدد العملة في النماذج */
        .currency-selector {
            display: flex;
            gap: 10px;
            margin: 15px 0;
        }
        
        .currency-option {
            flex: 1;
            padding: 15px;
            border: 2px solid #e5e7eb;
            border-radius: 10px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        .currency-option:hover {
            border-color: var(--primary);
            background: #fff9f0;
        }
        
        .currency-option.selected {
            border-color: var(--primary);
            background: linear-gradient(135deg, #fff9f0, #fef3e2);
            font-weight: 700;
        }
        
        .currency-option i {
            font-size: 24px;
            display: block;
            margin-bottom: 8px;
        }
        
        /* إحصائيات العملات */
        .currency-stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        
        .currency-stat-card {
            background: white;
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            padding: 20px;
            transition: all 0.3s;
        }
        
        .currency-stat-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        
        .currency-stat-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 2px solid #f3f4f6;
        }
        
        .currency-stat-icon {
            width: 48px;
            height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 12px;
            font-size: 24px;
            color: white;
        }
        
        .currency-stat-info h4 {
            margin: 0;
            font-size: 16px;
            color: #1f2937;
        }
        
        .currency-stat-info p {
            margin: 0;
            font-size: 12px;
            color: #6b7280;
        }
        
        .currency-stat-details {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        
        .currency-stat-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 13px;
        }
        
        .currency-stat-row span {
            color: #6b7280;
        }
        
        .currency-stat-row strong {
            color: #1f2937;
            font-size: 14px;
        }
        
        /* محول العملات */
        .currency-converter {
            background: white;
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            padding: 25px;
            margin: 20px 0;
        }
        
        .converter-inputs {
            display: grid;
            grid-template-columns: 1fr auto 1fr;
            gap: 20px;
            align-items: end;
        }
        
        .converter-input-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        
        .converter-exchange-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            color: var(--primary);
            padding-bottom: 10px;
        }
        
        .converter-result {
            margin-top: 20px;
            padding: 20px;
            background: linear-gradient(135deg, #fff9f0, #fef3e2);
            border-radius: 10px;
            text-align: center;
        }
        
        .converter-result h3 {
            margin: 0;
            font-size: 28px;
            color: var(--primary);
        }
        
        /* استجابة للشاشات الصغيرة */
        @media (max-width: 768px) {
            .multi-currency-display,
            .currency-stats-grid {
                grid-template-columns: 1fr;
            }
            
            .converter-inputs {
                grid-template-columns: 1fr;
            }
            
            .converter-exchange-icon {
                transform: rotate(90deg);
            }
            
            .currency-selector {
                flex-direction: column;
            }
        }
    `;
    
    document.head.appendChild(style);
}

// ========================================
// تهيئة نظام العملات
// ========================================
function initCurrencySystem() {
    // إضافة الأنماط
    addCurrencyStyles();
    
    // ترحيل البيانات القديمة
    migrateCurrencyData();
    
    // التأكد من وجود الإعدادات الافتراضية
    const settings = getData('settings') || {};
    if (!settings.defaultCurrency) {
        settings.defaultCurrency = 'YER';
        saveData('settings', settings);
    }
    if (!settings.exchangeRates) {
        settings.exchangeRates = DEFAULT_EXCHANGE_RATES;
        saveData('settings', settings);
    }
    
    console.log('✅ تم تهيئة نظام العملات المتعددة');
}

// تهيئة عند تحميل الصفحة
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCurrencySystem);
} else {
    initCurrencySystem();
}
