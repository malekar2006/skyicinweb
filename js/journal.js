// ========================================
// القيود المحاسبية
// ========================================

function loadJournal() {
    const content = document.getElementById('content');
    const entries = getData('journal_entries') || [];
    
    content.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">
                    <i class="fas fa-book"></i>
                    دفتر اليومية
                </h3>
                <button class="btn btn-primary" onclick="openAddJournalModal()">
                    <i class="fas fa-plus"></i>
                    قيد محاسبي جديد
                </button>
            </div>
            
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th>رقم القيد</th>
                            <th>التاريخ</th>
                            <th>البيان</th>
                            <th>العملة</th>
                            <th>المبلغ</th>
                            <th>إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${entries.length === 0 ? '<tr><td colspan="6" style="text-align: center; padding: 40px;">لا توجد قيود محاسبية</td></tr>' : entries.map(entry => `
                            <tr>
                                <td>${entry.number}</td>
                                <td>${formatDateShort(entry.date)}</td>
                                <td>${entry.description}</td>
                                <td><span class="badge bg-info">${CURRENCIES[entry.currency || 'YER'].name}</span></td>
                                <td>${formatCurrency(entry.total, entry.currency)}</td>
                                <td>
                                    <div class="action-btns">
                                        <button class="btn btn-sm btn-view" onclick="viewJournalEntry('${entry.id}')" title="عرض">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                        <button class="btn btn-sm btn-print" onclick="printJournalEntry('${entry.id}')" title="طباعة">
                                            <i class="fas fa-print"></i>
                                        </button>
                                        <button class="btn btn-sm btn-delete" onclick="deleteJournalEntry('${entry.id}')" title="حذف">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- Add Journal Entry Modal -->
        <div class="modal" id="addJournalModal">
            <div class="modal-content" style="max-width: 900px;">
                <div class="modal-header">
                    <h3 class="modal-title">قيد محاسبي جديد</h3>
                    <button class="modal-close" onclick="hideModal('addJournalModal')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="addJournalForm" onsubmit="saveJournalEntry(event)">
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">التاريخ *</label>
                                <input type="date" class="form-control" id="journalDate" required value="${new Date().toISOString().split('T')[0]}">
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">العملة *</label>
                                <select class="form-control" id="journalCurrency" required onchange="updateJournalCurrencyDisplay()">
                                    ${getCurrencyOptions()}
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">البيان *</label>
                            <textarea class="form-control" id="journalDescription" required></textarea>
                        </div>
                        
                        <h4 style="margin: 20px 0 10px 0;">بنود القيد</h4>
                        <div id="journalItems">
                            <div class="journal-item" style="display: grid; grid-template-columns: 2fr 1fr 1fr auto; gap: 10px; margin-bottom: 10px;">
                                <select class="form-control journal-account" required>
                                    <option value="">اختر الحساب</option>
                                    ${renderDetailAccountOptions()}
                                </select>
                                <input type="number" class="form-control journal-debit" placeholder="مدين" min="0" step="0.01" onchange="calculateJournalTotal()">
                                <input type="number" class="form-control journal-credit" placeholder="دائن" min="0" step="0.01" onchange="calculateJournalTotal()">
                                <button type="button" class="btn btn-sm btn-danger" onclick="removeJournalItem(this)">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                        
                        <button type="button" class="btn btn-secondary" onclick="addJournalItem()">
                            <i class="fas fa-plus"></i>
                            إضافة بند
                        </button>
                        
                        <div style="margin-top: 20px; padding: 15px; background: var(--light-bg); border-radius: 6px;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                <strong>إجمالي المدين:</strong>
                                <span id="totalDebit">0.00 ر.ي</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                <strong>إجمالي الدائن:</strong>
                                <span id="totalCredit">0.00 ر.ي</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: bold;">
                                <strong>الفرق:</strong>
                                <span id="difference" style="color: var(--success-color);">0.00 ر.ي</span>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="document.getElementById('addJournalForm').requestSubmit()">
                        <i class="fas fa-save"></i>
                        حفظ القيد
                    </button>
                    <button class="btn btn-secondary" onclick="hideModal('addJournalModal')">
                        <i class="fas fa-times"></i>
                        إلغاء
                    </button>
                </div>
            </div>
        </div>
    `;
}

function renderDetailAccountOptions() {
    const accounts = getData('accounts') || [];
    const detailAccounts = accounts.filter(acc => acc.type === 'detail');
    return detailAccounts.map(acc => `<option value="${acc.id}">${acc.code} - ${acc.name}</option>`).join('');
}

function openAddJournalModal() {
    showModal('addJournalModal');
    calculateJournalTotal();
}

function addJournalItem() {
    const container = document.getElementById('journalItems');
    const itemDiv = document.createElement('div');
    itemDiv.className = 'journal-item';
    itemDiv.style.cssText = 'display: grid; grid-template-columns: 2fr 1fr 1fr auto; gap: 10px; margin-bottom: 10px;';
    itemDiv.innerHTML = `
        <select class="form-control journal-account" required>
            <option value="">اختر الحساب</option>
            ${renderDetailAccountOptions()}
        </select>
        <input type="number" class="form-control journal-debit" placeholder="مدين" min="0" step="0.01" onchange="calculateJournalTotal()">
        <input type="number" class="form-control journal-credit" placeholder="دائن" min="0" step="0.01" onchange="calculateJournalTotal()">
        <button type="button" class="btn btn-sm btn-danger" onclick="removeJournalItem(this)">
            <i class="fas fa-trash"></i>
        </button>
    `;
    container.appendChild(itemDiv);
}

function removeJournalItem(btn) {
    const items = document.querySelectorAll('.journal-item');
    if (items.length > 1) {
        btn.closest('.journal-item').remove();
        calculateJournalTotal();
    } else {
        showAlert('يجب أن يحتوي القيد على بند واحد على الأقل', 'warning');
    }
}

function calculateJournalTotal() {
    const debits = document.querySelectorAll('.journal-debit');
    const credits = document.querySelectorAll('.journal-credit');
    
    let totalDebit = 0;
    let totalCredit = 0;
    
    debits.forEach(input => {
        totalDebit += parseFloat(input.value) || 0;
    });
    
    credits.forEach(input => {
        totalCredit += parseFloat(input.value) || 0;
    });
    
    // الحصول على العملة المختارة
    const currencySelect = document.getElementById('journalCurrency');
    const currency = currencySelect ? currencySelect.value : 'YER';
    const currencySymbol = CURRENCIES[currency] ? CURRENCIES[currency].symbol : 'ر.ي';
    
    // عرض الأرقام مع رمز العملة
    document.getElementById('totalDebit').textContent = `${totalDebit.toFixed(2)} ${currencySymbol}`;
    document.getElementById('totalCredit').textContent = `${totalCredit.toFixed(2)} ${currencySymbol}`;
    
    const diff = Math.abs(totalDebit - totalCredit);
    const diffElem = document.getElementById('difference');
    diffElem.textContent = `${diff.toFixed(2)} ${currencySymbol}`;
    diffElem.style.color = diff === 0 ? 'var(--success-color)' : 'var(--danger-color)';
}

function updateJournalCurrencyDisplay() {
    calculateJournalTotal();
}

function saveJournalEntry(event) {
    event.preventDefault();
    
    const items = document.querySelectorAll('.journal-item');
    const journalItems = [];
    
    items.forEach(item => {
        const accountId = item.querySelector('.journal-account').value;
        const debit = parseFloat(item.querySelector('.journal-debit').value) || 0;
        const credit = parseFloat(item.querySelector('.journal-credit').value) || 0;
        
        if (accountId && (debit > 0 || credit > 0)) {
            journalItems.push({ accountId, debit, credit });
        }
    });
    
    // استخدام نظام التحقق الذكي
    const validation = validateJournalEntry(journalItems);
    
    if (!showValidationMessages(validation, 'التحقق من القيد المحاسبي')) {
        return;
    }
    
    const number = generateJournalNumber();
    const date = document.getElementById('journalDate').value;
    
    // التحقق من عدم تكرار الرقم
    if (isDuplicateNumber('journal', number)) {
        showAlert('رقم القيد موجود مسبقاً', 'danger');
        return;
    }
    
    // التحقق من التاريخ
    const dateValidation = validateTransactionDate(date);
    if (dateValidation.warnings.length > 0 && !confirm(dateValidation.warnings.join('\n') + '\n\nهل تريد المتابعة؟')) {
        return;
    }
    
    const entry = {
        id: generateId(),
        number: number,
        date: date,
        currency: document.getElementById('journalCurrency').value,
        description: document.getElementById('journalDescription').value,
        items: journalItems,
        total: validation.totalDebit,
        created_by: 'Admin',
        created_at: new Date().toISOString()
    };
    
    addItem('journal_entries', entry);
    hideModal('addJournalModal');
    showAlert('تم حفظ القيد المحاسبي بنجاح', 'success');
    loadJournal();
}

function viewJournalEntry(entryId) {
    const entry = findItem('journal_entries', entryId);
    if (!entry) return;
    
    const accounts = getData('accounts') || [];
    
    let html = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">
                    <i class="fas fa-book"></i>
                    تفاصيل القيد المحاسبي
                </h3>
                <button class="btn btn-secondary" onclick="loadJournal()">
                    <i class="fas fa-arrow-right"></i>
                    رجوع
                </button>
            </div>
            
            <div style="padding: 20px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <div>
                        <strong>رقم القيد:</strong> ${entry.number}
                    </div>
                    <div>
                        <strong>التاريخ:</strong> ${formatDate(entry.date)}
                    </div>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <strong>البيان:</strong><br>
                    ${entry.description}
                </div>
                
                <table class="table">
                    <thead>
                        <tr>
                            <th>الحساب</th>
                            <th>مدين</th>
                            <th>دائن</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${entry.items.map(item => {
                            // دعم كلا التنسيقين: account_id و accountId
                            const accountId = item.account_id || item.accountId;
                            const account = accounts.find(acc => acc.id === accountId);
                            return `
                                <tr>
                                    <td>${account ? `${account.code} - ${account.name}` : 'غير محدد'}</td>
                                    <td>${item.debit > 0 ? formatCurrency(item.debit, entry.currency) : '-'}</td>
                                    <td>${item.credit > 0 ? formatCurrency(item.credit, entry.currency) : '-'}</td>
                                </tr>
                            `;
                        }).join('')}
                        <tr style="background: var(--light-bg); font-weight: bold;">
                            <td>المجموع</td>
                            <td>${formatCurrency(entry.items.reduce((sum, item) => sum + item.debit, 0), entry.currency)}</td>
                            <td>${formatCurrency(entry.items.reduce((sum, item) => sum + item.credit, 0), entry.currency)}</td>
                        </tr>
                    </tbody>
                </table>
                
                <div style="margin-top: 20px;">
                    <button class="btn btn-primary" onclick="printJournalEntry('${entry.id}')">
                        <i class="fas fa-print"></i>
                        طباعة
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('content').innerHTML = html;
}

function printJournalEntry(entryId) {
    const entry = findItem('journal_entries', entryId);
    if (!entry) return;
    
    const accounts = getData('accounts') || [];
    
    let html = `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8">
            <title>قيد محاسبي - ${entry.number}</title>
            <style>
                body {
                    font-family: 'Cairo', Arial, sans-serif;
                    direction: rtl;
                    margin: 20px;
                    font-size: 14px;
                }
                .entry-box {
                    border: 3px solid #004d40;
                    padding: 25px;
                    border-radius: 10px;
                    margin: 20px 0;
                }
                .entry-header {
                    display: flex;
                    justify-content: space-between;
                    padding: 15px;
                    background: #f5f5f5;
                    border-radius: 8px;
                    margin-bottom: 20px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 20px 0;
                }
                th, td {
                    border: 1px solid #ddd;
                    padding: 12px;
                    text-align: center;
                }
                th {
                    background-color: #004d40;
                    color: white;
                    font-weight: bold;
                }
                tr:nth-child(even) {
                    background-color: #f8f9fa;
                }
                .total-row {
                    background-color: #e0f7fa !important;
                    font-weight: bold;
                    font-size: 16px;
                }
                .description-box {
                    background: #fff3cd;
                    padding: 15px;
                    border-radius: 5px;
                    border-right: 4px solid #ffc107;
                    margin: 20px 0;
                }
                @media print {
                    body { margin: 0; }
                }
            </style>
        </head>
        <body>
            ${generateDocumentHeader('قيد محاسبي')}
            
            <div class="entry-box">
                <div class="entry-header">
                    <div>
                        <strong>رقم القيد:</strong>
                        <span style="color: #004d40; font-size: 18px; font-weight: bold;">${entry.number}</span>
                    </div>
                    <div>
                        <strong>التاريخ:</strong>
                        <span>${formatDate(entry.date)}</span>
                    </div>
                    <div>
                        <strong>العملة:</strong>
                        <span>${CURRENCIES[entry.currency || 'YER'].name}</span>
                    </div>
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th style="width: 40px;">م</th>
                            <th style="width: 120px;">رمز الحساب</th>
                            <th>اسم الحساب</th>
                            <th style="width: 150px;">مدين</th>
                            <th style="width: 150px;">دائن</th>
                        </tr>
                    </thead>
                    <tbody>`;
    
    entry.items.forEach((item, index) => {
        // دعم كلا التنسيقين: account_id و accountId
        const accountId = item.account_id || item.accountId;
        const account = accounts.find(a => a.id === accountId);
        html += `
                        <tr>
                            <td>${index + 1}</td>
                            <td><strong>${account ? account.code : '-'}</strong></td>
                            <td style="text-align: right; padding-right: 15px;">${account ? account.name : 'حساب محذوف'}</td>
                            <td>${item.debit > 0 ? formatCurrency(item.debit, entry.currency || 'YER') : '-'}</td>
                            <td>${item.credit > 0 ? formatCurrency(item.credit, entry.currency || 'YER') : '-'}</td>
                        </tr>`;
    });
    
    const totalDebit = entry.items.reduce((sum, item) => sum + item.debit, 0);
    const totalCredit = entry.items.reduce((sum, item) => sum + item.credit, 0);
    
    html += `
                        <tr class="total-row">
                            <td colspan="3" style="text-align: center; background: #004d40; color: white;">الإجمالي</td>
                            <td>${formatCurrency(totalDebit, entry.currency || 'YER')}</td>
                            <td>${formatCurrency(totalCredit, entry.currency || 'YER')}</td>
                        </tr>
                    </tbody>
                </table>
                
                ${entry.description ? `
                    <div class="description-box">
                        <strong>البيان:</strong>
                        <p style="margin: 10px 0 0 0; line-height: 1.8;">${entry.description}</p>
                    </div>
                ` : ''}
                
                <div style="margin-top: 40px; display: flex; justify-content: space-between;">
                    <div style="text-align: center; width: 200px; border-top: 2px solid #333; padding-top: 10px;">
                        <p>المحاسب</p>
                    </div>
                    <div style="text-align: center; width: 200px; border-top: 2px solid #333; padding-top: 10px;">
                        <p>المراجع</p>
                    </div>
                    <div style="text-align: center; width: 200px; border-top: 2px solid #333; padding-top: 10px;">
                        <p>المدير المالي</p>
                    </div>
                </div>
            </div>
            
            ${generateDocumentFooter()}
        </body>
        </html>`;
    
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
}

function deleteJournalEntry(entryId) {
    if (!confirm('هل أنت متأكد من حذف هذا القيد؟')) return;
    deleteItem('journal_entries', entryId);
    showAlert('تم حذف القيد بنجاح', 'success');
    loadJournal();
}