// === HEXAGON BACKGROUND ===
const canvas = document.getElementById('hex-canvas');

// Only initialize canvas if it exists
if (canvas) {
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    function drawHexagon(x, y, size) {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const px = x + size * Math.cos(angle);
            const py = y + size * Math.sin(angle);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.05)';
        ctx.stroke();
    }

    function drawHexGrid() {
        const size = 50;
        const h = size * Math.sqrt(3);
        
        for (let row = 0; row < canvas.height / h + 2; row++) {
            for (let col = 0; col < canvas.width / (size * 1.5) + 2; col++) {
                const x = col * size * 1.5;
                const y = row * h + (col % 2 === 1 ? h / 2 : 0);
                drawHexagon(x, y, size);
            }
        }
    }

    drawHexGrid();

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        drawHexGrid();
    });
}

// === REAL TIME CLOCK ===
function updateTime() {
    const now = new Date();
    const timeString = now.toISOString().slice(0, 19).replace('T', ' ');
    const timeElement = document.getElementById('current-time');
    if (timeElement) {
        timeElement.textContent = timeString + ' UTC';
    }
}
setInterval(updateTime, 1000);
updateTime();

// === NAVIGATION ===
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.section');
const hamburger = document.querySelector('.hamburger');
const navLinksContainer = document.querySelector('.nav-links');

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetSection = link.getAttribute('data-section');
        
        // Update active link
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        // Show target section
        sections.forEach(s => s.classList.remove('active'));
        document.getElementById(targetSection).classList.add('active');
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});

hamburger?.addEventListener('click', () => {
    navLinksContainer.classList.toggle('active');
});

function scrollToSection(sectionId) {
    const targetLink = document.querySelector(`[data-section="${sectionId}"]`);
    if (targetLink) {
        targetLink.click();
    }
}

// === STAT COUNTERS ===
function animateCounter(element) {
    const target = parseFloat(element.getAttribute('data-count'));
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target % 1 === 0 ? target : target.toFixed(1);
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

const statNumbers = document.querySelectorAll('.stat-number[data-count]');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

statNumbers.forEach(stat => observer.observe(stat));

// === THREAT METER ANIMATION ===
const meterFill = document.querySelector('.meter-fill');
if (meterFill) {
    const value = meterFill.getAttribute('data-value');
    meterFill.style.setProperty('--value', value + '%');
}

// === TOOLS DATABASE (simulated - will use Netlify Blobs in production) ===
let toolsDatabase = [
    {
        id: 1,
        name: 'SHADOWSTRIKE',
        version: '3.2.1',
        category: 'network',
        description: 'Scanner avançado de rede militar para mapeamento de infraestrutura e identificação de pontos de entrada táticos.',
        size: '8.4 MB',
        platforms: ['Linux', 'Windows'],
        downloads: 3247,
        available: true,
        classified: false
    },
    {
        id: 2,
        name: 'WEBVENOM',
        version: '2.8.0',
        category: 'web',
        description: 'Framework de exploração web com arsenal completo de vetores de ataque: XSS, SQLi, CSRF, RCE e bypass de WAF.',
        size: '12.1 MB',
        platforms: ['Linux', 'macOS'],
        downloads: 5621,
        available: true,
        classified: false
    },
    {
        id: 3,
        name: 'GHOSTTRACER',
        version: '4.0.3',
        category: 'forensics',
        description: 'Plataforma forense digital de nível militar para análise de disk, memory dumps e artefatos de rede.',
        size: '24.7 MB',
        platforms: ['Windows', 'Linux'],
        downloads: 1893,
        available: true,
        classified: false
    },
    {
        id: 4,
        name: 'PAYLOADFORGE',
        version: '1.9.5',
        category: 'exploit',
        description: 'Gerador de payloads polimórficos com evasão automática de AV/EDR usando técnicas de ofuscação avançadas.',
        size: '6.2 MB',
        platforms: ['Linux'],
        downloads: 4182,
        available: true,
        classified: false
    },
    {
        id: 5,
        name: 'CRYPTBREAKER',
        version: '2.3.7',
        category: 'forensics',
        description: 'Motor de força bruta distribuído com aceleração GPU para recuperação de credenciais e quebra de criptografia.',
        size: '15.9 MB',
        platforms: ['Windows', 'Linux'],
        downloads: 2756,
        available: false,
        classified: true
    },
    {
        id: 6,
        name: 'SPECTREWAVE',
        version: '5.1.2',
        category: 'network',
        description: 'Suite de auditoria wireless com suporte a WPA3, cracking de handshakes e análise de espectro RF.',
        size: '9.8 MB',
        platforms: ['Linux'],
        downloads: 3891,
        available: true,
        classified: false
    }
];

// Load from localStorage if available
const savedTools = localStorage.getItem('redsec_arsenal');
if (savedTools) {
    toolsDatabase = JSON.parse(savedTools);
}

function saveTools() {
    localStorage.setItem('redsec_arsenal', JSON.stringify(toolsDatabase));
}

// === RENDER TOOLS ===
function renderTools(tools = toolsDatabase) {
    const grid = document.getElementById('arsenal-grid');
    if (!grid) return;
    
    grid.innerHTML = tools.map(tool => `
        <div class="tool-card" data-category="${tool.category}">
            <div class="tool-header">
                <h3 class="tool-name">${tool.name}</h3>
                <span class="tool-version">v${tool.version}</span>
            </div>
            <span class="tool-category">${getCategoryLabel(tool.category)}</span>
            <p class="tool-description">${tool.description}</p>
            <div class="tool-meta">
                <span>SIZE: ${tool.size}</span>
                <span>DL: ${tool.downloads.toLocaleString()}</span>
            </div>
            <div class="tool-platforms">
                ${tool.platforms.map(p => `<span class="platform-tag">${p}</span>`).join('')}
            </div>
            <div class="tool-footer">
                <span style="font-family: var(--font-mono); font-size: 11px; color: var(--gray-light);">
                    ${tool.classified ? '🔒 CLASSIFIED' : '⬇️ AVAILABLE'}
                </span>
                <button class="download-btn" 
                        onclick="downloadTool(${tool.id})" 
                        ${!tool.available ? 'disabled' : ''}>
                    ${tool.available ? '▶ DOWNLOAD' : 'OFFLINE'}
                </button>
            </div>
        </div>
    `).join('');
}

function getCategoryLabel(category) {
    const labels = {
        network: 'NETWORK OPS',
        web: 'WEB EXPLOIT',
        forensics: 'DIGITAL FORENSICS',
        exploit: 'EXPLOITATION'
    };
    return labels[category] || category.toUpperCase();
}

function downloadTool(id) {
    const tool = toolsDatabase.find(t => t.id === id);
    if (tool && tool.available) {
        tool.downloads++;
        saveTools();
        renderTools();
        
        // Simulate download
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 60px;
            right: 30px;
            background: var(--red-primary);
            color: white;
            padding: 20px 30px;
            font-family: var(--font-mono);
            font-size: 13px;
            letter-spacing: 1px;
            z-index: 10000;
            clip-path: polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%);
            animation: slideIn 0.3s ease-out;
        `;
        notification.textContent = `▶ DOWNLOADING: ${tool.name} v${tool.version}`;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Add animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);

// === SEARCH AND FILTER ===
const searchInput = document.getElementById('arsenal-search');
const filterChips = document.querySelectorAll('.filter-chip');

searchInput?.addEventListener('input', () => filterTools());

filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
        filterChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        filterTools();
    });
});

function filterTools() {
    const searchTerm = searchInput?.value.toLowerCase() || '';
    const activeCategory = document.querySelector('.filter-chip.active')?.getAttribute('data-filter') || 'all';
    
    const filtered = toolsDatabase.filter(tool => {
        const matchesSearch = tool.name.toLowerCase().includes(searchTerm) || 
                            tool.description.toLowerCase().includes(searchTerm);
        const matchesCategory = activeCategory === 'all' || tool.category === activeCategory;
        return matchesSearch && matchesCategory;
    });
    
    renderTools(filtered);
}

// Initial render
renderTools();

// === CONTACT FORM ===
const contactForm = document.getElementById('contact-form');
contactForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData);
    
    console.log('Contact form submitted:', data);
    
    // Show success message
    const message = document.createElement('div');
    message.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: var(--gray-darkest);
        border: 2px solid var(--green-tactical);
        color: var(--green-tactical);
        padding: 40px 60px;
        font-family: var(--font-mono);
        font-size: 14px;
        text-align: center;
        z-index: 10000;
        clip-path: polygon(20px 0%, 100% 0%, calc(100% - 20px) 100%, 0% 100%);
    `;
    message.innerHTML = `
        <div style="font-size: 24px; margin-bottom: 15px;">✓ TRANSMISSION SENT</div>
        <div>Sua mensagem foi recebida.</div>
        <div>Responderemos em até 24 horas.</div>
    `;
    document.body.appendChild(message);
    
    setTimeout(() => message.remove(), 4000);
    contactForm.reset();
});

