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

// ================================================
// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
// ================================================
let currentUser = null;
let chats = [];
let contacts = [];
let allUsers = {};
let verifiedUsers = {};
let currentChatId = null;
let selectedChatType = "group";
let replyToMessage = null;
let isMobile = false;
let selectedPhoto = null;
let searchTimeouts = {};

// Слушатели
let contactsListener = null;
let chatsListener = null;
let verifiedUsersListener = null;
let messageListeners = {};
let typingListeners = {};
let connectionCheckInterval = null;

// ================================================
// DOM ЭЛЕМЕНТЫ
// ================================================
// Авторизация
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

// Старые мобильные элементы (скрыты)
const mobileHeader = document.getElementById('mobileHeader');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileProfileBtn = document.getElementById('mobileProfileBtn');
const mobileSidebarOverlay = document.getElementById('mobileSidebarOverlay');
const mobileSidebar = document.getElementById('mobileSidebar');
const mobileSidebarClose = document.getElementById('mobileSidebarClose');
const mobileUserId = document.getElementById('mobileUserId');
const copyMobileIdBtn = document.getElementById('copyMobileIdBtn');
const mobileSidebarTabs = document.querySelectorAll('.mobile-sidebar-tab');
const mobileSearchInput = document.getElementById('mobileSearchInput');
const mobileChatsContainer = document.getElementById('mobileChatsContainer');
const mobileContactsContainer = document.getElementById('mobileContactsContainer');

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

// Новые мобильные элементы
const mobileContainer = document.querySelector('.mobile-container');
const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
const mobileTabs = document.querySelectorAll('.mobile-tab-content');
const mobileCreateFAB = document.getElementById('mobileCreateFAB');
const mobileCreateModal = document.getElementById('mobileCreateModal');
const mobileCloseCreateModal = document.getElementById('mobileCloseCreateModal');
const mobileCreateOptions = document.querySelectorAll('.mobile-create-option');
const mobileSearchChats = document.getElementById('mobileSearchChats');
const mobileSearchContacts = document.getElementById('mobileSearchContacts');
const mobileChatsList = document.getElementById('mobileChatsList');
const mobileContactsList = document.getElementById('mobileContactsList');
const mobileProfileAvatar = document.getElementById('mobileProfileAvatar');
const mobileProfileName = document.getElementById('mobileProfileName');
const mobileProfileStatus = document.getElementById('mobileProfileStatus');
const mobileProfileId = document.getElementById('mobileProfileId');
const mobileProfileJoinDate = document.getElementById('mobileProfileJoinDate');
const mobileProfileContacts = document.getElementById('mobileProfileContacts');
const mobileProfileChats = document.getElementById('mobileProfileChats');
const mobileCopyIdBtn = document.getElementById('mobileCopyIdBtn');
const mobileEditProfileBtn = document.getElementById('mobileEditProfileBtn');
const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');
const chatsCount = document.getElementById('chatsCount');
const contactsCount = document.getElementById('contactsCount');
const notificationsSwitch = document.getElementById('notificationsSwitch');
const themeSwitch = document.getElementById('themeSwitch');

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

// Контекстное меню
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

// Фото элементы
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

// Дополнительные элементы
const privateUserId = document.getElementById('privateUserId');
const privateUserSearchResults = document.getElementById('privateUserSearchResults');
const chatDescriptionGroup = document.getElementById('chatDescriptionGroup');
const privateChatUser = document.getElementById('privateChatUser');

// Админ-панель
const adminPanelBtn = document.getElementById('adminPanelBtn');
const adminPanelModal = document.getElementById('adminPanelModal');
const closeAdminPanel = document.getElementById('closeAdminPanel');
const badgeUserId = document.getElementById('badgeUserId');
const badgeType = document.getElementById('badgeType');
const giveBadgeBtn = document.getElementById('giveBadgeBtn');
const verifiedUsersList = document.getElementById('verifiedUsersList');
const adminUserSearch = document.getElementById('adminUserSearch');
const adminSearchResults = document.getElementById('adminSearchResults');

// ================================================
// ИНИЦИАЛИЗАЦИЯ
// ================================================
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    setupDragAndDrop();
    setupEventListeners();
    detectMobile();
    setupPhotoUpload();
    setupAdminPanel();
    setupMobileInterface();
    setupReactionsHandlers();
    
    authUnsubscribe = auth.onAuthStateChanged(async (user) => {
        if (user) {
            await loadUserData(user.uid);
            if (authContainer) authContainer.style.display = 'none';
            if (mainContainer) mainContainer.style.display = 'flex';
            showNotification("Добро пожаловать в Soul!");
            
            startConnectionMonitoring();
            updateUserIDs();
            
            if (isMobile) {
                initMobileInterface();
            } else {
                initDesktopInterface();
            }
            
        } else {
            if (authContainer) authContainer.style.display = 'flex';
            if (mainContainer) mainContainer.style.display = 'none';
            
            if (connectionCheckInterval) {
                clearInterval(connectionCheckInterval);
                connectionCheckInterval = null;
            }
        }
    });
}

// ================================================
// МОБИЛЬНЫЙ ИНТЕРФЕЙС
// ================================================
function setupMobileInterface() {
    if (!mobileNavItems.length) return;
    
    // Переключение вкладок
    mobileNavItems.forEach(item => {
        item.addEventListener('click', () => {
            const tabName = item.dataset.tab;
            
            mobileNavItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            mobileTabs.forEach(tab => tab.classList.remove('active'));
            
            const tabId = `mobile${tabName.charAt(0).toUpperCase() + tabName.slice(1)}Tab`;
            document.getElementById(tabId)?.classList.add('active');
        });
    });
    
    // В функции setupMobileInterface найдите эту часть и ЗАМЕНИТЕ:

    // Плавающая кнопка создания - открывает прямое модальное окно
    if (mobileCreateFAB) {
        mobileCreateFAB.addEventListener('click', () => {
            openMobileCreateModal();
        });
    }
    
    // Закрытие модального окна
    if (mobileCloseCreateModal) {
        mobileCloseCreateModal.addEventListener('click', () => {
            closeMobileCreateModal();
        });
    }
    
    // Закрытие по клику на фон
    if (mobileCreateModal) {
        mobileCreateModal.addEventListener('click', (e) => {
            if (e.target === mobileCreateModal) {
                closeMobileCreateModal();
            }
        });
    }
    
    // Переключение между типами чатов
    const mobileChatTypeOptions = document.querySelectorAll('.mobile-chat-type-option');
    mobileChatTypeOptions.forEach(option => {
        option.addEventListener('click', () => {
            const type = option.dataset.type;
            
            // Обновляем активный класс
            mobileChatTypeOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            
            // Показываем соответствующую форму
            const groupForm = document.getElementById('mobileGroupForm');
            const privateForm = document.getElementById('mobilePrivateForm');
            const channelForm = document.getElementById('mobileChannelForm');
            
            if (groupForm) groupForm.classList.remove('active');
            if (privateForm) privateForm.classList.remove('active');
            if (channelForm) channelForm.classList.remove('active');
            
            if (type === 'group') {
                if (groupForm) groupForm.classList.add('active');
            } else if (type === 'private') {
                if (privateForm) privateForm.classList.add('active');
                // Фокус на поле ввода ID
                setTimeout(() => {
                    const input = document.getElementById('mobilePrivateUserId');
                    if (input) input.focus();
                }, 100);
            } else if (type === 'channel') {
                if (channelForm) channelForm.classList.add('active');
            }
        });
    });
    
    // Поиск пользователей при вводе ID
    const mobilePrivateUserId = document.getElementById('mobilePrivateUserId');
    if (mobilePrivateUserId) {
        let searchTimeout;
        
        mobilePrivateUserId.addEventListener('input', function() {
            const query = this.value.trim();
            
            clearTimeout(searchTimeout);
            
            if (query.length < 1) {
                const searchResults = document.getElementById('mobilePrivateSearchResults');
                const createBtn = document.getElementById('mobileCreatePrivateBtn');
                if (searchResults) searchResults.innerHTML = '';
                if (createBtn) createBtn.disabled = true;
                return;
            }
            
            searchTimeout = setTimeout(() => {
                searchMobileUsers(query);
            }, 300);
        });
    }
    
    // Создание группы
    const createGroupBtn = document.getElementById('mobileCreateGroupBtn');
    if (createGroupBtn) {
        createGroupBtn.addEventListener('click', () => {
            createMobileGroup();
        });
    }
    
    // Создание личного чата
    const createPrivateBtn = document.getElementById('mobileCreatePrivateBtn');
    if (createPrivateBtn) {
        createPrivateBtn.addEventListener('click', () => {
            createMobilePrivateChat();
        });
    }
    
    // Создание канала
    const createChannelBtn = document.getElementById('mobileCreateChannelBtn');
    if (createChannelBtn) {
        createChannelBtn.addEventListener('click', () => {
            createMobileChannel();
        });
    }
    
    // Обработка выбора типа создания
    mobileCreateOptions.forEach(option => {
        option.addEventListener('click', () => {
            const type = option.dataset.type;
            mobileCreateModal?.classList.remove('active');
            
            if (type === 'group') {
                selectedChatType = 'group';
                createChatModal?.classList.add('active');
                if (chatDescriptionGroup) chatDescriptionGroup.style.display = 'block';
                if (privateChatUser) privateChatUser.style.display = 'none';
                if (chatNameInput) chatNameInput.disabled = false;
            } else if (type === 'private') {
                selectedChatType = 'private';
                createChatModal?.classList.add('active');
                if (chatDescriptionGroup) chatDescriptionGroup.style.display = 'none';
                if (privateChatUser) privateChatUser.style.display = 'block';
                if (chatNameInput) {
                    chatNameInput.placeholder = "Имя чата (автоматически)";
                    chatNameInput.disabled = true;
                }
            } else if (type === 'channel') {
                showNotification('Каналы будут доступны в следующем обновлении');
            }
        });
    });
    
    // Поиск по чатам
    if (mobileSearchChats) {
        mobileSearchChats.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const items = document.querySelectorAll('.mobile-chat-item');
            
            items.forEach(item => {
                const name = item.querySelector('.mobile-chat-name')?.textContent.toLowerCase() || '';
                const lastMessage = item.querySelector('.mobile-chat-last-message')?.textContent.toLowerCase() || '';
                
                item.style.display = (name.includes(query) || lastMessage.includes(query)) ? 'flex' : 'none';
            });
        });
    }
    
    // Поиск по контактам
    if (mobileSearchContacts) {
        mobileSearchContacts.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const items = document.querySelectorAll('.mobile-contact-item');
            
            items.forEach(item => {
                const name = item.querySelector('.mobile-contact-name')?.textContent.toLowerCase() || '';
                item.style.display = name.includes(query) ? 'flex' : 'none';
            });
        });
    }
    
    // Копирование ID
    if (mobileCopyIdBtn) {
        mobileCopyIdBtn.addEventListener('click', () => {
            const id = mobileProfileId?.textContent || '';
            navigator.clipboard.writeText(id);
            showNotification('ID скопирован!');
        });
    }
    
    // Редактирование профиля
    if (mobileEditProfileBtn) {
        mobileEditProfileBtn.addEventListener('click', () => {
            if (editProfileModal) {
                editProfileModal.classList.add('active');
                if (editProfileName) editProfileName.value = currentUser?.displayName || '';
                
                statusOptions.forEach(opt => {
                    opt.classList.remove('active');
                    if (opt.dataset.status === currentUser?.status) {
                        opt.classList.add('active');
                    }
                });
            }
        });
    }
    
    // Выход
    if (mobileLogoutBtn) {
        mobileLogoutBtn.addEventListener('click', logoutUser);
    }
    
    // Настройки
    if (notificationsSwitch) {
        const saved = localStorage.getItem('notifications') !== 'false';
        notificationsSwitch.checked = saved;
        
        notificationsSwitch.addEventListener('change', (e) => {
            localStorage.setItem('notifications', e.target.checked);
        });
    }
    
    if (themeSwitch) {
        const saved = localStorage.getItem('darkTheme') !== 'false';
        themeSwitch.checked = saved;
        
        themeSwitch.addEventListener('change', (e) => {
            if (e.target.checked) {
                document.body.classList.add('dark-theme');
            } else {
                document.body.classList.remove('dark-theme');
            }
            localStorage.setItem('darkTheme', e.target.checked);
        });
    }
}

