// ========================================
// نظام إدارة العملات المتعددة
// ========================================

// دوال مساعدة لحساب الأرصدة بالعملات المختلفة
function calculateBalanceByCurrency(transactions, currency = null) {
    const balances = {
        YER: { debit: 0, credit: 0, balance: 0 },
        SAR: { debit: 0, credit: 0, balance: 0 },
        USD: { debit: 0, credit: 0, balance: 0 },
        total_yer: 0 // الإجمالي بالريال اليمني (العملة الأساسية)
    };
    
    transactions.forEach(trans => {
        const curr = trans.currency || 'YER';
        const debit = trans.debit || 0;
        const credit = trans.credit || 0;
        
        if (currency && curr !== currency) {
            return; // تخطي إذا كنا نبحث عن عملة معينة
        }
        
        balances[curr].debit += debit;
        balances[curr].credit += credit;
        balances[curr].balance = balances[curr].debit - balances[curr].credit;
        
        // تحويل إلى العملة الأساسية
        const debitInBase = convertToBaseCurrency(debit, curr);
        const creditInBase = convertToBaseCurrency(credit, curr);
        balances.total_yer += (debitInBase - creditInBase);
    });
    
    return balances;
}

// إنشاء كشف حساب متعدد العملات
function generateMultiCurrencyStatement(accountId, startDate = null, endDate = null) {
    const account = findItem('accounts', accountId);
    if (!account) return null;
    
    // جمع جميع المعاملات
    const journal_entries = getData('journal_entries') || [];
    const invoices = getData('invoices') || [];
    const vouchers = getData('vouchers') || [];
    
    const transactions = [];
    
    // معاملات القيود
    journal_entries.forEach(entry => {
        if (startDate && entry.date < startDate) return;
        if (endDate && entry.date > endDate) return;
        
        entry.items.forEach(item => {
            if (item.accountId === accountId) {
                transactions.push({
                    date: entry.date,
                    description: entry.description,
                    type: 'journal',
                    number: entry.number,
                    debit: item.debit,
                    credit: item.credit,
                    currency: entry.currency || 'YER'
                });
            }
        });
    });
    
    // معاملات الفواتير
    invoices.forEach(invoice => {
        if (startDate && invoice.date < startDate) return;
        if (endDate && invoice.date > endDate) return;
        
        const isRelevant = 
            (invoice.type === 'sales' && invoice.customer_id === accountId) ||
            (invoice.type === 'purchase' && invoice.supplier_id === accountId);
        
        if (isRelevant) {
            transactions.push({
                date: invoice.date,
                description: `فاتورة ${invoice.type === 'sales' ? 'مبيعات' : 'مشتريات'} رقم ${invoice.number}`,
                type: 'invoice',
                number: invoice.number,
                debit: invoice.type === 'sales' ? invoice.total : 0,
                credit: invoice.type === 'purchase' ? invoice.total : 0,
                currency: invoice.currency || 'YER'
            });
        }
    });
    
    // معاملات السندات
    vouchers.forEach(voucher => {
        if (startDate && voucher.date < startDate) return;
        if (endDate && voucher.date > endDate) return;
        
        if (voucher.account_id === accountId) {
            transactions.push({
                date: voucher.date,
                description: `سند ${voucher.type === 'receipt' ? 'قبض' : 'صرف'} رقم ${voucher.number}`,
                type: 'voucher',
                number: voucher.number,
                debit: voucher.type === 'receipt' ? voucher.amount : 0,
                credit: voucher.type === 'payment' ? voucher.amount : 0,
                currency: voucher.currency || 'YER'
            });
        }
    });
    
    // ترتيب حسب التاريخ
    transactions.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // حساب الأرصدة
    const balances = calculateBalanceByCurrency(transactions);
    
    return {
        account,
        transactions,
        balances,
        period: {
            start: startDate,
            end: endDate
        }
    };
}

