// js/ui-components.js - רכיבי ממשק משתמש נעשדים

/**
 * מחלקה ליצירת רכיבי UI מותאמים אישית
 */
class UIComponents {
    constructor() {
        this.componentIndex = 0;
        this.init();
    }

    /**
     * אתחול רכיבי UI
     */
    init() {
        this.createButton();
        this.createInput();
        this.createCard();
        this.createModal();
        this.setupAnimations();
    }

    /**
     * יצירת מזהה ייחודי לרכיב
     */
    generateComponentId(prefix = 'component') {
        return `${prefix}_${++this.componentIndex}_${Date.now()}`;
    }

    /**
     * יצירת כפתור מותאם
     */
    createButton(options = {}) {
        const {
            text = 'לחץ כאן',
            icon = null,
            variant = 'primary', // primary, secondary, success, danger, warning
            size = 'medium', // small, medium, large
            disabled = false,
            loading = false,
            onClick = null,
            className = '',
            id = null
        } = options;

        const button = document.createElement('button');
        button.id = id || this.generateComponentId('btn');
        button.className = `btn btn-${variant} btn-${size} ${className}`.trim();

        if (disabled || loading) {
            button.disabled = true;
        }

        if (loading) {
            button.classList.add('loading');
            button.innerHTML = `
                <span class="btn-spinner"></span>
                <span class="btn-text">${text}</span>
            `;
        } else {
            button.innerHTML = `
                ${icon ? `<span class="btn-icon">${icon}</span>` : ''}
                <span class="btn-text">${text}</span>
            `;
        }

        if (onClick && typeof onClick === 'function') {
            button.addEventListener('click', onClick);
        }

        return button;
    }

    /**
     * יצירת שדה קלט מותאם
     */
    createInput(options = {}) {
        const {
            type = 'text',
            placeholder = '',
            value = '',
            label = null,
            required = false,
            disabled = false,
            icon = null,
            validation = null,
            onChange = null,
            className = '',
            id = null
        } = options;

        const container = document.createElement('div');
        container.className = `input-group ${className}`.trim();

        const inputId = id || this.generateComponentId('input');

        // תווית
        if (label) {
            const labelEl = document.createElement('label');
            labelEl.setAttribute('for', inputId);
            labelEl.className = 'input-label';
            labelEl.textContent = label;
            if (required) {
                labelEl.innerHTML += ' <span class="required">*</span>';
            }
            container.appendChild(labelEl);
        }

        // קונטיינר השדה
        const inputContainer = document.createElement('div');
        inputContainer.className = 'input-container';

        // אייקון (אם יש)
        if (icon) {
            const iconEl = document.createElement('span');
            iconEl.className = 'input-icon';
            iconEl.innerHTML = icon;
            inputContainer.appendChild(iconEl);
        }

        // שדה הקלט
        const input = document.createElement('input');
        input.id = inputId;
        input.type = type;
        input.placeholder = placeholder;
        input.value = value;
        input.className = 'input-field';
        input.required = required;
        input.disabled = disabled;

        if (icon) {
            input.classList.add('has-icon');
        }

        // אירועים
        if (onChange && typeof onChange === 'function') {
            input.addEventListener('input', onChange);
        }

        if (validation && typeof validation === 'function') {
            input.addEventListener('blur', () => {
                this.validateInput(input, validation);
            });
        }

        inputContainer.appendChild(input);
        container.appendChild(inputContainer);

        // הודעת שגיאה
        const errorEl = document.createElement('div');
        errorEl.className = 'input-error';
        errorEl.style.display = 'none';
        container.appendChild(errorEl);

        return { container, input, error: errorEl };
    }

    /**
     * ולידציה של שדה קלט
     */
    validateInput(input, validator) {
        const container = input.closest('.input-group');
        const errorEl = container?.querySelector('.input-error');

        if (!container || !errorEl) return true;

        try {
            const result = validator(input.value);

            if (result === true) {
                // תקין
                input.classList.remove('error');
                errorEl.style.display = 'none';
                return true;
            } else {
                // שגיאה
                input.classList.add('error');
                errorEl.textContent = result || 'שדה לא תקין';
                errorEl.style.display = 'block';
                return false;
            }
        } catch (error) {
            console.error('שגיאה בולידציה:', error);
            return false;
        }
    }

