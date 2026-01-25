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
let selectedChatType = "channel";
let currentTab = "chats";
let authUnsubscribe = null;
let messageListeners = {};
let typingListeners = {};
let messageLimit = 50;
let lastMessageKey = null;
let typingTimeout = null;
let autoScrollEnabled = true;
let userScrolledUp = false;
let isMobile = false;
let replyToMessage = null;

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

const welcomeScreen = document.getElementById('welcomeScreen');
const chatHeader = document.getElementById('chatHeader');
const chatHeaderAvatar = document.getElementById('chatHeaderAvatar');
const chatHeaderName = document.getElementById('chatHeaderName');
const chatHeaderDescription = document.getElementById('chatHeaderDescription');
const chatHeaderBadge = document.getElementById('chatHeaderBadge');
const chatActions = document.getElementById('chatActions');
const messagesContainer = document.getElementById('messagesContainer');
const chatInputContainer = document.getElementById('chatInputContainer');
const messageInput = document.getElementById('messageInput');
const sendMessageBtn = document.getElementById('sendMessageBtn');
const createChatBtn = document.getElementById('createChatBtn');
const createChatModal = document.getElementById('createChatModal');
const cancelCreateBtn = document.getElementById('cancelCreateBtn');
const confirmCreateBtn = document.getElementById('confirmCreateBtn');
const chatNameInput = document.getElementById('chatName');
const chatDescriptionInput = document.getElementById('chatDescription');
const chatTypeOptions = document.querySelectorAll('.chat-type-option');
const chatsContainer = document.getElementById('chatsContainer');
const contactsContainer = document.getElementById('contactsContainer');
const sidebarTabs = document.querySelectorAll('.sidebar-tab');
const searchInput = document.getElementById('searchInput');
const userProfileBtn = document.getElementById('userProfileBtn');
const profileModal = document.getElementById('profileModal');
const profileName = document.getElementById('profileName');
const profileUserId = document.getElementById('profileUserId');
const copyUserIdBtn = document.getElementById('copyUserIdBtn');
const welcomeUserId = document.getElementById('welcomeUserId');
const copyWelcomeIdBtn = document.getElementById('copyWelcomeIdBtn');
const profileContactsCount = document.getElementById('profileContactsCount');
const profileChatsCount = document.getElementById('profileChatsCount');
const addContactBtn = document.getElementById('addContactBtn');
const addContactModal = document.getElementById('addContactModal');
const cancelAddContactBtn = document.getElementById('cancelAddContactBtn');
const confirmAddContactBtn = document.getElementById('confirmAddContactBtn');
const contactSearch = document.getElementById('contactSearch');
const contactSearchResults = document.getElementById('contactSearchResults');
const privateUserId = document.getElementById('privateUserId');
const privateUserSearchResults = document.getElementById('privateUserSearchResults');
const chatDescriptionGroup = document.getElementById('chatDescriptionGroup');
const privateChatUser = document.getElementById('privateChatUser');
const logoBtn = document.getElementById('logoBtn');
const notificationBadge = document.querySelector('.notification-badge');
const editProfileBtn = document.getElementById('editProfileBtn');
const editProfileModal = document.getElementById('editProfileModal');
const cancelEditProfileBtn = document.getElementById('cancelEditProfileBtn');
const saveProfileBtn = document.getElementById('saveProfileBtn');
const editProfileName = document.getElementById('editProfileName');
const statusOptions = document.querySelectorAll('.status-option');
const logoutBtn = document.getElementById('logoutBtn');
const messageContextMenu = document.getElementById('messageContextMenu');
const contextReply = document.getElementById('contextReply');
const contextCopy = document.getElementById('contextCopy');
const contextDelete = document.getElementById('contextDelete');
const replyPreviewContainer = document.getElementById('replyPreviewContainer');

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    setupEventListeners();
    setupUserDataListener();
    detectMobile();

    // Проверяем авторизацию
    authUnsubscribe = auth.onAuthStateChanged(async (user) => {
        if (user) {
            // Пользователь авторизован
            await loadUserData(user.uid);
            authContainer.style.display = 'none';
            mainContainer.style.display = 'flex';
            showNotification("Добро пожаловать в Soul!");
        } else {
            // Пользователь не авторизован
            authContainer.style.display = 'flex';
            mainContainer.style.display = 'none';
        }
    });
}

function detectMobile() {
    isMobile = window.innerWidth <= 768;
    window.addEventListener('resize', () => {
        isMobile = window.innerWidth <= 768;
    });
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
    
        const result = await auth.signInWithEmailAndPassword(email, password);
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
    
        // Используем анонимную авторизацию для быстрого входа
        const result = await auth.signInAnonymously();
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
    
        // Создаем пользователя
        const result = await auth.createUserWithEmailAndPassword(email, password);
        const user = result.user;
    
        // Обновляем имя пользователя
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
    authError.textContent = message;
    authError.classList.add('active');
}

function hideError() {
    authError.classList.remove('active');
}

function showSuccess() {
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
    if (isLoading) {
        authLoading.classList.add('active');
        loginBtn.disabled = true;
        registerBtn.disabled = true;
        quickLoginBtn.disabled = true;
    } else {
        authLoading.classList.remove('active');
        loginBtn.disabled = false;
        registerBtn.disabled = false;
        quickLoginBtn.disabled = false;
    }
}

// ФУНКЦИИ ПОЛЬЗОВАТЕЛЯ
async function loadUserData(userId) {
    try {
        setLoading(true);
    
        // Загружаем данные пользователя
        const userRef = database.ref(`users/${userId}`);
        const snapshot = await userRef.once('value');
    
        if (snapshot.exists()) {
            currentUser = {
                uid: userId,
                ...snapshot.val()
            };
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
                contacts: {},
                chats: {}
            };
        
            await userRef.set(currentUser);
        }
    
        // Обновляем статус на "online"
        await database.ref(`users/${userId}`).update({
            status: "online",
            lastSeen: null
        });
    
        // Загружаем всех пользователей
        await loadAllUsers();
    
        // Загружаем чаты пользователя
        await loadUserChats();
    
        // Обновляем интерфейс
        updateUserProfileDisplay();
        welcomeUserId.textContent = currentUser.customId;
    
        setLoading(false);
    
    } catch (error) {
        console.error("Ошибка загрузки данных:", error);
        showNotification("Ошибка загрузки данных. Попробуйте обновить страницу.");
        setLoading(false);
    }
}

async function logoutUser() {
    try {
        // Обновляем статус перед выходом
        if (currentUser) {
            await database.ref(`users/${currentUser.uid}`).update({
                status: "offline",
                lastSeen: Date.now()
            });
        }
    
        // Выходим из системы
        await auth.signOut();
    
        // Сбрасываем состояние
        currentUser = null;
        chats = [];
        contacts = [];
        currentChatId = null;
        replyToMessage = null;
    
        // Очищаем слушатели
        Object.values(messageListeners).forEach(unsubscribe => unsubscribe());
        Object.values(typingListeners).forEach(unsubscribe => unsubscribe());
        messageListeners = {};
        typingListeners = {};
    
        showNotification("Вы вышли из системы");
    
    } catch (error) {
        console.error("Ошибка выхода:", error);
    }
}

