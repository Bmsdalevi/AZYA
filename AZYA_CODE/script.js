// מערכת ניהול מתקדמת למסעדת הזיה
// JavaScript קובץ ראשי

// גלובלים ונתונים
let currentUser = null;
let currentSection = 'dashboard';
let orders = [];
let menuItems = [];
let customers = [];
let notifications = [];

// נתוני דוגמה
const sampleData = {
    menuItems: [
        {
            id: 1,
            name: "המבורגר הזיה קלאסי",
            description: "המבורגר בקר איכותי עם ירקות טריים וסלט בבריושי בית",
            price: 45,
            category: "המבורגרים",
            available: true,
            image: "🍔"
        },
        {
            id: 2,
            name: "שניצל ביסטרו",
            description: "שניצל עוף רך ועסיסי עם תיבול מיוחד וסלט עונתי",
            price: 38,
            category: "שניצלונים",
            available: true,
            image: "🍗"
        },
        {
            id: 3,
            name: "סלט קיסר הזיה",
            description: "עלי חסה, קרוטונים, גבינת פרמזן ורוטב קיסר בית",
            price: 32,
            category: "סלטים",
            available: true,
            image: "🥗"
        },
        {
            id: 4,
            name: "לימונדה בית",
            description: "לימונדה טבעית מתוקה עם נענע טרי",
            price: 18,
            category: "משקאות",
            available: true,
            image: "🍋"
        }
    ],

    orders: [
        {
            id: "HZ001",
            customerName: "יוסי כהן",
            customerPhone: "052-1234567",
            customerAddress: "רחוב הרצל 45, תל אביב",
            items: [
                { name: "המבורגר הזיה קלאסי", price: 45, quantity: 2 },
                { name: "לימונדה בית", price: 18, quantity: 2 }
            ],
            total: 126,
            status: "new",
            time: new Date(Date.now() - 300000), // 5 דקות אחורה
            notes: "ללא בצל, אנא"
        },
        {
            id: "HZ002",
            customerName: "שרה לוי",
            customerPhone: "054-9876543",
            customerAddress: "רחוב דיזנגוף 123, תל אביב",
            items: [
                { name: "שניצל ביסטרו", price: 38, quantity: 1 },
                { name: "סלט קיסר הזיה", price: 32, quantity: 1 }
            ],
            total: 70,
            status: "preparing",
            time: new Date(Date.now() - 900000), // 15 דקות אחורה
            notes: ""
        },
        {
            id: "HZ003",
            customerName: "דוד ישראלי",
            customerPhone: "053-5555555",
            customerAddress: "רחוב בן יהודה 89, תל אביב",
            items: [
                { name: "המבורגר הזיה קלאסי", price: 45, quantity: 3 }
            ],
            total: 135,
            status: "ready",
            time: new Date(Date.now() - 1200000), // 20 דקות אחורה
            notes: "הזמנה דחופה"
        }
    ],

    customers: [
        {
            id: 1,
            name: "יוסי כהן",
            phone: "052-1234567",
            email: "yossi@example.com",
            address: "רחוב הרצל 45, תל אביב",
            joinDate: "2024-01-15",
            totalOrders: 8,
            totalSpent: 520
        },
        {
            id: 2,
            name: "שרה לוי",
            phone: "054-9876543",
            email: "sarah@example.com",
            address: "רחוב דיזנגוף 123, תל אביב",
            joinDate: "2024-02-20",
            totalOrders: 5,
            totalSpent: 340
        }
    ]
};

// אתחול האפליקציה
document.addEventListener('DOMContentLoaded', function() {
    console.log('🍽️ מאתחל מסעדת הזיה...');

    // טעינת נתונים
    loadData();

    // הגדרת event listeners
    setupEventListeners();

    // בדיקת התחברות
    checkAuthentication();

    console.log('✅ האפליקציה אותחלה בהצלחה');
});

