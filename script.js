${item.addOns && item.addOns.length > 0 ? `
                <div class="add-ons-section">
                    <div class="add-ons-title">תוספות אפשריות:</div>
                    ${item.addOns.map((addon, index) => `
                        <div class="add-on-item">
                            <input type="checkbox" class="add-on-checkbox" id="addon-${item.id}-${index}" value="${addon.name}" data-price="${addon.price}">
                            <label for="addon-${item.id}-${index}">${addon.name} (+₪${addon.price})</label>
                        </div>
                    `).join('')}
                </div>
            ` : ''}

            <div class="sauces-section">
                <div class="sauces-title">🍯 בחר רטבים (חינם):</div>
                <div class="sauces-grid">
                    ${sauces.filter(sauce => sauce.available).map(sauce => `
                        <div class="sauce-item" onclick="toggleSauce(this, '${sauce.name}')">
                            <input type="checkbox" class="sauce-checkbox" id="sauce-${item.id}-${sauce.id}" value="${sauce.name}" style="display: none;">
                            <div class="sauce-name">${sauce.name}</div>
                            <div class="sauce-description">${sauce.description}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <button class="add-to-cart-btn" onclick="addToCart(${item.id})" ${!item.available ? 'disabled' : ''}>
                ${item.available ? '➕ הוסף לעגלה' : '❌ לא זמין'}
            </button>
        </div>
    `).join('');

    // Auto-select first meat option
    setTimeout(() => {
        filteredItems.forEach(item => {
            if (item.meatOptions && item.meatOptions.length > 0) {
                const firstMeatOption = document.querySelector(`.meat-option input[name="meat-${item.id}"]`);
                if (firstMeatOption) {
                    firstMeatOption.checked = true;
                    firstMeatOption.closest('.meat-option').classList.add('selected');
                }
            }
        });
    }, 100);
}

function selectMeat(element, meatName, itemId) {
    const meatOptions = document.querySelectorAll(`input[name="meat-${itemId}"]`);
    meatOptions.forEach(option => {
        option.closest('.meat-option').classList.remove('selected');
        option.checked = false;
    });
    
    element.classList.add('selected');
    const radio = element.querySelector('.meat-radio');
    radio.checked = true;
}

function toggleSauce(element, sauceName) {
    const checkbox = element.querySelector('.sauce-checkbox');
    checkbox.checked = !checkbox.checked;
    
    if (checkbox.checked) {
        element.classList.add('selected');
    } else {
        element.classList.remove('selected');
    }
}

function filterMenu(category) {
    currentFilter = category;
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    renderMenu();
}

// Cart Functions
function addToCart(itemId) {
    const item = menuItems.find(item => item.id === itemId);
    if (!item || !item.available) return;

    let selectedMeat = null;
    const meatRadio = document.querySelector(`input[name="meat-${itemId}"]:checked`);
    if (meatRadio) selectedMeat = meatRadio.value;

    const selectedAddOns = [];
    const addOnCheckboxes = document.querySelectorAll(`input[id^="addon-${itemId}-"]:checked`);
    let addOnsPrice = 0;

    addOnCheckboxes.forEach(checkbox => {
        const price = parseFloat(checkbox.dataset.price);
        selectedAddOns.push({ name: checkbox.value, price: price });
        addOnsPrice += price;
    });

    const selectedSauces = [];
    const sauceCheckboxes = document.querySelectorAll(`input[id^="sauce-${itemId}-"]:checked`);
    sauceCheckboxes.forEach(checkbox => {
        selectedSauces.push(checkbox.value);
    });

    const cartItem = {
        ...item,
        quantity: 1,
        selectedMeat: selectedMeat,
        addOns: selectedAddOns,
        sauces: selectedSauces,
        totalPrice: item.price + addOnsPrice
    };

    const existingItemIndex = cart.findIndex(cartItem => 
        cartItem.id === itemId && 
        cartItem.selectedMeat === selectedMeat &&
        JSON.stringify(cartItem.addOns) === JSON.stringify(selectedAddOns) &&
        JSON.stringify(cartItem.sauces) === JSON.stringify(selectedSauces)
    );

    if (existingItemIndex !== -1) {
        cart[existingItemIndex].quantity += 1;
    } else {
        cart.push(cartItem);
    }

    updateCartDisplay();
    saveData();

    // Clear selections
    addOnCheckboxes.forEach(checkbox => checkbox.checked = false);
    sauceCheckboxes.forEach(checkbox => {
        checkbox.checked = false;
        checkbox.closest('.sauce-item').classList.remove('selected');
    });

    // Reset meat selection to first option
    if (item.meatOptions && item.meatOptions.length > 0) {
        const meatOptions = document.querySelectorAll(`input[name="meat-${itemId}"]`);
        meatOptions.forEach((option, index) => {
            const meatDiv = option.closest('.meat-option');
            meatDiv.classList.remove('selected');
            option.checked = false;
            if (index === 0) {
                meatDiv.classList.add('selected');
                option.checked = true;
            }
        });
    }

    // Show feedback
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = '✅ נוסף לעגלה!';
    btn.style.background = '#27ae60';
    setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
    }, 1000);
}

function updateCartDisplay() {
    const cartCount = document.getElementById('cartCount');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
}

function toggleCart() {
    const modal = document.getElementById('cartModal');
    const isVisible = modal.classList.contains('show');

    if (isVisible) {
        modal.classList.remove('show');
        setTimeout(() => modal.style.display = 'none', 300);
    } else {
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('show'), 10);
        renderCart();
    }
}

function renderCart() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🛒</div>
                <div class="empty-state-text">העגלה ריקה</div>
                <div class="empty-state-subtext">הוסף פריטים מהתפריט כדי להתחיל</div>
            </div>
        `;
        cartTotal.textContent = 'סה"כ: ₪0';
        document.getElementById('cartActions').style.display = 'none';
        return;
    }

    document.getElementById('cartActions').style.display = 'block';

    cartItems.innerHTML = cart.map((item, index) => `
        <div class="cart-item">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>₪${item.price} × ${item.quantity} = ₪${(item.totalPrice * item.quantity).toFixed(2)}</p>
                ${item.selectedMeat ? `<div class="cart-item-addons">🥩 ${item.selectedMeat}</div>` : ''}
                ${item.addOns && item.addOns.length > 0 ? `<div class="cart-item-addons">תוספות: ${item.addOns.map(addon => `${addon.name} (+₪${addon.price})`).join(', ')}</div>` : ''}
                ${item.sauces && item.sauces.length > 0 ? `<div class="cart-item-addons">🍯 ${item.sauces.join(', ')}</div>` : ''}
            </div>
            <div class="cart-controls">
                <button class="quantity-btn" onclick="updateQuantity(${index}, -1)">-</button>
                <span class="quantity-display">${item.quantity}</span>
                <button class="quantity-btn" onclick="updateQuantity(${index}, 1)">+</button>
                <button class="remove-btn" onclick="removeFromCart(${index})">הסר</button>
            </div>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + (item.totalPrice * item.quantity), 0);
    cartTotal.textContent = `סה"כ: ₪${total.toFixed(2)}`;
}

