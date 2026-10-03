// ========================================
// وحدة السندات (قبض وصرف)
// ========================================

function loadVouchers() {
    const content = document.getElementById('content');
    const allVouchers = getData('vouchers') || [];
    
    // تطبيق تصفية العملة
    const vouchers = filterVouchersByCurrency(allVouchers);
    
    const receipts = vouchers.filter(v => v.type === 'receipt');
    const payments = vouchers.filter(v => v.type === 'payment');
    
    // الحصول على العملة المختارة
    const selectedCurrency = getGlobalCurrencyFilter();
    const currencyForDisplay = (selectedCurrency === 'all') ? null : selectedCurrency;
    
    content.innerHTML = `
        <div class="card">
            <div class="card-header">
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                    <h3 class="card-title" style="margin: 0;">
                        <i class="fas fa-receipt"></i>
                        السندات
                    </h3>
                    <div style="display: flex; gap: 10px; align-items: center;">
                        ${generateCurrencyFilterDropdown()}
                        <button class="btn btn-success" onclick="openAddVoucherModal('receipt')">
                            <i class="fas fa-plus"></i>
                            سند قبض
                        </button>
                        <button class="btn btn-danger" onclick="openAddVoucherModal('payment')">
                            <i class="fas fa-plus"></i>
                            سند صرف
                        </button>
                    </div>
                </div>
            </div>
            
            <div style="padding: 20px;">
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon success">
                            <i class="fas fa-arrow-down"></i>
                        </div>
                        <div class="stat-content">
                            <h3>سندات القبض</h3>
                            <div class="stat-value">${receipts.length}</div>
                            <small>${formatCurrency(receipts.reduce((sum, v) => sum + v.amount, 0), currencyForDisplay)}</small>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon danger">
                            <i class="fas fa-arrow-up"></i>
                        </div>
                        <div class="stat-content">
                            <h3>سندات الصرف</h3>
                            <div class="stat-value">${payments.length}</div>
                            <small>${formatCurrency(payments.reduce((sum, v) => sum + v.amount, 0), currencyForDisplay)}</small>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon info">
                            <i class="fas fa-money-bill-wave"></i>
                        </div>
                        <div class="stat-content">
                            <h3>صافي التدفق النقدي</h3>
                            <div class="stat-value">${formatCurrency(
                                receipts.reduce((sum, v) => sum + v.amount, 0) - 
                                payments.reduce((sum, v) => sum + v.amount, 0),
                                currencyForDisplay
                            )}</div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon primary">
                            <i class="fas fa-file-alt"></i>
                        </div>
                        <div class="stat-content">
                            <h3>إجمالي السندات</h3>
                            <div class="stat-value">${vouchers.length}</div>
                        </div>
                    </div>
                </div>
            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th>رقم السند</th>
                            <th>النوع</th>
                            <th>التاريخ</th>
                            <th>نوع العملية</th>
                            <th>العملة</th>
                            <th>المبلغ</th>
                            <th>الطرف</th>
                            <th>طريقة الدفع</th>
                            <th>البيان</th>
                            <th>إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${vouchers.length === 0 ? 
                            '<tr><td colspan="10" style="text-align: center; padding: 40px;">لا توجد سندات</td></tr>' : 
                            vouchers.map(voucher => renderVoucherRow(voucher)).join('')
                        }
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- Add Voucher Modal -->
        <div class="modal" id="voucherModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title" id="voucherModalTitle">سند جديد</h3>
                    <button class="modal-close" onclick="hideModal('voucherModal')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="voucherForm" onsubmit="saveVoucher(event)">
                        <input type="hidden" id="voucherId">
                        <input type="hidden" id="voucherType">
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                            <div class="form-group">
                                <label class="form-label">التاريخ *</label>
                                <input type="date" class="form-control" id="voucherDate" required value="${new Date().toISOString().split('T')[0]}">
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">العملة *</label>
                                <select class="form-control" id="voucherCurrency" required>
                                    ${getCurrencyOptions()}
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">المبلغ *</label>
                            <input type="number" class="form-control" id="voucherAmount" min="0" step="0.01" required>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                            <div class="form-group">
                                <label class="form-label">نوع العملية *</label>
                                <select class="form-control" id="voucherOperationType" required>
                                    <option value="cash">نقداً</option>
                                    <option value="credit">آجل</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">طريقة الدفع *</label>
                                <select class="form-control" id="voucherPaymentMethod" required>
                                    <option value="cash">نقدي</option>
                                    <option value="bank">بنك</option>
                                    <option value="check">شيك</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">الطرف *</label>
                            <select class="form-control" id="voucherReferenceType" required onchange="updateReferenceOptions()">
                                <option value="">اختر نوع الطرف</option>
                                <option value="customer">عميل</option>
                                <option value="supplier">مورد</option>
                                <option value="other">آخر</option>
                            </select>
                        </div>
                        
                        <div class="form-group" id="referenceIdGroup" style="display: none;">
                            <label class="form-label">اختر الطرف *</label>
                            <select class="form-control" id="voucherReferenceId">
                                <option value="">اختر...</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">البيان *</label>
                            <textarea class="form-control" id="voucherDescription" required rows="3"></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="document.getElementById('voucherForm').requestSubmit()">
                        <i class="fas fa-save"></i>
                        حفظ السند
                    </button>
                    <button class="btn btn-secondary" onclick="hideModal('voucherModal')">
                        <i class="fas fa-times"></i>
                        إلغاء
                    </button>
                </div>
            </div>
        </div>
    `;
}

