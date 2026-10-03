/**
 * إدارة المستخدمين - Sky Icon Travel & Tourism
 * User Management System
 */

// قائمة المستخدمين
let users = [];

// الأدوار والصلاحيات
const userRoles = {
    admin: {
        label: 'مدير النظام',
        permissions: ['all'],
        color: 'danger'
    },
    manager: {
        label: 'مدير',
        permissions: ['view_all', 'edit_all', 'reports', 'manage_bookings', 'manage_invoices'],
        color: 'primary'
    },
    accountant: {
        label: 'محاسب',
        permissions: ['view_financial', 'edit_financial', 'reports', 'manage_invoices', 'manage_vouchers'],
        color: 'info'
    },
    employee: {
        label: 'موظف',
        permissions: ['view_bookings', 'edit_bookings', 'view_customers'],
        color: 'success'
    },
    viewer: {
        label: 'مشاهد',
        permissions: ['view_only'],
        color: 'secondary'
    }
};

// الصلاحيات المتاحة
const availablePermissions = {
    // صلاحيات عامة
    'view_dashboard': 'عرض لوحة التحكم',
    'view_all': 'عرض جميع البيانات',
    'edit_all': 'تعديل جميع البيانات',
    'delete_all': 'حذف البيانات',
    
    // صلاحيات المالية
    'view_financial': 'عرض البيانات المالية',
    'edit_financial': 'تعديل البيانات المالية',
    'manage_accounts': 'إدارة دليل الحسابات',
    'manage_journal': 'إدارة قيود اليومية',
    'manage_invoices': 'إدارة الفواتير',
    'manage_vouchers': 'إدارة السندات',
    
    // صلاحيات الحجوزات
    'view_bookings': 'عرض الحجوزات',
    'edit_bookings': 'تعديل الحجوزات',
    'manage_bookings': 'إدارة الحجوزات',
    
    // صلاحيات العملاء والموردين
    'view_customers': 'عرض العملاء',
    'edit_customers': 'تعديل العملاء',
    'view_suppliers': 'عرض الموردين',
    'edit_suppliers': 'تعديل الموردين',
    
    // صلاحيات التقارير
    'reports': 'عرض التقارير المالية',
    'print_reports': 'طباعة التقارير',
    
    // صلاحيات الإعدادات
    'manage_settings': 'إدارة الإعدادات',
    'manage_users': 'إدارة المستخدمين',
    'backup_restore': 'النسخ الاحتياطي والاستعادة'
};

// تهيئة إدارة المستخدمين
function initUsers() {
    loadUsers();
    console.log('✅ تم تحميل وحدة إدارة المستخدمين - عدد المستخدمين:', users.length);
}

// تحميل المستخدمين
function loadUsers() {
    const stored = localStorage.getItem('users');
    if (stored) {
        try {
            users = JSON.parse(stored);
        } catch(e) {
            console.error('خطأ في تحميل المستخدمين:', e);
            users = [];
        }
    }
    
    // إضافة مستخدمين افتراضيين إذا لم يكن هناك مستخدمون
    if (users.length === 0) {
        users = [
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
                permissions: userRoles.accountant.permissions
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
                permissions: userRoles.employee.permissions
            }
        ];
        saveUsers();
        console.log('✅ تم إنشاء المستخدمين الافتراضيين');
    }
}

// حفظ المستخدمين
function saveUsers() {
    localStorage.setItem('users', JSON.stringify(users));
}

