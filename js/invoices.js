// ========================================
// وحدة الفواتير
// ========================================

function loadInvoices() {
    const content = document.getElementById('content');
    const allInvoices = getData('invoices') || [];
    
    // تطبيق تصفية العملة
    const invoices = filterInvoicesByCurrency(allInvoices);
    
    // الحصول على العملة المختارة
    const selectedCurrency = getGlobalCurrencyFilter();
    const currencyForDisplay = (selectedCurrency === 'all') ? null : selectedCurrency;
    
    content.innerHTML = `
        <div class="card">
            <div class="card-header">
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                    <h3 class="card-title" style="margin: 0;">
                        <i class="fas fa-file-invoice"></i>
                        الفواتير
                    </h3>
                    <div style="display: flex; gap: 10px; align-items: center;">
                        ${generateCurrencyFilterDropdown()}
                        <button class="btn btn-primary" onclick="openAddInvoiceModal('sales')">
                            <i class="fas fa-plus"></i>
                            فاتورة مبيعات
                        </button>
                        <button class="btn btn-secondary" onclick="openAddInvoiceModal('purchase')">
                            <i class="fas fa-plus"></i>
                            فاتورة مشتريات
                        </button>
                    </div>
                </div>
            </div>
            
            <div style="padding: 20px;">
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon success">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <div class="stat-content">
                            <h3>مدفوعة</h3>
                            <div class="stat-value">${invoices.filter(inv => inv.status === 'paid').length}</div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon warning">
                            <i class="fas fa-clock"></i>
                        </div>
                        <div class="stat-content">
                            <h3>جزئية</h3>
                            <div class="stat-value">${invoices.filter(inv => inv.status === 'partial').length}</div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon danger">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <div class="stat-content">
                            <h3>غير مدفوعة</h3>
                            <div class="stat-value">${invoices.filter(inv => inv.status === 'unpaid').length}</div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon primary">
                            <i class="fas fa-dollar-sign"></i>
                        </div>
                        <div class="stat-content">
                            <h3>الإجمالي</h3>
                            <div class="stat-value">${formatCurrency(invoices.reduce((sum, inv) => sum + inv.total, 0), currencyForDisplay)}</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th>رقم الفاتورة</th>
                            <th>النوع</th>
                            <th>التاريخ</th>
                            <th>العميل/المورد</th>
                            <th>نوع العملية</th>
                            <th>العملة</th>
                            <th>المبلغ</th>
                            <th>المدفوع</th>
                            <th>المتبقي</th>
                            <th>الحالة</th>
                            <th>إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${invoices.length === 0 ? 
                            '<tr><td colspan="10" style="text-align: center; padding: 40px;">لا توجد فواتير</td></tr>' : 
                            invoices.map(invoice => renderInvoiceRow(invoice)).join('')
                        }
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- Add/Edit Invoice Modal -->
        <div class="modal" id="invoiceModal">
            <div class="modal-content" style="max-width: 1000px;">
                <div class="modal-header">
                    <h3 class="modal-title" id="invoiceModalTitle">فاتورة جديدة</h3>
                    <button class="modal-close" onclick="hideModal('invoiceModal')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="invoiceForm" onsubmit="saveInvoice(event)">
                        <input type="hidden" id="invoiceId">
                        <input type="hidden" id="invoiceType">
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px;">
                            <div class="form-group">
                                <label class="form-label">التاريخ *</label>
                                <input type="date" class="form-control" id="invoiceDate" required value="${new Date().toISOString().split('T')[0]}">
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">العملة *</label>
                                <select class="form-control" id="invoiceCurrency" required onchange="updateCurrencySymbol()">
                                    ${getCurrencyOptions()}
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">نوع العملية *</label>
                                <select class="form-control" id="invoicePaymentType" required>
                                    <option value="cash">نقداً</option>
                                    <option value="credit">آجل</option>
                                </select>
                            </div>
                            
                            <div class="form-group" id="customerGroup" style="display: none;">
                                <label class="form-label">العميل *</label>
                                <select class="form-control" id="invoiceCustomer">
                                    <option value="">اختر العميل</option>
                                    ${renderCustomerOptions()}
                                </select>
                            </div>
                            
                            <div class="form-group" id="supplierGroup" style="display: none;">
                                <label class="form-label">المورد *</label>
                                <select class="form-control" id="invoiceSupplier">
                                    <option value="">اختر المورد</option>
                                    ${renderSupplierOptions()}
                                </select>
                            </div>
                        </div>
                        
                        <h4 style="margin: 20px 0 10px 0;">بنود الفاتورة</h4>
                        <div style="overflow-x: auto;">
                            <table class="table" id="invoiceItemsTable">
                                <thead>
                                    <tr>
                                        <th style="width: 40%;">الوصف</th>
                                        <th style="width: 15%;">الكمية</th>
                                        <th style="width: 15%;">السعر</th>
                                        <th style="width: 20%;">الإجمالي</th>
                                        <th style="width: 10%;"></th>
                                    </tr>
                                </thead>
                                <tbody id="invoiceItems">
                                    <tr class="invoice-item-row">
                                        <td><input type="text" class="form-control item-description" required></td>
                                        <td><input type="number" class="form-control item-quantity" min="1" value="1" required onchange="calculateInvoiceTotal()"></td>
                                        <td><input type="number" class="form-control item-price" min="0" step="0.01" required onchange="calculateInvoiceTotal()"></td>
                                        <td><input type="number" class="form-control item-total" readonly></td>
                                        <td><button type="button" class="btn btn-sm btn-danger" onclick="removeInvoiceItem(this)"><i class="fas fa-trash"></i></button></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        
                        <button type="button" class="btn btn-secondary" onclick="addInvoiceItem()">
                            <i class="fas fa-plus"></i>
                            إضافة بند
                        </button>
                        
                        <div style="margin-top: 30px; background: var(--light-bg); padding: 20px; border-radius: 8px;">
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                                <div>
                                    <div class="form-group">
                                        <label class="form-label">الخصم</label>
                                        <input type="number" class="form-control" id="invoiceDiscount" min="0" step="0.01" value="0" onchange="calculateInvoiceTotal()">
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">الضريبة %</label>
                                        <input type="number" class="form-control" id="invoiceTax" min="0" max="100" step="0.01" value="0" onchange="calculateInvoiceTotal()">
                                    </div>
                                </div>
                                
                                <div>
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                        <strong>المجموع الفرعي:</strong>
                                        <span id="invoiceSubtotal">0.00 ريال</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                        <strong>الخصم:</strong>
                                        <span id="invoiceDiscountAmount">0.00 ريال</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                        <strong>الضريبة:</strong>
                                        <span id="invoiceTaxAmount">0.00 ريال</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; padding-top: 10px; border-top: 2px solid var(--border-color);">
                                        <strong>الإجمالي:</strong>
                                        <span id="invoiceTotal">0.00 ريال</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="document.getElementById('invoiceForm').requestSubmit()">
                        <i class="fas fa-save"></i>
                        حفظ الفاتورة
                    </button>
                    <button class="btn btn-secondary" onclick="hideModal('invoiceModal')">
                        <i class="fas fa-times"></i>
                        إلغاء
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Payment Modal -->
        <div class="modal" id="paymentModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">تسجيل دفعة</h3>
                    <button class="modal-close" onclick="hideModal('paymentModal')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="paymentForm" onsubmit="savePayment(event)">
                        <input type="hidden" id="paymentInvoiceId">
                        
                        <div class="form-group">
                            <label class="form-label">المبلغ المتبقي</label>
                            <input type="text" class="form-control" id="paymentRemaining" readonly>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">المبلغ المدفوع *</label>
                            <input type="number" class="form-control" id="paymentAmount" min="0" step="0.01" required>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">طريقة الدفع *</label>
                            <select class="form-control" id="paymentMethod" required>
                                <option value="cash">نقدي</option>
                                <option value="bank">بنك</option>
                                <option value="check">شيك</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">التاريخ *</label>
                            <input type="date" class="form-control" id="paymentDate" required value="${new Date().toISOString().split('T')[0]}">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">ملاحظات</label>
                            <textarea class="form-control" id="paymentNotes"></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="document.getElementById('paymentForm').requestSubmit()">
                        <i class="fas fa-save"></i>
                        حفظ الدفعة
                    </button>
                    <button class="btn btn-secondary" onclick="hideModal('paymentModal')">
                        <i class="fas fa-times"></i>
                        إلغاء
                    </button>
                </div>
            </div>
        </div>
    `;
}

