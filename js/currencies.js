/**
 * نظام العملات المتعددة - Sky Icon Travel & Tourism
 * Multi-Currency System
 */

// العملات المتاحة
// ملاحظة: CURRENCIES معرّف في js/app.js - نستخدم ذلك لتجنب التكرار

// أسعار الصرف (مقابل الريال اليمني - العملة الأساسية)
let exchangeRates = {
    YER: 1,           // العملة الأساسية
    SAR: 66.67,       // 1 ريال سعودي = 66.67 ريال يمني
    USD: 250          // 1 دولار = 250 ريال يمني
};

// العملة الافتراضية - الريال اليمني
let defaultCurrency = 'YER';

// تحميل إعدادات العملات
function loadCurrencySettings() {
    const stored = localStorage.getItem('currencySettings');
    if (stored) {
        const settings = JSON.parse(stored);
        defaultCurrency = settings.defaultCurrency || 'YER';
        if (settings.exchangeRates) {
            exchangeRates = { ...exchangeRates, ...settings.exchangeRates };
        }
    } else {
        saveCurrencySettings();
    }
}

// حفظ إعدادات العملات
function saveCurrencySettings() {
    const settings = {
        defaultCurrency,
        exchangeRates
    };
    localStorage.setItem('currencySettings', JSON.stringify(settings));
}

// الحصول على العملة الافتراضية
function getDefaultCurrency() {
    return defaultCurrency;
}

// تعيين العملة الافتراضية
function setDefaultCurrency(currencyCode) {
    if (CURRENCIES[currencyCode]) {
        defaultCurrency = currencyCode;
        saveCurrencySettings();
        return true;
    }
    return false;
}

// الحصول على سعر الصرف
function getExchangeRate(fromCurrency, toCurrency = 'YER') {
    if (fromCurrency === toCurrency) return 1;
    
    // التحويل إلى العملة الأساسية أولاً
    const toBase = exchangeRates[fromCurrency] || 1;
    const fromBase = exchangeRates[toCurrency] || 1;
    
    return toBase / fromBase;
}

// تحديث سعر الصرف
function updateExchangeRate(currencyCode, rate) {
    if (CURRENCIES[currencyCode] && currencyCode !== 'YER') {
        exchangeRates[currencyCode] = parseFloat(rate);
        saveCurrencySettings();
        return true;
    }
    return false;
}

// تحويل المبلغ من عملة إلى أخرى
function convertCurrency(amount, fromCurrency, toCurrency) {
    if (!amount || isNaN(amount)) return 0;
    
    const rate = getExchangeRate(fromCurrency, toCurrency);
    return amount * rate;
}

// تنسيق المبلغ بالعملة
function formatCurrency(amount, currencyCode = null) {
    if (!currencyCode) {
        currencyCode = defaultCurrency;
    }
    
    const currency = CURRENCIES[currencyCode];
    if (!currency) return amount.toString();
    
    const value = parseFloat(amount) || 0;
    const formatted = value.toLocaleString('en-US', {
        useGrouping: false,
        minimumFractionDigits: currency.decimals,
        maximumFractionDigits: currency.decimals
    });
    
    return `${formatted} ${currency.symbol}`;
}

// تنسيق المبلغ بالعملة (إنجليزي)
function formatCurrencyEn(amount, currencyCode = null) {
    if (!currencyCode) {
        currencyCode = defaultCurrency;
    }
    
    const currency = CURRENCIES[currencyCode];
    if (!currency) return amount.toString();
    
    const value = parseFloat(amount) || 0;
    const formatted = value.toLocaleString('en-US', {
        minimumFractionDigits: currency.decimals,
        maximumFractionDigits: currency.decimals
    });
    
    return `${currency.symbolEn} ${formatted}`;
}

// الحصول على معلومات العملة
function getCurrencyInfo(currencyCode) {
    return CURRENCIES[currencyCode] || null;
}

// الحصول على جميع العملات
function getAllCurrencies() {
    return Object.values(CURRENCIES);
}

