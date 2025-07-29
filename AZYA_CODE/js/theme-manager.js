// js/theme-manager.js - ניהול ערכות נושא מתקדם

/**
 * מחלקה לניהול ערכות נושא
 */
class ThemeManager {
    constructor() {
        this.currentTheme = 'dark';
        this.themes = {
            dark: {
                name: 'כהה',
                icon: '🌙',
                colors: {
                    // רקעים עיקריים
                    '--bg-primary': '#1a1a1a',
                    '--bg-secondary': '#2d2d2d',
                    '--bg-tertiary': '#404040',

                    // זכוכית
                    '--glass-bg': 'rgba(255, 255, 255, 0.1)',
                    '--glass-border': 'rgba(255, 255, 255, 0.2)',
                    '--glass-hover': 'rgba(255, 255, 255, 0.15)',

                    // טקסט
                    '--text-primary': '#ffffff',
                    '--text-secondary': '#d1d5db',
                    '--text-muted': '#9ca3af',

                    // צבעי מערכת
                    '--primary-gold': '#DAA520',
                    '--primary-gold-hover': '#B8860B',
                    '--accent-green': '#10b981',
                    '--accent-blue': '#3b82f6',
                    '--accent-red': '#ef4444',
                    '--accent-yellow': '#f59e0b',
                    '--accent-purple': '#8b5cf6',

                    // צללים
                    '--shadow-sm': '0 1px 2px rgba(0, 0, 0, 0.3)',
                    '--shadow-md': '0 4px 6px rgba(0, 0, 0, 0.4)',
                    '--shadow-lg': '0 10px 15px rgba(0, 0, 0, 0.5)',
                    '--shadow-xl': '0 20px 25px rgba(0, 0, 0, 0.6)'
                }
            },

            light: {
                name: 'בהיר',
                icon: '☀️',
                colors: {
                    // רקעים עיקריים
                    '--bg-primary': '#ffffff',
                    '--bg-secondary': '#f8f9fa',
                    '--bg-tertiary': '#e9ecef',

                    // זכוכית
                    '--glass-bg': 'rgba(255, 255, 255, 0.8)',
                    '--glass-border': 'rgba(0, 0, 0, 0.1)',
                    '--glass-hover': 'rgba(0, 0, 0, 0.05)',

                    // טקסט
                    '--text-primary': '#1a1a1a',
                    '--text-secondary': '#4a5568',
                    '--text-muted': '#718096',

                    // צבעי מערכת
                    '--primary-gold': '#B8860B',
                    '--primary-gold-hover': '#996f00',
                    '--accent-green': '#059669',
                    '--accent-blue': '#2563eb',
                    '--accent-red': '#dc2626',
                    '--accent-yellow': '#d97706',
                    '--accent-purple': '#7c3aed',

                    // צללים
                    '--shadow-sm': '0 1px 2px rgba(0, 0, 0, 0.05)',
                    '--shadow-md': '0 4px 6px rgba(0, 0, 0, 0.1)',
                    '--shadow-lg': '0 10px 15px rgba(0, 0, 0, 0.1)',
                    '--shadow-xl': '0 20px 25px rgba(0, 0, 0, 0.15)'
                }
            },

            black_cream: {
                name: 'שחור קרם',
                icon: '🖤',
                colors: {
                    // רקעים עיקריים
                    '--bg-primary': '#0d0d0d',
                    '--bg-secondary': '#1a1a1a',
                    '--bg-tertiary': '#2d2d2d',

                    // זכוכית
                    '--glass-bg': 'rgba(245, 245, 220, 0.1)',
                    '--glass-border': 'rgba(245, 245, 220, 0.2)',
                    '--glass-hover': 'rgba(245, 245, 220, 0.15)',

                    // טקסט
                    '--text-primary': '#f5f5dc', // בז'
                    '--text-secondary': '#e6ddc4',
                    '--text-muted': '#d4c5a9',

                    // צבעי מערכת
                    '--primary-gold': '#DAA520',
                    '--primary-gold-hover': '#B8860B',
                    '--accent-green': '#22c55e',
                    '--accent-blue': '#60a5fa',
                    '--accent-red': '#f87171',
                    '--accent-yellow': '#fbbf24',
                    '--accent-purple': '#a78bfa',

                    // צללים
                    '--shadow-sm': '0 1px 2px rgba(0, 0, 0, 0.4)',
                    '--shadow-md': '0 4px 6px rgba(0, 0, 0, 0.5)',
                    '--shadow-lg': '0 10px 15px rgba(0, 0, 0, 0.6)',
                    '--shadow-xl': '0 20px 25px rgba(0, 0, 0, 0.7)'
                }
            },

            cream_black: {
                name: 'קרם שחור',
                icon: '🤍',
                colors: {
                    // רקעים עיקריים
                    '--bg-primary': '#f5f5dc', // בז'
                    '--bg-secondary': '#f0ead6',
                    '--bg-tertiary': '#e6ddc4',

                    // זכוכית
                    '--glass-bg': 'rgba(0, 0, 0, 0.1)',
                    '--glass-border': 'rgba(0, 0, 0, 0.15)',
                    '--glass-hover': 'rgba(0, 0, 0, 0.05)',

                    // טקסט
                    '--text-primary': '#1a1a1a',
                    '--text-secondary': '#2d2d2d',
                    '--text-muted': '#4a4a4a',

                    // צבעי מערכת
                    '--primary-gold': '#B8860B',
                    '--primary-gold-hover': '#996f00',
                    '--accent-green': '#16a34a',
                    '--accent-blue': '#2563eb',
                    '--accent-red': '#dc2626',
                    '--accent-yellow': '#ca8a04',
                    '--accent-purple': '#7c3aed',

                    // צללים
                    '--shadow-sm': '0 1px 2px rgba(0, 0, 0, 0.1)',
                    '--shadow-md': '0 4px 6px rgba(0, 0, 0, 0.15)',
                    '--shadow-lg': '0 10px 15px rgba(0, 0, 0, 0.2)',
                    '--shadow-xl': '0 20px 25px rgba(0, 0, 0, 0.25)'
                }
            },

            midnight: {
                name: 'חצות',
                icon: '🌌',
                colors: {
                    // רקעים עיקריים
                    '--bg-primary': '#0f1419',
                    '--bg-secondary': '#1e2a35',
                    '--bg-tertiary': '#2d3748',

                    // זכוכית
                    '--glass-bg': 'rgba(100, 149, 237, 0.1)',
                    '--glass-border': 'rgba(100, 149, 237, 0.2)',
                    '--glass-hover': 'rgba(100, 149, 237, 0.15)',

                    // טקסט
                    '--text-primary': '#e2e8f0',
                    '--text-secondary': '#cbd5e0',
                    '--text-muted': '#a0aec0',

                    // צבעי מערכת
                    '--primary-gold': '#ffd700',
                    '--primary-gold-hover': '#ffed4e',
                    '--accent-green': '#48bb78',
                    '--accent-blue': '#4299e1',
                    '--accent-red': '#f56565',
                    '--accent-yellow': '#ed8936',
                    '--accent-purple': '#9f7aea',

                    // צללים
                    '--shadow-sm': '0 1px 2px rgba(0, 0, 0, 0.5)',
                    '--shadow-md': '0 4px 6px rgba(0, 0, 0, 0.6)',
                    '--shadow-lg': '0 10px 15px rgba(0, 0, 0, 0.7)',
                    '--shadow-xl': '0 20px 25px rgba(0, 0, 0, 0.8)'
                }
            },

            warm_wood: {
                name: 'עץ חם',
                icon: '🌰',
                colors: {
                    // רקעים עיקריים
                    '--bg-primary': '#2c1810',
                    '--bg-secondary': '#3d241a',
                    '--bg-tertiary': '#4e2f24',

                    // זכוכית
                    '--glass-bg': 'rgba(218, 165, 32, 0.1)',
                    '--glass-border': 'rgba(218, 165, 32, 0.2)',
                    '--glass-hover': 'rgba(218, 165, 32, 0.15)',

                    // טקסט
                    '--text-primary': '#f7fafc',
                    '--text-secondary': '#e2e8f0',
                    '--text-muted': '#cbd5e0',

                    // צבעי מערכת
                    '--primary-gold': '#DAA520',
                    '--primary-gold-hover': '#B8860B',
                    '--accent-green': '#68d391',
                    '--accent-blue': '#63b3ed',
                    '--accent-red': '#fc8181',
                    '--accent-yellow': '#f6e05e',
                    '--accent-purple': '#b794f6',

                    // צללים
                    '--shadow-sm': '0 1px 2px rgba(0, 0, 0, 0.4)',
                    '--shadow-md': '0 4px 6px rgba(0, 0, 0, 0.5)',
                    '--shadow-lg': '0 10px 15px rgba(0, 0, 0, 0.6)',
                    '--shadow-xl': '0 20px 25px rgba(0, 0, 0, 0.7)'
                }
            }
        };

        this.customThemes = [];
        this.transitionDuration = 300; // אורך אנימציית המעבר במילישניות
        this.init();
    }