function updateQuantity(itemIndex, change) {
    if (cart[itemIndex]) {
        cart[itemIndex].quantity += change;
        if (cart[itemIndex].quantity <= 0) {
            removeFromCart(itemIndex);
        } else {
            renderCart();
            updateCartDisplay();
            saveData();
        }
    }
}

function removeFromCart(itemIndex) {
    cart.splice(itemIndex, 1);
    renderCart();
    updateCartDisplay();
    saveData();
}

function showCheckout() {
    document.getElementById('cartItems').style.display = 'none';
    document.getElementById('cartActions').style.display = 'none';
    document.getElementById('orderForm').style.display = 'block';
}

function backToCart() {
    document.getElementById('cartItems').style.display = 'block';
    document.getElementById('cartActions').style.display = 'block';
    document.getElementById('orderForm').style.display = 'none';
}

function submitOrder(event) {
    event.preventDefault();

    const customerName = document.getElementById('customerName').value;
    const customerPhone = document.getElementById('customerPhone').value;
    const customerAddress = document.getElementById('customerAddress').value;
    const orderNotes = document.getElementById('orderNotes').value;

    const order = {
        id: nextOrderNumber++,
        customerName: customerName,
        customerPhone: customerPhone,
        customerAddress: customerAddress,
        items: [...cart],
        total: cart.reduce((sum, item) => sum + (item.totalPrice * item.quantity), 0),
        notes: orderNotes,
        time: new Date(),
        status: 'new'
    };

    orders.unshift(order);

    const existingCustomer = customers.find(c => c.phone === customerPhone);
    if (existingCustomer) {
        existingCustomer.totalOrders++;
        existingCustomer.totalSpent += order.total;
    } else {
        customers.push({
            id: Date.now(),
            name: customerName,
            phone: customerPhone,
            address: customerAddress,
            joinDate: new Date().toISOString().split('T')[0],
            totalOrders: 1,
            totalSpent: order.total
        });
    }

    cart = [];
    updateCartDisplay();
    saveData();

    showNotification(`ההזמנה #${order.id} נשלחה בהצלחה! זמן הכנה משוער: 25-30 דקות`, 'success');
    toggleCart();

    document.getElementById('customerName').value = '';
    document.getElementById('customerPhone').value = '';
    document.getElementById('customerAddress').value = '';
    document.getElementById('orderNotes').value = '';

    return false;
}

// Admin Functions
function showAdminSection(section) {
    document.querySelectorAll('.admin-section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.admin-nav button').forEach(btn => btn.classList.remove('active'));

    const sectionMap = {
        'menu': 'menuAdmin',
        'customers': 'customersAdmin',
        'categories': 'categoriesAdmin',
        'sauces': 'saucesAdmin',
        'editor': 'editorAdmin',
        'settings': 'settingsAdmin'
    };
    
    const sectionId = sectionMap[section] || section;
    document.getElementById(sectionId).classList.add('active');
    event.target.classList.add('active');

    switch(section) {
        case 'dashboard': updateDashboard(); break;
        case 'orders': renderAdminOrders(); break;
        case 'menu': renderAdminMenu(); break;
        case 'categories': renderAdminCategories(); break;
        case 'sauces': renderAdminSauces(); break;
        case 'customers': renderAdminCustomers(); break;
        case 'editor': renderMenuEditor(); break;
    }
}

function updateDashboard() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = orders.filter(order => {
        const orderDate = new Date(order.time);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === today.getTime();
    });

    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);
    const newOrders = orders.filter(order => order.status === 'new');

    document.getElementById('totalOrdersToday').textContent = todayOrders.length;
    document.getElementById('todayRevenue').textContent = `₪${todayRevenue}`;
    document.getElementById('newOrdersCount').textContent = newOrders.length;
    document.getElementById('totalCustomers').textContent = customers.length;

    renderRecentOrders();
}

function renderRecentOrders() {
    const recentOrdersList = document.getElementById('recentOrdersList');
    const recentOrders = orders.slice(0, 5);

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
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: var(--coffee-black); border-radius: 10px; margin-bottom: 1rem;">
            <div>
                <strong>#${order.id}</strong> - ${order.customerName}
                <div style="color: var(--cream-light); font-size: 0.9rem;">${formatTime(order.time)}</div>
            </div>
            <div>
                <span class="order-status status-${order.status}">${getStatusText(order.status)}</span>
                <div style="color: var(--gold-primary); font-weight: bold; margin-top: 0.3rem;">₪${order.total}</div>
            </div>
        </div>
    `).join('');
}

function renderAdminOrders() {
    const ordersList = document.getElementById('ordersList');

    if (orders.length === 0) {
        ordersList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <div class="empty-state-text">אין הזמנות עדיין</div>
                <div class="empty-state-subtext">הזמנות חדשות יופיעו כאן</div>
            </div>
        `;
        return;
    }

    ordersList.innerHTML = orders.map(order => `
        <div class="order-card ${order.status === 'new' ? 'new' : ''}">
            <div class="order-header">
                <div class="order-number">#${order.id}</div>
                <div class="order-status status-${order.status}">${getStatusText(order.status)}</div>
            </div>

            <div class="customer-info">
                <div class="customer-name" onclick="showCustomerHistory('${order.customerPhone}')">👤 ${order.customerName}</div>
                <div style="color: var(--cream-light); margin-top: 0.3rem;">📞 ${order.customerPhone}</div>
                <div style="color: var(--cream-light); margin-top: 0.3rem;">🏠 ${order.customerAddress}</div>
                <div style="color: var(--cream-light); margin-top: 0.3rem;">🕒 ${formatDateTime(order.time)}</div>
            </div>

            <div class="order-items">
                ${order.items.map(item => `
                    <div style="display: flex; justify-content: space-between; padding: 0.3rem 0; border-bottom: 1px solid var(--coffee-black);">
                        <div>
                            <span>${item.name}</span>
                            ${item.selectedMeat ? `<br><small style="color: var(--gold-light);">🥩 ${item.selectedMeat}</small>` : ''}
                            ${item.addOns && item.addOns.length > 0 ? `<br><small style="color: var(--cream-light);">+ ${item.addOns.map(a => a.name).join(', ')}</small>` : ''}
                            ${item.sauces && item.sauces.length > 0 ? `<br><small style="color: var(--gold-light);">🍯 ${item.sauces.join(', ')}</small>` : ''}
                        </div>
                        <span>×${item.quantity}</span>
                        <span style="color: var(--gold-primary); font-weight: bold;">₪${item.totalPrice * item.quantity}</span>
                    </div>
                `).join('')}
            </div>

            <div class="order-total">סה"כ: ₪${order.total}</div>
            ${order.notes ? `<div style="margin-top: 0.5rem; font-style: italic; color: var(--cream-light);">📝 ${order.notes}</div>` : ''}

            <div style="display: flex; gap: 0.5rem; margin-top: 1rem; flex-wrap: wrap;">
                ${getOrderActionButtons(order)}
            </div>
        </div>
    `).join('');
}

