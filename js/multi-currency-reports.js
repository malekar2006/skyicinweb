// ========================================
// التقارير المالية متعددة العملات
// ========================================

// حساب إجمالي الإيرادات حسب العملة
function getTotalRevenueByCurrency() {
    const accounts = getData('accounts') || [];
    const revenueAccounts = accounts.filter(acc => acc.code.startsWith('4'));
    
    const revenues = {
        YER: 0,
        SAR: 0,
        USD: 0,
        total_yer: 0
    };
    
    const journal_entries = getData('journal_entries') || [];
    journal_entries.forEach(entry => {
        const currency = entry.currency || 'YER';
        entry.items.forEach(item => {
            const account = revenueAccounts.find(acc => acc.id === item.accountId);
            if (account) {
                revenues[currency] += item.credit - item.debit;
                revenues.total_yer += convertToBaseCurrency(item.credit - item.debit, currency);
            }
        });
    });
    
    return revenues;
}

// حساب إجمالي المصروفات حسب العملة
function getTotalExpensesByCurrency() {
    const accounts = getData('accounts') || [];
    const expenseAccounts = accounts.filter(acc => acc.code.startsWith('5'));
    
    const expenses = {
        YER: 0,
        SAR: 0,
        USD: 0,
        total_yer: 0
    };
    
    const journal_entries = getData('journal_entries') || [];
    journal_entries.forEach(entry => {
        const currency = entry.currency || 'YER';
        entry.items.forEach(item => {
            const account = expenseAccounts.find(acc => acc.id === item.accountId);
            if (account) {
                expenses[currency] += item.debit - item.credit;
                expenses.total_yer += convertToBaseCurrency(item.debit - item.credit, currency);
            }
        });
    });
    
    return expenses;
}