    /**
     * יצירת כרטיס מותאם
     */
    createCard(options = {}) {
        const {
            title = null,
            subtitle = null,
            content = '',
            image = null,
            actions = [],
            variant = 'default', // default, bordered, elevated, glass
            className = '',
            onClick = null
        } = options;

        const card = document.createElement('div');
        card.className = `card card-${variant} ${className}`.trim();

        if (onClick && typeof onClick === 'function') {
            card.classList.add('clickable');
            card.addEventListener('click', onClick);
        }

        let cardHTML = '';

        // תמונה
        if (image) {
            cardHTML += `
                <div class="card-image">
                    <img src="${image}" alt="${title || ''}" loading="lazy">
                </div>
            `;
        }

        // תוכן
        cardHTML += '<div class="card-content">';

        if (title || subtitle) {
            cardHTML += '<div class="card-header">';
            if (title) {
                cardHTML += `<h3 class="card-title">${title}</h3>`;
            }
            if (subtitle) {
                cardHTML += `<p class="card-subtitle">${subtitle}</p>`;
            }
            cardHTML += '</div>';
        }

        if (content) {
            cardHTML += `<div class="card-body">${content}</div>`;
        }

        cardHTML += '</div>';

        // פעולות
        if (actions.length > 0) {
            cardHTML += '<div class="card-actions">';
            actions.forEach(action => {
                if (typeof action === 'string') {
                    cardHTML += action;
                } else if (action.type === 'button') {
                    const btn = this.createButton(action);
                    cardHTML += btn.outerHTML;
                }
            });
            cardHTML += '</div>';
        }

        card.innerHTML = cardHTML;
        return card;
    }