function getOrderActionButtons(order) {
    switch(order.status) {
        case 'new':
            return `
                <button class="action-btn btn-success" onclick="updateOrderStatus('${order.id}', 'preparing')">✅ אשר</button>
                <button class="action-btn btn-danger" onclick="cancelOrder('${order.id}')">❌ בטל</button>
            `;
        case 'preparing':
            return `
                <button class="action-btn btn-info" onclick="updateOrderStatus('${order.id}', 'ready')">🍽️ מוכן</button>
                <button class="action-btn btn-danger" onclick="cancelOrder('${order.id}')">❌ בטל</button>
            `;
        case 'ready':
            return `
                <button class="action-btn btn-success" onclick="updateOrderStatus('${order.id}', 'delivered')">🚚 נשלח</button>
                <button class="action-btn btn-danger" onclick="cancelOrder('${order.id}')">❌ בטל</button>
            `;
        case 'delivered':
            return `
                <span style="color: var(--success-green); font-weight: bold;">✅ הושלם</span>
                <button class="action-btn btn-danger" onclick="deleteOrder('${order.id}')">🗑️ מחק</button>
            `;
        case 'canceled':
            return `
                <span style="color: var(--danger-red); font-weight: bold;">❌ בוטל</span>
                <button class="action-btn btn-danger" onclick="deleteOrder('${order.id}')">🗑️ מחק</button>
            `;
        default:
            return '';
    }
}

function updateOrderStatus(orderId, newStatus) {
    const order = orders.find(o => o.id == orderId);
    if (order) {
        order.status = newStatus;
        saveData();
        renderAdminOrders();
        updateDashboard();
        showNotification(`הזמנה #${orderId} עודכנה ל: ${getStatusText(newStatus)}`, 'success');
    }
}

function cancelOrder(orderId) {
    if (confirm(`האם אתה בטוח שברצונך לבטל את הזמנה #${orderId}?`)) {
        const order = orders.find(o => o.id == orderId);
        if (order) {
            order.status = 'canceled';
            saveData();
            renderAdminOrders();
            updateDashboard();
            showNotification(`הזמנה #${orderId} בוטלה`, 'warning');
        }
    }
}

function deleteOrder(orderId) {
    if (confirm(`האם אתה בטוח שברצונך למחוק את הזמנה #${orderId}?`)) {
        orders = orders.filter(o => o.id != orderId);
        saveData();
        renderAdminOrders();
        updateDashboard();
        showNotification(`הזמנה #${orderId} נמחקה`, 'warning');
    }
}

function addTestOrder() {
    const testOrder = {
        id: nextOrderNumber++,
        customerName: 'לקוח בדיקה',
        customerPhone: '050-1234567',
        customerAddress: 'כתובת בדיקה 123',
        items: [{ 
            name: 'טוסט הזיה', 
            price: 45, 
            quantity: 1, 
            totalPrice: 45, 
            selectedMeat: 'צלי בקר',
            addOns: [], 
            sauces: ['מיונז שום'] 
        }],
        total: 45,
        notes: 'הזמנת בדיקה',
        time: new Date(),
        status: 'new'
    };

    orders.unshift(testOrder);
    saveData();
    renderAdminOrders();
    updateDashboard();
    showNotification('הזמנת בדיקה נוספה!', 'success');
}

// Menu Management Functions
function renderAdminMenu() {
    const adminMenuGrid = document.getElementById('adminMenuGrid');
    if (!adminMenuGrid) return;

    adminMenuGrid.innerHTML = menuItems.map(item => `
        <div class="menu-item" style="border: 2px solid ${item.available ? 'var(--success-green)' : 'var(--danger-red)'};">
            <div class="menu-item-header">
                <div>
                    <img src="${item.image}" alt="${item.name}" class="menu-item-image">
                    <h3>${item.name}</h3>
                    <div style="color: var(--cream-light); font-size: 0.9rem; margin-bottom: 0.5rem;">${item.category}</div>
                </div>
                <div class="menu-item-price">₪${item.price}</div>
            </div>
            <p>${item.description}</p>
            ${item.notes ? `<div class="menu-item-notes">💡 ${item.notes}</div>` : ''}

            ${item.meatOptions && item.meatOptions.length > 0 ? `
                <div class="add-ons-section">
                    <div class="add-ons-title">אופציות בשר:</div>
                    ${item.meatOptions.map(meat => `<div style="font-size: 0.8rem; margin: 0.2rem 0;">🥩 ${meat}</div>`).join('')}
                </div>
            ` : ''}

            ${item.addOns && item.addOns.length > 0 ? `
                <div class="add-ons-section">
                    <div class="add-ons-title">תוספות:</div>
                    ${item.addOns.map(addon => `<div style="font-size: 0.8rem; margin: 0.2rem 0;">• ${addon.name} (+₪${addon.price})</div>`).join('')}
                </div>
            ` : ''}

            <div style="margin: 1rem 0;">
                <span style="padding: 0.3rem 0.8rem; border-radius: 15px; font-size: 0.8rem; font-weight: bold; ${item.available ? 'background: var(--success-green); color: white;' : 'background: var(--danger-red); color: white;'}">
                    ${item.available ? '✅ זמין' : '❌ לא זמין'}
                </span>
            </div>

            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                <button class="action-btn ${item.available ? 'btn-warning' : 'btn-success'}" onclick="toggleItemAvailability(${item.id})">
                    ${item.available ? '🔒 הסתר' : '🔓 הצג'}
                </button>
                <button class="action-btn" onclick="editItem(${item.id})">✏️ ערוך</button>
                <button class="action-btn btn-info" onclick="changeItemImage(${item.id})">🖼️ תמונה</button>
                <button class="action-btn btn-danger" onclick="deleteItem(${item.id})">🗑️ מחק</button>
            </div>
        </div>
    `).join('');
}

function toggleItemAvailability(itemId) {
    const item = menuItems.find(i => i.id === itemId);
    if (item) {
        item.available = !item.available;
        renderMenu();
        renderAdminMenu();
        saveData();
        showNotification(`${item.name} ${item.available ? 'זמין' : 'לא זמין'} עכשיו`, 'info');
    }
}

function changeItemImage(itemId) {
    const item = menuItems.find(i => i.id === itemId);
    if (!item) return;

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                item.image = e.target.result;
                renderMenu();
                renderAdminMenu();
                saveData();
                showNotification(`תמונת "${item.name}" עודכנה!`, 'success');
            };
            reader.readAsDataURL(file);
        }
    };
    input.click();
}