function renderInvoiceRow(invoice) {
    const customers = getData('customers') || [];
    const suppliers = getData('suppliers') || [];
    
    const party = invoice.type === 'sales' 
        ? customers.find(c => c.id === invoice.customer_id)
        : suppliers.find(s => s.id === invoice.supplier_id);
    
    const statusColors = {
        paid: 'success',
        partial: 'warning',
        unpaid: 'danger'
    };
    
    const statusLabels = {
        paid: 'مدفوعة',
        partial: 'جزئية',
        unpaid: 'غير مدفوعة'
    };
    
    const remaining = invoice.total - invoice.paid;
    
    const currency = invoice.currency || 'YER';
    const paymentType = invoice.payment_type || 'credit';
    
    return `
        <tr>
            <td>${invoice.number}</td>
            <td>
                <span class="badge" style="padding: 5px 10px; border-radius: 4px; background: ${invoice.type === 'sales' ? 'var(--success-color)' : 'var(--info-color)'}; color: white;">
                    ${invoice.type === 'sales' ? 'مبيعات' : 'مشتريات'}
                </span>
            </td>
            <td>${formatDateShort(invoice.date)}</td>
            <td>${party ? party.name : 'غير محدد'}</td>
            <td>
                <span class="badge" style="padding: 4px 8px; border-radius: 4px; background: ${paymentType === 'cash' ? '#4caf50' : '#ff9800'}; color: white; font-size: 0.85em;">
                    ${paymentType === 'cash' ? 'نقداً' : 'آجل'}
                </span>
            </td>
            <td><span class="badge" style="padding: 4px 8px; border-radius: 4px; background: var(--primary-color); color: white; font-size: 0.85em;">${CURRENCIES[currency].name}</span></td>
            <td>${formatCurrency(invoice.total, currency)}</td>
            <td>${formatCurrency(invoice.paid, currency)}</td>
            <td style="color: ${remaining > 0 ? 'var(--danger-color)' : 'var(--success-color)'}; font-weight: bold;">
                ${formatCurrency(remaining, currency)}
            </td>
            <td>
                <span class="badge" style="padding: 5px 10px; border-radius: 4px; background: var(--${statusColors[invoice.status]}-color); color: white;">
                    ${statusLabels[invoice.status]}
                </span>
            </td>
            <td>
                <div class="action-btns">
                    <button class="btn btn-sm btn-view" onclick="viewInvoice('${invoice.id}')" title="عرض">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${invoice.status !== 'paid' ? `
                        <button class="btn btn-sm btn-success" onclick="openPaymentModal('${invoice.id}')" title="تسجيل دفعة">
                            <i class="fas fa-dollar-sign"></i>
                        </button>
                    ` : ''}
                    <button class="btn btn-sm btn-print" onclick="printInvoice('${invoice.id}')" title="طباعة">
                        <i class="fas fa-print"></i>
                    </button>
                    <button class="btn btn-sm btn-delete" onclick="deleteInvoice('${invoice.id}')" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `;
}

