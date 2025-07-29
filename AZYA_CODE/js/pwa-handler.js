// js/pwa-handler.js - ניהול Progressive Web App ושירותי עובד

/**
 * מחלקה לניהול PWA
 */
class PWAHandler {
    constructor() {
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.isOnline = navigator.onLine;
        this.swRegistration = null;
        this.updateAvailable = false;
        this.init();
    }

    /**
     * אתחול PWA
     */
    init() {
        this.checkInstallation();
        this.registerServiceWorker();
        this.setupInstallPrompt();
        this.setupOfflineHandling();
        this.setupPushNotifications();
        this.bindEvents();
    }

    /**
     * בדיקת התקנה קיימת
     */
    checkInstallation() {
        // בדוק אם האפליקציה כבר מותקנת
        if (window.matchMedia('(display-mode: standalone)').matches ||
            window.navigator.standalone === true) {
            this.isInstalled = true;
            document.body.classList.add('pwa-installed');
        }
    }

    /**
     * רישום Service Worker
     */
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                this.swRegistration = await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker נרשם בהצלחה:', this.swRegistration);

                // בדוק עדכונים
                this.swRegistration.addEventListener('updatefound', () => {
                    const newWorker = this.swRegistration.installing;
                    if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                this.updateAvailable = true;
                                this.showUpdateAvailable();
                            }
                        });
                    }
                });

            } catch (error) {
                console.error('שגיאה ברישום Service Worker:', error);
            }
        }
    }

    /**
     * יצירת Service Worker בסיסי
     */
    createServiceWorker() {
        const swContent = `
            const CACHE_NAME = 'hazya-restaurant-v1';
            const urlsToCache = [
                '/',
                '/index.html',
                '/styles.css',
                '/js/main.js',
                '/js/config.js',
                '/js/utils.js',
                '/manifest.json'
            ];

            // התקנה
            self.addEventListener('install', event => {
                event.waitUntil(
                    caches.open(CACHE_NAME)
                        .then(cache => cache.addAll(urlsToCache))
                );
            });

            // הפעלה
            self.addEventListener('activate', event => {
                event.waitUntil(
                    caches.keys().then(cacheNames => {
                        return Promise.all(
                            cacheNames.map(cacheName => {
                                if (cacheName !== CACHE_NAME) {
                                    return caches.delete(cacheName);
                                }
                            })
                        );
                    })
                );
            });

            // לכידת בקשות
            self.addEventListener('fetch', event => {
                event.respondWith(
                    caches.match(event.request)
                        .then(response => {
                            // החזר מהמטמון אם קיים
                            if (response) {
                                return response;
                            }

                            // אחרת, הבא מהרשת
                            return fetch(event.request);
                        }
                    )
                );
            });

            // התראות Push
            self.addEventListener('push', event => {
                const options = {
                    body: event.data ? event.data.text() : 'הזמנה חדשה!',
                    icon: '/icon-192x192.png',
                    badge: '/badge-72x72.png',
                    vibrate: [100, 50, 100],
                    data: {
                        dateOfArrival: Date.now(),
                        primaryKey: 1
                    },
                    actions: [
                        {
                            action: 'explore',
                            title: 'צפה בהזמנה',
                            icon: '/icon-view.png'
                        },
                        {
                            action: 'close',
                            title: 'סגור',
                            icon: '/icon-close.png'
                        }
                    ]
                };

                event.waitUntil(
                    self.registration.showNotification('מסעדת הזיה', options)
                );
            });

            // לחיצה על התראה
            self.addEventListener('notificationclick', event => {
                event.notification.close();

                if (event.action === 'explore') {
                    event.waitUntil(
                        clients.openWindow('/')
                    );
                }
            });
        `;

        // צור Service Worker רק אם לא קיים
        if (!this.swRegistration) {
            const blob = new Blob([swContent], { type: 'application/javascript' });
            const swUrl = URL.createObjectURL(blob);

            navigator.serviceWorker.register(swUrl);
        }
    }

    /**
     * הגדרת בקשת התקנה
     */
    setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            // מנע את ההצגה האוטומטית
            e.preventDefault();

            // שמור את האירוע לשימוש מאוחר יותר
            this.deferredPrompt = e;

            // הצג כפתור התקנה אם לא מותקן
            if (!this.isInstalled) {
                this.showInstallButton();
            }
        });

        // האזן להתקנה שהושלמה
        window.addEventListener('appinstalled', () => {
            this.isInstalled = true;
            this.deferredPrompt = null;
            document.body.classList.add('pwa-installed');
            this.hideInstallButton();

            showSuccess('האפליקציה הותקנה בהצלחה! 🎉');
        });
    }

    /**
     * הצגת כפתור התקנה
     */
    showInstallButton() {
        // בדוק אם כבר יש כפתור
        if (document.getElementById('installButton')) return;

        const installButton = document.createElement('button');
        installButton.id = 'installButton';
        installButton.className = 'install-button';
        installButton.innerHTML = '📱 התקן אפליקציה';
        installButton.onclick = () => this.installApp();

        // הוסף לממשק
        document.body.appendChild(installButton);

        // הצג התראה
        setTimeout(() => {
            showInfo('האפליקציה זמינה להתקנה! לחץ על הכפתור למטה', {
                duration: 5000
            });
        }, 3000);
    }

    /**
     * הסתרת כפתור התקנה
     */
    hideInstallButton() {
        const installButton = document.getElementById('installButton');
        if (installButton) {
            installButton.remove();
        }
    }

    /**
     * התקנת האפליקציה
     */
    async installApp() {
        if (!this.deferredPrompt) {
            showError('התקנה לא זמינה כרגע');
            return;
        }

        try {
            // הצג את בקשת ההתקנה
            this.deferredPrompt.prompt();

            // המתן לתשובת המשתמש
            const { outcome } = await this.deferredPrompt.userChoice;

            if (outcome === 'accepted') {
                showSuccess('התקנה החלה...');
            } else {
                showInfo('התקנה בוטלה');
            }

            // נקה את הבקשה
            this.deferredPrompt = null;
            this.hideInstallButton();

        } catch (error) {
            showError('שגיאה בהתקנה: ' + error.message);
        }
    }

    /**
     * הגדרת טיפול במצב לא מקוון
     */
    setupOfflineHandling() {
        // עדכן UI כאשר מצב החיבור משתנה
        window.addEventListener('online', () => {
            this.isOnline = true;
            document.body.classList.remove('offline');
            this.showOnlineMessage();
            this.syncOfflineData();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            document.body.classList.add('offline');
            this.showOfflineMessage();
        });
    }

    /**
     * הצגת הודעת מצב מקוון
     */
    showOnlineMessage() {
        showSuccess('חיבור לאינטרנט חודש', { duration: 3000 });

        // הסר אינדיקטור offline
        const offlineIndicator = document.getElementById('offlineIndicator');
        if (offlineIndicator) {
            offlineIndicator.remove();
        }
    }

    /**
     * הצגת הודעת מצב לא מקוון
     */
    showOfflineMessage() {
        showWarning('אין חיבור לאינטרנט - עובד במצב לא מקוון', {
            persistent: true,
            duration: 0
        });

        // הצג אינדיקטור קבוע
        this.showOfflineIndicator();
    }

    /**
     * הצגת אינדיקטור לא מקוון
     */
    showOfflineIndicator() {
        if (document.getElementById('offlineIndicator')) return;

        const indicator = document.createElement('div');
        indicator.id = 'offlineIndicator';
        indicator.className = 'offline-indicator';
        indicator.innerHTML = `
            <div class="offline-content">
                <span class="offline-icon">📶</span>
                <span class="offline-text">מצב לא מקוון</span>
            </div>
        `;

        document.body.appendChild(indicator);
    }

    /**
     * סנכרון נתונים לא מקוונים
     */
    syncOfflineData() {
        const offlineOrders = DataManager.getSetting('offlineOrders', []);

        if (offlineOrders.length > 0) {
            showInfo(`מסנכרן ${offlineOrders.length} הזמנות...`);

            // כאן היית שולח את ההזמנות לשרת
            // לעת עתה רק נקה אותם
            setTimeout(() => {
                DataManager.setSetting('offlineOrders', []);
                showSuccess('סנכרון הושלם');
            }, 2000);
        }
    }

    /**
     * הגדרת התראות Push
     */
    async setupPushNotifications() {
        if (!('Notification' in window) || !('serviceWorker' in navigator)) {
            console.warn('התראות Push לא נתמכות');
            return;
        }

        // בקש הרשאה להתראות
        const permission = await Notification.requestPermission();

        if (permission === 'granted') {
            console.log('הרשאה להתראות ניתנה');
            this.enablePushNotifications();
        }
    }

    /**
     * הפעלת התראות Push
     */
    async enablePushNotifications() {
        try {
            if (!this.swRegistration) {
                console.warn('Service Worker לא נרשם');
                return;
            }

            // כאן היית מקבל מפתח ציבורי מהשרת
            const subscription = await this.swRegistration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array('YOUR_VAPID_PUBLIC_KEY')
            });

            console.log('הירשם להתראות Push:', subscription);

            // שלח את המנוי לשרת
            // await this.sendSubscriptionToServer(subscription);

        } catch (error) {
            console.error('שגיאה בהפעלת התראות:', error);
        }
    }

    /**
     * המרת מפתח VAPID
     */
    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    /**
     * שליחת התראה מקומית
     */
    sendLocalNotification(title, options = {}) {
        if (!('Notification' in window)) {
            console.warn('התראות לא נתמכות');
            return;
        }

        if (Notification.permission === 'granted') {
            const notification = new Notification(title, {
                body: options.body || '',
                icon: options.icon || '/icon-192x192.png',
                badge: '/badge-72x72.png',
                vibrate: [100, 50, 100],
                data: options.data || {},
                ...options
            });

            // סגור אוטומטי אחרי 5 שניות
            setTimeout(() => notification.close(), 5000);

            return notification;
        }
    }

    /**
     * הצגת עדכון זמין
     */
    showUpdateAvailable() {
        const updateNotification = showInfo(
            'גרסה חדשה זמינה! רוצה לעדכן?',
            {
                persistent: true,
                duration: 0
            }
        );

        // הוסף כפתור עדכון
        setTimeout(() => {
            const updateButton = document.createElement('button');
            updateButton.className = 'btn btn-primary update-button';
            updateButton.innerHTML = '🔄 עדכן עכשיו';
            updateButton.onclick = () => this.applyUpdate();

            const notification = document.getElementById(updateNotification);
            if (notification) {
                notification.appendChild(updateButton);
            }
        }, 100);
    }

    /**
     * החלת עדכון
     */
    applyUpdate() {
        if (!this.swRegistration || !this.updateAvailable) {
            showError('אין עדכון זמין');
            return;
        }

        showLoading('מעדכן אפליקציה...');

        // אמור ל-service worker החדש להפוך לפעיל
        if (this.swRegistration.waiting) {
            this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }

        // טען מחדש את הדף
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }

    /**
     * יצירת Manifest
     */
    createManifest() {
        const manifest = {
            name: 'מסעדת הזיה',
            short_name: 'הזיה',
            description: 'מסעדת בשר כשרה - הזמנות אונליין',
            start_url: '/',
            display: 'standalone',
            background_color: '#1a1a1a',
            theme_color: '#DAA520',
            orientation: 'portrait-primary',
            categories: ['food', 'business', 'shopping'],
            lang: 'he',
            dir: 'rtl',
            icons: [
                {
                    src: 'data:image/svg+xml;base64,' + btoa(`
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192">
                            <rect width="192" height="192" fill="#DAA520"/>
                            <text x="96" y="120" text-anchor="middle" font-size="80" fill="black">🍽️</text>
                        </svg>
                    `),
                    sizes: '192x192',
                    type: 'image/svg+xml'
                },
                {
                    src: 'data:image/svg+xml;base64,' + btoa(`
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                            <rect width="512" height="512" fill="#DAA520"/>
                            <text x="256" y="320" text-anchor="middle" font-size="200" fill="black">🍽️</text>
                        </svg>
                    `),
                    sizes: '512x512',
                    type: 'image/svg+xml'
                }
            ],
            shortcuts: [
                {
                    name: 'תפריט',
                    short_name: 'תפריט',
                    description: 'צפה בתפריט המסעדה',
                    url: '/#menu',
                    icons: [{ src: '/icon-menu.png', sizes: '96x96' }]
                },
                {
                    name: 'פאנל ניהול',
                    short_name: 'ניהול',
                    description: 'פאנל ניהול למסעדה',
                    url: '/#admin',
                    icons: [{ src: '/icon-admin.png', sizes: '96x96' }]
                }
            ]
        };

        // הוסף לראש הדף
        const manifestLink = document.createElement('link');
        manifestLink.rel = 'manifest';
        manifestLink.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(manifest));
        document.head.appendChild(manifestLink);

        return manifest;
    }

    /**
     * הגדרת מטא תגים לPWA
     */
    setupMetaTags() {
        const metaTags = [
            { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
            { name: 'theme-color', content: '#DAA520' },
            { name: 'apple-mobile-web-app-capable', content: 'yes' },
            { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
            { name: 'apple-mobile-web-app-title', content: 'הזיה' },
            { name: 'msapplication-TileColor', content: '#DAA520' },
            { name: 'msapplication-TileImage', content: '/icon-144x144.png' }
        ];

        metaTags.forEach(tag => {
            const meta = document.createElement('meta');
            meta.name = tag.name;
            meta.content = tag.content;
            document.head.appendChild(meta);
        });

        // Apple Touch Icons
        const appleTouchIcon = document.createElement('link');
        appleTouchIcon.rel = 'apple-touch-icon';
        appleTouchIcon.href = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180">
                <rect width="180" height="180" fill="#DAA520" rx="40"/>
                <text x="90" y="115" text-anchor="middle" font-size="70" fill="black">🍽</text>
            </svg>
        `);
        document.head.appendChild(appleTouchIcon);
    }

    /**
     * שמירת הזמנה במצב לא מקוון
     */
    saveOfflineOrder(orderData) {
        const offlineOrders = DataManager.getSetting('offlineOrders', []);
        offlineOrders.push({
            ...orderData,
            offlineTimestamp: Date.now(),
            synced: false
        });
        DataManager.setSetting('offlineOrders', offlineOrders);

        showInfo('הזמנה נשמרה למצב לא מקוון - תסונכרן כשהחיבור יחזור');
    }

    /**
     * קבלת מידע PWA
     */
    getPWAInfo() {
        return {
            isInstalled: this.isInstalled,
            isOnline: this.isOnline,
            swRegistered: !!this.swRegistration,
            updateAvailable: this.updateAvailable,
            installPromptAvailable: !!this.deferredPrompt,
            notificationsEnabled: Notification.permission === 'granted'
        };
    }

    /**
     * קישור אירועים
     */
    bindEvents() {
        // הוסף מאזינים לפעולות PWA
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.swRegistration) {
                // בדוק עדכונים כשהאפליקציה חוזרת לפוקוס
                this.swRegistration.update();
            }
        });
    }
}

// יצירת מופע יחיד
const pwaHandler = new PWAHandler();

// הגדר manifest ומטא תגים
document.addEventListener('DOMContentLoaded', () => {
    pwaHandler.createManifest();
    pwaHandler.setupMetaTags();
});

// פונקציות גלובליות
window.installApp = () => pwaHandler.installApp();
window.sendLocalNotification = (title, options) => pwaHandler.sendLocalNotification(title, options);
window.getPWAInfo = () => pwaHandler.getPWAInfo();