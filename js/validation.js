/**
 * نظام التحقق الذكي من صحة العمليات المحاسبية
 * Smart Validation System for Accounting Operations
 * Version: 1.0.0
 */

// ========================================
// التحقق من صحة القيود المحاسبية
// ========================================

/**
 * التحقق من توازن القيد المحاسبي
 * @param {Array} items - عناصر القيد
 * @returns {Object} - نتيجة التحقق
 */
function validateJournalEntry(items) {
    const validation = {
        isValid: true,
        errors: [],
        warnings: [],
        totalDebit: 0,
        totalCredit: 0
    };

    // التحقق من وجود عناصر
    if (!items || items.length === 0) {
        validation.isValid = false;
        validation.errors.push('يجب إضافة حساب واحد على الأقل');
        return validation;
    }

    // التحقق من كل عنصر
    items.forEach((item, index) => {
        // التحقق من وجود حساب
        if (!item.account_id && !item.accountId) {
            validation.errors.push(`العنصر ${index + 1}: يجب اختيار حساب`);
            validation.isValid = false;
        }

        // التحقق من وجود مبلغ مدين أو دائن
        const debit = parseFloat(item.debit) || 0;
        const credit = parseFloat(item.credit) || 0;

        if (debit === 0 && credit === 0) {
            validation.errors.push(`العنصر ${index + 1}: يجب إدخال مبلغ مدين أو دائن`);
            validation.isValid = false;
        }

        // التحقق من عدم إدخال مبلغ مدين ودائن معاً
        if (debit > 0 && credit > 0) {
            validation.errors.push(`العنصر ${index + 1}: لا يمكن إدخال مبلغ مدين ودائن في نفس الوقت`);
            validation.isValid = false;
        }

        // التحقق من القيم السالبة
        if (debit < 0 || credit < 0) {
            validation.errors.push(`العنصر ${index + 1}: لا يمكن إدخال قيم سالبة`);
            validation.isValid = false;
        }

        validation.totalDebit += debit;
        validation.totalCredit += credit;
    });

    // التحقق من توازن القيد
    const difference = Math.abs(validation.totalDebit - validation.totalCredit);
    if (difference > 0.01) { // السماح بفارق صغير بسبب التقريب
        validation.isValid = false;
        validation.errors.push(
            `القيد غير متوازن: الفرق = ${difference.toFixed(2)} (المدين: ${validation.totalDebit.toFixed(2)}, الدائن: ${validation.totalCredit.toFixed(2)})`
        );
    }

    // تحذيرات إضافية
    if (items.length === 1) {
        validation.warnings.push('القيد يحتوي على حساب واحد فقط. تأكد من صحة المعاملة');
    }

    return validation;
}

/**
 * التحقق من صحة الفاتورة
 * @param {Object} invoice - بيانات الفاتورة
 * @returns {Object} - نتيجة التحقق
 */
function validateInvoice(invoice) {
    const validation = {
        isValid: true,
        errors: [],
        warnings: []
    };

    // التحقق من البيانات الأساسية
    if (!invoice.number || invoice.number.trim() === '') {
        validation.errors.push('يجب إدخال رقم الفاتورة');
        validation.isValid = false;
    }

    if (!invoice.date) {
        validation.errors.push('يجب تحديد تاريخ الفاتورة');
        validation.isValid = false;
    }

    // التحقق من العميل/المورد
    if (invoice.type === 'sales' && !invoice.customer_id) {
        validation.errors.push('يجب اختيار العميل');
        validation.isValid = false;
    }

    if (invoice.type === 'purchase' && !invoice.supplier_id) {
        validation.errors.push('يجب اختيار المورد');
        validation.isValid = false;
    }

    // التحقق من العملة
    if (!invoice.currency || !CURRENCIES[invoice.currency]) {
        validation.errors.push('يجب اختيار عملة صحيحة');
        validation.isValid = false;
    }

    // التحقق من الأصناف
    if (!invoice.items || invoice.items.length === 0) {
        validation.errors.push('يجب إضافة صنف واحد على الأقل');
        validation.isValid = false;
    } else {
        invoice.items.forEach((item, index) => {
            if (!item.description || item.description.trim() === '') {
                validation.errors.push(`الصنف ${index + 1}: يجب إدخال الوصف`);
                validation.isValid = false;
            }

            const quantity = parseFloat(item.quantity) || 0;
            const price = parseFloat(item.price) || 0;

            if (quantity <= 0) {
                validation.errors.push(`الصنف ${index + 1}: الكمية يجب أن تكون أكبر من صفر`);
                validation.isValid = false;
            }

            if (price <= 0) {
                validation.errors.push(`الصنف ${index + 1}: السعر يجب أن يكون أكبر من صفر`);
                validation.isValid = false;
            }
        });
    }

    // التحقق من المبالغ
    const subtotal = parseFloat(invoice.subtotal) || 0;
    const discount = parseFloat(invoice.discount) || 0;
    const tax = parseFloat(invoice.tax) || 0;
    const total = parseFloat(invoice.total) || 0;

    if (subtotal <= 0) {
        validation.errors.push('المجموع الفرعي يجب أن يكون أكبر من صفر');
        validation.isValid = false;
    }

    if (discount < 0) {
        validation.errors.push('الخصم لا يمكن أن يكون سالباً');
        validation.isValid = false;
    }

    if (discount > subtotal) {
        validation.warnings.push('الخصم أكبر من المجموع الفرعي');
    }

    if (tax < 0) {
        validation.errors.push('الضريبة لا يمكن أن تكون سالبة');
        validation.isValid = false;
    }

    if (total <= 0) {
        validation.errors.push('المبلغ الإجمالي يجب أن يكون أكبر من صفر');
        validation.isValid = false;
    }

    // التحقق من المبلغ المدفوع
    const paid = parseFloat(invoice.paid) || 0;
    if (paid < 0) {
        validation.errors.push('المبلغ المدفوع لا يمكن أن يكون سالباً');
        validation.isValid = false;
    }

    if (paid > total) {
        validation.warnings.push('المبلغ المدفوع أكبر من المبلغ الإجمالي');
    }

    return validation;
}