function renderCustomerOptions() {
    const customers = getData('customers') || [];
    return customers.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
}

function renderSupplierOptions() {
    const suppliers = getData('suppliers') || [];
    return suppliers.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
}

function openAddInvoiceModal(type) {
    document.getElementById('invoiceForm').reset();
    document.getElementById('invoiceId').value = '';
    document.getElementById('invoiceType').value = type;
    document.getElementById('invoiceModalTitle').textContent = type === 'sales' ? 'فاتورة مبيعات جديدة' : 'فاتورة مشتريات جديدة';
    
    // Show/hide customer or supplier field
    if (type === 'sales') {
        document.getElementById('customerGroup').style.display = 'block';
        document.getElementById('supplierGroup').style.display = 'none';
        document.getElementById('invoiceCustomer').required = true;
        document.getElementById('invoiceSupplier').required = false;
    } else {
        document.getElementById('customerGroup').style.display = 'none';
        document.getElementById('supplierGroup').style.display = 'block';
        document.getElementById('invoiceCustomer').required = false;
        document.getElementById('invoiceSupplier').required = true;
    }
    
    // Reset items
    const tbody = document.getElementById('invoiceItems');
    tbody.innerHTML = `
        <tr class="invoice-item-row">
            <td><input type="text" class="form-control item-description" required></td>
            <td><input type="number" class="form-control item-quantity" min="1" value="1" required onchange="calculateInvoiceTotal()"></td>
            <td><input type="number" class="form-control item-price" min="0" step="0.01" required onchange="calculateInvoiceTotal()"></td>
            <td><input type="number" class="form-control item-total" readonly></td>
            <td><button type="button" class="btn btn-sm btn-danger" onclick="removeInvoiceItem(this)"><i class="fas fa-trash"></i></button></td>
        </tr>
    `;
    
    calculateInvoiceTotal();
    showModal('invoiceModal');
}