    /**
     * אתחול מנהל הנושאים
     */
    init() {
        this.loadSavedTheme();
        this.loadCustomThemes();
        this.applyTheme(this.currentTheme);
        this.bindEvents();
    }

    /**
     * טעינת נושא שמור
     */
    loadSavedTheme() {
        this.currentTheme = DataManager.getSetting('currentTheme', 'dark');

        // בדיקת העדפת מערכת אם הנושא הוא 'auto'
        if (this.currentTheme === 'auto') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.currentTheme = prefersDark ? 'dark' : 'light';
        }
    }

    /**
     * טעינת נושאים מותאמים אישית
     */
    loadCustomThemes() {
        this.customThemes = DataManager.getSetting('customThemes', []);
    }

    /**
     * שמירת הגדרות נושא
     */
    saveThemeSettings() {
        DataManager.setSetting('currentTheme', this.currentTheme);
        DataManager.setSetting('customThemes', this.customThemes);
    }

    /**
     * החלת נושא
     */
    applyTheme(themeId, animate = true) {
        const theme = this.getTheme(themeId);
        if (!theme) {
            console.error(`נושא לא נמצא: ${themeId}`);
            return;
        }

        // הוסף אנימציית מעבר
        if (animate) {
            this.animateThemeTransition(() => {
                this.setThemeColors(theme);
                this.updateThemeAttributes(themeId);
            });
        } else {
            this.setThemeColors(theme);
            this.updateThemeAttributes(themeId);
        }

        this.currentTheme = themeId;
        this.saveThemeSettings();

        // עדכן את ערכות הנושא ברקע אם קיימות
        if (typeof backgroundManagement !== 'undefined') {
            backgroundManagement.applyBackground();
        }

        // הפעל אירוע שינוי נושא
        document.dispatchEvent(new CustomEvent('themeChanged', {
            detail: { theme: themeId, colors: theme.colors }
        }));
    }

    /**
     * קבלת נושא לפי ID
     */
    getTheme(themeId) {
        // חפש בנושאים מוגדרים מראש
        if (this.themes[themeId]) {
            return this.themes[themeId];
        }

        // חפש בנושאים מותאמים אישית
        return this.customThemes.find(theme => theme.id === themeId);
    }

    /**
     * הגדרת צבעי נושא
     */
    setThemeColors(theme) {
        const root = document.documentElement;

        Object.entries(theme.colors).forEach(([property, value]) => {
            root.style.setProperty(property, value);
        });
    }

    /**
     * עדכון תכונות נושא
     */
    updateThemeAttributes(themeId) {
        document.body.setAttribute('data-theme', themeId);
        document.body.className = document.body.className.replace(/theme-\w+/g, '');
        document.body.classList.add(`theme-${themeId}`);
    }

    /**
     * אנימציית מעבר נושא
     */
    animateThemeTransition(callback) {
        // הוסף אנימציה
        document.body.style.transition = `all ${this.transitionDuration}ms ease-in-out`;

        // בצע את השינוי
        callback();

        // הסר את האנימציה לאחר השלמה
        setTimeout(() => {
            document.body.style.transition = '';
        }, this.transitionDuration);
    }

    /**
     * יצירת נושא מותאם אישית
     */
    createCustomTheme(themeData) {
        const customTheme = {
            id: generateId('theme_'),
            name: themeData.name || 'נושא מותאם אישית',
            icon: themeData.icon || '🎨',
            colors: { ...themeData.colors },
            createdAt: new Date().toISOString(),
            isCustom: true
        };

        this.customThemes.push(customTheme);
        this.saveThemeSettings();

        return customTheme;
    }

    /**
     * עריכת נושא מותאם אישית
     */
    editCustomTheme(themeId, newData) {
        const themeIndex = this.customThemes.findIndex(t => t.id === themeId);
        if (themeIndex === -1) {
            return false;
        }

        this.customThemes[themeIndex] = {
            ...this.customThemes[themeIndex],
            ...newData,
            updatedAt: new Date().toISOString()
        };

        this.saveThemeSettings();

        // אם זה הנושא הנוכחי, החל אותו מחדש
        if (this.currentTheme === themeId) {
            this.applyTheme(themeId);
        }

        return true;
    }

    /**
     * מחיקת נושא מותאם אישית
     */
    deleteCustomTheme(themeId) {
        const themeIndex = this.customThemes.findIndex(t => t.id === themeId);
        if (themeIndex === -1) {
            return false;
        }

        this.customThemes.splice(themeIndex, 1);

        // אם זה הנושא הנוכחי, עבור לנושא ברירת מחדל
        if (this.currentTheme === themeId) {
            this.applyTheme('dark');
        }

        this.saveThemeSettings();
        return true;
    }

    /**
     * קבלת כל הנושאים
     */
    getAllThemes() {
        const presetThemes = Object.entries(this.themes).map(([id, theme]) => ({
            id,
            ...theme,
            isCustom: false
        }));

        return [...presetThemes, ...this.customThemes];
    }

    /**
     * יצירת נושא מנושא קיים
     */
    duplicateTheme(sourceThemeId, newName) {
        const sourceTheme = this.getTheme(sourceThemeId);
        if (!sourceTheme) {
            return null;
        }

        return this.createCustomTheme({
            name: newName || `${sourceTheme.name} (עותק)`,
            icon: sourceTheme.icon,
            colors: { ...sourceTheme.colors }
        });
    }

    /**
     * יבוא נושא
     */
    importTheme(themeData) {
        try {
            // ולידציה בסיסית
            if (!themeData.name || !themeData.colors) {
                throw new Error('נתוני נושא לא תקינים');
            }

            const importedTheme = this.createCustomTheme(themeData);
            showSuccess(`נושא "${importedTheme.name}" יובא בהצלחה`);

            return importedTheme;

        } catch (error) {
            showError('שגיאה ביבוא נושא: ' + error.message);
            return null;
        }
    }

    /**
     * ייצוא נושא
     */
    exportTheme(themeId) {
        const theme = this.getTheme(themeId);
        if (!theme) {
            showError('נושא לא נמצא');
            return;
        }

        const exportData = {
            name: theme.name,
            icon: theme.icon,
            colors: theme.colors,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

        const fileName = `theme-${theme.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', fileName);
        linkElement.click();

        showSuccess(`נושא "${theme.name}" יוצא בהצלחה`);
    }

    /**
     * רינדור בורר נושאים
     */
    renderThemeSelector(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const themes = this.getAllThemes();

        const selectorHTML = `
            <div class="theme-selector-container">
                <h4>🎨 בחירת ערכת נושא</h4>
                <div class="themes-grid">
                    ${themes.map(theme => this.renderThemeOption(theme)).join('')}
                </div>
                <div class="theme-actions">
                    <button class="btn btn-secondary" onclick="themeManager.showCreateThemeModal()">
                        ➕ צור נושא חדש
                    </button>
                    <button class="btn btn-secondary" onclick="themeManager.importThemeFromFile()">
                        📥 יבא נושא
                    </button>
                </div>
            </div>
        `;

        container.innerHTML = selectorHTML;
    }

    /**
     * רינדור אפשרות נושא
     */
    renderThemeOption(theme) {
        const isActive = this.currentTheme === theme.id;

        return `
            <div class="theme-option ${isActive ? 'active' : ''}"
                 onclick="themeManager.applyTheme('${theme.id}')"
                 data-theme-id="${theme.id}">
                <div class="theme-preview" style="background: ${theme.colors['--bg-primary']};">
                    <div class="theme-preview-accent" style="background: ${theme.colors['--primary-gold']};"></div>
                    <div class="theme-preview-text" style="color: ${theme.colors['--text-primary']};">
                        ${theme.icon}
                    </div>
                </div>
                <div class="theme-info">
                    <div class="theme-name">${theme.name}</div>
                    ${isActive ? '<div class="theme-active-indicator">✓ פעיל</div>' : ''}
                </div>
                ${theme.isCustom ? `
                    <div class="theme-actions">
                        <button class="action-btn" onclick="event.stopPropagation(); themeManager.editTheme('${theme.id}')" title="ערוך">
                            ✏️
                        </button>
                        <button class="action-btn" onclick="event.stopPropagation(); themeManager.exportTheme('${theme.id}')" title="יצא">
                            📤
                        </button>
                        <button class="action-btn delete" onclick="event.stopPropagation(); themeManager.deleteTheme('${theme.id}')" title="מחק">
                            🗑️
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * הצגת מודל יצירת נושא
     */
    showCreateThemeModal() {
        const modal = uiComponents.createModal({
            title: '🎨 צור נושא חדש',
            size: 'large',
            content: this.renderCreateThemeForm(),
            className: 'create-theme-modal'
        });

        modal.open();
    }

    /**
     * רינדור טופס יצירת נושא
     */
    renderCreateThemeForm() {
        return `
            <div class="create-theme-form">
                <div class="form-section">
                    <h5>📝 פרטים כלליים</h5>
                    <div class="form-group">
                        <label for="themeName">שם הנושא:</label>
                        <input type="text" id="themeName" placeholder="שם הנושא החדש" required>
                    </div>
                    <div class="form-group">
                        <label for="themeIcon">אייקון:</label>
                        <input type="text" id="themeIcon" placeholder="🎨" maxlength="2">
                    </div>
                </div>

                <div class="form-section">
                    <h5>🎨 צבעים עיקריים</h5>
                    <div class="colors-grid">
                        <div class="color-input-group">
                            <label for="bgPrimary">רקע ראשי:</label>
                            <input type="color" id="bgPrimary" value="#1a1a1a">
                        </div>
                        <div class="color-input-group">
                            <label for="bgSecondary">רקע משני:</label>
                            <input type="color" id="bgSecondary" value="#2d2d2d">
                        </div>
                        <div class="color-input-group">
                            <label for="textPrimary">טקסט ראשי:</label>
                            <input type="color" id="textPrimary" value="#ffffff">
                        </div>
                        <div class="color-input-group">
                            <label for="textSecondary">טקסט משני:</label>
                            <input type="color" id="textSecondary" value="#d1d5db">
                        </div>
                        <div class="color-input-group">
                            <label for="primaryGold">זהב ראשי:</label>
                            <input type="color" id="primaryGold" value="#DAA520">
                        </div>
                        <div class="color-input-group">
                            <label for="accentGreen">ירוק:</label>
                            <input type="color" id="accentGreen" value="#10b981">
                        </div>
                    </div>
                </div>

                <div class="form-section">
                    <h5>👁️ תצוגה מקדימה</h5>
                    <div id="themePreview" class="theme-preview-large">
                        <div class="preview-card">
                            <div class="preview-header">כותרת דוגמה</div>
                            <div class="preview-text">טקסט דוגמה</div>
                            <div class="preview-button">כפתור</div>
                        </div>
                    </div>
                </div>

                <div class="form-section">
                    <h5>📋 בסיס לנושא</h5>
                    <select id="baseTheme" onchange="themeManager.loadBaseTheme(this.value)">
                        <option value="">התחל מחדש</option>
                        ${Object.entries(this.themes).map(([id, theme]) =>
                            `<option value="${id}">${theme.name}</option>`
                        ).join('')}
                    </select>
                </div>

                <div class="modal-buttons">
                    <button class="btn btn-primary" onclick="themeManager.saveNewTheme()">💾 שמור נושא</button>
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">❌ ביטול</button>
                </div>
            </div>
        `;
    }

    /**
     * טעינת נושא בסיס
     */
    loadBaseTheme(themeId) {
        if (!themeId) return;

        const theme = this.themes[themeId];
        if (!theme) return;

        // מלא את השדות
        document.getElementById('bgPrimary').value = this.extractColorFromCSS(theme.colors['--bg-primary']);
        document.getElementById('bgSecondary').value = this.extractColorFromCSS(theme.colors['--bg-secondary']);
        document.getElementById('textPrimary').value = this.extractColorFromCSS(theme.colors['--text-primary']);
        document.getElementById('textSecondary').value = this.extractColorFromCSS(theme.colors['--text-secondary']);
        document.getElementById('primaryGold').value = this.extractColorFromCSS(theme.colors['--primary-gold']);
        document.getElementById('accentGreen').value = this.extractColorFromCSS(theme.colors['--accent-green']);

        // עדכן תצוגה מקדימה
        this.updateThemePreview();
    }

    /**
     * חילוץ צבע מCSS
     */
    extractColorFromCSS(cssColor) {
        // פונקציה פשוטה לחילוץ צבע - ניתן לשפר
        return cssColor.startsWith('#') ? cssColor : '#1a1a1a';
    }

    /**
     * עדכון תצוגה מקדימה
     */
    updateThemePreview() {
        const preview = document.getElementById('themePreview');
        if (!preview) return;

        const bgPrimary = document.getElementById('bgPrimary').value;
        const textPrimary = document.getElementById('textPrimary').value;
        const primaryGold = document.getElementById('primaryGold').value;

        preview.style.background = bgPrimary;
        preview.style.color = textPrimary;

        const button = preview.querySelector('.preview-button');
        if (button) {
            button.style.background = primaryGold;
        }
    }

    /**
     * שמירת נושא חדש
     */
    saveNewTheme() {
        const name = document.getElementById('themeName').value.trim();
        const icon = document.getElementById('themeIcon').value.trim() || '🎨';

        if (!name) {
            showError('שם הנושא נדרש');
            return;
        }

        const colors = {
            '--bg-primary': document.getElementById('bgPrimary').value,
            '--bg-secondary': document.getElementById('bgSecondary').value,
            '--bg-tertiary': this.lightenColor(document.getElementById('bgSecondary').value, 20),
            '--text-primary': document.getElementById('textPrimary').value,
            '--text-secondary': document.getElementById('textSecondary').value,
            '--text-muted': this.lightenColor(document.getElementById('textSecondary').value, -20),
            '--primary-gold': document.getElementById('primaryGold').value,
            '--primary-gold-hover': this.darkenColor(document.getElementById('primaryGold').value, 15),
            '--accent-green': document.getElementById('accentGreen').value,
            '--accent-blue': '#3b82f6',
            '--accent-red': '#ef4444',
            '--accent-yellow': '#f59e0b',
            '--accent-purple': '#8b5cf6',
            '--glass-bg': this.addAlpha(document.getElementById('textPrimary').value, 0.1),
            '--glass-border': this.addAlpha(document.getElementById('textPrimary').value, 0.2),
            '--glass-hover': this.addAlpha(document.getElementById('textPrimary').value, 0.15),
            '--shadow-sm': '0 1px 2px rgba(0, 0, 0, 0.3)',
            '--shadow-md': '0 4px 6px rgba(0, 0, 0, 0.4)',
            '--shadow-lg': '0 10px 15px rgba(0, 0, 0, 0.5)',
            '--shadow-xl': '0 20px 25px rgba(0, 0, 0, 0.6)'
        };

        const newTheme = this.createCustomTheme({
            name: name,
            icon: icon,
            colors: colors
        });

        // סגור מודל
        document.querySelector('.create-theme-modal').remove();

        // החל את הנושא החדש
        this.applyTheme(newTheme.id);

        showSuccess(`נושא "${name}" נוצר והוחל בהצלחה`);
    }

    /**
     * יבוא נושא מקובץ
     */
    importThemeFromFile() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const themeData = JSON.parse(event.target.result);
                    this.importTheme(themeData);
                } catch (error) {
                    showError('קובץ נושא לא תקין');
                }
            };

            reader.readAsText(file);
        };

        input.click();
    }

    /**
     * הכהה צבע
     */
    darkenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }

    /**
     * הבהר צבע
     */
    lightenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }

    /**
     * הוסף שקיפות לצבע
     */
    addAlpha(color, alpha) {
        const num = parseInt(color.replace("#", ""), 16);
        const R = (num >> 16);
        const G = (num >> 8 & 0x00FF);
        const B = (num & 0x0000FF);
        return `rgba(${R}, ${G}, ${B}, ${alpha})`;
    }

    /**
     * עריכת נושא קיים
     */
    editTheme(themeId) {
        const theme = this.getTheme(themeId);
        if (!theme || !theme.isCustom) {
            showError('ניתן לערוך רק נושאים מותאמים אישית');
            return;
        }

        // פתח מודל עריכה עם נתונים קיימים
        this.showCreateThemeModal();

        // מלא נתונים קיימים
        setTimeout(() => {
            document.getElementById('themeName').value = theme.name;
            document.getElementById('themeIcon').value = theme.icon;
            // ממלא את השאר לפי הצורך
        }, 100);
    }

    /**
     * מחיקת נושא
     */
    deleteTheme(themeId) {
        const theme = this.getTheme(themeId);
        if (!theme || !theme.isCustom) {
            showError('ניתן למחוק רק נושאים מותאמים אישית');
            return;
        }

        if (!confirm(`האם אתה בטוח שברצונך למחוק את הנושא "${theme.name}"?`)) {
            return;
        }

        if (this.deleteCustomTheme(themeId)) {
            showSuccess('הנושא נמחק בהצלחה');
            // רענן את ממשק הבחירה אם פתוח
            const container = document.querySelector('.theme-selector-container');
            if (container) {
                this.renderThemeSelector(container.parentElement.id);
            }
        }
    }

    /**
     * מעבר לנושא הבא
     */
    nextTheme() {
        const themes = this.getAllThemes();
        const currentIndex = themes.findIndex(t => t.id === this.currentTheme);
        const nextIndex = (currentIndex + 1) % themes.length;

        this.applyTheme(themes[nextIndex].id);
        showInfo(`נושא שונה ל"${themes[nextIndex].name}"`);
    }

    /**
     * מעבר לנושא הקודם
     */
    previousTheme() {
        const themes = this.getAllThemes();
        const currentIndex = themes.findIndex(t => t.id === this.currentTheme);
        const prevIndex = currentIndex === 0 ? themes.length - 1 : currentIndex - 1;

        this.applyTheme(themes[prevIndex].id);
        showInfo(`נושא שונה ל"${themes[prevIndex].name}"`);
    }

    /**
     * מעבר בהיר/כהה מהיר
     */
    toggleDarkLight() {
        if (this.currentTheme === 'dark') {
            this.applyTheme('light');
        } else if (this.currentTheme === 'light') {
            this.applyTheme('dark');
        } else if (this.currentTheme === 'black_cream') {
            this.applyTheme('cream_black');
        } else if (this.currentTheme === 'cream_black') {
            this.applyTheme('black_cream');
        } else {
            // אם נושא אחר, עבור לכהה
            this.applyTheme('dark');
        }
    }

    /**
     * קישור אירועים
     */
    bindEvents() {
        // האזן לשינוי העדפת מערכת
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addListener(() => {
            if (DataManager.getSetting('currentTheme') === 'auto') {
                const prefersDark = mediaQuery.matches;
                this.applyTheme(prefersDark ? 'dark' : 'light', false);
            }
        });

        // עדכון תצוגה מקדימה בטפסים
        document.addEventListener('input', (e) => {
            if (e.target.closest('.create-theme-form')) {
                this.updateThemePreview();
            }
        });

        // קיצורי דרך
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'j': // Ctrl+J למעבר נושא
                        e.preventDefault();
                        this.toggleDarkLight();
                        break;
                    case 'ArrowRight': // Ctrl+→ לנושא הבא
                        if (e.altKey) {
                            e.preventDefault();
                            this.nextTheme();
                        }
                        break;
                    case 'ArrowLeft': // Ctrl+← לנושא הקודם
                        if (e.altKey) {
                            e.preventDefault();
                            this.previousTheme();
                        }
                        break;
                }
            }
        });
    }

    /**
     * קבלת מידע נושא נוכחי
     */
    getCurrentThemeInfo() {
        const theme = this.getTheme(this.currentTheme);
        return {
            id: this.currentTheme,
            name: theme?.name || 'לא ידוע',
            icon: theme?.icon || '🎨',
            isCustom: theme?.isCustom || false,
            colors: theme?.colors || {}
        };
    }

    /**
     * איפוס נושאים
     */
    resetThemes() {
        if (!confirm('האם אתה בטוח שברצונך לאפס את כל הנושאים המותאמים אישית?')) {
            return;
        }

        this.customThemes = [];
        this.applyTheme('dark');
        this.saveThemeSettings();

        showSuccess('נושאים אופסו לברירת מחדל');
    }
}

// יצירת מופע יחיד
const themeManager = new ThemeManager();

// הוספת CSS לנושאים
const themeStyles = document.createElement('style');
themeStyles.textContent = `
    /* מעברים חלקים */
    body {
        transition: background-color 0.3s ease, color 0.3s ease;
    }

    .theme-selector-container {
        padding: 1.5rem;
        background: var(--glass-bg);
        border-radius: var(--border-radius-lg);
        border: 1px solid var(--glass-border);
    }

    .themes-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        margin: 1rem 0;
    }

    .theme-option {
        background: var(--glass-bg);
        border: 2px solid var(--glass-border);
        border-radius: var(--border-radius);
        padding: 1rem;
        cursor: pointer;
        transition: all 0.2s ease;
        position: relative;
    }

    .theme-option:hover {
        border-color: var(--primary-gold);
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
    }

    .theme-option.active {
        border-color: var(--primary-gold);
        background: rgba(218, 165, 32, 0.1);
        box-shadow: 0 0 20px rgba(218, 165, 32, 0.2);
    }

    .theme-preview {
        width: 100%;
        height: 80px;
        border-radius: var(--border-radius);
        position: relative;
        overflow: hidden;
        margin-bottom: 0.75rem;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .theme-preview-accent {
        position: absolute;
        top: 0;
        right: 0;
        width: 30%;
        height: 100%;
        opacity: 0.3;
    }

    .theme-preview-text {
        font-size: 2rem;
        z-index: 1;
    }

    .theme-name {
        font-weight: 700;
        color: var(--text-primary);
        text-align: center;
        margin-bottom: 0.25rem;
    }

    .theme-active-indicator {
        color: var(--accent-green);
        font-size: 0.85rem;
        text-align: center;
        font-weight: 600;
    }

    .theme-actions {
        position: absolute;
        top: 0.5rem;
        left: 0.5rem;
        display: flex;
        gap: 0.25rem;
        opacity: 0;
        transition: opacity 0.2s ease;
    }

    .theme-option:hover .theme-actions {
        opacity: 1;
    }

    .action-btn {
        background: var(--glass-bg);
        border: 1px solid var(--glass-border);
        border-radius: 50%;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 0.8rem;
        transition: all 0.2s ease;
    }

    .action-btn:hover {
        background: var(--primary-gold);
        color: black;
    }

    .action-btn.delete:hover {
        background: var(--accent-red);
        color: white;
    }

    /* טופס יצירת נושא */
    .create-theme-form {
        max-width: 600px;
    }

    .form-section {
        margin-bottom: 2rem;
        padding: 1.5rem;
        background: var(--glass-bg);
        border-radius: var(--border-radius);
        border: 1px solid var(--glass-border);
    }

    .form-section h5 {
        color: var(--primary-gold);
        margin-bottom: 1rem;
        font-weight: 700;
    }

    .colors-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 1rem;
    }

    .color-input-group {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
    }

    .color-input-group label {
        font-size: 0.9rem;
        color: var(--text-secondary);
        text-align: center;
    }

    .color-input-group input[type="color"] {
        width: 50px;
        height: 50px;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        transition: transform 0.2s ease;
    }

    .color-input-group input[type="color"]:hover {
        transform: scale(1.1);
    }

    .theme-preview-large {
        background: var(--bg-primary);
        border-radius: var(--border-radius);
        padding: 1.5rem;
        min-height: 120px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
    }

    .preview-card {
        background: var(--glass-bg);
        border: 1px solid var(--glass-border);
        border-radius: var(--border-radius);
        padding: 1rem;
        text-align: center;
        max-width: 200px;
    }

    .preview-header {
        font-weight: 700;
        margin-bottom: 0.5rem;
        color: var(--text-primary);
    }

    .preview-text {
        color: var(--text-secondary);
        margin-bottom: 1rem;
        font-size: 0.9rem;
    }

    .preview-button {
        background: var(--primary-gold);
        color: black;
        padding: 0.5rem 1rem;
        border-radius: var(--border-radius);
        font-weight: 600;
        font-size: 0.9rem;
    }

    /* כפתור נושא בניווט */
    .theme-nav-btn {
        background: var(--glass-bg);
        border: 1px solid var(--glass-border);
        border-radius: var(--border-radius);
        padding: 0.5rem;
        cursor: pointer;
        color: var(--text-primary);
        font-size: 1.2rem;
        transition: all 0.2s ease;
        backdrop-filter: blur(10px);
    }

    .theme-nav-btn:hover {
        background: var(--primary-gold);
        color: black;
        transform: rotate(180deg);
    }

    /* כפתור החלפה מהיר */
    .theme-toggle-btn {
        position: fixed;
        top: 20px;
        left: 20px;
        background: var(--glass-bg);
        border: 1px solid var(--glass-border);
        border-radius: 50%;
        width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 1.2rem;
        z-index: 1000;
        transition: all 0.2s ease;
        backdrop-filter: blur(10px);
    }

    .theme-toggle-btn:hover {
        background: var(--primary-gold);
        color: black;
        transform: scale(1.1);
    }

    /* התאמה למובייל */
    @media (max-width: 768px) {
        .themes-grid {
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        }

        .colors-grid {
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        }

        .theme-toggle-btn {
            width: 45px;
            height: 45px;
            top: 15px;
            left: 15px;
        }
    }

    /* אנימציות נושא */
    @keyframes themeChange {
        0% { opacity: 0.8; transform: scale(0.98); }
        50% { opacity: 0.9; transform: scale(1.01); }
        100% { opacity: 1; transform: scale(1); }
    }

    .theme-changing {
        animation: themeChange 0.3s ease;
    }
`;

document.head.appendChild(themeStyles);

// פונקציות גלובליות
window.toggleTheme = () => themeManager.toggleDarkLight();
window.nextTheme = () => themeManager.nextTheme();
window.previousTheme = () => themeManager.previousTheme();

// הוספת כפתור החלפה מהיר
document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'theme-toggle-btn';
    toggleBtn.innerHTML = '🎨';
    toggleBtn.title = 'החלף נושא (Ctrl+J)';
    toggleBtn.onclick = () => themeManager.toggleDarkLight();

    document.body.appendChild(toggleBtn);
});

// עדכן את settings-management לכלול את מנהל הנושאים
if (typeof settingsManagement !== 'undefined') {
    // הוסף לטאב הגדרות
    const originalLoadSettingsManagement = settingsManagement.loadSettingsManagement;
    settingsManagement.loadSettingsManagement = function() {
        originalLoadSettingsManagement.call(this);

        // הוסף בורר נושאים לטאב הגדרות
        const settingsContainer = document.getElementById('settingsTab');
        if (settingsContainer) {
            const themeSection = document.createElement('div');
            themeSection.innerHTML = `
                <div class="settings-section">
                    <div id="themeSelector"></div>
                </div>
            `;
            settingsContainer.appendChild(themeSection);

            // רנדר בורר נושאים
            themeManager.renderThemeSelector('themeSelector');
        }
    };
}

// הודעת ברוכים הבאים עם מידע על נושאים
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const currentTheme = themeManager.getCurrentThemeInfo();
        console.log(`🎨 נושא פעיל: ${currentTheme.name} ${currentTheme.icon}`);
        console.log('💡 טיפ: לחץ Ctrl+J להחלפה מהירה בין בהיר וכהה');
        console.log('💡 טיפ: לחץ Ctrl+Alt+→/← למעבר בין נושאים');
    }, 2000);
});