// js/customers-management.js - ניהול לקוחות מתקדם

/**
 * מחלקה לניהול לקוחות
 */
class CustomersManagement {
    constructor() {
        this.customers = [];
        this.filteredCustomers = [];
        this.currentFilter = 'all';
        this.currentSort = 'lastOrderDate';
        this.sortDirection = 'desc';
        this.searchQuery = '';
        this.init();
    }

    /**
     * אתחול ניהול לקוחות
     */
    init() {
        this.loadCustomers();
        this.bindEvents();
    }

    /**
     * טעינת לקוחות
     */
    loadCustomers() {
        this.customers = DataManager.getCustomers() || [];
        this.filteredCustomers = [...this.customers];
        this.updateStatistics();
    }

    /**
     * הוספת לקוח חדש
     */
    addCustomer(customerData) {
        const customer = {
            id: generateId('customer_'),
            ...customerData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            totalOrders: customerData.totalOrders || 0,
            totalSpent: customerData.totalSpent || 0,
            lastOrderDate: customerData.lastOrderDate || null,
            firstOrderDate: customerData.firstOrderDate || new Date().toISOString()
        };

        // בדוק אם הלקוח כבר קיים
        const existingCustomer = this.customers.find(c => c.phone === customer.phone);
        if (existingCustomer) {
            return this.updateCustomer(existingCustomer.id, customerData);
        }

        this.customers.push(customer);
        DataManager.addCustomer(customer);

        this.applyFiltersAndSort();
        this.updateStatistics();

        return customer;
    }

    /**
     * עדכון לקוח
     */
    updateCustomer(customerId, updateData) {
        const customerIndex = this.customers.findIndex(c => c.id === customerId || c.phone === customerId);
        if (customerIndex === -1) {
            return null;
        }

        this.customers[customerIndex] = {
            ...this.customers[customerIndex],
            ...updateData,
            updatedAt: new Date().toISOString()
        };

        DataManager.saveCustomers(this.customers);
        this.applyFiltersAndSort();
        this.updateStatistics();

        return this.customers[customerIndex];
    }

    /**
     * מחיקת לקוח
     */
    deleteCustomer(customerId) {
        const customer = this.customers.find(c => c.id === customerId);
        if (!customer) {
            showError('לקוח לא נמצא');
            return false;
        }

        if (!confirm(`האם אתה בטוח שברצונך למחוק את הלקוח "${customer.name}"?`)) {
            return false;
        }

        this.customers = this.customers.filter(c => c.id !== customerId);
        DataManager.saveCustomers(this.customers);

        this.applyFiltersAndSort();
        this.updateStatistics();

        showSuccess('הלקוח נמחק בהצלחה');
        return true;
    }

    /**
     * חיפוש לקוחות
     */
    searchCustomers(query = null) {
        if (query !== null) {
            this.searchQuery = query;
        }

        if (!this.searchQuery || this.searchQuery.trim().length < 2) {
            this.filteredCustomers = [...this.customers];
        } else {
            const searchTerm = this.searchQuery.toLowerCase().trim();
            this.filteredCustomers = this.customers.filter(customer =>
                customer.name?.toLowerCase().includes(searchTerm) ||
                customer.phone?.includes(searchTerm) ||
                customer.address?.toLowerCase().includes(searchTerm)
            );
        }

        this.sortCustomers();
        this.renderCustomersList();
    }

    /**
     * סינון לקוחות
     */
    filterCustomers(filter) {
        this.currentFilter = filter;
        this.applyFiltersAndSort();
    }

