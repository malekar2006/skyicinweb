// ========================================
// نظام كشف حساب جميع العملاء
// All Customers Statements System
// ========================================

/**
 * تحميل صفحة كشف حساب جميع العملاء
 */
function loadAllCustomersStatements() {
    const content = document.getElementById('content');
    
    content.innerHTML = `
        <div class="page-container">
            <div class="page-header" style="background: linear-gradient(135deg, #004d40 0%, #00695c 100%);">
                <h1 style="margin: 0; color: white; font-size: 28px;">
                    <i class="fas fa-users"></i>
                    كشف حساب جميع العملاء
                </h1>
                <p style="margin: 8px 0 0 0; color: #b2dfdb; font-size: 14px;">
                    عرض شامل لحسابات جميع العملاء مع الأرصدة والمعاملات
                </p>
            </div>

            <!-- خيارات الفلترة والتحكم -->
            <div class="card" style="margin-bottom: 20px;">
                <div class="card-body">
                    <div class="row" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; align-items: end;">
                        <!-- فترة التاريخ -->
                        <div class="form-group">
                            <label for="allCustomersFromDate">من تاريخ</label>
                            <input type="date" id="allCustomersFromDate" class="form-control">
                        </div>
                        
                        <div class="form-group">
                            <label for="allCustomersToDate">إلى تاريخ</label>
                            <input type="date" id="allCustomersToDate" class="form-control">
                        </div>

                        <!-- العملة -->
                        <div class="form-group">
                            <label for="allCustomersCurrency">العملة</label>
                            <select id="allCustomersCurrency" class="form-control">
                                <option value="all">جميع العملات</option>
                                <option value="YER">ريال يمني (ر.ي)</option>
                                <option value="SAR">ريال سعودي (ر.س)</option>
                                <option value="USD">دولار أمريكي ($)</option>
                            </select>
                        </div>

                        <!-- أزرار التحكم -->
                        <div class="form-group" style="display: flex; gap: 10px;">
                            <button onclick="generateAllCustomersStatement()" class="btn btn-primary" style="flex: 1;">
                                <i class="fas fa-file-alt"></i>
                                عرض الكشف
                            </button>
                            <button onclick="printAllCustomersStatement()" class="btn btn-success" style="flex: 1;">
                                <i class="fas fa-print"></i>
                                طباعة
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- منطقة عرض الكشف -->
            <div id="allCustomersStatementResult"></div>
        </div>
    `;

    // تعيين التاريخ الافتراضي (آخر 30 يوم)
    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 30);
    
    document.getElementById('allCustomersFromDate').valueAsDate = fromDate;
    document.getElementById('allCustomersToDate').valueAsDate = toDate;

    // عرض الكشف مباشرة
    generateAllCustomersStatement();
}

/**
 * توليد كشف حساب جميع العملاء
 */
function generateAllCustomersStatement() {
    const fromDate = document.getElementById('allCustomersFromDate').value;
    const toDate = document.getElementById('allCustomersToDate').value;
    const selectedCurrency = document.getElementById('allCustomersCurrency').value;
    
    if (!fromDate || !toDate) {
        showNotification('يرجى تحديد فترة التاريخ', 'warning');
        return;
    }

    // جلب البيانات
    const customers = getData('customers') || [];
    const invoices = getData('invoices') || [];
    const vouchers = getData('vouchers') || [];
    const journalEntries = getData('journal') || [];

    if (customers.length === 0) {
        document.getElementById('allCustomersStatementResult').innerHTML = `
            <div class="card">
                <div class="card-body text-center" style="padding: 40px;">
                    <i class="fas fa-users" style="font-size: 64px; color: #ddd; margin-bottom: 20px;"></i>
                    <h3 style="color: #999;">لا يوجد عملاء</h3>
                    <p style="color: #bbb;">قم بإضافة عملاء لعرض كشف حساباتهم</p>
                </div>
            </div>
        `;
        return;
    }

    // معالجة بيانات كل عميل
    let customersData = [];
    let grandTotal = { debit: 0, credit: 0, balance: 0 };

    customers.forEach(customer => {
        const customerTransactions = getCustomerTransactions(
            customer.id, 
            fromDate, 
            toDate, 
            selectedCurrency,
            invoices,
            vouchers,
            journalEntries
        );

        if (customerTransactions.transactions.length > 0 || customerTransactions.balance !== 0) {
            customersData.push({
                customer: customer,
                transactions: customerTransactions.transactions,
                debit: customerTransactions.debit,
                credit: customerTransactions.credit,
                balance: customerTransactions.balance
            });

            grandTotal.debit += customerTransactions.debit;
            grandTotal.credit += customerTransactions.credit;
            grandTotal.balance += customerTransactions.balance;
        }
    });

    // عرض النتائج
    displayAllCustomersStatement(customersData, grandTotal, fromDate, toDate, selectedCurrency);
}

