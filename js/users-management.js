/**
 * ==================================================
 * إدارة المستخدمين المتقدمة - Sky Icon v5.3
 * Advanced User Management System
 * ==================================================
 */

// الأدوار والصلاحيات المتاحة
const SYSTEM_ROLES = {
    admin: {
        label: 'مدير النظام',
        labelEn: 'System Administrator',
        permissions: ['all'],
        color: '#d32f2f',
        icon: 'fa-user-shield'
    },
    manager: {
        label: 'مدير',
        labelEn: 'Manager',
        permissions: ['view_all', 'edit_all', 'reports', 'manage_bookings', 'manage_invoices', 'manage_customers', 'manage_suppliers'],
        color: '#1976d2',
        icon: 'fa-user-tie'
    },
    accountant: {
        label: 'محاسب',
        labelEn: 'Accountant',
        permissions: ['view_financial', 'edit_financial', 'reports', 'manage_invoices', 'manage_vouchers', 'manage_journal'],
        color: '#388e3c',
        icon: 'fa-calculator'
    },
    employee: {
        label: 'موظف',
        labelEn: 'Employee',
        permissions: ['view_bookings', 'edit_bookings', 'view_customers', 'view_suppliers'],
        color: '#f57c00',
        icon: 'fa-user'
    },
    viewer: {
        label: 'مشاهد فقط',
        labelEn: 'Viewer',
        permissions: ['view_dashboard', 'view_reports'],
        color: '#757575',
        icon: 'fa-eye'
    }
};

// جميع الصلاحيات المتاحة
const ALL_PERMISSIONS = {
    // صلاحيات عامة
    'view_dashboard': 'عرض لوحة التحكم',
    'view_all': 'عرض جميع البيانات',
    'edit_all': 'تعديل جميع البيانات',
    'delete_data': 'حذف البيانات',
    
    // صلاحيات المالية
    'view_financial': 'عرض البيانات المالية',
    'edit_financial': 'تعديل البيانات المالية',
    'manage_accounts': 'إدارة دليل الحسابات',
    'manage_journal': 'إدارة القيود اليومية',
    'manage_invoices': 'إدارة الفواتير',
    'manage_vouchers': 'إدارة السندات',
    
    // صلاحيات الحجوزات
    'view_bookings': 'عرض الحجوزات',
    'edit_bookings': 'تعديل الحجوزات',
    'manage_bookings': 'إدارة الحجوزات كاملة',
    
    // صلاحيات العملاء والموردين
    'view_customers': 'عرض العملاء',
    'edit_customers': 'تعديل العملاء',
    'manage_customers': 'إدارة العملاء كاملة',
    'view_suppliers': 'عرض الموردين',
    'edit_suppliers': 'تعديل الموردين',
    'manage_suppliers': 'إدارة الموردين كاملة',
    
    // صلاحيات التقارير
    'view_reports': 'عرض التقارير',
    'reports': 'الوصول الكامل للتقارير',
    'export_reports': 'تصدير التقارير',
    
    // صلاحيات الإعدادات
    'manage_settings': 'إدارة الإعدادات',
    'manage_users': 'إدارة المستخدمين',
    'backup_restore': 'النسخ الاحتياطي',
    
    // صلاحية الوصول الكامل
    'all': 'جميع الصلاحيات'
};

/**
 * عرض صفحة إدارة المستخدمين
 */
