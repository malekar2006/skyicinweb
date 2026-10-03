// ========================================
// كشوفات حسابات الموردين
// ========================================

function loadSupplierStatements() {
    const content = document.getElementById('content');
    const suppliers = getData('suppliers') || [];
    
    content.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3><i class="fas fa-file-invoice-dollar"></i> كشوفات حسابات الموردين</h3>
            </div>
            <div style="padding: 20px;">
                <div class="search-panel" style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <h4><i class="fas fa-search"></i> البحث عن مورد</h4>
                    <div class="form-row">
                        <div class="form-group" style="flex: 1;">
                            <label>البحث</label>
                            <input type="text" id="supplierSearchInput" class="form-control" 
                                   placeholder="اسم المورد، الرقم، أو الجوال..."
                                   oninput="searchSupplierForStatement(this.value)">
                        </div>
                        <div class="form-group" style="flex: 1;">
                            <label>أو اختر</label>
                            <select id="supplierSelectStatement" class="form-control" onchange="selectSupplierForStatement(this.value)">
                                <option value="">-- اختر مورد --</option>
                                ${suppliers.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    <div id="supplierSearchResults"></div>
                </div>
                <div id="statementArea"></div>
            </div>
        </div>
    `;
}

function searchSupplierForStatement(query) {
    if (!query || query.length < 2) {
        document.getElementById('supplierSearchResults').innerHTML = '';
        return;
    }
    
    const suppliers = getData('suppliers') || [];
    const results = suppliers.filter(s => 
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        (s.supplier_id && s.supplier_id.toLowerCase().includes(query.toLowerCase())) ||
        (s.phone && s.phone.includes(query))
    );
    
    document.getElementById('supplierSearchResults').innerHTML = results.length === 0 ? 
        '<div class="alert alert-warning">لم يتم العثور على موردين</div>' :
        `<div style="background: white; padding: 10px; border-radius: 8px;">
            <h5><i class="fas fa-check-circle"></i> ${results.length} مورد</h5>
            ${results.map(s => `
                <div onclick="viewSupplierStatement('${s.id}')" style="padding: 10px; background: #f9f9f9; 
                     margin: 5px 0; cursor: pointer; border-radius: 4px;">
                    <strong>${s.name}</strong> - ${s.phone || 'لا يوجد'}
                </div>
            `).join('')}
        </div>`;
}

function selectSupplierForStatement(id) {
    if (id) viewSupplierStatement(id);
}

function viewSupplierStatement(supplierId) {
    const supplier = findItem('suppliers', supplierId);
    if (!supplier) return showAlert('المورد غير موجود', 'error');
    
    const transactions = getSupplierTransactions(supplierId);
    const balances = calculateSupplierBalances(transactions);
    
    document.getElementById('statementArea').innerHTML = generateSupplierStatementHTML(supplier, transactions, balances);
}

function getSupplierTransactions(supplierId) {
    const invoices = (getData('invoices') || []).filter(i => i.supplier_id === supplierId && i.type === 'purchase');
    const vouchers = (getData('vouchers') || []).filter(v => v.reference_type === 'supplier' && v.reference_id === supplierId);
    
    const trans = [];
    
    invoices.forEach(i => trans.push({
        date: i.date, type: 'invoice', number: i.number,
        description: `فاتورة مشتريات ${i.number}`, currency: i.currency,
        debit: 0, credit: i.total
    }));
    
    vouchers.forEach(v => {
        if (v.type === 'payment') trans.push({
            date: v.date, type: 'voucher', number: v.number,
            description: `سند صرف ${v.number}`, currency: v.currency,
            debit: v.amount, credit: 0
        });
    });
    
    return trans.sort((a, b) => new Date(a.date) - new Date(b.date));
}

function calculateSupplierBalances(transactions) {
    const bal = { YER: 0, SAR: 0, USD: 0 };
    transactions.forEach(t => {
        const curr = t.currency || 'YER';
        if (!bal[curr]) bal[curr] = 0;
        bal[curr] += (t.debit - t.credit);
    });
    return bal;
}

function generateSupplierStatementHTML(supplier, transactions, balances) {
    return `
        <div id="supplierStatementPrint">
            ${generateDocumentHeader('كشف حساب مورد')}
            
            <div style="background: white; padding: 20px; border: 2px solid #e0e0e0; margin-bottom: 20px;">
                <strong>الاسم:</strong> ${supplier.name}<br>
                <strong>الرقم:</strong> ${supplier.supplier_id || '-'}<br>
                <strong>الجوال:</strong> ${supplier.phone || '-'}<br>
                <strong>التاريخ:</strong> ${formatDate(new Date().toISOString().split('T')[0])}
            </div>
            
            <table class="table">
                <thead style="background: #ff9800; color: white;">
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
                        ${bal > 0 ? '(لنا)' : '(علينا)'}
                    </div>`;
                }).join('')}
            </div>
            
            ${generateDocumentFooter()}
            
            <div style="margin-top: 20px; text-align: center;" class="no-print">
                <button class="btn btn-primary" onclick="printSupplierStatement()">
                    <i class="fas fa-print"></i> طباعة
                </button>
                <button class="btn btn-secondary" onclick="loadSupplierStatements()">
                    رجوع
                </button>
            </div>
        </div>
    `;
}

function printSupplierStatement() {
    const content = document.getElementById('supplierStatementPrint').innerHTML;
    const win = window.open('', '', 'width=800,height=600');
    win.document.write(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8">
            <title>كشف حساب مورد</title>
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
                    background-color: #ff9800;
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

window.loadSupplierStatements = loadSupplierStatements;
window.searchSupplierForStatement = searchSupplierForStatement;
window.selectSupplierForStatement = selectSupplierForStatement;
window.viewSupplierStatement = viewSupplierStatement;
window.printSupplierStatement = printSupplierStatement;

console.log('✓ كشوفات حسابات الموردين جاهزة');
