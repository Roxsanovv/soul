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

// Переменные состояния
let currentUser = null;
let chats = [];
let contacts = [];
let allUsers = {};
let currentChatId = null;
let selectedChatType = "group"; // ИЗМЕНЕНИЕ: изменено с "channel" на "group"
let currentTab = "chats";
let authUnsubscribe = null;
let messageListeners = {};
let typingListeners = {};
let isMobile = false;
let replyToMessage = null;
let currentDesktopTab = "chats";
let connectionCheckInterval = null;
let searchTimeouts = {};
let lastSearchResults = [];

// DOM элементы
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
    
    // Сохраняем последние результаты
    lastSearchResults = results;
    
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
                          result.status === 'away' ? 'неактивен' : 
                          result.status === 'dnd' ? 'не беспокоить' : 'offline';
        
        const buttonText = result.isContact ? 'В контактах ✓' : 'Добавить';
        const buttonDisabled = result.isContact ? 'disabled' : '';
        
        resultItem.innerHTML = `
            <div class="search-result-avatar">
                ${result.displayName.charAt(0)}
            </div>
            <div class="search-result-info">
                <div class="search-result-name">${result.displayName}</div>
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
    console.log("Инициализация приложения");
    setupEventListeners();
    detectMobile();
    
    // Проверяем авторизацию
    authUnsubscribe = auth.onAuthStateChanged(async (user) => {
        console.log("Состояние авторизации изменено:", user ? "Авторизован" : "Не авторизован");
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
                console.log("Запуск мобильного интерфейса");
                initMobileInterface();
            } else {
                console.log("Запуск ПК интерфейса");
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
}

// Мониторинг соединения
function startConnectionMonitoring() {
    if (connectionCheckInterval) {
        clearInterval(connectionCheckInterval);
    }
    
    connectionCheckInterval = setInterval(async () => {
        if (currentUser && navigator.onLine) {
            try {
                // Просто обновляем timestamp для отслеживания активности
                await database.ref(`users/${currentUser.uid}`).update({
                    lastActive: Date.now()
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
    console.log("Определение устройства:", isMobile ? "Мобильное" : "ПК", "ширина:", window.innerWidth);
    
    window.addEventListener('resize', () => {
        const wasMobile = isMobile;
        isMobile = window.innerWidth <= 768;
        
        if (wasMobile !== isMobile) {
            console.log("Устройство изменилось, перезагрузка...");
            location.reload();
        }
    });
}

function initMobileInterface() {
    if (!isMobile) return;
    
    console.log("Инициализация мобильного интерфейса");
    
    // Показываем мобильные элементы, скрываем ПК элементы
    if (mobileHeader) mobileHeader.style.display = 'flex';
    if (desktopSidebar) desktopSidebar.style.display = 'none';
    if (desktopEmptyScreen) desktopEmptyScreen.style.display = 'none';
    
    // Настраиваем мобильный интерфейс
    if (currentChatId) {
        console.log("Есть активный чат на мобильном:", currentChatId);
        if (homeScreen) homeScreen.style.display = 'none';
        if (chatScreen) {
            chatScreen.style.display = 'flex';
            chatScreen.classList.add('mobile');
            chatScreen.classList.remove('desktop');
        }
        if (chatHeaderDesktop) chatHeaderDesktop.style.display = 'none';
        if (chatHeaderMobile) chatHeaderMobile.style.display = 'flex';
    } else {
        console.log("Нет активного чата, показываем главный экран");
        if (homeScreen) homeScreen.style.display = 'block';
        if (chatScreen) chatScreen.style.display = 'none';
    }
    
    // Добавляем классы для мобильных стилей
    document.body.classList.add('mobile');
    document.body.classList.remove('desktop');
    if (mainContent) {
        mainContent.classList.add('mobile');
        mainContent.classList.remove('desktop');
    }
}

function initDesktopInterface() {
    if (isMobile) return;
    
    console.log("Инициализация ПК интерфейса");
    
    // Настраиваем ПК интерфейс
    if (desktopSidebar) desktopSidebar.style.display = 'flex';
    if (mobileHeader) mobileHeader.style.display = 'none';
    if (homeScreen) homeScreen.style.display = 'none';
    
    // Показываем либо пустой экран, либо чат
    if (currentChatId) {
        console.log("Есть активный чат:", currentChatId);
        if (desktopEmptyScreen) {
            console.log("Скрываем пустой экран при инициализации");
            desktopEmptyScreen.style.display = 'none';
        }
        if (chatScreen) {
            console.log("Показываем экран чата при инициализации");
            chatScreen.style.display = 'flex';
            chatScreen.classList.add('desktop', 'active');
            chatScreen.classList.remove('mobile');
        }
        if (chatHeaderDesktop) chatHeaderDesktop.style.display = 'flex';
        if (chatHeaderMobile) chatHeaderMobile.style.display = 'none';
    } else {
        console.log("Нет активного чата, показываем пустой экран при инициализации");
        if (desktopEmptyScreen) desktopEmptyScreen.style.display = 'flex';
        if (chatScreen) chatScreen.style.display = 'none';
    }
    
    // Добавляем классы для ПК стилей
    document.body.classList.add('desktop');
    document.body.classList.remove('mobile');
    if (mainContent) {
        mainContent.classList.add('desktop');
        mainContent.classList.remove('mobile');
    }
    
    // Обновляем информацию о пользователе в боковой панели
    updateDesktopUserInfo();
    
    // Загружаем чаты для ПК интерфейса
    updateDesktopChats();
    updateDesktopContacts();
}

function updateDesktopUserInfo() {
    if (!currentUser) return;
    
    // Обновляем аватар и имя
    if (desktopUserAvatar) {
        desktopUserAvatar.textContent = currentUser.displayName.charAt(0);
        
        // Устанавливаем класс статуса для аватара
        desktopUserAvatar.className = 'desktop-user-avatar';
        desktopUserAvatar.classList.add(`status-${currentUser.status || 'online'}`);
    }
    
    if (desktopUserName) desktopUserName.textContent = currentUser.displayName;
    
    // Обновляем статус с иконкой
    if (desktopUserStatus) {
        let statusIcon = 'fa-circle';
        let statusColor = '#10b981';
        
        switch(currentUser.status || 'online') {
            case 'online':
                statusIcon = 'fa-circle';
                statusColor = '#10b981';
                break;
            case 'away':
                statusIcon = 'fa-clock';
                statusColor = '#f59e0b';
                break;
            case 'dnd':
                statusIcon = 'fa-minus-circle';
                statusColor = '#ef4444';
                break;
            case 'offline':
                statusIcon = 'fa-circle';
                statusColor = '#64748b';
                break;
            case 'invisible':
                statusIcon = 'fa-eye-slash';
                statusColor = '#64748b';
                break;
            default:
                statusIcon = 'fa-circle';
                statusColor = '#10b981';
        }
        
        desktopUserStatus.innerHTML = `
            <i class="fas ${statusIcon}"></i>
            <span>${currentUser.status || 'online'}</span>
        `;
        desktopUserStatus.style.color = statusColor;
    }
}

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
        console.error("Ошибка входа:", error);
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
        console.error("Ошибка быстрого входа:", error);
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
        console.error("Ошибка регистрации:", error);
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
    
        const userRef = database.ref(`users/${userId}`);
        const snapshot = await userRef.once('value');
    
        if (snapshot.exists()) {
            currentUser = {
                uid: userId,
                ...snapshot.val()
            };
            
            // ВАЖНО: Обновляем статус сразу при загрузке данных
            await userRef.update({
                status: "online",
                lastSeen: null,
                lastActive: Date.now()
            });
            
            currentUser.status = "online";
            
            // Слушаем изменения статуса в реальном времени
            userRef.on('value', (snap) => {
                if (snap.exists()) {
                    const userData = snap.val();
                    if (userData.status && userData.status !== currentUser.status) {
                        currentUser.status = userData.status;
                        updateUserProfileDisplay();
                        updateDesktopUserInfo();
                    }
                }
            });
            
        } else {
            const user = auth.currentUser;
            currentUser = {
                uid: userId,
                displayName: user.displayName || "Пользователь",
                email: user.email,
                status: "online", // Устанавливаем online при создании
                customId: "user_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
                joinDate: new Date().toLocaleDateString('ru-RU'),
                contacts: {},
                chats: {},
                lastActive: Date.now()
            };
        
            await userRef.set(currentUser);
            
            // Слушаем изменения статуса в реальном времени
            userRef.on('value', (snap) => {
                if (snap.exists()) {
                    const userData = snap.val();
                    if (userData.status && userData.status !== currentUser.status) {
                        currentUser.status = userData.status;
                        updateUserProfileDisplay();
                        updateDesktopUserInfo();
                    }
                }
            });
        }
    
        await loadAllUsers();
        await loadUserChats();
        await loadContacts();
    
        updateUserProfileDisplay();
        updateHomeScreen();
    
        setLoading(false);
    
    } catch (error) {
        console.error("Ошибка загрузки данных:", error);
        showNotification("Ошибка загрузки данных. Попробуйте обновить страницу.");
        setLoading(false);
    }
}

async function logoutUser() {
    try {
        if (currentUser) {
            await database.ref(`users/${currentUser.uid}`).update({
                status: "offline",
                lastSeen: Date.now()
            });
        }
    
        await auth.signOut();
    
        currentUser = null;
        chats = [];
        contacts = [];
        currentChatId = null;
        replyToMessage = null;
    
        Object.values(messageListeners).forEach(unsubscribe => unsubscribe());
        Object.values(typingListeners).forEach(unsubscribe => unsubscribe());
        messageListeners = {};
        typingListeners = {};
        
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
            
            console.log("Загружены все пользователи:", Object.keys(allUsers).length, "пользователей");
        }
    } catch (error) {
        console.error("Ошибка загрузки пользователей:", error);
    }
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
        console.error("Ошибка загрузки чатов:", error);
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
        console.log("Загрузка контактов для пользователя:", currentUser.uid);
        
        const contactsRef = database.ref(`users/${currentUser.uid}/contacts`);
        
        // Используем once для первоначальной загрузки
        const snapshot = await contactsRef.once('value');
        console.log("Контакты загружены из базы:", snapshot.val());
        updateContactsList(snapshot);
        
        // Затем слушаем изменения в реальном времени
        contactsRef.on('value', (snapshot) => {
            console.log("Контакты обновлены в реальном времени:", snapshot.val());
            updateContactsList(snapshot);
        });
        
    } catch (error) {
        console.error("Ошибка загрузки контактов:", error);
    }
}

// ИСПРАВЛЕННАЯ ФУНКЦИЯ ОБНОВЛЕНИЯ СПИСКА КОНТАКТОВ
function updateContactsList(snapshot) {
    // Очищаем текущий список контактов
    contacts = [];
    
    const contactsData = snapshot.val();
    
    console.log("Обработка данных контактов:", contactsData);

    if (contactsData && typeof contactsData === 'object') {
        Object.keys(contactsData).forEach(userId => {
            const contactData = contactsData[userId];
            
            // Получаем актуальные данные пользователя из allUsers
            const user = allUsers[userId];
            
            // Создаем объект контакта
            const contact = {
                userId: userId,
                displayName: user ? user.displayName : (contactData.displayName || "Неизвестный пользователь"),
                customId: user ? user.customId : (contactData.customId || `user_${userId.substr(0, 8)}`),
                status: user ? user.status : (contactData.status || 'offline'),
                lastActive: user ? user.lastActive : (contactData.lastActive || 0),
                addedAt: contactData.addedAt || Date.now()
            };
            
            contacts.push(contact);
        });
        
        console.log("Контактов загружено:", contacts.length);
    } else {
        console.log("Контакты отсутствуют или данные некорректны");
    }

    // Обновляем отображение контактов
    updateHomeContacts();
    updateDesktopContacts();
    updateProfileContactsCount();
}

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
            <div class="contact-name">${contact.displayName}</div>
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
            <div class="desktop-chat-name">${contact.displayName}</div>
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
                          result.status === 'away' ? 'неактивен' : 
                          result.status === 'dnd' ? 'не беспокоить' : 'offline';
        
        const buttonText = result.isContact ? 'В контактах ✓' : 'Добавить';
        const buttonDisabled = result.isContact ? 'disabled' : '';
        
        resultItem.innerHTML = `
            <div class="search-result-avatar">
                ${result.displayName.charAt(0)}
            </div>
            <div class="search-result-info">
                <div class="search-result-name">${result.displayName}</div>
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

    console.log("Открываем чат", chatId, "устройство:", isMobile ? "мобильное" : "ПК");

    if (isMobile) {
        // Мобильный интерфейс - ИСПРАВЛЕНО: прячем главный экран, показываем чат поверх всего
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
        
        // Выделяем активный чат
        document.querySelectorAll('.chat-item').forEach(item => {
            item.classList.remove('active');
        });
        const activeChatItem = document.querySelector(`.chat-item[data-chat-id="${chatId}"]`);
        if (activeChatItem) {
            activeChatItem.classList.add('active');
        }
    } else {
        // ПК интерфейс - ВАЖНО: скрываем пустой экран и показываем чат
        if (desktopEmptyScreen) {
            console.log("Скрываем пустой экран на ПК");
            desktopEmptyScreen.style.display = 'none';
        }
        
        if (chatScreen) {
            console.log("Показываем экран чата на ПК");
            chatScreen.style.display = 'flex';
            chatScreen.classList.add('desktop', 'active');
            chatScreen.classList.remove('mobile');
        }
        
        // Обновляем активный чат в боковой панели
        document.querySelectorAll('.desktop-chat-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeChatItem = document.querySelector(`.desktop-chat-item[data-chat-id="${chatId}"]`);
        if (activeChatItem) {
            activeChatItem.classList.add('active');
        }
    }

    let chatName, chatDescription, avatarContent;

    if (chat.type === 'private') {
        const otherUserId = Object.keys(chat.members).find(id => id !== currentUser.uid);
        const otherUser = allUsers[otherUserId];
    
        chatName = otherUser ? otherUser.displayName : "Неизвестный пользователь";
        chatDescription = "Личный чат";
        avatarContent = otherUser ? otherUser.displayName.charAt(0) : '?';
    } else {
        chatName = chat.name;
        chatDescription = chat.description || `Групповой чат`;
        avatarContent = '<i class="fas fa-users"></i>';
    }

    // Обновляем заголовок в зависимости от устройства
    if (isMobile) {
        if (chatHeaderName) chatHeaderName.textContent = chatName;
        if (chatHeaderDescription) chatHeaderDescription.textContent = chatDescription;
        if (chatHeaderDesktop) chatHeaderDesktop.style.display = 'none';
        if (chatHeaderMobile) chatHeaderMobile.style.display = 'flex';
    } else {
        if (desktopChatHeaderName) desktopChatHeaderName.textContent = chatName;
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
}

function showHomeScreen() {
    console.log("Показываем главный экран, устройство:", isMobile ? "мобильное" : "ПК");
    
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
            console.log("Показываем пустой экран на ПК");
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
        const messagesRef = database.ref(`messages/${chatId}`).orderByChild('timestamp').limitToLast(50);

        messagesRef.once('value').then((snapshot) => {
            const messagesData = snapshot.val();
        
            if (messagesData) {
                const messagesArray = Object.keys(messagesData).map(key => {
                    return { id: key, ...messagesData[key] };
                }).sort((a, b) => a.timestamp - b.timestamp);
            
                messagesArray.forEach(message => {
                    const messageElement = createMessageElement(message);
                    messagesContainer.appendChild(messageElement);
                });
            
                setTimeout(() => {
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                }, 100);
            } else {
                showWelcomeMessage();
            }
        });
    
        listenToNewMessages(chatId);
    
    } catch (error) {
        console.error("Ошибка загрузки сообщений:", error);
        showWelcomeMessage();
    }
}