// عرض صفحة إعدادات العملات
function showCurrencySettings() {
    loadModulePage();
    const mainContent = document.getElementById('mainContent');
    
    mainContent.innerHTML = `
        <div class="page-header">
            <div class="header-content">
                <div>
                    <h1><i class="fas fa-coins"></i> إعدادات العملات</h1>
                    <p>إدارة العملات وأسعار الصرف</p>
                </div>
            </div>
        </div>

        <div class="currency-settings-container">
            <div class="card">
                <div class="card-header">
                    <h3><i class="fas fa-cog"></i> العملة الافتراضية</h3>
                </div>
                <div class="card-body">
                    <div class="form-group">
                        <label>اختر العملة الافتراضية للنظام</label>
                        <select id="defaultCurrencySelect" class="form-control" onchange="handleDefaultCurrencyChange(this.value)">
                            ${Object.entries(CURRENCIES).map(([code, currency]) => `
                                <option value="${code}" ${code === defaultCurrency ? 'selected' : ''}>
                                    ${currency.name}
                                </option>
                            `).join('')}
                        </select>
                        <small class="form-text">العملة الافتراضية التي ستستخدم في جميع العمليات</small>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3><i class="fas fa-exchange-alt"></i> أسعار الصرف</h3>
                    <p class="card-subtitle">مقابل الريال اليمني (العملة الأساسية)</p>
                </div>
                <div class="card-body">
                    <div class="exchange-rates-grid">
                        ${Object.entries(CURRENCIES).map(([code, currency]) => `
                            <div class="exchange-rate-card ${code === 'YER' ? 'base-currency' : ''}">
                                <div class="currency-icon">
                                    <i class="fas fa-${getCurrencyIcon(code)}"></i>
                                </div>
                                <div class="currency-info">
                                    <h4>${currency.name}</h4>
                                    <span class="currency-code">${code}</span>
                                </div>
                                ${code === 'YER' ? `
                                    <div class="exchange-rate-value">
                                        <span class="base-label">العملة الأساسية</span>
                                    </div>
                                ` : `
                                    <div class="exchange-rate-input">
                                        <label>1 ${currency.name} =</label>
                                        <div class="input-with-suffix">
                                            <input 
                                                type="number" 
                                                class="form-control" 
                                                id="rate_${code}"
                                                value="${exchangeRates[code]}"
                                                step="0.01"
                                                min="0"
                                                onchange="handleExchangeRateChange('${code}', this.value)"
                                            >
                                            <span class="input-suffix">ريال يمني</span>
                                        </div>
                                    </div>
                                `}
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="exchange-info-box">
                        <i class="fas fa-info-circle"></i>
                        <div>
                            <strong>ملاحظة:</strong>
                            <p>الريال اليمني هو العملة الأساسية للنظام. جميع الحسابات الداخلية تتم بالريال اليمني ويتم التحويل حسب أسعار الصرف المحددة.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3><i class="fas fa-calculator"></i> حاسبة تحويل العملات</h3>
                </div>
                <div class="card-body">
                    <div class="currency-converter">
                        <div class="converter-row">
                            <div class="converter-input">
                                <label>المبلغ</label>
                                <input 
                                    type="number" 
                                    id="converterAmount" 
                                    class="form-control" 
                                    placeholder="0.00"
                                    oninput="calculateConversion()"
                                >
                            </div>
                            <div class="converter-currency">
                                <label>من</label>
                                <select id="converterFrom" class="form-control" onchange="calculateConversion()">
                                    ${Object.entries(CURRENCIES).map(([code, currency]) => `
                                        <option value="${code}">${currency.name}</option>
                                    `).join('')}
                                </select>
                            </div>
                        </div>
                        
                        <div class="converter-arrow">
                            <i class="fas fa-arrow-down"></i>
                        </div>
                        
                        <div class="converter-row">
                            <div class="converter-result">
                                <label>النتيجة</label>
                                <div class="result-display" id="converterResult">0.00</div>
                            </div>
                            <div class="converter-currency">
                                <label>إلى</label>
                                <select id="converterTo" class="form-control" onchange="calculateConversion()">
                                    ${Object.entries(CURRENCIES).map(([code, currency]) => `
                                        <option value="${code}" ${code === 'SAR' ? 'selected' : ''}>${currency.name}</option>
                                    `).join('')}
                                </select>
                            </div>
                        </div>
                        
                        <div class="converter-rate" id="converterRateDisplay"></div>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3><i class="fas fa-chart-line"></i> ملخص أسعار الصرف</h3>
                </div>
                <div class="card-body">
                    <div class="exchange-summary">
                        ${generateExchangeSummary()}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // تحديث العرض الأولي
    calculateConversion();
}

