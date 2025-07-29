// js/settings-management.js - ניהול הגדרות מערכת

/**
 * מחלקה לניהול הגדרות המערכת
 */
class SettingsManagement {
    constructor() {
        this.settings = {};
        this.defaultSettings = {
            // הגדרות מסעדה
            restaurantName: CONFIG.restaurant.name,
            restaurantPhone: CONFIG.restaurant.phone,
            restaurantAddress: CONFIG.restaurant.address,
            restaurantEmail: CONFIG.restaurant.email,
            
            // הגדרות הזמנות
            preparationTime: CONFIG.restaurant.preparationTime,
            deliveryFee: CONFIG.restaurant.deliveryFee,
            sendOrderEmails: true,
            requireCustomerInfo: true,
            maxOrdersPerHour: 20,
            minOrderAmount: 50,
            
            // הגדרות תשלום
            enableCashPayment: true,
            enableBitPayment: true,
            bitBusinessPhone: CONFIG.payment.bitBusinessPhone,
            bitBusinessName: CONFIG.payment.bitBusinessName,
            bitInstantCharge: CONFIG.payment.bitInstantCharge,
            
            // הגדרות מערכת
            enableNotifications: true,
            enableSounds: false,
            autoRefreshOrders: true,
            refreshInterval: 30,
            maxOrderHistory: 100,
            enableAnalytics: true,
            
            // הגדרות UI
            theme: 'dark',
            language: 'he',
            showWelcomeMessage: true,
            enableAnimations: true,
            compactMode: false,
            
            // הגדרות עסקיות
            businessHours: {
                sunday: { open: '10:00', close: '23:00', isOpen: true },
                monday: { open: '10:00', close: '23:00', isOpen: true },
                tuesday: { open: '10:00', close: '23:00', isOpen: true },
                wednesday: { open: '10:00', close: '23:00', isOpen: true },
                thursday: { open: '10:00', close: '23:00', isOpen: true },
                friday: { open: '10:00', close: '15:00', isOpen: true },
                saturday: { open: '20:00', close: '23:00', isOpen: true }
            },
            
            // הגדרות אבטחה
            adminSessionTimeout: 30,
            requireStrongPassword: false,
            enableTwoFactor: false,
            logUserActions: true
        };
        this.init();
    }

    /**
     * אתחול ניהול הגדרות
     */
    init() {
        this.loadSettings();
        this.bindEvents();
    }

    /**
     * טעינת הגדרות
     */
    loadSettings() {
        this.settings = DataManager.getSettings();
        
        // מזג עם הגדרות ברירת מחדל
        this.settings = { ...this.defaultSettings, ...this.settings };
        
        // יישם הגדרות
        this.applySettings();
    }

    /**
     * שמירת הגדרות
     */
    saveSettings() {
        DataManager.saveSettings(this.settings);
        this.applySettings();
    }

    /**
     * יישום הגדרות
     */
    applySettings() {
        // עדכן CONFIG
        CONFIG.restaurant.name = this.settings.restaurantName;
        CONFIG.restaurant.phone = this.settings.restaurantPhone;
        CONFIG.restaurant.address = this.settings.restaurantAddress;
        CONFIG.restaurant.email = this.settings.restaurantEmail;
        CONFIG.restaurant.preparationTime = this.settings.preparationTime;
        CONFIG.restaurant.deliveryFee = this.settings.deliveryFee;

        // עדכן הגדרות תשלום
        CONFIG.payment.bitBusinessPhone = this.settings.bitBusinessPhone;
        CONFIG.payment.bitBusinessName = this.settings.bitBusinessName;
        CONFIG.payment.bitInstantCharge = this.settings.bitInstantCharge;

        // עדכן הגדרות UI
        this.applyUISettings();
        
        // עדכן הגדרות מערכת
        this.applySystemSettings();
    }

    /**
     * יישום הגדרות UI
     */
    applyUISettings() {
        document.body.setAttribute('data-theme', this.settings.theme);
        document.body.setAttribute('data-compact', this.settings.compactMode);
        
        if (!this.settings.enableAnimations) {
            document.body.classList.add('no-animations');
        } else {
            document.body.classList.remove('no-animations');
        }
    }

