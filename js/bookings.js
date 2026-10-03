// ========================================
// وحدة الحجوزات
// ========================================

function loadBookings() {
    const content = document.getElementById('content');
    const allBookings = getData('bookings') || [];
    
    // تطبيق تصفية العملة
    const bookings = filterBookingsByCurrency(allBookings);
    
    const flight = bookings.filter(b => b.type === 'flight');
    const hajj = bookings.filter(b => b.type === 'hajj');
    const umrah = bookings.filter(b => b.type === 'umrah');
    const hotel = bookings.filter(b => b.type === 'hotel');
    
    // الحصول على العملة المختارة
    const selectedCurrency = getGlobalCurrencyFilter();
    const currencyForDisplay = (selectedCurrency === 'all') ? null : selectedCurrency;
    
    content.innerHTML = `
        <div class="card">
            <div class="card-header">
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                    <h3 class="card-title" style="margin: 0;">
                        <i class="fas fa-ticket-alt"></i>
                        الحجوزات
                    </h3>
                    <div style="display: flex; gap: 10px; align-items: center;">
                        ${generateCurrencyFilterDropdown()}
                        <div class="dropdown" style="position: relative;">
                            <button class="btn btn-primary" onclick="toggleBookingMenu()">
                                <i class="fas fa-plus"></i>
                                حجز جديد
                                <i class="fas fa-chevron-down" style="margin-right: 5px;"></i>
                            </button>
                            <div id="bookingMenu" class="dropdown-menu" style="display: none; position: absolute; left: 0; top: 100%; background: white; box-shadow: var(--shadow-lg); border-radius: 6px; margin-top: 5px; min-width: 200px; z-index: 1000;">
                                <a href="#" onclick="openAddBookingModal('flight'); return false;" style="display: block; padding: 12px 20px; text-decoration: none; color: var(--text-dark); border-bottom: 1px solid var(--border-color);">
                                    <i class="fas fa-plane" style="margin-left: 10px; color: var(--primary-color);"></i>
                                    حجز طيران
                                </a>
                                <a href="#" onclick="openAddBookingModal('hajj'); return false;" style="display: block; padding: 12px 20px; text-decoration: none; color: var(--text-dark); border-bottom: 1px solid var(--border-color);">
                                    <i class="fas fa-kaaba" style="margin-left: 10px; color: var(--success-color);"></i>
                                    حجز حج
                                </a>
                                <a href="#" onclick="openAddBookingModal('umrah'); return false;" style="display: block; padding: 12px 20px; text-decoration: none; color: var(--text-dark); border-bottom: 1px solid var(--border-color);">
                                    <i class="fas fa-moon" style="margin-left: 10px; color: var(--info-color);"></i>
                                    حجز عمرة
                                </a>
                                <a href="#" onclick="openAddBookingModal('hotel'); return false;" style="display: block; padding: 12px 20px; text-decoration: none; color: var(--text-dark);">
                                    <i class="fas fa-hotel" style="margin-left: 10px; color: var(--warning-color);"></i>
                                    حجز فندق
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div style="padding: 20px;">
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon primary">
                            <i class="fas fa-plane"></i>
                        </div>
                        <div class="stat-content">
                            <h3>حجوزات الطيران</h3>
                            <div class="stat-value">${flight.length}</div>
                            <small>${formatCurrency(flight.reduce((sum, b) => sum + b.amount, 0), currencyForDisplay)}</small>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon success">
                            <i class="fas fa-kaaba"></i>
                        </div>
                        <div class="stat-content">
                            <h3>حجوزات الحج</h3>
                            <div class="stat-value">${hajj.length}</div>
                            <small>${formatCurrency(hajj.reduce((sum, b) => sum + b.amount, 0), currencyForDisplay)}</small>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon info">
                            <i class="fas fa-moon"></i>
                        </div>
                        <div class="stat-content">
                            <h3>حجوزات العمرة</h3>
                            <div class="stat-value">${umrah.length}</div>
                            <small>${formatCurrency(umrah.reduce((sum, b) => sum + b.amount, 0), currencyForDisplay)}</small>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon warning">
                            <i class="fas fa-hotel"></i>
                        </div>
                        <div class="stat-content">
                            <h3>حجوزات الفنادق</h3>
                            <div class="stat-value">${hotel.length}</div>
                            <small>${formatCurrency(hotel.reduce((sum, b) => sum + b.amount, 0), currencyForDisplay)}</small>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th>رقم الحجز</th>
                            <th>النوع</th>
                            <th>العميل</th>
                            <th>تاريخ الحجز</th>
                            <th>تاريخ المغادرة</th>
                            <th>نوع العملية</th>
                            <th>العملة</th>
                            <th>المبلغ</th>
                            <th>المدفوع</th>
                            <th>الحالة</th>
                            <th>إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${bookings.length === 0 ? 
                            '<tr><td colspan="11" style="text-align: center; padding: 40px;">لا توجد حجوزات</td></tr>' : 
                            bookings.map(booking => renderBookingRow(booking)).join('')
                        }
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- Add Booking Modal -->
        <div class="modal" id="bookingModal">
            <div class="modal-content" style="max-width: 900px;">
                <div class="modal-header">
                    <h3 class="modal-title" id="bookingModalTitle">حجز جديد</h3>
                    <button class="modal-close" onclick="hideModal('bookingModal')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="bookingForm" onsubmit="saveBooking(event)">
                        <input type="hidden" id="bookingId">
                        <input type="hidden" id="bookingType">
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                            <div class="form-group">
                                <label class="form-label">العميل *</label>
                                <select class="form-control" id="bookingCustomer" required>
                                    <option value="">اختر العميل</option>
                                    ${renderCustomerOptions()}
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">تاريخ الحجز *</label>
                                <input type="date" class="form-control" id="bookingDate" required value="${new Date().toISOString().split('T')[0]}">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">تفاصيل الخدمة *</label>
                            <textarea class="form-control" id="bookingDetails" required rows="3" placeholder="مثال: رحلة من صنعاء إلى جدة - الخطوط اليمنية"></textarea>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                            <div class="form-group">
                                <label class="form-label">تاريخ المغادرة *</label>
                                <input type="date" class="form-control" id="bookingDeparture" required>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">تاريخ العودة</label>
                                <input type="date" class="form-control" id="bookingReturn">
                            </div>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px;">
                            <div class="form-group">
                                <label class="form-label">المبلغ الإجمالي *</label>
                                <input type="number" class="form-control" id="bookingAmount" min="0" step="0.01" required>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">العملة *</label>
                                <select class="form-control" id="bookingCurrency" required>
                                    <option value="YER">ريال يمني</option>
                                    <option value="SAR">ريال سعودي</option>
                                    <option value="USD">دولار أمريكي</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">المبلغ المدفوع</label>
                                <input type="number" class="form-control" id="bookingPaid" min="0" step="0.01" value="0">
                            </div>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                            <div class="form-group">
                                <label class="form-label">نوع العملية *</label>
                                <select class="form-control" id="bookingOperationType" required>
                                    <option value="cash">نقداً</option>
                                    <option value="credit">آجل</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">الحالة *</label>
                                <select class="form-control" id="bookingStatus" required>
                                    <option value="confirmed">مؤكد</option>
                                    <option value="pending">معلق</option>
                                    <option value="cancelled">ملغي</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="bookingCreateInvoice">
                                إنشاء فاتورة تلقائياً
                            </label>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="document.getElementById('bookingForm').requestSubmit()">
                        <i class="fas fa-save"></i>
                        حفظ الحجز
                    </button>
                    <button class="btn btn-secondary" onclick="hideModal('bookingModal')">
                        <i class="fas fa-times"></i>
                        إلغاء
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        const menu = document.getElementById('bookingMenu');
        if (menu && !e.target.closest('.dropdown')) {
            menu.style.display = 'none';
        }
    });
}

function toggleBookingMenu() {
    const menu = document.getElementById('bookingMenu');
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
}

function renderBookingRow(booking) {
    const customers = getData('customers') || [];
    const customer = customers.find(c => c.id === booking.customer_id);
    
    const typeLabels = {
        flight: 'طيران',
        hajj: 'حج',
        umrah: 'عمرة',
        hotel: 'فندق'
    };
    
    const typeIcons = {
        flight: 'fa-plane',
        hajj: 'fa-kaaba',
        umrah: 'fa-moon',
        hotel: 'fa-hotel'
    };
    
    const typeColors = {
        flight: 'primary',
        hajj: 'success',
        umrah: 'info',
        hotel: 'warning'
    };
    
    const statusColors = {
        confirmed: 'success',
        pending: 'warning',
        cancelled: 'danger'
    };
    
    const statusLabels = {
        confirmed: 'مؤكد',
        pending: 'معلق',
        cancelled: 'ملغي'
    };
    
    const operationTypeLabels = {
        cash: 'نقداً',
        credit: 'آجل'
    };
    
    return `
        <tr>
            <td>${booking.booking_number}</td>
            <td>
                <span class="badge" style="padding: 5px 10px; border-radius: 4px; background: var(--${typeColors[booking.type]}-color); color: white;">
                    <i class="fas ${typeIcons[booking.type]}"></i>
                    ${typeLabels[booking.type]}
                </span>
            </td>
            <td>${customer ? customer.name : 'غير محدد'}</td>
            <td>${formatDateShort(booking.date)}</td>
            <td>${booking.departure_date ? formatDateShort(booking.departure_date) : '-'}</td>
            <td>
                <span class="badge" style="padding: 4px 8px; border-radius: 4px; background: ${booking.operation_type === 'cash' ? 'var(--success-color)' : 'var(--warning-color)'}; color: white; font-size: 0.85em;">
                    ${operationTypeLabels[booking.operation_type] || 'نقداً'}
                </span>
            </td>
            <td><span class="badge bg-info">${booking.currency || 'YER'}</span></td>
            <td>${formatCurrency(booking.amount)}</td>
            <td>${formatCurrency(booking.paid)}</td>
            <td>
                <span class="badge" style="padding: 5px 10px; border-radius: 4px; background: var(--${statusColors[booking.status]}-color); color: white;">
                    ${statusLabels[booking.status]}
                </span>
            </td>
            <td>
                <div class="action-btns">
                    <button class="btn btn-sm btn-view" onclick="viewBooking('${booking.id}')" title="عرض">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-edit" onclick="openEditBookingModal('${booking.id}')" title="تعديل">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-print" onclick="printBooking('${booking.id}')" title="طباعة">
                        <i class="fas fa-print"></i>
                    </button>
                    <button class="btn btn-sm btn-delete" onclick="deleteBooking('${booking.id}')" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `;
}

function openAddBookingModal(type) {
    document.getElementById('bookingForm').reset();
    document.getElementById('bookingId').value = '';
    document.getElementById('bookingType').value = type;
    
    const typeLabels = {
        flight: 'حجز طيران',
        hajj: 'حجز حج',
        umrah: 'حجز عمرة',
        hotel: 'حجز فندق'
    };
    
    document.getElementById('bookingModalTitle').textContent = typeLabels[type];
    document.getElementById('bookingMenu').style.display = 'none';
    showModal('bookingModal');
}

function openEditBookingModal(bookingId) {
    const booking = findItem('bookings', bookingId);
    if (!booking) return;
    
    document.getElementById('bookingId').value = booking.id;
    document.getElementById('bookingType').value = booking.type;
    document.getElementById('bookingCustomer').value = booking.customer_id;
    document.getElementById('bookingDate').value = booking.date;
    document.getElementById('bookingDetails').value = booking.service_details;
    document.getElementById('bookingDeparture').value = booking.departure_date || '';
    document.getElementById('bookingReturn').value = booking.return_date || '';
    document.getElementById('bookingAmount').value = booking.amount;
    document.getElementById('bookingCurrency').value = booking.currency || 'YER';
    document.getElementById('bookingPaid').value = booking.paid;
    document.getElementById('bookingStatus').value = booking.status;
    
    const typeLabels = {
        flight: 'تعديل حجز طيران',
        hajj: 'تعديل حجز حج',
        umrah: 'تعديل حجز عمرة',
        hotel: 'تعديل حجز فندق'
    };
    
    document.getElementById('bookingModalTitle').textContent = typeLabels[booking.type];
    showModal('bookingModal');
}

function saveBooking(event) {
    event.preventDefault();
    
    const id = document.getElementById('bookingId').value;
    const type = document.getElementById('bookingType').value;
    const customerId = document.getElementById('bookingCustomer').value;
    const date = document.getElementById('bookingDate').value;
    const details = document.getElementById('bookingDetails').value;
    const departure = document.getElementById('bookingDeparture').value;
    const returnDate = document.getElementById('bookingReturn').value;
    const amount = parseFloat(document.getElementById('bookingAmount').value);
    const currency = document.getElementById('bookingCurrency').value;
    const paid = parseFloat(document.getElementById('bookingPaid').value) || 0;
    const operationType = document.getElementById('bookingOperationType').value;
    const status = document.getElementById('bookingStatus').value;
    const createInvoice = document.getElementById('bookingCreateInvoice').checked;
    
    const booking = {
        id: id || generateId(),
        booking_number: id ? findItem('bookings', id).booking_number : generateBookingNumber(),
        type,
        customer_id: customerId,
        date,
        service_details: details,
        departure_date: departure,
        return_date: returnDate || null,
        amount,
        currency,
        paid,
        operation_type: operationType,
        status,
        invoice_id: null
    };
    
    // Create or update booking
    if (id) {
        updateItem('bookings', id, booking);
        showAlert('تم تحديث الحجز بنجاح', 'success');
        
        // تحديث القيد التلقائي إذا كان الحجز مؤكداً
        if (booking.status === 'confirmed' && typeof updateAutoPostedEntry === 'function') {
            updateAutoPostedEntry('booking', id, booking);
        }
    } else {
        addItem('bookings', booking);
        showAlert('تم إضافة الحجز بنجاح', 'success');
        
        // ترحيل تلقائي للحجز المؤكد
        if (booking.status === 'confirmed' && typeof autoPostBooking === 'function') {
            autoPostBooking(booking);
        }
        
        // Create invoice if checked
        if (createInvoice) {
            createBookingInvoice(booking);
        }
    }
    
    hideModal('bookingModal');
    loadBookings();
}

function generateBookingNumber() {
    const bookings = getData('bookings') || [];
    const year = new Date().getFullYear();
    const count = bookings.filter(b => b.date.startsWith(year.toString())).length + 1;
    return `BK-${year}-${String(count).padStart(5, '0')}`;
}

function createBookingInvoice(booking) {
    const typeLabels = {
        flight: 'حجز طيران',
        hajj: 'حجز حج',
        umrah: 'حجز عمرة',
        hotel: 'حجز فندق'
    };
    
    const invoice = {
        id: generateId(),
        number: generateInvoiceNumber(),
        type: 'sales',
        date: booking.date,
        customer_id: booking.customer_id,
        supplier_id: null,
        items: [{
            description: `${typeLabels[booking.type]} - ${booking.service_details}`,
            quantity: 1,
            price: booking.amount,
            total: booking.amount
        }],
        subtotal: booking.amount,
        tax: 0,
        discount: 0,
        total: booking.amount,
        paid: booking.paid,
        status: booking.paid >= booking.amount ? 'paid' : booking.paid > 0 ? 'partial' : 'unpaid'
    };
    
    addItem('invoices', invoice);
    
    // Update booking with invoice_id
    updateItem('bookings', booking.id, { invoice_id: invoice.id });
    
    showAlert('تم إنشاء الفاتورة بنجاح', 'success');
}

function viewBooking(bookingId) {
    const booking = findItem('bookings', bookingId);
    if (!booking) return;
    
    const customers = getData('customers') || [];
    const customer = customers.find(c => c.id === booking.customer_id);
    
    const typeLabels = {
        flight: 'حجز طيران',
        hajj: 'حجز حج',
        umrah: 'حجز عمرة',
        hotel: 'حجز فندق'
    };
    
    const statusLabels = {
        confirmed: 'مؤكد',
        pending: 'معلق',
        cancelled: 'ملغي'
    };
    
    const statusColors = {
        confirmed: 'success',
        pending: 'warning',
        cancelled: 'danger'
    };
    
    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">
                    <i class="fas fa-ticket-alt"></i>
                    تفاصيل الحجز
                </h3>
                <div style="display: flex; gap: 10px;">
                    <button class="btn btn-primary" onclick="openEditBookingModal('${booking.id}')">
                        <i class="fas fa-edit"></i>
                        تعديل
                    </button>
                    <button class="btn btn-secondary" onclick="loadBookings()">
                        <i class="fas fa-arrow-right"></i>
                        رجوع
                    </button>
                </div>
            </div>
            
            <div class="company-header">
                <div class="company-logo"><i class="fas fa-plane-departure"></i></div>
                <h2 class="company-name">${COMPANY_INFO.name}</h2>
                <p class="company-subtitle">تأكيد حجز</p>
                <h3 style="margin-top: 20px; color: var(--primary-color);">${typeLabels[booking.type]}</h3>
            </div>
            
            <div style="padding: 40px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
                    <div>
                        <h4>معلومات الحجز</h4>
                        <p><strong>رقم الحجز:</strong> ${booking.booking_number}</p>
                        <p><strong>تاريخ الحجز:</strong> ${formatDate(booking.date)}</p>
                        <p><strong>تاريخ المغادرة:</strong> ${booking.departure_date ? formatDate(booking.departure_date) : '-'}</p>
                        <p><strong>تاريخ العودة:</strong> ${booking.return_date ? formatDate(booking.return_date) : '-'}</p>
                        <p><strong>الحالة:</strong> 
                            <span class="badge" style="padding: 5px 15px; border-radius: 4px; background: var(--${statusColors[booking.status]}-color); color: white;">
                                ${statusLabels[booking.status]}
                            </span>
                        </p>
                    </div>
                    <div>
                        <h4>بيانات العميل</h4>
                        <p><strong>الاسم:</strong> ${customer ? customer.name : 'غير محدد'}</p>
                        <p><strong>الهاتف:</strong> ${customer ? customer.phone : '-'}</p>
                        <p><strong>البريد:</strong> ${customer && customer.email ? customer.email : '-'}</p>
                        <p><strong>رقم الهوية:</strong> ${customer && customer.id_number ? customer.id_number : '-'}</p>
                        <p><strong>رقم الجواز:</strong> ${customer && customer.passport_number ? customer.passport_number : '-'}</p>
                    </div>
                </div>
                
                <div style="margin-bottom: 30px;">
                    <h4>تفاصيل الخدمة</h4>
                    <p style="padding: 20px; background: var(--light-bg); border-radius: 8px;">
                        ${booking.service_details}
                    </p>
                </div>
                
                <div style="background: var(--light-bg); padding: 30px; border-radius: 10px; margin: 30px 0;">
                    <div style="display: flex; justify-content: space-between; padding: 15px; border-bottom: 1px solid var(--border-color);">
                        <strong style="font-size: 18px;">المبلغ الإجمالي:</strong>
                        <span style="font-size: 24px; font-weight: bold; color: var(--primary-color);">${formatCurrency(booking.amount, booking.currency)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 15px; border-bottom: 1px solid var(--border-color);">
                        <strong style="font-size: 18px;">المبلغ المدفوع:</strong>
                        <span style="font-size: 24px; font-weight: bold; color: var(--success-color);">${formatCurrency(booking.paid, booking.currency)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 15px;">
                        <strong style="font-size: 18px;">المتبقي:</strong>
                        <span style="font-size: 24px; font-weight: bold; color: var(--danger-color);">${formatCurrency(booking.amount - booking.paid, booking.currency)}</span>
                    </div>
                </div>
                
                <div style="margin-top: 40px;">
                    ${!booking.invoice_id ? `
                        <button class="btn btn-success" onclick="createBookingInvoiceFromView('${booking.id}')">
                            <i class="fas fa-file-invoice"></i>
                            إنشاء فاتورة
                        </button>
                    ` : `
                        <button class="btn btn-info" onclick="viewInvoice('${booking.invoice_id}')">
                            <i class="fas fa-file-invoice"></i>
                            عرض الفاتورة
                        </button>
                    `}
                    <button class="btn btn-primary" onclick="printBooking('${booking.id}')">
                        <i class="fas fa-print"></i>
                        طباعة تأكيد الحجز
                    </button>
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

function createBookingInvoiceFromView(bookingId) {
    const booking = findItem('bookings', bookingId);
    if (!booking) return;
    
    createBookingInvoice(booking);
    viewBooking(bookingId);
}

function printBooking(bookingId) {
    const booking = findItem('bookings', bookingId);
    if (!booking) return;
    
    const customers = getData('customers') || [];
    const customer = customers.find(c => c.id === booking.customer_id);
    
    const typeLabels = {
        flight: 'حجز طيران',
        hajj: 'حجز حج',
        umrah: 'حجز عمرة',
        hotel: 'حجز فندق'
    };
    
    const statusLabels = {
        confirmed: 'مؤكد',
        pending: 'معلق',
        cancelled: 'ملغي'
    };
    
    const statusColors = {
        confirmed: '#4caf50',
        pending: '#ff9800',
        cancelled: '#f44336'
    };
    
    const currency = booking.currency || 'YER';
    const currencyInfo = CURRENCIES[currency];
    
    let html = `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8">
            <title>تأكيد حجز - ${booking.booking_number}</title>
            <style>
                body {
                    font-family: 'Cairo', Arial, sans-serif;
                    direction: rtl;
                    margin: 20px;
                    font-size: 14px;
                }
                .booking-box {
                    border: 2px solid #f57c00;
                    padding: 25px;
                    border-radius: 10px;
                    margin: 20px 0;
                }
                .info-section {
                    margin: 20px 0;
                    padding: 15px;
                    background: #f5f5f5;
                    border-radius: 8px;
                }
                .info-section h4 {
                    color: #f57c00;
                    margin: 0 0 12px 0;
                    font-size: 16px;
                    border-bottom: 2px solid #ddd;
                    padding-bottom: 8px;
                }
                .info-row {
                    padding: 8px 0;
                    border-bottom: 1px solid #e0e0e0;
                }
                .info-row:last-child {
                    border-bottom: none;
                }
                .amount-box {
                    background: #f57c00;
                    color: white;
                    padding: 20px;
                    border-radius: 8px;
                    text-align: center;
                    margin: 20px 0;
                }
                .amount-detail {
                    display: flex;
                    justify-content: space-between;
                    padding: 10px 15px;
                    font-size: 16px;
                }
                .badge {
                    display: inline-block;
                    padding: 5px 15px;
                    border-radius: 20px;
                    color: white;
                    font-weight: bold;
                    font-size: 12px;
                }
                @media print {
                    body { margin: 0; }
                }
            </style>
        </head>
        <body>
            ${generateDocumentHeader('تأكيد حجز - ' + typeLabels[booking.type])}
            
            <div class="booking-box">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div class="info-section">
                        <h4>معلومات الحجز</h4>
                        <div class="info-row">
                            <strong>رقم الحجز:</strong>
                            <span style="color: #f57c00; font-weight: bold; font-size: 16px;">${booking.booking_number}</span>
                        </div>
                        <div class="info-row">
                            <strong>تاريخ الحجز:</strong>
                            <span>${formatDate(booking.date)}</span>
                        </div>
                        <div class="info-row">
                            <strong>تاريخ المغادرة:</strong>
                            <span>${booking.departure_date ? formatDate(booking.departure_date) : '-'}</span>
                        </div>
                        <div class="info-row">
                            <strong>تاريخ العودة:</strong>
                            <span>${booking.return_date ? formatDate(booking.return_date) : '-'}</span>
                        </div>
                        <div class="info-row">
                            <strong>الحالة:</strong>
                            <span class="badge" style="background: ${statusColors[booking.status]};">${statusLabels[booking.status]}</span>
                        </div>
                    </div>
                    
                    <div class="info-section">
                        <h4>بيانات العميل</h4>
                        <div class="info-row">
                            <strong>الاسم:</strong>
                            <span>${customer ? customer.name : 'غير محدد'}</span>
                        </div>
                        <div class="info-row">
                            <strong>الهاتف:</strong>
                            <span style="direction: ltr; text-align: right; display: inline-block;">${customer && customer.phone ? customer.phone : '-'}</span>
                        </div>
                        <div class="info-row">
                            <strong>البريد:</strong>
                            <span>${customer && customer.email ? customer.email : '-'}</span>
                        </div>
                        <div class="info-row">
                            <strong>رقم الهوية:</strong>
                            <span style="direction: ltr; text-align: right; display: inline-block;">${customer && customer.id_number ? customer.id_number : '-'}</span>
                        </div>
                        <div class="info-row">
                            <strong>رقم الجواز:</strong>
                            <span style="direction: ltr; text-align: right; display: inline-block;">${customer && customer.passport_number ? customer.passport_number : '-'}</span>
                        </div>
                    </div>
                </div>
                
                <div class="info-section" style="margin-top: 20px;">
                    <h4>تفاصيل الخدمة</h4>
                    <p style="margin: 10px 0; line-height: 1.8; white-space: pre-wrap;">${booking.service_details}</p>
                </div>
                
                <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <div class="amount-detail" style="border-bottom: 1px solid #ddd;">
                        <strong>المبلغ الإجمالي:</strong>
                        <span style="font-size: 18px; color: #f57c00;">${formatCurrency(booking.amount, currency)}</span>
                    </div>
                    <div class="amount-detail" style="border-bottom: 1px solid #ddd;">
                        <strong>المبلغ المدفوع:</strong>
                        <span style="font-size: 18px; color: #4caf50;">${formatCurrency(booking.paid, currency)}</span>
                    </div>
                    <div class="amount-detail" style="padding-top: 10px; border-top: 2px solid #f57c00;">
                        <strong style="font-size: 18px;">المتبقي:</strong>
                        <span style="font-size: 20px; font-weight: bold; color: #f44336;">${formatCurrency(booking.amount - booking.paid, currency)}</span>
                    </div>
                </div>
                
                <div style="margin-top: 40px; padding-top: 20px; border-top: 2px dashed #ddd; text-align: center; color: #666; font-size: 12px;">
                    <p style="font-weight: bold;">ملاحظة هامة:</p>
                    <p>يرجى مراجعة جميع البيانات والتأكد من صحتها. لأي استفسار يرجى التواصل معنا.</p>
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

function deleteBooking(bookingId) {
    const booking = findItem('bookings', bookingId);
    
    if (booking && booking.invoice_id) {
        if (!confirm('هذا الحجز مرتبط بفاتورة. هل تريد حذف الحجز والفاتورة معاً؟')) return;
        deleteItem('invoices', booking.invoice_id);
    } else {
        if (!confirm('هل أنت متأكد من حذف هذا الحجز؟')) return;
    }
    
    deleteItem('bookings', bookingId);
    showAlert('تم حذف الحجز بنجاح', 'success');
    loadBookings();
}