    /**
     * יצירת מודל מותאם
     */
    createModal(options = {}) {
        const {
            title = '',
            content = '',
            size = 'medium', // small, medium, large, fullscreen
            closable = true,
            backdrop = true,
            className = '',
            onOpen = null,
            onClose = null
        } = options;

        const modalId = this.generateComponentId('modal');

        const modalHTML = `
            <div class="modal modal-${size} ${className}" id="${modalId}" style="display: none;">
                <div class="modal-backdrop"></div>
                <div class="modal-container">
                    <div class="modal-content">
                        ${title ? `
                            <div class="modal-header">
                                <h2 class="modal-title">${title}</h2>
                                ${closable ? `
                                    <button class="modal-close" type="button" aria-label="סגור">
                                        <span>&times;</span>
                                    </button>
                                ` : ''}
                            </div>
                        ` : ''}

                        <div class="modal-body">
                            ${content}
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const modal = document.getElementById(modalId);

        // אירועים
        if (closable) {
            const closeBtn = modal.querySelector('.modal-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.closeModal(modalId));
            }

            if (backdrop) {
                modal.querySelector('.modal-backdrop').addEventListener('click', () => {
                    this.closeModal(modalId);
                });
            }
        }

        // ESC לסגירה
        const escHandler = (e) => {
            if (e.key === 'Escape' && closable) {
                this.closeModal(modalId);
            }
        };

        modal._escHandler = escHandler;

        return {
            id: modalId,
            element: modal,
            open: () => this.openModal(modalId, onOpen),
            close: () => this.closeModal(modalId, onClose),
            setContent: (newContent) => {
                const body = modal.querySelector('.modal-body');
                if (body) body.innerHTML = newContent;
            }
        };
    }

    /**
     * פתיחת מודל
     */
    openModal(modalId, onOpen = null) {
        const modal = document.getElementById(modalId);
        if (!modal) return false;

        modal.style.display = 'flex';
        modal.classList.add('opening');
        document.body.classList.add('modal-open');

        // הוסף מאזין ESC
        if (modal._escHandler) {
            document.addEventListener('keydown', modal._escHandler);
        }

        setTimeout(() => {
            modal.classList.remove('opening');
            modal.classList.add('open');

            if (onOpen && typeof onOpen === 'function') {
                onOpen(modal);
            }
        }, 10);

        return true;
    }

    /**
     * סגירת מודל
     */
    closeModal(modalId, onClose = null) {
        const modal = document.getElementById(modalId);
        if (!modal) return false;

        modal.classList.remove('open');
        modal.classList.add('closing');

        // הסר מאזין ESC
        if (modal._escHandler) {
            document.removeEventListener('keydown', modal._escHandler);
        }

        setTimeout(() => {
            modal.style.display = 'none';
            modal.classList.remove('closing');

            // הסר קלאס מהגוף אם אין מודלים נוספים
            if (!document.querySelector('.modal.open')) {
                document.body.classList.remove('modal-open');
            }

            if (onClose && typeof onClose === 'function') {
                onClose(modal);
            }
        }, 300);

        return true;
    }

    /**
     * יצירת טוסט
     */
    createToast(options = {}) {
        const {
            message = '',
            type = 'info', // success, error, warning, info
            duration = 4000,
            position = 'top-right', // top-right, top-left, bottom-right, bottom-left, top-center, bottom-center
            closable = true,
            icon = null
        } = options;

        const toastId = this.generateComponentId('toast');

        // מצא או צור קונטיינר
        let container = document.querySelector(`.toast-container.${position}`);
        if (!container) {
            container = document.createElement('div');
            container.className = `toast-container ${position}`;
            document.body.appendChild(container);
        }

        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        const toastHTML = `
            <div class="toast toast-${type}" id="${toastId}">
                <div class="toast-content">
                    <span class="toast-icon">${icon || icons[type] || icons.info}</span>
                    <span class="toast-message">${message}</span>
                </div>
                ${closable ? `
                    <button class="toast-close" onclick="uiComponents.closeToast('${toastId}')">
                        <span>&times;</span>
                    </button>
                ` : ''}
            </div>
        `;

        container.insertAdjacentHTML('beforeend', toastHTML);
        const toast = document.getElementById(toastId);

        // אנימציית כניסה
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        // הסרה אוטומטית
        if (duration > 0) {
            setTimeout(() => {
                this.closeToast(toastId);
            }, duration);
        }

        return toastId;
    }

    /**
     * סגירת טוסט
     */
    closeToast(toastId) {
        const toast = document.getElementById(toastId);
        if (!toast) return;

        toast.classList.remove('show');
        toast.classList.add('hide');

        setTimeout(() => {
            toast.remove();

            // נקה קונטיינר אם ריק
            const container = toast.parentElement;
            if (container && container.children.length === 0) {
                container.remove();
            }
        }, 300);
    }

    /**
     * יצירת ספינר טעינה
     */
    createSpinner(options = {}) {
        const {
            size = 'medium', // small, medium, large
            color = 'primary',
            className = ''
        } = options;

        const spinner = document.createElement('div');
        spinner.className = `spinner spinner-${size} spinner-${color} ${className}`.trim();

        return spinner;
    }

    /**
     * יצירת תג
     */
    createBadge(options = {}) {
        const {
            text = '',
            variant = 'default', // default, primary, success, warning, danger, info
            size = 'medium', // small, medium, large
            className = ''
        } = options;

        const badge = document.createElement('span');
        badge.className = `badge badge-${variant} badge-${size} ${className}`.trim();
        badge.textContent = text;

        return badge;
    }

    /**
     * יצירת בר התקדמות
     */
    createProgressBar(options = {}) {
        const {
            value = 0,
            max = 100,
            variant = 'primary',
            size = 'medium',
            animated = false,
            striped = false,
            showLabel = false,
            className = ''
        } = options;

        const progressId = this.generateComponentId('progress');
        const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

        const progressBar = document.createElement('div');
        progressBar.id = progressId;
        progressBar.className = `progress progress-${size} ${animated ? 'animated' : ''} ${striped ? 'striped' : ''} ${className}`.trim();

        progressBar.innerHTML = `
            <div class="progress-bar progress-bar-${variant}"
                 style="width: ${percentage}%"
                 role="progressbar"
                 aria-valuenow="${value}"
                 aria-valuemin="0"
                 aria-valuemax="${max}">
                ${showLabel ? `<span class="progress-label">${Math.round(percentage)}%</span>` : ''}
            </div>
        `;

        return {
            element: progressBar,
            setValue: (newValue) => {
                const newPercentage = Math.min(Math.max((newValue / max) * 100, 0), 100);
                const bar = progressBar.querySelector('.progress-bar');
                bar.style.width = `${newPercentage}%`;
                bar.setAttribute('aria-valuenow', newValue);

                if (showLabel) {
                    const label = bar.querySelector('.progress-label');
                    if (label) label.textContent = `${Math.round(newPercentage)}%`;
                }
            }
        };
    }

    /**
     * יצירת רכיב אקורדיון
     */
    createAccordion(options = {}) {
        const {
            items = [],
            multiple = false, // אפשר פתיחת מספר פנלים
            className = ''
        } = options;

        const accordionId = this.generateComponentId('accordion');
        const accordion = document.createElement('div');
        accordion.id = accordionId;
        accordion.className = `accordion ${className}`.trim();

        items.forEach((item, index) => {
            const itemId = `${accordionId}_item_${index}`;
            const isOpen = item.open || false;

            const itemHTML = `
                <div class="accordion-item ${isOpen ? 'open' : ''}" data-item="${itemId}">
                    <div class="accordion-header" onclick="uiComponents.toggleAccordionItem('${accordionId}', '${itemId}', ${multiple})">
                        <span class="accordion-title">${item.title}</span>
                        <span class="accordion-icon">▼</span>
                    </div>
                    <div class="accordion-content" ${isOpen ? 'style="display: block;"' : ''}>
                        <div class="accordion-body">
                            ${item.content}
                        </div>
                    </div>
                </div>
            `;

            accordion.insertAdjacentHTML('beforeend', itemHTML);
        });

        return accordion;
    }

    /**
     * החלפת מצב פריט אקורדיון
     */
    toggleAccordionItem(accordionId, itemId, multiple = false) {
        const accordion = document.getElementById(accordionId);
        if (!accordion) return;

        const item = accordion.querySelector(`[data-item="${itemId}"]`);
        if (!item) return;

        const isOpen = item.classList.contains('open');

        if (!multiple) {
            // סגור כל הפריטים האחרים
            accordion.querySelectorAll('.accordion-item.open').forEach(openItem => {
                if (openItem !== item) {
                    openItem.classList.remove('open');
                    const content = openItem.querySelector('.accordion-content');
                    if (content) content.style.display = 'none';
                }
            });
        }

        // החלף מצב הפריט הנוכחי
        if (isOpen) {
            item.classList.remove('open');
            const content = item.querySelector('.accordion-content');
            if (content) content.style.display = 'none';
        } else {
            item.classList.add('open');
            const content = item.querySelector('.accordion-content');
            if (content) content.style.display = 'block';
        }
    }

    /**
     * הגדרת אנימציות
     */
    setupAnimations() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }

            @keyframes slideIn {
                from { transform: translateX(-100%); }
                to { transform: translateX(0); }
            }

            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }

            .animate-fadeIn { animation: fadeIn 0.3s ease; }
            .animate-slideIn { animation: slideIn 0.3s ease; }
            .animate-pulse { animation: pulse 2s infinite; }
        `;

        document.head.appendChild(style);
    }

