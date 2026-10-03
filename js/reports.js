// وحدة التقارير المالية
function loadReports() {
    const content = document.getElementById('content');
    
    content.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title"><i class="fas fa-chart-bar"></i> التقارير المالية</h3>
            </div>
            <div style="padding: 20px;">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
                    <div class="card" style="cursor: pointer;" onclick="generateIncomeStatement()">
                        <div style="padding: 20px; text-align: center;">
                            <i class="fas fa-file-alt" style="font-size: 48px; color: var(--primary-color);"></i>
                            <h4 style="margin-top: 15px;">قائمة الدخل</h4>
                            <p style="color: var(--text-light);">عرض الإيرادات والمصروفات</p>
                        </div>
                    </div>
                    
                    <div class="card" style="cursor: pointer; border: 2px solid var(--secondary-color);" onclick="generateMultiCurrencyIncomeStatement()">
                        <div style="padding: 20px; text-align: center;">
                            <i class="fas fa-coins" style="font-size: 48px; color: var(--secondary-color);"></i>
                            <h4 style="margin-top: 15px; color: var(--secondary-color);">قائمة الدخل متعددة العملات</h4>
                            <p style="color: var(--text-light);">عرض حسب العملة</p>
                        </div>
                    </div>
                    
                    <div class="card" style="cursor: pointer;" onclick="generateBalanceSheet()">
                        <div style="padding: 20px; text-align: center;">
                            <i class="fas fa-balance-scale" style="font-size: 48px; color: var(--success-color);"></i>
                            <h4 style="margin-top: 15px;">الميزانية العمومية</h4>
                            <p style="color: var(--text-light);">الأصول والخصوم</p>
                        </div>
                    </div>
                    
                    <div class="card" style="cursor: pointer;" onclick="generateTrialBalance()">
                        <div style="padding: 20px; text-align: center;">
                            <i class="fas fa-calculator" style="font-size: 48px; color: var(--info-color);"></i>
                            <h4 style="margin-top: 15px;">ميزان المراجعة</h4>
                            <p style="color: var(--text-light);">أرصدة الحسابات</p>
                        </div>
                    </div>
                    
                    <div class="card" style="cursor: pointer;" onclick="generateCashFlow()">
                        <div style="padding: 20px; text-align: center;">
                            <i class="fas fa-money-bill-wave" style="font-size: 48px; color: var(--warning-color);"></i>
                            <h4 style="margin-top: 15px;">التدفقات النقدية</h4>
                            <p style="color: var(--text-light);">حركة النقد</p>
                        </div>
                    </div>
                    
                    <!-- كشوفات الحسابات -->
                    <div class="card" style="cursor: pointer; background: linear-gradient(135deg, #004d40 0%, #00695c 100%);" onclick="handleAction('customer-statements')">
                        <div style="padding: 20px; text-align: center;">
                            <i class="fas fa-user-check" style="font-size: 48px; color: white;"></i>
                            <h4 style="margin-top: 15px; color: white;">كشف حساب عميل</h4>
                            <p style="color: #b2dfdb;">حساب عميل محدد</p>
                        </div>
                    </div>
                    
                    <div class="card" style="cursor: pointer; background: linear-gradient(135deg, #004d40 0%, #00695c 100%);" onclick="handleAction('all-customers-statements')">
                        <div style="padding: 20px; text-align: center;">
                            <i class="fas fa-users" style="font-size: 48px; color: white;"></i>
                            <h4 style="margin-top: 15px; color: white;">كشف حساب جميع العملاء</h4>
                            <p style="color: #b2dfdb;">جميع العملاء</p>
                        </div>
                    </div>
                    
                    <div class="card" style="cursor: pointer; background: linear-gradient(135deg, #d32f2f 0%, #f44336 100%);" onclick="handleAction('supplier-statements')">
                        <div style="padding: 20px; text-align: center;">
                            <i class="fas fa-truck" style="font-size: 48px; color: white;"></i>
                            <h4 style="margin-top: 15px; color: white;">كشف حساب مورد</h4>
                            <p style="color: #ffcdd2;">حساب مورد محدد</p>
                        </div>
                    </div>
                    
                    <div class="card" style="cursor: pointer; background: linear-gradient(135deg, #d32f2f 0%, #f44336 100%);" onclick="handleAction('all-suppliers-statements')">
                        <div style="padding: 20px; text-align: center;">
                            <i class="fas fa-truck-loading" style="font-size: 48px; color: white;"></i>
                            <h4 style="margin-top: 15px; color: white;">كشف حساب جميع الموردين</h4>
                            <p style="color: #ffcdd2;">جميع الموردين</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function generateIncomeStatement() {
    const filter = getGlobalCurrencyFilter();
    const displayCurrency = (filter === 'all') ? null : filter;
    
    // استخدام الدوال المصفاة إذا كان هناك تصفية نشطة
    const totalRevenue = (filter === 'all') ? getTotalRevenue() : getTotalRevenueFiltered();
    const totalExpenses = (filter === 'all') ? getTotalExpenses() : getTotalExpensesFiltered();
    const netProfit = (filter === 'all') ? getNetProfit() : getNetProfitFiltered();
    
    // الحصول على اسم العملة للعرض
    let currencyLabel = '';
    if (filter !== 'all') {
        const currencyInfo = CURRENCIES[filter];
        currencyLabel = `<div style="text-align: center; margin: 10px 0; color: var(--primary-color); font-weight: bold;">
            (${currencyInfo.name})
        </div>`;
    }
    
    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="card">
            <div class="card-header">
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                    <h3 class="card-title" style="margin: 0;"><i class="fas fa-file-alt"></i> قائمة الدخل</h3>
                    <div style="display: flex; gap: 10px; align-items: center;">
                        ${generateCurrencyFilterDropdown()}
                        <button class="btn btn-primary" onclick="window.print()">
                            <i class="fas fa-print"></i>
                            طباعة
                        </button>
                        <button class="btn btn-secondary" onclick="loadReports()">
                            <i class="fas fa-arrow-right"></i>
                            رجوع
                        </button>
                    </div>
                </div>
            </div>
            
            ${generateDocumentHeader('قائمة الدخل')}
            ${currencyLabel}
            
            <div style="padding: 20px;">
                <table class="table">
                    <tbody>
                        <tr style="background: var(--light-bg); font-weight: bold;">
                            <td>الإيرادات</td>
                            <td></td>
                        </tr>
                        <tr>
                            <td>&nbsp;&nbsp;&nbsp;&nbsp;إجمالي الإيرادات</td>
                            <td style="text-align: left;">${formatCurrency(totalRevenue, displayCurrency)}</td>
                        </tr>
                        <tr style="background: var(--light-bg); font-weight: bold;">
                            <td>المصروفات</td>
                            <td></td>
                        </tr>
                        <tr>
                            <td>&nbsp;&nbsp;&nbsp;&nbsp;إجمالي المصروفات</td>
                            <td style="text-align: left;">${formatCurrency(totalExpenses, displayCurrency)}</td>
                        </tr>
                        <tr style="background: ${netProfit >= 0 ? '#e8f5e9' : '#ffebee'}; font-weight: bold; font-size: 18px;">
                            <td>${netProfit >= 0 ? 'صافي الربح' : 'صافي الخسارة'}</td>
                            <td style="text-align: left; color: ${netProfit >= 0 ? 'var(--success-color)' : 'var(--danger-color)'};">
                                ${formatCurrency(Math.abs(netProfit), displayCurrency)}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            ${generateDocumentFooter()}
        </div>
    `;
}

function generateBalanceSheet() {
    const accounts = getData('accounts') || [];
    const filter = getGlobalCurrencyFilter();
    const displayCurrency = (filter === 'all') ? null : filter;
    
    // حساب الأصول
    const assetAccounts = accounts.filter(acc => acc.code.startsWith('1') && acc.type === 'detail');
    const totalAssets = assetAccounts.reduce((sum, acc) => sum + getAccountBalance(acc.id), 0);
    
    // حساب الخصوم
    const liabilityAccounts = accounts.filter(acc => acc.code.startsWith('2') && acc.type === 'detail');
    const totalLiabilities = liabilityAccounts.reduce((sum, acc) => sum + Math.abs(getAccountBalance(acc.id)), 0);
    
    // حساب حقوق الملكية
    const equityAccounts = accounts.filter(acc => acc.code.startsWith('3') && acc.type === 'detail');
    let totalEquity = equityAccounts.reduce((sum, acc) => sum + Math.abs(getAccountBalance(acc.id)), 0);
    
    // إضافة صافي الربح لحقوق الملكية
    const netProfit = (filter === 'all') ? getNetProfit() : getNetProfitFiltered();
    totalEquity += netProfit;
    
    const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;
    
    // الحصول على اسم العملة للعرض
    let currencyLabel = '';
    if (filter !== 'all') {
        const currencyInfo = CURRENCIES[filter];
        currencyLabel = `<div style="text-align: center; margin: 10px 0; color: var(--primary-color); font-weight: bold;">
            (${currencyInfo.name})
        </div>`;
    }
    
    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="card">
            <div class="card-header">
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                    <h3 class="card-title" style="margin: 0;"><i class="fas fa-balance-scale"></i> الميزانية العمومية</h3>
                    <div style="display: flex; gap: 10px; align-items: center;">
                        ${generateCurrencyFilterDropdown()}
                        <button class="btn btn-primary" onclick="window.print()">
                            <i class="fas fa-print"></i>
                            طباعة
                        </button>
                        <button class="btn btn-secondary" onclick="loadReports()">
                            <i class="fas fa-arrow-right"></i>
                            رجوع
                        </button>
                    </div>
                </div>
            </div>
            
            ${generateDocumentHeader('الميزانية العمومية')}
            ${currencyLabel}
            
            <div style="padding: 30px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
                    <!-- الأصول -->
                    <div>
                        <h3 style="color: var(--primary-color); border-bottom: 3px solid var(--primary-color); padding-bottom: 10px; margin-bottom: 20px;">
                            الأصول
                        </h3>
                        
                        <h4 style="color: var(--secondary-color); margin-top: 20px;">أصول متداولة</h4>
                        <table class="table" style="margin-bottom: 30px;">
                            <tbody>
                                ${assetAccounts.filter(acc => acc.code.startsWith('11')).map(acc => {
                                    const balance = getAccountBalance(acc.id);
                                    return `
                                        <tr>
                                            <td style="padding-right: 20px;">${acc.name}</td>
                                            <td style="text-align: left;">${formatCurrency(balance, displayCurrency)}</td>
                                        </tr>
                                    `;
                                }).join('')}
                                <tr style="background: var(--light-bg); font-weight: bold;">
                                    <td>إجمالي الأصول المتداولة</td>
                                    <td style="text-align: left;">${formatCurrency(
                                        assetAccounts.filter(acc => acc.code.startsWith('11'))
                                            .reduce((sum, acc) => sum + getAccountBalance(acc.id), 0),
                                        displayCurrency
                                    )}</td>
                                </tr>
                            </tbody>
                        </table>
                        
                        ${assetAccounts.some(acc => acc.code.startsWith('12')) ? `
                            <h4 style="color: var(--secondary-color); margin-top: 20px;">أصول ثابتة</h4>
                            <table class="table" style="margin-bottom: 30px;">
                                <tbody>
                                    ${assetAccounts.filter(acc => acc.code.startsWith('12')).map(acc => {
                                        const balance = getAccountBalance(acc.id);
                                        return `
                                            <tr>
                                                <td style="padding-right: 20px;">${acc.name}</td>
                                                <td style="text-align: left;">${formatCurrency(balance, displayCurrency)}</td>
                                            </tr>
                                        `;
                                    }).join('')}
                                    <tr style="background: var(--light-bg); font-weight: bold;">
                                        <td>إجمالي الأصول الثابتة</td>
                                        <td style="text-align: left;">${formatCurrency(
                                            assetAccounts.filter(acc => acc.code.startsWith('12'))
                                                .reduce((sum, acc) => sum + getAccountBalance(acc.id), 0),
                                            displayCurrency
                                        )}</td>
                                    </tr>
                                </tbody>
                            </table>
                        ` : ''}
                        
                        <div style="background: var(--primary-color); color: white; padding: 20px; border-radius: 8px; margin-top: 20px;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <strong style="font-size: 20px;">إجمالي الأصول</strong>
                                <strong style="font-size: 24px;">${formatCurrency(totalAssets, displayCurrency)}</strong>
                            </div>
                        </div>
                    </div>
                    
                    <!-- الخصوم وحقوق الملكية -->
                    <div>
                        <h3 style="color: var(--success-color); border-bottom: 3px solid var(--success-color); padding-bottom: 10px; margin-bottom: 20px;">
                            الخصوم وحقوق الملكية
                        </h3>
                        
                        <h4 style="color: var(--secondary-color); margin-top: 20px;">الخصوم</h4>
                        <table class="table" style="margin-bottom: 30px;">
                            <tbody>
                                ${liabilityAccounts.map(acc => {
                                    const balance = Math.abs(getAccountBalance(acc.id));
                                    return `
                                        <tr>
                                            <td style="padding-right: 20px;">${acc.name}</td>
                                            <td style="text-align: left;">${formatCurrency(balance, displayCurrency)}</td>
                                        </tr>
                                    `;
                                }).join('')}
                                ${liabilityAccounts.length === 0 ? '<tr><td colspan="2" style="text-align: center; color: #999;">لا توجد خصوم</td></tr>' : ''}
                                <tr style="background: var(--light-bg); font-weight: bold;">
                                    <td>إجمالي الخصوم</td>
                                    <td style="text-align: left;">${formatCurrency(totalLiabilities, displayCurrency)}</td>
                                </tr>
                            </tbody>
                        </table>
                        
                        <h4 style="color: var(--secondary-color); margin-top: 20px;">حقوق الملكية</h4>
                        <table class="table" style="margin-bottom: 30px;">
                            <tbody>
                                ${equityAccounts.map(acc => {
                                    const balance = Math.abs(getAccountBalance(acc.id));
                                    return `
                                        <tr>
                                            <td style="padding-right: 20px;">${acc.name}</td>
                                            <td style="text-align: left;">${formatCurrency(balance, displayCurrency)}</td>
                                        </tr>
                                    `;
                                }).join('')}
                                <tr>
                                    <td style="padding-right: 20px;">صافي الربح/الخسارة</td>
                                    <td style="text-align: left; color: ${netProfit >= 0 ? 'var(--success-color)' : 'var(--danger-color)'};">
                                        ${formatCurrency(Math.abs(netProfit), displayCurrency)}
                                    </td>
                                </tr>
                                <tr style="background: var(--light-bg); font-weight: bold;">
                                    <td>إجمالي حقوق الملكية</td>
                                    <td style="text-align: left;">${formatCurrency(totalEquity, displayCurrency)}</td>
                                </tr>
                            </tbody>
                        </table>
                        
                        <div style="background: var(--success-color); color: white; padding: 20px; border-radius: 8px; margin-top: 20px;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <strong style="font-size: 20px;">إجمالي الخصوم وحقوق الملكية</strong>
                                <strong style="font-size: 24px;">${formatCurrency(totalLiabilitiesAndEquity, displayCurrency)}</strong>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- المعادلة المحاسبية -->
                <div style="margin-top: 40px; padding: 30px; background: linear-gradient(135deg, var(--info-color) 0%, #64b5f6 100%); color: white; border-radius: 10px; text-align: center;">
                    <h3 style="margin-bottom: 20px;">المعادلة المحاسبية</h3>
                    <div style="font-size: 24px; font-weight: bold;">
                        الأصول (${formatCurrency(totalAssets, displayCurrency)})
                        = 
                        الخصوم (${formatCurrency(totalLiabilities, displayCurrency)})
                        + 
                        حقوق الملكية (${formatCurrency(totalEquity, displayCurrency)})
                    </div>
                    ${Math.abs(totalAssets - totalLiabilitiesAndEquity) < 0.01 ? 
                        '<p style="margin-top: 15px; font-size: 18px;"><i class="fas fa-check-circle"></i> الميزانية متوازنة</p>' : 
                        '<p style="margin-top: 15px; font-size: 18px; color: #ffeb3b;"><i class="fas fa-exclamation-triangle"></i> تحذير: الميزانية غير متوازنة</p>'
                    }
                </div>
            </div>
            
            ${generateDocumentFooter()}
        </div>
    `;
}

function generateTrialBalance() {
    const accounts = getData('accounts') || [];
    const detailAccounts = accounts.filter(acc => acc.type === 'detail');
    const filter = getGlobalCurrencyFilter();
    const displayCurrency = (filter === 'all') ? null : filter;
    
    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title"><i class="fas fa-calculator"></i> ميزان المراجعة</h3>
                <button class="btn btn-secondary" onclick="loadReports()">
                    <i class="fas fa-arrow-right"></i> رجوع
                </button>
            </div>
            <div class="company-header" style="display: flex; justify-content: space-between; align-items: center; padding: 20px; border-bottom: 3px solid #f57c00;">
                <div style="flex: 1; text-align: left;">
                    <h2 class="company-name" style="margin: 0; color: #004d40;">${COMPANY_INFO.name}</h2>
                    <p class="company-subtitle" style="margin: 5px 0; color: #666;">ميزان المراجعة</p>
                    <p style="margin: 5px 0; color: #666; font-size: 13px;">${COMPANY_INFO.location}</p>
                </div>
                <div class="company-logo" style="flex: 0 0 auto; text-align: right;">
                    <img src="${COMPANY_INFO.logo}" alt="سكاي آيكون" style="max-width: 150px; max-height: 120px; object-fit: contain;">
                </div>
            </div>
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th>رمز الحساب</th>
                            <th>اسم الحساب</th>
                            <th>مدين</th>
                            <th>دائن</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${detailAccounts.map(acc => {
                            const balance = getAccountBalance(acc.id);
                            return `
                                <tr>
                                    <td>${acc.code}</td>
                                    <td>${acc.name}</td>
                                    <td>${balance >= 0 ? formatCurrency(balance, displayCurrency) : '-'}</td>
                                    <td>${balance < 0 ? formatCurrency(Math.abs(balance), displayCurrency) : '-'}</td>
                                </tr>
                            `;
                        }).join('')}
                        <tr style="background: var(--light-bg); font-weight: bold;">
                            <td colspan="2">المجموع</td>
                            <td>${formatCurrency(detailAccounts.reduce((sum, acc) => {
                                const bal = getAccountBalance(acc.id);
                                return sum + (bal >= 0 ? bal : 0);
                            }, 0), displayCurrency)}</td>
                            <td>${formatCurrency(detailAccounts.reduce((sum, acc) => {
                                const bal = getAccountBalance(acc.id);
                                return sum + (bal < 0 ? Math.abs(bal) : 0);
                            }, 0), displayCurrency)}</td>
                        </tr>
                    </tbody>
                </table>
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

function generateCashFlow() {
    const filter = getGlobalCurrencyFilter();
    const vouchers = getData('vouchers') || [];
    const journalEntries = getData('journal_entries') || [];
    
    // الحسابات النقدية (خزينة وبنك)
    const cashAccountIds = ['1111', '1112'];
    
    // جمع جميع الحركات النقدية مع تصفية حسب العملة
    const cashMovements = [];
    
    // من السندات
    vouchers.forEach(voucher => {
        // تصفية حسب العملة
        if (filter !== 'all' && voucher.currency && voucher.currency !== filter) {
            return;
        }
        
        cashMovements.push({
            date: voucher.date,
            description: voucher.description,
            type: voucher.type === 'receipt' ? 'inflow' : 'outflow',
            amount: voucher.amount,
            category: classifyVoucherActivity(voucher),
            reference: voucher.number
        });
    });
    
    // من القيود المحاسبية التي تؤثر على النقدية
    journalEntries.forEach(entry => {
        // تصفية حسب العملة
        if (filter !== 'all' && entry.currency && entry.currency !== filter) {
            return;
        }
        
        entry.items.forEach(item => {
            if (cashAccountIds.includes(item.accountId)) {
                if (item.debit > 0) {
                    cashMovements.push({
                        date: entry.date,
                        description: entry.description,
                        type: 'inflow',
                        amount: item.debit,
                        category: 'operating',
                        reference: entry.number
                    });
                }
                if (item.credit > 0) {
                    cashMovements.push({
                        date: entry.date,
                        description: entry.description,
                        type: 'outflow',
                        amount: item.credit,
                        category: 'operating',
                        reference: entry.number
                    });
                }
            }
        });
    });
    
    // ترتيب حسب التاريخ
    cashMovements.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // تصنيف التدفقات
    const operatingInflows = cashMovements.filter(m => m.category === 'operating' && m.type === 'inflow');
    const operatingOutflows = cashMovements.filter(m => m.category === 'operating' && m.type === 'outflow');
    const investingInflows = cashMovements.filter(m => m.category === 'investing' && m.type === 'inflow');
    const investingOutflows = cashMovements.filter(m => m.category === 'investing' && m.type === 'outflow');
    const financingInflows = cashMovements.filter(m => m.category === 'financing' && m.type === 'inflow');
    const financingOutflows = cashMovements.filter(m => m.category === 'financing' && m.type === 'outflow');
    
    // حساب الإجماليات
    const netOperating = operatingInflows.reduce((sum, m) => sum + m.amount, 0) - 
                         operatingOutflows.reduce((sum, m) => sum + m.amount, 0);
    const netInvesting = investingInflows.reduce((sum, m) => sum + m.amount, 0) - 
                         investingOutflows.reduce((sum, m) => sum + m.amount, 0);
    const netFinancing = financingInflows.reduce((sum, m) => sum + m.amount, 0) - 
                         financingOutflows.reduce((sum, m) => sum + m.amount, 0);
    
    const netCashChange = netOperating + netInvesting + netFinancing;
    
    // رصيد أول المدة (افتراضياً صفر، يمكن تحسينه)
    const openingCash = 0;
    const closingCash = openingCash + netCashChange;
    
    // الرصيد الفعلي الحالي
    const currentCash = getCashBalance() + getBankBalance();
    
    // الحصول على اسم العملة للعرض
    const displayCurrency = filter === 'all' ? null : filter;
    let currencyLabel = '';
    if (filter !== 'all') {
        const currencyInfo = CURRENCIES[filter];
        currencyLabel = `<div style="text-align: center; margin: 10px 0; color: var(--primary-color); font-weight: bold;">
            (${currencyInfo.name})
        </div>`;
    }
    
    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="card">
            <div class="card-header">
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                    <h3 class="card-title" style="margin: 0;"><i class="fas fa-money-bill-wave"></i> قائمة التدفقات النقدية</h3>
                    <div style="display: flex; gap: 10px; align-items: center;">
                        ${generateCurrencyFilterDropdown()}
                        <button class="btn btn-primary" onclick="printCashFlowReport()">
                            <i class="fas fa-print"></i>
                            طباعة
                        </button>
                        <button class="btn btn-secondary" onclick="loadReports()">
                            <i class="fas fa-arrow-right"></i>
                            رجوع
                        </button>
                    </div>
                </div>
            </div>
            
            ${generateDocumentHeader('قائمة التدفقات النقدية')}
            ${currencyLabel}
            
            <div style="padding: 30px;">
                <!-- التدفقات النقدية من الأنشطة التشغيلية -->
                <div style="margin-bottom: 40px;">
                    <h3 style="color: var(--primary-color); border-bottom: 3px solid var(--primary-color); padding-bottom: 10px; margin-bottom: 20px;">
                        <i class="fas fa-cogs"></i>
                        التدفقات النقدية من الأنشطة التشغيلية
                    </h3>
                    
                    <table class="table">
                        <tbody>
                            <tr style="background: var(--light-bg); font-weight: bold;">
                                <td colspan="2">التدفقات النقدية الداخلة</td>
                            </tr>
                            ${operatingInflows.length === 0 ? 
                                '<tr><td colspan="2" style="padding-right: 20px; color: #999;">لا توجد تدفقات داخلة</td></tr>' :
                                operatingInflows.map(m => `
                                    <tr>
                                        <td style="padding-right: 20px;">${m.description}</td>
                                        <td style="text-align: left; color: var(--success-color);">${formatCurrency(m.amount, displayCurrency)}</td>
                                    </tr>
                                `).join('')
                            }
                            <tr style="font-weight: bold;">
                                <td style="padding-right: 20px;">إجمالي التدفقات الداخلة</td>
                                <td style="text-align: left; color: var(--success-color);">
                                    ${formatCurrency(operatingInflows.reduce((sum, m) => sum + m.amount, 0), displayCurrency)}
                                </td>
                            </tr>
                            
                            <tr style="background: var(--light-bg); font-weight: bold;">
                                <td colspan="2">التدفقات النقدية الخارجة</td>
                            </tr>
                            ${operatingOutflows.length === 0 ? 
                                '<tr><td colspan="2" style="padding-right: 20px; color: #999;">لا توجد تدفقات خارجة</td></tr>' :
                                operatingOutflows.map(m => `
                                    <tr>
                                        <td style="padding-right: 20px;">${m.description}</td>
                                        <td style="text-align: left; color: var(--danger-color);">(${formatCurrency(m.amount, displayCurrency)})</td>
                                    </tr>
                                `).join('')
                            }
                            <tr style="font-weight: bold;">
                                <td style="padding-right: 20px;">إجمالي التدفقات الخارجة</td>
                                <td style="text-align: left; color: var(--danger-color);">
                                    (${formatCurrency(operatingOutflows.reduce((sum, m) => sum + m.amount, 0), displayCurrency)})
                                </td>
                            </tr>
                            
                            <tr style="background: ${netOperating >= 0 ? '#e8f5e9' : '#ffebee'}; font-weight: bold; font-size: 16px;">
                                <td>صافي التدفقات النقدية من الأنشطة التشغيلية</td>
                                <td style="text-align: left; color: ${netOperating >= 0 ? 'var(--success-color)' : 'var(--danger-color)'};">
                                    ${netOperating >= 0 ? '' : '('}${formatCurrency(Math.abs(netOperating), displayCurrency)}${netOperating >= 0 ? '' : ')'}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <!-- التدفقات النقدية من الأنشطة الاستثمارية -->
                <div style="margin-bottom: 40px;">
                    <h3 style="color: var(--info-color); border-bottom: 3px solid var(--info-color); padding-bottom: 10px; margin-bottom: 20px;">
                        <i class="fas fa-chart-line"></i>
                        التدفقات النقدية من الأنشطة الاستثمارية
                    </h3>
                    
                    <table class="table">
                        <tbody>
                            ${investingInflows.length === 0 && investingOutflows.length === 0 ? 
                                '<tr><td colspan="2" style="text-align: center; color: #999; padding: 20px;">لا توجد تدفقات استثمارية في هذه الفترة</td></tr>' :
                                `
                                    ${investingInflows.map(m => `
                                        <tr>
                                            <td style="padding-right: 20px;">${m.description}</td>
                                            <td style="text-align: left; color: var(--success-color);">${formatCurrency(m.amount, displayCurrency)}</td>
                                        </tr>
                                    `).join('')}
                                    ${investingOutflows.map(m => `
                                        <tr>
                                            <td style="padding-right: 20px;">${m.description}</td>
                                            <td style="text-align: left; color: var(--danger-color);">(${formatCurrency(m.amount, displayCurrency)})</td>
                                        </tr>
                                    `).join('')}
                                `
                            }
                            <tr style="background: ${netInvesting >= 0 ? '#e8f5e9' : '#ffebee'}; font-weight: bold; font-size: 16px;">
                                <td>صافي التدفقات النقدية من الأنشطة الاستثمارية</td>
                                <td style="text-align: left; color: ${netInvesting >= 0 ? 'var(--success-color)' : 'var(--danger-color)'};">
                                    ${netInvesting >= 0 ? '' : '('}${formatCurrency(Math.abs(netInvesting), displayCurrency)}${netInvesting >= 0 ? '' : ')'}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <!-- التدفقات النقدية من الأنشطة التمويلية -->
                <div style="margin-bottom: 40px;">
                    <h3 style="color: var(--warning-color); border-bottom: 3px solid var(--warning-color); padding-bottom: 10px; margin-bottom: 20px;">
                        <i class="fas fa-hand-holding-usd"></i>
                        التدفقات النقدية من الأنشطة التمويلية
                    </h3>
                    
                    <table class="table">
                        <tbody>
                            ${financingInflows.length === 0 && financingOutflows.length === 0 ? 
                                '<tr><td colspan="2" style="text-align: center; color: #999; padding: 20px;">لا توجد تدفقات تمويلية في هذه الفترة</td></tr>' :
                                `
                                    ${financingInflows.map(m => `
                                        <tr>
                                            <td style="padding-right: 20px;">${m.description}</td>
                                            <td style="text-align: left; color: var(--success-color);">${formatCurrency(m.amount, displayCurrency)}</td>
                                        </tr>
                                    `).join('')}
                                    ${financingOutflows.map(m => `
                                        <tr>
                                            <td style="padding-right: 20px;">${m.description}</td>
                                            <td style="text-align: left; color: var(--danger-color);">(${formatCurrency(m.amount, displayCurrency)})</td>
                                        </tr>
                                    `).join('')}
                                `
                            }
                            <tr style="background: ${netFinancing >= 0 ? '#e8f5e9' : '#ffebee'}; font-weight: bold; font-size: 16px;">
                                <td>صافي التدفقات النقدية من الأنشطة التمويلية</td>
                                <td style="text-align: left; color: ${netFinancing >= 0 ? 'var(--success-color)' : 'var(--danger-color)'};">
                                    ${netFinancing >= 0 ? '' : '('}${formatCurrency(Math.abs(netFinancing), displayCurrency)}${netFinancing >= 0 ? '' : ')'}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <!-- الملخص -->
                <div style="background: linear-gradient(135deg, var(--secondary-color) 0%, #00695c 100%); color: white; padding: 30px; border-radius: 10px;">
                    <h3 style="margin-bottom: 20px; text-align: center;">ملخص التدفقات النقدية</h3>
                    
                    <table style="width: 100%; color: white;">
                        <tbody>
                            <tr>
                                <td style="padding: 10px;">صافي التدفقات التشغيلية</td>
                                <td style="text-align: left; padding: 10px;">
                                    ${netOperating >= 0 ? '' : '('}${formatCurrency(Math.abs(netOperating), displayCurrency)}${netOperating >= 0 ? '' : ')'}
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 10px;">صافي التدفقات الاستثمارية</td>
                                <td style="text-align: left; padding: 10px;">
                                    ${netInvesting >= 0 ? '' : '('}${formatCurrency(Math.abs(netInvesting), displayCurrency)}${netInvesting >= 0 ? '' : ')'}
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 10px;">صافي التدفقات التمويلية</td>
                                <td style="text-align: left; padding: 10px;">
                                    ${netFinancing >= 0 ? '' : '('}${formatCurrency(Math.abs(netFinancing), displayCurrency)}${netFinancing >= 0 ? '' : ')'}
                                </td>
                            </tr>
                            <tr style="border-top: 2px solid white; font-weight: bold; font-size: 18px;">
                                <td style="padding: 15px 10px;">صافي الزيادة (النقص) في النقدية</td>
                                <td style="text-align: left; padding: 15px 10px;">
                                    ${netCashChange >= 0 ? '' : '('}${formatCurrency(Math.abs(netCashChange), displayCurrency)}${netCashChange >= 0 ? '' : ')'}
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 10px;">النقدية في بداية الفترة</td>
                                <td style="text-align: left; padding: 10px;">${formatCurrency(openingCash, displayCurrency)}</td>
                            </tr>
                            <tr style="border-top: 2px solid white; font-weight: bold; font-size: 20px; background: rgba(255,255,255,0.1);">
                                <td style="padding: 15px 10px;">النقدية في نهاية الفترة</td>
                                <td style="text-align: left; padding: 15px 10px;">${formatCurrency(closingCash, displayCurrency)}</td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <div style="margin-top: 20px; padding: 15px; background: rgba(255,255,255,0.1); border-radius: 6px; text-align: center;">
                        <strong>الرصيد النقدي الفعلي الحالي:</strong>
                        <div style="font-size: 24px; margin-top: 10px;">${formatCurrency(currentCash, displayCurrency)}</div>
                        <small style="opacity: 0.8;">(خزينة: ${formatCurrency(getCashBalance(), displayCurrency)} + بنك: ${formatCurrency(getBankBalance(), displayCurrency)})</small>
                    </div>
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

// دالة مساعدة لتصنيف نشاط السند
function classifyVoucherActivity(voucher) {
    // يمكن تحسين هذه الدالة بناءً على نوع الطرف أو البيان
    // افتراضياً، جميع السندات تشغيلية
    
    // إذا كان السند متعلق بشراء أصول أو معدات
    if (voucher.description && 
        (voucher.description.includes('أصول') || 
         voucher.description.includes('معدات') || 
         voucher.description.includes('أثاث'))) {
        return 'investing';
    }
    
    // إذا كان السند متعلق بقروض أو رأس مال
    if (voucher.description && 
        (voucher.description.includes('قرض') || 
         voucher.description.includes('رأس المال') || 
         voucher.description.includes('تمويل'))) {
        return 'financing';
    }
    
    // الافتراضي: نشاط تشغيلي
    return 'operating';
}

// ========================================
// طباعة قائمة التدفقات النقدية
// ========================================
function printCashFlowReport() {
    const vouchers = getData('vouchers') || [];
    const journalEntries = getData('journal_entries') || [];
    
    // الحسابات النقدية (خزينة وبنك)
    const cashAccountIds = ['1111', '1112'];
    
    // جمع جميع الحركات النقدية
    const cashMovements = [];
    
    // من السندات
    vouchers.forEach(voucher => {
        cashMovements.push({
            date: voucher.date,
            description: voucher.description,
            type: voucher.type === 'receipt' ? 'inflow' : 'outflow',
            amount: voucher.amount,
            category: classifyVoucherActivity(voucher),
            reference: voucher.number
        });
    });
    
    // من القيود المحاسبية التي تؤثر على النقدية
    journalEntries.forEach(entry => {
        entry.items.forEach(item => {
            if (cashAccountIds.includes(item.accountId)) {
                if (item.debit > 0) {
                    cashMovements.push({
                        date: entry.date,
                        description: entry.description,
                        type: 'inflow',
                        amount: item.debit,
                        category: 'operating',
                        reference: entry.number
                    });
                }
                if (item.credit > 0) {
                    cashMovements.push({
                        date: entry.date,
                        description: entry.description,
                        type: 'outflow',
                        amount: item.credit,
                        category: 'operating',
                        reference: entry.number
                    });
                }
            }
        });
    });
    
    // ترتيب حسب التاريخ
    cashMovements.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // تصنيف التدفقات
    const operatingInflows = cashMovements.filter(m => m.category === 'operating' && m.type === 'inflow');
    const operatingOutflows = cashMovements.filter(m => m.category === 'operating' && m.type === 'outflow');
    const investingInflows = cashMovements.filter(m => m.category === 'investing' && m.type === 'inflow');
    const investingOutflows = cashMovements.filter(m => m.category === 'investing' && m.type === 'outflow');
    const financingInflows = cashMovements.filter(m => m.category === 'financing' && m.type === 'inflow');
    const financingOutflows = cashMovements.filter(m => m.category === 'financing' && m.type === 'outflow');
    
    // حساب الإجماليات
    const netOperating = operatingInflows.reduce((sum, m) => sum + m.amount, 0) - 
                         operatingOutflows.reduce((sum, m) => sum + m.amount, 0);
    const netInvesting = investingInflows.reduce((sum, m) => sum + m.amount, 0) - 
                         investingOutflows.reduce((sum, m) => sum + m.amount, 0);
    const netFinancing = financingInflows.reduce((sum, m) => sum + m.amount, 0) - 
                         financingOutflows.reduce((sum, m) => sum + m.amount, 0);
    
    const netCashChange = netOperating + netInvesting + netFinancing;
    
    // رصيد أول المدة
    const openingCash = 0;
    const closingCash = openingCash + netCashChange;
    
    // الرصيد الفعلي الحالي
    const currentCash = getCashBalance() + getBankBalance();
    
    let html = `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8">
            <title>قائمة التدفقات النقدية</title>
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
                    padding: 10px;
                    text-align: right;
                }
                th {
                    background-color: #f57c00;
                    color: white;
                    font-weight: bold;
                }
                .section-header {
                    background: #004d40;
                    color: white;
                    padding: 12px;
                    border-radius: 5px;
                    margin: 25px 0 15px 0;
                    font-size: 16px;
                    font-weight: bold;
                }
                .subsection-header {
                    background: #f5f5f5;
                    font-weight: bold;
                    padding: 10px;
                }
                .total-row {
                    background-color: #fff3cd;
                    font-weight: bold;
                    font-size: 14px;
                }
                .net-row {
                    background-color: #e0f7fa;
                    font-weight: bold;
                    font-size: 15px;
                }
                .final-row {
                    background-color: #c8e6c9;
                    font-weight: bold;
                    font-size: 17px;
                }
                .inflow {
                    color: #4caf50;
                }
                .outflow {
                    color: #f44336;
                }
                .info-box {
                    background: #e3f2fd;
                    padding: 15px;
                    border-radius: 8px;
                    border-right: 4px solid #2196f3;
                    margin: 20px 0;
                    text-align: center;
                }
                @media print {
                    body { margin: 0; padding: 15px; }
                }
            </style>
        </head>
        <body>
            ${generateDocumentHeader('قائمة التدفقات النقدية')}
            
            <div style="text-align: center; margin: 15px 0; padding: 10px; background: #f5f5f5; border-radius: 8px;">
                <p style="margin: 0; color: #666; font-size: 14px;">للفترة: ${new Date().getFullYear()}</p>
            </div>
            
            <!-- الأنشطة التشغيلية -->
            <h3 class="section-header">
                <i class="fas fa-cogs"></i> التدفقات النقدية من الأنشطة التشغيلية
            </h3>
            
            <table>
                <tbody>
                    <tr class="subsection-header">
                        <td colspan="2">التدفقات النقدية الداخلة</td>
                    </tr>
                    ${operatingInflows.length === 0 ? 
                        '<tr><td colspan="2" style="padding-right: 20px; color: #999;">لا توجد تدفقات داخلة</td></tr>' :
                        operatingInflows.map(m => `
                            <tr>
                                <td style="padding-right: 20px;">${m.description}</td>
                                <td style="text-align: left; width: 150px;" class="inflow">${formatCurrency(m.amount)}</td>
                            </tr>
                        `).join('')
                    }
                    <tr class="total-row">
                        <td style="padding-right: 20px;">إجمالي التدفقات الداخلة</td>
                        <td style="text-align: left;" class="inflow">
                            ${formatCurrency(operatingInflows.reduce((sum, m) => sum + m.amount, 0))}
                        </td>
                    </tr>
                    
                    <tr class="subsection-header">
                        <td colspan="2">التدفقات النقدية الخارجة</td>
                    </tr>
                    ${operatingOutflows.length === 0 ? 
                        '<tr><td colspan="2" style="padding-right: 20px; color: #999;">لا توجد تدفقات خارجة</td></tr>' :
                        operatingOutflows.map(m => `
                            <tr>
                                <td style="padding-right: 20px;">${m.description}</td>
                                <td style="text-align: left;" class="outflow">(${formatCurrency(m.amount)})</td>
                            </tr>
                        `).join('')
                    }
                    <tr class="total-row">
                        <td style="padding-right: 20px;">إجمالي التدفقات الخارجة</td>
                        <td style="text-align: left;" class="outflow">
                            (${formatCurrency(operatingOutflows.reduce((sum, m) => sum + m.amount, 0))})
                        </td>
                    </tr>
                    
                    <tr class="net-row">
                        <td>صافي التدفقات النقدية من الأنشطة التشغيلية</td>
                        <td style="text-align: left; ${netOperating >= 0 ? 'color: #4caf50' : 'color: #f44336'}">
                            ${netOperating >= 0 ? '' : '('}${formatCurrency(Math.abs(netOperating))}${netOperating >= 0 ? '' : ')'}
                        </td>
                    </tr>
                </tbody>
            </table>
            
            <!-- الأنشطة الاستثمارية -->
            <h3 class="section-header">
                <i class="fas fa-chart-line"></i> التدفقات النقدية من الأنشطة الاستثمارية
            </h3>
            
            <table>
                <tbody>
                    ${investingInflows.length === 0 && investingOutflows.length === 0 ? 
                        '<tr><td colspan="2" style="text-align: center; padding: 20px; color: #999;">لا توجد أنشطة استثمارية</td></tr>' :
                        `
                        ${investingInflows.length > 0 ? `
                            <tr class="subsection-header">
                                <td colspan="2">التدفقات الداخلة</td>
                            </tr>
                            ${investingInflows.map(m => `
                                <tr>
                                    <td style="padding-right: 20px;">${m.description}</td>
                                    <td style="text-align: left;" class="inflow">${formatCurrency(m.amount)}</td>
                                </tr>
                            `).join('')}
                        ` : ''}
                        
                        ${investingOutflows.length > 0 ? `
                            <tr class="subsection-header">
                                <td colspan="2">التدفقات الخارجة</td>
                            </tr>
                            ${investingOutflows.map(m => `
                                <tr>
                                    <td style="padding-right: 20px;">${m.description}</td>
                                    <td style="text-align: left;" class="outflow">(${formatCurrency(m.amount)})</td>
                                </tr>
                            `).join('')}
                        ` : ''}
                        
                        <tr class="net-row">
                            <td>صافي التدفقات النقدية من الأنشطة الاستثمارية</td>
                            <td style="text-align: left; ${netInvesting >= 0 ? 'color: #4caf50' : 'color: #f44336'}">
                                ${netInvesting >= 0 ? '' : '('}${formatCurrency(Math.abs(netInvesting))}${netInvesting >= 0 ? '' : ')'}
                            </td>
                        </tr>
                        `
                    }
                </tbody>
            </table>
            
            <!-- الأنشطة التمويلية -->
            <h3 class="section-header">
                <i class="fas fa-hand-holding-usd"></i> التدفقات النقدية من الأنشطة التمويلية
            </h3>
            
            <table>
                <tbody>
                    ${financingInflows.length === 0 && financingOutflows.length === 0 ? 
                        '<tr><td colspan="2" style="text-align: center; padding: 20px; color: #999;">لا توجد أنشطة تمويلية</td></tr>' :
                        `
                        ${financingInflows.length > 0 ? `
                            <tr class="subsection-header">
                                <td colspan="2">التدفقات الداخلة</td>
                            </tr>
                            ${financingInflows.map(m => `
                                <tr>
                                    <td style="padding-right: 20px;">${m.description}</td>
                                    <td style="text-align: left;" class="inflow">${formatCurrency(m.amount)}</td>
                                </tr>
                            `).join('')}
                        ` : ''}
                        
                        ${financingOutflows.length > 0 ? `
                            <tr class="subsection-header">
                                <td colspan="2">التدفقات الخارجة</td>
                            </tr>
                            ${financingOutflows.map(m => `
                                <tr>
                                    <td style="padding-right: 20px;">${m.description}</td>
                                    <td style="text-align: left;" class="outflow">(${formatCurrency(m.amount)})</td>
                                </tr>
                            `).join('')}
                        ` : ''}
                        
                        <tr class="net-row">
                            <td>صافي التدفقات النقدية من الأنشطة التمويلية</td>
                            <td style="text-align: left; ${netFinancing >= 0 ? 'color: #4caf50' : 'color: #f44336'}">
                                ${netFinancing >= 0 ? '' : '('}${formatCurrency(Math.abs(netFinancing))}${netFinancing >= 0 ? '' : ')'}
                            </td>
                        </tr>
                        `
                    }
                </tbody>
            </table>
            
            <!-- الملخص النهائي -->
            <h3 class="section-header">
                <i class="fas fa-chart-pie"></i> ملخص التدفقات النقدية
            </h3>
            
            <table>
                <tbody>
                    <tr>
                        <td>صافي التدفقات التشغيلية</td>
                        <td style="text-align: left; ${netOperating >= 0 ? 'color: #4caf50' : 'color: #f44336'}">
                            ${netOperating >= 0 ? '' : '('}${formatCurrency(Math.abs(netOperating))}${netOperating >= 0 ? '' : ')'}
                        </td>
                    </tr>
                    <tr>
                        <td>صافي التدفقات الاستثمارية</td>
                        <td style="text-align: left; ${netInvesting >= 0 ? 'color: #4caf50' : 'color: #f44336'}">
                            ${netInvesting >= 0 ? '' : '('}${formatCurrency(Math.abs(netInvesting))}${netInvesting >= 0 ? '' : ')'}
                        </td>
                    </tr>
                    <tr>
                        <td>صافي التدفقات التمويلية</td>
                        <td style="text-align: left; ${netFinancing >= 0 ? 'color: #4caf50' : 'color: #f44336'}">
                            ${netFinancing >= 0 ? '' : '('}${formatCurrency(Math.abs(netFinancing))}${netFinancing >= 0 ? '' : ')'}
                        </td>
                    </tr>
                    <tr class="net-row" style="border-top: 3px solid #004d40;">
                        <td style="font-size: 16px;">صافي الزيادة (النقص) في النقدية</td>
                        <td style="text-align: left; font-size: 16px; ${netCashChange >= 0 ? 'color: #4caf50' : 'color: #f44336'}">
                            ${netCashChange >= 0 ? '' : '('}${formatCurrency(Math.abs(netCashChange))}${netCashChange >= 0 ? '' : ')'}
                        </td>
                    </tr>
                    <tr>
                        <td>النقدية في بداية الفترة</td>
                        <td style="text-align: left;">${formatCurrency(openingCash)}</td>
                    </tr>
                    <tr class="final-row" style="border-top: 3px solid #4caf50;">
                        <td style="font-size: 18px;">النقدية في نهاية الفترة</td>
                        <td style="text-align: left; font-size: 18px;">${formatCurrency(closingCash)}</td>
                    </tr>
                </tbody>
            </table>
            
            <div class="info-box">
                <strong style="font-size: 14px;">الرصيد النقدي الفعلي الحالي:</strong>
                <div style="font-size: 20px; margin-top: 8px; color: #1976d2; font-weight: bold;">${formatCurrency(currentCash)}</div>
                <small style="opacity: 0.8; font-size: 11px;">(خزينة: ${formatCurrency(getCashBalance())} + بنك: ${formatCurrency(getBankBalance())})</small>
            </div>
            
            ${generateDocumentFooter()}
        </body>
        </html>`;
    
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
}
