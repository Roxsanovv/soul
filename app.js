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

// Главный экран элементы
const homeScreen = document.getElementById('homeScreen');
const homeUserId = document.getElementById('homeUserId');
const copyHomeIdBtn = document.getElementById('copyHomeIdBtn');
const homeCreateChatBtn = document.getElementById('homeCreateChatBtn');
const homeAddContactBtn = document.getElementById('homeAddContactBtn');
const homeTabs = document.querySelectorAll('.home-tab');
const homeChatsList = document.getElementById('homeChatsList');
const homeContactsList = document.getElementById('homeContactsList');

// Экран чата элементы
const chatScreen = document.getElementById('chatScreen');
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

// Контекстное меню сообщений
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

async function initializeApp() {
    setupEventListeners();
    detectMobile();
    initMobileFeatures();

    // Проверяем авторизацию
    authUnsubscribe = auth.onAuthStateChanged(async (user) => {
        if (user) {
            // Пользователь авторизован
            await loadUserData(user.uid);
            authContainer.style.display = 'none';
            mainContainer.style.display = 'block';
            showNotification("Добро пожаловать в Soul!");
            
            // Обновляем ID в разных местах
            updateUserIDs();
            
        } else {
            // Пользователь не авторизован
            authContainer.style.display = 'flex';
            mainContainer.style.display = 'none';
        }
    });
}

// Мобильные функции
function detectMobile() {
    isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        document.body.classList.add('mobile');
        document.body.classList.remove('desktop');
    } else {
        document.body.classList.add('desktop');
        document.body.classList.remove('mobile');
    }
    
    window.addEventListener('resize', () => {
        isMobile = window.innerWidth <= 768;
        if (isMobile) {
            document.body.classList.add('mobile');
            document.body.classList.remove('desktop');
        } else {
            document.body.classList.add('desktop');
            document.body.classList.remove('mobile');
        }
    });
}

function initMobileFeatures() {
    if (!isMobile) return;
    
    // Фикс для iOS клавиатуры
    messageInput.addEventListener('focus', () => {
        setTimeout(() => {
            window.scrollTo(0, 0);
        }, 100);
    });
    
    // Фикс для iOS безопасной зоны
    fixSafeArea();
}

function fixSafeArea() {
    // Добавляем padding для безопасной зоны iOS
    const style = document.createElement('style');
    style.textContent = `
        .safe-area-bottom {
            padding-bottom: env(safe-area-inset-bottom, 20px);
        }
        .safe-area-top {
            padding-top: env(safe-area-inset-top, 0px);
        }
    `;
    document.head.appendChild(style);
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
    
        const userRef = database.ref(`users/${userId}`);
        const snapshot = await userRef.once('value');
    
        if (snapshot.exists()) {
            currentUser = {
                uid: userId,
                ...snapshot.val()
            };
        } else {
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
    
        await database.ref(`users/${userId}`).update({
            status: "online",
            lastSeen: null
        });
    
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
            
            for (const userId in usersData) {
                if (currentUser && userId === currentUser.uid) continue;
                
                allUsers[userId] = {
                    uid: userId,
                    displayName: usersData[userId].displayName || "Пользователь",
                    customId: usersData[userId].customId || `user_${userId.substr(0, 8)}`,
                    status: usersData[userId].status || 'offline'
                };
            }
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
        updateProfileChatsCount();
    
    } catch (error) {
        console.error("Ошибка загрузки чатов:", error);
    }
}

function updateHomeChats() {
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
            createChatModal.classList.add('active');
        });
        return;
    }
    
    chats.forEach(chat => {
        const chatElement = createChatElement(chat);
        homeChatsList.appendChild(chatElement);
    });
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
        openChat(chat.id);
    });

    return chatElement;
}

async function loadContacts() {
    try {
        const contactsRef = database.ref(`users/${currentUser.uid}/contacts`);
    
        contactsRef.on('value', (snapshot) => {
            updateContactsList(snapshot);
        });
    } catch (error) {
        console.error("Ошибка загрузки контактов:", error);
    }
}

