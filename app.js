// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCjUwwU8iJ5cPx2SphIK-sQESAHSFpUq-U",
    authDomain: "soul-27114.firebaseapp.com",
    databaseURL: "https://soul-27114-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "soul-27114",
    storageBucket: "soul-27114.firebasestorage.app",
    messagingSenderId: "953272175759",
    appId: "1:953272175759:web:c2cee5092180d1e85af4fa"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const auth = firebase.auth();

// Переменные для слушателей
let contactsListener = null;
let chatsListener = null;
let messageListeners = {};
let typingListeners = {};

// Переменные состояния
let verifiedUsers = {};
let verifiedUsersListener = null;

let currentUser = null;
let chats = [];
let contacts = [];
let allUsers = {};
let currentChatId = null;
let selectedChatType = "group"; // ИЗМЕНЕНИЕ: изменено с "channel" на "group"
let currentTab = "chats";
let authUnsubscribe = null;
let isMobile = false;
let replyToMessage = null;
let currentDesktopTab = "chats";
let connectionCheckInterval = null;
let searchTimeouts = {};
let lastSearchResults = [];
let selectedPhoto = null;




// ================================================
// АДМИН-ПАНЕЛЬ ДЛЯ УПРАВЛЕНИЯ ГАЛОЧКАМИ
// ================================================

// Переменные для админ-панели
const adminPanelBtn = document.getElementById('adminPanelBtn');
const adminPanelModal = document.getElementById('adminPanelModal');
const closeAdminPanel = document.getElementById('closeAdminPanel');
const badgeUserId = document.getElementById('badgeUserId');
const badgeType = document.getElementById('badgeType');
const giveBadgeBtn = document.getElementById('giveBadgeBtn');
const verifiedUsersList = document.getElementById('verifiedUsersList');
const adminUserSearch = document.getElementById('adminUserSearch');
const adminSearchResults = document.getElementById('adminSearchResults');

// Функция для проверки, является ли пользователь админом
function isUserAdmin() {
    return currentUser && verifiedUsers && verifiedUsers[currentUser.uid] && 
           verifiedUsers[currentUser.uid].type === 'admin';
}

// Показываем/скрываем кнопку админ-панели
function updateAdminButtonVisibility() {
    if (adminPanelBtn) {
        if (isUserAdmin()) {
            adminPanelBtn.style.display = 'flex';
        } else {
            adminPanelBtn.style.display = 'none';
        }
    }
}

