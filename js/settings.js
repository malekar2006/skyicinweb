// وحدة الإعدادات
function loadSettings() {
    const content = document.getElementById('content');
    const settings = getData('settings') || {};
    const defaultCurrency = getDefaultCurrency();
    const exchangeRates = getExchangeRates();
    const currencyStats = getCurrencyStats();
    
    content.innerHTML = `
        <div class="settings-container">
            <!-- معلومات الشركة -->
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title"><i class="fas fa-building"></i> معلومات الشركة</h3>
                </div>
                <div class="card-body">
                    <div class="info-grid">
                        <div class="info-item">
                            <i class="fas fa-user-tie"></i>
                            <div>
                                <label>الاسم</label>
                                <p>${COMPANY_INFO.name}</p>
                            </div>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-map-marker-alt"></i>
                            <div>
                                <label>الموقع</label>
                                <p>${COMPANY_INFO.location}</p>
                            </div>
                        </div>
                    </div>
                    <div class="info-item full-width">
                        <i class="fas fa-phone-office"></i>
                        <div>
                            <label>هاتف/جوال</label>
                            <p style="direction: ltr; text-align: right;">${COMPANY_INFO.phones.office.join(' - ')}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- إعدادات العملات -->
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title"><i class="fas fa-coins"></i> إدارة العملات المتعددة</h3>
                    <div style="display: flex; gap: 10px;">
                        <button class="btn btn-sm btn-success" onclick="loadCurrencyManagement()">
                            <i class="fas fa-cog"></i> إدارة العملات
                        </button>
                        <button class="btn btn-sm btn-primary" onclick="showCurrencyConverter()">
                            <i class="fas fa-exchange-alt"></i> محول العملات
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    <!-- العملة الافتراضية -->
                    <div class="form-group">
                        <label><i class="fas fa-star"></i> العملة الافتراضية للنظام</label>
                        <div style="display: flex; gap: 10px; align-items: center;">
                            ${createCurrencySelect(defaultCurrency, 'defaultCurrency')}
                            <button class="btn btn-primary" onclick="updateDefaultCurrency()">
                                <i class="fas fa-save"></i> حفظ
                            </button>
                        </div>
                        <small class="form-text">سيتم استخدام هذه العملة افتراضياً في جميع المعاملات</small>
                    </div>
                    
                    <!-- أسعار الصرف -->
                    <div class="exchange-rates-section">
                        <h4><i class="fas fa-chart-line"></i> أسعار الصرف (مقابل الريال اليمني)</h4>
                        <div class="exchange-rates-grid">
                            ${Object.values(CURRENCIES).map(currency => `
                                <div class="exchange-rate-card" style="border-color: ${currency.color}">
                                    <div class="exchange-rate-header" style="background: ${currency.color}">
                                        <i class="fas fa-${currency.icon}"></i>
                                        <span>${currency.name}</span>
                                    </div>
                                    <div class="exchange-rate-body">
                                        ${currency.code === 'YER' ? `
                                            <div class="exchange-rate-value">
                                                <span>1.00</span>
                                                <small>العملة الأساسية</small>
                                            </div>
                                        ` : `
                                            <div class="form-group" style="margin: 0;">
                                                <label>1 ${currency.symbol} =</label>
                                                <div style="display: flex; gap: 5px; align-items: center;">
                                                    <input type="number" 
                                                           class="form-control" 
                                                           id="rate_${currency.code}"
                                                           value="${exchangeRates[currency.code] || DEFAULT_EXCHANGE_RATES[currency.code]}"
                                                           step="0.01"
                                                           min="0">
                                                    <span>ر.ي</span>
                                                </div>
                                            </div>
                                        `}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        <div style="text-align: center; margin-top: 15px;">
                            <button class="btn btn-success" onclick="updateExchangeRates()">
                                <i class="fas fa-save"></i> حفظ أسعار الصرف
                            </button>
                            <button class="btn btn-secondary" onclick="resetExchangeRates()">
                                <i class="fas fa-undo"></i> إعادة تعيين الأسعار الافتراضية
                            </button>
                        </div>
                    </div>
                    
                    <!-- إحصائيات العملات -->
                    <div class="currency-statistics">
                        <h4><i class="fas fa-chart-pie"></i> إحصائيات العملات</h4>
                        <div class="currency-stats-grid">
                            ${Object.entries(currencyStats).map(([code, stats]) => {
                                const currency = CURRENCIES[code];
                                return `
                                    <div class="currency-stat-card">
                                        <div class="currency-stat-header">
                                            <div class="currency-stat-icon" style="background: ${currency.color}">
                                                <i class="fas fa-${currency.icon}"></i>
                                            </div>
                                            <div class="currency-stat-info">
                                                <h4>${currency.name}</h4>
                                                <p>${currency.symbol} ${currency.nameEn}</p>
                                            </div>
                                        </div>
                                        <div class="currency-stat-details">
                                            <div class="currency-stat-row">
                                                <span><i class="fas fa-book"></i> عدد الحسابات</span>
                                                <strong>${stats.accounts}</strong>
                                            </div>
                                            <div class="currency-stat-row">
                                                <span><i class="fas fa-balance-scale"></i> إجمالي الأرصدة</span>
                                                <strong>${formatCurrency(stats.totalBalance, code)}</strong>
                                            </div>
                                            <div class="currency-stat-row">
                                                <span><i class="fas fa-file-invoice"></i> عدد الفواتير</span>
                                                <strong>${stats.invoices}</strong>
                                            </div>
                                            <div class="currency-stat-row">
                                                <span><i class="fas fa-dollar-sign"></i> إجمالي الفواتير</span>
                                                <strong>${formatCurrency(stats.invoicesTotal, code)}</strong>
                                            </div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- إعدادات النظام -->
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title"><i class="fas fa-cog"></i> إعدادات النظام</h3>
                </div>
                <div class="card-body">
                    <div class="form-group">
                        <label>السنة المالية</label>
                        <input type="number" 
                               class="form-control" 
                               id="fiscalYear"
                               value="${settings.fiscalYear || new Date().getFullYear()}"
                               min="2000" 
                               max="2100">
                    </div>
                    <button class="btn btn-primary" onclick="updateFiscalYear()">
                        <i class="fas fa-save"></i> حفظ السنة المالية
                    </button>
                </div>
            </div>
            
            <!-- النسخ الاحتياطي -->
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title"><i class="fas fa-database"></i> النسخ الاحتياطي</h3>
                </div>
                <div class="card-body">
                    <div class="backup-buttons">
                        <button class="btn btn-primary" onclick="exportData()">
                            <i class="fas fa-download"></i> تصدير البيانات
                        </button>
                        <button class="btn btn-success" onclick="document.getElementById('importFile').click()">
                            <i class="fas fa-upload"></i> استيراد البيانات
                        </button>
                    </div>
                    <input type="file" id="importFile" style="display: none;" onchange="importData(this)" accept=".json">
                </div>
            </div>
            
            <!-- إدارة البيانات -->
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title"><i class="fas fa-exclamation-triangle"></i> إدارة البيانات</h3>
                </div>
                <div class="card-body">
                    <div class="alert alert-warning">
                        <i class="fas fa-exclamation-circle"></i>
                        <strong>تحذير:</strong> حذف البيانات إجراء لا يمكن التراجع عنه
                    </div>
                    <button class="btn btn-danger" onclick="confirmResetData()">
                        <i class="fas fa-trash"></i> حذف جميع البيانات وإعادة التهيئة
                    </button>
                </div>
            </div>
        </div>
    `;
    
    addSettingsStyles();
}

// تحديث العملة الافتراضية
function updateDefaultCurrency() {
    const select = document.getElementById('defaultCurrency');
    const currency = select.value;
    
    if (setDefaultCurrency(currency)) {
        loadSettings(); // إعادة تحميل الصفحة
    }
}

// تحديث أسعار الصرف
function updateExchangeRates() {
    const rates = {
        YER: 1
    };
    
    Object.keys(CURRENCIES).forEach(code => {
        if (code !== 'YER') {
            const input = document.getElementById(`rate_${code}`);
            if (input) {
                rates[code] = parseFloat(input.value) || DEFAULT_EXCHANGE_RATES[code];
            }
        }
    });
    
    saveExchangeRates(rates);
    showAlert('تم تحديث أسعار الصرف بنجاح', 'success');
}

// إعادة تعيين أسعار الصرف الافتراضية
function resetExchangeRates() {
    if (confirm('هل تريد إعادة تعيين أسعار الصرف إلى القيم الافتراضية؟')) {
        saveExchangeRates(DEFAULT_EXCHANGE_RATES);
        showAlert('تم إعادة تعيين أسعار الصرف', 'success');
        loadSettings();
    }
}

// تحديث السنة المالية
function updateFiscalYear() {
    const input = document.getElementById('fiscalYear');
    const year = parseInt(input.value);
    
    if (year < 2000 || year > 2100) {
        showAlert('السنة المالية غير صحيحة', 'danger');
        return;
    }
    
    const settings = getData('settings') || {};
    settings.fiscalYear = year;
    saveData('settings', settings);
    
    showAlert('تم تحديث السنة المالية بنجاح', 'success');
}

// عرض محول العملات
function showCurrencyConverter() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h3><i class="fas fa-exchange-alt"></i> محول العملات</h3>
                <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
            </div>
            <div class="modal-body">
                <div class="currency-converter">
                    <div class="converter-inputs">
                        <div class="converter-input-group">
                            <label>من</label>
                            ${createCurrencySelect('YER', 'fromCurrency')}
                            <input type="number" 
                                   class="form-control" 
                                   id="fromAmount"
                                   value="100"
                                   step="0.01"
                                   min="0"
                                   oninput="performCurrencyConversion()">
                        </div>
                        <div class="converter-exchange-icon">
                            <i class="fas fa-exchange-alt"></i>
                        </div>
                        <div class="converter-input-group">
                            <label>إلى</label>
                            ${createCurrencySelect('USD', 'toCurrency')}
                            <input type="number" 
                                   class="form-control" 
                                   id="toAmount"
                                   readonly
                                   style="background: #f3f4f6;">
                        </div>
                    </div>
                    <div class="converter-result" id="converterResult" style="display: none;">
                        <h3></h3>
                        <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;"></p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
    
    // إضافة مستمعي الأحداث
    document.getElementById('fromCurrency').addEventListener('change', performCurrencyConversion);
    document.getElementById('toCurrency').addEventListener('change', performCurrencyConversion);
    
    // تنفيذ التحويل الأولي
    performCurrencyConversion();
}

// تنفيذ تحويل العملات
function performCurrencyConversion() {
    const fromCurrency = document.getElementById('fromCurrency').value;
    const toCurrency = document.getElementById('toCurrency').value;
    const fromAmount = parseFloat(document.getElementById('fromAmount').value) || 0;
    
    const toAmount = convertCurrency(fromAmount, fromCurrency, toCurrency);
    document.getElementById('toAmount').value = toAmount.toFixed(CURRENCIES[toCurrency].decimals);
    
    const result = document.getElementById('converterResult');
    const rates = getExchangeRates();
    const rate = rates[toCurrency] / rates[fromCurrency];
    
    result.style.display = 'block';
    result.querySelector('h3').textContent = formatCurrency(toAmount, toCurrency);
    result.querySelector('p').textContent = `سعر الصرف: 1 ${CURRENCIES[fromCurrency].symbol} = ${rate.toFixed(4)} ${CURRENCIES[toCurrency].symbol}`;
}

// إضافة أنماط CSS للإعدادات
function addSettingsStyles() {
    if (document.getElementById('settings-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'settings-styles';
    style.textContent = `
        .settings-container {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
            margin-bottom: 15px;
        }
        
        .info-item {
            display: flex;
            gap: 12px;
            align-items: flex-start;
            padding: 12px;
            background: #f9fafb;
            border-radius: 8px;
        }
        
        .info-item.full-width {
            grid-column: 1 / -1;
        }
        
        .info-item i {
            font-size: 20px;
            color: var(--primary);
            margin-top: 2px;
        }
        
        .info-item label {
            font-size: 12px;
            color: #6b7280;
            margin: 0 0 4px 0;
            display: block;
        }
        
        .info-item p {
            margin: 0;
            font-size: 14px;
            font-weight: 600;
            color: #1f2937;
        }
        
        .exchange-rates-section {
            margin-top: 25px;
            padding-top: 25px;
            border-top: 2px solid #e5e7eb;
        }
        
        .exchange-rates-section h4 {
            margin: 0 0 20px 0;
            display: flex;
            align-items: center;
            gap: 10px;
            color: #1f2937;
        }
        
        .exchange-rates-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 15px;
        }
        
        .exchange-rate-card {
            border: 2px solid #e5e7eb;
            border-radius: 10px;
            overflow: hidden;
            transition: all 0.3s;
        }
        
        .exchange-rate-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        
        .exchange-rate-header {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 12px;
            color: white;
            font-weight: 600;
        }
        
        .exchange-rate-header i {
            font-size: 20px;
        }
        
        .exchange-rate-body {
            padding: 15px;
            background: white;
        }
        
        .exchange-rate-value {
            text-align: center;
            padding: 20px 0;
        }
        
        .exchange-rate-value span {
            display: block;
            font-size: 28px;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 5px;
        }
        
        .exchange-rate-value small {
            color: #6b7280;
            font-size: 12px;
        }
        
        .currency-statistics {
            margin-top: 25px;
            padding-top: 25px;
            border-top: 2px solid #e5e7eb;
        }
        
        .currency-statistics h4 {
            margin: 0 0 20px 0;
            display: flex;
            align-items: center;
            gap: 10px;
            color: #1f2937;
        }
        
        .backup-buttons {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }
        
        .alert {
            padding: 12px 15px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 15px;
        }
        
        .alert-warning {
            background: #fef3e2;
            border: 2px solid #f59e0b;
            color: #92400e;
        }
        
        @media (max-width: 768px) {
            .info-grid,
            .exchange-rates-grid {
                grid-template-columns: 1fr;
            }
            
            .backup-buttons {
                flex-direction: column;
            }
            
            .backup-buttons .btn {
                width: 100%;
            }
        }
    `;
    
    document.head.appendChild(style);
}

function exportData() {
    const data = {
        accounts: getData('accounts'),
        journal_entries: getData('journal_entries'),
        invoices: getData('invoices'),
        vouchers: getData('vouchers'),
        bookings: getData('bookings'),
        customers: getData('customers'),
        suppliers: getData('suppliers'),
        settings: getData('settings')
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `skyicon-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showAlert('تم تصدير البيانات بنجاح', 'success');
}

function importData(input) {
    const file = input.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (confirm('سيتم استبدال جميع البيانات الحالية. هل أنت متأكد؟')) {
                Object.keys(data).forEach(key => {
                    saveData(key, data[key]);
                });
                showAlert('تم استيراد البيانات بنجاح', 'success');
                setTimeout(() => location.reload(), 1500);
            }
        } catch (error) {
            showAlert('خطأ في قراءة الملف', 'danger');
        }
    };
    reader.readAsText(file);
}

function confirmResetData() {
    if (confirm('تحذير! سيتم حذف جميع البيانات. هل أنت متأكد؟')) {
        if (confirm('هذا الإجراء لا يمكن التراجع عنه. تأكيد نهائي؟')) {
            localStorage.clear();
            showAlert('تم حذف جميع البيانات', 'success');
            setTimeout(() => location.reload(), 1500);
        }
    }
}

// عرض إدارة العملات (يتم استدعاؤها من القائمة الجانبية)
function showCurrencySettings() {
    // تحميل صفحة الإعدادات التي تحتوي على إدارة العملات
    loadPage('settings');
    
    // التمرير إلى قسم العملات بعد تحميل الصفحة
    setTimeout(() => {
        const currencySection = document.querySelector('.card:nth-child(2)');
        if (currencySection) {
            currencySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            currencySection.style.animation = 'highlight 2s ease';
        }
    }, 100);
}