// ФУНКЦИИ ДЛЯ ЧАТОВ
async function loadAllUsers() {
    try {
        console.log("Начинаю загрузку всех пользователей...");
        const usersRef = database.ref('users');
        const snapshot = await usersRef.once('value');
        const usersData = snapshot.val();
    
        if (usersData) {
            console.log("Найдены пользователи:", Object.keys(usersData).length);
            allUsers = {};
            
            for (const userId in usersData) {
                if (currentUser && userId === currentUser.uid) continue;
                
                allUsers[userId] = {
                    uid: userId,
                    displayName: usersData[userId].displayName || "Пользователь",
                    customId: usersData[userId].customId || `user_${userId.substr(0, 8)}`,
                    status: usersData[userId].status || 'offline'
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
    
        chatsContainer.innerHTML = '';
        chats = [];
    
        const chatsData = snapshot.val();
        if (chatsData) {
            Object.keys(chatsData).forEach(chatId => {
                const chat = chatsData[chatId];
                chat.id = chatId;
                chats.push(chat);
            
                const chatElement = createChatElement(chat);
                chatsContainer.appendChild(chatElement);
            
                setupChatListener(chatId);
            });
        }
    
        if (chats.length === 0) {
            showNoChatsMessage();
        }
    
        updateProfileChatsCount();
    
    } catch (error) {
        console.error("Ошибка загрузки чатов:", error);
        showNoChatsMessage();
    }
}

function createChatElement(chat) {
    const chatElement = document.createElement('div');
    chatElement.className = 'chat-item';
    chatElement.dataset.chatId = chat.id;

    let avatarClass, avatarContent, chatName;

    if (chat.type === 'channel') {
        avatarClass = 'channel-avatar';
        avatarContent = '#';
        chatName = chat.name;
    } else if (chat.type === 'group') {
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
        document.querySelectorAll('.chat-item').forEach(item => {
            item.classList.remove('active');
        });
        chatElement.classList.add('active');
    
        const unreadCount = chatElement.querySelector('.unread-count');
        if (unreadCount) {
            unreadCount.remove();
        }
    
        openChat(chat.id);
    });

    return chatElement;
}

function showNoChatsMessage() {
    chatsContainer.innerHTML = `
        <div style="text-align: center; padding: 60px 20px;">
            <div style="font-size: 48px; color: #475569; margin-bottom: 20px; opacity: 0.5;">
                <i class="fas fa-comments"></i>
            </div>
            <h3 style="color: #94a3b8; margin-bottom: 10px; font-weight: 500;">Чатов пока нет</h3>
            <p style="color: #64748b; font-size: 14px;">Создайте первый чат, чтобы начать общение</p>
            <button class="action-btn" style="margin-top: 20px; max-width: 200px;" id="createFirstChatBtn">
                <i class="fas fa-plus-circle"></i> Создать чат
            </button>
        </div>
    `;
    
    document.getElementById('createFirstChatBtn')?.addEventListener('click', () => {
        createChatModal.classList.add('active');
    });
}

async function loadContacts() {
    try {
        const contactsRef = database.ref(`users/${currentUser.uid}/contacts`);
    
        contactsRef.on('value', (snapshot) => {
            updateContactsContainer(snapshot);
        });
    } catch (error) {
        console.error("Ошибка загрузки контактов:", error);
        updateContactsContainer({ val: () => null });
    }
}

function updateContactsContainer(snapshot) {
    contactsContainer.innerHTML = '';

    const contactsData = snapshot.val ? snapshot.val() : null;
    contacts = [];

    if (contactsData) {
        Object.keys(contactsData).forEach(userId => {
            const contact = contactsData[userId];
            contact.userId = userId;
        
            const user = allUsers[userId];
            if (user) {
                contact.displayName = user.displayName || contact.displayName;
                contact.status = user.status || contact.status;
                contact.customId = user.customId || contact.customId;
            }
        
            contacts.push(contact);
        
            const contactElement = createContactElement(contact);
            contactsContainer.appendChild(contactElement);
        });
    }

    if (contacts.length === 0) {
        contactsContainer.innerHTML = `
            <div style="text-align: center; padding: 60px 20px;">
                <div style="font-size: 48px; color: #475569; margin-bottom: 20px; opacity: 0.5;">
                    <i class="fas fa-user-friends"></i>
                </div>
                <h3 style="color: #94a3b8; margin-bottom: 10px; font-weight: 500;">Контакты отсутствуют</h3>
                <p style="color: #64748b; font-size: 14px;">Добавьте контакты, чтобы начать общение</p>
                <button class="action-btn secondary" style="margin-top: 20px; max-width: 200px;" id="addFirstContactBtn">
                    <i class="fas fa-user-plus"></i> Добавить контакт
                </button>
            </div>
        `;
        
        document.getElementById('addFirstContactBtn')?.addEventListener('click', () => {
            addContactModal.classList.add('active');
        });
    }

    updateProfileContactsCount();
}

function createContactElement(contact) {
    const contactElement = document.createElement('div');
    contactElement.className = 'contact-item';
    contactElement.dataset.userId = contact.userId;

    const user = allUsers[contact.userId];
    const displayName = user ? user.displayName : contact.displayName;
    const status = user ? user.status : contact.status;
    const customId = user ? user.customId : contact.customId;

    contactElement.innerHTML = `
        <div class="contact-avatar">
            ${displayName.charAt(0)}
        </div>
        <div class="contact-info">
            <div class="contact-name">${displayName || "Неизвестный пользователь"}</div>
            <div class="contact-status ${status || 'offline'}">${status || 'offline'}</div>
        </div>
        <div class="chat-meta">
            <div class="chat-time">${customId || contact.userId || "ID"}</div>
        </div>
    `;
    
    contactElement.addEventListener('click', () => {
        openOrCreatePrivateChat(contact.userId);
    });

    return contactElement;
}

// ОТКРЫТИЕ ЧАТА
async function openChat(chatId) {
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return;

    currentChatId = chatId;
    replyToMessage = null;
    hideReplyPreview();

    welcomeScreen.style.display = 'none';
    chatHeader.style.display = 'flex';
    messagesContainer.style.display = 'flex';
    chatInputContainer.style.display = 'block';

    let chatName, chatDescription;

    if (chat.type === 'private') {
        const otherUserId = Object.keys(chat.members).find(id => id !== currentUser.uid);
        const otherUser = allUsers[otherUserId];
    
        chatName = otherUser ? otherUser.displayName : "Неизвестный пользователь";
        chatDescription = "Личный чат";
    } else {
        chatName = chat.name;
        chatDescription = chat.description || `Чат типа ${chat.type === 'channel' ? 'канал' : 'группа'}`;
    }

    chatHeaderName.textContent = chatName;
    chatHeaderDescription.textContent = chatDescription;

    if (chat.type === 'channel') {
        chatHeaderAvatar.innerHTML = '<i class="fas fa-hashtag"></i>';
        chatHeaderAvatar.className = 'chat-header-avatar channel-avatar';
        chatHeaderBadge.textContent = 'Канал';
        chatHeaderBadge.className = 'chat-type-badge channel-badge';
    } else if (chat.type === 'group') {
        chatHeaderAvatar.innerHTML = '<i class="fas fa-users"></i>';
        chatHeaderAvatar.className = 'chat-header-avatar group-avatar';
        chatHeaderBadge.textContent = 'Группа';
        chatHeaderBadge.className = 'chat-type-badge group-badge';
    } else {
        const otherUserId = Object.keys(chat.members).find(id => id !== currentUser.uid);
        const otherUser = allUsers[otherUserId];
    
        chatHeaderAvatar.innerHTML = otherUser ? otherUser.displayName.charAt(0) : '?';
        chatHeaderAvatar.className = 'chat-header-avatar private-avatar';
        chatHeaderBadge.textContent = 'Личный чат';
        chatHeaderBadge.className = 'chat-type-badge private-badge';
    }

    enhanceChatActions(chat);
    loadMessages(chatId);
    listenToTypingStatus(chatId);
}

function enhanceChatActions(chat) {
    chatActions.innerHTML = '';

    // Кнопка информации о чате
    const infoBtn = document.createElement('button');
    infoBtn.className = 'chat-action-btn';
    infoBtn.innerHTML = '<i class="fas fa-info-circle"></i>';
    infoBtn.title = 'Информация о чате';
    infoBtn.addEventListener('click', () => {
        showChatInfoModal(chat.id);
    });
    chatActions.appendChild(infoBtn);

    // Для групповых чатов и каналов - кнопка добавления участников
    if (chat.type !== 'private') {
        const addMemberBtn = document.createElement('button');
        addMemberBtn.className = 'chat-action-btn';
        addMemberBtn.innerHTML = '<i class="fas fa-user-plus"></i>';
        addMemberBtn.title = 'Добавить участника';
        addMemberBtn.addEventListener('click', () => {
            showAddMemberModal(chat.id);
        });
        chatActions.appendChild(addMemberBtn);
    }

    // Кнопка поиска в чате
    const searchBtn = document.createElement('button');
    searchBtn.className = 'chat-action-btn';
    searchBtn.innerHTML = '<i class="fas fa-search"></i>';
    searchBtn.title = 'Поиск в чате';
    searchBtn.addEventListener('click', () => {
        const query = prompt('Введите текст для поиска в сообщениях:');
        if (query && query.trim()) {
            searchInChat(currentChatId, query.trim());
        }
    });
    chatActions.appendChild(searchBtn);

    // Кнопка меню
    const menuBtn = document.createElement('button');
    menuBtn.className = 'chat-action-btn';
    menuBtn.innerHTML = '<i class="fas fa-ellipsis-v"></i>';
    menuBtn.title = 'Дополнительные действия';
    menuBtn.addEventListener('click', (e) => {
        showChatContextMenu(e, chat.id, chat.type);
    });
    chatActions.appendChild(menuBtn);
}

// СООБЩЕНИЯ
function loadMessages(chatId, loadMore = false) {
    if (!loadMore) {
        messagesContainer.innerHTML = '';
        lastMessageKey = null;
        autoScrollEnabled = true;
        userScrolledUp = false;
    }

    try {
        let messagesRef = database.ref(`messages/${chatId}`)
            .orderByChild('timestamp')
            .limitToLast(messageLimit);
    
        if (lastMessageKey) {
            messagesRef = messagesRef.endAt(lastMessageKey - 1);
        }
    
        messagesRef.once('value').then((snapshot) => {
            const messagesData = snapshot.val();
        
            if (messagesData) {
                const messagesArray = Object.keys(messagesData).map(key => {
                    return { id: key, ...messagesData[key] };
                }).sort((a, b) => a.timestamp - b.timestamp);
            
                if (messagesArray.length > 0) {
                    lastMessageKey = messagesArray[0].timestamp;
                }
            
                messagesArray.forEach(message => {
                    const messageElement = createMessageElement(message);
                    if (loadMore) {
                        messagesContainer.insertBefore(messageElement, messagesContainer.firstChild);
                    } else {
                        messagesContainer.appendChild(messageElement);
                    }
                });
            
                if (!loadMore && autoScrollEnabled && !userScrolledUp) {
                    setTimeout(() => {
                        messagesContainer.scrollTop = messagesContainer.scrollHeight;
                    }, 100);
                }
            
                addLoadMoreButton(chatId);
            } else if (!loadMore) {
                showWelcomeMessage(chatId);
            }
        });
    
        listenToNewMessages(chatId);
    
    } catch (error) {
        console.error("Ошибка загрузки сообщений:", error);
        if (!loadMore) showWelcomeMessage(chatId);
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
            messagesContainer.appendChild(messageElement);
        
            if (autoScrollEnabled && !userScrolledUp) {
                setTimeout(() => {
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                }, 100);
            }
        }
    });
}