// Загружаем список верифицированных пользователей
async function loadVerifiedUsersList() {
    if (!verifiedUsersList) return;
    
    try {
        const snapshot = await database.ref('verifiedUsers').once('value');
        const verifiedData = snapshot.val() || {};
        
        if (Object.keys(verifiedData).length === 0) {
            verifiedUsersList.innerHTML = '<div class="empty-state">Нет верифицированных пользователей</div>';
            return;
        }
        
        let html = '';
        for (const [userId, data] of Object.entries(verifiedData)) {
            const user = allUsers[userId] || { displayName: 'Неизвестный', customId: userId };
            const badgeClass = `badge-${data.type}`;
            const badgeText = {
                'admin': 'Админ',
                'premium': 'Премиум',
                'partner': 'Партнер',
                'celebrity': 'Знаменитость'
            }[data.type] || data.type;
            
            html += `
                <div class="verified-user-item" data-user-id="${userId}">
                    <div class="verified-user-info">
                        <div class="verified-user-avatar">${user.displayName.charAt(0)}</div>
                        <div class="verified-user-details">
                            <div class="verified-user-name">${user.displayName}</div>
                            <div class="verified-user-id">${user.customId || userId}</div>
                        </div>
                    </div>
                    <span class="verified-user-badge ${badgeClass}">${badgeText}</span>
                    <button class="remove-badge-btn" onclick="removeVerifiedBadge('${userId}')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        }
        
        verifiedUsersList.innerHTML = html;
        
    } catch (error) {
        console.error("Ошибка загрузки верифицированных пользователей:", error);
        verifiedUsersList.innerHTML = '<div class="error-message">Ошибка загрузки</div>';
    }
}

// Функция для выдачи галочки
async function giveVerifiedBadge(userId, type) {
    if (!userId || !type) {
        showNotification("❌ Укажите ID пользователя и тип галочки");
        return;
    }
    
    try {
        await database.ref(`verifiedUsers/${userId}`).set({
            type: type,
            verifiedAt: Date.now(),
            verifiedBy: currentUser.uid
        });
        
        showNotification(`✅ Галочка ${type} выдана пользователю ${userId}`);
        
        // Обновляем списки
        loadVerifiedUsersList();
        if (adminUserSearch) adminUserSearch.value = '';
        if (adminSearchResults) adminSearchResults.innerHTML = '';
        
    } catch (error) {
        console.error("Ошибка выдачи галочки:", error);
        showNotification("❌ Ошибка при выдаче галочки");
    }
}

// Функция для удаления галочки
window.removeVerifiedBadge = async function(userId) {
    if (!confirm('Удалить галочку у этого пользователя?')) return;
    
    try {
        await database.ref(`verifiedUsers/${userId}`).remove();
        showNotification("✅ Галочка удалена");
        loadVerifiedUsersList();
    } catch (error) {
        console.error("Ошибка удаления галочки:", error);
        showNotification("❌ Ошибка при удалении");
    }
};

// Поиск пользователей в админ-панели
function setupAdminSearch() {
    if (!adminUserSearch) return;
    
    adminUserSearch.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        
        if (query.length < 2) {
            adminSearchResults.innerHTML = '';
            return;
        }
        
        const results = [];
        
        for (const userId in allUsers) {
            const user = allUsers[userId];
            const matchesName = user.displayName && user.displayName.toLowerCase().includes(query);
            const matchesId = userId.toLowerCase().includes(query);
            const matchesCustomId = user.customId && user.customId.toLowerCase().includes(query);
            
            if (matchesName || matchesId || matchesCustomId) {
                results.push({
                    userId: userId,
                    displayName: user.displayName,
                    customId: user.customId || userId,
                    hasBadge: verifiedUsers && verifiedUsers[userId]
                });
            }
        }
        
        if (results.length === 0) {
            adminSearchResults.innerHTML = '<div class="no-search-results">Пользователи не найдены</div>';
            return;
        }
        
        let html = '';
        results.slice(0, 5).forEach(user => {
            const badgeStatus = user.hasBadge ? 
                `<span class="verified-user-badge badge-${user.hasBadge.type}">Есть галочка</span>` : 
                '<span style="color:#64748b">Нет галочки</span>';
            
            html += `
                <div class="search-result-item" onclick="selectUserForBadge('${user.userId}', '${user.displayName}')">
                    <div class="search-result-avatar">${user.displayName.charAt(0)}</div>
                    <div class="search-result-info">
                        <div class="search-result-name">${user.displayName}</div>
                        <div class="search-result-id">${user.customId}</div>
                    </div>
                    ${badgeStatus}
                </div>
            `;
        });
        
        adminSearchResults.innerHTML = html;
        adminSearchResults.classList.add('active');
    });
}

// Выбор пользователя из поиска
window.selectUserForBadge = function(userId, displayName) {
    if (badgeUserId) {
        badgeUserId.value = userId;
        adminUserSearch.value = '';
        adminSearchResults.innerHTML = '';
        showNotification(`Выбран пользователь: ${displayName}`);
    }
};

// Инициализация админ-панели
function setupAdminPanel() {
    if (!adminPanelBtn || !adminPanelModal) return;
    
    // Кнопка открытия
    adminPanelBtn.addEventListener('click', () => {
        adminPanelModal.classList.add('active');
        loadVerifiedUsersList();
    });
    
    // Закрытие
    if (closeAdminPanel) {
        closeAdminPanel.addEventListener('click', () => {
            adminPanelModal.classList.remove('active');
        });
    }
    
    // Выдача галочки
    if (giveBadgeBtn) {
        giveBadgeBtn.addEventListener('click', () => {
            const userId = badgeUserId?.value.trim();
            const type = badgeType?.value;
            
            if (!userId) {
                showNotification("❌ Введите ID пользователя");
                return;
            }
            
            giveVerifiedBadge(userId, type);
        });
    }
    
    // Поиск
    setupAdminSearch();
    
    // Обновляем видимость кнопки при изменении verifiedUsers
    const originalVerifiedListener = verifiedUsersListener;
    verifiedUsersListener = (snapshot) => {
        if (originalVerifiedListener) originalVerifiedListener(snapshot);
        updateAdminButtonVisibility();
    };
}

// Добавьте вызов setupAdminPanel в initializeApp
// Найдите функцию initializeApp и добавьте туда:
// setupAdminPanel();





// DOM элементы
const photoPreviewContainer = document.getElementById('photoPreviewContainer');
const photoPreview = document.getElementById('photoPreview');
const photoPreviewName = document.getElementById('photoPreviewName');
const photoPreviewSize = document.getElementById('photoPreviewSize');
const photoPreviewRemove = document.getElementById('photoPreviewRemove');
const photoProgress = document.getElementById('photoProgress');
const photoProgressBar = document.getElementById('photoProgressBar');
const photoProgressText = document.getElementById('photoProgressText');
const attachPhotoBtn = document.getElementById('attachPhotoBtn');
const photoViewModal = document.getElementById('photoViewModal');
const closePhotoModal = document.getElementById('closePhotoModal');
const fullSizePhoto = document.getElementById('fullSizePhoto');
const MAX_PHOTO_SIZE = 1024 * 1024; // 1MB в base64 будет примерно 1.3MB
const AVAILABLE_REACTIONS = ['👍', '👎', '❤️', '🔥', '💩'];
const authContainer = document.getElementById('authContainer');
const mainContainer = document.getElementById('mainContainer');
const authError = document.getElementById('authError');
const authLoading = document.getElementById('authLoading');
const authSuccess = document.getElementById('authSuccess');
const authTabs = document.querySelectorAll('.auth-tab');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const loginBtn = document.getElementById('loginBtn');
const quickLoginBtn = document.getElementById('quickLoginBtn');
const registerName = document.getElementById('registerName');
const registerEmail = document.getElementById('registerEmail');
const registerPassword = document.getElementById('registerPassword');
const registerConfirmPassword = document.getElementById('registerConfirmPassword');
const registerBtn = document.getElementById('registerBtn');

// Мобильные элементы
const mobileHeader = document.getElementById('mobileHeader');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileProfileBtn = document.getElementById('mobileProfileBtn');
const mobileSidebarOverlay = document.getElementById('mobileSidebarOverlay');
const mobileSidebar = document.getElementById('mobileSidebar');
const mobileSidebarClose = document.getElementById('mobileSidebarClose');
const mobileUserId = document.getElementById('mobileUserId');
const copyMobileIdBtn = document.getElementById('copyMobileIdBtn');
const mobileSidebarTabs = document.querySelectorAll('.mobile-sidebar-tab');
const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');
const mobileSearchInput = document.getElementById('mobileSearchInput');
const mobileChatsContainer = document.getElementById('mobileChatsContainer');
const mobileContactsContainer = document.getElementById('mobileContactsContainer');
const mobileCreateChatBtn = document.getElementById('mobileCreateChatBtn');
const mobileAddContactBtn = document.getElementById('mobileAddContactBtn');

// ПК элементы
const desktopSidebar = document.getElementById('desktopSidebar');
const desktopUserInfo = document.getElementById('desktopUserInfo');
const desktopUserAvatar = document.getElementById('desktopUserAvatar');
const desktopUserName = document.getElementById('desktopUserName');
const desktopUserStatus = document.getElementById('desktopUserStatus');
const desktopUserInfoBtn = document.getElementById('desktopUserInfoBtn');
const desktopSearchInput = document.getElementById('desktopSearchInput');
const desktopSidebarTabs = document.querySelectorAll('.desktop-sidebar-tab');
const desktopChatsList = document.getElementById('desktopChatsList');
const desktopContactsList = document.getElementById('desktopContactsList');
const desktopCreateChatBtn = document.getElementById('desktopCreateChatBtn');
const desktopAddContactBtn = document.getElementById('desktopAddContactBtn');
const desktopEmptyScreen = document.getElementById('desktopEmptyScreen');
const desktopEmptyCreateChatBtn = document.getElementById('desktopEmptyCreateChatBtn');
const desktopEmptyAddContactBtn = document.getElementById('desktopEmptyAddContactBtn');
const chatHeaderDesktop = document.getElementById('chatHeaderDesktop');
const desktopChatAvatar = document.getElementById('desktopChatAvatar');
const desktopChatHeaderName = document.getElementById('desktopChatHeaderName');
const desktopChatHeaderDescription = document.getElementById('desktopChatHeaderDescription');

// Главный экран элементы
const homeScreen = document.getElementById('homeScreen');
const homeUserId = document.getElementById('homeUserId');
const copyHomeIdBtn = document.getElementById('copyHomeIdBtn');
const homeCreateChatBtn = document.getElementById('homeCreateChatBtn');
const homeAddContactBtn = document.getElementById('homeAddContactBtn');
const homeTabs = document.querySelectorAll('.home-tab');
const homeChatsList = document.getElementById('homeChatsList');
const homeContactsList = document.getElementById('homeContactsList');
const homeContactsSearch = document.getElementById('homeContactsSearch');
const homeContactsSearchResults = document.getElementById('homeContactsSearchResults');

// Экран чата элементы
const chatScreen = document.getElementById('chatScreen');
const chatHeaderMobile = document.getElementById('chatHeaderMobile');
const backToHomeBtn = document.getElementById('backToHomeBtn');
const chatHeaderName = document.getElementById('chatHeaderName');
const chatHeaderDescription = document.getElementById('chatHeaderDescription');
const chatInfoBtn = document.getElementById('chatInfoBtn');
const messagesContainer = document.getElementById('messagesContainer');
const messageInput = document.getElementById('messageInput');
const sendMessageBtn = document.getElementById('sendMessageBtn');
const replyPreviewContainer = document.getElementById('replyPreviewContainer');

// Модальные окна
const createChatModal = document.getElementById('createChatModal');
const cancelCreateBtn = document.getElementById('cancelCreateBtn');
const confirmCreateBtn = document.getElementById('confirmCreateBtn');
const chatNameInput = document.getElementById('chatName');
const chatDescriptionInput = document.getElementById('chatDescription');
const chatTypeOptions = document.querySelectorAll('.chat-type-option');
const addContactModal = document.getElementById('addContactModal');
const cancelAddContactBtn = document.getElementById('cancelAddContactBtn');
const confirmAddContactBtn = document.getElementById('confirmAddContactBtn');
const contactSearch = document.getElementById('contactSearch');
const contactSearchResults = document.getElementById('contactSearchResults');
const profileModal = document.getElementById('profileModal');
const profileName = document.getElementById('profileName');
const profileUserId = document.getElementById('profileUserId');
const copyUserIdBtn = document.getElementById('copyUserIdBtn');
const profileContactsCount = document.getElementById('profileContactsCount');
const profileChatsCount = document.getElementById('profileChatsCount');
const logoutBtn = document.getElementById('logoutBtn');
const editProfileModal = document.getElementById('editProfileModal');
const editProfileBtn = document.getElementById('editProfileBtn');
const cancelEditProfileBtn = document.getElementById('cancelEditProfileBtn');
const saveProfileBtn = document.getElementById('saveProfileBtn');
const editProfileName = document.getElementById('editProfileName');
const statusOptions = document.querySelectorAll('.status-option');

// Контекстное меню для сообщений
const messageContextMenu = document.getElementById('messageContextMenu');
const contextReply = document.getElementById('contextReply');
const contextCopy = document.getElementById('contextCopy');
const contextDelete = document.getElementById('contextDelete');

// Модальные окна подтверждения
const confirmLeaveChatModal = document.getElementById('confirmLeaveChatModal');
const cancelLeaveBtn = document.getElementById('cancelLeaveBtn');
const confirmLeaveBtn = document.getElementById('confirmLeaveBtn');
const confirmDeleteMessageModal = document.getElementById('confirmDeleteMessageModal');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const messagePreview = document.getElementById('messagePreview');

// Дополнительные элементы
const privateUserId = document.getElementById('privateUserId');
const privateUserSearchResults = document.getElementById('privateUserSearchResults');
const chatDescriptionGroup = document.getElementById('chatDescriptionGroup');
const privateChatUser = document.getElementById('privateChatUser');

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Функция для очистки всех слушателей
function cleanupListeners() {
    
    // Очищаем слушатель контактов
    if (contactsListener !== null && currentUser) {
        const contactsRef = database.ref(`users/${currentUser.uid}/contacts`);
        contactsRef.off('value', contactsListener);
        contactsListener = null;
    }
    
    // Очищаем слушатель чатов
    if (chatsListener !== null) {
        const chatsRef = database.ref('chats');
        chatsRef.off('value', chatsListener);
        chatsListener = null;
    }
    
    // Очищаем слушатели сообщений
    Object.values(messageListeners).forEach(unsubscribe => {
        if (typeof unsubscribe === 'function') {
            unsubscribe();
        }
    });
    messageListeners = {};
    
    // Очищаем слушатели набора текста
    Object.values(typingListeners).forEach(unsubscribe => {
        if (typeof unsubscribe === 'function') {
            unsubscribe();
        }
    });
    typingListeners = {};
}

// ================================================
// ФУНКЦИИ ДЛЯ ПОИСКА С ПОДСКАЗКАМИ
// ================================================

// Функция для поиска пользователей с подсказками
function searchUsers(query, currentContacts = []) {
    query = query.toLowerCase().trim();
    
    if (!query || query.length < 1) {
        return [];
    }
    
    const results = [];
    
    // Ищем среди всех пользователей, кроме текущего
    for (const userId in allUsers) {
        if (userId === currentUser.uid) continue;
        
        const user = allUsers[userId];
        
        // Проверяем совпадения по имени и customId
        const matchesName = user.displayName && user.displayName.toLowerCase().includes(query);
        const matchesCustomId = user.customId && user.customId.toLowerCase().includes(query);
        const matchesUserId = userId.toLowerCase().includes(query);
        
        if (matchesName || matchesCustomId || matchesUserId) {
            // Проверяем, не является ли пользователь уже контактом
            const isAlreadyContact = currentContacts.some(contact => contact.userId === userId);
            
            results.push({
                userId: userId,
                displayName: user.displayName,
                customId: user.customId || `user_${userId.substr(0, 8)}`,
                status: user.status || 'offline',
                lastActive: user.lastActive || 0,
                isContact: isAlreadyContact
            });
        }
    }
    
    // Сортируем результаты:
    // 1. Сначала онлайн пользователи
    // 2. Потом те, кто еще не в контактах
    // 3. По алфавиту
    results.sort((a, b) => {
        // Сначала онлайн
        if (a.status === 'online' && b.status !== 'online') return -1;
        if (a.status !== 'online' && b.status === 'online') return 1;
        
        // Потом те, кто еще не в контактах
        if (!a.isContact && b.isContact) return -1;
        if (a.isContact && !b.isContact) return 1;
        
        // Затем по алфавиту
        return a.displayName.localeCompare(b.displayName);
    });
    
    return results;
}

// Функция для отображения результатов поиска с подсказками
function displaySearchResults(results, containerId, currentContacts = []) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    
    if (results.length === 0) {
        container.innerHTML = `
            <div class="no-search-results">
                <i class="fas fa-user-friends"></i>
                <p>Пользователи не найдены</p>
                <p class="search-info">Попробуйте ввести другое имя или ID</p>
            </div>
        `;
        container.classList.add('active');
        return;
    }
    
    results.forEach(result => {
        const resultItem = document.createElement('div');
        resultItem.className = 'search-result-item';
        resultItem.dataset.userId = result.userId;
        resultItem.dataset.customId = result.customId;
        
        const statusClass = result.status === 'online' ? 'online' : 
                           result.status === 'away' ? 'away' : 
                           result.status === 'dnd' ? 'dnd' : 'offline';
        
        const statusText = result.status === 'online' ? 'online' : 
                          result.status === 'away' ? 'away' : 
                          result.status === 'dnd' ? 'dnd' : 'offline';
        
        const buttonText = result.isContact ? 'В контактах ✓' : 'Добавить';
        const buttonDisabled = result.isContact ? 'disabled' : '';
        
        // Получаем галочку для пользователя
        const badgeHtml = getVerifiedBadge(result.userId);
        
        resultItem.innerHTML = `
            <div class="search-result-avatar">
                ${result.displayName.charAt(0)}
            </div>
            <div class="search-result-info">
                <div class="search-result-name">
                    ${result.displayName}
                    ${badgeHtml}
                </div>
                <div class="search-result-id">${result.customId}</div>
                <div class="search-result-status ${statusClass}">
                    ${statusText}
                </div>
            </div>
            <button class="add-user-btn" ${buttonDisabled}>
                ${buttonText}
            </button>
        `;
        
        // Обработчик добавления контакта
        const addBtn = resultItem.querySelector('.add-user-btn');
        if (!result.isContact) {
            addBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                await addContact(result.customId);
                
                // Обновляем отображение этого пользователя
                result.isContact = true;
                displaySearchResults(results, containerId, currentContacts);
            });
        }
        
        // Обработчик открытия чата (если уже контакт)
        resultItem.addEventListener('click', () => {
            if (result.isContact) {
                openOrCreatePrivateChat(result.userId);
                if (addContactModal) addContactModal.classList.remove('active');
            }
        });
        
        container.appendChild(resultItem);
    });
    
    container.classList.add('active');
}

// Функция для скрытия результатов поиска
function hideSearchResults(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.classList.remove('active');
    }
}

// Функция показа/скрытия индикатора загрузки
function setSearchLoading(containerId, isLoading) {
    const loadingEl = document.getElementById(`${containerId}Loading`);
    if (loadingEl) {
        if (isLoading) {
            loadingEl.classList.add('active');
        } else {
            loadingEl.classList.remove('active');
        }
    }
}

// Обработчик поиска в модальном окне добавления контакта
function setupContactSearch() {
    if (!contactSearch) return;
    
    contactSearch.addEventListener('input', function() {
        const query = this.value.trim();
        
        // Очищаем предыдущий таймаут
        if (searchTimeouts.modalSearch) {
            clearTimeout(searchTimeouts.modalSearch);
        }
        
        if (query.length < 1) {
            hideSearchResults('contactSearchResults');
            setSearchLoading('contactSearch', false);
            if (confirmAddContactBtn) confirmAddContactBtn.disabled = true;
            return;
        }
        
        // Показываем индикатор загрузки
        setSearchLoading('contactSearch', true);
        
        // Запускаем поиск с задержкой (дебаунс)
        searchTimeouts.modalSearch = setTimeout(() => {
            const searchResults = searchUsers(query, contacts);
            displaySearchResults(searchResults, 'contactSearchResults', contacts);
            
            // Скрываем индикатор загрузки
            setSearchLoading('contactSearch', false);
            
            // Активируем кнопку добавления, если есть результаты
            if (confirmAddContactBtn) {
                confirmAddContactBtn.disabled = searchResults.length === 0 || !searchResults.some(r => !r.isContact);
            }
        }, 300); // Задержка 300 мс
    });
    
    // Закрываем результаты поиска при клике вне их
    document.addEventListener('click', (e) => {
        if (contactSearch && !contactSearch.contains(e.target) && 
            contactSearchResults && !contactSearchResults.contains(e.target)) {
            hideSearchResults('contactSearchResults');
        }
    });
    
    // Обработка нажатия клавиш
    contactSearch.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideSearchResults('contactSearchResults');
        } else if (e.key === 'Enter' && lastSearchResults.length > 0) {
            // Если нажат Enter и есть результаты, добавляем первый доступный контакт
            const availableContact = lastSearchResults.find(r => !r.isContact);
            if (availableContact) {
                addContact(availableContact.customId);
                if (addContactModal) addContactModal.classList.remove('active');
                resetAddContactForm();
            }
        }
    });
}

// Обработчик поиска на главном экране (мобильная версия)
function setupHomeContactsSearch() {
    const homeSearchInput = document.getElementById('homeContactsSearch');
    if (!homeSearchInput) return;
    
    homeSearchInput.addEventListener('input', function() {
        const query = this.value.trim();
        
        // Очищаем предыдущий таймаут
        if (searchTimeouts.homeSearch) {
            clearTimeout(searchTimeouts.homeSearch);
        }
        
        if (query.length < 1) {
            hideSearchResults('homeContactsSearchResults');
            setSearchLoading('homeContactsSearch', false);
            return;
        }
        
        // Показываем индикатор загрузки
        setSearchLoading('homeContactsSearch', true);
        
        // Запускаем поиск с задержкой (дебаунс)
        searchTimeouts.homeSearch = setTimeout(() => {
            const searchResults = searchUsers(query, contacts);
            displaySearchResults(searchResults, 'homeContactsSearchResults', contacts);
            
            // Скрываем индикатор загрузки
            setSearchLoading('homeContactsSearch', false);
        }, 300); // Задержка 300 мс
    });
    
    // Закрываем результаты поиска при клике вне их
    document.addEventListener('click', (e) => {
        if (!homeSearchInput.contains(e.target) && 
            !document.getElementById('homeContactsSearchResults')?.contains(e.target)) {
            hideSearchResults('homeContactsSearchResults');
        }
    });
}

async function initializeApp() {
    setupDragAndDrop();
    setupEventListeners();
    detectMobile();
    setupPhotoUpload();
    setupAdminPanel();
    
    // Проверяем авторизацию
    authUnsubscribe = auth.onAuthStateChanged(async (user) => {
        if (user) {
            // Пользователь авторизован
            await loadUserData(user.uid);
            if (authContainer) authContainer.style.display = 'none';
            if (mainContainer) mainContainer.style.display = 'flex';
            showNotification("Добро пожаловать в Soul!");
            
            // Запускаем мониторинг соединения
            startConnectionMonitoring();
            
            // Обновляем ID в разных местах
            updateUserIDs();
            
            // Инициализируем интерфейс в зависимости от устройства
            if (isMobile) {
                initMobileInterface();
            } else {
                initDesktopInterface();
            }
            
        } else {
            // Пользователь не авторизован
            if (authContainer) authContainer.style.display = 'flex';
            if (mainContainer) mainContainer.style.display = 'none';
            
            // Останавливаем мониторинг
            if (connectionCheckInterval) {
                clearInterval(connectionCheckInterval);
                connectionCheckInterval = null;
            }
        }
    });
    setupReactionsHandlers();
}

// Функция для настройки обработчиков реакций
function setupReactionsHandlers() {
    // Обработчики для реакций в контекстном меню
    document.addEventListener('click', function(e) {
        const reactionOption = e.target.closest('.reaction-option');
        const messageContextMenu = document.getElementById('messageContextMenu');
        
        if (reactionOption && messageContextMenu && messageContextMenu.classList.contains('active')) {
            e.preventDefault();
            e.stopPropagation();
            
            const messageId = messageContextMenu.dataset.messageId;
            const emoji = reactionOption.dataset.reaction;
            
            if (messageId && emoji && currentChatId) {
                toggleReaction(messageId, emoji);
                messageContextMenu.classList.remove('active');
            }
        }
    });
}

// Мониторинг соединения
function startConnectionMonitoring() {
    if (connectionCheckInterval) {
        clearInterval(connectionCheckInterval);
    }
    
    connectionCheckInterval = setInterval(async () => {
        if (currentUser && navigator.onLine) {
            try {
                // Просто обновляем lastActive для отслеживания активности
                await database.ref(`users/${currentUser.uid}`).update({
                    lastActive: Date.now(),
                    status: "online" // Подтверждаем, что мы онлайн
                });
            } catch (error) {
                console.error("Ошибка обновления активности:", error);
            }
        }
    }, 30000); // Каждые 30 секунд
}

// Мобильные функции
function detectMobile() {
    isMobile = window.innerWidth <= 768;
    
    window.addEventListener('resize', () => {
        const wasMobile = isMobile;
        isMobile = window.innerWidth <= 768;
        
        if (wasMobile !== isMobile) {
            location.reload();
        }
    });
}

window.addEventListener('resize', () => {
    // При изменении размера окна корректируем прокрутку
    if (currentChatId && !isMobile) {
        const marker = document.getElementById('scroll-bottom-marker');
        if (marker) {
            setTimeout(() => {
                marker.scrollIntoView({ behavior: 'auto', block: 'end' });
            }, 100);
        }
    }
});

function initMobileInterface() {
    if (!isMobile) return;
    
    // Показываем мобильные элементы, скрываем ПК элементы
    if (mobileHeader) mobileHeader.style.display = 'flex';
    if (desktopSidebar) desktopSidebar.style.display = 'none';
    if (desktopEmptyScreen) desktopEmptyScreen.style.display = 'none';
    
    // Настраиваем мобильный интерфейс
    if (currentChatId) {
        if (homeScreen) homeScreen.style.display = 'none';
        if (chatScreen) {
            chatScreen.style.display = 'flex';
            chatScreen.classList.add('mobile');
            chatScreen.classList.remove('desktop');
        }
        if (chatHeaderDesktop) chatHeaderDesktop.style.display = 'none';
        if (chatHeaderMobile) chatHeaderMobile.style.display = 'flex';
    } else {
        if (homeScreen) homeScreen.style.display = 'block';
        if (chatScreen) chatScreen.style.display = 'none';
        
        // Активируем первую вкладку на главном экране
        const firstHomeTab = document.querySelector('.home-tab[data-tab="chats"]');
        if (firstHomeTab) {
            firstHomeTab.click();
        }
    }
}

function initDesktopInterface() {
    if (isMobile) return;
    
    // Настраиваем ПК интерфейс
    if (desktopSidebar) desktopSidebar.style.display = 'flex';
    if (mobileHeader) mobileHeader.style.display = 'none';
    if (homeScreen) homeScreen.style.display = 'none';
    
    // Показываем либо пустой экран, либо чат
    if (currentChatId) {
        if (desktopEmptyScreen) {
            desktopEmptyScreen.style.display = 'none';
        }
        if (chatScreen) {
            chatScreen.style.display = 'flex';
            chatScreen.classList.add('desktop', 'active');
            chatScreen.classList.remove('mobile');
        }
        if (chatHeaderDesktop) chatHeaderDesktop.style.display = 'flex';
        if (chatHeaderMobile) chatHeaderMobile.style.display = 'none';
    } else {
        if (desktopEmptyScreen) desktopEmptyScreen.style.display = 'flex';
        if (chatScreen) chatScreen.style.display = 'none';
    }
    
    // Обновляем информацию о пользователе в боковой панели
    updateDesktopUserInfo();
    
    // Активируем первую вкладку в ПК сайдбаре
    const firstDesktopTab = document.querySelector('.desktop-sidebar-tab[data-tab="chats"]');
    if (firstDesktopTab) {
        firstDesktopTab.click();
    }
}

function updateDesktopUserInfo() {
    if (!currentUser) return;
    
    // Обновляем аватар и имя
    if (desktopUserAvatar) {
        desktopUserAvatar.textContent = currentUser.displayName.charAt(0);
        
        // Устанавливаем класс статуса для аватара
        desktopUserAvatar.className = 'desktop-user-avatar';
        // Всегда показываем как online, если не offline
        desktopUserAvatar.classList.add(`status-${currentUser.status === "offline" ? "offline" : "online"}`);
    }
    
    if (desktopUserName) desktopUserName.textContent = currentUser.displayName;
    
    // Обновляем статус с иконкой
    if (desktopUserStatus) {
        let statusIcon = 'fa-circle';
        let statusColor = '#10b981';
        let statusText = 'online';
        
        // Если явно offline, показываем offline
        if (currentUser.status === "offline") {
            statusIcon = 'fa-circle';
            statusColor = '#64748b';
            statusText = 'offline';
        } else {
            // Иначе всегда показываем online
            statusIcon = 'fa-circle';
            statusColor = '#10b981';
            statusText = 'online';
        }
        
        desktopUserStatus.innerHTML = `
            <i class="fas ${statusIcon}"></i>
            <span>${statusText}</span>
        `;
        desktopUserStatus.style.color = statusColor;
    }
}

// Функция для проверки и установки правильного статуса
async function checkAndUpdateStatus() {
    if (!currentUser) return;
    
    try {
        const userRef = database.ref(`users/${currentUser.uid}`);
        const snapshot = await userRef.once('value');
        
        if (snapshot.exists()) {
            const userData = snapshot.val();
            
            // Если в базе статус offline, но мы онлайн, исправляем
            if (userData.status === "offline" && navigator.onLine) {
                await userRef.update({
                    status: "online",
                    lastActive: Date.now()
                });
                currentUser.status = "online";
                updateUserProfileDisplay();
                updateDesktopUserInfo();
            }
        }
    } catch (error) {
        console.error("Ошибка проверки статуса:", error);
    }
}

// Функция для инициализации вкладок
function initializeTabs() {
    
    // Инициализация вкладок на главном экране (мобильная версия)
    if (homeTabs && homeTabs.length > 0) {
        homeTabs.forEach(tab => {
            // Убедимся, что обработчик не дублируется
            tab.onclick = null; // Удаляем старый обработчик
            
            tab.addEventListener('click', function() {
                const tabName = this.dataset.tab;
                
                // Обновляем активную вкладку
                homeTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                // Скрываем все панели
                document.querySelectorAll('.home-tab-pane').forEach(pane => {
                    pane.classList.remove('active');
                });
                
                // Показываем активную панель
                const paneId = `home${tabName.charAt(0).toUpperCase() + tabName.slice(1)}Pane`;
                const activePane = document.getElementById(paneId);
                if (activePane) {
                    activePane.classList.add('active');
                }
            });
        });
        
        // Активируем первую вкладку по умолчанию
        if (homeTabs[0]) {
            homeTabs[0].click();
        }
    }
    
    // Инициализация вкладок в мобильной боковой панели
    if (mobileSidebarTabs && mobileSidebarTabs.length > 0) {
        mobileSidebarTabs.forEach(tab => {
            tab.onclick = null; // Удаляем старый обработчик
            
            tab.addEventListener('click', function(e) {
                e.stopPropagation();
                
                // Обработка кнопки выхода
                if (this.id === 'mobileLogoutBtn') {
                    logoutUser();
                    closeMobileSidebar();
                    return;
                }
                
                const tabName = this.dataset.tab;
                
                // Обновляем активную вкладку
                mobileSidebarTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                // Управляем видимостью контейнеров
                if (mobileChatsContainer) {
                    mobileChatsContainer.classList.remove('active');
                }
                if (mobileContactsContainer) {
                    mobileContactsContainer.classList.remove('active');
                }
                
                if (tabName === 'chats') {
                    if (mobileChatsContainer) {
                        mobileChatsContainer.classList.add('active');
                    }
                } else if (tabName === 'contacts') {
                    if (mobileContactsContainer) {
                        mobileContactsContainer.classList.add('active');
                    }
                } else if (tabName === 'profile') {
                    openProfileModal();
                    closeMobileSidebar();
                }
            });
        });
    }
    
    // Инициализация вкладок в ПК боковой панели
    if (desktopSidebarTabs && desktopSidebarTabs.length > 0) {
        desktopSidebarTabs.forEach(tab => {
            tab.onclick = null; // Удаляем старый обработчик
            
            tab.addEventListener('click', function() {
                const tabName = this.dataset.tab;
                currentDesktopTab = tabName;
                
                // Обновляем активную вкладку
                desktopSidebarTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                // Управляем видимостью списков
                if (desktopChatsList) {
                    desktopChatsList.style.display = tabName === 'chats' ? 'flex' : 'none';
                }
                if (desktopContactsList) {
                    desktopContactsList.style.display = tabName === 'contacts' ? 'flex' : 'none';
                }
            });
        });
        
        // Активируем первую вкладку по умолчанию
        if (desktopSidebarTabs[0]) {
            desktopSidebarTabs[0].click();
        }
    }
}

// Вызываем при загрузке
setTimeout(() => {
    checkAndUpdateStatus();
}, 1000);

// ФУНКЦИИ АВТОРИЗАЦИИ
async function loginUser() {
    const email = loginEmail.value.trim();
    const password = loginPassword.value.trim();

    if (!email || !password) {
        showError("Пожалуйста, заполните все поля");
        return;
    }

    try {
        setLoading(true);
        hideError();
    
        await auth.signInWithEmailAndPassword(email, password);
        showSuccess();
    
    } catch (error) {
        showError(getAuthErrorMessage(error));
        setLoading(false);
    }
}

async function quickLogin() {
    try {
        setLoading(true);
        hideError();
    
        await auth.signInAnonymously();
        showSuccess();
    
    } catch (error) {
        showError("Не удалось выполнить быстрый вход");
        setLoading(false);
    }
}

async function registerUser() {
    const name = registerName.value.trim();
    const email = registerEmail.value.trim();
    const password = registerPassword.value.trim();
    const confirmPassword = registerConfirmPassword.value.trim();

    if (!name || !email || !password || !confirmPassword) {
        showError("Пожалуйста, заполните все поля");
        return;
    }

    if (password.length < 6) {
        showError("Пароль должен содержать минимум 6 символов");
        return;
    }

    if (password !== confirmPassword) {
        showError("Пароли не совпадают");
        return;
    }

    try {
        setLoading(true);
        hideError();
    
        const result = await auth.createUserWithEmailAndPassword(email, password);
        const user = result.user;
    
        await user.updateProfile({
            displayName: name
        });
    
        showSuccess();
    
    } catch (error) {
        showError(getAuthErrorMessage(error));
        setLoading(false);
    }
}

function showError(message) {
    if (!authError) return;
    authError.textContent = message;
    authError.classList.add('active');
}

function hideError() {
    if (!authError) return;
    authError.classList.remove('active');
}

function showSuccess() {
    if (!authSuccess) return;
    authSuccess.classList.add('active');
}

function getAuthErrorMessage(error) {
    switch (error.code) {
        case 'auth/email-already-in-use':
            return 'Этот email уже зарегистрирован';
        case 'auth/invalid-email':
            return 'Неверный формат email';
        case 'auth/operation-not-allowed':
            return 'Регистрация отключена';
        case 'auth/weak-password':
            return 'Пароль слишком слабый';
        case 'auth/user-disabled':
            return 'Аккаунт заблокирован';
        case 'auth/user-not-found':
            return 'Пользователь не найден';
        case 'auth/wrong-password':
            return 'Неверный пароль';
        default:
            return 'Ошибка авторизации: ' + error.message;
    }
}

function setLoading(isLoading) {
    if (!authLoading) return;
    
    if (isLoading) {
        authLoading.classList.add('active');
        if (loginBtn) loginBtn.disabled = true;
        if (registerBtn) registerBtn.disabled = true;
        if (quickLoginBtn) quickLoginBtn.disabled = true;
    } else {
        authLoading.classList.remove('active');
        if (loginBtn) loginBtn.disabled = false;
        if (registerBtn) registerBtn.disabled = false;
        if (quickLoginBtn) quickLoginBtn.disabled = false;
    }
}

// ФУНКЦИИ ПОЛЬЗОВАТЕЛЯ
async function loadUserData(userId) {
    try {
        setLoading(true);
    
        // Очищаем старые слушатели, если они есть
        cleanupListeners();
    
        const userRef = database.ref(`users/${userId}`);
        const snapshot = await userRef.once('value');
    
        if (snapshot.exists()) {
            currentUser = {
                uid: userId,
                ...snapshot.val()
            };
            
            // Обновляем статус активности
            await userRef.update({
                lastActive: Date.now()
            });
            
            // Устанавливаем локальный статус как online
            currentUser.status = "online";
            
            // Загружаем всех пользователей
            await loadAllUsers();
            
            // ТЕПЕРЬ УСТАНАВЛИВАЕМ СЛУШАТЕЛЬ VERIFIEDUSERS (currentUser уже есть)
            setupVerifiedUsersListener();
            
            // ОДИН РАЗ загружаем начальные контакты
            const contactsSnapshot = await database.ref(`users/${userId}/contacts`).once('value');
            updateContactsList(contactsSnapshot);
            
            // ОДИН РАЗ загружаем начальные чаты
            const chatsSnapshot = await database.ref('chats')
                .orderByChild(`members/${userId}`)
                .equalTo(true)
                .once('value');
            updateChatsList(chatsSnapshot);
            
            // Устанавливаем слушатели реального времени
            setupContactsListener();
            setupChatsListener();
            
        } else {
            // Создаем нового пользователя
            const user = auth.currentUser;
            currentUser = {
                uid: userId,
                displayName: user.displayName || "Пользователь",
                email: user.email,
                status: "online",
                customId: "user_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
                joinDate: new Date().toLocaleDateString('ru-RU'),
                lastActive: Date.now(),
                createdAt: Date.now()
            };
        
            await userRef.set(currentUser);
            
            // Загружаем всех пользователей
            await loadAllUsers();
            
            // Устанавливаем слушатель verifiedUsers
            setupVerifiedUsersListener();
            
            // Устанавливаем слушатели
            setupContactsListener();
            setupChatsListener();
        }
    
        // Инициализируем интерфейс
        initializeInterface();
    
        setLoading(false);
    
    } catch (error) {
        console.error("Ошибка загрузки данных:", error);
        showNotification("Ошибка загрузки данных. Попробуйте обновить страницу.");
        setLoading(false);
    }
}

// Слушатель для обновления контактов в реальном времени
function setupContactsListener() {
    if (!currentUser) return;
    
    const contactsRef = database.ref(`users/${currentUser.uid}/contacts`);
    
    if (contactsListener) {
        contactsRef.off('value', contactsListener);
    }
    
    // Флаг для предотвращения дублирования
    let isUpdating = false;
    
    contactsListener = contactsRef.on('value', (snapshot) => {
        updateContactsList(snapshot);
        // Используем debounced версию
        debouncedUpdateContactsDisplay();
    });
}

// Слушатель для обновления чатов в реальном времени
function setupChatsListener() {
    if (!currentUser) return;
    
    const chatsRef = database.ref('chats');
    
    // Удаляем старый слушатель, если есть
    if (chatsListener) {
        chatsRef.off('value', chatsListener);
    }
    
    // Фильтруем чаты, где пользователь является участником
    chatsListener = chatsRef.orderByChild(`members/${currentUser.uid}`).equalTo(true)
        .on('value', (snapshot) => {
            updateChatsList(snapshot);
            updateChatsDisplay();
        });
}

function updateChatsList(snapshot) {
    const oldChatsLength = chats.length;
    
    chats = [];
    
    const chatsData = snapshot.val();
    
    if (chatsData) {
        Object.keys(chatsData).forEach(chatId => {
            const chat = chatsData[chatId];
            chat.id = chatId;
            
            // Добавляем слушатель сообщений для нового чата
            if (!messageListeners[chatId]) {
                setupChatListener(chatId);
            }
            
            chats.push(chat);
        });
        
        // Сортируем чаты по времени последнего сообщения
        chats.sort((a, b) => {
            const timeA = a.lastMessage ? a.lastMessage.timestamp : a.createdAt;
            const timeB = b.lastMessage ? b.lastMessage.timestamp : b.createdAt;
            return timeB - timeA; // Новые сверху
        });
    }
}

// Обновляем контакты в мобильной боковой панели
function updateMobileContacts() {
    if (!mobileContactsContainer) return;
    
    mobileContactsContainer.innerHTML = '';
    
    if (contacts.length === 0) {
        mobileContactsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-user-friends"></i>
                <h3>Контакты отсутствуют</h3>
                <p>Добавьте контакты, чтобы начать общение</p>
            </div>
        `;
        return;
    }
    
    contacts.forEach(contact => {
        const contactElement = document.createElement('div');
        contactElement.className = 'mobile-contact-item';
        contactElement.dataset.userId = contact.userId;
        
        contactElement.innerHTML = `
            <div class="contact-avatar">
                ${contact.displayName.charAt(0)}
            </div>
            <div class="contact-info">
                <div class="contact-name">${contact.displayName}</div>
                <div class="contact-status ${contact.status}">${contact.status}</div>
            </div>
        `;
        
        contactElement.addEventListener('click', () => {
            openOrCreatePrivateChat(contact.userId);
            closeMobileSidebar();
        });
        
        mobileContactsContainer.appendChild(contactElement);
    });
}

async function logoutUser() {
    try {
        // Очищаем все слушатели
        cleanupListeners();
        
        if (currentUser) {
            await database.ref(`users/${currentUser.uid}`).update({
                status: "offline",
                lastActive: Date.now() // Используем lastActive вместо lastSeen
            });
        }
    
        await auth.signOut();
    
        currentUser = null;
        chats = [];
        contacts = [];
        currentChatId = null;
        replyToMessage = null;
    
        // Останавливаем мониторинг
        if (connectionCheckInterval) {
            clearInterval(connectionCheckInterval);
            connectionCheckInterval = null;
        }
    
        showNotification("Вы вышли из системы");
    
    } catch (error) {
        console.error("Ошибка выхода:", error);
    }
}

// ФУНКЦИИ ДЛЯ ЧАТОВ
async function loadAllUsers() {
    try {
        const usersRef = database.ref('users');
        const snapshot = await usersRef.once('value');
        const usersData = snapshot.val();
    
        if (usersData) {
            allUsers = {};
            
            // Загружаем ВСЕХ пользователей, включая текущего
            for (const userId in usersData) {
                allUsers[userId] = {
                    uid: userId,
                    displayName: usersData[userId].displayName || "Пользователь",
                    customId: usersData[userId].customId || `user_${userId.substr(0, 8)}`,
                    status: usersData[userId].status || 'offline',
                    lastActive: usersData[userId].lastActive || 0
                };
            }
        }
    } catch (error) {
    }
}

function updateChatHeader() {
    if (!currentChatId) return;
    
    const chat = chats.find(c => c.id === currentChatId);
    if (!chat) return;
    
    if (chat.type === 'private') {
        const otherUserId = Object.keys(chat.members).find(id => id !== currentUser.uid);
        const otherUser = allUsers[otherUserId];
        const chatName = otherUser ? otherUser.displayName : "Неизвестный пользователь";
        const badgeHtml = getVerifiedBadge(otherUserId);
        
        if (isMobile) {
            if (chatHeaderName) {
                chatHeaderName.innerHTML = `<span class="chat-header-name-with-badge">${chatName} ${badgeHtml}</span>`;
            }
        } else {
            if (desktopChatHeaderName) {
                desktopChatHeaderName.innerHTML = `<span class="chat-header-name-with-badge">${chatName} ${badgeHtml}</span>`;
            }
        }
    }
}

// Функция для загрузки верифицированных пользователей
// Слушатель для верифицированных пользователей
function setupVerifiedUsersListener() {
    console.log("🟢 setupVerifiedUsersListener вызван");
    
    if (!currentUser) {
        console.log("🔴 currentUser нет, слушатель не установлен");
        return;
    }
    
    console.log("🟢 currentUser есть, устанавливаем слушатель для verifiedUsers");
    
    const verifiedRef = database.ref('verifiedUsers');
    
    if (verifiedUsersListener) {
        console.log("🟡 Удаляем старый слушатель");
        verifiedRef.off('value', verifiedUsersListener);
    }
    
    verifiedUsersListener = verifiedRef.on('value', (snapshot) => {
        console.log("✅ verifiedUsers обновлены!");
        verifiedUsers = snapshot.val() || {};
        console.log("📊 Данные verifiedUsers:", verifiedUsers);
        
        // Обновляем видимость админ-кнопки
        updateAdminButtonVisibility();
        
        // Принудительно обновляем интерфейс
        if (currentChatId) {
            console.log("🔄 Обновляем сообщения в чате");
            loadMessages(currentChatId);
            updateChatHeader();
        }
        
        console.log("🔄 Обновляем контакты");
        updateHomeContacts();
        updateDesktopContacts();
        
        // Обновляем результаты поиска если они открыты
        const searchResults = document.querySelector('.search-results-container.active');
        if (searchResults) {
            console.log("🔄 Обновляем результаты поиска");
            const searchInput = document.getElementById('contactSearch');
            if (searchInput && searchInput.value.trim().length > 0) {
                const searchResults2 = searchUsers(searchInput.value.trim(), contacts);
                displaySearchResults(searchResults2, 'contactSearchResults', contacts);
            }
        }
        
        // Обновляем админ-панель если она открыта
        const adminModal = document.getElementById('adminPanelModal');
        if (adminModal && adminModal.classList.contains('active')) {
            console.log("🔄 Обновляем админ-панель");
            loadVerifiedUsersList();
        }
        
        console.log("✅ Все обновления завершены");
        
    }, (error) => {
        console.error("🔴 Ошибка слушателя verifiedUsers:", error);
        showNotification("Ошибка загрузки верифицированных пользователей");
    });
    
    console.log("✅ Слушатель verifiedUsers установлен");
}

// Функция для обновления видимости админ-кнопки
function updateAdminButtonVisibility() {
    const adminBtn = document.getElementById('adminPanelBtn');
    if (!adminBtn) return;
    
    if (currentUser && verifiedUsers && verifiedUsers[currentUser.uid] && 
        verifiedUsers[currentUser.uid].type === 'admin') {
        adminBtn.style.display = 'flex';
        console.log("👑 Админская кнопка показана");
    } else {
        adminBtn.style.display = 'none';
    }
}

// Функция для принудительной перезагрузки verifiedUsers
async function reloadVerifiedUsers() {
    try {
        console.log("🔄 Принудительная перезагрузка verifiedUsers");
        const snapshot = await database.ref('verifiedUsers').once('value');
        verifiedUsers = snapshot.val() || {};
        console.log("✅ verifiedUsers перезагружены:", verifiedUsers);
        
        // Обновляем интерфейс
        if (currentChatId) {
            loadMessages(currentChatId);
            updateChatHeader();
        }
        updateHomeContacts();
        updateDesktopContacts();
        
        return verifiedUsers;
    } catch (error) {
        console.error("❌ Ошибка перезагрузки:", error);
    }
}

// Добавьте эту функцию для тестирования в консоли
window.testVerified = function() {
    console.log("=== ТЕСТ VERIFIEDUSERS ===");
    console.log("currentUser:", currentUser);
    console.log("verifiedUsers:", verifiedUsers);
    console.log("isAdmin:", currentUser && verifiedUsers && verifiedUsers[currentUser.uid]);
    reloadVerifiedUsers();
};

// Когда выдаёте галочку, добавьте:
async function giveBadge() {
    await database.ref(`verifiedUsers/FmxyeGpCCBbAt71qFBwhmWnbANB2`).set({
        type: "admin",
        verifiedAt: Date.now(),
        verifiedBy: currentUser.uid
    });
    
    // Принудительно обновляем verifiedUsers
    const snapshot = await database.ref('verifiedUsers').once('value');
    verifiedUsers = snapshot.val() || {};
    
    // Обновляем интерфейс
    if (currentChatId) {
        loadMessages(currentChatId);
    }
    updateHomeContacts();
    updateDesktopContacts();
    
    console.log("✅ Галочка выдана и интерфейс обновлён");
}

// Функция для обновления всех имён
function updateAllDisplayNames() {
    // Обновляем сообщения
    document.querySelectorAll('.message-sender-name').forEach(el => {
        // Просто перерисовываем текущий чат если он открыт
        if (currentChatId) {
            loadMessages(currentChatId);
        }
    });
    
    // Обновляем контакты
    if (homeContactsList) updateHomeContacts();
    if (desktopContactsList) updateDesktopContacts();
    if (mobileContactsContainer) updateMobileContacts();
    
    // Обновляем чаты
    if (homeChatsList) updateHomeChats();
    if (desktopChatsList) updateDesktopChats();
}

// Функция для получения значка верификации
function getVerifiedBadge(userId) {
    if (!userId || !verifiedUsers || !verifiedUsers[userId]) return '';
    
    const userVerified = verifiedUsers[userId];
    let badgeHtml = '<span class="verified-badge">';
    
    switch(userVerified.type) {
        case 'admin':
            badgeHtml += '<i class="fas fa-check-circle verified-icon admin"></i>';
            break;
        case 'premium':
            badgeHtml += '<i class="fas fa-star verified-icon premium"></i>';
            break;
        case 'partner':
            badgeHtml += '<i class="fas fa-handshake verified-icon partner" style="font-size: 18px; transform: scale(1.2); display: inline-block; width: 18px; height: 18px;"></i>';
            break;
        case 'celebrity':
            badgeHtml += '<i class="fas fa-crown verified-icon celebrity"></i>';
            break;
        default:
            badgeHtml += '<i class="fas fa-check-circle verified-icon default"></i>';
    }
    
    badgeHtml += '</span>';
    return badgeHtml;
}
async function loadUserChats() {
    try {
        Object.values(messageListeners).forEach(unsubscribe => unsubscribe());
        Object.values(typingListeners).forEach(unsubscribe => unsubscribe());
        messageListeners = {};
        typingListeners = {};
    
        const chatsRef = database.ref('chats');
        const snapshot = await chatsRef.orderByChild(`members/${currentUser.uid}`).equalTo(true).once('value');
    
        chats = [];
    
        const chatsData = snapshot.val();
        if (chatsData) {
            Object.keys(chatsData).forEach(chatId => {
                const chat = chatsData[chatId];
                chat.id = chatId;
                chats.push(chat);
            
                setupChatListener(chatId);
            });
        }
    
        updateHomeChats();
        updateDesktopChats();
        updateProfileChatsCount();
    
    } catch (error) {
    }
}

function updateHomeChats() {
    if (!homeChatsList) return;
    
    homeChatsList.innerHTML = '';
    
    if (chats.length === 0) {
        homeChatsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-comments"></i>
                <h3>Чатов пока нет</h3>
                <p>Создайте первый чат, чтобы начать общение</p>
                <button class="action-btn" id="createFirstChatBtn">
                    <i class="fas fa-plus-circle"></i> Создать чат
                </button>
            </div>
        `;
        
        document.getElementById('createFirstChatBtn')?.addEventListener('click', () => {
            if (createChatModal) createChatModal.classList.add('active');
        });
        return;
    }
    
    chats.forEach(chat => {
        const chatElement = createChatElement(chat);
        homeChatsList.appendChild(chatElement);
    });
}

function updateDesktopChats() {
    if (!desktopChatsList) return;
    
    desktopChatsList.innerHTML = '';
    
    if (chats.length === 0) {
        desktopChatsList.innerHTML = `
            <div class="empty-state" style="text-align: center; padding: 30px 15px; color: #64748b;">
                <i class="fas fa-comments" style="font-size: 32px; margin-bottom: 15px; opacity: 0.5;"></i>
                <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 8px; color: #94a3b8;">Чатов пока нет</h3>
                <p style="font-size: 14px; margin-bottom: 15px;">Создайте первый чат, чтобы начать общение</p>
            </div>
        `;
        return;
    }
    
    chats.forEach(chat => {
        const chatElement = createDesktopChatElement(chat);
        desktopChatsList.appendChild(chatElement);
    });
}

function createChatElement(chat) {
    const chatElement = document.createElement('div');
    chatElement.className = 'chat-item';
    chatElement.dataset.chatId = chat.id;

    let avatarClass, avatarContent, chatName;

    if (chat.type === 'group') {
        avatarClass = 'group-avatar';
        avatarContent = '<i class="fas fa-users"></i>';
        chatName = chat.name;
    } else if (chat.type === 'private') {
        avatarClass = 'private-avatar';
    
        const otherUserId = Object.keys(chat.members).find(id => id !== currentUser.uid);
        const otherUser = allUsers[otherUserId];
    
        if (otherUser) {
            avatarContent = otherUser.displayName.charAt(0);
            chatName = otherUser.displayName;
        } else {
            avatarContent = '?';
            chatName = "Неизвестный пользователь";
        }
    }

    chatElement.innerHTML = `
        <div class="chat-avatar ${avatarClass}">
            ${avatarContent}
        </div>
        <div class="chat-info">
            <div class="chat-name">${chatName}</div>
            <div class="last-message">Нажмите чтобы открыть...</div>
        </div>
        <div class="chat-meta">
            <div class="chat-time">--:--</div>
        </div>
    `;
    
    chatElement.addEventListener('click', () => {
        openChat(chat.id);
    });

    return chatElement;
}

function createDesktopChatElement(chat) {
    const chatElement = document.createElement('div');
    chatElement.className = 'desktop-chat-item';
    chatElement.dataset.chatId = chat.id;
    
    if (currentChatId === chat.id) {
        chatElement.classList.add('active');
    }

    let avatarClass, avatarContent, chatName;

    if (chat.type === 'group') {
        avatarClass = 'desktop-chat-avatar';
        avatarContent = '<i class="fas fa-users" style="font-size: 16px;"></i>';
        chatName = chat.name;
    } else if (chat.type === 'private') {
        avatarClass = 'desktop-chat-avatar';
    
        const otherUserId = Object.keys(chat.members).find(id => id !== currentUser.uid);
        const otherUser = allUsers[otherUserId];
    
        if (otherUser) {
            avatarContent = otherUser.displayName.charAt(0);
            chatName = otherUser.displayName;
        } else {
            avatarContent = '?';
            chatName = "Неизвестный пользователь";
        }
    }

    chatElement.innerHTML = `
        <div class="${avatarClass}" style="background: ${chat.type === 'group' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)'}">
            ${avatarContent}
        </div>
        <div class="desktop-chat-info">
            <div class="desktop-chat-name">${chatName}</div>
            <div class="desktop-chat-last-message">Нажмите чтобы открыть...</div>
        </div>
    `;
    
    chatElement.addEventListener('click', () => {
        openChat(chat.id);
    });

    return chatElement;
}

// ИСПРАВЛЕННАЯ ФУНКЦИЯ ЗАГРУЗКИ КОНТАКТОВ
async function loadContacts() {
    try {
        
        const contactsRef = database.ref(`users/${currentUser.uid}/contacts`);
        
        // Используем once для первоначальной загрузки
        const snapshot = await contactsRef.once('value');
        updateContactsList(snapshot);
        
        // Затем слушаем изменения в реальном времени
        contactsRef.on('value', (snapshot) => {
            updateContactsList(snapshot);
        });
        
    } catch (error) {
    }
}

// ИСПРАВЛЕННАЯ ФУНКЦИЯ ОБНОВЛЕНИЯ СПИСКА КОНТАКТОВ
function updateContactsList(snapshot) {
    const contactsData = snapshot.val();
    
    if (!contactsData || typeof contactsData !== 'object') {
        contacts = [];
        return;
    }
    
    // Используем Set для отслеживания уникальных ID
    const existingIds = new Set(contacts.map(c => c.userId));
    const newContacts = [];
    let addedCount = 0;
    let removedCount = 0;
    
    Object.keys(contactsData).forEach(userId => {
        const contactData = contactsData[userId];
        const user = allUsers[userId];
        
        if (!existingIds.has(userId)) {
            addedCount++;
        }
        
        const contact = {
            userId: userId,
            displayName: user ? user.displayName : (contactData.displayName || "Неизвестный пользователь"),
            customId: user ? user.customId : (contactData.customId || `user_${userId.substr(0, 8)}`),
            status: user ? user.status : (contactData.status || 'offline'),
            lastActive: user ? user.lastActive : (contactData.lastActive || 0),
            addedAt: contactData.addedAt || Date.now()
        };
        
        newContacts.push(contact);
        existingIds.add(userId);
    });
    
    // Проверяем, были ли удалены контакты
    const newIds = new Set(newContacts.map(c => c.userId));
    contacts.forEach(contact => {
        if (!newIds.has(contact.userId)) {
            removedCount++;
        }
    });
    
    // Обновляем только если есть изменения
    if (addedCount > 0 || removedCount > 0 || contacts.length !== newContacts.length) {
        contacts = newContacts;
    } else {
    }
}

// Функция с дебаунсом для обновлений
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Создаем версию с дебаунсом
const debouncedUpdateContactsDisplay = debounce(updateContactsDisplay, 300);

// НОВАЯ ФУНКЦИЯ: Обновление контактов на главном экране
function updateHomeContacts() {
    if (!homeContactsList) return;
    
    homeContactsList.innerHTML = '';
    
    if (contacts.length === 0) {
        homeContactsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-user-friends"></i>
                <h3>Контакты отсутствуют</h3>
                <p>Начните поиск, чтобы добавить контакты</p>
                <div class="search-tip" style="margin-top: 15px; padding: 10px; background: rgba(139, 92, 246, 0.1); border-radius: 8px;">
                    <p style="color: #cbd5e1; font-size: 13px;">💡 Введите имя или ID пользователя в поле поиска выше</p>
                </div>
            </div>
        `;
        return;
    }
    
    // Сортируем контакты по статусу и имени
    const sortedContacts = [...contacts].sort((a, b) => {
        // Сначала онлайн пользователи
        if (a.status === 'online' && b.status !== 'online') return -1;
        if (a.status !== 'online' && b.status === 'online') return 1;
        
        // Затем сортируем по имени
        return a.displayName.localeCompare(b.displayName);
    });
    
    sortedContacts.forEach(contact => {
        const contactElement = createContactElement(contact);
        homeContactsList.appendChild(contactElement);
    });
}

function createContactElement(contact) {
    const contactElement = document.createElement('div');
    contactElement.className = 'contact-item';
    contactElement.dataset.userId = contact.userId;

    contactElement.innerHTML = `
        <div class="contact-avatar">
            ${contact.displayName.charAt(0)}
        </div>
        <div class="contact-info">
            <div class="contact-name" onclick="openUserProfileModal('${contact.userId}')" style="cursor: pointer;">
                ${contact.displayName}
                ${getVerifiedBadge(contact.userId)}
            </div>
            <div class="contact-status ${contact.status || 'offline'}">${contact.status || 'offline'}</div>
        </div>
        <div class="chat-meta">
            <div class="chat-time">${contact.customId}</div>
        </div>
    `;
    
    contactElement.addEventListener('click', () => {
        openOrCreatePrivateChat(contact.userId);
    });

    return contactElement;
}

function updateDesktopContacts() {
    if (!desktopContactsList) return;
    
    desktopContactsList.innerHTML = '';
    
    if (contacts.length === 0) {
        desktopContactsList.innerHTML = `
            <div class="empty-state" style="text-align: center; padding: 30px 15px; color: #64748b;">
                <i class="fas fa-user-friends" style="font-size: 32px; margin-bottom: 15px; opacity: 0.5;"></i>
                <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 8px; color: #94a3b8;">Контакты отсутствуют</h3>
                <p style="font-size: 14px; margin-bottom: 15px;">Добавьте контакты, чтобы начать общение</p>
            </div>
        `;
        return;
    }
    
    // Сортируем контакты для десктопного интерфейса
    const sortedContacts = [...contacts].sort((a, b) => {
        if (a.status === 'online' && b.status !== 'online') return -1;
        if (a.status !== 'online' && b.status === 'online') return 1;
        return a.displayName.localeCompare(b.displayName);
    });
    
    sortedContacts.forEach(contact => {
        const contactElement = createDesktopContactElement(contact);
        desktopContactsList.appendChild(contactElement);
    });
}

function createDesktopContactElement(contact) {
    const contactElement = document.createElement('div');
    contactElement.className = 'desktop-chat-item';
    contactElement.dataset.userId = contact.userId;

    const statusColor = contact.status === 'online' ? '#10b981' : 
                       contact.status === 'away' ? '#f59e0b' : 
                       contact.status === 'dnd' ? '#ef4444' : '#94a3b8';

    contactElement.innerHTML = `
        <div class="desktop-chat-avatar" style="background: linear-gradient(135deg, #f093fb, #f5576c)">
            ${contact.displayName.charAt(0)}
        </div>
        <div class="desktop-chat-info">
            <div class="desktop-chat-name">
                ${contact.displayName}
                ${getVerifiedBadge(contact.userId)}
            </div>
            <div class="desktop-chat-last-message" style="color: ${statusColor}">${contact.status || 'offline'} • ${contact.customId}</div>
        </div>
    `;
    
    contactElement.addEventListener('click', () => {
        openOrCreatePrivateChat(contact.userId);
    });

    return contactElement;
}

// ================================================
// УЛУЧШЕННЫЙ ПОИСК КОНТАКТОВ
// ================================================

// Функция для поиска пользователей
function searchUsers(query, currentContacts = []) {
    query = query.toLowerCase().trim();
    
    if (!query || query.length < 1) {
        return []; // Возвращаем пустой массив при пустом запросе
    }
    
    const results = [];
    
    // Ищем среди всех пользователей, кроме текущего
    for (const userId in allUsers) {
        if (userId === currentUser.uid) continue;
        
        const user = allUsers[userId];
        
        // Проверяем совпадения по имени и customId
        const matchesName = user.displayName && user.displayName.toLowerCase().includes(query);
        const matchesCustomId = user.customId && user.customId.toLowerCase().includes(query);
        const matchesUserId = userId.toLowerCase().includes(query);
        
        if (matchesName || matchesCustomId || matchesUserId) {
            // Проверяем, не является ли пользователь уже контактом
            const isAlreadyContact = currentContacts.some(contact => contact.userId === userId);
            
            results.push({
                userId: userId,
                displayName: user.displayName,
                customId: user.customId || `user_${userId.substr(0, 8)}`,
                status: user.status || 'offline',
                lastActive: user.lastActive || 0,
                isContact: isAlreadyContact
            });
        }
    }
    
    // Сортируем результаты:
    // 1. Сначала онлайн пользователи
    // 2. Потом те, кто еще не в контактах
    // 3. По алфавиту
    results.sort((a, b) => {
        // Сначала онлайн
        if (a.status === 'online' && b.status !== 'online') return -1;
        if (a.status !== 'online' && b.status === 'online') return 1;
        
        // Потом те, кто еще не в контактах
        if (!a.isContact && b.isContact) return -1;
        if (a.isContact && !b.isContact) return 1;
        
        // Затем по алфавиту
        return a.displayName.localeCompare(b.displayName);
    });
    
    return results;
}

// Функция для отображения результатов поиска
function displaySearchResults(results, containerId, currentContacts = []) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Очищаем контейнер
    container.innerHTML = '';
    
    if (results.length === 0) {
        container.innerHTML = `
            <div class="no-search-results">
                <i class="fas fa-user-friends"></i>
                <p>Пользователи не найдены</p>
                <p class="search-info">Попробуйте ввести другое имя или ID</p>
            </div>
        `;
        container.classList.add('active');
        return;
    }
    
    results.forEach(result => {
        const resultItem = document.createElement('div');
        resultItem.className = 'search-result-item';
        resultItem.dataset.userId = result.userId;
        resultItem.dataset.customId = result.customId;
        
        const statusClass = result.status === 'online' ? 'online' : 
                           result.status === 'away' ? 'away' : 
                           result.status === 'dnd' ? 'dnd' : 'offline';
        
        const statusText = result.status === 'online' ? 'online' : 
                          result.status === 'away' ? 'away' : 
                          result.status === 'dnd' ? 'dnd' : 'offline';
        
        const buttonText = result.isContact ? 'В контактах ✓' : 'Добавить';
        const buttonDisabled = result.isContact ? 'disabled' : '';
        
        resultItem.innerHTML = `
            <div class="search-result-avatar">
                ${result.displayName.charAt(0)}
            </div>
            <div class="search-result-info">
                <div class="search-result-name">
                    ${result.displayName}
                    ${getVerifiedBadge(result.userId)}
                </div>
                <div class="search-result-id">${result.customId}</div>
                <div class="search-result-status ${statusClass}">
                    ${statusText}
                </div>
            </div>
            <button class="add-user-btn" ${buttonDisabled}>
                ${buttonText}
            </button>
        `;
        
        // Обработчик добавления контакта
        const addBtn = resultItem.querySelector('.add-user-btn');
        if (!result.isContact) {
            addBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                await addContact(result.customId);
                
                // Обновляем отображение этого пользователя
                result.isContact = true;
                displaySearchResults(results, containerId, currentContacts);
            });
        }
        
        // Обработчик открытия чата (если уже контакт)
        resultItem.addEventListener('click', () => {
            if (result.isContact) {
                openOrCreatePrivateChat(result.userId);
            }
        });
        
        container.appendChild(resultItem);
    });
    
    container.classList.add('active');
}

