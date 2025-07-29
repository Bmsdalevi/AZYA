// js/payment-management.js - ניהול תשלומים

/**
 * מחלקה לניהול תשלומים
 */
class PaymentManager {
    constructor() {
        this.currentOrder = null;
        this.selectedPaymentMethod = 'cash';
        this.bitPaymentStatus = null;
        this.init();
    }

    /**
     * אתחול מנהל התשלומים
     */
    init() {
        this.loadPaymentSettings();
    }

    /**
     * טעינת הגדרות תשלום
     */
    loadPaymentSettings() {
        this.cashEnabled = DataManager.getSetting('enableCashPayment', true);
        this.bitEnabled = DataManager.getSetting('enableBitPayment', true);
        this.bitBusinessPhone = DataManager.getSetting('bitBusinessPhone', CONFIG.payment.bitBusinessPhone);
        this.bitBusinessName = DataManager.getSetting('bitBusinessName', CONFIG.payment.bitBusinessName);
    }

    /**
     * אישור פרטי לקוח והמשך לתשלום
     */
    confirmOrder() {
        // אסוף פרטי לקוח
        const customerData = this.collectCustomerData();
        
        if (!this.validateCustomerData(customerData)) {
            return;
        }

        // שמור נתוני הזמנה
        this.currentOrder = {
            ...cart.getOrderData(),
            customer: customerData,
            orderNumber: generateOrderNumber(),
            createdAt: new Date().toISOString(),
            status: 'new'
        };

        // סגור מודל פרטי לקוח
        closeCustomerModal();

        // פתח מודל תשלום
        this.openPaymentModal();
    }

    /**
     * איסוף נתוני לקוח
     */
    collectCustomerData() {
        return {
            name: document.getElementById('customerName')?.value?.trim() || '',
            phone: document.getElementById('customerPhone')?.value?.trim() || '',
            address: document.getElementById('customerAddress')?.value?.trim() || '',
            notes: document.getElementById('customerNotes')?.value?.trim() || '',
            paymentMethod: document.querySelector('input[name="paymentMethod"]:checked')?.value || 'cash'
        };
    }

    /**
     * ולידציה של נתוני לקוח
     */
    validateCustomerData(data) {
        const errors = [];

        if (!data.name) {
            errors.push('שם מלא נדרש');
        }

        if (!data.phone) {
            errors.push('מספר טלפון נדרש');
        } else if (!validateIsraeliPhone(data.phone)) {
            errors.push('מספר טלפון לא תקין');
        }

        if (!data.address) {
            errors.push('כתובת משלוח נדרשת');
        }

        if (errors.length > 0) {
            showModalMessage('customerModal', errors.join('<br>'), 'error');
            return false;
        }

        return true;
    }

    /**
     * פתיחת מודל תשלום
     */
    openPaymentModal() {
        if (!this.currentOrder) {
            showError('שגיאה בנתוני ההזמנה');
            return;
        }

        // עדכן סיכום תשלום
        this.updatePaymentSummary();

        // הצג את סוג התשלום המתאים
        this.showPaymentMethod(this.currentOrder.customer.paymentMethod);

        // פתח מודל
        openPaymentModal();
    }

    /**
     * עדכון סיכום תשלום
     */
    updatePaymentSummary() {
        if (!this.currentOrder) return;

        const subtotal = this.currentOrder.subtotal;
        const deliveryFee = this.currentOrder.deliveryFee;
        const total = this.currentOrder.total;

        // עדכן אלמנטים
        const subtotalEl = document.getElementById('paymentSubtotal');
        const deliveryEl = document.getElementById('paymentDeliveryFee');
        const totalEl = document.getElementById('paymentTotal');

        if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
        if (deliveryEl) deliveryEl.textContent = formatPrice(deliveryFee);
        if (totalEl) totalEl.textContent = formatPrice(total);
    }

