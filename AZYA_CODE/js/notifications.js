
            <!-- NOTIFICATIONS.JS -->
            <div class="file-section">
                <div class="file-title">📁 js/notifications.js</div>
                <button class="download-btn" onclick="downloadFile('notifications.js', notificationsCode)">💾 הורד קובץ</button>
                <div class="code-block" id="notificationsCode">// js/notifications.js - מערכת התראות

                    /**
                    * מנהל התראות
                    */
                    class NotificationManager {
                    constructor() {
                    this.container = null;
                    this.init();
                    }

                    init() {
                    this.createContainer();
                    }

                    createContainer() {
                    // בדוק אם הקונטיינר כבר קיים
                    this.container = document.getElementById('notifications-container');

                    if (!this.container) {
                    this.container = document.createElement('div');
                    this.container.id = 'notifications-container';
                    this.container.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 9999;
                    max-width: 350px;
                    pointer-events: none;
                    `;
                    document.body.appendChild(this.container);
                    }
                    }

                    show(message, type = 'info', duration = 5000) {
                    const notification = this.createNotification(message, type);
                    this.container.appendChild(notification);

                    // אנימציה של הופעה
                    setTimeout(() => {
                    notification.style.transform = 'translateX(0)';
                    notification.style.opacity = '1';
                    }, 10);

                    // הסרה אוטומטית
                    setTimeout(() => {
                    this.remove(notification);
                    }, duration);

                    return notification;
                    }

                    createNotification(message, type) {
                    const notification = document.createElement('div');
                    notification.className = `notification notification-${type}`;

                    const icons = {
                    success: '✅',
                    error: '❌',
                    warning: '⚠️',
                    info: 'ℹ️'
                    };

                    const colors = {
                    success: '#10b981',
                    error: '#ef4444',
                    warning: '#f59e0b',
                    info: '#3b82f6'
                    };

                    notification.style.cssText = `
                    background: rgba(0, 0, 0, 0.9);
                    color: white;
                    padding: 15px 20px;
                    margin-bottom: 10px;
                    border-radius: 8px;
                    border-left: 4px solid ${colors[type]};
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                    transform: translateX(100%);
                    opacity: 0;
                    transition: all 0.3s ease;
                    pointer-events: auto;
                    cursor: pointer;
                    backdrop-filter: blur(10px);
                    font-family: Arial, sans-serif;
                    direction: rtl;
                    `;

                    notification.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 1.2em;">${icons[type]}</span>
                        <span style="flex: 1;">${message}</span>
                        <span style="opacity: 0.7; font-size: 0.9em;">✕</span>
                    </div>
                    `;

                    // לחיצה להסרה
                    notification.addEventListener('click', () => {
                    this.remove(notification);
                    });

                    return notification;
                    }

                    remove(notification) {
                    notification.style.transform = 'translateX(100%)';
                    notification.style.opacity = '0';

                    setTimeout(() => {
                    if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                    }
                    }, 300);
                    }

                    success(message, duration = 5000) {
                    return this.show(message, 'success', duration);
                    }

                    error(message, duration = 7000) {
                    return this.show(message, 'error', duration);
                    }

                    warning(message, duration = 6000) {
                    return this.show(message, 'warning', duration);
                    }

                    info(message, duration = 5000) {
                    return this.show(message, 'info', duration);
                    }

                    clear() {
                    if (this.container) {
                    this.container.innerHTML = '';
                    }
                    }
                    }

                    // יצירת מופע יחיד
                    const notificationManager = new NotificationManager();

                    // פונקציות קיצור גלובליות
                    function showSuccess(message, duration) {
                    return notificationManager.success(message, duration);
                    }

                    function showError(message, duration) {
                    return notificationManager.error(message, duration);
                    }

                    function showWarning(message, duration) {
                    return notificationManager.warning(message, duration);
                    }

                    function showInfo(message, duration) {
                    return notificationManager.info(message, duration);
                    }

                    // ייצוא לחלון הגלובלי
                    window.NotificationManager = NotificationManager;
                    window.notificationManager = notificationManager;
                    window.showSuccess = showSuccess;
                    window.showError = showError;
                    window.showWarning = showWarning;
                    window.showInfo = showInfo;

                    console.log('✅ NotificationManager נטען בהצלחה');</div>
            </div>