// Открытие модального окна создания
function openMobileCreateModal() {
    if (!mobileCreateModal) return;
    
    // Сбрасываем форму
    resetMobileCreateForms();
    
    // Показываем модальное окно
    mobileCreateModal.classList.add('active');
    
    // Активируем первую вкладку (группа)
    const options = document.querySelectorAll('.mobile-chat-type-option');
    options.forEach(opt => opt.classList.remove('active'));
    if (options[0]) options[0].classList.add('active');
    
    const groupForm = document.getElementById('mobileGroupForm');
    const privateForm = document.getElementById('mobilePrivateForm');
    const channelForm = document.getElementById('mobileChannelForm');
    
    if (groupForm) groupForm.classList.add('active');
    if (privateForm) privateForm.classList.remove('active');
    if (channelForm) channelForm.classList.remove('active');
}

// Закрытие модального окна создания
function closeMobileCreateModal() {
    if (!mobileCreateModal) return;
    mobileCreateModal.classList.remove('active');
    resetMobileCreateForms();
}

// Сброс форм создания
function resetMobileCreateForms() {
    const groupName = document.getElementById('mobileGroupName');
    const groupDesc = document.getElementById('mobileGroupDescription');
    const privateId = document.getElementById('mobilePrivateUserId');
    const channelName = document.getElementById('mobileChannelName');
    const channelDesc = document.getElementById('mobileChannelDescription');
    const searchResults = document.getElementById('mobilePrivateSearchResults');
    const createBtn = document.getElementById('mobileCreatePrivateBtn');
    
    if (groupName) groupName.value = '';
    if (groupDesc) groupDesc.value = '';
    if (privateId) privateId.value = '';
    if (channelName) channelName.value = '';
    if (channelDesc) channelDesc.value = '';
    if (searchResults) searchResults.innerHTML = '';
    if (createBtn) createBtn.disabled = true;
}

// Поиск пользователей для мобильного
function searchMobileUsers(query) {
    const searchResults = document.getElementById('mobilePrivateSearchResults');
    const createBtn = document.getElementById('mobileCreatePrivateBtn');
    
    if (!searchResults) return;
    
    const results = [];
    
    for (const userId in allUsers) {
        if (userId === currentUser?.uid) continue;
        
        const user = allUsers[userId];
        
        const matchesName = user.displayName && user.displayName.toLowerCase().includes(query.toLowerCase());
        const matchesCustomId = user.customId && user.customId.toLowerCase().includes(query.toLowerCase());
        
        if (matchesName || matchesCustomId) {
            results.push({
                userId: userId,
                displayName: user.displayName,
                customId: user.customId,
                status: user.status || 'offline'
            });
        }
    }
    
    if (results.length === 0) {
        searchResults.innerHTML = `
            <div style="padding: 20px; text-align: center; color: #64748b;">
                <i class="fas fa-user-slash" style="font-size: 24px; margin-bottom: 8px; display: block;"></i>
                Пользователи не найдены
            </div>
        `;
        if (createBtn) createBtn.disabled = true;
        return;
    }
    
    let html = '';
    results.slice(0, 5).forEach(user => {
        html += `
            <div class="mobile-search-result-item" data-user-id="${user.userId}" data-custom-id="${user.customId}">
                <div class="mobile-search-result-avatar">${user.displayName.charAt(0)}</div>
                <div class="mobile-search-result-info">
                    <div class="mobile-search-result-name">${user.displayName}</div>
                    <div class="mobile-search-result-id">${user.customId}</div>
                </div>
            </div>
        `;
    });
    
    searchResults.innerHTML = html;
    
    // Добавляем обработчики клика на результаты
    document.querySelectorAll('.mobile-search-result-item').forEach(item => {
        item.addEventListener('click', () => {
            const customId = item.dataset.customId;
            const input = document.getElementById('mobilePrivateUserId');
            if (input) {
                input.value = customId;
                searchResults.innerHTML = '';
                if (createBtn) createBtn.disabled = false;
            }
        });
    });
    
    if (createBtn) createBtn.disabled = false;
}

// Создание группы из мобильного интерфейса
async function createMobileGroup() {
    const name = document.getElementById('mobileGroupName')?.value.trim();
    const description = document.getElementById('mobileGroupDescription')?.value.trim();
    
    if (!name) {
        showNotification("Введите название группы");
        return;
    }
    
    try {
        const newChat = {
            name: name,
            description: description || '',
            type: 'group',
            createdBy: currentUser.uid,
            createdAt: Date.now(),
            members: {
                [currentUser.uid]: true
            },
            lastMessage: {
                text: "Группа создана",
                timestamp: Date.now(),
                senderId: currentUser.uid
            }
        };
        
        const chatsRef = database.ref('chats');
        const newChatRef = await chatsRef.push(newChat);
        const chatId = newChatRef.key;
        
        const systemMessage = {
            text: `Группа "${name}" создана`,
            senderId: 'system',
            senderName: 'Система',
            timestamp: Date.now(),
            type: 'system'
        };
        
        await database.ref(`messages/${chatId}`).push(systemMessage);
        
        showNotification("Группа успешно создана!");
        closeMobileCreateModal();
        
        // Открываем созданную группу
        openChat(chatId);
        
    } catch (error) {
        console.error("Ошибка создания группы:", error);
        showNotification("Не удалось создать группу");
    }
}

