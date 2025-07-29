// js/user-interface.js - ניהול ממשק המשתמש הראשי

/**
 * מחלקה לניהול ממשק המשתמש
 */
class UserInterface {
    constructor() {
        this.currentCategory = null;
        this.mobileMenuOpen = false;
        this.init();
    }

    /**
     * אתחול ממשק המשתמש
     */
    init() {
        this.setupMobileMenu();
        this.setupSmoothScrolling();
        this.setupScrollEffects();
        this.loadMenuUI();
        this.bindEvents();
    }

    /**
     * הגדרת תפריט מובייל
     */
    setupMobileMenu() {
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        const navLinks = document.querySelector('.nav-links');

        if (mobileToggle && navLinks) {
            mobileToggle.addEventListener('click', () => {
                this.toggleMobileMenu();
            });

            // סגירה בלחיצה על קישור
            navLinks.addEventListener('click', (e) => {
                if (e.target.tagName === 'A') {
                    this.closeMobileMenu();
                }
            });
        }
    }

    /**
     * החלפת מצב תפריט מובייל
     */
    toggleMobileMenu() {
        const navLinks = document.querySelector('.nav-links');
        const mobileToggle = document.querySelector('.mobile-menu-toggle');

        if (navLinks && mobileToggle) {
            this.mobileMenuOpen = !this.mobileMenuOpen;
            
            if (this.mobileMenuOpen) {
                navLinks.classList.add('mobile-open');
                mobileToggle.innerHTML = '✕';
                document.body.style.overflow = 'hidden';
            } else {
                navLinks.classList.remove('mobile-open');
                mobileToggle.innerHTML = '☰';
                document.body.style.overflow = '';
            }
        }
    }

    /**
     * סגירת תפריט מובייל
     */
    closeMobileMenu() {
        if (this.mobileMenuOpen) {
            this.toggleMobileMenu();
        }
    }