// Helper Functions
function getStatusText(status) {
    const statusMap = {
        'new': 'חדשה',
        'preparing': 'בהכנה', 
        'ready': 'מוכנה',
        'delivered': 'נשלחה',
        'canceled': 'בוטלה'
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

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;

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

    setTimeout(() => notification.classList.add('show'), 100);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

function generateSampleOrders() {
    if (orders.length === 0) {
        const sampleOrders = [
            {
                id: nextOrderNumber++,
                customerName: "יוסי כהן",
                customerPhone: "052-1234567", 
                customerAddress: "רחוב הרצל 45, תל אביב",
                items: [{
                    name: "טוסט הזיה",
                    price: 45,
                    quantity: 1,
                    totalPrice: 53,
                    selectedMeat: "רוסטביף מפולפל",
                    addOns: [{name: "גבינה צהובה", price: 6}],
                    sauces: ["מיונז שום", "צ'ילי מתוק"]
                }],
                total: 53,
                status: "new",
                time: new Date(Date.now() - 300000),
                notes: "ללא בצל, אנא"
            },
            {
                id: nextOrderNumber++,
            {
                id: nextOrderNumber++,
                customerName: "שרה לוי",
                customerPhone: "054-9876543",
                customerAddress: "רחוב דיזנגוף 123, תל אביב", 
                items: [{
                    name: "מאנצ' (ללא מתחרים)",
                    price: 58,
                    quantity: 1,
                    totalPrice: 63,
                    selectedMeat: "כתף",
                    addOns: [{name: "שום קונפי", price: 8}],
                    sauces: ["רוטב ההזיה", "צ'ימיצ'ורי"]
                }],
                total: 63,
                status: "preparing",
                time: new Date(Date.now() - 900000),
                notes: "חריף במיוחד"
            }
        ];

        orders.push(...sampleOrders);

        customers.push(
            {
                id: 1,
                name: "יוסי כהן",
                phone: "052-1234567",
                address: "רחוב הרצל 45, תל אביב",
                joinDate: "2024-01-15",
                totalOrders: 8,
                totalSpent: 520
            },
            {
                id: 2,
                name: "שרה לוי",
                phone: "054-9876543",
                address: "רחוב דיזנגוף 123, תל אביב",
                joinDate: "2024-02-20",
                totalOrders: 5,
                totalSpent: 340
            }
        );

        saveData();
    }
}

// Additional Admin Functions - Stubs for completeness
function renderAdminCategories() {
    const categoriesGrid = document.getElementById('categoriesGrid');
    if (!categoriesGrid) return;
    
    categoriesGrid.innerHTML = categories.map(category => `
        <div class="menu-item" style="border: 2px solid ${category.active ? 'var(--success-green)' : 'var(--danger-red)'};">
            <div class="menu-item-header">
                <div>
                    <img src="${category.icon}" alt="${category.name}" class="menu-item-image">
                    <h3>${category.name}</h3>
                </div>
                <div>
                    <span style="padding: 0.3rem 0.8rem; border-radius: 15px; font-size: 0.8rem; font-weight: bold; ${category.active ? 'background: var(--success-green); color: white;' : 'background: var(--danger-red); color: white;'}">
                        ${category.active ? '✅ פעיל' : '❌ לא פעיל'}
                    </span>
                </div>
            </div>
            <p>מספר פריטים: ${menuItems.filter(item => item.category === category.name).length}</p>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 1rem;">
                <button class="action-btn ${category.active ? 'btn-warning' : 'btn-success'}" onclick="toggleCategoryStatus(${category.id})">
                    ${category.active ? '🔒 השבת' : '🔓 הפעל'}
                </button>
                <button class="action-btn" onclick="editCategory(${category.id})">✏️ ערוך</button>
                <button class="action-btn btn-info" onclick="changeCategoryIcon(${category.id})">🖼️ תמונה</button>
                <button class="action-btn btn-danger" onclick="deleteCategory(${category.id})">🗑️ מחק</button>
            </div>
        </div>
    `).join('');
}

function renderAdminSauces() {
    const saucesGrid = document.getElementById('saucesGrid');
    if (!saucesGrid) return;

    saucesGrid.innerHTML = sauces.map(sauce => `
        <div class="menu-item" style="border: 2px solid ${sauce.available ? 'var(--success-green)' : 'var(--danger-red)'};">
            <div class="menu-item-header">
                <div>
                    <div style="font-size: 3rem; margin-bottom: 0.5rem;">🍯</div>
                    <h3>${sauce.name}</h3>
                </div>
                <div>
                    <span style="padding: 0.3rem 0.8rem; border-radius: 15px; font-size: 0.8rem; font-weight: bold; ${sauce.available ? 'background: var(--success-green); color: white;' : 'background: var(--danger-red); color: white;'}">
                        ${sauce.available ? '✅ זמין' : '❌ לא זמין'}
                    </span>
                </div>
            </div>
            <p>${sauce.description}</p>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 1rem;">
                <button class="action-btn ${sauce.available ? 'btn-warning' : 'btn-success'}" onclick="toggleSauceAvailability(${sauce.id})">
                    ${sauce.available ? '🔒 השבת' : '🔓 הפעל'}
                </button>
                <button class="action-btn" onclick="editSauce(${sauce.id})">✏️ ערוך</button>
                <button class="action-btn btn-danger" onclick="deleteSauce(${sauce.id})">🗑️ מחק</button>
            </div>
        </div>
    `).join('');
}

function renderAdminCustomers() {
    const customersList = document.getElementById('customersList');
    if (!customersList) return;

    if (customers.length === 0) {
        customersList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">👥</div>
                <div class="empty-state-text">אין לקוחות רשומים</div>
                <div class="empty-state-subtext">לקוחות חדשים יופיעו כאן אוטומטיקית</div>
            </div>
        `;
        return;
    }

    customersList.innerHTML = customers.map(customer => `
        <div class="customer-card">
            <div class="customer-header">
                <div class="customer-avatar">${customer.name.charAt(0)}</div>
                <div>
                    <h4 style="color: var(--gold-primary); margin: 0;">${customer.name}</h4>
                    <div style="font-size: 0.8rem; color: var(--cream-light);">📞 ${customer.phone}</div>
                </div>
            </div>
            <div style="margin: 0.5rem 0; font-size: 0.8rem; color: var(--cream-light);">
                🏠 ${customer.address || 'לא הוזנה'}
            </div>
            <div style="margin: 0.5rem 0; font-size: 0.8rem; color: var(--cream-light);">
                📅 הצטרף: ${formatDate(customer.joinDate)}
            </div>
            <div class="customer-stats">
                <div style="text-align: center;">
                    <div style="font-weight: bold; color: var(--gold-primary);">${customer.totalOrders || 0}</div>
                    <div>הזמנות</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-weight: bold; color: var(--gold-secondary);">₪${customer.totalSpent || 0}</div>
                    <div>רכישות</div>
                </div>
            </div>
            <div style="margin-top: 0.5rem;">
                <button class="action-btn btn-info" onclick="showCustomerHistory('${customer.phone}')" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;">
                    📋 היסטוריה
                </button>
            </div>
        </div>
    `).join('');
}

function renderMenuEditor() {
    renderMeatOptionsList();
    renderEditorSaucesList();
    renderGlobalAddOnsList();
}

function renderMeatOptionsList() {
    const list = document.getElementById('meatOptionsList');
    if (!list) return;
    
    list.innerHTML = meatOptions.map((meat, index) => `
        <div class="editor-item">
            <span class="editor-item-name">${meat}</span>
            <div class="editor-item-actions">
                <button class="editor-btn danger" onclick="removeMeatOption(${index})">🗑️</button>
            </div>
        </div>
    `).join('');
}

function renderEditorSaucesList() {
    const list = document.getElementById('editorSaucesList');
    if (!list) return;
    
    list.innerHTML = sauces.map(sauce => `
        <div class="editor-item">
            <span class="editor-item-name">${sauce.name}</span>
            <div class="editor-item-actions">
                <button class="editor-btn ${sauce.available ? 'danger' : ''}" onclick="toggleSauceAvailability(${sauce.id})">
                    ${sauce.available ? '🔒' : '🔓'}
                </button>
                <button class="editor-btn danger" onclick="deleteSauce(${sauce.id})">🗑️</button>
            </div>
        </div>
    `).join('');
}

function renderGlobalAddOnsList() {
    const list = document.getElementById('globalAddOnsList');
    if (!list) return;
    
    list.innerHTML = globalAddOns.map((addon, index) => `
        <div class="editor-item">
            <span class="editor-item-name">${addon.name} - ₪${addon.price}</span>
            <div class="editor-item-actions">
                <button class="editor-btn danger" onclick="removeGlobalAddOn(${index})">🗑️</button>
            </div>
        </div>
    `).join('');
}

// Customer History
function showCustomerHistory(customerPhone) {
    const customer = customers.find(c => c.phone === customerPhone);
    if (!customer) return;

    const customerOrders = orders.filter(order => order.customerPhone === customerPhone)
        .sort((a, b) => new Date(b.time) - new Date(a.time));

    document.getElementById('historyCustomerName').textContent = `היסטוריית הזמנות - ${customer.name}`;
    
    const historyList = document.getElementById('customerHistoryList');
    
    if (customerOrders.length === 0) {
        historyList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <div class="empty-state-text">אין הזמנות עדיין</div>
            </div>
        `;
    } else {
        historyList.innerHTML = customerOrders.map(order => `
            <div class="history-item">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <strong style="color: var(--gold-primary);">הזמנה #${order.id}</strong>
                    <span class="order-status status-${order.status}">${getStatusText(order.status)}</span>
                </div>
                <div style="margin-bottom: 0.5rem; font-size: 0.9rem; color: var(--cream-light);">
                    🕒 ${formatDateTime(order.time)}
                </div>
                <div style="margin-bottom: 0.5rem;">
                    ${order.items.map(item => `
                        <div style="display: flex; justify-content: space-between; font-size: 0.9rem;">
                            <div>
                                <span>${item.name}</span>
                                ${item.selectedMeat ? `<br><small style="color: var(--gold-light);">🥩 ${item.selectedMeat}</small>` : ''}
                                ${item.addOns && item.addOns.length > 0 ? `<br><small style="color: var(--cream-light);">+ ${item.addOns.map(a => a.name).join(', ')}</small>` : ''}
                                ${item.sauces && item.sauces.length > 0 ? `<br><small style="color: var(--gold-light);">🍯 ${item.sauces.join(', ')}</small>` : ''}
                            </div>
                            <span>×${item.quantity} = ₪${item.totalPrice * item.quantity}</span>
                        </div>
                    `).join('')}
                </div>
                <div style="text-align: left; font-weight: bold; color: var(--gold-primary);">
                    סה"כ: ₪${order.total}
                </div>
                ${order.notes ? `<div style="margin-top: 0.5rem; font-style: italic; font-size: 0.8rem;">💬 ${order.notes}</div>` : ''}
            </div>
        `).join('');
    }

    document.getElementById('customerHistoryModal').classList.add('show');
    document.getElementById('customerHistoryModal').style.display = 'flex';
}

function closeCustomerHistory() {
    document.getElementById('customerHistoryModal').classList.remove('show');
    setTimeout(() => {
        document.getElementById('customerHistoryModal').style.display = 'none';
    }, 300);
}

// Settings Functions  
function updateBackground(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageUrl = e.target.result;
            document.getElementById('dynamicBackground').style.backgroundImage = `url(${imageUrl})`;
            localStorage.setItem('hazya_background', imageUrl);
            showNotification('רקע האתר עודכן!', 'success');
        };
        reader.readAsDataURL(file);
    }
}

function resetBackground() {
    document.getElementById('dynamicBackground').style.backgroundImage = '';
    localStorage.removeItem('hazya_background');
    showNotification('רקע האתר אופס!', 'info');
}

function updateLogo(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageUrl = e.target.result;
            document.getElementById('logoImage').src = imageUrl;
            localStorage.setItem('hazya_logo', imageUrl);
            showNotification('לוגו עודכן!', 'success');
        };
        reader.readAsDataURL(file);
    }
}