// Создание личного чата из мобильного интерфейса
async function createMobilePrivateChat() {
    const customId = document.getElementById('mobilePrivateUserId')?.value.trim();
    
    if (!customId) {
        showNotification("Введите ID пользователя");
        return;
    }
    
    // Ищем пользователя по customId
    let targetUser = null;
    let targetUserId = null;
    
    for (const userId in allUsers) {
        if (allUsers[userId].customId === customId) {
            targetUser = allUsers[userId];
            targetUserId = userId;
            break;
        }
    }
    
    if (!targetUser) {
        showNotification("Пользователь не найден");
        return;
    }
    
    if (targetUserId === currentUser.uid) {
        showNotification("Вы не можете создать чат с самим собой");
        return;
    }
    
    try {
        // Проверяем существующий чат
        const existingChatId = await findExistingPrivateChat(targetUserId);
        
        if (existingChatId) {
            closeMobileCreateModal();
            openChat(existingChatId);
            return;
        }
        
        // Создаем новый чат
        const newChat = {
            name: `${currentUser.displayName} и ${targetUser.displayName}`,
            type: 'private',
            createdBy: currentUser.uid,
            createdAt: Date.now(),
            members: {
                [currentUser.uid]: true,
                [targetUserId]: true
            },
            lastMessage: {
                text: "Чат создан",
                timestamp: Date.now(),
                senderId: currentUser.uid
            }
        };
        
        const chatsRef = database.ref('chats');
        const newChatRef = await chatsRef.push(newChat);
        const chatId = newChatRef.key;
        
        const systemMessage = {
            text: `Личный чат создан`,
            senderId: 'system',
            senderName: 'Система',
            timestamp: Date.now(),
            type: 'system'
        };
        
        await database.ref(`messages/${chatId}`).push(systemMessage);
        
        showNotification("Личный чат создан!");
        closeMobileCreateModal();
        
        // Открываем созданный чат
        openChat(chatId);
        
    } catch (error) {
        console.error("Ошибка создания личного чата:", error);
        showNotification("Не удалось создать личный чат");
    }
}

// Создание канала из мобильного интерфейса
async function createMobileChannel() {
    const name = document.getElementById('mobileChannelName')?.value.trim();
    const description = document.getElementById('mobileChannelDescription')?.value.trim();
    
    if (!name) {
        showNotification("Введите название канала");
        return;
    }
    
    showNotification("Каналы будут доступны в следующем обновлении");
    closeMobileCreateModal();
    
    // Раскомментируйте когда каналы будут готовы
    /*
    try {
        const newChat = {
            name: name,
            description: description || '',
            type: 'channel',
            createdBy: currentUser.uid,
            createdAt: Date.now(),
            members: {
                [currentUser.uid]: true
            },
            lastMessage: {
                text: "Канал создан",
                timestamp: Date.now(),
                senderId: currentUser.uid
            }
        };
        
        const chatsRef = database.ref('chats');
        const newChatRef = await chatsRef.push(newChat);
        const chatId = newChatRef.key;
        
        const systemMessage = {
            text: `Канал "${name}" создан`,
            senderId: 'system',
            senderName: 'Система',
            timestamp: Date.now(),
            type: 'system'
        };
        
        await database.ref(`messages/${chatId}`).push(systemMessage);
        
        showNotification("Канал успешно создан!");
        closeMobileCreateModal();
        
        openChat(chatId);
        
    } catch (error) {
        console.error("Ошибка создания канала:", error);
        showNotification("Не удалось создать канал");
    }
    */
}

function createMobileChatElement(chat) {
    const element = document.createElement('div');
    element.className = 'mobile-chat-item';
    element.dataset.chatId = chat.id;

    let avatarClass, avatarContent, chatName;

    if (chat.type === 'group') {
        avatarClass = 'mobile-chat-avatar group';
        avatarContent = '<i class="fas fa-users"></i>';
        chatName = chat.name;
    } else {
        avatarClass = 'mobile-chat-avatar private';
        const otherUserId = Object.keys(chat.members).find(id => id !== currentUser?.uid);
        const otherUser = allUsers[otherUserId];
        avatarContent = otherUser ? otherUser.displayName.charAt(0) : '?';
        chatName = otherUser ? otherUser.displayName : "Неизвестный";
    }

    let lastMessageText = "Нет сообщений";
    let lastMessageTime = "";
    
    if (chat.lastMessage) {
        lastMessageText = chat.lastMessage.type === 'photo' ? '📸 Фото' : (chat.lastMessage.text || "Сообщение");
        if (lastMessageText.length > 30) lastMessageText = lastMessageText.substring(0, 30) + '...';
        
        if (chat.lastMessage.timestamp) {
            const time = new Date(chat.lastMessage.timestamp);
            lastMessageTime = time.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        }
    }

    element.innerHTML = `
        <div class="${avatarClass}">
            ${avatarContent}
        </div>
        <div class="mobile-chat-info">
            <div class="mobile-chat-name">${chatName}</div>
            <div class="mobile-chat-last-message">${lastMessageText}</div>
        </div>
        <div class="mobile-chat-time">${lastMessageTime}</div>
    `;

    element.addEventListener('click', () => openChat(chat.id));
    return element;
}

function createMobileContactElement(contact) {
    const element = document.createElement('div');
    element.className = 'mobile-contact-item';
    element.dataset.userId = contact.userId;

    element.innerHTML = `
        <div class="mobile-contact-avatar">
            ${contact.displayName.charAt(0)}
        </div>
        <div class="mobile-contact-info">
            <div class="mobile-contact-name">
                ${contact.displayName}
                ${getVerifiedBadge(contact.userId)}
            </div>
            <div class="mobile-contact-status ${contact.status || 'offline'}">
                <i class="fas fa-circle"></i> ${contact.status || 'offline'}
            </div>
        </div>
    `;

    element.addEventListener('click', () => openOrCreatePrivateChat(contact.userId));
    return element;
}

function updateMobileChats() {
    if (!mobileChatsList) return;
    
    mobileChatsList.innerHTML = '';
    
    if (chats.length === 0) {
        mobileChatsList.innerHTML = `
            <div class="mobile-empty-state">
                <i class="fas fa-comments"></i>
                <h3>Чатов пока нет</h3>
                <p>Нажмите на кнопку + чтобы создать первый чат</p>
            </div>
        `;
        return;
    }
    
    chats.forEach(chat => {
        mobileChatsList.appendChild(createMobileChatElement(chat));
    });
    
    if (chatsCount) chatsCount.textContent = chats.length;
}

function updateMobileContacts() {
    if (!mobileContactsList) return;
    
    mobileContactsList.innerHTML = '';
    
    if (contacts.length === 0) {
        mobileContactsList.innerHTML = `
            <div class="mobile-empty-state">
                <i class="fas fa-user-friends"></i>
                <h3>Контактов пока нет</h3>
                <p>Добавьте контакты, чтобы начать общение</p>
            </div>
        `;
        return;
    }
    
    contacts.forEach(contact => {
        mobileContactsList.appendChild(createMobileContactElement(contact));
    });
    
    if (contactsCount) contactsCount.textContent = contacts.length;
}

function updateMobileProfile() {
    if (!currentUser) return;
    
    if (mobileProfileName) mobileProfileName.textContent = currentUser.displayName;
    if (mobileProfileId) mobileProfileId.textContent = currentUser.customId;
    if (mobileProfileAvatar) mobileProfileAvatar.textContent = currentUser.displayName.charAt(0);
    if (mobileProfileContacts) mobileProfileContacts.textContent = contacts.length;
    if (mobileProfileChats) mobileProfileChats.textContent = chats.length;
    if (mobileProfileJoinDate) mobileProfileJoinDate.textContent = currentUser.joinDate;
    
    if (mobileProfileStatus) {
        const status = currentUser.status === 'offline' ? 'offline' : 'online';
        mobileProfileStatus.innerHTML = `<i class="fas fa-circle"></i> ${status}`;
        mobileProfileStatus.style.color = status === 'online' ? '#10b981' : '#64748b';
    }
}

// ================================================
// ПРОВЕРКА ПОЗИЦИИ ПРОКРУТКИ
// ================================================
function isUserNearBottom() {
    if (!messagesContainer) return false;
    
    const threshold = 100;
    const scrollBottom = messagesContainer.scrollHeight - messagesContainer.scrollTop - messagesContainer.clientHeight;
    
    return scrollBottom < threshold;
}

function scrollToLastMessage(behavior = 'smooth') {
    if (!messagesContainer) return;
    
    setTimeout(() => {
        messagesContainer.scrollTo({
            top: messagesContainer.scrollHeight,
            behavior: behavior
        });
    }, 50);
}

function scrollToMessage(messageId) {
    const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
    if (messageElement) {
        messageElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
        
        messageElement.style.background = 'rgba(139, 92, 246, 0.3)';
        messageElement.style.transition = 'background 2s';
        
        setTimeout(() => {
            messageElement.style.background = '';
        }, 2000);
    }
}

function createScrollToBottomButton() {
    if (document.getElementById('scroll-to-bottom-btn')) return;
    
    const btn = document.createElement('button');
    btn.id = 'scroll-to-bottom-btn';
    btn.className = 'scroll-to-bottom-btn';
    btn.innerHTML = '<i class="fas fa-arrow-down"></i>';
    btn.title = 'Прокрутить вниз';
    
    btn.addEventListener('click', () => {
        scrollToLastMessage('smooth');
        hideScrollToBottomButton();
    });
    
    document.body.appendChild(btn);
}

function showScrollToBottomButton() {
    let btn = document.getElementById('scroll-to-bottom-btn');
    if (!btn) {
        createScrollToBottomButton();
        btn = document.getElementById('scroll-to-bottom-btn');
    }
    
    if (btn) {
        btn.classList.add('visible');
    }
}

function hideScrollToBottomButton() {
    const btn = document.getElementById('scroll-to-bottom-btn');
    if (btn) {
        btn.classList.remove('visible');
    }
}

function setupScrollListener() {
    if (!messagesContainer) return;
    
    messagesContainer.addEventListener('scroll', () => {
        const isNearBottom = isUserNearBottom();
        
        if (isNearBottom) {
            hideScrollToBottomButton();
        } else {
            if (messagesContainer.children.length > 0) {
                showScrollToBottomButton();
            }
        }
    });
}

