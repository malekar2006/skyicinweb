// ========================================
// لوحة التحكم الرئيسية
// ========================================

function loadDashboard() {
    const content = document.getElementById('content');
    
    // حساب الإحصائيات (مع التصفية حسب العملة)
    const filter = getGlobalCurrencyFilter();
    const displayCurrency = filter === 'all' ? null : filter;
    const cashBalance = getCashBalance();
    const bankBalance = getBankBalance();
    const totalRevenue = filter === 'all' ? getTotalRevenue() : getTotalRevenueFiltered();
    const totalExpenses = filter === 'all' ? getTotalExpenses() : getTotalExpensesFiltered();
    const netProfit = filter === 'all' ? getNetProfit() : getNetProfitFiltered();
    
    // الحجوزات (مع التصفية)
    const bookings = getData('bookings') || [];
    const filteredBookings = filterBookingsByCurrency(bookings);
    const activeBookings = filteredBookings.filter(b => b.status === 'confirmed').length;
    
    // العملاء
    const customers = getData('customers') || [];
    const totalCustomers = customers.length;
    
    // الفواتير غير المدفوعة (مع التصفية)
    const invoices = getData('invoices') || [];
    const filteredInvoices = filterInvoicesByCurrency(invoices);
    const unpaidInvoices = filteredInvoices.filter(inv => inv.status !== 'paid');
    const unpaidAmount = unpaidInvoices.reduce((sum, inv) => sum + (inv.total - inv.paid), 0);
    
    content.innerHTML = `
        <!-- Currency Filter -->
        <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
            <h2 style="margin: 0;">لوحة التحكم</h2>
            ${generateCurrencyFilterDropdown()}
        </div>
        
        <!-- Statistics Cards -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon primary">
                    <i class="fas fa-wallet"></i>
                </div>
                <div class="stat-content">
                    <h3>رصيد الخزينة</h3>
                    <div class="stat-value">${formatCurrency(cashBalance, displayCurrency)}</div>
                    <div class="stat-change positive">
                        <i class="fas fa-arrow-up"></i>
                        نشط
                    </div>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon info">
                    <i class="fas fa-university"></i>
                </div>
                <div class="stat-content">
                    <h3>رصيد البنك</h3>
                    <div class="stat-value">${formatCurrency(bankBalance, displayCurrency)}</div>
                    <div class="stat-change positive">
                        <i class="fas fa-arrow-up"></i>
                        نشط
                    </div>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon success">
                    <i class="fas fa-chart-line"></i>
                </div>
                <div class="stat-content">
                    <h3>إجمالي الإيرادات</h3>
                    <div class="stat-value">${formatCurrency(totalRevenue, displayCurrency)}</div>
                    <div class="stat-change positive">
                        <i class="fas fa-arrow-up"></i>
                        الشهر الحالي
                    </div>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon danger">
                    <i class="fas fa-chart-pie"></i>
                </div>
                <div class="stat-content">
                    <h3>إجمالي المصروفات</h3>
                    <div class="stat-value">${formatCurrency(totalExpenses, displayCurrency)}</div>
                    <div class="stat-change negative">
                        <i class="fas fa-arrow-down"></i>
                        الشهر الحالي
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Additional Stats -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon ${netProfit >= 0 ? 'success' : 'danger'}">
                    <i class="fas fa-dollar-sign"></i>
                </div>
                <div class="stat-content">
                    <h3>صافي الربح</h3>
                    <div class="stat-value">${formatCurrency(Math.abs(netProfit), displayCurrency)}</div>
                    <div class="stat-change ${netProfit >= 0 ? 'positive' : 'negative'}">
                        <i class="fas fa-arrow-${netProfit >= 0 ? 'up' : 'down'}"></i>
                        ${netProfit >= 0 ? 'ربح' : 'خسارة'}
                    </div>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon info">
                    <i class="fas fa-ticket-alt"></i>
                </div>
                <div class="stat-content">
                    <h3>الحجوزات النشطة</h3>
                    <div class="stat-value">${activeBookings}</div>
                    <div class="stat-change positive">
                        <i class="fas fa-check"></i>
                        مؤكد
                    </div>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon success">
                    <i class="fas fa-users"></i>
                </div>
                <div class="stat-content">
                    <h3>إجمالي العملاء</h3>
                    <div class="stat-value">${totalCustomers}</div>
                    <div class="stat-change positive">
                        <i class="fas fa-arrow-up"></i>
                        عميل
                    </div>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon warning">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="stat-content">
                    <h3>الفواتير المعلقة</h3>
                    <div class="stat-value">${formatCurrency(unpaidAmount, displayCurrency)}</div>
                    <div class="stat-change negative">
                        <i class="fas fa-clock"></i>
                        ${unpaidInvoices.length} فاتورة
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Charts and Recent Activity -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 25px; margin-top: 30px;">
            <!-- Recent Bookings -->
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">
                        <i class="fas fa-ticket-alt"></i>
                        أحدث الحجوزات
                    </h3>
                    <button class="btn btn-sm btn-primary" onclick="loadPage('bookings')">
                        عرض الكل
                        <i class="fas fa-arrow-left"></i>
                    </button>
                </div>
                <div class="table-responsive">
                    ${renderRecentBookings()}
                </div>
            </div>
            
            <!-- Recent Invoices -->
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">
                        <i class="fas fa-file-invoice"></i>
                        أحدث الفواتير
                    </h3>
                    <button class="btn btn-sm btn-primary" onclick="loadPage('invoices')">
                        عرض الكل
                        <i class="fas fa-arrow-left"></i>
                    </button>
                </div>
                <div class="table-responsive">
                    ${renderRecentInvoices()}
                </div>
            </div>
        </div>
        
        <!-- Financial Summary -->
        <div class="card mt-3">
            <div class="card-header">
                <h3 class="card-title">
                    <i class="fas fa-chart-bar"></i>
                    ملخص مالي
                </h3>
            </div>
            <div style="padding: 20px;">
                ${renderFinancialSummary()}
            </div>
        </div>
        
        <!-- Quick Actions -->
        <div class="card mt-3">
            <div class="card-header">
                <h3 class="card-title">
                    <i class="fas fa-bolt"></i>
                    إجراءات سريعة
                </h3>
            </div>
            <div style="padding: 20px; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                <button class="btn btn-primary" onclick="openNewBookingModal()">
                    <i class="fas fa-plus"></i>
                    حجز جديد
                </button>
                <button class="btn btn-success" onclick="openNewInvoiceModal()">
                    <i class="fas fa-file-invoice"></i>
                    فاتورة جديدة
                </button>
                <button class="btn btn-info" onclick="openNewVoucherModal()">
                    <i class="fas fa-receipt"></i>
                    سند قبض/صرف
                </button>
                <button class="btn btn-secondary" onclick="openNewJournalModal()">
                    <i class="fas fa-book"></i>
                    قيد محاسبي
                </button>
            </div>
        </div>
    `;
}

