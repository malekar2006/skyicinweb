/**
 * سجل نشاط المستخدمين - Sky Icon Travel & Tourism
 * User Activity Log System
 */

// تحميل سجل النشاطات
function loadActivityLog() {
    const activities = JSON.parse(localStorage.getItem('userActivities') || '[]');
    return activities;
}

// حفظ سجل النشاطات
function saveActivityLog(activities) {
    localStorage.setItem('userActivities', JSON.stringify(activities));
}

// تسجيل نشاط جديد
function recordActivity(action, description, details = {}) {
    if (!currentSession) return;
    
    const activities = loadActivityLog();
    
    const activity = {
        id: generateActivityId(),
        userId: currentSession.userId,
        username: currentSession.username,
        userRole: currentSession.role,
        action: action,
        description: description,
        details: details,
        timestamp: Date.now(),
        ipAddress: 'N/A',
        userAgent: navigator.userAgent,
        sessionId: currentSession.sessionId
    };
    
    activities.unshift(activity);
    
    // الاحتفاظ بآخر 2000 نشاط
    if (activities.length > 2000) {
        activities.splice(2000);
    }
    
    saveActivityLog(activities);
    
    return activity;
}

// عرض صفحة سجل النشاط
function showActivityLog() {
    loadModulePage();
    const mainContent = document.getElementById('mainContent');
    
    const activities = loadActivityLog();
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    mainContent.innerHTML = `
        <div class="page-header">
            <div class="header-content">
                <div>
                    <h1><i class="fas fa-history"></i> سجل نشاط المستخدمين</h1>
                    <p>تتبع جميع العمليات والأنشطة في النظام</p>
                </div>
                <div class="header-actions">
                    <button class="btn btn-secondary" onclick="exportActivityLog()">
                        <i class="fas fa-download"></i>
                        تصدير السجل
                    </button>
                    <button class="btn btn-danger" onclick="clearActivityLog()">
                        <i class="fas fa-trash"></i>
                        مسح السجل
                    </button>
                </div>
            </div>
        </div>

        <div class="activity-stats">
            <div class="stat-card">
                <div class="stat-icon stat-primary">
                    <i class="fas fa-list"></i>
                </div>
                <div class="stat-content">
                    <h3>${activities.length}</h3>
                    <p>إجمالي الأنشطة</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon stat-success">
                    <i class="fas fa-check-circle"></i>
                </div>
                <div class="stat-content">
                    <h3>${activities.filter(a => a.action.includes('create') || a.action.includes('add')).length}</h3>
                    <p>عمليات إضافة</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon stat-warning">
                    <i class="fas fa-edit"></i>
                </div>
                <div class="stat-content">
                    <h3>${activities.filter(a => a.action.includes('edit') || a.action.includes('update')).length}</h3>
                    <p>عمليات تعديل</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon stat-danger">
                    <i class="fas fa-trash"></i>
                </div>
                <div class="stat-content">
                    <h3>${activities.filter(a => a.action.includes('delete')).length}</h3>
                    <p>عمليات حذف</p>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="card-header">
                <h3><i class="fas fa-filter"></i> تصفية السجل</h3>
            </div>
            <div class="card-body">
                <div class="activity-filters">
                    <div class="filter-group">
                        <label>المستخدم</label>
                        <select id="filterUser" class="form-control" onchange="filterActivities()">
                            <option value="">جميع المستخدمين</option>
                            ${users.map(u => `<option value="${u.id}">${u.fullName}</option>`).join('')}
                        </select>
                    </div>
                    <div class="filter-group">
                        <label>نوع النشاط</label>
                        <select id="filterAction" class="form-control" onchange="filterActivities()">
                            <option value="">جميع الأنواع</option>
                            <option value="login">تسجيل دخول</option>
                            <option value="logout">تسجيل خروج</option>
                            <option value="create">إنشاء</option>
                            <option value="edit">تعديل</option>
                            <option value="delete">حذف</option>
                            <option value="view">عرض</option>
                            <option value="print">طباعة</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label>التاريخ من</label>
                        <input type="date" id="filterDateFrom" class="form-control" onchange="filterActivities()">
                    </div>
                    <div class="filter-group">
                        <label>التاريخ إلى</label>
                        <input type="date" id="filterDateTo" class="form-control" onchange="filterActivities()">
                    </div>
                    <div class="filter-group">
                        <label>بحث</label>
                        <input type="text" id="filterSearch" class="form-control" placeholder="ابحث في الوصف..." oninput="filterActivities()">
                    </div>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="card-header">
                <h3><i class="fas fa-list"></i> سجل الأنشطة</h3>
                <span class="activity-count">عرض <span id="displayedCount">${activities.length}</span> من ${activities.length}</span>
            </div>
            <div class="card-body">
                <div class="activity-timeline" id="activityTimeline">
                    ${renderActivityTimeline(activities)}
                </div>
            </div>
        </div>
    `;
}