// טעינת נתונים
function loadData() {
    // טעינת נתונים מ-localStorage או נתוני דוגמה
    orders = JSON.parse(localStorage.getItem('hazya_orders')) || sampleData.orders;
    menuItems = JSON.parse(localStorage.getItem('hazya_menu')) || sampleData.menuItems;
    customers = JSON.parse(localStorage.getItem('hazya_customers')) || sampleData.customers;

    // המרת תאריכים חזרה ל-Date objects
    orders.forEach(order => {
        if (typeof order.time === 'string') {
            order.time = new Date(order.time);
        }
    });
}

// שמירת נתונים
function saveData() {
    localStorage.setItem('hazya_orders', JSON.stringify(orders));
    localStorage.setItem('hazya_menu', JSON.stringify(menuItems));
    localStorage.setItem('hazya_customers', JSON.stringify(customers));
}

// הגדרת event listeners
function setupEventListeners() {
    // טופס התחברות
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // התראות
    const notificationBtn = document.getElementById('notificationBtn');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', showNotifications);
    }

    // עדכון אוטומטי של הזמנות חדשות
    setInterval(checkForNewOrders, 30000); // כל 30 שניות
}

// בדיקת התחברות
function checkAuthentication() {
    const savedUser = localStorage.getItem('hazya_current_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showMainApp();
    } else {
        showLoginScreen();
    }
}

// הצגת מסך התחברות
function showLoginScreen() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('mainApp').style.display = 'none';
}

// הצגת האפליקציה הראשית
function showMainApp() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';

    // טעינת הדשבורד
    updateDashboard();
    renderOrders();
    renderMenu();
    renderCustomers();
}

// טיפול בהתחברות
function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // בדיקת פרטי התחברות
    if (username === 'admin' && password === 'hazya2024') {
        currentUser = {
            username: username,
            loginTime: new Date(),
            role: 'admin'
        };

        localStorage.setItem('hazya_current_user', JSON.stringify(currentUser));

        showNotification('התחברת בהצלחה למערכת!', 'success');
        showMainApp();
    } else {
        showNotification('שם משתמש או סיסמה שגויים', 'error');
    }
}

// התנתקות
function logout() {
    if (confirm('האם אתה בטוח שברצונך להתנתק?')) {
        localStorage.removeItem('hazya_current_user');
        currentUser = null;
        showLoginScreen();
        showNotification('התנתקת בהצלחה', 'info');
    }
}

// הצגת סקציה
function showSection(sectionName) {
    // הסתרת כל הסקציות
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });

    // הסרת active מכל הכפתורים
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // הצגת הסקציה הנבחרת
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // הוספת active לכפתור הנבחר
    event.target.classList.add('active');

    currentSection = sectionName;

    // עדכון התוכן בהתאם לסקציה
    switch(sectionName) {
        case 'dashboard':
            updateDashboard();
            break;
        case 'orders':
            renderOrders();
            break;
        case 'menu':
            renderMenu();
            break;
        case 'customers':
            renderCustomers();
            break;
    }
}

// עדכון דשבורד
function updateDashboard() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // הזמנות היום
    const todayOrders = orders.filter(order => {
        const orderDate = new Date(order.time);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === today.getTime();
    });

    // הכנסות היום
    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);

    // הזמנות חדשות
    const newOrders = orders.filter(order => order.status === 'new');

    // עדכון הסטטיסטיקות
    document.getElementById('totalOrders').textContent = todayOrders.length;
    document.getElementById('todayRevenue').textContent = `₪${todayRevenue}`;
    document.getElementById('newOrders').textContent = newOrders.length;
    document.getElementById('totalCustomers').textContent = customers.length;

    // עדכון התראות
    updateNotificationBadge(newOrders.length);

    // הצגת הזמנות אחרונות
    renderRecentOrders();
}