// Обновленная функция createMessageElement
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
        messageElement.className = `message ${isOutgoing ? 'outgoing' : 'incoming'}`;
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
        
        // Добавляем обработчик контекстного меню
        messageElement.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            showMessageContextMenu(e, message, isOutgoing);
        });
    
        // Обработчик клика по цитате
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
        // Проверяем на команды
        if (text.startsWith('/')) {
            await handleCommand(text);
            messageInput.value = '';
            hideReplyPreview();
            return;
        }
    
        const newMessage = {
            text: text,
            senderId: currentUser.uid,
            senderName: currentUser.displayName,
            timestamp: Date.now()
        };
    
        // Добавляем информацию об ответе, если есть
        if (replyToMessage) {
            newMessage.replyTo = {
                id: replyToMessage.id,
                text: replyToMessage.text,
                senderId: replyToMessage.senderId,
                senderName: replyToMessage.senderName || "Пользователь"
            };
        }
    
        // ОЧИЩАЕМ ПОЛЕ ВВОДА СРАЗУ - ИСПРАВЛЕНИЕ БАГА
        messageInput.value = '';
        hideReplyPreview();
        replyToMessage = null;
        
        // Сбрасываем высоту textarea
        messageInput.style.height = '64px';
        
        // Если мобилка - убираем фокус
        if (isMobile) {
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
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            userScrolledUp = false;
            autoScrollEnabled = true;
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
            if (confirm("Вы уверены, что хотите покинуть чат?")) {
                await leaveChat(currentChatId);
            }
            break;
        
        case '/help':
            showNotification("Доступные команды:\n/invite USER_ID - пригласить пользователя\n/rename НАЗВАНИЕ - изменить название чата\n/leave - покинуть чат\n/help - показать помощь");
            break;
        
        default:
            showNotification(`Неизвестная команда: ${cmd}. Используйте /help для списка команд.`);
    }
}

// КОНТЕКСТНОЕ МЕНЮ ДЛЯ СООБЩЕНИЙ
function showMessageContextMenu(event, message, isOutgoing) {
    event.preventDefault();
    event.stopPropagation();

    // Закрываем предыдущее меню
    const existingMenus = document.querySelectorAll('.message-context-menu');
    existingMenus.forEach(menu => {
        if (menu !== messageContextMenu) menu.remove();
    });

    // Показываем или скрываем пункты меню в зависимости от прав
    contextDelete.style.display = isOutgoing ? 'flex' : 'none';
    contextCopy.style.display = 'flex';
    contextReply.style.display = 'flex';

    // Устанавливаем данные в элементы меню
    messageContextMenu.dataset.messageId = message.id;
    messageContextMenu.dataset.isOutgoing = isOutgoing;

    // Позиционируем меню
    const x = event.clientX;
    const y = event.clientY;
    const menuWidth = 200;
    const menuHeight = 150;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    let left = x;
    let top = y;

    // Проверяем, чтобы меню не выходило за границы окна
    if (x + menuWidth > windowWidth) {
        left = x - menuWidth;
    }
    if (y + menuHeight > windowHeight) {
        top = y - menuHeight;
    }

    messageContextMenu.style.left = left + 'px';
    messageContextMenu.style.top = top + 'px';
    messageContextMenu.classList.add('active');

    // Добавляем обработчик для закрытия меню при клике вне его
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

contextReply.addEventListener('click', () => {
    const messageId = messageContextMenu.dataset.messageId;
    if (!messageId) return;

    // Находим сообщение
    const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
    if (!messageElement) return;

    // Получаем данные сообщения из DOM
    const messageText = messageElement.querySelector('.message-text')?.textContent || '';
    const senderName = messageElement.querySelector('.message-sender-name')?.textContent.split(' ')[0] || '';

    // Устанавливаем ответ на сообщение
    replyToMessage = {
        id: messageId,
        text: messageText,
        senderName: senderName
    };

    // Показываем предпросмотр ответа
    showReplyPreview(senderName, messageText);

    // Закрываем меню
    messageContextMenu.classList.remove('active');

    // Фокусируем поле ввода
    messageInput.focus();

    showNotification("Вы отвечаете на сообщение");
});

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
    
    messageContextMenu.classList.remove('active');
});

contextDelete.addEventListener('click', async () => {
    const messageId = messageContextMenu.dataset.messageId;
    const isOutgoing = messageContextMenu.dataset.isOutgoing === 'true';

    if (!messageId || !currentChatId || !isOutgoing) {
        messageContextMenu.classList.remove('active');
        return;
    }

    // Получаем данные сообщения для предпросмотра
    const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
    if (!messageElement) {
        messageContextMenu.classList.remove('active');
        return;
    }
    
    const messageText = messageElement.querySelector('.message-text')?.textContent || '';
    const senderName = messageElement.querySelector('.message-sender-name')?.textContent.split(' ')[0] || '';
    const timeElement = messageElement.querySelector('.message-time');
    const timestamp = timeElement ? new Date().getTime() : Date.now(); // Примерное время
    
    // Показываем красивое модальное окно подтверждения
    showDeleteMessageConfirmation(messageId, currentChatId, messageText, senderName, timestamp);
});

// ФУНКЦИИ ДЛЯ ОТВЕТА НА СООБЩЕНИЯ
function showReplyPreview(senderName, messageText) {
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
    
    document.getElementById('cancelReplyBtn').addEventListener('click', hideReplyPreview);
}

