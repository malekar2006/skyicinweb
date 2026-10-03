/**
 * نظام الاستعلام المتقدم
 * Advanced Search System
 * v2.0.0 - Enhanced Version
 * 
 * المميزات الجديدة:
 * - بحث متقدم مع 10+ معايير
 * - إحصائيات فورية للنتائج
 * - فرز وترتيب النتائج
 * - حفظ معايير البحث
 * - تصدير متقدم (Excel, PDF)
 * - عرض بياني للنتائج
 */

// عرض نافذة الاستعلام المتقدم
function showAdvancedSearch() {
    loadModulePage();
    const mainContent = document.getElementById('mainContent');
    
    mainContent.innerHTML = `
        <div class="page-header">
            <div class="header-content">
                <div>
                    <h1><i class="fas fa-search"></i> الاستعلام المتقدم</h1>
                    <p>البحث في جميع بيانات النظام بمعايير متعددة</p>
                </div>
                <div class="header-actions">
                    <button class="btn btn-info" onclick="loadSavedSearches()" title="عمليات البحث المحفوظة">
                        <i class="fas fa-bookmark"></i>
                        المحفوظة
                    </button>
                    <button class="btn btn-success" onclick="saveSavedSearch()" title="حفظ معايير البحث الحالية">
                        <i class="fas fa-save"></i>
                        حفظ
                    </button>
                    <button class="btn btn-secondary" onclick="resetAdvancedSearch()">
                        <i class="fas fa-redo"></i>
                        إعادة تعيين
                    </button>
                    <button class="btn btn-primary" onclick="executeAdvancedSearch()">
                        <i class="fas fa-search"></i>
                        بحث
                    </button>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="card-header">
                <h3><i class="fas fa-filter"></i> معايير البحث</h3>
            </div>
            <div class="card-body">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
                    <!-- نوع البيانات -->
                    <div class="form-group">
                        <label class="form-label">
                            <i class="fas fa-database"></i>
                            نوع البيانات
                        </label>
                        <select class="form-control" id="searchDataType" onchange="updateSearchFields()">
                            <option value="all">الكل</option>
                            <option value="invoices">الفواتير</option>
                            <option value="vouchers">السندات</option>
                            <option value="bookings">الحجوزات</option>
                            <option value="journal">القيود اليومية</option>
                            <option value="customers">العملاء</option>
                            <option value="suppliers">الموردين</option>
                            <option value="sentPassports">الجوازات المرسلة</option>
                        </select>
                    </div>

                    <!-- العملة -->
                    <div class="form-group">
                        <label class="form-label">
                            <i class="fas fa-coins"></i>
                            العملة
                        </label>
                        <select class="form-control" id="searchCurrency">
                            <option value="">الكل</option>
                            <option value="YER">ريال يمني</option>
                            <option value="SAR">ريال سعودي</option>
                            <option value="USD">دولار أمريكي</option>
                        </select>
                    </div>

                    <!-- الاسم -->
                    <div class="form-group">
                        <label class="form-label">
                            <i class="fas fa-user"></i>
                            الاسم
                        </label>
                        <input type="text" class="form-control" id="searchName" placeholder="ابحث بالاسم..." onkeyup="quickSearch()">
                    </div>

                    <!-- رقم الحجز -->
                    <div class="form-group">
                        <label class="form-label">
                            <i class="fas fa-ticket-alt"></i>
                            رقم الحجز
                        </label>
                        <input type="text" class="form-control" id="searchBookingNumber" placeholder="رقم الحجز...">
                    </div>

                    <!-- الوجهة -->
                    <div class="form-group">
                        <label class="form-label">
                            <i class="fas fa-map-marker-alt"></i>
                            الوجهة / المكان
                        </label>
                        <input type="text" class="form-control" id="searchDestination" placeholder="الوجهة...">
                    </div>

                    <!-- التاريخ من -->
                    <div class="form-group">
                        <label class="form-label">
                            <i class="fas fa-calendar-alt"></i>
                            التاريخ من
                        </label>
                        <input type="date" class="form-control" id="searchDateFrom">
                    </div>

                    <!-- التاريخ إلى -->
                    <div class="form-group">
                        <label class="form-label">
                            <i class="fas fa-calendar-alt"></i>
                            التاريخ إلى
                        </label>
                        <input type="date" class="form-control" id="searchDateTo">
                    </div>

                    <!-- العميل -->
                    <div class="form-group">
                        <label class="form-label">
                            <i class="fas fa-user-tie"></i>
                            العميل
                        </label>
                        <select class="form-control" id="searchCustomer">
                            <option value="">الكل</option>
                            ${renderCustomerOptions()}
                        </select>
                    </div>

                    <!-- المورد -->
                    <div class="form-group">
                        <label class="form-label">
                            <i class="fas fa-truck"></i>
                            المورد
                        </label>
                        <select class="form-control" id="searchSupplier">
                            <option value="">الكل</option>
                            ${renderSupplierOptions()}
                        </select>
                    </div>

                    <!-- المبلغ من -->
                    <div class="form-group">
                        <label class="form-label">
                            <i class="fas fa-dollar-sign"></i>
                            المبلغ من
                        </label>
                        <input type="number" class="form-control" id="searchAmountFrom" placeholder="0">
                    </div>

                    <!-- المبلغ إلى -->
                    <div class="form-group">
                        <label class="form-label">
                            <i class="fas fa-dollar-sign"></i>
                            المبلغ إلى
                        </label>
                        <input type="number" class="form-control" id="searchAmountTo" placeholder="0">
                    </div>

                    <!-- الحالة (للحجوزات والفواتير) -->
                    <div class="form-group">
                        <label class="form-label">
                            <i class="fas fa-info-circle"></i>
                            الحالة
                        </label>
                        <select class="form-control" id="searchStatus">
                            <option value="">الكل</option>
                            <option value="confirmed">مؤكد</option>
                            <option value="pending">معلق</option>
                            <option value="cancelled">ملغي</option>
                            <option value="paid">مدفوع</option>
                            <option value="unpaid">غير مدفوع</option>
                            <option value="partial">مدفوع جزئياً</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>

        <!-- نتائج البحث -->
        <div class="card" id="searchResults" style="display: none;">
            <div class="card-header">
                <h3><i class="fas fa-list"></i> نتائج البحث (<span id="resultsCount">0</span>)</h3>
                <div class="card-actions">
                    <button class="btn btn-success" onclick="exportSearchResults()">
                        <i class="fas fa-file-excel"></i>
                        تصدير Excel
                    </button>
                    <button class="btn btn-danger" onclick="exportSearchResultsToPDF()">
                        <i class="fas fa-file-pdf"></i>
                        حفظ PDF
                    </button>
                    <button class="btn btn-primary" onclick="printSearchResults()">
                        <i class="fas fa-print"></i>
                        طباعة
                    </button>
                </div>
            </div>
            <div class="card-body">
                <div class="table-responsive" id="searchResultsTable">
                    <!-- ستظهر النتائج هنا -->
                </div>
            </div>
        </div>
    `;
}

