/**
 * نظام المصادقة وتسجيل الدخول - Sky Icon Travel & Tourism
 * Authentication System
 */

// حالة المصادقة
let isAuthenticated = false;
let currentSession = null;

// تهيئة نظام المصادقة
function initAuth() {
    checkAuthStatus();
    setupAuthListeners();
}

// التحقق من حالة المصادقة
function checkAuthStatus() {
    const session = localStorage.getItem('currentSession');
    const rememberMe = localStorage.getItem('rememberMe');
    
    if (session) {
        const sessionData = JSON.parse(session);
        const now = Date.now();
        
        // التحقق من صلاحية الجلسة
        if (rememberMe === 'true' || (sessionData.expiresAt && now < sessionData.expiresAt)) {
            isAuthenticated = true;
            currentSession = sessionData;
            loadUserData(sessionData.userId);
            return true;
        } else {
            // انتهت صلاحية الجلسة
            logout('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى');
        }
    }
    
    // عرض صفحة تسجيل الدخول
    showLoginPage();
    return false;
}

// عرض صفحة تسجيل الدخول
function showLoginPage() {
    document.body.innerHTML = `
        <div class="login-container">
            <div class="login-card">
                <div class="login-header">
                    <div class="login-logo">
                        <i class="fas fa-plane-departure"></i>
                    </div>
                    <h1>سكاي آيكون</h1>
                    <p>النظام المحاسبي المتكامل للسفر والسياحة</p>
                </div>
                
                <form id="loginForm" onsubmit="handleLogin(event)">
                    <div class="form-group">
                        <label>
                            <i class="fas fa-user"></i>
                            اسم المستخدم
                        </label>
                        <input 
                            type="text" 
                            id="loginUsername" 
                            class="form-control" 
                            placeholder="أدخل اسم المستخدم"
                            required 
                            autocomplete="username"
                        >
                    </div>
                    
                    <div class="form-group">
                        <label>
                            <i class="fas fa-lock"></i>
                            كلمة المرور
                        </label>
                        <div class="password-input-wrapper">
                            <input 
                                type="password" 
                                id="loginPassword" 
                                class="form-control" 
                                placeholder="أدخل كلمة المرور"
                                required 
                                autocomplete="current-password"
                            >
                            <button type="button" class="toggle-password" onclick="togglePasswordVisibility('loginPassword')">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="form-options">
                        <label class="checkbox-label">
                            <input type="checkbox" id="rememberMe">
                            <span>تذكرني</span>
                        </label>
                        <a href="#" onclick="showForgotPassword(); return false;" class="forgot-link">
                            نسيت كلمة المرور؟
                        </a>
                    </div>
                    
                    <div id="loginError" class="error-message" style="display: none;"></div>
                    
                    <button type="submit" class="btn btn-primary btn-block btn-login">
                        <i class="fas fa-sign-in-alt"></i>
                        تسجيل الدخول
                    </button>
                </form>
                
                <div class="login-footer">
                    <p class="demo-accounts-title">
                        <i class="fas fa-info-circle"></i>
                        حسابات تجريبية:
                    </p>
                    <div class="demo-accounts">
                        <button class="demo-btn" onclick="loginAsDemo('admin')">
                            <i class="fas fa-user-shield"></i>
                            مدير النظام
                        </button>
                        <button class="demo-btn" onclick="loginAsDemo('accountant')">
                            <i class="fas fa-calculator"></i>
                            محاسب
                        </button>
                        <button class="demo-btn" onclick="loginAsDemo('employee')">
                            <i class="fas fa-user-tie"></i>
                            موظف
                        </button>
                    </div>
                </div>
                
                <div class="company-info">
                    <p><i class="fas fa-map-marker-alt"></i> اليمن - صنعاء</p>
                    <p><i class="fas fa-phone"></i> +967 777 180 875</p>
                </div>
            </div>
            
            <div class="login-background">
                <div class="animation-circle circle-1"></div>
                <div class="animation-circle circle-2"></div>
                <div class="animation-circle circle-3"></div>
            </div>
        </div>
        
        <style>
            ${getLoginPageStyles()}
        </style>
    `;
}