function hideReplyPreview() {
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

// ОБНОВЛЕННАЯ ФУНКЦИЯ УДАЛЕНИЯ ЧАТА
async function leaveChat(chatId) {
    try {
        const chat = await getChatInfo(chatId);
        if (!chat) return false;
    
        // Удаляем себя из участников
        await database.ref(`chats/${chatId}/members/${currentUser.uid}`).remove();
    
        // Если пользователь создатель чата, пометим чат как неактивный
        if (chat.createdBy === currentUser.uid) {
            await database.ref(`chats/${chatId}`).update({
                active: false,
                archivedByCreator: true
            });
        }
    
        // Отправляем системное сообщение
        const systemMessage = {
            text: `${currentUser.displayName} покинул(а) чат`,
            senderId: 'system',
            senderName: 'Система',
            timestamp: Date.now(),
            type: 'system'
        };
    
        await database.ref(`messages/${chatId}`).push(systemMessage);
    
        showNotification("Вы покинули чат");
    
        // Обновляем список чатов
        await loadUserChats();
    
        // Закрываем чат если он открыт
        if (currentChatId === chatId) {
            currentChatId = null;
            chatHeader.style.display = 'none';
            messagesContainer.style.display = 'none';
            chatInputContainer.style.display = 'none';
            welcomeScreen.style.display = 'flex';
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
    const name = chatNameInput.value.trim();
    const description = chatDescriptionInput.value.trim();

    try {
        console.log("Создание чата:", { name, description, type: selectedChatType });
    
        if (selectedChatType !== 'private' && !name) {
            showNotification("Пожалуйста, введите название чата");
            return;
        }
    
        let newChat;
    
        if (selectedChatType === 'private') {
            const targetUserId = privateUserId.value.trim();
        
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
                createChatModal.classList.remove('active');
                resetCreateForm();
            
                const chatElement = document.querySelector(`[data-chat-id="${existingChatId}"]`);
                if (chatElement) {
                    chatElement.click();
                }
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
    
        console.log("Данные для создания чата:", newChat);
    
        const chatsRef = database.ref('chats');
        const newChatRef = chatsRef.push();
    
        try {
            await newChatRef.set(newChat);
            const chatId = newChatRef.key;
            console.log("Чат создан с ID:", chatId);
        
            showNotification("Чат успешно создан!");
        
            newChat.id = chatId;
            chats.push(newChat);
        
            const chatElement = createChatElement(newChat);
            chatsContainer.appendChild(chatElement);
        
            setupChatListener(chatId);
        
        } catch (error) {
            console.error("Ошибка записи в Firebase:", error);
            showNotification("Ошибка создания чата: " + error.message);
        }
    
        createChatModal.classList.remove('active');
        resetCreateForm();
    
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
            const chatElement = document.querySelector(`[data-chat-id="${existingChatId}"]`);
            if (chatElement) {
                chatElement.click();
            }
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
            await chatsRef.push(newChat);
        
            showNotification("Личный чат создан!");
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
        const chatElement = document.querySelector(`[data-chat-id="${chatId}"]`);
    
        if (chatElement && messagesData) {
            const messageKeys = Object.keys(messagesData);
            const lastMessage = messagesData[messageKeys[0]];
            const time = new Date(lastMessage.timestamp);
        
            const timeString = time.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        
            let messageText = lastMessage.text;
            if (messageText.length > 30) {
                messageText = messageText.substring(0, 30) + '...';
            }
        
            chatElement.querySelector('.last-message').textContent = messageText;
            chatElement.querySelector('.chat-time').textContent = timeString;
        
            if (currentChatId !== chatId && lastMessage.senderId !== currentUser.uid) {
                const unreadCount = chatElement.querySelector('.unread-count');
                if (!unreadCount) {
                    const unreadDiv = document.createElement('div');
                    unreadDiv.className = 'unread-count';
                    unreadDiv.textContent = '1';
                    chatElement.querySelector('.chat-meta').appendChild(unreadDiv);
                } else {
                    unreadCount.textContent = parseInt(unreadCount.textContent) + 1;
                }
            }
        }
    });
}

// ПОИСК И КОНТАКТЫ
function handleSearch() {
    const query = searchInput.value.toLowerCase().trim();

    if (!query) {
        document.querySelectorAll('.chat-item, .contact-item').forEach(item => {
            item.style.display = 'flex';
        });
        return;
    }

    document.querySelectorAll('.chat-item, .contact-item').forEach(item => {
        const chatName = item.querySelector('.chat-name')?.textContent.toLowerCase() || '';
        const contactName = item.querySelector('.contact-name')?.textContent.toLowerCase() || '';
        const name = chatName || contactName;
    
        if (name.includes(query)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

function handleContactSearch() {
    const query = contactSearch.value.trim().toLowerCase();
    contactSearchResults.innerHTML = '';

    if (!query) {
        showAllUsers();
        return;
    }

    const results = [];

    for (const userId in allUsers) {
        const user = allUsers[userId];
    
        if (!user || userId === currentUser.uid) continue;
    
        const matchesQuery = 
            (user.displayName && user.displayName.toLowerCase().includes(query)) || 
            (user.customId && user.customId.toLowerCase().includes(query));
    
        if (matchesQuery) {
            const isAlreadyContact = contacts.some(contact => contact.userId === userId);
        
            results.push({
                userId: userId,
                displayName: user.displayName || "Без имени",
                customId: user.customId || `user_${userId.substr(0, 8)}`,
                status: user.status || 'offline',
                isAlreadyContact: isAlreadyContact
            });
        }
    }

    if (results.length > 0) {
        contactSearchResults.style.display = 'block';
    
        results.forEach(result => {
            const resultItem = createSearchResultItem(result);
            contactSearchResults.appendChild(resultItem);
        });
    } else {
        contactSearchResults.innerHTML = `
            <div class="no-results">
                <i class="fas fa-user-slash" style="font-size: 32px; margin-bottom: 10px; opacity: 0.5;"></i>
                <p>Пользователи не найдены</p>
            </div>
        `;
        contactSearchResults.style.display = 'block';
        confirmAddContactBtn.disabled = true;
    }
}

function showAllUsers() {
    const results = [];

    for (const userId in allUsers) {
        const user = allUsers[userId];
    
        if (!user || userId === currentUser.uid) continue;
    
        const isAlreadyContact = contacts.some(contact => contact.userId === userId);
    
        results.push({
            userId: userId,
            displayName: user.displayName || "Без имени",
            customId: user.customId || `user_${userId.substr(0, 8)}`,
            status: user.status || 'offline',
            isAlreadyContact: isAlreadyContact
        });
    }

    if (results.length > 0) {
        contactSearchResults.style.display = 'block';
        contactSearchResults.innerHTML = '';
    
        results.forEach(result => {
            const resultItem = createSearchResultItem(result);
            contactSearchResults.appendChild(resultItem);
        });
    } else {
        contactSearchResults.innerHTML = `
            <div class="no-results">
                <i class="fas fa-user-slash" style="font-size: 32px; margin-bottom: 10px; opacity: 0.5;"></i>
                <p>Нет доступных пользователей</p>
            </div>
        `;
        contactSearchResults.style.display = 'block';
    }
}

function createSearchResultItem(result) {
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
            <div class="search-result-status" style="font-size: 12px; color: ${result.status === 'online' ? '#10b981' : result.status === 'away' ? '#f59e0b' : result.status === 'dnd' ? '#ef4444' : '#94a3b8'}">
                ${result.status}
            </div>
        </div>
        <button class="add-user-btn ${result.isAlreadyContact ? 'added' : ''}" 
                ${result.isAlreadyContact ? 'disabled' : ''}
                data-user-id="${result.userId}">
            ${result.isAlreadyContact ? 'Добавлен' : 'Добавить'}
        </button>
    `;
    
    if (!result.isAlreadyContact) {
        const addBtn = resultItem.querySelector('.add-user-btn');
        addBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const userId = e.target.dataset.userId;
            await addContact(userId);
        });
    }

    resultItem.addEventListener('click', () => {
        contactSearch.value = result.customId;
        confirmAddContactBtn.disabled = false;
        confirmAddContactBtn.dataset.userId = result.userId;
    });

    return resultItem;
}

function handlePrivateUserSearch() {
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
                privateUserId.value = result.customId;
                privateUserSearchResults.style.display = 'none';
            });
        
            privateUserSearchResults.appendChild(resultItem);
        });
    } else {
        privateUserSearchResults.innerHTML = '<div class="no-results">Пользователи не найдены</div>';
        privateUserSearchResults.style.display = 'block';
    }
}

async function addContact(targetUserId) {
    try {
        console.log("Попытка добавления контакта:", targetUserId);
    
        let targetUser = allUsers[targetUserId];
    
        if (!targetUser) {
            for (const userId in allUsers) {
                if (allUsers[userId].customId === targetUserId && userId !== currentUser.uid) {
                    targetUser = allUsers[userId];
                    targetUserId = userId;
                    break;
                }
            }
        }
    
        if (!targetUser) {
            const userRef = database.ref(`users/${targetUserId}`);
            const snapshot = await userRef.once('value');
        
            if (snapshot.exists()) {
                const userData = snapshot.val();
                targetUser = {
                    uid: targetUserId,
                    displayName: userData.displayName || "Пользователь",
                    customId: userData.customId || `user_${targetUserId.substr(0, 8)}`,
                    status: userData.status || 'offline'
                };
                
                allUsers[targetUserId] = targetUser;
            } else {
                const usersRef = database.ref('users');
                const allUsersSnapshot = await usersRef.once('value');
                const allUsersData = allUsersSnapshot.val();
                
                let foundUserId = null;
                for (const uid in allUsersData) {
                    if (allUsersData[uid].customId === targetUserId && uid !== currentUser.uid) {
                        foundUserId = uid;
                        break;
                    }
                }
                
                if (foundUserId) {
                    const foundUserData = allUsersData[foundUserId];
                    targetUser = {
                        uid: foundUserId,
                        displayName: foundUserData.displayName || "Пользователь",
                        customId: foundUserData.customId || `user_${foundUserId.substr(0, 8)}`,
                        status: foundUserData.status || 'offline'
                    };
                    
                    allUsers[foundUserId] = targetUser;
                    targetUserId = foundUserId;
                } else {
                    showNotification("Пользователь не найден");
                    return;
                }
            }
        }
    
        if (targetUserId === currentUser.uid) {
            showNotification("Вы не можете добавить себя в контакты");
            return;
        }
    
        const isAlreadyContact = contacts.some(contact => contact.userId === targetUserId);
    
        if (isAlreadyContact) {
            showNotification("Этот пользователь уже у вас в контактах");
            return;
        }
    
        const contactData = {
            displayName: targetUser.displayName || "Пользователь",
            customId: targetUser.customId || `user_${targetUserId.substr(0, 8)}`,
            status: targetUser.status || 'offline',
            addedAt: Date.now(),
            userId: targetUserId
        };
    
        console.log("Добавляем контакт:", contactData);
    
        await database.ref(`users/${currentUser.uid}/contacts/${targetUserId}`).set(contactData);
    
        contacts.push({
            userId: targetUserId,
            ...contactData
        });
    
        showNotification(`Пользователь ${targetUser.displayName} добавлен в контакты!`);
    
        addContactModal.classList.remove('active');
        resetAddContactForm();
    
        updateContactsContainer({ 
            val: () => contacts.reduce((acc, contact) => {
                acc[contact.userId] = contact;
                return acc;
            }, {}) 
        });
    
    } catch (error) {
        console.error("Ошибка при добавлении контакта:", error);
        showNotification("Не удалось добавить контакт: " + error.message);
    }
}

// ПРОФИЛЬ
function openProfileModal() {
    profileModal.classList.add('active');
}

function updateUserProfileDisplay() {
    if (!currentUser) return;

    profileName.textContent = currentUser.displayName;
    profileUserId.textContent = currentUser.customId;
    document.getElementById('profileAvatarLarge').textContent = currentUser.displayName.charAt(0);
    document.getElementById('profileStatus').textContent = currentUser.status;
    document.getElementById('profileStatus').className = `profile-status ${currentUser.status}`;
    document.getElementById('profileJoinDate').textContent = currentUser.joinDate;

    userProfileBtn.textContent = currentUser.displayName.charAt(0);

    updateProfileContactsCount();
    updateProfileChatsCount();
}

function copyUserIdToClipboard(element) {
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
    profileContactsCount.textContent = contacts.length;
}

function updateProfileChatsCount() {
    profileChatsCount.textContent = chats.length;
}

async function saveProfileChanges() {
    try {
        const newName = editProfileName.value.trim();
        const newStatus = document.querySelector('.status-option.active').dataset.status;
    
        if (!newName) {
            showNotification("Пожалуйста, введите имя");
            return;
        }
    
        await database.ref(`users/${currentUser.uid}`).update({
            displayName: newName,
            status: newStatus
        });
    
        currentUser.displayName = newName;
        currentUser.status = newStatus;
    
        if (allUsers[currentUser.uid]) {
            allUsers[currentUser.uid].displayName = newName;
            allUsers[currentUser.uid].status = newStatus;
        }
    
        editProfileModal.classList.remove('active');
        showNotification("Профиль успешно обновлен!");
        updateUserProfileDisplay();
    
    } catch (error) {
        console.error("Ошибка при обновлении профиля:", error);
        showNotification("Не удалось обновить профиль. Попробуйте еще раз.");
    }
}

// УВЕДОМЛЕНИЯ
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.position = 'fixed';
    notification.style.top = isMobile ? '10px' : '20px';
    notification.style.right = isMobile ? '10px' : '20px';
    notification.style.left = isMobile ? '10px' : 'auto';
    notification.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
    notification.style.color = 'white';
    notification.style.padding = isMobile ? '12px 20px' : '15px 25px';
    notification.style.borderRadius = '12px';
    notification.style.boxShadow = '0 10px 25px rgba(102, 126, 234, 0.5)';
    notification.style.zIndex = '9999';
    notification.style.fontWeight = '600';
    notification.style.fontSize = isMobile ? '14px' : '14px';
    notification.style.transform = 'translateY(-100%)';
    notification.style.transition = 'transform 0.3s ease-out';
    notification.style.maxWidth = isMobile ? 'calc(100% - 20px)' : '300px';
    notification.style.wordBreak = 'break-word';
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.transform = 'translateY(0)';
    }, 10);

    setTimeout(() => {
        notification.style.transform = 'translateY(-100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
function resetCreateForm() {
    chatNameInput.value = '';
    chatDescriptionInput.value = '';
    privateUserId.value = '';
    privateUserSearchResults.innerHTML = '';
    privateUserSearchResults.style.display = 'none';
    selectedChatType = 'channel';
    chatTypeOptions.forEach(opt => {
        opt.classList.remove('active');
        if (opt.dataset.type === 'channel') {
            opt.classList.add('active');
        }
    });
    chatDescriptionGroup.style.display = 'block';
    privateChatUser.style.display = 'none';
    chatNameInput.disabled = false;
    chatNameInput.placeholder = "Введите название";
}

function resetAddContactForm() {
    contactSearch.value = '';
    contactSearchResults.innerHTML = '';
    confirmAddContactBtn.disabled = true;
}

function showWelcomeMessage(chatId) {
    messagesContainer.innerHTML = `
        <div style="text-align: center; padding: 60px 20px;">
            <div style="font-size: 48px; color: #475569; margin-bottom: 20px; opacity: 0.5;">
                <i class="fas fa-comments"></i>
            </div>
            <h3 style="color: #94a3b8; margin-bottom: 10px; font-weight: 500;">В этом чате пока нет сообщений</h3>
            <p style="color: #64748b; font-size: 14px;">Напишите первое сообщение!</p>
        </div>
    `;
}

function addLoadMoreButton(chatId) {
    const oldButton = document.getElementById('loadMoreMessagesBtn');
    if (oldButton) oldButton.remove();

    const checkRef = database.ref(`messages/${chatId}`)
        .orderByChild('timestamp')
        .limitToLast(messageLimit + 1)
        .once('value')
        .then((snapshot) => {
            const messagesData = snapshot.val();
            if (messagesData && Object.keys(messagesData).length > messageLimit) {
                const button = document.createElement('button');
                button.id = 'loadMoreMessagesBtn';
                button.className = 'load-more-btn';
                button.innerHTML = '<i class="fas fa-arrow-up"></i> Загрузить более ранние сообщения';
            
                button.addEventListener('click', () => {
                    loadMessages(chatId, true);
                });
            
                messagesContainer.insertBefore(button, messagesContainer.firstChild);
            }
        });
}

// ТИПИНГ
async function sendTypingStatus(isTyping) {
    try {
        await database.ref(`chats/${currentChatId}/typing/${currentUser.uid}`).set(
            isTyping ? {
                isTyping: true,
                timestamp: Date.now(),
                userName: currentUser.displayName
            } : null
        );
    } catch (error) {
        console.error("Ошибка отправки статуса печати:", error);
    }
}

function listenToTypingStatus(chatId) {
    if (typingListeners[chatId]) {
        typingListeners[chatId]();
    }

    const typingRef = database.ref(`chats/${chatId}/typing`);

    typingListeners[chatId] = typingRef.on('value', (snapshot) => {
        const typingData = snapshot.val();
        if (!typingData) {
            chatHeaderDescription.textContent = getChatDescription(currentChatId);
            return;
        }
    
        const typingUsers = [];
        for (const userId in typingData) {
            if (userId !== currentUser.uid && typingData[userId]?.isTyping) {
                typingUsers.push(typingData[userId].userName || "Кто-то");
            }
        }
    
        if (typingUsers.length > 0) {
            const text = typingUsers.length === 1 
                ? `Печатает...`
                : `${typingUsers.join(', ')} печатают...`;
            chatHeaderDescription.textContent = text;
        } else {
            chatHeaderDescription.textContent = getChatDescription(currentChatId);
        }
    });
}

function getChatDescription(chatId) {
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return '';

    if (chat.type === 'private') {
        return "Личный чат";
    } else {
        return chat.description || `Чат типа ${chat.type === 'channel' ? 'канал' : 'группа'}`;
    }
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
            chatHeaderName.textContent = newName;
        }
    
    } catch (error) {
        console.error("Ошибка обновления названия чата:", error);
        showNotification("Не удалось обновить название чата");
    }
}

async function getChatMembers(chatId) {
    try {
        const chat = await getChatInfo(chatId);
        if (!chat || !chat.members) return [];
    
        const members = [];
        for (const userId in chat.members) {
            if (allUsers[userId]) {
                members.push({
                    id: userId,
                    ...allUsers[userId]
                });
            }
        }
    
        return members;
    } catch (error) {
        console.error("Ошибка получения участников чата:", error);
        return [];
    }
}

// МОДАЛЬНЫЕ ОКНА ДЛЯ ЧАТА
function showChatInfoModal(chatId) {
    const modalHTML = `
        <div class="modal-overlay" id="chatInfoModal">
            <div class="modal">
                <div class="modal-header">
                    <h3>Информация о чате</h3>
                </div>
                <div class="modal-body" id="chatInfoContent">
                    <div class="loading">
                        <div class="loading-spinner"></div>
                        <p>Загрузка информации...</p>
                </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="closeChatInfoBtn">Закрыть</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = document.getElementById('chatInfoModal');
    
    loadChatInfo(chatId);
    
    document.getElementById('closeChatInfoBtn').addEventListener('click', () => {
        modal.remove();
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });

    modal.classList.add('active');
}

async function loadChatInfo(chatId) {
    try {
        const chat = await getChatInfo(chatId);
        const members = await getChatMembers(chatId);
        const messagesRef = database.ref(`messages/${chatId}`);
    
        messagesRef.once('value').then(snapshot => {
            const messagesCount = snapshot.val() ? Object.keys(snapshot.val()).length : 0;
        
            const infoContent = document.getElementById('chatInfoContent');
        
            let html = `
                <div class="profile-info">
                    <div class="profile-avatar-large" style="width: 100px; height: 100px; font-size: 40px;">
                        ${chat.type === 'channel' ? '<i class="fas fa-hashtag"></i>' : 
                          chat.type === 'group' ? '<i class="fas fa-users"></i>' : 
                          '<i class="fas fa-user"></i>'}
                    </div>
                    <div class="profile-name">${chat.name || 'Без названия'}</div>
                    <div class="profile-status" style="background: ${
                        chat.type === 'channel' ? 'rgba(245, 158, 11, 0.2)' :
                        chat.type === 'group' ? 'rgba(16, 185, 129, 0.2)' :
                        'rgba(102, 126, 234, 0.2)'
                    }">
                        ${chat.type === 'channel' ? 'Канал' : 
                         chat.type === 'group' ? 'Групповой чат' : 
                         'Личный чат'}
                    </div>
                </div>
            
                <div class="profile-details">
                    <div class="profile-detail">
                        <span class="detail-label">Участников:</span>
                        <span class="detail-value">${members.length}</span>
                    </div>
                    <div class="profile-detail">
                        <span class="detail-label">Сообщений:</span>
                        <span class="detail-value">${messagesCount}</span>
                    </div>
                    <div class="profile-detail">
                        <span class="detail-label">Создан:</span>
                        <span class="detail-value">${new Date(chat.createdAt).toLocaleDateString('ru-RU')}</span>
                    </div>
            `;
                    
            if (chat.description) {
                html += `
                    <div class="profile-detail">
                        <span class="detail-label">Описание:</span>
                        <span class="detail-value">${chat.description}</span>
                    </div>
                `;
            }
        
            html += `
                </div>
            
                <div style="margin-top: 24px;">
                    <h4 style="color: #e2e8f0; margin-bottom: 16px; font-size: 16px;">Участники:</h4>
                    <div id="chatMembersList" style="max-height: 200px; overflow-y: auto;">
            `;
                    
            members.forEach(member => {
                html += `
                    <div class="search-result-item" style="margin-bottom: 8px;">
                        <div class="search-result-avatar">
                            ${member.displayName.charAt(0)}
                        </div>
                        <div class="search-result-info">
                            <div class="search-result-name">${member.displayName}</div>
                            <div class="search-result-id">${member.customId || 'ID_NOT_SET'}</div>
                        </div>
                        ${member.id !== currentUser.uid ? `
                        <button class="add-user-btn" style="opacity: 0.5; cursor: default;" disabled>
                            Участник
                        </button>
                        ` : `
                        <button class="add-user-btn" style="background: #8b5cf6;">
                            Вы
                        </button>
                        `}
                    </div>
                `;
            });
        
            html += `
                    </div>
                </div>
            `;
            
            infoContent.innerHTML = html;
        });
    
    } catch (error) {
        console.error("Ошибка загрузки информации о чате:", error);
        document.getElementById('chatInfoContent').innerHTML = `
            <div class="no-results">
                Не удалось загрузить информацию о чате
            </div>
        `;
    }
}

function showChatContextMenu(event, chatId, chatType) {
    event.stopPropagation();

    const existingMenu = document.querySelector('.context-menu');
    if (existingMenu) existingMenu.remove();

    const menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.style.cssText = `
        position: absolute;
        background: rgba(30, 41, 59, 0.95);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 8px;
        z-index: 1000;
        min-width: 180px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(20px);
    `;

    const rect = event.target.getBoundingClientRect();
    menu.style.top = `${rect.bottom + 5}px`;
    menu.style.right = `${window.innerWidth - rect.right + 10}px`;

    let menuItems = [];

    if (chatType !== 'private') {
        menuItems.push({
            icon: 'fa-edit',
            text: 'Изменить название',
            action: () => {
                const newName = prompt('Введите новое название чата:');
                if (newName && newName.trim()) {
                    updateChatName(chatId, newName.trim());
                }
            }
        });
    }

    menuItems.push(
        {
            icon: 'fa-users',
            text: 'Информация о чате',
            action: () => showChatInfoModal(chatId)
        },
        {
            icon: 'fa-sign-out-alt',
            text: 'Покинуть чат',
            action: () => showLeaveChatConfirmation(chatId),
            color: '#ef4444'
        }
    );
    
    menuItems.forEach(item => {
        const menuItem = document.createElement('div');
        menuItem.style.cssText = `
            padding: 12px 16px;
            display: flex;
            align-items: center;
            gap: 12px;
            cursor: pointer;
            border-radius: 8px;
            color: ${item.color || '#cbd5e1'};
            font-weight: 500;
            font-size: 14px;
            transition: background 0.2s;
        `;
    
        menuItem.innerHTML = `
            <i class="fas ${item.icon}" style="width: 16px;"></i>
            <span>${item.text}</span>
        `;
    
        menuItem.addEventListener('mouseenter', () => {
            menuItem.style.background = 'rgba(255, 255, 255, 0.1)';
        });
    
        menuItem.addEventListener('mouseleave', () => {
            menuItem.style.background = 'transparent';
        });
    
        menuItem.addEventListener('click', item.action);
    
        menu.appendChild(menuItem);
    });

    document.body.appendChild(menu);

    const closeMenu = (e) => {
        if (!menu.contains(e.target) && e.target !== event.target) {
            menu.remove();
            document.removeEventListener('click', closeMenu);
        }
    };

    setTimeout(() => {
        document.addEventListener('click', closeMenu);
    }, 10);
}

function searchInChat(chatId, query) {
    const messagesRef = database.ref(`messages/${chatId}`);

    messagesRef.once('value').then(snapshot => {
        const messagesData = snapshot.val();
        if (!messagesData) return;
    
        const searchResults = [];
    
        Object.keys(messagesData).forEach(key => {
            const message = messagesData[key];
        
            if (message.text && message.text.toLowerCase().includes(query.toLowerCase()) && message.type !== 'system') {
                searchResults.push({
                    id: key,
                    ...message,
                    chatId: chatId
                });
            }
        });
    
        if (searchResults.length > 0) {
            showSearchResultsModal(searchResults, query);
        } else {
            showNotification("Сообщения не найдены");
        }
    });
}

function showSearchResultsModal(results, query) {
    const modalHTML = `
        <div class="modal-overlay" id="searchResultsModal">
            <div class="modal">
                <div class="modal-header">
                    <h3>Результаты поиска: "${query}"</h3>
                </div>
                <div class="modal-body">
                    <div id="searchResultsList" style="max-height: 400px; overflow-y: auto;">
                        ${results.map(result => `
                            <div class="search-result-item" data-message-id="${result.id}" data-chat-id="${result.chatId}" 
                                 style="margin-bottom: 12px; cursor: pointer;">
                                <div class="search-result-avatar">
                                    ${result.senderName ? result.senderName.charAt(0) : '?'}
                                </div>
                                <div class="search-result-info">
                                    <div class="search-result-name">
                                        ${result.senderName || 'Неизвестный'}
                                        <span style="color: #64748b; font-size: 12px; margin-left: 8px;">
                                            ${new Date(result.timestamp).toLocaleDateString('ru-RU')}
                                        </span>
                                    </div>
                                    <div class="search-result-id" style="color: #94a3b8; margin-top: 4px;">
                                        ${result.text}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="closeSearchResultsBtn">Закрыть</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = document.getElementById('searchResultsModal');
    
    document.querySelectorAll('#searchResultsList .search-result-item').forEach(item => {
        item.addEventListener('click', () => {
            const chatId = item.dataset.chatId;
            const messageId = item.dataset.messageId;
        
            modal.remove();
        
            const chatElement = document.querySelector(`[data-chat-id="${chatId}"]`);
            if (chatElement) {
                chatElement.click();
            
                setTimeout(() => {
                    const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
                    if (messageElement) {
                        messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        messageElement.style.background = 'rgba(139, 92, 246, 0.3)';
                        messageElement.style.transition = 'background 2s';
                    
                        setTimeout(() => {
                            messageElement.style.background = '';
                        }, 2000);
                    }
                }, 500);
            }
        });
    });

    document.getElementById('closeSearchResultsBtn').addEventListener('click', () => {
        modal.remove();
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });

    modal.classList.add('active');
}

function showAddMemberModal(chatId) {
    const existingModal = document.getElementById('addMemberModal');
    if (existingModal) {
        existingModal.remove();
    }

    const modalHTML = `
        <div class="modal-overlay" id="addMemberModal">
            <div class="modal">
                <div class="modal-header">
                    <h3>Добавить участника</h3>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="memberSearch">Найти пользователя</label>
                        <input type="text" id="memberSearch" placeholder="Введите имя или ID пользователя...">
                        <div class="search-results" id="memberSearchResults"></div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="closeAddMemberBtn">Закрыть</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = document.getElementById('addMemberModal');
    
    const memberSearch = document.getElementById('memberSearch');
    const memberSearchResults = document.getElementById('memberSearchResults');
    
    getChatInfo(chatId).then(chat => {
        const existingMemberIds = chat.members ? Object.keys(chat.members) : [];
        
        memberSearch.addEventListener('input', () => {
            const query = memberSearch.value.toLowerCase().trim();
            memberSearchResults.innerHTML = '';
        
            if (!query) {
                memberSearchResults.style.display = 'none';
                return;
            }
        
            const results = [];
        
            for (const userId in allUsers) {
                const user = allUsers[userId];
            
                if (userId === currentUser.uid || existingMemberIds.includes(userId)) {
                    continue;
                }
            
                const matchesQuery = 
                    (user.displayName && user.displayName.toLowerCase().includes(query)) || 
                    (user.customId && user.customId.toLowerCase().includes(query));
            
                if (matchesQuery) {
                    const isContact = contacts.some(contact => contact.userId === userId);
                
                    results.push({
                        userId: userId,
                        displayName: user.displayName || "Без имени",
                        customId: user.customId || `user_${userId.substr(0, 8)}`,
                        isContact: isContact,
                        status: user.status || 'offline'
                    });
                }
            }
        
            if (results.length > 0) {
                memberSearchResults.style.display = 'block';
            
                results.forEach(result => {
                    const resultItem = document.createElement('div');
                    resultItem.className = 'search-result-item';
                    resultItem.innerHTML = `
                        <div class="search-result-avatar">
                            ${result.displayName.charAt(0)}
                        </div>
                        <div class="search-result-info">
                            <div class="search-result-name">
                                ${result.displayName}
                                ${result.isContact ? '<span style="color: #10b981; font-size: 12px; margin-left: 8px;">(контакт)</span>' : ''}
                            </div>
                            <div class="search-result-id">${result.customId}</div>
                        </div>
                        <button class="add-user-btn" data-user-id="${result.userId}">
                            Добавить
                        </button>
                    `;
                    
                    const addBtn = resultItem.querySelector('.add-user-btn');
                    addBtn.addEventListener('click', async (e) => {
                        e.stopPropagation();
                        const userId = e.target.dataset.userId;
                        
                        const user = allUsers[userId];
                        if (user) {
                            await inviteToChat(chatId, userId);
                            modal.remove();
                        }
                    });
                
                    memberSearchResults.appendChild(resultItem);
                });
            } else {
                memberSearchResults.innerHTML = `
                    <div class="no-results">
                        <i class="fas fa-user-slash" style="font-size: 32px; margin-bottom: 10px; opacity: 0.5;"></i>
                        <p>Пользователи не найдены</p>
                    </div>
                `;
                memberSearchResults.style.display = 'block';
            }
        });
    
        setTimeout(() => {
            memberSearch.focus();
        }, 100);
    });

    document.getElementById('closeAddMemberBtn').addEventListener('click', () => {
        modal.remove();
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });

    modal.classList.add('active');
}

// ОБРАБОТЧИКИ СОБЫТИЙ
function setupEventListeners() {
    // АВТОРИЗАЦИЯ
    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const formName = tab.dataset.form;
        
            authTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        
            loginForm.classList.remove('active');
            registerForm.classList.remove('active');
        
            if (formName === 'login') {
                loginForm.classList.add('active');
            } else {
                registerForm.classList.add('active');
            }
        
            hideError();
        });
    });

    loginBtn.addEventListener('click', loginUser);
    quickLoginBtn.addEventListener('click', quickLogin);
    registerBtn.addEventListener('click', registerUser);

    // СОЗДАНИЕ ЧАТА
    createChatBtn.addEventListener('click', () => {
        createChatModal.classList.add('active');
    });

    cancelCreateBtn.addEventListener('click', () => {
        createChatModal.classList.remove('active');
        resetCreateForm();
    });

    chatTypeOptions.forEach(option => {
        option.addEventListener('click', () => {
            chatTypeOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            selectedChatType = option.dataset.type;
        
            if (selectedChatType === 'private') {
                chatDescriptionGroup.style.display = 'none';
                privateChatUser.style.display = 'block';
                chatNameInput.placeholder = "Имя чата (автоматически)";
                chatNameInput.disabled = true;
            } else {
                chatDescriptionGroup.style.display = 'block';
                privateChatUser.style.display = 'none';
                chatNameInput.placeholder = "Введите название";
                chatNameInput.disabled = false;
            }
        });
    });

    confirmCreateBtn.addEventListener('click', createNewChat);

    // ОТПРАВКА СООБЩЕНИЙ
    sendMessageBtn.addEventListener('click', sendMessage);

    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    messageInput.addEventListener('input', () => {
        if (!currentChatId) return;
    
        sendTypingStatus(true);
    
        clearTimeout(typingTimeout);
    
        typingTimeout = setTimeout(() => {
            sendTypingStatus(false);
        }, 3000);
    });

    // ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК
    sidebarTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
        
            sidebarTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentTab = tabName;
        
            if (tabName === 'chats') {
                chatsContainer.classList.add('active');
                chatsContainer.style.display = 'flex';
                contactsContainer.classList.remove('active');
                contactsContainer.style.display = 'none';
            } else {
                chatsContainer.classList.remove('active');
                chatsContainer.style.display = 'none';
                contactsContainer.classList.add('active');
                contactsContainer.style.display = 'flex';
            }
        });
    });

    // ПОИСК
    searchInput.addEventListener('input', handleSearch);

    // ПРОФИЛЬ
    userProfileBtn.addEventListener('click', openProfileModal);
    logoBtn.addEventListener('click', openProfileModal);
    copyUserIdBtn.addEventListener('click', () => copyUserIdToClipboard(profileUserId));
    copyWelcomeIdBtn.addEventListener('click', () => copyUserIdToClipboard(welcomeUserId));
    logoutBtn.addEventListener('click', logoutUser);

    // КОНТАКТЫ
    confirmAddContactBtn.addEventListener('click', async () => {
        if (!contactSearch) return;
        
        const searchValue = contactSearch.value.trim();
    
        if (!searchValue) {
            showNotification("Введите ID или имя пользователя");
            return;
        }
    
        let foundUserId = null;
    
        for (const userId in allUsers) {
            const user = allUsers[userId];
            if (user.customId && user.customId.toLowerCase() === searchValue.toLowerCase() && userId !== currentUser.uid) {
                foundUserId = userId;
                break;
            }
        }
    
        if (!foundUserId) {
            for (const userId in allUsers) {
                const user = allUsers[userId];
                if (user.displayName && user.displayName.toLowerCase().includes(searchValue.toLowerCase()) && userId !== currentUser.uid) {
                    foundUserId = userId;
                    break;
                }
            }
        }
    
        if (!foundUserId && allUsers[searchValue] && searchValue !== currentUser.uid) {
            foundUserId = searchValue;
        }
    
        if (foundUserId) {
            await addContact(foundUserId);
        } else {
            showNotification("Пользователь не найден");
        }
    });

    addContactBtn.addEventListener('click', () => {
        addContactModal.classList.add('active');
        setTimeout(() => {
            if (contactSearch) {
                contactSearch.focus();
                handleContactSearch();
            }
        }, 100);
    });

    cancelAddContactBtn.addEventListener('click', () => {
        addContactModal.classList.remove('active');
        resetAddContactForm();
    });

    contactSearch.addEventListener('input', handleContactSearch);
    privateUserId.addEventListener('input', handlePrivateUserSearch);

    // РЕДАКТИРОВАНИЕ ПРОФИЛЯ
    editProfileBtn.addEventListener('click', () => {
        profileModal.classList.remove('active');
        editProfileModal.classList.add('active');
        editProfileName.value = currentUser.displayName;
    
        statusOptions.forEach(opt => {
            opt.classList.remove('active');
            if (opt.dataset.status === currentUser.status) {
                opt.classList.add('active');
            }
        });
    });

    cancelEditProfileBtn.addEventListener('click', () => {
        editProfileModal.classList.remove('active');
        profileModal.classList.add('active');
    });

    saveProfileBtn.addEventListener('click', saveProfileChanges);

    statusOptions.forEach(option => {
        option.addEventListener('click', () => {
            statusOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
        });
    });

    // ЗАКРЫТИЕ МОДАЛЬНЫХ ОКОН
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                if (modal.id === 'createChatModal') resetCreateForm();
                if (modal.id === 'addContactModal') resetAddContactForm();
                if (modal.id === 'editProfileModal') {
                    profileModal.classList.add('active');
                }
            }
        });
    });

    // Закрытие контекстного меню сообщений при клике вне его
    document.addEventListener('click', (e) => {
        if (!messageContextMenu.contains(e.target) && !e.target.closest('.message-content')) {
            messageContextMenu.classList.remove('active');
        }
    });

    // Обработка отмены ответа по Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            // Отмена ответа на сообщение
            if (replyToMessage) {
                hideReplyPreview();
                showNotification("Ответ отменен");
            }
            
            // Закрытие модальных окон подтверждения
            if (confirmLeaveChatModal.classList.contains('active')) {
                confirmLeaveChatModal.classList.remove('active');
                pendingChatIdToLeave = null;
            }
            
            if (confirmDeleteMessageModal.classList.contains('active')) {
                confirmDeleteMessageModal.classList.remove('active');
                pendingMessageToDelete = { id: null, chatId: null };
            }
        }
    });
    
    // Обработка скролла в контейнере сообщений
    messagesContainer.addEventListener('scroll', () => {
        const scrollTop = messagesContainer.scrollTop;
        const scrollHeight = messagesContainer.scrollHeight;
        const clientHeight = messagesContainer.clientHeight;
        
        userScrolledUp = scrollTop + clientHeight < scrollHeight - 100;
        autoScrollEnabled = !userScrolledUp;
    });

    // Обработчики для модального окна подтверждения выхода из чата
    cancelLeaveBtn.addEventListener('click', () => {
        confirmLeaveChatModal.classList.remove('active');
        pendingChatIdToLeave = null;
    });

    confirmLeaveBtn.addEventListener('click', confirmLeaveChat);

    // Обработчики для модального окна подтверждения удаления сообщения
    cancelDeleteBtn.addEventListener('click', () => {
        confirmDeleteMessageModal.classList.remove('active');
        pendingMessageToDelete = { id: null, chatId: null };
    });

    confirmDeleteBtn.addEventListener('click', confirmDeleteMessage);

    // Закрытие модальных окон при клике на фон
    confirmLeaveChatModal.addEventListener('click', (e) => {
        if (e.target === confirmLeaveChatModal) {
            confirmLeaveChatModal.classList.remove('active');
            pendingChatIdToLeave = null;
        }
    });

    confirmDeleteMessageModal.addEventListener('click', (e) => {
        if (e.target === confirmDeleteMessageModal) {
            confirmDeleteMessageModal.classList.remove('active');
            pendingMessageToDelete = { id: null, chatId: null };
        }
    });
}

function setupUserDataListener() {
    const usersRef = database.ref('users');
    usersRef.on('child_changed', (snapshot) => {
        const userId = snapshot.key;
        const userData = snapshot.val();
    
        allUsers[userId] = {
            uid: userId,
            displayName: userData.displayName || "Пользователь",
            customId: userData.customId || `user_${userId.substr(0, 8)}`,
            status: userData.status || 'offline'
        };
    
        if (contacts.some(contact => contact.userId === userId)) {
            const contactElement = document.querySelector(`.contact-item[data-user-id="${userId}"]`);
            if (contactElement) {
                const statusElement = contactElement.querySelector('.contact-status');
                const nameElement = contactElement.querySelector('.contact-name');
                const idElement = contactElement.querySelector('.chat-time');
            
                if (statusElement) {
                    statusElement.textContent = userData.status || 'offline';
                    statusElement.className = `contact-status ${userData.status || 'offline'}`;
                }
            
                if (nameElement && userData.displayName) {
                    nameElement.textContent = userData.displayName;
                    const avatarElement = contactElement.querySelector('.contact-avatar');
                    if (avatarElement) {
                        avatarElement.textContent = userData.displayName.charAt(0);
                    }
                }
            
                if (idElement && userData.customId) {
                    idElement.textContent = userData.customId;
                }
            }
        }
    });
}

// ОЧИСТКА ПРИ ЗАКРЫТИИ
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
});

// ОПТИМИЗАЦИЯ ПРИ ЗАГРУЗКЕ
window.addEventListener('load', () => {
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



// Функция показа модального окна подтверждения выхода из чата
function showLeaveChatConfirmation(chatId) {
    pendingChatIdToLeave = chatId;
    confirmLeaveChatModal.classList.add('active');
    
    // Закрываем контекстное меню если оно открыто
    const contextMenu = document.querySelector('.context-menu');
    if (contextMenu) {
        contextMenu.remove();
    }
}

// Функция показа модального окна подтверждения удаления сообщения
function showDeleteMessageConfirmation(messageId, chatId, messageText, senderName, timestamp) {
    pendingMessageToDelete = {
        id: messageId,
        chatId: chatId
    };
    
    // Заполняем предпросмотр сообщения
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
    
    // Закрываем контекстное меню сообщений
    messageContextMenu.classList.remove('active');
}

// Функция подтверждения выхода из чата
async function confirmLeaveChat() {
    if (!pendingChatIdToLeave) return;
    
    try {
        await leaveChat(pendingChatIdToLeave);
        confirmLeaveChatModal.classList.remove('active');
        pendingChatIdToLeave = null;
    } catch (error) {
        console.error("Ошибка при выходе из чата:", error);
        showNotification("Не удалось покинуть чат: " + error.message);
    }
}

// Функция подтверждения удаления сообщения
async function confirmDeleteMessage() {
    if (!pendingMessageToDelete.id || !pendingMessageToDelete.chatId) return;
    
    try {
        await database.ref(`messages/${pendingMessageToDelete.chatId}/${pendingMessageToDelete.id}`).remove();
        showNotification("Сообщение удалено");
        
        // Удаляем элемент из DOM
        const messageElement = document.querySelector(`[data-message-id="${pendingMessageToDelete.id}"]`);
        if (messageElement) {
            messageElement.remove();
        }
        
        confirmDeleteMessageModal.classList.remove('active');
        pendingMessageToDelete = { id: null, chatId: null };
        
    } catch (error) {
        console.error("Ошибка при удалении сообщения:", error);
        showNotification("Не удалось удалить сообщение");
    }
}