function renderVoucherRow(voucher) {
    const customers = getData('customers') || [];
    const suppliers = getData('suppliers') || [];
    
    let partyName = '-';
    if (voucher.reference_type === 'customer') {
        const customer = customers.find(c => c.id === voucher.reference_id);
        partyName = customer ? customer.name : 'عميل محذوف';
    } else if (voucher.reference_type === 'supplier') {
        const supplier = suppliers.find(s => s.id === voucher.reference_id);
        partyName = supplier ? supplier.name : 'مورد محذوف';
    } else {
        partyName = 'آخر';
    }
    
    const paymentMethodLabels = {
        cash: 'نقدي',
        bank: 'بنك',
        check: 'شيك'
    };
    
    const operationTypeLabels = {
        cash: 'نقداً',
        credit: 'آجل'
    };
    
    const currency = voucher.currency || 'YER';
    
    return `
        <tr>
            <td>${voucher.number}</td>
            <td>
                <span class="badge" style="padding: 5px 10px; border-radius: 4px; background: ${voucher.type === 'receipt' ? 'var(--success-color)' : 'var(--danger-color)'}; color: white;">
                    ${voucher.type === 'receipt' ? 'قبض' : 'صرف'}
                </span>
            </td>
            <td>${formatDateShort(voucher.date)}</td>
            <td>
                <span class="badge" style="padding: 4px 8px; border-radius: 4px; background: ${voucher.operation_type === 'cash' ? 'var(--success-color)' : 'var(--warning-color)'}; color: white; font-size: 0.85em;">
                    ${operationTypeLabels[voucher.operation_type] || 'نقداً'}
                </span>
            </td>
            <td><span class="badge" style="padding: 4px 8px; border-radius: 4px; background: var(--primary-color); color: white; font-size: 0.85em;">${CURRENCIES[currency].name}</span></td>
            <td style="font-weight: bold; color: ${voucher.type === 'receipt' ? 'var(--success-color)' : 'var(--danger-color)'};">
                ${formatCurrency(voucher.amount, currency)}
            </td>
            <td>${partyName}</td>
            <td>${paymentMethodLabels[voucher.payment_method]}</td>
            <td>${voucher.description}</td>
            <td>
                <div class="action-btns">
                    <button class="btn btn-sm btn-view" onclick="viewVoucher('${voucher.id}')" title="عرض">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-print" onclick="printVoucher('${voucher.id}')" title="طباعة">
                        <i class="fas fa-print"></i>
                    </button>
                    <button class="btn btn-sm btn-delete" onclick="deleteVoucher('${voucher.id}')" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `;
}

