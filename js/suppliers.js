// ========================================
// وحدة الموردين
// ========================================

function loadSuppliers() {
    const content = document.getElementById('content');
    const suppliers = getData('suppliers') || [];
    
    content.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">
                    <i class="fas fa-truck"></i>
                    الموردين
                </h3>
                <button class="btn btn-primary" onclick="openAddSupplierModal()">
                    <i class="fas fa-plus"></i>
                    مورد جديد
                </button>
            </div>
            
            <div style="padding: 20px;">
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon primary">
                            <i class="fas fa-truck"></i>
                        </div>
                        <div class="stat-content">
                            <h3>إجمالي الموردين</h3>
                            <div class="stat-value">${suppliers.length}</div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon success">
                            <i class="fas fa-plane"></i>
                        </div>
                        <div class="stat-content">
                            <h3>شركات الطيران</h3>
                            <div class="stat-value">${suppliers.filter(s => s.type === 'airline').length}</div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon info">
                            <i class="fas fa-hotel"></i>
                        </div>
                        <div class="stat-content">
                            <h3>الفنادق</h3>
                            <div class="stat-value">${suppliers.filter(s => s.type === 'hotel').length}</div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon warning">
                            <i class="fas fa-balance-scale"></i>
                        </div>
                        <div class="stat-content">
                            <h3>صافي الأرصدة</h3>
                            <div class="stat-value">${formatCurrency(Math.abs(suppliers.reduce((sum, s) => sum + s.balance, 0)))}</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th>الاسم</th>
                            <th>النوع</th>
                            <th>الهاتف</th>
                            <th>البريد الإلكتروني</th>
                            <th>الرصيد</th>
                            <th>إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${suppliers.length === 0 ? 
                            '<tr><td colspan="6" style="text-align: center; padding: 40px;">لا يوجد موردين</td></tr>' : 
                            suppliers.map(supplier => renderSupplierRow(supplier)).join('')
                        }
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- Add/Edit Supplier Modal -->
        <div class="modal" id="supplierModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title" id="supplierModalTitle">مورد جديد</h3>
                    <button class="modal-close" onclick="hideModal('supplierModal')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="supplierForm" onsubmit="saveSupplier(event)">
                        <input type="hidden" id="supplierId">
                        
                        <div class="form-group">
                            <label class="form-label">اسم المورد *</label>
                            <input type="text" class="form-control" id="supplierName" required>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">نوع المورد *</label>
                            <select class="form-control" id="supplierType" required>
                                <option value="">اختر النوع</option>
                                <option value="airline">شركة طيران</option>
                                <option value="hotel">فندق</option>
                                <option value="transport">نقل</option>
                                <option value="other">أخرى</option>
                            </select>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                            <div class="form-group">
                                <label class="form-label">رقم الهاتف *</label>
                                <input type="tel" class="form-control" id="supplierPhone" required>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">البريد الإلكتروني</label>
                                <input type="email" class="form-control" id="supplierEmail">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">العنوان</label>
                            <input type="text" class="form-control" id="supplierAddress">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">ملاحظات</label>
                            <textarea class="form-control" id="supplierNotes" rows="3"></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="document.getElementById('supplierForm').requestSubmit()">
                        <i class="fas fa-save"></i>
                        حفظ
                    </button>
                    <button class="btn btn-secondary" onclick="hideModal('supplierModal')">
                        <i class="fas fa-times"></i>
                        إلغاء
                    </button>
                </div>
            </div>
        </div>
    `;
}

function renderSupplierRow(supplier) {
    const typeLabels = {
        airline: 'شركة طيران',
        hotel: 'فندق',
        transport: 'نقل',
        other: 'أخرى'
    };
    
    const typeIcons = {
        airline: 'fa-plane',
        hotel: 'fa-hotel',
        transport: 'fa-bus',
        other: 'fa-box'
    };
    
    return `
        <tr>
            <td>${supplier.name}</td>
            <td>
                <span class="badge" style="padding: 5px 10px; border-radius: 4px; background: var(--info-color); color: white;">
                    <i class="fas ${typeIcons[supplier.type]}"></i>
                    ${typeLabels[supplier.type]}
                </span>
            </td>
            <td>${supplier.phone || '-'}</td>
            <td>${supplier.email || '-'}</td>
            <td style="font-weight: bold; color: ${supplier.balance <= 0 ? 'var(--success-color)' : 'var(--danger-color)'};">
                ${formatCurrency(Math.abs(supplier.balance))}
                ${supplier.balance <= 0 ? 'له' : 'علينا'}
            </td>
            <td>
                <div class="action-btns">
                    <button class="btn btn-sm btn-view" onclick="viewSupplier('${supplier.id}')" title="عرض">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-edit" onclick="openEditSupplierModal('${supplier.id}')" title="تعديل">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-info" onclick="viewSupplierStatement('${supplier.id}')" title="كشف الحساب">
                        <i class="fas fa-file-alt"></i>
                    </button>
                    <button class="btn btn-sm btn-delete" onclick="deleteSupplier('${supplier.id}')" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `;
}

function openAddSupplierModal() {
    document.getElementById('supplierForm').reset();
    document.getElementById('supplierId').value = '';
    document.getElementById('supplierModalTitle').textContent = 'مورد جديد';
    showModal('supplierModal');
}

function openEditSupplierModal(supplierId) {
    const supplier = findItem('suppliers', supplierId);
    if (!supplier) return;
    
    document.getElementById('supplierId').value = supplier.id;
    document.getElementById('supplierName').value = supplier.name;
    document.getElementById('supplierType').value = supplier.type;
    document.getElementById('supplierPhone').value = supplier.phone || '';
    document.getElementById('supplierEmail').value = supplier.email || '';
    document.getElementById('supplierAddress').value = supplier.address || '';
    document.getElementById('supplierNotes').value = supplier.notes || '';
    
    document.getElementById('supplierModalTitle').textContent = 'تعديل بيانات المورد';
    showModal('supplierModal');
}

function saveSupplier(event) {
    event.preventDefault();
    
    const id = document.getElementById('supplierId').value;
    const name = document.getElementById('supplierName').value;
    const type = document.getElementById('supplierType').value;
    const phone = document.getElementById('supplierPhone').value;
    const email = document.getElementById('supplierEmail').value;
    const address = document.getElementById('supplierAddress').value;
    const notes = document.getElementById('supplierNotes').value;
    
    const supplier = {
        name,
        type,
        phone,
        email,
        address,
        notes
    };
    
    if (id) {
        updateItem('suppliers', id, supplier);
        showAlert('تم تحديث بيانات المورد بنجاح', 'success');
    } else {
        supplier.id = generateId();
        supplier.balance = 0;
        addItem('suppliers', supplier);
        showAlert('تم إضافة المورد بنجاح', 'success');
    }
    
    hideModal('supplierModal');
    loadSuppliers();
}

function viewSupplier(supplierId) {
    const supplier = findItem('suppliers', supplierId);
    if (!supplier) return;
    
    const invoices = getData('invoices') || [];
    const vouchers = getData('vouchers') || [];
    
    const supplierInvoices = invoices.filter(inv => inv.supplier_id === supplierId);
    const supplierVouchers = vouchers.filter(v => v.reference_type === 'supplier' && v.reference_id === supplierId);
    
    const typeLabels = {
        airline: 'شركة طيران',
        hotel: 'فندق',
        transport: 'نقل',
        other: 'أخرى'
    };
    
    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">
                    <i class="fas fa-truck"></i>
                    بطاقة المورد
                </h3>
                <div style="display: flex; gap: 10px;">
                    <button class="btn btn-primary" onclick="openEditSupplierModal('${supplier.id}')">
                        <i class="fas fa-edit"></i>
                        تعديل
                    </button>
                    <button class="btn btn-secondary" onclick="loadSuppliers()">
                        <i class="fas fa-arrow-right"></i>
                        رجوع
                    </button>
                </div>
            </div>
            
            <div style="padding: 30px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
                    <div>
                        <h4>المعلومات الأساسية</h4>
                        <p><strong>الاسم:</strong> ${supplier.name}</p>
                        <p><strong>النوع:</strong> ${typeLabels[supplier.type]}</p>
                        <p><strong>الهاتف:</strong> ${supplier.phone || '-'}</p>
                        <p><strong>البريد:</strong> ${supplier.email || '-'}</p>
                        <p><strong>العنوان:</strong> ${supplier.address || '-'}</p>
                    </div>
                    <div>
                        <h4>المعلومات المالية</h4>
                        <p><strong>الرصيد:</strong> 
                            <span style="font-size: 20px; font-weight: bold; color: ${supplier.balance <= 0 ? 'var(--success-color)' : 'var(--danger-color)'};">
                                ${formatCurrency(Math.abs(supplier.balance))} ${supplier.balance <= 0 ? 'له' : 'علينا'}
                            </span>
                        </p>
                        <p><strong>عدد الفواتير:</strong> ${supplierInvoices.length}</p>
                        <p><strong>عدد السندات:</strong> ${supplierVouchers.length}</p>
                        <p><strong>إجمالي المشتريات:</strong> ${formatCurrency(supplierInvoices.reduce((sum, inv) => sum + inv.total, 0))}</p>
                    </div>
                </div>
                
                ${supplier.notes ? `
                    <div style="margin-bottom: 30px;">
                        <h4>ملاحظات</h4>
                        <p style="padding: 15px; background: var(--light-bg); border-radius: 6px;">${supplier.notes}</p>
                    </div>
                ` : ''}
                
                <div style="margin-top: 30px;">
                    <h4>آخر الفواتير</h4>
                    ${supplierInvoices.length === 0 ? 
                        '<p style="padding: 20px; background: var(--light-bg); text-align: center;">لا توجد فواتير</p>' :
                        `<table class="table">
                            <thead>
                                <tr>
                                    <th>رقم الفاتورة</th>
                                    <th>التاريخ</th>
                                    <th>المبلغ</th>
                                    <th>المدفوع</th>
                                    <th>المتبقي</th>
                                    <th>الحالة</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${supplierInvoices.slice(-5).reverse().map(invoice => {
                                    const remaining = invoice.total - invoice.paid;
                                    const statusLabels = { paid: 'مدفوعة', partial: 'جزئية', unpaid: 'غير مدفوعة' };
                                    const statusColors = { paid: 'success', partial: 'warning', unpaid: 'danger' };
                                    return `
                                        <tr>
                                            <td>${invoice.number}</td>
                                            <td>${formatDateShort(invoice.date)}</td>
                                            <td>${formatCurrency(invoice.total)}</td>
                                            <td>${formatCurrency(invoice.paid)}</td>
                                            <td style="color: ${remaining > 0 ? 'var(--danger-color)' : 'var(--success-color)'};">
                                                ${formatCurrency(remaining)}
                                            </td>
                                            <td>
                                                <span class="badge" style="padding: 5px 10px; border-radius: 4px; background: var(--${statusColors[invoice.status]}-color); color: white;">
                                                    ${statusLabels[invoice.status]}
                                                </span>
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>`
                    }
                </div>
                
                <div style="margin-top: 30px;">
                    <button class="btn btn-primary" onclick="viewSupplierStatement('${supplier.id}')">
                        <i class="fas fa-file-alt"></i>
                        كشف الحساب الكامل
                    </button>
                </div>
            </div>
        </div>
    `;
}

function viewSupplierStatement(supplierId) {
    const supplier = findItem('suppliers', supplierId);
    if (!supplier) return;
    
    const invoices = getData('invoices') || [];
    const vouchers = getData('vouchers') || [];
    
    const supplierInvoices = invoices.filter(inv => inv.supplier_id === supplierId);
    const supplierVouchers = vouchers.filter(v => v.reference_type === 'supplier' && v.reference_id === supplierId);
    
    // Combine and sort transactions
    const transactions = [
        ...supplierInvoices.map(inv => ({
            date: inv.date,
            type: 'invoice',
            number: inv.number,
            description: `فاتورة مشتريات`,
            debit: 0,
            credit: inv.total
        })),
        ...supplierVouchers.map(v => ({
            date: v.date,
            type: 'voucher',
            number: v.number,
            description: v.description,
            debit: v.type === 'payment' ? v.amount : 0,
            credit: v.type === 'receipt' ? v.amount : 0
        }))
    ].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    let balance = 0;
    
    const typeLabels = {
        airline: 'شركة طيران',
        hotel: 'فندق',
        transport: 'نقل',
        other: 'أخرى'
    };
    
    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">
                    <i class="fas fa-file-alt"></i>
                    كشف حساب المورد: ${supplier.name}
                </h3>
                <button class="btn btn-secondary" onclick="viewSupplier('${supplier.id}')">
                    <i class="fas fa-arrow-right"></i>
                    رجوع
                </button>
            </div>
            
            <div class="company-header">
                <div class="company-logo"><i class="fas fa-plane-departure"></i></div>
                <h2 class="company-name">${COMPANY_INFO.name}</h2>
                <p class="company-subtitle">كشف حساب مورد</p>
            </div>
            
            <div style="padding: 30px;">
                <div style="background: var(--light-bg); padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                    <h4>معلومات المورد</h4>
                    <p><strong>الاسم:</strong> ${supplier.name}</p>
                    <p><strong>النوع:</strong> ${typeLabels[supplier.type]}</p>
                    <p><strong>الهاتف:</strong> ${supplier.phone || '-'}</p>
                    <p><strong>الرصيد الحالي:</strong> 
                        <span style="font-size: 18px; font-weight: bold; color: ${supplier.balance <= 0 ? 'var(--success-color)' : 'var(--danger-color)'};">
                            ${formatCurrency(Math.abs(supplier.balance))} ${supplier.balance <= 0 ? 'له' : 'علينا'}
                        </span>
                    </p>
                </div>
                
                <table class="table">
                    <thead>
                        <tr>
                            <th>التاريخ</th>
                            <th>رقم المستند</th>
                            <th>البيان</th>
                            <th>مدين</th>
                            <th>دائن</th>
                            <th>الرصيد</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${transactions.length === 0 ? 
                            '<tr><td colspan="6" style="text-align: center; padding: 40px;">لا توجد حركات</td></tr>' :
                            transactions.map(trans => {
                                balance += trans.credit - trans.debit;
                                return `
                                    <tr>
                                        <td>${formatDateShort(trans.date)}</td>
                                        <td>${trans.number}</td>
                                        <td>${trans.description}</td>
                                        <td>${trans.debit > 0 ? formatCurrency(trans.debit) : '-'}</td>
                                        <td>${trans.credit > 0 ? formatCurrency(trans.credit) : '-'}</td>
                                        <td style="font-weight: bold; color: ${balance <= 0 ? 'var(--success-color)' : 'var(--danger-color)'};">
                                            ${formatCurrency(Math.abs(balance))} ${balance <= 0 ? 'له' : 'علينا'}
                                        </td>
                                    </tr>
                                `;
                            }).join('')
                        }
                        ${transactions.length > 0 ? `
                            <tr style="background: var(--light-bg); font-weight: bold;">
                                <td colspan="3">المجموع</td>
                                <td>${formatCurrency(transactions.reduce((sum, t) => sum + t.debit, 0))}</td>
                                <td>${formatCurrency(transactions.reduce((sum, t) => sum + t.credit, 0))}</td>
                                <td style="color: ${balance <= 0 ? 'var(--success-color)' : 'var(--danger-color)'};">
                                    ${formatCurrency(Math.abs(balance))} ${balance <= 0 ? 'له' : 'علينا'}
                                </td>
                            </tr>
                        ` : ''}
                    </tbody>
                </table>
                
                <div style="margin-top: 30px;">
                    <button class="btn btn-primary" onclick="printSupplierStatement('${supplier.id}')">
                        <i class="fas fa-print"></i>
                        طباعة كشف الحساب
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

function printSupplierStatement(supplierId) {
    const supplier = findItem('suppliers', supplierId);
    if (!supplier) return;
    
    const invoices = getData('invoices') || [];
    const vouchers = getData('vouchers') || [];
    
    const supplierInvoices = invoices.filter(inv => inv.supplier_id === supplierId);
    const supplierVouchers = vouchers.filter(v => v.reference_type === 'supplier' && v.reference_id === supplierId);
    
    // Combine and sort transactions
    const transactions = [
        ...supplierInvoices.map(inv => ({
            date: inv.date,
            type: 'invoice',
            number: inv.number,
            description: `فاتورة ${inv.type === 'sales' ? 'مبيعات' : 'مشتريات'}`,
            debit: inv.type === 'purchase' ? inv.total : 0,
            credit: inv.type === 'sales' ? inv.total : 0,
            currency: inv.currency || 'YER'
        })),
        ...supplierVouchers.map(v => ({
            date: v.date,
            type: 'voucher',
            number: v.number,
            description: v.description,
            debit: v.type === 'receipt' ? v.amount : 0,
            credit: v.type === 'payment' ? v.amount : 0,
            currency: v.currency || 'YER'
        }))
    ].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    let balance = 0;
    
    let html = `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8">
            <title>كشف حساب المورد - ${supplier.name}</title>
            <style>
                body {
                    font-family: 'Cairo', Arial, sans-serif;
                    direction: rtl;
                    margin: 20px;
                    font-size: 13px;
                }
                .supplier-info {
                    background: #f5f5f5;
                    padding: 20px;
                    border-radius: 8px;
                    margin: 20px 0;
                    border-right: 4px solid #f57c00;
                }
                .info-row {
                    display: flex;
                    padding: 8px 0;
                    border-bottom: 1px solid #e0e0e0;
                }
                .info-row:last-child {
                    border-bottom: none;
                }
                .info-label {
                    width: 120px;
                    font-weight: bold;
                    color: #555;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 20px 0;
                    font-size: 12px;
                }
                th, td {
                    border: 1px solid #ddd;
                    padding: 10px;
                    text-align: center;
                }
                th {
                    background-color: #f57c00;
                    color: white;
                    font-weight: bold;
                }
                tr:nth-child(even) {
                    background-color: #f8f9fa;
                }
                .total-row {
                    background-color: #fff3cd !important;
                    font-weight: bold;
                    font-size: 14px;
                }
                .positive-balance {
                    color: #4caf50;
                    font-weight: bold;
                }
                .negative-balance {
                    color: #f44336;
                    font-weight: bold;
                }
                @media print {
                    body { margin: 0; padding: 15px; }
                }
            </style>
        </head>
        <body>
            ${generateDocumentHeader('كشف حساب مورد')}
            
            <div class="supplier-info">
                <h3 style="color: #f57c00; margin: 0 0 15px 0;">معلومات المورد</h3>
                <div class="info-row">
                    <div class="info-label">الاسم:</div>
                    <div style="flex: 1;">${supplier.name}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">الهاتف:</div>
                    <div style="flex: 1; direction: ltr; text-align: right;">${supplier.phone || '-'}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">البريد:</div>
                    <div style="flex: 1;">${supplier.email || '-'}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">العنوان:</div>
                    <div style="flex: 1;">${supplier.address || '-'}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">الرصيد الحالي:</div>
                    <div style="flex: 1; font-size: 16px;" class="${supplier.balance <= 0 ? 'positive-balance' : 'negative-balance'}">
                        ${formatCurrency(Math.abs(supplier.balance))} ${supplier.balance <= 0 ? 'له' : 'علينا'}
                    </div>
                </div>
            </div>
            
            <h3 style="color: #004d40; margin: 25px 0 15px 0;">حركة الحساب</h3>
            
            <table>
                <thead>
                    <tr>
                        <th style="width: 40px;">م</th>
                        <th style="width: 90px;">التاريخ</th>
                        <th style="width: 100px;">رقم المستند</th>
                        <th>البيان</th>
                        <th style="width: 120px;">مدين</th>
                        <th style="width: 120px;">دائن</th>
                        <th style="width: 120px;">الرصيد</th>
                    </tr>
                </thead>
                <tbody>`;
    
    if (transactions.length === 0) {
        html += `
                    <tr>
                        <td colspan="7" style="text-align: center; padding: 30px; color: #999;">لا توجد حركات</td>
                    </tr>`;
    } else {
        transactions.forEach((trans, index) => {
            balance += trans.debit - trans.credit;
            html += `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${formatDateShort(trans.date)}</td>
                        <td><strong>${trans.number}</strong></td>
                        <td style="text-align: right; padding-right: 10px;">${trans.description}</td>
                        <td>${trans.debit > 0 ? formatCurrency(trans.debit, trans.currency) : '-'}</td>
                        <td>${trans.credit > 0 ? formatCurrency(trans.credit, trans.currency) : '-'}</td>
                        <td class="${balance <= 0 ? 'positive-balance' : 'negative-balance'}">
                            ${formatCurrency(Math.abs(balance))} ${balance <= 0 ? 'له' : 'علينا'}
                        </td>
                    </tr>`;
        });
        
        const totalDebit = transactions.reduce((sum, t) => sum + t.debit, 0);
        const totalCredit = transactions.reduce((sum, t) => sum + t.credit, 0);
        
        html += `
                    <tr class="total-row">
                        <td colspan="4" style="text-align: center; background: #f57c00; color: white;">الإجمالي</td>
                        <td>${formatCurrency(totalDebit)}</td>
                        <td>${formatCurrency(totalCredit)}</td>
                        <td class="${balance <= 0 ? 'positive-balance' : 'negative-balance'}">
                            ${formatCurrency(Math.abs(balance))} ${balance <= 0 ? 'له' : 'علينا'}
                        </td>
                    </tr>`;
    }
    
    html += `
                </tbody>
            </table>
            
            ${generateDocumentFooter()}
        </body>
        </html>`;
    
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
}

function deleteSupplier(supplierId) {
    const invoices = getData('invoices') || [];
    
    const hasInvoices = invoices.some(inv => inv.supplier_id === supplierId);
    
    if (hasInvoices) {
        showAlert('لا يمكن حذف هذا المورد لوجود فواتير مرتبطة به', 'danger');
        return;
    }
    
    if (!confirm('هل أنت متأكد من حذف هذا المورد؟')) return;
    
    deleteItem('suppliers', supplierId);
    showAlert('تم حذف المورد بنجاح', 'success');
    loadSuppliers();
}