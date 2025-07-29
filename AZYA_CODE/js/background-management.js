// js/background-management.js - ניהול רקע ועיצוב האתר

/**
 * מחלקה לניהול רקע ועיצוב האתר
 */
class BackgroundManagement {
    constructor() {
        this.currentBackground = null;
        this.currentTheme = 'dark';
        this.customBackgrounds = [];
        this.presetBackgrounds = [
            {
                id: 'default',
                name: 'ברירת מחדל',
                type: 'gradient',
                value: 'linear-gradient(135deg, #1a1a1a, #2d2d2d)',
                preview: 'linear-gradient(135deg, #1a1a1a, #2d2d2d)'
            },
            {
                id: 'gold_gradient',
                name: 'זהב מדרגי',
                type: 'gradient',
                value: 'linear-gradient(135deg, #1a1a1a, #2d1810, #1a1a1a)',
                preview: 'linear-gradient(135deg, #DAA520, #B8860B)'
            },
            {
                id: 'dark_wood',
                name: 'עץ כהה',
                type: 'pattern',
                value: 'repeating-linear-gradient(45deg, #2d2d2d, #2d2d2d 10px, #1a1a1a 10px, #1a1a1a 20px)',
                preview: '#2d2d2d'
            },
            {
                id: 'restaurant_texture',
                name: 'מרקם מסעדה',
                type: 'gradient',
                value: 'radial-gradient(circle at 50% 50%, #2d2d2d 0%, #1a1a1a 50%, #0d1117 100%)',
                preview: 'radial-gradient(circle, #2d2d2d, #1a1a1a)'
            },
            {
                id: 'midnight_blue',
                name: 'כחול לילה',
                type: 'gradient',
                value: 'linear-gradient(135deg, #0f1419, #1e2a35, #0f1419)',
                preview: 'linear-gradient(135deg, #0f1419, #1e2a35)'
            },
            {
                id: 'warm_charcoal',
                name: 'פחם חם',
                type: 'gradient',
                value: 'linear-gradient(135deg, #2c1810, #1a1a1a, #2c1810)',
                preview: 'linear-gradient(135deg, #2c1810, #1a1a1a)'
            }
        ];
        this.init();
    }

    /**
     * אתחול ניהול רקע
     */
    init() {
        this.loadCurrentBackground();
        this.loadCustomBackgrounds();
        this.applyBackground();
        this.bindEvents();
    }

    /**
     * טעינת רקע נוכחי
     */
    loadCurrentBackground() {
        this.currentBackground = DataManager.getSetting('currentBackground', 'default');
        this.currentTheme = DataManager.getSetting('currentTheme', 'dark');
    }

    /**
     * טעינת רקעים מותאמים אישית
     */
    loadCustomBackgrounds() {
        this.customBackgrounds = DataManager.getSetting('customBackgrounds', []);
    }

    /**
     * שמירת הגדרות רקע
     */
    saveBackgroundSettings() {
        DataManager.setSetting('currentBackground', this.currentBackground);
        DataManager.setSetting('currentTheme', this.currentTheme);
        DataManager.setSetting('customBackgrounds', this.customBackgrounds);
    }

    /**
     * החלת רקע
     */
    applyBackground() {
        const background = this.getBackgroundById(this.currentBackground);
        if (!background) return;

        document.body.style.background = background.value;
        document.body.setAttribute('data-background', background.id);
        document.body.setAttribute('data-theme', this.currentTheme);

        // עדכן משתני CSS בהתאם לרקע
        this.updateCSSVariables(background);
    }

    /**
     * עדכון משתני CSS
     */
    updateCSSVariables(background) {
        const root = document.documentElement;
        
        // התאם צבעים לפי הרקע
        if (background.id === 'midnight_blue') {
            root.style.setProperty('--glass-bg', 'rgba(30, 42, 53, 0.15)');
            root.style.setProperty('--glass-border', 'rgba(100, 149, 237, 0.2)');
        } else if (background.id === 'warm_charcoal') {
            root.style.setProperty('--glass-bg', 'rgba(44, 24, 16, 0.15)');
            root.style.setProperty('--glass-border', 'rgba(218, 165, 32, 0.3)');
        } else {
            // ברירת מחדל
            root.style.setProperty('--glass-bg', 'rgba(255, 255, 255, 0.1)');
            root.style.setProperty('--glass-border', 'rgba(255, 255, 255, 0.2)');
        }

        // עדכן צבעי טקסט בהתאם לנושא
        if (this.currentTheme === 'light') {
            root.style.setProperty('--text-primary', '#1a1a1a');
            root.style.setProperty('--text-secondary', '#4a5568');
        } else {
            root.style.setProperty('--text-primary', '#ffffff');
            root.style.setProperty('--text-secondary', '#d1d5db');
        }
    }

