/**
 * إعادة تعيين بيانات مدير النظام - Sky Icon Travel & Tourism
 * Reset Admin Credentials
 */

// دالة إعادة تعيين بيانات دخول المسؤول
function resetAdminCredentials() {
    console.log('🔄 بدء إعادة تعيين بيانات المسؤول...');
    
    // إنشاء المستخدم المسؤول الافتراضي
    const defaultAdmin = {
        id: 'user_001',
        username: 'admin',
        password: 'admin123',
        fullName: 'مدير النظام',
        email: 'admin@skyicon.com',
        phone: '+967 777 180 875',
        role: 'admin',
        department: 'الإدارة',
        status: 'active',
        joinDate: '2024-01-01',
        lastLogin: Date.now(),
        permissions: ['all']
    };
    
    // الحصول على قائمة المستخدمين الحالية
    let users = [];
    try {
        const stored = localStorage.getItem('users');
        if (stored) {
            users = JSON.parse(stored);
        }
    } catch (e) {
        console.error('خطأ في قراءة المستخدمين:', e);
        users = [];
    }
    
    // البحث عن المسؤول الحالي وتحديثه أو إضافته
    const adminIndex = users.findIndex(u => u.username === 'admin' || u.role === 'admin' || u.id === 'user_001');
    
    if (adminIndex !== -1) {
        // تحديث المسؤول الموجود
        users[adminIndex] = defaultAdmin;
        console.log('✅ تم تحديث بيانات المسؤول الموجود');
    } else {
        // إضافة المسؤول كمستخدم جديد
        users.unshift(defaultAdmin);
        console.log('✅ تم إضافة المسؤول كمستخدم جديد');
    }
    
    // حفظ المستخدمين
    localStorage.setItem('users', JSON.stringify(users));
    
    console.log('✅ تم إعادة تعيين بيانات دخول المسؤول بنجاح');
    console.log('📋 بيانات الدخول الجديدة:');
    console.log('   اسم المستخدم: admin');
    console.log('   كلمة المرور: admin123');
    
    return true;
}

// دالة إعادة تعيين كاملة (حذف جميع المستخدمين وإنشاء المسؤول الافتراضي فقط)
function fullResetToDefault() {
    console.log('⚠️ تحذير: سيتم حذف جميع المستخدمين وإنشاء المسؤول الافتراضي فقط');
    
    if (confirm('هل أنت متأكد من حذف جميع المستخدمين؟\nسيتم الاحتفاظ بمسؤول النظام فقط بالبيانات الافتراضية.')) {
        // إنشاء قائمة المستخدمين الافتراضية
        const defaultUsers = [
            {
                id: 'user_001',
                username: 'admin',
                password: 'admin123',
                fullName: 'مدير النظام',
                email: 'admin@skyicon.com',
                phone: '+967 777 180 875',
                role: 'admin',
                department: 'الإدارة',
                status: 'active',
                joinDate: '2024-01-01',
                lastLogin: Date.now(),
                permissions: ['all']
            },
            {
                id: 'user_002',
                username: 'accountant',
                password: 'admin123',
                fullName: 'أحمد محمد',
                email: 'accountant@skyicon.com',
                phone: '+967 777 111 222',
                role: 'accountant',
                department: 'المحاسبة',
                status: 'active',
                joinDate: '2024-02-01',
                lastLogin: Date.now() - 86400000,
                permissions: ['view_financial', 'edit_financial', 'reports', 'manage_invoices', 'manage_vouchers']
            },
            {
                id: 'user_003',
                username: 'employee',
                password: 'admin123',
                fullName: 'فاطمة علي',
                email: 'employee@skyicon.com',
                phone: '+967 777 333 444',
                role: 'employee',
                department: 'الحجوزات',
                status: 'active',
                joinDate: '2024-03-01',
                lastLogin: Date.now() - 172800000,
                permissions: ['view_bookings', 'edit_bookings', 'view_customers']
            }
        ];
        
        // حفظ المستخدمين الافتراضيين
        localStorage.setItem('users', JSON.stringify(defaultUsers));
        
        // حذف الجلسة الحالية
        localStorage.removeItem('currentSession');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('rememberMe');
        
        console.log('✅ تم إعادة تعيين جميع المستخدمين إلى الإعدادات الافتراضية');
        console.log('📋 المستخدمون الافتراضيون:');
        console.log('   1. مدير النظام - admin / admin123');
        console.log('   2. محاسب - accountant / admin123');
        console.log('   3. موظف - employee / admin123');
        
        alert('تم إعادة تعيين النظام بنجاح!\n\nبيانات الدخول:\nاسم المستخدم: admin\nكلمة المرور: admin123\n\nسيتم تحديث الصفحة الآن...');
        
        // إعادة تحميل الصفحة
        setTimeout(() => {
            location.reload();
        }, 1000);
        
        return true;
    }
    
    return false;
}

// إتاحة الدوال في console للمطور
if (typeof window !== 'undefined') {
    window.resetAdminCredentials = resetAdminCredentials;
    window.fullResetToDefault = fullResetToDefault;
    
    console.log('🔑 دوال إعادة تعيين بيانات الدخول متاحة:');
    console.log('   - resetAdminCredentials() : إعادة تعيين بيانات مدير النظام فقط');
    console.log('   - fullResetToDefault() : إعادة تعيين كاملة لجميع المستخدمين');
}

// تنفيذ تلقائي عند تحميل الملف إذا كانت المعلمة موجودة في URL
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.get('reset') === 'admin') {
        console.log('🔄 تم اكتشاف معلمة reset=admin في URL');
        resetAdminCredentials();
        alert('تم إعادة تعيين بيانات دخول المسؤول!\n\nاسم المستخدم: admin\nكلمة المرور: admin123');
    }
    
    if (urlParams.get('reset') === 'full') {
        console.log('🔄 تم اكتشاف معلمة reset=full في URL');
        fullResetToDefault();
    }
});
