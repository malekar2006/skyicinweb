// ========================================
// أداة المتابعة - إدارة التأشيرات والإشعارات
// ========================================

// عرض واجهة المتابعة
function showFollowUp() {
    const followUps = getData('followups') || [];
    
    // إحصائيات سريعة
    const totalFollowUps = followUps.length;
    const overdueFollowUps = followUps.filter(f => isOverdue(f)).length;
    const activeFollowUps = followUps.filter(f => !isOverdue(f)).length;
    
    const html = `
        <div class="page-header">
            <div>
                <h1>
                    <i class="fas fa-clipboard-check"></i>
                    المتابعة
                </h1>
                <p class="page-description">إدارة متابعة التأشيرات والسفر</p>
            </div>
            <button onclick="addFollowUp()" class="btn btn-primary">
                <i class="fas fa-plus"></i>
                إضافة متابعة جديدة
            </button>
        </div>

        <!-- الإحصائيات السريعة -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                    <i class="fas fa-clipboard-list"></i>
                </div>
                <div class="stat-details">
                    <div class="stat-value">${totalFollowUps}</div>
                    <div class="stat-label">إجمالي المتابعات</div>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="stat-details">
                    <div class="stat-value">${overdueFollowUps}</div>
                    <div class="stat-label">متجاوزون للمدة</div>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
                    <i class="fas fa-check-circle"></i>
                </div>
                <div class="stat-details">
                    <div class="stat-value">${activeFollowUps}</div>
                    <div class="stat-label">ضمن المدة</div>
                </div>
            </div>
        </div>

        <!-- أدوات البحث والتصفية -->
        <div class="search-filters">
            <div class="search-box">
                <i class="fas fa-search"></i>
                <input type="text" id="followUpSearch" placeholder="البحث برقم مسلسل، رقم التأشيرة، أو الاسم..." 
                       onkeyup="filterFollowUps(this.value)">
            </div>
            <div class="filter-buttons">
                <button class="filter-btn active" onclick="filterByStatus('all')">
                    <i class="fas fa-list"></i> الجميع
                </button>
                <button class="filter-btn" onclick="filterByStatus('overdue')">
                    <i class="fas fa-exclamation-triangle"></i> متجاوزون
                </button>
                <button class="filter-btn" onclick="filterByStatus('active')">
                    <i class="fas fa-check-circle"></i> نشط
                </button>
            </div>
        </div>

        <!-- جدول المتابعات -->
        <div class="table-container">
            <table id="followUpsTable">
                <thead>
                    <tr>
                        <th>رقم مسلسل</th>
                        <th>رقم التأشيرة</th>
                        <th>نوع التأشيرة</th>
                        <th>الاسم</th>
                        <th>تاريخ السفر</th>
                        <th>المدة المسموح بها</th>
                        <th>تاريخ انتهاء المدة</th>
                        <th>الأيام المتبقية</th>
                        <th>رقم الجوال</th>
                        <th>الحالة</th>
                        <th>الإجراءات</th>
                    </tr>
                </thead>
                <tbody>
                    ${generateFollowUpRows(followUps)}
                </tbody>
            </table>
        </div>
    `;

    document.getElementById('content').innerHTML = html;
}

