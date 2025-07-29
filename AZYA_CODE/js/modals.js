// js/modals.js - ניהול חלונות קופצים (מודלים)

/**
 * מחלקה לניהול מודלים
 */
class ModalManager {
    constructor() {
        this.activeModals = new Set();
        this.init();
    }

    /**
     * אתחול מנהל המודלים
     */
    init() {
        this.bindGlobalEvents();
        this.setupModalStyles();
    }

    /**
     * קישור אירועים גלובליים
     */
    bindGlobalEvents() {
        // סגירה בלחיצת ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeTopModal();
            }
        });

        // סגירה בלחיצה על הרקע
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target.id);
            }
        });
    }

    /**
     * פתיחת מודל
     */
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) {
            console.error(`מודל עם ID "${modalId}" לא נמצא`);
            return false;
        }

        // הוסף למודלים הפעילים
        this.activeModals.add(modalId);

        // הצג את המודל
        modal.style.display = 'flex';
        modal.classList.add('modal-opening');

        // הוסף קלאס לגוף הדף למניעת גלילה
        document.body.classList.add('modal-open');

        // אנימציית פתיחה
        setTimeout(() => {
            modal.classList.remove('modal-opening');
            modal.classList.add('modal-open');
        }, 10);

        // מיקוד באלמנט הראשון
        this.focusFirstElement(modal);

        return true;
    }

    /**
     * סגירת מודל
     */
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) {
            return false;
        }

        // הסר מהמודלים הפעילים
        this.activeModals.delete(modalId);

        // אנימציית סגירה
        modal.classList.remove('modal-open');
        modal.classList.add('modal-closing');

        setTimeout(() => {
            modal.style.display = 'none';
            modal.classList.remove('modal-closing');
            
            // הסר קלאס מהגוף אם אין מודלים פעילים
            if (this.activeModals.size === 0) {
                document.body.classList.remove('modal-open');
            }
        }, 300);

        return true;
    }

    /**
     * סגירת המודל העליון
     */
    closeTopModal() {
        if (this.activeModals.size > 0) {
            const lastModal = Array.from(this.activeModals).pop();
            this.closeModal(lastModal);
        }
    }

    /**
     * מיקוד באלמנט הראשון במודל
     */
    focusFirstElement(modal) {
        const focusableElements = modal.querySelectorAll(
            'input, button, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length > 0) {
            setTimeout(() => {
                focusableElements[0].focus();
            }, 100);
        }
    }

    /**
     * הגדרת סגנונות מודלים
     */
    setupModalStyles() {
        const styles = document.createElement('style');
        styles.textContent = `
            .modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(5px);
                display: none;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                padding: 1rem;
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            .modal.modal-opening {
                opacity: 0;
            }

            .modal.modal-open {
                opacity: 1;
            }

            .modal.modal-closing {
                opacity: 0;
            }

            .modal-content {
                background: var(--glass-bg);
                backdrop-filter: blur(20px);
                border: 1px solid var(--glass-border);
                border-radius: var(--border-radius-lg);
                padding: 2rem;
                max-width: 500px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
                transform: scale(0.9) translateY(20px);
                transition: transform 0.3s ease;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                direction: rtl;
            }

            .modal.modal-open .modal-content {
                transform: scale(1) translateY(0);
            }

            .modal h2 {
                color: var(--primary-gold);
                margin-bottom: 1.5rem;
                text-align: center;
                font-weight: 700;
            }

            .modal .form-group {
                margin-bottom: 1.5rem;
            }

            .modal .form-group label {
                display: block;
                margin-bottom: 0.5rem;
                color: var(--text-primary);
                font-weight: 600;
            }

            .modal .form-group input,
            .modal .form-group textarea,
            .modal .form-group select {
                width: 100%;
                padding: 0.75rem 1rem;
                border: 1px solid var(--glass-border);
                border-radius: var(--border-radius);
                background: var(--glass-bg);
                color: var(--text-primary);
                font-size: 1rem;
                transition: all 0.2s ease;
            }

            .modal .form-group input:focus,
            .modal .form-group textarea:focus,
            .modal .form-group select:focus {
                outline: none;
                border-color: var(--primary-gold);
                box-shadow: 0 0 0 2px rgba(218, 165, 32, 0.2);
            }

            .modal .form-group textarea {
                min-height: 100px;
                resize: vertical;
            }

            .modal .form-group small {
                display: block;
                margin-top: 0.25rem;
                color: var(--text-secondary);
                font-size: 0.85rem;
            }

            .modal-buttons {
                display: flex;
                gap: 1rem;
                justify-content: center;
                margin-top: 2rem;
            }

            .modal-buttons .btn {
                min-width: 120px;
            }

            body.modal-open {
                overflow: hidden;
            }

            @media (max-width: 768px) {
                .modal-content {
                    margin: 1rem;
                    padding: 1.5rem;
                    max-width: none;
                }

                .modal-buttons {
                    flex-direction: column;
                }

                .modal-buttons .btn {
                    width: 100%;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }
}

// יצירת מופע יחיד
const modalManager = new ModalManager();

// פונקציות גלובליות למודלים ספציפיים

/**
 * מודל התחברות מנהל
 */
function openAdminLogin() {
    // טען שם משתמש אחרון אם קיים
    const lastUsername = localStorage.getItem('hazya_last_username');
    if (lastUsername) {
        const usernameInput = document.getElementById('username');
        const lastLoginInfo = document.getElementById('lastLoginInfo');
        
        if (usernameInput) {
            usernameInput.value = lastUsername;
        }
        
        if (lastLoginInfo) {
            lastLoginInfo.style.display = 'block';
        }
    }
    
    modalManager.openModal('loginModal');
}

function closeAdminLogin() {
    modalManager.closeModal('loginModal');
}

function handleEnterLogin(event) {
    if (event.key === 'Enter') {
        login();
    }
}

/**
 * מודל בדיקת סטטוס הזמנה
 */
function openOrderStatusModal() {
    modalManager.openModal('orderStatusModal');
}

function closeOrderStatusModal() {
    modalManager.closeModal('orderStatusModal');
    
    // נקה תוצאות
    const resultDiv = document.getElementById('orderStatusResult');
    if (resultDiv) {
        resultDiv.style.display = 'none';
        resultDiv.innerHTML = '';
    }
}

/**
 * מודל היסטוריית לקוח
 */
function openCustomerHistoryModal() {
    modalManager.openModal('customerHistoryModal');
}

function closeCustomerHistoryModal() {
    modalManager.closeModal('customerHistoryModal');
    
    // נקה תוצאות
    const resultDiv = document.getElementById('customerHistoryResult');
    if (resultDiv) {
        resultDiv.style.display = 'none';
        resultDiv.innerHTML = '';
    }
}

/**
 * מודל פרטי לקוח
 */
function openCustomerModal() {
    // עדכן סיכום הזמנה
    if (typeof cart !== 'undefined') {
        cart.updateOrderSummaryInModal();
    }
    
    modalManager.openModal('customerModal');
}

function closeCustomerModal() {
    modalManager.closeModal('customerModal');
}

/**
 * מודל תשלום
 */
function openPaymentModal() {
    modalManager.openModal('paymentModal');
}

function closePaymentModal() {
    modalManager.closeModal('paymentModal');
}

/**
 * מודל אישור הזמנה
 */
function openConfirmationModal() {
    modalManager.openModal('confirmationModal');
}

function closeConfirmationModal() {
    modalManager.closeModal('confirmationModal');
    
    // נקה את הסל לאחר סגירת האישור
    if (typeof cart !== 'undefined') {
        cart.resetAfterOrder();
    }
    
    // חזור לעמוד הבית
    window.location.hash = '#home';
}

/**
 * בחירת אמצעי תשלום
 */
function selectPaymentMethod(method) {
    // הסר בחירה קודמת
    document.querySelectorAll('.payment-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // סמן את האפשרות הנבחרת
    const selectedOption = document.querySelector(`input[value="${method}"]`).closest('.payment-option');
    if (selectedOption) {
        selectedOption.classList.add('selected');
    }
    
    // עדכן רדיו כפתור
    const radioButton = document.querySelector(`input[value="${method}"]`);
    if (radioButton) {
        radioButton.checked = true;
    }
}

/**
 * הוספת סגנונות לאפשרויות תשלום
 */
const paymentStyles = document.createElement('style');
paymentStyles.textContent = `
    .payment-method-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        margin-top: 0.5rem;
    }

    .payment-option {
        border: 2px solid var(--glass-border);
        border-radius: var(--border-radius);
        padding: 1rem;
        cursor: pointer;
        transition: all 0.2s ease;
        background: var(--glass-bg);
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .payment-option:hover {
        border-color: var(--primary-gold);
        background: rgba(218, 165, 32, 0.1);
    }

    .payment-option.selected {
        border-color: var(--primary-gold);
        background: rgba(218, 165, 32, 0.1);
        box-shadow: 0 0 0 2px rgba(218, 165, 32, 0.2);
    }

    .payment-icon {
        font-size: 2rem;
        margin-bottom: 0.5rem;
    }

    .payment-title {
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: 0.25rem;
    }

    .payment-description {
        font-size: 0.85rem;
        color: var(--text-secondary);
        line-height: 1.3;
    }

    .payment-option input[type="radio"] {
        width: auto !important;
        margin: 0 !important;
    }

    @media (max-width: 768px) {
        .payment-method-grid {
            grid-template-columns: 1fr;
        }
    }

    /* סגנונות מיוחדים למודל התשלום */
    #paymentModal .modal-content {
        max-width: 600px;
    }

    .spinner {
        width: 30px;
        height: 30px;
        border: 3px solid var(--glass-border);
        border-top: 3px solid var(--primary-gold);
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    /* סגנון מיוחד לאזור QR */
    .qr-container {
        text-align: center;
        padding: 1.5rem;
        background: white;
        border-radius: var(--border-radius);
        margin: 1rem 0;
        border: 2px solid #0066cc;
    }

    /* סגנונות לסטטוס הזמנה */
    .order-status-card {
        background: var(--glass-bg);
        border: 1px solid var(--glass-border);
        border-radius: var(--border-radius);
        padding: 1.5rem;
        margin: 1rem 0;
    }

    .order-status-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid var(--glass-border);
    }

    .order-number {
        font-weight: 700;
        color: var(--primary-gold);
        font-size: 1.1rem;
    }

    .order-status {
        padding: 0.5rem 1rem;
        border-radius: 20px;
        font-weight: 600;
        font-size: 0.9rem;
    }

    .status-new {
        background: rgba(59, 130, 246, 0.2);
        color: #3b82f6;
    }

    .status-cooking {
        background: rgba(245, 158, 11, 0.2);
        color: #f59e0b;
    }

    .status-ready {
        background: rgba(16, 185, 129, 0.2);
        color: #10b981;
    }

    .status-completed {
        background: rgba(107, 114, 128, 0.2);
        color: #6b7280;
    }

    .order-details {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        margin-bottom: 1rem;
    }

    .order-detail-item {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .order-detail-label {
        font-size: 0.85rem;
        color: var(--text-secondary);
    }

    .order-detail-value {
        font-weight: 600;
        color: var(--text-primary);
    }

    .order-items-list {
        margin-top: 1rem;
    }

    .order-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem 0;
        border-bottom: 1px solid var(--glass-border);
    }

    .order-item:last-child {
        border-bottom: none;
    }

    .order-item-name {
        font-weight: 600;
    }

    .order-item-quantity {
        color: var(--text-secondary);
        font-size: 0.9rem;
    }

    .order-item-price {
        color: var(--accent-green);
        font-weight: 600;
    }

    /* סגנונות להיסטוריית לקוח */
    .customer-history-card {
        background: var(--glass-bg);
        border: 1px solid var(--glass-border);
        border-radius: var(--border-radius);
        padding: 1.5rem;
        margin: 1rem 0;
    }

    .customer-stats {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
        margin-bottom: 1.5rem;
    }

    .customer-stat {
        text-align: center;
        padding: 1rem;
        background: rgba(0, 0, 0, 0.1);
        border-radius: var(--border-radius);
    }

    .customer-stat-value {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--primary-gold);
        margin-bottom: 0.25rem;
    }

    .customer-stat-label {
        font-size: 0.85rem;
        color: var(--text-secondary);
    }

    .customer-orders-list {
        max-height: 300px;
        overflow-y: auto;
    }

    .customer-order-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem;
        background: rgba(0, 0, 0, 0.05);
        border-radius: var(--border-radius);
        margin-bottom: 0.5rem;
    }

    .customer-order-date {
        font-size: 0.85rem;
        color: var(--text-secondary);
    }

    .customer-order-total {
        font-weight: 700;
        color: var(--accent-green);
    }

    /* הודעות שגיאה והצלחה במודלים */
    .modal-message {
        padding: 1rem;
        border-radius: var(--border-radius);
        margin: 1rem 0;
        text-align: center;
    }

    .modal-message.success {
        background: rgba(16, 185, 129, 0.1);
        border: 1px solid rgba(16, 185, 129, 0.3);
        color: var(--accent-green);
    }

    .modal-message.error {
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.3);
        color: #ef4444;
    }

    .modal-message.info {
        background: rgba(59, 130, 246, 0.1);
        border: 1px solid rgba(59, 130, 246, 0.3);
        color: var(--accent-blue);
    }

    /* אנימציות מיוחדות */
    .pulse {
        animation: pulse 2s infinite;
    }

    @keyframes pulse {
        0% {
            transform: scale(1);
            opacity: 1;
        }
        50% {
            transform: scale(1.05);
            opacity: 0.8;
        }
        100% {
            transform: scale(1);
            opacity: 1;
        }
    }

    .fade-in {
        animation: fadeIn 0.3s ease-in;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    /* התאמה למובייל */
    @media (max-width: 768px) {
        .order-details {
            grid-template-columns: 1fr;
        }

        .customer-stats {
            grid-template-columns: 1fr;
        }

        .payment-method-grid {
            grid-template-columns: 1fr;
        }

        .modal-content {
            margin: 0.5rem;
            padding: 1rem;
        }

        .modal h2 {
            font-size: 1.3rem;
        }
    }
`;

document.head.appendChild(paymentStyles);

/**
 * פונקציות עזר למודלים
 */

// הצגת הודעה במודל
function showModalMessage(modalId, message, type = 'info') {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    // מצא או צור אלמנט הודעה
    let messageElement = modal.querySelector('.modal-message');
    if (!messageElement) {
        messageElement = document.createElement('div');
        messageElement.className = 'modal-message';
        
        // הוסף אחרי הכותרת
        const title = modal.querySelector('h2');
        if (title && title.nextSibling) {
            title.parentNode.insertBefore(messageElement, title.nextSibling);
        } else {
            modal.querySelector('.modal-content').prepend(messageElement);
        }
    }

    // עדכן את ההודעה
    messageElement.className = `modal-message ${type} fade-in`;
    messageElement.innerHTML = message;

    // הסר אחרי זמן מסוים
    setTimeout(() => {
        if (messageElement.parentNode) {
            messageElement.parentNode.removeChild(messageElement);
        }
    }, 5000);
}

// ניקוי שדות במודל
function clearModalForm(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    const inputs = modal.querySelectorAll('input:not([type="radio"]):not([type="checkbox"]), textarea, select');
    inputs.forEach(input => {
        if (input.type === 'checkbox' || input.type === 'radio') {
            input.checked = false;
        } else {
            input.value = '';
        }
    });
}

// בדיקת תקינות טופס במודל
function validateModalForm(modalId, requiredFields = []) {
    const modal = document.getElementById(modalId);
    if (!modal) return false;

    const errors = [];

    requiredFields.forEach(fieldId => {
        const field = modal.querySelector(`#${fieldId}`);
        if (field && !field.value.trim()) {
            errors.push(`השדה "${field.previousElementSibling?.textContent || fieldId}" נדרש`);
        }
    });

    if (errors.length > 0) {
        showModalMessage(modalId, errors.join('<br>'), 'error');
        return false;
    }

    return true;
}

// הוספת טעינה למודל
function showModalLoading(modalId, message = 'טוען...') {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    const loadingElement = document.createElement('div');
    loadingElement.className = 'modal-loading';
    loadingElement.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 10;
        border-radius: var(--border-radius-lg);
    `;

    loadingElement.innerHTML = `
        <div class="spinner"></div>
        <div style="margin-top: 1rem; color: white; font-weight: 600;">${message}</div>
    `;

    modal.querySelector('.modal-content').style.position = 'relative';
    modal.querySelector('.modal-content').appendChild(loadingElement);
}

// הסרת טעינה מהמודל
function hideModalLoading(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    const loadingElement = modal.querySelector('.modal-loading');
    if (loadingElement) {
        loadingElement.remove();
    }
}