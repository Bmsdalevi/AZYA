
            <!-- DATA-STORAGE.JS -->
            <div class="file-section">
                <div class="file-title">📁 js/data-storage.js</div>
                <button class="download-btn" onclick="downloadFile('data-storage.js', dataStorageCode)">💾 הורד קובץ</button>
                <div class="code-block" id="dataStorageCode">// js/data-storage.js - ניהול אחסון נתונים

                    /**
                    * מחלקה לניהול אחסון נתונים ב-LocalStorage
                    */
                    class DataStorage {
                    constructor() {
                    this.prefix = CONFIG?.storage?.prefix || 'hazya_';
                    this.keys = CONFIG?.storage?.keys || {};
                    }

                    /**
                    * קבלת מפתח מלא עם קידומת
                    */
                    getKey(key) {
                    return this.prefix + key;
                    }

                    /**
                    * שמירת נתונים
                    */
                    save(key, data) {
                    try {
                    const fullKey = this.getKey(key);
                    const jsonData = JSON.stringify(data);
                    localStorage.setItem(fullKey, jsonData);
                    return true;
                    } catch (error) {
                    console.error('שגיאה בשמירת נתונים:', error);
                    return false;
                    }
                    }

                    /**
                    * טעינת נתונים
                    */
                    load(key, defaultValue = null) {
                    try {
                    const fullKey = this.getKey(key);
                    const data = localStorage.getItem(fullKey);
                    return data ? JSON.parse(data) : defaultValue;
                    } catch (error) {
                    console.error('שגיאה בטעינת נתונים:', error);
                    return defaultValue;
                    }
                    }

                    /**
                    * מחיקת נתונים
                    */
                    remove(key) {
                    try {
                    const fullKey = this.getKey(key);
                    localStorage.removeItem(fullKey);
                    return true;
                    } catch (error) {
                    console.error('שגיאה במחיקת נתונים:', error);
                    return false;
                    }
                    }

                    /**
                    * בדיקת קיום מפתח
                    */
                    exists(key) {
                    const fullKey = this.getKey(key);
                    return localStorage.getItem(fullKey) !== null;
                    }

                    /**
                    * איפוס כל הנתונים
                    */
                    clear() {
                    try {
                    Object.keys(localStorage).forEach(key => {
                    if (key.startsWith(this.prefix)) {
                    localStorage.removeItem(key);
                    }
                    });
                    return true;
                    } catch (error) {
                    console.error('שגיאה באיפוס נתונים:', error);
                    return false;
                    }
                    }

                    /**
                    * קבלת כל המפתחות
                    */
                    getAllKeys() {
                    return Object.keys(localStorage)
                    .filter(key => key.startsWith(this.prefix))
                    .map(key => key.replace(this.prefix, ''));
                    }

                    /**
                    * קבלת גודל האחסון
                    */
                    getStorageSize() {
                    let total = 0;
                    Object.keys(localStorage).forEach(key => {
                    if (key.startsWith(this.prefix)) {
                    total += localStorage.getItem(key).length;
                    }
                    });
                    return total;
                    }
                    }

                    /**
                    * מנהל נתונים ראשי
                    */
                    class DataManager {
                    constructor() {
                    this.storage = new DataStorage();
                    this.init();
                    }

                    init() {
                    this.initializeDefaultData();
                    }

                    /**
                    * אתחול נתונים בסיסיים
                    */
                    initializeDefaultData() {
                    // תפריט ברירת מחדל
                    if (!this.storage.exists('menu_data')) {
                    const defaultMenu = {
                    categories: [
                    { id: 'burgers', name: 'המבורגרים', description: 'המבורגרים טעימים ועסיסיים', icon: '🍔' },
                    { id: 'schnitzels', name: 'שניצלונים', description: 'שניצלונים זהובים וקריספיים', icon: '🍗' },
                    { id: 'salads', name: 'סלטים', description: 'סלטים טריים ובריאים', icon: '🥗' },
                    { id: 'drinks', name: 'משקאות', description: 'משקאות קרים ומרעננים', icon: '🥤' }
                    ],
                    items: {
                    burgers: [
                    {
                    id: 'classic_burger',
                    name: 'המבורגר קלאסי',
                    description: 'המבורגר עם בשר, חסה, עגבנייה וחמוצים',
                    price: 45,
                    available: true,
                    image: ''
                    }
                    ],
                    schnitzels: [
                    {
                    id: 'chicken_schnitzel',
                    name: 'שניצל עוף',
                    description: 'שניצל עוף זהוב עם תוספות',
                    price: 42,
                    available: true,
                    image: ''
                    }
                    ],
                    salads: [
                    {
                    id: 'green_salad',
                    name: 'סלט ירוק',
                    description: 'סלט ירוק טרי עם ירקות עונה',
                    price: 28,
                    available: true,
                    image: ''
                    }
                    ],
                    drinks: [
                    {
                    id: 'coke',
                    name: 'קוקה קולה',
                    description: 'משקה קרבוני מרענן',
                    price: 8,
                    available: true,
                    image: ''
                    }
                    ]
                    }
                    };
                    this.storage.save('menu_data', defaultMenu);
                    }

                    // הגדרות ברירת מחדל
                    if (!this.storage.exists('settings')) {
                    const defaultSettings = {
                    restaurant: {
                    name: 'מסעדת הזיה',
                    phone: '03-9876543',
                    address: 'רחוב הרצל 25, תל אביב',
                    email: 'hazya.restaurant@gmail.com'
                    },
                    orders: {
                    preparationTime: 25,
                    deliveryFee: 15,
                    requireCustomerInfo: true,
                    sendOrderEmails: true
                    },
                    payment: {
                    enableCash: true,
                    enableBit: true,
                    bitBusinessPhone: '050-9876543',
                    bitBusinessName: 'מסעדת הזיה',
                    bitInstantCharge: false
                    }
                    };
                    this.storage.save('settings', defaultSettings);
                    }

                    // הזמנות ריקות
                    if (!this.storage.exists('orders')) {
                    this.storage.save('orders', []);
                    }

                    // לקוחות ריקים
                    if (!this.storage.exists('customers')) {
                    this.storage.save('customers', []);
                    }

                    // עגלת קניות ריקה
                    if (!this.storage.exists('cart')) {
                    this.storage.save('cart', { items: [], total: 0 });
                    }
                    }

                    // === ניהול תפריט ===
                    getMenu() {
                    return this.storage.load('menu_data', { categories: [], items: {} });
                    }

                    saveMenu(menuData) {
                    return this.storage.save('menu_data', menuData);
                    }

                    // === ניהול הזמנות ===
                    getOrders() {
                    return this.storage.load('orders', []);
                    }

                    saveOrders(orders) {
                    return this.storage.save('orders', orders);
                    }

                    addOrder(order) {
                    const orders = this.getOrders();
                    orders.push(order);
                    return this.saveOrders(orders);
                    }

                    updateOrder(orderId, updates) {
                    const orders = this.getOrders();
                    const orderIndex = orders.findIndex(order => order.id === orderId);

                    if (orderIndex !== -1) {
                    orders[orderIndex] = { ...orders[orderIndex], ...updates };
                    return this.saveOrders(orders);
                    }
                    return false;
                    }

                    deleteOrder(orderId) {
                    const orders = this.getOrders();
                    const filteredOrders = orders.filter(order => order.id !== orderId);
                    return this.saveOrders(filteredOrders);
                    }

                    // === ניהול לקוחות ===
                    getCustomers() {
                    return this.storage.load('customers', []);
                    }

                    saveCustomers(customers) {
                    return this.storage.save('customers', customers);
                    }

                    addCustomer(customer) {
                    const customers = this.getCustomers();
                    customers.push(customer);
                    return this.saveCustomers(customers);
                    }

                    updateCustomer(customerId, updates) {
                    const customers = this.getCustomers();
                    const customerIndex = customers.findIndex(customer => customer.id === customerId);

                    if (customerIndex !== -1) {
                    customers[customerIndex] = { ...customers[customerIndex], ...updates };
                    return this.saveCustomers(customers);
                    }
                    return false;
                    }

                    // === ניהול הגדרות ===
                    getSettings() {
                    return this.storage.load('settings', {});
                    }

                    saveSettings(settings) {
                    return this.storage.save('settings', settings);
                    }

                    updateSettings(updates) {
                    const currentSettings = this.getSettings();
                    const newSettings = { ...currentSettings, ...updates };
                    return this.saveSettings(newSettings);
                    }

                    // === ניהול עגלת קניות ===
                    getCart() {
                    return this.storage.load('cart', { items: [], total: 0 });
                    }

                    saveCart(cart) {
                    return this.storage.save('cart', cart);
                    }

                    // === ניהול סשן מנהל ===
                    getAdminSession() {
                    return this.storage.load('admin_session', null);
                    }

                    saveAdminSession(session) {
                    return this.storage.save('admin_session', session);
                    }

                    clearAdminSession() {
                    return this.storage.remove('admin_session');
                    }

                    // === ניהול ערכת נושא ===
                    getTheme() {
                    return this.storage.load('theme', 'default');
                    }

                    saveTheme(theme) {
                    return this.storage.save('theme', theme);
                    }

                    // === פונקציות עזר ===
                    exportData() {
                    const data = {
                    menu: this.getMenu(),
                    orders: this.getOrders(),
                    customers: this.getCustomers(),
                    settings: this.getSettings(),
                    exportDate: new Date().toISOString()
                    };
                    return data;
                    }

                    importData(data) {
                    try {
                    if (data.menu) this.saveMenu(data.menu);
                    if (data.orders) this.saveOrders(data.orders);
                    if (data.customers) this.saveCustomers(data.customers);
                    if (data.settings) this.saveSettings(data.settings);
                    return true;
                    } catch (error) {
                    console.error('שגיאה ביבוא נתונים:', error);
                    return false;
                    }
                    }

                    clearAllData() {
                    return this.storage.clear();
                    }

                    getStorageInfo() {
                    return {
                    keys: this.storage.getAllKeys(),
                    size: this.storage.getStorageSize(),
                    sizeFormatted: (this.storage.getStorageSize() / 1024).toFixed(2) + ' KB'
                    };
                    }
                    }

                    // יצירת מופע יחיד
                    const storage = new DataStorage();
                    const DataManager = new DataManager();

                    // ייצוא לחלון הגלובלי
                    window.storage = storage;
                    window.DataManager = DataManager;

                    console.log('✅ DataStorage ו-DataManager נטענו בהצלחה');</div>
            </div>