function resetLogo() {
    const defaultLogo = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%23DAAB2D'/%3E%3Ctext x='50' y='60' text-anchor='middle' font-size='30' fill='%23020B13'%3E🍽️%3C/text%3E%3C/svg%3E";
    document.getElementById('logoImage').src = defaultLogo;
    localStorage.removeItem('hazya_logo');
    showNotification('לוגו אופס!', 'info');
}

function updateRestaurantName() {
    const newName = document.getElementById('restaurantName').value;
    document.querySelector('.logo span').textContent = newName;
    document.querySelector('.hero h1').textContent = newName;
    localStorage.setItem('hazya_restaurant_name', newName);
    showNotification('שם המסעדה עודכן!', 'success');
}

function updateRestaurantDescription() {
    const newDescription = document.getElementById('restaurantDescription').value;
    document.querySelector('.hero p').textContent = newDescription;
    localStorage.setItem('hazya_restaurant_description', newDescription);
    showNotification('תיאור המסעדה עודכן!', 'success');
}

function updateNextOrderNumber() {
    const newNumber = parseInt(document.getElementById('nextOrderNumber').value);
    if (newNumber > 0) {
        nextOrderNumber = newNumber;
        saveData();
        showNotification('מספר הזמנה הבא עודכן!', 'success');
    }
}

