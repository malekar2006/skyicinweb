// ========================================
// نظام استيراد البيانات الذكي لحقل البيان
// ========================================

/**
 * قائمة البيانات الشائعة حسب نوع المستند
 */
const COMMON_DESCRIPTIONS = {
    // سندات القبض
    receipt: [
        'قبض دفعة من حجز',
        'قبض دفعة من تذكرة',
        'قبض دفعة من فاتورة',
        'سداد مديونية',
        'دفعة مقدمة حجز',
        'دفعة مقدمة تأشيرة',
        'تسوية حساب',
        'قبض نقداً',
        'قبض بشيك',
        'تحويل بنكي'
    ],
    
    // سندات الصرف
    payment: [
        'صرف أجرة موظف',
        'صرف إيجار',
        'صرف كهرباء',
        'صرف مياه',
        'صرف اتصالات',
        'صرف رسوم حكومية',
        'دفعة لمورد',
        'صرف مصروفات إدارية',
        'صرف مصروفات تشغيلية',
        'صرف مصروفات صيانة'
    ],
    
    // الفواتير
    invoice: [
        'حجز تذكرة طيران',
        'حجز تأشيرة',
        'حجز فندق',
        'خدمات حج',
        'خدمات عمرة',
        'استخراج تأشيرة',
        'تجديد جواز',
        'خدمات نقل',
        'خدمات سياحية',
        'حجز رحلة'
    ],
    
    // القيود
    journal: [
        'قيد افتتاحي',
        'قيد تسوية',
        'قيد إقفال',
        'إثبات إيراد',
        'إثبات مصروف',
        'تحويل بين حسابات',
        'تسوية مصرفية',
        'تسوية نهاية الشهر',
        'تسوية نهاية السنة',
        'قيد تصحيحي'
    ],
    
    // الحجوزات
    booking: [
        'حجز رحلة طيران',
        'حجز حج',
        'حجز عمرة',
        'حجز فندق',
        'حجز تذكرة ذهاب',
        'حجز تذكرة ذهاب وعودة',
        'حجز طيران داخلي',
        'حجز طيران خارجي',
        'حجز باكج سياحي',
        'حجز رحلة عائلية'
    ]
};

/**
 * إضافة Datalist لحقل البيان
 * @param {string} inputId - معرف حقل الإدخال
 * @param {string} type - نوع المستند (receipt, payment, invoice, journal, booking)
 */
function addSmartDescriptionList(inputId, type) {
    const input = document.getElementById(inputId);
    if (!input) {
        console.warn(`⚠️ لم يتم العثور على الحقل: ${inputId}`);
        return;
    }

    // إنشاء datalist
    const datalistId = `${inputId}-datalist`;
    let datalist = document.getElementById(datalistId);
    
    if (!datalist) {
        datalist = document.createElement('datalist');
        datalist.id = datalistId;
        document.body.appendChild(datalist);
    }

    // مسح الخيارات السابقة
    datalist.innerHTML = '';

    // إضافة الخيارات من القائمة الشائعة
    const descriptions = COMMON_DESCRIPTIONS[type] || [];
    descriptions.forEach(desc => {
        const option = document.createElement('option');
        option.value = desc;
        datalist.appendChild(option);
    });

    // إضافة البيانات السابقة للمستخدم
    const previousDescriptions = getPreviousDescriptions(type);
    previousDescriptions.forEach(desc => {
        // تجنب التكرار
        if (!descriptions.includes(desc)) {
            const option = document.createElement('option');
            option.value = desc;
            datalist.appendChild(option);
        }
    });

    // ربط datalist بال input
    input.setAttribute('list', datalistId);
    
    console.log(`✓ تم إضافة قائمة ذكية لحقل ${inputId}`);
}

/**
 * الحصول على البيانات السابقة للمستخدم
 * @param {string} type - نوع المستند
 * @returns {Array} - قائمة البيانات الفريدة
 */