    /**
     * יישום הגדרות מערכת
     */
    applySystemSettings() {
        // הגדרת זמן קפיצת סשן
        if (typeof admin !== 'undefined') {
            CONFIG.admin.sessionTimeout = this.settings.adminSessionTimeout * 60 * 1000;
        }

        // הגדרת רענון אוטומטי
        if (typeof ordersManagement !== 'undefined') {
            ordersManagement.autoRefresh = this.settings.autoRefreshOrders;
            if (ordersManagement.refreshInterval) {
                clearInterval(ordersManagement.refreshInterval);
            }
            if (this.settings.autoRefreshOrders) {
                ordersManagement.setupAutoRefresh();
            }
        }
    }

    /**
     * טעינת ניהול הגדרות לפאנל אדמין
     */
    loadSettingsManagement() {
        const container = document.getElementById('settingsTab');
        if (!container) return;

        container.innerHTML = this.renderSettingsContent();
        this.populateSettingsForm();
        this.attachSettingsEvents();
    }

    /**
     * רינדור תוכן הגדרות
     */
    renderSettingsContent() {
        return `
            <div class="settings-management">
                <!-- Restaurant Settings -->
                <div class="settings-section">
                    <h4>🏪 פרטי מסעדה</h4>
                    <div class="settings-grid">
                        <div class="form-group">
                            <label for="restaurantName">שם המסעדה:</label>
                            <input type="text" id="restaurantName" placeholder="שם המסעדה">
                        </div>
                        <div class="form-group">
                            <label for="restaurantPhone">טלפון:</label>
                            <input type="tel" id="restaurantPhone" placeholder="03-1234567">
                        </div>
                        <div class="form-group">
                            <label for="restaurantEmail">דוא"ל:</label>
                            <input type="email" id="restaurantEmail" placeholder="restaurant@example.com">
                        </div>
                        <div class="form-group">
                            <label for="restaurantAddress">כתובת:</label>
                            <input type="text" id="restaurantAddress" placeholder="כתובת המסעדה">
                        </div>
                    </div>
                </div>

                <!-- Order Settings -->
                <div class="settings-section">
                    <h4>🛍️ הגדרות הזמנות</h4>
                    <div class="settings-grid">
                        <div class="form-group">
                            <label for="preparationTime">זמן הכנה משוער (דקות):</label>
                            <input type="number" id="preparationTime" min="5" max="120">
                        </div>
                        <div class="form-group">
                            <label for="deliveryFee">דמי משלוח (₪):</label>
                            <input type="number" id="deliveryFee" min="0" max="100" step="0.5">
                        </div>
                        <div class="form-group">
                            <label for="minOrderAmount">סכום הזמנה מינימלי (₪):</label>
                            <input type="number" id="minOrderAmount" min="0" step="5">
                        </div>
                        <div class="form-group">
                            <label for="maxOrdersPerHour">מקסימום הזמנות לשעה:</label>
                            <input type="number" id="maxOrdersPerHour" min="1" max="100">
                        </div>
                    </div>
                    
                    <div class="checkbox-group">
                        <label>
                            <input type="checkbox" id="sendOrderEmails">
                            📧 שלח מייל אוטומטי עם כל הזמנה
                        </label>
                        <label>
                            <input type="checkbox" id="requireCustomerInfo">
                            📝 חייב מילוי פרטי לקוח
                        </label>
                    </div>
                </div>

                <!-- Payment Settings -->
                <div class="settings-section">
                    <h4>💳 הגדרות תשלום</h4>
                    <div class="checkbox-group">
                        <label>
                            <input type="checkbox" id="enableCashPayment">
                            💵 אפשר תשלום במזומן
                        </label>
                        <label>
                            <input type="checkbox" id="enableBitPayment">
                            📱 אפשר תשלום בביט
                        </label>
                    </div>
                    
                    <div class="bit-settings" id="bitSettings">
                        <h5>📱 הגדרות ביט</h5>
                        <div class="settings-grid">
                            <div class="form-group">
                                <label for="bitBusinessPhone">מספר ביט עסקי:</label>
                                <input type="tel" id="bitBusinessPhone" placeholder="050-1234567">
                            </div>
                            <div class="form-group">
                                <label for="bitBusinessName">שם עסק בביט:</label>
                                <input type="text" id="bitBusinessName" placeholder="שם העסק">
                            </div>
                        </div>
                        <label>
                            <input type="checkbox" id="bitInstantCharge">
                            ⚡ חיוב מיידי (ללא המתנה לאישור לקוח)
                        </label>
                    </div>
                </div>

                <!-- Business Hours -->
                <div class="settings-section">
                    <h4>🕐 שעות פעילות</h4>
                    <div class="business-hours">
                        ${this.renderBusinessHours()}
                    </div>
                </div>

                <!-- System Settings -->
                <div class="settings-section">
                    <h4>⚙️ הגדרות מערכת</h4>
                    <div class="settings-grid">
                        <div class="form-group">
                            <label for="refreshInterval">מרווח רענון (שניות):</label>
                            <input type="number" id="refreshInterval" min="10" max="300">
                        </div>
                        <div class="form-group">
                            <label for="maxOrderHistory">מקסימום הזמנות בהיסטוריה:</label>
                            <input type="number" id="maxOrderHistory" min="50" max="1000" step="50">
                        </div>
                        <div class="form-group">
                            <label for="adminSessionTimeout">זמן קפיצת סשן מנהל (דקות):</label>
                            <input type="number" id="adminSessionTimeout" min="5" max="120">
                        </div>
                    </div>
                    
                    <div class="checkbox-group">
                        <label>
                            <input type="checkbox" id="enableNotifications">
                            🔔 אפשר התראות מערכת
                        </label>
                        <label>
                            <input type="checkbox" id="enableSounds">
                            🔊 אפשר צלילי התראה
                        </label>
                        <label>
                            <input type="checkbox" id="autoRefreshOrders">
                            🔄 רענון אוטומטי של הזמנות
                        </label>
                        <label>
                            <input type="checkbox" id="enableAnalytics">
                            📊 אפשר איסוף נתונים סטטיסטיים
                        </label>
                        <label>
                            <input type="checkbox" id="logUserActions">
                            📝 רשום פעולות משתמש
                        </label>
                    </div>
                </div>

                <!-- UI Settings -->
                <div class="settings-section">
                    <h4>🎨 הגדרות תצוגה</h4>
                    <div class="settings-grid">
                        <div class="form-group">
                            <label for="themeSelect">ערכת צבעים:</label>
                            <select id="themeSelect">
                                <option value="dark">כהה</option>
                                <option value="light">בהיר</option>
                                <option value="auto">אוטומטי (לפי מערכת)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="languageSelect">שפה:</label>
                            <select id="languageSelect">
                                <option value="he">עברית</option>
                                <option value="en">English</option>
                                <option value="ar">العربية</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="checkbox-group">
                        <label>
                            <input type="checkbox" id="enableAnimations">
                            🎭 אפשר אנימציות
                        </label>
                        <label>
                            <input type="checkbox" id="compactMode">
                            📱 מצב קומפקטי
                        </label>
                        <label>
                            <input type="checkbox" id="showWelcomeMessage">
                            👋 הצג הודעת ברוכים הבאים
                        </label>
                    </div>
                </div>

                <!-- Security Settings -->
                <div class="settings-section">
                    <h4>🔒 הגדרות אבטחה</h4>
                    <div class="info-box">
                        <p><strong>⚠️ שים לב:</strong> שינוי הגדרות אבטחה עלול להשפיע על גישה למערכת</p>
                    </div>
                    
                    <div class="checkbox-group">
                        <label>
                            <input type="checkbox" id="requireStrongPassword">
                            🔐 דרוש סיסמה חזקה
                        </label>
                        <label>
                            <input type="checkbox" id="enableTwoFactor">
                            📱 אפשר אימות דו-שלבי (בפיתוח)
                        </label>
                    </div>
                </div>

                <!-- Save/Reset Actions -->
                <div class="settings-section">
                    <h4>💾 פעולות</h4>
                    <div class="settings-actions">
                        <button class="btn btn-primary" onclick="settingsManagement.saveAllSettings()">
                            💾 שמור כל הגדרות
                        </button>
                        <button class="btn btn-secondary" onclick="settingsManagement.exportSettings()">
                            📤 יצא הגדרות
                        </button>
                        <button class="btn btn-secondary" onclick="settingsManagement.importSettings()">
                            📥 יבא הגדרות
                        </button>
                        <button class="btn btn-warning" onclick="settingsManagement.resetToDefaults()">
                            🔄 איפוס לברירת מחדל
                        </button>
                        <button class="btn btn-info" onclick="settingsManagement.testAllSystems()">
                            🧪 בדוק כל המערכות
                        </button>
                    </div>
                </div>

                <!-- System Status -->
                <div class="settings-section">
                    <h4>📊 סטטוס מערכת</h4>
                    <div id="systemStatus">
                        ${this.renderSystemStatus()}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * רינדור שעות פעילות
     */
    renderBusinessHours() {
        const days = [
            { key: 'sunday', name: 'ראשון' },
            { key: 'monday', name: 'שני' },
            { key: 'tuesday', name: 'שלישי' },
            { key: 'wednesday', name: 'רביעי' },
            { key: 'thursday', name: 'חמישי' },
            { key: 'friday', name: 'שישי' },
            { key: 'saturday', name: 'שבת' }
        ];

        return days.map(day => {
            const hours = this.settings.businessHours[day.key];
            return `
                <div class="business-hour-row">
                    <div class="day-name">${day.name}</div>
                    <div class="day-controls">
                        <label class="day-toggle">
                            <input type="checkbox" 
                                   id="day_${day.key}" 
                                   ${hours.isOpen ? 'checked' : ''}>
                            פתוח
                        </label>
                        <div class="time-inputs ${!hours.isOpen ? 'disabled' : ''}">
                            <input type="time" 
                                   id="open_${day.key}" 
                                   value="${hours.open}"
                                   ${!hours.isOpen ? 'disabled' : ''}>
                            <span>עד</span>
                            <input type="time" 
                                   id="close_${day.key}" 
                                   value="${hours.close}"
                                   ${!hours.isOpen ? 'disabled' : ''}>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * רינדור סטטוס מערכת
     */
    renderSystemStatus() {
        const storageInfo = DataManager.getStorageInfo();
        const menuStats = menuData.getMenuStats();
        
        return `
            <div class="status-grid">
                <div class="status-item">
                    <div class="status-label">💾 אחסון מקומי</div>
                    <div class="status-value ${storageInfo.available ? 'success' : 'error'}">
                        ${storageInfo.available ? '✅ זמין' : '❌ לא זמין'}
                    </div>
                </div>
                <div class="status-item">
                    <div class="status-label">📦 גודל נתונים</div>
                    <div class="status-value">${Math.round(storageInfo.size / 1024)} KB</div>
                </div>
                <div class="status-item">
                    <div class="status-label">🍽️ פריטי תפריט</div>
                    <div class="status-value">${menuStats.totalItems}</div>
                </div>
                <div class="status-item">
                    <div class="status-label">👥 לקוחות</div>
                    <div class="status-value">${DataManager.getCustomers().length}</div>
                </div>
                <div class="status-item">
                    <div class="status-label">📋 הזמנות</div>
                    <div class="status-value">${DataManager.getOrders().length}</div>
                </div>
                <div class="status-item">
                    <div class="status-label">🌐 חיבור אינטרנט</div>
                    <div class="status-value ${navigator.onLine ? 'success' : 'error'}">
                        ${navigator.onLine ? '✅ מחובר' : '❌ לא מחובר'}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * מילוי טופס הגדרות
     */
    populateSettingsForm() {
        // פרטי מסעדה
        document.getElementById('restaurantName').value = this.settings.restaurantName || '';
        document.getElementById('restaurantPhone').value = this.settings.restaurantPhone || '';
        document.getElementById('restaurantEmail').value = this.settings.restaurantEmail || '';
        document.getElementById('restaurantAddress').value = this.settings.restaurantAddress || '';

        // הגדרות הזמנות
        document.getElementById('preparationTime').value = this.settings.preparationTime || '';
        document.getElementById('deliveryFee').value = this.settings.deliveryFee || '';
        document.getElementById('minOrderAmount').value = this.settings.minOrderAmount || '';
        document.getElementById('maxOrdersPerHour').value = this.settings.maxOrdersPerHour || '';
        document.getElementById('sendOrderEmails').checked = this.settings.sendOrderEmails;
        document.getElementById('requireCustomerInfo').checked = this.settings.requireCustomerInfo;

        // הגדרות תשלום
        document.getElementById('enableCashPayment').checked = this.settings.enableCashPayment;
        document.getElementById('enableBitPayment').checked = this.settings.enableBitPayment;
        document.getElementById('bitBusinessPhone').value = this.settings.bitBusinessPhone || '';
        document.getElementById('bitBusinessName').value = this.settings.bitBusinessName || '';
        document.getElementById('bitInstantCharge').checked = this.settings.bitInstantCharge;

        // הגדרות מערכת
        document.getElementById('refreshInterval').value = this.settings.refreshInterval || '';
        document.getElementById('maxOrderHistory').value = this.settings.maxOrderHistory || '';
        document.getElementById('adminSessionTimeout').value = this.settings.adminSessionTimeout || '';
        document.getElementById('enableNotifications').checked = this.settings.enableNotifications;
        document.getElementById('enableSounds').checked = this.settings.enableSounds;
        document.getElementById('autoRefreshOrders').checked = this.settings.autoRefreshOrders;
        document.getElementById('enableAnalytics').checked = this.settings.enableAnalytics;
        document.getElementById('logUserActions').checked = this.settings.logUserActions;

        // הגדרות UI
        document.getElementById('themeSelect').value = this.settings.theme || 'dark';
        document.getElementById('languageSelect').value = this.settings.language || 'he';
        document.getElementById('enableAnimations').checked = this.settings.enableAnimations;
        document.getElementById('compactMode').checked = this.settings.compactMode;
        document.getElementById('showWelcomeMessage').checked = this.settings.showWelcomeMessage;

        // הגדרות אבטחה
        document.getElementById('requireStrongPassword').checked = this.settings.requireStrongPassword;
        document.getElementById('enableTwoFactor').checked = this.settings.enableTwoFactor;

        // עדכן הצגת הגדרות ביט
        this.toggleBitSettings();
    }

    /**
     * החלפת הצגת הגדרות ביט
     */
    toggleBitSettings() {
        const bitEnabled = document.getElementById('enableBitPayment').checked;
        const bitSettings = document.getElementById('bitSettings');
        
        if (bitSettings) {
            bitSettings.style.display = bitEnabled ? 'block' : 'none';
        }
    }

    /**
     * איסוף הגדרות מהטופס
     */
    collectSettingsFromForm() {
        const newSettings = { ...this.settings };

        // פרטי מסעדה
        newSettings.restaurantName = document.getElementById('restaurantName').value.trim();
        newSettings.restaurantPhone = document.getElementById('restaurantPhone').value.trim();
        newSettings.restaurantEmail = document.getElementById('restaurantEmail').value.trim();
        newSettings.restaurantAddress = document.getElementById('restaurantAddress').value.trim();

        // הגדרות הזמנות
        newSettings.preparationTime = parseInt(document.getElementById('preparationTime').value) || 25;
        newSettings.deliveryFee = parseFloat(document.getElementById('deliveryFee').value) || 0;
        newSettings.minOrderAmount = parseFloat(document.getElementById('minOrderAmount').value) || 0;
        newSettings.maxOrdersPerHour = parseInt(document.getElementById('maxOrdersPerHour').value) || 20;
        newSettings.sendOrderEmails = document.getElementById('sendOrderEmails').checked;
        newSettings.requireCustomerInfo = document.getElementById('requireCustomerInfo').checked;

        // הגדרות תשלום
        newSettings.enableCashPayment = document.getElementById('enableCashPayment').checked;
        newSettings.enableBitPayment = document.getElementById('enableBitPayment').checked;
        newSettings.bitBusinessPhone = document.getElementById('bitBusinessPhone').value.trim();
        newSettings.bitBusinessName = document.getElementById('bitBusinessName').value.trim();
        newSettings.bitInstantCharge = document.getElementById('bitInstantCharge').checked;

        // שעות פעילות
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        days.forEach(day => {
            newSettings.businessHours[day] = {
                isOpen: document.getElementById(`day_${day}`).checked,
                open: document.getElementById(`open_${day}`).value,
                close: document.getElementById(`close_${day}`).value
            };
        });

        // הגדרות מערכת
        newSettings.refreshInterval = parseInt(document.getElementById('refreshInterval').value) || 30;
        newSettings.maxOrderHistory = parseInt(document.getElementById('maxOrderHistory').value) || 100;
        newSettings.adminSessionTimeout = parseInt(document.getElementById('adminSessionTimeout').value) || 30;
        newSettings.enableNotifications = document.getElementById('enableNotifications').checked;
        newSettings.enableSounds = document.getElementById('enableSounds').checked;
        newSettings.autoRefreshOrders = document.getElementById('autoRefreshOrders').checked;
        newSettings.enableAnalytics = document.getElementById('enableAnalytics').checked;
        newSettings.logUserActions = document.getElementById('logUserActions').checked;

        // הגדרות UI
        newSettings.theme = document.getElementById('themeSelect').value;
        newSettings.language = document.getElementById('languageSelect').value;
        newSettings.enableAnimations = document.getElementById('enableAnimations').checked;
        newSettings.compactMode = document.getElementById('compactMode').checked;
        newSettings.showWelcomeMessage = document.getElementById('showWelcomeMessage').checked;

        // הגדרות אבטחה
        newSettings.requireStrongPassword = document.getElementById('requireStrongPassword').checked;
        newSettings.enableTwoFactor = document.getElementById('enableTwoFactor').checked;

        return newSettings;
    }

    /**
     * ולידציה של הגדרות
     */
    validateSettings(settings) {
        const errors = [];

        // בדיקות בסיסיות
        if (!settings.restaurantName) {
            errors.push('שם המסעדה נדרש');
        }

        if (settings.restaurantPhone && !validateIsraeliPhone(settings.restaurantPhone)) {
            errors.push('מספר טלפון לא תקין');
        }

        if (settings.restaurantEmail && !validateEmail(settings.restaurantEmail)) {
            errors.push('כתובת דוא"ל לא תקינה');
        }

        if (settings.preparationTime < 5 || settings.preparationTime > 120) {
            errors.push('זמן הכנה חייב להיות בין 5 ל-120 דקות');
        }

        if (settings.deliveryFee < 0) {
            errors.push('דמי משלוח לא יכולים להיות שליליים');
        }

        if (settings.enableBitPayment) {
            if (!settings.bitBusinessPhone) {
                errors.push('מספר ביט עסקי נדרש כאשר תשלום ביט מופעל');
            } else if (!validateIsraeliPhone(settings.bitBusinessPhone)) {
                errors.push('מספר ביט עסקי לא תקין');
            }

            if (!settings.bitBusinessName) {
                errors.push('שם עסק בביט נדרש');
            }
        }

        return errors;
    }

    /**
     * שמירת כל הגדרות
     */
    saveAllSettings() {
        try {
            const newSettings = this.collectSettingsFromForm();
            const validationErrors = this.validateSettings(newSettings);

            if (validationErrors.length > 0) {
                showError('שגיאות בהגדרות:<br>' + validationErrors.join('<br>'));
                return;
            }

            this.settings = newSettings;
            this.saveSettings();

            showSuccess('כל ההגדרות נשמרו בהצלחה');

        } catch (error) {
            showError('שגיאה בשמירת הגדרות: ' + error.message);
        }
    }

    /**
     * איפוס לברירת מחדל
     */
    resetToDefaults() {
        if (!confirm('האם אתה בטוח שברצונך לאפס את כל ההגדרות לברירת מחדל?')) {
            return;
        }

        this.settings = { ...this.defaultSettings };
        this.saveSettings();
        this.populateSettingsForm();

        showSuccess('הגדרות אופסו לברירת מחדל');
    }

    /**
     * ייצוא הגדרות
     */
    exportSettings() {
        const exportData = {
            settings: this.settings,
            exportDate: new Date().toISOString(),
            version: '1.0',
            restaurantName: this.settings.restaurantName
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const fileName = `hazya-settings-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', fileName);
        linkElement.click();
        
        showSuccess('הגדרות יוצאו בהצלחה');
    }

    /**
     * יבוא הגדרות
     */
    importSettings() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const importData = JSON.parse(event.target.result);
                    
                    if (!importData.settings) {
                        throw new Error('קובץ הגדרות לא תקין');
                    }

                    // וולידציה
                    const validationErrors = this.validateSettings(importData.settings);
                    if (validationErrors.length > 0) {
                        throw new Error('הגדרות לא תקינות: ' + validationErrors.join(', '));
                    }

                    this.settings = { ...this.defaultSettings, ...importData.settings };
                    this.saveSettings();
                    this.populateSettingsForm();
                    
                    showSuccess('הגדרות יובאו בהצלחה');
                    
                } catch (error) {
                    showError('שגיאה ביבוא הגדרות: ' + error.message);
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    }

