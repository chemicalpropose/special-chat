// Application State
let currentUser = null;
let currentChat = null;
let messages = [];
let isAdminView = false;

// DOM Elements
const loginPage = document.getElementById('loginPage');
const mainApp = document.getElementById('mainApp');
const chatView = document.getElementById('chatView');
const adminView = document.getElementById('adminView');
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadSampleData();
});

function initializeApp() {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('rabt_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showMainApp();
    } else {
        showLoginPage();
    }
}

function setupEventListeners() {
    // Login form
    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Password toggle
    const togglePassword = document.querySelector('.toggle-password');
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const passwordInput = document.getElementById('password');
            const icon = this.querySelector('i');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    }

    // Chat input form
    const chatInputForm = document.querySelector('.chat-input-form');
    if (chatInputForm) {
        chatInputForm.addEventListener('submit', sendMessage);
    }

    // Mobile menu toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', toggleMobileMenu);
    }

    // Search functionality
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }

    // Real-time typing simulation
    if (messageInput) {
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage(e);
            }
        });
    }

    // Auto-scroll to bottom when new messages arrive
    if (chatMessages) {
        const observer = new MutationObserver(() => {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        });
        observer.observe(chatMessages, { childList: true });
    }
}

function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const submitBtn = event.target.querySelector('.btn-login');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');

    // Show loading state
    btnText.classList.add('d-none');
    btnLoader.classList.remove('d-none');
    submitBtn.disabled = true;

    // Simulate API call
    setTimeout(() => {
        if (username === 'admin' && password === 'admin') {
            // Success
            currentUser = {
                id: 1,
                username: username,
                name: 'مهدی احمدی',
                role: 'مدیر IT',
                avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400',
                isAdmin: true
            };
            
            localStorage.setItem('rabt_user', JSON.stringify(currentUser));
            showMainApp();
        } else {
            // Error
            showNotification('نام کاربری یا رمز عبور اشتباه است', 'error');
        }

        // Hide loading state
        btnText.classList.remove('d-none');
        btnLoader.classList.add('d-none');
        submitBtn.disabled = false;
    }, 2000);
}

function showLoginPage() {
    loginPage.classList.remove('d-none');
    mainApp.classList.add('d-none');
}

function showMainApp() {
    loginPage.classList.add('d-none');
    mainApp.classList.remove('d-none');
    
    // Update user info in header
    updateUserInfo();
    
    // Load initial chat
    setTimeout(() => {
        const firstChat = document.querySelector('.chat-item');
        if (firstChat) {
            firstChat.click();
        }
    }, 100);
}

function updateUserInfo() {
    if (!currentUser) return;
    
    const userNameElements = document.querySelectorAll('.user-name');
    const userAvatarElements = document.querySelectorAll('.user-avatar img');
    
    userNameElements.forEach(el => {
        el.textContent = currentUser.name;
    });
    
    userAvatarElements.forEach(el => {
        el.src = currentUser.avatar;
        el.alt = currentUser.name;
    });
}