// Функция для скрытия результатов поиска
function hideSearchResults(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.classList.remove('active');
    }
}

// Поиск контактов на главном экране
if (homeContactsSearch) {
    homeContactsSearch.addEventListener('input', function() {
        const query = this.value.trim();
        
        // Очищаем предыдущий таймаут
        if (searchTimeouts.homeSearch) {
            clearTimeout(searchTimeouts.homeSearch);
        }
        
        if (query.length < 1) {
            hideSearchResults('homeContactsSearchResults');
            return;
        }
        
        // Запускаем поиск с задержкой (дебаунс)
        searchTimeouts.homeSearch = setTimeout(() => {
            const searchResults = searchUsers(query, contacts);
            displaySearchResults(searchResults, 'homeContactsSearchResults', contacts);
        }, 300); // Задержка 300 мс
    });
    
    // Закрываем результаты поиска при клике вне их
    document.addEventListener('click', (e) => {
        if (!homeContactsSearch.contains(e.target) && 
            !homeContactsSearchResults.contains(e.target)) {
            hideSearchResults('homeContactsSearchResults');
        }
    });
}

// Поиск контактов в модальном окне
if (contactSearch) {
    contactSearch.addEventListener('input', function() {
        const query = this.value.trim();
        
        // Очищаем предыдущий таймаут
        if (searchTimeouts.modalSearch) {
            clearTimeout(searchTimeouts.modalSearch);
        }
        
        if (query.length < 1) {
            hideSearchResults('contactSearchResults');
            if (confirmAddContactBtn) confirmAddContactBtn.disabled = true;
            return;
        }
        
        // Запускаем поиск с задержкой (дебаунс)
        searchTimeouts.modalSearch = setTimeout(() => {
            const searchResults = searchUsers(query, contacts);
            displaySearchResults(searchResults, 'contactSearchResults', contacts);
            
            // Активируем кнопку добавления, если есть результаты
            if (confirmAddContactBtn) {
                confirmAddContactBtn.disabled = searchResults.length === 0 || !searchResults.some(r => !r.isContact);
            }
        }, 300); // Задержка 300 мс
    });
}