// רינדור הזמנות אחרונות
function renderRecentOrders() {
    const recentOrdersList = document.getElementById('recentOrdersList');
    const recentOrders = orders
        .sort((a, b) => new Date(b.time) - new Date(a.time))
        .slice(0, 5);

    if (recentOrders.length === 0) {
        recentOrdersList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <div class="empty-state-text">אין הזמנות עדיין</div>
            </div>
        `;
        return;
    }

    recentOrdersList.innerHTML = recentOrders.map(order => `
        <div class="order-card" style="margin-bottom: 1rem;">
            <div class="order-header">
                <div class="order-number">#${order.id}</div>
                <div class="order-status status-${order.status}">${getStatusText(order.status)}</div>
            </div>
            <div class="customer-name">${order.customerName}</div>
            <div class="order-total">₪${order.total}</div>
            <div class="order-time">${formatTime(order.time)}</div>
        </div>
    `).join('');
}

// רינדור הזמנות
function renderOrders() {
    const ordersGrid = document.getElementById('ordersGrid');

    if (orders.length === 0) {
        ordersGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <div class="empty-state-text">אין הזמנות עדיין</div>
                <div class="empty-state-subtext">הזמנות חדשות יופיעו כאן</div>
            </div>
        `;
        return;
    }

    ordersGrid.innerHTML = orders.map(order => `
        <div class="order-card ${order.status === 'new' ? 'new' : ''}" onclick="viewOrderDetails('${order.id}')">
            <div class="order-header">
                <div>
                    <div class="order-number">#${order.id}</div>
                    <div class="order-time">${formatTime(order.time)}</div>
                </div>
                <div class="order-status status-${order.status}">
                    ${getStatusText(order.status)}
                </div>
            </div>

            <div class="customer-info">
                <div class="customer-name">${order.customerName}</div>
                <div class="customer-phone">📞 ${order.customerPhone}</div>
            </div>

            <div class="order-items">
                ${order.items.map(item => `
                    <div class="order-item">
                        <span class="item-name">${item.name}</span>
                        <span class="item-quantity">×${item.quantity}</span>
                        <span class="item-price">₪${item.price * item.quantity}</span>
                    </div>
                `).join('')}
            </div>

            <div class="order-total">סה"כ: ₪${order.total}</div>

            ${order.notes ? `<div style="margin-top: 0.5rem; font-style: italic; color: var(--cream-light);">📝 ${order.notes}</div>` : ''}

            <div class="order-actions">
                ${getOrderActionButtons(order)}
            </div>
        </div>
    `).join('');
}

// קבלת כפתורי פעולה להזמנה
function getOrderActionButtons(order) {
    switch(order.status) {
        case 'new':
            return `
                <button class="action-btn btn-success" onclick="updateOrderStatus('${order.id}', 'preparing', event)">
                    ✅ אשר הזמנה
                </button>
                <button class="action-btn btn-danger" onclick="cancelOrder('${order.id}', event)">
                    ❌ בטל
                </button>
            `;
        case 'preparing':
            return `
                <button class="action-btn btn-primary" onclick="updateOrderStatus('${order.id}', 'ready', event)">
                    🍽️ מוכן
                </button>
            `;
        case 'ready':
            return `
                <button class="action-btn btn-success" onclick="updateOrderStatus('${order.id}', 'delivered', event)">
                    🚚 נשלח
                </button>
            `;
        case 'delivered':
            return `
                <button class="action-btn btn-primary" onclick="printReceipt('${order.id}', event)">
                    🖨️ הדפס קבלה
                </button>
            `;
        default:
            return '';
    }
}

// עדכון סטטוס הזמנה
function updateOrderStatus(orderId, newStatus, event) {
    if (event) event.stopPropagation();

    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.status = newStatus;
        saveData();
        renderOrders();
        updateDashboard();

        const statusText = getStatusText(newStatus);
        showNotification(`הזמנה #${orderId} עודכנה ל: ${statusText}`, 'success');

        // הוספת התראה ללקוח (אמולציה)
        addNotification(`הזמנה #${orderId} ${statusText}`, 'order_update');
    }
}

// ביטול הזמנה
function cancelOrder(orderId, event) {
    if (event) event.stopPropagation();

    if (confirm(`האם אתה בטוח שברצונך לבטל את הזמנה #${orderId}?`)) {
        orders = orders.filter(o => o.id !== orderId);
        saveData();
        renderOrders();
        updateDashboard();
        showNotification(`הזמנה #${orderId} בוטלה`, 'warning');
    }
}

