// js/inventory-management.js - ניהול מלאי מתקדם

/**
 * מחלקה לניהול מלאי
 */
class InventoryManagement {
    constructor() {
        this.inventory = {};
        this.lowStockThreshold = 5;
        this.outOfStockThreshold = 0;
        this.waitTimes = {};
        this.alerts = [];
        this.init();
    }

    /**
     * אתחול ניהול מלאי
     */
    init() {
        this.loadInventory();
        this.loadWaitTimes();
        this.syncWithMenu();
        this.bindEvents();
    }

    /**
     * טעינת נתוני מלאי
     */
    loadInventory() {
        this.inventory = DataManager.getInventory() || {};
        this.updateInventoryStatistics();
    }

    /**
     * שמירת נתוני מלאי
     */
    saveInventory() {
        DataManager.saveInventory(this.inventory);
        this.updateInventoryStatistics();
    }

    /**
     * טעינת זמני המתנה
     */
    loadWaitTimes() {
        this.waitTimes = DataManager.getSetting('waitTimes', {});
    }

    /**
     * שמירת זמני המתנה
     */
    saveWaitTimes() {
        DataManager.setSetting('waitTimes', this.waitTimes);
    }

    /**
     * סנכרון עם התפריט
     */
    syncWithMenu() {
        const menu = menuData.getMenu();
        let syncCount = 0;

        // עבור על כל הקטגוריות והפריטים
        menu.categories?.forEach(category => {
            const items = menu.items?.[category.id] || [];
            items.forEach(item => {
                if (!this.inventory[item.id]) {
                    // צור רשומת מלאי חדשה
                    this.inventory[item.id] = {
                        itemId: item.id,
                        categoryId: category.id,
                        name: item.name,
                        stock: 10, // כמות ברירת מחדל
                        lowStockThreshold: this.lowStockThreshold,
                        isActive: item.available !== false,
                        lastUpdated: new Date().toISOString(),
                        history: []
                    };
                    syncCount++;
                }
            });
        });

        if (syncCount > 0) {
            this.saveInventory();
            showInfo(`${syncCount} פריטים נוספו למלאי`);
        }
    }

    /**
     * טעינת ניהול מלאי לפאנל אדמין
     */
    loadInventoryManagement() {
        this.loadInventory();
        this.syncWithMenu();
        this.updateInventoryStatistics();
        this.renderInventoryList();
        this.checkLowStockAlerts();
    }

    /**
     * עדכון כמות פריט
     */
    updateStock(itemId, newStock, reason = 'עדכון ידני') {
        if (!this.inventory[itemId]) {
            showError('פריט לא נמצא במלאי');
            return false;
        }

        const oldStock = this.inventory[itemId].stock || 0;
        this.inventory[itemId].stock = Math.max(0, parseInt(newStock) || 0);
        this.inventory[itemId].lastUpdated = new Date().toISOString();

        // הוסף להיסטוריה
        this.addToHistory(itemId, {
            oldStock: oldStock,
            newStock: this.inventory[itemId].stock,
            change: this.inventory[itemId].stock - oldStock,
            reason: reason,
            timestamp: new Date().toISOString()
        });

        // בדוק התראות
        this.checkStockAlerts(itemId);

        // עדכן זמינות בתפריט
        this.updateMenuAvailability(itemId);

        this.saveInventory();
        this.updateInventoryStatistics();
        
        return true;
    }

    /**
     * הוספה להיסטוריית המלאי
     */
    addToHistory(itemId, historyEntry) {
        if (!this.inventory[itemId].history) {
            this.inventory[itemId].history = [];
        }

        this.inventory[itemId].history.unshift(historyEntry);

        // שמור רק 50 רשומות אחרונות
        if (this.inventory[itemId].history.length > 50) {
            this.inventory[itemId].history = this.inventory[itemId].history.slice(0, 50);
        }
    }