// عرض كشف حساب بعملة معينة
function displayCurrencyStatement(accountId, currency = null) {
    const statement = generateMultiCurrencyStatement(accountId);
    if (!statement) {
        showAlert('لم يتم العثور على الحساب', 'error');
        return;
    }
    
    const content = document.getElementById('content');
    const currencyFilter = currency || 'all';
    
    // تصفية المعاملات حسب العملة
    const filteredTransactions = currencyFilter === 'all' 
        ? statement.transactions 
        : statement.transactions.filter(t => t.currency === currencyFilter);
    
    let html = `
        <div class="card">
            <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h3 class="card-title">
                        <i class="fas fa-file-invoice"></i>
                        كشف حساب: ${statement.account.name}
                    </h3>
                    <p style="margin: 5px 0 0 0; color: var(--text-light);">
                        رمز الحساب: ${statement.account.code}
                    </p>
                </div>
                <div style="display: flex; gap: 10px;">
                    <select class="form-control" style="width: 200px;" onchange="displayCurrencyStatement('${accountId}', this.value === 'all' ? null : this.value)">
                        <option value="all" ${currencyFilter === 'all' ? 'selected' : ''}>جميع العملات</option>
                        <option value="YER" ${currencyFilter === 'YER' ? 'selected' : ''}>ريال يمني</option>
                        <option value="SAR" ${currencyFilter === 'SAR' ? 'selected' : ''}>ريال سعودي</option>
                        <option value="USD" ${currencyFilter === 'USD' ? 'selected' : ''}>دولار أمريكي</option>
                    </select>
                    <button class="btn btn-secondary" onclick="loadAccounts()">
                        <i class="fas fa-arrow-right"></i>
                        رجوع
                    </button>
                    <button class="btn btn-primary" onclick="printStatement('${accountId}', '${currencyFilter}')">
                        <i class="fas fa-print"></i>
                        طباعة
                    </button>
                </div>
            </div>
            
            <div style="padding: 20px; background: var(--light-bg);">
                <div class="stats-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">`;
    
    // عرض الأرصدة حسب العملة
    if (currencyFilter === 'all') {
        Object.keys(CURRENCIES).forEach(curr => {
            const balance = statement.balances[curr];
            if (balance.debit > 0 || balance.credit > 0) {
                html += `
                    <div class="stat-card">
                        <h4 style="font-size: 14px; color: var(--text-light); margin-bottom: 10px;">
                            ${CURRENCIES[curr].name}
                        </h4>
                        <div style="font-size: 12px; margin-bottom: 5px;">
                            <strong>مدين:</strong> ${formatCurrency(balance.debit, curr)}
                        </div>
                        <div style="font-size: 12px; margin-bottom: 5px;">
                            <strong>دائن:</strong> ${formatCurrency(balance.credit, curr)}
                        </div>
                        <div style="font-size: 14px; font-weight: bold; padding-top: 5px; border-top: 1px solid var(--border-color);">
                            <strong>الرصيد:</strong> 
                            <span style="color: ${balance.balance >= 0 ? 'var(--success-color)' : 'var(--danger-color)'};">
                                ${formatCurrency(Math.abs(balance.balance), curr)}
                                ${balance.balance >= 0 ? ' مدين' : ' دائن'}
                            </span>
                        </div>
                    </div>`;
            }
        });
        
        // عرض الإجمالي بالعملة الأساسية
        html += `
            <div class="stat-card" style="background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); color: white;">
                <h4 style="font-size: 14px; margin-bottom: 10px; opacity: 0.9;">
                    الإجمالي (بالريال اليمني)
                </h4>
                <div style="font-size: 24px; font-weight: bold;">
                    ${formatCurrency(Math.abs(statement.balances.total_yer), 'YER')}
                    ${statement.balances.total_yer >= 0 ? ' مدين' : ' دائن'}
                </div>
            </div>`;
    } else {
        // عرض عملة واحدة فقط
        const balance = statement.balances[currencyFilter];
        html += `
            <div class="stat-card">
                <h4 style="font-size: 14px; color: var(--text-light);">مدين</h4>
                <div style="font-size: 20px; font-weight: bold;">${formatCurrency(balance.debit, currencyFilter)}</div>
            </div>
            <div class="stat-card">
                <h4 style="font-size: 14px; color: var(--text-light);">دائن</h4>
                <div style="font-size: 20px; font-weight: bold;">${formatCurrency(balance.credit, currencyFilter)}</div>
            </div>
            <div class="stat-card" style="background: ${balance.balance >= 0 ? 'var(--success-color)' : 'var(--danger-color)'}; color: white;">
                <h4 style="font-size: 14px; opacity: 0.9;">الرصيد</h4>
                <div style="font-size: 24px; font-weight: bold;">
                    ${formatCurrency(Math.abs(balance.balance), currencyFilter)}
                    ${balance.balance >= 0 ? ' مدين' : ' دائن'}
                </div>
            </div>`;
    }
    
    html += `
                </div>
            </div>
            
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th>التاريخ</th>
                            <th>رقم المستند</th>
                            <th>البيان</th>
                            <th>العملة</th>
                            <th>مدين</th>
                            <th>دائن</th>
                            <th>الرصيد</th>
                        </tr>
                    </thead>
                    <tbody>`;
    
    if (filteredTransactions.length === 0) {
        html += '<tr><td colspan="7" style="text-align: center; padding: 40px;">لا توجد معاملات</td></tr>';
    } else {
        let runningBalance = 0;
        filteredTransactions.forEach(trans => {
            const curr = trans.currency || 'YER';
            const debitInBase = convertToBaseCurrency(trans.debit, curr);
            const creditInBase = convertToBaseCurrency(trans.credit, curr);
            runningBalance += (debitInBase - creditInBase);
            
            html += `
                <tr>
                    <td>${formatDateShort(trans.date)}</td>
                    <td>${trans.number}</td>
                    <td>${trans.description}</td>
                    <td><span class="badge" style="padding: 4px 8px; border-radius: 4px; background: var(--primary-color); color: white; font-size: 0.85em;">${CURRENCIES[curr].symbol}</span></td>
                    <td style="color: var(--success-color); font-weight: ${trans.debit > 0 ? 'bold' : 'normal'};">${trans.debit > 0 ? formatCurrency(trans.debit, curr) : '-'}</td>
                    <td style="color: var(--danger-color); font-weight: ${trans.credit > 0 ? 'bold' : 'normal'};">${trans.credit > 0 ? formatCurrency(trans.credit, curr) : '-'}</td>
                    <td style="font-weight: bold; color: ${runningBalance >= 0 ? 'var(--success-color)' : 'var(--danger-color)'};">
                        ${formatCurrency(Math.abs(runningBalance), 'YER')} ${runningBalance >= 0 ? 'مدين' : 'دائن'}
                    </td>
                </tr>`;
        });
    }
    
    html += `
                    </tbody>
                </table>
            </div>
        </div>`;
    
    content.innerHTML = html;
}