// צפייה בפרטי הזמנה
function viewOrderDetails(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        const itemsList = order.items.map(item =>
            `• ${item.name} ×${item.quantity} - ₪${item.price * item.quantity}`
        ).join('\n');

        alert(`פרטי הזמנה #${order.id}

לקוח: ${order.customerName}
טלפון: ${order.customerPhone}
כתובת: ${order.customerAddress}

פריטים:
${itemsList}

סה"כ: ₪${order.total}
זמן הזמנה: ${formatDateTime(order.time)}
סטטוס: ${getStatusText(order.status)}

${order.notes ? `הערות: ${order.notes}` : ''}`);
    }
}

// פילטור הזמנות
function filterOrders(status) {
    // עדכון כפתורי פילטר
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    const ordersGrid = document.getElementById('ordersGrid');
    const filteredOrders = status === 'all' ? orders : orders.filter(order => order.status === status);

    if (filteredOrders.length === 0) {
        ordersGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔍</div>
                <div class="empty-state-text">אין הזמנות בסטטוס זה</div>
            </div>
        `;
        return;
    }

    ordersGrid.innerHTML = filteredOrders.map(order => `
        <div class="order-card ${order.status === 'new' ? 'new' : ''}" onclick="viewOrderDetails('${order.id}')">
            <div class="order-header">
                <div>
                    <div class="order-number">#${order.id}</div>
                    <div class="order-time">${formatTime(order.time)}</div>
                </div>
                <div class="order-status status-${order.status}">
                    ${getStatusText(order.status)}
                </div>
            </div>

            <div class="customer-info">
                <div class="customer-name">${order.customerName}</div>
                <div class="customer-phone">📞 ${order.customerPhone}</div>
            </div>

            <div class="order-items">
                ${order.items.map(item => `
                    <div class="order-item">
                        <span class="item-name">${item.name}</span>
                        <span class="item-quantity">×${item.quantity}</span>
                        <span class="item-price">₪${item.price * item.quantity}</span>
                    </div>
                `).join('')}
            </div>

            <div class="order-total">סה"כ: ₪${order.total}</div>

            ${order.notes ? `<div style="margin-top: 0.5rem; font-style: italic; color: var(--cream-light);">📝 ${order.notes}</div>` : ''}

            <div class="order-actions">
                ${getOrderActionButtons(order)}
            </div>
        </div>
    `).join('');
}

// רינדור תפריט
function renderMenu() {
    const menuGrid = document.getElementById('menuGrid');

    if (menuItems.length === 0) {
        menuGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🍽️</div>
                <div class="empty-state-text">אין פריטים בתפריט</div>
                <div class="empty-state-subtext">הוסף פריטים חדשים</div>
            </div>
        `;
        return;
    }

    menuGrid.innerHTML = menuItems.map(item => `
        <div class="menu-item-card">
            <div class="menu-item-header">
                <div>
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">${item.image}</div>
                    <div class="menu-item-name">${item.name}</div>
                    <div style="color: var(--cream-light); font-size: 0.9rem; margin-bottom: 0.5rem;">${item.category}</div>
                </div>
                <div class="menu-item-price">₪${item.price}</div>
            </div>

            <div class="menu-item-description">${item.description}</div>

            <div style="margin: 1rem 0;">
                <span style="padding: 0.3rem 0.8rem; border-radius: 15px; font-size: 0.8rem; font-weight: bold; ${item.available ? 'background: var(--success-green); color: white;' : 'background: var(--danger-red); color: white;'}">
                    ${item.available ? '✅ זמין' : '❌ לא זמין'}
                </span>
            </div>

            <div class="menu-item-actions">
                <button class="action-btn btn-primary" onclick="editMenuItem(${item.id})">
                    ✏️ ערוך
                </button>
                <button class="action-btn ${item.available ? 'btn-warning' : 'btn-success'}" onclick="toggleMenuItemAvailability(${item.id})">
                    ${item.available ? '🔒 הסתר' : '🔓 הצג'}
                </button>
                <button class="action-btn btn-danger" onclick="deleteMenuItem(${item.id})">
                    🗑️ מחק
                </button>
            </div>
        </div>
    `).join('');
}