    /**
     * יצירת רכיב דירוג כוכבים
     */
    createStarRating(options = {}) {
        const {
            rating = 0,
            maxStars = 5,
            interactive = false,
            size = 'medium',
            onChange = null,
            className = ''
        } = options;

        const ratingId = this.generateComponentId('rating');
        const container = document.createElement('div');
        container.id = ratingId;
        container.className = `star-rating star-rating-${size} ${interactive ? 'interactive' : ''} ${className}`.trim();

        for (let i = 1; i <= maxStars; i++) {
            const star = document.createElement('span');
            star.className = `star ${i <= rating ? 'filled' : ''}`;
            star.innerHTML = '★';
            star.dataset.rating = i;

            if (interactive) {
                star.addEventListener('click', () => {
                    // עדכן דירוג
                    container.querySelectorAll('.star').forEach((s, index) => {
                        s.classList.toggle('filled', index < i);
                    });

                    if (onChange && typeof onChange === 'function') {
                        onChange(i);
                    }
                });

                star.addEventListener('mouseenter', () => {
                    container.querySelectorAll('.star').forEach((s, index) => {
                        s.classList.toggle('hover', index < i);
                    });
                });

                container.addEventListener('mouseleave', () => {
                    container.querySelectorAll('.star').forEach(s => {
                        s.classList.remove('hover');
                    });
                });
            }

            container.appendChild(star);
        }

        return container;
    }
}

// יצירת מופע יחיד
const uiComponents = new UIComponents();