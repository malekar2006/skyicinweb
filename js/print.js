// ========================================
// وظائف الطباعة مع دعم الشعار والعملات المتعددة
// ========================================

// طباعة وثيقة عامة
function printDocument() {
    window.print();
}

// إنشاء رأس المستند مع الشعار (تنسيق جديد: شعار وسط، عربي يمين، إنجليزي يسار)
function generateDocumentHeader(title = '') {
    return `
        <div class="header" style="display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 15px; margin-bottom: 15px; padding: 12px 10px; border-bottom: 3px solid #f57c00;">
            <!-- النص العربي في الجهة اليمنى -->
            <div style="text-align: right; padding-right: 10px;">
                <div style="font-size: 15px; font-weight: bold; color: #004d40; margin: 0 0 4px 0; line-height: 1.2;">سكاي آيكون للسفريات والسياحة</div>
                <div style="font-size: 13px; color: #004d40; margin: 0 0 3px 0; line-height: 1.2;">وخدمات الحج والعمرة</div>
                <p style="color: #666; margin: 0; font-size: 10px; line-height: 1.2;">صنعاء - ذهبان - مقابل كهرباء ذهبان</p>
            </div>
            
            <!-- الشعار في المنتصف -->
            <div style="text-align: center;">
                <img src="${COMPANY_INFO.logo}" alt="سكاي آيكون" style="max-width: 120px; max-height: 90px; object-fit: contain; display: block; margin: 0 auto;">
            </div>
            
            <!-- النص الإنجليزي في الجهة اليسرى -->
            <div style="text-align: left; padding-left: 10px; direction: ltr;">
                <div style="font-size: 15px; font-weight: bold; color: #004d40; margin: 0 0 4px 0; line-height: 1.2;">Sky Icon Travel & Tourism</div>
                <div style="font-size: 12px; color: #004d40; margin: 0 0 3px 0; line-height: 1.2;">Hajj & Umrah Services</div>
                <p style="color: #666; margin: 0; font-size: 10px; line-height: 1.2;">Sana'a - Dhahban - Yemen</p>
            </div>
        </div>
        ${title ? `<h2 style="text-align: center; color: #f57c00; margin: 12px 0; font-size: 18px; font-weight: bold;">${title}</h2>` : ''}`;
}

// إنشاء ذيل المستند (أرقام الهواتف في المنتصف فقط)
function generateDocumentFooter() {
    return `
        <div class="footer" style="margin-top: 30px; padding-top: 15px; border-top: 2px solid #f57c00; text-align: center; color: #666; font-size: 11px; line-height: 1.5;">
            <p style="margin: 0; direction: ltr; font-size: 13px; font-weight: bold; color: #004d40; letter-spacing: 1px;">
                ${COMPANY_INFO.phones.office.join(' • ')}
            </p>
            <p style="margin: 8px 0 0 0; font-size: 9px; color: #999;">
                ${new Date().toLocaleDateString('ar-YE')} - ${new Date().toLocaleTimeString('ar-YE', {hour: '2-digit', minute: '2-digit'})}
            </p>
        </div>`;
}

