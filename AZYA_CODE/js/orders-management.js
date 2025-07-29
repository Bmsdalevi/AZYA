// js/orders-management.js - ניהול הזמנות מתקדם

/**
 * מחלקה לניהול הזמנות
 */
class OrdersManagement {
    constructor() {
        this.orders = [];
        this.currentFilter = 'all';
        this.sortBy = 'createdAt';
        this.sortDirection = 'desc';
        this.autoRefresh = true;
        this.refreshInterval = null;
        this.init();
    }

    /**
     * אתחול ניהול הזמנות
     */
    init() {
        this.loadOrders();
        this.bindEvents();
        this.setupAutoRefresh();
    }

    /**
     * טעינת הזמנות
     */
    loadOrders() {
        this.orders = DataManager.getOrders() || [];
        this.updateStatistics();
    }

    /**
     * הוספת הזמנה חדשה
     */
    addOrder(orderData) {
        const order = {
            ...orderData,
            id: generateId('order_'),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: 'new'
        };

        this.orders.unshift(order);
        DataManager.addOrder(order);
        
        this.updateStatistics();
        this.renderOrdersBoard();
        
        // הצג התראה
        this.showNewOrderNotification(order);
        
        // עדכן UI אם פאנל פתוח
        if (admin.isLoggedIn && admin.currentTab === 'orders') {
            this.loadOrdersManagement();
        }

        return order;
    }

    /**
     * עדכון סטטוס הזמנה
     */
    updateOrderStatus(orderId, newStatus) {
        const order = this.orders.find(o => o.id === orderId || o.orderNumber === orderId);
        if (!order) {
            showError('הזמנה לא נמצאה');
            return false;
        }

        const oldStatus = order.status;
        order.status = newStatus;
        order.updatedAt = new Date().toISOString();

        // הוסף חותמת זמן לשלבים מסוימים
        switch (newStatus) {
            case 'cooking':
                order.cookingStartedAt = new Date().toISOString();
                break;
            case 'ready':
                order.readyAt = new Date().toISOString();
                break;
            case 'completed':
                order.completedAt = new Date().toISOString();
                break;
        }

        // שמור שינוי
        DataManager.saveOrders(this.orders);
        
        // עדכן ממשק
        this.updateStatistics();
        this.renderOrdersBoard();
        
        // הצג הודעה
        const statusInfo = CONFIG.orderStatuses[newStatus];
        showSuccess(`הזמנה ${order.orderNumber} עודכנה ל${statusInfo?.label || newStatus}`);
        
        // שלח התראה ללקוח (אם מוגדר)
        this.notifyCustomerStatusChange(order, oldStatus, newStatus);

        return true;
    }

    /**
     * מחיקת הזמנה
     */
    deleteOrder(orderId) {
        const orderIndex = this.orders.findIndex(o => o.id === orderId || o.orderNumber === orderId);
        if (orderIndex === -1) {
            showError('הזמנה לא נמצאה');
            return false;
        }

        const order = this.orders[orderIndex];
        
        if (!confirm(`האם אתה בטוח שברצונך למחוק הזמנה ${order.orderNumber}?`)) {
            return false;
        }

        this.orders.splice(orderIndex, 1);
        DataManager.saveOrders(this.orders);
        
        this.updateStatistics();
        this.renderOrdersBoard();
        
        showSuccess(`הזמנה ${order.orderNumber} נמחקה`);
        return true;
    }

    /**
     * טעינת ניהול הזמנות לפאנל אדמין
     */
    loadOrdersManagement() {
        this.updateStatistics();
        this.renderOrdersBoard();
        this.renderOrdersTable();
    }