function openAddVoucherModal(type) {
    document.getElementById('voucherForm').reset();
    document.getElementById('voucherId').value = '';
    document.getElementById('voucherType').value = type;
    document.getElementById('voucherModalTitle').textContent = type === 'receipt' ? 'سند قبض جديد' : 'سند صرف جديد';
    document.getElementById('referenceIdGroup').style.display = 'none';
    
    showModal('voucherModal');
}

function updateReferenceOptions() {
    const referenceType = document.getElementById('voucherReferenceType').value;
    const referenceIdSelect = document.getElementById('voucherReferenceId');
    const referenceIdGroup = document.getElementById('referenceIdGroup');
    
    if (referenceType === 'other') {
        referenceIdGroup.style.display = 'none';
        referenceIdSelect.required = false;
        return;
    }
    
    referenceIdGroup.style.display = 'block';
    referenceIdSelect.required = true;
    referenceIdSelect.innerHTML = '<option value="">اختر...</option>';
    
    if (referenceType === 'customer') {
        const customers = getData('customers') || [];
        customers.forEach(customer => {
            const option = document.createElement('option');
            option.value = customer.id;
            option.textContent = customer.name;
            referenceIdSelect.appendChild(option);
        });
    } else if (referenceType === 'supplier') {
        const suppliers = getData('suppliers') || [];
        suppliers.forEach(supplier => {
            const option = document.createElement('option');
            option.value = supplier.id;
            option.textContent = supplier.name;
            referenceIdSelect.appendChild(option);
        });
    }
}

function saveVoucher(event) {
    event.preventDefault();
    
    const type = document.getElementById('voucherType').value;
    const date = document.getElementById('voucherDate').value;
    const currency = document.getElementById('voucherCurrency').value;
    const amount = parseFloat(document.getElementById('voucherAmount').value);
    const operationType = document.getElementById('voucherOperationType').value;
    const paymentMethod = document.getElementById('voucherPaymentMethod').value;
    const referenceType = document.getElementById('voucherReferenceType').value;
    const referenceId = referenceType === 'other' ? null : document.getElementById('voucherReferenceId').value;
    const description = document.getElementById('voucherDescription').value;
    
    // Determine account based on payment method
    const accountId = paymentMethod === 'cash' ? '1111' : '1112';
    
    const voucher = {
        id: generateId(),
        number: generateVoucherNumber(type),
        type,
        date,
        currency,
        amount,
        operation_type: operationType,
        account_id: accountId,
        reference_type: referenceType,
        reference_id: referenceId,
        description,
        payment_method: paymentMethod
    };
    
    addItem('vouchers', voucher);
    
    // ترحيل تلقائي ذكي
    if (type === 'receipt' && typeof autoPostReceiptVoucher === 'function') {
        autoPostReceiptVoucher(voucher);
    } else if (type === 'payment' && typeof autoPostPaymentVoucher === 'function') {
        autoPostPaymentVoucher(voucher);
    }
    
    hideModal('voucherModal');
    showAlert('تم حفظ السند بنجاح', 'success');
    loadVouchers();
}

function createVoucherJournalEntry(voucher) {
    const accountId = voucher.account_id; // 1111 (خزينة) أو 1112 (بنك)
    
    let otherAccountId;
    if (voucher.reference_type === 'customer') {
        otherAccountId = '112'; // حساب العملاء
    } else if (voucher.reference_type === 'supplier') {
        otherAccountId = '211'; // حساب الموردين
    } else {
        // For 'other', we'll skip journal entry creation
        return;
    }
    
    const journalEntry = {
        id: generateId(),
        number: generateJournalNumber(),
        date: voucher.date,
        currency: voucher.currency || 'YER', // إضافة العملة من السند
        description: `${voucher.type === 'receipt' ? 'سند قبض' : 'سند صرف'} رقم ${voucher.number} - ${voucher.description}`,
        items: voucher.type === 'receipt' ? [
            { accountId: accountId, debit: voucher.amount, credit: 0 },
            { accountId: otherAccountId, debit: 0, credit: voucher.amount }
        ] : [
            { accountId: otherAccountId, debit: voucher.amount, credit: 0 },
            { accountId: accountId, debit: 0, credit: voucher.amount }
        ],
        total: voucher.amount,
        created_by: 'System'
    };
    
    addItem('journal_entries', journalEntry);
}