    /**
     * הצגת אמצעי תשלום
     */
    showPaymentMethod(method) {
        // הסתר כל האמצעים
        document.getElementById('cashPayment')?.style.setProperty('display', 'none');
        document.getElementById('bitPayment')?.style.setProperty('display', 'none');

        // הצג את הרלוונטי
        if (method === 'cash') {
            this.showCashPayment();
        } else if (method === 'bit') {
            this.showBitPayment();
        }

        this.selectedPaymentMethod = method;
    }

    /**
     * הצגת תשלום במזומן
     */
    showCashPayment() {
        const cashDiv = document.getElementById('cashPayment');
        if (cashDiv) {
            cashDiv.style.display = 'block';
            
            // עדכן סכום
            const amountEl = document.getElementById('cashAmount');
            if (amountEl && this.currentOrder) {
                amountEl.textContent = formatPrice(this.currentOrder.total);
            }
        }
    }

    /**
     * הצגת תשלום ביט
     */
    showBitPayment() {
        const bitDiv = document.getElementById('bitPayment');
        if (bitDiv) {
            bitDiv.style.display = 'block';
            
            // עדכן סכום
            const amountEl = document.getElementById('bitAmount');
            if (amountEl && this.currentOrder) {
                amountEl.textContent = formatPrice(this.currentOrder.total);
            }

            // צור QR קוד
            this.generateBitQR();
        }
    }

    /**
     * יצירת QR קוד לביט
     */
    generateBitQR() {
        if (!this.currentOrder) return;

        const qrContainer = document.getElementById('bitQrCode');
        if (!qrContainer) return;

        // יצור URL לביט (דמה)
        const bitUrl = this.generateBitUrl();
        
        // בפרויקט אמיתי, כאן היית משתמש בספרייה ליצירת QR
        // לעת עתה נציג placeholder
        qrContainer.innerHTML = `
            <div style="width: 240px; height: 240px; background: white; border: 2px dashed #0066cc; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin: 0 auto; color: #0066cc; flex-direction: column; gap: 0.5rem;">
                <div style="font-size: 3rem;">📱</div>
                <div style="font-size: 1rem; font-weight: 600; text-align: center;">QR לביט</div>
                <div style="font-size: 0.8rem; text-align: center;">${formatPrice(this.currentOrder.total)}</div>
            </div>
        `;
    }

    /**
     * יצירת URL לביט
     */
    generateBitUrl() {
        if (!this.currentOrder) return '';

        const amount = this.currentOrder.total;
        const phone = this.bitBusinessPhone;
        const description = `הזמנה ${this.currentOrder.orderNumber} - ${CONFIG.restaurant.name}`;

        // זה דוגמה - בפרויקט אמיתי צריך להשתמש ב-API של ביט
        return `bit://pay?phone=${phone}&amount=${amount}&description=${encodeURIComponent(description)}`;
    }

    /**
     * פתיחת אפליקציית ביט
     */
    openBitApp() {
        if (!this.currentOrder) return;

        const bitUrl = this.generateBitUrl();
        
        try {
            // נסה לפתוח ביט
            window.open(bitUrl, '_blank');
            
            // הצג הודעה
            showInfo('אפליקציית ביט נפתחת...');
            
        } catch (error) {
            showError('לא ניתן לפתוח את אפליקציית ביט');
        }
    }

    /**
     * השלמת תשלום במזומן
     */
    completeCashPayment() {
        if (!this.currentOrder) {
            showError('שגיאה בנתוני ההזמנה');
            return;
        }

        // עדכן את ההזמנה
        this.currentOrder.paymentMethod = 'cash';
        this.currentOrder.paymentStatus = 'pending';
        this.currentOrder.paymentCompletedAt = null; // ישולם עם המשלוח

        // שמור הזמנה
        this.saveOrder();
    }

