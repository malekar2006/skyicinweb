// ========================================
// نظام الترحيل التلقائي للقيود المحاسبية
// ========================================

/**
 * نظام ذكي لترحيل القيود المحاسبية تلقائياً من الفواتير والسندات والحجوزات
 * يعمل بشكل تلقائي عند إنشاء أو تحديث العمليات
 */

// ========================================
// 1. ترحيل الفواتير
// ========================================

/**
 * ترحيل فاتورة بيع إلى قيد محاسبي
 * @param {Object} invoice - بيانات الفاتورة
 * @returns {string} - معرف القيد المُنشأ
 */
function autoPostSalesInvoice(invoice) {
    try {
        // التحقق من وجود الفاتورة
        if (!invoice || !invoice.id) {
            console.error('❌ فاتورة غير صالحة');
            return null;
        }

        // التحقق من عدم الترحيل المسبق
        const journalEntries = getData('journal_entries') || [];
        const existingEntry = journalEntries.find(entry => 
            entry.reference_type === 'invoice' && 
            entry.reference_id === invoice.id
        );
        
        if (existingEntry) {
            console.log('✓ الفاتورة مُرحّلة مسبقاً');
            return existingEntry.id;
        }

        // إنشاء القيد المحاسبي
        const journalEntry = {
            id: generateId(),
            date: invoice.date || new Date().toISOString().split('T')[0],
            description: `فاتورة بيع رقم ${invoice.number} - ${invoice.customer_name || 'عميل'}`,
            currency: invoice.currency || 'YER',
            reference_type: 'invoice',
            reference_id: invoice.id,
            items: [],
            created_at: Date.now(),
            updated_at: Date.now(),
            auto_posted: true // علامة الترحيل التلقائي
        };

        // نوع الدفع: نقداً أم آجل
        const isCash = invoice.payment_type === 'cash';
        const accountDebit = isCash ? '1111' : '1131'; // الصندوق أو المدينون

        // الطرف المدين: الصندوق/المدينون
        journalEntry.items.push({
            account_id: accountDebit,
            account_name: isCash ? 'الصندوق' : 'المدينون',
            debit: invoice.total || 0,
            credit: 0,
            currency: invoice.currency || 'YER'
        });

        // الطرف الدائن: إيرادات الخدمات
        journalEntry.items.push({
            account_id: '4111',
            account_name: 'إيرادات الخدمات',
            debit: 0,
            credit: invoice.total || 0,
            currency: invoice.currency || 'YER'
        });

        // حفظ القيد
        journalEntries.push(journalEntry);
        saveData('journal_entries', journalEntries);

        // تسجيل في سجل النشاط
        logActivity('journal_entry', 'create', `قيد تلقائي من فاتورة ${invoice.number}`);

        console.log('✓ تم ترحيل الفاتورة تلقائياً');
        return journalEntry.id;

    } catch (error) {
        console.error('❌ خطأ في ترحيل الفاتورة:', error);
        return null;
    }
}

/**
 * ترحيل فاتورة شراء إلى قيد محاسبي
 */
function autoPostPurchaseInvoice(invoice) {
    try {
        if (!invoice || !invoice.id) {
            console.error('❌ فاتورة غير صالحة');
            return null;
        }

        const journalEntries = getData('journal_entries') || [];
        const existingEntry = journalEntries.find(entry => 
            entry.reference_type === 'invoice' && 
            entry.reference_id === invoice.id
        );
        
        if (existingEntry) {
            console.log('✓ الفاتورة مُرحّلة مسبقاً');
            return existingEntry.id;
        }

        const journalEntry = {
            id: generateId(),
            date: invoice.date || new Date().toISOString().split('T')[0],
            description: `فاتورة شراء رقم ${invoice.number} - ${invoice.supplier_name || 'مورد'}`,
            currency: invoice.currency || 'YER',
            reference_type: 'invoice',
            reference_id: invoice.id,
            items: [],
            created_at: Date.now(),
            updated_at: Date.now(),
            auto_posted: true
        };

        const isCash = invoice.payment_type === 'cash';
        const accountCredit = isCash ? '1111' : '2111'; // الصندوق أو الدائنون

        // الطرف المدين: مصروفات الخدمات
        journalEntry.items.push({
            account_id: '5111',
            account_name: 'مصروفات الخدمات',
            debit: invoice.total || 0,
            credit: 0,
            currency: invoice.currency || 'YER'
        });

        // الطرف الدائن: الصندوق/الدائنون
        journalEntry.items.push({
            account_id: accountCredit,
            account_name: isCash ? 'الصندوق' : 'الدائنون',
            debit: 0,
            credit: invoice.total || 0,
            currency: invoice.currency || 'YER'
        });

        journalEntries.push(journalEntry);
        saveData('journal_entries', journalEntries);

        logActivity('journal_entry', 'create', `قيد تلقائي من فاتورة شراء ${invoice.number}`);

        console.log('✓ تم ترحيل فاتورة الشراء تلقائياً');
        return journalEntry.id;

    } catch (error) {
        console.error('❌ خطأ في ترحيل فاتورة الشراء:', error);
        return null;
    }
}