// ОТКРЫТИЕ ЧАТА - ИСПРАВЛЕННАЯ ВЕРСИЯ ДЛЯ МОБИЛЬНЫХ
async function openChat(chatId) {
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return;

    currentChatId = chatId;
    replyToMessage = null;
    hideReplyPreview();

    if (isMobile) {
        if (homeScreen) {
            homeScreen.style.display = 'none';
            homeScreen.style.position = 'absolute';
            homeScreen.style.zIndex = '1';
        }
        if (chatScreen) {
            chatScreen.style.display = 'flex';
            chatScreen.style.position = 'absolute';
            chatScreen.style.top = '0';
            chatScreen.style.left = '0';
            chatScreen.style.right = '0';
            chatScreen.style.bottom = '0';
            chatScreen.style.zIndex = '1000';
            chatScreen.style.background = 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)';
            chatScreen.classList.add('mobile');
            chatScreen.classList.remove('desktop');
        }
        if (desktopEmptyScreen) desktopEmptyScreen.style.display = 'none';
        closeMobileSidebar();
        
        document.querySelectorAll('.chat-item').forEach(item => {
            item.classList.remove('active');
        });
        const activeChatItem = document.querySelector(`.chat-item[data-chat-id="${chatId}"]`);
        if (activeChatItem) {
            activeChatItem.classList.add('active');
        }
    } else {
        if (desktopEmptyScreen) {
            desktopEmptyScreen.style.display = 'none';
        }
        
        if (chatScreen) {
            chatScreen.style.display = 'flex';
            chatScreen.classList.add('desktop', 'active');
            chatScreen.classList.remove('mobile');
        }
        
        document.querySelectorAll('.desktop-chat-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeChatItem = document.querySelector(`.desktop-chat-item[data-chat-id="${chatId}"]`);
        if (activeChatItem) {
            activeChatItem.classList.add('active');
        }
    }

    let chatName, chatDescription, avatarContent, chatHeaderBadge = '';

    if (chat.type === 'private') {
        const otherUserId = Object.keys(chat.members).find(id => id !== currentUser.uid);
        const otherUser = allUsers[otherUserId];
        
        chatName = otherUser ? otherUser.displayName : "Неизвестный пользователь";
        chatDescription = "Личный чат";
        avatarContent = otherUser ? otherUser.displayName.charAt(0) : '?';
        
        // Добавляем галочку для личного чата
        chatHeaderBadge = getVerifiedBadge(otherUserId);
    } else {
        chatName = chat.name;
        chatDescription = chat.description || `Групповой чат`;
        avatarContent = '<i class="fas fa-users"></i>';
    }

    // Обновляем заголовок в зависимости от устройства
    if (isMobile) {
        if (chatHeaderName) {
            // Оборачиваем имя и галочку в span с классом
            chatHeaderName.innerHTML = `<span class="chat-header-name-with-badge">${chatName} ${chatHeaderBadge}</span>`;
        }
        if (chatHeaderDescription) chatHeaderDescription.textContent = chatDescription;
        if (chatHeaderDesktop) chatHeaderDesktop.style.display = 'none';
        if (chatHeaderMobile) chatHeaderMobile.style.display = 'flex';
    } else {
        if (desktopChatHeaderName) {
            // Оборачиваем имя и галочку в span с классом
            desktopChatHeaderName.innerHTML = `<span class="chat-header-name-with-badge">${chatName} ${chatHeaderBadge}</span>`;
        }
        if (desktopChatHeaderDescription) desktopChatHeaderDescription.textContent = chatDescription;
        if (desktopChatAvatar) {
            desktopChatAvatar.innerHTML = avatarContent;
            desktopChatAvatar.style.background = chat.type === 'group' ? 
                'linear-gradient(135deg, #10b981, #059669)' : 
                'linear-gradient(135deg, #3b82f6, #1d4ed8)';
        }
        if (chatHeaderDesktop) chatHeaderDesktop.style.display = 'flex';
        if (chatHeaderMobile) chatHeaderMobile.style.display = 'none';
    }

    loadMessages(chatId);
    updateChatHeader();
    focusMessageInput();
}

function showHomeScreen() {
    
    currentChatId = null;
    replyToMessage = null;
    hideReplyPreview();
    
    if (isMobile) {
        // Мобильный интерфейс - ИСПРАВЛЕНО: возвращаем правильное отображение
        if (chatScreen) {
            chatScreen.style.display = 'none';
            chatScreen.style.position = 'relative';
            chatScreen.style.zIndex = 'auto';
        }
        if (homeScreen) {
            homeScreen.style.display = 'block';
            homeScreen.style.position = 'relative';
            homeScreen.style.zIndex = 'auto';
        }
        if (desktopEmptyScreen) desktopEmptyScreen.style.display = 'none';
        closeMobileSidebar();
        
        // Снимаем выделение активного чата
        document.querySelectorAll('.chat-item').forEach(item => {
            item.classList.remove('active');
        });
    } else {
        // ПК интерфейс
        if (chatScreen) {
            chatScreen.style.display = 'none';
            chatScreen.classList.remove('active');
        }
        if (desktopEmptyScreen) {
            desktopEmptyScreen.style.display = 'flex';
        }
        
        // Снимаем выделение активного чата
        document.querySelectorAll('.desktop-chat-item').forEach(item => {
            item.classList.remove('active');
        });
    }
}

// СООБЩЕНИЯ
function loadMessages(chatId) {
    if (!messagesContainer) return;
    
    messagesContainer.innerHTML = '';

    try {
        const messagesRef = database.ref(`messages/${chatId}`)
            .orderByChild('timestamp');

        messagesRef.once('value').then((snapshot) => {
            const messagesData = snapshot.val();
        
            if (messagesData) {
                // Получаем все сообщения
                const messagesArray = Object.keys(messagesData).map(key => ({
                    id: key,
                    ...messagesData[key]
                }));
                
                // СОРТИРУЕМ: старые в начало, новые в конец
                messagesArray.sort((a, b) => a.timestamp - b.timestamp);
                
                // Очищаем контейнер
                messagesContainer.innerHTML = '';
                
                // Добавляем все сообщения
                messagesArray.forEach(message => {
                    messagesContainer.appendChild(createMessageElement(message));
                });

                // Прокручиваем вниз через разные интервалы
                setTimeout(() => {
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                }, 100);
                
                setTimeout(() => {
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                }, 300);
                
                setTimeout(() => {
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                    focusMessageInput();
                }, 500);
                
            } else {
                showWelcomeMessage();
                focusMessageInput();
            }
        });
    
        listenToNewMessages(chatId);
    
    } catch (error) {
        console.error("Ошибка загрузки сообщений:", error);
    }
}

// Специальная функция для мобильного автофокуса с клавиатурой
function focusMobileInput() {
    if (isMobile && messageInput) {
        // На мобильных нужно немного больше времени и хитростей
        setTimeout(() => {
            messageInput.focus();
            // Пробуем вызвать клавиатуру
            messageInput.click();
        }, 500);
    }
}

// Обновите focusMessageInput:
function focusMessageInput() {
    if (messageInput) {
        setTimeout(() => {
            messageInput.focus();
            if (isMobile) {
                // Для мобильных дополнительно симулируем клик
                messageInput.click();
            }
        }, 300);
    }
}

// Прокрутка вниз
function scrollToBottom(behavior = 'smooth') {
    if (!messagesContainer) return;
    
    const marker = document.getElementById('scroll-bottom-marker');
    if (marker) {
        marker.scrollIntoView({ 
            behavior: behavior, 
            block: 'end' 
        });
        
        // Скрываем кнопку и сбрасываем счетчик
        setTimeout(() => {
            hideScrollButton();
            unreadMessagesCount = 0;
            updateNewMessagesCount();
        }, 300);
    } else {
        // Если нет маркера, прокручиваем в самый низ
        messagesContainer.scrollTo({
            top: messagesContainer.scrollHeight,
            behavior: behavior
        });
    }
}

function listenToNewMessages(chatId) {
    if (messageListeners[chatId]) {
        database.ref(`messages/${chatId}`).off('child_added', messageListeners[chatId]);
    }

    const callback = database.ref(`messages/${chatId}`)
        .orderByChild('timestamp')
        .startAt(Date.now())
        .on('child_added', (snapshot) => {
            const message = { id: snapshot.key, ...snapshot.val() };
            
            const isOwnMessage = message.senderId === currentUser.uid;
            
            if (!document.querySelector(`[data-message-id="${message.id}"]`)) {
                const messageElement = createMessageElement(message);
                
                if (messagesContainer) {
                    messagesContainer.appendChild(messageElement);
                    
                    // Проверяем, был ли пользователь внизу
                    const isAtBottom = messagesContainer.scrollHeight - messagesContainer.scrollTop - messagesContainer.clientHeight < 50;
                    
                    if (isOwnMessage || isAtBottom) {
                        // Если это свое сообщение или пользователь был внизу - прокручиваем
                        setTimeout(() => {
                            if (message.type === 'photo') {
                                // Для фото ждем загрузки
                                const img = messageElement.querySelector('img');
                                if (img) {
                                    if (img.complete) {
                                        messagesContainer.scrollTop = messagesContainer.scrollHeight;
                                    } else {
                                        img.addEventListener('load', () => {
                                            messagesContainer.scrollTop = messagesContainer.scrollHeight;
                                        });
                                    }
                                } else {
                                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                                }
                            } else {
                                messagesContainer.scrollTop = messagesContainer.scrollHeight;
                            }
                        }, 50);
                    }
                }
            }
        });
    
    messageListeners[chatId] = callback;
    
    database.ref(`messages/${chatId}`).on('child_changed', (snapshot) => {
        const updatedMessage = { id: snapshot.key, ...snapshot.val() };
        updateMessageReactions(updatedMessage);
    });
}

// Функция обновления реакций сообщения
function updateMessageReactions(message) {
    const messageElement = document.querySelector(`[data-message-id="${message.id}"]`);
    if (!messageElement) return;
    
    const messageContent = messageElement.querySelector('.message-content');
    if (!messageContent) return;
    
    // Удаляем старый контейнер реакций
    const oldReactionsContainer = messageElement.querySelector('.message-reactions');
    if (oldReactionsContainer) {
        oldReactionsContainer.remove();
    }
    
    // Собираем статистику реакций
    const reactionStats = {};
    if (message.reactions && Object.keys(message.reactions).length > 0) {
        Object.values(message.reactions).forEach(reaction => {
            if (!reactionStats[reaction.emoji]) {
                reactionStats[reaction.emoji] = {
                    count: 0,
                    users: []
                };
            }
            reactionStats[reaction.emoji].count++;
            reactionStats[reaction.emoji].users.push(reaction.userId);
        });
    }
    
    // Если реакций нет - ничего не добавляем
    if (Object.keys(reactionStats).length === 0) {
        return;
    }
    
    // Создаем новый HTML для реакций
    let reactionsHtml = '<div class="message-reactions">';
    
    Object.entries(reactionStats).forEach(([emoji, data]) => {
        const isMyReaction = data.users.includes(currentUser.uid);
        const badgeClass = isMyReaction ? 'reaction-badge active my-reaction' : 'reaction-badge';
        
        reactionsHtml += `
            <div class="${badgeClass}" data-emoji="${emoji}" data-message-id="${message.id}">
                <span class="reaction-emoji">${emoji}</span>
                <span class="reaction-count">${data.count}</span>
            </div>
        `;
    });
    
    reactionsHtml += '</div>';
    
    // Добавляем новый контейнер реакций
    const newReactionsContainer = document.createElement('div');
    newReactionsContainer.className = 'message-reactions';
    newReactionsContainer.innerHTML = reactionsHtml;
    messageContent.appendChild(newReactionsContainer);
    
    // Назначаем обработчики кликов на новые бейджи реакций
    const newReactionBadges = newReactionsContainer.querySelectorAll('.reaction-badge');
    newReactionBadges.forEach(badge => {
        badge.addEventListener('click', (e) => {
            e.stopPropagation();
            const emoji = badge.dataset.emoji;
            const messageId = badge.dataset.messageId;
            if (currentChatId && messageId && emoji && currentUser) {
                toggleReaction(messageId, emoji);
            }
        });
    });
}

