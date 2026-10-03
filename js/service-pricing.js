// ========================================
// نظام تسعير الخدمات المسبق
// ========================================

/**
 * نظام إدارة أسعار الخدمات مع الأسعار المسبقة
 * يتيح اختيار خدمة وإدراج السعر تلقائياً مع إمكانية التعديل
 */

// تحميل صفحة تسعير الخدمات
function loadServicePricing() {
    const content = document.getElementById('content');
    const services = getData('service_pricing') || [];
    
    content.innerHTML = `
        <div class="card">
            <div class="card-header">
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                    <h3 class="card-title" style="margin: 0;">
                        <i class="fas fa-tags"></i>
                        تسعير الخدمات
                    </h3>
                    <button class="btn btn-primary" onclick="openServicePricingModal()">
                        <i class="fas fa-plus"></i>
                        إضافة خدمة
                    </button>
                </div>
            </div>
            
            <div style="padding: 20px;">
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon primary">
                            <i class="fas fa-list"></i>
                        </div>
                        <div class="stat-content">
                            <h3>إجمالي الخدمات</h3>
                            <div class="stat-value">${services.length}</div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon success">
                            <i class="fas fa-plane"></i>
                        </div>
                        <div class="stat-content">
                            <h3>خدمات الطيران</h3>
                            <div class="stat-value">${services.filter(s => s.category === 'flight').length}</div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon warning">
                            <i class="fas fa-hotel"></i>
                        </div>
                        <div class="stat-content">
                            <h3>خدمات الفنادق</h3>
                            <div class="stat-value">${services.filter(s => s.category === 'hotel').length}</div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon info">
                            <i class="fas fa-passport"></i>
                        </div>
                        <div class="stat-content">
                            <h3>خدمات التأشيرات</h3>
                            <div class="stat-value">${services.filter(s => s.category === 'visa').length}</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th>اسم الخدمة</th>
                            <th>الفئة</th>
                            <th>الوصف</th>
                            <th>السعر (YER)</th>
                            <th>السعر (SAR)</th>
                            <th>السعر (USD)</th>
                            <th>الحالة</th>
                            <th>إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${services.length === 0 ? 
                            '<tr><td colspan="8" style="text-align: center; padding: 40px;">لا توجد خدمات</td></tr>' : 
                            services.map(service => renderServiceRow(service)).join('')
                        }
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- نموذج إضافة/تعديل خدمة -->
        <div id="servicePricingModal" class="modal">
            <div class="modal-content" style="max-width: 700px;">
                <div class="modal-header">
                    <h3 id="servicePricingModalTitle">إضافة خدمة جديدة</h3>
                    <button onclick="hideModal('servicePricingModal')" class="close-btn">×</button>
                </div>
                <form onsubmit="saveServicePricing(event)">
                    <input type="hidden" id="serviceId">
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="serviceName">اسم الخدمة *</label>
                            <input type="text" id="serviceName" class="form-control" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="serviceCategory">الفئة *</label>
                            <select id="serviceCategory" class="form-control" required>
                                <option value="">اختر الفئة</option>
                                <option value="flight">خدمات الطيران</option>
                                <option value="hotel">خدمات الفنادق</option>
                                <option value="visa">خدمات التأشيرات</option>
                                <option value="hajj">خدمات الحج</option>
                                <option value="umrah">خدمات العمرة</option>
                                <option value="transport">خدمات النقل</option>
                                <option value="tour">خدمات سياحية</option>
                                <option value="other">أخرى</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="serviceDescription">الوصف</label>
                        <textarea id="serviceDescription" class="form-control" rows="2"></textarea>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="servicePriceYER">السعر (ريال يمني) *</label>
                            <input type="number" id="servicePriceYER" class="form-control" min="0" step="0.01" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="servicePriceSAR">السعر (ريال سعودي)</label>
                            <input type="number" id="servicePriceSAR" class="form-control" min="0" step="0.01">
                        </div>
                        
                        <div class="form-group">
                            <label for="servicePriceUSD">السعر (دولار أمريكي)</label>
                            <input type="number" id="servicePriceUSD" class="form-control" min="0" step="0.01">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="serviceStatus">الحالة</label>
                        <select id="serviceStatus" class="form-control">
                            <option value="active">نشط</option>
                            <option value="inactive">غير نشط</option>
                        </select>
                    </div>
                    
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="hideModal('servicePricingModal')">إلغاء</button>
                        <button type="submit" class="btn btn-primary">حفظ</button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

function renderServiceRow(service) {
    const categoryNames = {
        flight: 'خدمات الطيران',
        hotel: 'خدمات الفنادق',
        visa: 'خدمات التأشيرات',
        hajj: 'خدمات الحج',
        umrah: 'خدمات العمرة',
        transport: 'خدمات النقل',
        tour: 'خدمات سياحية',
        other: 'أخرى'
    };

    return `
        <tr>
            <td><strong>${service.name}</strong></td>
            <td><span class="badge badge-info">${categoryNames[service.category] || service.category}</span></td>
            <td>${service.description || '-'}</td>
            <td>${formatCurrency(service.price_YER || 0)}</td>
            <td>${service.price_SAR ? formatCurrency(service.price_SAR) : '-'}</td>
            <td>${service.price_USD ? formatCurrency(service.price_USD) : '-'}</td>
            <td>
                <span class="badge badge-${service.status === 'active' ? 'success' : 'secondary'}">
                    ${service.status === 'active' ? 'نشط' : 'غير نشط'}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editServicePricing('${service.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteServicePricing('${service.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `;
}

function openServicePricingModal() {
    document.getElementById('servicePricingModalTitle').textContent = 'إضافة خدمة جديدة';
    document.getElementById('serviceId').value = '';
    document.getElementById('serviceName').value = '';
    document.getElementById('serviceCategory').value = '';
    document.getElementById('serviceDescription').value = '';
    document.getElementById('servicePriceYER').value = '';
    document.getElementById('servicePriceSAR').value = '';
    document.getElementById('servicePriceUSD').value = '';
    document.getElementById('serviceStatus').value = 'active';
    
    showModal('servicePricingModal');
}

function editServicePricing(serviceId) {
    const service = findItem('service_pricing', serviceId);
    if (!service) return;
    
    document.getElementById('servicePricingModalTitle').textContent = 'تعديل الخدمة';
    document.getElementById('serviceId').value = service.id;
    document.getElementById('serviceName').value = service.name;
    document.getElementById('serviceCategory').value = service.category;
    document.getElementById('serviceDescription').value = service.description || '';
    document.getElementById('servicePriceYER').value = service.price_YER || 0;
    document.getElementById('servicePriceSAR').value = service.price_SAR || '';
    document.getElementById('servicePriceUSD').value = service.price_USD || '';
    document.getElementById('serviceStatus').value = service.status;
    
    showModal('servicePricingModal');
}

function saveServicePricing(event) {
    event.preventDefault();
    
    const id = document.getElementById('serviceId').value;
    const name = document.getElementById('serviceName').value;
    const category = document.getElementById('serviceCategory').value;
    const description = document.getElementById('serviceDescription').value;
    const priceYER = parseFloat(document.getElementById('servicePriceYER').value) || 0;
    const priceSAR = parseFloat(document.getElementById('servicePriceSAR').value) || 0;
    const priceUSD = parseFloat(document.getElementById('servicePriceUSD').value) || 0;
    const status = document.getElementById('serviceStatus').value;
    
    const service = {
        id: id || generateId(),
        name,
        category,
        description,
        price_YER: priceYER,
        price_SAR: priceSAR,
        price_USD: priceUSD,
        status,
        created_at: id ? findItem('service_pricing', id).created_at : Date.now(),
        updated_at: Date.now()
    };
    
    if (id) {
        updateItem('service_pricing', id, service);
        showAlert('تم تحديث الخدمة بنجاح', 'success');
    } else {
        addItem('service_pricing', service);
        showAlert('تم إضافة الخدمة بنجاح', 'success');
    }
    
    hideModal('servicePricingModal');
    loadServicePricing();
}

function deleteServicePricing(serviceId) {
    if (confirm('هل أنت متأكد من حذف هذه الخدمة؟')) {
        deleteItem('service_pricing', serviceId);
        showAlert('تم حذف الخدمة بنجاح', 'success');
        loadServicePricing();
    }
}

/**
 * إضافة حقل اختيار الخدمة المسبقة في الفواتير والحجوزات
 * @param {string} selectId - معرف حقل الاختيار
 * @param {string} priceFieldId - معرف حقل السعر
 * @param {string} currencyFieldId - معرف حقل العملة
 */
function addServiceSelector(selectId, priceFieldId, currencyFieldId) {
    const select = document.getElementById(selectId);
    if (!select) {
        console.warn(`⚠️ لم يتم العثور على حقل الاختيار: ${selectId}`);
        return;
    }

    // الحصول على الخدمات النشطة
    const services = getData('service_pricing') || [];
    const activeServices = services.filter(s => s.status === 'active');

    // مسح الخيارات السابقة
    select.innerHTML = '<option value="">اختر خدمة مسبقة</option>';

    // تجميع الخدمات حسب الفئة
    const servicesByCategory = {};
    activeServices.forEach(service => {
        if (!servicesByCategory[service.category]) {
            servicesByCategory[service.category] = [];
        }
        servicesByCategory[service.category].push(service);
    });

    // إضافة الخيارات حسب الفئات
    const categoryNames = {
        flight: 'خدمات الطيران',
        hotel: 'خدمات الفنادق',
        visa: 'خدمات التأشيرات',
        hajj: 'خدمات الحج',
        umrah: 'خدمات العمرة',
        transport: 'خدمات النقل',
        tour: 'خدمات سياحية',
        other: 'أخرى'
    };

    Object.keys(servicesByCategory).forEach(category => {
        const optgroup = document.createElement('optgroup');
        optgroup.label = categoryNames[category] || category;
        
        servicesByCategory[category].forEach(service => {
            const option = document.createElement('option');
            option.value = service.id;
            option.textContent = service.name;
            option.dataset.priceYER = service.price_YER || 0;
            option.dataset.priceSAR = service.price_SAR || 0;
            option.dataset.priceUSD = service.price_USD || 0;
            optgroup.appendChild(option);
        });
        
        select.appendChild(optgroup);
    });

    // إضافة مستمع للتغيير
    select.addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        if (!selectedOption.value) return;

        const currencyField = document.getElementById(currencyFieldId);
        const priceField = document.getElementById(priceFieldId);
        
        if (currencyField && priceField) {
            const currency = currencyField.value || 'YER';
            const price = parseFloat(selectedOption.dataset[`price${currency}`]) || 0;
            priceField.value = price;
            
            // إضافة تأثير بصري
            priceField.style.background = '#e8f5e9';
            setTimeout(() => {
                priceField.style.background = '';
            }, 1000);
        }
    });

    console.log(`✓ تم إضافة محدد الخدمات لـ ${selectId}`);
}

/**
 * الحصول على سعر خدمة بعملة معينة
 * @param {string} serviceId - معرف الخدمة
 * @param {string} currency - العملة (YER, SAR, USD)
 * @returns {number} - السعر
 */
function getServicePrice(serviceId, currency = 'YER') {
    const service = findItem('service_pricing', serviceId);
    if (!service) return 0;
    
    return service[`price_${currency}`] || 0;
}

// تصدير الدوال
window.loadServicePricing = loadServicePricing;
window.openServicePricingModal = openServicePricingModal;
window.editServicePricing = editServicePricing;
window.saveServicePricing = saveServicePricing;
window.deleteServicePricing = deleteServicePricing;
window.addServiceSelector = addServiceSelector;
window.getServicePrice = getServicePrice;

console.log('✓ نظام تسعير الخدمات المسبق جاهز');
