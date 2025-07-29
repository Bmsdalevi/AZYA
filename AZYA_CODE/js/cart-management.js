// js/cart-management.js - ניהול סל הקניות

/**
 * מחלקה לניהול סל הקניות
 */
class CartManager {
    constructor() {
        this.cart = [];
        this.isOpen = false;
        this.deliveryFee = CONFIG.restaurant.deliveryFee;
        this.init();
    }

    /**
     * אתחול סל הקניות
     */
    init() {
        this.loadCart();
        this.bindEvents();
        this.updateUI();
    }

    /**
     * טעינת סל מהאחסון
     */
    loadCart() {
        const savedCart = DataManager.getCart();
        this.cart = Array.isArray(savedCart) ? savedCart : [];
    }

    /**
     * שמירת סל לאחסון
     */
    saveCart() {
        return DataManager.saveCart(this.cart);
    }

    /**
     * קישור אירועים
     */
    bindEvents() {
        // סגירת סל בלחיצה מחוץ לו
        document.addEventListener('click', (e) => {
            const cartElement = document.getElementById('cart');
            const cartIcon = document.querySelector('.cart-icon');

            if (this.isOpen && cartElement && !cartElement.contains(e.target) && !cartIcon.contains(e.target)) {
                this.closeCart();
            }
        });

        // מקש ESC לסגירת סל
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeCart();
            }
        });
    }

    /**
     * הוספת פריט לסל
     */
    addItem(categoryId, item, quantity = 1) {
        if (!item || !item.id) {
            showError('פריט לא תקין');
            return false;
        }

        if (!item.available) {
            showError('הפריט אינו זמין כרגע');
            return false;
        }

        if (quantity <= 0) {
            showError('כמות לא תקינה');
            return false;
        }

        // בדוק אם הפריט כבר קיים בסל
        const existingItemIndex = this.cart.findIndex(cartItem =>
            cartItem.categoryId === categoryId && cartItem.id === item.id
        );

        if (existingItemIndex >= 0) {
            // עדכן כמות
            this.cart[existingItemIndex].quantity += quantity;
        } else {
            // הוסף פריט חדש
            const cartItem = {
                id: item.id,
                categoryId: categoryId,
                name: item.name,
                description: item.description,
                price: item.price,
                image: item.image,
                quantity: quantity,
                addedAt: new Date().toISOString()
            };

            this.cart.push(cartItem);
        }

        this.saveCart();
        this.updateUI();

        showSuccess(`${item.name} נוסף לסל`, { duration: 2000 });

        // הבהבת אייקון הסל
        this.flashCartIcon();

        return true;
    }

    /**
     * הסרת פריט מהסל
     */
    removeItem(categoryId, itemId) {
        const itemIndex = this.cart.findIndex(item =>
            item.categoryId === categoryId && item.id === itemId
        );

        if (itemIndex >= 0) {
            const removedItem = this.cart[itemIndex];
            this.cart.splice(itemIndex, 1);

            this.saveCart();
            this.updateUI();

            showInfo(`${removedItem.name} הוסר מהסל`);
            return true;
        }

        return false;
    }

    /**
     * עדכון כמות פריט
     */
    updateQuantity(categoryId, itemId, newQuantity) {
        if (newQuantity <= 0) {
            return this.removeItem(categoryId, itemId);
        }

        const itemIndex = this.cart.findIndex(item =>
            item.categoryId === categoryId && item.id === itemId
        );

        if (itemIndex >= 0) {
            this.cart[itemIndex].quantity = newQuantity;
            this.saveCart();
            this.updateUI();
            return true;
        }

        return false;
    }

    /**
     * ניקוי הסל
     */
    clearCart() {
        this.cart = [];
        DataManager.clearCart();
        this.updateUI();
        showInfo('הסל נוקה');
    }

    /**
     * קבלת מספר הפריטים בסל
     */
    getItemCount() {
        return this.cart.reduce((total, item) => total + item.quantity, 0);
    }

    /**
     * קבלת סכום השנתי (ללא משלוח)
     */
    getSubtotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    /**
     * קבלת סכום כולל (עם משלוח)
     */
    getTotal() {
        const subtotal = this.getSubtotal();
        return subtotal > 0 ? subtotal + this.deliveryFee : 0;
    }

    /**
     * בדיקה אם הסל ריק
     */
    isEmpty() {
        return this.cart.length === 0;
    }

    /**
     * פתיחת הסל
     */
    openCart() {
        const cartElement = document.getElementById('cart');
        if (cartElement) {
            cartElement.classList.add('open');
            this.isOpen = true;

            // עדכן תוכן הסל
            this.renderCartItems();
        }
    }

    /**
     * סגירת הסל
     */
    closeCart() {
        const cartElement = document.getElementById('cart');
        if (cartElement) {
            cartElement.classList.remove('open');
            this.isOpen = false;
        }
    }

    /**
     * החלפת מצב הסל (פתוח/סגור)
     */
    toggleCart() {
        if (this.isOpen) {
            this.closeCart();
        } else {
            this.openCart();
        }
    }

    /**
     * עדכון ממשק המשתמש
     */
    updateUI() {
        this.updateCartIcon();
        this.updateCartTotal();

        if (this.isOpen) {
            this.renderCartItems();
        }
    }

    /**
     * עדכון אייקון הסל
     */
    updateCartIcon() {
        const cartCount = document.getElementById('cart-count');
        const itemCount = this.getItemCount();

        if (cartCount) {
            cartCount.textContent = itemCount;
            cartCount.style.display = itemCount > 0 ? 'flex' : 'none';
        }
    }

    /**
     * עדכון סכום הסל
     */
    updateCartTotal() {
        const cartTotalElement = document.getElementById('cart-total');
        if (cartTotalElement) {
            const total = this.getTotal();
            cartTotalElement.textContent = total > 0 ? `סה"כ: ${formatPrice(total)}` : 'הסל ריק';
        }
    }

    /**
     * רינדור פריטי הסל
     */
    renderCartItems() {
        const cartItemsContainer = document.getElementById('cart-items');
        if (!cartItemsContainer) return;

        if (this.isEmpty()) {
            cartItemsContainer.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🛒</div>
                    <p>הסל ריק</p>
                    <p style="font-size: 0.9rem;">הוסף פריטים מהתפריט</p>
                </div>
            `;
            return;
        }

        const itemsHTML = this.cart.map(item => this.renderCartItem(item)).join('');

        cartItemsContainer.innerHTML = `
            <div class="cart-items-list">
                ${itemsHTML}
            </div>
            <div class="cart-summary">
                <div class="cart-subtotal">
                    <span>סה"כ מוצרים:</span>
                    <span>${formatPrice(this.getSubtotal())}</span>
                </div>
                <div class="cart-delivery">
                    <span>דמי משלוח:</span>
                    <span>${formatPrice(this.deliveryFee)}</span>
                </div>
                <div class="cart-total-line">
                    <span>סה"כ לתשלום:</span>
                    <span>${formatPrice(this.getTotal())}</span>
                </div>
            </div>
        `;
    }

    /**
     * רינדור פריט בודד בסל
     */
    renderCartItem(item) {
        return `
            <div class="cart-item" data-category="${item.categoryId}" data-item="${item.id}">
                <div class="cart-item-image">
                    ${item.image ?
                        `<img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;">` :
                        '<div style="width: 50px; height: 50px; background: var(--glass-bg); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">🍽️</div>'
                    }
                </div>
                <div class="cart-item-details">
                    <h4 class="cart-item-name">${item.name}</h4>
                    <p class="cart-item-price">${formatPrice(item.price)}</p>
                    ${item.description ? `<p class="cart-item-description">${truncateText(item.description, 50)}</p>` : ''}
                </div>
                <div class="cart-item-controls">
                    <div class="quantity-controls">
                        <button class="quantity-btn minus" onclick="cart.updateQuantity('${item.categoryId}', '${item.id}', ${item.quantity - 1})" ${item.quantity <= 1 ? 'disabled' : ''}>
                            −
                        </button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn plus" onclick="cart.updateQuantity('${item.categoryId}', '${item.id}', ${item.quantity + 1})">
                            +
                        </button>
                    </div>
                    <button class="remove-item-btn" onclick="cart.removeItem('${item.categoryId}', '${item.id}')" title="הסר פריט">
                        🗑️
                    </button>
                </div>
                <div class="cart-item-total">
                    ${formatPrice(item.price * item.quantity)}
                </div>
            </div>
        `;
    }

    /**
     * הבהבת אייקון הסל
     */
    flashCartIcon() {
        const cartIcon = document.querySelector('.cart-icon');
        if (cartIcon) {
            cartIcon.style.transform = 'scale(1.2)';
            cartIcon.style.transition = 'transform 0.2s ease';

            setTimeout(() => {
                cartIcon.style.transform = 'scale(1)';
            }, 200);
        }
    }

    /**
     * מעבר לתשלום
     */
    checkout() {
        if (this.isEmpty()) {
            showWarning('הסל ריק - הוסף פריטים לפני ביצוע הזמנה');
            return;
        }

        // בדוק זמינות פריטים
        if (!this.validateCartItems()) {
            return;
        }

        // סגור את הסל
        this.closeCart();

        // פתח חלון פרטי לקוח
        this.openCustomerModal();
    }

    /**
     * בדיקת זמינות פריטים בסל
     */
    validateCartItems() {
        const unavailableItems = [];

        this.cart.forEach(cartItem => {
            // מצא את הפריט בתפריט
            const menuItem = menuData.getItem(cartItem.categoryId, cartItem.id);

            if (!menuItem || !menuItem.available) {
                unavailableItems.push(cartItem.name);
            }
        });

        if (unavailableItems.length > 0) {
            showError(`הפריטים הבאים אינם זמינים יותר: ${unavailableItems.join(', ')}`);

            // הסר פריטים לא זמינים
            this.cart = this.cart.filter(cartItem => {
                const menuItem = menuData.getItem(cartItem.categoryId, cartItem.id);
                return menuItem && menuItem.available;
            });

            this.saveCart();
            this.updateUI();

            return false;
        }

        return true;
    }

    /**
     * פתיחת חלון פרטי לקוח
     */
    openCustomerModal() {
        // עדכן סיכום הזמנה במודל
        this.updateOrderSummaryInModal();

        // פתח את המודל
        const modal = document.getElementById('customerModal');
        if (modal) {
            modal.style.display = 'flex';

            // מיקוד בשדה הראשון
            const firstInput = modal.querySelector('input[type="text"]');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
        }
    }

    /**
     * עדכון סיכום הזמנה במודל
     */
    updateOrderSummaryInModal() {
        const summaryContainer = document.getElementById('modalOrderSummary');
        const subtotalElement = document.getElementById('modalSubtotal');
        const deliveryFeeElement = document.getElementById('modalDeliveryFee');
        const totalElement = document.getElementById('modalTotal');

        if (summaryContainer) {
            const itemsHTML = this.cart.map(item => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid var(--glass-border);">
                    <div>
                        <div style="font-weight: 600;">${item.name}</div>
                        <div style="font-size: 0.9rem; color: var(--text-secondary);">
                            ${formatPrice(item.price)} × ${item.quantity}
                        </div>
                    </div>
                    <div style="font-weight: 600; color: var(--accent-green);">
                        ${formatPrice(item.price * item.quantity)}
                    </div>
                </div>
            `).join('');

            summaryContainer.innerHTML = itemsHTML;
        }

        if (subtotalElement) {
            subtotalElement.textContent = formatPrice(this.getSubtotal());
        }

        if (deliveryFeeElement) {
            deliveryFeeElement.textContent = formatPrice(this.deliveryFee);
        }

        if (totalElement) {
            totalElement.textContent = formatPrice(this.getTotal());
        }
    }

    /**
     * קבלת נתוני הסל לביצוע הזמנה
     */
    getOrderData() {
        return {
            items: this.cart.map(item => ({
                id: item.id,
                categoryId: item.categoryId,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                subtotal: item.price * item.quantity
            })),
            subtotal: this.getSubtotal(),
            deliveryFee: this.deliveryFee,
            total: this.getTotal(),
            itemCount: this.getItemCount()
        };
    }

    /**
     * איפוס הסל לאחר הזמנה מוצלחת
     */
    resetAfterOrder() {
        this.clearCart();
        this.closeCart();
    }
}