// عرض صفحة إدارة المستخدمين
function showUsersManagement() {
    loadModulePage();
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = `
        <div class="page-header">
            <div class="header-content">
                <div>
                    <h1><i class="fas fa-users-cog"></i> إدارة المستخدمين</h1>
                    <p>إدارة حسابات المستخدمين والصلاحيات</p>
                </div>
                <div class="header-actions">
                    <button class="btn btn-secondary" onclick="showRolesPermissions()">
                        <i class="fas fa-shield-alt"></i>
                        الأدوار والصلاحيات
                    </button>
                    <button class="btn btn-primary" onclick="addNewUser()">
                        <i class="fas fa-user-plus"></i>
                        إضافة مستخدم جديد
                    </button>
                </div>
            </div>
        </div>

        <div class="users-stats">
            <div class="stat-card">
                <div class="stat-icon stat-primary">
                    <i class="fas fa-users"></i>
                </div>
                <div class="stat-content">
                    <h3>${users.length}</h3>
                    <p>إجمالي المستخدمين</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon stat-success">
                    <i class="fas fa-user-check"></i>
                </div>
                <div class="stat-content">
                    <h3>${users.filter(u => u.status === 'active').length}</h3>
                    <p>مستخدمون نشطون</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon stat-warning">
                    <i class="fas fa-user-clock"></i>
                </div>
                <div class="stat-content">
                    <h3>${users.filter(u => u.status === 'inactive').length}</h3>
                    <p>مستخدمون معطلون</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon stat-info">
                    <i class="fas fa-shield-alt"></i>
                </div>
                <div class="stat-content">
                    <h3>${Object.keys(userRoles).length}</h3>
                    <p>الأدوار المتاحة</p>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="card-header">
                <h3><i class="fas fa-list"></i> قائمة المستخدمين</h3>
                <div class="card-actions">
                    <input type="text" id="userSearchInput" class="search-input" placeholder="بحث..." 
                        onkeyup="filterUsers(this.value)">
                    <select class="form-control" onchange="filterUsersByRole(this.value)">
                        <option value="">جميع الأدوار</option>
                        ${Object.keys(userRoles).map(role => 
                            `<option value="${role}">${userRoles[role].label}</option>`
                        ).join('')}
                    </select>
                </div>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="data-table" id="usersTable">
                        <thead>
                            <tr>
                                <th>المستخدم</th>
                                <th>الدور</th>
                                <th>القسم</th>
                                <th>البريد الإلكتروني</th>
                                <th>الهاتف</th>
                                <th>الحالة</th>
                                <th>آخر دخول</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${renderUsersTable()}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

// عرض جدول المستخدمين
function renderUsersTable() {
    if (users.length === 0) {
        return `
            <tr>
                <td colspan="8" class="text-center">لا يوجد مستخدمون</td>
            </tr>
        `;
    }
    
    return users.map(user => `
        <tr>
            <td>
                <div class="user-cell">
                    <div class="user-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <div>
                        <strong>${user.fullName}</strong>
                        <small>@${user.username}</small>
                    </div>
                </div>
            </td>
            <td>
                <span class="badge badge-${userRoles[user.role]?.color || 'secondary'}">
                    ${userRoles[user.role]?.label || user.role}
                </span>
            </td>
            <td>${user.department}</td>
            <td>${user.email}</td>
            <td>${user.phone}</td>
            <td>
                <span class="badge badge-${user.status === 'active' ? 'success' : 'danger'}">
                    ${user.status === 'active' ? 'نشط' : 'معطل'}
                </span>
            </td>
            <td>${formatDateTime(user.lastLogin)}</td>
            <td>
                <div class="action-buttons">
                    ${getCurrentUserRole() === 'admin' ? `
                        <button class="btn-icon btn-success" onclick="changeUserCredentials('${user.id}')" title="تغيير بيانات الدخول">
                            <i class="fas fa-key"></i>
                        </button>
                    ` : ''}
                    <button class="btn-icon btn-primary" onclick="editUser('${user.id}')" title="تعديل">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-info" onclick="viewUserDetails('${user.id}')" title="التفاصيل">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon btn-warning" onclick="manageUserPermissions('${user.id}')" title="الصلاحيات">
                        <i class="fas fa-shield-alt"></i>
                    </button>
                    ${user.role !== 'admin' ? `
                        <button class="btn-icon btn-${user.status === 'active' ? 'secondary' : 'success'}" 
                            onclick="toggleUserStatus('${user.id}')" 
                            title="${user.status === 'active' ? 'تعطيل' : 'تفعيل'}">
                            <i class="fas fa-${user.status === 'active' ? 'ban' : 'check'}"></i>
                        </button>
                        <button class="btn-icon btn-danger" onclick="deleteUser('${user.id}')" title="حذف">
                            <i class="fas fa-trash"></i>
                        </button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `).join('');
}

// الحصول على دور المستخدم الحالي
function getCurrentUserRole() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return currentUser.role || '';
}