function addInvoiceItem() {
    const tbody = document.getElementById('invoiceItems');
    const row = document.createElement('tr');
    row.className = 'invoice-item-row';
    row.innerHTML = `
        <td><input type="text" class="form-control item-description" required></td>
        <td><input type="number" class="form-control item-quantity" min="1" value="1" required onchange="calculateInvoiceTotal()"></td>
        <td><input type="number" class="form-control item-price" min="0" step="0.01" required onchange="calculateInvoiceTotal()"></td>
        <td><input type="number" class="form-control item-total" readonly></td>
        <td><button type="button" class="btn btn-sm btn-danger" onclick="removeInvoiceItem(this)"><i class="fas fa-trash"></i></button></td>
    `;
    tbody.appendChild(row);
}

function removeInvoiceItem(btn) {
    const rows = document.querySelectorAll('.invoice-item-row');
    if (rows.length > 1) {
        btn.closest('tr').remove();
        calculateInvoiceTotal();
    } else {
        showAlert('يجب أن تحتوي الفاتورة على بند واحد على الأقل', 'warning');
    }
}

function calculateInvoiceTotal() {
    const rows = document.querySelectorAll('.invoice-item-row');
    let subtotal = 0;
    
    rows.forEach(row => {
        const quantity = parseFloat(row.querySelector('.item-quantity').value) || 0;
        const price = parseFloat(row.querySelector('.item-price').value) || 0;
        const total = quantity * price;
        row.querySelector('.item-total').value = total.toFixed(2);
        subtotal += total;
    });
    
    const discount = parseFloat(document.getElementById('invoiceDiscount').value) || 0;
    const taxRate = parseFloat(document.getElementById('invoiceTax').value) || 0;
    
    const afterDiscount = subtotal - discount;
    const taxAmount = afterDiscount * (taxRate / 100);
    const total = afterDiscount + taxAmount;
    
    const currency = document.getElementById('invoiceCurrency') ? document.getElementById('invoiceCurrency').value : 'YER';
    document.getElementById('invoiceSubtotal').textContent = formatCurrency(subtotal, currency);
    document.getElementById('invoiceDiscountAmount').textContent = formatCurrency(discount, currency);
    document.getElementById('invoiceTaxAmount').textContent = formatCurrency(taxAmount, currency);
    document.getElementById('invoiceTotal').textContent = formatCurrency(total, currency);
}

function updateCurrencySymbol() {
    calculateInvoiceTotal();
}