// ================================================
// АВТОРИЗАЦИЯ
// ================================================
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

// ================================================
// ЗАГРУЗКА ДАННЫХ ПОЛЬЗОВАТЕЛЯ
// ================================================
async function loadUserData(userId) {
    try {
        setLoading(true);
        cleanupListeners();
    
        const userRef = database.ref(`users/${userId}`);
        const snapshot = await userRef.once('value');
    
        if (snapshot.exists()) {
            currentUser = {
                uid: userId,
                ...snapshot.val()
            };
            
            await userRef.update({
                lastActive: Date.now()
            });
            
            currentUser.status = "online";
            
            await loadAllUsers();
            setupVerifiedUsersListener();
            
            const contactsSnapshot = await database.ref(`users/${userId}/contacts`).once('value');
            updateContactsList(contactsSnapshot);
            
            const chatsSnapshot = await database.ref('chats')
                .orderByChild(`members/${userId}`)
                .equalTo(true)
                .once('value');
            updateChatsList(chatsSnapshot);
            
            setupContactsListener();
            setupChatsListener();
            
        } else {
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
            await loadAllUsers();
            setupVerifiedUsersListener();
            setupContactsListener();
            setupChatsListener();
        }
    
        initializeInterface();
        setLoading(false);
    
    } catch (error) {
        console.error("Ошибка загрузки данных:", error);
        showNotification("Ошибка загрузки данных. Попробуйте обновить страницу.");
        setLoading(false);
    }
}

async function loadAllUsers() {
    try {
        const usersRef = database.ref('users');
        const snapshot = await usersRef.once('value');
        const usersData = snapshot.val();
    
        if (usersData) {
            allUsers = {};
            
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
        console.error("Ошибка загрузки пользователей:", error);
    }
}

function setupVerifiedUsersListener() {
    if (!currentUser) return;
    
    const verifiedRef = database.ref('verifiedUsers');
    
    if (verifiedUsersListener) {
        verifiedRef.off('value', verifiedUsersListener);
    }
    
    verifiedUsersListener = verifiedRef.on('value', (snapshot) => {
        verifiedUsers = snapshot.val() || {};
        updateAdminButtonVisibility();
        
        if (currentChatId) {
            loadMessages(currentChatId);
            updateChatHeader();
        }
        
        updateMobileContacts();
        updateDesktopContacts();
        updateHomeContacts();
    });
}

function updateAdminButtonVisibility() {
    if (!adminPanelBtn) return;
    
    if (currentUser && verifiedUsers && verifiedUsers[currentUser.uid] && 
        verifiedUsers[currentUser.uid].type === 'admin') {
        adminPanelBtn.style.display = 'flex';
    } else {
        adminPanelBtn.style.display = 'none';
    }
}

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
            badgeHtml += '<i class="fas fa-handshake verified-icon partner"></i>';
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

// ================================================
// СЛУШАТЕЛИ
// ================================================
function cleanupListeners() {
    if (contactsListener !== null && currentUser) {
        const contactsRef = database.ref(`users/${currentUser.uid}/contacts`);
        contactsRef.off('value', contactsListener);
        contactsListener = null;
    }
    
    if (chatsListener !== null) {
        const chatsRef = database.ref('chats');
        chatsRef.off('value', chatsListener);
        chatsListener = null;
    }
    
    Object.values(messageListeners).forEach(unsubscribe => {
        if (typeof unsubscribe === 'function') {
            unsubscribe();
        }
    });
    messageListeners = {};
    
    Object.values(typingListeners).forEach(unsubscribe => {
        if (typeof unsubscribe === 'function') {
            unsubscribe();
        }
    });
    typingListeners = {};
}

function setupContactsListener() {
    if (!currentUser) return;
    
    const contactsRef = database.ref(`users/${currentUser.uid}/contacts`);
    
    if (contactsListener) {
        contactsRef.off('value', contactsListener);
    }
    
    contactsListener = contactsRef.on('value', (snapshot) => {
        updateContactsList(snapshot);
        updateContactsDisplay();
    });
}

function setupChatsListener() {
    if (!currentUser) return;
    
    const chatsRef = database.ref('chats');
    
    if (chatsListener) {
        chatsRef.off('value', chatsListener);
    }
    
    chatsListener = chatsRef.orderByChild(`members/${currentUser.uid}`).equalTo(true)
        .on('value', (snapshot) => {
            updateChatsList(snapshot);
            updateChatsDisplay();
        });
}

function updateContactsList(snapshot) {
    const contactsData = snapshot.val();
    
    if (!contactsData || typeof contactsData !== 'object') {
        contacts = [];
        return;
    }
    
    const newContacts = [];
    
    Object.keys(contactsData).forEach(userId => {
        const contactData = contactsData[userId];
        const user = allUsers[userId];
        
        const contact = {
            userId: userId,
            displayName: user ? user.displayName : (contactData.displayName || "Неизвестный пользователь"),
            customId: user ? user.customId : (contactData.customId || `user_${userId.substr(0, 8)}`),
            status: user ? user.status : (contactData.status || 'offline'),
            lastActive: user ? user.lastActive : (contactData.lastActive || 0),
            addedAt: contactData.addedAt || Date.now()
        };
        
        newContacts.push(contact);
    });
    
    contacts = newContacts;
}

function updateChatsList(snapshot) {
    chats = [];
    
    const chatsData = snapshot.val();
    
    if (chatsData) {
        Object.keys(chatsData).forEach(chatId => {
            const chat = chatsData[chatId];
            chat.id = chatId;
            
            if (!messageListeners[chatId]) {
                setupChatListener(chatId);
            }
            
            chats.push(chat);
        });
        
        chats.sort((a, b) => {
            const timeA = a.lastMessage ? a.lastMessage.timestamp : a.createdAt;
            const timeB = b.lastMessage ? b.lastMessage.timestamp : b.createdAt;
            return timeB - timeA;
        });
    }
}

function setupChatListener(chatId) {
    if (messageListeners[chatId]) {
        messageListeners[chatId]();
    }

    const messagesRef = database.ref(`messages/${chatId}`).orderByChild('timestamp').limitToLast(1);

    messageListeners[chatId] = messagesRef.on('value', (snapshot) => {
        updateChatsDisplay();
    });
}

function updateChatsDisplay() {
    updateHomeChats();
    updateDesktopChats();
    updateMobileChats();
    updateProfileChatsCount();
}

function updateContactsDisplay() {
    updateHomeContacts();
    updateDesktopContacts();
    updateMobileContacts();
    updateProfileContactsCount();
    updateMobileProfile();
}

// ================================================
// ФУНКЦИИ ПОИСКА
// ================================================
function searchUsers(query, currentContacts = []) {
    query = query.toLowerCase().trim();
    
    if (!query || query.length < 1) {
        return [];
    }
    
    const results = [];
    
    for (const userId in allUsers) {
        if (userId === currentUser?.uid) continue;
        
        const user = allUsers[userId];
        
        const matchesName = user.displayName && user.displayName.toLowerCase().includes(query);
        const matchesCustomId = user.customId && user.customId.toLowerCase().includes(query);
        const matchesUserId = userId.toLowerCase().includes(query);
        
        if (matchesName || matchesCustomId || matchesUserId) {
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
    
    results.sort((a, b) => {
        if (a.status === 'online' && b.status !== 'online') return -1;
        if (a.status !== 'online' && b.status === 'online') return 1;
        if (!a.isContact && b.isContact) return -1;
        if (a.isContact && !b.isContact) return 1;
        return a.displayName.localeCompare(b.displayName);
    });
    
    return results;
}

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
        
        const addBtn = resultItem.querySelector('.add-user-btn');
        if (!result.isContact) {
            addBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                await addContact(result.customId);
                result.isContact = true;
                displaySearchResults(results, containerId, currentContacts);
            });
        }
        
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

function hideSearchResults(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.classList.remove('active');
    }
}

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

function setupContactSearch() {
    if (!contactSearch) return;
    
    contactSearch.addEventListener('input', function() {
        const query = this.value.trim();
        
        if (searchTimeouts.modalSearch) {
            clearTimeout(searchTimeouts.modalSearch);
        }
        
        if (query.length < 1) {
            hideSearchResults('contactSearchResults');
            setSearchLoading('contactSearch', false);
            if (confirmAddContactBtn) confirmAddContactBtn.disabled = true;
            return;
        }
        
        setSearchLoading('contactSearch', true);
        
        searchTimeouts.modalSearch = setTimeout(() => {
            const searchResults = searchUsers(query, contacts);
            displaySearchResults(searchResults, 'contactSearchResults', contacts);
            setSearchLoading('contactSearch', false);
            
            if (confirmAddContactBtn) {
                confirmAddContactBtn.disabled = searchResults.length === 0 || !searchResults.some(r => !r.isContact);
            }
        }, 300);
    });
    
    document.addEventListener('click', (e) => {
        if (contactSearch && !contactSearch.contains(e.target) && 
            contactSearchResults && !contactSearchResults.contains(e.target)) {
            hideSearchResults('contactSearchResults');
        }
    });
}

