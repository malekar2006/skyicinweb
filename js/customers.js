// ========================================
// وحدة العملاء
// ========================================

function loadCustomers() {
    const content = document.getElementById('content');
    const customers = getData('customers') || [];
    
    content.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">
                    <i class="fas fa-users"></i>
                    العملاء
                </h3>
                <button class="btn btn-primary" onclick="openAddCustomerModal()">
                    <i class="fas fa-plus"></i>
                    عميل جديد
                </button>
            </div>
            
            <div style="padding: 20px;">
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon primary">
                            <i class="fas fa-users"></i>
                        </div>
                        <div class="stat-content">
                            <h3>إجمالي العملاء</h3>
                            <div class="stat-value">${customers.length}</div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon success">
                            <i class="fas fa-arrow-up"></i>
                        </div>
                        <div class="stat-content">
                            <h3>الأرصدة الدائنة</h3>
                            <div class="stat-value">${customers.filter(c => c.balance > 0).length}</div>
                            <small>${formatCurrency(customers.reduce((sum, c) => c.balance > 0 ? sum + c.balance : sum, 0))}</small>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon danger">
                            <i class="fas fa-arrow-down"></i>
                        </div>
                        <div class="stat-content">
                            <h3>الأرصدة المدينة</h3>
                            <div class="stat-value">${customers.filter(c => c.balance < 0).length}</div>
                            <small>${formatCurrency(Math.abs(customers.reduce((sum, c) => c.balance < 0 ? sum + c.balance : sum, 0)))}</small>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon info">
                            <i class="fas fa-balance-scale"></i>
                        </div>
                        <div class="stat-content">
                            <h3>صافي الأرصدة</h3>
                            <div class="stat-value">${formatCurrency(customers.reduce((sum, c) => sum + c.balance, 0))}</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th>الاسم</th>
                            <th>الهاتف</th>
                            <th>البريد الإلكتروني</th>
                            <th>رقم الهوية</th>
                            <th>الرصيد</th>
                            <th>إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${customers.length === 0 ? 
                            '<tr><td colspan="6" style="text-align: center; padding: 40px;">لا يوجد عملاء</td></tr>' : 
                            customers.map(customer => renderCustomerRow(customer)).join('')
                        }
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- Add/Edit Customer Modal -->
        <div class="modal" id="customerModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title" id="customerModalTitle">عميل جديد</h3>
                    <button class="modal-close" onclick="hideModal('customerModal')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="customerForm" onsubmit="saveCustomer(event)">
                        <input type="hidden" id="customerId">
                        
                        <div class="form-group">
                            <label class="form-label">الاسم الكامل *</label>
                            <input type="text" class="form-control" id="customerName" required>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                            <div class="form-group">
                                <label class="form-label">رقم الهاتف *</label>
                                <input type="tel" class="form-control" id="customerPhone" required>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">البريد الإلكتروني</label>
                                <input type="email" class="form-control" id="customerEmail">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">العنوان</label>
                            <input type="text" class="form-control" id="customerAddress">
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                            <div class="form-group">
                                <label class="form-label">رقم الهوية</label>
                                <input type="text" class="form-control" id="customerIdNumber">
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">رقم جواز السفر</label>
                                <input type="text" class="form-control" id="customerPassport">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">ملاحظات</label>
                            <textarea class="form-control" id="customerNotes" rows="3"></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="document.getElementById('customerForm').requestSubmit()">
                        <i class="fas fa-save"></i>
                        حفظ
                    </button>
                    <button class="btn btn-secondary" onclick="hideModal('customerModal')">
                        <i class="fas fa-times"></i>
                        إلغاء
                    </button>
                </div>
            </div>
        </div>
    `;
}

function renderCustomerRow(customer) {
    return `
        <tr>
            <td>${customer.name}</td>
            <td>${customer.phone || '-'}</td>
            <td>${customer.email || '-'}</td>
            <td>${customer.id_number || '-'}</td>
            <td style="font-weight: bold; color: ${customer.balance >= 0 ? 'var(--success-color)' : 'var(--danger-color)'};">
                ${formatCurrency(Math.abs(customer.balance))}
                ${customer.balance >= 0 ? 'له' : 'عليه'}
            </td>
            <td>
                <div class="action-btns">
                    <button class="btn btn-sm btn-view" onclick="viewCustomer('${customer.id}')" title="عرض">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-edit" onclick="openEditCustomerModal('${customer.id}')" title="تعديل">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-info" onclick="viewCustomerStatement('${customer.id}')" title="كشف الحساب">
                        <i class="fas fa-file-alt"></i>
                    </button>
                    <button class="btn btn-sm btn-delete" onclick="deleteCustomer('${customer.id}')" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `;
}

function openAddCustomerModal() {
    document.getElementById('customerForm').reset();
    document.getElementById('customerId').value = '';
    document.getElementById('customerModalTitle').textContent = 'عميل جديد';
    showModal('customerModal');
}

function openEditCustomerModal(customerId) {
    const customer = findItem('customers', customerId);
    if (!customer) return;
    
    document.getElementById('customerId').value = customer.id;
    document.getElementById('customerName').value = customer.name;
    document.getElementById('customerPhone').value = customer.phone || '';
    document.getElementById('customerEmail').value = customer.email || '';
    document.getElementById('customerAddress').value = customer.address || '';
    document.getElementById('customerIdNumber').value = customer.id_number || '';
    document.getElementById('customerPassport').value = customer.passport_number || '';
    document.getElementById('customerNotes').value = customer.notes || '';
    
    document.getElementById('customerModalTitle').textContent = 'تعديل بيانات العميل';
    showModal('customerModal');
}

function saveCustomer(event) {
    event.preventDefault();
    
    const id = document.getElementById('customerId').value;
    const name = document.getElementById('customerName').value;
    const phone = document.getElementById('customerPhone').value;
    const email = document.getElementById('customerEmail').value;
    const address = document.getElementById('customerAddress').value;
    const idNumber = document.getElementById('customerIdNumber').value;
    const passport = document.getElementById('customerPassport').value;
    const notes = document.getElementById('customerNotes').value;
    
    const customer = {
        name,
        phone,
        email,
        address,
        id_number: idNumber,
        passport_number: passport,
        notes
    };
    
    if (id) {
        updateItem('customers', id, customer);
        showAlert('تم تحديث بيانات العميل بنجاح', 'success');
    } else {
        customer.id = generateId();
        customer.balance = 0;
        addItem('customers', customer);
        showAlert('تم إضافة العميل بنجاح', 'success');
    }
    
    hideModal('customerModal');
    loadCustomers();
}

function viewCustomer(customerId) {
    const customer = findItem('customers', customerId);
    if (!customer) return;
    
    const invoices = getData('invoices') || [];
    const bookings = getData('bookings') || [];
    const vouchers = getData('vouchers') || [];
    
    const customerInvoices = invoices.filter(inv => inv.customer_id === customerId);
    const customerBookings = bookings.filter(b => b.customer_id === customerId);
    const customerVouchers = vouchers.filter(v => v.reference_type === 'customer' && v.reference_id === customerId);
    
    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">
                    <i class="fas fa-user"></i>
                    بطاقة العميل
                </h3>
                <div style="display: flex; gap: 10px;">
                    <button class="btn btn-primary" onclick="openEditCustomerModal('${customer.id}')">
                        <i class="fas fa-edit"></i>
                        تعديل
                    </button>
                    <button class="btn btn-secondary" onclick="loadCustomers()">
                        <i class="fas fa-arrow-right"></i>
                        رجوع
                    </button>
                </div>
            </div>
            
            <div style="padding: 30px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
                    <div>
                        <h4>المعلومات الشخصية</h4>
                        <p><strong>الاسم:</strong> ${customer.name}</p>
                        <p><strong>الهاتف:</strong> ${customer.phone || '-'}</p>
                        <p><strong>البريد:</strong> ${customer.email || '-'}</p>
                        <p><strong>العنوان:</strong> ${customer.address || '-'}</p>
                    </div>
                    <div>
                        <h4>الوثائق</h4>
                        <p><strong>رقم الهوية:</strong> ${customer.id_number || '-'}</p>
                        <p><strong>رقم الجواز:</strong> ${customer.passport_number || '-'}</p>
                        <p><strong>الرصيد:</strong> 
                            <span style="font-size: 20px; font-weight: bold; color: ${customer.balance >= 0 ? 'var(--success-color)' : 'var(--danger-color)'};">
                                ${formatCurrency(Math.abs(customer.balance))} ${customer.balance >= 0 ? 'له' : 'عليه'}
                            </span>
                        </p>
                    </div>
                </div>
                
                ${customer.notes ? `
                    <div style="margin-bottom: 30px;">
                        <h4>ملاحظات</h4>
                        <p style="padding: 15px; background: var(--light-bg); border-radius: 6px;">${customer.notes}</p>
                    </div>
                ` : ''}
                
                <div class="stats-grid" style="margin-bottom: 30px;">
                    <div class="stat-card">
                        <div class="stat-icon primary">
                            <i class="fas fa-ticket-alt"></i>
                        </div>
                        <div class="stat-content">
                            <h3>الحجوزات</h3>
                            <div class="stat-value">${customerBookings.length}</div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon success">
                            <i class="fas fa-file-invoice"></i>
                        </div>
                        <div class="stat-content">
                            <h3>الفواتير</h3>
                            <div class="stat-value">${customerInvoices.length}</div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon info">
                            <i class="fas fa-receipt"></i>
                        </div>
                        <div class="stat-content">
                            <h3>السندات</h3>
                            <div class="stat-value">${customerVouchers.length}</div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon warning">
                            <i class="fas fa-dollar-sign"></i>
                        </div>
                        <div class="stat-content">
                            <h3>إجمالي المعاملات</h3>
                            <div class="stat-value">${formatCurrency(customerInvoices.reduce((sum, inv) => sum + inv.total, 0))}</div>
                        </div>
                    </div>
                </div>
                
                <div style="margin-top: 30px;">
                    <h4>آخر الحجوزات</h4>
                    ${customerBookings.length === 0 ? 
                        '<p style="padding: 20px; background: var(--light-bg); text-align: center;">لا توجد حجوزات</p>' :
                        `<table class="table">
                            <thead>
                                <tr>
                                    <th>رقم الحجز</th>
                                    <th>النوع</th>
                                    <th>التاريخ</th>
                                    <th>المبلغ</th>
                                    <th>الحالة</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${customerBookings.slice(-5).reverse().map(booking => `
                                    <tr>
                                        <td>${booking.booking_number}</td>
                                        <td>${getBookingTypeLabel(booking.type)}</td>
                                        <td>${formatDateShort(booking.date)}</td>
                                        <td>${formatCurrency(booking.amount)}</td>
                                        <td>
                                            <span class="badge" style="padding: 5px 10px; border-radius: 4px; background: var(--${booking.status === 'confirmed' ? 'success' : booking.status === 'pending' ? 'warning' : 'danger'}-color); color: white;">
                                                ${booking.status === 'confirmed' ? 'مؤكد' : booking.status === 'pending' ? 'معلق' : 'ملغي'}
                                            </span>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>`
                    }
                </div>
                
                <div style="margin-top: 30px;">
                    <button class="btn btn-primary" onclick="viewCustomerStatement('${customer.id}')">
                        <i class="fas fa-file-alt"></i>
                        كشف الحساب الكامل
                    </button>
                </div>
            </div>
        </div>
    `;
}

function viewCustomerStatement(customerId) {
    const customer = findItem('customers', customerId);
    if (!customer) return;
    
    const invoices = getData('invoices') || [];
    const vouchers = getData('vouchers') || [];
    
    const customerInvoices = invoices.filter(inv => inv.customer_id === customerId);
    const customerVouchers = vouchers.filter(v => v.reference_type === 'customer' && v.reference_id === customerId);
    
    // Combine and sort transactions
    const transactions = [
        ...customerInvoices.map(inv => ({
            date: inv.date,
            type: 'invoice',
            number: inv.number,
            description: `فاتورة ${inv.type === 'sales' ? 'مبيعات' : 'مشتريات'}`,
            debit: inv.type === 'sales' ? inv.total : 0,
            credit: inv.type === 'purchase' ? inv.total : 0
        })),
        ...customerVouchers.map(v => ({
            date: v.date,
            type: 'voucher',
            number: v.number,
            description: v.description,
            debit: v.type === 'payment' ? v.amount : 0,
            credit: v.type === 'receipt' ? v.amount : 0
        }))
    ].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    let balance = 0;
    
    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">
                    <i class="fas fa-file-alt"></i>
                    كشف حساب العميل: ${customer.name}
                </h3>
                <button class="btn btn-secondary" onclick="viewCustomer('${customer.id}')">
                    <i class="fas fa-arrow-right"></i>
                    رجوع
                </button>
            </div>
            
            <div class="company-header">
                <div class="company-logo"><i class="fas fa-plane-departure"></i></div>
                <h2 class="company-name">${COMPANY_INFO.name}</h2>
                <p class="company-subtitle">كشف حساب عميل</p>
            </div>
            
            <div style="padding: 30px;">
                <div style="background: var(--light-bg); padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                    <h4>معلومات العميل</h4>
                    <p><strong>الاسم:</strong> ${customer.name}</p>
                    <p><strong>الهاتف:</strong> ${customer.phone || '-'}</p>
                    <p><strong>رقم الهوية:</strong> ${customer.id_number || '-'}</p>
                    <p><strong>الرصيد الحالي:</strong> 
                        <span style="font-size: 18px; font-weight: bold; color: ${customer.balance >= 0 ? 'var(--success-color)' : 'var(--danger-color)'};">
                            ${formatCurrency(Math.abs(customer.balance))} ${customer.balance >= 0 ? 'له' : 'عليه'}
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
                                balance += trans.debit - trans.credit;
                                return `
                                    <tr>
                                        <td>${formatDateShort(trans.date)}</td>
                                        <td>${trans.number}</td>
                                        <td>${trans.description}</td>
                                        <td>${trans.debit > 0 ? formatCurrency(trans.debit) : '-'}</td>
                                        <td>${trans.credit > 0 ? formatCurrency(trans.credit) : '-'}</td>
                                        <td style="font-weight: bold; color: ${balance >= 0 ? 'var(--success-color)' : 'var(--danger-color)'};">
                                            ${formatCurrency(Math.abs(balance))} ${balance >= 0 ? 'له' : 'عليه'}
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
                                <td style="color: ${balance >= 0 ? 'var(--success-color)' : 'var(--danger-color)'};">
                                    ${formatCurrency(Math.abs(balance))} ${balance >= 0 ? 'له' : 'عليه'}
                                </td>
                            </tr>
                        ` : ''}
                    </tbody>
                </table>
                
                <div style="margin-top: 30px;">
                    <button class="btn btn-primary" onclick="printCustomerStatement('${customer.id}')">
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

function printCustomerStatement(customerId) {
    const customer = findItem('customers', customerId);
    if (!customer) return;
    
    const invoices = getData('invoices') || [];
    const vouchers = getData('vouchers') || [];
    
    const customerInvoices = invoices.filter(inv => inv.customer_id === customerId);
    const customerVouchers = vouchers.filter(v => v.reference_type === 'customer' && v.reference_id === customerId);
    
    // Combine and sort transactions
    const transactions = [
        ...customerInvoices.map(inv => ({
            date: inv.date,
            type: 'invoice',
            number: inv.number,
            description: `فاتورة ${inv.type === 'sales' ? 'مبيعات' : 'مشتريات'}`,
            debit: inv.type === 'sales' ? inv.total : 0,
            credit: inv.type === 'purchase' ? inv.total : 0,
            currency: inv.currency || 'YER'
        })),
        ...customerVouchers.map(v => ({
            date: v.date,
            type: 'voucher',
            number: v.number,
            description: v.description,
            debit: v.type === 'payment' ? v.amount : 0,
            credit: v.type === 'receipt' ? v.amount : 0,
            currency: v.currency || 'YER'
        }))
    ].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    let balance = 0;
    
    let html = `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8">
            <title>كشف حساب العميل - ${customer.name}</title>
            <style>
                body {
                    font-family: 'Cairo', Arial, sans-serif;
                    direction: rtl;
                    margin: 20px;
                    font-size: 13px;
                }
                .customer-info {
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
            ${generateDocumentHeader('كشف حساب عميل')}
            
            <div class="customer-info">
                <h3 style="color: #f57c00; margin: 0 0 15px 0;">معلومات العميل</h3>
                <div class="info-row">
                    <div class="info-label">الاسم:</div>
                    <div style="flex: 1;">${customer.name}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">الهاتف:</div>
                    <div style="flex: 1; direction: ltr; text-align: right;">${customer.phone || '-'}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">البريد:</div>
                    <div style="flex: 1;">${customer.email || '-'}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">رقم الهوية:</div>
                    <div style="flex: 1; direction: ltr; text-align: right;">${customer.id_number || '-'}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">الرصيد الحالي:</div>
                    <div style="flex: 1; font-size: 16px;" class="${customer.balance >= 0 ? 'positive-balance' : 'negative-balance'}">
                        ${formatCurrency(Math.abs(customer.balance))} ${customer.balance >= 0 ? 'له' : 'عليه'}
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
                        <td class="${balance >= 0 ? 'positive-balance' : 'negative-balance'}">
                            ${formatCurrency(Math.abs(balance))} ${balance >= 0 ? 'له' : 'عليه'}
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
                        <td class="${balance >= 0 ? 'positive-balance' : 'negative-balance'}">
                            ${formatCurrency(Math.abs(balance))} ${balance >= 0 ? 'له' : 'عليه'}
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

function deleteCustomer(customerId) {
    const invoices = getData('invoices') || [];
    const bookings = getData('bookings') || [];
    
    const hasInvoices = invoices.some(inv => inv.customer_id === customerId);
    const hasBookings = bookings.some(b => b.customer_id === customerId);
    
    if (hasInvoices || hasBookings) {
        showAlert('لا يمكن حذف هذا العميل لوجود فواتير أو حجوزات مرتبطة به', 'danger');
        return;
    }
    
    if (!confirm('هل أنت متأكد من حذف هذا العميل؟')) return;
    
    deleteItem('customers', customerId);
    showAlert('تم حذف العميل بنجاح', 'success');
    loadCustomers();
}