    /**
     * בדיקת כל המערכות
     */
    testAllSystems() {
        showLoading('בודק מערכות...');
        
        const tests = [
            { name: 'אחסון מקומי', test: () => DataManager.getStorageInfo().available },
            { name: 'נתוני תפריט', test: () => menuData.getCategories().length > 0 },
            { name: 'מערכת הזמנות', test: () => typeof ordersManagement !== 'undefined' },
            { name: 'מערכת לקוחות', test: () => typeof customersManagement !== 'undefined' },
            { name: 'ניהול מלאי', test: () => typeof inventoryManagement !== 'undefined' },
            { name: 'ניהול תשלומים', test: () => typeof payment !== 'undefined' }
        ];

        setTimeout(() => {
            const results = tests.map(test => ({
                name: test.name,
                success: test.test()
            }));

            const successCount = results.filter(r => r.success).length;
            
            notifications.hideLoading();
            
            if (successCount === tests.length) {
                showSuccess(`כל המערכות פועלות תקין (${successCount}/${tests.length})`);
            } else {
                const failedSystems = results.filter(r => !r.success).map(r => r.name);
                showWarning(`${successCount}/${tests.length} מערכות פועלות. בעיות: ${failedSystems.join(', ')}`);
            }

            // עדכן סטטוס מערכת
            document.getElementById('systemStatus').innerHTML = this.renderSystemStatus();
        }, 2000);
    }

