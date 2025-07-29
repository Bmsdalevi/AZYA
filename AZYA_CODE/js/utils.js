
    <!-- UTILS.JS -->
    <div class="file-section">
        <div class="file-title">📁 js/utils.js</div>
        <button class="download-btn" onclick="downloadFile('utils.js', utilsCode)">💾 הורד קובץ</button>
        <div class="code-block" id="utilsCode">// js/utils.js - פונקציות עזר כלליות

            /**
            * עיצוב מחיר בשקלים
            */
            function formatPrice(price) {
            if (typeof price !== 'number') {
            price = parseFloat(price) || 0;
            }
            return `₪${price.toFixed(0)}`;
            }

            /**
            * יצירת מזהה ייחודי
            */
            function generateId(prefix = '') {
            const timestamp = Date.now().toString(36);
            const random = Math.random().toString(36).substr(2, 5);
            return prefix + timestamp + random;
            }

            /**
            * ניקוי מזהה לשימוש בHTML
            */
            function sanitizeId(text) {
            return text
            .toLowerCase()
            .replace(/[^a-z0-9\u0590-\u05ff]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '');
            }

            /**
            * עיצוב תאריך
            */
            function formatDate(date, format = 'short') {
            if (!date) return '';

            const d = new Date(date);
            if (isNaN(d.getTime())) return '';

            const options = {
            short: {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
            },
            long: {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
            },
            date: {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
            },
            time: {
            hour: '2-digit',
            minute: '2-digit'
            }
            };

            return d.toLocaleDateString('he-IL', options[format] || options.short);
            }

            /**
            * עיצוב מספר טלפון
            */
            function formatPhone(phone) {
            if (!phone) return '';

            // הסר תווים שאינם ספרות
            const digits = phone.replace(/\D/g, '');

            // אם מתחיל ב-972, הסר את הקידומת
            if (digits.startsWith('972')) {
            const local = digits.substring(3);
            return formatIsraeliPhone(local);
            }

            return formatIsraeliPhone(digits);
            }

            function formatIsraeliPhone(digits) {
            if (digits.length === 10) {
            // פורמט: 0XX-XXX-XXXX
            return `${digits.substring(0, 3)}-${digits.substring(3, 6)}-${digits.substring(6)}`;
            } else if (digits.length === 9) {
            // הוסף 0 בהתחלה
            return `0${digits.substring(0, 2)}-${digits.substring(2, 5)}-${digits.substring(5)}`;
            }

            return digits;
            }

            /**
            * ולידציה של אימייל
            */
            function validateEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
            }

            /**
            * ולידציה של מספר טלפון ישראלי
            */
            function validatePhone(phone) {
            const digits = phone.replace(/\D/g, '');

            // בדוק פורמטים ישראליים נפוצים
            const patterns = [
            /^05[0-9]{8}$/, // נייד
            /^0[2-4,8-9][0-9]{7}$/, // קווי
            /^972[0-9]{8,9}$/ // עם קידומת בינלאומית
            ];

            return patterns.some(pattern => pattern.test(digits));
            }

            /**
            * המתנה אסינכרונית
            */
            function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
            }

            /**
            * דיבאונס לפונקציות
            */
            function debounce(func, wait, immediate) {
            let timeout;
            return function executedFunction(...args) {
            const later = () => {
            timeout = null;
            if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
            };
            }

            /**
            * שעתוק טקסט ללוח
            */
            async function copyToClipboard(text) {
            try {
            await navigator.clipboard.writeText(text);
            return true;
            } catch (err) {
            // גיבוי לדפדפנים ישנים
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            try {
            document.execCommand('copy');
            document.body.removeChild(textArea);
            return true;
            } catch (fallbackErr) {
            document.body.removeChild(textArea);
            return false;
            }
            }
            }

            /**
            * בדיקת תמיכה בLocalStorage
            */
            function isLocalStorageAvailable() {
            try {
            const test = '__localStorage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
            } catch (e) {
            return false;
            }
            }

            /**
            * יצירת QR קוד פשוט (טקסט בלבד)
            */
            function generateQRText(text, size = 200) {
            // יצירת URL לשירות QR חיצוני
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&format=PNG&ecc=M`;
            return qrUrl;
            }

            /**
            * יצירת קישור ביט
            */
            function generateBitLink(phone, amount, description = '') {
            const cleanPhone = phone.replace(/\D/g, '');
            const bitUrl = `https://bit.ly/pay/${cleanPhone}?amount=${amount}&description=${encodeURIComponent(description)}`;
            return bitUrl;
            }

            /**
            * פורמט מספר הזמנה
            */
            function generateOrderNumber(prefix = 'HZ') {
            const date = new Date();
            const year = date.getFullYear().toString().substring(2);
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const time = Date.now().toString().substring(-4);

            return `${prefix}${year}${month}${day}${time}`;
            }

            /**
            * חישוב זמן עבר יחסי
            */
            function getTimeAgo(date) {
            const now = new Date();
            const past = new Date(date);
            const diffMs = now - past;

            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);

            if (diffMins < 1) return 'עכשיו';
            if (diffMins < 60) return `לפני ${diffMins} דקות`;
            if (diffHours < 24) return `לפני ${diffHours} שעות`;
            if (diffDays < 30) return `לפני ${diffDays} ימים`;

            return formatDate(date, 'date');
            }

            /**
            * יצירת גראדיאנט רנדומלי
            */
            function generateRandomGradient() {
            const colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
            '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
            ];

            const color1 = colors[Math.floor(Math.random() * colors.length)];
            let color2 = colors[Math.floor(Math.random() * colors.length)];

            // ודא שהצבעים שונים
            while (color2 === color1) {
            color2 = colors[Math.floor(Math.random() * colors.length)];
            }

            const angle = Math.floor(Math.random() * 360);

            return `linear-gradient(${angle}deg, ${color1}, ${color2})`;
            }

            /**
            * חישוב מחיר עם הנחה
            */
            function calculateDiscount(originalPrice, discountPercent) {
            const discount = (originalPrice * discountPercent) / 100;
            const finalPrice = originalPrice - discount;

            return {
            originalPrice,
            discountPercent,
            discountAmount: discount,
            finalPrice,
            savings: discount
            };
            }

            /**
            * בדיקת חוזק סיסמה
            */
            function checkPasswordStrength(password) {
            const strength = {
            score: 0,
            feedback: []
            };

            if (password.length >= 8) {
            strength.score += 1;
            } else {
            strength.feedback.push('לפחות 8 תווים');
            }

            if (/[a-z]/.test(password)) {
            strength.score += 1;
            } else {
            strength.feedback.push('אות קטנה');
            }

            if (/[A-Z]/.test(password)) {
            strength.score += 1;
            } else {
            strength.feedback.push('אות גדולה');
            }

            if (/\d/.test(password)) {
            strength.score += 1;
            } else {
            strength.feedback.push('מספר');
            }

            if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            strength.score += 1;
            } else {
            strength.feedback.push('תו מיוחד');
            }

            const levels = ['חלש מאוד', 'חלש', 'בינוני', 'חזק', 'חזק מאוד'];
            strength.level = levels[strength.score] || levels[0];

            return strength;
            }

            // ייצוא לחלון הגלובלי
            window.formatPrice = formatPrice;
            window.generateId = generateId;
            window.sanitizeId = sanitizeId;
            window.formatDate = formatDate;
            window.formatPhone = formatPhone;
            window.validateEmail = validateEmail;
            window.validatePhone = validatePhone;
            window.sleep = sleep;
            window.debounce = debounce;
            window.copyToClipboard = copyToClipboard;
            window.isLocalStorageAvailable = isLocalStorageAvailable;
            window.generateQRText = generateQRText;
            window.generateBitLink = generateBitLink;
            window.generateOrderNumber = generateOrderNumber;
            window.getTimeAgo = getTimeAgo;
            window.generateRandomGradient = generateRandomGradient;
            window.calculateDiscount = calculateDiscount;
            window.checkPasswordStrength = checkPasswordStrength;

            console.log('✅ Utils נטען בהצלחה');