function createMessageElement(message) {
    const messageElement = document.createElement('div');
    const isOutgoing = message.senderId === currentUser.uid;
    
    messageElement.className = `message ${isOutgoing ? 'outgoing' : 'incoming'} ${isMobile ? 'mobile' : 'desktop'}`;
    messageElement.dataset.messageId = message.id;

    const time = new Date(message.timestamp);
    const timeString = time.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

    let senderName = message.senderName || "Пользователь";
    if (allUsers[message.senderId]) {
        senderName = allUsers[message.senderId].displayName;
    }

    let replyHtml = '';
    if (message.replyTo) {
        const repliedMessage = message.replyTo;
        let repliedSenderName = repliedMessage.senderName || "Пользователь";

        if (repliedMessage.senderId && repliedMessage.senderId !== 'unknown' && allUsers[repliedMessage.senderId]) {
            repliedSenderName = allUsers[repliedMessage.senderId].displayName;
        }
    
        replyHtml = `
            <div class="message-reply" data-reply-to="${repliedMessage.id}">
                <div class="reply-sender">
                    <i class="fas fa-reply"></i> ${repliedSenderName}
                </div>
                <div class="reply-text">${repliedMessage.text || 'Сообщение удалено'}</div>
            </div>
        `;
    }

    // Добавляем фото если есть
    let photoHtml = '';
    if (message.type === 'photo' && message.photo) {
        photoHtml = `
            <img src="${message.photo}" class="message-photo" alt="Photo" loading="lazy" onclick="showFullPhoto('${message.photo}')">
        `;
    }

    // Реакции
    let reactionsHtml = '';
    if (message.reactions && Object.keys(message.reactions).length > 0) {
        reactionsHtml = '<div class="message-reactions">';
        
        const reactionStats = {};
        Object.values(message.reactions).forEach(reaction => {
            if (!reactionStats[reaction.emoji]) {
                reactionStats[reaction.emoji] = {
                    count: 0,
                    users: []
                };
            }
            reactionStats[reaction.emoji].count++;
            reactionStats[reaction.emoji].users.push(reaction.userId);
        });
        
        Object.entries(reactionStats).forEach(([emoji, data]) => {
            const isMyReaction = data.users.includes(currentUser.uid);
            const badgeClass = isMyReaction ? 'reaction-badge active my-reaction' : 'reaction-badge';
            
            reactionsHtml += `
                <div class="${badgeClass}" data-emoji="${emoji}" data-message-id="${message.id}">
                    <span class="reaction-emoji">${emoji}</span>
                    <span class="reaction-count">${data.count}</span>
                </div>
            `;
        });
        
        reactionsHtml += '</div>';
    }

    messageElement.innerHTML = `
        <div class="message-avatar">
            ${senderName.charAt(0)}
        </div>
        <div class="message-content">
            <div class="message-sender">
                <span class="message-sender-name" onclick="openUserProfileModal('${message.senderId}')" style="cursor: pointer;">
                    ${senderName}
                    ${getVerifiedBadge(message.senderId)}
                </span>
                <span class="message-time">${timeString}</span>
            </div>
            ${replyHtml}
            ${photoHtml}
            ${message.type !== 'photo' ? `<div class="message-text">${message.text}</div>` : ''}
            ${reactionsHtml}
        </div>
    `;
    
    // Обработчики событий
    messageElement.addEventListener('dblclick', (e) => {
        if (e.target.closest('.message-reactions') || e.target.closest('.reaction-badge') || e.target.closest('.message-photo')) {
            return;
        }
        
        if (currentChatId && message.id && currentUser) {
            toggleReaction(message.id, '❤️');
            
            messageElement.style.transform = 'scale(1.05)';
            setTimeout(() => {
                messageElement.style.transform = 'scale(1)';
            }, 200);
        }
    });
    
    const reactionBadges = messageElement.querySelectorAll('.reaction-badge');
    reactionBadges.forEach(badge => {
        badge.addEventListener('click', (e) => {
            e.stopPropagation();
            const emoji = badge.dataset.emoji;
            const messageId = badge.dataset.messageId;
            if (currentChatId && messageId && emoji && currentUser) {
                toggleReaction(messageId, emoji);
            }
        });
    });
    
    messageElement.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        showMessageContextMenu(e, message, isOutgoing);
    });

    if (message.replyTo) {
        const replyElement = messageElement.querySelector('.message-reply');
        replyElement.addEventListener('click', () => {
            const repliedMessageId = replyElement.dataset.replyTo;
            scrollToMessage(repliedMessageId);
        });
    }

    return messageElement;
}

// Функция для показа фото в полном размере
function showFullPhoto(photoSrc) {
    if (!photoViewModal || !fullSizePhoto) return;
    
    fullSizePhoto.src = photoSrc;
    photoViewModal.classList.add('active');
}

// Закрытие модального окна с фото
if (closePhotoModal) {
    closePhotoModal.addEventListener('click', () => {
        photoViewModal.classList.remove('active');
        fullSizePhoto.src = '';
    });
}

// Закрытие по клику на фон
if (photoViewModal) {
    photoViewModal.addEventListener('click', (e) => {
        if (e.target === photoViewModal) {
            photoViewModal.classList.remove('active');
            fullSizePhoto.src = '';
        }
    });
}

// Закрытие по Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && photoViewModal && photoViewModal.classList.contains('active')) {
        photoViewModal.classList.remove('active');
        fullSizePhoto.src = '';
    }
});

// Вспомогательная функция для создания безопасного объекта replyTo
function createSafeReplyTo(messageId, chatId) {
    return new Promise(async (resolve) => {
        if (!messageId || !chatId) {
            resolve(null);
            return;
        }
        
        try {
            const messageRef = database.ref(`messages/${chatId}/${messageId}`);
            const snapshot = await messageRef.once('value');
            
            if (snapshot.exists()) {
                const messageData = snapshot.val();
                resolve({
                    id: messageId,
                    text: messageData.text || '',
                    senderId: messageData.senderId || 'unknown',
                    senderName: messageData.senderName || "Пользователь"
                });
            } else {
                resolve(null);
            }
        } catch (error) {
            resolve(null);
        }
    });
}

// ФУНКЦИИ ДЛЯ РЕАКЦИЙ
async function addReaction(messageId, emoji) {
    if (!currentChatId || !messageId || !emoji) return;
    
    try {
        const reactionId = `${currentUser.uid}_${emoji}`;
        const reactionData = {
            emoji: emoji,
            userId: currentUser.uid,
            timestamp: Date.now(),
            userName: currentUser.displayName
        };
        
        await database.ref(`messages/${currentChatId}/${messageId}/reactions/${reactionId}`).set(reactionData);
        
        // Анимация добавления реакции
        const reactionBadge = document.querySelector(`.reaction-badge[data-message-id="${messageId}"][data-emoji="${emoji}"]`);
        if (reactionBadge) {
            reactionBadge.classList.add('reaction-added');
            setTimeout(() => {
                reactionBadge.classList.remove('reaction-added');
            }, 300);
        }
        
    } catch (error) {
        showNotification("Не удалось добавить реакцию");
    }
}

async function removeReaction(messageId, emoji) {
    if (!currentChatId || !messageId || !emoji) return;
    
    try {
        const reactionId = `${currentUser.uid}_${emoji}`;
        await database.ref(`messages/${currentChatId}/${messageId}/reactions/${reactionId}`).remove();
        
    } catch (error) {
    }
}

async function toggleReaction(messageId, emoji) {
    if (!currentChatId || !messageId || !emoji || !currentUser) {
        return;
    }
    
    try {
        const reactionId = `${currentUser.uid}_${emoji}`;
        const reactionRef = database.ref(`messages/${currentChatId}/${messageId}/reactions/${reactionId}`);
        const snapshot = await reactionRef.once('value');
        
        if (snapshot.exists()) {
            await reactionRef.remove();
        } else {
            const reactionData = {
                emoji: emoji,
                userId: currentUser.uid,
                timestamp: Date.now(),
                userName: currentUser.displayName
            };
            
            await reactionRef.set(reactionData);
            
            // Анимация добавления реакции
            const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
            if (messageElement) {
                const reactionBadge = messageElement.querySelector(`.reaction-badge[data-emoji="${emoji}"]`);
                if (reactionBadge) {
                    reactionBadge.classList.add('reaction-added');
                    setTimeout(() => {
                        reactionBadge.classList.remove('reaction-added');
                    }, 300);
                }
                
                // Визуальная обратная связь для всего сообщения
                messageElement.style.transform = 'scale(1.02)';
                setTimeout(() => {
                    messageElement.style.transform = 'scale(1)';
                }, 200);
            }
        }
        
    } catch (error) {
    }
}

// Обновленная функция показа контекстного меню
function showMessageContextMenu(event, message, isOutgoing) {
    event.preventDefault();
    event.stopPropagation();

    if (!messageContextMenu) return;
    
    if (contextDelete) contextDelete.style.display = isOutgoing ? 'flex' : 'none';

    messageContextMenu.dataset.messageId = message.id;
    messageContextMenu.dataset.isOutgoing = isOutgoing;

    const x = event.clientX;
    const y = event.clientY;
    const menuWidth = 220;
    const menuHeight = 200;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    let left = x;
    let top = y;

    if (x + menuWidth > windowWidth) {
        left = x - menuWidth;
    }
    if (y + menuHeight > windowHeight) {
        top = y - menuHeight;
    }

    messageContextMenu.style.left = left + 'px';
    messageContextMenu.style.top = top + 'px';
    messageContextMenu.classList.add('active');

    // Удаляем старые обработчики
    const reactionOptions = messageContextMenu.querySelectorAll('.reaction-option');
    reactionOptions.forEach(option => {
        option.onclick = null;
    });

    // Добавляем новые обработчики для реакций
    reactionOptions.forEach(option => {
        option.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const messageId = messageContextMenu.dataset.messageId;
            const emoji = this.dataset.reaction;
            
            if (messageId && emoji && currentChatId) {
                toggleReaction(messageId, emoji);
                messageContextMenu.classList.remove('active');
            }
        }, { once: true }); // Используем once для предотвращения дублирования
    });

    const closeMenu = (e) => {
        if (!messageContextMenu.contains(e.target) && !e.target.closest('.message-content')) {
            messageContextMenu.classList.remove('active');
            document.removeEventListener('click', closeMenu);
        }
    };

    setTimeout(() => {
        document.addEventListener('click', closeMenu);
    }, 10);
}

function setupDragAndDrop() {
    if (!messagesContainer) return;
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        messagesContainer.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        messagesContainer.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        messagesContainer.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
        messagesContainer.classList.add('drag-over');
        messagesContainer.style.border = '2px dashed #8b5cf6';
        messagesContainer.style.background = 'rgba(139, 92, 246, 0.1)';
    }
    
    function unhighlight() {
        messagesContainer.classList.remove('drag-over');
        messagesContainer.style.border = 'none';
        messagesContainer.style.background = '';
    }
    
    messagesContainer.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                showPhotoPreview(file);
            } else {
                showNotification('❌ Пожалуйста, перетащите изображение');
            }
        }
    }
}

async function sendMessage() {
    // Если есть выбранное фото, отправляем его
    if (selectedPhoto) {
        await sendPhoto();
        return;
    }
    
    const text = messageInput.value.trim();
    if (!text || !currentChatId) return;

    try {
        // Обработка команд
        if (text.startsWith('/')) {
            await handleCommand(text);
            if (messageInput) messageInput.value = ''; // Только очищаем
            hideReplyPreview();
            replyToMessage = null;
            return;
        }
    
        // Сохраняем позицию прокрутки для проверки
        const wasNearBottom = messagesContainer.scrollHeight - messagesContainer.scrollTop - messagesContainer.clientHeight < 50;
    
        // Создаем новое сообщение
        const newMessage = {
            text: text,
            senderId: currentUser.uid,
            senderName: currentUser.displayName || "Пользователь",
            timestamp: Date.now(),
            type: "text"
        };
    
        // Добавляем reply если есть
        if (replyToMessage && replyToMessage.id) {
            try {
                const replyRef = database.ref(`messages/${currentChatId}/${replyToMessage.id}`);
                const snapshot = await replyRef.once('value');
                
                if (snapshot.exists()) {
                    const replyData = snapshot.val();
                    
                    newMessage.replyTo = {
                        id: replyToMessage.id,
                        text: replyData.text || replyToMessage.text,
                        senderId: replyData.senderId || replyToMessage.senderId,
                        senderName: replyData.senderName || replyToMessage.senderName
                    };
                } else {
                    newMessage.replyTo = {
                        id: replyToMessage.id,
                        text: replyToMessage.text,
                        senderId: replyToMessage.senderId || "unknown",
                        senderName: replyToMessage.senderName || "Пользователь"
                    };
                }
            } catch (error) {
                console.error("Ошибка получения данных ответа:", error);
                newMessage.replyTo = {
                    id: replyToMessage.id,
                    text: replyToMessage.text,
                    senderId: replyToMessage.senderId || "unknown",
                    senderName: replyToMessage.senderName || "Пользователь"
                };
            }
        }
    
        // Очищаем поле ввода (только значение, высоту НЕ меняем)
        if (messageInput) {
            messageInput.value = '';
        }
        
        // Скрываем превью ответа
        hideReplyPreview();
        replyToMessage = null;
        
        // Убираем фокус на мобильных
        if (isMobile && messageInput) {
            messageInput.blur();
        }
    
        // Отправляем сообщение в Firebase
        const messagesRef = database.ref(`messages/${currentChatId}`);
        await messagesRef.push(newMessage);
    
        // Обновляем информацию о последнем сообщении в чате
        const chatRef = database.ref(`chats/${currentChatId}`);
        await chatRef.update({
            lastMessage: {
                text: text.length > 50 ? text.substring(0, 50) + '...' : text,
                timestamp: Date.now(),
                senderId: currentUser.uid,
                type: "text"
            },
            updatedAt: Date.now()
        });
    
        // Если пользователь был внизу, прокручиваем вниз (но это сделает слушатель)
        // Не добавляем прокрутку здесь, чтобы избежать двойной прокрутки
        
    } catch (error) {
        console.error("Ошибка при отправке сообщения:", error);
        showNotification("Не удалось отправить сообщение. Попробуйте еще раз.");
    }
}

function focusMessageInput() {
    if (messageInput) {
        setTimeout(() => {
            messageInput.focus();
        }, 300); // Небольшая задержка для загрузки чата
    }
}

async function handleCommand(command) {
    const parts = command.split(' ');
    const cmd = parts[0].toLowerCase();

    switch (cmd) {
        case '/invite':
            const userId = parts[1];
            if (userId) {
                await inviteToChat(currentChatId, userId);
            } else {
                showNotification("Использование: /invite USER_ID");
            }
            break;
        
        case '/rename':
            const newName = parts.slice(1).join(' ');
            if (newName) {
                await updateChatName(currentChatId, newName);
            } else {
                showNotification("Использование: /rename НОВОЕ_НАЗВАНИЕ");
            }
            break;
        
        case '/leave':
            showLeaveChatConfirmation(currentChatId);
            break;
        
        case '/help':
            showNotification("Доступные команды:\n/invite USER_ID - пригласить пользователя\n/rename НАЗВАНИЕ - изменить название чата\n/leave - покинуть чат\n/help - показать помощь");
            break;
        
        default:
            showNotification(`Неизвестная команда: ${cmd}. Используйте /help для списка команд.`);
    }
    
    if (messageInput) messageInput.value = '';
    if (messageInput) messageInput.style.height = '56px';
    hideReplyPreview();
    replyToMessage = null;
}

// КОНТЕКСТНОЕ МЕНЮ ДЛЯ СООБЩЕНИЙ
function showMessageContextMenu(event, message, isOutgoing) {
    event.preventDefault();
    event.stopPropagation();

    if (!messageContextMenu) return;
    
    if (contextDelete) contextDelete.style.display = isOutgoing ? 'flex' : 'none';

    messageContextMenu.dataset.messageId = message.id;
    messageContextMenu.dataset.isOutgoing = isOutgoing;

    const x = event.clientX;
    const y = event.clientY;
    const menuWidth = 180;
    const menuHeight = 150;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    let left = x;
    let top = y;

    if (x + menuWidth > windowWidth) {
        left = x - menuWidth;
    }
    if (y + menuHeight > windowHeight) {
        top = y - menuHeight;
    }

    messageContextMenu.style.left = left + 'px';
    messageContextMenu.style.top = top + 'px';
    messageContextMenu.classList.add('active');

    const closeMenu = (e) => {
        if (!messageContextMenu.contains(e.target) && !e.target.closest('.message-content')) {
            messageContextMenu.classList.remove('active');
            document.removeEventListener('click', closeMenu);
        }
    };

    setTimeout(() => {
        document.addEventListener('click', closeMenu);
    }, 10);
}

if (contextReply) {
    contextReply.addEventListener('click', () => {
        const messageId = messageContextMenu.dataset.messageId;
        if (!messageId) return;

        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        if (!messageElement) return;

        const messageText = messageElement.querySelector('.message-text')?.textContent || '';
        const senderNameElement = messageElement.querySelector('.message-sender-name');
        const senderName = senderNameElement?.textContent || '';
        
        // Получаем информацию о сообщении из базы данных
        if (!currentChatId || !messageId) return;
        
        const messageRef = database.ref(`messages/${currentChatId}/${messageId}`);
        messageRef.once('value').then((snapshot) => {
            if (snapshot.exists()) {
                const messageData = snapshot.val();
                
                // Сохраняем полные данные сообщения для ответа
                replyToMessage = {
                    id: messageId,
                    text: messageData.text || messageText,
                    senderId: messageData.senderId || null,
                    senderName: messageData.senderName || senderName
                };

                showReplyPreview(replyToMessage.senderName || senderName, replyToMessage.text);

                if (messageContextMenu) messageContextMenu.classList.remove('active');
                if (messageInput) messageInput.focus();
                showNotification("Вы отвечаете на сообщение");
            }
        }).catch(error => {
            console.error("Ошибка получения данных сообщения:", error);
            
            // Используем данные из DOM как запасной вариант
            replyToMessage = {
                id: messageId,
                text: messageText,
                senderId: null,
                senderName: senderName
            };

            showReplyPreview(senderName, messageText);

            if (messageContextMenu) messageContextMenu.classList.remove('active');
            if (messageInput) messageInput.focus();
            showNotification("Вы отвечаете на сообщение");
        });
    });
}

if (contextCopy) {
    contextCopy.addEventListener('click', () => {
        const messageId = messageContextMenu.dataset.messageId;
        if (!messageId) return;

        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        if (!messageElement) return;

        const messageText = messageElement.querySelector('.message-text')?.textContent || '';
        
        navigator.clipboard.writeText(messageText)
            .then(() => {
                showNotification("Текст скопирован в буфер обмена");
            })
            .catch(err => {
                showNotification('Не удалось скопировать текст');
            });
        
        if (messageContextMenu) messageContextMenu.classList.remove('active');
    });
}

if (contextDelete) {
    contextDelete.addEventListener('click', async () => {
        const messageId = messageContextMenu.dataset.messageId;
        const isOutgoing = messageContextMenu.dataset.isOutgoing === 'true';

        if (!messageId || !currentChatId || !isOutgoing) {
            if (messageContextMenu) messageContextMenu.classList.remove('active');
            return;
        }

        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        if (!messageElement) {
            if (messageContextMenu) messageContextMenu.classList.remove('active');
            return;
        }
        
        const messageText = messageElement.querySelector('.message-text')?.textContent || '';
        const senderName = messageElement.querySelector('.message-sender-name')?.textContent.split(' ')[0] || '';
        const timeElement = messageElement.querySelector('.message-time');
        const timestamp = timeElement ? new Date().getTime() : Date.now();
        
        showDeleteMessageConfirmation(messageId, currentChatId, messageText, senderName, timestamp);
    });
}

