/**
 * تحديثات دعم العملات لشجرة الحسابات
 * Currency Support for Chart of Accounts
 */

// إضافة حقل العملة للحسابات
function addCurrencyToAccount(accountId, currency = 'YER') {
    const accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
    const account = accounts.find(a => a.id === accountId);
    
    if (account) {
        account.currency = currency;
        localStorage.setItem('accounts', JSON.stringify(accounts));
        return true;
    }
    return false;
}

// الحصول على رصيد الحساب بعملة معينة
function getAccountBalanceInCurrency(accountId, targetCurrency = null) {
    if (!targetCurrency) {
        targetCurrency = getDefaultCurrency();
    }
    
    const accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
    const account = accounts.find(a => a.id === accountId);
    
    if (!account) return { debit: 0, credit: 0, balance: 0 };
    
    const accountCurrency = account.currency || 'YER';
    
    // تحويل الأرصدة
    const debit = convertCurrency(account.debit || 0, accountCurrency, targetCurrency);
    const credit = convertCurrency(account.credit || 0, accountCurrency, targetCurrency);
    const balance = debit - credit;
    
    return {
        debit: debit,
        credit: credit,
        balance: balance,
        currency: targetCurrency
    };
}

// تحديث عرض الرصيد بالعملة
function formatAccountBalance(amount, accountId) {
    const accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
    const account = accounts.find(a => a.id === accountId);
    
    const currency = account?.currency || getDefaultCurrency();
    return formatCurrency(amount, currency);
}

// الحصول على ملخص الأرصدة بجميع العملات
function getAccountBalancesSummary(accountId) {
    const accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
    const account = accounts.find(a => a.id === accountId);
    
    if (!account) return {};
    
    const accountCurrency = account.currency || 'YER';
    const currencies = ['YER', 'SAR', 'USD'];
    const summary = {};
    
    currencies.forEach(currency => {
        const debit = convertCurrency(account.debit || 0, accountCurrency, currency);
        const credit = convertCurrency(account.credit || 0, accountCurrency, currency);
        const balance = debit - credit;
        
        summary[currency] = {
            debit: formatCurrency(debit, currency),
            credit: formatCurrency(credit, currency),
            balance: formatCurrency(balance, currency)
        };
    });
    
    return summary;
}

// إضافة مؤشر العملة في عرض الحسابات
function renderAccountWithCurrency(account) {
    const currency = CURRENCIES[account.currency || 'YER'];
    return `
        <span class="account-currency-badge" title="${currency.name}">
            ${currency.symbol}
        </span>
    `;
}

// تصفية الحسابات حسب العملة
function filterAccountsByCurrency(currency = null) {
    const accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
    
    if (!currency) return accounts;
    
    return accounts.filter(a => (a.currency || 'YER') === currency);
}

// تحديث جميع الحسابات القديمة لإضافة حقل العملة
function migrateAccountsCurrency() {
    const accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
    let updated = false;
    
    accounts.forEach(account => {
        if (!account.currency) {
            account.currency = 'YER'; // العملة الافتراضية
            updated = true;
        }
    });
    
    if (updated) {
        localStorage.setItem('accounts', JSON.stringify(accounts));
        console.log('تم تحديث الحسابات لدعم العملات');
    }
}

// نموذج إضافة حساب مع اختيار العملة
function getAccountFormWithCurrency() {
    return `
        <div class="form-group">
            <label>العملة *</label>
            ${createCurrencySelect(getDefaultCurrency(), 'accountCurrency')}
            <small class="form-text">اختر العملة المستخدمة لهذا الحساب</small>
        </div>
    `;
}

// عرض أرصدة متعددة العملات في كشف الحساب
function renderMultiCurrencyStatement(accountId) {
    const summary = getAccountBalancesSummary(accountId);
    const accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
    const account = accounts.find(a => a.id === accountId);
    const mainCurrency = account?.currency || 'YER';
    
    return `
        <div class="multi-currency-statement">
            <h4><i class="fas fa-coins"></i> الأرصدة بالعملات المختلفة</h4>
            <div class="currency-balances-grid">
                ${Object.entries(summary).map(([code, balances]) => `
                    <div class="currency-balance-card ${code === mainCurrency ? 'main-currency' : ''}">
                        <div class="currency-header">
                            <i class="fas fa-${getCurrencyIcon(code)}"></i>
                            <span>${CURRENCIES[code].name}</span>
                            ${code === mainCurrency ? '<span class="badge badge-primary">الرئيسية</span>' : ''}
                        </div>
                        <div class="currency-balance-details">
                            <div class="balance-row">
                                <span>مدين:</span>
                                <strong>${balances.debit}</strong>
                            </div>
                            <div class="balance-row">
                                <span>دائن:</span>
                                <strong>${balances.credit}</strong>
                            </div>
                            <div class="balance-row balance-total">
                                <span>الصافي:</span>
                                <strong>${balances.balance}</strong>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// إضافة أنماط CSS لعرض العملات في الحسابات
function addAccountCurrencyStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .account-currency-badge {
            display: inline-block;
            padding: 2px 8px;
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            color: white;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 700;
            margin-right: 8px;
        }
        
        .multi-currency-statement {
            margin-top: 30px;
            padding: 20px;
            background: #f9fafb;
            border-radius: 12px;
        }
        
        .multi-currency-statement h4 {
            margin: 0 0 20px 0;
            color: #1f2937;
            font-size: 16px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .currency-balances-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
        }
        
        .currency-balance-card {
            background: white;
            border: 2px solid #e5e7eb;
            border-radius: 10px;
            padding: 15px;
            transition: all 0.3s;
        }
        
        .currency-balance-card:hover {
            border-color: var(--primary);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }
        
        .currency-balance-card.main-currency {
            border-color: var(--primary);
            background: linear-gradient(135deg, #fff9f0, white);
        }
        
        .currency-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 12px;
            padding-bottom: 12px;
            border-bottom: 2px solid #f3f4f6;
        }
        
        .currency-header i {
            font-size: 20px;
            color: var(--primary);
        }
        
        .currency-header span {
            font-weight: 600;
            color: #1f2937;
            flex: 1;
        }
        
        .currency-balance-details {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        
        .balance-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 13px;
        }
        
        .balance-row span {
            color: #6b7280;
        }
        
        .balance-row strong {
            color: #1f2937;
            font-size: 14px;
        }
        
        .balance-row.balance-total {
            margin-top: 8px;
            padding-top: 8px;
            border-top: 2px solid #f3f4f6;
        }
        
        .balance-row.balance-total strong {
            color: var(--primary);
            font-size: 16px;
        }
    `;
    document.head.appendChild(style);
}

// تهيئة دعم العملات للحسابات
function initAccountsCurrency() {
    // تحديث الحسابات القديمة
    migrateAccountsCurrency();
    
    // إضافة الأنماط
    addAccountCurrencyStyles();
}

// تهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', initAccountsCurrency);