    /**
     * קבלת רקע לפי ID
     */
    getBackgroundById(id) {
        // חפש ברקעים מוגדרים מראש
        let background = this.presetBackgrounds.find(bg => bg.id === id);
        
        // אם לא נמצא, חפש ברקעים מותאמים אישית
        if (!background) {
            background = this.customBackgrounds.find(bg => bg.id === id);
        }
        
        return background;
    }

    /**
     * שינוי רקע
     */
    changeBackground(backgroundId) {
        const background = this.getBackgroundById(backgroundId);
        if (!background) {
            showError('רקע לא נמצא');
            return;
        }

        this.currentBackground = backgroundId;
        this.applyBackground();
        this.saveBackgroundSettings();
        
        showSuccess(`רקע שונה ל"${background.name}"`);
    }

    /**
     * שינוי נושא (בהיר/כהה)
     */
    changeTheme(theme) {
        this.currentTheme = theme;
        this.applyBackground();
        this.saveBackgroundSettings();
        
        const themeName = theme === 'light' ? 'בהיר' : 'כהה';
        showSuccess(`נושא שונה ל${themeName}`);
    }

    /**
     * הוספת רקע מותאם אישית
     */
    addCustomBackground(backgroundData) {
        const customBackground = {
            id: generateId('custom_bg_'),
            name: backgroundData.name || 'רקע מותאם אישית',
            type: backgroundData.type || 'color',
            value: backgroundData.value,
            preview: backgroundData.preview || backgroundData.value,
            createdAt: new Date().toISOString()
        };

        this.customBackgrounds.push(customBackground);
        this.saveBackgroundSettings();
        
        return customBackground;
    }

    /**
     * מחיקת רקע מותאם אישית
     */
    deleteCustomBackground(backgroundId) {
        const backgroundIndex = this.customBackgrounds.findIndex(bg => bg.id === backgroundId);
        if (backgroundIndex === -1) {
            showError('רקע לא נמצא');
            return false;
        }

        const background = this.customBackgrounds[backgroundIndex];
        
        if (!confirm(`האם אתה בטוח שברצונך למחוק את הרקע "${background.name}"?`)) {
            return false;
        }

        this.customBackgrounds.splice(backgroundIndex, 1);
        
        // אם זה הרקע הנוכחי, חזור לברירת מחדל
        if (this.currentBackground === backgroundId) {
            this.changeBackground('default');
        }
        
        this.saveBackgroundSettings();
        showSuccess('רקע נמחק בהצלחה');
        
        return true;
    }

    /**
     * טעינת ניהול רקע לפאנל אדמין
     */
    loadBackgroundManagement() {
        const container = document.getElementById('backgroundTab');
        if (!container) return;

        container.innerHTML = this.renderBackgroundManagementContent();
        this.attachBackgroundEvents();
    }