// МОДАЛЬНЫЕ ОКНА ПОДТВЕРЖДЕНИЯ
function showLeaveChatConfirmation(chatId) {
    if (!confirmLeaveChatModal) return;
    
    confirmLeaveChatModal.classList.add('active');
    
    if (confirmLeaveBtn) {
        confirmLeaveBtn.onclick = async () => {
            try {
                await leaveChat(chatId);
                confirmLeaveChatModal.classList.remove('active');
            } catch (error) {
                showNotification("Не удалось покинуть чат");
                confirmLeaveChatModal.classList.remove('active');
            }
        };
    }
}

function showDeleteMessageConfirmation(messageId, chatId, messageText, senderName, timestamp) {
    if (!confirmDeleteMessageModal || !messagePreview) return;
    
    const time = new Date(timestamp);
    const timeString = time.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    
    messagePreview.innerHTML = `
        <div class="message-preview-header">
            <div class="message-preview-avatar">
                ${senderName ? senderName.charAt(0) : '?'}
            </div>
            <div class="message-preview-sender">${senderName || "Вы"}</div>
            <div class="message-preview-time">${timeString}</div>
        </div>
        <div class="message-preview-text">${messageText}</div>
    `;
    
    confirmDeleteMessageModal.classList.add('active');
    if (messageContextMenu) messageContextMenu.classList.remove('active');
    
    if (confirmDeleteBtn) {
        confirmDeleteBtn.onclick = async () => {
            try {
                await database.ref(`messages/${chatId}/${messageId}`).remove();
                showNotification("Сообщение удалено");
                
                const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
                if (messageElement) {
                    messageElement.remove();
                }
                
                confirmDeleteMessageModal.classList.remove('active');
                
            } catch (error) {
                showNotification("Не удалось удалить сообщение");
                confirmDeleteMessageModal.classList.remove('active');
            }
        };
    }
}

// ФУНКЦИИ ДЛЯ ОТВЕТА НА СООБЩЕНИЯ
function showReplyPreview(senderName, messageText) {
    if (!replyPreviewContainer) return;
    
    const previewText = messageText.length > 100 
        ? messageText.substring(0, 100) + '...' 
        : messageText;
    
    replyPreviewContainer.style.display = 'block';
    replyPreviewContainer.innerHTML = `
        <div class="reply-preview">
            <div class="reply-preview-content">
                <div class="reply-preview-sender">
                    <i class="fas fa-reply"></i> Ответ ${senderName || "пользователю"}
                </div>
                <div class="reply-preview-text">${escapeHtml(previewText)}</div>
            </div>
            <button class="reply-preview-close" id="cancelReplyBtn">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    document.getElementById('cancelReplyBtn')?.addEventListener('click', hideReplyPreview);
    
    // Прокручиваем к полю ввода
    setTimeout(() => {
        messageInput?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
}

// Функция для экранирования HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function hideReplyPreview() {
    if (!replyPreviewContainer) return;
    
    replyPreviewContainer.style.display = 'none';
    replyPreviewContainer.innerHTML = '';
    replyToMessage = null;
}

function scrollToMessage(messageId) {
    const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
    if (messageElement) {
        messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        messageElement.style.background = 'rgba(139, 92, 246, 0.3)';
        messageElement.style.transition = 'background 2s';
    
        setTimeout(() => {
            messageElement.style.background = '';
        }, 2000);
    }
}

// ФУНКЦИЯ УДАЛЕНИЯ ЧАТА
async function leaveChat(chatId) {
    try {
        const chat = await getChatInfo(chatId);
        if (!chat) return false;
    
        await database.ref(`chats/${chatId}/members/${currentUser.uid}`).remove();
    
        if (chat.createdBy === currentUser.uid) {
            await database.ref(`chats/${chatId}`).update({
                active: false,
                archivedByCreator: true
            });
        }
    
        const systemMessage = {
            text: `${currentUser.displayName} покинул(а) чат`,
            senderId: 'system',
            senderName: 'Система',
            timestamp: Date.now(),
            type: 'system'
        };
    
        await database.ref(`messages/${chatId}`).push(systemMessage);
    
        showNotification("Вы покинули чат");
    
        await loadUserChats();
    
        if (currentChatId === chatId) {
            showHomeScreen();
        }
        
        return true;
    
    } catch (error) {
        showNotification("Не удалось покинуть чат: " + error.message);
        return false;
    }
}

// СОЗДАНИЕ ЧАТА
async function createNewChat() {
    const name = chatNameInput ? chatNameInput.value.trim() : '';
    const description = chatDescriptionInput ? chatDescriptionInput.value.trim() : '';

    try {
        if (selectedChatType !== 'private' && !name) {
            showNotification("Пожалуйста, введите название чата");
            return;
        }
    
        let newChat;
        let targetUser = null;
    
        if (selectedChatType === 'private') {
            const targetUserId = privateUserId ? privateUserId.value.trim() : '';
        
            if (!targetUserId) {
                showNotification("Пожалуйста, введите ID пользователя для личного чата");
                return;
            }
        
            // Ищем пользователя
            for (const userId in allUsers) {
                if (allUsers[userId].customId === targetUserId) {
                    targetUser = { uid: userId, ...allUsers[userId] };
                    break;
                }
            }
        
            if (!targetUser) {
                showNotification("Пользователь с таким ID не найден");
                return;
            }
        
            if (targetUser.uid === currentUser.uid) {
                showNotification("Вы не можете создать личный чат с самим собой");
                return;
            }
        
            // Проверяем существующий чат
            const existingChatId = await findExistingPrivateChat(targetUser.uid);
        
            if (existingChatId) {
                if (createChatModal) createChatModal.classList.remove('active');
                resetCreateForm();
                openChat(existingChatId);
                return;
            }
        
            newChat = {
                name: `${currentUser.displayName} и ${targetUser.displayName}`,
                type: 'private',
                createdBy: currentUser.uid,
                createdAt: Date.now(),
                members: {
                    [currentUser.uid]: true,
                    [targetUser.uid]: true
                },
                lastMessage: {
                    text: "Чат создан",
                    timestamp: Date.now(),
                    senderId: currentUser.uid
                }
            };
        } else {
            newChat = {
                name: name,
                description: description || '',
                type: selectedChatType,
                createdBy: currentUser.uid,
                createdAt: Date.now(),
                members: {
                    [currentUser.uid]: true
                },
                lastMessage: {
                    text: "Чат создан",
                    timestamp: Date.now(),
                    senderId: currentUser.uid
                }
            };
        }
    
        const chatsRef = database.ref('chats');
        const newChatRef = chatsRef.push();
    
        await newChatRef.set(newChat);
        const chatId = newChatRef.key;
        newChat.id = chatId;
    
        // Добавляем чат в локальный список
        chats.push(newChat);
        
        // Динамически обновляем интерфейс
        updateChatsDisplay();
        
        // Создаем системное сообщение
        const systemMessage = {
            text: selectedChatType === 'private' 
                ? `Личный чат создан`
                : `Чат "${name}" создан`,
            senderId: 'system',
            senderName: 'Система',
            timestamp: Date.now(),
            type: 'system'
        };
        
        await database.ref(`messages/${chatId}`).push(systemMessage);
    
        showNotification("Чат успешно создан!");
    
        if (createChatModal) createChatModal.classList.remove('active');
        resetCreateForm();
    
        if (selectedChatType === 'private') {
            // Сразу открываем созданный чат
            openChat(chatId);
            focusMessageInput();
        } else {
            // Для группового чата показываем уведомление
            showNotification(`Чат "${name}" создан!`);
        }
    
    } catch (error) {
        showNotification("Не удалось создать чат. Попробуйте еще раз.");
    }
}

async function findExistingPrivateChat(targetUserId) {
    try {
        const chatsRef = database.ref('chats');
        const snapshot = await chatsRef.orderByChild('type').equalTo('private').once('value');
    
        const chatsData = snapshot.val();
        if (chatsData) {
            for (const chatId in chatsData) {
                const chat = chatsData[chatId];
                if (chat.members && chat.members[currentUser.uid] && chat.members[targetUserId]) {
                    return chatId;
                }
            }
        }
        return null;
    } catch (error) {
        return null;
    }
}

async function openOrCreatePrivateChat(targetUserId) {
    try {
        const existingChatId = await findExistingPrivateChat(targetUserId);
    
        if (existingChatId) {
            openChat(existingChatId);
        } else {
            const targetUser = allUsers[targetUserId];
            if (!targetUser) {
                showNotification("Пользователь не найден");
                return;
            }
        
            const newChat = {
                name: `${currentUser.displayName} и ${targetUser.displayName}`,
                type: 'private',
                createdBy: currentUser.uid,
                createdAt: Date.now(),
                members: {
                    [currentUser.uid]: true,
                    [targetUserId]: true
                }
            };
        
            const chatsRef = database.ref('chats');
            const newChatRef = await chatsRef.push(newChat);
            const chatId = newChatRef.key;
        
            showNotification("Личный чат создан!");
            openChat(chatId);
        }
    } catch (error) {
        showNotification("Не удалось создать личный чат. Попробуйте еще раз.");
    }
}

// СЛУШАТЕЛЬ ЧАТА
function setupChatListener(chatId) {
    if (messageListeners[chatId]) {
        messageListeners[chatId]();
    }

    const messagesRef = database.ref(`messages/${chatId}`).orderByChild('timestamp').limitToLast(1);

    messageListeners[chatId] = messagesRef.on('value', (snapshot) => {
        const messagesData = snapshot.val();
        
        // Обновляем чат в мобильном интерфейсе
        const mobileChatElement = document.querySelector(`.chat-item[data-chat-id="${chatId}"]`);
        if (mobileChatElement && messagesData) {
            const messageKeys = Object.keys(messagesData);
            const lastMessage = messagesData[messageKeys[0]];
            const time = new Date(lastMessage.timestamp);
        
            const timeString = time.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        
            let messageText = lastMessage.text;
            if (messageText.length > 30) {
                messageText = messageText.substring(0, 30) + '...';
            }
        
            mobileChatElement.querySelector('.last-message').textContent = messageText;
            mobileChatElement.querySelector('.chat-time').textContent = timeString;
        }
        
        // Обновляем чат в ПК интерфейсе
        const desktopChatElement = document.querySelector(`.desktop-chat-item[data-chat-id="${chatId}"]`);
        if (desktopChatElement && messagesData) {
            const messageKeys = Object.keys(messagesData);
            const lastMessage = messagesData[messageKeys[0]];
            const time = new Date(lastMessage.timestamp);
        
            const timeString = time.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        
            let messageText = lastMessage.text;
            if (messageText.length > 20) {
                messageText = messageText.substring(0, 20) + '...';
            }
        
            desktopChatElement.querySelector('.desktop-chat-last-message').textContent = `${timeString} • ${messageText}`;
        }
    });
}

// Обновляем чаты в мобильной боковой панели
function updateMobileChats() {
    if (!mobileChatsContainer) return;
    
    mobileChatsContainer.innerHTML = '';
    
    if (chats.length === 0) {
        mobileChatsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-comments"></i>
                <h3>Чатов пока нет</h3>
                <p>Создайте первый чат, чтобы начать общение</p>
            </div>
        `;
        return;
    }
    
    chats.forEach(chat => {
        const chatElement = createMobileChatElement(chat);
        mobileChatsContainer.appendChild(chatElement);
    });
}

// Создаем элемент чата для мобильной боковой панели
function createMobileChatElement(chat) {
    const chatElement = document.createElement('div');
    chatElement.className = 'mobile-chat-item';
    chatElement.dataset.chatId = chat.id;

    let chatName;
    let avatarContent;

    if (chat.type === 'group') {
        chatName = chat.name;
        avatarContent = '<i class="fas fa-users"></i>';
    } else if (chat.type === 'private') {
        const otherUserId = Object.keys(chat.members).find(id => id !== currentUser.uid);
        const otherUser = allUsers[otherUserId];
    
        if (otherUser) {
            chatName = otherUser.displayName;
            avatarContent = otherUser.displayName.charAt(0);
        } else {
            chatName = "Неизвестный пользователь";
            avatarContent = '?';
        }
    }

    chatElement.innerHTML = `
        <div class="chat-avatar ${chat.type === 'group' ? 'group-avatar' : 'private-avatar'}">
            ${avatarContent}
        </div>
        <div class="chat-info">
            <div class="chat-name">${chatName}</div>
            <div class="last-message">
                ${chat.lastMessage && chat.lastMessage.text ? 
                    (chat.lastMessage.text.length > 30 ? 
                        chat.lastMessage.text.substring(0, 30) + '...' : 
                        chat.lastMessage.text) : 
                    'Начните общение...'}
            </div>
        </div>
    `;
    
    chatElement.addEventListener('click', () => {
        openChat(chat.id);
        closeMobileSidebar();
    });

    return chatElement;
}

// Функция динамического обновления отображения чатов
function updateChatsDisplay() {
    // Обновляем все места, где показываются чаты
    
    // 1. Главный экран (мобильная версия)
    if (homeChatsList) {
        updateHomeChats();
    }
    
    // 2. Боковая панель (мобильная)
    if (mobileChatsContainer) {
        updateMobileChats();
    }
    
    // 3. ПК боковая панель
    if (desktopChatsList) {
        updateDesktopChats();
    }
    
    // 4. Профиль
    updateProfileChatsCount();
}

// Обновленная функция добавления контакта
async function addContact(targetCustomId) {
    try {
        
        // Ищем пользователя по customId
        let targetUser = null;
        let actualUserId = null;
        
        for (const userId in allUsers) {
            if (allUsers[userId].customId === targetCustomId) {
                targetUser = allUsers[userId];
                actualUserId = userId;
                break;
            }
        }
        
        if (!targetUser) {
            showNotification("Пользователь не найден");
            return;
        }

        if (actualUserId === currentUser.uid) {
            showNotification("Вы не можете добавить себя в контакты");
            return;
        }

        // Проверяем, есть ли уже такой контакт в локальном списке
        const alreadyInContacts = contacts.some(contact => contact.userId === actualUserId);
        if (alreadyInContacts) {
            showNotification("Этот пользователь уже у вас в контактах");
            return;
        }

        // Проверяем в базе данных, есть ли уже контакт
        const contactRef = database.ref(`users/${currentUser.uid}/contacts/${actualUserId}`);
        const contactSnapshot = await contactRef.once('value');
        
        if (contactSnapshot.exists()) {
            showNotification("Этот пользователь уже у вас в контактах");
            return;
        }

        // Добавляем контакт в базу данных
        const contactData = {
            displayName: targetUser.displayName,
            customId: targetUser.customId,
            status: targetUser.status,
            lastActive: targetUser.lastActive || Date.now(),
            addedAt: Date.now()
        };

        await contactRef.set(contactData);
        
        showNotification(`Пользователь ${targetUser.displayName} добавлен в контакты!`);

        // Не обновляем локальный список здесь - слушатель сделает это автоматически

    } catch (error) {
        console.error("Ошибка при добавлении контакта:", error);
        showNotification("Не удалось добавить контакт: " + error.message);
    }
}

function updateEmptyContactsState() {
    // Главный экран
    if (homeContactsList) {
        homeContactsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-user-friends"></i>
                <h3>Контакты отсутствуют</h3>
                <p>Начните поиск, чтобы добавить контакты</p>
            </div>
        `;
    }
    
    // Мобильная боковая панель
    if (mobileContactsContainer) {
        mobileContactsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-user-friends"></i>
                <h3>Контакты отсутствуют</h3>
                <p>Добавьте контакты, чтобы начать общение</p>
            </div>
        `;
    }
    
    // ПК боковая панель
    if (desktopContactsList) {
        desktopContactsList.innerHTML = `
            <div class="empty-state" style="text-align: center; padding: 30px 15px; color: #64748b;">
                <i class="fas fa-user-friends" style="font-size: 32px; margin-bottom: 15px; opacity: 0.5;"></i>
                <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 8px; color: #94a3b8;">Контакты отсутствуют</h3>
                <p style="font-size: 14px; margin-bottom: 15px;">Добавьте контакты, чтобы начать общение</p>
            </div>
        `;
    }
}

function createMobileContactElement(contact) {
    const contactElement = document.createElement('div');
    contactElement.className = 'mobile-contact-item';
    contactElement.dataset.userId = contact.userId;
    
    const statusColor = contact.status === 'online' ? '#10b981' : 
                       contact.status === 'away' ? '#f59e0b' : 
                       contact.status === 'dnd' ? '#ef4444' : '#94a3b8';

    contactElement.innerHTML = `
        <div class="contact-avatar">
            ${contact.displayName.charAt(0)}
        </div>
        <div class="contact-info">
            <div class="contact-name">
                ${contact.displayName}
                ${getVerifiedBadge(contact.userId)}
            </div>
            <div class="contact-status" style="color: ${statusColor}">
                ${contact.status}
            </div>
        </div>
    `;
    
    contactElement.addEventListener('click', () => {
        openOrCreatePrivateChat(contact.userId);
        closeMobileSidebar();
    });

    return contactElement;
}

// Функция динамического обновления отображения контактов
function updateContactsDisplay() {
    // Обновляем все места, где показываются контакты
    
    // 1. Главный экран (мобильная версия)
    if (homeContactsList) {
        updateHomeContacts();
    }
    
    // 2. Боковая панель (мобильная)
    if (mobileContactsContainer) {
        updateMobileContacts();
    }
    
    // 3. ПК боковая панель
    if (desktopContactsList) {
        updateDesktopContacts();
    }
    
    // 4. Профиль
    updateProfileContactsCount();
}

// ИСПРАВЛЕННЫЙ ПОИСК КОНТАКТОВ (для модального окна ручного ввода)
function handleContactSearchManual() {
    if (!contactSearch || !confirmAddContactBtn) return;
    
    const query = contactSearch.value.trim();
    
    if (!query) {
        if (confirmAddContactBtn) confirmAddContactBtn.disabled = true;
        return;
    }
    
    // Включить кнопку, если что-то введено
    if (confirmAddContactBtn) confirmAddContactBtn.disabled = false;
}

// ПОИСК ПОЛЬЗОВАТЕЛЕЙ ДЛЯ ЛИЧНЫХ ЧАТОВ
function handlePrivateUserSearch() {
    if (!privateUserId || !privateUserSearchResults) return;
    
    const query = privateUserId.value.toLowerCase().trim();
    privateUserSearchResults.innerHTML = '';

    if (!query) {
        privateUserSearchResults.style.display = 'none';
        return;
    }

    const results = [];

    for (const userId in allUsers) {
        const user = allUsers[userId];
    
        if (userId === currentUser.uid) continue;
    
        const matchesQuery = 
            user.displayName.toLowerCase().includes(query) || 
            (user.customId && user.customId.toLowerCase().includes(query));
    
        if (matchesQuery) {
            results.push({
                userId: userId,
                displayName: user.displayName,
                customId: user.customId || `user_${userId.substr(0, 8)}`,
                status: user.status || 'offline'
            });
        }
    }

    if (results.length > 0) {
        privateUserSearchResults.style.display = 'block';
    
        results.forEach(result => {
            const resultItem = document.createElement('div');
            resultItem.className = 'search-result-item';
            resultItem.dataset.userId = result.userId;
        
            resultItem.innerHTML = `
                <div class="search-result-avatar">
                    ${result.displayName.charAt(0)}
                </div>
                <div class="search-result-info">
                    <div class="search-result-name">${result.displayName}</div>
                    <div class="search-result-id">${result.customId}</div>
                </div>
            `;
            
            resultItem.addEventListener('click', () => {
                if (privateUserId) privateUserId.value = result.customId;
                if (privateUserSearchResults) privateUserSearchResults.style.display = 'none';
            });
        
            privateUserSearchResults.appendChild(resultItem);
        });
    } else {
        privateUserSearchResults.innerHTML = '<div class="no-results">Пользователи не найдены</div>';
        privateUserSearchResults.style.display = 'block';
    }
}