function listenToNewMessages(chatId) {
    const newMessagesRef = database.ref(`messages/${chatId}`)
        .orderByChild('timestamp')
        .startAt(Date.now());

    newMessagesRef.on('child_added', (snapshot) => {
        const message = { id: snapshot.key, ...snapshot.val() };
    
        if (!document.querySelector(`[data-message-id="${message.id}"]`)) {
            const messageElement = createMessageElement(message);
            if (messagesContainer) messagesContainer.appendChild(messageElement);
        
            setTimeout(() => {
                if (messagesContainer) messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }, 100);
        }
    });
}

function createMessageElement(message) {
    const messageElement = document.createElement('div');

    if (message.type === 'system') {
        messageElement.className = 'message system';
        messageElement.innerHTML = `
            <div class="message-content">
                <div class="message-text">${message.text}</div>
            </div>
        `;
    } else {
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
            if (repliedMessage.senderId && allUsers[repliedMessage.senderId]) {
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

        messageElement.innerHTML = `
            <div class="message-avatar">
                ${senderName.charAt(0)}
            </div>
            <div class="message-content">
                <div class="message-sender">
                    <span class="message-sender-name">${senderName}</span>
                    <span class="message-time">${timeString}</span>
                </div>
                ${replyHtml}
                <div class="message-text">${message.text}</div>
            </div>
        `;
        
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
    }

    return messageElement;
}

async function sendMessage() {
    const text = messageInput.value.trim();
    if (!text || !currentChatId) return;

    try {
        if (text.startsWith('/')) {
            await handleCommand(text);
            if (messageInput) messageInput.value = '';
            if (messageInput) messageInput.style.height = '56px';
            hideReplyPreview();
            return;
        }
    
        const newMessage = {
            text: text,
            senderId: currentUser.uid,
            senderName: currentUser.displayName,
            timestamp: Date.now()
        };
    
        if (replyToMessage) {
            newMessage.replyTo = {
                id: replyToMessage.id,
                text: replyToMessage.text,
                senderId: replyToMessage.senderId,
                senderName: replyToMessage.senderName || "Пользователь"
            };
        }
    
        if (messageInput) messageInput.value = '';
        if (messageInput) messageInput.style.height = '56px';
        hideReplyPreview();
        replyToMessage = null;
        
        if (isMobile && messageInput) {
            messageInput.blur();
        }
    
        const messagesRef = database.ref(`messages/${currentChatId}`);
        await messagesRef.push(newMessage);
    
        const chatRef = database.ref(`chats/${currentChatId}`);
        await chatRef.update({
            lastMessage: {
                text: text,
                timestamp: Date.now(),
                senderId: currentUser.uid
            }
        });
    
        setTimeout(() => {
            if (messagesContainer) messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 100);
    
    } catch (error) {
        console.error("Ошибка при отправке сообщения:", error);
        showNotification("Не удалось отправить сообщение. Попробуйте еще раз.");
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
        const senderName = messageElement.querySelector('.message-sender-name')?.textContent.split(' ')[0] || '';

        replyToMessage = {
            id: messageId,
            text: messageText,
            senderName: senderName
        };

        showReplyPreview(senderName, messageText);

        if (messageContextMenu) messageContextMenu.classList.remove('active');
        if (messageInput) messageInput.focus();
        showNotification("Вы отвечаете на сообщение");
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
                console.error('Ошибка при копировании: ', err);
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
                console.error("Ошибка при выходе из чата:", error);
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
                console.error("Ошибка при удалении сообщения:", error);
                showNotification("Не удалось удалить сообщение");
                confirmDeleteMessageModal.classList.remove('active');
            }
        };
    }
}