// إضافة مستخدم جديد
function addNewUser() {
    const modal = `
        <div class="modal-overlay" onclick="closeModal()">
            <div class="modal-content modal-lg" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3><i class="fas fa-user-plus"></i> إضافة مستخدم جديد</h3>
                    <button class="modal-close" onclick="closeModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <form id="addUserForm" onsubmit="handleAddUser(event)">
                    <div class="modal-body">
                        <div class="form-row">
                            <div class="form-group">
                                <label>الاسم الكامل *</label>
                                <input type="text" id="newUserFullName" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label>اسم المستخدم *</label>
                                <input type="text" id="newUserUsername" class="form-control" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>البريد الإلكتروني *</label>
                                <input type="email" id="newUserEmail" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label>رقم الهاتف *</label>
                                <input type="tel" id="newUserPhone" class="form-control" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>كلمة المرور *</label>
                                <input type="password" id="newUserPassword" class="form-control" required minlength="6">
                            </div>
                            <div class="form-group">
                                <label>تأكيد كلمة المرور *</label>
                                <input type="password" id="newUserConfirmPassword" class="form-control" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>الدور *</label>
                                <select id="newUserRole" class="form-control" required onchange="updatePermissionsPreview(this.value)">
                                    <option value="">اختر الدور</option>
                                    ${Object.keys(userRoles).map(role => 
                                        `<option value="${role}">${userRoles[role].label}</option>`
                                    ).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label>القسم *</label>
                                <input type="text" id="newUserDepartment" class="form-control" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>الصلاحيات</label>
                            <div id="permissionsPreview" class="permissions-preview">
                                <p class="text-muted">اختر الدور لعرض الصلاحيات</p>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="closeModal()">إلغاء</button>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i> إضافة المستخدم
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modal);
}

// معالجة إضافة مستخدم
function handleAddUser(event) {
    event.preventDefault();
    
    const fullName = document.getElementById('newUserFullName').value;
    const username = document.getElementById('newUserUsername').value;
    const email = document.getElementById('newUserEmail').value;
    const phone = document.getElementById('newUserPhone').value;
    const password = document.getElementById('newUserPassword').value;
    const confirmPassword = document.getElementById('newUserConfirmPassword').value;
    const role = document.getElementById('newUserRole').value;
    const department = document.getElementById('newUserDepartment').value;
    
    // التحقق من تطابق كلمة المرور
    if (password !== confirmPassword) {
        alert('كلمة المرور غير متطابقة!');
        return;
    }
    
    // التحقق من عدم تكرار اسم المستخدم
    if (users.some(u => u.username === username)) {
        alert('اسم المستخدم موجود مسبقاً!');
        return;
    }
    
    // إنشاء المستخدم الجديد
    const newUser = {
        id: generateId(),
        username,
        fullName,
        email,
        phone,
        role,
        department,
        status: 'active',
        joinDate: formatDate(new Date()),
        lastLogin: null,
        permissions: userRoles[role].permissions
    };
    
    users.push(newUser);
    saveUsers();
    closeModal();
    showUsersManagement();
    
    if (typeof addNotification === 'function') {
        addNotification('success', 'تم الإضافة', `تم إضافة المستخدم ${fullName} بنجاح`);
    }
}

// تعديل مستخدم
function editUser(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    const modal = `
        <div class="modal-overlay" onclick="closeModal()">
            <div class="modal-content modal-lg" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3><i class="fas fa-edit"></i> تعديل المستخدم</h3>
                    <button class="modal-close" onclick="closeModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <form id="editUserForm" onsubmit="handleEditUser(event, '${userId}')">
                    <div class="modal-body">
                        <div class="form-row">
                            <div class="form-group">
                                <label>الاسم الكامل *</label>
                                <input type="text" id="editUserFullName" class="form-control" value="${user.fullName}" required>
                            </div>
                            <div class="form-group">
                                <label>اسم المستخدم *</label>
                                <input type="text" id="editUserUsername" class="form-control" value="${user.username}" required ${user.role === 'admin' ? 'disabled' : ''}>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>البريد الإلكتروني *</label>
                                <input type="email" id="editUserEmail" class="form-control" value="${user.email}" required>
                            </div>
                            <div class="form-group">
                                <label>رقم الهاتف *</label>
                                <input type="tel" id="editUserPhone" class="form-control" value="${user.phone}" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>الدور *</label>
                                <select id="editUserRole" class="form-control" required ${user.role === 'admin' ? 'disabled' : ''}>
                                    ${Object.keys(userRoles).map(role => 
                                        `<option value="${role}" ${user.role === role ? 'selected' : ''}>${userRoles[role].label}</option>`
                                    ).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label>القسم *</label>
                                <input type="text" id="editUserDepartment" class="form-control" value="${user.department}" required>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="closeModal()">إلغاء</button>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i> حفظ التغييرات
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modal);
}

