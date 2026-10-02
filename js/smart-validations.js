// ========================================
// نظام التحققات الذكية والتنبيهات
// ========================================

/**
 * نظام شامل للتحقق من العمليات ومنع الأخطاء
 * يتضمن: التحقق من القيم السالبة، التحقق من الرصيد، التنبيهات الذكية
 */

// ========================================
// 1. التحقق من القيم الموجبة ومنع السالبة
// ========================================

/**
 * منع إدخال قيم سالبة في حقول المبالغ
 * @param {string} inputId - معرف حقل الإدخال
 */
function preventNegativeValues(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;

    // منع الأحرف السالبة
    input.addEventListener('keypress', function(e) {
        if (e.key === '-' || e.key === 'e' || e.key === 'E') {
            e.preventDefault();
            showWarning('لا يمكن إدخال قيم سالبة');
        }
    });

    // التحقق عند تغيير القيمة
    input.addEventListener('change', function() {
        const value = parseFloat(this.value);
        if (value < 0) {
            this.value = 0;
            showWarning('تم تصحيح القيمة السالبة إلى صفر');
        }
    });

    // إضافة السمة min="0"
    input.setAttribute('min', '0');
}

/**
 * التحقق من مجموعة حقول الأرقام
 * @param {Array} inputIds - قائمة معرفات حقول الإدخال
 */
function validateNumberFields(inputIds) {
    inputIds.forEach(inputId => {
        preventNegativeValues(inputId);
    });
}

// ========================================
// 2. التحقق من الرصيد حسب العملة
// ========================================

/**
 * التحقق من كفاية الرصيد بعملة معينة
 * @param {number} amount - المبلغ المطلوب
 * @param {string} currency - العملة (YER, SAR, USD)
 * @param {string} accountType - نوع الحساب (cash, bank)
 * @returns {Object} - نتيجة التحقق {sufficient: boolean, current: number, required: number}
 */
function checkBalanceByCurrency(amount, currency, accountType = 'cash') {
    try {
        // تحديد رقم الحساب
        const accountId = accountType === 'cash' ? '1111' : '1112';
        
        // الحصول على الرصيد الحالي بالعملة المحددة
        const currentBalance = getAccountBalanceInCurrency(accountId, currency);
        
        return {
            sufficient: currentBalance >= amount,
            current: currentBalance,
            required: amount,
            difference: currentBalance - amount,
            currency: currency
        };
    } catch (error) {
        console.error('❌ خطأ في التحقق من الرصيد:', error);
        return {
            sufficient: false,
            current: 0,
            required: amount,
            difference: -amount,
            currency: currency
        };
    }
}

/**
 * عرض رسالة تحذير عند عدم كفاية الرصيد
 * @param {Object} checkResult - نتيجة التحقق من checkBalanceByCurrency
 */
function showInsufficientBalanceWarning(checkResult) {
    const currencyNames = {
        YER: 'ريال يمني',
        SAR: 'ريال سعودي',
        USD: 'دولار أمريكي'
    };

    const message = `
        <div style="text-align: center; padding: 20px;">
            <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #f44336; margin-bottom: 15px;"></i>
            <h3 style="color: #f44336; margin-bottom: 10px;">رصيد غير كافٍ</h3>
            <p style="font-size: 16px; margin-bottom: 20px;">
                العملة: <strong>${currencyNames[checkResult.currency]}</strong>
            </p>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span>الرصيد الحالي:</span>
                    <strong>${formatCurrency(checkResult.current)}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span>المبلغ المطلوب:</span>
                    <strong style="color: #f44336;">${formatCurrency(checkResult.required)}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; border-top: 2px solid #ddd; padding-top: 10px;">
                    <span>النقص:</span>
                    <strong style="color: #f44336;">${formatCurrency(Math.abs(checkResult.difference))}</strong>
                </div>
            </div>
            <p style="color: #666;">يرجى التأكد من توفر الرصيد الكافي بنفس العملة المختارة</p>
        </div>
    `;

    showCustomAlert(message, 'warning');
}

/**
 * الحصول على رصيد حساب بعملة محددة
 * @param {string} accountId - رقم الحساب
 * @param {string} currency - العملة
 * @returns {number} - الرصيد
 */
function getAccountBalanceInCurrency(accountId, currency) {
    const journalEntries = getData('journal_entries') || [];
    let balance = 0;

    journalEntries.forEach(entry => {
        // فقط القيود بنفس العملة
        if (entry.currency === currency) {
            entry.items.forEach(item => {
                if (item.account_id === accountId) {
                    balance += (item.debit || 0) - (item.credit || 0);
                }
            });
        }
    });

    return balance;
}