function showUsersManagement() {
    const content = document.getElementById('content');
    const users = getData('users') || [];
    
    // إحصائيات
    const activeUsers = users.filter(u => u.status === 'active').length;
    const inactiveUsers = users.filter(u => u.status === 'inactive').length;
    const adminUsers = users.filter(u => u.role === 'admin').length;
    
    content.innerHTML = `
        <div class="page-header" style="background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h1 style="margin: 0 0 10px 0; font-size: 32px;">
                        <i class="fas fa-users-cog"></i>
                        إدارة المستخدمين
                    </h1>
                    <p style="margin: 0; opacity: 0.9; font-size: 16px;">
                        إدارة حسابات المستخدمين والصلاحيات ونظام الدخول
                    </p>
                </div>
                <button class="btn" style="background: white; color: #1976d2; font-weight: bold; padding: 12px 24px;" 
                    onclick="showAddUserModal()">
                    <i class="fas fa-user-plus"></i>
                    إضافة مستخدم جديد
                </button>
            </div>
        </div>

        <!-- الإحصائيات -->
        <div class="row" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px;">
            <div class="card" style="background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%); color: white; padding: 20px; border-radius: 10px;">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <div style="font-size: 40px; opacity: 0.9;">
                        <i class="fas fa-users"></i>
                    </div>
                    <div>
                        <div style="font-size: 28px; font-weight: bold;">${users.length}</div>
                        <div style="opacity: 0.9;">إجمالي المستخدمين</div>
                    </div>
                </div>
            </div>
            
            <div class="card" style="background: linear-gradient(135deg, #388e3c 0%, #2e7d32 100%); color: white; padding: 20px; border-radius: 10px;">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <div style="font-size: 40px; opacity: 0.9;">
                        <i class="fas fa-user-check"></i>
                    </div>
                    <div>
                        <div style="font-size: 28px; font-weight: bold;">${activeUsers}</div>
                        <div style="opacity: 0.9;">مستخدمون نشطون</div>
                    </div>
                </div>
            </div>
            
            <div class="card" style="background: linear-gradient(135deg, #f57c00 0%, #ef6c00 100%); color: white; padding: 20px; border-radius: 10px;">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <div style="font-size: 40px; opacity: 0.9;">
                        <i class="fas fa-user-slash"></i>
                    </div>
                    <div>
                        <div style="font-size: 28px; font-weight: bold;">${inactiveUsers}</div>
                        <div style="opacity: 0.9;">مستخدمون معطلون</div>
                    </div>
                </div>
            </div>
            
            <div class="card" style="background: linear-gradient(135deg, #d32f2f 0%, #c62828 100%); color: white; padding: 20px; border-radius: 10px;">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <div style="font-size: 40px; opacity: 0.9;">
                        <i class="fas fa-user-shield"></i>
                    </div>
                    <div>
                        <div style="font-size: 28px; font-weight: bold;">${adminUsers}</div>
                        <div style="opacity: 0.9;">مديرو النظام</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- جدول المستخدمين -->
        <div class="card">
            <div class="card-header" style="background: #f5f5f5; padding: 20px; border-bottom: 2px solid #e0e0e0;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="margin: 0; color: #333;">
                        <i class="fas fa-list"></i>
                        قائمة المستخدمين
                    </h3>
                    <div style="display: flex; gap: 10px;">
                        <input type="text" id="searchUsers" class="form-control" 
                            placeholder="بحث بالاسم أو اسم المستخدم..."
                            oninput="filterUsersTable(this.value)"
                            style="width: 300px;">
                        <select class="form-control" onchange="filterUsersByRole(this.value)" style="width: 200px;">
                            <option value="">جميع الأدوار</option>
                            ${Object.keys(SYSTEM_ROLES).map(role => 
                                `<option value="${role}">${SYSTEM_ROLES[role].label}</option>`
                            ).join('')}
                        </select>
                    </div>
                </div>
            </div>
            <div class="card-body" style="padding: 0;">
                <div class="table-responsive">
                    <table class="table" style="margin: 0;">
                        <thead style="background: #f9f9f9;">
                            <tr>
                                <th style="padding: 15px; font-weight: bold; color: #555;">#</th>
                                <th style="padding: 15px; font-weight: bold; color: #555;">المستخدم</th>
                                <th style="padding: 15px; font-weight: bold; color: #555;">الدور</th>
                                <th style="padding: 15px; font-weight: bold; color: #555;">البريد الإلكتروني</th>
                                <th style="padding: 15px; font-weight: bold; color: #555;">الهاتف</th>
                                <th style="padding: 15px; font-weight: bold; color: #555;">الحالة</th>
                                <th style="padding: 15px; font-weight: bold; color: #555;">تاريخ الانضمام</th>
                                <th style="padding: 15px; font-weight: bold; color: #555; text-align: center;">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody id="usersTableBody">
                            ${renderUsersTableRows(users)}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

/**
 * عرض صفوف جدول المستخدمين
 */
function renderUsersTableRows(users) {
    if (!users || users.length === 0) {
        return `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px; color: #999;">
                    <i class="fas fa-users" style="font-size: 48px; margin-bottom: 10px; display: block;"></i>
                    لا يوجد مستخدمون
                </td>
            </tr>
        `;
    }
    
    return users.map((user, index) => {
        const role = SYSTEM_ROLES[user.role] || SYSTEM_ROLES.viewer;
        const isActive = user.status === 'active';
        
        return `
            <tr style="border-bottom: 1px solid #e0e0e0;">
                <td style="padding: 15px;">${index + 1}</td>
                <td style="padding: 15px;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 45px; height: 45px; border-radius: 50%; background: ${role.color}; display: flex; align-items: center; justify-content: center; color: white; font-size: 18px;">
                            <i class="fas ${role.icon}"></i>
                        </div>
                        <div>
                            <div style="font-weight: bold; color: #333; margin-bottom: 3px;">${user.fullName}</div>
                            <div style="font-size: 12px; color: #999;">@${user.username}</div>
                        </div>
                    </div>
                </td>
                <td style="padding: 15px;">
                    <span style="background: ${role.color}; color: white; padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: bold;">
                        ${role.label}
                    </span>
                </td>
                <td style="padding: 15px; color: #666;">${user.email || '-'}</td>
                <td style="padding: 15px; color: #666; direction: ltr; text-align: right;">${user.phone || '-'}</td>
                <td style="padding: 15px;">
                    <span style="background: ${isActive ? '#4caf50' : '#f44336'}; color: white; padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: bold;">
                        <i class="fas fa-${isActive ? 'check-circle' : 'times-circle'}"></i>
                        ${isActive ? 'نشط' : 'معطل'}
                    </span>
                </td>
                <td style="padding: 15px; color: #666;">${formatDateShort(user.joinDate || user.createdAt)}</td>
                <td style="padding: 15px;">
                    <div style="display: flex; gap: 5px; justify-content: center;">
                        <button class="btn btn-sm btn-primary" onclick="editUser('${user.id}')" title="تعديل البيانات">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-warning" onclick="changeUserPassword('${user.id}')" title="تغيير كلمة المرور">
                            <i class="fas fa-key"></i>
                        </button>
                        <button class="btn btn-sm btn-info" onclick="manageUserPermissions('${user.id}')" title="إدارة الصلاحيات">
                            <i class="fas fa-shield-alt"></i>
                        </button>
                        ${user.role !== 'admin' ? `
                            <button class="btn btn-sm btn-${isActive ? 'secondary' : 'success'}" 
                                onclick="toggleUserStatus('${user.id}')" 
                                title="${isActive ? 'تعطيل الحساب' : 'تفعيل الحساب'}">
                                <i class="fas fa-${isActive ? 'ban' : 'check'}"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="deleteUser('${user.id}')" title="حذف المستخدم">
                                <i class="fas fa-trash"></i>
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * فلترة المستخدمين حسب النص
 */
function filterUsersTable(searchText) {
    const users = getData('users') || [];
    const filtered = users.filter(u => 
        u.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
        u.username.toLowerCase().includes(searchText.toLowerCase()) ||
        (u.email && u.email.toLowerCase().includes(searchText.toLowerCase()))
    );
    
    document.getElementById('usersTableBody').innerHTML = renderUsersTableRows(filtered);
}

/**
 * فلترة المستخدمين حسب الدور
 */
function filterUsersByRole(role) {
    const users = getData('users') || [];
    const filtered = role ? users.filter(u => u.role === role) : users;
    
    document.getElementById('usersTableBody').innerHTML = renderUsersTableRows(filtered);
}

/**
 * عرض نافذة إضافة مستخدم جديد
 */
function showAddUserModal() {
    const modal = `
        <div class="modal-overlay" id="userModal">
            <div class="modal-content" style="max-width: 800px;" onclick="event.stopPropagation()">
                <div class="modal-header" style="background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%); color: white;">
                    <h3 style="margin: 0;">
                        <i class="fas fa-user-plus"></i>
                        إضافة مستخدم جديد
                    </h3>
                    <button class="modal-close" onclick="closeModal('userModal')" style="color: white;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body" style="padding: 30px;">
                    <form id="addUserForm" onsubmit="handleAddUser(event)">
                        <div class="row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                            <div class="form-group">
                                <label style="font-weight: bold; color: #333; margin-bottom: 8px; display: block;">
                                    <i class="fas fa-user"></i>
                                    الاسم الكامل *
                                </label>
                                <input type="text" id="userFullName" class="form-control" required 
                                    placeholder="أدخل الاسم الكامل">
                            </div>
                            <div class="form-group">
                                <label style="font-weight: bold; color: #333; margin-bottom: 8px; display: block;">
                                    <i class="fas fa-at"></i>
                                    اسم المستخدم *
                                </label>
                                <input type="text" id="userUsername" class="form-control" required 
                                    placeholder="اسم المستخدم للدخول" pattern="[a-zA-Z0-9_]+" 
                                    title="حروف إنجليزية وأرقام فقط">
                            </div>
                        </div>
                        
                        <div class="row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                            <div class="form-group">
                                <label style="font-weight: bold; color: #333; margin-bottom: 8px; display: block;">
                                    <i class="fas fa-envelope"></i>
                                    البريد الإلكتروني
                                </label>
                                <input type="email" id="userEmail" class="form-control" 
                                    placeholder="example@email.com">
                            </div>
                            <div class="form-group">
                                <label style="font-weight: bold; color: #333; margin-bottom: 8px; display: block;">
                                    <i class="fas fa-phone"></i>
                                    رقم الهاتف
                                </label>
                                <input type="tel" id="userPhone" class="form-control" 
                                    placeholder="7xxxxxxxx">
                            </div>
                        </div>
                        
                        <div class="row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                            <div class="form-group">
                                <label style="font-weight: bold; color: #333; margin-bottom: 8px; display: block;">
                                    <i class="fas fa-user-tag"></i>
                                    الدور / المنصب *
                                </label>
                                <select id="userRole" class="form-control" required onchange="updateRolePermissions(this.value)">
                                    <option value="">-- اختر الدور --</option>
                                    ${Object.keys(SYSTEM_ROLES).map(role => 
                                        `<option value="${role}">${SYSTEM_ROLES[role].label}</option>`
                                    ).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label style="font-weight: bold; color: #333; margin-bottom: 8px; display: block;">
                                    <i class="fas fa-building"></i>
                                    القسم
                                </label>
                                <input type="text" id="userDepartment" class="form-control" 
                                    placeholder="المحاسبة، الحجوزات، الإدارة...">
                            </div>
                        </div>
                        
                        <div class="row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                            <div class="form-group">
                                <label style="font-weight: bold; color: #333; margin-bottom: 8px; display: block;">
                                    <i class="fas fa-lock"></i>
                                    كلمة المرور *
                                </label>
                                <input type="password" id="userPassword" class="form-control" required 
                                    placeholder="كلمة مرور قوية" minlength="6">
                            </div>
                            <div class="form-group">
                                <label style="font-weight: bold; color: #333; margin-bottom: 8px; display: block;">
                                    <i class="fas fa-lock"></i>
                                    تأكيد كلمة المرور *
                                </label>
                                <input type="password" id="userPasswordConfirm" class="form-control" required 
                                    placeholder="أعد كتابة كلمة المرور">
                            </div>
                        </div>
                        
                        <div class="form-group" style="margin-bottom: 20px;">
                            <label style="font-weight: bold; color: #333; margin-bottom: 8px; display: block;">
                                <i class="fas fa-shield-alt"></i>
                                الصلاحيات
                            </label>
                            <div id="rolePermissionsPreview" style="background: #f5f5f5; padding: 15px; border-radius: 8px; min-height: 100px;">
                                <p style="color: #999; text-align: center;">اختر الدور لعرض الصلاحيات</p>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                                <input type="checkbox" id="userActive" checked style="width: 20px; height: 20px;">
                                <span style="font-weight: bold; color: #333;">تفعيل الحساب فوراً</span>
                            </label>
                        </div>
                        
                        <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 30px; padding-top: 20px; border-top: 2px solid #e0e0e0;">
                            <button type="button" class="btn btn-secondary" onclick="closeModal('userModal')">
                                <i class="fas fa-times"></i>
                                إلغاء
                            </button>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-check"></i>
                                إضافة المستخدم
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modal);
    
    // إغلاق عند الضغط على الخلفية
    document.getElementById('userModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal('userModal');
        }
    });
}