function setupHomeContactsSearch() {
    if (!homeContactsSearch) return;
    
    homeContactsSearch.addEventListener('input', function() {
        const query = this.value.trim();
        
        if (searchTimeouts.homeSearch) {
            clearTimeout(searchTimeouts.homeSearch);
        }
        
        if (query.length < 1) {
            hideSearchResults('homeContactsSearchResults');
            setSearchLoading('homeContactsSearch', false);
            return;
        }
        
        setSearchLoading('homeContactsSearch', true);
        
        searchTimeouts.homeSearch = setTimeout(() => {
            const searchResults = searchUsers(query, contacts);
            displaySearchResults(searchResults, 'homeContactsSearchResults', contacts);
            setSearchLoading('homeContactsSearch', false);
        }, 300);
    });
    
    document.addEventListener('click', (e) => {
        if (!homeContactsSearch?.contains(e.target) && 
            !document.getElementById('homeContactsSearchResults')?.contains(e.target)) {
            hideSearchResults('homeContactsSearchResults');
        }
    });
}

// ================================================
// ОТПРАВКА СООБЩЕНИЙ
// ================================================
async function sendMessage() {
    if (selectedPhoto) {
        await sendPhoto();
        return;
    }
    
    const text = messageInput?.value.trim();
    if (!text || !currentChatId) return;

    try {
        const wasNearBottom = isUserNearBottom();
    
        const newMessage = {
            text: text,
            senderId: currentUser.uid,
            senderName: currentUser.displayName || "Пользователь",
            timestamp: Date.now(),
            type: "text"
        };
    
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
    
        if (messageInput) {
            messageInput.value = '';
        }
        
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
                text: text.length > 50 ? text.substring(0, 50) + '...' : text,
                timestamp: Date.now(),
                senderId: currentUser.uid,
                type: "text"
            },
            updatedAt: Date.now()
        });
    
        if (wasNearBottom) {
            setTimeout(() => {
                scrollToLastMessage('smooth');
            }, 100);
        } else {
            showScrollToBottomButton();
        }
        
    } catch (error) {
        console.error("Ошибка при отправке сообщения:", error);
        showNotification("Не удалось отправить сообщение. Попробуйте еще раз.");
    }
}

async function sendPhoto() {
    if (!selectedPhoto || !currentChatId) return;
    
    try {
        showPhotoProgress(0);
        
        const base64 = await fileToBase64WithProgress(selectedPhoto, (progress) => {
            showPhotoProgress(Math.round(progress * 50));
        });
        
        showPhotoProgress(50);
        
        const optimizedBase64 = await optimizeImage(base64, 1024, 1024);
        
        showPhotoProgress(70);
        
        const wasNearBottom = isUserNearBottom();
        
        const photoMessage = {
            text: `📸 ${selectedPhoto.name}`,
            senderId: currentUser.uid,
            senderName: currentUser.displayName || "Пользователь",
            timestamp: Date.now(),
            type: "photo",
            photo: optimizedBase64,
            photoName: selectedPhoto.name,
            photoSize: selectedPhoto.size
        };
        
        showPhotoProgress(85);
        
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
        
        const messagesRef = database.ref(`messages/${currentChatId}`);
        await messagesRef.push(photoMessage);
        
        showPhotoProgress(100);
        
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
        
        clearPhotoPreview();
        hideReplyPreview();
        replyToMessage = null;
        
        if (wasNearBottom) {
            setTimeout(() => {
                scrollToLastMessage('smooth');
            }, 100);
        } else {
            showScrollToBottomButton();
        }
        
        setTimeout(hidePhotoProgress, 1000);
        
    } catch (error) {
        console.error("Ошибка при отправке фото:", error);
        hidePhotoProgress();
    }
}

function fileToBase64WithProgress(file, onProgress) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.onprogress = (e) => {
            if (e.lengthComputable && onProgress) {
                onProgress(e.loaded / e.total);
            }
        };
        
        reader.readAsDataURL(file);
    });
}

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
            
            resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
    });
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
        photoPreviewSize.innerHTML = `<i class="fas fa-image"></i> ${size} KB`;
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
        
        const MAX_SIZE = 2 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            showNotification('❌ Файл слишком большой. Максимум: 2MB');
            return;
        }
        
        if (!file.type.startsWith('image/')) {
            showNotification('❌ Пожалуйста, выберите изображение');
            return;
        }
        
        showPhotoPreview(file);
    });
    
    if (photoPreviewRemove) {
        photoPreviewRemove.addEventListener('click', () => {
            clearPhotoPreview();
            fileInput.value = '';
        });
    }
}

// ================================================
// РЕАКЦИИ
// ================================================
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
                userName: currentUser.displayName || "Пользователь"
            };
            
            await reactionRef.set(reactionData);
            
            const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
            if (messageElement) {
                messageElement.style.transform = 'scale(1.02)';
                setTimeout(() => {
                    messageElement.style.transform = 'scale(1)';
                }, 200);
            }
        }
        
        updateMessageReactions(messageId);
        
    } catch (error) {
        console.error("Ошибка при работе с реакцией:", error);
        showNotification("Не удалось добавить реакцию");
    }
}

function updateMessageReactions(messageId) {
    const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
    if (!messageElement) return;
    
    const messageContent = messageElement.querySelector('.message-content');
    if (!messageContent) return;
    
    const messageRef = database.ref(`messages/${currentChatId}/${messageId}`);
    messageRef.once('value').then((snapshot) => {
        if (!snapshot.exists()) return;
        
        const message = snapshot.val();
        
        const oldReactionsContainer = messageElement.querySelector('.message-reactions');
        if (oldReactionsContainer) {
            oldReactionsContainer.remove();
        }
        
        if (!message.reactions || Object.keys(message.reactions).length === 0) {
            return;
        }
        
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
        
        let reactionsHtml = '<div class="message-reactions">';
        
        Object.entries(reactionStats).forEach(([emoji, data]) => {
            const isMyReaction = data.users.includes(currentUser.uid);
            const badgeClass = isMyReaction ? 'reaction-badge active my-reaction' : 'reaction-badge';
            
            reactionsHtml += `
                <div class="${badgeClass}" data-emoji="${emoji}" data-message-id="${messageId}">
                    <span class="reaction-emoji">${emoji}</span>
                    <span class="reaction-count">${data.count}</span>
                </div>
            `;
        });
        
        reactionsHtml += '</div>';
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = reactionsHtml;
        messageContent.appendChild(tempDiv.firstChild);
        
        const newReactionBadges = messageContent.querySelectorAll('.reaction-badge');
        newReactionBadges.forEach(badge => {
            badge.addEventListener('click', (e) => {
                e.stopPropagation();
                const emoji = badge.dataset.emoji;
                const msgId = badge.dataset.messageId;
                if (currentChatId && msgId && emoji && currentUser) {
                    toggleReaction(msgId, emoji);
                }
            });
        });
    });
}