// رسم خيارات العملاء
function renderCustomerOptions() {
    const customers = getData('customers') || [];
    return customers.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
}

// رسم خيارات الموردين
function renderSupplierOptions() {
    const suppliers = getData('suppliers') || [];
    return suppliers.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
}

// تنفيذ البحث المتقدم
function executeAdvancedSearch() {
    // جمع معايير البحث
    const criteria = {
        dataType: document.getElementById('searchDataType').value,
        currency: document.getElementById('searchCurrency').value,
        name: document.getElementById('searchName').value.trim().toLowerCase(),
        bookingNumber: document.getElementById('searchBookingNumber').value.trim().toLowerCase(),
        destination: document.getElementById('searchDestination').value.trim().toLowerCase(),
        dateFrom: document.getElementById('searchDateFrom').value,
        dateTo: document.getElementById('searchDateTo').value,
        customerId: document.getElementById('searchCustomer').value,
        supplierId: document.getElementById('searchSupplier').value,
        amountFrom: parseFloat(document.getElementById('searchAmountFrom').value) || 0,
        amountTo: parseFloat(document.getElementById('searchAmountTo').value) || Infinity,
        status: document.getElementById('searchStatus').value
    };

    // تنفيذ البحث
    let results = [];
    
    if (criteria.dataType === 'all' || criteria.dataType === 'invoices') {
        results = results.concat(searchInvoices(criteria));
    }
    if (criteria.dataType === 'all' || criteria.dataType === 'vouchers') {
        results = results.concat(searchVouchers(criteria));
    }
    if (criteria.dataType === 'all' || criteria.dataType === 'bookings') {
        results = results.concat(searchBookings(criteria));
    }
    if (criteria.dataType === 'all' || criteria.dataType === 'journal') {
        results = results.concat(searchJournal(criteria));
    }
    if (criteria.dataType === 'all' || criteria.dataType === 'customers') {
        results = results.concat(searchCustomers(criteria));
    }
    if (criteria.dataType === 'all' || criteria.dataType === 'suppliers') {
        results = results.concat(searchSuppliers(criteria));
    }
    if (criteria.dataType === 'all' || criteria.dataType === 'sentPassports') {
        results = results.concat(searchSentPassports(criteria));
    }

    // عرض النتائج
    displaySearchResults(results);
}