// Stub functions for compatibility - implement as needed
function toggleCategoryStatus(categoryId) { showNotification('פונקציה בפיתוח', 'info'); }
function editCategory(categoryId) { showNotification('פונקציה בפיתוח', 'info'); }
function changeCategoryIcon(categoryId) { showNotification('פונקציה בפיתוח', 'info'); }
function deleteCategory(categoryId) { showNotification('פונקציה בפיתוח', 'info'); }
function showAddCategoryForm() { showNotification('פונקציה בפיתוח', 'info'); }
function toggleSauceAvailability(sauceId) { showNotification('פונקציה בפיתוח', 'info'); }
function editSauce(sauceId) { showNotification('פונקציה בפיתוח', 'info'); }
function deleteSauce(sauceId) { showNotification('פונקציה בפיתוח', 'info'); }
function showAddSauceForm() { showNotification('פונקציה בפיתוח', 'info'); }
function editItem(itemId) { showNotification('פונקציה בפיתוח', 'info'); }
function deleteItem(itemId) { showNotification('פונקציה בפיתוח', 'info'); }
function showAddItemForm() { showNotification('פונקציה בפיתוח', 'info'); }
function addMeatOption() { showNotification('פונקציה בפיתוח', 'info'); }
function removeMeatOption(index) { showNotification('פונקציה בפיתוח', 'info'); }
function addSauceFromEditor() { showNotification('פונקציה בפיתוח', 'info'); }
function addGlobalAddOn() { showNotification('פונקציה בפיתוח', 'info'); }
function removeGlobalAddOn(index) { showNotification('פונקציה בפיתוח', 'info'); }
function exportMenuData() { showNotification('פונקציה בפיתוח', 'info'); }
function importMenuData(event) { showNotification('פונקציה בפיתוח', 'info'); }
function resetMenuToDefault() { showNotification('פונקציה בפיתוח', 'info'); }

// End of script// מסעדת הזיה - קובץ JavaScript מלא וחדש

// Global Variables
let menuItems = [
    {
        id: 1,
        name: "טוסט הזיה",
        description: "טוסט נקניק קראנצ' עם בחירת בשרים איכותיים ורטבים מיוחדים",
        price: 45,
        category: "טוסטים",
        available: true,
        image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%23DAAB2D'/%3E%3Ctext x='50' y='60' text-anchor='middle' font-size='30' fill='%23020B13'%3E🥪%3C/text%3E%3C/svg%3E",
        notes: "בסיס: טוסט נקניק קראנצ'",
        meatOptions: ["רוסטביף מפולפל", "אווז", "צלי בקר"],
        addOns: [
            { name: "נקניק נוסף", price: 8 },
            { name: "גבינה צהובה", price: 6 },
            { name: "ביצה", price: 5 }
        ]
    },
    {
        id: 2,
        name: "מאנצ' (ללא מתחרים)",
        description: "שילוב מושלם של מתוק, חריף, שמן ואהבה - טורף קרייבים אמיתי",
        price: 58,
        category: "מנות מיוחדות",
        available: true,
        image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%23B16C04'/%3E%3Ctext x='50' y='60' text-anchor='middle' font-size='30' fill='%23FEFEFE'%3E🔥%3C/text%3E%3C/svg%3E",
        notes: "המנה החריפה והטעימה ביותר שלנו!",
        meatOptions: ["כתף", "אווז", "רוסטביף מפולפל", "חזה עוף בדבש", "טראיקי", "פסטרמה שחורה"],
        addOns: [
            { name: "תיבול נוסף", price: 5 },
            { name: "שום קונפי", price: 8 },
            { name: "פלפל חריף", price: 4 }
        ]
    },
    {
        id: 3,
        name: "ליידי הזיה",
        description: "מנה עדינה ונסיכית עם טוויסט נשי מתובל - לחובבות הטעם המעודן",
        price: 52,
        category: "מנות מיוחדות",
        available: true,
        image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%23f39c12'/%3E%3Ctext x='50' y='60' text-anchor='middle' font-size='30' fill='%23FEFEFE'%3E👸%3C/text%3E%3C/svg%3E",
        notes: "מנה עדינה ומתובלת במיוחד",
        meatOptions: ["חזה עוף מפולפל", "חזה עוף מעושן", "פסטרמה כפול", "נגיעות בקר"],
        addOns: [
            { name: "חרדל דבש נוסף", price: 4 },
            { name: "ליידי סאוס כפרית", price: 6 },
            { name: "עשבי תיבול", price: 5 }
        ]
    },
    {
        id: 4,
        name: "גזרה בהזיה",
        description: "מנה עשירה בחלבון, דלת שומן, מלאה בטעם - עד 40 גרם חלבון!",
        price: 48,
        category: "מנות דיאט",
        available: true,
        image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%2327ae60'/%3E%3Ctext x='50' y='60' text-anchor='middle' font-size='30' fill='%23FEFEFE'%3E💪%3C/text%3E%3C/svg%3E",
        notes: "עד 40 גרם חלבון! מושלם לחובבי הכושר",
        meatOptions: ["הודו מפולפל (3%)", "בקר (3%)", "פסטרמה טלה רזה"],
        addOns: [
            { name: "סילאן", price: 3 },
            { name: "חלבון נוסף", price: 12 },
            { name: "ירקות נוספים", price: 8 }
        ]
    },
    {
        id: 5,
        name: "פסטרמה כפרית",
        description: "פסטרמה ביתית מתובלת בסגנון כפרי מסורתי",
        price: 42,
        category: "פסטרמות",
        available: true,
        image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%236f4e37'/%3E%3Ctext x='50' y='60' text-anchor='middle' font-size='30' fill='%23FEFEFE'%3E🥩%3C/text%3E%3C/svg%3E",
        notes: "פסטרמה ביתית אותנטית",
        meatOptions: ["פסטרמה כפרית"],
        addOns: [
            { name: "חמוצים", price: 4 },
            { name: "בצל מקורמל", price: 6 },
            { name: "פלפל קלוי", price: 5 }
        ]
    },
    {
        id: 6,
        name: "פסטרמה בדבש",
        description: "פסטרמה מתוקה ועסיסית עם דבש טבעי",
        price: 45,
        category: "פסטרמות",
        available: true,
        image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%23f1c40f'/%3E%3Ctext x='50' y='60' text-anchor='middle' font-size='30' fill='%23020B13'%3E🍯%3C/text%3E%3C/svg%3E",
        notes: "מתוקה וטעימה עם דבש אמיתי",
        meatOptions: ["פסטרמה בדבש"],
        addOns: [
            { name: "דבש נוסף", price: 4 },
            { name: "זיתים", price: 5 },
            { name: "עגבנייה", price: 3 }
        ]
    },
    {
        id: 7,
        name: "פסטרמה שחורה",
        description: "פסטרמה מעושנת בסגנון מיוחד עם תיבול כהה",
        price: 48,
        category: "פסטרמות",
        available: true,
        image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%232c3e50'/%3E%3Ctext x='50' y='60' text-anchor='middle' font-size='30' fill='%23FEFEFE'%3E⚫%3C/text%3E%3C/svg%3E",
        notes: "מעושנת בסגנון מיוחד",
        meatOptions: ["פסטרמה שחורה"],
        addOns: [
            { name: "תיבול שחור נוסף", price: 5 },
            { name: "צלפים", price: 4 },
            { name: "כרוב סגול", price: 6 }
        ]
    },
    {
        id: 8,
        name: "מנה אישית - בנה בעצמך",
        description: "הרכב בעצמך את מנת ההזיה שלך: בחר בסיס, בשר, רטבים, תבלינים ותוספות",
        price: 35,
        category: "מנות אישיות",
        available: true,
        image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%23e74c3c'/%3E%3Ctext x='50' y='60' text-anchor='middle' font-size='30' fill='%23FEFEFE'%3E🎯%3C/text%3E%3C/svg%3E",
        notes: "תן לדמיון להשתולל - בנה את המנה המושלמת שלך!",
        meatOptions: ["הודו מפולפל", "חזה עוף מפולפל", "חזה עוף מעושן", "חזה עוף בדבש", "צלי בקר", "רוסטביף מפולפל", "בקר 3%", "טראיקי", "פסטרמה כפרית", "פסטרמה בדבש", "פסטרמה שחורה", "פסטרמה כפול"],
        addOns: [
            { name: "בצל מקורמל", price: 6 },
            { name: "פלפל קלוי", price: 5 },
            { name: "זיתים", price: 4 },
            { name: "גזר ביתי", price: 5 },
            { name: "פלפל חריף", price: 3 },
            { name: "צלפים", price: 4 },
            { name: "עגבנייה", price: 3 },
            { name: "פטריות מוקפצות", price: 8 },
            { name: "כרוב סגול", price: 5 },
            { name: "חציל קלוי", price: 6 },
            { name: "חסה", price: 3 },
            { name: "חמוצים", price: 4 },
            { name: "צ'יפס", price: 10 },
            { name: "טבעות בצל", price: 12 },
            { name: "גלגולי פירה", price: 10 },
            { name: "שניצלונים", price: 15 },
            { name: "שום קונפי", price: 8 },
            { name: "ביצה", price: 5 }
        ]
    }
];