// ПРОФИЛЬ
function openProfileModal() {
    if (!profileModal || !currentUser) return;
    
    // Обновляем информацию в профиле
    if (profileName) {
        const badgeHtml = getVerifiedBadge(currentUser.uid);
        profileName.innerHTML = `<span class="profile-name-with-badge">${currentUser.displayName} ${badgeHtml}</span>`;
    }
    
    if (profileUserId) profileUserId.textContent = currentUser.customId;
    
    const profileAvatarLarge = document.getElementById('profileAvatarLarge');
    if (profileAvatarLarge) profileAvatarLarge.textContent = currentUser.displayName.charAt(0);
    
    // Статус
    const statusToShow = currentUser.status === "offline" ? "offline" : "online";
    const profileStatus = document.getElementById('profileStatus');
    if (profileStatus) {
        profileStatus.textContent = statusToShow;
        profileStatus.className = `profile-status ${statusToShow}`;
    }
    
    const profileJoinDate = document.getElementById('profileJoinDate');
    if (profileJoinDate) profileJoinDate.textContent = currentUser.joinDate;

    // Обновляем счетчики
    updateProfileContactsCount();
    updateProfileChatsCount();
    
    profileModal.classList.add('active');
    
    if (isMobile) {
        closeMobileSidebar();
    }
}

function openUserProfileModal(userId) {
    if (!userId || !allUsers[userId]) return;
    
    const user = allUsers[userId];
    
    // Получаем актуальный статус из базы данных
    database.ref(`users/${userId}/status`).once('value', (snapshot) => {
        const currentStatus = snapshot.val() || user.status || 'offline';
        
        // Создаем модальное окно для просмотра профиля другого пользователя
        const userProfileModal = document.createElement('div');
        userProfileModal.className = 'modal-overlay active';
        userProfileModal.id = 'userProfileModal';
        
        const badgeHtml = getVerifiedBadge(userId);
        
        // Определяем текст статуса и класс
        let statusText = 'offline';
        let statusClass = 'offline';
        
        switch(currentStatus) {
            case 'online':
                statusText = 'online';
                statusClass = 'online';
                break;
            case 'away':
                statusText = 'away';
                statusClass = 'away';
                break;
            case 'dnd':
                statusText = 'dnd';
                statusClass = 'dnd';
                break;
            default:
                statusText = 'offline';
                statusClass = 'offline';
        }
        
        userProfileModal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>Профиль пользователя</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="profile-avatar-large">
                        ${user.displayName.charAt(0)}
                    </div>
                    
                    <div class="profile-info">
                        <div class="profile-name-with-badge" style="justify-content: center;">
                            ${user.displayName} ${badgeHtml}
                        </div>
                        <div class="profile-status ${statusClass}">${statusText}</div>
                    </div>
                    
                    <div class="user-id-container" style="margin: 20px 0;">
                        <span class="user-id-label">ID:</span>
                        <div class="user-id-value">${user.customId || `user_${userId.substr(0, 8)}`}</div>
                    </div>
                    
                    <div class="profile-details">
                        <div class="profile-detail">
                            <span class="detail-label">Последняя активность:</span>
                            <span class="detail-value">${formatLastActive(user.lastActive)}</span>
                        </div>
                    </div>
                    
                    <button class="edit-profile-btn" onclick="openOrCreatePrivateChat('${userId}')">
                        <i class="fas fa-comment"></i> Написать сообщение
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(userProfileModal);
        
        // Закрытие по клику на фон
        userProfileModal.addEventListener('click', (e) => {
            if (e.target === userProfileModal) {
                userProfileModal.remove();
            }
        });
        
    }, (error) => {
        console.error("Ошибка получения статуса:", error);
        // Если ошибка, показываем с данными из allUsers
        showUserProfileWithData(user, userId, badgeHtml);
    });
}

// Вспомогательная функция для форматирования времени последней активности
function formatLastActive(timestamp) {
    if (!timestamp) return 'неизвестно';
    
    const now = Date.now();
    const diff = now - timestamp;
    
    // Меньше минуты
    if (diff < 60000) {
        return 'только что';
    }
    // Меньше часа
    if (diff < 3600000) {
        const minutes = Math.floor(diff / 60000);
        return `${minutes} ${minutes === 1 ? 'минуту' : 'минут'} назад`;
    }
    // Меньше дня
    if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000);
        return `${hours} ${hours === 1 ? 'час' : 'часов'} назад`;
    }
    
    return new Date(timestamp).toLocaleDateString('ru-RU');
}

// Запасная функция на случай ошибки
function showUserProfileWithData(user, userId, badgeHtml) {
    const userProfileModal = document.createElement('div');
    userProfileModal.className = 'modal-overlay active';
    userProfileModal.id = 'userProfileModal';
    
    let statusText = 'offline';
    let statusClass = 'offline';
    
    switch(user.status) {
        case 'online':
            statusText = 'online';
            statusClass = 'online';
            break;
        case 'away':
            statusText = 'away';
            statusClass = 'away';
            break;
        case 'dnd':
            statusText = 'dnd';
            statusClass = 'dnd';
            break;
    }
    
    userProfileModal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h3>Профиль пользователя</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="profile-avatar-large">
                    ${user.displayName.charAt(0)}
                </div>
                
                <div class="profile-info">
                    <div class="profile-name-with-badge" style="justify-content: center;">
                        ${user.displayName} ${badgeHtml}
                    </div>
                    <div class="profile-status ${statusClass}">${statusText}</div>
                </div>
                
                <div class="user-id-container" style="margin: 20px 0;">
                    <span class="user-id-label">ID:</span>
                    <div class="user-id-value">${user.customId || `user_${userId.substr(0, 8)}`}</div>
                </div>
                
                <button class="edit-profile-btn" onclick="openOrCreatePrivateChat('${userId}')">
                    <i class="fas fa-comment"></i> Написать сообщение
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(userProfileModal);
    
    userProfileModal.addEventListener('click', (e) => {
        if (e.target === userProfileModal) {
            userProfileModal.remove();
        }
    });
}

// Функция для подписки на статус конкретного пользователя
function subscribeToUserStatus(userId, callback) {
    const statusRef = database.ref(`users/${userId}/status`);
    
    const listener = statusRef.on('value', (snapshot) => {
        const status = snapshot.val();
        callback(status);
    });
    
    // Возвращаем функцию для отписки
    return () => statusRef.off('value', listener);
}

// Обновленная функция openUserProfileModal с подпиской на статус
function openUserProfileModal(userId) {
    if (!userId || !allUsers[userId]) return;
    
    const user = allUsers[userId];
    const badgeHtml = getVerifiedBadge(userId);
    
    // Создаем модальное окно
    const userProfileModal = document.createElement('div');
    userProfileModal.className = 'modal-overlay active';
    userProfileModal.id = 'userProfileModal';
    
    // Начальное состояние
    let currentStatus = user.status || 'offline';
    
    // Функция обновления статуса в модальном окне
    const updateStatusDisplay = (status) => {
        const statusElement = userProfileModal.querySelector('.profile-status');
        if (!statusElement) return;
        
        let statusText = 'offline';
        let statusClass = 'offline';
        
        switch(status) {
            case 'online':
                statusText = 'online';
                statusClass = 'online';
                break;
            case 'away':
                statusText = 'away';
                statusClass = 'away';
                break;
            case 'dnd':
                statusText = 'dnd';
                statusClass = 'dnd';
                break;
            default:
                statusText = 'offline';
                statusClass = 'offline';
        }
        
        statusElement.textContent = statusText;
        statusElement.className = `profile-status ${statusClass}`;
    };
    
    // HTML модального окна
    userProfileModal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h3>Профиль пользователя</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="profile-avatar-large">
                    ${user.displayName.charAt(0)}
                </div>
                
                <div class="profile-info">
                    <div class="profile-name-with-badge" style="justify-content: center;">
                        ${user.displayName} ${badgeHtml}
                    </div>
                    <div class="profile-status ${currentStatus}">${currentStatus}</div>
                </div>
                
                <div class="user-id-container" style="margin: 20px 0;">
                    <span class="user-id-label">ID:</span>
                    <div class="user-id-value">${user.customId || `user_${userId.substr(0, 8)}`}</div>
                </div>
                
                <div class="profile-details">
                    <div class="profile-detail">
                        <span class="detail-label">Последняя активность:</span>
                        <span class="detail-value" id="lastActive-${userId}">${formatLastActive(user.lastActive)}</span>
                    </div>
                </div>
                
                <button class="edit-profile-btn" onclick="openOrCreatePrivateChat('${userId}')">
                    <i class="fas fa-comment"></i> Написать сообщение
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(userProfileModal);
    
    // Подписываемся на изменения статуса
    const unsubscribe = subscribeToUserStatus(userId, (newStatus) => {
        if (newStatus) {
            currentStatus = newStatus;
            updateStatusDisplay(newStatus);
        }
    });
    
    // Подписываемся на последнюю активность
    const lastActiveRef = database.ref(`users/${userId}/lastActive`);
    const lastActiveListener = lastActiveRef.on('value', (snapshot) => {
        const lastActive = snapshot.val();
        const lastActiveElement = document.getElementById(`lastActive-${userId}`);
        if (lastActiveElement) {
            lastActiveElement.textContent = formatLastActive(lastActive);
        }
    });
    
    // Закрытие по клику на фон
    userProfileModal.addEventListener('click', (e) => {
        if (e.target === userProfileModal) {
            // Отписываемся от обновлений
            unsubscribe();
            lastActiveRef.off('value', lastActiveListener);
            userProfileModal.remove();
        }
    });
    
    // Отписываемся при закрытии через кнопку
    const closeBtn = userProfileModal.querySelector('.modal-close');
    closeBtn.addEventListener('click', () => {
        unsubscribe();
        lastActiveRef.off('value', lastActiveListener);
    });
}

function updateUserProfileDisplay() {
    if (!currentUser) return;

    if (profileName) profileName.textContent = currentUser.displayName;
    if (profileUserId) profileUserId.textContent = currentUser.customId;
    const profileAvatarLarge = document.getElementById('profileAvatarLarge');
    if (profileAvatarLarge) profileAvatarLarge.textContent = currentUser.displayName.charAt(0);
    
    // Всегда показываем статус как online, если нет явного offline
    const statusToShow = currentUser.status === "offline" ? "offline" : "online";
    const profileStatus = document.getElementById('profileStatus');
    if (profileStatus) {
        profileStatus.textContent = statusToShow;
        profileStatus.className = `profile-status ${statusToShow}`;
    }
    
    const profileJoinDate = document.getElementById('profileJoinDate');
    if (profileJoinDate) profileJoinDate.textContent = currentUser.joinDate;

    // Обновляем информацию в ПК интерфейсе
    updateDesktopUserInfo();

    updateProfileContactsCount();
    updateProfileChatsCount();
}

function updateUserIDs() {
    if (!currentUser) return;
    
    if (homeUserId) homeUserId.textContent = currentUser.customId;
    if (mobileUserId) mobileUserId.textContent = currentUser.customId;
    if (profileUserId) profileUserId.textContent = currentUser.customId;
}

function copyUserIdToClipboard(element) {
    if (!element) return;
    
    const userId = element.textContent;

    navigator.clipboard.writeText(userId)
        .then(() => {
            const originalIcon = element.nextElementSibling.innerHTML;
            element.nextElementSibling.innerHTML = '<i class="fas fa-check"></i>';
            element.nextElementSibling.style.color = '#10b981';
        
            setTimeout(() => {
                element.nextElementSibling.innerHTML = originalIcon;
                element.nextElementSibling.style.color = '';
            }, 2000);
        })
        .catch(err => {
            showNotification('Не удалось скопировать ID. Попробуйте еще раз.');
        });
}

function updateProfileContactsCount() {
    if (profileContactsCount) profileContactsCount.textContent = contacts.length;
}

function updateProfileChatsCount() {
    if (profileChatsCount) profileChatsCount.textContent = chats.length;
}

async function saveProfileChanges() {
    try {
        const newName = editProfileName ? editProfileName.value.trim() : '';
        const activeStatus = document.querySelector('.status-option.active');
        const newStatus = activeStatus ? activeStatus.dataset.status : 'online';
    
        if (!newName) {
            showNotification("Пожалуйста, введите имя");
            return;
        }
    
        await database.ref(`users/${currentUser.uid}`).update({
            displayName: newName,
            status: newStatus,
            lastActive: Date.now()
        });
    
        currentUser.displayName = newName;
        currentUser.status = newStatus;
    
        if (allUsers[currentUser.uid]) {
            allUsers[currentUser.uid].displayName = newName;
            allUsers[currentUser.uid].status = newStatus;
        }
    
        if (editProfileModal) editProfileModal.classList.remove('active');
        showNotification("Профиль успешно обновлен!");
        updateUserProfileDisplay();
        updateUserIDs();
    
    } catch (error) {
        showNotification("Не удалось обновить профиль. Попробуйте еще раз.");
    }
}

// УВЕДОМЛЕНИЯ
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
    notification.style.color = 'white';
    notification.style.padding = '12px 20px';
    notification.style.borderRadius = '12px';
    notification.style.boxShadow = '0 10px 25px rgba(102, 126, 234, 0.5)';
    notification.style.zIndex = '4000';
    notification.style.fontWeight = '600';
    notification.style.maxWidth = isMobile ? 'calc(100% - 40px)' : '300px';
    notification.style.wordBreak = 'break-word';
    notification.style.animation = 'slideIn 0.3s ease';

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Добавляем визуальную обратную связь при добавлении
function highlightNewItem(itemElement) {
    itemElement.classList.add('new-item');
    setTimeout(() => {
        itemElement.classList.remove('new-item');
    }, 1000);
}

// При обновлении списка чатов
function updateHomeChats() {
    if (!homeChatsList) return;
    
    const oldContent = homeChatsList.innerHTML;
    homeChatsList.innerHTML = '';
    
    if (chats.length === 0) {
        homeChatsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-comments"></i>
                <h3>Чатов пока нет</h3>
                <p>Создайте первый чат, чтобы начать общение</p>
            </div>
        `;
        return;
    }
    
    chats.forEach(chat => {
        const chatElement = createChatElement(chat);
        homeChatsList.appendChild(chatElement);
    });
}

// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
function resetCreateForm() {
    if (chatNameInput) chatNameInput.value = '';
    if (chatDescriptionInput) chatDescriptionInput.value = '';
    if (privateUserId) privateUserId.value = '';
    if (privateUserSearchResults) {
        privateUserSearchResults.innerHTML = '';
        privateUserSearchResults.style.display = 'none';
    }
    selectedChatType = 'group';
    chatTypeOptions.forEach(opt => {
        opt.classList.remove('active');
        if (opt.dataset.type === 'group') {
            opt.classList.add('active');
        }
    });
    if (chatDescriptionGroup) chatDescriptionGroup.style.display = 'block';
    if (privateChatUser) privateChatUser.style.display = 'none';
    if (chatNameInput) {
        chatNameInput.disabled = false;
        chatNameInput.placeholder = "Введите название";
    }
}

function resetAddContactForm() {
    if (contactSearch) {
        contactSearch.value = '';
        contactSearch.focus();
    }
    hideSearchResults('contactSearchResults');
    setSearchLoading('contactSearch', false);
    if (confirmAddContactBtn) {
        confirmAddContactBtn.disabled = true;
    }
}

function showWelcomeMessage() {
    if (!messagesContainer) return;
    
    messagesContainer.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-comments"></i>
            <h3>В этом чате пока нет сообщений</h3>
            <p>Напишите первое сообщение!</p>
        </div>
    `;
}

function updateHomeScreen() {
    updateHomeChats();
    updateHomeContacts();
}

function openMobileSidebar() {
    if (!mobileSidebarOverlay || !mobileSidebar) return;
    
    mobileSidebarOverlay.classList.add('active');
    mobileSidebar.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Обновляем содержимое при открытии
    updateMobileChats();
    updateMobileContacts();
    
    // Активируем первую вкладку в сайдбаре
    const firstTab = mobileSidebar.querySelector('.mobile-sidebar-tab[data-tab="chats"]');
    if (firstTab) {
        firstTab.click();
    }
}

// Функция для полной инициализации интерфейса
function initializeInterface() {
    if (!currentUser) return;
    
    // Обновляем профиль пользователя
    updateUserProfileDisplay();
    
    // Обновляем все списки
    updateHomeChats();
    updateHomeContacts();
    updateDesktopChats();
    updateDesktopContacts();
    updateMobileChats();
    updateMobileContacts();
    
    // Обновляем счетчики
    updateProfileContactsCount();
    updateProfileChatsCount();
    
    // Инициализируем вкладки
    initializeTabs();
    
    // Инициализируем интерфейс в зависимости от устройства
    if (isMobile) {
        initMobileInterface();
    } else {
        initDesktopInterface();
    }
}

function closeMobileSidebar() {
    if (!mobileSidebarOverlay || !mobileSidebar) return;
    
    mobileSidebarOverlay.classList.remove('active');
    mobileSidebar.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function setupMobileSidebar() {
    if (!mobileSidebarTabs) return;
    
    // Переключаем вкладки в мобильном сайдбаре
    mobileSidebarTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            if (tab.id === 'mobileLogoutBtn') {
                logoutUser();
                closeMobileSidebar();
                return;
            }
            
            const tabName = tab.dataset.tab;
            
            mobileSidebarTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            if (tabName === 'profile') {
                openProfileModal();
                closeMobileSidebar();
            }
        });
    });
}

function setupPhotoUpload() {
    if (!attachPhotoBtn) return;
    
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
    
    attachPhotoBtn.addEventListener('click', () => {
        fileInput.click();
    });
    
    fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        // Проверяем размер (увеличим до 2MB)
        const MAX_SIZE = 2 * 1024 * 1024; // 2MB
        if (file.size > MAX_SIZE) {
            showNotification('❌ Файл слишком большой. Максимум: 2MB');
            return;
        }
        
        // Проверяем тип
        if (!file.type.startsWith('image/')) {
            showNotification('❌ Пожалуйста, выберите изображение');
            return;
        }
        
        // Показываем превью
        showPhotoPreview(file);
    });
    
    // Обработчик удаления превью
    if (photoPreviewRemove) {
        photoPreviewRemove.addEventListener('click', () => {
            clearPhotoPreview();
            fileInput.value = '';
        });
    }
}

function showPhotoPreview(file) {
    selectedPhoto = file;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        if (photoPreview) photoPreview.src = e.target.result;
    };
    reader.readAsDataURL(file);
    
    if (photoPreviewName) {
        const name = file.name.length > 25 
            ? file.name.substring(0, 22) + '...' 
            : file.name;
        photoPreviewName.textContent = name;
    }
    
    if (photoPreviewSize) {
        const size = (file.size / 1024).toFixed(1);
        photoPreviewSize.innerHTML = `<i class="fas fa-image" style="color: #8b5cf6; font-size: 10px;"></i> ${size} KB`;
    }
    
    if (photoPreviewContainer) {
        photoPreviewContainer.style.display = 'block';
    }
}

function clearPhotoPreview() {
    selectedPhoto = null;
    if (photoPreviewContainer) {
        photoPreviewContainer.style.display = 'none';
    }
    if (photoPreview) photoPreview.src = '';
    if (photoPreviewName) photoPreviewName.textContent = '';
    if (photoPreviewSize) photoPreviewSize.textContent = '';
    hidePhotoProgress();
}

function showPhotoProgress(percent) {
    if (!photoProgress) return;
    
    photoProgress.style.display = 'block';
    if (photoProgressBar) {
        photoProgressBar.style.width = percent + '%';
    }
    if (photoProgressText) {
        photoProgressText.textContent = percent + '%';
    }
}

function hidePhotoProgress() {
    if (!photoProgress) return;
    photoProgress.style.display = 'none';
    if (photoProgressBar) {
        photoProgressBar.style.width = '0%';
    }
}

