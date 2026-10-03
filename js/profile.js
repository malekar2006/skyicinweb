/**
 * الملف الشخصي - Sky Icon Travel & Tourism
 * User Profile Management
 */

// بيانات المستخدم الحالي
let currentUser = null;

// تهيئة الملف الشخصي
function initProfile() {
    loadCurrentUser();
}

// تحميل بيانات المستخدم الحالي
function loadCurrentUser() {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
        currentUser = JSON.parse(stored);
    } else {
        // مستخدم افتراضي للتجربة
        currentUser = {
            id: 'user_001',
            username: 'admin',
            fullName: 'مدير النظام',
            email: 'admin@skyicon.com',
            phone: '+967 777 180 875',
            role: 'admin',
            avatar: null,
            department: 'الإدارة',
            joinDate: '2024-01-01',
            lastLogin: Date.now(),
            permissions: ['all'],
            settings: {
                language: 'ar',
                theme: 'light',
                notifications: true,
                emailNotifications: true,
                smsNotifications: false
            }
        };
        saveCurrentUser();
    }
}

// حفظ بيانات المستخدم الحالي
function saveCurrentUser() {
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
}

// عرض صفحة الملف الشخصي
function showProfile() {
    // التأكد من تحميل بيانات المستخدم أولاً
    if (!currentUser) {
        loadCurrentUser();
    }
    
    loadModulePage();
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = `
        <div class="page-header">
            <div class="header-content">
                <h1><i class="fas fa-user-circle"></i> الملف الشخصي</h1>
                <p>إدارة معلوماتك الشخصية وإعداداتك</p>
            </div>
        </div>

        <div class="profile-container">
            <div class="profile-sidebar">
                <div class="profile-avatar-section">
                    <div class="profile-avatar" id="profileAvatar">
                        ${currentUser.avatar ? 
                            `<img src="${currentUser.avatar}" alt="الصورة الشخصية">` :
                            `<i class="fas fa-user"></i>`
                        }
                    </div>
                    <button class="btn btn-secondary btn-sm" onclick="changeAvatar()">
                        <i class="fas fa-camera"></i>
                        تغيير الصورة
                    </button>
                </div>
                
                <div class="profile-info-card">
                    <h3>${currentUser.fullName}</h3>
                    <p class="user-role">
                        <i class="fas fa-shield-alt"></i>
                        ${getRoleLabel(currentUser.role)}
                    </p>
                    <div class="user-stats">
                        <div class="stat-item">
                            <i class="fas fa-calendar"></i>
                            <span>انضم في ${formatDate(currentUser.joinDate)}</span>
                        </div>
                        <div class="stat-item">
                            <i class="fas fa-clock"></i>
                            <span>آخر دخول: ${formatDateTime(currentUser.lastLogin)}</span>
                        </div>
                    </div>
                </div>

                <nav class="profile-nav">
                    <button class="profile-nav-btn active" onclick="showProfileTab('info')">
                        <i class="fas fa-user"></i>
                        المعلومات الشخصية
                    </button>
                    <button class="profile-nav-btn" onclick="showProfileTab('security')">
                        <i class="fas fa-lock"></i>
                        الأمان
                    </button>
                    <button class="profile-nav-btn" onclick="showProfileTab('settings')">
                        <i class="fas fa-cog"></i>
                        الإعدادات
                    </button>
                    <button class="profile-nav-btn" onclick="showProfileTab('activity')">
                        <i class="fas fa-history"></i>
                        سجل النشاط
                    </button>
                </nav>
            </div>

            <div class="profile-content">
                <div id="profileTabContent">
                    ${renderProfileInfoTab()}
                </div>
            </div>
        </div>
    `;
}

