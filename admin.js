// === ADMIN AUTHENTICATION ===
const ADMIN_CREDENTIALS = {
    'operator-001': 'RedSec@2024!',
    'commander': 'TacticalOps#2024',
    'redsec': 'CyberWarfare!2024'
};

const loginForm = document.getElementById('login-form');
const adminLogin = document.getElementById('admin-login');
const adminDashboard = document.getElementById('admin-dashboard');
const errorMessage = document.getElementById('error-message');
const logoutBtn = document.getElementById('logout-btn');
const currentUserSpan = document.getElementById('current-user');

// === SHOW DASHBOARD FUNCTION (must be defined before use) ===
function showDashboard(username) {
    console.log('[ADMIN] Showing dashboard for:', username);
    console.log('[ADMIN] Elements check:', {
        adminLogin: !!adminLogin,
        adminDashboard: !!adminDashboard,
        currentUserSpan: !!currentUserSpan
    });
    
    if (adminLogin) adminLogin.style.display = 'none';
    if (adminDashboard) adminDashboard.classList.add('active');
    if (currentUserSpan) currentUserSpan.textContent = username.toUpperCase();
    
    updateDashboardStats();
    loadToolsTable();
    
    console.log('[ADMIN] Dashboard should be visible now');
}

// Check if already logged in
const isLoggedIn = sessionStorage.getItem('admin_access') === 'granted';
const currentUser = sessionStorage.getItem('admin_user');

console.log('[ADMIN] Page loaded. Login status:', isLoggedIn, 'User:', currentUser);

if (isLoggedIn && currentUser) {
    console.log('[ADMIN] User already logged in, showing dashboard');
    showDashboard(currentUser);
} else {
    console.log('[ADMIN] Not logged in, showing login form');
}

// Login handler
loginForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (ADMIN_CREDENTIALS[username] === password) {
        // Save session
        sessionStorage.setItem('admin_access', 'granted');
        sessionStorage.setItem('admin_user', username);
        
        // Glitch effect
        document.body.style.animation = 'glitch 0.3s';
        
        // Show dashboard after animation
        setTimeout(() => {
            showDashboard(username);
        }, 300);
    } else {
        errorMessage.style.display = 'block';
        document.body.style.animation = 'shake 0.5s';
        
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 3000);
    }
    
    loginForm.reset();
});

// Logout handler
logoutBtn?.addEventListener('click', () => {
    sessionStorage.removeItem('admin_access');
    sessionStorage.removeItem('admin_user');
    adminDashboard.classList.remove('active');
    adminLogin.style.display = 'block';
});

// Add shake animation
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
        20%, 40%, 60%, 80% { transform: translateX(10px); }
    }