// === KONAMI CODE FOR ADMIN ACCESS ===
const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiIndex = 0;

document.addEventListener('keydown', (e) => {
    if (e.key === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
            activateAdminAccess();
            konamiIndex = 0;
        }
    } else {
        konamiIndex = 0;
    }
});

function activateKonami() {
    const hint = document.querySelector('.konami-hint');
    if (hint) {
        hint.textContent = '↑ ↑ ↓ ↓ ← → ← → B A';
        hint.style.color = 'var(--red-primary)';
        setTimeout(() => {
            hint.textContent = 'Think you can find the hidden access point?';
            hint.style.color = 'var(--gray-medium)';
        }, 5000);
    }
}

function activateAdminAccess() {
    // Create glitch effect
    document.body.style.animation = 'glitch 0.3s';
    
    setTimeout(() => {
        window.location.href = '/admin-ops-classified.html';
    }, 300);
}

// Add glitch animation
const glitchStyle = document.createElement('style');
glitchStyle.textContent = `
    @keyframes glitch {
        0% { transform: translate(0); }
        20% { transform: translate(-5px, 5px); filter: hue-rotate(90deg); }
        40% { transform: translate(-5px, -5px); }
        60% { transform: translate(5px, 5px); }
        80% { transform: translate(5px, -5px); filter: hue-rotate(0deg); }
        100% { transform: translate(0); }
    }
`;
document.head.appendChild(glitchStyle);

// === ADMIN URL DETECTION ===
if (window.location.pathname.includes('admin-ops-classified')) {
    // Redirect to admin if not logged in
    const isLoggedIn = sessionStorage.getItem('admin_access') === 'granted';
    if (!isLoggedIn) {
        showAdminLogin();
    }
}

console.log('%c[REDSEC] SYSTEM ONLINE', 'color: #FF0000; font-weight: bold; font-size: 16px; font-family: monospace;');
console.log('%c[INTEL] Hidden admin access available via Konami code', 'color: #00FF00; font-size: 12px; font-family: monospace;');
console.log('%c[HINT] ↑ ↑ ↓ ↓ ← → ← → B A', 'color: #FFFF00; font-size: 12px; font-family: monospace;');