    /**
     * בדיקת התראות מלאי
     */
    checkStockAlerts(itemId = null) {
        const itemsToCheck = itemId ? [itemId] : Object.keys(this.inventory);
        
        itemsToCheck.forEach(id => {
            const item = this.inventory[id];
            if (!item || !item.isActive) return;

            const stock = item.stock || 0;
            const threshold = item.lowStockThreshold || this.lowStockThreshold;

            if (stock <= this.outOfStockThreshold) {
                this.addAlert(id, 'out_of_stock', `${item.name} אזל מהמלאי!`);
            } else if (stock <= threshold) {
                this.addAlert(id, 'low_stock', `${item.name} במלאי נמוך (${stock} יחידות)`);
            } else {
                // הסר התראות אם המלאי תוקן
                this.removeAlert(id);
            }
        });
    }

    /**
     * בדיקת התראות מלאי נמוך
     */
    checkLowStockAlerts() {
        this.alerts = [];
        this.checkStockAlerts();
        
        if (this.alerts.length > 0) {
            const alertsCount = this.alerts.length;
            showWarning(`יש ${alertsCount} התראות מלאי`, { duration: 5000 });
        }
    }

    /**
     * הוספת התראה
     */
    addAlert(itemId, type, message) {
        // בדוק אם כבר יש התראה לפריט זה
        const existingAlert = this.alerts.find(alert => alert.itemId === itemId);
        if (existingAlert) {
            existingAlert.type = type;
            existingAlert.message = message;
            existingAlert.timestamp = new Date().toISOString();
        } else {
            this.alerts.push({
                id: generateId('alert_'),
                itemId: itemId,
                type: type,
                message: message,
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * הסרת התראה
     */
    removeAlert(itemId) {
        this.alerts = this.alerts.filter(alert => alert.itemId !== itemId);
    }

    /**
     * עדכון זמינות בתפריט
     */
    updateMenuAvailability(itemId) {
        const inventoryItem = this.inventory[itemId];
        if (!inventoryItem) return;

        const isAvailable = inventoryItem.stock > this.outOfStockThreshold && inventoryItem.isActive;
        
        try {
            menuData.updateItem(inventoryItem.categoryId, itemId, { available: isAvailable });
            
            // עדכן UI אם צריך
            if (typeof ui !== 'undefined') {
                ui.refreshMenu();
            }
        } catch (error) {
            console.warn('שגיאה בעדכון זמינות תפריט:', error);
        }
    }

    /**
     * עדכון סטטיסטיקות מלאי
     */
    updateInventoryStatistics() {
        const stats = this.calculateInventoryStats();
        
        const elements = {
            'totalItemsCount': stats.totalItems,
            'inStockCount': stats.inStock,
            'lowStockCount': stats.lowStock,
            'outOfStockCount': stats.outOfStock
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }

    /**
     * חישוב סטטיסטיקות מלאי
     */
    calculateInventoryStats() {
        const items = Object.values(this.inventory);
        
        return {
            totalItems: items.length,
            inStock: items.filter(item => 
                item.isActive && (item.stock || 0) > (item.lowStockThreshold || this.lowStockThreshold)
            ).length,
            lowStock: items.filter(item => 
                item.isActive && 
                (item.stock || 0) <= (item.lowStockThreshold || this.lowStockThreshold) && 
                (item.stock || 0) > this.outOfStockThreshold
            ).length,
            outOfStock: items.filter(item => 
                item.isActive && (item.stock || 0) <= this.outOfStockThreshold
            ).length,
            totalValue: items.reduce((sum, item) => {
                const menuItem = this.getMenuItemData(item.itemId);
                return sum + ((item.stock || 0) * (menuItem?.price || 0));
            }, 0)
        };
    }

    /**
     * קבלת נתוני פריט מהתפריט
     */
    getMenuItemData(itemId) {
        const menu = menuData.getMenu();
        for (const categoryId in menu.items) {
            const item = menu.items[categoryId].find(i => i.id === itemId);
            if (item) return item;
        }
        return null;
    }

    /**
     * רינדור רשימת מלאי
     */
    renderInventoryList() {
        const container = document.getElementById('inventoryList');
        if (!container) return;

        const items = Object.values(this.inventory);
        
        if (items.length === 0) {
            container.innerHTML = `
                <div class="empty-inventory">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">📦</div>
                    <h3>אין פריטי מלאי</h3>
                    <p>סנכרן עם התפריט כדי ליצור פריטי מלאי</p>
                    <button class="btn btn-primary" onclick="inventoryManagement.syncWithMenu()">
                        🔄 סנכרן עם תפריט
                    </button>
                </div>
            `;
            return;
        }

        // מיון לפי מלאי נמוך ותאריך עדכון
        const sortedItems = items.sort((a, b) => {
            const aStock = a.stock || 0;
            const bStock = b.stock || 0;
            const aThreshold = a.lowStockThreshold || this.lowStockThreshold;
            const bThreshold = b.lowStockThreshold || this.lowStockThreshold;
            
            // קודם מלאי אזל
            if (aStock <= this.outOfStockThreshold && bStock > this.outOfStockThreshold) return -1;
            if (bStock <= this.outOfStockThreshold && aStock > this.outOfStockThreshold) return 1;
            
            // אחר כך מלאי נמוך
            if (aStock <= aThreshold && bStock > bThreshold) return -1;
            if (bStock <= bThreshold && aStock > aThreshold) return 1;
            
            // לבסוף לפי תאריך עדכון
            return new Date(b.lastUpdated) - new Date(a.lastUpdated);
        });

        const itemsHTML = sortedItems.map(item => this.renderInventoryItem(item)).join('');
        container.innerHTML = `<div class="inventory-grid">${itemsHTML}</div>`;
    }

    /**
     * רינדור פריט מלאי
     */
    renderInventoryItem(item) {
        const stock = item.stock || 0;
        const threshold = item.lowStockThreshold || this.lowStockThreshold;
        const menuItem = this.getMenuItemData(item.itemId);
        
        let stockStatus = 'in_stock';
        let stockClass = 'in-stock';
        let stockIcon = '✅';
        
        if (stock <= this.outOfStockThreshold) {
            stockStatus = 'out_of_stock';
            stockClass = 'out-of-stock';
            stockIcon = '❌';
        } else if (stock <= threshold) {
            stockStatus = 'low_stock';
            stockClass = 'low-stock';
            stockIcon = '⚠️';
        }

        const waitTime = this.waitTimes[item.itemId] || CONFIG.restaurant.preparationTime;
        
        return `
            <div class="inventory-item ${stockClass} ${!item.isActive ? 'inactive' : ''}">
                <div class="inventory-item-header">
                    <div class="item-info">
                        <h4 class="item-name">${item.name}</h4>
                        <p class="item-category">${this.getCategoryName(item.categoryId)}</p>
                    </div>
                    <div class="stock-status">
                        <span class="stock-icon">${stockIcon}</span>
                        <span class="stock-value">${stock}</span>
                    </div>
                </div>

                <div class="inventory-item-body">
                    <div class="stock-info">
                        <div class="info-row">
                            <span class="info-label">סף התראה:</span>
                            <span class="info-value">${threshold}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">מחיר יחידה:</span>
                            <span class="info-value">${formatPrice(menuItem?.price || 0)}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">ערך מלאי:</span>
                            <span class="info-value">${formatPrice((menuItem?.price || 0) * stock)}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">זמן הכנה:</span>
                            <span class="info-value">${waitTime} דק'</span>
                        </div>
                    </div>

                    <div class="stock-controls">
                        <div class="quantity-input">
                            <button class="qty-btn" onclick="inventoryManagement.adjustStock('${item.itemId}', -1)">−</button>
                            <input type="number" 
                                   value="${stock}" 
                                   min="0" 
                                   class="stock-input"
                                   onchange="inventoryManagement.updateStock('${item.itemId}', this.value)"
                                   onblur="this.value = inventoryManagement.inventory['${item.itemId}']?.stock || 0">
                            <button class="qty-btn" onclick="inventoryManagement.adjustStock('${item.itemId}', 1)">+</button>
                        </div>
                    </div>
                </div>

                <div class="inventory-item-footer">
                    <div class="last-updated">
                        עודכן: ${getRelativeTime(item.lastUpdated)}
                    </div>
                    <div class="item-actions">
                        <button class="action-btn" onclick="inventoryManagement.showItemHistory('${item.itemId}')" title="היסטוריה">
                            📊
                        </button>
                        <button class="action-btn" onclick="inventoryManagement.editInventoryItem('${item.itemId}')" title="ערוך">
                            ⚙️
                        </button>
                        <button class="action-btn ${item.isActive ? 'active' : 'inactive'}" 
                                onclick="inventoryManagement.toggleItemActive('${item.itemId}')" 
                                title="${item.isActive ? 'השבת' : 'הפעל'}">
                            ${item.isActive ? '🔒' : '🔓'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * קבלת שם קטגוריה
     */
    getCategoryName(categoryId) {
        const category = menuData.getCategory(categoryId);
        return category ? category.name : 'קטגוריה לא ידועה';
    }

    /**
     * התאמת מלאי (הוספה/הפחתה)
     */
    adjustStock(itemId, adjustment) {
        const item = this.inventory[itemId];
        if (!item) return;

        const newStock = Math.max(0, (item.stock || 0) + adjustment);
        const reason = adjustment > 0 ? 'הוספה ידנית' : 'הפחתה ידנית';
        
        this.updateStock(itemId, newStock, reason);
        this.renderInventoryList();
    }

    /**
     * החלפת מצב פעיל לפריט
     */
    toggleItemActive(itemId) {
        const item = this.inventory[itemId];
        if (!item) return;

        item.isActive = !item.isActive;
        item.lastUpdated = new Date().toISOString();

        this.addToHistory(itemId, {
            oldStock: item.stock,
            newStock: item.stock,
            change: 0,
            reason: item.isActive ? 'הופעל' : 'הושבת',
            timestamp: new Date().toISOString()
        });

        this.updateMenuAvailability(itemId);
        this.saveInventory();
        this.renderInventoryList();
        
        const status = item.isActive ? 'הופעל' : 'הושבת';
        showSuccess(`${item.name} ${status}`);
    }

    /**
     * הצגת היסטוריית פריט
     */
    showItemHistory(itemId) {
        const item = this.inventory[itemId];
        if (!item) {
            showError('פריט לא נמצא');
            return;
        }

        const modal = uiComponents.createModal({
            title: `📊 היסטוריית ${item.name}`,
            size: 'large',
            content: this.renderItemHistoryContent(item),
            className: 'inventory-history-modal'
        });

        modal.open();
    }

    /**
     * רינדור תוכן היסטוריית פריט
     */
    renderItemHistoryContent(item) {
        const history = item.history || [];
        
        if (history.length === 0) {
            return `
                <div style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">📊</div>
                    <h3>אין היסטוריה</h3>
                    <p>עדיין לא בוצעו שינויים בפריט זה</p>
                </div>
            `;
        }

        return `
            <div class="item-history">
                <div class="history-header">
                    <div class="current-stock">
                        <h4>מלאי נוכחי: <span class="stock-value">${item.stock || 0}</span></h4>
                        <p>עודכן לאחרונה: ${formatDateHebrew(item.lastUpdated)}</p>
                    </div>
                </div>

                <div class="history-timeline">
                    ${history.map(entry => `
                        <div class="history-entry ${entry.change > 0 ? 'increase' : entry.change < 0 ? 'decrease' : 'neutral'}">
                            <div class="history-icon">
                                ${entry.change > 0 ? '📈' : entry.change < 0 ? '📉' : '📝'}
                            </div>
                            <div class="history-content">
                                <div class="history-main">
                                    <span class="history-reason">${entry.reason}</span>
                                    <span class="history-change">
                                        ${entry.oldStock} → ${entry.newStock}
                                        ${entry.change !== 0 ? `(${entry.change > 0 ? '+' : ''}${entry.change})` : ''}
                                    </span>
                                </div>
                                <div class="history-time">
                                    ${formatDateHebrew(entry.timestamp)}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * עריכת פריט מלאי
     */
    editInventoryItem(itemId) {
        const item = this.inventory[itemId];
        if (!item) {
            showError('פריט לא נמצא');
            return;
        }

        const modal = uiComponents.createModal({
            title: `⚙️ עריכת ${item.name}`,
            content: this.renderEditInventoryForm(item),
            className: 'edit-inventory-modal'
        });

        modal.open();
    }

    /**
     * רינדור טופס עריכת פריט מלאי
     */
    renderEditInventoryForm(item) {
        const waitTime = this.waitTimes[item.itemId] || CONFIG.restaurant.preparationTime;
        
        return `
            <form id="editInventoryForm" onsubmit="inventoryManagement.saveInventoryItemChanges(event, '${item.itemId}')">
                <div class="form-group">
                    <label for="editItemStock">כמות במלאי:</label>
                    <input type="number" id="editItemStock" value="${item.stock || 0}" min="0" required>
                </div>

                <div class="form-group">
                    <label for="editItemThreshold">סף התראה:</label>
                    <input type="number" id="editItemThreshold" value="${item.lowStockThreshold || this.lowStockThreshold}" min="0" required>
                </div>

                <div class="form-group">
                    <label for="editItemWaitTime">זמן הכנה (דקות):</label>
                    <input type="number" id="editItemWaitTime" value="${waitTime}" min="1" max="120" required>
                </div>

                <div class="form-group">
                    <label>
                        <input type="checkbox" id="editItemActive" ${item.isActive ? 'checked' : ''}>
                        פריט פעיל במלאי
                    </label>
                </div>

                <div class="form-group">
                    <label for="editReasonSelect">סיבת השינוי:</label>
                    <select id="editReasonSelect">
                        <option value="עדכון ידני">עדכון ידני</option>
                        <option value="ספירת מלאי">ספירת מלאי</option>
                        <option value="קבלת משלוח">קבלת משלוח</option>
                        <option value="פגיעה/אובדן">פגיעה/אובדן</option>
                        <option value="תיקון טעות">תיקון טעות</option>
                        <option value="אחר">אחר</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="editCustomReason">הערות נוספות:</label>
                    <textarea id="editCustomReason" rows="2" placeholder="הערות או סיבה מותאמת אישית..."></textarea>
                </div>

                <div class="modal-buttons">
                    <button type="submit" class="btn btn-primary">💾 שמור שינויים</button>
                    <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">❌ ביטול</button>
                </div>
            </form>
        `;
    }

    /**
     * שמירת שינויים בפריט מלאי
     */
    saveInventoryItemChanges(event, itemId) {
        event.preventDefault();
        
        const newStock = parseInt(document.getElementById('editItemStock').value) || 0;
        const newThreshold = parseInt(document.getElementById('editItemThreshold').value) || this.lowStockThreshold;
        const newWaitTime = parseInt(document.getElementById('editItemWaitTime').value) || CONFIG.restaurant.preparationTime;
        const isActive = document.getElementById('editItemActive').checked;
        const reasonSelect = document.getElementById('editReasonSelect').value;
        const customReason = document.getElementById('editCustomReason').value.trim();
        
        const reason = customReason || reasonSelect;
        const oldStock = this.inventory[itemId].stock || 0;

        // עדכן מלאי
        this.inventory[itemId].stock = newStock;
        this.inventory[itemId].lowStockThreshold = newThreshold;
        this.inventory[itemId].isActive = isActive;
        this.inventory[itemId].lastUpdated = new Date().toISOString();

        // עדכן זמן המתנה
        this.waitTimes[itemId] = newWaitTime;
        this.saveWaitTimes();

        // הוסף להיסטוריה
        this.addToHistory(itemId, {
            oldStock: oldStock,
            newStock: newStock,
            change: newStock - oldStock,
            reason: reason,
            timestamp: new Date().toISOString()
        });

        // בדוק התראות ועדכן תפריט
        this.checkStockAlerts(itemId);
        this.updateMenuAvailability(itemId);
        
        this.saveInventory();
        this.renderInventoryList();
        
        // סגור מודל
        document.querySelector('.edit-inventory-modal').remove();
        
        showSuccess('פריט המלאי עודכן בהצלחה');
    }

    /**
     * עדכון כל הפריטים
     */
    updateAllInventory() {
        this.syncWithMenu();
        this.checkLowStockAlerts();
        this.renderInventoryList();
        showSuccess('המלאי עודכן בהצלחה');
    }

    /**
     * סימון כל הפריטים כאזלו מהמלאי
     */
    markAllOutOfStock() {
        if (!confirm('האם אתה בטוח שברצונך לסמן את כל הפריטים כאזלו מהמלאי?')) {
            return;
        }

        let updatedCount = 0;
        Object.keys(this.inventory).forEach(itemId => {
            if (this.inventory[itemId].isActive) {
                this.updateStock(itemId, 0, 'סימון מסיבי - אזל מהמלאי');
                updatedCount++;
            }
        });

        this.renderInventoryList();
        showSuccess(`${updatedCount} פריטים סומנו כאזלו מהמלאי`);
    }

    /**
     * סימון כל הפריטים כזמינים
     */
    markAllInStock() {
        if (!confirm('האם אתה בטוח שברצונך לסמן את כל הפריטים כזמינים?')) {
            return;
        }

        let updatedCount = 0;
        Object.keys(this.inventory).forEach(itemId => {
            if (this.inventory[itemId].isActive) {
                this.updateStock(itemId, 10, 'סימון מסיבי - זמין');
                updatedCount++;
            }
        });

        this.renderInventoryList();
        showSuccess(`${updatedCount} פריטים סומנו כזמינים`);
    }

    /**
     * הצגת הגדרות זמני המתנה
     */
    showWaitTimeSettings() {
        const modal = uiComponents.createModal({
            title: '⏰ הגדרות זמני המתנה',
            size: 'large',
            content: this.renderWaitTimeSettingsContent(),
            className: 'wait-time-settings-modal'
        });

        modal.open();
    }

    /**
     * רינדור תוכן הגדרות זמני המתנה
     */
    renderWaitTimeSettingsContent() {
        const items = Object.values(this.inventory).filter(item => item.isActive);
        
        return `
            <div class="wait-time-settings">
                <div class="global-settings">
                    <h4>🌐 הגדרות כלליות</h4>
                    <div class="form-group">
                        <label for="defaultWaitTime">זמן הכנה ברירת מחדל (דקות):</label>
                        <input type="number" id="defaultWaitTime" value="${CONFIG.restaurant.preparationTime}" min="1" max="120">
                    </div>
                </div>

                <div class="items-wait-times">
                    <h4>🍽️ זמני הכנה לפי פריט</h4>
                    <div class="wait-time-grid">
                        ${items.map(item => {
                            const waitTime = this.waitTimes[item.itemId] || CONFIG.restaurant.preparationTime;
                            return `
                                <div class="wait-time-item">
                                    <div class="item-info">
                                        <div class="item-name">${item.name}</div>
                                        <div class="item-category">${this.getCategoryName(item.categoryId)}</div>
                                    </div>
                                    <div class="time-input">
                                        <input type="number" 
                                               value="${waitTime}" 
                                               min="1" 
                                               max="120"
                                               data-item-id="${item.itemId}"
                                               class="wait-time-input">
                                        <span class="time-unit">דק'</span>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>

                <div class="modal-buttons">
                    <button class="btn btn-primary" onclick="inventoryManagement.saveWaitTimeSettings()">💾 שמור הגדרות</button>
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">❌ ביטול</button>
                </div>
            </div>
        `;
    }

    /**
     * שמירת הגדרות זמני המתנה
     */
    saveWaitTimeSettings() {
        const defaultTime = parseInt(document.getElementById('defaultWaitTime').value) || CONFIG.restaurant.preparationTime;
        
        // עדכן ברירת מחדל
        CONFIG.restaurant.preparationTime = defaultTime;
        DataManager.setSetting('preparationTime', defaultTime);

        // עדכן זמנים פרטניים
        document.querySelectorAll('.wait-time-input').forEach(input => {
            const itemId = input.dataset.itemId;
            const waitTime = parseInt(input.value) || defaultTime;
            this.waitTimes[itemId] = waitTime;
        });

        this.saveWaitTimes();
        
        // סגור מודל
        document.querySelector('.wait-time-settings-modal').remove();
        
        showSuccess('הגדרות זמני המתנה נשמרו');
    }

    /**
     * צפייה בהיסטוריית מלאי
     */
    viewInventoryHistory() {
        const allHistory = [];
        
        Object.values(this.inventory).forEach(item => {
            if (item.history) {
                item.history.forEach(entry => {
                    allHistory.push({
                        ...entry,
                        itemName: item.name,
                        categoryId: item.categoryId
                    });
                });
            }
        });

        // מיון לפי תאריך
        allHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        const modal = uiComponents.createModal({
            title: '📊 היסטוריית מלאי כללית',
            size: 'large',
            content: this.renderInventoryHistoryContent(allHistory),
            className: 'inventory-history-modal'
        });

        modal.open();
    }

    /**
     * רינדור תוכן היסטוריית מלאי
     */
    renderInventoryHistoryContent(history) {
        if (history.length === 0) {
            return `
                <div style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">📊</div>
                    <h3>אין היסטוריה</h3>
                    <p>עדיין לא בוצעו שינויים במלאי</p>
                </div>
            `;
        }

        return `
            <div class="inventory-history-list">
                ${history.map(entry => `
                    <div class="history-entry ${entry.change > 0 ? 'increase' : entry.change < 0 ? 'decrease' : 'neutral'}">
                        <div class="history-icon">
                            ${entry.change > 0 ? '📈' : entry.change < 0 ? '📉' : '📝'}
                        </div>
                        <div class="history-content">
                            <div class="history-main">
                                <span class="item-name">${entry.itemName}</span>
                                <span class="history-reason">${entry.reason}</span>
                                <span class="history-change">
                                    ${entry.oldStock} → ${entry.newStock}
                                    ${entry.change !== 0 ? `(${entry.change > 0 ? '+' : ''}${entry.change})` : ''}
                                </span>
                            </div>
                            <div class="history-time">
                                ${formatDateHebrew(entry.timestamp)}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * ייצוא דוח מלאי
     */
    exportInventory() {
        const stats = this.calculateInventoryStats();
        const exportData = {
            timestamp: new Date().toISOString(),
            restaurant: CONFIG.restaurant.name,
            statistics: stats,
            inventory: this.inventory,
            waitTimes: this.waitTimes,
            alerts: this.alerts
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const fileName = `hazya-inventory-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', fileName);
        linkElement.click();
        
        showSuccess('דוח מלאי יוצא בהצלחה');
    }

    /**
     * קישור אירועים
     */
    bindEvents() {
        // עדכון אוטומטי כאשר התפריט משתנה
        document.addEventListener('menuUpdated', () => {
            this.syncWithMenu();
        });
    }
}

// יצירת מופע יחיד
const inventoryManagement = new InventoryManagement();

// פונקציות גלובליות
window.updateAllInventory = inventoryManagement.updateAllInventory.bind(inventoryManagement);
window.markAllOutOfStock = inventoryManagement.markAllOutOfStock.bind(inventoryManagement);
window.markAllInStock = inventoryManagement.markAllInStock.bind(inventoryManagement);
window.showWaitTimeSettings = inventoryManagement.showWaitTimeSettings.bind(inventoryManagement);
window.viewInventoryHistory = inventoryManagement.viewInventoryHistory.bind(inventoryManagement);
window.exportInventory = inventoryManagement.exportInventory.bind(inventoryManagement);

// הרחבת admin עם פונקציות מלאי
if (typeof admin !== 'undefined') {
    admin.loadInventoryManagement = inventoryManagement.loadInventoryManagement.bind(inventoryManagement);
}