    /**
     * הגדרת גלילה חלקה
     */
    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                
                if (target) {
                    const headerHeight = document.querySelector('header')?.offsetHeight || 80;
                    const targetPosition = target.offsetTop - headerHeight;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });

                    // עדכן URL
                    history.pushState(null, null, anchor.getAttribute('href'));
                }
            });
        });
    }

    /**
     * הגדרת אפקטי גלילה
     */
    setupScrollEffects() {
        const header = document.querySelector('header');
        let lastScrollY = window.scrollY;

        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;

            // הסתרה/הצגה של הכותרת
            if (header) {
                if (currentScrollY > lastScrollY && currentScrollY > 100) {
                    header.style.transform = 'translateY(-100%)';
                } else {
                    header.style.transform = 'translateY(0)';
                }
            }

            // עדכן עמעום רקע הכותרת
            if (header) {
                const opacity = Math.min(currentScrollY / 200, 0.95);
                header.style.backgroundColor = `rgba(0, 0, 0, ${opacity})`;
            }

            lastScrollY = currentScrollY;
        });

        // הדגשת קישור פעיל בניווט
        this.updateActiveNavLink();
        window.addEventListener('scroll', () => this.updateActiveNavLink());
    }

    /**
     * עדכון קישור פעיל בניווט
     */
    updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
        
        let currentSection = '';
        const scrollPosition = window.scrollY + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }

    /**
     * טעינת ממשק התפריט
     */
    loadMenuUI() {
        this.renderMenuCategories();
        this.renderMenuItems();
    }

    /**
     * רינדור קטגוריות התפריט
     */
    renderMenuCategories() {
        const container = document.getElementById('menuCategoriesContainer');
        if (!container) return;

        const categories = menuData.getCategories();
        
        if (categories.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🍽️</div>
                    <p>אין קטגוריות זמינות</p>
                </div>
            `;
            return;
        }

        const categoriesHTML = categories.map(category => `
            <button class="category-btn ${this.currentCategory === category.id ? 'active' : ''}" 
                    onclick="ui.selectCategory('${category.id}')">
                <span class="category-icon">${category.icon}</span>
                <span class="category-name">${category.name}</span>
                <span class="category-description">${category.description}</span>
            </button>
        `).join('');

        container.innerHTML = categoriesHTML;

        // בחר קטגוריה ראשונה אם אין בחירה
        if (!this.currentCategory && categories.length > 0) {
            this.selectCategory(categories[0].id);
        }
    }

    /**
     * בחירת קטגוריה
     */
    selectCategory(categoryId) {
        this.currentCategory = categoryId;
        this.renderMenuCategories(); // עדכן כפתורים
        this.renderMenuItems(); // עדכן פריטים
    }

    /**
     * רינדור פריטי התפריט
     */
    renderMenuItems() {
        const container = document.getElementById('menuItemsContainer');
        if (!container) return;

        const categories = menuData.getCategories();
        
        // יצירת קונטיינר לכל קטגוריה
        const sectionsHTML = categories.map(category => {
            const items = menuData.getItemsByCategory(category.id);
            const isVisible = !this.currentCategory || this.currentCategory === category.id;
            
            return `
                <div class="menu-category-section ${isVisible ? 'active' : ''}" 
                     data-category="${category.id}" 
                     id="category-${category.id}">
                    <h3 class="category-title">
                        <span class="category-icon">${category.icon}</span>
                        ${category.name}
                    </h3>
                    <div class="menu-items-grid">
                        ${this.renderCategoryItems(items, category.id)}
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = sectionsHTML;
    }

    /**
     * רינדור פריטים של קטגוריה
     */
    renderCategoryItems(items, categoryId) {
        if (items.length === 0) {
            return `
                <div class="no-items-message">
                    <div style="font-size: 2rem; margin-bottom: 1rem;">🍽️</div>
                    <p>אין פריטים זמינים בקטגוריה זו</p>
                </div>
            `;
        }

        return items.map(item => this.renderMenuItem(item, categoryId)).join('');
    }

    /**
     * רינדור פריט תפריט
     */
    renderMenuItem(item, categoryId) {
        const isAvailable = item.available !== false;
        
        return `
            <div class="menu-item ${!isAvailable ? 'unavailable' : ''}" data-item-id="${item.id}">
                <div class="menu-item-image">
                    ${item.image ? 
                        `<img src="${item.image}" alt="${item.name}" loading="lazy">` : 
                        `<div class="menu-item-placeholder">
                            <span style="font-size: 2rem;">🍽️</span>
                        </div>`
                    }
                    ${!isAvailable ? '<div class="unavailable-overlay">לא זמין</div>' : ''}
                </div>
                
                <div class="menu-item-content">
                    <h4 class="menu-item-name">${item.name}</h4>
                    ${item.description ? `<p class="menu-item-description">${item.description}</p>` : ''}
                    
                    <div class="menu-item-footer">
                        <span class="menu-item-price">${formatPrice(item.price)}</span>
                        
                        ${isAvailable ? `
                            <button class="add-to-cart-btn" onclick="addToCart('${categoryId}', '${item.id}')">
                                <span class="btn-icon">🛒</span>
                                <span class="btn-text">הוסף לסל</span>
                            </button>
                        ` : `
                            <button class="add-to-cart-btn" disabled>
                                <span class="btn-icon">❌</span>
                                <span class="btn-text">לא זמין</span>
                            </button>
                        `}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * חיפוש פריטים
     */
    searchItems(query) {
        if (!query || query.trim().length < 2) {
            this.loadMenuUI();
            return;
        }

        const results = menuData.searchItems(query);
        const container = document.getElementById('menuItemsContainer');
        
        if (results.length === 0) {
            container.innerHTML = `
                <div class="search-no-results">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
                    <h3>לא נמצאו תוצאות</h3>
                    <p>נסה לחפש במילים אחרות</p>
                </div>
            `;
            return;
        }

        const resultsHTML = `
            <div class="search-results">
                <h3 class="search-results-title">תוצאות חיפוש עבור "${query}" (${results.length} פריטים)</h3>
                <div class="menu-items-grid">
                    ${results.map(item => this.renderMenuItem(item, item.categoryId)).join('')}
                </div>
            </div>
        `;

        container.innerHTML = resultsHTML;
    }

    /**
     * קישור אירועים
     */
    bindEvents() {
        // חיפוש בזמן אמת
        const searchInput = document.getElementById('menuSearch');
        if (searchInput) {
            searchInput.addEventListener('input', debounce((e) => {
                this.searchItems(e.target.value);
            }, 300));
        }

        // סגירת תפריט מובייל בשינוי גודל מסך
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && this.mobileMenuOpen) {
                this.closeMobileMenu();
            }
        });

        // עדכון ממשק כאשר התפריט משתנה
        document.addEventListener('menuUpdated', () => {
            this.loadMenuUI();
        });
    }

    /**
     * עדכון ממשק לאחר שינוי בתפריט
     */
    refreshMenu() {
        this.loadMenuUI();
    }

    /**
     * הצגת מסך טעינה
     */
    showLoading(message = 'טוען...') {
        const loadingHTML = `
            <div id="loading-overlay" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                color: white;
            ">
                <div class="spinner" style="margin-bottom: 1rem;"></div>
                <div style="font-size: 1.2rem; font-weight: 600;">${message}</div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', loadingHTML);
    }

    /**
     * הסרת מסך טעינה
     */
    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.remove();
        }
    }
}