// הוספת פריט תפריט
function showAddMenuItemModal() {
    const name = prompt('שם הפריט:');
    if (!name) return;

    const description = prompt('תיאור הפריט:');
    const priceStr = prompt('מחיר (₪):');
    const price = parseFloat(priceStr);

    if (isNaN(price) || price <= 0) {
        showNotification('מחיר לא תקין', 'error');
        return;
    }

    const category = prompt('קטגוריה:', 'המבורגרים');
    const emoji = prompt('אמוג\'י:', '🍔');

    const newItem = {
        id: Date.now(),
        name: name,
        description: description || '',
        price: price,
        category: category || 'כללי',
        available: true,
        image: emoji || '🍽️'
    };

    menuItems.push(newItem);
    saveData();
    renderMenu();
    showNotification('פריט חדש נוסף לתפריט!', 'success');
}

// עריכת פריט תפריט
function editMenuItem(itemId) {
    const item = menuItems.find(i => i.id === itemId);
    if (!item) return;

    const newName = prompt('שם הפריט:', item.name);
    if (newName !== null) item.name = newName;

    const newDescription = prompt('תיאור:', item.description);
    if (newDescription !== null) item.description = newDescription;

    const newPriceStr = prompt('מחיר:', item.price);
    if (newPriceStr !== null) {
        const newPrice = parseFloat(newPriceStr);
        if (!isNaN(newPrice) && newPrice > 0) {
            item.price = newPrice;
        }
    }

    const newCategory = prompt('קטגוריה:', item.category);
    if (newCategory !== null) item.category = newCategory;

    const newEmoji = prompt('אמוג\'י:', item.image);
    if (newEmoji !== null) item.image = newEmoji;

    saveData();
    renderMenu();
    showNotification('הפריט עודכן בהצלחה!', 'success');
}

// החלפת זמינות פריט
function toggleMenuItemAvailability(itemId) {
    const item = menuItems.find(i => i.id === itemId);
    if (item) {
        item.available = !item.available;
        saveData();
        renderMenu();
        showNotification(`הפריט ${item.available ? 'זמין' : 'לא זמין'} עכשיו`, 'info');
    }
}

// מחיקת פריט תפריט
function deleteMenuItem(itemId) {
    const item = menuItems.find(i => i.id === itemId);
    if (item && confirm(`האם אתה בטוח שברצונך למחוק את "${item.name}"?`)) {
        menuItems = menuItems.filter(i => i.id !== itemId);
        saveData();
        renderMenu();
        showNotification('הפריט נמחק מהתפריט', 'warning');
    }
}