// ========================================
// 2. ترحيل السندات
// ========================================

/**
 * ترحيل سند قبض إلى قيد محاسبي
 */
function autoPostReceiptVoucher(voucher) {
    try {
        if (!voucher || !voucher.id) {
            console.error('❌ سند غير صالح');
            return null;
        }

        const journalEntries = getData('journal_entries') || [];
        const existingEntry = journalEntries.find(entry => 
            entry.reference_type === 'voucher' && 
            entry.reference_id === voucher.id
        );
        
        if (existingEntry) {
            console.log('✓ السند مُرحّل مسبقاً');
            return existingEntry.id;
        }

        const journalEntry = {
            id: generateId(),
            date: voucher.date || new Date().toISOString().split('T')[0],
            description: `سند قبض رقم ${voucher.number} - ${voucher.party_name || 'عميل'}`,
            currency: voucher.currency || 'YER',
            reference_type: 'voucher',
            reference_id: voucher.id,
            items: [],
            created_at: Date.now(),
            updated_at: Date.now(),
            auto_posted: true
        };

        // تحديد الحساب حسب طريقة الدفع
        let accountDebit = '1111'; // الصندوق افتراضياً
        let accountName = 'الصندوق';
        
        if (voucher.payment_method === 'bank') {
            accountDebit = '1112';
            accountName = 'البنك';
        } else if (voucher.payment_method === 'check') {
            accountDebit = '1113';
            accountName = 'الشيكات';
        }

        // الطرف المدين: الصندوق/البنك/الشيكات
        journalEntry.items.push({
            account_id: accountDebit,
            account_name: accountName,
            debit: voucher.amount || 0,
            credit: 0,
            currency: voucher.currency || 'YER'
        });

        // الطرف الدائن: المدينون أو العملاء
        journalEntry.items.push({
            account_id: '1131',
            account_name: 'المدينون',
            debit: 0,
            credit: voucher.amount || 0,
            currency: voucher.currency || 'YER'
        });

        journalEntries.push(journalEntry);
        saveData('journal_entries', journalEntries);

        logActivity('journal_entry', 'create', `قيد تلقائي من سند قبض ${voucher.number}`);

        console.log('✓ تم ترحيل سند القبض تلقائياً');
        return journalEntry.id;

    } catch (error) {
        console.error('❌ خطأ في ترحيل سند القبض:', error);
        return null;
    }
}

/**
 * ترحيل سند صرف إلى قيد محاسبي
 */
function autoPostPaymentVoucher(voucher) {
    try {
        if (!voucher || !voucher.id) {
            console.error('❌ سند غير صالح');
            return null;
        }

        const journalEntries = getData('journal_entries') || [];
        const existingEntry = journalEntries.find(entry => 
            entry.reference_type === 'voucher' && 
            entry.reference_id === voucher.id
        );
        
        if (existingEntry) {
            console.log('✓ السند مُرحّل مسبقاً');
            return existingEntry.id;
        }

        const journalEntry = {
            id: generateId(),
            date: voucher.date || new Date().toISOString().split('T')[0],
            description: `سند صرف رقم ${voucher.number} - ${voucher.party_name || 'مورد'}`,
            currency: voucher.currency || 'YER',
            reference_type: 'voucher',
            reference_id: voucher.id,
            items: [],
            created_at: Date.now(),
            updated_at: Date.now(),
            auto_posted: true
        };

        // تحديد الحساب حسب طريقة الدفع
        let accountCredit = '1111'; // الصندوق افتراضياً
        let accountName = 'الصندوق';
        
        if (voucher.payment_method === 'bank') {
            accountCredit = '1112';
            accountName = 'البنك';
        } else if (voucher.payment_method === 'check') {
            accountCredit = '1113';
            accountName = 'الشيكات';
        }

        // الطرف المدين: الدائنون أو الموردون
        journalEntry.items.push({
            account_id: '2111',
            account_name: 'الدائنون',
            debit: voucher.amount || 0,
            credit: 0,
            currency: voucher.currency || 'YER'
        });

        // الطرف الدائن: الصندوق/البنك/الشيكات
        journalEntry.items.push({
            account_id: accountCredit,
            account_name: accountName,
            debit: 0,
            credit: voucher.amount || 0,
            currency: voucher.currency || 'YER'
        });

        journalEntries.push(journalEntry);
        saveData('journal_entries', journalEntries);

        logActivity('journal_entry', 'create', `قيد تلقائي من سند صرف ${voucher.number}`);

        console.log('✓ تم ترحيل سند الصرف تلقائياً');
        return journalEntry.id;

    } catch (error) {
        console.error('❌ خطأ في ترحيل سند الصرف:', error);
        return null;
    }
}

// ========================================
// 3. ترحيل الحجوزات
// ========================================

/**
 * ترحيل حجز إلى قيد محاسبي (عند التأكيد)
 */