    /**
     * קישור אירועים
     */
    bindEvents() {
        // עדכון הגדרות ביט כאשר מפעילים/מכבים
        document.addEventListener('change', (e) => {
            if (e.target.id === 'enableBitPayment') {
                this.toggleBitSettings();
            }
        });

        // עדכון זמני עבודה כאשר מפעילים/מכבים יום
        document.addEventListener('change', (e) => {
            if (e.target.id.startsWith('day_')) {
                const day = e.target.id.replace('day_', '');
                const isOpen = e.target.checked;
                const openInput = document.getElementById(`open_${day}`);
                const closeInput = document.getElementById(`close_${day}`);
                
                if (openInput && closeInput) {
                    openInput.disabled = !isOpen;
                    closeInput.disabled = !isOpen;
                    
                    if (isOpen) {
                        openInput.parentElement.classList.remove('disabled');
                    } else {
                        openInput.parentElement.classList.add('disabled');
                    }
                }
            }
        });
    }

    /**
     * קישור אירועים לטאב הגדרות
     */
    attachSettingsEvents() {
        // האירועים כבר מקושרים ב-bindEvents
    }

    /**
     * בדיקה אם המסעדה פתוחה כעת
     */
    isRestaurantOpen() {
        const now = new Date();
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const today = dayNames[now.getDay()];
        
        const todayHours = this.settings.businessHours[today];
        if (!todayHours || !todayHours.isOpen) {
            return false;
        }

        const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
        return currentTime >= todayHours.open && currentTime <= todayHours.close;
    }