function saveInvoice(event) {
    event.preventDefault();
    
    const id = document.getElementById('invoiceId').value;
    const type = document.getElementById('invoiceType').value;
    const date = document.getElementById('invoiceDate').value;
    const currency = document.getElementById('invoiceCurrency').value;
    const paymentType = document.getElementById('invoicePaymentType').value;
    const customerId = type === 'sales' ? document.getElementById('invoiceCustomer').value : null;
    const supplierId = type === 'purchase' ? document.getElementById('invoiceSupplier').value : null;
    
    // Collect items
    const rows = document.querySelectorAll('.invoice-item-row');
    const items = [];
    rows.forEach(row => {
        const description = row.querySelector('.item-description').value;
        const quantity = parseFloat(row.querySelector('.item-quantity').value);
        const price = parseFloat(row.querySelector('.item-price').value);
        const total = quantity * price;
        items.push({ description, quantity, price, total });
    });
    
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const discount = parseFloat(document.getElementById('invoiceDiscount').value) || 0;
    const taxRate = parseFloat(document.getElementById('invoiceTax').value) || 0;
    const tax = (subtotal - discount) * (taxRate / 100);
    const total = subtotal - discount + tax;
    
    const invoice = {
        id: id || generateId(),
        number: id ? findItem('invoices', id).number : generateInvoiceNumber(),
        type,
        date,
        currency,
        payment_type: paymentType,
        customer_id: customerId,
        supplier_id: supplierId,
        items,
        subtotal,
        tax,
        discount,
        total,
        paid: id ? findItem('invoices', id).paid : (paymentType === 'cash' ? total : 0),
        status: id ? findItem('invoices', id).status : (paymentType === 'cash' ? 'paid' : 'unpaid')
    };
    
    if (id) {
        updateItem('invoices', id, invoice);
        showAlert('تم تحديث الفاتورة بنجاح', 'success');
        
        // تحديث القيد التلقائي
        if (typeof updateAutoPostedEntry === 'function') {
            updateAutoPostedEntry('invoice', id, invoice);
        }
    } else {
        addItem('invoices', invoice);
        showAlert('تم إضافة الفاتورة بنجاح', 'success');
        
        // ترحيل تلقائي
        if (typeof autoPostSalesInvoice === 'function' && type === 'sales') {
            autoPostSalesInvoice(invoice);
        } else if (typeof autoPostPurchaseInvoice === 'function' && type === 'purchase') {
            autoPostPurchaseInvoice(invoice);
        }
    }
    
    hideModal('invoiceModal');
    loadInvoices();
}

