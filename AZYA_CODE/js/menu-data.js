// js/menu-data.js - ניהול נתוני התפריט

// בדיקה שהמחלקה לא נוצרה כבר
if (typeof window.MenuDataManager === 'undefined') {

/**
 * מחלקה לניהול נתוני התפריט
 */
class MenuDataManager {
    constructor() {
        this.menu = null;
        this.currentCategory = 'burgers'; // קטגוריה נוכחית בפאנל הניהול
        this.init();
    }

    /**
     * אתחול נתוני התפריט
     */
    init() {
        this.loadMenu();

        // אם אין תפריט, צור ברירת מחדל
        if (!this.menu || !this.menu.categories || this.menu.categories.length === 0) {
            this.createDefaultMenu();
        }
    }

    /**
     * טעינת התפריט מהאחסון
     */
    loadMenu() {
        this.menu = DataManager.getMenu();
    }

    /**
     * שמירת התפריט
     */
    saveMenu() {
        return DataManager.saveMenu(this.menu);
    }

    /**
     * יצירת תפריט ברירת מחדל
     */
    createDefaultMenu() {
        this.menu = {
            categories: [...CONFIG.defaultCategories],
            items: { ...CONFIG.defaultMenuItems }
        };
        this.saveMenu();
        showSuccess('נוצר תפריט ברירת מחדל');
    }

    /**
     * קבלת כל הקטגוריות
     */
    getCategories() {
        return this.menu?.categories || [];
    }

    /**
     * קבלת קטגוריה לפי ID
     */
    getCategory(categoryId) {
        return this.getCategories().find(cat => cat.id === categoryId);
    }

    /**
     * הוספת קטגוריה חדשה
     */
    addCategory(categoryData) {
        if (!categoryData.id || !categoryData.name) {
            throw new Error('נדרש מזהה ושם לקטגוריה');
        }

        // בדיקה שהמזהה לא קיים
        if (this.getCategory(categoryData.id)) {
            throw new Error('קטגוריה עם מזהה זה כבר קיימת');
        }

        const newCategory = {
            id: categoryData.id,
            name: categoryData.name,
            description: categoryData.description || '',
            icon: categoryData.icon || '🍽️'
        };

        this.menu.categories.push(newCategory);

        // צור מערך פריטים ריק לקטגוריה
        if (!this.menu.items[categoryData.id]) {
            this.menu.items[categoryData.id] = [];
        }

        this.saveMenu();
        return newCategory;
    }

    /**
     * עדכון קטגוריה
     */
    updateCategory(categoryId, updateData) {
        const categoryIndex = this.menu.categories.findIndex(cat => cat.id === categoryId);
        if (categoryIndex === -1) {
            throw new Error('קטגוריה לא נמצאה');
        }

        // אם משנים את המזהה, צריך לעדכן גם את הפריטים
        if (updateData.id && updateData.id !== categoryId) {
            // בדוק שהמזהה החדש לא קיים
            if (this.getCategory(updateData.id)) {
                throw new Error('קטגוריה עם מזהה זה כבר קיימת');
            }

            // העבר פריטים למזהה החדש
            this.menu.items[updateData.id] = this.menu.items[categoryId] || [];
            delete this.menu.items[categoryId];
        }

        // עדכן את הקטגוריה
        this.menu.categories[categoryIndex] = {
            ...this.menu.categories[categoryIndex],
            ...updateData
        };

        this.saveMenu();
        return this.menu.categories[categoryIndex];
    }

    /**
     * מחיקת קטגוריה
     */
    deleteCategory(categoryId) {
        const categoryIndex = this.menu.categories.findIndex(cat => cat.id === categoryId);
        if (categoryIndex === -1) {
            throw new Error('קטגוריה לא נמצאה');
        }

        // מחק את הקטגוריה ואת הפריטים שלה
        this.menu.categories.splice(categoryIndex, 1);
        delete this.menu.items[categoryId];

        this.saveMenu();
        return true;
    }

    /**
     * קבלת פריטים לפי קטגוריה
     */
    getItemsByCategory(categoryId) {
        return this.menu?.items?.[categoryId] || [];
    }

    /**
     * קבלת פריט לפי ID
     */
    getItem(categoryId, itemId) {
        const items = this.getItemsByCategory(categoryId);
        return items.find(item => item.id === itemId);
    }

    /**
     * הוספת פריט חדש
     */
    addItem(categoryId, itemData) {
        if (!categoryId || !itemData.name) {
            throw new Error('נדרש מזהה קטגוריה ושם פריט');
        }

        // בדוק שהקטגוריה קיימת
        if (!this.getCategory(categoryId)) {
            throw new Error('קטגוריה לא נמצאה');
        }

        const newItem = {
            id: itemData.id || generateId('item_'),
            name: itemData.name,
            description: itemData.description || '',
            price: parseFloat(itemData.price) || 0,
            image: itemData.image || null,
            available: itemData.available !== false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // בדוק שאין פריט עם אותו ID
        if (this.getItem(categoryId, newItem.id)) {
            newItem.id = generateId('item_');
        }

        // הוסף לקטגוריה
        if (!this.menu.items[categoryId]) {
            this.menu.items[categoryId] = [];
        }

        this.menu.items[categoryId].push(newItem);
        this.saveMenu();

        return newItem;
    }

    /**
     * עדכון פריט
     */
    updateItem(categoryId, itemId, updateData) {
        const items = this.getItemsByCategory(categoryId);
        const itemIndex = items.findIndex(item => item.id === itemId);

        if (itemIndex === -1) {
            throw new Error('פריט לא נמצא');
        }

        // עדכן את הפריט
        this.menu.items[categoryId][itemIndex] = {
            ...this.menu.items[categoryId][itemIndex],
            ...updateData,
            updatedAt: new Date().toISOString()
        };

        this.saveMenu();
        return this.menu.items[categoryId][itemIndex];
    }

    /**
     * מחיקת פריט
     */
    deleteItem(categoryId, itemId) {
        const items = this.getItemsByCategory(categoryId);
        const itemIndex = items.findIndex(item => item.id === itemId);

        if (itemIndex === -1) {
            throw new Error('פריט לא נמצא');
        }

        // מחק את הפריט
        this.menu.items[categoryId].splice(itemIndex, 1);
        this.saveMenu();

        return true;
    }

    /**
     * חיפוש פריטים
     */
    searchItems(query) {
        if (!query || query.trim().length < 2) {
            return [];
        }

        const results = [];
        const searchTerm = query.toLowerCase().trim();

        this.getCategories().forEach(category => {
            const items = this.getItemsByCategory(category.id);
            items.forEach(item => {
                if (
                    item.name.toLowerCase().includes(searchTerm) ||
                    item.description.toLowerCase().includes(searchTerm)
                ) {
                    results.push({
                        ...item,
                        categoryId: category.id,
                        categoryName: category.name
                    });
                }
            });
        });

        return results;
    }

    /**
     * קבלת פריטים זמינים בלבד
     */
    getAvailableItems() {
        const availableItems = [];

        this.getCategories().forEach(category => {
            const items = this.getItemsByCategory(category.id);
            const available = items.filter(item => item.available);

            if (available.length > 0) {
                availableItems.push({
                    category: category,
                    items: available
                });
            }
        });

        return availableItems;
    }

    /**
     * העברת פריט בין קטגוריות
     */
    moveItem(fromCategoryId, toCategoryId, itemId) {
        if (fromCategoryId === toCategoryId) {
            return; // אותה קטגוריה
        }

        // בדוק שהקטגוריות קיימות
        if (!this.getCategory(fromCategoryId) || !this.getCategory(toCategoryId)) {
            throw new Error('אחת הקטגוריות לא נמצאה');
        }

        const item = this.getItem(fromCategoryId, itemId);
        if (!item) {
            throw new Error('פריט לא נמצא');
        }

        // הוסף לקטגוריה החדשה
        if (!this.menu.items[toCategoryId]) {
            this.menu.items[toCategoryId] = [];
        }
        this.menu.items[toCategoryId].push(item);

        // מחק מהקטגוריה הישנה
        this.deleteItem(fromCategoryId, itemId);

        this.saveMenu();
        return item;
    }

    /**
     * שכפול פריט
     */
    duplicateItem(categoryId, itemId, newName = null) {
        const item = this.getItem(categoryId, itemId);
        if (!item) {
            throw new Error('פריט לא נמצא');
        }

        const duplicatedItem = {
            ...item,
            id: generateId('item_'),
            name: newName || `${item.name} (עותק)`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        return this.addItem(categoryId, duplicatedItem);
    }

    /**
     * סידור מחדש של קטגוריות
     */
    reorderCategories(newOrder) {
        if (!Array.isArray(newOrder) || newOrder.length !== this.menu.categories.length) {
            throw new Error('סדר קטגוריות לא תקין');
        }

        // וודא שכל הקטגוריות קיימות
        const existingIds = this.menu.categories.map(cat => cat.id);
        const newIds = newOrder.map(cat => cat.id);

        if (!existingIds.every(id => newIds.includes(id))) {
            throw new Error('חסרות קטגוריות בסדר החדש');
        }

        this.menu.categories = newOrder;
        this.saveMenu();
    }

    /**
     * סידור מחדש של פריטים בקטגוריה
     */
    reorderItems(categoryId, newOrder) {
        if (!Array.isArray(newOrder)) {
            throw new Error('סדר פריטים לא תקין');
        }

        const currentItems = this.getItemsByCategory(categoryId);
        if (newOrder.length !== currentItems.length) {
            throw new Error('מספר הפריטים לא תואם');
        }

        this.menu.items[categoryId] = newOrder;
        this.saveMenu();
    }

    /**
     * ייצוא התפריט
     */
    exportMenu() {
        return {
            timestamp: new Date().toISOString(),
            version: '1.0',
            restaurant: CONFIG.restaurant.name,
            menu: this.menu
        };
    }

    /**
     * יבוא תפריט
     */
    importMenu(menuData) {
        try {
            if (!menuData || !menuData.menu) {
                throw new Error('נתוני תפריט לא תקינים');
            }

            // ולידציה בסיסית
            const { menu } = menuData;
            if (!menu.categories || !Array.isArray(menu.categories)) {
                throw new Error('קטגוריות לא תקינות');
            }

            if (!menu.items || typeof menu.items !== 'object') {
                throw new Error('פריטים לא תקינים');
            }

            // עדכן את התפריט
            this.menu = menu;
            this.saveMenu();

            return {
                success: true,
                categoriesCount: menu.categories.length,
                itemsCount: Object.values(menu.items).flat().length
            };

        } catch (error) {
            console.error('שגיאה ביבוא תפריט:', error);
            throw error;
        }
    }

    /**
     * איפוס התפריט
     */
    resetMenu() {
        this.createDefaultMenu();
        return true;
    }

    /**
     * קבלת סטטיסטיקות התפריט
     */
    getMenuStats() {
        const categories = this.getCategories();
        let totalItems = 0;
        let availableItems = 0;

        categories.forEach(category => {
            const items = this.getItemsByCategory(category.id);
            totalItems += items.length;
            availableItems += items.filter(item => item.available).length;
        });

        return {
            categoriesCount: categories.length,
            totalItems: totalItems,
            availableItems: availableItems,
            unavailableItems: totalItems - availableItems,
            averageItemsPerCategory: totalItems / categories.length || 0
        };
    }
}

// יצירת מופע יחיד
const menuData = new MenuDataManager();

}

// רק אם לא קיים, הגדר את המופע כמשתנה גלובלי
if (typeof window.menuData === 'undefined') {
    window.menuData = menuData;
}