function setupReactionsHandlers() {
    document.addEventListener('click', function(e) {
        const reactionOption = e.target.closest('.reaction-option');
        
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

// ================================================
// СООБЩЕНИЯ
// ================================================
function createMessageElement(message) {
    const messageElement = document.createElement('div');
    const isOutgoing = message.senderId === currentUser?.uid;
    
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

    let photoHtml = '';
    if (message.type === 'photo' && message.photo) {
        photoHtml = `
            <img src="${message.photo}" class="message-photo" alt="Photo" loading="lazy" onclick="showFullPhoto('${message.photo}')">
        `;
    }

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
                <span class="message-sender-name" onclick="openUserProfileModal('${message.senderId}')">
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
    
    messageElement.addEventListener('dblclick', (e) => {
        if (e.target.closest('.message-reactions') || e.target.closest('.reaction-badge') || e.target.closest('.message-photo')) {
            return;
        }
        
        if (currentChatId && message.id && currentUser) {
            toggleReaction(message.id, '❤️');
        }
    });
    
    const reactionBadges = messageElement.querySelectorAll('.reaction-badge');
    reactionBadges.forEach(badge => {
        badge.addEventListener('click', (e) => {
            e.stopPropagation();
            const emoji = badge.dataset.emoji;
            const msgId = badge.dataset.messageId;
            if (currentChatId && msgId && emoji && currentUser) {
                toggleReaction(msgId, emoji);
            }
        });
    });
    
    messageElement.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        showMessageContextMenu(e, message, isOutgoing);
    });

    if (message.replyTo) {
        const replyElement = messageElement.querySelector('.message-reply');
        replyElement?.addEventListener('click', () => {
            const repliedMessageId = replyElement.dataset.replyTo;
            scrollToMessage(repliedMessageId);
        });
    }

    return messageElement;
}

function loadMessages(chatId) {
    if (!messagesContainer) return;
    
    messagesContainer.innerHTML = '';

    try {
        const messagesRef = database.ref(`messages/${chatId}`)
            .orderByChild('timestamp');

        messagesRef.once('value').then((snapshot) => {
            const messagesData = snapshot.val();
        
            if (messagesData) {
                const messagesArray = Object.keys(messagesData).map(key => ({
                    id: key,
                    ...messagesData[key]
                }));
                
                messagesArray.sort((a, b) => a.timestamp - b.timestamp);
                
                messagesArray.forEach(message => {
                    const messageElement = createMessageElement(message);
                    messagesContainer.appendChild(messageElement);
                });

                setTimeout(() => {
                    scrollToLastMessage('auto');
                    hideScrollToBottomButton();
                }, 100);
                
            } else {
                showWelcomeMessage();
            }
        }).catch(error => {
            console.error("Ошибка загрузки сообщений:", error);
            showWelcomeMessage();
        });
    
        listenToNewMessages(chatId);
        setupScrollListener();
    
    } catch (error) {
        console.error("Ошибка загрузки сообщений:", error);
        showWelcomeMessage();
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
            
            if (!document.querySelector(`[data-message-id="${message.id}"]`)) {
                const messageElement = createMessageElement(message);
                
                if (messagesContainer) {
                    messagesContainer.appendChild(messageElement);
                    
                    const wasNearBottom = isUserNearBottom();
                    
                    if (wasNearBottom) {
                        setTimeout(() => {
                            scrollToLastMessage('smooth');
                        }, 50);
                    } else {
                        showScrollToBottomButton();
                    }
                }
            }
        });
    
    messageListeners[chatId] = callback;
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

// ================================================
// КОНТЕКСТНОЕ МЕНЮ ОБРАБОТЧИКИ
// ================================================
if (contextReply) {
    contextReply.addEventListener('click', () => {
        const messageId = messageContextMenu?.dataset.messageId;
        if (!messageId) return;

        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        if (!messageElement) return;

        const messageText = messageElement.querySelector('.message-text')?.textContent || '';
        const senderNameElement = messageElement.querySelector('.message-sender-name');
        const senderName = senderNameElement?.textContent?.split(' ')[0] || '';
        
        if (!currentChatId || !messageId) return;
        
        const messageRef = database.ref(`messages/${currentChatId}/${messageId}`);
        messageRef.once('value').then((snapshot) => {
            if (snapshot.exists()) {
                const messageData = snapshot.val();
                
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
        const messageId = messageContextMenu?.dataset.messageId;
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
        const messageId = messageContextMenu?.dataset.messageId;
        const isOutgoing = messageContextMenu?.dataset.isOutgoing === 'true';

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
        const senderName = messageElement.querySelector('.message-sender-name')?.textContent?.split(' ')[0] || '';
        const timeElement = messageElement.querySelector('.message-time');
        const timestamp = timeElement ? new Date().getTime() : Date.now();
        
        showDeleteMessageConfirmation(messageId, currentChatId, messageText, senderName, timestamp);
    });
}

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
    
    setTimeout(() => {
        messageInput?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
}

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

// ================================================
// ФУНКЦИИ ЧАТА
// ================================================
function openChat(chatId) {
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return;

    currentChatId = chatId;
    replyToMessage = null;
    hideReplyPreview();

    if (isMobile) {
        if (homeScreen) {
            homeScreen.style.display = 'none';
        }
        if (chatScreen) {
            chatScreen.style.display = 'flex';
            chatScreen.classList.add('mobile', 'active');
            chatScreen.classList.remove('desktop');
        }
        if (desktopEmptyScreen) desktopEmptyScreen.style.display = 'none';
        
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
        const otherUserId = Object.keys(chat.members).find(id => id !== currentUser?.uid);
        const otherUser = allUsers[otherUserId];
        
        chatName = otherUser ? otherUser.displayName : "Неизвестный пользователь";
        chatDescription = "Личный чат";
        avatarContent = otherUser ? otherUser.displayName.charAt(0) : '?';
        
        chatHeaderBadge = getVerifiedBadge(otherUserId);
    } else {
        chatName = chat.name;
        chatDescription = chat.description || `Групповой чат`;
        avatarContent = '<i class="fas fa-users"></i>';
    }

    if (isMobile) {
        if (chatHeaderName) {
            chatHeaderName.innerHTML = `<span class="chat-header-name-with-badge">${chatName} ${chatHeaderBadge}</span>`;
        }
        if (chatHeaderDescription) chatHeaderDescription.textContent = chatDescription;
        if (chatHeaderDesktop) chatHeaderDesktop.style.display = 'none';
        if (chatHeaderMobile) chatHeaderMobile.style.display = 'flex';
    } else {
        if (desktopChatHeaderName) {
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
    
    setTimeout(() => {
        hideScrollToBottomButton();
    }, 500);
    
    updateChatHeader();
    focusMessageInput();
}

function showHomeScreen() {
    currentChatId = null;
    replyToMessage = null;
    hideReplyPreview();
    
    if (isMobile) {
        if (chatScreen) {
            chatScreen.style.display = 'none';
        }
        if (homeScreen) {
            homeScreen.style.display = 'block';
        }
        if (desktopEmptyScreen) desktopEmptyScreen.style.display = 'none';
        
        document.querySelectorAll('.chat-item').forEach(item => {
            item.classList.remove('active');
        });
    } else {
        if (chatScreen) {
            chatScreen.style.display = 'none';
            chatScreen.classList.remove('active');
        }
        if (desktopEmptyScreen) {
            desktopEmptyScreen.style.display = 'flex';
        }
        
        document.querySelectorAll('.desktop-chat-item').forEach(item => {
            item.classList.remove('active');
        });
    }
}

function updateChatHeader() {
    if (!currentChatId) return;
    
    const chat = chats.find(c => c.id === currentChatId);
    if (!chat) return;
    
    if (chat.type === 'private') {
        const otherUserId = Object.keys(chat.members).find(id => id !== currentUser?.uid);
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
        console.error("Ошибка создания чата:", error);
        showNotification("Не удалось создать личный чат. Попробуйте еще раз.");
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
    
        chats.push(newChat);
        updateChatsDisplay();
        
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
    
        openChat(chatId);
        focusMessageInput();
    
    } catch (error) {
        console.error("Ошибка создания чата:", error);
        showNotification("Не удалось создать чат. Попробуйте еще раз.");
    }
}

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

function focusMessageInput() {
    if (messageInput) {
        setTimeout(() => {
            messageInput.focus();
            if (isMobile) {
                messageInput.click();
            }
        }, 300);
    }
}

// ================================================
// КОНТАКТЫ
// ================================================
async function addContact(targetCustomId) {
    try {
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

        const alreadyInContacts = contacts.some(contact => contact.userId === actualUserId);
        if (alreadyInContacts) {
            showNotification("Этот пользователь уже у вас в контактах");
            return;
        }

        const contactRef = database.ref(`users/${currentUser.uid}/contacts/${actualUserId}`);
        const contactSnapshot = await contactRef.once('value');
        
        if (contactSnapshot.exists()) {
            showNotification("Этот пользователь уже у вас в контактах");
            return;
        }

        const contactData = {
            displayName: targetUser.displayName,
            customId: targetUser.customId,
            status: targetUser.status,
            lastActive: targetUser.lastActive || Date.now(),
            addedAt: Date.now()
        };

        await contactRef.set(contactData);
        
        showNotification(`Пользователь ${targetUser.displayName} добавлен в контакты!`);

    } catch (error) {
        console.error("Ошибка при добавлении контакта:", error);
        showNotification("Не удалось добавить контакт: " + error.message);
    }
}

// ================================================
// ОБНОВЛЕНИЕ ИНТЕРФЕЙСА
// ================================================
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
    
    const sortedContacts = [...contacts].sort((a, b) => {
        if (a.status === 'online' && b.status !== 'online') return -1;
        if (a.status !== 'online' && b.status === 'online') return 1;
        return a.displayName.localeCompare(b.displayName);
    });
    
    sortedContacts.forEach(contact => {
        const contactElement = createContactElement(contact);
        homeContactsList.appendChild(contactElement);
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
    } else {
        avatarClass = 'private-avatar';
    
        const otherUserId = Object.keys(chat.members).find(id => id !== currentUser?.uid);
        const otherUser = allUsers[otherUserId];
    
        if (otherUser) {
            avatarContent = otherUser.displayName.charAt(0);
            chatName = otherUser.displayName;
        } else {
            avatarContent = '?';
            chatName = "Неизвестный пользователь";
        }
    }

    let lastMessageText = "Нет сообщений";
    let lastMessageTime = "";
    
    if (chat.lastMessage) {
        lastMessageText = chat.lastMessage.type === 'photo' ? '📸 Фото' : (chat.lastMessage.text || "Сообщение");
        if (lastMessageText.length > 30) lastMessageText = lastMessageText.substring(0, 30) + '...';
        
        if (chat.lastMessage.timestamp) {
            const time = new Date(chat.lastMessage.timestamp);
            lastMessageTime = time.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        }
    }

    chatElement.innerHTML = `
        <div class="chat-avatar ${avatarClass}">
            ${avatarContent}
        </div>
        <div class="chat-info">
            <div class="chat-name">${chatName}</div>
            <div class="last-message">${lastMessageText}</div>
        </div>
        <div class="chat-meta">
            <div class="chat-time">${lastMessageTime}</div>
        </div>
    `;
    
    chatElement.addEventListener('click', () => {
        openChat(chat.id);
    });

    return chatElement;
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
            <div class="contact-name" onclick="openUserProfileModal('${contact.userId}')">
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
    } else {
        avatarClass = 'desktop-chat-avatar';
    
        const otherUserId = Object.keys(chat.members).find(id => id !== currentUser?.uid);
        const otherUser = allUsers[otherUserId];
    
        if (otherUser) {
            avatarContent = otherUser.displayName.charAt(0);
            chatName = otherUser.displayName;
        } else {
            avatarContent = '?';
            chatName = "Неизвестный пользователь";
        }
    }

    let lastMessageText = "Нет сообщений";
    let lastMessageTime = "";
    
    if (chat.lastMessage) {
        lastMessageText = chat.lastMessage.type === 'photo' ? '📸 Фото' : (chat.lastMessage.text || "Сообщение");
        if (lastMessageText.length > 30) lastMessageText = lastMessageText.substring(0, 30) + '...';
        
        if (chat.lastMessage.timestamp) {
            const time = new Date(chat.lastMessage.timestamp);
            lastMessageTime = time.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        }
    }

    const displayText = lastMessageTime ? 
        `${lastMessageTime} • ${lastMessageText}` : 
        lastMessageText;

    chatElement.innerHTML = `
        <div class="${avatarClass}" style="background: ${chat.type === 'group' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)'}">
            ${avatarContent}
        </div>
        <div class="desktop-chat-info">
            <div class="desktop-chat-name">${chatName}</div>
            <div class="desktop-chat-last-message">${displayText}</div>
        </div>
    `;
    
    chatElement.addEventListener('click', () => {
        openChat(chat.id);
    });

    return chatElement;
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
// ПРОФИЛЬ
// ================================================
function openProfileModal() {
    if (!profileModal || !currentUser) return;
    
    if (profileName) {
        const badgeHtml = getVerifiedBadge(currentUser.uid);
        profileName.innerHTML = `<span class="profile-name-with-badge">${currentUser.displayName} ${badgeHtml}</span>`;
    }
    
    if (profileUserId) profileUserId.textContent = currentUser.customId;
    
    const profileAvatarLarge = document.getElementById('profileAvatarLarge');
    if (profileAvatarLarge) profileAvatarLarge.textContent = currentUser.displayName.charAt(0);
    
    const statusToShow = currentUser.status === "offline" ? "offline" : "online";
    const profileStatus = document.getElementById('profileStatus');
    if (profileStatus) {
        profileStatus.textContent = statusToShow;
        profileStatus.className = `profile-status ${statusToShow}`;
    }
    
    const profileJoinDate = document.getElementById('profileJoinDate');
    if (profileJoinDate) profileJoinDate.textContent = currentUser.joinDate;

    updateProfileContactsCount();
    updateProfileChatsCount();
    
    profileModal.classList.add('active');
    
    if (isMobile) {
        // Ничего не делаем, используем новый интерфейс
    }
}

function openUserProfileModal(userId) {
    if (!userId || !allUsers[userId]) return;
    
    const user = allUsers[userId];
    const badgeHtml = getVerifiedBadge(userId);
    
    const userProfileModal = document.createElement('div');
    userProfileModal.className = 'modal-overlay active';
    userProfileModal.id = 'userProfileModal';
    
    let currentStatus = user.status || 'offline';
    
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
    
    const unsubscribe = subscribeToUserStatus(userId, (newStatus) => {
        if (newStatus) {
            currentStatus = newStatus;
            updateStatusDisplay(newStatus);
        }
    });
    
    const lastActiveRef = database.ref(`users/${userId}/lastActive`);
    const lastActiveListener = lastActiveRef.on('value', (snapshot) => {
        const lastActive = snapshot.val();
        const lastActiveElement = document.getElementById(`lastActive-${userId}`);
        if (lastActiveElement) {
            lastActiveElement.textContent = formatLastActive(lastActive);
        }
    });
    
    userProfileModal.addEventListener('click', (e) => {
        if (e.target === userProfileModal) {
            unsubscribe();
            lastActiveRef.off('value', lastActiveListener);
            userProfileModal.remove();
        }
    });
    
    const closeBtn = userProfileModal.querySelector('.modal-close');
    closeBtn?.addEventListener('click', () => {
        unsubscribe();
        lastActiveRef.off('value', lastActiveListener);
    });
}

function subscribeToUserStatus(userId, callback) {
    const statusRef = database.ref(`users/${userId}/status`);
    
    const listener = statusRef.on('value', (snapshot) => {
        const status = snapshot.val();
        callback(status);
    });
    
    return () => statusRef.off('value', listener);
}

function formatLastActive(timestamp) {
    if (!timestamp) return 'неизвестно';
    
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) {
        return 'только что';
    }
    if (diff < 3600000) {
        const minutes = Math.floor(diff / 60000);
        return `${minutes} ${minutes === 1 ? 'минуту' : 'минут'} назад`;
    }
    if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000);
        return `${hours} ${hours === 1 ? 'час' : 'часов'} назад`;
    }
    
    return new Date(timestamp).toLocaleDateString('ru-RU');
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
        updateMobileProfile();
    
    } catch (error) {
        console.error("Ошибка обновления профиля:", error);
        showNotification("Не удалось обновить профиль. Попробуйте еще раз.");
    }
}

function updateUserProfileDisplay() {
    if (!currentUser) return;

    if (profileName) profileName.textContent = currentUser.displayName;
    if (profileUserId) profileUserId.textContent = currentUser.customId;
    const profileAvatarLarge = document.getElementById('profileAvatarLarge');
    if (profileAvatarLarge) profileAvatarLarge.textContent = currentUser.displayName.charAt(0);
    
    const statusToShow = currentUser.status === "offline" ? "offline" : "online";
    const profileStatus = document.getElementById('profileStatus');
    if (profileStatus) {
        profileStatus.textContent = statusToShow;
        profileStatus.className = `profile-status ${statusToShow}`;
    }
    
    const profileJoinDate = document.getElementById('profileJoinDate');
    if (profileJoinDate) profileJoinDate.textContent = currentUser.joinDate;

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
            const originalIcon = element.nextElementSibling?.innerHTML;
            if (element.nextElementSibling) {
                element.nextElementSibling.innerHTML = '<i class="fas fa-check"></i>';
                element.nextElementSibling.style.color = '#10b981';
            
                setTimeout(() => {
                    element.nextElementSibling.innerHTML = originalIcon;
                    element.nextElementSibling.style.color = '';
                }, 2000);
            }
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

// ================================================
// ПК ИНТЕРФЕЙС
// ================================================
function updateDesktopUserInfo() {
    if (!currentUser) return;
    
    if (desktopUserAvatar) {
        desktopUserAvatar.textContent = currentUser.displayName.charAt(0);
        desktopUserAvatar.className = 'desktop-user-avatar';
        desktopUserAvatar.classList.add(`status-${currentUser.status === "offline" ? "offline" : "online"}`);
    }
    
    if (desktopUserName) desktopUserName.textContent = currentUser.displayName;
    
    if (desktopUserStatus) {
        let statusIcon = 'fa-circle';
        let statusColor = '#10b981';
        let statusText = 'online';
        
        if (currentUser.status === "offline") {
            statusIcon = 'fa-circle';
            statusColor = '#64748b';
            statusText = 'offline';
        } else {
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

// ================================================
// УВЕДОМЛЕНИЯ
// ================================================
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

// ================================================
// ФУНКЦИИ ПОДТВЕРЖДЕНИЯ
// ================================================
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
                console.error("Ошибка удаления:", error);
                showNotification("Не удалось удалить сообщение");
                confirmDeleteMessageModal.classList.remove('active');
            }
        };
    }
}

// ================================================
// АДМИН-ПАНЕЛЬ
// ================================================
function setupAdminPanel() {
    if (!adminPanelBtn || !adminPanelModal) return;
    
    adminPanelBtn.addEventListener('click', () => {
        adminPanelModal.classList.add('active');
        loadVerifiedUsersList();
    });
    
    if (closeAdminPanel) {
        closeAdminPanel.addEventListener('click', () => {
            adminPanelModal.classList.remove('active');
        });
    }
    
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
    
    setupAdminSearch();
}

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
        
        loadVerifiedUsersList();
        if (adminUserSearch) adminUserSearch.value = '';
        if (adminSearchResults) adminSearchResults.innerHTML = '';
        
    } catch (error) {
        console.error("Ошибка выдачи галочки:", error);
        showNotification("❌ Ошибка при выдаче галочки");
    }
}

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

window.selectUserForBadge = function(userId, displayName) {
    if (badgeUserId) {
        badgeUserId.value = userId;
        adminUserSearch.value = '';
        adminSearchResults.innerHTML = '';
        showNotification(`Выбран пользователь: ${displayName}`);
    }
};

// ================================================
// ФУНКЦИИ УПРАВЛЕНИЯ
// ================================================
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

function initMobileInterface() {
    if (!isMobile) return;
    
    if (mobileHeader) mobileHeader.style.display = 'none';
    if (desktopSidebar) desktopSidebar.style.display = 'none';
    if (desktopEmptyScreen) desktopEmptyScreen.style.display = 'none';
    if (mobileContainer) mobileContainer.style.display = 'flex';
    if (homeScreen) homeScreen.style.display = 'none';
    
    updateMobileChats();
    updateMobileContacts();
    updateMobileProfile();
    
    if (currentChatId) {
        if (chatScreen) {
            chatScreen.style.display = 'flex';
            chatScreen.classList.add('mobile');
            chatScreen.classList.remove('desktop');
        }
    }
}

function initDesktopInterface() {
    if (isMobile) return;
    
    if (desktopSidebar) desktopSidebar.style.display = 'flex';
    if (mobileHeader) mobileHeader.style.display = 'none';
    if (homeScreen) homeScreen.style.display = 'none';
    if (mobileContainer) mobileContainer.style.display = 'none';
    
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
    
    updateDesktopUserInfo();
    
    const firstDesktopTab = document.querySelector('.desktop-sidebar-tab[data-tab="chats"]');
    if (firstDesktopTab) {
        firstDesktopTab.click();
    }
}

function initializeInterface() {
    if (!currentUser) return;
    
    updateUserProfileDisplay();
    updateHomeChats();
    updateHomeContacts();
    updateDesktopChats();
    updateDesktopContacts();
    updateMobileChats();
    updateMobileContacts();
    updateMobileProfile();
    updateProfileContactsCount();
    updateProfileChatsCount();
    
    initializeTabs();
    
    if (isMobile) {
        initMobileInterface();
    } else {
        initDesktopInterface();
    }
}

function initializeTabs() {
    if (homeTabs && homeTabs.length > 0) {
        homeTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const tabName = this.dataset.tab;
                
                homeTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                document.querySelectorAll('.home-tab-pane').forEach(pane => {
                    pane.classList.remove('active');
                });
                
                const paneId = `home${tabName.charAt(0).toUpperCase() + tabName.slice(1)}Pane`;
                const activePane = document.getElementById(paneId);
                if (activePane) {
                    activePane.classList.add('active');
                }
            });
        });
        
        if (homeTabs[0]) {
            homeTabs[0].click();
        }
    }
    
    if (mobileSidebarTabs && mobileSidebarTabs.length > 0) {
        mobileSidebarTabs.forEach(tab => {
            tab.addEventListener('click', function(e) {
                e.stopPropagation();
                
                if (this.id === 'mobileLogoutBtn') {
                    logoutUser();
                    closeMobileSidebar();
                    return;
                }
                
                const tabName = this.dataset.tab;
                
                mobileSidebarTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                if (mobileChatsContainer) {
                    mobileChatsContainer.classList.remove('active');
                }
                if (mobileContactsContainer) {
                    mobileContactsContainer.classList.remove('active');
                }
                
                if (tabName === 'chats') {
                    if (mobileChatsContainer) mobileChatsContainer.classList.add('active');
                } else if (tabName === 'contacts') {
                    if (mobileContactsContainer) mobileContactsContainer.classList.add('active');
                } else if (tabName === 'profile') {
                    openProfileModal();
                    closeMobileSidebar();
                }
            });
        });
    }
    
    if (desktopSidebarTabs && desktopSidebarTabs.length > 0) {
        desktopSidebarTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const tabName = this.dataset.tab;
                
                desktopSidebarTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                if (desktopChatsList) {
                    desktopChatsList.style.display = tabName === 'chats' ? 'flex' : 'none';
                }
                if (desktopContactsList) {
                    desktopContactsList.style.display = tabName === 'contacts' ? 'flex' : 'none';
                }
            });
        });
        
        if (desktopSidebarTabs[0]) {
            desktopSidebarTabs[0].click();
        }
    }
}