    /**
     * קבלת הודעת סטטוס מסעדה
     */
    getRestaurantStatusMessage() {
        if (this.isRestaurantOpen()) {
            return '🟢 המסעדה פתוחה כעת';
        } else {
            // מצא את הפעם הבאה שהמסעדה תיפתח
            const nextOpen = this.getNextOpenTime();
            return `🔴 המסעדה סגורה${nextOpen ? ` - תיפתח ${nextOpen}` : ''}`;
        }
    }

    /**
     * קבלת הזמן הבא שהמסעדה תיפתח
     */
    getNextOpenTime() {
        const now = new Date();
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        
        // חפש בשבוע הבא
        for (let i = 1; i <= 7; i++) {
            const futureDate = new Date(now);
            futureDate.setDate(now.getDate() + i);
            const dayName = dayNames[futureDate.getDay()];
            
            const dayHours = this.settings.businessHours[dayName];
            if (dayHours && dayHours.isOpen) {
                const dayNameHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'][futureDate.getDay()];
                return `יום ${dayNameHe} בשעה ${dayHours.open}`;
            }
        }
        
        return null;
    }
}

// יצירת מופע יחיד
const settingsManagement = new SettingsManagement();

// הרחבת admin עם פונקציות הגדרות
if (typeof admin !== 'undefined') {
    admin.loadSettingsManagement = settingsManagement.loadSettingsManagement.bind(settingsManagement);
}