// רינדור לקוחות
function renderCustomers() {
    const customersGrid = document.getElementById('customersGrid');

    if (customers.length === 0) {
        customersGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">👥</div>
                <div class="empty-state-text">אין לקוחות רשומים</div>
                <div class="empty-state-subtext">לקוחות חדשים יופיעו כאן</div>
            </div>
        `;
        return;
    }

    customersGrid.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem;">
            ${customers.map(customer => `
                <div class="order-card">
                    <div class="customer-info">
                        <div class="customer-name">👤 ${customer.name}</div>
                        <div class="customer-phone">📞 ${customer.phone}</div>
                        ${customer.email ? `<div style="color: var(--cream-light); margin-top: 0.3rem;">📧 ${customer.email}</div>` : ''}
                        ${customer.address ? `<div style="color: var(--cream-light); margin-top: 0.3rem;">🏠 ${customer.address}</div>` : ''}
                    </div>

                    <div style="margin: 1rem 0; text-align: center;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                            <div style="text-align: center;">
                                <div style="font-size: 1.5rem; font-weight: bold; color: var(--gold-primary);">${customer.totalOrders || 0}</div>
                                <div style="font-size: 0.8rem; color: var(--cream-light);">הזמנות</div>
                            </div>
                            <div style="text-align: center;">
                                <div style="font-size: 1.5rem; font-weight: bold; color: var(--gold-secondary);">₪${customer.totalSpent || 0}</div>
                                <div style="font-size: 0.8rem; color: var(--cream-light);">סה"כ רכישות</div>
                            </div>
                        </div>
                        <div style="font-size: 0.9rem; color: var(--cream-light);">📅 הצטרף: ${formatDate(customer.joinDate)}</div>
                    </div>

                    <div style="display: flex; gap: 0.5rem;">
                        <button class="action-btn btn-primary" onclick="viewCustomerDetails(${customer.id})">
                            👁️ צפה
                        </button>
                        <button class="action-btn btn-warning" onclick="editCustomer(${customer.id})">
                            ✏️ ערוך
                        </button>
                        <button class="action-btn btn-danger" onclick="deleteCustomer(${customer.id})">
                            🗑️ מחק
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// צפייה בפרטי לקוח
function viewCustomerDetails(customerId) {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
        const customerOrders = orders.filter(order => order.customerPhone === customer.phone);
        const ordersList = customerOrders.map(order =>
            `• הזמנה #${order.id} - ₪${order.total} (${formatDate(order.time)})`
        ).join('\n');

        alert(`פרטי לקוח

שם: ${customer.name}
טלפון: ${customer.phone}
אימייל: ${customer.email || 'לא הוזן'}
כתובת: ${customer.address || 'לא הוזנה'}
תאריך הצטרפות: ${formatDate(customer.joinDate)}

סטטיסטיקות:
• סה"כ הזמנות: ${customer.totalOrders || 0}
• סה"כ רכישות: ₪${customer.totalSpent || 0}

${customerOrders.length > 0 ? `הזמנות אחרונות:\n${ordersList}` : 'אין הזמנות עדיין'}`);
    }
}

// עריכת לקוח
function editCustomer(customerId) {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;

    const newName = prompt('שם:', customer.name);
    if (newName !== null) customer.name = newName;

    const newPhone = prompt('טלפון:', customer.phone);
    if (newPhone !== null) customer.phone = newPhone;

    const newEmail = prompt('אימייל:', customer.email || '');
    if (newEmail !== null) customer.email = newEmail;

    const newAddress = prompt('כתובת:', customer.address || '');
    if (newAddress !== null) customer.address = newAddress;

    saveData();
    renderCustomers();
    showNotification('פרטי הלקוח עודכנו!', 'success');
}

// מחיקת לקוח
function deleteCustomer(customerId) {
    const customer = customers.find(c => c.id === customerId);
    if (customer && confirm(`האם אתה בטוח שברצונך למחוק את הלקוח "${customer.name}"?`)) {
        customers = customers.filter(c => c.id !== customerId);
        saveData();
        renderCustomers();
        showNotification('הלקוח נמחק', 'warning');
    }
}

// הוספת לקוח חדש
function showAddCustomerModal() {
    const name = prompt('שם הלקוח:');
    if (!name) return;

    const phone = prompt('טלפון:');
    if (!phone) return;

    const email = prompt('אימייל (אופציונלי):');
    const address = prompt('כתובת (אופציונלי):');

    const newCustomer = {
        id: Date.now(),
        name: name,
        phone: phone,
        email: email || '',
        address: address || '',
        joinDate: new Date().toISOString().split('T')[0],
        totalOrders: 0,
        totalSpent: 0
    };

    customers.push(newCustomer);
    saveData();
    renderCustomers();
    updateDashboard();
    showNotification('לקוח חדש נוסף!', 'success');
}

// הוספת הזמנה חדשה
function showNewOrderModal() {
    const customerName = prompt('שם הלקוח:');
    if (!customerName) return;

    const customerPhone = prompt('טלפון הלקוח:');
    if (!customerPhone) return;

    const customerAddress = prompt('כתובת המשלוח:');
    if (!customerAddress) return;

    // הצגת תפריט זמין
    const availableItems = menuItems.filter(item => item.available);
    if (availableItems.length === 0) {
        showNotification('אין פריטים זמינים בתפריט', 'error');
        return;
    }

    const itemsList = availableItems.map((item, index) =>
        `${index + 1}. ${item.name} - ₪${item.price}`
    ).join('\n');

    const selectedItem = prompt(`בחר פריט (הזן מספר):\n\n${itemsList}`);
    const itemIndex = parseInt(selectedItem) - 1;

    if (itemIndex < 0 || itemIndex >= availableItems.length) {
        showNotification('בחירה לא תקינה', 'error');
        return;
    }

    const quantity = parseInt(prompt('כמות:')) || 1;
    const notes = prompt('הערות (אופציונלי):') || '';

    const selectedMenuItem = availableItems[itemIndex];
    const total = selectedMenuItem.price * quantity;

    const newOrder = {
        id: `HZ${String(Date.now()).slice(-6)}`,
        customerName: customerName,
        customerPhone: customerPhone,
        customerAddress: customerAddress,
        items: [{
            name: selectedMenuItem.name,
            price: selectedMenuItem.price,
            quantity: quantity
        }],
        total: total,
        status: 'new',
        time: new Date(),
        notes: notes
    };

    orders.unshift(newOrder); // הוספה בתחילת הרשימה

    // עדכון נתוני לקוח אם קיים
    const existingCustomer = customers.find(c => c.phone === customerPhone);
    if (existingCustomer) {
        existingCustomer.totalOrders++;
        existingCustomer.totalSpent += total;
    } else {
        // הוספת לקוח חדש
        customers.push({
            id: Date.now(),
            name: customerName,
            phone: customerPhone,
            email: '',
            address: customerAddress,
            joinDate: new Date().toISOString().split('T')[0],
            totalOrders: 1,
            totalSpent: total
        });
    }

    saveData();
    renderOrders();
    updateDashboard();
    showNotification(`הזמנה חדשה #${newOrder.id} נוספה!`, 'success');

    // הוספת התראה
    addNotification(`הזמנה חדשה מ${customerName}`, 'new_order');
}

// מערכת התראות
function addNotification(message, type) {
    const notification = {
        id: Date.now(),
        message: message,
        type: type,
        time: new Date(),
        read: false
    };

    notifications.push(notification);
    updateNotificationBadge();

    // התראה חזותית
    if (type === 'new_order') {
        playNotificationSound();
        showNotification(`🔔 ${message}`, 'info');
    }
}

// עדכון תג התראות
function updateNotificationBadge(count = null) {
    const badge = document.getElementById('notificationCount');
    const unreadCount = count !== null ? count : notifications.filter(n => !n.read).length;

    badge.textContent = unreadCount;
    badge.style.display = unreadCount > 0 ? 'flex' : 'none';
}

// הצגת התראות
function showNotifications() {
    const unreadNotifications = notifications.filter(n => !n.read);

    if (unreadNotifications.length === 0) {
        alert('אין התראות חדשות');
        return;
    }

    const notificationsList = unreadNotifications.map(n =>
        `• ${n.message} (${formatTime(n.time)})`
    ).join('\n');

    alert(`התראות חדשות:\n\n${notificationsList}`);

    // סמן כנקרא
    notifications.forEach(n => n.read = true);
    updateNotificationBadge(0);
}

// בדיקת הזמנות חדשות
function checkForNewOrders() {
    // אמולציה של הזמנות חדשות
    if (Math.random() < 0.1) { // 10% סיכוי כל 30 שניות
        const customerNames = ['אבי מזרחי', 'רות כהן', 'דני לוי', 'מיכל ישראלי'];
        const customerName = customerNames[Math.floor(Math.random() * customerNames.length)];

        addNotification(`הזמנה חדשה מ${customerName}`, 'new_order');
    }
}

// פונקציות עזר
function getStatusText(status) {
    const statusMap = {
        'new': 'חדשה',
        'preparing': 'בהכנה',
        'ready': 'מוכנה',
        'delivered': 'נשלחה'
    };
    return statusMap[status] || status;
}

function formatTime(date) {
    return new Date(date).toLocaleTimeString('he-IL', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('he-IL');
}

function formatDateTime(date) {
    return new Date(date).toLocaleString('he-IL');
}

function playNotificationSound() {
    // אמולציה של צליל התראה
    try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+n8xWQhBTGH0fPaizsIGGS57+OZSA0PVqzn77BdGAg+ltryxnkpBSl+zPDZizYIG2G98uKZSQ4OVKns7K9dGgk9k9n0xnkpBSp8y/DbjzwJHmG971+gYRsGPZHY88p9LAgpcsrz2nYyBSJhu+/nm0oODVWr6OyrUxcKQ6Pq+MdkIAU2jdXzzHksMwsaa7zs4qBcG2I9lJzz2G4oCzGC0vLYiTcIGGS+7+OZSA0PVqzn77BdGAk+ltryxnkpBSh8y/DZjDoJHGC98eKaSgwOVqns7K9dGgk8k9n0yHknFyh3yu7VijAGImC+72KZSAwOVqns7K9dGgk9k9nzyHkqBSh9y+/aizEGHl697+OYSQwPVqzn7q9dGgk9k9n0yHkqBSh9y+/aizEGHl697+OYSQwPVqzn7q9dGgk9k9n0yHkqBSh8y/DbazAGH2C+72KdDgk6k9v0xn4pBSx6yezWfCwGIWG+7eKZTdNfz+3VjDIG');
        audio.play().catch(() => {}); // שקט אם לא מצליח
    } catch (e) {
        // לא משנה אם הצליל לא עובד
    }
}

function showNotification(message, type = 'info') {
    // יצירת התראה חזותית
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: var(--secondary-black);
        color: var(--white-off);
        padding: 1rem 1.5rem;
        border-radius: 10px;
        border: 2px solid var(--gold-primary);
        z-index: 3000;
        max-width: 300px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;

    const colors = {
        success: 'var(--success-green)',
        error: 'var(--danger-red)',
        warning: 'var(--warning-orange)',
        info: 'var(--gold-primary)'
    };

    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };

    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span style="color: ${colors[type]}; font-size: 1.2rem;">${icons[type]}</span>
            <span>${message}</span>
        </div>
    `;

    document.body.appendChild(notification);

    // אנימציה של הופעה
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    // הסרה אוטומטית
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 4000);
}

function printReceipt(orderId, event) {
    if (event) event.stopPropagation();

    const order = orders.find(o => o.id === orderId);
    if (order) {
        const receiptContent = `
מסעדת הזיה
================

הזמנה #${order.id}
תאריך: ${formatDateTime(order.time)}

לקוח: ${order.customerName}
טלפון: ${order.customerPhone}
כתובת: ${order.customerAddress}

פריטים:
${order.items.map(item =>
    `${item.name} ×${item.quantity} - ₪${item.price * item.quantity}`
).join('\n')}

================
סה"כ לתשלום: ₪${order.total}

${order.notes ? `הערות: ${order.notes}` : ''}

תודה שבחרתם במסעדת הזיה!
        `;

        // אמולציה של הדפסה
        console.log('הדפסת קבלה:', receiptContent);
        showNotification(`קבלה עבור הזמנה #${orderId} נשלחה להדפסה`, 'success');
    }
}

