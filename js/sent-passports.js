/**
 * نظام إدارة الجوازات المرسلة - نسخة مبسطة وفعالة
 * Sent Passports Management System
 * v3.1.0
 */

// تحميل صفحة الجوازات المرسلة
function loadSentPassports() {
    const content = document.getElementById('content');
    const sentPassports = getData('sentPassports') || [];
    
    // حساب الإحصائيات
    const stats = {
        total: sentPassports.length,
        thisMonth: sentPassports.filter(p => {
            const passportDate = new Date(p.date);
            const now = new Date();
            return passportDate.getMonth() === now.getMonth() && 
                   passportDate.getFullYear() === now.getFullYear();
        }).length,
        upcoming: sentPassports.filter(p => {
            const travelDate = new Date(p.travelDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return travelDate >= today;
        }).length
    };

    content.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">
                    <i class="fas fa-passport"></i>
                    الجوازات المرسلة
                </h3>
                <button class="btn btn-primary" onclick="showAddSentPassportModal()">
                    <i class="fas fa-plus"></i>
                    إضافة جواز مرسل
                </button>
            </div>

            <!-- إحصائيات سريعة -->
            <div style="padding: 20px;">
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                            <i class="fas fa-passport"></i>
                        </div>
                        <div class="stat-content">
                            <h3>إجمالي الجوازات</h3>
                            <div class="stat-value">${stats.total}</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
                            <i class="fas fa-calendar-alt"></i>
                        </div>
                        <div class="stat-content">
                            <h3>جوازات هذا الشهر</h3>
                            <div class="stat-value">${stats.thisMonth}</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
                            <i class="fas fa-plane-departure"></i>
                        </div>
                        <div class="stat-content">
                            <h3>رحلات قادمة</h3>
                            <div class="stat-value">${stats.upcoming}</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- أدوات البحث -->
            <div style="padding: 0 20px 20px;">
                <div style="display: grid; grid-template-columns: 2fr 1fr auto; gap: 10px;">
                    <input type="text" class="form-control" id="searchSentPassport" 
                           placeholder="ابحث بالاسم، رقم الجواز، رقم الحجز..." 
                           onkeyup="filterSentPassports()">
                    <select class="form-control" id="filterLocation" onchange="filterSentPassports()">
                        <option value="">كل الأماكن</option>
                        ${getUniqueLocations(sentPassports).map(loc => 
                            `<option value="${loc}">${loc}</option>`
                        ).join('')}
                    </select>
                    <button class="btn btn-secondary" onclick="resetSentPassportFilters()">
                        <i class="fas fa-redo"></i>
                        إعادة تعيين
                    </button>
                </div>
            </div>

            <!-- جدول الجوازات -->
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th>م</th>
                            <th>التاريخ</th>
                            <th>الاسم</th>
                            <th>رقم الجواز</th>
                            <th>رقم الحجز</th>
                            <th>تاريخ السفر</th>
                            <th>مكان الإرسال</th>
                            <th>المرسل</th>
                            <th>المستلم</th>
                            <th>إجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="sentPassportsTableBody">
                        ${renderSentPassportsTable(sentPassports)}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- مودال إضافة/تعديل -->
        ${renderSentPassportModal()}

        <!-- مودال عرض التفاصيل -->
        ${renderViewSentPassportModal()}
    `;
}

// رسم صفوف الجدول
function renderSentPassportsTable(passports) {
    if (!passports || passports.length === 0) {
        return `
            <tr>
                <td colspan="10" style="text-align: center; padding: 40px;">
                    <i class="fas fa-inbox fa-3x" style="color: #ccc; margin-bottom: 10px;"></i>
                    <p style="color: #999;">لا توجد جوازات مرسلة</p>
                    <button class="btn btn-primary" onclick="showAddSentPassportModal()">
                        <i class="fas fa-plus"></i>
                        إضافة أول جواز
                    </button>
                </td>
            </tr>
        `;
    }

    return passports.map((passport, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${formatDateShort(passport.date)}</td>
            <td><strong>${passport.name}</strong></td>
            <td><span class="badge bg-info">${passport.passportNumber}</span></td>
            <td>${passport.bookingNumber || '-'}</td>
            <td>${formatDateShort(passport.travelDate)}</td>
            <td>
                <i class="fas fa-map-marker-alt" style="color: var(--primary-color); margin-left: 5px;"></i>
                ${passport.sendLocation}
            </td>
            <td>
                <div style="font-size: 0.85em;">
                    <div><strong>${passport.senderName}</strong></div>
                    <div style="color: #666;">${passport.senderPhone}</div>
                </div>
            </td>
            <td>
                <div style="font-size: 0.85em;">
                    <div><strong>${passport.receiverName}</strong></div>
                    <div style="color: #666;">${passport.receiverPhone}</div>
                </div>
            </td>
            <td>
                <div class="action-btns">
                    <button class="btn btn-sm btn-view" onclick="viewSentPassportDetails('${passport.id}')" title="عرض">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-edit" onclick="editSentPassport('${passport.id}')" title="تعديل">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-print" onclick="printSentPassportDetails('${passport.id}')" title="طباعة">
                        <i class="fas fa-print"></i>
                    </button>
                    <button class="btn btn-sm btn-delete" onclick="deleteSentPassport('${passport.id}')" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// مودال الإضافة/التعديل
function renderSentPassportModal() {
    return `
        <div class="modal" id="sentPassportModal">
            <div class="modal-content" style="max-width: 900px;">
                <div class="modal-header">
                    <h3 class="modal-title" id="sentPassportModalTitle">
                        <i class="fas fa-passport"></i>
                        إضافة جواز مرسل
                    </h3>
                    <button class="modal-close" onclick="hideModal('sentPassportModal')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="sentPassportForm" onsubmit="saveSentPassport(event)">
                        <input type="hidden" id="sentPassportId">
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                            <div class="form-group">
                                <label class="form-label">التاريخ *</label>
                                <input type="date" class="form-control" id="sentPassportDate" required value="${new Date().toISOString().split('T')[0]}">
                            </div>
                            <div class="form-group">
                                <label class="form-label">تاريخ السفر *</label>
                                <input type="date" class="form-control" id="sentPassportTravelDate" required>
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                            <div class="form-group">
                                <label class="form-label">الاسم *</label>
                                <input type="text" class="form-control" id="sentPassportName" required placeholder="اسم صاحب الجواز">
                            </div>
                            <div class="form-group">
                                <label class="form-label">رقم الجواز *</label>
                                <input type="text" class="form-control" id="sentPassportNumber" required placeholder="12345678">
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                            <div class="form-group">
                                <label class="form-label">رقم الحجز</label>
                                <input type="text" class="form-control" id="sentPassportBookingNumber" placeholder="اختياري">
                            </div>
                            <div class="form-group">
                                <label class="form-label">رقم التذكرة</label>
                                <input type="text" class="form-control" id="sentPassportTicketNumber" placeholder="اختياري">
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="form-label">مكان الإرسال *</label>
                            <input type="text" class="form-control" id="sentPassportLocation" required 
                                   placeholder="مثال: السفارة السعودية - صنعاء" list="locationsList">
                            <datalist id="locationsList">
                                <option value="السفارة السعودية - صنعاء">
                                <option value="السفارة السعودية - عدن">
                                <option value="القنصلية السعودية - الحديدة">
                                <option value="مكتب شركة الطيران">
                                <option value="السفارة الإماراتية">
                                <option value="مكتب الحج والعمرة">
                            </datalist>
                        </div>

                        <h4 style="margin: 20px 0 10px; padding-bottom: 10px; border-bottom: 2px solid var(--border-color);">
                            <i class="fas fa-user-tie"></i>
                            بيانات المرسل
                        </h4>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                            <div class="form-group">
                                <label class="form-label">اسم المرسل *</label>
                                <input type="text" class="form-control" id="sentPassportSenderName" required placeholder="اسم الموظف">
                            </div>
                            <div class="form-group">
                                <label class="form-label">رقم هاتف المرسل *</label>
                                <input type="tel" class="form-control" id="sentPassportSenderPhone" required placeholder="777123456">
                            </div>
                        </div>

                        <h4 style="margin: 20px 0 10px; padding-bottom: 10px; border-bottom: 2px solid var(--border-color);">
                            <i class="fas fa-user-check"></i>
                            بيانات المستلم
                        </h4>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                            <div class="form-group">
                                <label class="form-label">اسم المستلم *</label>
                                <input type="text" class="form-control" id="sentPassportReceiverName" required placeholder="اسم المستلم">
                            </div>
                            <div class="form-group">
                                <label class="form-label">رقم هاتف المستلم *</label>
                                <input type="tel" class="form-control" id="sentPassportReceiverPhone" required placeholder="777987654">
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="form-label">ملاحظات</label>
                            <textarea class="form-control" id="sentPassportNotes" rows="3" placeholder="أي ملاحظات إضافية..."></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="hideModal('sentPassportModal')">
                        <i class="fas fa-times"></i>
                        إلغاء
                    </button>
                    <button class="btn btn-primary" onclick="document.getElementById('sentPassportForm').requestSubmit()">
                        <i class="fas fa-save"></i>
                        حفظ
                    </button>
                </div>
            </div>
        </div>
    `;
}

// مودال عرض التفاصيل
function renderViewSentPassportModal() {
    return `
        <div class="modal" id="viewSentPassportModal">
            <div class="modal-content" style="max-width: 800px;">
                <div class="modal-header">
                    <h3 class="modal-title">
                        <i class="fas fa-info-circle"></i>
                        تفاصيل الجواز المرسل
                    </h3>
                    <button class="modal-close" onclick="hideModal('viewSentPassportModal')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body" id="viewSentPassportContent">
                    <!-- سيتم ملؤها ديناميكياً -->
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="hideModal('viewSentPassportModal')">
                        إغلاق
                    </button>
                    <button class="btn btn-primary" id="printPassportBtn">
                        <i class="fas fa-print"></i>
                        طباعة
                    </button>
                </div>
            </div>
        </div>
    `;
}

// عرض مودال إضافة جواز
function showAddSentPassportModal() {
    document.getElementById('sentPassportModalTitle').innerHTML = `
        <i class="fas fa-passport"></i>
        إضافة جواز مرسل
    `;
    document.getElementById('sentPassportForm').reset();
    document.getElementById('sentPassportId').value = '';
    document.getElementById('sentPassportDate').value = new Date().toISOString().split('T')[0];
    
    showModal('sentPassportModal');
}

// حفظ الجواز
function saveSentPassport(event) {
    event.preventDefault();

    const id = document.getElementById('sentPassportId').value;
    const passport = {
        id: id || 'SP' + Date.now(),
        date: document.getElementById('sentPassportDate').value,
        name: document.getElementById('sentPassportName').value.trim(),
        passportNumber: document.getElementById('sentPassportNumber').value.trim(),
        bookingNumber: document.getElementById('sentPassportBookingNumber').value.trim(),
        ticketNumber: document.getElementById('sentPassportTicketNumber').value.trim(),
        travelDate: document.getElementById('sentPassportTravelDate').value,
        sendLocation: document.getElementById('sentPassportLocation').value.trim(),
        senderName: document.getElementById('sentPassportSenderName').value.trim(),
        senderPhone: document.getElementById('sentPassportSenderPhone').value.trim(),
        receiverName: document.getElementById('sentPassportReceiverName').value.trim(),
        receiverPhone: document.getElementById('sentPassportReceiverPhone').value.trim(),
        notes: document.getElementById('sentPassportNotes').value.trim(),
        createdAt: id ? getData('sentPassports').find(p => p.id === id)?.createdAt || Date.now() : Date.now(),
        updatedAt: Date.now()
    };

    if (id) {
        updateItem('sentPassports', id, passport);
        showAlert('تم تحديث بيانات الجواز بنجاح', 'success');
    } else {
        addItem('sentPassports', passport);
        showAlert('تم إضافة الجواز المرسل بنجاح', 'success');
    }

    hideModal('sentPassportModal');
    loadSentPassports();
}

// تعديل جواز
function editSentPassport(id) {
    const passport = getData('sentPassports').find(p => p.id === id);
    if (!passport) {
        showAlert('لم يتم العثور على الجواز', 'error');
        return;
    }

    document.getElementById('sentPassportModalTitle').innerHTML = `
        <i class="fas fa-edit"></i>
        تعديل بيانات الجواز
    `;

    document.getElementById('sentPassportId').value = passport.id;
    document.getElementById('sentPassportDate').value = passport.date;
    document.getElementById('sentPassportName').value = passport.name;
    document.getElementById('sentPassportNumber').value = passport.passportNumber;
    document.getElementById('sentPassportBookingNumber').value = passport.bookingNumber || '';
    document.getElementById('sentPassportTicketNumber').value = passport.ticketNumber || '';
    document.getElementById('sentPassportTravelDate').value = passport.travelDate;
    document.getElementById('sentPassportLocation').value = passport.sendLocation;
    document.getElementById('sentPassportSenderName').value = passport.senderName;
    document.getElementById('sentPassportSenderPhone').value = passport.senderPhone;
    document.getElementById('sentPassportReceiverName').value = passport.receiverName;
    document.getElementById('sentPassportReceiverPhone').value = passport.receiverPhone;
    document.getElementById('sentPassportNotes').value = passport.notes || '';

    showModal('sentPassportModal');
}

// عرض تفاصيل الجواز
function viewSentPassportDetails(id) {
    const passport = getData('sentPassports').find(p => p.id === id);
    if (!passport) {
        showAlert('لم يتم العثور على الجواز', 'error');
        return;
    }

    const content = document.getElementById('viewSentPassportContent');
    content.innerHTML = `
        <div style="background: #f8f9fa; border-radius: 8px; padding: 20px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                <div>
                    <label style="color: #666; font-size: 0.9em;">التاريخ:</label>
                    <div style="font-weight: bold; font-size: 1.1em;">${formatDateShort(passport.date)}</div>
                </div>
                <div>
                    <label style="color: #666; font-size: 0.9em;">تاريخ السفر:</label>
                    <div style="font-weight: bold; font-size: 1.1em; color: var(--success-color);">${formatDateShort(passport.travelDate)}</div>
                </div>
            </div>

            <div style="background: white; padding: 15px; border-radius: 6px; margin-bottom: 15px;">
                <div style="margin-bottom: 10px;">
                    <label style="color: #666; font-size: 0.9em;">الاسم:</label>
                    <div style="font-weight: bold; font-size: 1.2em; color: var(--primary-color);">${passport.name}</div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">
                    <div>
                        <label style="color: #666; font-size: 0.9em;">رقم الجواز:</label>
                        <div style="font-weight: bold;">${passport.passportNumber}</div>
                    </div>
                    <div>
                        <label style="color: #666; font-size: 0.9em;">رقم الحجز:</label>
                        <div style="font-weight: bold;">${passport.bookingNumber || '-'}</div>
                    </div>
                    <div>
                        <label style="color: #666; font-size: 0.9em;">رقم التذكرة:</label>
                        <div style="font-weight: bold;">${passport.ticketNumber || '-'}</div>
                    </div>
                </div>
            </div>

            <div style="background: white; padding: 15px; border-radius: 6px; margin-bottom: 15px;">
                <label style="color: #666; font-size: 0.9em;">مكان الإرسال:</label>
                <div style="font-weight: bold; font-size: 1.1em; color: var(--info-color);">
                    <i class="fas fa-map-marker-alt"></i>
                    ${passport.sendLocation}
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                <div style="background: white; padding: 15px; border-radius: 6px;">
                    <h4 style="margin: 0 0 10px 0; color: var(--primary-color); border-bottom: 2px solid var(--border-color); padding-bottom: 5px;">
                        <i class="fas fa-user-tie"></i>
                        المرسل
                    </h4>
                    <div style="margin-bottom: 8px;">
                        <label style="color: #666; font-size: 0.85em;">الاسم:</label>
                        <div style="font-weight: bold;">${passport.senderName}</div>
                    </div>
                    <div>
                        <label style="color: #666; font-size: 0.85em;">الهاتف:</label>
                        <div style="font-weight: bold;">
                            <i class="fas fa-phone"></i>
                            ${passport.senderPhone}
                        </div>
                    </div>
                </div>

                <div style="background: white; padding: 15px; border-radius: 6px;">
                    <h4 style="margin: 0 0 10px 0; color: var(--success-color); border-bottom: 2px solid var(--border-color); padding-bottom: 5px;">
                        <i class="fas fa-user-check"></i>
                        المستلم
                    </h4>
                    <div style="margin-bottom: 8px;">
                        <label style="color: #666; font-size: 0.85em;">الاسم:</label>
                        <div style="font-weight: bold;">${passport.receiverName}</div>
                    </div>
                    <div>
                        <label style="color: #666; font-size: 0.85em;">الهاتف:</label>
                        <div style="font-weight: bold;">
                            <i class="fas fa-phone"></i>
                            ${passport.receiverPhone}
                        </div>
                    </div>
                </div>
            </div>

            ${passport.notes ? `
            <div style="background: white; padding: 15px; border-radius: 6px;">
                <label style="color: #666; font-size: 0.9em;">ملاحظات:</label>
                <div style="margin-top: 5px; padding: 10px; background: #f8f9fa; border-radius: 4px;">
                    ${passport.notes}
                </div>
            </div>
            ` : ''}
        </div>
    `;

    // إعداد زر الطباعة
    document.getElementById('printPassportBtn').onclick = () => printSentPassportDetails(id);

    showModal('viewSentPassportModal');
}

// حذف جواز
function deleteSentPassport(id) {
    const passport = getData('sentPassports').find(p => p.id === id);
    if (!passport) return;

    if (confirm(`هل أنت متأكد من حذف الجواز الخاص بـ "${passport.name}"؟\nهذا الإجراء لا يمكن التراجع عنه.`)) {
        deleteItem('sentPassports', id);
        showAlert('تم حذف الجواز المرسل بنجاح', 'success');
        loadSentPassports();
    }
}

// فلترة الجوازات
function filterSentPassports() {
    const searchTerm = document.getElementById('searchSentPassport').value.toLowerCase();
    const locationFilter = document.getElementById('filterLocation').value;

    let passports = getData('sentPassports') || [];

    passports = passports.filter(passport => {
        const matchesSearch = !searchTerm || 
            passport.name.toLowerCase().includes(searchTerm) ||
            passport.passportNumber.toLowerCase().includes(searchTerm) ||
            (passport.bookingNumber && passport.bookingNumber.toLowerCase().includes(searchTerm)) ||
            (passport.ticketNumber && passport.ticketNumber.toLowerCase().includes(searchTerm));

        const matchesLocation = !locationFilter || passport.sendLocation === locationFilter;

        return matchesSearch && matchesLocation;
    });

    document.getElementById('sentPassportsTableBody').innerHTML = renderSentPassportsTable(passports);
}

// إعادة تعيين الفلاتر
function resetSentPassportFilters() {
    document.getElementById('searchSentPassport').value = '';
    document.getElementById('filterLocation').value = '';
    filterSentPassports();
}

// الحصول على قائمة فريدة من أماكن الإرسال
function getUniqueLocations(passports) {
    const locations = passports.map(p => p.sendLocation);
    return [...new Set(locations)].sort();
}

// طباعة تفاصيل جواز
function printSentPassportDetails(id) {
    const passport = getData('sentPassports').find(p => p.id === id);
    if (!passport) return;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8">
            <title>تفاصيل الجواز - ${passport.name}</title>
            <style>
                body {
                    font-family: 'Cairo', Arial, sans-serif;
                    direction: rtl;
                    margin: 20px;
                    font-size: 14px;
                }
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: start;
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 3px solid #f57c00;
                }
                .company-info {
                    flex: 1;
                }
                .logo {
                    max-width: 150px;
                }
                h2 {
                    text-align: center;
                    color: #667eea;
                    margin: 20px 0;
                }
                .info-box {
                    background: #f8f9fa;
                    padding: 15px;
                    border-radius: 8px;
                    margin: 15px 0;
                }
                .info-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 8px 0;
                    border-bottom: 1px solid #ddd;
                }
                .info-label {
                    color: #666;
                    font-weight: bold;
                }
                @media print {
                    body { margin: 0; padding: 15px; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="company-info">
                    <h1 style="margin: 0; font-size: 24px;">${COMPANY_INFO.name}</h1>
                    <p style="margin: 5px 0;">${COMPANY_INFO.location}</p>
                    <p style="margin: 5px 0;">هاتف/جوال: ${COMPANY_INFO.phones.office.join(' - ')}</p>
                </div>
                <div>
                    <img src="${COMPANY_INFO.logo}" alt="Logo" class="logo">
                </div>
            </div>

            <h2>تفاصيل الجواز المرسل</h2>

            <div class="info-box">
                <div class="info-row">
                    <span class="info-label">التاريخ:</span>
                    <span>${formatDateShort(passport.date)}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">الاسم:</span>
                    <span>${passport.name}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">رقم الجواز:</span>
                    <span>${passport.passportNumber}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">رقم الحجز:</span>
                    <span>${passport.bookingNumber || '-'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">تاريخ السفر:</span>
                    <span>${formatDateShort(passport.travelDate)}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">مكان الإرسال:</span>
                    <span>${passport.sendLocation}</span>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div class="info-box">
                    <h3 style="margin: 0 0 10px 0;">المرسل</h3>
                    <div class="info-row">
                        <span class="info-label">الاسم:</span>
                        <span>${passport.senderName}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">الهاتف:</span>
                        <span>${passport.senderPhone}</span>
                    </div>
                </div>

                <div class="info-box">
                    <h3 style="margin: 0 0 10px 0;">المستلم</h3>
                    <div class="info-row">
                        <span class="info-label">الاسم:</span>
                        <span>${passport.receiverName}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">الهاتف:</span>
                        <span>${passport.receiverPhone}</span>
                    </div>
                </div>
            </div>

            ${passport.notes ? `
            <div class="info-box">
                <h3 style="margin: 0 0 10px 0;">ملاحظات</h3>
                <p>${passport.notes}</p>
            </div>
            ` : ''}

            <div style="margin-top: 30px; text-align: center; color: #666; font-size: 12px;">
                <p>تاريخ الطباعة: ${new Date().toLocaleString('ar-YE')}</p>
            </div>

            <script>
                window.onload = function() { window.print(); }
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

// تهيئة الوحدة
console.log('✓ تم تحميل وحدة الجوازات المرسلة - v3.1.0');