    /**
     * מיון לקוחות
     */
    sortCustomers(sortBy = null, direction = null) {
        if (sortBy) this.currentSort = sortBy;
        if (direction) this.sortDirection = direction;

        this.filteredCustomers.sort((a, b) => {
            let aValue = a[this.currentSort];
            let bValue = b[this.currentSort];

            // טיפול בערכים null/undefined
            if (aValue === null || aValue === undefined) aValue = this.sortDirection === 'desc' ? -Infinity : Infinity;
            if (bValue === null || bValue === undefined) bValue = this.sortDirection === 'desc' ? -Infinity : Infinity;

            // המרה לתאריכים
            if (this.currentSort.includes('Date')) {
                aValue = new Date(aValue).getTime();
                bValue = new Date(bValue).getTime();
            }

            if (this.sortDirection === 'desc') {
                return bValue > aValue ? 1 : -1;
            } else {
                return aValue > bValue ? 1 : -1;
            }
        });

        this.renderCustomersList();
    }

    /**
     * החלת סינונים ומיון
     */
    applyFiltersAndSort() {
        // החל חיפוש
        this.searchCustomers();

        // החל סינון
        switch (this.currentFilter) {
            case 'new':
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                this.filteredCustomers = this.filteredCustomers.filter(c =>
                    new Date(c.firstOrderDate) > weekAgo
                );
                break;
            case 'frequent':
                this.filteredCustomers = this.filteredCustomers.filter(c =>
                    c.totalOrders >= 5
                );
                break;
            case 'vip':
                this.filteredCustomers = this.filteredCustomers.filter(c =>
                    c.totalSpent >= 500
                );
                break;
        }

        this.sortCustomers();
    }

    /**
     * טעינת ניהול לקוחות לפאנל אדמין
     */
    loadCustomersManagement() {
        this.loadCustomers();
        this.updateStatistics();
        this.renderCustomersList();
    }

    /**
     * עדכון סטטיסטיקות
     */
    updateStatistics() {
        const stats = this.calculateStatistics();

        const elements = {
            'totalCustomersCount': stats.totalCustomers,
            'newCustomersToday': stats.newCustomersToday,
            'returningCustomers': stats.returningCustomers,
            'topCustomerSpent': formatPrice(stats.topCustomerSpent)
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
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const newCustomersToday = this.customers.filter(c =>
            new Date(c.firstOrderDate).toDateString() === today
        ).length;

        const returningCustomers = this.customers.filter(c =>
            c.totalOrders > 1
        ).length;

        const topCustomerSpent = this.customers.length > 0
            ? Math.max(...this.customers.map(c => c.totalSpent || 0))
            : 0;

        return {
            totalCustomers: this.customers.length,
            newCustomersToday: newCustomersToday,
            returningCustomers: returningCustomers,
            topCustomerSpent: topCustomerSpent,
            averageOrderValue: this.customers.length > 0
                ? this.customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0) / this.customers.length
                : 0
        };
    }

    /**
     * רינדור רשימת לקוחות
     */
    renderCustomersList() {
        const container = document.getElementById('customersList');
        if (!container) return;

        if (this.filteredCustomers.length === 0) {
            container.innerHTML = `
                <div class="no-customers-message">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">👥</div>
                    <h3>אין לקוחות</h3>
                    <p>${this.searchQuery ? 'לא נמצאו תוצאות לחיפוש' : 'עדיין לא נרשמו לקוחות'}</p>
                </div>
            `;
            return;
        }

        const customersHTML = this.filteredCustomers.map(customer =>
            this.renderCustomerCard(customer)
        ).join('');

        container.innerHTML = `
            <div class="customers-grid">
                ${customersHTML}
            </div>
        `;
    }