    /**
     * אישור תשלום ביט
     */
    confirmBitPayment() {
        if (!this.currentOrder) {
            showError('שגיאה בנתוני ההזמנה');
            return;
        }

        // הצג סטטוס בדיקה
        this.showBitPaymentStatus();

        // סימולציה של בדיקת תשלום
        setTimeout(() => {
            // בפרויקט אמיתי כאן היית בודק עם API של ביט
            const success = Math.random() > 0.2; // 80% הצלחה לדמו
            
            if (success) {
                this.handleBitPaymentSuccess();
            } else {
                this.handleBitPaymentFailure();
            }
        }, 3000);
    }

    /**
     * הצגת סטטוס בדיקת תשלום ביט
     */
    showBitPaymentStatus() {
        const statusDiv = document.getElementById('bitPaymentStatus');
        if (statusDiv) {
            statusDiv.style.display = 'block';
            statusDiv.innerHTML = `
                <div class="spinner" style="margin: 0 auto 1rem;"></div>
                <p style="color: var(--accent-blue); font-weight: 600; text-align: center;">🔄 מאמת תשלום...</p>
            `;
        }
    }

    /**
     * טיפול בהצלחת תשלום ביט
     */
    handleBitPaymentSuccess() {
        const statusDiv = document.getElementById('bitPaymentStatus');
        if (statusDiv) {
            statusDiv.innerHTML = `
                <div style="text-align: center; color: var(--accent-green);">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">✅</div>
                    <p style="font-weight: 700;">התשלום אושר בהצלחה!</p>
                </div>
            `;
        }

        // עדכן את ההזמנה
        this.currentOrder.paymentMethod = 'bit';
        this.currentOrder.paymentStatus = 'completed';
        this.currentOrder.paymentCompletedAt = new Date().toISOString();

        // המתן ושמור הזמנה
        setTimeout(() => {
            this.saveOrder();
        }, 2000);
    }

    /**
     * טיפול בכישלון תשלום ביט
     */
    handleBitPaymentFailure() {
        const statusDiv = document.getElementById('bitPaymentStatus');
        if (statusDiv) {
            statusDiv.innerHTML = `
                <div style="text-align: center; color: var(--accent-red);">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">❌</div>
                    <p style="font-weight: 700;">התשלום נכשל</p>
                    <p style="font-size: 0.9rem; margin-top: 0.5rem;">נסה שוב או בחר אמצעי תשלום אחר</p>
                </div>
            `;
        }

        // הצג כפתור ניסיון נוסף
        setTimeout(() => {
            if (statusDiv) {
                statusDiv.innerHTML += `
                    <div style="text-align: center; margin-top: 1rem;">
                        <button class="btn btn-primary" onclick="payment.confirmBitPayment()">
                            🔄 נסה שוב
                        </button>
                    </div>
                `;
            }
        }, 2000);
    }

    /**
     * שמירת הזמנה
     */
    saveOrder() {
        if (!this.currentOrder) {
            showError('שגיאה בנתוני ההזמנה');
            return;
        }

        try {
            // הוסף הזמנה למערכת
            DataManager.addOrder(this.currentOrder);
            
            // הוסף/עדכן לקוח
            this.saveCustomer();

            // שלח מייל (אם מוגדר)
            this.sendOrderEmail();

            // הצג אישור
            this.showOrderConfirmation();

        } catch (error) {
            showError('שגיאה בשמירת ההזמנה: ' + error.message);
        }
    }

    /**
     * שמירת נתוני לקוח
     */
    saveCustomer() {
        if (!this.currentOrder?.customer) return;

        const customer = {
            name: this.currentOrder.customer.name,
            phone: this.currentOrder.customer.phone,
            address: this.currentOrder.customer.address,
            lastOrderDate: this.currentOrder.createdAt,
            totalOrders: 1, // יעודכן אם הלקוח קיים
            totalSpent: this.currentOrder.total
        };

        // בדוק אם הלקוח קיים
        const existingCustomers = DataManager.getCustomers();
        const existingCustomer = existingCustomers.find(c => c.phone === customer.phone);

        if (existingCustomer) {
            customer.totalOrders = (existingCustomer.totalOrders || 0) + 1;
            customer.totalSpent = (existingCustomer.totalSpent || 0) + this.currentOrder.total;
            customer.firstOrderDate = existingCustomer.firstOrderDate;
        } else {
            customer.firstOrderDate = this.currentOrder.createdAt;
        }

        DataManager.addCustomer(customer);
    }

