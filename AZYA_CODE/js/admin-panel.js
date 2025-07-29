<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>דיבוג פאנל ניהול - הזיה</title>
    <style>
        :root {
            --primary-gold: #d4af37;
            --glass-bg: rgba(255, 255, 255, 0.1);
            --glass-border: rgba(255, 255, 255, 0.2);
            --text-primary: #ffffff;
            --text-secondary: #b0b0b0;
            --accent-green: #10b981;
            --accent-red: #ef4444;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            background: linear-gradient(135deg, #2c1810, #1a0f0a);
            color: var(--text-primary);
            padding: 20px;
            min-height: 100vh;
        }
        
        .debug-container {
            max-width: 800px;
            margin: 0 auto;
            background: var(--glass-bg);
            border: 1px solid var(--glass-border);
            border-radius: 15px;
            padding: 30px;
            backdrop-filter: blur(10px);
        }
        
        .debug-section {
            margin-bottom: 30px;
            padding: 20px;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 10px;
            border: 1px solid var(--glass-border);
        }
        
        .debug-title {
            color: var(--primary-gold);
            margin-bottom: 15px;
            font-size: 1.2em;
            font-weight: bold;
        }
        
        .status {
            padding: 10px;
            border-radius: 5px;
            margin: 10px 0;
            font-weight: bold;
        }
        
        .status.success {
            background: rgba(16, 185, 129, 0.2);
            border: 1px solid var(--accent-green);
            color: var(--accent-green);
        }
        
        .status.error {
            background: rgba(239, 68, 68, 0.2);
            border: 1px solid var(--accent-red);
            color: var(--accent-red);
        }
        
        .status.warning {
            background: rgba(245, 158, 11, 0.2);
            border: 1px solid #f59e0b;
            color: #fbbf24;
        }
        
        .form-group {
            margin-bottom: 15px;
        }
        
        label {
            display: block;
            margin-bottom: 5px;
            color: var(--text-secondary);
        }
        
        input {
            width: 100%;
            padding: 10px;
            border: 1px solid var(--glass-border);
            border-radius: 5px;
            background: var(--glass-bg);
            color: var(--text-primary);
            font-size: 16px;
        }
        
        button {
            background: var(--primary-gold);
            color: #000;
            border: none;
            padding: 12px 24px;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
            margin: 5px;
            font-size: 16px;
        }
        
        button:hover {
            background: #b8941f;
        }
        
        .code-block {
            background: #1a1a1a;
            color: #00ff00;
            padding: 15px;
            border-radius: 5px;
            font-family: monospace;
            white-space: pre-wrap;
            overflow-x: auto;
            margin: 10px 0;
        }
        
        .config-missing {
            background: var(--accent-red);
            color: white;
            padding: 15px;
            border-radius: 5px;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="debug-container">
        <h1 style="text-align: center; color: var(--primary-gold); margin-bottom: 30px;">🔧 כלי דיבוג פאנל ניהול</h1>
        
        <!-- בדיקת סטטוס מערכת -->
        <div class="debug-section">
            <div class="debug-title">📊 סטטוס מערכת</div>
            <div id="systemStatus"></div>
            <button onclick="checkSystemStatus()">🔄 בדוק מחדש</button>
        </div>
        
        <!-- הגדרת CONFIG -->
        <div class="debug-section">
            <div class="debug-title">⚙️ הגדרת CONFIG</div>
            <p style="color: var(--text-secondary);">במידה והקובץ config.js לא קיים או לא עובד, הגדר כאן את פרטי ההתחברות:</p>
            
            <div class="form-group">
                <label>שם משתמש:</label>
                <input type="text" id="configUsername" value="admin" placeholder="admin">
            </div>
            
            <div class="form-group">
                <label>סיסמה:</label>
                <input type="password" id="configPassword" value="hazya2024" placeholder="hazya2024">
            </div>
            
            <button onclick="setConfig()">💾 הגדר CONFIG</button>
            <button onclick="showConfigCode()">📄 הצג קוד CONFIG</button>
            
            <div id="configCode" style="display: none;"></div>
        </div>
        
        <!-- הגדרת מחלקות חסרות -->
        <div class="debug-section">
            <div class="debug-title">🏗️ הגדרת מחלקות חסרות</div>
            <p style="color: var(--text-secondary);">יצירת מחלקות חיוניות שעלולות להיות חסרות:</p>
            
            <button onclick="createMissingClasses()">🔧 צור מחלקות חסרות</button>
            <button onclick="initializeSystem()">🚀 אתחל מערכת</button>
            
            <div id="classesStatus"></div>
        </div>
        
        <!-- בדיקת התחברות -->
        <div class="debug-section">
            <div class="debug-title">🔐 בדיקת התחברות</div>
            
            <div class="form-group">
                <label>שם משתמש:</label>
                <input type="text" id="testUsername" placeholder="הזן שם משתמש">
            </div>
            
            <div class="form-group">
                <label>סיסמה:</label>
                <input type="password" id="testPassword" placeholder="הזן סיסמה">
            </div>
            
            <button onclick="testLogin()">🔓 בדוק התחברות</button>
            <button onclick="forcedLogin()">⚡ התחברות כפויה</button>
            
            <div id="loginResult"></div>
        </div>
        
        <!-- פתרונות מהירים -->
        <div class="debug-section">
            <div class="debug-title">🚀 פתרונות מהירים</div>
            
            <button onclick="quickFix1()">🔧 פתרון 1: איפוס מלא</button>
            <button onclick="quickFix2()">🔧 פתרון 2: ביפס CONFIG</button>
            <button onclick="quickFix3()">🔧 פתרון 3: יצירת מנהל זמני</button>
        </div>
    </div>

    <script>
        // משתנים גלובליים
        let CONFIG = null;
        let admin = null;
        let DataManager = null;
        
        // בדיקת סטטוס מערכת
        function checkSystemStatus() {
            const statusDiv = document.getElementById('systemStatus');
            let html = '';
            
            // בדיקת CONFIG
            if (typeof window.CONFIG !== 'undefined') {
                html += '<div class="status success">✅ CONFIG נטען בהצלחה</div>';
                CONFIG = window.CONFIG;
            } else {
                html += '<div class="status error">❌ CONFIG לא נמצא</div>';
            }
            
            // בדיקת DataManager
            if (typeof window.DataManager !== 'undefined') {
                html += '<div class="status success">✅ DataManager נטען בהצלחה</div>';
                DataManager = window.DataManager;
            } else {
                html += '<div class="status error">❌ DataManager לא נמצא</div>';
            }
            
            // בדיקת admin
            if (typeof window.admin !== 'undefined') {
                html += '<div class="status success">✅ Admin Panel נטען בהצלחה</div>';
                admin = window.admin;
            } else {
                html += '<div class="status error">❌ Admin Panel לא נמצא</div>';
            }
            
            // בדיקת localStorage
            try {
                localStorage.setItem('test', 'test');
                localStorage.removeItem('test');
                html += '<div class="status success">✅ LocalStorage פועל</div>';
            } catch(e) {
                html += '<div class="status error">❌ LocalStorage לא פועל: ' + e.message + '</div>';
            }
            
            statusDiv.innerHTML = html;
        }
        
        // הגדרת CONFIG
        function setConfig() {
            const username = document.getElementById('configUsername').value;
            const password = document.getElementById('configPassword').value;
            
            window.CONFIG = {
                admin: {
                    defaultUsername: username,
                    defaultPassword: password,
                    sessionTimeout: 30 * 60 * 1000 // 30 דקות
                },
                app: {
                    name: 'הזיה',
                    version: '1.0.0'
                }
            };
            
            CONFIG = window.CONFIG;
            
            document.getElementById('systemStatus').innerHTML += 
                '<div class="status success">✅ CONFIG הוגדר ידנית</div>';
        }
        
        // הצגת קוד CONFIG
        function showConfigCode() {
            const configDiv = document.getElementById('configCode');
            const username = document.getElementById('configUsername').value;
            const password = document.getElementById('configPassword').value;
            
            const code = `// js/config.js
const CONFIG = {
    admin: {
        defaultUsername: '${username}',
        defaultPassword: '${password}',
        sessionTimeout: 30 * 60 * 1000 // 30 דקות
    },
    app: {
        name: 'הזיה',
        version: '1.0.0'
    },
    restaurant: {
        name: 'מסעדת הזיה',
        phone: '03-9876543',
        address: 'רחוב הרצל 25, תל אביב',
        email: 'hazya.restaurant@gmail.com'
    }
};

// ייצוא לחלון הגלובלי
window.CONFIG = CONFIG;`;
            
            configDiv.innerHTML = '<div class="code-block">' + code + '</div>';
            configDiv.style.display = 'block';
        }
        
        // יצירת מחלקות חסרות
        function createMissingClasses() {
            const statusDiv = document.getElementById('classesStatus');
            let html = '';
            
            // יצירת DataManager פשוט
            if (!window.DataManager) {
                window.DataManager = {
                    getAdminSession: () => {
                        return JSON.parse(localStorage.getItem('hazya_admin_session') || 'null');
                    },
                    saveAdminSession: (session) => {
                        localStorage.setItem('hazya_admin_session', JSON.stringify(session));
                    },
                    clearAdminSession: () => {
                        localStorage.removeItem('hazya_admin_session');
                    },
                    getOrders: () => [],
                    getCustomers: () => []
                };
                html += '<div class="status success">✅ DataManager נוצר</div>';
            }
            
            // יצירת modalManager פשוט
            if (!window.modalManager) {
                window.modalManager = {
                    openModal: (id) => {
                        const modal = document.getElementById(id);
                        if (modal) modal.style.display = 'flex';
                    },
                    closeModal: (id) => {
                        const modal = document.getElementById(id);
                        if (modal) modal.style.display = 'none';
                    }
                };
                html += '<div class="status success">✅ modalManager נוצר</div>';
            }
            
            // פונקציות עזר
            if (!window.showSuccess) {
                window.showSuccess = (msg) => alert('✅ ' + msg);
                window.showError = (msg) => alert('❌ ' + msg);
                window.showWarning = (msg) => alert('⚠️ ' + msg);
                window.showInfo = (msg) => alert('ℹ️ ' + msg);
                html += '<div class="status success">✅ פונקציות התראה נוצרו</div>';
            }
            
            statusDiv.innerHTML = html;
        }
        
        // אתחול מערכת
        function initializeSystem() {
            createMissingClasses();
            setConfig();
            
            // יצירת AdminPanel פשוט
            if (!window.admin) {
                window.admin = {
                    isLoggedIn: false,
                    login: function() {
                        const username = document.getElementById('testUsername').value;
                        const password = document.getElementById('testPassword').value;
                        
                        if (CONFIG && username === CONFIG.admin.defaultUsername && password === CONFIG.admin.defaultPassword) {
                            this.isLoggedIn = true;
                            DataManager.saveAdminSession({
                                username: username,
                                loginTime: Date.now()
                            });
                            
                            document.getElementById('loginResult').innerHTML = 
                                '<div class="status success">✅ התחברת בהצלחה!</div>';
                            
                            // פתח פאנל ניהול במקור
                            setTimeout(() => {
                                window.open(window.location.href.replace(/\/[^\/]*$/, '/'), '_blank');
                            }, 1000);
                            
                        } else {
                            document.getElementById('loginResult').innerHTML = 
                                '<div class="status error">❌ שם משתמש או סיסמה שגויים</div>';
                        }
                    }
                };
                
                document.getElementById('classesStatus').innerHTML += 
                    '<div class="status success">✅ Admin Panel נוצר</div>';
            }
        }
        
        // בדיקת התחברות
        function testLogin() {
            if (!CONFIG) {
                setConfig();
            }
            
            if (!window.admin) {
                initializeSystem();
            }
            
            window.admin.login();
        }
        
        // התחברות כפויה
        function forcedLogin() {
            if (!DataManager) {
                createMissingClasses();
            }
            
            DataManager.saveAdminSession({
                username: 'admin',
                loginTime: Date.now()
            });
            
            document.getElementById('loginResult').innerHTML = 
                '<div class="status success">✅ התחברות כפויה בוצעה! נסה לטעון מחדש את האתר המקורי</div>';
        }
        
        // פתרונות מהירים
        function quickFix1() {
            // איפוס מלא
            localStorage.clear();
            sessionStorage.clear();
            setConfig();
            createMissingClasses();
            
            alert('✅ איפוס מלא בוצע! נסה להתחבר עכשיו באתר המקורי עם:\nשם משתמש: admin\nסיסמה: hazya2024');
        }
        
        function quickFix2() {
            // ביפס CONFIG
            setConfig();
            forcedLogin();
            
            alert('✅ ביפס CONFIG בוצע! נסה לטעון מחדש את האתר המקורי');
        }
        
        function quickFix3() {
            // יצירת מנהל זמני
            localStorage.setItem('hazya_emergency_admin', 'true');
            forcedLogin();
            
            alert('✅ מנהל זמני נוצר! נסה לטעון מחדש את האתר המקורי');
        }
        
        // אתחול אוטומטי
        window.onload = function() {
            setTimeout(checkSystemStatus, 500);
        };
        
        // מילוי ברירת מחדל
        document.getElementById('testUsername').value = 'admin';
        document.getElementById('testPassword').value = 'hazya2024';
    </script>
</body>
</html>