// البحث في الفواتير
function searchInvoices(criteria) {
    const invoices = getData('invoices') || [];
    return invoices.filter(inv => {
        // فلترة حسب المعايير
        if (criteria.currency && inv.currency !== criteria.currency) return false;
        if (criteria.dateFrom && inv.date < criteria.dateFrom) return false;
        if (criteria.dateTo && inv.date > criteria.dateTo) return false;
        if (criteria.customerId && inv.customer_id !== criteria.customerId) return false;
        if (criteria.supplierId && inv.supplier_id !== criteria.supplierId) return false;
        if (inv.total < criteria.amountFrom || inv.total > criteria.amountTo) return false;
        if (criteria.status && inv.status !== criteria.status) return false;
        if (criteria.name && !inv.number?.toLowerCase().includes(criteria.name)) return false;
        
        return true;
    }).map(inv => ({
        type: 'فاتورة',
        ...inv,
        displayDate: formatDateShort(inv.date),
        displayAmount: formatCurrency(inv.total, inv.currency || 'YER')
    }));
}

// البحث في السندات
function searchVouchers(criteria) {
    const vouchers = getData('vouchers') || [];
    return vouchers.filter(v => {
        if (criteria.currency && v.currency !== criteria.currency) return false;
        if (criteria.dateFrom && v.date < criteria.dateFrom) return false;
        if (criteria.dateTo && v.date > criteria.dateTo) return false;
        if (criteria.customerId && v.customer_id !== criteria.customerId) return false;
        if (criteria.supplierId && v.supplier_id !== criteria.supplierId) return false;
        if (v.amount < criteria.amountFrom || v.amount > criteria.amountTo) return false;
        if (criteria.name && !v.number?.toLowerCase().includes(criteria.name)) return false;
        
        return true;
    }).map(v => ({
        type: 'سند',
        ...v,
        displayDate: formatDateShort(v.date),
        displayAmount: formatCurrency(v.amount, v.currency || 'YER')
    }));
}

// البحث في الحجوزات
function searchBookings(criteria) {
    const bookings = getData('bookings') || [];
    return bookings.filter(b => {
        if (criteria.currency && b.currency !== criteria.currency) return false;
        if (criteria.dateFrom && b.bookingDate < criteria.dateFrom) return false;
        if (criteria.dateTo && b.bookingDate > criteria.dateTo) return false;
        if (criteria.customerId && b.customer_id !== criteria.customerId) return false;
        if (criteria.bookingNumber && !b.bookingNumber?.toLowerCase().includes(criteria.bookingNumber)) return false;
        if (criteria.destination && !b.bookingDestination?.toLowerCase().includes(criteria.destination)) return false;
        if (b.amount < criteria.amountFrom || b.amount > criteria.amountTo) return false;
        if (criteria.status && b.status !== criteria.status) return false;
        if (criteria.name && !b.customerName?.toLowerCase().includes(criteria.name)) return false;
        
        return true;
    }).map(b => ({
        type: 'حجز',
        ...b,
        displayDate: formatDateShort(b.bookingDate),
        displayAmount: formatCurrency(b.amount, b.currency || 'YER')
    }));
}