function updateContactsList(snapshot) {
    homeContactsList.innerHTML = '';
    
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
            homeContactsList.appendChild(contactElement);
        });
    }

    if (contacts.length === 0) {
        homeContactsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-user-friends"></i>
                <h3>Контакты отсутствуют</h3>
                <p>Добавьте контакты, чтобы начать общение</p>
                <button class="action-btn secondary" id="addFirstContactBtn">
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

    homeScreen.style.display = 'none';
    chatScreen.style.display = 'flex';
    
    if (isMobile) {
        closeMobileSidebar();
    }

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

    loadMessages(chatId);
}

function showHomeScreen() {
    chatScreen.style.display = 'none';
    homeScreen.style.display = 'block';
    currentChatId = null;
    replyToMessage = null;
    hideReplyPreview();
    
    if (isMobile) {
        closeMobileSidebar();
    }
}

// СООБЩЕНИЯ
function loadMessages(chatId) {
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
            messagesContainer.appendChild(messageElement);
        
            setTimeout(() => {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
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
            messageInput.value = '';
            messageInput.style.height = '56px';
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
    
        messageInput.value = '';
        messageInput.style.height = '56px';
        hideReplyPreview();
        replyToMessage = null;
        
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
    
    messageInput.value = '';
    messageInput.style.height = '56px';
    hideReplyPreview();
    replyToMessage = null;
}

// КОНТЕКСТНОЕ МЕНЮ ДЛЯ СООБЩЕНИЙ
function showMessageContextMenu(event, message, isOutgoing) {
    event.preventDefault();
    event.stopPropagation();

    contextDelete.style.display = isOutgoing ? 'flex' : 'none';

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

    messageContextMenu.classList.remove('active');
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

    const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
    if (!messageElement) {
        messageContextMenu.classList.remove('active');
        return;
    }
    
    const messageText = messageElement.querySelector('.message-text')?.textContent || '';
    const senderName = messageElement.querySelector('.message-sender-name')?.textContent.split(' ')[0] || '';
    const timeElement = messageElement.querySelector('.message-time');
    const timestamp = timeElement ? new Date().getTime() : Date.now();
    
    showDeleteMessageConfirmation(messageId, currentChatId, messageText, senderName, timestamp);
});

// МОДАЛЬНЫЕ ОКНА ПОДТВЕРЖДЕНИЯ
function showLeaveChatConfirmation(chatId) {
    confirmLeaveChatModal.classList.add('active');
    
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

function showDeleteMessageConfirmation(messageId, chatId, messageText, senderName, timestamp) {
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
    messageContextMenu.classList.remove('active');
    
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
    const name = chatNameInput.value.trim();
    const description = chatDescriptionInput.value.trim();

    try {
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
    
        const chatElement = createChatElement(newChat);
        homeChatsList.appendChild(chatElement);
    
        setupChatListener(chatId);
    
        createChatModal.classList.remove('active');
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
        }
    });
}