async function sendPhoto() {
    if (!selectedPhoto || !currentChatId) return;
    
    try {
        // Показываем прогресс
        showPhotoProgress(0);
        
        // Конвертируем в base64 с отслеживанием прогресса
        const base64 = await fileToBase64WithProgress(selectedPhoto, (progress) => {
            showPhotoProgress(Math.round(progress * 50)); // Первые 50% - конвертация
        });
        
        showPhotoProgress(50);
        
        // Оптимизируем размер фото (сжимаем если нужно)
        const optimizedBase64 = await optimizeImage(base64, 1024, 1024); // Макс 1024x1024
        
        showPhotoProgress(70);
        
        // Создаем сообщение с фото
        const photoMessage = {
            text: `📸 ${selectedPhoto.name}`,
            senderId: currentUser.uid,
            senderName: currentUser.displayName || "Пользователь",
            timestamp: Date.now(),
            type: "photo",
            photo: optimizedBase64,
            photoName: selectedPhoto.name,
            photoSize: selectedPhoto.size,
            photoWidth: 0, // Можно добавить реальные размеры
            photoHeight: 0,
            thumbnail: await createThumbnail(base64, 200) // Создаем миниатюру
        };
        
        showPhotoProgress(85);
        
        // Добавляем reply если есть
        if (replyToMessage && replyToMessage.id) {
            try {
                const replyRef = database.ref(`messages/${currentChatId}/${replyToMessage.id}`);
                const snapshot = await replyRef.once('value');
                
                if (snapshot.exists()) {
                    const replyData = snapshot.val();
                    photoMessage.replyTo = {
                        id: replyToMessage.id,
                        text: replyData.text || replyToMessage.text,
                        senderId: replyData.senderId || replyToMessage.senderId,
                        senderName: replyData.senderName || replyToMessage.senderName
                    };
                }
            } catch (error) {
                console.error("Ошибка получения данных ответа:", error);
            }
        }
        
        // Отправляем в Firebase
        const messagesRef = database.ref(`messages/${currentChatId}`);
        await messagesRef.push(photoMessage);
        
        showPhotoProgress(100);
        
        // Обновляем lastMessage в чате
        const chatRef = database.ref(`chats/${currentChatId}`);
        await chatRef.update({
            lastMessage: {
                text: '📸 Фото',
                timestamp: Date.now(),
                senderId: currentUser.uid,
                type: 'photo'
            },
            updatedAt: Date.now()
        });
        
        // Очищаем
        clearPhotoPreview();
        hideReplyPreview();
        replyToMessage = null;
        
        // Скрываем прогресс через секунду
        setTimeout(hidePhotoProgress, 1000);
        
    } catch (error) {
        console.error("Ошибка при отправке фото:", error);
        hidePhotoProgress();
    }
}

// Конвертация с прогрессом
function fileToBase64WithProgress(file, onProgress) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        let progress = 0;
        
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.onprogress = (e) => {
            if (e.lengthComputable && onProgress) {
                progress = e.loaded / e.total;
                onProgress(progress);
            }
        };
        
        reader.readAsDataURL(file);
    });
}

// Оптимизация изображения
function optimizeImage(base64, maxWidth, maxHeight) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = base64;
        img.onload = () => {
            let width = img.width;
            let height = img.height;
            
            if (width > maxWidth) {
                height *= maxWidth / width;
                width = maxWidth;
            }
            
            if (height > maxHeight) {
                width *= maxHeight / height;
                height = maxHeight;
            }
            
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            // Сжимаем качество до 0.8
            resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
    });
}

// Создание миниатюры
function createThumbnail(base64, size) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = base64;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, size, size);
            
            resolve(canvas.toDataURL('image/jpeg', 0.6));
        };
    });
}

// Конвертация файла в base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// ОБРАБОТЧИКИ СОБЫТИЙ
function setupEventListeners() {
    
    // АВТОРИЗАЦИЯ
    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const formName = tab.dataset.form;
        
            authTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        
            if (loginForm) loginForm.classList.remove('active');
            if (registerForm) registerForm.classList.remove('active');
        
            if (formName === 'login') {
                if (loginForm) loginForm.classList.add('active');
            } else {
                if (registerForm) registerForm.classList.add('active');
            }
        
            hideError();
        });
    });

    if (loginBtn) loginBtn.addEventListener('click', loginUser);
    if (quickLoginBtn) quickLoginBtn.addEventListener('click', quickLogin);
    if (registerBtn) registerBtn.addEventListener('click', registerUser);

    // МОБИЛЬНЫЕ КНОПКИ
    if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openMobileSidebar);
    if (mobileProfileBtn) mobileProfileBtn.addEventListener('click', openProfileModal);
    if (mobileSidebarClose) mobileSidebarClose.addEventListener('click', closeMobileSidebar);
    if (mobileSidebarOverlay) mobileSidebarOverlay.addEventListener('click', closeMobileSidebar);
    
    if (mobileCreateChatBtn) {
        mobileCreateChatBtn.addEventListener('click', () => {
            if (createChatModal) createChatModal.classList.add('active');
            closeMobileSidebar();
        });
    }
    
    if (mobileAddContactBtn) {
        mobileAddContactBtn.addEventListener('click', () => {
            if (addContactModal) addContactModal.classList.add('active');
            closeMobileSidebar();
        });
    }

    // ПК КНОПКИ
    if (desktopCreateChatBtn) {
        desktopCreateChatBtn.addEventListener('click', () => {
            if (createChatModal) createChatModal.classList.add('active');
        });
    }
    
    if (desktopAddContactBtn) {
        desktopAddContactBtn.addEventListener('click', () => {
            if (addContactModal) addContactModal.classList.add('active');
        });
    }
    
    if (desktopEmptyCreateChatBtn) {
        desktopEmptyCreateChatBtn.addEventListener('click', () => {
            if (createChatModal) createChatModal.classList.add('active');
        });
    }
    
    if (desktopEmptyAddContactBtn) {
        desktopEmptyAddContactBtn.addEventListener('click', () => {
            if (addContactModal) addContactModal.classList.add('active');
        });
    }
    
    // КНОПКА ИНФОРМАЦИИ О ПРОФИЛЕ НА ПК
    if (desktopUserInfoBtn) {
        desktopUserInfoBtn.addEventListener('click', () => {
            openProfileModal();
        });
    }

    // ГЛАВНЫЙ ЭКРАН (только для мобильных)
    if (homeCreateChatBtn) {
        homeCreateChatBtn.addEventListener('click', () => {
            if (createChatModal) createChatModal.classList.add('active');
        });
    }
    
    if (homeAddContactBtn) {
        homeAddContactBtn.addEventListener('click', () => {
            if (addContactModal) addContactModal.classList.add('active');
        });
    }

    // ЭКРАН ЧАТА
    if (backToHomeBtn) {
        backToHomeBtn.addEventListener('click', showHomeScreen);
    }
    
    if (sendMessageBtn) {
        sendMessageBtn.addEventListener('click', sendMessage);
    }
    
    if (messageInput) {
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        
        messageInput.addEventListener('input', function() {
            if (!this.value.trim()) {
                this.style.height = '56px';
            }
        });
    }

    // СОЗДАНИЕ ЧАТА
    if (cancelCreateBtn) {
        cancelCreateBtn.addEventListener('click', () => {
            if (createChatModal) createChatModal.classList.remove('active');
            resetCreateForm();
        });
    }

    if (chatTypeOptions.length > 0) {
        chatTypeOptions.forEach(option => {
            option.addEventListener('click', () => {
                chatTypeOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                selectedChatType = option.dataset.type;
            
                if (selectedChatType === 'private') {
                    if (chatDescriptionGroup) chatDescriptionGroup.style.display = 'none';
                    if (privateChatUser) privateChatUser.style.display = 'block';
                    if (chatNameInput) {
                        chatNameInput.placeholder = "Имя чата (автоматически)";
                        chatNameInput.disabled = true;
                    }
                } else {
                    if (chatDescriptionGroup) chatDescriptionGroup.style.display = 'block';
                    if (privateChatUser) privateChatUser.style.display = 'none';
                    if (chatNameInput) {
                        chatNameInput.placeholder = "Введите название";
                        chatNameInput.disabled = false;
                    }
                }
            });
        });
    }

    if (confirmCreateBtn) {
        confirmCreateBtn.addEventListener('click', createNewChat);
    }

    // КОНТАКТЫ
    if (cancelAddContactBtn) {
        cancelAddContactBtn.addEventListener('click', () => {
            if (addContactModal) addContactModal.classList.remove('active');
            resetAddContactForm();
        });
    }

    if (confirmAddContactBtn) {
        confirmAddContactBtn.addEventListener('click', async () => {
            if (!contactSearch) return;

            const searchValue = contactSearch.value.trim();
        
            if (!searchValue) {
                showNotification("Введите имя или ID пользователя");
                return;
            }

            // Ищем среди последних результатов
            let foundContact = lastSearchResults.find(r => 
                (!r.isContact && 
                 (r.displayName.toLowerCase() === searchValue.toLowerCase() || 
                  r.customId.toLowerCase() === searchValue.toLowerCase()))
            );

            if (foundContact) {
                await addContact(foundContact.customId);

                // Закрываем модальное окно
                if (addContactModal) addContactModal.classList.remove('active');
                resetAddContactForm();
            } else {
                showNotification("Выберите пользователя из списка или введите корректные данные");
            }
        });
    }

    // ПОИСК ПОЛЬЗОВАТЕЛЕЙ ДЛЯ ЛИЧНЫХ ЧАТОВ
    if (privateUserId) {
        privateUserId.addEventListener('input', handlePrivateUserSearch);
    }

    // ПРОФИЛЬ
    if (copyUserIdBtn) {
        copyUserIdBtn.addEventListener('click', () => copyUserIdToClipboard(profileUserId));
    }
    
    if (copyHomeIdBtn) {
        copyHomeIdBtn.addEventListener('click', () => copyUserIdToClipboard(homeUserId));
    }
    
    if (copyMobileIdBtn) {
        copyMobileIdBtn.addEventListener('click', () => copyUserIdToClipboard(mobileUserId));
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logoutUser);
    }

    // РЕДАКТИРОВАНИЕ ПРОФИЛЯ
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', () => {
            if (profileModal) profileModal.classList.remove('active');
            if (editProfileModal) editProfileModal.classList.add('active');
            if (editProfileName) editProfileName.value = currentUser.displayName;
        
            statusOptions.forEach(opt => {
                opt.classList.remove('active');
                if (opt.dataset.status === currentUser.status) {
                    opt.classList.add('active');
                }
            });
        });
    }

    if (cancelEditProfileBtn) {
        cancelEditProfileBtn.addEventListener('click', () => {
            if (editProfileModal) editProfileModal.classList.remove('active');
            if (profileModal) profileModal.classList.add('active');
        });
    }

    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', saveProfileChanges);
    }

    if (statusOptions.length > 0) {
        statusOptions.forEach(option => {
            option.addEventListener('click', () => {
                statusOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
            });
        });
    }

    // МОДАЛЬНЫЕ ОКНА ПОДТВЕРЖДЕНИЯ
    if (cancelLeaveBtn) {
        cancelLeaveBtn.addEventListener('click', () => {
            if (confirmLeaveChatModal) confirmLeaveChatModal.classList.remove('active');
        });
    }

    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener('click', () => {
            if (confirmDeleteMessageModal) confirmDeleteMessageModal.classList.remove('active');
        });
    }

    // ЗАКРЫТИЕ МОДАЛЬНЫХ ОКОН ПРИ КЛИКЕ НА ФОН
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                if (modal.id === 'createChatModal') resetCreateForm();
                if (modal.id === 'addContactModal') resetAddContactForm();
                if (modal.id === 'editProfileModal') {
                    if (profileModal) profileModal.classList.add('active');
                }
            }
        });
    });

    // Закрытие модальных окон кнопками закрытия
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal-overlay');
            if (modal) modal.classList.remove('active');
            
            if (modal && modal.id === 'createChatModal') resetCreateForm();
            if (modal && modal.id === 'addContactModal') resetAddContactForm();
            if (modal && modal.id === 'editProfileModal') {
                if (profileModal) profileModal.classList.add('active');
            }
        });
    });

    // Обработка клавиши Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (replyToMessage) {
                hideReplyPreview();
                showNotification("Ответ отменен");
            }
            
            document.querySelectorAll('.modal-overlay.active').forEach(modal => {
                modal.classList.remove('active');
            });
            
            if (messageContextMenu) messageContextMenu.classList.remove('active');
            
            if (isMobile && mobileSidebar && mobileSidebar.classList.contains('active')) {
                closeMobileSidebar();
            }
            
            // Закрываем результаты поиска
            hideSearchResults('homeContactsSearchResults');
            hideSearchResults('contactSearchResults');
        }
        
        // Ctrl+K или Cmd+K для фокуса на поиске
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            
            if (isMobile) {
                // На мобильных - открываем модальное окно поиска
                if (homeContactsSearch) {
                    homeContactsSearch.focus();
                    // Прокручиваем к поиску
                    homeContactsSearch.scrollIntoView({ behavior: 'smooth' });
                }
            } else {
                // На ПК - фокус на поиске в боковой панели
                if (desktopSearchInput) {
                    desktopSearchInput.focus();
                }
            }
        }
    });

    // Предотвращение стандартного контекстного меню
    document.addEventListener('contextmenu', (e) => {
        if (e.target.closest('.message-content')) {
            e.preventDefault();
        }
    });

    // ДОПОЛНИТЕЛЬНЫЕ ОБРАБОТЧИКИ ДЛЯ ПОИСКА
    
    // Поиск контактов на главном экране
    if (homeContactsSearch) {
        homeContactsSearch.addEventListener('input', function() {
            const query = this.value.trim();
            
            // Очищаем предыдущий таймаут
            if (searchTimeouts.homeSearch) {
                clearTimeout(searchTimeouts.homeSearch);
            }
            
            if (query.length < 1) {
                hideSearchResults('homeContactsSearchResults');
                return;
            }
            
            // Запускаем поиск с задержкой (дебаунс)
            searchTimeouts.homeSearch = setTimeout(() => {
                const searchResults = searchUsers(query, contacts);
                displaySearchResults(searchResults, 'homeContactsSearchResults', contacts);
            }, 300); // Задержка 300 мс
        });
        
        // Закрываем результаты поиска на главном экране при клике вне их
        document.addEventListener('click', (e) => {
            if (!homeContactsSearch.contains(e.target) && 
                !homeContactsSearchResults.contains(e.target)) {
                hideSearchResults('homeContactsSearchResults');
            }
        });
    }
    
    // Настраиваем поиск в модальном окне и на главном экране
    setupContactSearch();
    setupHomeContactsSearch();
    
    // Инициализируем обработчики для реакций
    setupReactionsHandlers();
}

// ДОПОЛНИТЕЛЬНЫЕ ФУНКЦИИ ЧАТА
async function getChatInfo(chatId) {
    try {
        const chatRef = database.ref(`chats/${chatId}`);
        const snapshot = await chatRef.once('value');
        return snapshot.val();
    } catch (error) {
        return null;
    }
}

async function inviteToChat(chatId, userId) {
    try {
        const user = allUsers[userId];
        if (!user) {
            showNotification("Пользователь не найден");
            return;
        }
    
        const chat = await getChatInfo(chatId);
        if (!chat) {
            showNotification("Чат не найден");
            return;
        }
    
        if (chat.type === 'private') {
            showNotification("В личные чаты нельзя добавлять участников");
            return;
        }
    
        if (chat.members && chat.members[userId]) {
            showNotification("Пользователь уже в чате");
            return;
        }
    
        await database.ref(`chats/${chatId}/members/${userId}`).set(true);
    
        const systemMessage = {
            text: `${user.displayName} был(а) добавлен(а) в чат`,
            senderId: 'system',
            senderName: 'Система',
            timestamp: Date.now(),
            type: 'system'
        };
    
        await database.ref(`messages/${chatId}`).push(systemMessage);
    
        showNotification(`Пользователь ${user.displayName} добавлен в чат!`);
    
    } catch (error) {
        showNotification("Не удалось добавить пользователя в чат");
    }
}

async function updateChatName(chatId, newName) {
    try {
        const chat = await getChatInfo(chatId);
        if (!chat || chat.type === 'private') {
            showNotification("Невозможно изменить название этого чата");
            return;
        }
    
        await database.ref(`chats/${chatId}`).update({
            name: newName
        });
    
        const systemMessage = {
            text: `${currentUser.displayName} изменил(а) название чата на "${newName}"`,
            senderId: 'system',
            senderName: 'Система',
            timestamp: Date.now(),
            type: 'system'
        };
    
        await database.ref(`messages/${chatId}`).push(systemMessage);
    
        showNotification("Название чата обновлено");
    
        if (currentChatId === chatId) {
            if (isMobile) {
                if (chatHeaderName) chatHeaderName.textContent = newName;
            } else {
                if (desktopChatHeaderName) desktopChatHeaderName.textContent = newName;
            }
        }
    
    } catch (error) {
        showNotification("Не удалось обновить название чата");
    }
}

// ОБРАБОТЧИКИ ДЛЯ ОНЛАЙН/ОФФЛАЙН СТАТУСОВ
window.addEventListener('beforeunload', async () => {
    if (currentUser) {
        try {
            await database.ref(`users/${currentUser.uid}`).update({
                status: "offline",
                lastActive: Date.now() // Используем только lastActive
            });
        } catch (error) {
            console.error("Ошибка обновления статуса:", error);
        }
    }

    if (authUnsubscribe) {
        authUnsubscribe();
    }

    cleanupListeners();
    
    if (connectionCheckInterval) {
        clearInterval(connectionCheckInterval);
        connectionCheckInterval = null;
    }
});

// Обновляем статус при возвращении на страницу
// Обновляем статус при возвращении на страницу
window.addEventListener('focus', async () => {
    if (currentUser && navigator.onLine) {
        try {
            await database.ref(`users/${currentUser.uid}`).update({
                status: "online",
                lastActive: Date.now()
            });
            currentUser.status = "online";
            updateUserProfileDisplay();
            updateDesktopUserInfo();
        } catch (error) {
            console.error("Ошибка обновления статуса при фокусе:", error);
        }
    }
});

// Обновляем статус при уходе со страницы
window.addEventListener('blur', async () => {
    if (currentUser) {
        try {
            // Не ставим away сразу, только через некоторое время
            setTimeout(async () => {
                if (!document.hasFocus()) {
                    await database.ref(`users/${currentUser.uid}`).update({
                        status: "away",
                        lastActive: Date.now()
                    });
                    currentUser.status = "away";
                    updateUserProfileDisplay();
                    updateDesktopUserInfo();
                }
            }, 30000); // 30 секунд после ухода со страницы
        } catch (error) {
            console.error("Ошибка обновления статуса при блюре:", error);
        }
    }
});

// Обработка изменения сетевого соединения
window.addEventListener('online', async () => {
    if (currentUser) {
        try {
            await database.ref(`users/${currentUser.uid}`).update({
                status: "online",
                lastActive: Date.now()
            });
            currentUser.status = "online";
            updateUserProfileDisplay();
            updateDesktopUserInfo();
            showNotification("Соединение восстановлено");
        } catch (error) {
            console.error("Ошибка обновления статуса при восстановлении сети:", error);
        }
    }
});

window.addEventListener('offline', async () => {
    if (currentUser) {
        try {
            await database.ref(`users/${currentUser.uid}`).update({
                status: "offline",
                lastActive: Date.now()
            });
            currentUser.status = "offline";
            updateUserProfileDisplay();
            updateDesktopUserInfo();
            showNotification("Потеряно соединение с интернетом");
        } catch (error) {
            console.error("Ошибка обновления статуса при потере сети:", error);
        }
    }
});

// Обновляем статус при уходе со страницы
window.addEventListener('blur', async () => {
    if (currentUser) {
        try {
            // Не ставим away сразу, только через некоторое время
            setTimeout(async () => {
                if (!document.hasFocus()) {
                    await database.ref(`users/${currentUser.uid}`).update({
                        status: "away",
                        lastActive: Date.now()
                    });
                    currentUser.status = "away";
                    updateUserProfileDisplay();
                    updateDesktopUserInfo();
                }
            }, 30000); // 30 секунд после ухода со страницы
        } catch (error) {
            console.error("Ошибка обновления статуса при блюре:", error);
        }
    }
});

// Обработка изменения сетевого соединения
window.addEventListener('online', async () => {
    if (currentUser) {
        try {
            await database.ref(`users/${currentUser.uid}`).update({
                status: "online",
                lastActive: Date.now()
            });
            currentUser.status = "online";
            updateUserProfileDisplay();
            updateDesktopUserInfo();
            showNotification("Соединение восстановлено");
        } catch (error) {
            console.error("Ошибка обновления статуса при восстановлении сети:", error);
        }
    }
});

window.addEventListener('offline', async () => {
    if (currentUser) {
        try {
            await database.ref(`users/${currentUser.uid}`).update({
                status: "offline",
                lastActive: Date.now()
            });
            currentUser.status = "offline";
            updateUserProfileDisplay();
            updateDesktopUserInfo();
            showNotification("Потеряно соединение с интернетом");
        } catch (error) {
            console.error("Ошибка обновления статуса при потере сети:", error);
        }
    }
});

// Инициализация при загрузке
window.addEventListener('load', () => {
    // Предзагрузка важных ресурсов
    const preloadImages = [
        'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
    ];
    
    preloadImages.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'style';
        link.href = src;
        document.head.appendChild(link);
    });
});

// Добавляем анимацию slideOut для уведомлений
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