function viewInvoice(invoiceId) {
    const invoice = findItem('invoices', invoiceId);
    if (!invoice) return;
    
    const customers = getData('customers') || [];
    const suppliers = getData('suppliers') || [];
    
    const party = invoice.type === 'sales' 
        ? customers.find(c => c.id === invoice.customer_id)
        : suppliers.find(s => s.id === invoice.supplier_id);
    
    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">
                    <i class="fas fa-file-invoice"></i>
                    تفاصيل الفاتورة
                </h3>
                <button class="btn btn-secondary" onclick="loadInvoices()">
                    <i class="fas fa-arrow-right"></i>
                    رجوع
                </button>
            </div>
            
            <div class="company-header">
                <div class="company-logo"><i class="fas fa-plane-departure"></i></div>
                <h2 class="company-name">${COMPANY_INFO.name}</h2>
                <p class="company-subtitle">${COMPANY_INFO.location}</p>
            </div>
            
            <div style="padding: 30px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
                    <div>
                        <h4>معلومات الفاتورة</h4>
                        <p><strong>رقم الفاتورة:</strong> ${invoice.number}</p>
                        <p><strong>النوع:</strong> ${invoice.type === 'sales' ? 'مبيعات' : 'مشتريات'}</p>
                        <p><strong>التاريخ:</strong> ${formatDate(invoice.date)}</p>
                    </div>
                    <div>
                        <h4>${invoice.type === 'sales' ? 'بيانات العميل' : 'بيانات المورد'}</h4>
                        <p><strong>الاسم:</strong> ${party ? party.name : 'غير محدد'}</p>
                        <p><strong>الهاتف:</strong> ${party ? party.phone : '-'}</p>
                        ${party && party.email ? `<p><strong>البريد:</strong> ${party.email}</p>` : ''}
                    </div>
                </div>
                
                <table class="table">
                    <thead>
                        <tr>
                            <th>الوصف</th>
                            <th>الكمية</th>
                            <th>السعر</th>
                            <th>الإجمالي</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${invoice.items.map(item => `
                            <tr>
                                <td>${item.description}</td>
                                <td>${item.quantity}</td>
                                <td>${formatCurrency(item.price, invoice.currency)}</td>
                                <td>${formatCurrency(item.total, invoice.currency)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <div style="max-width: 400px; margin-right: auto; margin-top: 30px;">
                    <div style="display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid var(--border-color);">
                        <strong>المجموع الفرعي:</strong>
                        <span>${formatCurrency(invoice.subtotal, invoice.currency)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid var(--border-color);">
                        <strong>الخصم:</strong>
                        <span>${formatCurrency(invoice.discount, invoice.currency)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid var(--border-color);">
                        <strong>الضريبة:</strong>
                        <span>${formatCurrency(invoice.tax, invoice.currency)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 15px; background: var(--light-bg); font-size: 18px; font-weight: bold;">
                        <strong>الإجمالي:</strong>
                        <span>${formatCurrency(invoice.total, invoice.currency)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 10px; border-top: 2px solid var(--border-color);">
                        <strong>المدفوع:</strong>
                        <span style="color: var(--success-color);">${formatCurrency(invoice.paid, invoice.currency)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 10px; font-weight: bold;">
                        <strong>المتبقي:</strong>
                        <span style="color: var(--danger-color);">${formatCurrency(invoice.total - invoice.paid, invoice.currency)}</span>
                    </div>
                </div>
                
                <div style="margin-top: 30px;">
                    ${invoice.status !== 'paid' ? `
                        <button class="btn btn-success" onclick="openPaymentModal('${invoice.id}')">
                            <i class="fas fa-dollar-sign"></i>
                            تسجيل دفعة
                        </button>
                    ` : ''}
                    <button class="btn btn-primary" onclick="printInvoice('${invoice.id}')">
                        <i class="fas fa-print"></i>
                        طباعة الفاتورة
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

function openPaymentModal(invoiceId) {
    const invoice = findItem('invoices', invoiceId);
    if (!invoice) return;
    
    const remaining = invoice.total - invoice.paid;
    
    document.getElementById('paymentInvoiceId').value = invoiceId;
    document.getElementById('paymentRemaining').value = formatCurrency(remaining);
    document.getElementById('paymentAmount').value = remaining.toFixed(2);
    document.getElementById('paymentAmount').max = remaining;
    
    showModal('paymentModal');
}

function savePayment(event) {
    event.preventDefault();
    
    const invoiceId = document.getElementById('paymentInvoiceId').value;
    const amount = parseFloat(document.getElementById('paymentAmount').value);
    const method = document.getElementById('paymentMethod').value;
    const date = document.getElementById('paymentDate').value;
    const notes = document.getElementById('paymentNotes').value;
    
    const invoice = findItem('invoices', invoiceId);
    if (!invoice) return;
    
    const newPaid = invoice.paid + amount;
    const status = newPaid >= invoice.total ? 'paid' : newPaid > 0 ? 'partial' : 'unpaid';
    
    updateItem('invoices', invoiceId, { paid: newPaid, status });
    
    // Create voucher مع العملة من الفاتورة
    const voucher = {
        id: generateId(),
        number: generateVoucherNumber('receipt'),
        type: invoice.type === 'sales' ? 'receipt' : 'payment',
        date,
        currency: invoice.currency || 'YER', // إضافة العملة من الفاتورة
        amount,
        account_id: method === 'cash' ? '1111' : '1112',
        reference_type: invoice.type === 'sales' ? 'customer' : 'supplier',
        reference_id: invoice.type === 'sales' ? invoice.customer_id : invoice.supplier_id,
        description: `${notes || ''} - فاتورة رقم: ${invoice.number}`,
        payment_method: method,
        operation_type: 'cash' // الدفعة دائماً نقداً
    };
    
    addItem('vouchers', voucher);
    
    // إنشاء قيد محاسبي تلقائياً
    createVoucherJournalEntry(voucher);
    
    hideModal('paymentModal');
    showAlert('تم تسجيل الدفعة بنجاح', 'success');
    
    // Reload current view
    if (document.getElementById('content').querySelector('.company-header')) {
        viewInvoice(invoiceId);
    } else {
        loadInvoices();
    }
}

function printInvoice(invoiceId) {
    viewInvoice(invoiceId);
    setTimeout(() => window.print(), 500);
}

function deleteInvoice(invoiceId) {
    if (!confirm('هل أنت متأكد من حذف هذه الفاتورة؟')) return;
    
    deleteItem('invoices', invoiceId);
    showAlert('تم حذف الفاتورة بنجاح', 'success');
    loadInvoices();
}