// ПОИСК И КОНТАКТЫ
async function addContact(targetUserId) {
    try {
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
    
        await database.ref(`users/${currentUser.uid}/contacts/${targetUserId}`).set(contactData);
    
        contacts.push({
            userId: targetUserId,
            ...contactData
        });
    
        showNotification(`Пользователь ${targetUser.displayName} добавлен в контакты!`);
    
        addContactModal.classList.remove('active');
        resetAddContactForm();
    
        updateContactsList({ 
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
    
    if (isMobile) {
        closeMobileSidebar();
    }
}

function updateUserProfileDisplay() {
    if (!currentUser) return;

    profileName.textContent = currentUser.displayName;
    profileUserId.textContent = currentUser.customId;
    document.getElementById('profileAvatarLarge').textContent = currentUser.displayName.charAt(0);
    document.getElementById('profileStatus').textContent = currentUser.status;
    document.getElementById('profileStatus').className = `profile-status ${currentUser.status}`;
    document.getElementById('profileJoinDate').textContent = currentUser.joinDate;

    updateProfileContactsCount();
    updateProfileChatsCount();
}

function updateUserIDs() {
    if (!currentUser) return;
    
    homeUserId.textContent = currentUser.customId;
    mobileUserId.textContent = currentUser.customId;
    profileUserId.textContent = currentUser.customId;
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

function showWelcomeMessage() {
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
    updateContactsList({ val: () => ({}) });
}

// МОБИЛЬНЫЕ ФУНКЦИИ
function openMobileSidebar() {
    mobileSidebarOverlay.classList.add('active');
    mobileSidebar.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeMobileSidebar() {
    mobileSidebarOverlay.classList.remove('active');
    mobileSidebar.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function setupMobileSidebar() {
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

// ПОИСК ПОЛЬЗОВАТЕЛЕЙ
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

    // МОБИЛЬНЫЕ КНОПКИ
    mobileMenuBtn.addEventListener('click', openMobileSidebar);
    mobileProfileBtn.addEventListener('click', openProfileModal);
    mobileSidebarClose.addEventListener('click', closeMobileSidebar);
    mobileSidebarOverlay.addEventListener('click', closeMobileSidebar);
    setupMobileSidebar();
    
    mobileCreateChatBtn.addEventListener('click', () => {
        createChatModal.classList.add('active');
        closeMobileSidebar();
    });
    
    mobileAddContactBtn.addEventListener('click', () => {
        addContactModal.classList.add('active');
        closeMobileSidebar();
    });

    // ГЛАВНЫЙ ЭКРАН
    homeCreateChatBtn.addEventListener('click', () => {
        createChatModal.classList.add('active');
    });
    
    homeAddContactBtn.addEventListener('click', () => {
        addContactModal.classList.add('active');
    });
    
    homeTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            
            homeTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            document.querySelectorAll('.home-tab-pane').forEach(pane => {
                pane.classList.remove('active');
            });
            
            document.getElementById(`home${tabName.charAt(0).toUpperCase() + tabName.slice(1)}Pane`).classList.add('active');
        });
    });

    // ЭКРАН ЧАТА
    backToHomeBtn.addEventListener('click', showHomeScreen);
    sendMessageBtn.addEventListener('click', sendMessage);
    
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

    // СОЗДАНИЕ ЧАТА
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

    // КОНТАКТЫ
    cancelAddContactBtn.addEventListener('click', () => {
        addContactModal.classList.remove('active');
        resetAddContactForm();
    });

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

    // ПОИСК ПОЛЬЗОВАТЕЛЕЙ ДЛЯ ЛИЧНЫХ ЧАТОВ
    privateUserId.addEventListener('input', handlePrivateUserSearch);

    // ПРОФИЛЬ
    copyUserIdBtn.addEventListener('click', () => copyUserIdToClipboard(profileUserId));
    copyHomeIdBtn.addEventListener('click', () => copyUserIdToClipboard(homeUserId));
    copyMobileIdBtn.addEventListener('click', () => copyUserIdToClipboard(mobileUserId));
    
    logoutBtn.addEventListener('click', logoutUser);
    mobileLogoutBtn.addEventListener('click', logoutUser);

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

    // МОДАЛЬНЫЕ ОКНА ПОДТВЕРЖДЕНИЯ
    cancelLeaveBtn.addEventListener('click', () => {
        confirmLeaveChatModal.classList.remove('active');
    });

    cancelDeleteBtn.addEventListener('click', () => {
        confirmDeleteMessageModal.classList.remove('active');
    });

    // ЗАКРЫТИЕ МОДАЛЬНЫХ ОКОН ПРИ КЛИКЕ НА ФОН
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

    // Закрытие модальных окон кнопками закрытия
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal-overlay');
            modal.classList.remove('active');
            
            if (modal.id === 'createChatModal') resetCreateForm();
            if (modal.id === 'addContactModal') resetAddContactForm();
            if (modal.id === 'editProfileModal') {
                profileModal.classList.add('active');
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
            
            messageContextMenu.classList.remove('active');
            
            if (isMobile && mobileSidebar.classList.contains('active')) {
                closeMobileSidebar();
            }
        }
    });

    // Автоматическое изменение высоты textarea
    messageInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });

    // Предотвращение стандартного контекстного меню
    document.addEventListener('contextmenu', (e) => {
        if (e.target.closest('.message-content')) {
            e.preventDefault();
        }
    });
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