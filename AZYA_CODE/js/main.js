// js/main.js - קובץ ראשי להפעלת האפליקציה

/**
 * מחלקת אפליקציה ראשית
 */
class HazyaRestaurantApp {
    constructor() {
        this.isInitialized = false;
        this.version = '1.0.0';
        this.init();
    }

    /**
     * אתחול האפליקציה
     */
    async init() {
        try {
            console.log(`🍽️ מאתחל מסעדת הזיה v${this.version}`);

            // המתן לטעינת DOM
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.startApp());
            } else {
                this.startApp();
            }

        } catch (error) {
            console.error('שגיאה באתחול האפליקציה:', error);
            this.handleInitError(error);
        }
    }

    /**
     * הפעלת האפליקציה
     */
    async startApp() {
        try {
            // הצג מסך טעינה
            this.showLoadingScreen();

            // בדוק תאימות דפדפן
            if (!this.checkBrowserCompatibility()) {
                this.showBrowserCompatibilityError();
                return;
            }

            // אתחל רכיבים
            await this.initializeComponents();

            // טען נתונים
            await this.loadInitialData();

            // הגדר אירועים גלובליים
            this.setupGlobalEvents();

            // הסתר מסך טעינה
            this.hideLoadingScreen();

            // סמן כמאותחל
            this.isInitialized = true;

            console.log('✅ האפליקציה אותחלה בהצלחה');

            // הצג הודעת ברוכים הבאים
            setTimeout(() => {
                const currentTheme = themeManager?.getCurrentThemeInfo();
                if (currentTheme) {
                    showSuccess(`ברוכים הבאים למסעדת הזיה! 🍽️<br>נושא פעיל: ${currentTheme.name} ${currentTheme.icon}`, { duration: 4000 });
                } else {
                    showSuccess('ברוכים הבאים למסעדת הזיה! 🍽️', { duration: 3000 });
                }
            }, 1000);

        } catch (error) {
            console.error('שגיאה בהפעלת האפליקציה:', error);
            this.handleStartupError(error);
        }
    }

    /**
     * בדיקת תאימות דפדפן
     */
    checkBrowserCompatibility() {
        const requiredFeatures = [
            'localStorage' in window,
            'JSON' in window,
            'fetch' in window,
            'Promise' in window,
            'addEventListener' in document
        ];

        return requiredFeatures.every(feature => feature);
    }

    /**
     * אתחול רכיבים
     */
    async initializeComponents() {
        console.log('🔧 מאתחל רכיבים...');

        // בדוק שכל המחלקות זמינות
        const requiredClasses = [
            'DataStorage', 'NotificationManager', 'MenuDataManager',
            'CartManager', 'UserInterface', 'AdminPanel', 'PaymentManager', 'ThemeManager'
        ];

        for (const className of requiredClasses) {
            if (typeof window[className.toLowerCase()] === 'undefined') {
                console.warn(`⚠️ רכיב ${className} לא נטען`);
            }
        }

        // אתחל CSS משתנים
        this.initializeCSSVariables();

        // הגדר תמות - כעת מטופל על ידי ThemeManager
        // this.setupTheme();

        console.log('✅ רכיבים אותחלו');
    }

    /**
     * אתחול משתני CSS
     */
    initializeCSSVariables() {
        const root = document.documentElement;

        // צבעים ראשיים
        root.style.setProperty('--primary-gold', '#DAA520');
        root.style.setProperty('--primary-gold-hover', '#B8860B');
        root.style.setProperty('--accent-green', '#10b981');
        root.style.setProperty('--accent-blue', '#3b82f6');
        root.style.setProperty('--accent-red', '#ef4444');

        // צבעי טקסט
        root.style.setProperty('--text-primary', '#ffffff');
        root.style.setProperty('--text-secondary', '#d1d5db');

        // רקע זכוכית
        root.style.setProperty('--glass-bg', 'rgba(255, 255, 255, 0.1)');
        root.style.setProperty('--glass-border', 'rgba(255, 255, 255, 0.2)');

        // צללים
        root.style.setProperty('--shadow-sm', '0 1px 2px rgba(0, 0, 0, 0.05)');
        root.style.setProperty('--shadow-md', '0 4px 6px rgba(0, 0, 0, 0.1)');
        root.style.setProperty('--shadow-lg', '0 10px 15px rgba(0, 0, 0, 0.1)');

        // רדיוסים
        root.style.setProperty('--border-radius', '8px');
        root.style.setProperty('--border-radius-lg', '16px');
    }

    /**
     * הגדרת תמה - כעת מטופל על ידי ThemeManager
     */
    setupTheme() {
        // בדיקת העדפת משתמש - מטופל על ידי ThemeManager
        console.log('🎨 מנהל הנושאים יטפל בהגדרות התמה');
    }

    /**
     * טעינת נתונים ראשוניים
     */
    async loadInitialData() {
        console.log('📊 טוען נתונים...');

        try {
            // בדוק חיבור לאינטרנט
            await this.checkInternetConnection();

            // אתחל נתוני ברירת מחדל אם נדרש
            await this.initializeDefaultData();

            // טען הגדרות
            this.loadSettings();

            console.log('✅ נתונים נטענו');

        } catch (error) {
            console.warn('⚠️ שגיאה בטעינת נתונים:', error);
            // המשך בלי נתונים חיצוניים
        }
    }

    /**
     * בדיקת חיבור לאינטרנט
     */
    async checkInternetConnection() {
        if (!navigator.onLine) {
            console.warn('⚠️ אין חיבור לאינטרנט');
            showWarning('אין חיבור לאינטרנט - עובד במצב לא מקוון');
            return false;
        }

        try {
            // בדיקה פשוטה
            await fetch('https://www.google.com/favicon.ico', {
                mode: 'no-cors',
                cache: 'no-cache',
                timeout: 5000
            });
            return true;
        } catch {
            console.warn('⚠️ חיבור לאינטרנט איטי או לא יציב');
            return false;
        }
    }

    /**
     * אתחול נתוני ברירת מחדל
     */
    async initializeDefaultData() {
        // בדוק אם יש כבר נתונים
        const existingMenu = DataManager.getMenu();

        if (!existingMenu.categories || existingMenu.categories.length === 0) {
            console.log('🍽️ יוצר נתוני תפריט ברירת מחדל...');

            // יצור תפריט ברירת מחדל
            menuData.createDefaultMenu();

            showInfo('נוצר תפריט ברירת מחדל');
        }

        // בדוק הגדרות בסיסיות
        const basicSettings = {
            restaurantName: CONFIG.restaurant.name,
            restaurantPhone: CONFIG.restaurant.phone,
            restaurantAddress: CONFIG.restaurant.address,
            preparationTime: CONFIG.restaurant.preparationTime,
            deliveryFee: CONFIG.restaurant.deliveryFee
        };

        Object.entries(basicSettings).forEach(([key, value]) => {
            if (DataManager.getSetting(key) === null) {
                DataManager.setSetting(key, value);
            }
        });
    }

    /**
     * טעינת הגדרות
     */
    loadSettings() {
        const settings = DataManager.getSettings();

        // עדכן CONFIG עם הגדרות שמורות
        if (settings.preparationTime) {
            CONFIG.restaurant.preparationTime = settings.preparationTime;
        }

        if (settings.deliveryFee) {
            CONFIG.restaurant.deliveryFee = settings.deliveryFee;
        }
    }

    /**
     * הגדרת אירועים גלובליים
     */
    setupGlobalEvents() {
        // אירועי רשת
        window.addEventListener('online', () => {
            showSuccess('חיבור לאינטרנט חודש');
        });

        window.addEventListener('offline', () => {
            showWarning('אין חיבור לאינטרנט - עובד במצב לא מקוון');
        });

        // אירועי חלון
        window.addEventListener('beforeunload', (e) => {
            // שמור נתונים לפני סגירה
            this.saveBeforeUnload();
        });

        // אירועי מקלדת גלובליים
        document.addEventListener('keydown', (e) => {
            this.handleGlobalKeyboard(e);
        });

        // אירועי עכבר
        document.addEventListener('contextmenu', (e) => {
            // בטל תפריט לחיצה ימנית על אלמנטים מסוימים
            if (e.target.classList.contains('no-context-menu')) {
                e.preventDefault();
            }
        });

        // מעקב אחר שגיאות
        window.addEventListener('error', (e) => {
            this.handleGlobalError(e);
        });

        window.addEventListener('unhandledrejection', (e) => {
            this.handleUnhandledPromiseRejection(e);
        });

        console.log('✅ אירועים גלובליים הוגדרו');
    }

    /**
     * טיפול במקלדת גלובלית
     */
    handleGlobalKeyboard(e) {
        // קיצורי דרך גלובליים
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'k':
                    e.preventDefault();
                    // פתח חיפוש מהיר
                    const searchInput = document.getElementById('menuSearch');
                    if (searchInput) {
                        searchInput.focus();
                        searchInput.select();
                    }
                    break;

                case 's':
                    e.preventDefault();
                    // שמור נתונים
                    this.saveAllData();
                    showSuccess('נתונים נשמרו');
                    break;

                case '/':
                    e.preventDefault();
                    // פתח עזרה
                    this.showHelp();
                    break;
            }
        }

        // ESC - סגור כל הפתוח
        if (e.key === 'Escape') {
            cart.closeCart();
        }
    }

    /**
     * שמירה לפני סגירה
     */
    saveBeforeUnload() {
        try {
            // שמור נתוני סל
            if (typeof cart !== 'undefined' && !cart.isEmpty()) {
                // אזהר המשתמש על סל לא ריק
                return 'יש לך פריטים בסל הקניות. האם אתה בטוח שברצונך לעזוב?';
            }

            // שמור נתונים חשובים
            this.saveAllData();

        } catch (error) {
            console.error('שגיאה בשמירה לפני סגירה:', error);
        }
    }

    /**
     * שמירת כל הנתונים
     */
    saveAllData() {
        try {
            if (typeof menuData !== 'undefined') {
                menuData.saveMenu();
            }

            if (typeof cart !== 'undefined') {
                cart.saveCart();
            }

            return true;
        } catch (error) {
            console.error('שגיאה בשמירת נתונים:', error);
            return false;
        }
    }

    /**
     * הצגת מסך טעינה
     */
    showLoadingScreen() {
        const loadingHTML = `
            <div id="app-loading-screen" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                color: white;
            ">
                <div style="text-align: center;">
                    <div style="font-size: 4rem; margin-bottom: 2rem; animation: bounce 2s infinite;">🍽️</div>
                    <h1 style="font-size: 3rem; color: var(--primary-gold); margin-bottom: 1rem; font-weight: 700;">הזיה</h1>
                    <p style="font-size: 1.2rem; margin-bottom: 3rem; opacity: 0.8;">מסעדת בשר כשרה</p>
                    <div class="spinner" style="margin: 0 auto;"></div>
                    <p style="margin-top: 1rem; opacity: 0.6;">טוען...</p>
                </div>
            </div>

            <style>
                @keyframes bounce {
                    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                    40% { transform: translateY(-20px); }
                    60% { transform: translateY(-10px); }
                }
            </style>
        `;

        document.body.insertAdjacentHTML('afterbegin', loadingHTML);
    }

    /**
     * הסרת מסך טעינה
     */
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('app-loading-screen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            loadingScreen.style.transition = 'opacity 0.5s ease';

            setTimeout(() => {
                loadingScreen.remove();
            }, 500);
        }
    }

    /**
     * הצגת שגיאת תאימות דפדפן
     */
    showBrowserCompatibilityError() {
        const errorHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: #1a1a1a;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                color: white;
                text-align: center;
                padding: 2rem;
            ">
                <div>
                    <div style="font-size: 4rem; margin-bottom: 2rem;">⚠️</div>
                    <h1 style="color: #ef4444; margin-bottom: 1rem;">דפדפן לא נתמך</h1>
                    <p style="margin-bottom: 2rem; line-height: 1.6;">
                        הדפדפן שלך אינו תומך בתכונות הנדרשות.<br>
                        אנא עדכן את הדפדפן או השתמש בדפדפן מודרני יותר.
                    </p>
                    <button onclick="location.reload()" style="
                        background: var(--primary-gold);
                        color: black;
                        border: none;
                        padding: 1rem 2rem;
                        border-radius: 8px;
                        font-weight: 700;
                        cursor: pointer;
                    ">נסה שוב</button>
                </div>
            </div>
        `;

        document.body.innerHTML = errorHTML;
    }

    /**
     * טיפול בשגיאות אתחול
     */
    handleInitError(error) {
        console.error('❌ כישלון באתחול:', error);

        const errorHTML = `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(239, 68, 68, 0.1);
                border: 1px solid #ef4444;
                color: #ef4444;
                padding: 2rem;
                border-radius: 16px;
                text-align: center;
                z-index: 10000;
            ">
                <div style="font-size: 2rem; margin-bottom: 1rem;">❌</div>
                <h3>שגיאה באתחול האפליקציה</h3>
                <p style="margin: 1rem 0; opacity: 0.8;">${error.message}</p>
                <button onclick="location.reload()" style="
                    background: #ef4444;
                    color: white;
                    border: none;
                    padding: 0.5rem 1rem;
                    border-radius: 8px;
                    cursor: pointer;
                ">טען מחדש</button>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', errorHTML);
    }

    /**
     * טיפול בשגיאות הפעלה
     */
    handleStartupError(error) {
        this.hideLoadingScreen();
        showError('שגיאה בהפעלת האפליקציה: ' + error.message);
    }

    /**
     * טיפול בשגיאות גלובליות
     */
    handleGlobalError(error) {
        console.error('שגיאה גלובלית:', error);

        // אל תהצג הודעות לשגיאות רגילות של סקריפטים
        if (error.filename && error.filename.includes('extensions')) {
            return;
        }

        showError('אירעה שגיאה לא צפויה', { duration: 5000 });
    }

    /**
     * טיפול ב-Promise שנדחו
     */
    handleUnhandledPromiseRejection(error) {
        console.error('Promise נדחה:', error.reason);

        // אל תהצג הודעות לדחיות רגילות
        if (error.reason && typeof error.reason.message === 'string') {
            if (error.reason.message.includes('fetch') || error.reason.message.includes('network')) {
                return; // שגיאות רשת רגילות
            }
        }
    }

    /**
     * הצגת עזרה
     */
    showHelp() {
        const helpHTML = `
            <div class="modal" style="display: flex;">
                <div class="modal-content">
                    <h2>🔧 עזרה מהירה</h2>
                    <div style="text-align: right; line-height: 1.6;">
                        <h4 style="color: var(--primary-gold);">קיצורי מקלדת:</h4>
                        <ul style="list-style: none; padding: 0;">
                            <li><kbd>Ctrl + K</kbd> - פתח חיפוש</li>
                            <li><kbd>Ctrl + S</kbd> - שמור נתונים</li>
                            <li><kbd>ESC</kbd> - סגור תפריטים</li>
                        </ul>

                        <h4 style="color: var(--primary-gold);">טיפים:</h4>
                        <ul style="list-style: none; padding: 0;">
                            <li>🔍 השתמש בחיפוש למציאת מנות</li>
                            <li>🛒 לחץ על הסל לראות פריטים</li>
                            <li>📱 הטלפון מותאם למובייל</li>
                        </ul>
                    </div>
                    <div style="text-align: center; margin-top: 2rem;">
                        <button class="btn btn-primary" onclick="this.closest('.modal').remove()">
                            👍 הבנתי
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', helpHTML);
    }

    /**
     * פונקציות שירות
     */
    getAppInfo() {
        return {
            version: this.version,
            initialized: this.isInitialized,
            timestamp: new Date().toISOString(),
            storage: DataManager.getStorageInfo(),
            menu: menuData?.getMenuStats(),
            cart: cart?.getItemCount() || 0
        };
    }

    /**
     * איפוס מלא של האפליקציה
     */
    resetApp() {
        if (!confirm('האם אתה בטוח שברצונך לאפס את האפליקציה? כל הנתונים יימחקו!')) {
            return;
        }

        try {
            // נקה אחסון
            DataManager.clearAllData();

            // איפוס סל
            if (typeof cart !== 'undefined') {
                cart.clearCart();
            }

            // טען מחדש
            location.reload();

        } catch (error) {
            showError('שגיאה באיפוס האפליקציה: ' + error.message);
        }
    }
}

// יצירת מופע האפליקציה
const app = new HazyaRestaurantApp();

// הוסף לקונסול לבדיקות
window.HazyaApp = app;

// פונקציות גלובליות לבדיקה
window.getAppInfo = () => app.getAppInfo();
window.resetApp = () => app.resetApp();