// ========================================
// 3. نظام التنبيهات الذكية للعمليات المترابطة
// ========================================

/**
 * التحقق من العمليات المترابطة وتنبيه المستخدم
 * @param {string} operationType - نوع العملية (invoice, voucher, booking)
 * @param {Object} data - بيانات العملية
 */
function checkRelatedOperations(operationType, data) {
    const alerts = [];

    switch (operationType) {
        case 'invoice':
            // تحقق من وجود عميل/مورد
            if (!data.customer_id && !data.supplier_id) {
                alerts.push({
                    type: 'warning',
                    message: 'لم يتم تحديد عميل أو مورد. يُنصح بتحديد الطرف المعني.',
                    action: 'تحديد الآن',
                    actionFn: () => focusField(data.type === 'sales' ? 'invoiceCustomer' : 'invoiceSupplier')
                });
            }

            // تحقق من المبلغ
            if (!data.total || data.total === 0) {
                alerts.push({
                    type: 'error',
                    message: 'المبلغ الإجمالي يجب أن يكون أكبر من صفر.',
                    action: 'إضافة بنود',
                    actionFn: () => focusField('invoiceItems')
                });
            }

            // تحقق من الرصيد في حالة الدفع نقداً
            if (data.payment_type === 'cash' && data.type === 'purchase') {
                const check = checkBalanceByCurrency(data.total, data.currency, 'cash');
                if (!check.sufficient) {
                    alerts.push({
                        type: 'error',
                        message: `رصيد الصندوق غير كافٍ. الرصيد: ${formatCurrency(check.current)}، المطلوب: ${formatCurrency(check.required)}`,
                        action: 'عرض التفاصيل',
                        actionFn: () => showInsufficientBalanceWarning(check)
                    });
                }
            }

            // تنبيه عن الترحيل التلقائي
            if (data.payment_type === 'credit') {
                alerts.push({
                    type: 'info',
                    message: 'سيتم إنشاء قيد محاسبي تلقائياً عند الحفظ.',
                    action: null
                });
            }
            break;

        case 'voucher':
            // تحقق من الطرف
            if (!data.reference_id && data.reference_type !== 'other') {
                alerts.push({
                    type: 'warning',
                    message: 'يُنصح بتحديد الطرف المعني (عميل أو مورد).',
                    action: null
                });
            }

            // تحقق من الرصيد في سندات الصرف
            if (data.type === 'payment') {
                const accountType = data.payment_method === 'cash' ? 'cash' : 'bank';
                const check = checkBalanceByCurrency(data.amount, data.currency, accountType);
                if (!check.sufficient) {
                    alerts.push({
                        type: 'error',
                        message: `رصيد ${accountType === 'cash' ? 'الصندوق' : 'البنك'} غير كافٍ.`,
                        action: 'عرض التفاصيل',
                        actionFn: () => showInsufficientBalanceWarning(check)
                    });
                }
            }

            // تنبيه عن القيد التلقائي
            alerts.push({
                type: 'info',
                message: 'سيتم إنشاء قيد محاسبي تلقائياً عند الحفظ.',
                action: null
            });
            break;

        case 'booking':
            // تحقق من العميل
            if (!data.customer_id) {
                alerts.push({
                    type: 'error',
                    message: 'يجب تحديد العميل.',
                    action: 'تحديد الآن',
                    actionFn: () => focusField('bookingCustomer')
                });
            }

            // تحقق من المبالغ
            if (data.paid > data.amount) {
                alerts.push({
                    type: 'error',
                    message: 'المبلغ المدفوع لا يمكن أن يكون أكبر من المبلغ الإجمالي.',
                    action: null
                });
            }

            // تنبيه عن إنشاء فاتورة
            if (data.createInvoice) {
                alerts.push({
                    type: 'info',
                    message: 'سيتم إنشاء فاتورة تلقائياً مع الحجز.',
                    action: null
                });
            }

            // تنبيه عن الرصيد المتبقي
            if (data.amount - data.paid > 0) {
                alerts.push({
                    type: 'warning',
                    message: `المبلغ المتبقي: ${formatCurrency(data.amount - data.paid)}. تذكر تحصيله لاحقاً.`,
                    action: null
                });
            }
            break;

        case 'journal':
            // تحقق من توازن القيد
            const totalDebit = data.items.reduce((sum, item) => sum + (item.debit || 0), 0);
            const totalCredit = data.items.reduce((sum, item) => sum + (item.credit || 0), 0);
            
            if (Math.abs(totalDebit - totalCredit) > 0.01) {
                alerts.push({
                    type: 'error',
                    message: `القيد غير متوازن. المدين: ${formatCurrency(totalDebit)}، الدائن: ${formatCurrency(totalCredit)}`,
                    action: 'تصحيح',
                    actionFn: () => focusField('journalItems')
                });
            }

            // تحقق من وجود بنود
            if (!data.items || data.items.length < 2) {
                alerts.push({
                    type: 'error',
                    message: 'القيد يجب أن يحتوي على بندين على الأقل.',
                    action: 'إضافة بنود',
                    actionFn: () => focusField('journalItems')
                });
            }
            break;
    }

    // عرض التنبيهات إذا وجدت
    if (alerts.length > 0) {
        showSmartAlerts(alerts);
        return false; // إيقاف العملية
    }

    return true; // السماح بالمتابعة
}