// معالجة تسجيل الدخول
function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    const errorDiv = document.getElementById('loginError');
    
    // إخفاء رسالة الخطأ
    errorDiv.style.display = 'none';
    
    // التحقق من بيانات الدخول
    const user = authenticateUser(username, password);
    
    if (user) {
        // التحقق من حالة المستخدم
        if (user.status === 'inactive') {
            showError('هذا الحساب معطل، يرجى الاتصال بالإدارة');
            return;
        }
        
        // إنشاء جلسة جديدة
        createSession(user, rememberMe);
        
        // تسجيل النشاط
        logActivity(user.id, 'login', 'تسجيل دخول ناجح');
        
        // تحديث آخر دخول
        updateLastLogin(user.id);
        
        // إعادة تحميل الصفحة
        location.reload();
    } else {
        showError('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
}

// التحقق من بيانات المستخدم
function authenticateUser(username, password) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // البحث عن المستخدم
    const user = users.find(u => u.username === username);
    
    if (!user) {
        return null;
    }
    
    // التحقق من كلمة المرور
    // إذا كان المستخدم لديه كلمة مرور محفوظة، استخدمها
    // وإلا استخدم كلمة المرور الافتراضية
    const userPassword = user.password || 'admin123';
    
    if (password === userPassword) {
        // كلمة المرور صحيحة
        return user;
    }
    
    return null;
}

// إنشاء جلسة جديدة
function createSession(user, rememberMe) {
    const now = Date.now();
    const expiresIn = rememberMe ? (30 * 24 * 60 * 60 * 1000) : (24 * 60 * 60 * 1000); // 30 يوم أو يوم واحد
    
    const session = {
        sessionId: generateSessionId(),
        userId: user.id,
        username: user.username,
        role: user.role,
        permissions: user.permissions,
        createdAt: now,
        expiresAt: now + expiresIn,
        ipAddress: 'N/A', // في النظام الحقيقي، يتم الحصول عليه من السيرفر
        userAgent: navigator.userAgent
    };
    
    localStorage.setItem('currentSession', JSON.stringify(session));
    localStorage.setItem('rememberMe', rememberMe.toString());
    
    currentSession = session;
    isAuthenticated = true;
}

// تسجيل الخروج
function logout(message = null) {
    if (currentSession) {
        logActivity(currentSession.userId, 'logout', 'تسجيل خروج');
    }
    
    localStorage.removeItem('currentSession');
    localStorage.removeItem('rememberMe');
    
    isAuthenticated = false;
    currentSession = null;
    
    if (message) {
        showLoginPage();
        setTimeout(() => {
            const errorDiv = document.getElementById('loginError');
            if (errorDiv) {
                errorDiv.textContent = message;
                errorDiv.style.display = 'block';
            }
        }, 100);
    } else {
        location.reload();
    }
}

// تسجيل دخول تجريبي
function loginAsDemo(role) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.role === role);
    
    if (user) {
        document.getElementById('loginUsername').value = user.username;
        document.getElementById('loginPassword').value = '123456';
        document.getElementById('loginForm').dispatchEvent(new Event('submit'));
    }
}

// عرض رسالة خطأ
function showError(message) {
    const errorDiv = document.getElementById('loginError');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        
        // إخفاء بعد 5 ثوان
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }
}

// تبديل رؤية كلمة المرور
function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling;
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// عرض صفحة نسيت كلمة المرور
function showForgotPassword() {
    alert('ميزة استعادة كلمة المرور ستكون متاحة قريباً.\n\nللحصول على المساعدة، يرجى الاتصال بمدير النظام.');
}

// تحميل بيانات المستخدم
function loadUserData(userId) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.id === userId);
    
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
    }
}

// تحديث آخر دخول
function updateLastLogin(userId) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex !== -1) {
        users[userIndex].lastLogin = Date.now();
        localStorage.setItem('users', JSON.stringify(users));
    }
}