// عرض Timeline الأنشطة
function renderActivityTimeline(activities) {
    if (activities.length === 0) {
        return `
            <div class="empty-state">
                <i class="fas fa-history"></i>
                <p>لا توجد أنشطة مسجلة</p>
            </div>
        `;
    }
    
    return activities.map(activity => {
        const icon = getActivityIcon(activity.action);
        const color = getActivityColor(activity.action);
        
        return `
            <div class="activity-log-item">
                <div class="activity-log-icon activity-${color}">
                    <i class="fas fa-${icon}"></i>
                </div>
                <div class="activity-log-content">
                    <div class="activity-log-header">
                        <div class="activity-user-info">
                            <strong>${activity.username}</strong>
                            <span class="activity-role badge badge-${getUserRoleColor(activity.userRole)}">
                                ${getUserRoleLabel(activity.userRole)}
                            </span>
                        </div>
                        <span class="activity-time">${formatActivityTime(activity.timestamp)}</span>
                    </div>
                    <div class="activity-description">
                        ${activity.description}
                    </div>
                    ${activity.details && Object.keys(activity.details).length > 0 ? `
                        <div class="activity-details">
                            <button class="btn-text" onclick="toggleActivityDetails('${activity.id}')">
                                <i class="fas fa-info-circle"></i> عرض التفاصيل
                            </button>
                            <div class="activity-details-content" id="details-${activity.id}" style="display: none;">
                                ${renderActivityDetails(activity.details)}
                            </div>
                        </div>
                    ` : ''}
                    <div class="activity-meta">
                        <span><i class="fas fa-fingerprint"></i> ${activity.sessionId.substring(0, 12)}...</span>
                        <span><i class="fas fa-laptop"></i> ${getBrowserInfo(activity.userAgent)}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// الحصول على أيقونة النشاط
function getActivityIcon(action) {
    const icons = {
        'login': 'sign-in-alt',
        'logout': 'sign-out-alt',
        'create': 'plus-circle',
        'add': 'plus-circle',
        'edit': 'edit',
        'update': 'sync',
        'delete': 'trash',
        'view': 'eye',
        'print': 'print',
        'export': 'download',
        'import': 'upload'
    };
    
    for (let key in icons) {
        if (action.includes(key)) {
            return icons[key];
        }
    }
    
    return 'circle';
}

// الحصول على لون النشاط
function getActivityColor(action) {
    if (action.includes('login')) return 'success';
    if (action.includes('logout')) return 'secondary';
    if (action.includes('create') || action.includes('add')) return 'success';
    if (action.includes('edit') || action.includes('update')) return 'warning';
    if (action.includes('delete')) return 'danger';
    if (action.includes('view') || action.includes('print')) return 'info';
    return 'primary';
}

// الحصول على لون الدور
function getUserRoleColor(role) {
    const colors = {
        'admin': 'danger',
        'manager': 'primary',
        'accountant': 'info',
        'employee': 'success',
        'viewer': 'secondary'
    };
    return colors[role] || 'secondary';
}

// الحصول على تسمية الدور
function getUserRoleLabel(role) {
    const labels = {
        'admin': 'مدير النظام',
        'manager': 'مدير',
        'accountant': 'محاسب',
        'employee': 'موظف',
        'viewer': 'مشاهد'
    };
    return labels[role] || role;
}

// عرض تفاصيل النشاط
function renderActivityDetails(details) {
    return `
        <div class="details-grid">
            ${Object.entries(details).map(([key, value]) => `
                <div class="detail-item">
                    <span class="detail-label">${key}:</span>
                    <span class="detail-value">${JSON.stringify(value)}</span>
                </div>
            `).join('')}
        </div>
    `;
}

// تبديل عرض التفاصيل
function toggleActivityDetails(activityId) {
    const detailsDiv = document.getElementById(`details-${activityId}`);
    if (detailsDiv) {
        detailsDiv.style.display = detailsDiv.style.display === 'none' ? 'block' : 'none';
    }
}

// الحصول على معلومات المتصفح
function getBrowserInfo(userAgent) {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
}

// تنسيق وقت النشاط
function formatActivityTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'الآن';
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    if (hours < 24) return `منذ ${hours} ساعة`;
    if (days < 7) return `منذ ${days} يوم`;
    
    return date.toLocaleString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// تصفية الأنشطة
function filterActivities() {
    const filterUser = document.getElementById('filterUser').value;
    const filterAction = document.getElementById('filterAction').value;
    const filterDateFrom = document.getElementById('filterDateFrom').value;
    const filterDateTo = document.getElementById('filterDateTo').value;
    const filterSearch = document.getElementById('filterSearch').value.toLowerCase();
    
    let activities = loadActivityLog();
    
    // تصفية حسب المستخدم
    if (filterUser) {
        activities = activities.filter(a => a.userId === filterUser);
    }
    
    // تصفية حسب نوع النشاط
    if (filterAction) {
        activities = activities.filter(a => a.action.includes(filterAction));
    }
    
    // تصفية حسب التاريخ من
    if (filterDateFrom) {
        const fromDate = new Date(filterDateFrom).getTime();
        activities = activities.filter(a => a.timestamp >= fromDate);
    }
    
    // تصفية حسب التاريخ إلى
    if (filterDateTo) {
        const toDate = new Date(filterDateTo).setHours(23, 59, 59, 999);
        activities = activities.filter(a => a.timestamp <= toDate);
    }
    
    // تصفية حسب البحث
    if (filterSearch) {
        activities = activities.filter(a => 
            a.description.toLowerCase().includes(filterSearch) ||
            a.username.toLowerCase().includes(filterSearch)
        );
    }
    
    // تحديث العرض
    const timeline = document.getElementById('activityTimeline');
    timeline.innerHTML = renderActivityTimeline(activities);
    
    document.getElementById('displayedCount').textContent = activities.length;
}

// تصدير سجل النشاط
function exportActivityLog() {
    const activities = loadActivityLog();
    const dataStr = JSON.stringify(activities, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `activity_log_${formatDate(new Date())}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    
    if (typeof addNotification === 'function') {
        addNotification('success', 'تم التصدير', 'تم تصدير سجل النشاط بنجاح');
    }
    
    recordActivity('export', 'تصدير سجل نشاط المستخدمين');
}

// مسح سجل النشاط
function clearActivityLog() {
    if (confirm('هل أنت متأكد من مسح جميع سجل النشاط؟\nهذا الإجراء لا يمكن التراجع عنه.')) {
        if (confirm('تأكيد نهائي: سيتم حذف جميع الأنشطة المسجلة!')) {
            localStorage.setItem('userActivities', JSON.stringify([]));
            showActivityLog();
            
            if (typeof addNotification === 'function') {
                addNotification('success', 'تم المسح', 'تم مسح سجل النشاط بنجاح');
            }
        }
    }
}

// إنشاء معرف نشاط
function generateActivityId() {
    return 'activity_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2);
}

// عرض إحصائيات المستخدمين
function showUserStatistics() {
    loadModulePage();
    const mainContent = document.getElementById('mainContent');
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const activities = loadActivityLog();
    
    // حساب الإحصائيات
    const userStats = users.map(user => {
        const userActivities = activities.filter(a => a.userId === user.id);
        const logins = userActivities.filter(a => a.action === 'login').length;
        const lastActivity = userActivities[0];
        
        return {
            ...user,
            totalActivities: userActivities.length,
            logins: logins,
            lastActivity: lastActivity ? lastActivity.timestamp : null
        };
    });
    
    mainContent.innerHTML = `
        <div class="page-header">
            <div class="header-content">
                <div>
                    <h1><i class="fas fa-chart-bar"></i> إحصائيات المستخدمين</h1>
                    <p>تحليل نشاط وأداء المستخدمين</p>
                </div>
                <div class="header-actions">
                    <button class="btn btn-secondary" onclick="showUsersManagement()">
                        <i class="fas fa-users"></i>
                        إدارة المستخدمين
                    </button>
                    <button class="btn btn-primary" onclick="showActivityLog()">
                        <i class="fas fa-history"></i>
                        سجل النشاط
                    </button>
                </div>
            </div>
        </div>

        <div class="users-stats-grid">
            ${userStats.map(user => `
                <div class="user-stat-card">
                    <div class="user-stat-header">
                        <div class="user-stat-avatar">
                            <i class="fas fa-user"></i>
                        </div>
                        <div class="user-stat-info">
                            <h4>${user.fullName}</h4>
                            <span class="badge badge-${getUserRoleColor(user.role)}">
                                ${getUserRoleLabel(user.role)}
                            </span>
                        </div>
                    </div>
                    <div class="user-stat-body">
                        <div class="stat-row">
                            <span class="stat-label">
                                <i class="fas fa-list"></i>
                                إجمالي الأنشطة
                            </span>
                            <span class="stat-value">${user.totalActivities}</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label">
                                <i class="fas fa-sign-in-alt"></i>
                                عدد مرات الدخول
                            </span>
                            <span class="stat-value">${user.logins}</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label">
                                <i class="fas fa-clock"></i>
                                آخر نشاط
                            </span>
                            <span class="stat-value">
                                ${user.lastActivity ? formatActivityTime(user.lastActivity) : 'لا يوجد'}
                            </span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label">
                                <i class="fas fa-toggle-on"></i>
                                الحالة
                            </span>
                            <span class="badge badge-${user.status === 'active' ? 'success' : 'danger'}">
                                ${user.status === 'active' ? 'نشط' : 'معطل'}
                            </span>
                        </div>
                    </div>
                    <div class="user-stat-footer">
                        <button class="btn btn-sm btn-secondary" onclick="showUserActivityDetails('${user.id}')">
                            <i class="fas fa-eye"></i>
                            عرض التفاصيل
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// عرض تفاصيل نشاط مستخدم محدد
function showUserActivityDetails(userId) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.id === userId);
    const activities = loadActivityLog().filter(a => a.userId === userId);
    
    if (!user) return;
    
    loadModulePage();
    const mainContent = document.getElementById('mainContent');
    
    mainContent.innerHTML = `
        <div class="page-header">
            <div class="header-content">
                <div>
                    <h1><i class="fas fa-user"></i> نشاط المستخدم: ${user.fullName}</h1>
                    <p>سجل جميع أنشطة وعمليات المستخدم</p>
                </div>
                <div class="header-actions">
                    <button class="btn btn-secondary" onclick="showUserStatistics()">
                        <i class="fas fa-arrow-right"></i>
                        رجوع
                    </button>
                </div>
            </div>
        </div>

        <div class="activity-stats">
            <div class="stat-card">
                <div class="stat-icon stat-primary">
                    <i class="fas fa-list"></i>
                </div>
                <div class="stat-content">
                    <h3>${activities.length}</h3>
                    <p>إجمالي الأنشطة</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon stat-success">
                    <i class="fas fa-sign-in-alt"></i>
                </div>
                <div class="stat-content">
                    <h3>${activities.filter(a => a.action === 'login').length}</h3>
                    <p>مرات الدخول</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon stat-info">
                    <i class="fas fa-clock"></i>
                </div>
                <div class="stat-content">
                    <h3>${activities[0] ? formatActivityTime(activities[0].timestamp) : 'لا يوجد'}</h3>
                    <p>آخر نشاط</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon stat-warning">
                    <i class="fas fa-shield-alt"></i>
                </div>
                <div class="stat-content">
                    <h3>${getUserRoleLabel(user.role)}</h3>
                    <p>الدور</p>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="card-header">
                <h3><i class="fas fa-history"></i> سجل الأنشطة</h3>
            </div>
            <div class="card-body">
                <div class="activity-timeline">
                    ${renderActivityTimeline(activities)}
                </div>
            </div>
        </div>
    `;
}

// تهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    // تسجيل نشاط تلقائي عند تحميل الصفحة
    if (currentSession) {
        recordActivity('page_load', 'تحميل صفحة النظام');
    }
});