    /**
     * רינדור כרטיס לקוח
     */
    renderCustomerCard(customer) {
        const lastOrderDate = customer.lastOrderDate ? getRelativeTime(customer.lastOrderDate) : 'אף פעם';
        const customerType = this.getCustomerType(customer);

        return `
            <div class="customer-card ${customerType.class}" onclick="customersManagement.showCustomerDetails('${customer.id}')">
                <div class="customer-card-header">
                    <div class="customer-avatar">
                        ${customer.name ? customer.name.charAt(0).toUpperCase() : '👤'}
                    </div>
                    <div class="customer-info">
                        <h4 class="customer-name">${customer.name || 'לקוח'}</h4>
                        <p class="customer-phone">📞 ${customer.phone || ''}</p>
                    </div>
                    <div class="customer-type-badge">
                        <span class="badge badge-${customerType.class}">${customerType.label}</span>
                    </div>
                </div>

                <div class="customer-stats">
                    <div class="stat">
                        <div class="stat-value">${customer.totalOrders || 0}</div>
                        <div class="stat-label">הזמנות</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">${formatPrice(customer.totalSpent || 0)}</div>
                        <div class="stat-label">הוצאה</div>
                    </div>
                </div>

                <div class="customer-details">
                    <div class="detail-row">
                        <span class="detail-label">הזמנה אחרונה:</span>
                        <span class="detail-value">${lastOrderDate}</span>
                    </div>
                    ${customer.address ? `
                        <div class="detail-row">
                            <span class="detail-label">כתובת:</span>
                            <span class="detail-value">${truncateText(customer.address, 30)}</span>
                        </div>
                    ` : ''}
                </div>

                <div class="customer-actions">
                    <button class="action-btn" onclick="event.stopPropagation(); customersManagement.callCustomer('${customer.phone}')" title="התקשר">
                        📞
                    </button>
                    <button class="action-btn" onclick="event.stopPropagation(); customersManagement.editCustomer('${customer.id}')" title="ערוך">
                        ✏️
                    </button>
                    <button class="action-btn" onclick="event.stopPropagation(); customersManagement.viewCustomerOrders('${customer.id}')" title="הזמנות">
                        📋
                    </button>
                    <button class="action-btn delete" onclick="event.stopPropagation(); customersManagement.deleteCustomer('${customer.id}')" title="מחק">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * קביעת סוג לקוח
     */
    getCustomerType(customer) {
        if (customer.totalSpent >= 1000) {
            return { class: 'vip', label: '👑 VIP' };
        } else if (customer.totalOrders >= 5) {
            return { class: 'frequent', label: '⭐ קבוע' };
        } else if (customer.totalOrders === 1) {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            if (new Date(customer.firstOrderDate) > weekAgo) {
                return { class: 'new', label: '🆕 חדש' };
            }
        }
        return { class: 'regular', label: '👤 רגיל' };
    }

    /**
     * הצגת פרטי לקוח
     */
    showCustomerDetails(customerId) {
        const customer = this.customers.find(c => c.id === customerId);
        if (!customer) {
            showError('לקוח לא נמצא');
            return;
        }

        const modal = uiComponents.createModal({
            title: `👤 ${customer.name || 'לקוח'}`,
            size: 'large',
            content: this.renderCustomerDetailsContent(customer),
            className: 'customer-details-modal'
        });

        modal.open();
    }

    /**
     * רינדור תוכן פרטי לקוח
     */
    renderCustomerDetailsContent(customer) {
        const customerType = this.getCustomerType(customer);
        const orders = DataManager.getOrders().filter(o => o.customer?.phone === customer.phone);

        return `
            <div class="customer-details">
                <!-- Header -->
                <div class="customer-details-header">
                    <div class="customer-avatar-large">
                        ${customer.name ? customer.name.charAt(0).toUpperCase() : '👤'}
                    </div>
                    <div class="customer-main-info">
                        <h3>${customer.name || 'לקוח'}</h3>
                        <div class="customer-type-large">
                            <span class="badge badge-${customerType.class} badge-large">${customerType.label}</span>
                        </div>
                        <div class="customer-contact">
                            <div>📞 ${customer.phone}</div>
                            ${customer.address ? `<div>🏠 ${customer.address}</div>` : ''}
                        </div>
                    </div>
                </div>

                <!-- Statistics -->
                <div class="customer-stats-section">
                    <h4>📊 סטטיסטיקות</h4>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-value">${customer.totalOrders || 0}</div>
                            <div class="stat-label">הזמנות</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${formatPrice(customer.totalSpent || 0)}</div>
                            <div class="stat-label">סה"כ הוצאה</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${customer.totalOrders > 0 ? formatPrice((customer.totalSpent || 0) / customer.totalOrders) : '₪0'}</div>
                            <div class="stat-label">ממוצע הזמנה</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${customer.lastOrderDate ? getRelativeTime(customer.lastOrderDate) : 'אף פעם'}</div>
                            <div class="stat-label">הזמנה אחרונה</div>
                        </div>
                    </div>
                </div>

                <!-- Recent Orders -->
                ${orders.length > 0 ? `
                    <div class="customer-orders-section">
                        <h4>📋 הזמנות אחרונות</h4>
                        <div class="orders-list">
                            ${orders.slice(0, 5).map(order => `
                                <div class="order-item-summary">
                                    <div class="order-header">
                                        <span class="order-number">${order.orderNumber}</span>
                                        <span class="order-date">${getRelativeTime(order.createdAt)}</span>
                                    </div>
                                    <div class="order-details">
                                        <span class="order-items">${order.items?.length || 0} פריטים</span>
                                        <span class="order-total">${formatPrice(order.total || 0)}</span>
                                    </div>
                                    <div class="order-status">
                                        <span class="status-badge status-${order.status}">
                                            ${CONFIG.orderStatuses[order.status]?.icon || '📝'}
                                            ${CONFIG.orderStatuses[order.status]?.label || order.status}
                                        </span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        ${orders.length > 5 ? `
                            <div class="show-more">
                                <button class="btn btn-secondary" onclick="customersManagement.viewCustomerOrders('${customer.id}')">
                                    📋 הצג את כל ההזמנות (${orders.length})
                                </button>
                            </div>
                        ` : ''}
                    </div>
                ` : `
                    <div class="no-orders">
                        <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                            <div style="font-size: 2rem; margin-bottom: 1rem;">📋</div>
                            <p>אין הזמנות עדיין</p>
                        </div>
                    </div>
                `}

                <!-- Actions -->
                <div class="customer-actions-section">
                    <h4>⚡ פעולות</h4>
                    <div class="actions-grid">
                        <button class="btn btn-primary" onclick="customersManagement.callCustomer('${customer.phone}')">
                            📞 התקשר
                        </button>
                        <button class="btn btn-secondary" onclick="customersManagement.editCustomer('${customer.id}')">
                            ✏️ ערוך פרטים
                        </button>
                        <button class="btn btn-info" onclick="customersManagement.createOrderForCustomer('${customer.id}')">
                            🛒 צור הזמנה
                        </button>
                        <button class="btn btn-warning" onclick="customersManagement.sendMessageToCustomer('${customer.id}')">
                            💬 שלח הודעה
                        </button>
                        <button class="btn btn-success" onclick="customersManagement.exportCustomerData('${customer.id}')">
                            📤 יצא נתונים
                        </button>
                        <button class="btn btn-danger" onclick="customersManagement.deleteCustomer('${customer.id}')">
                            🗑️ מחק לקוח
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * התקשרות ללקוח
     */
    callCustomer(phone) {
        if (!phone) {
            showError('מספר טלפון לא זמין');
            return;
        }

        // נסה לפתוח אפליקציית החיוג
        window.location.href = `tel:${phone}`;

        showInfo(`מתקשר ל${phone}...`);
    }

    /**
     * עריכת לקוח
     */
    editCustomer(customerId) {
        const customer = this.customers.find(c => c.id === customerId);
        if (!customer) {
            showError('לקוח לא נמצא');
            return;
        }

        const editModal = uiComponents.createModal({
            title: `✏️ עריכת ${customer.name || 'לקוח'}`,
            content: this.renderEditCustomerForm(customer),
            className: 'edit-customer-modal'
        });

        editModal.open();
    }

    /**
     * רינדור טופס עריכת לקוח
     */
    renderEditCustomerForm(customer) {
        return `
            <form id="editCustomerForm" onsubmit="customersManagement.saveCustomerChanges(event, '${customer.id}')">
                <div class="form-group">
                    <label for="editCustomerName">שם מלא:</label>
                    <input type="text" id="editCustomerName" value="${customer.name || ''}" required>
                </div>

                <div class="form-group">
                    <label for="editCustomerPhone">טלפון:</label>
                    <input type="tel" id="editCustomerPhone" value="${customer.phone || ''}" required>
                </div>

                <div class="form-group">
                    <label for="editCustomerAddress">כתובת:</label>
                    <input type="text" id="editCustomerAddress" value="${customer.address || ''}">
                </div>

                <div class="form-group">
                    <label for="editCustomerNotes">הערות:</label>
                    <textarea id="editCustomerNotes" rows="3">${customer.notes || ''}</textarea>
                </div>

                <div class="modal-buttons">
                    <button type="submit" class="btn btn-primary">💾 שמור שינויים</button>
                    <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">❌ ביטול</button>
                </div>
            </form>
        `;
    }

    /**
     * שמירת שינויים בלקוח
     */
    saveCustomerChanges(event, customerId) {
        event.preventDefault();

        const formData = {
            name: document.getElementById('editCustomerName').value.trim(),
            phone: document.getElementById('editCustomerPhone').value.trim(),
            address: document.getElementById('editCustomerAddress').value.trim(),
            notes: document.getElementById('editCustomerNotes').value.trim()
        };

        if (!formData.name || !formData.phone) {
            showError('שם וטלפון נדרשים');
            return;
        }

        if (!validateIsraeliPhone(formData.phone)) {
            showError('מספר טלפון לא תקין');
            return;
        }

        try {
            this.updateCustomer(customerId, formData);
            showSuccess('פרטי הלקוח עודכנו בהצלחה');

            // סגור מודל
            document.querySelector('.edit-customer-modal').remove();

            // רענן רשימה
            this.renderCustomersList();

        } catch (error) {
            showError('שגיאה בעדכון הלקוח: ' + error.message);
        }
    }

    /**
     * צפייה בהזמנות לקוח
     */
    viewCustomerOrders(customerId) {
        const customer = this.customers.find(c => c.id === customerId);
        if (!customer) {
            showError('לקוח לא נמצא');
            return;
        }

        const orders = DataManager.getOrders().filter(o => o.customer?.phone === customer.phone);

        const modal = uiComponents.createModal({
            title: `📋 הזמנות של ${customer.name}`,
            size: 'large',
            content: this.renderCustomerOrdersContent(customer, orders),
            className: 'customer-orders-modal'
        });

        modal.open();
    }

    /**
     * רינדור תוכן הזמנות לקוח
     */
    renderCustomerOrdersContent(customer, orders) {
        if (orders.length === 0) {
            return `
                <div style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">📋</div>
                    <h3>אין הזמנות</h3>
                    <p>הלקוח עדיין לא ביצע הזמנות</p>
                </div>
            `;
        }

        return `
            <div class="customer-orders-list">
                ${orders.map(order => `
                    <div class="customer-order-card">
                        <div class="order-card-header">
                            <div class="order-number">${order.orderNumber}</div>
                            <div class="order-date">${formatDateHebrew(order.createdAt)}</div>
                            <div class="order-status">
                                <span class="status-badge status-${order.status}">
                                    ${CONFIG.orderStatuses[order.status]?.icon || '📝'}
                                    ${CONFIG.orderStatuses[order.status]?.label || order.status}
                                </span>
                            </div>
                        </div>

                        <div class="order-items-summary">
                            ${order.items?.slice(0, 3).map(item => `
                                <span class="item-chip">${item.name} ×${item.quantity}</span>
                            `).join('')}
                            ${order.items?.length > 3 ? `<span class="item-chip more">+${order.items.length - 3} נוספים</span>` : ''}
                        </div>

                        <div class="order-card-footer">
                            <div class="order-total">${formatPrice(order.total || 0)}</div>
                            <div class="order-payment">
                                ${order.paymentMethod === 'cash' ? '💵' : '📱'}
                                ${order.paymentStatus === 'completed' ? '✅' : '⏳'}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>

            <div class="orders-summary">
                <div class="summary-stats">
                    <div class="summary-stat">
                        <div class="stat-value">${orders.length}</div>
                        <div class="stat-label">סה"כ הזמנות</div>
                    </div>
                    <div class="summary-stat">
                        <div class="stat-value">${formatPrice(orders.reduce((sum, o) => sum + (o.total || 0), 0))}</div>
                        <div class="stat-label">סה"כ הוצאה</div>
                    </div>
                    <div class="summary-stat">
                        <div class="stat-value">${formatPrice(orders.reduce((sum, o) => sum + (o.total || 0), 0) / orders.length)}</div>
                        <div class="stat-label">ממוצע הזמנה</div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * יצוא נתוני לקוח
     */
    exportCustomerData(customerId) {
        const customer = this.customers.find(c => c.id === customerId);
        if (!customer) {
            showError('לקוח לא נמצא');
            return;
        }

        const orders = DataManager.getOrders().filter(o => o.customer?.phone === customer.phone);

        const exportData = {
            customer: customer,
            orders: orders,
            exportDate: new Date().toISOString(),
            summary: {
                totalOrders: orders.length,
                totalSpent: orders.reduce((sum, o) => sum + (o.total || 0), 0),
                averageOrderValue: orders.length > 0 ? orders.reduce((sum, o) => sum + (o.total || 0), 0) / orders.length : 0,
                firstOrder: orders.length > 0 ? orders[orders.length - 1].createdAt : null,
                lastOrder: orders.length > 0 ? orders[0].createdAt : null
            }
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

        const fileName = `customer-${customer.name?.replace(/\s+/g, '-') || customer.phone}-${new Date().toISOString().split('T')[0]}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', fileName);
        linkElement.click();

        showSuccess('נתוני הלקוח יוצאו בהצלחה');
    }

    /**
     * סנכרון לקוחות (דמה)
     */
    syncCustomersFromSupabase() {
        showInfo('מסנכרן לקוחות...');

        // דמה של סנכרון
        setTimeout(() => {
            this.loadCustomers();
            showSuccess('סנכרון הושלם בהצלחה');
        }, 2000);
    }

    /**
     * ייצוא כל הלקוחות
     */
    exportCustomers() {
        const exportData = {
            customers: this.customers,
            exportDate: new Date().toISOString(),
            totalCustomers: this.customers.length,
            statistics: this.calculateStatistics()
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

        const fileName = `hazya-customers-${new Date().toISOString().split('T')[0]}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', fileName);
        linkElement.click();

        showSuccess(`${this.customers.length} לקוחות יוצאו בהצלחה`);
    }

    /**
     * קישור אירועים
     */
    bindEvents() {
        // חיפוש בזמן אמת
        document.addEventListener('input', (e) => {
            if (e.target.id === 'customerSearch') {
                debounce(() => this.searchCustomers(e.target.value), 300)();
            }
        });
    }
}

// יצירת מופע יחיד
const customersManagement = new CustomersManagement();

// פונקציות גלובליות
window.searchCustomers = customersManagement.searchCustomers.bind(customersManagement);
window.syncCustomersFromSupabase = customersManagement.syncCustomersFromSupabase.bind(customersManagement);
window.exportCustomers = customersManagement.exportCustomers.bind(customersManagement);

// הרחבת admin עם פונקציות לקוחות
if (typeof admin !== 'undefined') {
    admin.loadCustomersManagement = customersManagement.loadCustomersManagement.bind(customersManagement);
}