// تسجيل النشاط
function logActivity(userId, action, description) {
    const activities = JSON.parse(localStorage.getItem('userActivities') || '[]');
    
    const activity = {
        id: generateId(),
        userId: userId,
        action: action,
        description: description,
        timestamp: Date.now(),
        ipAddress: 'N/A',
        userAgent: navigator.userAgent
    };
    
    activities.unshift(activity);
    
    // الاحتفاظ بآخر 1000 نشاط فقط
    if (activities.length > 1000) {
        activities.splice(1000);
    }
    
    localStorage.setItem('userActivities', JSON.stringify(activities));
}

// التحقق من الصلاحية
function hasPermission(permission) {
    if (!isAuthenticated || !currentSession) {
        return false;
    }
    
    // مدير النظام لديه جميع الصلاحيات
    if (currentSession.permissions.includes('all')) {
        return true;
    }
    
    return currentSession.permissions.includes(permission);
}

// التحقق من صلاحيات متعددة
function hasAnyPermission(permissions) {
    if (!isAuthenticated || !currentSession) {
        return false;
    }
    
    if (currentSession.permissions.includes('all')) {
        return true;
    }
    
    return permissions.some(p => currentSession.permissions.includes(p));
}

// التحقق من الدور
function hasRole(role) {
    if (!isAuthenticated || !currentSession) {
        return false;
    }
    
    return currentSession.role === role;
}

// الحصول على معرف المستخدم الحالي
function getCurrentUserId() {
    return currentSession ? currentSession.userId : null;
}

// الحصول على اسم المستخدم الحالي
function getCurrentUsername() {
    return currentSession ? currentSession.username : null;
}

// الحصول على دور المستخدم الحالي
function getCurrentUserRole() {
    return currentSession ? currentSession.role : null;
}

// إنشاء معرف جلسة
function generateSessionId() {
    return 'session_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2);
}

// إنشاء معرف فريد
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// إعداد مستمعي الأحداث
function setupAuthListeners() {
    // التحقق من الجلسة كل 5 دقائق
    setInterval(() => {
        if (isAuthenticated) {
            const session = localStorage.getItem('currentSession');
            if (!session) {
                logout('تم إنهاء الجلسة');
            }
        }
    }, 5 * 60 * 1000);
    
    // تسجيل النشاط عند الإغلاق
    window.addEventListener('beforeunload', () => {
        if (isAuthenticated && currentSession) {
            logActivity(currentSession.userId, 'session_end', 'نهاية الجلسة');
        }
    });
}