// توليد صفوف جدول المتابعات
function generateFollowUpRows(followUps) {
    if (!followUps || followUps.length === 0) {
        return `
            <tr>
                <td colspan="11" style="text-align: center; padding: 40px; color: #999;">
                    <i class="fas fa-clipboard-list" style="font-size: 48px; margin-bottom: 10px; opacity: 0.5;"></i>
                    <p>لا توجد متابعات مسجلة</p>
                </td>
            </tr>`;
    }

    return followUps.map(followUp => {
        const daysRemaining = calculateDaysRemaining(followUp);
        const statusInfo = getStatusInfo(followUp, daysRemaining);
        const endDate = calculateEndDate(followUp);
        
        return `
            <tr data-id="${followUp.id}" data-status="${statusInfo.status}">
                <td><strong>${followUp.serial_number}</strong></td>
                <td><span class="phone-number">${followUp.visa_number}</span></td>
                <td>${followUp.visa_type}</td>
                <td>${followUp.name}</td>
                <td>${formatDate(followUp.travel_date)}</td>
                <td>${followUp.allowed_duration} يوم</td>
                <td>${formatDate(endDate)}</td>
                <td>
                    <span class="badge ${statusInfo.badgeClass}">
                        ${daysRemaining >= 0 ? daysRemaining + ' يوم' : 'متجاوز بـ ' + Math.abs(daysRemaining) + ' يوم'}
                    </span>
                </td>
                <td><span class="phone-number">${followUp.phone}</span></td>
                <td>
                    <span class="status-badge ${statusInfo.statusClass}">
                        <i class="fas ${statusInfo.icon}"></i>
                        ${statusInfo.label}
                    </span>
                </td>
                <td class="table-actions">
                    <button onclick="viewFollowUpDetails('${followUp.id}')" class="btn-icon btn-view" title="عرض التفاصيل">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick="editFollowUp('${followUp.id}')" class="btn-icon btn-edit" title="تعديل">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteFollowUp('${followUp.id}')" class="btn-icon btn-delete" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>`;
    }).join('');
}

// حساب تاريخ انتهاء المدة
function calculateEndDate(followUp) {
    const travelDate = new Date(followUp.travel_date);
    const endDate = new Date(travelDate);
    endDate.setDate(endDate.getDate() + parseInt(followUp.allowed_duration));
    return endDate.toISOString();
}

// حساب الأيام المتبقية
function calculateDaysRemaining(followUp) {
    const endDate = new Date(calculateEndDate(followUp));
    const today = new Date();
    const timeDiff = endDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff;
}

// التحقق من التجاوز
function isOverdue(followUp) {
    return calculateDaysRemaining(followUp) < 0;
}

// الحصول على معلومات الحالة
function getStatusInfo(followUp, daysRemaining) {
    if (daysRemaining < 0) {
        return {
            status: 'overdue',
            label: 'متجاوز',
            statusClass: 'status-overdue',
            badgeClass: 'badge-danger',
            icon: 'fa-exclamation-triangle'
        };
    } else if (daysRemaining <= 7) {
        return {
            status: 'warning',
            label: 'قريب من الانتهاء',
            statusClass: 'status-warning',
            badgeClass: 'badge-warning',
            icon: 'fa-clock'
        };
    } else {
        return {
            status: 'active',
            label: 'نشط',
            statusClass: 'status-active',
            badgeClass: 'badge-success',
            icon: 'fa-check-circle'
        };
    }
}

// إضافة متابعة جديدة
function addFollowUp() {
    const html = `
        <div class="modal-overlay" onclick="closeModal()">
            <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h2><i class="fas fa-plus"></i> إضافة متابعة جديدة</h2>
                    <button class="close-btn" onclick="closeModal()">&times;</button>
                </div>
                <form onsubmit="saveFollowUp(event)" id="followUpForm">
                    <div class="form-grid">
                        <div class="form-group">
                            <label>رقم مسلسل *</label>
                            <input type="text" name="serial_number" required placeholder="أدخل رقم مسلسل">
                        </div>
                        <div class="form-group">
                            <label>رقم التأشيرة *</label>
                            <input type="text" name="visa_number" required placeholder="أدخل رقم التأشيرة" class="ltr-input">
                        </div>
                        <div class="form-group">
                            <label>نوع التأشيرة *</label>
                            <select name="visa_type" required>
                                <option value="">اختر نوع التأشيرة</option>
                                <option value="عمل">عمل</option>
                                <option value="زيارة">زيارة</option>
                                <option value="سياحة">سياحة</option>
                                <option value="حج">حج</option>
                                <option value="عمرة">عمرة</option>
                                <option value="دراسة">دراسة</option>
                                <option value="علاج">علاج</option>
                                <option value="أخرى">أخرى</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>الاسم الكامل *</label>
                            <input type="text" name="name" required placeholder="أدخل الاسم الكامل">
                        </div>
                        <div class="form-group">
                            <label>تاريخ السفر *</label>
                            <input type="date" name="travel_date" required>
                        </div>
                        <div class="form-group">
                            <label>المدة المسموح بها (بالأيام) *</label>
                            <input type="number" name="allowed_duration" required placeholder="مثال: 90" min="1">
                        </div>
                        <div class="form-group">
                            <label>رقم الجوال *</label>
                            <input type="tel" name="phone" required placeholder="مثال: 777123456" class="ltr-input">
                        </div>
                        <div class="form-group">
                            <label>ملاحظات</label>
                            <textarea name="notes" rows="3" placeholder="أي ملاحظات إضافية..."></textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" onclick="closeModal()" class="btn btn-secondary">
                            <i class="fas fa-times"></i> إلغاء
                        </button>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i> حفظ المتابعة
                        </button>
                    </div>
                </form>
            </div>
        </div>`;
    
    document.body.insertAdjacentHTML('beforeend', html);
}