// البحث في القيود اليومية
function searchJournal(criteria) {
    const journal = getData('journal') || [];
    return journal.filter(j => {
        if (criteria.currency && j.currency !== criteria.currency) return false;
        if (criteria.dateFrom && j.date < criteria.dateFrom) return false;
        if (criteria.dateTo && j.date > criteria.dateTo) return false;
        if (criteria.name && !j.description?.toLowerCase().includes(criteria.name)) return false;
        
        const totalAmount = j.items?.reduce((sum, item) => sum + (parseFloat(item.debit) || 0), 0) || 0;
        if (totalAmount < criteria.amountFrom || totalAmount > criteria.amountTo) return false;
        
        return true;
    }).map(j => ({
        type: 'قيد يومي',
        ...j,
        displayDate: formatDateShort(j.date),
        displayAmount: formatCurrency(
            j.items?.reduce((sum, item) => sum + (parseFloat(item.debit) || 0), 0) || 0,
            j.currency || 'YER'
        )
    }));
}

// البحث في العملاء
function searchCustomers(criteria) {
    const customers = getData('customers') || [];
    return customers.filter(c => {
        if (criteria.name && !c.name?.toLowerCase().includes(criteria.name)) return false;
        return true;
    }).map(c => ({
        type: 'عميل',
        ...c,
        displayDate: '-',
        displayAmount: formatCurrency(c.balance || 0, 'YER')
    }));
}

// البحث في الموردين
function searchSuppliers(criteria) {
    const suppliers = getData('suppliers') || [];
    return suppliers.filter(s => {
        if (criteria.name && !s.name?.toLowerCase().includes(criteria.name)) return false;
        return true;
    }).map(s => ({
        type: 'مورد',
        ...s,
        displayDate: '-',
        displayAmount: formatCurrency(s.balance || 0, 'YER')
    }));
}

// البحث في الجوازات المرسلة
function searchSentPassports(criteria) {
    const passports = getData('sentPassports') || [];
    return passports.filter(p => {
        if (criteria.name && !p.name?.toLowerCase().includes(criteria.name)) return false;
        if (criteria.bookingNumber && !p.bookingNumber?.toLowerCase().includes(criteria.bookingNumber)) return false;
        if (criteria.destination && !p.sendLocation?.toLowerCase().includes(criteria.destination)) return false;
        if (criteria.dateFrom && p.date < criteria.dateFrom) return false;
        if (criteria.dateTo && p.date > criteria.dateTo) return false;
        
        return true;
    }).map(p => ({
        type: 'جواز مرسل',
        ...p,
        displayDate: formatDateShort(p.date),
        displayAmount: '-'
    }));
}