function closeMobileSidebar() {
    if (!mobileSidebarOverlay || !mobileSidebar) return;
    
    mobileSidebarOverlay.classList.remove('active');
    mobileSidebar.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function openMobileSidebar() {
    if (!mobileSidebarOverlay || !mobileSidebar) return;
    
    mobileSidebarOverlay.classList.add('active');
    mobileSidebar.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    updateMobileChats();
    updateMobileContacts();
    
    const firstTab = mobileSidebar.querySelector('.mobile-sidebar-tab[data-tab="chats"]');
    if (firstTab) {
        firstTab.click();
    }
}

// ================================================
// ВЫХОД ИЗ СИСТЕМЫ
// ================================================
async function logoutUser() {
    try {
        cleanupListeners();
        
        if (currentUser) {
            await database.ref(`users/${currentUser.uid}`).update({
                status: "offline",
                lastActive: Date.now()
            });
        }
    
        await auth.signOut();
    
        currentUser = null;
        chats = [];
        contacts = [];
        currentChatId = null;
        replyToMessage = null;
    
        if (connectionCheckInterval) {
            clearInterval(connectionCheckInterval);
            connectionCheckInterval = null;
        }
    
        showNotification("Вы вышли из системы");
    
    } catch (error) {
        console.error("Ошибка выхода:", error);
    }
}

// ================================================
// ФУНКЦИИ СОЕДИНЕНИЯ
// ================================================
function startConnectionMonitoring() {
    if (connectionCheckInterval) {
        clearInterval(connectionCheckInterval);
    }
    
    connectionCheckInterval = setInterval(async () => {
        if (currentUser && navigator.onLine) {
            try {
                await database.ref(`users/${currentUser.uid}`).update({
                    lastActive: Date.now(),
                    status: "online"
                });
            } catch (error) {
                console.error("Ошибка обновления активности:", error);
            }
        }
    }, 30000);
}

// ================================================
// ФУНКЦИИ PHOTO
// ================================================
function showFullPhoto(photoSrc) {
    if (!photoViewModal || !fullSizePhoto) return;
    
    fullSizePhoto.src = photoSrc;
    photoViewModal.classList.add('active');
}

// ================================================
// DRAG AND DROP
// ================================================
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

// ================================================
// ОБРАБОТЧИКИ СОБЫТИЙ
// ================================================
function setupEventListeners() {
    // Авторизация
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

    // Мобильные кнопки (старые)
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

    // ПК кнопки
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
    
    if (desktopUserInfoBtn) {
        desktopUserInfoBtn.addEventListener('click', openProfileModal);
    }

    // Главный экран
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

    // Экран чата
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
    }

    // Создание чата
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

    // Контакты
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

            let foundContact = null;
            const results = searchUsers(searchValue, contacts);
            foundContact = results.find(r => !r.isContact);

            if (foundContact) {
                await addContact(foundContact.customId);
                if (addContactModal) addContactModal.classList.remove('active');
                resetAddContactForm();
            } else {
                showNotification("Выберите пользователя из списка или введите корректные данные");
            }
        });
    }

    if (privateUserId) {
        privateUserId.addEventListener('input', handlePrivateUserSearch);
    }

    // Профиль
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

    // Редактирование профиля
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', () => {
            if (profileModal) profileModal.classList.remove('active');
            if (editProfileModal) editProfileModal.classList.add('active');
            if (editProfileName) editProfileName.value = currentUser?.displayName || '';
        
            statusOptions.forEach(opt => {
                opt.classList.remove('active');
                if (opt.dataset.status === currentUser?.status) {
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

    // Модальные окна подтверждения
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

    // Закрытие модальных окон при клике на фон
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
            
            if (mobileCreateModal?.classList.contains('active')) {
                mobileCreateModal.classList.remove('active');
            }
            
            hideSearchResults('homeContactsSearchResults');
            hideSearchResults('contactSearchResults');
        }
    });

    document.addEventListener('contextmenu', (e) => {
        if (e.target.closest('.message-content')) {
            e.preventDefault();
        }
    });

    setupContactSearch();
    setupHomeContactsSearch();
    
    // Фото
    if (closePhotoModal) {
        closePhotoModal.addEventListener('click', () => {
            photoViewModal.classList.remove('active');
            fullSizePhoto.src = '';
        });
    }
    
    if (photoViewModal) {
        photoViewModal.addEventListener('click', (e) => {
            if (e.target === photoViewModal) {
                photoViewModal.classList.remove('active');
                fullSizePhoto.src = '';
            }
        });
    }
}

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
    
        if (userId === currentUser?.uid) continue;
    
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