/**
 * التحقق من صحة السند
 * @param {Object} voucher - بيانات السند
 * @returns {Object} - نتيجة التحقق
 */
function validateVoucher(voucher) {
    const validation = {
        isValid: true,
        errors: [],
        warnings: []
    };

    // التحقق من البيانات الأساسية
    if (!voucher.number || voucher.number.trim() === '') {
        validation.errors.push('يجب إدخال رقم السند');
        validation.isValid = false;
    }

    if (!voucher.date) {
        validation.errors.push('يجب تحديد تاريخ السند');
        validation.isValid = false;
    }

    if (!voucher.type || (voucher.type !== 'receipt' && voucher.type !== 'payment')) {
        validation.errors.push('يجب تحديد نوع السند (قبض أو صرف)');
        validation.isValid = false;
    }

    // التحقق من العملة
    if (!voucher.currency || !CURRENCIES[voucher.currency]) {
        validation.errors.push('يجب اختيار عملة صحيحة');
        validation.isValid = false;
    }

    // التحقق من المبلغ
    const amount = parseFloat(voucher.amount) || 0;
    if (amount <= 0) {
        validation.errors.push('المبلغ يجب أن يكون أكبر من صفر');
        validation.isValid = false;
    }

    // التحقق من طريقة الدفع
    if (!voucher.payment_method) {
        validation.errors.push('يجب اختيار طريقة الدفع');
        validation.isValid = false;
    }

    // التحقق من البيان
    if (!voucher.description || voucher.description.trim() === '') {
        validation.warnings.push('يُنصح بإضافة بيان للسند');
    }

    // التحقق من الطرف المعني
    if (voucher.reference_type && !voucher.reference_id) {
        validation.warnings.push('تم تحديد نوع الطرف ولكن لم يتم اختيار الطرف');
    }

    return validation;
}

/**
 * التحقق من صحة الحجز
 * @param {Object} booking - بيانات الحجز
 * @returns {Object} - نتيجة التحقق
 */
function validateBooking(booking) {
    const validation = {
        isValid: true,
        errors: [],
        warnings: []
    };

    // التحقق من البيانات الأساسية
    if (!booking.number || booking.number.trim() === '') {
        validation.errors.push('يجب إدخال رقم الحجز');
        validation.isValid = false;
    }

    if (!booking.booking_date) {
        validation.errors.push('يجب تحديد تاريخ الحجز');
        validation.isValid = false;
    }

    if (!booking.travel_date) {
        validation.errors.push('يجب تحديد تاريخ السفر');
        validation.isValid = false;
    }

    // التحقق من أن تاريخ السفر بعد تاريخ الحجز
    if (booking.booking_date && booking.travel_date) {
        const bookingDate = new Date(booking.booking_date);
        const travelDate = new Date(booking.travel_date);
        
        if (travelDate < bookingDate) {
            validation.warnings.push('تاريخ السفر قبل تاريخ الحجز. تأكد من صحة التواريخ');
        }
    }

    // التحقق من العميل
    if (!booking.customer_id) {
        validation.errors.push('يجب اختيار العميل');
        validation.isValid = false;
    }

    // التحقق من نوع الحجز
    if (!booking.type) {
        validation.errors.push('يجب تحديد نوع الحجز');
        validation.isValid = false;
    }

    // التحقق من العملة
    if (!booking.currency || !CURRENCIES[booking.currency]) {
        validation.errors.push('يجب اختيار عملة صحيحة');
        validation.isValid = false;
    }

    // التحقق من المبالغ
    const amount = parseFloat(booking.amount) || 0;
    const paid = parseFloat(booking.paid) || 0;

    if (amount <= 0) {
        validation.errors.push('المبلغ الإجمالي يجب أن يكون أكبر من صفر');
        validation.isValid = false;
    }

    if (paid < 0) {
        validation.errors.push('المبلغ المدفوع لا يمكن أن يكون سالباً');
        validation.isValid = false;
    }

    if (paid > amount) {
        validation.warnings.push('المبلغ المدفوع أكبر من المبلغ الإجمالي');
    }

    return validation;
}