/**
 * جلب معاملات عميل محدد
 */
function getCustomerTransactions(customerId, fromDate, toDate, currency, invoices, vouchers, journalEntries) {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    to.setHours(23, 59, 59, 999);
    
    let transactions = [];
    let debit = 0;
    let credit = 0;

    // الفواتير
    const customerInvoices = invoices.filter(inv => {
        if (inv.type !== 'sales' || inv.customer_id !== customerId) return false;
        if (currency !== 'all' && inv.currency !== currency) return false;
        const invDate = new Date(inv.date);
        return invDate >= from && invDate <= to;
    });

    customerInvoices.forEach(inv => {
        const amount = parseFloat(inv.total) || 0;
        transactions.push({
            date: inv.date,
            description: `فاتورة مبيعات ${inv.number}`,
            debit: amount,
            credit: 0,
            type: 'invoice',
            currency: inv.currency || 'YER'
        });
        debit += amount;
    });

    // السندات (قبض من العميل)
    const customerVouchers = vouchers.filter(v => {
        if (v.type !== 'receipt' || v.reference_type !== 'customer' || v.reference_id !== customerId) return false;
        if (currency !== 'all' && v.currency !== currency) return false;
        const vDate = new Date(v.date);
        return vDate >= from && vDate <= to;
    });

    customerVouchers.forEach(v => {
        const amount = parseFloat(v.amount) || 0;
        transactions.push({
            date: v.date,
            description: `سند قبض ${v.number}`,
            debit: 0,
            credit: amount,
            type: 'voucher',
            currency: v.currency || 'YER'
        });
        credit += amount;
    });

    // القيود المحاسبية
    const customerJournals = journalEntries.filter(je => {
        if (currency !== 'all' && je.currency !== currency) return false;
        const jeDate = new Date(je.date);
        if (jeDate < from || jeDate > to) return false;

        // التحقق من وجود حساب العملاء في القيد
        return je.entries && je.entries.some(entry => 
            entry.account_id === '112' // حساب العملاء
        );
    });

    customerJournals.forEach(je => {
        je.entries.forEach(entry => {
            if (entry.account_id === '112') {
                const amount = parseFloat(entry.amount) || 0;
                if (entry.type === 'debit') {
                    transactions.push({
                        date: je.date,
                        description: `${je.description} - ${je.number}`,
                        debit: amount,
                        credit: 0,
                        type: 'journal',
                        currency: je.currency || 'YER'
                    });
                    debit += amount;
                } else {
                    transactions.push({
                        date: je.date,
                        description: `${je.description} - ${je.number}`,
                        debit: 0,
                        credit: amount,
                        type: 'journal',
                        currency: je.currency || 'YER'
                    });
                    credit += amount;
                }
            }
        });
    });

    // ترتيب المعاملات حسب التاريخ
    transactions.sort((a, b) => new Date(a.date) - new Date(b.date));

    return {
        transactions: transactions,
        debit: debit,
        credit: credit,
        balance: debit - credit
    };
}

