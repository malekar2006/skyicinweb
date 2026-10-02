// ========================================
// كشوفات حسابات العملاء
// ========================================

function loadCustomerStatements() {
    const content = document.getElementById('content');
    const customers = getData('customers') || [];
    
    content.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3><i class="fas fa-file-invoice-dollar"></i> كشوفات حسابات العملاء</h3>
            </div>
            <div style="padding: 20px;">
                <div class="search-panel" style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <h4><i class="fas fa-search"></i> البحث عن عميل</h4>
                    <div class="form-row">
                        <div class="form-group" style="flex: 1;">
                            <label>البحث</label>
                            <input type="text" id="customerSearchInput" class="form-control" 
                                   placeholder="اسم العميل، الرقم، أو الجوال..."
                                   oninput="searchCustomerForStatement(this.value)">
                        </div>
                        <div class="form-group" style="flex: 1;">
                            <label>أو اختر</label>
                            <select id="customerSelectStatement" class="form-control" onchange="selectCustomerForStatement(this.value)">
                                <option value="">-- اختر عميل --</option>
                                ${customers.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    <div id="customerSearchResults"></div>
                </div>
                <div id="statementArea"></div>
            </div>
        </div>
    `;
}

function searchCustomerForStatement(query) {
    if (!query || query.length < 2) {
        document.getElementById('customerSearchResults').innerHTML = '';
        return;
    }
    
    const customers = getData('customers') || [];
    const results = customers.filter(c => 
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        (c.customer_id && c.customer_id.toLowerCase().includes(query.toLowerCase())) ||
        (c.phone && c.phone.includes(query))
    );
    
    document.getElementById('customerSearchResults').innerHTML = results.length === 0 ? 
        '<div class="alert alert-warning">لم يتم العثور على عملاء</div>' :
        `<div style="background: white; padding: 10px; border-radius: 8px;">
            <h5><i class="fas fa-check-circle"></i> ${results.length} عميل</h5>
            ${results.map(c => `
                <div onclick="viewCustomerStatement('${c.id}')" style="padding: 10px; background: #f9f9f9; 
                     margin: 5px 0; cursor: pointer; border-radius: 4px;">
                    <strong>${c.name}</strong> - ${c.phone || 'لا يوجد'}
                </div>
            `).join('')}
        </div>`;
}

function selectCustomerForStatement(id) {
    if (id) viewCustomerStatement(id);
}

function viewCustomerStatement(customerId) {
    const customer = findItem('customers', customerId);
    if (!customer) return showAlert('العميل غير موجود', 'error');
    
    const transactions = getCustomerTransactions(customerId);
    const balances = calculateBalances(transactions);
    
    document.getElementById('statementArea').innerHTML = generateStatementHTML(customer, transactions, balances, 'customer');
}

function getCustomerTransactions(customerId) {
    const invoices = (getData('invoices') || []).filter(i => i.customer_id === customerId && i.type === 'sales');
    const vouchers = (getData('vouchers') || []).filter(v => v.reference_type === 'customer' && v.reference_id === customerId);
    const bookings = (getData('bookings') || []).filter(b => b.customer_id === customerId);
    
    const trans = [];
    
    invoices.forEach(i => trans.push({
        date: i.date, type: 'invoice', number: i.number,
        description: `فاتورة ${i.number}`, currency: i.currency,
        debit: i.total, credit: 0
    }));
    
    vouchers.forEach(v => {
        if (v.type === 'receipt') trans.push({
            date: v.date, type: 'voucher', number: v.number,
            description: `سند قبض ${v.number}`, currency: v.currency,
            debit: 0, credit: v.amount
        });
    });
    
    bookings.forEach(b => trans.push({
        date: b.date, type: 'booking', number: b.booking_number,
        description: `حجز ${b.booking_number}`, currency: b.currency,
        debit: b.amount, credit: b.paid
    }));
    
    return trans.sort((a, b) => new Date(a.date) - new Date(b.date));
}

function calculateBalances(transactions) {
    const bal = { YER: 0, SAR: 0, USD: 0 };
    transactions.forEach(t => {
        const curr = t.currency || 'YER';
        if (!bal[curr]) bal[curr] = 0;
        bal[curr] += (t.debit - t.credit);
    });
    return bal;
}

function generateStatementHTML(party, transactions, balances, type) {
    const isCustomer = type === 'customer';
    const color = isCustomer ? '#2196f3' : '#ff9800';
    const title = isCustomer ? 'كشف حساب عميل' : 'كشف حساب مورد';
    
    return `
        <div id="${type}StatementPrint">
            ${generateDocumentHeader(title)}
            
            <div style="background: white; padding: 20px; border: 2px solid #e0e0e0; margin-bottom: 20px;">
                <strong>الاسم:</strong> ${party.name}<br>
                <strong>الرقم:</strong> ${party.customer_id || party.supplier_id || '-'}<br>
                <strong>الجوال:</strong> ${party.phone || '-'}<br>
                <strong>التاريخ:</strong> ${formatDate(new Date().toISOString().split('T')[0])}
            </div>
            
            <table class="table">
                <thead style="background: ${color}; color: white;">
                    <tr>
                        <th>التاريخ</th>
                        <th>البيان</th>
                        <th>العملة</th>
                        <th>مدين</th>
                        <th>دائن</th>
                    </tr>
                </thead>
                <tbody>
                    ${transactions.length === 0 ? '<tr><td colspan="5" style="text-align: center;">لا توجد معاملات</td></tr>' :
                      transactions.map(t => `
                        <tr>
                            <td>${formatDate(t.date)}</td>
                            <td>${t.description}</td>
                            <td>${t.currency}</td>
                            <td style="color: #f44336;">${t.debit > 0 ? formatCurrency(t.debit) : '-'}</td>
                            <td style="color: #4caf50;">${t.credit > 0 ? formatCurrency(t.credit) : '-'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div style="background: #f5f5f5; padding: 20px; margin: 20px 0;">
                <h3>الأرصدة</h3>
                ${Object.keys(balances).map(curr => {
                    const bal = balances[curr];
                    if (bal === 0) return '';
                    return `<div style="padding: 10px; background: white; margin: 5px 0;">
                        ${curr}: <strong>${formatCurrency(Math.abs(bal))}</strong>
                        ${isCustomer ? (bal > 0 ? '(له)' : '(عليه)') : (bal > 0 ? '(لنا)' : '(علينا)')}
                    </div>`;
                }).join('')}
            </div>
            
            ${generateDocumentFooter()}
            
            <div style="margin-top: 20px; text-align: center;" class="no-print">
                <button class="btn btn-primary" onclick="print${isCustomer ? 'Customer' : 'Supplier'}Statement()">
                    <i class="fas fa-print"></i> طباعة
                </button>
                <button class="btn btn-secondary" onclick="load${isCustomer ? 'Customer' : 'Supplier'}Statements()">
                    رجوع
                </button>
            </div>
        </div>
    `;
}

function printCustomerStatement() {
    const content = document.getElementById('customerStatementPrint').innerHTML;
    const win = window.open('', '', 'width=800,height=600');
    win.document.write(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8">
            <title>كشف حساب عميل</title>
            <style>
                body { 
                    font-family: 'Cairo', Arial, sans-serif; 
                    direction: rtl;
                    margin: 20px;
                }
                .no-print { display: none; }
                table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin-top: 20px;
                }
                th, td { 
                    padding: 8px; 
                    border: 1px solid #ddd; 
                    text-align: right; 
                }
                th {
                    background-color: #2196f3;
                    color: white;
                    font-weight: bold;
                }
                @media print {
                    body { margin: 0; }
                    @page { margin: 15mm; }
                }
            </style>
        </head>
        <body>${content}</body>
        </html>
    `);
    win.document.close();
    setTimeout(() => {
        win.print();
        win.close();
    }, 250);
}

window.loadCustomerStatements = loadCustomerStatements;
window.searchCustomerForStatement = searchCustomerForStatement;
window.selectCustomerForStatement = selectCustomerForStatement;
window.viewCustomerStatement = viewCustomerStatement;
window.printCustomerStatement = printCustomerStatement;

console.log('✓ كشوفات حسابات العملاء جاهزة');
