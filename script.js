class AccessibleColorPalette {
    constructor() {
        this.colors = [];
        this.init();
    }

    init() {
        this.currentView = 'simple';
        this.initTheme();
        this.bindEvents();
        this.generateInitialPalette();
        this.updateContrastChecker();
    }

    initTheme() {
        // Verificar si hay un tema guardado en localStorage
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.setTheme(savedTheme);
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        const themeToggle = document.getElementById('themeToggle');
        const themeIcon = themeToggle.querySelector('.theme-icon');
        const themeText = themeToggle.querySelector('.theme-text');
        
        if (theme === 'dark') {
            themeIcon.textContent = '☀️';
            themeText.textContent = 'Modo Claro';
        } else {
            themeIcon.textContent = '🌙';
            themeText.textContent = 'Modo Oscuro';
        }
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }

    bindEvents() {
        document.getElementById('generateBtn').addEventListener('click', () => this.generatePalette());
        document.getElementById('exportCssBtn').addEventListener('click', () => this.exportCSS());
        document.getElementById('exportJsonBtn').addEventListener('click', () => this.exportJSON());
        
        // Theme toggle event
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
        
        // View toggle events
        document.getElementById('simpleViewBtn').addEventListener('click', () => this.switchView('simple'));
        document.getElementById('advancedViewBtn').addEventListener('click', () => this.switchView('advanced'));
        
        // Simple view events
        document.getElementById('foregroundColor').addEventListener('input', (e) => {
            document.getElementById('foregroundHex').value = e.target.value;
            this.updateContrastChecker();
        });
        
        document.getElementById('backgroundColor').addEventListener('input', (e) => {
            document.getElementById('backgroundHex').value = e.target.value;
            this.updateContrastChecker();
        });
        
        document.getElementById('foregroundHex').addEventListener('input', (e) => {
            if (this.isValidHex(e.target.value)) {
                document.getElementById('foregroundColor').value = e.target.value;
                this.updateContrastChecker();
            }
        });
        
        document.getElementById('backgroundHex').addEventListener('input', (e) => {
            if (this.isValidHex(e.target.value)) {
                document.getElementById('backgroundColor').value = e.target.value;
                this.updateContrastChecker();
            }
        });

        // Advanced view events
        this.bindAdvancedColorEvents();
    }

    bindAdvancedColorEvents() {
        const colorInputs = [
            'advBackground', 'title', 'paragraph', 'hr', 'buttonBg', 'buttonText'
        ];

        colorInputs.forEach(inputName => {
            const colorInput = document.getElementById(`${inputName}Color`);
            const hexInput = document.getElementById(`${inputName}Hex`);

            if (colorInput && hexInput) {
                colorInput.addEventListener('input', (e) => {
                    hexInput.value = e.target.value;
                    this.updateContrastChecker();
                });

                hexInput.addEventListener('input', (e) => {
                    if (this.isValidHex(e.target.value)) {
                        colorInput.value = e.target.value;
                        this.updateContrastChecker();
                    }
                });
            }
        });
    }

    switchView(view) {
        this.currentView = view;
        
        // Update button states
        document.getElementById('simpleViewBtn').classList.toggle('active', view === 'simple');
        document.getElementById('advancedViewBtn').classList.toggle('active', view === 'advanced');
        
        // Show/hide content
        document.getElementById('simpleView').classList.toggle('hidden', view !== 'simple');
        document.getElementById('advancedView').classList.toggle('hidden', view !== 'advanced');
        
        // Show/hide results
        document.getElementById('simpleResults').classList.toggle('hidden', view !== 'simple');
        document.getElementById('advancedResults').classList.toggle('hidden', view !== 'advanced');
        
        this.updateContrastChecker();
    }

    generateInitialPalette() {
        // Generar paleta inicial aleatoria en lugar de usar colores fijos
        this.generatePalette();
    }

    generatePalette() {
        this.colors = [];
        
        // Generar colores base accesibles con variación aleatoria
        const baseHues = this.generateRandomHues();
        
        baseHues.forEach((hue, index) => {
            // Generar variaciones con saturación y luminosidad aleatorias pero accesibles
            // Alternar entre colores más claros y más oscuros para variedad
            const isLight = index % 2 === 0;
            const saturation = this.randomBetween(45, 90);
            const lightness = isLight 
                ? this.randomBetween(40, 60)  // Colores medios-claros
                : this.randomBetween(25, 45); // Colores medios-oscuros
            
            const color = this.hslToHex(hue, saturation, lightness);
            this.colors.push(color);
        });
        
        this.renderPalette();
    }

    generateRandomHues() {
        // Generar 8 tonos con diferentes estrategias para mayor variedad
        const strategies = [
            () => this.generateAnalogousHues(),
            () => this.generateComplementaryHues(),
            () => this.generateTriadicHues(),
            () => this.generateRandomDistributedHues()
        ];
        
        // Seleccionar estrategia aleatoria
        const strategy = strategies[Math.floor(Math.random() * strategies.length)];
        return strategy();
    }

    generateAnalogousHues() {
        // Colores análogos: tonos cercanos en el círculo cromático
        const baseHue = Math.random() * 360;
        const hues = [];
        for (let i = 0; i < 8; i++) {
            const hue = (baseHue + (i * 15) + this.randomBetween(-5, 5)) % 360;
            hues.push(Math.round(hue));
        }
        return hues;
    }

    generateComplementaryHues() {
        // Colores complementarios: pares opuestos
        const hues = [];
        for (let i = 0; i < 4; i++) {
            const baseHue = (i * 90 + this.randomBetween(-15, 15)) % 360;
            hues.push(Math.round(baseHue));
            hues.push(Math.round((baseHue + 180) % 360));
        }
        return hues;
    }

    generateTriadicHues() {
        // Colores triádicos: separados por 120 grados
        const baseHue = Math.random() * 360;
        const hues = [];
        for (let i = 0; i < 3; i++) {
            const mainHue = (baseHue + (i * 120)) % 360;
            hues.push(Math.round(mainHue));
            // Agregar variaciones cercanas
            hues.push(Math.round((mainHue + this.randomBetween(15, 30)) % 360));
            if (hues.length < 8) {
                hues.push(Math.round((mainHue - this.randomBetween(15, 30) + 360) % 360));
            }
        }
        return hues.slice(0, 8);
    }

    generateRandomDistributedHues() {
        // Distribución completamente aleatoria pero espaciada
        const hues = [];
        const baseStep = 360 / 8;
        
        for (let i = 0; i < 8; i++) {
            const baseHue = i * baseStep;
            const variation = this.randomBetween(-25, 25);
            const hue = (baseHue + variation + 360) % 360;
            hues.push(Math.round(hue));
        }
        
        return hues;
    }

    randomBetween(min, max) {
        return Math.random() * (max - min) + min;
    }

    renderPalette() {
        const paletteContainer = document.getElementById('colorPalette');
        paletteContainer.innerHTML = '';
        
        this.colors.forEach((color, index) => {
            const colorCard = document.createElement('div');
            colorCard.className = 'color-card';
            
            colorCard.innerHTML = `
                <div class="color-swatch" style="background-color: ${color}">
                    <input type="color" class="color-editor" value="${color}" data-index="${index}">
                </div>
                <div class="color-info">
                    <div class="color-hex">${color}</div>
                    <button class="copy-btn" data-color="${color}">Copiar</button>
                </div>
            `;
            
            paletteContainer.appendChild(colorCard);
        });
        
        // Bind events for color editing and copying
        this.bindPaletteEvents();
    }

    bindPaletteEvents() {
        // Copy buttons
        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const color = e.target.dataset.color;
                navigator.clipboard.writeText(color).then(() => {
                    e.target.textContent = '¡Copiado!';
                    e.target.classList.add('copied');
                    setTimeout(() => {
                        e.target.textContent = 'Copiar';
                        e.target.classList.remove('copied');
                    }, 1000);
                });
            });
        });
        
        // Color editors
        document.querySelectorAll('.color-editor').forEach(editor => {
            editor.addEventListener('input', (e) => {
                const index = parseInt(e.target.dataset.index);
                const newColor = e.target.value;
                this.colors[index] = newColor;
                
                // Update the display
                const colorCard = e.target.closest('.color-card');
                const swatch = colorCard.querySelector('.color-swatch');
                const hex = colorCard.querySelector('.color-hex');
                const copyBtn = colorCard.querySelector('.copy-btn');
                
                swatch.style.backgroundColor = newColor;
                hex.textContent = newColor;
                copyBtn.dataset.color = newColor;
            });
        });
    }

    updateContrastChecker() {
        if (this.currentView === 'simple') {
            this.updateSimpleView();
        } else {
            this.updateAdvancedView();
        }
    }

    updateSimpleView() {
        const foreground = document.getElementById('foregroundColor').value;
        const background = document.getElementById('backgroundColor').value;
        
        const ratio = this.calculateContrastRatio(foreground, background);
        
        document.getElementById('contrastRatio').textContent = `${ratio.toFixed(2)}:1`;
        
        // WCAG compliance checks
        this.updateWCAGCompliance(ratio);
        
        // Update preview
        this.updatePreview(foreground, background);
        
        // Generate suggestions
        this.generateSimpleSuggestions(foreground, background, ratio);
    }

    updateAdvancedView() {
        const colors = {
            background: document.getElementById('advBackgroundColor').value,
            title: document.getElementById('titleColor').value,
            paragraph: document.getElementById('paragraphColor').value,
            hr: document.getElementById('hrColor').value,
            buttonBg: document.getElementById('buttonBgColor').value,
            buttonText: document.getElementById('buttonTextColor').value
        };

        // Calculate contrast ratios for each element
        const titleRatio = this.calculateContrastRatio(colors.title, colors.background);
        const paragraphRatio = this.calculateContrastRatio(colors.paragraph, colors.background);
        const hrRatio = this.calculateContrastRatio(colors.hr, colors.background);
        const buttonRatio = this.calculateContrastRatio(colors.buttonText, colors.buttonBg);

        // Update contrast displays
        document.getElementById('titleContrast').textContent = `${titleRatio.toFixed(2)}:1`;
        document.getElementById('paragraphContrast').textContent = `${paragraphRatio.toFixed(2)}:1`;
        document.getElementById('hrContrast').textContent = `${hrRatio.toFixed(2)}:1`;
        document.getElementById('buttonContrast').textContent = `${buttonRatio.toFixed(2)}:1`;

        // Update compliance indicators
        this.updateAdvancedCompliance('title', titleRatio);
        this.updateAdvancedCompliance('paragraph', paragraphRatio);
        this.updateAdvancedCompliance('hr', hrRatio, true); // HR is decorative, lower standards
        this.updateAdvancedCompliance('button', buttonRatio);

        // Update advanced preview
        this.updateAdvancedPreview(colors);
        
        // Generate advanced suggestions
        this.generateAdvancedSuggestions(colors, {
            titleRatio, paragraphRatio, hrRatio, buttonRatio
        });
    }

    updateAdvancedCompliance(element, ratio, isDecorative = false) {
        const complianceElement = document.getElementById(`${element}Compliance`);
        let status = '';
        let className = '';

        if (isDecorative) {
            // For decorative elements like HR, 3:1 is sufficient
            if (ratio >= 3) {
                status = '✓ AA';
                className = 'pass';
            } else {
                status = '✗ FALLA';
                className = 'fail';
            }
        } else {
            // For text elements
            if (ratio >= 7) {
                status = '✓ AAA';
                className = 'pass';
            } else if (ratio >= 4.5) {
                status = '✓ AA';
                className = 'pass';
            } else {
                status = '✗ FALLA';
                className = 'fail';
            }
        }

        complianceElement.textContent = status;
        complianceElement.className = className;
    }

    updateAdvancedPreview(colors) {
        const preview = document.getElementById('contrastPreview');
        const title = preview.querySelector('h2');
        const paragraphs = preview.querySelectorAll('p');
        const hr = preview.querySelector('.preview-divider');
        const playButton = preview.querySelector('.play-button');
        const badge = preview.querySelector('.badge-text');
        const infoIcons = preview.querySelectorAll('.info-icon');
        const demoSection = preview.querySelector('.preview-demo-section');
        const demoBtnFilled = preview.querySelector('.demo-btn-filled');
        const demoBtnOutline = preview.querySelector('.demo-btn-outline');

        // Update main background and text
        preview.style.backgroundColor = colors.background;
        preview.style.color = colors.paragraph;
        
        // Update title
        if (title) title.style.color = colors.title;
        
        // Update paragraphs
        paragraphs.forEach(p => p.style.color = colors.paragraph);
        
        // Update divider
        if (hr) hr.style.backgroundColor = colors.hr;
        
        // Update play button
        if (playButton) {
            playButton.style.backgroundColor = colors.buttonBg;
            playButton.style.color = colors.buttonText;
        }
        
        // Update badge
        if (badge) {
            badge.style.backgroundColor = colors.title;
            badge.style.color = colors.background;
        }
        
        // Update info icons
        infoIcons.forEach(icon => icon.style.backgroundColor = colors.title);
        
        // Update demo section border
        if (demoSection) demoSection.style.borderColor = colors.title;
        
        // Update demo buttons
        if (demoBtnFilled) {
            demoBtnFilled.style.backgroundColor = colors.buttonBg;
            demoBtnFilled.style.color = colors.buttonText;
        }
        if (demoBtnOutline) {
            demoBtnOutline.style.color = colors.title;
            demoBtnOutline.style.borderColor = colors.title;
        }
    }

    calculateContrastRatio(color1, color2) {
        const l1 = this.getLuminance(color1);
        const l2 = this.getLuminance(color2);
        
        const lighter = Math.max(l1, l2);
        const darker = Math.min(l1, l2);
        
        return (lighter + 0.05) / (darker + 0.05);
    }

    getLuminance(hex) {
        const rgb = this.hexToRgb(hex);
        const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }

    updateWCAGCompliance(ratio) {
        const elements = {
            wcagAA: { threshold: 4.5, element: document.getElementById('wcagAA') },
            wcagAAA: { threshold: 7, element: document.getElementById('wcagAAA') },
            wcagAALarge: { threshold: 3, element: document.getElementById('wcagAALarge') },
            wcagAAALarge: { threshold: 4.5, element: document.getElementById('wcagAAALarge') }
        };
        
        Object.values(elements).forEach(({ threshold, element }) => {
            if (ratio >= threshold) {
                element.textContent = '✓ PASA';
                element.className = 'pass';
            } else {
                element.textContent = '✗ FALLA';
                element.className = 'fail';
            }
        });
    }

    updatePreview(foreground, background) {
        const preview = document.getElementById('contrastPreview');
        const title = preview.querySelector('h2');
        const paragraphs = preview.querySelectorAll('p');
        const hr = preview.querySelector('.preview-divider');
        const playButton = preview.querySelector('.play-button');
        const badge = preview.querySelector('.badge-text');
        const infoIcons = preview.querySelectorAll('.info-icon');
        const demoSection = preview.querySelector('.preview-demo-section');
        const demoBtnFilled = preview.querySelector('.demo-btn-filled');
        const demoBtnOutline = preview.querySelector('.demo-btn-outline');

        // Update main background and text
        preview.style.backgroundColor = background;
        preview.style.color = foreground;
        
        // Update title
        if (title) title.style.color = foreground;
        
        // Update paragraphs
        paragraphs.forEach(p => p.style.color = foreground);
        
        // Update divider
        if (hr) hr.style.backgroundColor = foreground;
        
        // Update play button
        if (playButton) {
            playButton.style.backgroundColor = foreground;
            playButton.style.color = background;
        }
        
        // Update badge
        if (badge) {
            badge.style.backgroundColor = foreground;
            badge.style.color = background;
        }
        
        // Update info icons
        infoIcons.forEach(icon => icon.style.backgroundColor = foreground);
        
        // Update demo section border
        if (demoSection) demoSection.style.borderColor = foreground;
        
        // Update demo buttons
        if (demoBtnFilled) {
            demoBtnFilled.style.backgroundColor = foreground;
            demoBtnFilled.style.color = background;
        }
        if (demoBtnOutline) {
            demoBtnOutline.style.color = foreground;
            demoBtnOutline.style.borderColor = foreground;
        }
    }

    exportCSS() {
        let css = ':root {\n';
        this.colors.forEach((color, index) => {
            css += `  --color-${index + 1}: ${color};\n`;
        });
        css += '}\n\n';
        
        css += '/* Clases de utilidad */\n';
        this.colors.forEach((color, index) => {
            css += `.bg-color-${index + 1} { background-color: ${color}; }\n`;
            css += `.text-color-${index + 1} { color: ${color}; }\n`;
        });
        
        this.downloadFile('palette.css', css, 'text/css');
    }

    exportJSON() {
        const paletteData = {
            colors: this.colors.map((color, index) => ({
                name: `color-${index + 1}`,
                hex: color,
                rgb: this.hexToRgb(color)
            })),
            generated: new Date().toISOString()
        };
        
        this.downloadFile('palette.json', JSON.stringify(paletteData, null, 2), 'application/json');
    }

    downloadFile(filename, content, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Utility functions
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    hslToHex(h, s, l) {
        l /= 100;
        const a = s * Math.min(l, 1 - l) / 100;
        const f = n => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0');
        };
        return `#${f(0)}${f(8)}${f(4)}`;
    }

    isValidHex(hex) {
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
    }

    // Smart suggestions system
    generateSimpleSuggestions(foreground, background, ratio) {
        const suggestions = [];
        
        // Check if contrast is insufficient
        if (ratio < 4.5) {
            suggestions.push({
                priority: 'high',
                text: 'Contraste insuficiente para WCAG AA',
                colors: this.suggestBetterContrast(foreground, background, 4.5),
                type: 'contrast-fix'
            });
        } else if (ratio < 7) {
            suggestions.push({
                priority: 'medium',
                text: 'Mejorar para cumplir WCAG AAA',
                colors: this.suggestBetterContrast(foreground, background, 7),
                type: 'contrast-improve'
            });
        }

        // Suggest complementary colors
        if (ratio >= 4.5) {
            const complementary = this.getComplementaryColors(foreground, background);
            suggestions.push({
                priority: 'low',
                text: 'Colores complementarios accesibles',
                colors: complementary,
                type: 'complementary'
            });
        }

        // Suggest monochromatic variations
        const monochromatic = this.getMonochromaticVariations(background, foreground);
        suggestions.push({
            priority: 'low',
            text: 'Variaciones monocromáticas',
            colors: monochromatic,
            type: 'monochromatic'
        });

        this.renderSuggestions('simpleSuggestionsList', suggestions, 'simple');
    }

    generateAdvancedSuggestions(colors, ratios) {
        const suggestions = [];

        // Check each element for issues
        if (ratios.titleRatio < 4.5) {
            const betterTitle = this.adjustColorForContrast(colors.title, colors.background, 4.5);
            suggestions.push({
                priority: 'high',
                text: 'Título necesita mejor contraste',
                colors: { title: betterTitle, background: colors.background },
                type: 'title-fix',
                target: 'title'
            });
        }

        if (ratios.paragraphRatio < 4.5) {
            const betterParagraph = this.adjustColorForContrast(colors.paragraph, colors.background, 4.5);
            suggestions.push({
                priority: 'high',
                text: 'Párrafos necesitan mejor contraste',
                colors: { paragraph: betterParagraph, background: colors.background },
                type: 'paragraph-fix',
                target: 'paragraph'
            });
        }

        if (ratios.buttonRatio < 4.5) {
            const betterButtonText = this.adjustColorForContrast(colors.buttonText, colors.buttonBg, 4.5);
            suggestions.push({
                priority: 'high',
                text: 'Botón necesita mejor contraste',
                colors: { buttonText: betterButtonText, buttonBg: colors.buttonBg },
                type: 'button-fix',
                target: 'button'
            });
        }

        if (ratios.hrRatio < 3) {
            const betterHr = this.adjustColorForContrast(colors.hr, colors.background, 3);
            suggestions.push({
                priority: 'high',
                text: 'La línea horizontal podría ser más visible',
                colors: { hr: betterHr, background: colors.background },
                type: 'hr-fix',
                target: 'hr'
            });
        }

        // Suggest harmonious color schemes
        if (Object.values(ratios).every(r => r >= 4.5)) {
            const harmonious = this.generateHarmoniousScheme(colors.background);
            suggestions.push({
                priority: 'low',
                text: 'Esquema de colores armonioso',
                colors: harmonious,
                type: 'harmonious',
                target: 'all'
            });
        }

        // Suggest accessibility improvements
        const accessibilityTips = this.getAccessibilityTips(colors, ratios);
        suggestions.push(...accessibilityTips);

        this.renderSuggestions('advancedSuggestionsList', suggestions, 'advanced');
    }

    suggestBetterContrast(foreground, background, targetRatio) {
        const fgLuminance = this.getLuminance(foreground);
        const bgLuminance = this.getLuminance(background);
        
        let newForeground = foreground;
        
        if (fgLuminance > bgLuminance) {
            // Foreground is lighter, make it lighter or background darker
            newForeground = this.adjustLuminance(foreground, targetRatio, bgLuminance, true);
        } else {
            // Foreground is darker, make it darker or background lighter
            newForeground = this.adjustLuminance(foreground, targetRatio, bgLuminance, false);
        }
        
        return { foreground: newForeground, background };
    }

    adjustColorForContrast(color, background, targetRatio) {
        const colorLuminance = this.getLuminance(color);
        const bgLuminance = this.getLuminance(background);
        
        return this.adjustLuminance(color, targetRatio, bgLuminance, colorLuminance > bgLuminance);
    }

    adjustLuminance(color, targetRatio, bgLuminance, makeLighter) {
        const rgb = this.hexToRgb(color);
        const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
        
        let newLightness = hsl.l;
        const step = makeLighter ? 3 : -3; // Pasos más pequeños para mejor precisión
        
        // Intentar en la dirección preferida
        for (let i = 0; i < 30; i++) {
            newLightness += step;
            newLightness = Math.max(5, Math.min(95, newLightness)); // Evitar extremos
            
            const newColor = this.hslToHex(hsl.h, hsl.s, newLightness);
            const newLuminance = this.getLuminance(newColor);
            const ratio = (Math.max(newLuminance, bgLuminance) + 0.05) / (Math.min(newLuminance, bgLuminance) + 0.05);
            
            if (ratio >= targetRatio) {
                return newColor;
            }
        }
        
        // Si no funciona en una dirección, intentar en la otra
        newLightness = hsl.l;
        const oppositeStep = makeLighter ? -3 : 3;
        
        for (let i = 0; i < 30; i++) {
            newLightness += oppositeStep;
            newLightness = Math.max(5, Math.min(95, newLightness));
            
            const newColor = this.hslToHex(hsl.h, hsl.s, newLightness);
            const newLuminance = this.getLuminance(newColor);
            const ratio = (Math.max(newLuminance, bgLuminance) + 0.05) / (Math.min(newLuminance, bgLuminance) + 0.05);
            
            if (ratio >= targetRatio) {
                return newColor;
            }
        }
        
        // Como último recurso, usar blanco o negro según el fondo
        const whiteLuminance = 1;
        const blackLuminance = 0;
        const whiteRatio = (Math.max(whiteLuminance, bgLuminance) + 0.05) / (Math.min(whiteLuminance, bgLuminance) + 0.05);
        const blackRatio = (Math.max(blackLuminance, bgLuminance) + 0.05) / (Math.min(blackLuminance, bgLuminance) + 0.05);
        
        if (whiteRatio >= targetRatio) {
            return '#ffffff';
        } else if (blackRatio >= targetRatio) {
            return '#000000';
        }
        
        return color; // Return original if nothing works
    }

    getComplementaryColors(foreground, background) {
        const fgHsl = this.hexToHsl(foreground);
        const bgHsl = this.hexToHsl(background);
        
        const complementaryFg = this.hslToHex((fgHsl.h + 180) % 360, fgHsl.s, fgHsl.l);
        const complementaryBg = this.hslToHex((bgHsl.h + 180) % 360, bgHsl.s, bgHsl.l);
        
        return { foreground: complementaryFg, background: complementaryBg };
    }

    getMonochromaticVariations(baseColor, accentColor) {
        const baseHsl = this.hexToHsl(baseColor);
        const accentHsl = this.hexToHsl(accentColor);
        
        const lightVariation = this.hslToHex(baseHsl.h, baseHsl.s, Math.min(baseHsl.l + 20, 95));
        const darkVariation = this.hslToHex(accentHsl.h, accentHsl.s, Math.max(accentHsl.l - 20, 5));
        
        return { foreground: darkVariation, background: lightVariation };
    }

    generateHarmoniousScheme(baseColor) {
        const hsl = this.hexToHsl(baseColor);
        
        return {
            background: baseColor,
            title: this.hslToHex(hsl.h, hsl.s, 15),
            paragraph: this.hslToHex(hsl.h, hsl.s, 25),
            hr: this.hslToHex(hsl.h, Math.max(hsl.s - 20, 10), 70),
            buttonBg: this.hslToHex((hsl.h + 30) % 360, 70, 45),
            buttonText: '#ffffff'
        };
    }

    getAccessibilityTips(colors, ratios) {
        const tips = [];
        
        if (ratios.titleRatio >= 4.5 && ratios.titleRatio < 7) {
            tips.push({
                priority: 'medium',
                text: 'Considera aumentar el tamaño del título para mejor legibilidad',
                colors: colors,
                type: 'tip'
            });
        }
        

        
        return tips;
    }

    renderSuggestions(containerId, suggestions, viewType) {
        const container = document.getElementById(containerId);
        
        if (suggestions.length === 0) {
            container.innerHTML = '<div class="no-suggestions">¡Excelente! Tus colores ya son accesibles.</div>';
            return;
        }
        
        container.innerHTML = suggestions.map(suggestion => `
            <div class="suggestion-item">
                <div class="suggestion-text">
                    <span class="suggestion-priority priority-${suggestion.priority}">${suggestion.priority.toUpperCase()}</span>
                    ${suggestion.text}
                </div>
                <div class="suggestion-colors">
                    ${this.renderSuggestionColors(suggestion.colors)}
                </div>
                <button class="apply-suggestion-btn" onclick="app.applySuggestion('${viewType}', '${suggestion.type}', '${suggestion.target || 'all'}', ${JSON.stringify(suggestion.colors).replace(/"/g, '&quot;')})">
                    Aplicar
                </button>
            </div>
        `).join('');
    }

    renderSuggestionColors(colors) {
        return Object.entries(colors).map(([key, color]) => 
            `<div class="suggestion-color-preview" style="background-color: ${color}" data-hex="${color}" title="${key}: ${color}"></div>`
        ).join('');
    }

    applySuggestion(viewType, suggestionType, target, colors) {
        console.log('Applying suggestion:', { viewType, suggestionType, target, colors });
        
        if (viewType === 'simple') {
            if (colors.foreground) {
                document.getElementById('foregroundColor').value = colors.foreground;
                document.getElementById('foregroundHex').value = colors.foreground;
            }
            if (colors.background) {
                document.getElementById('backgroundColor').value = colors.background;
                document.getElementById('backgroundHex').value = colors.background;
            }
        } else {
            // Advanced view
            Object.entries(colors).forEach(([key, color]) => {
                // Mapeo correcto basado en los IDs reales del HTML
                const mapping = {
                    'background': 'advBackground',     // advBackgroundColor, advBackgroundHex
                    'title': 'title',                  // titleColor, titleHex
                    'paragraph': 'paragraph',          // paragraphColor, paragraphHex
                    'hr': 'hr',                       // hrColor, hrHex
                    'buttonBg': 'buttonBg',           // buttonBgColor, buttonBgHex
                    'buttonText': 'buttonText'        // buttonTextColor, buttonTextHex
                };
                
                const elementName = mapping[key];
                console.log(`Mapping ${key} -> ${elementName} with color ${color}`);
                
                if (elementName) {
                    const colorInputId = `${elementName}Color`;
                    const hexInputId = `${elementName}Hex`;
                    const colorInput = document.getElementById(colorInputId);
                    const hexInput = document.getElementById(hexInputId);
                    
                    console.log(`Looking for elements: ${colorInputId}, ${hexInputId}`);
                    
                    if (colorInput && hexInput) {
                        console.log(`Updating ${elementName} inputs with ${color}`);
                        colorInput.value = color;
                        hexInput.value = color;
                    } else {
                        console.warn(`Could not find inputs for ${elementName}. ColorInput: ${!!colorInput}, HexInput: ${!!hexInput}`);
                        
                        // Intentar con los IDs exactos del HTML
                        const actualColorInput = document.getElementById(colorInputId);
                        const actualHexInput = document.getElementById(hexInputId);
                        console.log(`Actual elements found: ${!!actualColorInput}, ${!!actualHexInput}`);
                    }
                } else {
                    console.warn(`No mapping found for key: ${key}`);
                }
            });
        }
        
        this.updateContrastChecker();
    }

    // Additional utility functions
    hexToHsl(hex) {
        const rgb = this.hexToRgb(hex);
        return this.rgbToHsl(rgb.r, rgb.g, rgb.b);
    }

    rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        
        return { h: h * 360, s: s * 100, l: l * 100 };
    }
}

// Initialize the application
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new AccessibleColorPalette();
});