/**
 * عرض كشف حساب جميع العملاء
 */
function displayAllCustomersStatement(customersData, grandTotal, fromDate, toDate, currency) {
    const resultDiv = document.getElementById('allCustomersStatementResult');
    
    if (customersData.length === 0) {
        resultDiv.innerHTML = `
            <div class="card">
                <div class="card-body text-center" style="padding: 40px;">
                    <i class="fas fa-info-circle" style="font-size: 64px; color: #ddd; margin-bottom: 20px;"></i>
                    <h3 style="color: #999;">لا توجد معاملات</h3>
                    <p style="color: #bbb;">لا توجد معاملات للعملاء في الفترة المحددة</p>
                </div>
            </div>
        `;
        return;
    }

    const currencySymbol = currency === 'all' ? '' : (CURRENCIES[currency]?.symbol || '');
    const currencyName = currency === 'all' ? 'جميع العملات' : (CURRENCIES[currency]?.name_ar || currency);

    let html = `
        <div class="card" id="allCustomersStatementCard">
            <div class="card-body" style="padding: 30px;">
                <!-- الرأس -->
                <div class="statement-header" style="margin-bottom: 30px;">
                    <h2 style="text-align: center; color: #f57c00; margin-bottom: 15px; font-size: 24px;">
                        كشف حساب جميع العملاء
                    </h2>
                    <div style="text-align: center; color: #666; font-size: 14px; margin-bottom: 20px;">
                        <p style="margin: 5px 0;">
                            <strong>الفترة:</strong> من ${formatDate(fromDate)} إلى ${formatDate(toDate)}
                        </p>
                        <p style="margin: 5px 0;">
                            <strong>العملة:</strong> ${currencyName}
                        </p>
                        <p style="margin: 5px 0;">
                            <strong>عدد العملاء:</strong> ${customersData.length}
                        </p>
                    </div>
                </div>

                <!-- جدول الملخص -->
                <table class="table table-bordered" style="margin-bottom: 30px;">
                    <thead style="background-color: #004d40; color: white;">
                        <tr>
                            <th style="width: 50px;">#</th>
                            <th>اسم العميل</th>
                            <th style="width: 120px;">رقم الجوال</th>
                            <th style="width: 150px;">المدين</th>
                            <th style="width: 150px;">الدائن</th>
                            <th style="width: 150px;">الرصيد</th>
                        </tr>
                    </thead>
                    <tbody>
    `;

    customersData.forEach((data, index) => {
        const balanceColor = data.balance > 0 ? '#d32f2f' : (data.balance < 0 ? '#388e3c' : '#666');
        const balanceType = data.balance > 0 ? 'مدين' : (data.balance < 0 ? 'دائن' : 'متوازن');
        
        html += `
            <tr>
                <td style="text-align: center;">${index + 1}</td>
                <td><strong>${data.customer.name}</strong></td>
                <td style="text-align: center; direction: ltr;">${data.customer.phone || '-'}</td>
                <td style="text-align: left; font-weight: bold; color: #d32f2f;">
                    ${formatNumber(data.debit)} ${currencySymbol}
                </td>
                <td style="text-align: left; font-weight: bold; color: #388e3c;">
                    ${formatNumber(data.credit)} ${currencySymbol}
                </td>
                <td style="text-align: left; font-weight: bold; color: ${balanceColor};">
                    ${formatNumber(Math.abs(data.balance))} ${currencySymbol} ${balanceType}
                </td>
            </tr>
        `;
    });

    // الإجمالي
    const totalBalanceColor = grandTotal.balance > 0 ? '#d32f2f' : (grandTotal.balance < 0 ? '#388e3c' : '#666');
    const totalBalanceType = grandTotal.balance > 0 ? 'مدين' : (grandTotal.balance < 0 ? 'دائن' : 'متوازن');

    html += `
                    </tbody>
                    <tfoot style="background-color: #f5f5f5; font-weight: bold;">
                        <tr>
                            <td colspan="3" style="text-align: center; font-size: 16px;">الإجمالي الكلي</td>
                            <td style="text-align: left; color: #d32f2f; font-size: 16px;">
                                ${formatNumber(grandTotal.debit)} ${currencySymbol}
                            </td>
                            <td style="text-align: left; color: #388e3c; font-size: 16px;">
                                ${formatNumber(grandTotal.credit)} ${currencySymbol}
                            </td>
                            <td style="text-align: left; color: ${totalBalanceColor}; font-size: 16px;">
                                ${formatNumber(Math.abs(grandTotal.balance))} ${currencySymbol} ${totalBalanceType}
                            </td>
                        </tr>
                    </tfoot>
                </table>

                <!-- الإحصائيات -->
                <div class="row" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 30px;">
                    <div class="stat-card" style="background: linear-gradient(135deg, #d32f2f 0%, #f44336 100%); color: white; padding: 20px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 14px; opacity: 0.9; margin-bottom: 5px;">إجمالي المدين</div>
                        <div style="font-size: 24px; font-weight: bold;">${formatNumber(grandTotal.debit)} ${currencySymbol}</div>
                    </div>
                    <div class="stat-card" style="background: linear-gradient(135deg, #388e3c 0%, #4caf50 100%); color: white; padding: 20px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 14px; opacity: 0.9; margin-bottom: 5px;">إجمالي الدائن</div>
                        <div style="font-size: 24px; font-weight: bold;">${formatNumber(grandTotal.credit)} ${currencySymbol}</div>
                    </div>
                    <div class="stat-card" style="background: linear-gradient(135deg, ${totalBalanceColor} 0%, ${totalBalanceColor}dd 100%); color: white; padding: 20px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 14px; opacity: 0.9; margin-bottom: 5px;">الرصيد الكلي</div>
                        <div style="font-size: 24px; font-weight: bold;">${formatNumber(Math.abs(grandTotal.balance))} ${currencySymbol}</div>
                        <div style="font-size: 12px; opacity: 0.8; margin-top: 5px;">${totalBalanceType}</div>
                    </div>
                </div>
            </div>
        </div>
    `;

    resultDiv.innerHTML = html;
}