// طباعة فاتورة
function printInvoice(invoiceId) {
    const invoice = findItem('invoices', invoiceId);
    if (!invoice) return;
    
    const customers = getData('customers') || [];
    const suppliers = getData('suppliers') || [];
    
    const party = invoice.type === 'sales' 
        ? customers.find(c => c.id === invoice.customer_id)
        : suppliers.find(s => s.id === invoice.supplier_id);
    
    const currency = invoice.currency || 'YER';
    const currencyInfo = CURRENCIES[currency];
    
    let html = `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8">
            <title>فاتورة ${invoice.type === 'sales' ? 'مبيعات' : 'مشتريات'} - ${invoice.number}</title>
            <style>
                body {
                    font-family: 'Cairo', Arial, sans-serif;
                    direction: rtl;
                    margin: 20px;
                }
                /* تنسيق الأرقام لتكون LTR دائماً */
                .phone-number, .phone, [dir="ltr"] {
                    direction: ltr !important;
                    text-align: right !important;
                    display: inline-block;
                    unicode-bidi: embed;
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
                .total-section {
                    background: #f5f5f5;
                    padding: 15px;
                    margin-top: 20px;
                    border-radius: 5px;
                }
                @media print {
                    body { margin: 0; }
                }
            </style>
        </head>
        <body>
            ${generateDocumentHeader(`فاتورة ${invoice.type === 'sales' ? 'مبيعات' : 'مشتريات'}`)}
            
            <div style="display: flex; justify-content: space-between; margin: 15px 0; font-size: 13px;">
                <div>
                    <p><strong>رقم الفاتورة:</strong> ${invoice.number}</p>
                    <p><strong>التاريخ:</strong> ${formatDate(invoice.date)}</p>
                    <p><strong>العملة:</strong> ${currencyInfo.name}</p>
                </div>
                <div>
                    <p><strong>${invoice.type === 'sales' ? 'العميل' : 'المورد'}:</strong> ${party ? party.name : 'غير محدد'}</p>
                    ${party && party.phone ? `<p><strong>الهاتف:</strong> ${party.phone}</p>` : ''}
                    ${party && party.email ? `<p><strong>البريد:</strong> ${party.email}</p>` : ''}
                </div>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>الوصف</th>
                        <th>الكمية</th>
                        <th>السعر</th>
                        <th>الإجمالي</th>
                    </tr>
                </thead>
                <tbody>`;
    
    invoice.items.forEach((item, index) => {
        html += `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${item.description}</td>
                        <td>${item.quantity}</td>
                        <td>${formatCurrency(item.price, currency)}</td>
                        <td>${formatCurrency(item.total, currency)}</td>
                    </tr>`;
    });
    
    html += `
                </tbody>
            </table>
            
            <div class="total-section">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <strong>المجموع الفرعي:</strong>
                    <span>${formatCurrency(invoice.subtotal, currency)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <strong>الخصم:</strong>
                    <span>${formatCurrency(invoice.discount, currency)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <strong>الضريبة:</strong>
                    <span>${formatCurrency(invoice.tax, currency)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; padding-top: 10px; border-top: 2px solid #ddd;">
                    <strong>الإجمالي:</strong>
                    <span>${formatCurrency(invoice.total, currency)}</span>
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

// طباعة سند (قبض أو صرف)
function printVoucher(voucherId) {
    const voucher = findItem('vouchers', voucherId);
    if (!voucher) return;
    
    const customers = getData('customers') || [];
    const suppliers = getData('suppliers') || [];
    
    let partyName = '-';
    if (voucher.reference_type === 'customer') {
        const customer = customers.find(c => c.id === voucher.reference_id);
        partyName = customer ? customer.name : 'عميل محذوف';
    } else if (voucher.reference_type === 'supplier') {
        const supplier = suppliers.find(s => s.id === voucher.reference_id);
        partyName = supplier ? supplier.name : 'مورد محذوف';
    } else {
        partyName = 'آخر';
    }
    
    const currency = voucher.currency || 'YER';
    const currencyInfo = CURRENCIES[currency];
    const voucherType = voucher.type === 'receipt' ? 'قبض' : 'صرف';
    const voucherColor = voucher.type === 'receipt' ? '#4caf50' : '#f44336';
    
    let html = `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8">
            <title>سند ${voucherType} - ${voucher.number}</title>
            <style>
                body {
                    font-family: 'Cairo', Arial, sans-serif;
                    direction: rtl;
                    margin: 20px;
                }
                .voucher-box {
                    border: 3px solid ${voucherColor};
                    padding: 30px;
                    border-radius: 10px;
                    margin: 20px 0;
                }
                .info-row {
                    display: flex;
                    justify-content: space-between;
                    margin: 15px 0;
                    padding: 10px;
                    background: #f5f5f5;
                    border-radius: 5px;
                }
                .amount-box {
                    background: ${voucherColor};
                    color: white;
                    padding: 20px;
                    border-radius: 8px;
                    text-align: center;
                    font-size: 24px;
                    font-weight: bold;
                    margin: 20px 0;
                }
                @media print {
                    body { margin: 0; }
                }
            </style>
        </head>
        <body>
            ${generateDocumentHeader(`سند ${voucherType}`)}
            
            <div class="voucher-box">
                <div class="info-row">
                    <strong>رقم السند:</strong>
                    <span>${voucher.number}</span>
                </div>
                <div class="info-row">
                    <strong>التاريخ:</strong>
                    <span>${formatDate(voucher.date)}</span>
                </div>
                <div class="info-row">
                    <strong>العملة:</strong>
                    <span>${currencyInfo.name}</span>
                </div>
                <div class="info-row">
                    <strong>الطرف:</strong>
                    <span>${partyName}</span>
                </div>
                <div class="info-row">
                    <strong>طريقة الدفع:</strong>
                    <span>${voucher.payment_method === 'cash' ? 'نقدي' : voucher.payment_method === 'bank' ? 'بنك' : 'شيك'}</span>
                </div>
                
                <div class="amount-box">
                    المبلغ: ${formatCurrency(voucher.amount, currency)}
                </div>
                
                <div style="margin: 20px 0;">
                    <strong>البيان:</strong>
                    <p style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin-top: 10px;">
                        ${voucher.description}
                    </p>
                </div>
                
                <div style="margin-top: 50px; display: flex; justify-content: space-between;">
                    <div style="text-align: center; width: 200px; border-top: 2px solid #333; padding-top: 10px;">
                        <p>توقيع ${voucher.type === 'receipt' ? 'القابض' : 'المستلم'}</p>
                    </div>
                    <div style="text-align: center; width: 200px; border-top: 2px solid #333; padding-top: 10px;">
                        <p>توقيع ${voucher.type === 'receipt' ? 'المسلم' : 'المصرف'}</p>
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

// تصدير إلى PDF (قيد التطوير)
function exportToPDF() {
    showAlert('وظيفة تصدير PDF قيد التطوير', 'info');
}

// ========================================
// طباعة تقرير الجوازات المرسلة
// ========================================
function printSentPassportsReportPDF(passports = null) {
    if (!passports) {
        passports = getData('sentPassports') || [];
    }
    
    if (passports.length === 0) {
        showNotification('لا توجد بيانات للطباعة', 'warning');
        return;
    }
    
    // إحصائيات عامة
    const stats = {
        total: passports.length,
        thisMonth: passports.filter(p => {
            const passportDate = new Date(p.date);
            const now = new Date();
            return passportDate.getMonth() === now.getMonth() && 
                   passportDate.getFullYear() === now.getFullYear();
        }).length,
        upcoming: passports.filter(p => {
            const travelDate = new Date(p.travelDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return travelDate >= today;
        }).length
    };
    
    // بناء HTML التقرير
    let html = `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8">
            <title>تقرير الجوازات المرسلة</title>
            <style>
                body {
                    font-family: 'Cairo', Arial, sans-serif;
                    direction: rtl;
                    margin: 20px;
                    font-size: 14px;
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 3px solid #667eea;
                }
                .header img {
                    max-width: 120px;
                    margin-bottom: 10px;
                }
                .header h1 {
                    color: #667eea;
                    margin: 10px 0;
                    font-size: 28px;
                }
                .stats-container {
                    display: flex;
                    justify-content: space-around;
                    margin: 20px 0;
                    padding: 15px;
                    background: #f8f9fa;
                    border-radius: 8px;
                }
                .stat-box {
                    text-align: center;
                    padding: 10px;
                }
                .stat-box .number {
                    font-size: 32px;
                    font-weight: bold;
                    color: #667eea;
                }
                .stat-box .label {
                    color: #666;
                    margin-top: 5px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                }
                th, td {
                    border: 1px solid #ddd;
                    padding: 10px;
                    text-align: center;
                    font-size: 12px;
                }
                th {
                    background-color: #667eea;
                    color: white;
                    font-weight: bold;
                }
                tr:nth-child(even) {
                    background-color: #f8f9fa;
                }
                .footer {
                    margin-top: 30px;
                    text-align: center;
                    color: #666;
                    font-size: 11px;
                    border-top: 2px solid #ddd;
                    padding-top: 15px;
                }
                @media print {
                    body { margin: 0; padding: 15px; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            ${generateDocumentHeader()}
            
            <h2 style="text-align: center; color: #667eea; margin: 20px 0;">
                <i class="fas fa-passport"></i>
                تقرير الجوازات المرسلة
            </h2>
            
            <div class="stats-container">
                <div class="stat-box">
                    <div class="number">${stats.total}</div>
                    <div class="label">إجمالي الجوازات</div>
                </div>
                <div class="stat-box">
                    <div class="number">${stats.thisMonth}</div>
                    <div class="label">جوازات هذا الشهر</div>
                </div>
                <div class="stat-box">
                    <div class="number">${stats.upcoming}</div>
                    <div class="label">رحلات قادمة</div>
                </div>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th style="width: 40px;">م</th>
                        <th>التاريخ</th>
                        <th>الاسم</th>
                        <th>رقم الجواز</th>
                        <th>رقم الحجز</th>
                        <th>تاريخ السفر</th>
                        <th>مكان الإرسال</th>
                        <th>المرسل</th>
                        <th>المستلم</th>
                    </tr>
                </thead>
                <tbody>`;
    
    passports.forEach((passport, index) => {
        html += `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${formatDate(passport.date)}</td>
                        <td><strong>${passport.name}</strong></td>
                        <td>${passport.passportNumber}</td>
                        <td>${passport.bookingNumber || '-'}</td>
                        <td>${formatDate(passport.travelDate)}</td>
                        <td>${passport.sendLocation}</td>
                        <td>
                            <div>${passport.senderName}</div>
                            <div style="font-size: 10px; color: #666;">${passport.senderPhone}</div>
                        </td>
                        <td>
                            <div>${passport.receiverName}</div>
                            <div style="font-size: 10px; color: #666;">${passport.receiverPhone}</div>
                        </td>
                    </tr>`;
    });
    
    html += `
                </tbody>
            </table>
            
            <div class="footer">
                <p><strong>تاريخ الطباعة:</strong> ${formatDate(new Date().toISOString().split('T')[0])} - ${new Date().toLocaleTimeString('ar-YE')}</p>
                <p>${COMPANY_INFO.name} - ${COMPANY_INFO.location}</p>
                <p>هاتف/جوال: ${COMPANY_INFO.phones.office.join(' - ')}</p>
            </div>
        </body>
        </html>`;
    
    // فتح نافذة الطباعة
    const printWindow = window.open('', '_blank', 'width=1200,height=800');
    printWindow.document.write(html);
    printWindow.document.close();
    
    // الطباعة تلقائياً بعد تحميل المحتوى
    printWindow.onload = function() {
        printWindow.focus();
        printWindow.print();
    };
}

// طباعة تفاصيل جواز واحد (نسخة محسّنة)
function printSentPassportDetailsPDF(passportId) {
    const passport = getData('sentPassports').find(p => p.id === passportId);
    
    if (!passport) {
        showNotification('لم يتم العثور على الجواز', 'error');
        return;
    }
    
    let html = `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8">
            <title>تفاصيل الجواز المرسل - ${passport.name}</title>
            <style>
                body {
                    font-family: 'Cairo', Arial, sans-serif;
                    direction: rtl;
                    margin: 20px;
                    font-size: 14px;
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 3px solid #667eea;
                }
                .header img {
                    max-width: 120px;
                    margin-bottom: 10px;
                }
                .passport-card {
                    border: 2px solid #667eea;
                    border-radius: 10px;
                    padding: 20px;
                    margin: 20px 0;
                    background: #f8f9fa;
                }
                .section-title {
                    color: #667eea;
                    font-size: 18px;
                    font-weight: bold;
                    margin: 20px 0 10px 0;
                    padding-bottom: 10px;
                    border-bottom: 2px solid #ddd;
                }
                .info-row {
                    display: flex;
                    padding: 10px 0;
                    border-bottom: 1px solid #eee;
                }
                .info-label {
                    width: 150px;
                    font-weight: bold;
                    color: #555;
                }
                .info-value {
                    flex: 1;
                    color: #333;
                }
                .highlight {
                    background: #fff3cd;
                    padding: 15px;
                    border-radius: 5px;
                    border-right: 4px solid #ffc107;
                    margin: 15px 0;
                }
                .contact-box {
                    background: white;
                    padding: 15px;
                    border-radius: 8px;
                    border: 1px solid #ddd;
                    margin: 10px 0;
                }
                .footer {
                    margin-top: 40px;
                    text-align: center;
                    color: #666;
                    font-size: 12px;
                    border-top: 2px solid #ddd;
                    padding-top: 15px;
                }
                @media print {
                    body { margin: 0; padding: 15px; }
                }
            </style>
        </head>
        <body>
            ${generateDocumentHeader()}
            
            <h2 style="text-align: center; color: #667eea; margin: 20px 0;">
                تفاصيل الجواز المرسل
            </h2>
            
            <div class="passport-card">
                <div class="section-title">
                    <i class="fas fa-info-circle"></i>
                    المعلومات الأساسية
                </div>
                
                <div class="info-row">
                    <div class="info-label">التاريخ:</div>
                    <div class="info-value">${formatDate(passport.date)}</div>
                </div>
                
                <div class="info-row">
                    <div class="info-label">تاريخ السفر:</div>
                    <div class="info-value"><strong>${formatDate(passport.travelDate)}</strong></div>
                </div>
                
                <div class="info-row">
                    <div class="info-label">الاسم:</div>
                    <div class="info-value"><strong style="font-size: 16px; color: #667eea;">${passport.name}</strong></div>
                </div>
                
                <div class="info-row">
                    <div class="info-label">رقم الجواز:</div>
                    <div class="info-value"><strong style="color: #f57c00;">${passport.passportNumber}</strong></div>
                </div>
                
                <div class="info-row">
                    <div class="info-label">رقم الحجز:</div>
                    <div class="info-value">${passport.bookingNumber || '-'}</div>
                </div>
                
                <div class="info-row">
                    <div class="info-label">رقم التذكرة:</div>
                    <div class="info-value">${passport.ticketNumber || '-'}</div>
                </div>
                
                <div class="highlight">
                    <strong>مكان الإرسال:</strong> ${passport.sendLocation}
                </div>
            </div>
            
            <div style="display: flex; gap: 20px; margin: 20px 0;">
                <div style="flex: 1;">
                    <div class="section-title">
                        <i class="fas fa-user-tie"></i>
                        بيانات المرسل
                    </div>
                    <div class="contact-box">
                        <div class="info-row">
                            <div class="info-label">الاسم:</div>
                            <div class="info-value"><strong>${passport.senderName}</strong></div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">الهاتف:</div>
                            <div class="info-value">${passport.senderPhone}</div>
                        </div>
                    </div>
                </div>
                
                <div style="flex: 1;">
                    <div class="section-title">
                        <i class="fas fa-user-check"></i>
                        بيانات المستلم
                    </div>
                    <div class="contact-box">
                        <div class="info-row">
                            <div class="info-label">الاسم:</div>
                            <div class="info-value"><strong>${passport.receiverName}</strong></div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">الهاتف:</div>
                            <div class="info-value">${passport.receiverPhone}</div>
                        </div>
                    </div>
                </div>
            </div>
            
            ${passport.notes ? `
            <div class="passport-card">
                <div class="section-title">
                    <i class="fas fa-sticky-note"></i>
                    الملاحظات
                </div>
                <p style="padding: 10px; background: white; border-radius: 5px;">${passport.notes}</p>
            </div>
            ` : ''}
            
            <div class="footer">
                <p><strong>تاريخ الطباعة:</strong> ${formatDate(new Date().toISOString().split('T')[0])} - ${new Date().toLocaleTimeString('ar-YE')}</p>
                <p>${COMPANY_INFO.name} - ${COMPANY_INFO.location}</p>
                <p>هاتف/جوال: ${COMPANY_INFO.phones.office.join(' - ')}</p>
            </div>
        </body>
        </html>`;
    
    // فتح نافذة الطباعة
    const printWindow = window.open('', '_blank', 'width=900,height=800');
    printWindow.document.write(html);
    printWindow.document.close();
    
    // الطباعة تلقائياً بعد تحميل المحتوى
    printWindow.onload = function() {
        printWindow.focus();
        printWindow.print();
    };
}