// الحصول على أيقونة العملة
function getCurrencyIcon(code) {
    const icons = {
        'YER': 'money-bill-wave',
        'SAR': 'coins',
        'USD': 'dollar-sign'
    };
    return icons[code] || 'money-bill';
}

// معالجة تغيير العملة الافتراضية
function handleDefaultCurrencyChange(currencyCode) {
    if (setDefaultCurrency(currencyCode)) {
        if (typeof addNotification === 'function') {
            addNotification('success', 'تم التحديث', `تم تعيين ${CURRENCIES[currencyCode].name} كعملة افتراضية`);
        }
        
        // تسجيل النشاط
        if (typeof recordActivity === 'function') {
            recordActivity('currency_update', `تغيير العملة الافتراضية إلى ${CURRENCIES[currencyCode].name}`);
        }
    }
}

// معالجة تغيير سعر الصرف
function handleExchangeRateChange(currencyCode, rate) {
    if (updateExchangeRate(currencyCode, rate)) {
        if (typeof addNotification === 'function') {
            addNotification('success', 'تم التحديث', `تم تحديث سعر صرف ${CURRENCIES[currencyCode].name}`);
        }
        
        // تسجيل النشاط
        if (typeof recordActivity === 'function') {
            recordActivity('exchange_rate_update', `تحديث سعر صرف ${CURRENCIES[currencyCode].name} إلى ${rate}`);
        }
        
        // إعادة حساب التحويل
        calculateConversion();
        
        // تحديث الملخص
        document.querySelector('.exchange-summary').innerHTML = generateExchangeSummary();
    }
}

// حساب التحويل
function calculateConversion() {
    const amount = parseFloat(document.getElementById('converterAmount').value) || 0;
    const fromCurrency = document.getElementById('converterFrom').value;
    const toCurrency = document.getElementById('converterTo').value;
    
    const result = convertCurrency(amount, fromCurrency, toCurrency);
    
    document.getElementById('converterResult').textContent = formatCurrency(result, toCurrency);
    
    // عرض سعر الصرف
    const rate = getExchangeRate(fromCurrency, toCurrency);
    const rateDisplay = document.getElementById('converterRateDisplay');
    if (rateDisplay) {
        rateDisplay.innerHTML = `
            <i class="fas fa-info-circle"></i>
            سعر الصرف: 1 ${CURRENCIES[fromCurrency].name} = ${rate.toFixed(4)} ${CURRENCIES[toCurrency].name}
        `;
    }
}

// إنشاء ملخص أسعار الصرف
function generateExchangeSummary() {
    const currencies = ['YER', 'SAR', 'USD'];
    let html = '<table class="summary-table"><thead><tr><th></th>';
    
    // رؤوس الأعمدة
    currencies.forEach(code => {
        html += `<th>${CURRENCIES[code].symbol}</th>`;
    });
    html += '</tr></thead><tbody>';
    
    // الصفوف
    currencies.forEach(fromCode => {
        html += `<tr><th>${CURRENCIES[fromCode].symbol}</th>`;
        currencies.forEach(toCode => {
            if (fromCode === toCode) {
                html += '<td class="same-currency">1.00</td>';
            } else {
                const rate = getExchangeRate(fromCode, toCode);
                html += `<td>${rate.toFixed(4)}</td>`;
            }
        });
        html += '</tr>';
    });
    
    html += '</tbody></table>';
    return html;
}

// إنشاء قائمة منسدلة للعملات
function createCurrencySelect(selectedCurrency = null, id = 'currency', includeAll = false) {
    const selected = selectedCurrency || defaultCurrency;
    let options = '';
    
    if (includeAll) {
        options += '<option value="">جميع العملات</option>';
    }
    
    Object.entries(CURRENCIES).forEach(([code, currency]) => {
        options += `<option value="${code}" ${code === selected ? 'selected' : ''}>
            ${currency.name}
        </option>`;
    });
    
    return `<select id="${id}" class="form-control currency-select">${options}</select>`;
}

// تهيئة نظام العملات
function initCurrencies() {
    loadCurrencySettings();
}

// تهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', initCurrencies);