/**
 * عرض التنبيهات الذكية
 * @param {Array} alerts - قائمة التنبيهات
 */
function showSmartAlerts(alerts) {
    let html = `
        <div class="modal-overlay" onclick="closeSmartAlerts()">
            <div class="modal-content" onclick="event.stopPropagation()" style="max-width: 600px;">
                <div class="modal-header">
                    <h3><i class="fas fa-bell"></i> تنبيهات العملية</h3>
                    <button onclick="closeSmartAlerts()" class="close-btn">×</button>
                </div>
                <div class="modal-body" style="max-height: 400px; overflow-y: auto;">
    `;

    alerts.forEach(alert => {
        const iconClass = {
            error: 'fas fa-times-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        }[alert.type];

        const colorClass = {
            error: 'danger',
            warning: 'warning',
            info: 'info'
        }[alert.type];

        html += `
            <div class="alert alert-${colorClass}" style="margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
                <i class="${iconClass}" style="font-size: 24px;"></i>
                <div style="flex: 1;">
                    <p style="margin: 0;">${alert.message}</p>
                    ${alert.action ? `
                        <button class="btn btn-sm btn-${colorClass}" onclick="${alert.actionFn ? alert.actionFn.name + '()' : ''}" style="margin-top: 8px;">
                            ${alert.action}
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    });

    html += `
                </div>
                <div class="modal-footer">
                    <button onclick="closeSmartAlerts()" class="btn btn-secondary">إغلاق</button>
                </div>
            </div>
        </div>
    `;

    const modal = document.createElement('div');
    modal.id = 'smartAlertsModal';
    modal.innerHTML = html;
    document.body.appendChild(modal);
}

function closeSmartAlerts() {
    const modal = document.getElementById('smartAlertsModal');
    if (modal) modal.remove();
}

function focusField(fieldId) {
    closeSmartAlerts();
    setTimeout(() => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.focus();
            field.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 300);
}

// ========================================
// 4. دوال مساعدة للتنبيهات
// ========================================

function showWarning(message) {
    showAlert(message, 'warning');
}

function showCustomAlert(html, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.innerHTML = html;
    alertDiv.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        min-width: 300px;
        max-width: 500px;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(alertDiv);

    setTimeout(() => {
        alertDiv.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => alertDiv.remove(), 300);
    }, 5000);
}

// ========================================
// 5. التهيئة التلقائية
// ========================================

/**
 * تهيئة حقول المبالغ تلقائياً عند تحميل النماذج
 */
function initializeValidations() {
    // حقول المبالغ الشائعة
    const amountFields = [
        'invoiceAmount', 'invoiceDiscount', 'invoiceTax', 'invoiceTotal',
        'voucherAmount',
        'bookingAmount', 'bookingPaid',
        'itemPrice', 'itemQuantity',
        'servicePriceYER', 'servicePriceSAR', 'servicePriceUSD'
    ];

    amountFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            preventNegativeValues(fieldId);
        }
    });
}

// تطبيق التهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initializeValidations, 1000);
});

// ========================================
// 6. تصدير الدوال
// ========================================

window.preventNegativeValues = preventNegativeValues;
window.validateNumberFields = validateNumberFields;
window.checkBalanceByCurrency = checkBalanceByCurrency;
window.showInsufficientBalanceWarning = showInsufficientBalanceWarning;
window.getAccountBalanceInCurrency = getAccountBalanceInCurrency;
window.checkRelatedOperations = checkRelatedOperations;
window.showSmartAlerts = showSmartAlerts;
window.closeSmartAlerts = closeSmartAlerts;
window.initializeValidations = initializeValidations;

console.log('✓ نظام التحققات الذكية والتنبيهات جاهز');