// حفظ المتابعة
function saveFollowUp(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const followUpData = {
        id: 'FU' + Date.now(),
        serial_number: formData.get('serial_number'),
        visa_number: formData.get('visa_number'),
        visa_type: formData.get('visa_type'),
        name: formData.get('name'),
        travel_date: formData.get('travel_date'),
        allowed_duration: parseInt(formData.get('allowed_duration')),
        phone: formData.get('phone'),
        notes: formData.get('notes') || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
    
    const followUps = getData('followups') || [];
    followUps.push(followUpData);
    saveData('followups', followUps);
    
    closeModal();
    showFollowUp();
    showNotification('تم إضافة المتابعة بنجاح', 'success');
    
    // سجل النشاط
    logActivity('add', 'followup', followUpData.id, `إضافة متابعة جديدة: ${followUpData.name}`);
}

// تعديل متابعة
function editFollowUp(followUpId) {
    const followUps = getData('followups') || [];
    const followUp = followUps.find(f => f.id === followUpId);
    if (!followUp) return;
    
    const html = `
        <div class="modal-overlay" onclick="closeModal()">
            <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h2><i class="fas fa-edit"></i> تعديل المتابعة</h2>
                    <button class="close-btn" onclick="closeModal()">&times;</button>
                </div>
                <form onsubmit="updateFollowUp(event, '${followUpId}')" id="followUpForm">
                    <div class="form-grid">
                        <div class="form-group">
                            <label>رقم مسلسل *</label>
                            <input type="text" name="serial_number" required value="${followUp.serial_number}">
                        </div>
                        <div class="form-group">
                            <label>رقم التأشيرة *</label>
                            <input type="text" name="visa_number" required value="${followUp.visa_number}" class="ltr-input">
                        </div>
                        <div class="form-group">
                            <label>نوع التأشيرة *</label>
                            <select name="visa_type" required>
                                <option value="">اختر نوع التأشيرة</option>
                                <option value="عمل" ${followUp.visa_type === 'عمل' ? 'selected' : ''}>عمل</option>
                                <option value="زيارة" ${followUp.visa_type === 'زيارة' ? 'selected' : ''}>زيارة</option>
                                <option value="سياحة" ${followUp.visa_type === 'سياحة' ? 'selected' : ''}>سياحة</option>
                                <option value="حج" ${followUp.visa_type === 'حج' ? 'selected' : ''}>حج</option>
                                <option value="عمرة" ${followUp.visa_type === 'عمرة' ? 'selected' : ''}>عمرة</option>
                                <option value="دراسة" ${followUp.visa_type === 'دراسة' ? 'selected' : ''}>دراسة</option>
                                <option value="علاج" ${followUp.visa_type === 'علاج' ? 'selected' : ''}>علاج</option>
                                <option value="أخرى" ${followUp.visa_type === 'أخرى' ? 'selected' : ''}>أخرى</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>الاسم الكامل *</label>
                            <input type="text" name="name" required value="${followUp.name}">
                        </div>
                        <div class="form-group">
                            <label>تاريخ السفر *</label>
                            <input type="date" name="travel_date" required value="${followUp.travel_date}">
                        </div>
                        <div class="form-group">
                            <label>المدة المسموح بها (بالأيام) *</label>
                            <input type="number" name="allowed_duration" required value="${followUp.allowed_duration}" min="1">
                        </div>
                        <div class="form-group">
                            <label>رقم الجوال *</label>
                            <input type="tel" name="phone" required value="${followUp.phone}" class="ltr-input">
                        </div>
                        <div class="form-group">
                            <label>ملاحظات</label>
                            <textarea name="notes" rows="3">${followUp.notes || ''}</textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" onclick="closeModal()" class="btn btn-secondary">
                            <i class="fas fa-times"></i> إلغاء
                        </button>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i> حفظ التعديلات
                        </button>
                    </div>
                </form>
            </div>
        </div>`;
    
    document.body.insertAdjacentHTML('beforeend', html);
}

// تحديث المتابعة
function updateFollowUp(event, followUpId) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const followUps = getData('followups') || [];
    const index = followUps.findIndex(f => f.id === followUpId);
    
    if (index !== -1) {
        followUps[index] = {
            ...followUps[index],
            serial_number: formData.get('serial_number'),
            visa_number: formData.get('visa_number'),
            visa_type: formData.get('visa_type'),
            name: formData.get('name'),
            travel_date: formData.get('travel_date'),
            allowed_duration: parseInt(formData.get('allowed_duration')),
            phone: formData.get('phone'),
            notes: formData.get('notes') || '',
            updated_at: new Date().toISOString()
        };
        
        saveData('followups', followUps);
        closeModal();
        showFollowUp();
        showNotification('تم تحديث المتابعة بنجاح', 'success');
        
        // سجل النشاط
        logActivity('update', 'followup', followUpId, `تعديل متابعة: ${followUps[index].name}`);
    }
}