function selectChat(chatElement, chatName) {
    // Remove active class from all chat items
    document.querySelectorAll('.chat-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class to selected chat
    chatElement.classList.add('active');
    
    // Update chat header
    updateChatHeader(chatName, chatElement);
    
    // Load chat messages
    loadChatMessages(chatName);
    
    // Clear unread badge
    const badge = chatElement.querySelector('.badge');
    if (badge) {
        badge.remove();
    }
}

function updateChatHeader(chatName, chatElement) {
    const chatUserName = document.querySelector('.chat-user-name');
    const chatUserStatus = document.querySelector('.chat-user-status');
    const chatUserAvatar = document.querySelector('.chat-user-avatar img');
    
    if (chatUserName) chatUserName.textContent = chatName;
    
    // Get status from chat item
    const statusIndicator = chatElement.querySelector('.status-indicator');
    if (statusIndicator && chatUserStatus) {
        if (statusIndicator.classList.contains('online')) {
            chatUserStatus.textContent = 'آنلاین';
            chatUserStatus.className = 'chat-user-status text-success';
        } else if (statusIndicator.classList.contains('away')) {
            chatUserStatus.textContent = 'غیر فعال';
            chatUserStatus.className = 'chat-user-status text-warning';
        } else {
            chatUserStatus.textContent = 'آفلاین';
            chatUserStatus.className = 'chat-user-status text-secondary';
        }
    } else {
        // Group chat
        chatUserStatus.textContent = 'گروه';
        chatUserStatus.className = 'chat-user-status text-info';
    }
    
    // Update avatar
    const avatar = chatElement.querySelector('.chat-avatar img');
    if (avatar && chatUserAvatar) {
        chatUserAvatar.src = avatar.src;
        chatUserAvatar.alt = chatName;
    }
}

function loadChatMessages(chatName) {
    // Sample messages for different chats
    const chatMessages = {
        'احمد رضایی': [
            {
                type: 'received',
                content: 'سلام، گزارش ماهانه پروژه آماده شد. لطفاً بررسی کنید.',
                time: '10:25',
                sender: 'احمد رضایی'
            },
            {
                type: 'sent',
                content: 'عالی! همین الان بررسی می‌کنم. ممنون از پیگیری.',
                time: '10:27'
            },
            {
                type: 'received',
                content: 'فایل ضمیمه را هم ارسال کردم. در صورت نیاز به توضیحات بیشتر، در خدمت هستم.',
                time: '10:30',
                attachment: {
                    type: 'pdf',
                    name: 'گزارش_ماهانه_دی_1403.pdf',
                    size: '2.3 MB'
                }
            }
        ],
        'تیم توسعه': [
            {
                type: 'received',
                content: 'بروزرسانی جدید سامانه منتشر شد. لطفاً تست کنید.',
                time: '09:45',
                sender: 'سارا احمدی'
            },
            {
                type: 'sent',
                content: 'حتماً. آیا مستندات به‌روزرسانی شده؟',
                time: '09:50'
            },
            {
                type: 'received',
                content: 'بله، لینک مستندات در کانال اعلانات ارسال شده.',
                time: '09:52',
                sender: 'علی محمدی'
            }
        ],
        'فاطمه محمدی': [
            {
                type: 'received',
                content: 'جلسه فردا ساعت 10 تایید شد. لطفاً دستور جلسه را بررسی کنید.',
                time: 'دیروز',
                sender: 'فاطمه محمدی'
            },
            {
                type: 'sent',
                content: 'بررسی شد. همه موارد مناسب است.',
                time: 'دیروز'
            }
        ],
        'علی حسینی': [
            {
                type: 'received',
                content: 'مدارک طراحی UI جدید ارسال شد.',
                time: 'دیروز',
                sender: 'علی حسینی'
            }
        ]
    };
    
    const messages = chatMessages[chatName] || [];
    renderMessages(messages);
}

function renderMessages(messages) {
    const container = document.getElementById('chatMessages');
    if (!container) return;
    
    container.innerHTML = '';
    
    messages.forEach(message => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message-group ${message.type === 'sent' ? 'sent' : ''}`;
        
        const messageContent = `
            <div class="message ${message.type}">
                <div class="message-content">
                    ${message.sender ? `<div class="message-sender">${message.sender}</div>` : ''}
                    <p>${message.content}</p>
                    ${message.attachment ? renderAttachment(message.attachment) : ''}
                    <div class="message-time">${message.time}</div>
                    ${message.type === 'sent' ? '<div class="message-status"><i class="fas fa-check-double text-primary"></i></div>' : ''}
                </div>
            </div>
        `;
        
        messageDiv.innerHTML = messageContent;
        container.appendChild(messageDiv);
    });
    
    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
}

function renderAttachment(attachment) {
    const iconMap = {
        pdf: 'fa-file-pdf',
        doc: 'fa-file-word',
        xls: 'fa-file-excel',
        img: 'fa-file-image',
        default: 'fa-file'
    };
    
    const icon = iconMap[attachment.type] || iconMap.default;
    
    return `
        <div class="message-attachment">
            <div class="attachment-item">
                <i class="fas ${icon}"></i>
                <div class="attachment-info">
                    <span class="attachment-name">${attachment.name}</span>
                    <span class="attachment-size">${attachment.size}</span>
                </div>
                <button class="btn btn-sm btn-outline-primary">
                    <i class="fas fa-download"></i>
                </button>
            </div>
        </div>
    `;
}

function sendMessage(event) {
    event.preventDefault();
    
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add message to chat
    addMessageToChat('sent', message);
    
    // Clear input
    input.value = '';
    
    // Simulate response (in a real app, this would be handled by the server)
    setTimeout(() => {
        simulateResponse();
    }, 1000 + Math.random() * 2000);
}

function addMessageToChat(type, content, sender = null) {
    const container = document.getElementById('chatMessages');
    if (!container) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message-group ${type === 'sent' ? 'sent' : ''}`;
    
    const now = new Date();
    const time = now.getHours().toString().padStart(2, '0') + ':' + 
                now.getMinutes().toString().padStart(2, '0');
    
    const messageContent = `
        <div class="message ${type}">
            <div class="message-content">
                ${sender ? `<div class="message-sender">${sender}</div>` : ''}
                <p>${content}</p>
                <div class="message-time">${time}</div>
                ${type === 'sent' ? '<div class="message-status"><i class="fas fa-check-double text-primary"></i></div>' : ''}
            </div>
        </div>
    `;
    
    messageDiv.innerHTML = messageContent;
    container.appendChild(messageDiv);
    
    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
}

function simulateResponse() {
    const responses = [
        'متشکرم از پیام شما.',
        'بررسی می‌کنم و اطلاع می‌دهم.',
        'موافقم، اجرا می‌شود.',
        'لطفاً جزئیات بیشتری ارسال کنید.',
        'عالی، با موفقیت انجام شد.',
        'در حال بررسی هستم...'
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    const currentChatName = document.querySelector('.chat-user-name')?.textContent;
    
    addMessageToChat('received', randomResponse, currentChatName);
}

function toggleView(view) {
    if (view === 'admin') {
        chatView.classList.add('d-none');
        adminView.classList.remove('d-none');
        isAdminView = true;
    } else {
        chatView.classList.remove('d-none');
        adminView.classList.add('d-none');
        isAdminView = false;
    }
}

function toggleMobileMenu() {
    const sidebar = document.querySelector('.sidebar-col');
    sidebar.classList.toggle('show');
}

function handleSearch(event) {
    const query = event.target.value.toLowerCase();
    const chatItems = document.querySelectorAll('.chat-item');
    
    chatItems.forEach(item => {
        const chatName = item.querySelector('.chat-name').textContent.toLowerCase();
        const chatPreview = item.querySelector('.chat-preview').textContent.toLowerCase();
        
        if (chatName.includes(query) || chatPreview.includes(query)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

function logout() {
    localStorage.removeItem('rabt_user');
    currentUser = null;
    showLoginPage();
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} notification-toast`;
    notification.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'info-circle'} me-2"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function loadSampleData() {
    // This would normally load from an API
    // For demo purposes, we're using static data
    
    // Simulate real-time updates
    setInterval(() => {
        updateOnlineStatus();
    }, 30000); // Update every 30 seconds
    
    // Simulate new message notifications
    setInterval(() => {
        if (Math.random() > 0.7) { // 30% chance
            simulateNewMessage();
        }
    }, 60000); // Check every minute
}

function updateOnlineStatus() {
    const statusIndicators = document.querySelectorAll('.status-indicator');
    statusIndicators.forEach(indicator => {
        // Randomly change status
        const statuses = ['online', 'away', 'offline'];
        const currentStatus = statuses.find(status => indicator.classList.contains(status));
        const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
        
        if (currentStatus !== newStatus) {
            indicator.classList.remove(currentStatus);
            indicator.classList.add(newStatus);
        }
    });
}

function simulateNewMessage() {
    const chatItems = document.querySelectorAll('.chat-item:not(.active)');
    if (chatItems.length === 0) return;
    
    const randomChat = chatItems[Math.floor(Math.random() * chatItems.length)];
    const badge = randomChat.querySelector('.badge') || document.createElement('span');
    
    if (!badge.parentNode) {
        badge.className = 'badge bg-primary';
        badge.textContent = '1';
        randomChat.querySelector('.chat-badge').appendChild(badge);
    } else {
        const count = parseInt(badge.textContent) + 1;
        badge.textContent = count.toString();
    }
    
    // Update notification badge in header
    updateNotificationBadge();
}

function updateNotificationBadge() {
    const notificationBadge = document.querySelector('.notification-badge');
    if (notificationBadge) {
        const currentCount = parseInt(notificationBadge.textContent) || 0;
        notificationBadge.textContent = (currentCount + 1).toString();
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // Ctrl/Cmd + K for search
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.focus();
        }
    }
    
    // Escape to close mobile menu
    if (event.key === 'Escape') {
        const sidebar = document.querySelector('.sidebar-col.show');
        if (sidebar) {
            sidebar.classList.remove('show');
        }
    }
});

// Touch gestures for mobile
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', function(event) {
    touchStartX = event.changedTouches[0].screenX;
});

document.addEventListener('touchend', function(event) {
    touchEndX = event.changedTouches[0].screenX;
    handleSwipeGesture();
});

function handleSwipeGesture() {
    const swipeThreshold = 100;
    const swipeDistance = touchEndX - touchStartX;
    
    if (Math.abs(swipeDistance) > swipeThreshold) {
        const sidebar = document.querySelector('.sidebar-col');
        
        if (swipeDistance > 0 && window.innerWidth <= 768) {
            // Swipe right - show sidebar
            sidebar.classList.add('show');
        } else if (swipeDistance < 0) {
            // Swipe left - hide sidebar
            sidebar.classList.remove('show');
        }
    }
}

// PWA Support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('ServiceWorker registration successful');
            })
            .catch(function(error) {
                console.log('ServiceWorker registration failed');
            });
    });
}

// Export functions for global access
window.handleLogin = handleLogin;
window.selectChat = selectChat;
window.sendMessage = sendMessage;
window.toggleView = toggleView;
window.logout = logout;
