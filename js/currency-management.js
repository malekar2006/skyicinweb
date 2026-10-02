// ========================================
// إدارة العملات المتقدمة
// Advanced Currency Management
// ========================================

// تحميل العملات من LocalStorage
function loadCurrenciesFromStorage() {
    const saved = localStorage.getItem('custom_currencies');
    if (saved) {
        try {
            const custom = JSON.parse(saved);
            // دمج العملات المخصصة مع العملات الافتراضية
            Object.assign(CURRENCIES, custom);
        } catch (e) {
            console.error('خطأ في تحميل العملات المخصصة:', e);
        }
    }
}

// حفظ العملات في LocalStorage
function saveCurrenciesToStorage() {
    try {
        // حفظ فقط العملات المخصصة (غير YER, SAR, USD)
        const defaultCodes = ['YER', 'SAR', 'USD'];
        const custom = {};
        Object.entries(CURRENCIES).forEach(([code, currency]) => {
            if (!defaultCodes.includes(code)) {
                custom[code] = currency;
            }
        });
        localStorage.setItem('custom_currencies', JSON.stringify(custom));
        return true;
    } catch (e) {
        console.error('خطأ في حفظ العملات:', e);
        return false;
    }
}

// صفحة إدارة العملات
function loadCurrencyManagement() {
    const content = document.getElementById('content');
    
    content.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">
                    <i class="fas fa-coins"></i>
                    إدارة العملات
                </h3>
                <button class="btn btn-primary" onclick="showAddCurrencyModal()">
                    <i class="fas fa-plus"></i>
                    إضافة عملة جديدة
                </button>
            </div>
            
            <div style="padding: 20px;">
                <div class="table-responsive">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>الرمز</th>
                                <th>الاسم</th>
                                <th>الرمز المختصر</th>
                                <th>سعر الصرف (مقابل ر.ي)</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody id="currenciesTableBody">
                            ${renderCurrenciesTable()}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        
        <!-- نموذج إضافة/تعديل عملة -->
        <div id="currencyModal" class="modal">
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h3 id="currencyModalTitle">إضافة عملة جديدة</h3>
                    <button class="close-btn" onclick="hideModal('currencyModal')">&times;</button>
                </div>
                <form id="currencyForm" onsubmit="saveCurrency(event)">
                    <div class="modal-body">
                        <input type="hidden" id="currencyEditMode" value="0">
                        <input type="hidden" id="currencyOriginalCode">
                        
                        <div class="form-group">
                            <label>رمز العملة (مثل: EUR, GBP) *</label>
                            <input type="text" id="currencyCode" class="form-control" 
                                   required maxlength="3" pattern="[A-Z]{3}"
                                   style="text-transform: uppercase;"
                                   placeholder="مثال: EUR">
                            <small class="form-text">3 أحرف إنجليزية كبيرة فقط</small>
                        </div>
                        
                        <div class="form-group">
                            <label>اسم العملة بالعربية *</label>
                            <input type="text" id="currencyNameAr" class="form-control" 
                                   required placeholder="مثال: يورو">
                        </div>
                        
                        <div class="form-group">
                            <label>اسم العملة بالإنجليزية *</label>
                            <input type="text" id="currencyNameEn" class="form-control" 
                                   required placeholder="Example: Euro">
                        </div>
                        
                        <div class="form-group">
                            <label>الرمز (مثل: €, £) *</label>
                            <input type="text" id="currencySymbol" class="form-control" 
                                   required maxlength="3" placeholder="€">
                        </div>
                        
                        <div class="form-group">
                            <label>سعر الصرف مقابل الريال اليمني *</label>
                            <input type="number" id="currencyRate" class="form-control" 
                                   required min="0" step="0.01" placeholder="1">
                            <small class="form-text">كم ريال يمني = 1 وحدة من هذه العملة</small>
                        </div>
                        
                        <div class="form-group">
                            <label>عدد الخانات العشرية</label>
                            <select id="currencyDecimals" class="form-control">
                                <option value="0">0 (بدون كسور)</option>
                                <option value="2" selected>2</option>
                                <option value="3">3</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="modal-footer">
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i>
                            حفظ
                        </button>
                        <button type="button" class="btn btn-secondary" onclick="hideModal('currencyModal')">
                            إلغاء
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

// عرض جدول العملات
function renderCurrenciesTable() {
    let html = '';
    Object.entries(CURRENCIES).forEach(([code, currency]) => {
        const isDefault = ['YER', 'SAR', 'USD'].includes(code);
        html += `
            <tr>
                <td><strong>${code}</strong></td>
                <td>${currency.name}</td>
                <td><span style="font-size: 18px;">${currency.symbol}</span></td>
                <td>${currency.rate.toFixed(2)}</td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="editCurrency('${code}')" 
                            title="تعديل">
                        <i class="fas fa-edit"></i>
                    </button>
                    ${!isDefault ? `
                        <button class="btn btn-sm btn-danger" onclick="deleteCurrency('${code}')" 
                                title="حذف">
                            <i class="fas fa-trash"></i>
                        </button>
                    ` : '<span style="color: #999; font-size: 12px;">افتراضية</span>'}
                </td>
            </tr>
        `;
    });
    return html;
}

// إظهار نموذج إضافة عملة
function showAddCurrencyModal() {
    document.getElementById('currencyModalTitle').textContent = 'إضافة عملة جديدة';
    document.getElementById('currencyEditMode').value = '0';
    document.getElementById('currencyForm').reset();
    document.getElementById('currencyCode').disabled = false;
    showModal('currencyModal');
}

// تعديل عملة
function editCurrency(code) {
    const currency = CURRENCIES[code];
    if (!currency) return;
    
    document.getElementById('currencyModalTitle').textContent = 'تعديل العملة';
    document.getElementById('currencyEditMode').value = '1';
    document.getElementById('currencyOriginalCode').value = code;
    document.getElementById('currencyCode').value = code;
    document.getElementById('currencyCode').disabled = true;
    document.getElementById('currencyNameAr').value = currency.name;
    document.getElementById('currencyNameEn').value = currency.nameEn || currency.name;
    document.getElementById('currencySymbol').value = currency.symbol;
    document.getElementById('currencyRate').value = currency.rate;
    document.getElementById('currencyDecimals').value = currency.decimals || 2;
    
    showModal('currencyModal');
}

// حفظ العملة
function saveCurrency(event) {
    event.preventDefault();
    
    const editMode = document.getElementById('currencyEditMode').value === '1';
    const originalCode = document.getElementById('currencyOriginalCode').value;
    const code = document.getElementById('currencyCode').value.toUpperCase();
    const nameAr = document.getElementById('currencyNameAr').value;
    const nameEn = document.getElementById('currencyNameEn').value;
    const symbol = document.getElementById('currencySymbol').value;
    const rate = parseFloat(document.getElementById('currencyRate').value);
    const decimals = parseInt(document.getElementById('currencyDecimals').value);
    
    // التحقق من عدم وجود العملة (في حالة الإضافة)
    if (!editMode && CURRENCIES[code]) {
        alert('هذا الرمز موجود بالفعل! استخدم رمز آخر.');
        return;
    }
    
    // حفظ العملة
    CURRENCIES[code] = {
        code: code,
        name: nameAr,
        nameEn: nameEn,
        symbol: symbol,
        symbolEn: symbol,
        rate: rate,
        decimals: decimals
    };
    
    // حفظ في LocalStorage
    if (saveCurrenciesToStorage()) {
        hideModal('currencyModal');
        showAlert(editMode ? 'تم تحديث العملة بنجاح' : 'تم إضافة العملة بنجاح', 'success');
        loadCurrencyManagement();
    } else {
        showAlert('حدث خطأ في الحفظ', 'error');
    }
}

// حذف عملة
function deleteCurrency(code) {
    // منع حذف العملات الافتراضية
    if (['YER', 'SAR', 'USD'].includes(code)) {
        alert('لا يمكن حذف العملات الافتراضية!');
        return;
    }
    
    if (!confirm(`هل أنت متأكد من حذف عملة ${CURRENCIES[code].name}؟`)) {
        return;
    }
    
    delete CURRENCIES[code];
    
    if (saveCurrenciesToStorage()) {
        showAlert('تم حذف العملة بنجاح', 'success');
        loadCurrencyManagement();
    } else {
        showAlert('حدث خطأ في الحذف', 'error');
    }
}

// تهيئة النظام - تحميل العملات المخصصة
document.addEventListener('DOMContentLoaded', function() {
    loadCurrenciesFromStorage();
});