    /**
     * רינדור תוכן ניהול רקע
     */
    renderBackgroundManagementContent() {
        return `
            <div class="background-management">
                <!-- Theme Selection -->
                <div class="settings-section">
                    <h4>🌓 בחירת נושא</h4>
                    <div class="theme-selector">
                        <label class="theme-option ${this.currentTheme === 'dark' ? 'selected' : ''}">
                            <input type="radio" name="theme" value="dark" ${this.currentTheme === 'dark' ? 'checked' : ''}>
                            <div class="theme-preview dark-theme">
                                <div class="theme-circle"></div>
                                <span>כהה</span>
                            </div>
                        </label>
                        <label class="theme-option ${this.currentTheme === 'light' ? 'selected' : ''}">
                            <input type="radio" name="theme" value="light" ${this.currentTheme === 'light' ? 'checked' : ''}>
                            <div class="theme-preview light-theme">
                                <div class="theme-circle"></div>
                                <span>בהיר</span>
                            </div>
                        </label>
                    </div>
                </div>

                <!-- Preset Backgrounds -->
                <div class="settings-section">
                    <h4>🎨 רקעים מוגדרים מראש</h4>
                    <div class="backgrounds-grid">
                        ${this.presetBackgrounds.map(bg => this.renderBackgroundOption(bg)).join('')}
                    </div>
                </div>

                <!-- Custom Backgrounds -->
                <div class="settings-section">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <h4>🖼️ רקעים מותאמים אישית</h4>
                        <button class="btn btn-success" onclick="backgroundManagement.showAddBackgroundForm()">
                            ➕ הוסף רקע
                        </button>
                    </div>
                    
                    ${this.customBackgrounds.length > 0 ? `
                        <div class="backgrounds-grid">
                            ${this.customBackgrounds.map(bg => this.renderBackgroundOption(bg, true)).join('')}
                        </div>
                    ` : `
                        <div class="empty-backgrounds">
                            <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                                <div style="font-size: 2rem; margin-bottom: 1rem;">🖼️</div>
                                <p>אין רקעים מותאמים אישית</p>
                                <p style="font-size: 0.9rem;">לחץ על "הוסף רקע" כדי ליצור רקע חדש</p>
                            </div>
                        </div>
                    `}
                </div>

                <!-- Background Upload -->
                <div class="settings-section">
                    <h4>📤 העלאת תמונת רקע</h4>
                    <div class="upload-area" onclick="backgroundManagement.triggerFileUpload()">
                        <input type="file" id="backgroundUpload" accept="image/*" style="display: none;" onchange="backgroundManagement.handleImageUpload(event)">
                        <div class="upload-content">
                            <div style="font-size: 3rem; margin-bottom: 1rem;">📁</div>
                            <p>לחץ כדי להעלות תמונת רקע</p>
                            <p style="font-size: 0.9rem; color: var(--text-secondary);">תמונות מומלצות: JPG, PNG (מקסימום 5MB)</p>
                        </div>
                    </div>
                </div>

                <!-- Advanced Settings -->
                <div class="settings-section">
                    <h4>⚙️ הגדרות מתקדמות</h4>
                    <div class="form-group">
                        <label style="display: flex; align-items: center; gap: 0.5rem;">
                            <input type="checkbox" id="enableBackgroundAnimations" ${DataManager.getSetting('enableBackgroundAnimations', true) ? 'checked' : ''}>
                            🎭 אפשר אנימציות רקע
                        </label>
                    </div>
                    <div class="form-group">
                        <label style="display: flex; align-items: center; gap: 0.5rem;">
                            <input type="checkbox" id="enableParallaxEffect" ${DataManager.getSetting('enableParallaxEffect', false) ? 'checked' : ''}>
                            🌀 אפשר אפקט פרלקסה
                        </label>
                    </div>
                    <div class="form-group">
                        <label for="backgroundOpacity">שקיפות רקע:</label>
                        <input type="range" id="backgroundOpacity" min="0.3" max="1" step="0.1" value="${DataManager.getSetting('backgroundOpacity', 1)}">
                        <span id="opacityValue">${Math.round(DataManager.getSetting('backgroundOpacity', 1) * 100)}%</span>
                    </div>
                    <button class="btn btn-primary" onclick="backgroundManagement.saveAdvancedSettings()">
                        💾 שמור הגדרות
                    </button>
                </div>

                <!-- Export/Import -->
                <div class="settings-section">
                    <h4>📋 ייצוא/יבוא רקעים</h4>
                    <div style="display: flex; gap: 1rem;">
                        <button class="btn btn-secondary" onclick="backgroundManagement.exportBackgrounds()">
                            📤 יצא רקעים
                        </button>
                        <button class="btn btn-secondary" onclick="backgroundManagement.importBackgrounds()">
                            📥 יבא רקעים
                        </button>
                        <button class="btn btn-warning" onclick="backgroundManagement.resetToDefault()">
                            🔄 איפוס לברירת מחדל
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * רינדור אפשרות רקע
     */
    renderBackgroundOption(background, isCustom = false) {
        const isSelected = this.currentBackground === background.id;
        
        return `
            <div class="background-option ${isSelected ? 'selected' : ''}" 
                 onclick="backgroundManagement.changeBackground('${background.id}')">
                <div class="background-preview" style="background: ${background.preview}"></div>
                <div class="background-info">
                    <div class="background-name">${background.name}</div>
                    <div class="background-type">${this.getTypeLabel(background.type)}</div>
                </div>
                ${isSelected ? '<div class="selected-indicator">✓</div>' : ''}
                ${isCustom ? `
                    <div class="background-actions">
                        <button class="action-btn" onclick="event.stopPropagation(); backgroundManagement.editCustomBackground('${background.id}')" title="ערוך">
                            ✏️
                        </button>
                        <button class="action-btn delete" onclick="event.stopPropagation(); backgroundManagement.deleteCustomBackground('${background.id}')" title="מחק">
                            🗑️
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * קבלת תווית סוג רקע
     */
    getTypeLabel(type) {
        const typeLabels = {
            'color': 'צבע',
            'gradient': 'מדרג',
            'pattern': 'תבנית',
            'image': 'תמונה'
        };
        return typeLabels[type] || type;
    }

    /**
     * הצגת טופס הוספת רקע
     */
    showAddBackgroundForm() {
        const modal = uiComponents.createModal({
            title: '➕ הוסף רקע חדש',
            content: this.renderAddBackgroundForm(),
            className: 'add-background-modal'
        });

        modal.open();
    }

    /**
     * רינדור טופס הוספת רקע
     */
    renderAddBackgroundForm() {
        return `
            <form id="addBackgroundForm" onsubmit="backgroundManagement.saveNewBackground(event)">
                <div class="form-group">
                    <label for="bgName">שם הרקע:</label>
                    <input type="text" id="bgName" placeholder="שם הרקע החדש" required>
                </div>

                <div class="form-group">
                    <label for="bgType">סוג רקע:</label>
                    <select id="bgType" onchange="backgroundManagement.updateBackgroundForm(this.value)" required>
                        <option value="color">צבע אחיד</option>
                        <option value="gradient">מדרג צבעים</option>
                        <option value="pattern">תבנית CSS</option>
                    </select>
                </div>

                <!-- Color Type -->
                <div id="colorInputs" class="form-group">
                    <label for="bgColor">בחר צבע:</label>
                    <input type="color" id="bgColor" value="#1a1a1a">
                </div>

                <!-- Gradient Type -->
                <div id="gradientInputs" class="form-group" style="display: none;">
                    <label for="gradientType">סוג מדרג:</label>
                    <select id="gradientType">
                        <option value="linear">ליניארי</option>
                        <option value="radial">רדיאלי</option>
                    </select>
                    
                    <div style="margin-top: 1rem;">
                        <label for="gradientAngle">זווית (ליניארי):</label>
                        <input type="range" id="gradientAngle" min="0" max="360" value="135">
                        <span id="angleValue">135°</span>
                    </div>
                    
                    <div style="margin-top: 1rem;">
                        <label>צבעי המדרג:</label>
                        <div class="gradient-colors">
                            <input type="color" id="gradientColor1" value="#1a1a1a">
                            <input type="color" id="gradientColor2" value="#2d2d2d">
                            <button type="button" onclick="backgroundManagement.addGradientColor()">➕</button>
                        </div>
                    </div>
                </div>

                <!-- Pattern Type -->
                <div id="patternInputs" class="form-group" style="display: none;">
                    <label for="patternCode">קוד CSS:</label>
                    <textarea id="patternCode" rows="3" placeholder="לדוגמה: repeating-linear-gradient(45deg, #000, #000 10px, #333 10px, #333 20px)"></textarea>
                </div>

                <!-- Preview -->
                <div class="form-group">
                    <label>תצוגה מקדימה:</label>
                    <div id="backgroundPreview" class="background-preview-large" style="background: #1a1a1a;"></div>
                </div>

                <div class="modal-buttons">
                    <button type="submit" class="btn btn-primary">💾 שמור רקע</button>
                    <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">❌ ביטול</button>
                </div>
            </form>
        `;
    }

    /**
     * עדכון טופס רקע לפי סוג
     */
    updateBackgroundForm(type) {
        // הסתר כל הקלטים
        document.getElementById('colorInputs').style.display = 'none';
        document.getElementById('gradientInputs').style.display = 'none';
        document.getElementById('patternInputs').style.display = 'none';

        // הצג את הרלוונטי
        switch (type) {
            case 'color':
                document.getElementById('colorInputs').style.display = 'block';
                break;
            case 'gradient':
                document.getElementById('gradientInputs').style.display = 'block';
                break;
            case 'pattern':
                document.getElementById('patternInputs').style.display = 'block';
                break;
        }

        // עדכן תצוגה מקדימה
        this.updateBackgroundPreview();
    }

    /**
     * עדכון תצוגה מקדימה
     */
    updateBackgroundPreview() {
        const preview = document.getElementById('backgroundPreview');
        if (!preview) return;

        const type = document.getElementById('bgType').value;
        let backgroundValue = '#1a1a1a';

        switch (type) {
            case 'color':
                backgroundValue = document.getElementById('bgColor').value;
                break;
            case 'gradient':
                backgroundValue = this.generateGradientValue();
                break;
            case 'pattern':
                backgroundValue = document.getElementById('patternCode').value || '#1a1a1a';
                break;
        }

        preview.style.background = backgroundValue;
    }

    /**
     * יצירת ערך מדרג
     */
    generateGradientValue() {
        const gradientType = document.getElementById('gradientType').value;
        const angle = document.getElementById('gradientAngle').value;
        const color1 = document.getElementById('gradientColor1').value;
        const color2 = document.getElementById('gradientColor2').value;

        if (gradientType === 'linear') {
            return `linear-gradient(${angle}deg, ${color1}, ${color2})`;
        } else {
            return `radial-gradient(circle, ${color1}, ${color2})`;
        }
    }

    /**
     * שמירת רקע חדש
     */
    saveNewBackground(event) {
        event.preventDefault();

        const name = document.getElementById('bgName').value.trim();
        const type = document.getElementById('bgType').value;
        
        if (!name) {
            showError('נדרש שם לרקע');
            return;
        }

        let value = '#1a1a1a';
        
        switch (type) {
            case 'color':
                value = document.getElementById('bgColor').value;
                break;
            case 'gradient':
                value = this.generateGradientValue();
                break;
            case 'pattern':
                value = document.getElementById('patternCode').value.trim();
                if (!value) {
                    showError('נדרש קוד CSS לתבנית');
                    return;
                }
                break;
        }

        const newBackground = this.addCustomBackground({
            name: name,
            type: type,
            value: value,
            preview: value
        });

        // סגור מודל
        document.querySelector('.add-background-modal').remove();
        
        // רענן ממשק
        this.loadBackgroundManagement();
        
        showSuccess(`רקע "${name}" נוסף בהצלחה`);
    }

    /**
     * טיפול בהעלאת תמונה
     */
    async handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // בדיקות קובץ
        if (!file.type.startsWith('image/')) {
            showError('אנא בחר קובץ תמונה תקין');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            showError('קובץ התמונה גדול מדי (מקסימום 5MB)');
            return;
        }

        try {
            showLoading('מעלה תמונה...');

            // המר לbase64
            const base64 = await loadImageAsBase64(file);
            
            // צמצם גודל אם נדרש
            const resizedImage = await resizeImage(file, 1920, 0.8);

            const fileName = file.name.replace(/\.[^/.]+$/, "");
            const newBackground = this.addCustomBackground({
                name: `תמונה: ${fileName}`,
                type: 'image',
                value: `url(${resizedImage}) center/cover no-repeat`,
                preview: resizedImage
            });

            // החל את הרקע החדש
            this.changeBackground(newBackground.id);
            
            // רענן ממשק
            this.loadBackgroundManagement();

            notifications.hideLoading();
            showSuccess('תמונת רקע הועלתה בהצלחה');

        } catch (error) {
            notifications.hideLoading();
            showError('שגיאה בהעלאת התמונה: ' + error.message);
        }
    }

    /**
     * הפעלת העלאת קובץ
     */
    triggerFileUpload() {
        document.getElementById('backgroundUpload').click();
    }

    /**
     * שמירת הגדרות מתקדמות
     */
    saveAdvancedSettings() {
        const enableAnimations = document.getElementById('enableBackgroundAnimations').checked;
        const enableParallax = document.getElementById('enableParallaxEffect').checked;
        const opacity = parseFloat(document.getElementById('backgroundOpacity').value);

        DataManager.setSetting('enableBackgroundAnimations', enableAnimations);
        DataManager.setSetting('enableParallaxEffect', enableParallax);
        DataManager.setSetting('backgroundOpacity', opacity);

        // החל הגדרות
        document.body.style.opacity = opacity;
        
        if (enableAnimations) {
            document.body.classList.add('background-animations');
        } else {
            document.body.classList.remove('background-animations');
        }

        if (enableParallax) {
            document.body.classList.add('parallax-effect');
        } else {
            document.body.classList.remove('parallax-effect');
        }

        showSuccess('הגדרות מתקדמות נשמרו');
    }

    /**
     * ייצוא רקעים
     */
    exportBackgrounds() {
        const exportData = {
            customBackgrounds: this.customBackgrounds,
            currentBackground: this.currentBackground,
            currentTheme: this.currentTheme,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const fileName = `hazya-backgrounds-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', fileName);
        linkElement.click();
        
        showSuccess('רקעים יוצאו בהצלחה');
    }

    /**
     * יבוא רקעים
     */
    importBackgrounds() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const importData = JSON.parse(event.target.result);
                    
                    if (importData.customBackgrounds) {
                        // הוסף רקעים חדשים
                        let importedCount = 0;
                        importData.customBackgrounds.forEach(bg => {
                            if (!this.customBackgrounds.find(existing => existing.name === bg.name)) {
                                bg.id = generateId('custom_bg_');
                                this.customBackgrounds.push(bg);
                                importedCount++;
                            }
                        });
                        
                        this.saveBackgroundSettings();
                        this.loadBackgroundManagement();
                        
                        showSuccess(`${importedCount} רקעים יובאו בהצלחה`);
                    }
                    
                } catch (error) {
                    showError('קובץ לא תקין: ' + error.message);
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    }