let categories = [
    {
        id: 1,
        name: "טוסטים",
        icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%23DAAB2D'/%3E%3Ctext x='50' y='60' text-anchor='middle' font-size='30' fill='%23020B13'%3E🥪%3C/text%3E%3C/svg%3E",
        active: true
    },
    {
        id: 2,
        name: "מנות מיוחדות",
        icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%23B16C04'/%3E%3Ctext x='50' y='60' text-anchor='middle' font-size='30' fill='%23FEFEFE'%3E⭐%3C/text%3E%3C/svg%3E",
        active: true
    },
    {
        id: 3,
        name: "מנות דיאט",
        icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%2327ae60'/%3E%3Ctext x='50' y='60' text-anchor='middle' font-size='30' fill='%23FEFEFE'%3E💪%3C/text%3E%3C/svg%3E",
        active: true
    },
    {
        id: 4,
        name: "פסטרמות",
        icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%236f4e37'/%3E%3Ctext x='50' y='60' text-anchor='middle' font-size='30' fill='%23FEFEFE'%3E🥩%3C/text%3E%3C/svg%3E",
        active: true
    },
    {
        id: 5,
        name: "מנות אישיות",
        icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%23e74c3c'/%3E%3Ctext x='50' y='60' text-anchor='middle' font-size='30' fill='%23FEFEFE'%3E🎯%3C/text%3E%3C/svg%3E",
        active: true
    }
];

let sauces = [
    { id: 1, name: "מיונז שום", description: "מיונז עם שום טרי וחריף", available: true },
    { id: 2, name: "צ'ילי מתוק", description: "רטב צ'ילי מתוק תאילנדי", available: true },
    { id: 3, name: "צ'ילי חריף", description: "רטב צ'ילי חריף אש", available: true },
    { id: 4, name: "צ'ימיצ'ורי", description: "רטב ארגנטינאי ירוק עם עשבי תיבול", available: true },
    { id: 5, name: "רוטב ההזיה", description: "הרוטב המיוחד של הבית - מתכון סודי!", available: true },
    { id: 6, name: "מנצ'ונז", description: "שילוב מיונז וחרדל במתכון מיוחד", available: true },
    { id: 7, name: "פסטו", description: "רוטב איטלקי ירוק עם בזיליקום", available: true },
    { id: 8, name: "סילאן", description: "סילאן טבעי מתוק", available: true },
    { id: 9, name: "חרדל דבש", description: "חרדל מתוק עם דבש טבעי", available: true },
    { id: 10, name: "רוטב הקסמים", description: "רוטב מיוחד עם מגע קסום", available: true },
    { id: 11, name: "ליידי סאוס כפרית", description: "רוטב עדין בסגנון כפרי", available: true },
    { id: 12, name: "חרדל דיז'ון", description: "חרדל צרפתי איכותי", available: true },
    { id: 13, name: "מטבוחה חריפה", description: "מטבוחה ביתית חריפה", available: true },
    { id: 14, name: "סלסת עגבניות", description: "סלסת עגבניות עם נענע וצ'ילי", available: true }
];

let meatOptions = [
    "הודו מפולפל", "חזה עוף מפולפל", "חזה עוף מעושן", "חזה עוף בדבש",
    "צלי בקר", "רוסטביף מפולפל", "בקר 3%", "אווז", "כתף", "טראיקי",
    "פסטרמה כפרית", "פסטרמה בדבש", "פסטרמה בדבש וחרדל", "פסטרמה בדבש חרדל ושום",
    "פסטרמה שחורה", "פסטרמה כפול", "פסטרמה טלה רזה", "נגיעות בקר"
];

let globalAddOns = [
    { name: "בצל מקורמל", price: 6 }, { name: "פלפל קלוי", price: 5 },
    { name: "זיתים", price: 4 }, { name: "גזר ביתי", price: 5 },
    { name: "פלפל חריף", price: 3 }, { name: "צלפים", price: 4 },
    { name: "עגבנייה", price: 3 }, { name: "בצל חי", price: 2 },
    { name: "ירק טרי", price: 4 }, { name: "פטריות מוקפצות ביין אדום ושום", price: 8 },
    { name: "כרוב סגול", price: 5 }, { name: "חציל קלוי", price: 6 },
    { name: "חסה", price: 3 }, { name: "חמוצים", price: 4 },
    { name: "צ'יפס", price: 10 }, { name: "טבעות בצל", price: 12 },
    { name: "גלגולי פירה", price: 10 }, { name: "נקניק", price: 8 },
    { name: "שניצלונים", price: 15 }, { name: "שום קונפי", price: 8 }, { name: "ביצה", price: 5 }
];

let cart = [];
let orders = [];
let customers = [];
let currentFilter = 'all';
let isAdminLoggedIn = false;
let nextOrderNumber = 1001;

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    console.log('🍽️ מאתחל מסעדת הזיה...');
    loadData();
    renderMenu();
    renderCategories();
    updateCartDisplay();
    generateSampleOrders();
    loadSettings();
    console.log('✅ האפליקציה אותחלה בהצלחה');
});