/**
 * تحديث عرض صلاحيات الدور
 */
function updateRolePermissions(role) {
    const preview = document.getElementById('rolePermissionsPreview');
    if (!role || !SYSTEM_ROLES[role]) {
        preview.innerHTML = '<p style="color: #999; text-align: center;">اختر الدور لعرض الصلاحيات</p>';
        return;
    }
    
    const roleData = SYSTEM_ROLES[role];
    const permissions = roleData.permissions;
    
    if (permissions.includes('all')) {
        preview.innerHTML = `
            <div style="text-align: center; color: ${roleData.color};">
                <i class="fas fa-crown" style="font-size: 32px; margin-bottom: 10px;"></i>
                <div style="font-weight: bold; font-size: 16px;">جميع الصلاحيات</div>
                <div style="font-size: 14px; opacity: 0.8;">وصول كامل لجميع ميزات النظام</div>
            </div>
        `;
    } else {
        preview.innerHTML = `
            <div style="color: ${roleData.color}; font-weight: bold; margin-bottom: 10px;">
                <i class="fas ${roleData.icon}"></i>
                ${roleData.label}
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                ${permissions.map(perm => `
                    <div style="background: white; padding: 8px; border-radius: 5px; font-size: 13px;">
                        <i class="fas fa-check" style="color: #4caf50;"></i>
                        ${ALL_PERMISSIONS[perm] || perm}
                    </div>
                `).join('')}
            </div>
        `;
    }
}