// ФУНКЦИИ ДЛЯ ОТВЕТА НА СООБЩЕНИЯ
function showReplyPreview(senderName, messageText) {
    if (!replyPreviewContainer) return;
    
    replyPreviewContainer.style.display = 'block';
    replyPreviewContainer.innerHTML = `
        <div class="reply-preview">
            <div class="reply-preview-content">
                <div class="reply-preview-sender">
                    <i class="fas fa-reply"></i> Ответ ${senderName}
                </div>
                <div class="reply-preview-text">${messageText}</div>
            </div>
            <button class="reply-preview-close" id="cancelReplyBtn">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    document.getElementById('cancelReplyBtn')?.addEventListener('click', hideReplyPreview);
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
        console.error("Ошибка при выходе из чата:", error);
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
    
        if (selectedChatType === 'private') {
            const targetUserId = privateUserId ? privateUserId.value.trim() : '';
        
            if (!targetUserId) {
                showNotification("Пожалуйста, введите ID пользователя для личного чата");
                return;
            }
        
            let targetUser = null;
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
                }
            };
        }
    
        const chatsRef = database.ref('chats');
        const newChatRef = chatsRef.push();
    
        await newChatRef.set(newChat);
        const chatId = newChatRef.key;
    
        showNotification("Чат успешно создан!");
    
        newChat.id = chatId;
        chats.push(newChat);
    
        // Обновляем интерфейс в зависимости от устройства
        if (isMobile && homeChatsList) {
            const chatElement = createChatElement(newChat);
            homeChatsList.appendChild(chatElement);
        } else if (desktopChatsList) {
            const chatElement = createDesktopChatElement(newChat);
            desktopChatsList.appendChild(chatElement);
        }
    
        setupChatListener(chatId);
    
        if (createChatModal) createChatModal.classList.remove('active');
        resetCreateForm();
    
        if (selectedChatType === 'private') {
            openChat(chatId);
        }
    
    } catch (error) {
        console.error("Ошибка при создании чата:", error);
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
        console.error("Ошибка поиска чата:", error);
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
        console.error("Ошибка при создании личного чата:", error);
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

// Обновленная функция добавления контакта
async function addContact(targetCustomId) {
    try {
        console.log("Попытка добавления контакта по customId:", targetCustomId);
        
        // Ищем пользователя по customId
        let targetUser = null;
        let actualUserId = null;
        
        for (const userId in allUsers) {
            if (allUsers[userId].customId === targetCustomId) {
                targetUser = allUsers[userId];
                actualUserId = userId;
                console.log("Найден пользователь по customId:", targetUser);
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
            lastActive: targetUser.lastActive,
            addedAt: Date.now()
        };

        await contactRef.set(contactData);
        
        showNotification(`Пользователь ${targetUser.displayName} добавлен в контакты!`);

        // Обновляем список контактов
        await loadContacts();
        
        // Обновляем результаты поиска
        if (contactSearch && contactSearch.value.trim()) {
            const newResults = searchUsers(contactSearch.value.trim(), contacts);
            displaySearchResults(newResults, 'contactSearchResults', contacts);
        }

    } catch (error) {
        console.error("Ошибка при добавлении контакта:", error);
        showNotification("Не удалось добавить контакт: " + error.message);
    }
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
    if (!profileModal) return;
    
    profileModal.classList.add('active');
    
    if (isMobile) {
        closeMobileSidebar();
    }
}

function updateUserProfileDisplay() {
    if (!currentUser) return;

    if (profileName) profileName.textContent = currentUser.displayName;
    if (profileUserId) profileUserId.textContent = currentUser.customId;
    const profileAvatarLarge = document.getElementById('profileAvatarLarge');
    if (profileAvatarLarge) profileAvatarLarge.textContent = currentUser.displayName.charAt(0);
    const profileStatus = document.getElementById('profileStatus');
    if (profileStatus) {
        profileStatus.textContent = currentUser.status || "online";
        profileStatus.className = `profile-status ${currentUser.status || "online"}`;
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
            console.error('Ошибка при копировании: ', err);
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
        console.error("Ошибка при обновлении профиля:", error);
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

// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
function resetCreateForm() {
    if (chatNameInput) chatNameInput.value = '';
    if (chatDescriptionInput) chatDescriptionInput.value = '';
    if (privateUserId) privateUserId.value = '';
    if (privateUserSearchResults) {
        privateUserSearchResults.innerHTML = '';
        privateUserSearchResults.style.display = 'none';
    }
    selectedChatType = 'group'; // ИЗМЕНЕНИЕ: изменено с 'channel' на 'group'
    chatTypeOptions.forEach(opt => {
        opt.classList.remove('active');
        if (opt.dataset.type === 'group') { // ИЗМЕНЕНИЕ: изменено с 'channel' на 'group'
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

// Обновленная функция сброса формы добавления контакта
function resetAddContactForm() {
    if (contactSearch) contactSearch.value = '';
    hideSearchResults('contactSearchResults');
    setSearchLoading('contactSearch', false);
    lastSearchResults = [];
    if (confirmAddContactBtn) confirmAddContactBtn.disabled = true;
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

// МОБИЛЬНЫЕ ФУНКЦИИ
function openMobileSidebar() {
    if (!mobileSidebarOverlay || !mobileSidebar) return;
    
    mobileSidebarOverlay.classList.add('active');
    mobileSidebar.classList.add('active');
    document.body.style.overflow = 'hidden';
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

// ОБРАБОТЧИКИ СОБЫТИЙ
function setupEventListeners() {
    console.log("Настройка обработчиков событий");
    
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
    setupMobileSidebar();
    
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
            console.log("Клик по созданию чата в боковой панели ПК");
            if (createChatModal) createChatModal.classList.add('active');
        });
    }
    
    if (desktopAddContactBtn) {
        desktopAddContactBtn.addEventListener('click', () => {
            console.log("Клик по добавлению контакта в боковой панели ПК");
            if (addContactModal) addContactModal.classList.add('active');
        });
    }
    
    if (desktopEmptyCreateChatBtn) {
        desktopEmptyCreateChatBtn.addEventListener('click', () => {
            console.log("Клик по созданию чата из пустого экрана");
            if (createChatModal) createChatModal.classList.add('active');
        });
    }
    
    if (desktopEmptyAddContactBtn) {
        desktopEmptyAddContactBtn.addEventListener('click', () => {
            console.log("Клик по добавлению контакта из пустого экрана");
            if (addContactModal) addContactModal.classList.add('active');
        });
    }
    
    // КНОПКА ИНФОРМАЦИИ О ПРОФИЛЕ НА ПК
    if (desktopUserInfoBtn) {
        desktopUserInfoBtn.addEventListener('click', () => {
            console.log("Открытие профиля из ПК интерфейса");
            openProfileModal();
        });
    }
    
    // Вкладки в боковой панели ПК
    if (desktopSidebarTabs.length > 0) {
        desktopSidebarTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                currentDesktopTab = tabName;
                
                desktopSidebarTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                if (tabName === 'chats') {
                    if (desktopChatsList) desktopChatsList.style.display = 'flex';
                    if (desktopContactsList) desktopContactsList.style.display = 'none';
                } else if (tabName === 'contacts') {
                    if (desktopChatsList) desktopChatsList.style.display = 'none';
                    if (desktopContactsList) desktopContactsList.style.display = 'flex';
                }
            });
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
    
    if (homeTabs.length > 0) {
        homeTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                
                homeTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                document.querySelectorAll('.home-tab-pane').forEach(pane => {
                    pane.classList.remove('active');
                });
                
                const pane = document.getElementById(`home${tabName.charAt(0).toUpperCase() + tabName.slice(1)}Pane`);
                if (pane) pane.classList.add('active');
            });
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

    // КОНТАКТЫ - ИСПРАВЛЕННЫЕ ОБРАБОТЧИКИ
    if (cancelAddContactBtn) {
        cancelAddContactBtn.addEventListener('click', () => {
            if (addContactModal) addContactModal.classList.remove('active');
            resetAddContactForm();
        });
    }

    // ПОИСК КОНТАКТОВ В МОДАЛЬНОМ ОКНЕ
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

    // Закрываем результаты поиска в модальном окне при клике вне их
    document.addEventListener('click', (e) => {
        if (contactSearch && !contactSearch.contains(e.target) && 
            contactSearchResults && !contactSearchResults.contains(e.target)) {
            hideSearchResults('contactSearchResults');
        }
    });

    // Обновленный обработчик кнопки "Добавить" в модальном окне
    if (confirmAddContactBtn) {
        confirmAddContactBtn.addEventListener('click', async () => {
            if (!contactSearch) return;

            const searchValue = contactSearch.value.trim();
        
            if (!searchValue) {
                showNotification("Введите имя или ID пользователя");
                return;
            }

            console.log("Поиск пользователя для добавления:", searchValue);

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
    
    if (mobileLogoutBtn) {
        mobileLogoutBtn.addEventListener('click', logoutUser);
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

    // Автоматическое изменение высоты textarea
    if (messageInput) {
        messageInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 120) + 'px';
        });
    }

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
    setupContactSearch();
    setupHomeContactsSearch();
}

// ДОПОЛНИТЕЛЬНЫЕ ФУНКЦИИ ЧАТА
async function getChatInfo(chatId) {
    try {
        const chatRef = database.ref(`chats/${chatId}`);
        const snapshot = await chatRef.once('value');
        return snapshot.val();
    } catch (error) {
        console.error("Ошибка получения информации о чате:", error);
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
        console.error("Ошибка приглашения в чат:", error);
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
        console.error("Ошибка обновления названия чата:", error);
        showNotification("Не удалось обновить название чата");
    }
}

// ОБРАБОТЧИКИ ДЛЯ ОНЛАЙН/ОФФЛАЙН СТАТУСОВ
window.addEventListener('beforeunload', async () => {
    if (currentUser) {
        try {
            await database.ref(`users/${currentUser.uid}`).update({
                status: "offline",
                lastSeen: Date.now()
            });
        } catch (error) {
            console.error("Ошибка обновления статуса:", error);
        }
    }

    if (authUnsubscribe) {
        authUnsubscribe();
    }

    Object.values(messageListeners).forEach(unsubscribe => unsubscribe());
    Object.values(typingListeners).forEach(unsubscribe => unsubscribe());
    
    if (connectionCheckInterval) {
        clearInterval(connectionCheckInterval);
        connectionCheckInterval = null;
    }
});

// Обновляем статус при возвращении на страницу
window.addEventListener('focus', async () => {
    if (currentUser) {
        try {
            await database.ref(`users/${currentUser.uid}`).update({
                status: "online",
                lastSeen: null,
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
            // Не ставим offline сразу, а только away через некоторое время
            setTimeout(async () => {
                if (!document.hasFocus()) {
                    await database.ref(`users/${currentUser.uid}`).update({
                        status: "away",
                        lastSeen: Date.now()
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
                lastSeen: null,
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
                lastSeen: Date.now()
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