// Data Management
function loadData() {
    try {
        const savedCart = localStorage.getItem('hazya_cart');
        if (savedCart) cart = JSON.parse(savedCart);

        const savedOrders = localStorage.getItem('hazya_orders');
        if (savedOrders) {
            orders = JSON.parse(savedOrders);
            orders.forEach(order => {
                if (typeof order.time === 'string') {
                    order.time = new Date(order.time);
                }
            });
        }

        const savedCustomers = localStorage.getItem('hazya_customers');
        if (savedCustomers) customers = JSON.parse(savedCustomers);

        const savedMenuItems = localStorage.getItem('hazya_menu');
        if (savedMenuItems) menuItems = JSON.parse(savedMenuItems);

        const savedCategories = localStorage.getItem('hazya_categories');
        if (savedCategories) categories = JSON.parse(savedCategories);

        const savedSauces = localStorage.getItem('hazya_sauces');
        if (savedSauces) sauces = JSON.parse(savedSauces);

        const savedMeatOptions = localStorage.getItem('hazya_meat_options');
        if (savedMeatOptions) meatOptions = JSON.parse(savedMeatOptions);

        const savedGlobalAddOns = localStorage.getItem('hazya_global_addons');
        if (savedGlobalAddOns) globalAddOns = JSON.parse(savedGlobalAddOns);

        const savedNextOrderNumber = localStorage.getItem('hazya_next_order');
        if (savedNextOrderNumber) nextOrderNumber = parseInt(savedNextOrderNumber);
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

function saveData() {
    try {
        localStorage.setItem('hazya_cart', JSON.stringify(cart));
        localStorage.setItem('hazya_orders', JSON.stringify(orders));
        localStorage.setItem('hazya_customers', JSON.stringify(customers));
        localStorage.setItem('hazya_menu', JSON.stringify(menuItems));
        localStorage.setItem('hazya_categories', JSON.stringify(categories));
        localStorage.setItem('hazya_sauces', JSON.stringify(sauces));
        localStorage.setItem('hazya_meat_options', JSON.stringify(meatOptions));
        localStorage.setItem('hazya_global_addons', JSON.stringify(globalAddOns));
        localStorage.setItem('hazya_next_order', nextOrderNumber.toString());
    } catch (error) {
        console.error('Error saving data:', error);
    }
}

function loadSettings() {
    try {
        const savedBackground = localStorage.getItem('hazya_background');
        if (savedBackground) {
            document.getElementById('dynamicBackground').style.backgroundImage = `url(${savedBackground})`;
        }

        const savedLogo = localStorage.getItem('hazya_logo');
        if (savedLogo) {
            document.getElementById('logoImage').src = savedLogo;
        }

        const savedRestaurantName = localStorage.getItem('hazya_restaurant_name');
        if (savedRestaurantName) {
            document.querySelector('.logo span').textContent = savedRestaurantName;
            document.querySelector('.hero h1').textContent = savedRestaurantName;
            const nameInput = document.getElementById('restaurantName');
            if (nameInput) nameInput.value = savedRestaurantName;
        }

        const savedDescription = localStorage.getItem('hazya_restaurant_description');
        if (savedDescription) {
            document.querySelector('.hero p').textContent = savedDescription;
            const descInput = document.getElementById('restaurantDescription');
            if (descInput) descInput.value = savedDescription;
        }

        const orderNumberInput = document.getElementById('nextOrderNumber');
        if (orderNumberInput) orderNumberInput.value = nextOrderNumber;
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

// Navigation Functions
function showHome() {
    document.getElementById('customerApp').style.display = 'block';
    document.getElementById('adminLogin').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'none';
    isAdminLoggedIn = false;
}

function scrollToMenu() {
    document.getElementById('menuSection').scrollIntoView({ behavior: 'smooth' });
}

function showAdminLogin() {
    document.getElementById('customerApp').style.display = 'none';
    document.getElementById('adminLogin').style.display = 'block';
    document.getElementById('adminPanel').style.display = 'none';
}

// Admin Authentication
function handleAdminLogin(event) {
    event.preventDefault();
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;

    if (username === 'admin' && password === 'hazya2024') {
        isAdminLoggedIn = true;
        document.getElementById('customerApp').style.display = 'none';
        document.getElementById('adminLogin').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
        
        updateDashboard();
        renderAdminOrders();
        renderAdminMenu();
        renderAdminCategories();
        renderAdminSauces();
        renderAdminCustomers();
        renderMenuEditor();
        
        showNotification('התחברת בהצלחה לפאנל הניהול!', 'success');
    } else {
        showNotification('שם משתמש או סיסמה שגויים', 'error');
    }
    return false;
}

function quickAdminLogin() {
    isAdminLoggedIn = true;
    document.getElementById('customerApp').style.display = 'none';
    document.getElementById('adminLogin').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    
    updateDashboard();
    renderAdminOrders();
    renderAdminMenu();
    renderAdminCategories();  
    renderAdminSauces();
    renderAdminCustomers();
    renderMenuEditor();
    
    showNotification('התחברת בהצלחה לפאנל הניהול!', 'success');
}

function logoutAdmin() {
    if (confirm('האם אתה בטוח שברצונך להתנתק?')) {
        isAdminLoggedIn = false;
        showHome();
        showNotification('התנתקת מפאנל הניהול', 'warning');
    }
}

// Categories Functions
function renderCategories() {
    const menuCategories = document.getElementById('menuCategories');
    const activeCategories = categories.filter(cat => cat.active);

    menuCategories.innerHTML = `
        <button class="category-btn active" onclick="filterMenu('all')">הכל</button>
        ${activeCategories.map(category => `
            <button class="category-btn" onclick="filterMenu('${category.name}')">
                <img src="${category.icon}" alt="${category.name}" class="category-icon">
                ${category.name}
            </button>
        `).join('')}
    `;
}

// Menu Functions
function renderMenu() {
    const menuGrid = document.getElementById('menuGrid');
    const activeCategories = categories.filter(cat => cat.active).map(cat => cat.name);
    let filteredItems = menuItems.filter(item => activeCategories.includes(item.category));
    
    if (currentFilter !== 'all') {
        filteredItems = filteredItems.filter(item => item.category === currentFilter);
    }

    menuGrid.innerHTML = filteredItems.map(item => `
        <div class="menu-item">
            <div class="menu-item-header">
                <div>
                    <img src="${item.image}" alt="${item.name}" class="menu-item-image">
                    <h3>${item.name}</h3>
                    <div class="kosher-badge" style="font-size: 0.8rem; padding: 0.2rem 0.5rem;">כשר למהדרין</div>
                </div>
                <div class="menu-item-price">₪${item.price}</div>
            </div>
            <p>${item.description}</p>
            ${item.notes ? `<div class="menu-item-notes">💡 ${item.notes}</div>` : ''}
            
            ${item.meatOptions && item.meatOptions.length > 0 ? `
                <div class="meat-options-section">
                    <div class="meat-options-title">🥩 בחר בשר:</div>
                    <div class="meat-options-grid">
                        ${item.meatOptions.map((meat, index) => `
                            <div class="meat-option" onclick="selectMeat(this, '${meat}', ${item.id})">
                                <input type="radio" class="meat-radio" name="meat-${item.id}" value="${meat}" ${index === 0 ? 'checked' : ''} style="display: none;">
                                <div class="meat-name">${meat}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}

            ${item.addOns && item.addOns.length > 0 ? `
                <div class="add-ons-section">
                    <div class="add-ons-title">תוספות אפשריות:</div>
                    ${item.addOns.map((addon, index)