    /**
     * איפוס לברירת מחדל
     */
    resetToDefault() {
        if (!confirm('האם אתה בטוח שברצונך לאפס את כל הגדרות הרקע?')) {
            return;
        }

        this.currentBackground = 'default';
        this.currentTheme = 'dark';
        this.customBackgrounds = [];
        
        this.applyBackground();
        this.saveBackgroundSettings();
        this.loadBackgroundManagement();
        
        showSuccess('הגדרות רקע אופסו לברירת מחדל');
    }

    /**
     * קישור אירועים
     */
    bindEvents() {
        // עדכון תצוגה מקדימה בטופס
        document.addEventListener('input', (e) => {
            if (e.target.closest('#addBackgroundForm')) {
                this.updateBackgroundPreview();
            }
            
            if (e.target.id === 'backgroundOpacity') {
                const opacityValue = document.getElementById('opacityValue');
                if (opacityValue) {
                    opacityValue.textContent = Math.round(e.target.value * 100) + '%';
                }
            }
            
            if (e.target.id === 'gradientAngle') {
                const angleValue = document.getElementById('angleValue');
                if (angleValue) {
                    angleValue.textContent = e.target.value + '°';
                }
            }
        });

        // שינוי נושא
        document.addEventListener('change', (e) => {
            if (e.target.name === 'theme') {
                this.changeTheme(e.target.value);
            }
        });
    }

    /**
     * קישור אירועים ספציפיים לרקע
     */
    attachBackgroundEvents() {
        // כל האירועים כבר מקושרים ב-bindEvents
    }
}

// יצירת מופע יחיד
const backgroundManagement = new BackgroundManagement();

// הרחבת admin עם פונקציות רקע
if (typeof admin !== 'undefined') {
    admin.loadBackgroundManagement = backgroundManagement.loadBackgroundManagement.bind(backgroundManagement);
}