// ========================================
// دوال مساعدة لعرض نتائج التحقق
// ========================================

/**
 * عرض رسائل التحقق
 * @param {Object} validation - نتيجة التحقق
 * @param {string} title - عنوان الرسالة
 * @returns {boolean} - هل التحقق صحيح
 */
function showValidationMessages(validation, title = 'نتيجة التحقق') {
    if (!validation.isValid && validation.errors.length > 0) {
        const errorMessages = validation.errors.join('\n• ');
        showAlert(`${title}\n\nأخطاء:\n• ${errorMessages}`, 'danger');
        return false;
    }

    if (validation.warnings.length > 0) {
        const warningMessages = validation.warnings.join('\n• ');
        const confirmed = confirm(`${title}\n\nتحذيرات:\n• ${warningMessages}\n\nهل تريد المتابعة؟`);
        return confirmed;
    }

    return true;
}

/**
 * التحقق التلقائي من تاريخ المعاملة
 * @param {string} date - التاريخ
 * @returns {Object} - نتيجة التحقق
 */
function validateTransactionDate(date) {
    const validation = {
        isValid: true,
        warnings: []
    };

    if (!date) {
        return validation;
    }

    const transDate = new Date(date);
    const today = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    // تحذير إذا كان التاريخ في المستقبل
    if (transDate > today) {
        validation.warnings.push('التاريخ في المستقبل. تأكد من صحة التاريخ');
    }

    // تحذير إذا كان التاريخ قديم جداً
    if (transDate < oneMonthAgo) {
        validation.warnings.push('التاريخ قديم (أكثر من شهر). تأكد من صحة التاريخ');
    }

    return validation;
}

/**
 * التحقق من عدم تكرار رقم المستند
 * @param {string} type - نوع المستند (invoice, voucher, journal, booking)
 * @param {string} number - رقم المستند
 * @param {string} currentId - معرف المستند الحالي (للتجاهل عند التعديل)
 * @returns {boolean} - هل الرقم متكرر
 */
function isDuplicateNumber(type, number, currentId = null) {
    const storageKey = {
        'invoice': 'invoices',
        'voucher': 'vouchers',
        'journal': 'journal_entries',
        'booking': 'bookings'
    }[type];

    if (!storageKey) return false;

    const items = getData(storageKey) || [];
    return items.some(item => 
        item.number === number && item.id !== currentId
    );
}

// ========================================
// التحقق الشامل من سلامة البيانات
// ========================================

/**
 * فحص سلامة قاعدة البيانات
 * @returns {Object} - نتيجة الفحص
 */
function checkDatabaseIntegrity() {
    const report = {
        isHealthy: true,
        issues: [],
        warnings: [],
        stats: {
            accounts: 0,
            invoices: 0,
            vouchers: 0,
            journal_entries: 0,
            bookings: 0,
            customers: 0,
            suppliers: 0
        }
    };

    try {
        // فحص الحسابات
        const accounts = getData('accounts') || [];
        report.stats.accounts = accounts.length;

        // فحص الفواتير
        const invoices = getData('invoices') || [];
        report.stats.invoices = invoices.length;
        
        invoices.forEach((invoice, index) => {
            // التحقق من وجود العميل/المورد
            if (invoice.type === 'sales' && invoice.customer_id) {
                const customer = findItem('customers', invoice.customer_id);
                if (!customer) {
                    report.warnings.push(`الفاتورة ${invoice.number}: العميل غير موجود`);
                }
            }
            
            if (invoice.type === 'purchase' && invoice.supplier_id) {
                const supplier = findItem('suppliers', invoice.supplier_id);
                if (!supplier) {
                    report.warnings.push(`الفاتورة ${invoice.number}: المورد غير موجود`);
                }
            }
        });

        // فحص السندات
        const vouchers = getData('vouchers') || [];
        report.stats.vouchers = vouchers.length;

        // فحص القيود
        const journal_entries = getData('journal_entries') || [];
        report.stats.journal_entries = journal_entries.length;
        
        journal_entries.forEach(entry => {
            const validation = validateJournalEntry(entry.items);
            if (!validation.isValid) {
                report.issues.push(`القيد ${entry.number}: غير متوازن`);
                report.isHealthy = false;
            }
        });

        // فحص الحجوزات
        const bookings = getData('bookings') || [];
        report.stats.bookings = bookings.length;

        // فحص العملاء
        const customers = getData('customers') || [];
        report.stats.customers = customers.length;

        // فحص الموردين
        const suppliers = getData('suppliers') || [];
        report.stats.suppliers = suppliers.length;

    } catch (error) {
        report.isHealthy = false;
        report.issues.push(`خطأ في فحص البيانات: ${error.message}`);
    }

    return report;
}

console.log('✅ نظام التحقق الذكي جاهز - Smart Validation System Ready');