// عرض تفاصيل المتابعة
function viewFollowUpDetails(followUpId) {
    const followUps = getData('followups') || [];
    const followUp = followUps.find(f => f.id === followUpId);
    if (!followUp) return;
    
    const daysRemaining = calculateDaysRemaining(followUp);
    const statusInfo = getStatusInfo(followUp, daysRemaining);
    const endDate = calculateEndDate(followUp);
    
    const html = `
        <div class="modal-overlay" onclick="closeModal()">
            <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h2><i class="fas fa-eye"></i> تفاصيل المتابعة</h2>
                    <button class="close-btn" onclick="closeModal()">&times;</button>
                </div>
                <div class="details-view">
                    <div class="detail-card">
                        <div class="detail-header">
                            <h3>معلومات التأشيرة</h3>
                            <span class="status-badge ${statusInfo.statusClass}">
                                <i class="fas ${statusInfo.icon}"></i>
                                ${statusInfo.label}
                            </span>
                        </div>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <label>رقم مسلسل:</label>
                                <span>${followUp.serial_number}</span>
                            </div>
                            <div class="detail-item">
                                <label>رقم التأشيرة:</label>
                                <span class="phone-number">${followUp.visa_number}</span>
                            </div>
                            <div class="detail-item">
                                <label>نوع التأشيرة:</label>
                                <span>${followUp.visa_type}</span>
                            </div>
                            <div class="detail-item">
                                <label>الاسم:</label>
                                <span>${followUp.name}</span>
                            </div>
                        </div>
                    </div>

                    <div class="detail-card">
                        <div class="detail-header">
                            <h3>معلومات السفر</h3>
                        </div>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <label>تاريخ السفر:</label>
                                <span>${formatDate(followUp.travel_date)}</span>
                            </div>
                            <div class="detail-item">
                                <label>المدة المسموح بها:</label>
                                <span>${followUp.allowed_duration} يوم</span>
                            </div>
                            <div class="detail-item">
                                <label>تاريخ انتهاء المدة:</label>
                                <span>${formatDate(endDate)}</span>
                            </div>
                            <div class="detail-item">
                                <label>الأيام المتبقية:</label>
                                <span class="badge ${statusInfo.badgeClass}">
                                    ${daysRemaining >= 0 ? daysRemaining + ' يوم' : 'متجاوز بـ ' + Math.abs(daysRemaining) + ' يوم'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div class="detail-card">
                        <div class="detail-header">
                            <h3>معلومات الاتصال</h3>
                        </div>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <label>رقم الجوال:</label>
                                <span class="phone-number">${followUp.phone}</span>
                            </div>
                            ${followUp.notes ? `
                            <div class="detail-item full-width">
                                <label>ملاحظات:</label>
                                <span>${followUp.notes}</span>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button onclick="closeModal()" class="btn btn-secondary">
                        <i class="fas fa-times"></i> إغلاق
                    </button>
                    <button onclick="closeModal(); editFollowUp('${followUp.id}')" class="btn btn-primary">
                        <i class="fas fa-edit"></i> تعديل
                    </button>
                </div>
            </div>
        </div>`;
    
    document.body.insertAdjacentHTML('beforeend', html);
}

// حذف متابعة
function deleteFollowUp(followUpId) {
    if (!confirm('هل أنت متأكد من حذف هذه المتابعة؟')) return;
    
    const followUps = getData('followups') || [];
    const index = followUps.findIndex(f => f.id === followUpId);
    
    if (index !== -1) {
        const deletedFollowUp = followUps[index];
        followUps.splice(index, 1);
        saveData('followups', followUps);
        
        showFollowUp();
        showNotification('تم حذف المتابعة بنجاح', 'success');
        
        // سجل النشاط
        logActivity('delete', 'followup', followUpId, `حذف متابعة: ${deletedFollowUp.name}`);
    }
}

// تصفية المتابعات بالبحث
function filterFollowUps(searchTerm) {
    const rows = document.querySelectorAll('#followUpsTable tbody tr');
    searchTerm = searchTerm.toLowerCase();
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// تصفية حسب الحالة
function filterByStatus(status) {
    const rows = document.querySelectorAll('#followUpsTable tbody tr');
    const buttons = document.querySelectorAll('.filter-btn');
    
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.closest('.filter-btn').classList.add('active');
    
    rows.forEach(row => {
        const rowStatus = row.getAttribute('data-status');
        
        if (status === 'all') {
            row.style.display = '';
        } else if (status === 'overdue') {
            row.style.display = rowStatus === 'overdue' ? '' : 'none';
        } else if (status === 'active') {
            row.style.display = rowStatus === 'active' || rowStatus === 'warning' ? '' : 'none';
        }
    });
}

// التحقق من المتابعات المتجاوزة عند تحميل النظام
function checkOverdueFollowUps() {
    const followUps = getData('followups') || [];
    const overdueFollowUps = followUps.filter(f => isOverdue(f));
    
    if (overdueFollowUps.length > 0) {
        // إظهار إشعار بالمتجاوزين
        showOverdueNotification(overdueFollowUps);
    }
}

// إظهار إشعار المتجاوزين
function showOverdueNotification(overdueFollowUps) {
    const html = `
        <div class="notification-popup overdue-notification">
            <div class="notification-header">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>تنبيه: يوجد ${overdueFollowUps.length} متابعة متجاوزة للمدة المسموح بها</h3>
            </div>
            <div class="notification-body">
                <p>القائمة التالية تحتوي على الأشخاص الذين تجاوزوا المدة المسموح بها:</p>
                <ul class="overdue-list">
                    ${overdueFollowUps.map(f => {
                        const daysOverdue = Math.abs(calculateDaysRemaining(f));
                        return `
                            <li>
                                <strong>${f.name}</strong> - 
                                رقم التأشيرة: <span class="phone-number">${f.visa_number}</span> - 
                                متجاوز بـ <strong>${daysOverdue}</strong> يوم - 
                                جوال: <span class="phone-number">${f.phone}</span>
                            </li>`;
                    }).join('')}
                </ul>
            </div>
            <div class="notification-footer">
                <button onclick="closeNotificationPopup()" class="btn btn-secondary">
                    <i class="fas fa-times"></i> إغلاق
                </button>
                <button onclick="closeNotificationPopup(); showFollowUp();" class="btn btn-primary">
                    <i class="fas fa-clipboard-check"></i> عرض المتابعات
                </button>
            </div>
        </div>
        <div class="notification-overlay" onclick="closeNotificationPopup()"></div>`;
    
    document.body.insertAdjacentHTML('beforeend', html);
}

// إغلاق نافذة الإشعار
function closeNotificationPopup() {
    const popup = document.querySelector('.notification-popup');
    const overlay = document.querySelector('.notification-overlay');
    
    if (popup) popup.remove();
    if (overlay) overlay.remove();
}

// تهيئة أداة المتابعة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // التحقق من المتابعات المتجاوزة بعد 2 ثانية من تحميل الصفحة
    setTimeout(checkOverdueFollowUps, 2000);
});