// יצירת מופע יחיד
let cart;

// המתן לטעינת DataManager
document.addEventListener('DOMContentLoaded', () => {
    // חכה שכל הרכיבים יטענו
    setTimeout(() => {
        if (typeof DataManager !== 'undefined') {
            cart = new CartManager();
            window.cart = cart;
        } else {
            console.error('DataManager לא זמין עדיין');
            // נסה שוב אחרי עוד זמן
            setTimeout(() => {
                cart = new CartManager();
                window.cart = cart;
            }, 1000);
        }
    }, 100);
});

// פונקציות גלובליות לגישה מ-HTML
function toggleCart() {
    if (typeof cart !== 'undefined') {
        cart.toggleCart();
    }
}

function addToCart(categoryId, itemId) {
    if (typeof cart !== 'undefined' && typeof menuData !== 'undefined') {
        const item = menuData.getItem(categoryId, itemId);
        if (item) {
            cart.addItem(categoryId, item);
        }
    }
}

function checkout() {
    if (typeof cart !== 'undefined') {
        cart.checkout();
    }
}

// הוספת CSS לסל
const cartStyles = document.createElement('style');
cartStyles.textContent = `
    .cart {
        position: fixed;
        top: 0;
        right: -400px;
        width: 400px;
        height: 100vh;
        background: var(--glass-bg);
        backdrop-filter: blur(20px);
        border-left: 1px solid var(--glass-border);
        z-index: 1000;
        transition: right 0.3s ease;
        display: flex;
        flex-direction: column;
        box-shadow: -10px 0 30px rgba(0, 0, 0, 0.3);
    }

    .cart.open {
        right: 0;
    }

    .cart-header {
        padding: 1.5rem;
        border-bottom: 1px solid var(--glass-border);
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: rgba(0, 0, 0, 0.1);
    }

    .cart-title {
        font-size: 1.2rem;
        font-weight: 700;
        color: var(--primary-gold);
        margin: 0;
    }

    .close-cart {
        background: none;
        border: none;
        color: var(--text-primary);
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0.5rem;
        border-radius: 50%;
        transition: all 0.2s ease;
    }

    .close-cart:hover {
        background: var(--glass-bg);
        transform: rotate(90deg);
    }

    .cart-items {
        flex: 1;
        overflow-y: auto;
        padding: 1rem;
    }

    .cart-item {
        display: grid;
        grid-template-columns: auto 1fr auto auto;
        gap: 1rem;
        align-items: center;
        padding: 1rem;
        background: var(--glass-bg);
        border: 1px solid var(--glass-border);
        border-radius: var(--border-radius);
        margin-bottom: 1rem;
    }

    .cart-item-details h4 {
        margin: 0 0 0.25rem 0;
        font-size: 1rem;
        color: var(--text-primary);
    }

    .cart-item-price {
        color: var(--accent-green);
        font-weight: 600;
        margin: 0;
    }

    .cart-item-description {
        font-size: 0.85rem;
        color: var(--text-secondary);
        margin: 0.25rem 0 0 0;
    }

    .quantity-controls {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
    }

    .quantity-btn {
        width: 28px;
        height: 28px;
        border: 1px solid var(--glass-border);
        background: var(--glass-bg);
        color: var(--text-primary);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 1rem;
        font-weight: 600;
    }

    .quantity-btn:hover:not(:disabled) {
        background: var(--primary-gold);
        color: black;
    }

    .quantity-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .quantity {
        min-width: 24px;
        text-align: center;
        font-weight: 600;
    }

    .remove-item-btn {
        background: none;
        border: none;
        color: var(--text-secondary);
        cursor: pointer;
        padding: 0.5rem;
        border-radius: 50%;
        transition: all 0.2s ease;
        font-size: 1.2rem;
    }

    .remove-item-btn:hover {
        color: var(--accent-red);
        background: rgba(239, 68, 68, 0.1);
    }

    .cart-item-total {
        font-weight: 700;
        color: var(--accent-green);
        text-align: center;
    }

    .cart-summary {
        padding: 1rem;
        background: rgba(0, 0, 0, 0.1);
        border-top: 1px solid var(--glass-border);
        margin-top: 1rem;
    }

    .cart-subtotal, .cart-delivery {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
        color: var(--text-secondary);
    }

    .cart-total-line {
        display: flex;
        justify-content: space-between;
        font-weight: 700;
        font-size: 1.1rem;
        color: var(--accent-green);
        border-top: 1px solid var(--glass-border);
        padding-top: 0.5rem;
        margin-top: 0.5rem;
    }

    .cart-total {
        padding: 1rem 1.5rem;
        background: rgba(0, 0, 0, 0.2);
        border-top: 1px solid var(--glass-border);
        font-weight: 700;
        font-size: 1.1rem;
        text-align: center;
        color: var(--accent-green);
    }

    .checkout-btn {
        margin: 1rem 1.5rem;
        padding: 1rem;
        background: var(--primary-gold);
        color: black;
        border: none;
        border-radius: var(--border-radius);
        font-weight: 700;
        font-size: 1.1rem;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .checkout-btn:hover {
        background: var(--primary-gold-hover);
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(218, 165, 32, 0.3);
    }

    .cart-icon {
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        width: 60px;
        height: 60px;
        background: var(--primary-gold);
        color: black;
        border: none;
        border-radius: 50%;
        font-size: 1.5rem;
        cursor: pointer;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        z-index: 999;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .cart-icon:hover {
        transform: scale(1.1);
        box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
    }

    .cart-count {
        position: absolute;
        top: -8px;
        right: -8px;
        background: var(--accent-red);
        color: white;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.8rem;
        font-weight: 700;
        border: 2px solid white;
    }

    @media (max-width: 768px) {
        .cart {
            width: 100vw;
            right: -100vw;
        }

        .cart.open {
            right: 0;
        }

        .cart-item {
            grid-template-columns: auto 1fr;
            gap: 0.75rem;
        }

        .cart-item-controls {
            grid-column: 1 / -1;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 0.5rem;
        }

        .cart-item-total {
            grid-column: 1 / -1;
            text-align: right;
            margin-top: 0.5rem;
        }
    }
`;

document.head.appendChild(cartStyles);