// ================================================
// ОБРАБОТЧИКИ ОНЛАЙН/ОФФЛАЙН
// ================================================
window.addEventListener('beforeunload', async () => {
    if (currentUser) {
        try {
            await database.ref(`users/${currentUser.uid}`).update({
                status: "offline",
                lastActive: Date.now()
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
            updateMobileProfile();
        } catch (error) {
            console.error("Ошибка обновления статуса при фокусе:", error);
        }
    }
});

window.addEventListener('blur', async () => {
    if (currentUser) {
        try {
            setTimeout(async () => {
                if (!document.hasFocus()) {
                    await database.ref(`users/${currentUser.uid}`).update({
                        status: "away",
                        lastActive: Date.now()
                    });
                    if (currentUser) currentUser.status = "away";
                    updateUserProfileDisplay();
                    updateDesktopUserInfo();
                    updateMobileProfile();
                }
            }, 30000);
        } catch (error) {
            console.error("Ошибка обновления статуса при блюре:", error);
        }
    }
});

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
            updateMobileProfile();
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
            updateMobileProfile();
            showNotification("Потеряно соединение с интернетом");
        } catch (error) {
            console.error("Ошибка обновления статуса при потере сети:", error);
        }
    }
});

// ================================================
// ДОПОЛНИТЕЛЬНЫЕ ФУНКЦИИ
// ================================================
async function checkAndUpdateStatus() {
    if (!currentUser) return;
    
    try {
        const userRef = database.ref(`users/${currentUser.uid}`);
        const snapshot = await userRef.once('value');
        
        if (snapshot.exists()) {
            const userData = snapshot.val();
            
            if (userData.status === "offline" && navigator.onLine) {
                await userRef.update({
                    status: "online",
                    lastActive: Date.now()
                });
                currentUser.status = "online";
                updateUserProfileDisplay();
                updateDesktopUserInfo();
                updateMobileProfile();
            }
        }
    } catch (error) {
        console.error("Ошибка проверки статуса:", error);
    }
}

setTimeout(() => {
    checkAndUpdateStatus();
}, 1000);