/**
 * معالجة إضافة مستخدم جديد
 */
function handleAddUser(event) {
    event.preventDefault();
    
    const fullName = document.getElementById('userFullName').value.trim();
    const username = document.getElementById('userUsername').value.trim();
    const email = document.getElementById('userEmail').value.trim();
    const phone = document.getElementById('userPhone').value.trim();
    const role = document.getElementById('userRole').value;
    const department = document.getElementById('userDepartment').value.trim();
    const password = document.getElementById('userPassword').value;
    const passwordConfirm = document.getElementById('userPasswordConfirm').value;
    const isActive = document.getElementById('userActive').checked;
    
    // التحقق من البيانات
    if (!fullName || !username || !role || !password) {
        showNotification('يرجى ملء جميع الحقول المطلوبة', 'error');
        return;
    }
    
    if (password !== passwordConfirm) {
        showNotification('كلمة المرور غير متطابقة', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'error');
        return;
    }
    
    // التحقق من عدم تكرار اسم المستخدم
    const users = getData('users') || [];
    if (users.some(u => u.username === username)) {
        showNotification('اسم المستخدم موجود بالفعل', 'error');
        return;
    }
    
    // إنشاء المستخدم الجديد
    const newUser = {
        id: generateId(),
        username: username,
        password: btoa(password), // تشفير بسيط (يجب استخدام تشفير أقوى في الإنتاج)
        fullName: fullName,
        email: email,
        phone: phone,
        role: role,
        department: department || 'عام',
        status: isActive ? 'active' : 'inactive',
        permissions: SYSTEM_ROLES[role].permissions,
        createdAt: new Date().toISOString(),
        createdBy: getCurrentUser().id,
        joinDate: new Date().toISOString().split('T')[0],
        lastLogin: null
    };
    
    users.push(newUser);
    saveData('users', users);
    
    showNotification('تم إضافة المستخدم بنجاح', 'success');
    closeModal('userModal');
    showUsersManagement();
}