// طباعة كشف حساب بعملة معينة
function printStatement(accountId, currency = 'all') {
    const statement = generateMultiCurrencyStatement(accountId);
    if (!statement) return;
    
    const currencyFilter = currency === 'all' ? null : currency;
    const filteredTransactions = currencyFilter 
        ? statement.transactions.filter(t => t.currency === currencyFilter)
        : statement.transactions;
    
    let html = `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8">
            <title>كشف حساب - ${statement.account.name}</title>
            <style>
                body {
                    font-family: 'Cairo', Arial, sans-serif;
                    direction: rtl;
                    margin: 20px;
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 3px solid #f57c00;
                }
                .logo {
                    max-width: 150px;
                    margin-bottom: 10px;
                }
                .company-name {
                    font-size: 24px;
                    font-weight: bold;
                    color: #004d40;
                    margin: 10px 0;
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
                    background-color: #f57c00;
                    color: white;
                }
                @media print {
                    body { margin: 0; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <img src="${COMPANY_INFO.logo}" alt="Logo" class="logo">
                <div class="company-name">${COMPANY_INFO.name}</div>
                <p>${COMPANY_INFO.location}</p>
            </div>
            
            <h2 style="text-align: center;">كشف حساب: ${statement.account.name}</h2>
            <p style="text-align: center;">رمز الحساب: ${statement.account.code}</p>
            ${currencyFilter ? `<p style="text-align: center;">العملة: ${CURRENCIES[currencyFilter].name}</p>` : '<p style="text-align: center;">جميع العملات</p>'}
            
            <table>
                <thead>
                    <tr>
                        <th>التاريخ</th>
                        <th>رقم المستند</th>
                        <th>البيان</th>
                        <th>العملة</th>
                        <th>مدين</th>
                        <th>دائن</th>
                        <th>الرصيد</th>
                    </tr>
                </thead>
                <tbody>`;
    
    let runningBalance = 0;
    filteredTransactions.forEach(trans => {
        const curr = trans.currency || 'YER';
        const debitInBase = convertToBaseCurrency(trans.debit, curr);
        const creditInBase = convertToBaseCurrency(trans.credit, curr);
        runningBalance += (debitInBase - creditInBase);
        
        html += `
            <tr>
                <td>${formatDateShort(trans.date)}</td>
                <td>${trans.number}</td>
                <td>${trans.description}</td>
                <td>${CURRENCIES[curr].symbol}</td>
                <td>${trans.debit > 0 ? formatCurrency(trans.debit, curr) : '-'}</td>
                <td>${trans.credit > 0 ? formatCurrency(trans.credit, curr) : '-'}</td>
                <td>${formatCurrency(Math.abs(runningBalance), 'YER')} ${runningBalance >= 0 ? 'مدين' : 'دائن'}</td>
            </tr>`;
    });
    
    html += `
                </tbody>
            </table>
            
            <div style="margin-top: 30px; text-align: center; color: #666; font-size: 12px;">
                <p>تاريخ الطباعة: ${formatDate(new Date().toISOString())}</p>
            </div>
        </body>
        </html>`;
    
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
}
