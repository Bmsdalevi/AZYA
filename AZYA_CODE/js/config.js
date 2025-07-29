
            <!-- CONFIG.JS -->
            <div class="file-section">
                <div class="file-title">📁 js/config.js</div>
                <button class="download-btn" onclick="downloadFile('config.js', configCode)">💾 הורד קובץ</button>
                <div class="code-block" id="configCode">// js/config.js - הגדרות מערכת מסעדת הזיה

                    const CONFIG = {
                    // הגדרות מנהל
                    admin: {
                    defaultUsername: 'admin',
                    defaultPassword: 'hazya2024',
                    sessionTimeout: 30 * 60 * 1000 // 30 דקות
                    },

                    // הגדרות אפליקציה
                    app: {
                    name: 'הזיה',
                    version: '1.0.0',
                    environment: 'development'
                    },

                    // הגדרות מסעדה
                    restaurant: {
                    name: 'מסעדת הזיה',
                    phone: '03-9876543',
                    address: 'רחוב הרצל 25, תל אביב',
                    email: 'hazya.restaurant@gmail.com'
                    },

                    // הגדרות תפריט
                    menu: {
                    defaultCategory: 'burgers',
                    maxItemsPerCategory: 50,
                    enableImages: true
                    },

                    // הגדרות הזמנות
                    orders: {
                    defaultPrepTime: 25, // דקות
                    deliveryFee: 15, // ₪
                    maxOrderValue: 1000, // ₪
                    orderNumberPrefix: 'HZ'
                    },

                    // הגדרות תשלום
                    payment: {
                    enableCash: true,
                    enableBit: true,
                    bitBusinessPhone: '050-9876543',
                    bitBusinessName: 'מסעדת הזיה'
                    },

                    // הגדרות LocalStorage
                    storage: {
                    prefix: 'hazya_',
                    keys: {
                    menu: 'menu_data',
                    orders: 'orders',
                    customers: 'customers',
                    settings: 'settings',
                    adminSession: 'admin_session',
                    cart: 'cart',
                    theme: 'theme'
                    }
                    }
                    };

                    // ייצוא לחלון הגלובלי
                    window.CONFIG = CONFIG;

                    console.log('✅ CONFIG נטען בהצלחה');</div>
            </div>