// أنماط صفحة تسجيل الدخول
function getLoginPageStyles() {
    return `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Cairo', sans-serif;
            direction: rtl;
            overflow: hidden;
        }
        
        .login-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #004d40 0%, #00695c 50%, #f57c00 100%);
            position: relative;
            padding: 20px;
        }
        
        .login-background {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            pointer-events: none;
        }
        
        .animation-circle {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.1);
            animation: float 20s infinite ease-in-out;
        }
        
        .circle-1 {
            width: 300px;
            height: 300px;
            top: -100px;
            right: -100px;
            animation-delay: 0s;
        }
        
        .circle-2 {
            width: 400px;
            height: 400px;
            bottom: -150px;
            left: -150px;
            animation-delay: 5s;
        }
        
        .circle-3 {
            width: 200px;
            height: 200px;
            top: 50%;
            left: 10%;
            animation-delay: 10s;
        }
        
        @keyframes float {
            0%, 100% { transform: translate(0, 0) scale(1); }
            25% { transform: translate(20px, -20px) scale(1.1); }
            50% { transform: translate(-20px, 20px) scale(0.9); }
            75% { transform: translate(20px, 20px) scale(1.05); }
        }
        
        .login-card {
            background: white;
            border-radius: 20px;
            padding: 40px;
            width: 100%;
            max-width: 450px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            position: relative;
            z-index: 1;
            animation: slideUp 0.5s ease;
        }
        
        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .login-header {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .login-logo {
            width: 80px;
            height: 80px;
            margin: 0 auto 20px;
            background: linear-gradient(135deg, #f57c00, #ff9800);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 36px;
            color: white;
            box-shadow: 0 10px 30px rgba(245, 124, 0, 0.3);
        }
        
        .login-header h1 {
            color: #004d40;
            font-size: 28px;
            margin-bottom: 10px;
        }
        
        .login-header p {
            color: #666;
            font-size: 14px;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-group label {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
            color: #333;
            font-weight: 600;
            font-size: 14px;
        }
        
        .form-group label i {
            color: #f57c00;
        }
        
        .form-control {
            width: 100%;
            padding: 12px 15px;
            border: 2px solid #e0e0e0;
            border-radius: 10px;
            font-size: 14px;
            font-family: 'Cairo', sans-serif;
            transition: all 0.3s;
        }
        
        .form-control:focus {
            outline: none;
            border-color: #f57c00;
            box-shadow: 0 0 0 3px rgba(245, 124, 0, 0.1);
        }
        
        .password-input-wrapper {
            position: relative;
        }
        
        .toggle-password {
            position: absolute;
            left: 10px;
            top: 50%;
            transform: translateY(-50%);
            background: transparent;
            border: none;
            color: #999;
            cursor: pointer;
            padding: 5px 10px;
            transition: color 0.3s;
        }
        
        .toggle-password:hover {
            color: #f57c00;
        }
        
        .form-options {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        
        .checkbox-label {
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            font-size: 14px;
            color: #666;
        }
        
        .checkbox-label input[type="checkbox"] {
            width: 18px;
            height: 18px;
            cursor: pointer;
        }
        
        .forgot-link {
            color: #f57c00;
            text-decoration: none;
            font-size: 14px;
            transition: color 0.3s;
        }
        
        .forgot-link:hover {
            color: #e65100;
            text-decoration: underline;
        }
        
        .error-message {
            background: #ffebee;
            color: #c62828;
            padding: 12px 15px;
            border-radius: 8px;
            margin-bottom: 15px;
            font-size: 13px;
            border-right: 4px solid #c62828;
        }
        
        .btn {
            padding: 12px 24px;
            border: none;
            border-radius: 10px;
            font-family: 'Cairo', sans-serif;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        
        .btn-primary {
            background: linear-gradient(135deg, #f57c00, #ff9800);
            color: white;
        }
        
        .btn-primary:hover {
            background: linear-gradient(135deg, #e65100, #f57c00);
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(245, 124, 0, 0.3);
        }
        
        .btn-block {
            width: 100%;
        }
        
        .btn-login {
            padding: 15px;
            font-size: 16px;
        }
        
        .login-footer {
            margin-top: 30px;
            padding-top: 25px;
            border-top: 1px solid #e0e0e0;
        }
        
        .demo-accounts-title {
            text-align: center;
            color: #666;
            font-size: 13px;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        
        .demo-accounts {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }
        
        .demo-btn {
            flex: 1;
            min-width: 120px;
            padding: 10px 15px;
            background: #f5f5f5;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            color: #666;
            font-family: 'Cairo', sans-serif;
            font-size: 13px;
            cursor: pointer;
            transition: all 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
        }
        
        .demo-btn:hover {
            background: #004d40;
            color: white;
            border-color: #004d40;
            transform: translateY(-2px);
        }
        
        .company-info {
            text-align: center;
            margin-top: 25px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
        }
        
        .company-info p {
            color: #999;
            font-size: 12px;
            margin: 5px 0;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
        }
        
        .company-info i {
            color: #f57c00;
        }
        
        @media (max-width: 768px) {
            .login-card {
                padding: 30px 20px;
            }
            
            .login-header h1 {
                font-size: 24px;
            }
            
            .demo-btn {
                min-width: 100%;
            }
        }
    `;
}

// تهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    // التأكد من وجود المستخدمين الافتراضيين
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.length === 0) {
        console.log('لا يوجد مستخدمين، سيتم تحميلهم من users.js');
    }
    
    // تأخير بسيط للسماح للصفحة بالتحميل
    setTimeout(() => {
        initAuth();
    }, 100);
});