    /**
     * עדכון סטטיסטיקות
     */
    updateStatistics() {
        const stats = this.calculateStatistics();
        
        // עדכן אלמנטים בUI
        const elements = {
            'newOrdersCount': stats.newOrders,
            'cookingOrdersCount': stats.cookingOrders,
            'readyOrdersCount': stats.readyOrders,
            'totalRevenue': formatPrice(stats.todayRevenue),
            'newBadge': stats.newOrders,
            'cookingBadge': stats.cookingOrders,
            'readyBadge': stats.readyOrders,
            'completedBadge': stats.completedOrders
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }

    /**
     * חישוב סטטיסטיקות
     */
    calculateStatistics() {
        const today = new Date().toDateString();
        const todayOrders = this.orders.filter(order => 
            new Date(order.createdAt).toDateString() === today
        );

        return {
            newOrders: this.orders.filter(o => o.status === 'new').length,
            cookingOrders: this.orders.filter(o => o.status === 'cooking').length,
            readyOrders: this.orders.filter(o => o.status === 'ready').length,
            completedOrders: this.orders.filter(o => o.status === 'completed').length,
            todayRevenue: todayOrders.reduce((sum, order) => sum + (order.total || 0), 0),
            todayOrdersCount: todayOrders.length,
            averageOrderValue: todayOrders.length > 0 
                ? todayOrders.reduce((sum, order) => sum + order.total, 0) / todayOrders.length 
                : 0
        };
    }

    /**
     * רינדור לוח הזמנות (Kanban)
     */
    renderOrdersBoard() {
        const columns = ['new', 'cooking', 'ready', 'completed'];
        
        columns.forEach(status => {
            const container = document.getElementById(`${status}Orders`);
            if (!container) return;

            const orders = this.orders.filter(order => order.status === status);
            
            if (orders.length === 0) {
                container.innerHTML = `
                    <div class="empty-column">
                        <div class="empty-icon">${CONFIG.orderStatuses[status]?.icon || '📝'}</div>
                        <p>אין הזמנות</p>
                    </div>
                `;
                return;
            }

            const ordersHTML = orders.map(order => this.renderOrderCard(order)).join('');
            container.innerHTML = ordersHTML;
        });
    }

    /**
     * רינדור כרטיס הזמנה
     */
    renderOrderCard(order) {
        const timeAgo = getRelativeTime(order.createdAt);
        const statusInfo = CONFIG.orderStatuses[order.status] || CONFIG.orderStatuses.new;
        
        return `
            <div class="order-card" 
                 data-order-id="${order.id}" 
                 data-status="${order.status}"
                 draggable="true"
                 ondragstart="ordersManagement.handleOrderDragStart(event)"
                 onclick="ordersManagement.showOrderDetails('${order.id}')">
                
                <div class="order-card-header">
                    <div class="order-number">${order.orderNumber}</div>
                    <div class="order-time" title="${formatDateHebrew(order.createdAt)}">${timeAgo}</div>
                </div>

                <div class="order-customer">
                    <div class="customer-name">👤 ${order.customer?.name || 'לקוח'}</div>
                    <div class="customer-phone">📞 ${order.customer?.phone || ''}</div>
                </div>

                <div class="order-items">
                    <div class="items-count">🍽️ ${order.items?.length || 0} פריטים</div>
                    <div class="order-total">${formatPrice(order.total || 0)}</div>
                </div>

                <div class="order-payment">
                    <span class="payment-method">
                        ${order.paymentMethod === 'cash' ? '💵' : '📱'} 
                        ${order.paymentMethod === 'cash' ? 'מזומן' : 'ביט'}
                    </span>
                    <span class="payment-status ${order.paymentStatus || 'pending'}">
                        ${order.paymentStatus === 'completed' ? '✅' : '⏳'}
                    </span>
                </div>

                <div class="order-actions">
                    <button class="action-btn" onclick="event.stopPropagation(); ordersManagement.showOrderActions('${order.id}')" title="פעולות">
                        ⚙️
                    </button>
                    ${order.status !== 'completed' ? `
                        <button class="action-btn next-status" onclick="event.stopPropagation(); ordersManagement.moveToNextStatus('${order.id}')" title="שלב הבא">
                            ➡️
                        </button>
                    ` : ''}
                </div>

                ${order.customer?.notes ? `
                    <div class="order-notes">
                        📝 ${truncateText(order.customer.notes, 50)}
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * הצגת פרטי הזמנה
     */
    showOrderDetails(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) {
            showError('הזמנה לא נמצאה');
            return;
        }

        const modal = uiComponents.createModal({
            title: `📋 הזמנה ${order.orderNumber}`,
            size: 'large',
            content: this.renderOrderDetailsContent(order),
            className: 'order-details-modal'
        });

        modal.open();
    }

    /**
     * רינדור תוכן פרטי הזמנה
     */
    renderOrderDetailsContent(order) {
        const statusInfo = CONFIG.orderStatuses[order.status] || CONFIG.orderStatuses.new;
        
        return `
            <div class="order-details">
                <!-- Header -->
                <div class="order-details-header">
                    <div class="order-status-large status-${order.status}">
                        <span class="status-icon">${statusInfo.icon}</span>
                        <span class="status-text">${statusInfo.label}</span>
                    </div>
                    <div class="order-time-info">
                        <div>נוצרה: ${formatDateHebrew(order.createdAt)}</div>
                        ${order.updatedAt !== order.createdAt ? `
                            <div>עודכנה: ${getRelativeTime(order.updatedAt)}</div>
                        ` : ''}
                    </div>
                </div>

                <!-- Customer Info -->
                <div class="detail-section">
                    <h4>👤 פרטי לקוח</h4>
                    <div class="customer-details">
                        <div><strong>שם:</strong> ${order.customer?.name || 'לא צוין'}</div>
                        <div><strong>טלפון:</strong> ${order.customer?.phone || 'לא צוין'}</div>
                        <div><strong>כתובת:</strong> ${order.customer?.address || 'לא צוינה'}</div>
                        ${order.customer?.notes ? `
                            <div><strong>הערות:</strong> ${order.customer.notes}</div>
                        ` : ''}
                    </div>
                </div>

                <!-- Order Items -->
                <div class="detail-section">
                    <h4>🍽️ פריטי ההזמנה</h4>
                    <div class="order-items-list">
                        ${order.items?.map(item => `
                            <div class="order-item-detail">
                                <div class="item-name">${item.name}</div>
                                <div class="item-quantity">כמות: ${item.quantity}</div>
                                <div class="item-price">${formatPrice(item.price)} × ${item.quantity} = ${formatPrice(item.subtotal)}</div>
                            </div>
                        `).join('') || '<p>אין פריטים</p>'}
                    </div>
                </div>

                <!-- Payment Info -->
                <div class="detail-section">
                    <h4>💳 פרטי תשלום</h4>
                    <div class="payment-details">
                        <div class="payment-summary">
                            <div class="summary-line">
                                <span>סה"כ מוצרים:</span>
                                <span>${formatPrice(order.subtotal || 0)}</span>
                            </div>
                            <div class="summary-line">
                                <span>דמי משלוח:</span>
                                <span>${formatPrice(order.deliveryFee || 0)}</span>
                            </div>
                            <div class="summary-line total">
                                <span>סה"כ לתשלום:</span>
                                <span>${formatPrice(order.total || 0)}</span>
                            </div>
                        </div>
                        <div class="payment-method-info">
                            <div>
                                <strong>אמצעי תשלום:</strong> 
                                ${order.paymentMethod === 'cash' ? '💵 מזומן' : '📱 ביט'}
                            </div>
                            <div class="payment-status-info ${order.paymentStatus || 'pending'}">
                                <strong>סטטוס תשלום:</strong>
                                ${order.paymentStatus === 'completed' ? '✅ שולם' : '⏳ ממתין לתשלום'}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Timeline -->
                ${this.renderOrderTimeline(order)}

                <!-- Actions -->
                <div class="detail-section">
                    <h4>⚡ פעולות</h4>
                    <div class="order-actions-grid">
                        ${this.renderOrderActions(order)}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * רינדור ציר זמן הזמנה
     */
    renderOrderTimeline(order) {
        const events = [
            { 
                status: 'new', 
                time: order.createdAt, 
                label: 'הזמנה התקבלה',
                completed: true 
            },
            { 
                status: 'cooking', 
                time: order.cookingStartedAt, 
                label: 'החלה הכנה',
                completed: ['cooking', 'ready', 'completed'].includes(order.status)
            },
            { 
                status: 'ready', 
                time: order.readyAt, 
                label: 'מוכן למשלוח',
                completed: ['ready', 'completed'].includes(order.status)
            },
            { 
                status: 'completed', 
                time: order.completedAt, 
                label: 'הושלם',
                completed: order.status === 'completed'
            }
        ];

        return `
            <div class="detail-section">
                <h4>📅 ציר זמן</h4>
                <div class="order-timeline">
                    ${events.map(event => `
                        <div class="timeline-event ${event.completed ? 'completed' : ''}">
                            <div class="timeline-icon">
                                ${CONFIG.orderStatuses[event.status]?.icon || '📝'}
                            </div>
                            <div class="timeline-content">
                                <div class="timeline-label">${event.label}</div>
                                ${event.time ? `
                                    <div class="timeline-time">${formatDateHebrew(event.time)}</div>
                                ` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * רינדור פעולות הזמנה
     */
    renderOrderActions(order) {
        const actions = [];

        // פעולות לפי סטטוס
        switch (order.status) {
            case 'new':
                actions.push(
                    `<button class="btn btn-primary" onclick="ordersManagement.updateOrderStatus('${order.id}', 'cooking')">
                        👨‍🍳 התחל הכנה
                    </button>`,
                    `<button class="btn btn-secondary" onclick="ordersManagement.updateOrderStatus('${order.id}', 'cancelled')">
                        ❌ בטל הזמנה
                    </button>`
                );
                break;
            case 'cooking':
                actions.push(
                    `<button class="btn btn-success" onclick="ordersManagement.updateOrderStatus('${order.id}', 'ready')">
                        ✅ סמן כמוכן
                    </button>`,
                    `<button class="btn btn-secondary" onclick="ordersManagement.updateOrderStatus('${order.id}', 'new')">
                        ⬅️ חזור לחדש
                    </button>`
                );
                break;
            case 'ready':
                actions.push(
                    `<button class="btn btn-success" onclick="ordersManagement.updateOrderStatus('${order.id}', 'completed')">
                        🎉 השלם הזמנה
                    </button>`,
                    `<button class="btn btn-secondary" onclick="ordersManagement.updateOrderStatus('${order.id}', 'cooking')">
                        ⬅️ חזור להכנה
                    </button>`
                );
                break;
            case 'completed':
                actions.push(
                    `<button class="btn btn-secondary" onclick="ordersManagement.updateOrderStatus('${order.id}', 'ready')">
                        ↩️ סמן כמוכן
                    </button>`
                );
                break;
        }

        // פעולות כלליות
        actions.push(
            `<button class="btn btn-info" onclick="ordersManagement.printOrder('${order.id}')">
                🖨️ הדפס
            </button>`,
            `<button class="btn btn-warning" onclick="ordersManagement.duplicateOrder('${order.id}')">
                📋 שכפל
            </button>`,
            `<button class="btn btn-danger" onclick="ordersManagement.deleteOrder('${order.id}')">
                🗑️ מחק
            </button>`
        );

        return actions.join('');
    }

    /**
     * מעבר לשלב הבא
     */
    moveToNextStatus(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) return;

        const statusFlow = {
            'new': 'cooking',
            'cooking': 'ready',
            'ready': 'completed'
        };

        const nextStatus = statusFlow[order.status];
        if (nextStatus) {
            this.updateOrderStatus(orderId, nextStatus);
        }
    }

    /**
     * טיפול בגרירת הזמנה
     */
    handleOrderDragStart(event) {
        const orderCard = event.target.closest('.order-card');
        if (orderCard) {
            event.dataTransfer.setData('text/plain', orderCard.dataset.orderId);
            event.dataTransfer.effectAllowed = 'move';
            orderCard.classList.add('dragging');
        }
    }

    /**
     * שחרור הזמנה במקום חדש
     */
    drop(event) {
        event.preventDefault();
        
        const orderId = event.dataTransfer.getData('text/plain');
        const targetColumn = event.target.closest('.orders-list');
        
        if (orderId && targetColumn) {
            const newStatus = targetColumn.id.replace('Orders', '');
            this.updateOrderStatus(orderId, newStatus);
        }

        // נקה סגנון גרירה
        document.querySelectorAll('.order-card.dragging').forEach(card => {
            card.classList.remove('dragging');
        });
    }

    /**
     * אפשר שחרור
     */
    allowDrop(event) {
        event.preventDefault();
    }

    /**
     * הצגת התראה להזמנה חדשה
     */
    showNewOrderNotification(order) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('הזמנה חדשה! 🔔', {
                body: `הזמנה ${order.orderNumber} מ${order.customer?.name || 'לקוח'} - ${formatPrice(order.total)}`,
                icon: '/favicon.ico',
                tag: 'new-order'
            });
        }

        // התראה בממשק
        showSuccess(`הזמנה חדשה התקבלה: ${order.orderNumber}`, { 
            duration: 5000,
            persistent: false 
        });

        // נגן צליל (אם זמין)
        this.playOrderSound();
    }

    /**
     * נגינת צליל הזמנה
     */
    playOrderSound() {
        try {
            // יצור צליל פשוט
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);

        } catch (error) {
            console.log('לא ניתן לנגן צליל:', error);
        }
    }

    /**
     * הדפסת הזמנה
     */
    printOrder(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) {
            showError('הזמנה לא נמצאה');
            return;
        }

        const printContent = this.generatePrintContent(order);
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
    }

    /**
     * יצירת תוכן להדפסה
     */
    generatePrintContent(order) {
        return `
            <!DOCTYPE html>
            <html dir="rtl">
            <head>
                <meta charset="UTF-8">
                <title>הזמנה ${order.orderNumber}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; }
                    .section { margin: 20px 0; }
                    .items-table { width: 100%; border-collapse: collapse; }
                    .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: right; }
                    .total { font-weight: bold; font-size: 1.2em; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>${CONFIG.restaurant.name}</h1>
                    <p>${CONFIG.restaurant.address}</p>
                    <p>טלפון: ${CONFIG.restaurant.phone}</p>
                </div>

                <div class="section">
                    <h2>הזמנה ${order.orderNumber}</h2>
                    <p>תאריך: ${formatDateHebrew(order.createdAt)}</p>
                    <p>סטטוס: ${CONFIG.orderStatuses[order.status]?.label}</p>
                </div>

                <div class="section">
                    <h3>פרטי לקוח:</h3>
                    <p>שם: ${order.customer?.name}</p>
                    <p>טלפון: ${order.customer?.phone}</p>
                    <p>כתובת: ${order.customer?.address}</p>
                    ${order.customer?.notes ? `<p>הערות: ${order.customer.notes}</p>` : ''}
                </div>

                <div class="section">
                    <h3>פריטים:</h3>
                    <table class="items-table">
                        <thead>
                            <tr>
                                <th>פריט</th>
                                <th>כמות</th>
                                <th>מחיר יחידה</th>
                                <th>סה"כ</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.items?.map(item => `
                                <tr>
                                    <td>${item.name}</td>
                                    <td>${item.quantity}</td>
                                    <td>${formatPrice(item.price)}</td>
                                    <td>${formatPrice(item.subtotal)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                <div class="section">
                    <p>סה"כ מוצרים: ${formatPrice(order.subtotal)}</p>
                    <p>דמי משלוח: ${formatPrice(order.deliveryFee)}</p>
                    <p class="total">סה"כ לתשלום: ${formatPrice(order.total)}</p>
                    <p>אמצעי תשלום: ${order.paymentMethod === 'cash' ? 'מזומן' : 'ביט'}</p>
                </div>
            </body>
            </html>
        `;
    }

    /**
     * שכפול הזמנה
     */
    duplicateOrder(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) {
            showError('הזמנה לא נמצאה');
            return;
        }

        const duplicatedOrder = {
            ...order,
            id: generateId('order_'),
            orderNumber: generateOrderNumber(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: 'new',
            cookingStartedAt: null,
            readyAt: null,
            completedAt: null
        };

        this.addOrder(duplicatedOrder);
        showSuccess(`הזמנה שוכפלה בהצלחה: ${duplicatedOrder.orderNumber}`);
    }

    /**
     * הגדרת רענון אוטומטי
     */
    setupAutoRefresh() {
        if (this.autoRefresh) {
            this.refreshInterval = setInterval(() => {
                this.loadOrders();
                if (admin.isLoggedIn && admin.currentTab === 'orders') {
                    this.renderOrdersBoard();
                }
            }, 30000); // כל 30 שניות
        }
    }

    /**
     * יצירת הזמנת בדיקה
     */
    testNewOrder() {
        const testOrder = {
            orderNumber: generateOrderNumber(),
            customer: {
                name: 'לקוח בדיקה',
                phone: '050-1234567',
                address: 'כתובת בדיקה 123',
                notes: 'זוהי הזמנת בדיקה',
                paymentMethod: 'cash'
            },
            items: [
                {
                    id: 'test_item_1',
                    name: 'המבורגר בדיקה',
                    price: 45,
                    quantity: 2,
                    subtotal: 90
                }
            ],
            subtotal: 90,
            deliveryFee: 15,
            total: 105,
            paymentMethod: 'cash',
            paymentStatus: 'pending'
        };

        this.addOrder(testOrder);
        showSuccess('הזמנת בדיקה נוצרה');
    }

    /**
     * ניקוי כל ההזמנות
     */
    clearAllOrders() {
        if (!confirm('האם אתה בטוח שברצונך למחוק את כל ההזמנות? פעולה זו בלתי הפיכה!')) {
            return;
        }

        this.orders = [];
        DataManager.saveOrders([]);
        
        this.updateStatistics();
        this.renderOrdersBoard();
        
        showSuccess('כל ההזמנות נמחקו');
    }

    /**
     * קישור אירועים
     */
    bindEvents() {
        // בקשת הרשאה להתראות
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    /**
     * התראה ללקוח על שינוי סטטוס
     */
    notifyCustomerStatusChange(order, oldStatus, newStatus) {
        // כאן ניתן להוסיף שליחת SMS או מייל ללקוח
        console.log(`התראה ללקוח ${order.customer?.name}: הזמנה ${order.orderNumber} עודכנה מ${oldStatus} ל${newStatus}`);
        
        // דוגמה לשליחת הודעה (דורש שירות חיצוני)
        // this.sendSMSToCustomer(order.customer.phone, `הזמנתך ${order.orderNumber} ${CONFIG.orderStatuses[newStatus]?.label}`);
    }
}

// יצירת מופע יחיד
const ordersManagement = new OrdersManagement();

// פונקציות גלובליות
window.drop = ordersManagement.drop.bind(ordersManagement);
window.allowDrop = ordersManagement.allowDrop.bind(ordersManagement);
window.testNewOrder = ordersManagement.testNewOrder.bind(ordersManagement);
window.clearAllOrders = ordersManagement.clearAllOrders.bind(ordersManagement);

// הרחבת admin עם פונקציות הזמנות
if (typeof admin !== 'undefined') {
    admin.loadOrdersManagement = ordersManagement.loadOrdersManagement.bind(ordersManagement);
}