function getPreviousDescriptions(type) {
    const descriptions = [];
    
    try {
        switch (type) {
            case 'receipt':
            case 'payment':
                const vouchers = getData('vouchers') || [];
                vouchers.forEach(v => {
                    if (v.description && !descriptions.includes(v.description)) {
                        descriptions.push(v.description);
                    }
                });
                break;
                
            case 'invoice':
                const invoices = getData('invoices') || [];
                invoices.forEach(inv => {
                    if (inv.items) {
                        inv.items.forEach(item => {
                            if (item.description && !descriptions.includes(item.description)) {
                                descriptions.push(item.description);
                            }
                        });
                    }
                });
                break;
                
            case 'journal':
                const journalEntries = getData('journal_entries') || [];
                journalEntries.forEach(entry => {
                    if (entry.description && !descriptions.includes(entry.description)) {
                        descriptions.push(entry.description);
                    }
                });
                break;
                
            case 'booking':
                const bookings = getData('bookings') || [];
                bookings.forEach(booking => {
                    if (booking.service_details && !descriptions.includes(booking.service_details)) {
                        descriptions.push(booking.service_details);
                    }
                });
                break;
        }
    } catch (error) {
        console.error('❌ خطأ في جلب البيانات السابقة:', error);
    }

    // ترتيب حسب التكرار (الأحدث أولاً)
    return descriptions.slice(0, 20); // أحدث 20 بيان
}

/**
 * إضافة أيقونة مساعدة بجانب حقل البيان
 * @param {string} inputId - معرف حقل الإدخال
 * @param {string} type - نوع المستند
 */
function addDescriptionHelper(inputId, type) {
    const input = document.getElementById(inputId);
    if (!input) return;

    // إنشاء زر المساعدة
    const helpBtn = document.createElement('button');
    helpBtn.type = 'button';
    helpBtn.className = 'btn btn-sm btn-info';
    helpBtn.style.marginRight = '5px';
    helpBtn.innerHTML = '<i class="fas fa-lightbulb"></i> اقتراحات';
    helpBtn.onclick = () => showDescriptionSuggestions(inputId, type);

    // إضافة الزر بجانب الحقل
    const parent = input.parentElement;
    if (parent) {
        parent.style.display = 'flex';
        parent.style.gap = '5px';
        parent.appendChild(helpBtn);
    }
}

/**
 * عرض نافذة الاقتراحات
 * @param {string} inputId - معرف حقل الإدخال
 * @param {string} type - نوع المستند
 */
function showDescriptionSuggestions(inputId, type) {
    const input = document.getElementById(inputId);
    if (!input) return;

    const descriptions = COMMON_DESCRIPTIONS[type] || [];
    const previousDescriptions = getPreviousDescriptions(type);

    let html = `
        <div class="modal-overlay" onclick="this.remove()">
            <div class="modal-content" onclick="event.stopPropagation()" style="max-width: 600px;">
                <div class="modal-header">
                    <h3>اقتراحات البيان</h3>
                    <button onclick="this.closest('.modal-overlay').remove()" class="close-btn">×</button>
                </div>
                <div class="modal-body" style="max-height: 400px; overflow-y: auto;">
    `;

    // البيانات الشائعة
    if (descriptions.length > 0) {
        html += `
            <h4 style="margin-bottom: 10px; color: var(--primary-color);">
                <i class="fas fa-star"></i> البيانات الشائعة
            </h4>
            <div style="display: grid; gap: 5px; margin-bottom: 20px;">
        `;
        descriptions.forEach(desc => {
            html += `
                <button class="btn btn-light" onclick="selectDescription('${inputId}', '${desc}'); this.closest('.modal-overlay').remove();" style="text-align: right;">
                    ${desc}
                </button>
            `;
        });
        html += `</div>`;
    }

    // البيانات السابقة
    if (previousDescriptions.length > 0) {
        html += `
            <h4 style="margin-bottom: 10px; color: var(--success-color);">
                <i class="fas fa-history"></i> البيانات السابقة
            </h4>
            <div style="display: grid; gap: 5px;">
        `;
        previousDescriptions.forEach(desc => {
            html += `
                <button class="btn btn-light" onclick="selectDescription('${inputId}', '${desc}'); this.closest('.modal-overlay').remove();" style="text-align: right;">
                    ${desc}
                </button>
            `;
        });
        html += `</div>`;
    }

    html += `
                </div>
            </div>
        </div>
    `;

    const modal = document.createElement('div');
    modal.innerHTML = html;
    document.body.appendChild(modal.firstElementChild);
}