/**
 * طباعة كشف حساب جميع العملاء
 */
function printAllCustomersStatement() {
    const fromDate = document.getElementById('allCustomersFromDate').value;
    const toDate = document.getElementById('allCustomersToDate').value;
    const selectedCurrency = document.getElementById('allCustomersCurrency').value;
    
    if (!fromDate || !toDate) {
        showNotification('يرجى تحديد فترة التاريخ أولاً', 'warning');
        return;
    }

    // جلب البيانات
    const customers = getData('customers') || [];
    const invoices = getData('invoices') || [];
    const vouchers = getData('vouchers') || [];
    const journalEntries = getData('journal') || [];

    let customersData = [];
    let grandTotal = { debit: 0, credit: 0, balance: 0 };

    customers.forEach(customer => {
        const customerTransactions = getCustomerTransactions(
            customer.id, 
            fromDate, 
            toDate, 
            selectedCurrency,
            invoices,
            vouchers,
            journalEntries
        );

        if (customerTransactions.transactions.length > 0 || customerTransactions.balance !== 0) {
            customersData.push({
                customer: customer,
                debit: customerTransactions.debit,
                credit: customerTransactions.credit,
                balance: customerTransactions.balance
            });

            grandTotal.debit += customerTransactions.debit;
            grandTotal.credit += customerTransactions.credit;
            grandTotal.balance += customerTransactions.balance;
        }
    });

    if (customersData.length === 0) {
        showNotification('لا توجد بيانات للطباعة', 'warning');
        return;
    }

    const currencySymbol = selectedCurrency === 'all' ? '' : (CURRENCIES[selectedCurrency]?.symbol || '');
    const currencyName = selectedCurrency === 'all' ? 'جميع العملات' : (CURRENCIES[selectedCurrency]?.name_ar || selectedCurrency);

    // إنشاء صفحة الطباعة
    const printWindow = window.open('', '', 'width=800,height=600');
    
    const totalBalanceColor = grandTotal.balance > 0 ? '#d32f2f' : (grandTotal.balance < 0 ? '#388e3c' : '#666');
    const totalBalanceType = grandTotal.balance > 0 ? 'مدين' : (grandTotal.balance < 0 ? 'دائن' : 'متوازن');

    let printHTML = `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8">
            <title>كشف حساب جميع العملاء</title>
            <style>
                body {
                    font-family: 'Cairo', Arial, sans-serif;
                    direction: rtl;
                    margin: 20px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                }
                th, td {
                    border: 1px solid #ddd;
                    padding: 8px;
                    text-align: center;
                }
                th {
                    background-color: #004d40;
                    color: white;
                    font-weight: bold;
                }
                .total-row {
                    background-color: #f5f5f5;
                    font-weight: bold;
                    font-size: 16px;
                }
                @media print {
                    body { margin: 0; }
                    @page { margin: 15mm; }
                }
            </style>
        </head>
        <body>
            ${generateDocumentHeader('كشف حساب جميع العملاء')}
            
            <div style="text-align: center; margin: 20px 0; color: #666;">
                <p style="margin: 5px 0;"><strong>الفترة:</strong> من ${formatDate(fromDate)} إلى ${formatDate(toDate)}</p>
                <p style="margin: 5px 0;"><strong>العملة:</strong> ${currencyName}</p>
                <p style="margin: 5px 0;"><strong>عدد العملاء:</strong> ${customersData.length}</p>
            </div>

            <table>
                <thead>
                    <tr>
                        <th style="width: 50px;">#</th>
                        <th>اسم العميل</th>
                        <th style="width: 120px;">رقم الجوال</th>
                        <th style="width: 120px;">المدين</th>
                        <th style="width: 120px;">الدائن</th>
                        <th style="width: 120px;">الرصيد</th>
                    </tr>
                </thead>
                <tbody>
    `;

    customersData.forEach((data, index) => {
        const balanceColor = data.balance > 0 ? '#d32f2f' : (data.balance < 0 ? '#388e3c' : '#666');
        const balanceType = data.balance > 0 ? 'مدين' : (data.balance < 0 ? 'دائن' : 'متوازن');
        
        printHTML += `
            <tr>
                <td>${index + 1}</td>
                <td><strong>${data.customer.name}</strong></td>
                <td style="direction: ltr;">${data.customer.phone || '-'}</td>
                <td style="text-align: left; color: #d32f2f;">
                    ${formatNumber(data.debit)} ${currencySymbol}
                </td>
                <td style="text-align: left; color: #388e3c;">
                    ${formatNumber(data.credit)} ${currencySymbol}
                </td>
                <td style="text-align: left; color: ${balanceColor};">
                    ${formatNumber(Math.abs(data.balance))} ${currencySymbol} ${balanceType}
                </td>
            </tr>
        `;
    });

    printHTML += `
                </tbody>
                <tfoot>
                    <tr class="total-row">
                        <td colspan="3">الإجمالي الكلي</td>
                        <td style="text-align: left; color: #d32f2f;">
                            ${formatNumber(grandTotal.debit)} ${currencySymbol}
                        </td>
                        <td style="text-align: left; color: #388e3c;">
                            ${formatNumber(grandTotal.credit)} ${currencySymbol}
                        </td>
                        <td style="text-align: left; color: ${totalBalanceColor};">
                            ${formatNumber(Math.abs(grandTotal.balance))} ${currencySymbol} ${totalBalanceType}
                        </td>
                    </tr>
                </tfoot>
            </table>

            ${generateDocumentFooter()}
        </body>
        </html>
    `;

    printWindow.document.write(printHTML);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 250);
}

// دالة مساعدة لتنسيق التاريخ
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-YE', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}