/**
 * تعديل مستخدم
 */
function editUser(userId) {
    const users = getData('users') || [];
    const user = users.find(u => u.id === userId);
    
    if (!user) {
        showNotification('المستخدم غير موجود', 'error');
        return;
    }
    
    const modal = `
        <div class="modal-overlay" id="editUserModal">
            <div class="modal-content" style="max-width: 700px;" onclick="event.stopPropagation()">
                <div class="modal-header" style="background: linear-gradient(135deg, #f57c00 0%, #ef6c00 100%); color: white;">
                    <h3 style="margin: 0;">
                        <i class="fas fa-user-edit"></i>
                        تعديل بيانات المستخدم
                    </h3>
                    <button class="modal-close" onclick="closeModal('editUserModal')" style="color: white;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body" style="padding: 30px;">
                    <form id="editUserForm" onsubmit="handleEditUser(event, '${userId}')">
                        <div class="row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                            <div class="form-group">
                                <label style="font-weight: bold; color: #333; margin-bottom: 8px; display: block;">
                                    <i class="fas fa-user"></i>
                                    الاسم الكامل *
                                </label>
                                <input type="text" id="editUserFullName" class="form-control" required 
                                    value="${user.fullName}">
                            </div>
                            <div class="form-group">
                                <label style="font-weight: bold; color: #333; margin-bottom: 8px; display: block;">
                                    <i class="fas fa-at"></i>
                                    اسم المستخدم *
                                </label>
                                <input type="text" id="editUserUsername" class="form-control" required 
                                    value="${user.username}" ${user.role === 'admin' ? 'readonly' : ''}>
                            </div>
                        </div>
                        
                        <div class="row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                            <div class="form-group">
                                <label style="font-weight: bold; color: #333; margin-bottom: 8px; display: block;">
                                    <i class="fas fa-envelope"></i>
                                    البريد الإلكتروني
                                </label>
                                <input type="email" id="editUserEmail" class="form-control" 
                                    value="${user.email || ''}">
                            </div>
                            <div class="form-group">
                                <label style="font-weight: bold; color: #333; margin-bottom: 8px; display: block;">
                                    <i class="fas fa-phone"></i>
                                    رقم الهاتف
                                </label>
                                <input type="tel" id="editUserPhone" class="form-control" 
                                    value="${user.phone || ''}">
                            </div>
                        </div>
                        
                        <div class="row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                            <div class="form-group">
                                <label style="font-weight: bold; color: #333; margin-bottom: 8px; display: block;">
                                    <i class="fas fa-user-tag"></i>
                                    الدور / المنصب *
                                </label>
                                <select id="editUserRole" class="form-control" required ${user.role === 'admin' ? 'disabled' : ''}>
                                    ${Object.keys(SYSTEM_ROLES).map(role => 
                                        `<option value="${role}" ${user.role === role ? 'selected' : ''}>${SYSTEM_ROLES[role].label}</option>`
                                    ).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label style="font-weight: bold; color: #333; margin-bottom: 8px; display: block;">
                                    <i class="fas fa-building"></i>
                                    القسم
                                </label>
                                <input type="text" id="editUserDepartment" class="form-control" 
                                    value="${user.department || ''}">
                            </div>
                        </div>
                        
                        <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 30px; padding-top: 20px; border-top: 2px solid #e0e0e0;">
                            <button type="button" class="btn btn-secondary" onclick="closeModal('editUserModal')">
                                <i class="fas fa-times"></i>
                                إلغاء
                            </button>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-check"></i>
                                حفظ التغييرات
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modal);
    
    document.getElementById('editUserModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal('editUserModal');
        }
    });
}

/**
 * معالجة تعديل المستخدم
 */
function handleEditUser(event, userId) {
    event.preventDefault();
    
    const users = getData('users') || [];
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
        showNotification('المستخدم غير موجود', 'error');
        return;
    }
    
    const fullName = document.getElementById('editUserFullName').value.trim();
    const username = document.getElementById('editUserUsername').value.trim();
    const email = document.getElementById('editUserEmail').value.trim();
    const phone = document.getElementById('editUserPhone').value.trim();
    const role = document.getElementById('editUserRole').value;
    const department = document.getElementById('editUserDepartment').value.trim();
    
    // تحديث البيانات
    users[userIndex] = {
        ...users[userIndex],
        fullName: fullName,
        username: username,
        email: email,
        phone: phone,
        role: role,
        department: department,
        permissions: SYSTEM_ROLES[role].permissions,
        updatedAt: new Date().toISOString(),
        updatedBy: getCurrentUser().id
    };
    
    saveData('users', users);
    
    showNotification('تم تحديث بيانات المستخدم بنجاح', 'success');
    closeModal('editUserModal');
    showUsersManagement();
}

/**
 * تغيير كلمة مرور مستخدم
 */
function changeUserPassword(userId) {
    const users = getData('users') || [];
    const user = users.find(u => u.id === userId);
    
    if (!user) {
        showNotification('المستخدم غير موجود', 'error');
        return;
    }
    
    const modal = `
        <div class="modal-overlay" id="changePasswordModal">
            <div class="modal-content" style="max-width: 500px;" onclick="event.stopPropagation()">
                <div class="modal-header" style="background: linear-gradient(135deg, #f57c00 0%, #ef6c00 100%); color: white;">
                    <h3 style="margin: 0;">
                        <i class="fas fa-key"></i>
                        تغيير كلمة المرور
                    </h3>
                    <button class="modal-close" onclick="closeModal('changePasswordModal')" style="color: white;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body" style="padding: 30px;">
                    <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                        <div style="font-weight: bold; color: #333; margin-bottom: 5px;">المستخدم:</div>
                        <div style="font-size: 18px; color: #1976d2;">${user.fullName} (@${user.username})</div>
                    </div>
                    
                    <form id="changePasswordForm" onsubmit="handleChangePassword(event, '${userId}')">
                        <div class="form-group" style="margin-bottom: 20px;">
                            <label style="font-weight: bold; color: #333; margin-bottom: 8px; display: block;">
                                <i class="fas fa-lock"></i>
                                كلمة المرور الجديدة *
                            </label>
                            <input type="password" id="newPassword" class="form-control" required 
                                placeholder="كلمة مرور قوية" minlength="6">
                        </div>
                        
                        <div class="form-group" style="margin-bottom: 20px;">
                            <label style="font-weight: bold; color: #333; margin-bottom: 8px; display: block;">
                                <i class="fas fa-lock"></i>
                                تأكيد كلمة المرور *
                            </label>
                            <input type="password" id="confirmNewPassword" class="form-control" required 
                                placeholder="أعد كتابة كلمة المرور">
                        </div>
                        
                        <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 12px; border-radius: 5px; margin-bottom: 20px;">
                            <i class="fas fa-exclamation-triangle" style="color: #ff9800;"></i>
                            <strong>تحذير:</strong> سيتم تغيير كلمة مرور هذا المستخدم وسيحتاج إلى استخدام كلمة المرور الجديدة عند تسجيل الدخول القادم.
                        </div>
                        
                        <div style="display: flex; gap: 10px; justify-content: flex-end;">
                            <button type="button" class="btn btn-secondary" onclick="closeModal('changePasswordModal')">
                                <i class="fas fa-times"></i>
                                إلغاء
                            </button>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-check"></i>
                                تغيير كلمة المرور
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modal);
    
    document.getElementById('changePasswordModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal('changePasswordModal');
        }
    });
}