    /**
     * שליחת מייל הזמנה
     */
    sendOrderEmail() {
        const sendEmails = DataManager.getSetting('sendOrderEmails', true);
        if (!sendEmails) return;

        // כאן היית משתמש בשירות כמו EmailJS
        // לעת עתה רק נציג הודעה
        console.log('שליחת מייל הזמנה:', this.currentOrder);
        
        // דמה של שליחת מייל
        setTimeout(() => {
            showInfo('מייל הזמנה נשלח למסעדה');
        }, 1000);
    }

    /**
     * הצגת אישור הזמנה
     */
    showOrderConfirmation() {
        // סגור מודל תשלום
        closePaymentModal();

        // עדכן פרטי אישור
        const orderNumberEl = document.getElementById('confirmOrderNumber');
        const prepTimeEl = document.getElementById('confirmPrepTime');
        const totalEl = document.getElementById('confirmTotal');

        if (orderNumberEl) {
            orderNumberEl.textContent = this.currentOrder.orderNumber;
        }

        if (prepTimeEl) {
            prepTimeEl.textContent = CONFIG.restaurant.preparationTime;
        }

        if (totalEl) {
            totalEl.textContent = formatPrice(this.currentOrder.total);
        }

        // פתח מודל אישור
        openConfirmationModal();

        // נקה הזמנה נוכחית
        this.currentOrder = null;
    }