// عرض تبويب معلومات المستخدم
function renderProfileInfoTab() {
    return `
        <div class="profile-tab-content">
            <div class="card">
                <div class="card-header">
                    <h3><i class="fas fa-user"></i> المعلومات الأساسية</h3>
                    <button class="btn btn-primary btn-sm" onclick="editProfileInfo()">
                        <i class="fas fa-edit"></i> تعديل
                    </button>
                </div>
                <div class="card-body">
                    <div class="info-grid">
                        <div class="info-item">
                            <label><i class="fas fa-user"></i> الاسم الكامل</label>
                            <span>${currentUser.fullName}</span>
                        </div>
                        <div class="info-item">
                            <label><i class="fas fa-id-badge"></i> اسم المستخدم</label>
                            <span>${currentUser.username}</span>
                        </div>
                        <div class="info-item">
                            <label><i class="fas fa-envelope"></i> البريد الإلكتروني</label>
                            <span>${currentUser.email}</span>
                        </div>
                        <div class="info-item">
                            <label><i class="fas fa-phone"></i> رقم الهاتف</label>
                            <span>${currentUser.phone}</span>
                        </div>
                        <div class="info-item">
                            <label><i class="fas fa-building"></i> القسم</label>
                            <span>${currentUser.department}</span>
                        </div>
                        <div class="info-item">
                            <label><i class="fas fa-shield-alt"></i> الصلاحية</label>
                            <span class="badge badge-${currentUser.role}">${getRoleLabel(currentUser.role)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// عرض تبويب الأمان
function renderProfileSecurityTab() {
    return `
        <div class="profile-tab-content">
            <div class="card">
                <div class="card-header">
                    <h3><i class="fas fa-lock"></i> تغيير كلمة المرور</h3>
                </div>
                <div class="card-body">
                    <form id="changePasswordForm" onsubmit="handleChangePassword(event)">
                        <div class="form-group">
                            <label>كلمة المرور الحالية</label>
                            <input type="password" id="currentPassword" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label>كلمة المرور الجديدة</label>
                            <input type="password" id="newPassword" class="form-control" required minlength="6">
                            <small>يجب أن تكون 6 أحرف على الأقل</small>
                        </div>
                        <div class="form-group">
                            <label>تأكيد كلمة المرور الجديدة</label>
                            <input type="password" id="confirmPassword" class="form-control" required>
                        </div>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i> حفظ التغييرات
                        </button>
                    </form>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3><i class="fas fa-shield-alt"></i> المصادقة الثنائية</h3>
                </div>
                <div class="card-body">
                    <div class="security-option">
                        <div>
                            <h4>المصادقة الثنائية (2FA)</h4>
                            <p>أضف طبقة حماية إضافية لحسابك</p>
                        </div>
                        <button class="btn btn-secondary" onclick="enable2FA()">
                            <i class="fas fa-mobile-alt"></i> تفعيل
                        </button>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3><i class="fas fa-history"></i> الجلسات النشطة</h3>
                </div>
                <div class="card-body">
                    <div class="session-item active">
                        <div class="session-info">
                            <i class="fas fa-desktop"></i>
                            <div>
                                <h4>الجلسة الحالية</h4>
                                <p>Windows - Chrome - ${formatDateTime(Date.now())}</p>
                            </div>
                        </div>
                        <span class="badge badge-success">نشط الآن</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// عرض تبويب الإعدادات
function renderProfileSettingsTab() {
    return `
        <div class="profile-tab-content">
            <div class="card">
                <div class="card-header">
                    <h3><i class="fas fa-bell"></i> إعدادات الإشعارات</h3>
                </div>
                <div class="card-body">
                    <div class="settings-group">
                        <div class="setting-item">
                            <div>
                                <h4>إشعارات النظام</h4>
                                <p>استقبال إشعارات داخل النظام</p>
                            </div>
                            <label class="switch">
                                <input type="checkbox" ${currentUser.settings.notifications ? 'checked' : ''} 
                                    onchange="toggleSetting('notifications', this.checked)">
                                <span class="slider"></span>
                            </label>
                        </div>
                        <div class="setting-item">
                            <div>
                                <h4>إشعارات البريد الإلكتروني</h4>
                                <p>استقبال إشعارات عبر البريد الإلكتروني</p>
                            </div>
                            <label class="switch">
                                <input type="checkbox" ${currentUser.settings.emailNotifications ? 'checked' : ''} 
                                    onchange="toggleSetting('emailNotifications', this.checked)">
                                <span class="slider"></span>
                            </label>
                        </div>
                        <div class="setting-item">
                            <div>
                                <h4>إشعارات الرسائل النصية</h4>
                                <p>استقبال إشعارات عبر الرسائل النصية</p>
                            </div>
                            <label class="switch">
                                <input type="checkbox" ${currentUser.settings.smsNotifications ? 'checked' : ''} 
                                    onchange="toggleSetting('smsNotifications', this.checked)">
                                <span class="slider"></span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3><i class="fas fa-paint-brush"></i> المظهر</h3>
                </div>
                <div class="card-body">
                    <div class="settings-group">
                        <div class="setting-item">
                            <div>
                                <h4>السمة</h4>
                                <p>اختر مظهر النظام</p>
                            </div>
                            <select class="form-control" onchange="changeTheme(this.value)">
                                <option value="light" ${currentUser.settings.theme === 'light' ? 'selected' : ''}>فاتح</option>
                                <option value="dark" ${currentUser.settings.theme === 'dark' ? 'selected' : ''}>داكن</option>
                                <option value="auto" ${currentUser.settings.theme === 'auto' ? 'selected' : ''}>تلقائي</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// عرض تبويب سجل النشاط
function renderProfileActivityTab() {
    const activities = [
        { icon: 'sign-in-alt', text: 'تسجيل دخول إلى النظام', time: Date.now(), type: 'info' },
        { icon: 'file-invoice', text: 'إنشاء فاتورة مبيعات #INV-2024-001', time: Date.now() - 3600000, type: 'success' },
        { icon: 'plane', text: 'إضافة حجز طيران جديد', time: Date.now() - 7200000, type: 'success' },
        { icon: 'edit', text: 'تعديل بيانات عميل', time: Date.now() - 10800000, type: 'info' }
    ];

    return `
        <div class="profile-tab-content">
            <div class="card">
                <div class="card-header">
                    <h3><i class="fas fa-history"></i> آخر الأنشطة</h3>
                    <button class="btn btn-secondary btn-sm" onclick="clearActivityLog()">
                        <i class="fas fa-trash"></i> مسح السجل
                    </button>
                </div>
                <div class="card-body">
                    <div class="activity-timeline">
                        ${activities.map(activity => `
                            <div class="activity-item">
                                <div class="activity-icon activity-${activity.type}">
                                    <i class="fas fa-${activity.icon}"></i>
                                </div>
                                <div class="activity-content">
                                    <p>${activity.text}</p>
                                    <span class="activity-time">${formatDateTime(activity.time)}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// التبديل بين التبويبات
function showProfileTab(tab) {
    // تحديث أزرار التنقل
    const navButtons = document.querySelectorAll('.profile-nav-btn');
    navButtons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // عرض المحتوى المناسب
    const tabContent = document.getElementById('profileTabContent');
    switch(tab) {
        case 'info':
            tabContent.innerHTML = renderProfileInfoTab();
            break;
        case 'security':
            tabContent.innerHTML = renderProfileSecurityTab();
            break;
        case 'settings':
            tabContent.innerHTML = renderProfileSettingsTab();
            break;
        case 'activity':
            tabContent.innerHTML = renderProfileActivityTab();
            break;
    }
}

// تعديل المعلومات الشخصية
function editProfileInfo() {
    const modal = `
        <div class="modal-overlay" onclick="closeModal()">
            <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3><i class="fas fa-edit"></i> تعديل المعلومات الشخصية</h3>
                    <button class="modal-close" onclick="closeModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <form id="editProfileForm" onsubmit="handleEditProfile(event)">
                    <div class="modal-body">
                        <div class="form-group">
                            <label>الاسم الكامل *</label>
                            <input type="text" id="editFullName" class="form-control" value="${currentUser.fullName}" required>
                        </div>
                        <div class="form-group">
                            <label>البريد الإلكتروني *</label>
                            <input type="email" id="editEmail" class="form-control" value="${currentUser.email}" required>
                        </div>
                        <div class="form-group">
                            <label>رقم الهاتف *</label>
                            <input type="tel" id="editPhone" class="form-control" value="${currentUser.phone}" required>
                        </div>
                        <div class="form-group">
                            <label>القسم</label>
                            <input type="text" id="editDepartment" class="form-control" value="${currentUser.department}">
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

// معالجة تعديل الملف الشخصي
function handleEditProfile(event) {
    event.preventDefault();
    
    currentUser.fullName = document.getElementById('editFullName').value;
    currentUser.email = document.getElementById('editEmail').value;
    currentUser.phone = document.getElementById('editPhone').value;
    currentUser.department = document.getElementById('editDepartment').value;
    
    saveCurrentUser();
    closeModal();
    showProfile();
    
    if (typeof addNotification === 'function') {
        addNotification('success', 'تم التحديث', 'تم تحديث المعلومات الشخصية بنجاح');
    }
}

// معالجة تغيير كلمة المرور
function handleChangePassword(event) {
    event.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (newPassword !== confirmPassword) {
        alert('كلمة المرور الجديدة غير متطابقة!');
        return;
    }
    
    // هنا يجب التحقق من كلمة المرور الحالية
    // في هذا المثال سنفترض أنها صحيحة
    
    if (typeof addNotification === 'function') {
        addNotification('success', 'تم التحديث', 'تم تغيير كلمة المرور بنجاح');
    }
    
    event.target.reset();
}

// تبديل الإعدادات
function toggleSetting(setting, value) {
    currentUser.settings[setting] = value;
    saveCurrentUser();
    
    if (typeof addNotification === 'function') {
        addNotification('success', 'تم التحديث', 'تم تحديث الإعدادات بنجاح');
    }
}

// تغيير السمة
function changeTheme(theme) {
    currentUser.settings.theme = theme;
    saveCurrentUser();
    
    // تطبيق السمة
    document.body.className = theme === 'dark' ? 'dark-theme' : '';
    
    if (typeof addNotification === 'function') {
        addNotification('success', 'تم التحديث', 'تم تغيير مظهر النظام');
    }
}

// تغيير الصورة الشخصية
function changeAvatar() {
    alert('ميزة تغيير الصورة الشخصية ستكون متاحة قريباً');
}

// تفعيل المصادقة الثنائية
function enable2FA() {
    alert('ميزة المصادقة الثنائية ستكون متاحة قريباً');
}

// مسح سجل النشاط
function clearActivityLog() {
    if (confirm('هل تريد مسح سجل النشاط؟')) {
        if (typeof addNotification === 'function') {
            addNotification('success', 'تم', 'تم مسح سجل النشاط');
        }
    }
}

// الحصول على تسمية الصلاحية
function getRoleLabel(role) {
    const roles = {
        'admin': 'مدير النظام',
        'manager': 'مدير',
        'accountant': 'محاسب',
        'employee': 'موظف',
        'viewer': 'مشاهد'
    };
    return roles[role] || role;
}

// إغلاق النافذة المنبثقة
function closeModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.remove();
    }
}

// تهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', initProfile);