/**
 * معالجة تغيير كلمة المرور
 */
function handleChangePassword(event, userId) {
    event.preventDefault();
    
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmNewPassword').value;
    
    if (newPassword !== confirmPassword) {
        showNotification('كلمة المرور غير متطابقة', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        showNotification('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'error');
        return;
    }
    
    const users = getData('users') || [];
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
        showNotification('المستخدم غير موجود', 'error');
        return;
    }
    
    users[userIndex].password = btoa(newPassword);
    users[userIndex].passwordChangedAt = new Date().toISOString();
    users[userIndex].passwordChangedBy = getCurrentUser().id;
    
    saveData('users', users);
    
    showNotification('تم تغيير كلمة المرور بنجاح', 'success');
    closeModal('changePasswordModal');
}

/**
 * إدارة صلاحيات مستخدم
 */
function manageUserPermissions(userId) {
    const users = getData('users') || [];
    const user = users.find(u => u.id === userId);
    
    if (!user) {
        showNotification('المستخدم غير موجود', 'error');
        return;
    }
    
    const roleData = SYSTEM_ROLES[user.role];
    const userPermissions = user.permissions || [];
    
    const modal = `
        <div class="modal-overlay" id="permissionsModal">
            <div class="modal-content" style="max-width: 900px;" onclick="event.stopPropagation()">
                <div class="modal-header" style="background: linear-gradient(135deg, #388e3c 0%, #2e7d32 100%); color: white;">
                    <h3 style="margin: 0;">
                        <i class="fas fa-shield-alt"></i>
                        إدارة صلاحيات المستخدم
                    </h3>
                    <button class="modal-close" onclick="closeModal('permissionsModal')" style="color: white;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body" style="padding: 30px;">
                    <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <div style="width: 60px; height: 60px; border-radius: 50%; background: ${roleData.color}; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px;">
                                <i class="fas ${roleData.icon}"></i>
                            </div>
                            <div>
                                <div style="font-size: 20px; font-weight: bold; color: #333; margin-bottom: 5px;">${user.fullName}</div>
                                <div style="color: #666;">@${user.username} • ${roleData.label}</div>
                            </div>
                        </div>
                    </div>
                    
                    ${userPermissions.includes('all') ? `
                        <div style="background: linear-gradient(135deg, #d32f2f 0%, #c62828 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
                            <i class="fas fa-crown" style="font-size: 48px; margin-bottom: 15px;"></i>
                            <h2 style="margin: 0 0 10px 0;">مدير النظام</h2>
                            <p style="margin: 0; font-size: 16px; opacity: 0.9;">هذا المستخدم لديه جميع الصلاحيات والوصول الكامل لكل ميزات النظام</p>
                        </div>
                    ` : `
                        <form id="permissionsForm" onsubmit="handleUpdatePermissions(event, '${userId}')">
                            <div style="margin-bottom: 20px;">
                                <h4 style="color: #333; margin-bottom: 15px;">
                                    <i class="fas fa-list-check"></i>
                                    الصلاحيات المتاحة
                                </h4>
                                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 10px;">
                                    ${Object.keys(ALL_PERMISSIONS).filter(p => p !== 'all').map(perm => {
                                        const isChecked = userPermissions.includes(perm);
                                        const isDefaultPerm = roleData.permissions.includes(perm);
                                        return `
                                            <label style="display: flex; align-items: center; gap: 10px; padding: 12px; background: ${isChecked ? '#e8f5e9' : 'white'}; border: 2px solid ${isChecked ? '#4caf50' : '#e0e0e0'}; border-radius: 8px; cursor: pointer; transition: all 0.3s;">
                                                <input type="checkbox" name="permissions" value="${perm}" 
                                                    ${isChecked ? 'checked' : ''} 
                                                    ${isDefaultPerm ? 'disabled' : ''}
                                                    style="width: 20px; height: 20px;">
                                                <div style="flex: 1;">
                                                    <div style="font-weight: bold; color: #333; font-size: 14px;">${ALL_PERMISSIONS[perm]}</div>
                                                    ${isDefaultPerm ? '<small style="color: #999;">(صلاحية افتراضية)</small>' : ''}
                                                </div>
                                            </label>
                                        `;
                                    }).join('')}
                                </div>
                            </div>
                            
                            <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 30px; padding-top: 20px; border-top: 2px solid #e0e0e0;">
                                <button type="button" class="btn btn-secondary" onclick="closeModal('permissionsModal')">
                                    <i class="fas fa-times"></i>
                                    إلغاء
                                </button>
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-check"></i>
                                    حفظ الصلاحيات
                                </button>
                            </div>
                        </form>
                    `}
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modal);
    
    document.getElementById('permissionsModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal('permissionsModal');
        }
    });
}

/**
 * معالجة تحديث الصلاحيات
 */
function handleUpdatePermissions(event, userId) {
    event.preventDefault();
    
    const users = getData('users') || [];
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
        showNotification('المستخدم غير موجود', 'error');
        return;
    }
    
    const formData = new FormData(event.target);
    const selectedPermissions = formData.getAll('permissions');
    
    // إضافة الصلاحيات الافتراضية للدور
    const rolePermissions = SYSTEM_ROLES[users[userIndex].role].permissions;
    const allPermissions = [...new Set([...rolePermissions, ...selectedPermissions])];
    
    users[userIndex].permissions = allPermissions;
    users[userIndex].permissionsUpdatedAt = new Date().toISOString();
    users[userIndex].permissionsUpdatedBy = getCurrentUser().id;
    
    saveData('users', users);
    
    showNotification('تم تحديث الصلاحيات بنجاح', 'success');
    closeModal('permissionsModal');
}

/**
 * تبديل حالة المستخدم (تفعيل/تعطيل)
 */
function toggleUserStatus(userId) {
    const users = getData('users') || [];
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
        showNotification('المستخدم غير موجود', 'error');
        return;
    }
    
    const user = users[userIndex];
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    const action = newStatus === 'active' ? 'تفعيل' : 'تعطيل';
    
    if (confirm(`هل أنت متأكد من ${action} حساب المستخدم "${user.fullName}"؟`)) {
        users[userIndex].status = newStatus;
        users[userIndex].statusChangedAt = new Date().toISOString();
        users[userIndex].statusChangedBy = getCurrentUser().id;
        
        saveData('users', users);
        
        showNotification(`تم ${action} الحساب بنجاح`, 'success');
        showUsersManagement();
    }
}

/**
 * حذف مستخدم
 */
function deleteUser(userId) {
    const users = getData('users') || [];
    const user = users.find(u => u.id === userId);
    
    if (!user) {
        showNotification('المستخدم غير موجود', 'error');
        return;
    }
    
    if (user.role === 'admin') {
        showNotification('لا يمكن حذف مدير النظام', 'error');
        return;
    }
    
    if (confirm(`هل أنت متأكد من حذف المستخدم "${user.fullName}"؟\n\nهذا الإجراء لا يمكن التراجع عنه!`)) {
        const filteredUsers = users.filter(u => u.id !== userId);
        saveData('users', filteredUsers);
        
        showNotification('تم حذف المستخدم بنجاح', 'success');
        showUsersManagement();
    }
}

/**
 * إغلاق النافذة المنبثقة
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.remove();
    }
}

/**
 * الحصول على المستخدم الحالي
 */
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser') || '{"id": "system", "fullName": "النظام"}');
}

// تهيئة الوحدة
console.log('✅ وحدة إدارة المستخدمين المتقدمة v5.3 جاهزة');
