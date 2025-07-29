// js/menu-management.js - ניהול תפריט מתקדם

/**
 * הרחבת פונקציונליות ניהול התפריט
 */
class MenuManagement {
    constructor() {
        this.editingItem = null;
        this.editingCategory = null;
        this.draggedElement = null;
        this.init();
    }

    /**
     * אתחול ניהול התפריט
     */
    init() {
        this.setupDragAndDrop();
        this.bindEvents();
    }

    /**
     * הגדרת drag & drop
     */
    setupDragAndDrop() {
        // הוסף אירועי drag & drop לקטגוריות ופריטים
        document.addEventListener('dragstart', this.handleDragStart.bind(this));
        document.addEventListener('dragover', this.handleDragOver.bind(this));
        document.addEventListener('drop', this.handleDrop.bind(this));
        document.addEventListener('dragend', this.handleDragEnd.bind(this));
    }

    /**
     * טיפול בתחילת גרירה
     */
    handleDragStart(e) {
        if (e.target.classList.contains('draggable')) {
            this.draggedElement = e.target;
            e.target.style.opacity = '0.5';
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', e.target.outerHTML);
        }
    }

    /**
     * טיפול בגרירה מעל אלמנט
     */
    handleDragOver(e) {
        if (this.draggedElement) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';

            const dropZone = e.target.closest('.drop-zone');
            if (dropZone) {
                dropZone.classList.add('drag-over');
            }
        }
    }

    /**
     * טיפול בשחרור גרירה
     */
    handleDrop(e) {
        e.preventDefault();

        const dropZone = e.target.closest('.drop-zone');
        if (dropZone && this.draggedElement) {
            dropZone.classList.remove('drag-over');

            // בצע את ההעברה
            this.performDrop(this.draggedElement, dropZone);
        }
    }

    /**
     * טיפול בסיום גרירה
     */
    handleDragEnd(e) {
        if (this.draggedElement) {
            this.draggedElement.style.opacity = '1';
            this.draggedElement = null;
        }

        // נקה כל אינדיקטורי drag-over
        document.querySelectorAll('.drag-over').forEach(el => {
            el.classList.remove('drag-over');
        });
    }

    /**
     * ביצוע העברה
     */
    performDrop(draggedEl, dropZone) {
        const draggedType = draggedEl.dataset.type;
        const draggedId = draggedEl.dataset.id;
        const targetCategory = dropZone.dataset.category;

        if (draggedType === 'menu-item' && targetCategory) {
            this.moveItemToCategory(draggedId, targetCategory);
        }
    }

    /**
     * העברת פריט בין קטגוריות
     */
    moveItemToCategory(itemId, targetCategoryId) {
        try {
            // מצא את הפריט והקטגוריה הנוכחית
            let currentCategoryId = null;
            let item = null;

            menuData.getCategories().forEach(category => {
                const items = menuData.getItemsByCategory(category.id);
                const foundItem = items.find(i => i.id === itemId);
                if (foundItem) {
                    currentCategoryId = category.id;
                    item = foundItem;
                }
            });

            if (!item || !currentCategoryId) {
                showError('פריט לא נמצא');
                return;
            }

            if (currentCategoryId === targetCategoryId) {
                showInfo('הפריט כבר נמצא בקטגוריה זו');
                return;
            }

            // העבר את הפריט
            menuData.moveItem(currentCategoryId, targetCategoryId, itemId);

            // עדכן ממשק
            admin.loadSelectedCategoryItems();
            ui.refreshMenu();

            showSuccess(`הפריט הועבר לקטגוריה ${menuData.getCategory(targetCategoryId)?.name}`);

        } catch (error) {
            showError('שגיאה בהעברת הפריט: ' + error.message);
        }
    }

    /**
     * עריכת פריט
     */
    editItem(categoryId, itemId) {
        const item = menuData.getItem(categoryId, itemId);
        if (!item) {
            showError('פריט לא נמצא');
            return;
        }

        this.editingItem = { categoryId, itemId };

        // מלא את הטופס
        document.getElementById('itemName').value = item.name;
        document.getElementById('itemDescription').value = item.description || '';
        document.getElementById('itemPrice').value = item.price;

        // הצג תמונה קיימת
        if (item.image) {
            const preview = document.getElementById('imagePreview');
            if (preview) {
                preview.src = item.image;
                preview.style.display = 'block';
            }
        }

        // הצג טופס
        admin.showAddItemForm();
    }

    /**
     * שמירת פריט
     */
    async saveItem() {
        const name = document.getElementById('itemName').value.trim();
        const description = document.getElementById('itemDescription').value.trim();
        const price = parseFloat(document.getElementById('itemPrice').value) || 0;
        const imageFile = document.getElementById('itemImage').files[0];

        if (!name) {
            showError('שם הפריט נדרש');
            return;
        }

        if (price < 0) {
            showError('מחיר חייב להיות חיובי');
            return;
        }

        const currentCategory = menuData.currentCategory;
        if (!currentCategory) {
            showError('אנא בחר קטגוריה');
            return;
        }

        try {
            let imageBase64 = null;

            // עבד תמונה אם נבחרה
            if (imageFile) {
                try {
                    imageBase64 = await resizeImage(imageFile, 800, 0.8);
                } catch (error) {
                    console.error('שגיאה בעיבוד תמונה:', error);
                    showWarning('שגיאה בעיבוד התמונה, הפריט יישמר ללא תמונה');
                }
            }

            const itemData = {
                name: name,
                description: description,
                price: price,
                image: imageBase64,
                available: true
            };

            if (this.editingItem) {
                // עדכון פריט קיים
                const { categoryId, itemId } = this.editingItem;

                // שמור תמונה קיימת אם לא נבחרה חדשה
                if (!imageBase64) {
                    const existingItem = menuData.getItem(categoryId, itemId);
                    itemData.image = existingItem?.image || null;
                }

                menuData.updateItem(categoryId, itemId, itemData);
                showSuccess('הפריט עודכן בהצלחה');

                this.editingItem = null;
            } else {
                // פריט חדש
                menuData.addItem(currentCategory, itemData);
                showSuccess('פריט חדש נוסף בהצלחה');
            }

            // נקה טופס
            this.clearItemForm();

            // עדכן ממשק
            admin.loadSelectedCategoryItems();
            ui.refreshMenu();

        } catch (error) {
            showError('שגיאה בשמירת הפריט: ' + error.message);
        }
    }

    /**
     * מחיקת פריט
     */
    deleteItem(categoryId, itemId) {
        const item = menuData.getItem(categoryId, itemId);
        if (!item) {
            showError('פריט לא נמצא');
            return;
        }

        if (!confirm(`האם אתה בטוח שברצונך למחוק את "${item.name}"?`)) {
            return;
        }

        try {
            menuData.deleteItem(categoryId, itemId);
            showSuccess('הפריט נמחק בהצלחה');

            admin.loadSelectedCategoryItems();
            ui.refreshMenu();

        } catch (error) {
            showError('שגיאה במחיקת הפריט: ' + error.message);
        }
    }

    /**
     * שכפול פריט
     */
    duplicateItem(categoryId, itemId) {
        const item = menuData.getItem(categoryId, itemId);
        if (!item) {
            showError('פריט לא נמצא');
            return;
        }

        try {
            const duplicatedItem = menuData.duplicateItem(categoryId, itemId);
            showSuccess(`הפריט שוכפל בשם "${duplicatedItem.name}"`);

            admin.loadSelectedCategoryItems();
            ui.refreshMenu();

        } catch (error) {
            showError('שגיאה בשכפול הפריט: ' + error.message);
        }
    }

    /**
     * החלפת זמינות פריט
     */
    toggleItemAvailability(categoryId, itemId) {
        const item = menuData.getItem(categoryId, itemId);
        if (!item) {
            showError('פריט לא נמצא');
            return;
        }

        try {
            const newAvailability = !item.available;
            menuData.updateItem(categoryId, itemId, { available: newAvailability });

            const statusText = newAvailability ? 'זמין' : 'לא זמין';
            showSuccess(`הפריט "${item.name}" עודכן כ${statusText}`);

            admin.loadSelectedCategoryItems();
            ui.refreshMenu();

        } catch (error) {
            showError('שגיאה בעדכון זמינות: ' + error.message);
        }
    }

    /**
     * תצוגה מקדימה של תמונה
     */
    previewImage() {
        const fileInput = document.getElementById('itemImage');
        const preview = document.getElementById('imagePreview');

        if (!fileInput || !preview) return;

        const file = fileInput.files[0];
        if (!file) {
            preview.style.display = 'none';
            return;
        }

        // בדוק סוג קובץ
        if (!file.type.startsWith('image/')) {
            showError('אנא בחר קובץ תמונה תקין');
            fileInput.value = '';
            return;
        }

        // בדוק גודל (5MB מקסימום)
        if (file.size > 5 * 1024 * 1024) {
            showError('קובץ התמונה גדול מדי (מקסימום 5MB)');
            fileInput.value = '';
            return;
        }

        // הצג תצוגה מקדימה
        const reader = new FileReader();
        reader.onload = (e) => {
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }

    /**
     * יצירת ID אוטומטי לקטגוריה
     */
    generateCategoryId() {
        const nameInput = document.getElementById('categoryName');
        const idInput = document.getElementById('categoryId');

        if (!nameInput || !idInput) return;

        const name = nameInput.value.trim();
        if (name) {
            const id = sanitizeId(name);
            idInput.value = id;
        }
    }

    /**
     * ביטול עריכה
     */
    cancelEdit() {
        this.editingItem = null;
        this.editingCategory = null;

        this.clearItemForm();
        admin.hideMenuForms();
    }

    /**
     * ביטול עריכת קטגוריה
     */
    cancelCategoryEdit() {
        this.editingCategory = null;
        admin.hideMenuForms();
    }

    /**
     * ניקוי טופס פריט
     */
    clearItemForm() {
        const form = document.getElementById('itemForm');
        if (!form) return;

        form.querySelectorAll('input, textarea').forEach(input => {
            if (input.type === 'file') {
                input.value = '';
            } else {
                input.value = '';
            }
        });

        const preview = document.getElementById('imagePreview');
        if (preview) {
            preview.style.display = 'none';
        }
    }

    /**
     * עדכון מזהי UI
     */
    updateMenuStats() {
        const stats = menuData.getMenuStats();

        // עדכן סטטיסטיקות בפאנל
        const totalItemsEl = document.getElementById('totalMenuItems');
        const totalCategoriesEl = document.getElementById('totalCategories');

        if (totalItemsEl) {
            totalItemsEl.textContent = stats.totalItems;
        }

        if (totalCategoriesEl) {
            totalCategoriesEl.textContent = stats.categoriesCount;
        }
    }

    /**
     * קישור אירועים
     */
    bindEvents() {
        // גלובלי פונקציות לשימוש מה-HTML
        window.previewImage = this.previewImage.bind(this);
        window.generateCategoryId = this.generateCategoryId.bind(this);
        window.saveItem = this.saveItem.bind(this);
        window.cancelEdit = this.cancelEdit.bind(this);
        window.cancelCategoryEdit = this.cancelCategoryEdit.bind(this);

        // הרחב את admin עם הפונקציות שלנו - רק אם admin קיים
        if (typeof window.admin !== 'undefined' && window.admin) {
            window.admin.editItem = this.editItem.bind(this);
            window.admin.deleteItem = this.deleteItem.bind(this);
            window.admin.duplicateItem = this.duplicateItem.bind(this);
            window.admin.toggleItemAvailability = this.toggleItemAvailability.bind(this);
        } else {
            // המתן לטעינת admin
            document.addEventListener('adminLoaded', () => {
                if (typeof window.admin !== 'undefined') {
                    window.admin.editItem = this.editItem.bind(this);
                    window.admin.deleteItem = this.deleteItem.bind(this);
                    window.admin.duplicateItem = this.duplicateItem.bind(this);
                    window.admin.toggleItemAvailability = this.toggleItemAvailability.bind(this);
                }
            });
        }

        // עדכון סטטיסטיקות כשהתפריט משתנה
        document.addEventListener('menuUpdated', () => {
            this.updateMenuStats();
        });
    }

    /**
     * ייצוא תפריט בפורמטים שונים
     */
    exportMenuAdvanced(format = 'json') {
        try {
            const menuExport = menuData.exportMenu();

            switch (format) {
                case 'json':
                    this.exportAsJSON(menuExport);
                    break;
                case 'csv':
                    this.exportAsCSV(menuExport);
                    break;
                case 'pdf':
                    this.exportAsPDF(menuExport);
                    break;
                default:
                    this.exportAsJSON(menuExport);
            }

        } catch (error) {
            showError('שגיאה בייצוא: ' + error.message);
        }
    }

    /**
     * ייצוא כ-JSON
     */
    exportAsJSON(data) {
        const dataStr = JSON.stringify(data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

        const fileName = `hazya-menu-${new Date().toISOString().split('T')[0]}.json`;
        this.downloadFile(dataUri, fileName);

        showSuccess('התפריט יוצא כ-JSON');
    }

    /**
     * ייצוא כ-CSV
     */
    exportAsCSV(data) {
        let csv = 'קטגוריה,שם מוצר,תיאור,מחיר,זמין\n';

        data.menu.categories.forEach(category => {
            const items = data.menu.items[category.id] || [];
            items.forEach(item => {
                csv += `"${category.name}","${item.name}","${item.description || ''}","${item.price}","${item.available ? 'כן' : 'לא'}"\n`;
            });
        });

        const dataUri = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(csv);
        const fileName = `hazya-menu-${new Date().toISOString().split('T')[0]}.csv`;

        this.downloadFile(dataUri, fileName);
        showSuccess('התפריט יוצא כ-CSV');
    }

    /**
     * ייצוא כ-PDF (דמה - דורש ספרייה חיצונית)
     */
    exportAsPDF(data) {
        // זה דורש ספרייה כמו jsPDF
        showInfo('ייצוא PDF יבוא בגרסה עתידית');
    }

    /**
     * הורדת קובץ
     */
    downloadFile(dataUri, fileName) {
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', fileName);
        linkElement.style.display = 'none';

        document.body.appendChild(linkElement);
        linkElement.click();
        document.body.removeChild(linkElement);
    }

    /**
     * חיפוש והצגת תוצאות בפאנל ניהול
     */
    searchInAdmin(query) {
        if (!query || query.trim().length < 2) {
            admin.loadSelectedCategoryItems();
            return;
        }

        const results = menuData.searchItems(query);
        const container = document.getElementById('adminItemList');

        if (!container) return;

        if (results.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                    <div style="font-size: 2rem; margin-bottom: 1rem;">🔍</div>
                    <p>לא נמצאו תוצאות עבור "${query}"</p>
                </div>
            `;
            return;
        }

        const resultsHTML = results.map(item =>
            admin.renderAdminMenuItem(item, item.categoryId)
        ).join('');

        container.innerHTML = `
            <div style="margin-bottom: 1rem; padding: 1rem; background: rgba(59, 130, 246, 0.1); border-radius: var(--border-radius); color: var(--accent-blue); text-align: center;">
                🔍 נמצאו ${results.length} תוצאות עבור "${query}"
            </div>
            ${resultsHTML}
        `;
    }

    /**
     * עדכונים מסיביים
     */
    bulkUpdateItems(categoryId, updates) {
        try {
            const items = menuData.getItemsByCategory(categoryId);
            let updatedCount = 0;

            items.forEach(item => {
                if (updates.availability !== undefined) {
                    menuData.updateItem(categoryId, item.id, { available: updates.availability });
                    updatedCount++;
                }

                if (updates.priceIncrease) {
                    const newPrice = item.price * (1 + updates.priceIncrease / 100);
                    menuData.updateItem(categoryId, item.id, { price: Math.round(newPrice * 100) / 100 });
                    updatedCount++;
                }
            });

            showSuccess(`${updatedCount} פריטים עודכנו בהצלחה`);

            admin.loadSelectedCategoryItems();
            ui.refreshMenu();

        } catch (error) {
            showError('שגיאה בעדכון מסיבי: ' + error.message);
        }
    }
}

// יצירת מופע יחיד
const menuManagement = new MenuManagement();

// הוספת פונקציות גלובליות
window.showAddItemForm = admin?.showAddItemForm?.bind(admin);
window.showAddCategoryForm = admin?.showAddCategoryForm?.bind(admin);