/**
 * اختيار بيان من القائمة
 * @param {string} inputId - معرف حقل الإدخال
 * @param {string} description - البيان المختار
 */
function selectDescription(inputId, description) {
    const input = document.getElementById(inputId);
    if (input) {
        input.value = description;
        input.focus();
    }
}

/**
 * إضافة إكمال تلقائي ذكي لحقل البيان
 * @param {string} inputId - معرف حقل الإدخال
 * @param {string} type - نوع المستند
 */
function addSmartAutocomplete(inputId, type) {
    const input = document.getElementById(inputId);
    if (!input) return;

    // إضافة مستمع للكتابة
    input.addEventListener('input', function(e) {
        const value = e.target.value.toLowerCase();
        if (value.length < 2) return;

        // البحث في القوائم
        const allDescriptions = [
            ...(COMMON_DESCRIPTIONS[type] || []),
            ...getPreviousDescriptions(type)
        ];

        const matches = allDescriptions.filter(desc => 
            desc.toLowerCase().includes(value)
        );

        // عرض الاقتراحات
        if (matches.length > 0) {
            showAutocompleteResults(inputId, matches.slice(0, 5));
        }
    });
}

/**
 * عرض نتائج الإكمال التلقائي
 * @param {string} inputId - معرف حقل الإدخال
 * @param {Array} matches - القائمة المطابقة
 */
function showAutocompleteResults(inputId, matches) {
    const input = document.getElementById(inputId);
    if (!input) return;

    // إزالة القائمة السابقة
    const existingResults = document.getElementById(`${inputId}-autocomplete`);
    if (existingResults) existingResults.remove();

    // إنشاء قائمة الاقتراحات
    const resultsDiv = document.createElement('div');
    resultsDiv.id = `${inputId}-autocomplete`;
    resultsDiv.className = 'autocomplete-results';
    resultsDiv.style.cssText = `
        position: absolute;
        background: white;
        border: 1px solid #ddd;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        max-height: 200px;
        overflow-y: auto;
        z-index: 1000;
        width: ${input.offsetWidth}px;
    `;

    matches.forEach(match => {
        const item = document.createElement('div');
        item.className = 'autocomplete-item';
        item.textContent = match;
        item.style.cssText = `
            padding: 10px;
            cursor: pointer;
            border-bottom: 1px solid #eee;
        `;
        item.onmouseover = () => item.style.background = '#f5f5f5';
        item.onmouseout = () => item.style.background = 'white';
        item.onclick = () => {
            input.value = match;
            resultsDiv.remove();
        };
        resultsDiv.appendChild(item);
    });

    // وضع القائمة تحت الحقل
    input.parentElement.style.position = 'relative';
    input.parentElement.appendChild(resultsDiv);

    // إزالة القائمة عند النقر خارجها
    setTimeout(() => {
        document.addEventListener('click', function handler(e) {
            if (!resultsDiv.contains(e.target) && e.target !== input) {
                resultsDiv.remove();
                document.removeEventListener('click', handler);
            }
        });
    }, 100);
}

// تصدير الدوال
window.addSmartDescriptionList = addSmartDescriptionList;
window.addDescriptionHelper = addDescriptionHelper;
window.showDescriptionSuggestions = showDescriptionSuggestions;
window.selectDescription = selectDescription;
window.addSmartAutocomplete = addSmartAutocomplete;
window.COMMON_DESCRIPTIONS = COMMON_DESCRIPTIONS;

console.log('✓ نظام استيراد البيانات الذكي جاهز');