`;
document.head.appendChild(shakeStyle);

// === DASHBOARD STATS ===
function updateDashboardStats() {
    let tools = JSON.parse(localStorage.getItem('redsec_arsenal')) || [];
    
    const totalTools = tools.length;
    const activeTools = tools.filter(t => t.available).length;
    const totalDownloads = tools.reduce((sum, t) => sum + t.downloads, 0);
    
    document.getElementById('total-tools').textContent = totalTools;
    document.getElementById('active-tools').textContent = activeTools;
    document.getElementById('total-downloads').textContent = totalDownloads.toLocaleString();
}

// === TOOL CRUD OPERATIONS ===
const addToolBtn = document.getElementById('add-tool-btn');
const toolFormContainer = document.getElementById('tool-form-container');
const toolForm = document.getElementById('tool-form');
const cancelBtn = document.getElementById('cancel-btn');
const formTitle = document.getElementById('form-title');

let editingToolId = null;

addToolBtn?.addEventListener('click', () => {
    editingToolId = null;
    formTitle.textContent = 'ADD NEW TOOL';
    toolForm.reset();
    document.getElementById('edit-tool-id').value = '';
    toolFormContainer.classList.add('active');
    toolFormContainer.scrollIntoView({ behavior: 'smooth' });
});

cancelBtn?.addEventListener('click', () => {
    toolFormContainer.classList.remove('active');
    toolForm.reset();
    editingToolId = null;
});

toolForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    let tools = JSON.parse(localStorage.getItem('redsec_arsenal')) || [];
    
    const toolData = {
        name: document.getElementById('tool-name').value.toUpperCase(),
        version: document.getElementById('tool-version').value,
        description: document.getElementById('tool-description').value,
        category: document.getElementById('tool-category').value,
        size: document.getElementById('tool-size').value || '0 MB',
        platforms: document.getElementById('tool-platforms').value
            .split(',')
            .map(p => p.trim())
            .filter(p => p),
        classified: document.getElementById('tool-classified').checked
    };
    
    const editId = document.getElementById('edit-tool-id').value;
    
    if (editId) {
        // Edit existing tool
        const index = tools.findIndex(t => t.id === parseInt(editId));
        if (index !== -1) {
            tools[index] = {
                ...tools[index],
                ...toolData
            };
        }
    } else {
        // Add new tool
        const newTool = {
            id: Math.max(...tools.map(t => t.id), 0) + 1,
            ...toolData,
            downloads: 0,
            available: true
        };
        tools.push(newTool);
    }
    
    localStorage.setItem('redsec_arsenal', JSON.stringify(tools));
    
    // Show success notification
    showNotification('TOOL ' + (editId ? 'UPDATED' : 'ADDED') + ' SUCCESSFULLY', 'success');
    
    toolFormContainer.classList.remove('active');
    toolForm.reset();
    updateDashboardStats();
    loadToolsTable();
});

// === LOAD TOOLS TABLE ===
function loadToolsTable() {
    const tbody = document.getElementById('tools-table-body');
    if (!tbody) return;
    
    let tools = JSON.parse(localStorage.getItem('redsec_arsenal')) || [];
    
    tbody.innerHTML = tools.map(tool => `
        <tr>
            <td>
                <strong style="color: var(--white);">${tool.name}</strong>
                ${tool.classified ? '<span style="color: var(--yellow-warning); margin-left: 10px;">🔒</span>' : ''}
            </td>
            <td>v${tool.version}</td>
            <td>${getCategoryLabel(tool.category)}</td>
            <td>${tool.downloads.toLocaleString()}</td>
            <td>
                <span class="status-badge ${tool.available ? 'active' : 'inactive'}">
                    ${tool.available ? 'ACTIVE' : 'OFFLINE'}
                </span>
            </td>
            <td>
                <button class="action-btn edit" onclick="editTool(${tool.id})">EDIT</button>
                <button class="action-btn" onclick="toggleToolStatus(${tool.id})">
                    ${tool.available ? 'DISABLE' : 'ENABLE'}
                </button>
                <button class="action-btn delete" onclick="deleteTool(${tool.id})">DELETE</button>
            </td>
        </tr>
    `).join('');
}

function getCategoryLabel(category) {
    const labels = {
        network: 'NETWORK',
        web: 'WEB',
        forensics: 'FORENSICS',
        exploit: 'EXPLOIT'
    };
    return labels[category] || category.toUpperCase();
}

// === TOOL ACTIONS ===
window.editTool = function(id) {
    let tools = JSON.parse(localStorage.getItem('redsec_arsenal')) || [];
    const tool = tools.find(t => t.id === id);
    
    if (tool) {
        formTitle.textContent = 'EDIT TOOL';
        document.getElementById('edit-tool-id').value = id;
        document.getElementById('tool-name').value = tool.name;
        document.getElementById('tool-version').value = tool.version;
        document.getElementById('tool-description').value = tool.description;
        document.getElementById('tool-category').value = tool.category;
        document.getElementById('tool-size').value = tool.size;
        document.getElementById('tool-platforms').value = tool.platforms.join(', ');
        document.getElementById('tool-classified').checked = tool.classified || false;
        
        toolFormContainer.classList.add('active');
        toolFormContainer.scrollIntoView({ behavior: 'smooth' });
    }
};

window.toggleToolStatus = function(id) {
    let tools = JSON.parse(localStorage.getItem('redsec_arsenal')) || [];
    const tool = tools.find(t => t.id === id);
    
    if (tool) {
        tool.available = !tool.available;
        localStorage.setItem('redsec_arsenal', JSON.stringify(tools));
        showNotification('TOOL STATUS UPDATED', 'success');
        loadToolsTable();
        updateDashboardStats();
    }
};

window.deleteTool = function(id) {
    if (confirm('⚠️ DELETE THIS TOOL? THIS ACTION CANNOT BE UNDONE.')) {
        let tools = JSON.parse(localStorage.getItem('redsec_arsenal')) || [];
        tools = tools.filter(t => t.id !== id);
        localStorage.setItem('redsec_arsenal', JSON.stringify(tools));
        showNotification('TOOL DELETED', 'warning');
        loadToolsTable();
        updateDashboardStats();
    }
};

// === NOTIFICATIONS ===
function showNotification(message, type = 'info') {
    const colors = {
        success: 'var(--green-tactical)',
        warning: 'var(--yellow-warning)',
        error: 'var(--red-primary)',
        info: 'var(--cyan-tactical)'
    };
    
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 30px;
        background: var(--gray-darkest);
        border: 2px solid ${colors[type]};
        color: ${colors[type]};
        padding: 20px 30px;
        font-family: var(--font-mono);
        font-size: 13px;
        letter-spacing: 1px;
        z-index: 10000;
        clip-path: polygon(15px 0%, 100% 0%, calc(100% - 15px) 100%, 0% 100%);
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = '▶ ' + message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

console.log('%c[ADMIN] OPS TERMINAL LOADED', 'color: #FF0000; font-weight: bold; font-size: 14px; font-family: monospace;');
console.log('%c[AUTH] Valid operators: operator-001, commander, redsec', 'color: #00FF00; font-size: 12px; font-family: monospace;');