function viewVoucher(voucherId) {
    const voucher = findItem('vouchers', voucherId);
    if (!voucher) return;
    
    const customers = getData('customers') || [];
    const suppliers = getData('suppliers') || [];
    
    let partyName = '-';
    let partyDetails = '';
    
    if (voucher.reference_type === 'customer') {
        const customer = customers.find(c => c.id === voucher.reference_id);
        if (customer) {
            partyName = customer.name;
            partyDetails = `<p><strong>الهاتف:</strong> ${customer.phone || '-'}</p>`;
        }
    } else if (voucher.reference_type === 'supplier') {
        const supplier = suppliers.find(s => s.id === voucher.reference_id);
        if (supplier) {
            partyName = supplier.name;
            partyDetails = `<p><strong>الهاتف:</strong> ${supplier.phone || '-'}</p>`;
        }
    } else {
        partyName = 'آخر';
    }
    
    const paymentMethodLabels = {
        cash: 'نقدي',
        bank: 'بنك',
        check: 'شيك'
    };
    
    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">
                    <i class="fas fa-receipt"></i>
                    تفاصيل السند
                </h3>
                <button class="btn btn-secondary" onclick="loadVouchers()">
                    <i class="fas fa-arrow-right"></i>
                    رجوع
                </button>
            </div>
            
            <div class="company-header" style="display: flex; justify-content: space-between; align-items: center; padding: 30px 40px; border-bottom: 3px solid var(--primary-color); background: linear-gradient(to bottom, #ffffff 0%, #f9fafb 100%);">
                <!-- النص العربي (يمين) -->
                <div style="flex: 1; text-align: right;">
                    <h2 class="company-name" style="margin: 0; font-size: 22px; color: var(--primary-color); font-weight: 700;">${COMPANY_INFO.name}</h2>
                    <p class="company-subtitle" style="margin: 5px 0 0 0; font-size: 14px; color: #6b7280;">${COMPANY_INFO.location}</p>
                    <p style="margin: 5px 0 0 0; font-size: 13px; color: #6b7280; direction: ltr; text-align: right;">
                        ${COMPANY_INFO.phones.office.join(' - ')}
                    </p>
                </div>
                
                <!-- الشعار (وسط) -->
                <div style="flex: 0 0 auto; padding: 0 30px;">
                    <img src="${COMPANY_INFO.logo}" alt="سكاي آيكون" style="max-width: 120px; max-height: 90px; object-fit: contain;">
                </div>
                
                <!-- النص الإنجليزي (يسار) -->
                <div style="flex: 1; text-align: left; direction: ltr;">
                    <h2 style="margin: 0; font-size: 20px; color: var(--primary-color); font-weight: 700;">Sky Icon Travel & Tourism</h2>
                    <p style="margin: 5px 0 0 0; font-size: 13px; color: #6b7280;">Sana'a - Dhahban</p>
                    <p style="margin: 5px 0 0 0; font-size: 12px; color: #6b7280;">
                        ${COMPANY_INFO.phones.office.join(' - ')}
                    </p>
                </div>
            </div>
            
            <div style="padding: 20px 40px; background: ${voucher.type === 'receipt' ? 'var(--success-color)' : 'var(--danger-color)'}; color: white;">
                <h3 style="margin: 0; text-align: center; font-size: 24px; font-weight: 700;">
                    ${voucher.type === 'receipt' ? 'سند قبض' : 'سند صرف'}
                </h3>
            </div>
            
            <div style="padding: 40px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 40px;">
                    <div>
                        <h4>معلومات السند</h4>
                        <p><strong>رقم السند:</strong> ${voucher.number}</p>
                        <p><strong>التاريخ:</strong> ${formatDate(voucher.date)}</p>
                        <p><strong>طريقة الدفع:</strong> ${paymentMethodLabels[voucher.payment_method]}</p>
                    </div>
                    <div>
                        <h4>بيانات الطرف</h4>
                        <p><strong>الاسم:</strong> ${partyName}</p>
                        ${partyDetails}
                    </div>
                </div>
                
                <div style="background: ${voucher.type === 'receipt' ? '#e8f5e9' : '#ffebee'}; padding: 30px; border-radius: 10px; text-align: center; margin: 40px 0;">
                    <h4 style="margin-bottom: 10px; color: ${voucher.type === 'receipt' ? 'var(--success-color)' : 'var(--danger-color)'};">
                        ${voucher.type === 'receipt' ? 'المبلغ المقبوض' : 'المبلغ المدفوع'}
                    </h4>
                    <div style="font-size: 36px; font-weight: bold; color: ${voucher.type === 'receipt' ? 'var(--success-color)' : 'var(--danger-color)'};">
                        ${formatCurrency(voucher.amount, voucher.currency)}
                    </div>
                </div>
                
                <div style="margin: 40px 0;">
                    <h4>البيان</h4>
                    <p style="padding: 20px; background: var(--light-bg); border-radius: 8px;">
                        ${voucher.description}
                    </p>
                </div>
                
                <div style="margin-top: 60px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 40px; text-align: center;">
                    <div>
                        <div style="border-top: 2px solid var(--text-dark); padding-top: 10px; margin-top: 40px;">
                            المحاسب
                        </div>
                    </div>
                    <div>
                        <div style="border-top: 2px solid var(--text-dark); padding-top: 10px; margin-top: 40px;">
                            ${voucher.type === 'receipt' ? 'المستلم' : 'المُسلم'}
                        </div>
                    </div>
                    <div>
                        <div style="border-top: 2px solid var(--text-dark); padding-top: 10px; margin-top: 40px;">
                            المدير المالي
                        </div>
                    </div>
                </div>
                
                <div style="margin-top: 40px;">
                    <button class="btn btn-primary" onclick="printVoucher('${voucher.id}')">
                        <i class="fas fa-print"></i>
                        طباعة السند
                    </button>
                </div>
            </div>
            
            <div class="company-footer">
                <div class="company-contacts">
                    <span><i class="fas fa-phone"></i> هاتف/جوال: ${COMPANY_INFO.phones.office.join(' - ')}</span>
                    <span><i class="fas fa-map-marker-alt"></i> ${COMPANY_INFO.location}</span>
                </div>
            </div>
        </div>
    `;
}

function numberToArabicWords(num) {
    // تحويل الرقم إلى كلمات عربية (نسخة مبسطة)
    if (num === 0) return 'صفر';
    
    const ones = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'];
    const tens = ['', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
    const hundreds = ['', 'مائة', 'مئتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];
    
    // هذه نسخة مبسطة، يمكن تحسينها
    return 'المبلغ المذكور أعلاه';
}

function printVoucher(voucherId) {
    viewVoucher(voucherId);
    setTimeout(() => window.print(), 500);
}

function deleteVoucher(voucherId) {
    if (!confirm('هل أنت متأكد من حذف هذا السند؟\nملاحظة: سيتم حذف القيد المحاسبي المرتبط به أيضاً.')) return;
    
    const voucher = findItem('vouchers', voucherId);
    
    // Delete related journal entry
    const journalEntries = getData('journal_entries') || [];
    const relatedEntry = journalEntries.find(entry => 
        entry.description.includes(voucher.number)
    );
    
    if (relatedEntry) {
        deleteItem('journal_entries', relatedEntry.id);
    }
    
    deleteItem('vouchers', voucherId);
    showAlert('تم حذف السند والقيد المحاسبي المرتبط به بنجاح', 'success');
    loadVouchers();
}