// إنشاء قائمة الدخل متعددة العملات
function generateMultiCurrencyIncomeStatement() {
    const revenues = getTotalRevenueByCurrency();
    const expenses = getTotalExpensesByCurrency();
    
    const content = document.getElementById('content');
    
    let html = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">
                    <i class="fas fa-file-alt"></i>
                    قائمة الدخل - متعددة العملات
                </h3>
                <div style="display: flex; gap: 10px;">
                    <button class="btn btn-secondary" onclick="loadReports()">
                        <i class="fas fa-arrow-right"></i>
                        رجوع
                    </button>
                    <button class="btn btn-primary" onclick="printMultiCurrencyIncomeStatement()">
                        <i class="fas fa-print"></i>
                        طباعة
                    </button>
                </div>
            </div>
            
            <div style="padding: 20px; text-align: center;">
                <img src="${COMPANY_INFO.logo}" alt="Logo" style="max-width: 120px; margin-bottom: 10px;">
                <h2 style="color: var(--primary-color); margin: 10px 0;">${COMPANY_INFO.name}</h2>
                <p style="color: var(--text-light);">قائمة الدخل متعددة العملات</p>
                <p style="color: var(--text-light);">للفترة: ${new Date().getFullYear()}</p>
            </div>
            
            <div style="padding: 20px;">
                <h3 style="background: var(--primary-color); color: white; padding: 10px; border-radius: 5px;">
                    <i class="fas fa-arrow-up"></i> الإيرادات
                </h3>
                
                <div class="stats-grid" style="margin: 20px 0;">`;
    
    // عرض الإيرادات حسب العملة
    Object.keys(CURRENCIES).forEach(curr => {
        if (revenues[curr] > 0) {
            html += `
                <div class="stat-card">
                    <h4 style="font-size: 14px; color: var(--text-light);">${CURRENCIES[curr].name}</h4>
                    <div class="stat-value" style="color: var(--success-color);">${formatCurrency(revenues[curr], curr)}</div>
                </div>`;
        }
    });
    
    html += `
                    <div class="stat-card" style="background: linear-gradient(135deg, var(--success-color), #66bb6a); color: white;">
                        <h4 style="font-size: 14px; opacity: 0.9;">إجمالي الإيرادات (بالريال اليمني)</h4>
                        <div style="font-size: 24px; font-weight: bold;">${formatCurrency(revenues.total_yer, 'YER')}</div>
                    </div>
                </div>
                
                <h3 style="background: var(--danger-color); color: white; padding: 10px; border-radius: 5px; margin-top: 30px;">
                    <i class="fas fa-arrow-down"></i> المصروفات
                </h3>
                
                <div class="stats-grid" style="margin: 20px 0;">`;
    
    // عرض المصروفات حسب العملة
    Object.keys(CURRENCIES).forEach(curr => {
        if (expenses[curr] > 0) {
            html += `
                <div class="stat-card">
                    <h4 style="font-size: 14px; color: var(--text-light);">${CURRENCIES[curr].name}</h4>
                    <div class="stat-value" style="color: var(--danger-color);">${formatCurrency(expenses[curr], curr)}</div>
                </div>`;
        }
    });
    
    html += `
                    <div class="stat-card" style="background: linear-gradient(135deg, var(--danger-color), #e57373); color: white;">
                        <h4 style="font-size: 14px; opacity: 0.9;">إجمالي المصروفات (بالريال اليمني)</h4>
                        <div style="font-size: 24px; font-weight: bold;">${formatCurrency(expenses.total_yer, 'YER')}</div>
                    </div>
                </div>
                
                <div style="margin-top: 40px; padding: 30px; background: ${revenues.total_yer >= expenses.total_yer ? 'linear-gradient(135deg, #e8f5e9, #c8e6c9)' : 'linear-gradient(135deg, #ffebee, #ffcdd2)'}; border-radius: 10px; text-align: center;">
                    <h2 style="color: ${revenues.total_yer >= expenses.total_yer ? 'var(--success-color)' : 'var(--danger-color)'}; margin-bottom: 20px;">
                        ${revenues.total_yer >= expenses.total_yer ? 'صافي الربح' : 'صافي الخسارة'}
                    </h2>
                    <div style="font-size: 36px; font-weight: bold; color: ${revenues.total_yer >= expenses.total_yer ? 'var(--success-color)' : 'var(--danger-color)'};">
                        ${formatCurrency(Math.abs(revenues.total_yer - expenses.total_yer), 'YER')}
                    </div>
                </div>
            </div>
        </div>`;
    
    content.innerHTML = html;
}

// طباعة قائمة الدخل متعددة العملات
function printMultiCurrencyIncomeStatement() {
    const revenues = getTotalRevenueByCurrency();
    const expenses = getTotalExpensesByCurrency();
    const netProfit = revenues.total_yer - expenses.total_yer;
    
    let html = `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8">
            <title>قائمة الدخل - متعددة العملات</title>
            <style>
                body {
                    font-family: 'Cairo', Arial, sans-serif;
                    direction: rtl;
                    margin: 20px;
                    font-size: 13px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 20px 0;
                }
                th, td {
                    border: 1px solid #ddd;
                    padding: 12px;
                    text-align: right;
                }
                th {
                    background-color: #f57c00;
                    color: white;
                    text-align: center;
                }
                .total-row {
                    background-color: #f5f5f5;
                    font-weight: bold;
                }
                .net-profit {
                    background-color: ${netProfit >= 0 ? '#e8f5e9' : '#ffebee'};
                    font-size: 18px;
                    font-weight: bold;
                }
                .section-title {
                    background: ${netProfit >= 0 ? '#4caf50' : '#f44336'};
                    color: white;
                    padding: 12px;
                    border-radius: 5px;
                    margin: 20px 0 10px 0;
                    font-size: 16px;
                    font-weight: bold;
                }
                @media print {
                    body { margin: 0; }
                }
            </style>
        </head>
        <body>
            ${generateDocumentHeader('قائمة الدخل متعددة العملات')}
            
            <div style="text-align: center; margin: 15px 0; padding: 10px; background: #f5f5f5; border-radius: 8px;">
                <p style="margin: 0; color: #666; font-size: 14px;">للفترة: ${new Date().getFullYear()}</p>
            </div>
            
            <h3 class="section-title" style="background: #4caf50;">
                <i class="fas fa-arrow-up"></i> الإيرادات
            </h3>
            <table>
                <thead>
                    <tr>
                        <th>العملة</th>
                        <th>المبلغ</th>
                        <th>المعادل بالريال اليمني</th>
                    </tr>
                </thead>
                <tbody>`;
    
    Object.keys(CURRENCIES).forEach(curr => {
        if (revenues[curr] > 0) {
            const equivalentYER = convertToBaseCurrency(revenues[curr], curr);
            html += `
                    <tr>
                        <td>${CURRENCIES[curr].name}</td>
                        <td style="text-align: left;">${formatCurrency(revenues[curr], curr)}</td>
                        <td style="text-align: left;">${formatCurrency(equivalentYER, 'YER')}</td>
                    </tr>`;
        }
    });
    
    html += `
                    <tr class="total-row">
                        <td colspan="2" style="text-align: center;">إجمالي الإيرادات (بالريال اليمني)</td>
                        <td style="text-align: left; color: #4caf50;">${formatCurrency(revenues.total_yer, 'YER')}</td>
                    </tr>
                </tbody>
            </table>
            
            <h3 class="section-title" style="background: #f44336;">
                <i class="fas fa-arrow-down"></i> المصروفات
            </h3>
            <table>
                <thead>
                    <tr>
                        <th>العملة</th>
                        <th>المبلغ</th>
                        <th>المعادل بالريال اليمني</th>
                    </tr>
                </thead>
                <tbody>`;
    
    Object.keys(CURRENCIES).forEach(curr => {
        if (expenses[curr] > 0) {
            const equivalentYER = convertToBaseCurrency(expenses[curr], curr);
            html += `
                    <tr>
                        <td>${CURRENCIES[curr].name}</td>
                        <td style="text-align: left;">${formatCurrency(expenses[curr], curr)}</td>
                        <td style="text-align: left;">${formatCurrency(equivalentYER, 'YER')}</td>
                    </tr>`;
        }
    });
    
    html += `
                    <tr class="total-row">
                        <td colspan="2" style="text-align: center;">إجمالي المصروفات (بالريال اليمني)</td>
                        <td style="text-align: left; color: #f44336;">${formatCurrency(expenses.total_yer, 'YER')}</td>
                    </tr>
                </tbody>
            </table>
            
            <table>
                <tbody>
                    <tr class="net-profit">
                        <td style="text-align: center; color: ${netProfit >= 0 ? '#4caf50' : '#f44336'}; font-size: 16px;">
                            ${netProfit >= 0 ? 'صافي الربح' : 'صافي الخسارة'}
                        </td>
                        <td style="text-align: left; color: ${netProfit >= 0 ? '#4caf50' : '#f44336'}; font-size: 22px;">
                            ${formatCurrency(Math.abs(netProfit), 'YER')}
                        </td>
                    </tr>
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

// إضافة خيار العملات المتعددة في قائمة التقارير
function addMultiCurrencyReportOption() {
    // سيتم استدعاء هذه الدالة من loadReports() الأصلية
    return `
        <div class="card" style="cursor: pointer;" onclick="generateMultiCurrencyIncomeStatement()">
            <div style="padding: 20px; text-align: center;">
                <i class="fas fa-coins" style="font-size: 48px; color: var(--secondary-color);"></i>
                <h4 style="margin-top: 15px;">قائمة الدخل متعددة العملات</h4>
                <p style="color: var(--text-light);">عرض حسب العملة</p>
            </div>
        </div>`;
}