function autoPostBooking(booking) {
    try {
        if (!booking || !booking.id) {
            console.error('❌ حجز غير صالح');
            return null;
        }

        // فقط الحجوزات المؤكدة
        if (booking.status !== 'confirmed') {
            console.log('⏳ الحجز غير مؤكد - لن يتم الترحيل');
            return null;
        }

        const journalEntries = getData('journal_entries') || [];
        const existingEntry = journalEntries.find(entry => 
            entry.reference_type === 'booking' && 
            entry.reference_id === booking.id
        );
        
        if (existingEntry) {
            console.log('✓ الحجز مُرحّل مسبقاً');
            return existingEntry.id;
        }

        const journalEntry = {
            id: generateId(),
            date: booking.booking_date || new Date().toISOString().split('T')[0],
            description: `حجز ${booking.type_name || 'خدمة'} رقم ${booking.number} - ${booking.customer_name || 'عميل'}`,
            currency: booking.currency || 'YER',
            reference_type: 'booking',
            reference_id: booking.id,
            items: [],
            created_at: Date.now(),
            updated_at: Date.now(),
            auto_posted: true
        };

        // الطرف المدين: الصندوق (المبلغ المدفوع)
        if (booking.paid_amount && booking.paid_amount > 0) {
            journalEntry.items.push({
                account_id: '1111',
                account_name: 'الصندوق',
                debit: booking.paid_amount,
                credit: 0,
                currency: booking.currency || 'YER'
            });
        }

        // الطرف المدين: المدينون (المبلغ المتبقي)
        const remaining = (booking.total_amount || 0) - (booking.paid_amount || 0);
        if (remaining > 0) {
            journalEntry.items.push({
                account_id: '1131',
                account_name: 'المدينون',
                debit: remaining,
                credit: 0,
                currency: booking.currency || 'YER'
            });
        }

        // الطرف الدائن: إيرادات الخدمات
        journalEntry.items.push({
            account_id: '4111',
            account_name: 'إيرادات الخدمات',
            debit: 0,
            credit: booking.total_amount || 0,
            currency: booking.currency || 'YER'
        });

        journalEntries.push(journalEntry);
        saveData('journal_entries', journalEntries);

        logActivity('journal_entry', 'create', `قيد تلقائي من حجز ${booking.number}`);

        console.log('✓ تم ترحيل الحجز تلقائياً');
        return journalEntry.id;

    } catch (error) {
        console.error('❌ خطأ في ترحيل الحجز:', error);
        return null;
    }
}

// ========================================
// 4. دوال مساعدة
// ========================================

/**
 * حذف قيد تلقائي عند حذف المستند الأصلي
 */
function deleteAutoPostedEntry(referenceType, referenceId) {
    try {
        const journalEntries = getData('journal_entries') || [];
        const entryIndex = journalEntries.findIndex(entry => 
            entry.reference_type === referenceType && 
            entry.reference_id === referenceId &&
            entry.auto_posted === true
        );

        if (entryIndex !== -1) {
            journalEntries.splice(entryIndex, 1);
            saveData('journal_entries', journalEntries);
            console.log('✓ تم حذف القيد التلقائي');
            return true;
        }

        return false;
    } catch (error) {
        console.error('❌ خطأ في حذف القيد التلقائي:', error);
        return false;
    }
}

/**
 * تحديث قيد تلقائي عند تحديث المستند الأصلي
 */
function updateAutoPostedEntry(referenceType, referenceId, newData) {
    try {
        // حذف القيد القديم
        deleteAutoPostedEntry(referenceType, referenceId);
        
        // إنشاء قيد جديد
        switch (referenceType) {
            case 'invoice':
                if (newData.type === 'sales') {
                    return autoPostSalesInvoice(newData);
                } else {
                    return autoPostPurchaseInvoice(newData);
                }
            case 'voucher':
                if (newData.type === 'receipt') {
                    return autoPostReceiptVoucher(newData);
                } else {
                    return autoPostPaymentVoucher(newData);
                }
            case 'booking':
                return autoPostBooking(newData);
            default:
                console.error('❌ نوع مستند غير معروف');
                return null;
        }
    } catch (error) {
        console.error('❌ خطأ في تحديث القيد التلقائي:', error);
        return null;
    }
}

/**
 * الحصول على حالة الترحيل
 */
function getPostingStatus(referenceType, referenceId) {
    const journalEntries = getData('journal_entries') || [];
    const entry = journalEntries.find(e => 
        e.reference_type === referenceType && 
        e.reference_id === referenceId
    );
    
    return {
        posted: !!entry,
        entryId: entry ? entry.id : null,
        autoPosted: entry ? entry.auto_posted : false,
        date: entry ? entry.date : null
    };
}

// ========================================
// 5. تصدير الدوال
// ========================================

window.autoPostSalesInvoice = autoPostSalesInvoice;
window.autoPostPurchaseInvoice = autoPostPurchaseInvoice;
window.autoPostReceiptVoucher = autoPostReceiptVoucher;
window.autoPostPaymentVoucher = autoPostPaymentVoucher;
window.autoPostBooking = autoPostBooking;
window.deleteAutoPostedEntry = deleteAutoPostedEntry;
window.updateAutoPostedEntry = updateAutoPostedEntry;
window.getPostingStatus = getPostingStatus;

console.log('✓ نظام الترحيل التلقائي جاهز');