    /**
     * בדיקת סטטוס הזמנה
     */
    checkOrderStatus() {
        const orderNumber = document.getElementById('orderNumberInput')?.value?.trim();
        
        if (!orderNumber) {
            showModalMessage('orderStatusModal', 'אנא הזן מספר הזמנה', 'error');
            return;
        }

        const orders = DataManager.getOrders();
        const order = orders.find(o => o.orderNumber === orderNumber.toUpperCase());

        const resultDiv = document.getElementById('orderStatusResult');
        if (!resultDiv) return;

        if (!order) {
            resultDiv.innerHTML = `
                <div class="modal-message error">
                    <div style="font-size: 2rem; margin-bottom: 1rem;">❌</div>
                    <p>הזמנה לא נמצאה</p>
                    <p style="font-size: 0.9rem; margin-top: 0.5rem;">בדוק את מספר ההזמנה ונסה שוב</p>
                </div>
            `;
        } else {
            const statusInfo = CONFIG.orderStatuses[order.status] || CONFIG.orderStatuses.new;
            const orderDate = formatDateHebrew(order.createdAt);
            
            resultDiv.innerHTML = `
                <div class="order-status-card fade-in">
                    <div class="order-status-header">
                        <div class="order-number">${order.orderNumber}</div>
                        <div class="order-status status-${order.status}">
                            ${statusInfo.icon} ${statusInfo.label}
                        </div>
                    </div>
                    
                    <div class="order-details">
                        <div class="order-detail-item">
                            <div class="order-detail-label">תאריך הזמנה:</div>
                            <div class="order-detail-value">${orderDate}</div>
                        </div>
                        <div class="order-detail-item">
                            <div class="order-detail-label">לקוח:</div>
                            <div class="order-detail-value">${order.customer.name}</div>
                        </div>
                        <div class="order-detail-item">
                            <div class="order-detail-label">סה"כ:</div>
                            <div class="order-detail-value">${formatPrice(order.total)}</div>
                        </div>
                        <div class="order-detail-item">
                            <div class="order-detail-label">תשלום:</div>
                            <div class="order-detail-value">
                                ${order.paymentMethod === 'cash' ? '💵 מזומן' : '📱 ביט'}
                                ${order.paymentStatus === 'completed' ? ' (שולם)' : ' (לא שולם)'}
                            </div>
                        </div>
                    </div>

                    <div class="order-items-list">
                        <h5 style="margin-bottom: 1rem; color: var(--primary-gold);">פריטים:</h5>
                        ${order.items.map(item => `
                            <div class="order-item">
                                <div>
                                    <div class="order-item-name">${item.name}</div>
                                    <div class="order-item-quantity">כמות: ${item.quantity}</div>
                                </div>
                                <div class="order-item-price">${formatPrice(item.subtotal)}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        resultDiv.style.display = 'block';
    }

    /**
     * טעינת היסטוריית לקוח
     */
    loadCustomerHistory() {
        const phone = document.getElementById('customerPhoneInput')?.value?.trim();
        
        if (!phone) {
            showModalMessage('customerHistoryModal', 'אנא הזן מספר טלפון', 'error');
            return;
        }

        if (!validateIsraeliPhone(phone)) {
            showModalMessage('customerHistoryModal', 'מספר טלפון לא תקין', 'error');
            return;
        }

        const customers = DataManager.getCustomers();
        const customer = customers.find(c => c.phone === phone);

        const resultDiv = document.getElementById('customerHistoryResult');
        if (!resultDiv) return;

        if (!customer) {
            resultDiv.innerHTML = `
                <div class="modal-message error">
                    <div style="font-size: 2rem; margin-bottom: 1rem;">❌</div>
                    <p>לקוח לא נמצא</p>
                    <p style="font-size: 0.9rem; margin-top: 0.5rem;">בדוק את מספר הטלפון ונסה שוב</p>
                </div>
            `;
        } else {
            // מצא הזמנות של הלקוח
            const orders = DataManager.getOrders().filter(o => o.customer.phone === phone);
            
            resultDiv.innerHTML = `
                <div class="customer-history-card fade-in">
                    <h4 style="color: var(--primary-gold); margin-bottom: 1rem;">👤 ${customer.name}</h4>
                    
                    <div class="customer-stats">
                        <div class="customer-stat">
                            <div class="customer-stat-value">${customer.totalOrders || 0}</div>
                            <div class="customer-stat-label">הזמנות</div>
                        </div>
                        <div class="customer-stat">
                            <div class="customer-stat-value">${formatPrice(customer.totalSpent || 0)}</div>
                            <div class="customer-stat-label">סה"כ הוצאה</div>
                        </div>
                        <div class="customer-stat">
                            <div class="customer-stat-value">${orders.length}</div>
                            <div class="customer-stat-label">הזמנות זמינות</div>
                        </div>
                    </div>

                    ${orders.length > 0 ? `
                        <h5 style="margin: 1.5rem 0 1rem; color: var(--primary-gold);">📋 הזמנות אחרונות:</h5>
                        <div class="customer-orders-list">
                            ${orders.slice(0, 10).map(order => `
                                <div class="customer-order-item">
                                    <div>
                                        <div style="font-weight: 600;">${order.orderNumber}</div>
                                        <div class="customer-order-date">${getRelativeTime(order.createdAt)}</div>
                                    </div>
                                    <div class="customer-order-total">${formatPrice(order.total)}</div>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            `;
        }

        resultDiv.style.display = 'block';
    }
}

// יצירת מופע יחיד
const payment = new PaymentManager();

// פונקציות גלובליות
function confirmOrder() {
    payment.confirmOrder();
}

function openBitApp() {
    payment.openBitApp();
}

function confirmBitPayment() {
    payment.confirmBitPayment();
}

function completeCashPayment() {
    payment.completeCashPayment();
}

function checkOrderStatus() {
    payment.checkOrderStatus();
}

function loadCustomerHistory() {
    payment.loadCustomerHistory();
}