// معالجة تعديل مستخدم
function handleEditUser(event, userId) {
    event.preventDefault();
    
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    user.fullName = document.getElementById('editUserFullName').value;
    if (user.role !== 'admin') {
        user.username = document.getElementById('editUserUsername').value;
        user.role = document.getElementById('editUserRole').value;
        user.permissions = userRoles[user.role].permissions;
    }
    user.email = document.getElementById('editUserEmail').value;
    user.phone = document.getElementById('editUserPhone').value;
    user.department = document.getElementById('editUserDepartment').value;
    
    saveUsers();
    closeModal();
    showUsersManagement();
    
    if (typeof addNotification === 'function') {
        addNotification('success', 'تم التحديث', 'تم تحديث بيانات المستخدم بنجاح');
    }
}

// عرض تفاصيل المستخدم
function viewUserDetails(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    const modal = `
        <div class="modal-overlay" onclick="closeModal()">
            <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3><i class="fas fa-user"></i> تفاصيل المستخدم</h3>
                    <button class="modal-close" onclick="closeModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="user-details">
                        <div class="detail-row">
                            <label><i class="fas fa-user"></i> الاسم الكامل:</label>
                            <span>${user.fullName}</span>
                        </div>
                        <div class="detail-row">
                            <label><i class="fas fa-id-badge"></i> اسم المستخدم:</label>
                            <span>@${user.username}</span>
                        </div>
                        <div class="detail-row">
                            <label><i class="fas fa-envelope"></i> البريد الإلكتروني:</label>
                            <span>${user.email}</span>
                        </div>
                        <div class="detail-row">
                            <label><i class="fas fa-phone"></i> رقم الهاتف:</label>
                            <span>${user.phone}</span>
                        </div>
                        <div class="detail-row">
                            <label><i class="fas fa-shield-alt"></i> الدور:</label>
                            <span class="badge badge-${userRoles[user.role]?.color}">${userRoles[user.role]?.label}</span>
                        </div>
                        <div class="detail-row">
                            <label><i class="fas fa-building"></i> القسم:</label>
                            <span>${user.department}</span>
                        </div>
                        <div class="detail-row">
                            <label><i class="fas fa-calendar"></i> تاريخ الانضمام:</label>
                            <span>${formatDate(user.joinDate)}</span>
                        </div>
                        <div class="detail-row">
                            <label><i class="fas fa-clock"></i> آخر دخول:</label>
                            <span>${user.lastLogin ? formatDateTime(user.lastLogin) : 'لم يسجل دخول بعد'}</span>
                        </div>
                        <div class="detail-row">
                            <label><i class="fas fa-toggle-on"></i> الحالة:</label>
                            <span class="badge badge-${user.status === 'active' ? 'success' : 'danger'}">
                                ${user.status === 'active' ? 'نشط' : 'معطل'}
                            </span>
                        </div>
                    </div>
                    <div class="permissions-list">
                        <h4><i class="fas fa-key"></i> الصلاحيات</h4>
                        ${renderUserPermissions(user.permissions)}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeModal()">إغلاق</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modal);
}

// عرض صلاحيات المستخدم
function renderUserPermissions(permissions) {
    if (permissions.includes('all')) {
        return '<div class="permission-badge permission-all"><i class="fas fa-crown"></i> جميع الصلاحيات</div>';
    }
    
    return permissions.map(perm => 
        `<div class="permission-badge"><i class="fas fa-check"></i> ${availablePermissions[perm] || perm}</div>`
    ).join('');
}

// إدارة صلاحيات المستخدم
function manageUserPermissions(userId) {
    const user = users.find(u => u.id === userId);
    if (!user || user.role === 'admin') {
        alert('لا يمكن تعديل صلاحيات مدير النظام');
        return;
    }
    
    const modal = `
        <div class="modal-overlay" onclick="closeModal()">
            <div class="modal-content modal-lg" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3><i class="fas fa-shield-alt"></i> إدارة الصلاحيات - ${user.fullName}</h3>
                    <button class="modal-close" onclick="closeModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <form id="managePermissionsForm" onsubmit="handleUpdatePermissions(event, '${userId}')">
                    <div class="modal-body">
                        <div class="permissions-grid">
                            ${Object.entries(availablePermissions).map(([key, label]) => `
                                <label class="permission-checkbox">
                                    <input type="checkbox" name="permissions" value="${key}" 
                                        ${user.permissions.includes(key) ? 'checked' : ''}>
                                    <span>${label}</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="closeModal()">إلغاء</button>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i> حفظ الصلاحيات
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modal);
}

// معالجة تحديث الصلاحيات
function handleUpdatePermissions(event, userId) {
    event.preventDefault();
    
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    const checkboxes = event.target.querySelectorAll('input[name="permissions"]:checked');
    user.permissions = Array.from(checkboxes).map(cb => cb.value);
    
    saveUsers();
    closeModal();
    showUsersManagement();
    
    if (typeof addNotification === 'function') {
        addNotification('success', 'تم التحديث', 'تم تحديث صلاحيات المستخدم بنجاح');
    }
}

// تبديل حالة المستخدم
function toggleUserStatus(userId) {
    const user = users.find(u => u.id === userId);
    if (!user || user.role === 'admin') return;
    
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    const action = newStatus === 'active' ? 'تفعيل' : 'تعطيل';
    
    if (confirm(`هل تريد ${action} المستخدم ${user.fullName}؟`)) {
        user.status = newStatus;
        saveUsers();
        showUsersManagement();
        
        if (typeof addNotification === 'function') {
            addNotification('success', 'تم', `تم ${action} المستخدم بنجاح`);
        }
    }
}

// حذف مستخدم
function deleteUser(userId) {
    const user = users.find(u => u.id === userId);
    if (!user || user.role === 'admin') return;
    
    if (confirm(`هل تريد حذف المستخدم ${user.fullName}؟\nهذا الإجراء لا يمكن التراجع عنه.`)) {
        users = users.filter(u => u.id !== userId);
        saveUsers();
        showUsersManagement();
        
        if (typeof addNotification === 'function') {
            addNotification('success', 'تم الحذف', 'تم حذف المستخدم بنجاح');
        }
    }
}

// عرض الأدوار والصلاحيات
function showRolesPermissions() {
    loadModulePage();
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = `
        <div class="page-header">
            <div class="header-content">
                <div>
                    <h1><i class="fas fa-shield-alt"></i> الأدوار والصلاحيات</h1>
                    <p>عرض الأدوار المتاحة والصلاحيات المرتبطة بكل دور</p>
                </div>
                <div class="header-actions">
                    <button class="btn btn-secondary" onclick="showUsersManagement()">
                        <i class="fas fa-arrow-right"></i>
                        رجوع إلى المستخدمين
                    </button>
                </div>
            </div>
        </div>

        <div class="roles-grid">
            ${Object.entries(userRoles).map(([key, role]) => `
                <div class="role-card">
                    <div class="role-header role-${role.color}">
                        <div class="role-icon">
                            <i class="fas fa-shield-alt"></i>
                        </div>
                        <h3>${role.label}</h3>
                        <p class="role-key">@${key}</p>
                    </div>
                    <div class="role-body">
                        <h4>الصلاحيات:</h4>
                        <div class="role-permissions">
                            ${role.permissions.includes('all') ? 
                                '<div class="permission-item permission-all"><i class="fas fa-crown"></i> جميع الصلاحيات</div>' :
                                role.permissions.map(perm => 
                                    `<div class="permission-item"><i class="fas fa-check"></i> ${availablePermissions[perm] || perm}</div>`
                                ).join('')
                            }
                        </div>
                        <div class="role-stats">
                            <i class="fas fa-users"></i>
                            ${users.filter(u => u.role === key).length} مستخدم
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// تصفية المستخدمين
function filterUsers(searchTerm) {
    const tbody = document.querySelector('#usersTable tbody');
    const rows = tbody.querySelectorAll('tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm.toLowerCase()) ? '' : 'none';
    });
}

// تصفية حسب الدور
function filterUsersByRole(role) {
    const tbody = document.querySelector('#usersTable tbody');
    const rows = tbody.querySelectorAll('tr');
    
    rows.forEach(row => {
        if (!role) {
            row.style.display = '';
        } else {
            const roleCell = row.querySelector('td:nth-child(2)');
            row.style.display = roleCell && roleCell.textContent.includes(userRoles[role]?.label) ? '' : 'none';
        }
    });
}

// تحديث معاينة الصلاحيات
function updatePermissionsPreview(role) {
    const preview = document.getElementById('permissionsPreview');
    if (!role || !userRoles[role]) {
        preview.innerHTML = '<p class="text-muted">اختر الدور لعرض الصلاحيات</p>';
        return;
    }
    
    const permissions = userRoles[role].permissions;
    if (permissions.includes('all')) {
        preview.innerHTML = '<div class="permission-badge permission-all"><i class="fas fa-crown"></i> جميع الصلاحيات</div>';
    } else {
        preview.innerHTML = permissions.map(perm => 
            `<div class="permission-badge"><i class="fas fa-check"></i> ${availablePermissions[perm] || perm}</div>`
        ).join('');
    }
}

// إغلاق النافذة المنبثقة
function closeModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.remove();
    }
}

// تغيير اسم المستخدم وكلمة المرور (صلاحية admin فقط)
function changeUserCredentials(userId) {
    // التحقق من صلاحية المستخدم الحالي
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!currentUser || currentUser.role !== 'admin') {
        showAlert('error', 'غير مصرح لك بتنفيذ هذا الإجراء. صلاحية مدير النظام فقط.');
        return;
    }
    
    const user = users.find(u => u.id === userId);
    if (!user) {
        showAlert('error', 'المستخدم غير موجود');
        return;
    }
    
    const modal = `
        <div class="modal-overlay" onclick="closeModal()">
            <div class="modal-content" onclick="event.stopPropagation()" style="max-width: 500px;">
                <div class="modal-header">
                    <h3><i class="fas fa-key"></i> تغيير بيانات الدخول</h3>
                    <button class="modal-close" onclick="closeModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <form id="changeCredentialsForm" onsubmit="handleChangeCredentials(event, '${userId}')">
                    <div class="modal-body">
                        <div class="alert alert-info" style="margin-bottom: 20px;">
                            <i class="fas fa-info-circle"></i>
                            تغيير بيانات دخول: <strong>${user.fullName}</strong> (${user.username})
                        </div>
                        
                        <div class="form-group">
                            <label>اسم المستخدم الجديد *</label>
                            <input type="text" id="newUsername" class="form-control" value="${user.username}" required>
                            <small class="form-text text-muted">سيتم استخدام هذا الاسم لتسجيل الدخول</small>
                        </div>
                        
                        <div class="form-group">
                            <label>كلمة المرور الجديدة *</label>
                            <input type="password" id="newPassword" class="form-control" required minlength="6" placeholder="أدخل كلمة مرور جديدة">
                            <small class="form-text text-muted">يجب أن تكون 6 أحرف على الأقل</small>
                        </div>
                        
                        <div class="form-group">
                            <label>تأكيد كلمة المرور *</label>
                            <input type="password" id="confirmNewPassword" class="form-control" required placeholder="أعد إدخال كلمة المرور">
                        </div>
                        
                        <div class="alert alert-warning" style="margin-top: 20px;">
                            <i class="fas fa-exclamation-triangle"></i>
                            <strong>تحذير:</strong> سيحتاج المستخدم إلى استخدام البيانات الجديدة عند تسجيل الدخول القادم.
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="closeModal()">
                            <i class="fas fa-times"></i>
                            إلغاء
                        </button>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i>
                            حفظ التغييرات
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modal);
}

// معالجة تغيير بيانات الدخول
function handleChangeCredentials(event, userId) {
    event.preventDefault();
    
    const newUsername = document.getElementById('newUsername').value.trim();
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmNewPassword').value;
    
    // التحقق من تطابق كلمات المرور
    if (newPassword !== confirmPassword) {
        showAlert('error', 'كلمات المرور غير متطابقة');
        return;
    }
    
    // التحقق من طول كلمة المرور
    if (newPassword.length < 6) {
        showAlert('error', 'يجب أن تكون كلمة المرور 6 أحرف على الأقل');
        return;
    }
    
    // التحقق من عدم تكرار اسم المستخدم
    const userIndex = users.findIndex(u => u.id === userId);
    const usernameExists = users.some((u, index) => u.username === newUsername && index !== userIndex);
    
    if (usernameExists) {
        showAlert('error', 'اسم المستخدم مستخدم بالفعل');
        return;
    }
    
    // تحديث بيانات المستخدم
    if (userIndex !== -1) {
        users[userIndex].username = newUsername;
        users[userIndex].password = newPassword; // في بيئة حقيقية، يجب تشفير كلمة المرور
        users[userIndex].updatedAt = Date.now();
        
        saveUsers();
        showUsersManagement();
        closeModal();
        
        showAlert('success', `تم تحديث بيانات دخول ${users[userIndex].fullName} بنجاح`);
        
        // تسجيل النشاط
        logActivity('تحديث بيانات دخول', `تم تغيير اسم المستخدم وكلمة المرور لـ ${users[userIndex].fullName}`);
    }
}

// إنشاء معرف فريد
function generateId() {
    return 'user_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// تهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', initUsers);