// عرض نتائج البحث
function displaySearchResults(results) {
    const resultsDiv = document.getElementById('searchResults');
    const resultsCount = document.getElementById('resultsCount');
    const tableDiv = document.getElementById('searchResultsTable');
    
    resultsCount.textContent = results.length;
    
    if (results.length === 0) {
        resultsDiv.style.display = 'block';
        tableDiv.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #999;">
                <i class="fas fa-search fa-3x" style="margin-bottom: 15px;"></i>
                <p>لم يتم العثور على نتائج</p>
            </div>
        `;
        return;
    }
    
    resultsDiv.style.display = 'block';
    
    // عرض الإحصائيات
    const statsHTML = displaySearchStatistics(results);
    
    // رسم جدول النتائج مع الإحصائيات
    tableDiv.innerHTML = `
        ${statsHTML}
        
        <table class="table">
            <thead>
                <tr>
                    <th onclick="sortSearchResults('index')" style="cursor: pointer;">
                        م <i class="fas fa-sort"></i>
                    </th>
                    <th onclick="sortSearchResults('type')" style="cursor: pointer;">
                        النوع <i class="fas fa-sort"></i>
                    </th>
                    <th onclick="sortSearchResults('displayDate')" style="cursor: pointer;">
                        التاريخ <i class="fas fa-sort"></i>
                    </th>
                    <th>الوصف</th>
                    <th onclick="sortSearchResults('currency')" style="cursor: pointer;">
                        العملة <i class="fas fa-sort"></i>
                    </th>
                    <th onclick="sortSearchResults('amount')" style="cursor: pointer;">
                        المبلغ <i class="fas fa-sort"></i>
                    </th>
                    <th onclick="sortSearchResults('status')" style="cursor: pointer;">
                        الحالة <i class="fas fa-sort"></i>
                    </th>
                </tr>
            </thead>
            <tbody>
                ${results.map((r, i) => `
                    <tr>
                        <td>${i + 1}</td>
                        <td><span class="badge bg-info">${r.type}</span></td>
                        <td>${r.displayDate}</td>
                        <td>
                            ${r.description || r.name || r.number || r.bookingNumber || '-'}
                        </td>
                        <td>${r.currency || '-'}</td>
                        <td><strong>${r.displayAmount}</strong></td>
                        <td>
                            ${r.status ? `<span class="badge ${getStatusBadge(r.status)}">${getStatusLabel(r.status)}</span>` : '-'}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    // حفظ النتائج للطباعة والتصدير
    window.currentSearchResults = results;
}

// الحصول على تسمية الحالة
function getStatusLabel(status) {
    const labels = {
        'confirmed': 'مؤكد',
        'pending': 'معلق',
        'cancelled': 'ملغي',
        'paid': 'مدفوع',
        'unpaid': 'غير مدفوع',
        'partial': 'مدفوع جزئياً'
    };
    return labels[status] || status;
}

// الحصول على فئة الحالة
function getStatusBadge(status) {
    const badges = {
        'confirmed': 'bg-success',
        'pending': 'bg-warning',
        'cancelled': 'bg-danger',
        'paid': 'bg-success',
        'unpaid': 'bg-danger',
        'partial': 'bg-warning'
    };
    return badges[status] || 'bg-secondary';
}

// إعادة تعيين البحث
function resetAdvancedSearch() {
    document.getElementById('searchDataType').value = 'all';
    document.getElementById('searchCurrency').value = '';
    document.getElementById('searchName').value = '';
    document.getElementById('searchBookingNumber').value = '';
    document.getElementById('searchDestination').value = '';
    document.getElementById('searchDateFrom').value = '';
    document.getElementById('searchDateTo').value = '';
    document.getElementById('searchCustomer').value = '';
    document.getElementById('searchSupplier').value = '';
    document.getElementById('searchAmountFrom').value = '';
    document.getElementById('searchAmountTo').value = '';
    document.getElementById('searchStatus').value = '';
    
    document.getElementById('searchResults').style.display = 'none';
}

// طباعة نتائج البحث
function printSearchResults() {
    const results = window.currentSearchResults || [];
    if (results.length === 0) {
        showAlert('لا توجد نتائج للطباعة', 'warning');
        return;
    }
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8">
            <title>نتائج الاستعلام المتقدم</title>
            <style>
                body {
                    font-family: 'Cairo', Arial, sans-serif;
                    direction: rtl;
                    margin: 20px;
                }
                ${generateDocumentHeader()}
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 20px 0;
                }
                th, td {
                    border: 1px solid #ddd;
                    padding: 10px;
                    text-align: center;
                }
                th {
                    background: #f57c00;
                    color: white;
                }
                tr:nth-child(even) {
                    background: #f8f9fa;
                }
                ${generateDocumentFooter()}
                @media print {
                    body { margin: 0; padding: 15px; }
                }
            </style>
        </head>
        <body>
            ${generateDocumentHeader()}
            
            <h2 style="text-align: center; color: #004d40; margin: 30px 0;">
                نتائج الاستعلام المتقدم
            </h2>
            
            <p style="text-align: center; margin-bottom: 20px;">
                <strong>عدد النتائج:</strong> ${results.length}
            </p>
            
            <table>
                <thead>
                    <tr>
                        <th>م</th>
                        <th>النوع</th>
                        <th>التاريخ</th>
                        <th>الوصف</th>
                        <th>العملة</th>
                        <th>المبلغ</th>
                        <th>الحالة</th>
                    </tr>
                </thead>
                <tbody>
                    ${results.map((r, i) => `
                        <tr>
                            <td>${i + 1}</td>
                            <td>${r.type}</td>
                            <td>${r.displayDate}</td>
                            <td>${r.description || r.name || r.number || r.bookingNumber || '-'}</td>
                            <td>${r.currency || '-'}</td>
                            <td>${r.displayAmount}</td>
                            <td>${r.status ? getStatusLabel(r.status) : '-'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            ${generateDocumentFooter()}
        </body>
        </html>
    `);
    
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
}

// تصدير نتائج البحث إلى Excel
function exportSearchResults() {
    const results = window.currentSearchResults || [];
    if (results.length === 0) {
        showAlert('لا توجد نتائج للتصدير', 'warning');
        return;
    }
    
    // إنشاء محتوى CSV
    let csv = 'الرقم,النوع,التاريخ,الوصف,العملة,المبلغ,الحالة\n';
    
    results.forEach((r, i) => {
        csv += `${i + 1},`;
        csv += `"${r.type}",`;
        csv += `"${r.displayDate}",`;
        csv += `"${r.description || r.name || r.number || r.bookingNumber || '-'}",`;
        csv += `"${r.currency || '-'}",`;
        csv += `"${r.displayAmount}",`;
        csv += `"${r.status ? getStatusLabel(r.status) : '-'}"\n`;
    });
    
    // تنزيل الملف
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `نتائج_الاستعلام_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    showAlert('تم تصدير النتائج بنجاح', 'success');
}

// تحديث حقول البحث حسب نوع البيانات
function updateSearchFields() {
    const dataType = document.getElementById('searchDataType')?.value;
    
    // إظهار/إخفاء الحقول حسب النوع
    const currencyField = document.getElementById('searchCurrency')?.closest('.form-group');
    const bookingField = document.getElementById('searchBookingNumber')?.closest('.form-group');
    const destinationField = document.getElementById('searchDestination')?.closest('.form-group');
    const customerField = document.getElementById('searchCustomer')?.closest('.form-group');
    const supplierField = document.getElementById('searchSupplier')?.closest('.form-group');
    const amountFields = document.querySelectorAll('#searchAmountFrom, #searchAmountTo');
    const statusField = document.getElementById('searchStatus')?.closest('.form-group');
    
    // إظهار جميع الحقول افتراضياً
    [currencyField, bookingField, destinationField, customerField, supplierField, statusField].forEach(field => {
        if (field) field.style.display = 'block';
    });
    amountFields.forEach(field => {
        if (field?.closest('.form-group')) field.closest('.form-group').style.display = 'block';
    });
    
    // تخصيص حسب النوع
    if (dataType === 'customers' || dataType === 'suppliers') {
        // إخفاء حقول غير ضرورية للعملاء والموردين
        if (bookingField) bookingField.style.display = 'none';
        if (destinationField) destinationField.style.display = 'none';
        if (statusField) statusField.style.display = 'none';
    } else if (dataType === 'sentPassports') {
        // للجوازات: إخفاء العملة والمبلغ
        if (currencyField) currencyField.style.display = 'none';
        amountFields.forEach(field => {
            if (field?.closest('.form-group')) field.closest('.form-group').style.display = 'none';
        });
    }
}

// فرز النتائج
function sortSearchResults(column) {
    if (!window.currentSearchResults || window.currentSearchResults.length === 0) {
        return;
    }
    
    // تبديل اتجاه الفرز
    if (window.currentSortColumn === column) {
        window.currentSortDirection = window.currentSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        window.currentSortColumn = column;
        window.currentSortDirection = 'asc';
    }
    
    // فرز النتائج
    const results = [...window.currentSearchResults];
    results.sort((a, b) => {
        let aVal = a[column];
        let bVal = b[column];
        
        // معالجة القيم الفارغة
        if (!aVal) return 1;
        if (!bVal) return -1;
        
        // فرز حسب النوع
        if (typeof aVal === 'number') {
            return window.currentSortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        } else {
            aVal = aVal.toString().toLowerCase();
            bVal = bVal.toString().toLowerCase();
            if (window.currentSortDirection === 'asc') {
                return aVal.localeCompare(bVal, 'ar');
            } else {
                return bVal.localeCompare(aVal, 'ar');
            }
        }
    });
    
    window.currentSearchResults = results;
    displaySearchResults(results);
}

// عرض إحصائيات النتائج
function displaySearchStatistics(results) {
    if (!results || results.length === 0) return '';
    
    // حساب الإحصائيات
    const stats = {
        total: results.length,
        byType: {},
        byCurrency: {},
        totalAmount: { YER: 0, SAR: 0, USD: 0 }
    };
    
    results.forEach(r => {
        // حسب النوع
        stats.byType[r.type] = (stats.byType[r.type] || 0) + 1;
        
        // حسب العملة
        if (r.currency) {
            stats.byCurrency[r.currency] = (stats.byCurrency[r.currency] || 0) + 1;
        }
        
        // المبالغ
        if (r.amount && r.currency) {
            stats.totalAmount[r.currency] = (stats.totalAmount[r.currency] || 0) + parseFloat(r.amount);
        } else if (r.total && r.currency) {
            stats.totalAmount[r.currency] = (stats.totalAmount[r.currency] || 0) + parseFloat(r.total);
        }
    });
    
    return `
        <div class="stats-grid" style="margin-bottom: 20px;">
            <div class="stat-card">
                <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                    <i class="fas fa-list"></i>
                </div>
                <div class="stat-content">
                    <h3>إجمالي النتائج</h3>
                    <div class="stat-value">${stats.total}</div>
                </div>
            </div>
            
            ${Object.entries(stats.byType).map(([type, count]) => `
                <div class="stat-card">
                    <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
                        <i class="fas fa-chart-pie"></i>
                    </div>
                    <div class="stat-content">
                        <h3>${type}</h3>
                        <div class="stat-value">${count}</div>
                    </div>
                </div>
            `).join('')}
            
            ${stats.totalAmount.YER > 0 ? `
                <div class="stat-card">
                    <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
                        <i class="fas fa-money-bill-wave"></i>
                    </div>
                    <div class="stat-content">
                        <h3>إجمالي (ريال يمني)</h3>
                        <div class="stat-value">${formatCurrency(stats.totalAmount.YER, 'YER')}</div>
                    </div>
                </div>
            ` : ''}
            
            ${stats.totalAmount.SAR > 0 ? `
                <div class="stat-card">
                    <div class="stat-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
                        <i class="fas fa-money-bill-wave"></i>
                    </div>
                    <div class="stat-content">
                        <h3>إجمالي (ريال سعودي)</h3>
                        <div class="stat-value">${formatCurrency(stats.totalAmount.SAR, 'SAR')}</div>
                    </div>
                </div>
            ` : ''}
            
            ${stats.totalAmount.USD > 0 ? `
                <div class="stat-card">
                    <div class="stat-icon" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);">
                        <i class="fas fa-money-bill-wave"></i>
                    </div>
                    <div class="stat-content">
                        <h3>إجمالي (دولار)</h3>
                        <div class="stat-value">${formatCurrency(stats.totalAmount.USD, 'USD')}</div>
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

// حفظ معايير البحث
function saveSavedSearch() {
    const name = prompt('أدخل اسم البحث المحفوظ:');
    if (!name) return;
    
    const criteria = {
        name: name,
        date: new Date().toISOString(),
        dataType: document.getElementById('searchDataType').value,
        currency: document.getElementById('searchCurrency').value,
        searchName: document.getElementById('searchName').value,
        bookingNumber: document.getElementById('searchBookingNumber').value,
        destination: document.getElementById('searchDestination').value,
        dateFrom: document.getElementById('searchDateFrom').value,
        dateTo: document.getElementById('searchDateTo').value,
        customerId: document.getElementById('searchCustomer').value,
        supplierId: document.getElementById('searchSupplier').value,
        amountFrom: document.getElementById('searchAmountFrom').value,
        amountTo: document.getElementById('searchAmountTo').value,
        status: document.getElementById('searchStatus').value
    };
    
    // حفظ في localStorage
    const savedSearches = JSON.parse(localStorage.getItem('savedSearches') || '[]');
    savedSearches.push(criteria);
    localStorage.setItem('savedSearches', JSON.stringify(savedSearches));
    
    showAlert('تم حفظ معايير البحث بنجاح', 'success');
}

// تحميل معايير البحث المحفوظة
function loadSavedSearches() {
    const savedSearches = JSON.parse(localStorage.getItem('savedSearches') || '[]');
    
    if (savedSearches.length === 0) {
        showAlert('لا توجد عمليات بحث محفوظة', 'info');
        return;
    }
    
    let html = '<div class="modal" id="savedSearchesModal" style="display: block;">';
    html += '<div class="modal-content">';
    html += '<div class="modal-header">';
    html += '<h3><i class="fas fa-bookmark"></i> عمليات البحث المحفوظة</h3>';
    html += '<button class="modal-close" onclick="closeSavedSearchesModal()"><i class="fas fa-times"></i></button>';
    html += '</div>';
    html += '<div class="modal-body">';
    html += '<div class="table-responsive">';
    html += '<table class="table">';
    html += '<thead><tr><th>الاسم</th><th>التاريخ</th><th>نوع البيانات</th><th>الإجراءات</th></tr></thead>';
    html += '<tbody>';
    
    savedSearches.forEach((search, index) => {
        html += '<tr>';
        html += `<td><strong>${search.name}</strong></td>`;
        html += `<td>${new Date(search.date).toLocaleDateString('ar-YE')}</td>`;
        html += `<td><span class="badge bg-info">${getDataTypeLabel(search.dataType)}</span></td>`;
        html += '<td>';
        html += `<button class="btn btn-sm btn-primary" onclick="applySavedSearch(${index})"><i class="fas fa-play"></i> تطبيق</button> `;
        html += `<button class="btn btn-sm btn-delete" onclick="deleteSavedSearch(${index})"><i class="fas fa-trash"></i></button>`;
        html += '</td>';
        html += '</tr>';
    });
    
    html += '</tbody></table></div></div></div></div>';
    
    document.body.insertAdjacentHTML('beforeend', html);
}

// تطبيق معايير البحث المحفوظة
function applySavedSearch(index) {
    const savedSearches = JSON.parse(localStorage.getItem('savedSearches') || '[]');
    const search = savedSearches[index];
    
    if (!search) return;
    
    // ملء الحقول
    document.getElementById('searchDataType').value = search.dataType || 'all';
    document.getElementById('searchCurrency').value = search.currency || '';
    document.getElementById('searchName').value = search.searchName || '';
    document.getElementById('searchBookingNumber').value = search.bookingNumber || '';
    document.getElementById('searchDestination').value = search.destination || '';
    document.getElementById('searchDateFrom').value = search.dateFrom || '';
    document.getElementById('searchDateTo').value = search.dateTo || '';
    document.getElementById('searchCustomer').value = search.customerId || '';
    document.getElementById('searchSupplier').value = search.supplierId || '';
    document.getElementById('searchAmountFrom').value = search.amountFrom || '';
    document.getElementById('searchAmountTo').value = search.amountTo || '';
    document.getElementById('searchStatus').value = search.status || '';
    
    closeSavedSearchesModal();
    showAlert('تم تطبيق معايير البحث', 'success');
    
    // تنفيذ البحث تلقائياً
    executeAdvancedSearch();
}

// حذف معايير البحث المحفوظة
function deleteSavedSearch(index) {
    if (!confirm('هل تريد حذف هذا البحث المحفوظ؟')) return;
    
    const savedSearches = JSON.parse(localStorage.getItem('savedSearches') || '[]');
    savedSearches.splice(index, 1);
    localStorage.setItem('savedSearches', JSON.stringify(savedSearches));
    
    closeSavedSearchesModal();
    showAlert('تم حذف البحث المحفوظ', 'success');
}

// إغلاق نافذة البحوثات المحفوظة
function closeSavedSearchesModal() {
    const modal = document.getElementById('savedSearchesModal');
    if (modal) modal.remove();
}

// الحصول على تسمية نوع البيانات
function getDataTypeLabel(dataType) {
    const labels = {
        'all': 'الكل',
        'invoices': 'الفواتير',
        'vouchers': 'السندات',
        'bookings': 'الحجوزات',
        'journal': 'القيود اليومية',
        'customers': 'العملاء',
        'suppliers': 'الموردين',
        'sentPassports': 'الجوازات المرسلة'
    };
    return labels[dataType] || dataType;
}

// تصدير إلى PDF (جديد)
function exportSearchResultsToPDF() {
    const results = window.currentSearchResults || [];
    if (results.length === 0) {
        showAlert('لا توجد نتائج للتصدير', 'warning');
        return;
    }
    
    // استخدام نافذة الطباعة كبديل لـ PDF
    printSearchResults();
    showAlert('استخدم وظيفة الطباعة لحفظ كـ PDF', 'info');
}

// البحث السريع (بدون الضغط على زر البحث)
function quickSearch() {
    // تنفيذ البحث تلقائياً عند التغيير في أي حقل
    const timeout = window.searchTimeout;
    if (timeout) clearTimeout(timeout);
    
    window.searchTimeout = setTimeout(() => {
        executeAdvancedSearch();
    }, 1000); // انتظار ثانية واحدة بعد التوقف عن الكتابة
}

console.log('✓ تم تحميل نظام الاستعلام المتقدم v2.0 - Enhanced');