// ========================================
// عرض أحدث الحجوزات
// ========================================
function renderRecentBookings() {
    const bookings = getData('bookings') || [];
    const recent = bookings.slice(-5).reverse();
    
    if (recent.length === 0) {
        return '<p style="padding: 20px; text-align: center; color: #999;">لا توجد حجوزات حتى الآن</p>';
    }
    
    const customers = getData('customers') || [];
    
    return `
        <table class="table">
            <thead>
                <tr>
                    <th>رقم الحجز</th>
                    <th>العميل</th>
                    <th>النوع</th>
                    <th>المبلغ</th>
                    <th>الحالة</th>
                </tr>
            </thead>
            <tbody>
                ${recent.map(booking => {
                    const customer = customers.find(c => c.id === booking.customer_id);
                    const statusColors = {
                        confirmed: 'success',
                        pending: 'warning',
                        cancelled: 'danger'
                    };
                    const statusLabels = {
                        confirmed: 'مؤكد',
                        pending: 'معلق',
                        cancelled: 'ملغي'
                    };
                    return `
                        <tr>
                            <td>${booking.booking_number}</td>
                            <td>${customer ? customer.name : 'غير محدد'}</td>
                            <td>${getBookingTypeLabel(booking.type)}</td>
                            <td>${formatCurrency(booking.amount, booking.currency)}</td>
                            <td>
                                <span class="badge badge-${statusColors[booking.status]}" style="padding: 5px 10px; border-radius: 4px; font-size: 12px; background: var(--${statusColors[booking.status]}-color); color: white;">
                                    ${statusLabels[booking.status]}
                                </span>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

// ========================================
// عرض أحدث الفواتير
// ========================================
function renderRecentInvoices() {
    const invoices = getData('invoices') || [];
    const recent = invoices.slice(-5).reverse();
    
    if (recent.length === 0) {
        return '<p style="padding: 20px; text-align: center; color: #999;">لا توجد فواتير حتى الآن</p>';
    }
    
    const customers = getData('customers') || [];
    const suppliers = getData('suppliers') || [];
    
    return `
        <table class="table">
            <thead>
                <tr>
                    <th>رقم الفاتورة</th>
                    <th>الطرف</th>
                    <th>النوع</th>
                    <th>المبلغ</th>
                    <th>الحالة</th>
                </tr>
            </thead>
            <tbody>
                ${recent.map(invoice => {
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
                    
                    return `
                        <tr>
                            <td>${invoice.number}</td>
                            <td>${party ? party.name : 'غير محدد'}</td>
                            <td>${invoice.type === 'sales' ? 'مبيعات' : 'مشتريات'}</td>
                            <td>${formatCurrency(invoice.total, invoice.currency)}</td>
                            <td>
                                <span class="badge badge-${statusColors[invoice.status]}" style="padding: 5px 10px; border-radius: 4px; font-size: 12px; background: var(--${statusColors[invoice.status]}-color); color: white;">
                                    ${statusLabels[invoice.status]}
                                </span>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

// ========================================
// عرض الملخص المالي
// ========================================
function renderFinancialSummary() {
    const totalRevenue = getTotalRevenue();
    const totalExpenses = getTotalExpenses();
    const netProfit = getNetProfit();
    const cashBalance = getCashBalance();
    const bankBalance = getBankBalance();
    
    const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(2) : 0;
    
    return `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
            <div style="padding: 15px; background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%); color: white; border-radius: 8px;">
                <h4 style="margin: 0 0 10px 0; font-size: 14px; opacity: 0.9;">إجمالي الإيرادات</h4>
                <p style="margin: 0; font-size: 28px; font-weight: 700;">${formatCurrency(totalRevenue)}</p>
            </div>
            
            <div style="padding: 15px; background: linear-gradient(135deg, #f44336 0%, #e57373 100%); color: white; border-radius: 8px;">
                <h4 style="margin: 0 0 10px 0; font-size: 14px; opacity: 0.9;">إجمالي المصروفات</h4>
                <p style="margin: 0; font-size: 28px; font-weight: 700;">${formatCurrency(totalExpenses)}</p>
            </div>
            
            <div style="padding: 15px; background: linear-gradient(135deg, ${netProfit >= 0 ? '#2196f3' : '#ff9800'} 0%, ${netProfit >= 0 ? '#64b5f6' : '#ffb74d'} 100%); color: white; border-radius: 8px;">
                <h4 style="margin: 0 0 10px 0; font-size: 14px; opacity: 0.9;">صافي الربح/الخسارة</h4>
                <p style="margin: 0; font-size: 28px; font-weight: 700;">${formatCurrency(Math.abs(netProfit))}</p>
                <p style="margin: 5px 0 0 0; font-size: 13px; opacity: 0.9;">هامش الربح: ${profitMargin}%</p>
            </div>
            
            <div style="padding: 15px; background: linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%); color: white; border-radius: 8px;">
                <h4 style="margin: 0 0 10px 0; font-size: 14px; opacity: 0.9;">السيولة النقدية</h4>
                <p style="margin: 0; font-size: 28px; font-weight: 700;">${formatCurrency(cashBalance + bankBalance)}</p>
                <p style="margin: 5px 0 0 0; font-size: 13px; opacity: 0.9;">خزينة: ${formatCurrency(cashBalance)} | بنك: ${formatCurrency(bankBalance)}</p>
            </div>
        </div>
    `;
}

// ========================================
// دوال مساعدة
// ========================================
function getBookingTypeLabel(type) {
    const labels = {
        flight: 'حجز طيران',
        hajj: 'حج',
        umrah: 'عمرة',
        hotel: 'فندق'
    };
    return labels[type] || type;
}

// Placeholder functions for quick actions
function openNewBookingModal() {
    loadPage('bookings');
    showAlert('الرجاء الضغط على زر "حجز جديد" من صفحة الحجوزات', 'info');
}

function openNewInvoiceModal() {
    loadPage('invoices');
    showAlert('الرجاء الضغط على زر "فاتورة جديدة" من صفحة الفواتير', 'info');
}

function openNewVoucherModal() {
    loadPage('vouchers');
    showAlert('الرجاء الضغط على زر "سند جديد" من صفحة السندات', 'info');
}

function openNewJournalModal() {
    loadPage('journal');
    showAlert('الرجاء الضغط على زر "قيد جديد" من صفحة القيود المحاسبية', 'info');
}