// אתחול נתונים נוספים
function initializeAdditionalData() {
    // הוספת עוד נתוני דוגמה
    if (orders.length < 10) {
        const additionalOrders = [
            {
                id: "HZ004",
                customerName: "מרים אברמס",
                customerPhone: "052-9999999",
                customerAddress: "רחוב אלנבי 67, תל אביב",
                items: [
                    { name: "שניצל ביסטרו", price: 38, quantity: 2 },
                    { name: "סלט קיסר הזיה", price: 32, quantity: 1 }
                ],
                total: 108,
                status: "preparing",
                time: new Date(Date.now() - 600000), // 10 דקות אחורה
                notes: "ללא שום, אנא"
            },
            {
                id: "HZ005",
                customerName: "אילן גולדברג",
                customerPhone: "054-1111111",
                customerAddress: "רחוב קינג ג'ורג' 12, ירושלים",
                items: [
                    { name: "המבורגר הזיה קלאסי", price: 45, quantity: 1 },
                    { name: "לימונדה בית", price: 18, quantity: 3 }
                ],
                total: 99,
                status: "delivered",
                time: new Date(Date.now() - 3600000), // שעה אחורה
                notes: ""
            }
        ];

        orders.push(...additionalOrders);
        saveData();
    }
}

// קריאה לאתחול נתונים נוספים
setTimeout(initializeAdditionalData, 2000);