// יצירת מופע יחיד
const ui = new UserInterface();

// הוספת CSS לממשק המשתמש
const uiStyles = document.createElement('style');
uiStyles.textContent = `
    /* תפריט מובייל */
    .mobile-menu-toggle {
        display: none;
        background: none;
        border: none;
        color: var(--text-primary);
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0.5rem;
    }

    @media (max-width: 768px) {
        .mobile-menu-toggle {
            display: block;
        }

        .nav-links {
            position: fixed;
            top: 80px;
            right: -100%;
            width: 100%;
            height: calc(100vh - 80px);
            background: var(--glass-bg);
            backdrop-filter: blur(20px);
            border-left: 1px solid var(--glass-border);
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
            padding-top: 2rem;
            gap: 2rem;
            transition: right 0.3s ease;
            z-index: 999;
        }

        .nav-links.mobile-open {
            right: 0;
        }

        .nav-links li {
            width: 90%;
            text-align: center;
        }

        .nav-links a {
            display: block;
            padding: 1rem;
            width: 100%;
            border-radius: var(--border-radius);
            background: var(--glass-bg);
            border: 1px solid var(--glass-border);
        }
    }

    /* כותרת עם אפקטי גלילה */
    header {
        transition: transform 0.3s ease, background-color 0.3s ease;
        background-color: rgba(0, 0, 0, 0.1);
    }

    .nav-links a.active {
        color: var(--primary-gold);
        background: rgba(218, 165, 32, 0.1);
    }

    /* קטגוריות תפריט */
    .menu-categories {
        display: flex;
        gap: 1rem;
        margin-bottom: 2rem;
        flex-wrap: wrap;
        justify-content: center;
    }

    .category-btn {
        background: var(--glass-bg);
        border: 1px solid var(--glass-border);
        border-radius: var(--border-radius);
        padding: 1rem 1.5rem;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        min-width: 120px;
        text-align: center;
    }

    .category-btn:hover {
        background: rgba(218, 165, 32, 0.1);
        border-color: var(--primary-gold);
        transform: translateY(-2px);
    }

    .category-btn.active {
        background: var(--primary-gold);
        color: black;
        border-color: var(--primary-gold);
        box-shadow: 0 5px 15px rgba(218, 165, 32, 0.3);
    }

    .category-icon {
        font-size: 2rem;
        margin-bottom: 0.25rem;
    }

    .category-name {
        font-weight: 700;
        font-size: 1rem;
    }

    .category-description {
        font-size: 0.8rem;
        opacity: 0.8;
        line-height: 1.2;
    }

    /* קטגוריות תפריט - רספונסיבי */
    @media (max-width: 768px) {
        .category-btn {
            min-width: 100px;
            padding: 0.75rem 1rem;
        }

        .category-icon {
            font-size: 1.5rem;
        }

        .category-name {
            font-size: 0.9rem;
        }

        .category-description {
            font-size: 0.7rem;
        }
    }

    /* חלקי תפריט */
    .menu-category-section {
        display: none;
        margin-bottom: 2rem;
    }

    .menu-category-section.active {
        display: block;
        animation: fadeInUp 0.3s ease;
    }

    .category-title {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1.5rem;
        color: var(--primary-gold);
        font-weight: 700;
        font-size: 1.5rem;
    }

    .category-title .category-icon {
        font-size: 2rem;
    }

    /* רשת פריטי תפריט */
    .menu-items-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1.5rem;
    }

    @media (max-width: 768px) {
        .menu-items-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
        }
    }

    /* פריט תפריט */
    .menu-item {
        background: var(--glass-bg);
        border: 1px solid var(--glass-border);
        border-radius: var(--border-radius-lg);
        overflow: hidden;
        transition: all 0.3s ease;
        position: relative;
    }

    .menu-item:hover {
        transform: translateY(-5px);
        box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
        border-color: var(--primary-gold);
    }

    .menu-item.unavailable {
        opacity: 0.6;
        pointer-events: none;
    }

    .menu-item-image {
        position: relative;
        height: 200px;
        overflow: hidden;
    }

    .menu-item-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
    }

    .menu-item:hover .menu-item-image img {
        transform: scale(1.05);
    }

    .menu-item-placeholder {
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, var(--glass-bg), rgba(218, 165, 32, 0.1));
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-secondary);
    }

    .unavailable-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 700;
        font-size: 1.2rem;
    }

    .menu-item-content {
        padding: 1.5rem;
    }

    .menu-item-name {
        font-size: 1.2rem;
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: 0.5rem;
    }

    .menu-item-description {
        color: var(--text-secondary);
        line-height: 1.5;
        margin-bottom: 1rem;
        font-size: 0.9rem;
    }

    .menu-item-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
    }

    .menu-item-price {
        font-size: 1.3rem;
        font-weight: 700;
        color: var(--accent-green);
    }

    .add-to-cart-btn {
        background: var(--primary-gold);
        color: black;
        border: none;
        border-radius: var(--border-radius);
        padding: 0.75rem 1.5rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.9rem;
    }

    .add-to-cart-btn:hover:not(:disabled) {
        background: var(--primary-gold-hover);
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(218, 165, 32, 0.3);
    }

    .add-to-cart-btn:disabled {
        background: var(--text-secondary);
        cursor: not-allowed;
        opacity: 0.6;
    }

    .btn-icon {
        font-size: 1rem;
    }

    /* הודעות מיוחדות */
    .no-items-message {
        grid-column: 1 / -1;
        text-align: center;
        padding: 3rem;
        color: var(--text-secondary);
    }

    .search-no-results {
        text-align: center;
        padding: 3rem;
        color: var(--text-secondary);
    }

    .search-results-title {
        color: var(--primary-gold);
        margin-bottom: 1.5rem;
        text-align: center;
        font-weight: 700;
    }

    /* אנימציות */
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .fade-in-up {
        animation: fadeInUp 0.3s ease;
    }

    /* שדה חיפוש */
    .search-container {
        max-width: 400px;
        margin: 0 auto 2rem;
        position: relative;
    }

    .search-input {
        width: 100%;
        padding: 1rem 1rem 1rem 3rem;
        border: 1px solid var(--glass-border);
        border-radius: var(--border-radius-lg);
        background: var(--glass-bg);
        color: var(--text-primary);
        font-size: 1rem;
        transition: all 0.2s ease;
    }

    .search-input:focus {
        outline: none;
        border-color: var(--primary-gold);
        box-shadow: 0 0 0 2px rgba(218, 165, 32, 0.2);
    }

    .search-icon {
        position: absolute;
        right: 1rem;
        top: 50%;
        transform: translateY(-50%);
        color: var(--text-secondary);
        font-size: 1.2rem;
        pointer-events: none;
    }

    /* טעינה */
    .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid var(--glass-border);
        border-top: 4px solid var(--primary-gold);
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    /* הבהוב למעבר הודעות */
    .flash {
        animation: flash 0.5s ease-in-out;
    }

    @keyframes flash {
        0%, 100% { background-color: transparent; }
        50% { background-color: rgba(218, 165, 32, 0.2); }
    }

    /* מסך טעינה גלובלי */
    #loading-overlay {
        backdrop-filter: blur(5px);
    }

    /* התאמות נוספות למובייל */
    @media (max-width: 480px) {
        .menu-item-content {
            padding: 1rem;
        }

        .menu-item-name {
            font-size: 1.1rem;
        }

        .menu-item-price {
            font-size: 1.2rem;
        }

        .add-to-cart-btn {
            padding: 0.5rem 1rem;
            font-size: 0.8rem;
        }

        .category-btn {
            min-width: 80px;
            padding: 0.5rem;
        }

        .category-name {
            font-size: 0.8rem;
        }

        .category-description {
            font-size: 0.6rem;
        }
    }

    /* אפקטים מיוחדים */
    .menu-item::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 2px;
        background: linear-gradient(90deg, transparent, var(--primary-gold), transparent);
        transition: left 0.5s ease;
    }

    .menu-item:hover::before {
        left: 100%;
    }

    /* סגנון מיוחד לפריטים מובלטים */
    .menu-item.featured {
        border: 2px solid var(--primary-gold);
        box-shadow: 0 0 20px rgba(218, 165, 32, 0.2);
    }

    .menu-item.featured .menu-item-name::after {
        content: ' ⭐';
        color: var(--primary-gold);
    }

    /* התאמה למצב כהה/בהיר */
    @media (prefers-color-scheme: light) {
        .menu-item-placeholder {
            background: linear-gradient(135deg, #f8f9fa, rgba(218, 165, 32, 0.05));
        }
    }
`;

document.head.appendChild(uiStyles);

// הוספת שדה חיפוש אם לא קיים
document.addEventListener('DOMContentLoaded', () => {
    const menuSection = document.querySelector('.menu-section .container');
    if (menuSection && !document.getElementById('menuSearch')) {
        const searchHTML = `
            <div class="search-container">
                <div class="search-icon">🔍</div>
                <input type="text" id="menuSearch" class="search-input" placeholder="חפש במתכונים...">
            </div>
        `;

        const sectionTitle = menuSection.querySelector('.section-title');
        if (sectionTitle) {
            sectionTitle.insertAdjacentHTML('afterend', searchHTML);
        }
    }
});