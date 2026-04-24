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
let verifiedChannels = {};
let currentChatId = null;
let selectedChatType = "group";
let replyToMessage = null;
let isMobile = false;
let selectedPhoto = null;
let selectedFile = null;
let searchTimeouts = {};
let authUnsubscribe = null;
let contactsListener = null;
let chatsListener = null;
let verifiedUsersListener = null;
let messageListeners = {};
let connectionCheckInterval = null;
let inactivityTimer = null;
let lastActivityTime = Date.now();
let selectedContactsForGroup = new Set();
let currentGroupChatId = null;
let groupInviteLinks = {};
let currentStickerPack = null;
let activeContextMenu = null;
let contextMenuTimeout = null;

// ================================================
// КОНФИГУРАЦИЯ СТИКЕРОВ
// ================================================
let stickerPacks = {
    pack1: {
        id: "pack1",
        name: "Boss",
        previewImage: "img/stickers/boss/sticker7.png",
        stickers: [
            { url: "img/stickers/boss/sticker1.png", name: "Стикер 1" },
            { url: "img/stickers/boss/sticker2.png", name: "Стикер 2" },
            { url: "img/stickers/boss/sticker3.png", name: "Стикер 3" },
            { url: "img/stickers/boss/sticker4.png", name: "Стикер 4" },
            { url: "img/stickers/boss/sticker5.png", name: "Стикер 5" },
            { url: "img/stickers/boss/sticker6.png", name: "Стикер 6" },
            { url: "img/stickers/boss/sticker7.png", name: "Стикер 7" },
            { url: "img/stickers/boss/sticker8.png", name: "Стикер 8" },
            { url: "img/stickers/boss/sticker9.png", name: "Стикер 9" }
        ]
    },
    pack2: {
        id: "pack2",
        name: "Movie",
        previewImage: "img/stickers/Movie/John Wick.png",
        stickers: [
            { url: "img/stickers/Movie/Arcane Jinx Pout.png", name: "Jinx Pout" },
            { url: "img/stickers/Movie/Chibi Pennywise.png", name: "Pennywise" },
            { url: "img/stickers/Movie/John Wick.png", name: "John Wick" },
            { url: "img/stickers/Movie/Kermit Frog.png", name: "Kermit Frog" },
            { url: "img/stickers/Movie/Optimus Prime.png", name: "Optimus Prime" }
        ]
    },
    pack3: {
        id: "pack3",
        name: "Marvel",
        previewImage: "img/stickers/Marvel/Deadpool.png",
        stickers: [
            { url: "img/stickers/Marvel/Deadpool.png", name: "Deadpool" },
            { url: "img/stickers/Marvel/Groot.png", name: "Groot" },
            { url: "img/stickers/Marvel/Iron Man.png", name: "Iron Man" },
            { url: "img/stickers/Marvel/Loki.png", name: "Loki" },
            { url: "img/stickers/Marvel/Spiderman.png", name: "Spiderman" },
            { url: "img/stickers/Marvel/Venom.png", name: "Venom" }
        ]
    }
};

// ================================================
// ДОМ ЭЛЕМЕНТЫ
// ================================================
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
const registerName = document.getElementById('registerName');
const registerEmail = document.getElementById('registerEmail');
const registerPassword = document.getElementById('registerPassword');
const registerConfirmPassword = document.getElementById('registerConfirmPassword');
const registerBtn = document.getElementById('registerBtn');

const desktopSidebar = document.getElementById('desktopSidebar');
const desktopUserAvatar = document.getElementById('desktopUserAvatar');
const desktopUserName = document.getElementById('desktopUserName');
const desktopUserStatus = document.getElementById('desktopUserStatus');
const desktopSidebarTabs = document.querySelectorAll('.desktop-sidebar-tab');
const desktopChatsList = document.getElementById('desktopChatsList');
const desktopContactsList = document.getElementById('desktopContactsList');
const desktopEmptyScreen = document.getElementById('desktopEmptyScreen');
const chatHeaderDesktop = document.getElementById('chatHeaderDesktop');
const desktopChatAvatar = document.getElementById('desktopChatAvatar');
const desktopChatHeaderName = document.getElementById('desktopChatHeaderName');
const desktopChatHeaderDescription = document.getElementById('desktopChatHeaderDescription');

const desktopCreateChatIcon = document.getElementById('desktopCreateChatIcon');
const desktopAddContactIcon = document.getElementById('desktopAddContactIcon');
const desktopProfileIcon = document.getElementById('desktopProfileIcon');
const desktopSettingsIcon = document.getElementById('desktopSettingsIcon');

const mobileContainer = document.querySelector('.mobile-container');
const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
const mobileTabs = document.querySelectorAll('.mobile-tab-content');
const mobileCreateFAB = document.getElementById('mobileCreateFAB');
const mobileCreateModal = document.getElementById('mobileCreateModal');
const mobileCloseCreateModal = document.getElementById('mobileCloseCreateModal');
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

const chatScreen = document.getElementById('chatScreen');
const chatHeaderMobile = document.getElementById('chatHeaderMobile');
const backToHomeBtn = document.getElementById('backToHomeBtn');
const chatHeaderName = document.getElementById('chatHeaderName');
const chatHeaderDescription = document.getElementById('chatHeaderDescription');
const messagesContainer = document.getElementById('messagesContainer');
const messageInput = document.getElementById('messageInput');
const sendMessageBtn = document.getElementById('sendMessageBtn');
const replyPreviewContainer = document.getElementById('replyPreviewContainer');
const attachBtn = document.getElementById('attachBtn');
const stickerBtn = document.getElementById('stickerBtn');

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

const messageContextMenu = document.getElementById('messageContextMenu');
const contextReply = document.getElementById('contextReply');
const contextCopy = document.getElementById('contextCopy');
const contextDelete = document.getElementById('contextDelete');

const confirmDeleteMessageModal = document.getElementById('confirmDeleteMessageModal');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const messagePreview = document.getElementById('messagePreview');

const photoPreviewContainer = document.getElementById('photoPreviewContainer');
const photoPreview = document.getElementById('photoPreview');
const photoPreviewName = document.getElementById('photoPreviewName');
const photoPreviewSize = document.getElementById('photoPreviewSize');
const photoPreviewRemove = document.getElementById('photoPreviewRemove');
const photoProgress = document.getElementById('photoProgress');
const photoProgressBar = document.getElementById('photoProgressBar');
const photoProgressText = document.getElementById('photoProgressText');
const photoViewModal = document.getElementById('photoViewModal');
const closePhotoModal = document.getElementById('closePhotoModal');
const fullSizePhoto = document.getElementById('fullSizePhoto');

const filePreviewContainer = document.getElementById('filePreviewContainer');
const filePreviewName = document.getElementById('filePreviewName');
const filePreviewSize = document.getElementById('filePreviewSize');
const filePreviewRemove = document.getElementById('filePreviewRemove');
const fileProgress = document.getElementById('fileProgress');
const fileProgressBar = document.getElementById('fileProgressBar');
const fileProgressText = document.getElementById('fileProgressText');

const privateUserId = document.getElementById('privateUserId');
const privateUserSearchResults = document.getElementById('privateUserSearchResults');
const chatDescriptionGroup = document.getElementById('chatDescriptionGroup');
const privateChatUser = document.getElementById('privateChatUser');

const adminPanelBtn = document.getElementById('adminPanelBtn');
const adminPanelModal = document.getElementById('adminPanelModal');
const closeAdminPanel = document.getElementById('closeAdminPanel');
const badgeUserId = document.getElementById('badgeUserId');
const badgeType = document.getElementById('badgeType');
const giveBadgeBtn = document.getElementById('giveBadgeBtn');
const verifiedUsersList = document.getElementById('verifiedUsersList');

const attachTypeModal = document.getElementById('attachTypeModal');
const closeAttachTypeModalBtn = document.getElementById('closeAttachTypeModal');
const attachPhotoOptionBtn = document.getElementById('attachPhotoOptionBtn');
const attachFileOptionBtn = document.getElementById('attachFileOptionBtn');

const homeChatsList = document.getElementById('homeChatsList');
const homeContactsList = document.getElementById('homeContactsList');
const homeUserId = document.getElementById('homeUserId');
const copyHomeIdBtn = document.getElementById('copyHomeIdBtn');
const homeCreateChatBtn = document.getElementById('homeCreateChatBtn');
const homeAddContactBtn = document.getElementById('homeAddContactBtn');
const homeScreen = document.getElementById('homeScreen');

const stickersModal = document.getElementById('stickersModal');
const closeStickersModal = document.getElementById('closeStickersModal');
const stickersPacks = document.getElementById('stickersPacks');
const stickersGrid = document.getElementById('stickersGrid');
const stickersGridContainer = document.getElementById('stickersGridContainer');
const backToPacksBtn = document.getElementById('backToPacksBtn');
const currentPackName = document.getElementById('currentPackName');

const addMembersModal = document.getElementById('addMembersModal');
const closeAddMembersModal = document.getElementById('closeAddMembersModal');
const cancelAddMembersBtn = document.getElementById('cancelAddMembersBtn');
const confirmAddMembersBtn = document.getElementById('confirmAddMembersBtn');
const contactsSelectList = document.getElementById('contactsSelectList');

const inviteLinkModal = document.getElementById('inviteLinkModal');
const closeInviteLinkModal = document.getElementById('closeInviteLinkModal');
const closeInviteModalBtn = document.getElementById('closeInviteModalBtn');
const inviteLinkInput = document.getElementById('inviteLinkInput');
const copyInviteLinkBtn = document.getElementById('copyInviteLinkBtn');

const adminPanelPage = document.getElementById('adminPanelPage');
const closeAdminPanelPage = document.getElementById('closeAdminPanelPage');

// ================================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ================================================
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function getVerifiedBadge(userId) {
    if (!userId || !verifiedUsers || !verifiedUsers[userId]) return '';
    const type = verifiedUsers[userId].type;
    const icons = { 
        'admin': 'fa-check-circle', 
        'premium': 'fa-star', 
        'partner': 'fa-handshake', 
        'celebrity': 'fa-crown' 
    };
    const colors = {
        'admin': '#fbbf24',
        'premium': '#8b5cf6',
        'partner': '#10b981',
        'celebrity': '#ef4444'
    };
    const titles = {
        'admin': 'Администратор',
        'premium': 'Премиум',
        'partner': 'Партнер',
        'celebrity': 'Знаменитость'
    };
    return `<span class="verified-badge" title="${titles[type]}"><i class="fas ${icons[type]}" style="color: ${colors[type]}; font-size: 13px;"></i></span>`;
}

function getChannelVerifiedBadge(chatId) {
    if (verifiedChannels && verifiedChannels[chatId]) {
        return '<i class="fas fa-check-circle" style="color: #8b5cf6; font-size: 14px; margin-left: 4px;" title="Верифицированный канал"></i>';
    }
    return '';
}

function hideReplyPreview() {
    if (replyPreviewContainer) {
        replyPreviewContainer.style.display = 'none';
        replyPreviewContainer.innerHTML = '';
        replyToMessage = null;
    }
}

function scrollToLastMessage(behavior = 'smooth') {
    if (messagesContainer) {
        setTimeout(() => {
            messagesContainer.scrollTo({
                top: messagesContainer.scrollHeight,
                behavior: behavior
            });
        }, 50);
    }
}

function scrollToMessage(messageId) {
    const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
    if (messageElement) {
        messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Подсвечиваем сообщение
        messageElement.style.transition = 'background-color 0.3s';
        messageElement.style.backgroundColor = 'rgba(139, 92, 246, 0.3)';
        setTimeout(() => {
            messageElement.style.backgroundColor = '';
        }, 2000);
    }
}

let scrollBtn = null;
function hideScrollToBottomButton() {
    if (scrollBtn) scrollBtn.classList.remove('visible');
}

function isUserNearBottom() {
    if (!messagesContainer) return true;
    const threshold = 100;
    return messagesContainer.scrollHeight - messagesContainer.scrollTop - messagesContainer.clientHeight < threshold;
}

// ================================================
// ФУНКЦИИ ДЛЯ КАНАЛОВ
// ================================================
function canManageChannel(chatId, userId) {
    const chat = chats.find(c => c.id === chatId);
    if (!chat || chat.type !== 'channel') return false;
    return chat.createdBy === userId || (chat.moderators && chat.moderators[userId] === true);
}

function canSendToChannel(chatId, userId) {
    const chat = chats.find(c => c.id === chatId);
    if (!chat || chat.type !== 'channel') return false;
    return chat.createdBy === userId || (chat.moderators && chat.moderators[userId] === true);
}

function isSubscribedToChannel(chatId, userId) {
    const chat = chats.find(c => c.id === chatId);
    if (!chat || chat.type !== 'channel') return false;
    return chat.members && chat.members[userId] === true;
}

function getUserChannelRole(chatId, userId) {
    const chat = chats.find(c => c.id === chatId);
    if (!chat || chat.type !== 'channel') return null;
    if (chat.createdBy === userId) return 'creator';
    if (chat.moderators && chat.moderators[userId] === true) return 'moderator';
    if (chat.members && chat.members[userId] === true) return 'subscriber';
    return null;
}

function getSubscriberWord(count) {
    if (count % 10 === 1 && count % 100 !== 11) return "подписчик";
    if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) return "подписчика";
    return "подписчиков";
}

function addSubscribersCounter() {
    const chat = chats.find(c => c.id === currentChatId);
    if (!chat || chat.type !== 'channel') return;
    
    const memberCount = Object.keys(chat.members || {}).length;
    
    // Десктопная версия
    const desktopInfo = document.querySelector('.desktop-chat-header-info');
    if (desktopInfo) {
        let desktopCounter = document.getElementById('desktopSubscribersCount');
        if (!desktopCounter) {
            desktopCounter = document.createElement('div');
            desktopCounter.id = 'desktopSubscribersCount';
            desktopCounter.className = 'subscribers-counter';
            desktopInfo.appendChild(desktopCounter);
        }
        desktopCounter.innerHTML = `<i class="fas fa-users"></i> ${memberCount} ${getSubscriberWord(memberCount)}`;
    }
    
    // Мобильная версия
    const mobileInfo = document.querySelector('.chat-header-info');
    if (mobileInfo) {
        let mobileCounter = document.getElementById('mobileSubscribersCount');
        if (!mobileCounter) {
            mobileCounter = document.createElement('div');
            mobileCounter.id = 'mobileSubscribersCount';
            mobileCounter.className = 'subscribers-counter';
            mobileInfo.appendChild(mobileCounter);
        }
        mobileCounter.innerHTML = `<i class="fas fa-users"></i> ${memberCount} ${getSubscriberWord(memberCount)}`;
    }
}

function updateChannelSubscribersCount(chatId) {
    const chat = chats.find(c => c.id === chatId);
    if (!chat || chat.type !== 'channel') return;
    
    const memberCount = Object.keys(chat.members || {}).length;
    
    const desktopCounter = document.getElementById('desktopSubscribersCount');
    if (desktopCounter) {
        desktopCounter.innerHTML = `<i class="fas fa-users"></i> ${memberCount} ${getSubscriberWord(memberCount)}`;
    }
    
    const mobileCounter = document.getElementById('mobileSubscribersCount');
    if (mobileCounter) {
        mobileCounter.innerHTML = `<i class="fas fa-users"></i> ${memberCount} ${getSubscriberWord(memberCount)}`;
    }
}

function restoreOriginalInput(container) {
    if (container.dataset.originalContent) {
        container.innerHTML = container.dataset.originalContent;
        const newMessageInput = document.getElementById('messageInput');
        const newSendBtn = document.getElementById('sendMessageBtn');
        const newAttachBtn = document.getElementById('attachBtn');
        const newStickerBtn = document.getElementById('stickerBtn');
        
        if (newMessageInput) {
            newMessageInput.onkeypress = (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            };
        }
        if (newSendBtn) newSendBtn.onclick = sendMessage;
        if (newAttachBtn) newAttachBtn.onclick = () => showAttachTypeModal();
        if (newStickerBtn) newStickerBtn.onclick = () => openStickersModal();
    }
}

function addChannelSettingsButton() {
    const chat = chats.find(c => c.id === currentChatId);
    if (!chat || chat.type !== 'channel') return;
    if (!canManageChannel(currentChatId, currentUser?.uid)) return;
    
    const isDesktopActive = window.innerWidth > 768;
    let chatActions = null;
    
    if (isDesktopActive) {
        const desktopHeader = document.querySelector('.chat-header.desktop');
        if (desktopHeader && desktopHeader.style.display !== 'none') {
            chatActions = desktopHeader.querySelector('.chat-actions');
            if (!chatActions) {
                chatActions = document.createElement('div');
                chatActions.className = 'chat-actions';
                desktopHeader.appendChild(chatActions);
            }
        }
    } else {
        const mobileHeader = document.getElementById('chatHeaderMobile');
        if (mobileHeader && mobileHeader.style.display !== 'none') {
            chatActions = mobileHeader.querySelector('.chat-actions');
            if (!chatActions) {
                chatActions = document.createElement('div');
                chatActions.className = 'chat-actions';
                mobileHeader.appendChild(chatActions);
            }
        }
    }
    
    if (!chatActions) return;
    
    // Удаляем старую кнопку, если есть
    const oldBtn = document.getElementById('channelSettingsBtn');
    if (oldBtn) oldBtn.remove();
    
    const settingsBtn = document.createElement('button');
    settingsBtn.id = 'channelSettingsBtn';
    settingsBtn.className = 'chat-action-btn';
    settingsBtn.innerHTML = '<i class="fas fa-cog"></i>';
    settingsBtn.title = 'Настройки канала';
    settingsBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        openChannelSettings(currentChatId);
    };
    
    chatActions.appendChild(settingsBtn);
}

function updateChannelUI() {
    if (!currentChatId) return;
    const chat = chats.find(c => c.id === currentChatId);
    if (!chat || chat.type !== 'channel') return;
    
    const chatInputContainer = document.getElementById('chatInputContainer');
    const canSend = canSendToChannel(currentChatId, currentUser?.uid);
    const isSubscribed = isSubscribedToChannel(currentChatId, currentUser?.uid);
    const canManage = canManageChannel(currentChatId, currentUser?.uid);
    
    if (!chatInputContainer) return;
    if (!chatInputContainer.dataset.originalContent) {
        chatInputContainer.dataset.originalContent = chatInputContainer.innerHTML;
    }
    
    if (canSend) {
        restoreOriginalInput(chatInputContainer);
        if (canManage) {
            addChannelSettingsButton();
        }
    } else if (isSubscribed) {
        chatInputContainer.innerHTML = `
            <div style="padding: 12px; text-align: center;">
                <div style="margin-bottom: 12px; color: var(--text-tertiary); font-size: 13px;">
                    <i class="fas fa-lock"></i> У вас нет прав на отправку сообщений
                </div>
                <button class="btn btn-danger" id="unsubscribeChannelBtn" style="width: 100%; padding: 14px;">
                    <i class="fas fa-bell-slash"></i> Отписаться от канала
                </button>
            </div>
        `;
        const unsubscribeBtn = document.getElementById('unsubscribeChannelBtn');
        if (unsubscribeBtn) {
            unsubscribeBtn.onclick = () => unsubscribeFromChannel(currentChatId);
        }
    } else {
        chatInputContainer.innerHTML = `
            <div style="padding: 12px; text-align: center;">
                <button class="btn btn-primary" id="subscribeChannelBtn" style="width: 100%; padding: 14px;">
                    <i class="fas fa-bell"></i> Подписаться на канал
                </button>
            </div>
        `;
        const subscribeBtn = document.getElementById('subscribeChannelBtn');
        if (subscribeBtn) {
            subscribeBtn.onclick = () => subscribeToChannel(currentChatId);
        }
    }
    addSubscribersCounter();
}

async function subscribeToChannel(chatId) {
    if (!currentUser || !chatId) return;
    try {
        const chatRef = database.ref(`chats/${chatId}`);
        const chatSnapshot = await chatRef.once('value');
        const chat = chatSnapshot.val();
        if (!chat || chat.type !== 'channel') {
            showNotification('Это не канал');
            return;
        }
        await chatRef.update({ [`members/${currentUser.uid}`]: true });
        updateChatsDisplay();
        updateChannelSubscribersCount(chatId);
        if (currentChatId === chatId) {
            updateChannelUI();
            loadMessages(chatId);
        }
        showNotification('Вы подписались на канал!');
    } catch (error) {
        console.error('Ошибка подписки:', error);
    }
}

async function unsubscribeFromChannel(chatId) {
    if (!currentUser || !chatId) return;
    const chat = chats.find(c => c.id === chatId);
    if (!chat || chat.type !== 'channel') return;
    if (chat.createdBy === currentUser.uid) {
        showNotification('Вы не можете отписаться от своего канала');
        return;
    }
    try {
        const chatRef = database.ref(`chats/${chatId}`);
        await chatRef.update({ [`members/${currentUser.uid}`]: null });
        if (chat.moderators && chat.moderators[currentUser.uid]) {
            await chatRef.update({ [`moderators/${currentUser.uid}`]: null });
        }
        if (currentChatId === chatId) showHomeScreen();
        updateChatsDisplay();
        updateChannelSubscribersCount(chatId);
        showNotification('Вы отписались от канала');
    } catch (error) {
        console.error('Ошибка отписки:', error);
    }
}

async function addSubscriberToChannel(chatId, userId) {
    if (!chatId || !userId) return;
    try {
        const chat = chats.find(c => c.id === chatId);
        if (chat && chat.members && chat.members[userId]) {
            showNotification('Пользователь уже является подписчиком');
            return;
        }
        await database.ref(`chats/${chatId}/members/${userId}`).set(true);
        showNotification('Подписчик успешно добавлен');
        updateChatsDisplay();
        updateChannelSubscribersCount(chatId);
        if (currentChatId === chatId) {
            if (typeof loadChannelMembersList === 'function') await loadChannelMembersList(chatId);
            addSubscribersCounter();
        }
    } catch (error) {
        console.error('Ошибка при добавлении подписчика:', error);
        showNotification('Ошибка при добавлении подписчика');
    }
}

async function makeChannelModerator(chatId, userId) {
    try {
        await database.ref(`chats/${chatId}/moderators/${userId}`).set(true);
        showNotification('Модератор назначен');
        if (currentChatId === chatId) {
            if (typeof loadChannelMembersList === 'function') loadChannelMembersList(chatId);
            if (typeof loadChannelModeratorsList === 'function') loadChannelModeratorsList(chatId);
            updateChannelUI();
        }
    } catch (error) {
        console.error(error);
        showNotification('Ошибка при назначении модератора');
    }
}

async function removeChannelModerator(chatId, userId) {
    try {
        await database.ref(`chats/${chatId}/moderators/${userId}`).remove();
        showNotification('Модератор снят');
        if (currentChatId === chatId) {
            if (typeof loadChannelMembersList === 'function') loadChannelMembersList(chatId);
            if (typeof loadChannelModeratorsList === 'function') loadChannelModeratorsList(chatId);
            updateChannelUI();
        }
    } catch (error) {
        console.error(error);
        showNotification('Ошибка при снятии модератора');
    }
}

async function removeFromChannel(chatId, userId) {
    try {
        await database.ref(`chats/${chatId}/members/${userId}`).remove();
        if (chats.find(c => c.id === chatId)?.moderators?.[userId]) {
            await database.ref(`chats/${chatId}/moderators/${userId}`).remove();
        }
        showNotification('Пользователь исключен из канала');
        updateChatsDisplay();
        updateChannelSubscribersCount(chatId);
        if (currentChatId === chatId) {
            if (typeof loadChannelMembersList === 'function') loadChannelMembersList(chatId);
            if (typeof loadChannelModeratorsList === 'function') loadChannelModeratorsList(chatId);
            if (userId === currentUser?.uid) showHomeScreen();
        }
    } catch (error) {
        console.error(error);
        showNotification('Ошибка при исключении');
    }
}

async function generateInviteLink(chatId) {
    const inviteCode = btoa(`${chatId}_${Date.now()}_${Math.random()}`).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
    const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000);
    await database.ref(`groupInvites/${inviteCode}`).set({ chatId: chatId, createdAt: Date.now(), expiresAt: expiresAt });
    return `${window.location.origin}${window.location.pathname}?code=${inviteCode}`;
}

async function createChannel(isMobile = false) {
    let name, description;
    if (isMobile) {
        name = document.getElementById('mobileChannelName')?.value.trim();
        description = document.getElementById('mobileChannelDescription')?.value.trim();
    } else {
        name = chatNameInput?.value.trim();
        description = chatDescriptionInput?.value.trim();
    }
    if (!name) {
        showNotification('Введите название канала');
        return;
    }
    try {
        const newChannel = {
            name: name,
            description: description || '',
            type: 'channel',
            createdBy: currentUser.uid,
            createdAt: Date.now(),
            members: { [currentUser.uid]: true },
            lastMessage: { text: "Канал создан", timestamp: Date.now(), senderId: currentUser.uid }
        };
        const ref = await database.ref('chats').push(newChannel);
        if (isMobile && mobileCreateModal) mobileCreateModal.classList.remove('active');
        if (!isMobile && createChatModal) createChatModal.classList.remove('active');
        if (isMobile) {
            const nameInput = document.getElementById('mobileChannelName');
            const descInput = document.getElementById('mobileChannelDescription');
            if (nameInput) nameInput.value = '';
            if (descInput) descInput.value = '';
        } else {
            resetCreateForm();
        }
        openChat(ref.key);
        showNotification('Канал создан!');
    } catch (error) {
        console.error('Ошибка создания канала:', error);
        showNotification('Ошибка при создании канала');
    }
}

// ================================================
// СИСТЕМА ВЕРИФИКАЦИИ КАНАЛОВ
// ================================================

async function checkPendingVerificationRequest(channelId) {
    const snapshot = await database.ref(`channelVerificationRequests/${channelId}`).once('value');
    const request = snapshot.val();
    return request && request.status === 'pending';
}

async function requestChannelVerification(channelId) {
    console.log('=== ОТПРАВКА ЗАЯВКИ ===');
    console.log('channelId:', channelId);
    console.log('currentUser:', currentUser);
    
    const chat = chats.find(c => c.id === channelId);
    console.log('chat:', chat);
    
    if (!chat || chat.type !== 'channel') {
        console.error('Не канал или не найден');
        showNotification('Это не канал');
        return;
    }
    
    console.log('chat.createdBy:', chat.createdBy);
    console.log('currentUser.uid:', currentUser?.uid);
    
    if (chat.createdBy !== currentUser?.uid) {
        console.error('Не создатель канала');
        showNotification('Только создатель канала может подать заявку');
        return;
    }
    
    try {
        const requestData = {
            channelId: channelId,
            channelName: chat.name,
            channelDescription: chat.description || '',
            createdAt: Date.now(),
            createdBy: currentUser.uid,
            createdByName: currentUser.displayName,
            status: 'pending',
            subscriberCount: Object.keys(chat.members || {}).length
        };
        
        console.log('Отправляем данные:', requestData);
        
        await database.ref(`channelVerificationRequests/${channelId}`).set(requestData);
        
        console.log('Заявка успешно отправлена!');
        showNotification('Заявка отправлена');
        
        // Проверяем, что заявка сохранилась
        const check = await database.ref(`channelVerificationRequests/${channelId}`).once('value');
        console.log('Проверка сохранения:', check.val());
        
    } catch (error) {
        console.error('Ошибка:', error);
        showNotification('Ошибка: ' + error.message);
    }
}

async function loadVerificationRequests() {
    const snapshot = await database.ref('channelVerificationRequests').orderByChild('status').equalTo('pending').once('value');
    const requests = snapshot.val() || {};
    return requests;
}

async function approveChannelVerification(channelId) {
    const isAdmin = verifiedUsers && verifiedUsers[currentUser?.uid] && verifiedUsers[currentUser?.uid].type === 'admin';
    if (!isAdmin) {
        showNotification('Только администратор может верифицировать каналы');
        return;
    }
    
    try {
        // Добавляем канал в список верифицированных
        await database.ref(`verifiedChannels/${channelId}`).set({
            verifiedAt: Date.now(),
            verifiedBy: currentUser.uid,
            verifiedByName: currentUser.displayName
        });
        
        // Обновляем статус заявки
        await database.ref(`channelVerificationRequests/${channelId}`).update({
            status: 'approved',
            approvedAt: Date.now(),
            approvedBy: currentUser.uid
        });
        
        // Обновляем локальный кэш
        verifiedChannels[channelId] = true;
        
        showNotification('Канал верифицирован');
        
        // Обновляем все необходимые интерфейсы
        updateChatsDisplay();
        if (currentChatId === channelId) {
            updateChatHeader();
        }
        
        // Обновляем админ-панель
        if (adminPanelPage && adminPanelPage.style.display === 'block') {
            loadPendingVerification();
            loadVerifiedChannelsList();
            loadAdminChannels();
            loadAdminStats();
        }
        
    } catch (error) {
        console.error('Ошибка при верификации:', error);
        showNotification('Ошибка при верификации канала');
    }
}

async function rejectChannelVerification(channelId, reason = '') {
    const isAdmin = verifiedUsers && verifiedUsers[currentUser?.uid] && verifiedUsers[currentUser?.uid].type === 'admin';
    if (!isAdmin) {
        showNotification('Только администратор может отклонять заявки');
        return;
    }
    
    const reasonText = reason || prompt('Укажите причину отклонения (необязательно):');
    
    try {
        await database.ref(`channelVerificationRequests/${channelId}`).update({
            status: 'rejected',
            rejectedAt: Date.now(),
            rejectedBy: currentUser.uid,
            rejectionReason: reasonText || 'Не указана'
        });
        
        showNotification('Заявка отклонена');
        
        // Обновляем админ-панель
        if (adminPanelPage && adminPanelPage.style.display === 'block') {
            loadPendingVerification();
        }
        
    } catch (error) {
        console.error('Ошибка при отклонении:', error);
        showNotification('Ошибка при отклонении заявки');
    }
}

async function loadVerifiedChannels() {
    try {
        const snapshot = await database.ref('verifiedChannels').once('value');
        verifiedChannels = snapshot.val() || {};
        console.log(`Загружено верифицированных каналов: ${Object.keys(verifiedChannels).length}`);
    } catch (error) {
        console.error("Ошибка загрузки верифицированных каналов:", error);
        verifiedChannels = {};
    }
}

// ================================================
// АДМИН-ПАНЕЛЬ (ОТДЕЛЬНАЯ СТРАНИЦА)
// ================================================

function openAdminPanel() {
    if (!adminPanelPage) return;
    
    adminPanelPage.style.display = 'block';
    
    // Загружаем все данные
    loadAdminStats();
    loadAdminUsers();
    loadAdminChannels();
    loadPendingVerification();
    loadVerifiedChannelsList();
    loadVerifiedUsersListAdmin();
    loadServerRules();
    loadBannedUsers();
    
    // Настройка вкладок
    const tabs = document.querySelectorAll('.admin-tab');
    tabs.forEach(tab => {
        tab.onclick = () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const tabName = tab.dataset.tab;
            document.querySelectorAll('.admin-tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`admin${tabName.charAt(0).toUpperCase() + tabName.slice(1)}Tab`).classList.add('active');
        };
    });
    
    // Закрытие панели
    if (closeAdminPanelPage) {
        closeAdminPanelPage.onclick = () => {
            adminPanelPage.style.display = 'none';
        };
    }
    
    // ========== ОБРАБОТЧИК КНОПКИ ОБНОВЛЕНИЯ ЗАЯВОК ==========
    const refreshBtn = document.getElementById('refreshRequestsBtn');
    if (refreshBtn) {
        // Удаляем старый обработчик
        const newRefreshBtn = refreshBtn.cloneNode(true);
        refreshBtn.parentNode.replaceChild(newRefreshBtn, refreshBtn);
        
        newRefreshBtn.onclick = async () => {
            // Добавляем анимацию загрузки
            newRefreshBtn.classList.add('loading');
            newRefreshBtn.disabled = true;
            
            await loadPendingVerification();
            
            // Убираем анимацию
            setTimeout(() => {
                newRefreshBtn.classList.remove('loading');
                newRefreshBtn.disabled = false;
            }, 500);
            
            showNotification('Список заявок обновлен');
        };
    }
}

async function loadAdminStats() {
    try {
        const usersSnap = await database.ref('users').once('value');
        const users = usersSnap.val() || {};
        const totalUsers = Object.keys(users).length;
        const onlineUsers = Object.values(users).filter(u => u.status === 'online').length;
        
        const chatsSnap = await database.ref('chats').once('value');
        const chatsData = chatsSnap.val() || {};
        const totalChats = Object.keys(chatsData).length;
        const totalChannels = Object.values(chatsData).filter(c => c.type === 'channel').length;
        
        const totalUsersEl = document.getElementById('adminTotalUsers');
        const onlineUsersEl = document.getElementById('adminOnlineUsers');
        const totalChatsEl = document.getElementById('adminTotalChats');
        const totalChannelsEl = document.getElementById('adminTotalChannels');
        
        if (totalUsersEl) totalUsersEl.textContent = totalUsers;
        if (onlineUsersEl) onlineUsersEl.textContent = onlineUsers;
        if (totalChatsEl) totalChatsEl.textContent = totalChats;
        if (totalChannelsEl) totalChannelsEl.textContent = totalChannels;
    } catch (error) {
        console.error('Ошибка загрузки статистики:', error);
    }
}

async function loadAdminUsers() {
    const container = document.getElementById('adminUsersList');
    if (!container) return;
    
    try {
        const usersSnap = await database.ref('users').once('value');
        const users = usersSnap.val() || {};
        
        container.innerHTML = Object.entries(users).map(([uid, user]) => `
            <div class="admin-user-item" data-user-id="${uid}">
                <div class="admin-user-info">
                    <div class="admin-user-avatar">${escapeHtml((user.displayName || 'U').charAt(0))}</div>
                    <div class="admin-user-details">
                        <h4>${escapeHtml(user.displayName || 'Пользователь')} ${getVerifiedBadge(uid)}</h4>
                        <p>ID: ${user.customId || uid.substring(0, 8)}</p>
                        <p>Статус: ${user.status || 'offline'} | Регистрация: ${new Date(user.createdAt || Date.now()).toLocaleDateString()}</p>
                    </div>
                </div>
                <div class="admin-user-actions">
                    <button class="admin-action-btn warning" onclick="showUserMessages('${uid}')" title="Сообщения">
                        <i class="fas fa-comment-dots"></i>
                    </button>
                    <button class="admin-action-btn" onclick="giveUserBadge('${uid}')" title="Выдать галочку">
                        <i class="fas fa-certificate"></i>
                    </button>
                    <button class="admin-action-btn danger" onclick="banUser('${uid}')" title="Забанить">
                        <i class="fas fa-ban"></i>
                    </button>
                </div>
            </div>
        `).join('');
        
        const searchInput = document.getElementById('adminUserSearch');
        if (searchInput) {
            searchInput.oninput = () => {
                const query = searchInput.value.toLowerCase();
                document.querySelectorAll('.admin-user-item').forEach(item => {
                    const text = item.textContent.toLowerCase();
                    item.style.display = text.includes(query) ? 'flex' : 'none';
                });
            };
        }
    } catch (error) {
        console.error('Ошибка загрузки пользователей:', error);
    }
}

async function loadAdminChannels() {
    const container = document.getElementById('adminChannelsList');
    if (!container) return;
    
    try {
        const chatsSnap = await database.ref('chats').once('value');
        const chatsData = chatsSnap.val() || {};
        const channels = Object.entries(chatsData).filter(([_, chat]) => chat.type === 'channel');
        
        container.innerHTML = channels.map(([id, channel]) => {
            const isVerified = verifiedChannels && verifiedChannels[id];
            return `
                <div class="admin-channel-item" data-channel-id="${id}">
                    <div class="admin-channel-info">
                        <div class="admin-user-avatar" style="background: linear-gradient(135deg, #8b5cf6, #7c3aed);">
                            <i class="fas fa-bullhorn"></i>
                        </div>
                        <div class="admin-user-details">
                            <h4>${escapeHtml(channel.name)} ${isVerified ? '<i class="fas fa-check-circle" style="color: #8b5cf6;"></i>' : ''}</h4>
                            <p>Создатель: ${allUsers[channel.createdBy]?.displayName || 'Неизвестный'}</p>
                            <p>Подписчиков: ${Object.keys(channel.members || {}).length} | Создан: ${new Date(channel.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <div class="admin-channel-actions">
                        <button class="admin-action-btn" onclick="openChannelSettingsAdmin('${id}')" title="Настройки">
                            <i class="fas fa-cog"></i>
                        </button>
                        <button class="admin-action-btn warning" onclick="viewChannelMessages('${id}')" title="Сообщения">
                            <i class="fas fa-comment-dots"></i>
                        </button>
                        <button class="admin-action-btn danger" onclick="deleteChannelAdmin('${id}')" title="Удалить канал">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        const searchInput = document.getElementById('adminChannelSearch');
        if (searchInput) {
            searchInput.oninput = () => {
                const query = searchInput.value.toLowerCase();
                document.querySelectorAll('.admin-channel-item').forEach(item => {
                    const text = item.textContent.toLowerCase();
                    item.style.display = text.includes(query) ? 'flex' : 'none';
                });
            };
        }
    } catch (error) {
        console.error('Ошибка загрузки каналов:', error);
    }
}

function loadPendingVerification() {
    const container = document.getElementById('pendingVerificationList');
    if (!container) {
        console.error('Контейнер pendingVerificationList не найден');
        return;
    }
    
    console.log('Загрузка заявок на верификацию...');
    
    database.ref('channelVerificationRequests').orderByChild('status').equalTo('pending').once('value')
        .then(snapshot => {
            const requests = snapshot.val() || {};
            const requestsArray = Object.entries(requests);
            
            console.log(`Найдено заявок со статусом 'pending': ${requestsArray.length}`);
            console.log('Заявки:', requests);
            
            if (requestsArray.length === 0) {
                container.innerHTML = '<div class="empty-state"><i class="fas fa-check-circle"></i><h3>Нет заявок</h3><p>Все заявки обработаны</p></div>';
                return;
            }
            
            container.innerHTML = requestsArray.map(([channelId, req]) => {
                const channel = chats.find(c => c.id === channelId);
                const subscriberCount = channel ? Object.keys(channel.members || {}).length : (req.subscriberCount || 0);
                const channelName = channel ? channel.name : (req.channelName || 'Неизвестный канал');
                
                return `
                    <div class="verification-request-item" data-channel-id="${channelId}">
                        <div class="request-info">
                            <div class="request-channel-name">
                                <i class="fas fa-bullhorn"></i> ${escapeHtml(channelName)}
                            </div>
                            <div class="request-details">
                                <span><i class="fas fa-user"></i> ${escapeHtml(req.createdByName || 'Неизвестный')}</span>
                                <span><i class="fas fa-users"></i> ${subscriberCount} подписчиков</span>
                                <span><i class="fas fa-calendar"></i> ${new Date(req.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div class="request-description">${escapeHtml(req.channelDescription || 'Нет описания')}</div>
                        </div>
                        <div class="request-actions">
                            <button class="btn btn-success approve-request" data-channel-id="${channelId}">
                                <i class="fas fa-check"></i> Одобрить
                            </button>
                            <button class="btn btn-danger reject-request" data-channel-id="${channelId}">
                                <i class="fas fa-times"></i> Отклонить
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
            
            // Обработчики для кнопок
            document.querySelectorAll('.approve-request').forEach(btn => {
                btn.onclick = async (e) => {
                    e.stopPropagation();
                    const channelId = btn.dataset.channelId;
                    console.log('Одобрение канала:', channelId);
                    await approveChannelVerification(channelId);
                    loadPendingVerification();
                    loadVerifiedChannelsList();
                    loadAdminChannels();
                    loadAdminStats();
                };
            });
            
            document.querySelectorAll('.reject-request').forEach(btn => {
                btn.onclick = async (e) => {
                    e.stopPropagation();
                    const channelId = btn.dataset.channelId;
                    console.log('Отклонение канала:', channelId);
                    await rejectChannelVerification(channelId);
                    loadPendingVerification();
                };
            });
        })
        .catch(error => {
            console.error('Ошибка загрузки заявок:', error);
            container.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><h3>Ошибка загрузки</h3><p>Не удалось загрузить заявки</p></div>';
        });
}

async function loadVerifiedChannelsList() {
    const container = document.getElementById('adminVerifiedChannelsList');
    if (!container) return;
    
    try {
        const verified = verifiedChannels || {};
        const verifiedIds = Object.keys(verified);
        
        if (verifiedIds.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-certificate"></i><h3>Нет верифицированных каналов</h3></div>';
            return;
        }
        
        const channels = [];
        for (const id of verifiedIds) {
            const snapshot = await database.ref(`chats/${id}`).once('value');
            const chat = snapshot.val();
            if (chat && chat.type === 'channel') {
                channels.push({ id, ...chat });
            }
        }
        
        container.innerHTML = channels.map(channel => `
            <div class="admin-user-item">
                <div class="admin-user-info">
                    <div class="admin-user-avatar" style="background: linear-gradient(135deg, #8b5cf6, #7c3aed);">
                        <i class="fas fa-bullhorn"></i>
                    </div>
                    <div class="admin-user-details">
                        <h4>${escapeHtml(channel.name)} <i class="fas fa-check-circle" style="color: #8b5cf6;"></i></h4>
                        <p>Создатель: ${allUsers[channel.createdBy]?.displayName || 'Неизвестный'}</p>
                    </div>
                </div>
                <div class="admin-user-actions">
                    <button class="admin-action-btn danger" onclick="removeChannelVerification('${channel.id}')" title="Снять верификацию">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Ошибка загрузки верифицированных каналов:', error);
    }
}

async function loadVerifiedUsersListAdmin() {
    const container = document.getElementById('adminVerifiedUsersList');
    if (!container) return;
    
    try {
        const verified = verifiedUsers || {};
        const verifiedIds = Object.keys(verified);
        
        if (verifiedIds.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-user-check"></i><h3>Нет верифицированных пользователей</h3></div>';
            return;
        }
        
        container.innerHTML = verifiedIds.map(uid => {
            const user = allUsers[uid] || { displayName: 'Неизвестный', customId: uid };
            const type = verified[uid].type;
            const typeNames = { admin: 'Админ', premium: 'Премиум', partner: 'Партнер', celebrity: 'Знаменитость' };
            return `
                <div class="admin-user-item">
                    <div class="admin-user-info">
                        <div class="admin-user-avatar">${escapeHtml((user.displayName || 'U').charAt(0))}</div>
                        <div class="admin-user-details">
                            <h4>${escapeHtml(user.displayName)} ${getVerifiedBadge(uid)}</h4>
                            <p>${typeNames[type] || type} | ID: ${user.customId || uid.substring(0, 8)}</p>
                        </div>
                    </div>
                    <div class="admin-user-actions">
                        <button class="admin-action-btn danger" onclick="removeVerifiedBadge('${uid}')" title="Снять верификацию">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Ошибка загрузки верифицированных пользователей:', error);
    }
}

async function loadServerRules() {
    const textarea = document.getElementById('serverRules');
    if (!textarea) return;
    
    const snapshot = await database.ref('serverSettings/rules').once('value');
    textarea.value = snapshot.val() || '1. Уважайте других участников\n2. Не спамьте\n3. Запрещена реклама\n4. Соблюдайте законы';
    
    const saveBtn = document.getElementById('saveRulesBtn');
    if (saveBtn) {
        saveBtn.onclick = async () => {
            await database.ref('serverSettings/rules').set(textarea.value);
            showNotification('Правила сохранены');
        };
    }
}

async function loadBannedUsers() {
    const container = document.getElementById('bannedUsersList');
    if (!container) return;
    
    try {
        const snapshot = await database.ref('bannedUsers').once('value');
        const banned = snapshot.val() || {};
        const bannedIds = Object.keys(banned);
        
        if (bannedIds.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-ban"></i><h3>Нет забаненных пользователей</h3></div>';
            return;
        }
        
        container.innerHTML = bannedIds.map(uid => {
            const user = allUsers[uid] || { displayName: 'Неизвестный', customId: uid };
            const banInfo = banned[uid];
            return `
                <div class="admin-user-item">
                    <div class="admin-user-info">
                        <div class="admin-user-avatar">${escapeHtml((user.displayName || 'U').charAt(0))}</div>
                        <div class="admin-user-details">
                            <h4>${escapeHtml(user.displayName)}</h4>
                            <p>ID: ${user.customId || uid.substring(0, 8)}</p>
                            <p>Забанен: ${new Date(banInfo.bannedAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <div class="admin-user-actions">
                        <button class="admin-action-btn" onclick="unbanUser('${uid}')" title="Разбанить">
                            <i class="fas fa-user-check"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Ошибка загрузки забаненных пользователей:', error);
    }
}

async function removeChannelVerification(channelId) {
    if (!confirm('Снять верификацию с канала?')) return;
    try {
        await database.ref(`verifiedChannels/${channelId}`).remove();
        verifiedChannels[channelId] = undefined;
        showNotification('Верификация снята');
        loadVerifiedChannelsList();
        loadAdminChannels();
    } catch (error) {
        console.error(error);
        showNotification('Ошибка');
    }
}

window.giveUserBadge = async function(userId) {
    const type = prompt('Введите тип галочки (admin, premium, partner, celebrity):');
    if (!type || !['admin', 'premium', 'partner', 'celebrity'].includes(type)) {
        showNotification('Неверный тип');
        return;
    }
    await giveVerifiedBadge(userId, type);
    loadAdminUsers();
    loadVerifiedUsersListAdmin();
};

window.banUser = async function(userId) {
    if (!confirm('Забанить пользователя?')) return;
    try {
        await database.ref(`bannedUsers/${userId}`).set({
            bannedAt: Date.now(),
            bannedBy: currentUser.uid,
            reason: 'Нарушение правил'
        });
        showNotification('Пользователь забанен');
        loadAdminUsers();
        loadBannedUsers();
    } catch (error) {
        console.error(error);
        showNotification('Ошибка');
    }
};

window.unbanUser = async function(userId) {
    if (!confirm('Разбанить пользователя?')) return;
    try {
        await database.ref(`bannedUsers/${userId}`).remove();
        showNotification('Пользователь разбанен');
        loadAdminUsers();
        loadBannedUsers();
    } catch (error) {
        console.error(error);
        showNotification('Ошибка');
    }
};

window.showUserMessages = function(userId) {
    showNotification('Функция в разработке');
};

window.viewChannelMessages = function(channelId) {
    openChat(channelId);
    if (adminPanelPage) adminPanelPage.style.display = 'none';
};

window.deleteChannelAdmin = async function(channelId) {
    if (!confirm('Удалить канал? Это действие нельзя отменить.')) return;
    try {
        await database.ref(`chats/${channelId}`).remove();
        await database.ref(`messages/${channelId}`).remove();
        showNotification('Канал удален');
        loadAdminChannels();
        loadAdminStats();
    } catch (error) {
        console.error(error);
        showNotification('Ошибка');
    }
};

window.openChannelSettingsAdmin = function(channelId) {
    openChannelSettings(channelId);
};

// ================================================
// ФУНКЦИЯ OPENCHAT
// ================================================
function openChat(chatId) {
    // Сначала находим чат
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return;
    
    // Очищаем элементы предыдущего чата
    clearChannelHeaderElements();
    
    // Отключаем слушатели сообщений для предыдущего чата
    if (currentChatId && activeMessageListeners && activeMessageListeners[currentChatId]) {
        if (activeMessageListeners[currentChatId].added) {
            database.ref(`messages/${currentChatId}`).off('child_added', activeMessageListeners[currentChatId].added);
        }
        if (activeMessageListeners[currentChatId].removed) {
            database.ref(`messages/${currentChatId}`).off('child_removed', activeMessageListeners[currentChatId].removed);
        }
    }
    
    // Устанавливаем новый текущий чат
    currentChatId = chatId;
    replyToMessage = null;
    hideReplyPreview();
    
    const isChannel = chat.type === 'channel';
    const isGroup = chat.type === 'group';
    const isPrivate = chat.type === 'private';
    const isDesktopActive = window.innerWidth > 768;
    
    // ========== ПОКАЗЫВАЕМ ПРАВИЛЬНЫЙ ИНТЕРФЕЙС ==========
    if (isDesktopActive) {
        // ПК версия
        if (desktopEmptyScreen) desktopEmptyScreen.style.display = 'none';
        if (chatScreen) {
            chatScreen.style.display = 'flex';
            chatScreen.classList.add('desktop');
        }
        if (homeScreen) homeScreen.style.display = 'none';
        if (mobileContainer) mobileContainer.style.display = 'none';
        
        // Подсвечиваем активный чат в списке
        document.querySelectorAll('.desktop-chat-item').forEach(i => i.classList.remove('active'));
        const activeItem = document.querySelector(`.desktop-chat-item[data-chat-id="${chatId}"]`);
        if (activeItem) activeItem.classList.add('active');
        
        // Показываем правильный хедер
        if (chatHeaderDesktop) chatHeaderDesktop.style.display = 'flex';
        if (chatHeaderMobile) chatHeaderMobile.style.display = 'none';
    } else {
        // Мобильная версия
        if (chatScreen) {
            chatScreen.style.display = 'flex';
            chatScreen.classList.add('mobile');
        }
        if (desktopEmptyScreen) desktopEmptyScreen.style.display = 'none';
        if (homeScreen) homeScreen.style.display = 'none';
        if (mobileContainer) mobileContainer.style.display = 'flex';
        
        // Показываем правильный хедер
        if (chatHeaderMobile) chatHeaderMobile.style.display = 'flex';
        if (chatHeaderDesktop) chatHeaderDesktop.style.display = 'none';
    }
    
    // ========== ОПРЕДЕЛЯЕМ ДАННЫЕ ДЛЯ ЗАГОЛОВКА ==========
    let name, desc, avatar, badge = '';
    
    if (isPrivate) {
        // Личный чат - показываем данные другого пользователя
        const otherId = Object.keys(chat.members).find(id => id !== currentUser?.uid);
        const other = allUsers[otherId];
        name = other ? other.displayName : "Неизвестный";
        desc = "Личный чат";
        avatar = other ? other.displayName.charAt(0) : '?';
        badge = getVerifiedBadge(otherId);
    } else if (isChannel) {
        // Канал
        name = chat.name;
        desc = chat.description || "Канал";
        avatar = '<i class="fas fa-bullhorn"></i>';
        badge = getChannelVerifiedBadge(chatId);
    } else {
        // Группа
        name = chat.name;
        desc = chat.description || "Групповой чат";
        avatar = '<i class="fas fa-users"></i>';
    }
    
    // ========== ОБНОВЛЯЕМ ЗАГОЛОВОК ==========
    if (isDesktopActive) {
        // Десктопный заголовок
        if (desktopChatHeaderName) {
            desktopChatHeaderName.innerHTML = `<span class="chat-header-name-with-badge">${escapeHtml(name)} ${badge}</span>`;
        }
        if (desktopChatHeaderDescription) desktopChatHeaderDescription.textContent = desc;
        if (desktopChatAvatar) {
            desktopChatAvatar.innerHTML = avatar;
            if (isGroup) {
                desktopChatAvatar.style.background = 'linear-gradient(135deg, #10b981, #059669)';
            } else if (isChannel) {
                desktopChatAvatar.style.background = 'linear-gradient(135deg, #8b5cf6, #7c3aed)';
            } else {
                desktopChatAvatar.style.background = 'linear-gradient(135deg, #3b82f6, #1d4ed8)';
            }
        }
    } else {
        // Мобильный заголовок
        if (chatHeaderName) {
            chatHeaderName.innerHTML = `<span class="chat-header-name-with-badge">${escapeHtml(name)} ${badge}</span>`;
        }
        if (chatHeaderDescription) chatHeaderDescription.textContent = desc;
    }
    
    // ========== ЗАГРУЖАЕМ СООБЩЕНИЯ ==========
    loadMessages(chatId);
    
    // ========== СПЕЦИФИЧНАЯ ДЛЯ ТИПА ЧАТА ИНИЦИАЛИЗАЦИЯ ==========
    if (isGroup) {
        setTimeout(() => {
            addGroupActionButtons();
            addGroupMembersPreview();
        }, 500);
    } else if (isChannel) {
        setTimeout(() => {
            updateChannelUI();
            addChannelSettingsButton();
            addSubscribersCounter();
            updateChannelSubscribersCount(chatId);
        }, 100);
    }
    
    // ========== ПЕРЕПРИВЯЗЫВАЕМ ОБРАБОТЧИК ОТВЕТА ==========
    setTimeout(() => {
        if (typeof setupReplyHandler === 'function') {
            setupReplyHandler();
        }
    }, 500);
    
    // ========== ПРОКРУТКА К ПОСЛЕДНЕМУ СООБЩЕНИЮ ==========
    setTimeout(() => {
        scrollToLastMessage('auto');
        hideScrollToBottomButton();
    }, 200);
    
    // ========== ФОКУС НА ПОЛЕ ВВОДА ==========
    if (messageInput) {
        if (isChannel) {
            if (canSendToChannel(chatId, currentUser?.uid)) {
                setTimeout(() => messageInput.focus(), 300);
            }
        } else {
            setTimeout(() => messageInput.focus(), 300);
        }
    }
}

function clearChannelHeaderElements() {
    // Удаляем счетчик подписчиков из десктопной версии
    const desktopCounter = document.getElementById('desktopSubscribersCount');
    if (desktopCounter) desktopCounter.remove();
    
    // Удаляем счетчик подписчиков из мобильной версии
    const mobileCounter = document.getElementById('mobileSubscribersCount');
    if (mobileCounter) mobileCounter.remove();
    
    // Удаляем кнопку настроек канала
    const settingsBtn = document.getElementById('channelSettingsBtn');
    if (settingsBtn) settingsBtn.remove();
    
    // Удаляем кнопки управления группой
    const groupActions = document.querySelector('.group-actions');
    if (groupActions) groupActions.remove();
    
    // Удаляем превью участников группы
    const groupPreview = document.getElementById('groupMembersPreview');
    if (groupPreview) groupPreview.remove();
    
    // Удаляем индикатор роли
    const roleIndicator = document.getElementById('roleIndicator');
    if (roleIndicator) roleIndicator.remove();
    
    // Восстанавливаем оригинальное содержимое поля ввода
    const chatInputContainer = document.getElementById('chatInputContainer');
    if (chatInputContainer && chatInputContainer.dataset.originalContent) {
        chatInputContainer.innerHTML = chatInputContainer.dataset.originalContent;
        
        // Перепривязываем обработчики
        const newMessageInput = document.getElementById('messageInput');
        const newSendBtn = document.getElementById('sendMessageBtn');
        const newAttachBtn = document.getElementById('attachBtn');
        const newStickerBtn = document.getElementById('stickerBtn');
        
        if (newMessageInput) {
            newMessageInput.onkeypress = (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            };
        }
        if (newSendBtn) newSendBtn.onclick = sendMessage;
        if (newAttachBtn) newAttachBtn.onclick = () => showAttachTypeModal();
        if (newStickerBtn) newStickerBtn.onclick = () => openStickersModal();
    }
}

function showHomeScreen() {
    currentChatId = null;
    replyToMessage = null;
    hideReplyPreview();
    
    const isDesktopActive = window.innerWidth > 768;
    
    if (isDesktopActive) {
        if (chatScreen) chatScreen.style.display = 'none';
        if (desktopEmptyScreen) desktopEmptyScreen.style.display = 'flex';
        document.querySelectorAll('.desktop-chat-item').forEach(i => i.classList.remove('active'));
    } else {
        if (chatScreen) chatScreen.style.display = 'none';
        if (homeScreen) homeScreen.style.display = 'block';
    }
}

// ================================================
// ЗАГРУЗКА СООБЩЕНИЙ
// ================================================
let activeMessageListeners = {};

function loadMessages(chatId) {
    if (!messagesContainer) return;
    
    // Очищаем контейнер перед загрузкой
    messagesContainer.innerHTML = '';
    
    // Отключаем старые слушатели для этого чата
    if (activeMessageListeners && activeMessageListeners[chatId]) {
        if (activeMessageListeners[chatId].added) {
            database.ref(`messages/${chatId}`).off('child_added', activeMessageListeners[chatId].added);
        }
        if (activeMessageListeners[chatId].removed) {
            database.ref(`messages/${chatId}`).off('child_removed', activeMessageListeners[chatId].removed);
        }
        delete activeMessageListeners[chatId];
    }
    
    // Показываем индикатор загрузки
    messagesContainer.innerHTML = '<div class="loading-spinner" style="margin: 40px auto;"></div>';
    
    // Загружаем сообщения
    database.ref(`messages/${chatId}`).orderByChild('timestamp').once('value').then(snapshot => {
        const data = snapshot.val();
        
        if (data && Object.keys(data).length > 0) {
            const messagesArray = Object.keys(data).map(key => ({ id: key, ...data[key] }));
            messagesArray.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
            
            // Очищаем контейнер
            messagesContainer.innerHTML = '';
            
            // Добавляем все сообщения
            messagesArray.forEach(message => {
                // Пропускаем системные сообщения (они добавляются отдельно)
                if (message.senderId !== 'system' && message.type !== 'system') {
                    const messageElement = createMessageElement(message);
                    if (messageElement) {
                        messagesContainer.appendChild(messageElement);
                    }
                }
            });
            
            // Прокручиваем к последнему сообщению
            setTimeout(() => {
                scrollToLastMessage('auto');
            }, 100);
            
            // Обновляем статистику для канала (посты)
            const currentChat = chats.find(c => c.id === chatId);
            if (currentChat && currentChat.type === 'channel') {
                updateMonetizationStats(chatId);
                
                // Обновляем счетчик постов в статистике если открыты настройки
                const totalPostsSpan = document.getElementById('totalPosts');
                if (totalPostsSpan) {
                    countChannelPosts(chatId).then(count => {
                        totalPostsSpan.textContent = count;
                    });
                }
            }
        } else {
            messagesContainer.innerHTML = '<div class="empty-state"><i class="fas fa-comments"></i><h3>Нет сообщений</h3><p>Напишите первое сообщение!</p></div>';
        }
        
        // Включаем слушатель новых сообщений
        setupMessageListeners(chatId);
        
    }).catch(error => {
        console.error('Ошибка загрузки сообщений:', error);
        messagesContainer.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><h3>Ошибка загрузки</h3><p>Не удалось загрузить сообщения</p><button class="btn btn-primary" onclick="loadMessages(\'' + chatId + '\')">Повторить</button></div>';
    });
    
    setupScrollListener();
}

function setupMessageListeners(chatId) {
    // Удаляем старый слушатель если есть
    if (activeMessageListeners[chatId]) {
        if (activeMessageListeners[chatId].added) {
            database.ref(`messages/${chatId}`).off('child_added', activeMessageListeners[chatId].added);
        }
        if (activeMessageListeners[chatId].removed) {
            database.ref(`messages/${chatId}`).off('child_removed', activeMessageListeners[chatId].removed);
        }
    }
    
    const addedMessageIds = new Set();
    
    // Слушатель добавления новых сообщений
    const addedListener = database.ref(`messages/${chatId}`).on('child_added', (snapshot) => {
        // Проверяем, что открыт именно этот чат
        if (currentChatId !== chatId) {
            return;
        }
        
        const msg = { id: snapshot.key, ...snapshot.val() };
        
        // Проверяем дубликаты
        if (addedMessageIds.has(msg.id)) return;
        
        // Проверяем, нет ли уже такого сообщения в DOM
        const existingMessage = document.querySelector(`[data-message-id="${msg.id}"]`);
        if (existingMessage) {
            addedMessageIds.add(msg.id);
            return;
        }
        
        addedMessageIds.add(msg.id);
        
        // Пропускаем системные сообщения
        if (msg.senderId === 'system' || msg.type === 'system') return;
        
        if (messagesContainer) {
            const messageElement = createMessageElement(msg);
            if (messageElement) {
                messagesContainer.appendChild(messageElement);
                
                // Авто-прокрутка если пользователь внизу
                if (isUserNearBottom()) {
                    setTimeout(() => scrollToLastMessage('smooth'), 50);
                } else {
                    showScrollToBottomButton();
                }
            }
        }
    });
    
    // Слушатель удаления сообщений
    const removedListener = database.ref(`messages/${chatId}`).on('child_removed', (snapshot) => {
        // Проверяем, что открыт именно этот чат
        if (currentChatId !== chatId) return;
        
        const messageId = snapshot.key;
        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        
        if (messageElement) {
            messageElement.remove();
            addedMessageIds.delete(messageId);
            
            // Если сообщений не осталось, показываем пустое состояние
            if (messagesContainer && messagesContainer.children.length === 0) {
                messagesContainer.innerHTML = '<div class="empty-state"><i class="fas fa-comments"></i><h3>Нет сообщений</h3><p>Напишите первое сообщение!</p></div>';
            }
            
            // Обновляем последнее сообщение в чате
            updateChatLastMessage(chatId);
            
            // Обновляем статистику постов для канала
            const currentChat = chats.find(c => c.id === chatId);
            if (currentChat && currentChat.type === 'channel') {
                const totalPostsSpan = document.getElementById('totalPosts');
                if (totalPostsSpan) {
                    countChannelPosts(chatId).then(count => {
                        totalPostsSpan.textContent = count;
                    });
                }
                updateMonetizationStats(chatId);
            }
        }
    });
    
    activeMessageListeners[chatId] = {
        added: addedListener,
        removed: removedListener
    };
}

function listenToNewMessages(chatId) {
    if (messageListeners[chatId]) {
        if (messageListeners[chatId].added) {
            database.ref(`messages/${chatId}`).off('child_added', messageListeners[chatId].added);
        }
        if (messageListeners[chatId].removed) {
            database.ref(`messages/${chatId}`).off('child_removed', messageListeners[chatId].removed);
        }
    }
    
    const addedMessageIds = new Set();
    
    const addedListener = database.ref(`messages/${chatId}`).on('child_added', (snapshot) => {
        const msg = { id: snapshot.key, ...snapshot.val() };
        if (addedMessageIds.has(msg.id)) return;
        const existingMessage = document.querySelector(`[data-message-id="${msg.id}"]`);
        if (existingMessage) {
            addedMessageIds.add(msg.id);
            return;
        }
        addedMessageIds.add(msg.id);
        if (msg.senderId === 'system' || msg.type === 'system') return;
        if (messagesContainer) {
            const messageElement = createMessageElement(msg);
            messagesContainer.appendChild(messageElement);
            if (isUserNearBottom()) {
                setTimeout(() => scrollToLastMessage('smooth'), 50);
            } else {
                showScrollToBottomButton();
            }
        }
    });
    
    const removedListener = database.ref(`messages/${chatId}`).on('child_removed', (snapshot) => {
        const messageId = snapshot.key;
        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        if (messageElement) {
            messageElement.remove();
            addedMessageIds.delete(messageId);
            if (messagesContainer && messagesContainer.children.length === 0) {
                messagesContainer.innerHTML = '<div class="empty-state"><i class="fas fa-comments"></i><h3>Нет сообщений</h3><p>Напишите первое сообщение!</p></div>';
            }
            updateChatLastMessage(chatId);
        }
    });
    
    messageListeners[chatId] = {
        added: addedListener,
        removed: removedListener
    };
}

async function updateChatLastMessage(chatId) {
    try {
        const messagesRef = database.ref(`messages/${chatId}`);
        const snapshot = await messagesRef.orderByChild('timestamp').limitToLast(1).once('value');
        const messages = snapshot.val();
        
        let lastMessage = null;
        
        if (messages) {
            const lastKey = Object.keys(messages)[0];
            const lastMsg = messages[lastKey];
            
            let lastMessageText = '';
            if (lastMsg.type === 'photo') {
                lastMessageText = '📸 Фото';
            } else if (lastMsg.type === 'file') {
                const fileName = lastMsg.fileName || 'Файл';
                lastMessageText = `📎 ${fileName.length > 30 ? fileName.substring(0, 27) + '...' : fileName}`;
            } else if (lastMsg.type === 'sticker') {
                lastMessageText = '🖼️ Стикер';
            } else if (lastMsg.type === 'text') {
                lastMessageText = lastMsg.text.length > 50 ? lastMsg.text.substring(0, 50) + '...' : lastMsg.text;
            } else {
                lastMessageText = 'Сообщение';
            }
            
            lastMessage = {
                text: lastMessageText,
                timestamp: lastMsg.timestamp,
                senderId: lastMsg.senderId,
                type: lastMsg.type
            };
        } else {
            lastMessage = {
                text: "Нет сообщений",
                timestamp: Date.now(),
                senderId: null,
                type: "system"
            };
        }
        
        await database.ref(`chats/${chatId}`).update({
            lastMessage: lastMessage,
            updatedAt: lastMessage.timestamp
        });
        
        const chatIndex = chats.findIndex(c => c.id === chatId);
        if (chatIndex !== -1) {
            chats[chatIndex].lastMessage = lastMessage;
            chats[chatIndex].updatedAt = lastMessage.timestamp;
        }
        
        updateChatsDisplay();
        return lastMessage;
        
    } catch (error) {
        console.error('Ошибка обновления последнего сообщения:', error);
        return null;
    }
}

function createScrollToBottomButton() {
    if (document.getElementById('scroll-btn')) return;
    
    const btn = document.createElement('button');
    btn.id = 'scroll-btn';
    btn.className = 'scroll-to-bottom-btn';
    btn.innerHTML = '<i class="fas fa-arrow-down"></i>';
    btn.title = 'Прокрутить вниз';
    btn.onclick = () => {
        scrollToLastMessage('smooth');
        btn.classList.remove('visible');
    };
    document.body.appendChild(btn);
    scrollBtn = btn;
}

function showScrollToBottomButton() {
    if (!scrollBtn) createScrollToBottomButton();
    if (scrollBtn) scrollBtn.classList.add('visible');
}

function setupScrollListener() {
    if (!messagesContainer) return;
    
    // Удаляем старый слушатель, если есть
    if (messagesContainer._scrollListener) {
        messagesContainer.removeEventListener('scroll', messagesContainer._scrollListener);
    }
    
    const scrollHandler = () => {
        if (isUserNearBottom()) {
            hideScrollToBottomButton();
        } else if (messagesContainer.children.length > 0) {
            showScrollToBottomButton();
        }
    };
    
    messagesContainer.addEventListener('scroll', scrollHandler);
    messagesContainer._scrollListener = scrollHandler;
}

function scrollToMessage(id) {
    const el = document.querySelector(`[data-message-id="${id}"]`);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.style.background = 'rgba(139, 92, 246, 0.3)';
        setTimeout(() => el.style.background = '', 2000);
    }
}

// ================================================
// СОЗДАНИЕ ЭЛЕМЕНТОВ СООБЩЕНИЙ
// ================================================
function createSystemMessageElement(message) {
    const div = document.createElement('div');
    div.className = `system-message ${isMobile ? 'mobile' : 'desktop'}`;
    div.dataset.messageId = message.id;
    
    const time = new Date(message.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    
    let systemIcon = 'fa-info-circle';
    let systemColor = '#64748b';
    let systemBadge = '<span class="system-badge system"><i class="fas fa-robot"></i> Система</span>';
    
    if (message.text.includes('присоединился')) {
        systemIcon = 'fa-user-plus';
        systemColor = '#10b981';
        systemBadge = '<span class="system-badge join"><i class="fas fa-user-plus"></i> Присоединился</span>';
    } else if (message.text.includes('покинул')) {
        systemIcon = 'fa-sign-out-alt';
        systemColor = '#ef4444';
        systemBadge = '<span class="system-badge leave"><i class="fas fa-sign-out-alt"></i> Покинул</span>';
    } else if (message.text.includes('исключил')) {
        systemIcon = 'fa-user-minus';
        systemColor = '#f59e0b';
        systemBadge = '<span class="system-badge kick"><i class="fas fa-user-minus"></i> Исключён</span>';
    } else if (message.text.includes('добавил')) {
        systemIcon = 'fa-user-plus';
        systemColor = '#8b5cf6';
        systemBadge = '<span class="system-badge add"><i class="fas fa-user-plus"></i> Добавлен</span>';
    } else if (message.text.includes('создал')) {
        systemIcon = 'fa-plus-circle';
        systemColor = '#8b5cf6';
        systemBadge = '<span class="system-badge create"><i class="fas fa-plus-circle"></i> Создатель</span>';
    } else if (message.text.includes('подписался')) {
        systemIcon = 'fa-bell';
        systemColor = '#10b981';
        systemBadge = '<span class="system-badge subscribe"><i class="fas fa-bell"></i> Подписка</span>';
    } else if (message.text.includes('отписался')) {
        systemIcon = 'fa-bell-slash';
        systemColor = '#ef4444';
        systemBadge = '<span class="system-badge unsubscribe"><i class="fas fa-bell-slash"></i> Отписка</span>';
    }
    
    div.innerHTML = `
        <div class="system-message-content">
            <div class="system-icon" style="color: ${systemColor};">
                <i class="fas ${systemIcon}"></i>
            </div>
            <div class="system-text">${escapeHtml(message.text)}</div>
            <div class="system-time">${time}</div>
            ${systemBadge}
        </div>
    `;
    
    return div;
}

function createMessageElement(message) {
    // Системные сообщения
    if (message.senderId === 'system' || message.type === 'system') {
        return createSystemMessageElement(message);
    }
    
    const isOutgoing = message.senderId === currentUser?.uid;
    const div = document.createElement('div');
    const isSticker = message.type === 'sticker';
    
    // Проверяем, является ли текущий чат каналом
    const currentChat = chats.find(c => c.id === currentChatId);
    const isChannel = currentChat && currentChat.type === 'channel';
    
    // Базовые классы
    div.className = `message ${isOutgoing ? 'outgoing' : 'incoming'} ${isMobile ? 'mobile' : 'desktop'} ${isSticker ? 'sticker-message' : ''}`;
    
    // Добавляем специальный класс для сообщений в канале
    if (isChannel) {
        div.classList.add('channel-message');
    }
    
    div.dataset.messageId = message.id;
    div.dataset.senderId = message.senderId;
    
    const time = new Date(message.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    
    // Определяем отображаемое имя и аватар
    let displayName = '';
    let avatarIcon = '';
    let verifiedBadge = '';
    
    if (isChannel) {
        displayName = currentChat.name;
        avatarIcon = '<i class="fas fa-bullhorn"></i>';
        verifiedBadge = getChannelVerifiedBadge(currentChat.id);
    } else {
        let senderName = message.senderName || "Пользователь";
        if (allUsers[message.senderId]) {
            senderName = allUsers[message.senderId].displayName;
        }
        displayName = senderName;
        
        const sender = allUsers[message.senderId];
        if (sender && sender.avatar) {
            avatarIcon = `<img src="${sender.avatar}" alt="Avatar" style="width: 100%; height: 100%; border-radius: inherit; object-fit: cover;">`;
        } else {
            avatarIcon = escapeHtml(displayName.charAt(0));
        }
        verifiedBadge = getVerifiedBadge(message.senderId);
    }
    
    // Блок ответа (reply)
    let replyHtml = '';
    if (message.replyTo) {
        let repliedName = message.replyTo.senderName || "Пользователь";
        if (message.replyTo.senderId && allUsers[message.replyTo.senderId]) {
            repliedName = allUsers[message.replyTo.senderId].displayName;
        }
        if (isChannel) {
            repliedName = currentChat.name;
        }
        replyHtml = `
            <div class="message-reply" data-reply-to="${message.replyTo.id}">
                <div class="reply-sender"><i class="fas fa-reply"></i> ${escapeHtml(repliedName)}</div>
                <div class="reply-text">${escapeHtml(message.replyTo.text || 'Сообщение удалено')}</div>
            </div>
        `;
    }
    
    // Фото
    let photoHtml = '';
    if (message.type === 'photo' && message.photo) {
        photoHtml = `<img src="${message.photo}" class="message-photo" alt="Photo" onclick="window.showFullPhoto && showFullPhoto('${message.photo}')">`;
    }
    
    // Файлы
    let fileHtml = '';
    if (message.type === 'file' && message.fileData) {
        const icon = getFileIcon(message.fileName);
        const size = (message.fileSize / 1024).toFixed(1);
        fileHtml = `
            <div class="message-file" onclick="downloadFile('${message.fileData}', '${message.fileName}')">
                <i class="fas ${icon}"></i>
                <div class="message-file-info">
                    <div class="message-file-name">${escapeHtml(message.fileName)}</div>
                    <div class="message-file-size">${size} KB</div>
                </div>
                <i class="fas fa-download"></i>
            </div>
        `;
    }
    
    // Стикеры
    let stickerHtml = '';
    if (message.type === 'sticker' && message.stickerUrl) {
        stickerHtml = `<img src="${message.stickerUrl}" class="message-sticker" alt="Sticker" onclick="window.showFullPhoto && showFullPhoto('${message.stickerUrl}')">`;
    }
    
    // Реакции
    let reactionsHtml = '';
    if (message.reactions) {
        const reactionGroups = {};
        Object.values(message.reactions).forEach(r => {
            if (!reactionGroups[r.emoji]) reactionGroups[r.emoji] = [];
            reactionGroups[r.emoji].push(r.userId);
        });
        
        if (Object.keys(reactionGroups).length > 0) {
            reactionsHtml = '<div class="message-reactions">';
            for (const [emoji, users] of Object.entries(reactionGroups)) {
                const isUserReacted = users.includes(currentUser?.uid);
                reactionsHtml += `
                    <div class="reaction-badge ${isUserReacted ? 'active' : ''}" data-emoji="${emoji}" data-message-id="${message.id}">
                        ${emoji} <span class="reaction-count">${users.length}</span>
                    </div>
                `;
            }
            reactionsHtml += '</div>';
        }
    }
    
    // Собираем HTML
    if (isSticker) {
        div.innerHTML = `
            <div class="message-avatar ${isChannel ? 'channel-avatar' : ''}" style="${!isChannel && allUsers[message.senderId]?.avatar ? 'padding: 0; overflow: hidden;' : ''}">${avatarIcon}</div>
            <div class="message-content">
                <div class="message-sender">
                    <span class="message-sender-name" ${!isChannel ? `onclick="window.openUserProfileModal && openUserProfileModal('${message.senderId}')"` : ''}>
                        ${escapeHtml(displayName)} ${verifiedBadge}
                    </span>
                    <span class="message-time">${time}</span>
                </div>
                ${replyHtml}
                <div class="sticker-wrapper">${stickerHtml}</div>
                ${reactionsHtml}
            </div>
        `;
    } else {
        div.innerHTML = `
            <div class="message-avatar ${isChannel ? 'channel-avatar' : ''}" style="${!isChannel && allUsers[message.senderId]?.avatar ? 'padding: 0; overflow: hidden;' : ''}">${avatarIcon}</div>
            <div class="message-content">
                <div class="message-sender">
                    <span class="message-sender-name" ${!isChannel ? `onclick="window.openUserProfileModal && openUserProfileModal('${message.senderId}')"` : ''}>
                        ${escapeHtml(displayName)} ${verifiedBadge}
                    </span>
                    <span class="message-time">${time}</span>
                </div>
                ${replyHtml}
                ${photoHtml}
                ${fileHtml}
                ${message.type !== 'photo' && message.type !== 'file' && message.type !== 'sticker' ? `<div class="message-text" style="white-space: pre-wrap; word-break: break-word;">${escapeHtml(message.text)}</div>` : ''}
                ${reactionsHtml}
            </div>
        `;
    }
    
    // ========== ПРАВИЛЬНЫЙ ОБРАБОТЧИК КОНТЕКСТНОГО МЕНЮ ==========
    div.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const menu = document.getElementById('messageContextMenu');
        if (!menu) return;
        
        // Закрываем предыдущее меню
        closeContextMenu();
        
        // Сохраняем данные сообщения
        menu.dataset.messageId = message.id;
        menu.dataset.messageText = message.text || '';
        
        // Показываем/скрываем кнопку удаления
        const deleteItem = document.getElementById('contextDelete');
        if (deleteItem) {
            const isAdmin = verifiedUsers && verifiedUsers[currentUser?.uid] && verifiedUsers[currentUser?.uid].type === 'admin';
            deleteItem.style.display = (isOutgoing || message.senderId === currentUser?.uid || isAdmin) ? 'flex' : 'none';
        }
        
        // Позиционирование
        let left = e.clientX;
        let top = e.clientY;
        const menuWidth = 220;
        const menuHeight = 250;
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        if (left + menuWidth > windowWidth - 10) {
            left = windowWidth - menuWidth - 10;
        }
        if (left < 10) left = 10;
        
        if (top + menuHeight > windowHeight - 10) {
            top = windowHeight - menuHeight - 10;
        }
        if (top < 10) top = 10;
        
        menu.style.left = left + 'px';
        menu.style.top = top + 'px';
        menu.style.display = 'block';
        menu.classList.add('active');
        
        return false;
    });
    
    // Двойной клик для реакции
    div.addEventListener('dblclick', (e) => {
        if (e.target.closest('.reaction-badge') || 
            e.target.closest('.message-reply') ||
            e.target.closest('.message-file') ||
            e.target.closest('.message-photo') ||
            e.target.closest('.message-sticker')) {
            return;
        }
        
        e.preventDefault();
        e.stopPropagation();
        
        if (currentChatId && message.id) {
            toggleReaction(message.id, '❤️');
            
            const messageContent = div.querySelector('.message-content');
            if (messageContent) {
                messageContent.style.transform = 'scale(1.02)';
                setTimeout(() => {
                    messageContent.style.transform = '';
                }, 150);
            }
        }
    });
    
    // Клик по реакциям
    const reactionBadges = div.querySelectorAll('.reaction-badge');
    reactionBadges.forEach(badge => {
        badge.addEventListener('click', (e) => {
            e.stopPropagation();
            const emoji = badge.dataset.emoji;
            const msgId = badge.dataset.messageId;
            if (emoji && msgId) {
                toggleReaction(msgId, emoji);
            }
        });
    });
    
    // Клик по ответу
    const replyDiv = div.querySelector('.message-reply');
    if (replyDiv) {
        replyDiv.addEventListener('click', () => {
            const replyToId = replyDiv.dataset.replyTo;
            if (replyToId) {
                scrollToMessage(replyToId);
            }
        });
    }
    
    return div;
}

function closeContextMenu() {
    const menu = document.getElementById('messageContextMenu');
    if (menu) {
        menu.classList.remove('active');
        menu.style.display = 'none';
    }
    activeContextMenu = null;
    if (contextMenuTimeout) {
        clearTimeout(contextMenuTimeout);
        contextMenuTimeout = null;
    }
}

async function toggleReaction(messageId, emoji) {
    if (!currentChatId || !messageId || !emoji || !currentUser) return;
    
    try {
        const reactionId = `${currentUser.uid}_${emoji}`;
        const reactionRef = database.ref(`messages/${currentChatId}/${messageId}/reactions/${reactionId}`);
        const snapshot = await reactionRef.once('value');
        
        if (snapshot.exists()) {
            await reactionRef.remove();
        } else {
            await reactionRef.set({
                emoji: emoji,
                userId: currentUser.uid,
                timestamp: Date.now(),
                userName: currentUser.displayName || "Пользователь"
            });
        }
        
        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        if (messageElement) {
            const snapshot = await database.ref(`messages/${currentChatId}/${messageId}`).once('value');
            const updatedMessage = { id: messageId, ...snapshot.val() };
            updateMessageReactionsOnly(messageElement, updatedMessage);
        }
        
        if (activeContextMenu) {
            closeContextMenu();
        }
        
    } catch (error) {
        console.error('Ошибка при toggleReaction:', error);
    }
}

function updateMessageReactionsOnly(messageElement, updatedMessage) {
    if (!messageElement || !updatedMessage) return;
    
    const reactions = updatedMessage.reactions || {};
    const reactionGroups = {};
    Object.values(reactions).forEach(r => {
        if (!reactionGroups[r.emoji]) reactionGroups[r.emoji] = [];
        reactionGroups[r.emoji].push(r.userId);
    });
    
    let reactionsHtml = '';
    if (Object.keys(reactionGroups).length > 0) {
        reactionsHtml = '<div class="message-reactions">';
        for (const [emoji, users] of Object.entries(reactionGroups)) {
            const isUserReacted = users.includes(currentUser?.uid);
            reactionsHtml += `
                <div class="reaction-badge ${isUserReacted ? 'active' : ''}" data-emoji="${emoji}" data-message-id="${updatedMessage.id}">
                    ${emoji} <span class="reaction-count">${users.length}</span>
                </div>
            `;
        }
        reactionsHtml += '</div>';
    }
    
    let existingReactions = messageElement.querySelector('.message-reactions');
    if (existingReactions) {
        if (Object.keys(reactionGroups).length > 0) {
            existingReactions.outerHTML = reactionsHtml;
        } else {
            existingReactions.remove();
        }
    } else if (Object.keys(reactionGroups).length > 0) {
        const contentDiv = messageElement.querySelector('.message-content');
        if (contentDiv) {
            contentDiv.insertAdjacentHTML('beforeend', reactionsHtml);
        }
    }
    
    document.querySelectorAll(`.reaction-badge[data-message-id="${updatedMessage.id}"]`).forEach(badge => {
        badge.addEventListener('click', (e) => {
            e.stopPropagation();
            const emoji = badge.dataset.emoji;
            const msgId = badge.dataset.messageId;
            if (emoji && msgId) {
                toggleReaction(msgId, emoji);
            }
        });
    });
}

// ================================================
// ОТПРАВКА СООБЩЕНИЙ
// ================================================
async function sendMessage() {
    // Получаем текущий чат
    const currentChat = chats.find(c => c.id === currentChatId);
    
    // Проверка на фото
    if (selectedPhoto) { 
        await sendPhoto(); 
        return; 
    }
    
    // Проверка на файл
    if (selectedFile) { 
        await sendFile(); 
        return; 
    }
    
    // Получаем поле ввода
    const input = document.getElementById('messageInput');
    if (!input) {
        console.error('Message input not found');
        return;
    }
    
    const text = input.value.trim();
    
    // Проверка: есть ли текст и открыт ли чат
    if (!text) {
        console.log('No text to send');
        return;
    }
    
    if (!currentChatId) {
        console.error('No chat selected');
        showNotification('Выберите чат для отправки сообщения');
        return;
    }
    
    if (!currentUser) {
        console.error('User not logged in');
        return;
    }
    
    // Проверка прав для канала
    if (currentChat && currentChat.type === 'channel') {
        if (!canSendToChannel(currentChatId, currentUser?.uid)) {
            showNotification('У вас нет прав на отправку сообщений в этот канал');
            return;
        }
    }
    
    try {
        const wasNearBottom = isUserNearBottom();
        
        // Создаем сообщение
        const newMessage = {
            text: text,
            senderId: currentUser.uid,
            senderName: currentUser.displayName || "Пользователь",
            timestamp: Date.now(),
            type: "text"
        };
        
        // Добавляем ответ, если есть
        if (window.replyToMessageGlobal && window.replyToMessageGlobal.id) {
            newMessage.replyTo = {
                id: window.replyToMessageGlobal.id,
                text: window.replyToMessageGlobal.text || 'Сообщение',
                senderName: window.replyToMessageGlobal.senderName || 'Пользователь',
                senderId: window.replyToMessageGlobal.senderId
            };
            
            // Очищаем reply
            window.replyToMessageGlobal = null;
            const previewContainer = document.getElementById('replyPreviewContainer');
            if (previewContainer) {
                previewContainer.style.display = 'none';
                previewContainer.innerHTML = '';
            }
        }
        
        // Очищаем поле ввода
        input.value = '';
        input.style.height = 'auto';
        
        // Отправляем в Firebase
        const messageRef = await database.ref(`messages/${currentChatId}`).push(newMessage);
        console.log('Message sent:', messageRef.key);
        
        // Обновляем последнее сообщение в чате
        await database.ref(`chats/${currentChatId}`).update({
            lastMessage: {
                text: text.length > 50 ? text.substring(0, 50) + '...' : text,
                timestamp: Date.now(),
                senderId: currentUser.uid,
                type: "text"
            },
            updatedAt: Date.now()
        });
        
        // Обновляем статистику для канала
        if (currentChat && currentChat.type === 'channel') {
            await updatePostCount(currentChatId);
            updateMonetizationStats(currentChatId);
        }
        
        // Прокрутка к последнему сообщению
        if (wasNearBottom) {
            setTimeout(() => scrollToLastMessage('smooth'), 100);
        } else {
            showScrollToBottomButton();
        }
        
    } catch (error) {
        console.error('Ошибка при отправке сообщения:', error);
        showNotification('Ошибка при отправке сообщения: ' + error.message);
    }
}

async function sendPhoto() {
    if (!selectedPhoto || !currentChatId) return;
    
    const chat = chats.find(c => c.id === currentChatId);
    if (chat && chat.type === 'channel' && !canSendToChannel(currentChatId, currentUser?.uid)) {
        showNotification('У вас нет прав на отправку сообщений в этот канал');
        clearPhotoPreview();
        return;
    }
    
    try {
        showPhotoProgress(0);
        const base64 = await fileToBase64WithProgress(selectedPhoto, p => showPhotoProgress(Math.round(p * 50)));
        showPhotoProgress(50);
        const optimized = await optimizeImage(base64, 1024, 1024);
        showPhotoProgress(70);
        const wasNearBottom = isUserNearBottom();
        
        const msg = {
            text: `📸 ${selectedPhoto.name}`,
            senderId: currentUser.uid,
            senderName: currentUser.displayName || "Пользователь",
            timestamp: Date.now(),
            type: "photo",
            photo: optimized,
            photoName: selectedPhoto.name,
            photoSize: selectedPhoto.size
        };
        
        if (window.replyToMessageGlobal && window.replyToMessageGlobal.id) {
            msg.replyTo = {
                id: window.replyToMessageGlobal.id,
                text: window.replyToMessageGlobal.text,
                senderName: window.replyToMessageGlobal.senderName,
                senderId: window.replyToMessageGlobal.senderId
            };
            window.replyToMessageGlobal = null;
            const previewContainer = document.getElementById('replyPreviewContainer');
            if (previewContainer) {
                previewContainer.style.display = 'none';
                previewContainer.innerHTML = '';
            }
        }
        
        await database.ref(`messages/${currentChatId}`).push(msg);
        showPhotoProgress(100);
        await database.ref(`chats/${currentChatId}`).update({
            lastMessage: { text: '📸 Фото', timestamp: Date.now(), senderId: currentUser.uid, type: 'photo' },
            updatedAt: Date.now()
        });
        
        clearPhotoPreview();
        if (wasNearBottom) setTimeout(() => scrollToLastMessage('smooth'), 100);
        else showScrollToBottomButton();
        setTimeout(hidePhotoProgress, 1000);
    } catch (error) {
        console.error(error);
        hidePhotoProgress();
    }
}

async function sendFile() {
    if (!selectedFile || !currentChatId) return;
    
    const chat = chats.find(c => c.id === currentChatId);
    if (chat && chat.type === 'channel' && !canSendToChannel(currentChatId, currentUser?.uid)) {
        showNotification('У вас нет прав на отправку сообщений в этот канал');
        clearFilePreview();
        return;
    }
    
    try {
        showFileProgress(0);
        const base64 = await fileToBase64WithProgress(selectedFile, p => showFileProgress(Math.round(p * 100)));
        const wasNearBottom = isUserNearBottom();
        
        const msg = {
            text: `📎 ${selectedFile.name}`,
            senderId: currentUser.uid,
            senderName: currentUser.displayName || "Пользователь",
            timestamp: Date.now(),
            type: "file",
            fileData: base64,
            fileName: selectedFile.name,
            fileSize: selectedFile.size,
            fileType: selectedFile.type || 'application/octet-stream'
        };
        
        if (window.replyToMessageGlobal && window.replyToMessageGlobal.id) {
            msg.replyTo = {
                id: window.replyToMessageGlobal.id,
                text: window.replyToMessageGlobal.text,
                senderName: window.replyToMessageGlobal.senderName,
                senderId: window.replyToMessageGlobal.senderId
            };
            window.replyToMessageGlobal = null;
            const previewContainer = document.getElementById('replyPreviewContainer');
            if (previewContainer) {
                previewContainer.style.display = 'none';
                previewContainer.innerHTML = '';
            }
        }
        
        await database.ref(`messages/${currentChatId}`).push(msg);
        await database.ref(`chats/${currentChatId}`).update({
            lastMessage: { text: `📎 Файл: ${selectedFile.name}`, timestamp: Date.now(), senderId: currentUser.uid, type: 'file' },
            updatedAt: Date.now()
        });
        
        clearFilePreview();
        if (wasNearBottom) setTimeout(() => scrollToLastMessage('smooth'), 100);
        else showScrollToBottomButton();
        setTimeout(hideFileProgress, 1000);
    } catch (error) {
        console.error(error);
        hideFileProgress();
    }
}

async function sendSticker(stickerUrl) {
    if (!currentChatId || !stickerUrl) return;
    
    const chat = chats.find(c => c.id === currentChatId);
    if (chat && chat.type === 'channel' && !canSendToChannel(currentChatId, currentUser?.uid)) {
        showNotification('У вас нет прав на отправку сообщений в этот канал');
        return;
    }
    
    try {
        const wasNearBottom = isUserNearBottom();
        const isTGS = stickerUrl.endsWith('.tgs');
        
        const stickerMessage = {
            text: isTGS ? '🎬 Анимированный стикер' : '🖼️ Стикер',
            senderId: currentUser.uid,
            senderName: currentUser.displayName || "Пользователь",
            timestamp: Date.now(),
            type: "sticker",
            stickerUrl: stickerUrl,
            isTGS: isTGS
        };
        
        if (window.replyToMessageGlobal && window.replyToMessageGlobal.id) {
            stickerMessage.replyTo = {
                id: window.replyToMessageGlobal.id,
                text: window.replyToMessageGlobal.text,
                senderName: window.replyToMessageGlobal.senderName,
                senderId: window.replyToMessageGlobal.senderId
            };
            window.replyToMessageGlobal = null;
            const previewContainer = document.getElementById('replyPreviewContainer');
            if (previewContainer) {
                previewContainer.style.display = 'none';
                previewContainer.innerHTML = '';
            }
        }
        
        await database.ref(`messages/${currentChatId}`).push(stickerMessage);
        await database.ref(`chats/${currentChatId}`).update({
            lastMessage: {
                text: isTGS ? '🎬 Анимированный стикер' : '🖼️ Стикер',
                timestamp: Date.now(),
                senderId: currentUser.uid,
                type: 'sticker'
            },
            updatedAt: Date.now()
        });
        
        if (wasNearBottom) setTimeout(() => scrollToLastMessage('smooth'), 100);
        else showScrollToBottomButton();
        closeStickersModalFunc();
    } catch (error) {
        console.error("Ошибка при отправке стикера:", error);
    }
}

// ================================================
// ФУНКЦИИ ДЛЯ ВЛОЖЕНИЙ
// ================================================
function setupAttachModal() {
    if (!attachBtn) return;
    attachBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        showAttachTypeModal();
    };
    if (closeAttachTypeModalBtn) closeAttachTypeModalBtn.onclick = () => closeAttachTypeModal();
    if (attachPhotoOptionBtn) attachPhotoOptionBtn.onclick = () => {
        closeAttachTypeModal();
        triggerPhotoUpload();
    };
    if (attachFileOptionBtn) attachFileOptionBtn.onclick = () => {
        closeAttachTypeModal();
        triggerFileUpload();
    };
    if (attachTypeModal) attachTypeModal.onclick = (e) => {
        if (e.target === attachTypeModal) closeAttachTypeModal();
    };
}

function showAttachTypeModal() {
    if (attachTypeModal) attachTypeModal.classList.add('active');
}

function closeAttachTypeModal() {
    if (attachTypeModal) attachTypeModal.classList.remove('active');
}

function triggerPhotoUpload() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
    fileInput.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 20 * 1024 * 1024) {
            fileInput.remove();
            return;
        }
        showPhotoPreview(file);
        fileInput.remove();
    };
    fileInput.click();
}

function triggerFileUpload() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
    fileInput.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 20 * 1024 * 1024) {
            fileInput.remove();
            return;
        }
        showFilePreview(file);
        fileInput.remove();
    };
    fileInput.click();
}

function setupPhotoUpload() {
    if (photoPreviewRemove) photoPreviewRemove.onclick = () => clearPhotoPreview();
    if (closePhotoModal) closePhotoModal.onclick = () => {
        if (photoViewModal) photoViewModal.classList.remove('active');
        if (fullSizePhoto) fullSizePhoto.src = '';
    };
    if (photoViewModal) photoViewModal.onclick = (e) => {
        if (e.target === photoViewModal) {
            photoViewModal.classList.remove('active');
            fullSizePhoto.src = '';
        }
    };
}

function showPhotoPreview(file) {
    selectedPhoto = file;
    const reader = new FileReader();
    reader.onload = (e) => {
        if (photoPreview) photoPreview.src = e.target.result;
    };
    reader.readAsDataURL(file);
    
    if (photoPreviewName) {
        const name = file.name.length > 25 ? file.name.substring(0, 22) + '...' : file.name;
        photoPreviewName.textContent = name;
    }
    if (photoPreviewSize) {
        const size = (file.size / 1024).toFixed(1);
        photoPreviewSize.innerHTML = `<i class="fas fa-image"></i> ${size} KB`;
    }
    if (photoPreviewContainer) photoPreviewContainer.style.display = 'block';
}

function clearPhotoPreview() {
    selectedPhoto = null;
    if (photoPreviewContainer) photoPreviewContainer.style.display = 'none';
    if (photoPreview) photoPreview.src = '';
    if (photoPreviewName) photoPreviewName.textContent = '';
    if (photoPreviewSize) photoPreviewSize.textContent = '';
    hidePhotoProgress();
}

function showPhotoProgress(percent) {
    if (photoProgress) {
        photoProgress.style.display = 'block';
        if (photoProgressBar) photoProgressBar.style.width = percent + '%';
        if (photoProgressText) photoProgressText.textContent = percent + '%';
    }
}

function hidePhotoProgress() {
    if (photoProgress) photoProgress.style.display = 'none';
    if (photoProgressBar) photoProgressBar.style.width = '0%';
}

function setupFileUpload() {
    if (filePreviewRemove) filePreviewRemove.onclick = () => clearFilePreview();
}

function showFilePreview(file) {
    selectedFile = file;
    const name = file.name.length > 30 ? file.name.substring(0, 27) + '...' : file.name;
    if (filePreviewName) filePreviewName.textContent = name;
    const size = (file.size / 1024).toFixed(1);
    if (filePreviewSize) filePreviewSize.innerHTML = `<i class="fas fa-file"></i> ${size} KB`;
    if (filePreviewContainer) filePreviewContainer.style.display = 'block';
}

function clearFilePreview() {
    selectedFile = null;
    if (filePreviewContainer) filePreviewContainer.style.display = 'none';
    if (filePreviewName) filePreviewName.textContent = '';
    if (filePreviewSize) filePreviewSize.textContent = '';
    hideFileProgress();
}

function showFileProgress(percent) {
    if (fileProgress) {
        fileProgress.style.display = 'block';
        if (fileProgressBar) fileProgressBar.style.width = percent + '%';
        if (fileProgressText) fileProgressText.textContent = percent + '%';
    }
}

function hideFileProgress() {
    if (fileProgress) fileProgress.style.display = 'none';
    if (fileProgressBar) fileProgressBar.style.width = '0%';
}

function fileToBase64WithProgress(file, onProgress) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.onprogress = (e) => {
            if (e.lengthComputable && onProgress) onProgress(e.loaded / e.total);
        };
        reader.readAsDataURL(file);
    });
}

function optimizeImage(base64, maxWidth, maxHeight) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = base64;
        img.onload = () => {
            let width = img.width, height = img.height;
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

function getFileIcon(fileName) {
    const ext = fileName.split('.').pop().toLowerCase();
    const icons = {
        'pdf': 'fa-file-pdf',
        'doc': 'fa-file-word',
        'docx': 'fa-file-word',
        'xls': 'fa-file-excel',
        'xlsx': 'fa-file-excel',
        'ppt': 'fa-file-powerpoint',
        'pptx': 'fa-file-powerpoint',
        'jpg': 'fa-file-image',
        'jpeg': 'fa-file-image',
        'png': 'fa-file-image',
        'gif': 'fa-file-image',
        'mp3': 'fa-file-audio',
        'mp4': 'fa-file-video',
        'zip': 'fa-file-archive',
        'rar': 'fa-file-archive',
        'txt': 'fa-file-alt'
    };
    return icons[ext] || 'fa-file';
}

// ================================================
// ФУНКЦИИ ДЛЯ СТИКЕРОВ
// ================================================
function setupStickers() {
    if (stickerBtn) stickerBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        openStickersModal();
    };
    if (closeStickersModal) closeStickersModal.onclick = () => closeStickersModalFunc();
    if (stickersModal) stickersModal.onclick = (e) => {
        if (e.target === stickersModal) closeStickersModalFunc();
    };
    if (backToPacksBtn) backToPacksBtn.onclick = () => showStickerPacks();
    loadStickerPacks();
}

function openStickersModal() {
    if (stickersModal) {
        stickersModal.classList.add('active');
        showStickerPacks();
    }
}

function closeStickersModalFunc() {
    if (stickersModal) {
        stickersModal.classList.remove('active');
        showStickerPacks();
        currentStickerPack = null;
    }
}

function loadStickerPacks() {
    if (!stickersPacks) return;
    stickersPacks.innerHTML = '';
    const packs = Object.values(stickerPacks);
    
    if (packs.length === 0) {
        stickersPacks.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #94a3b8;"><i class="fas fa-smile-wink" style="font-size: 48px; margin-bottom: 15px; display: block;"></i><p>Паки стикеров пока не добавлены</p></div>`;
        return;
    }
    
    packs.forEach(pack => {
        const packDiv = document.createElement('div');
        packDiv.className = 'sticker-pack-item';
        packDiv.setAttribute('data-pack-id', pack.id);
        
        const previewHtml = pack.previewImage ?
            `<img src="${pack.previewImage}" alt="${pack.name}" onerror="this.src='https://placehold.co/80x80/8b5cf6/white?text=${encodeURIComponent(pack.name.charAt(0))}'">` :
            `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#8b5cf6,#7c3aed);color:white;font-size:32px;">${pack.name.charAt(0)}</div>`;
        
        packDiv.innerHTML = `
            <div class="sticker-pack-preview">${previewHtml}</div>
            <div class="sticker-pack-name">${escapeHtml(pack.name)}</div>
            <div class="sticker-pack-count">${pack.stickers.length} стикеров</div>
        `;
        packDiv.onclick = () => openStickerPack(pack.id);
        stickersPacks.appendChild(packDiv);
    });
}

function openStickerPack(packId) {
    const pack = stickerPacks[packId];
    if (!pack) return;
    currentStickerPack = packId;
    if (stickersPacks) stickersPacks.style.display = 'none';
    if (stickersGridContainer) stickersGridContainer.style.display = 'block';
    if (currentPackName) currentPackName.textContent = pack.name;
    
    if (stickersGrid) {
        stickersGrid.innerHTML = '';
        pack.stickers.forEach((sticker) => {
            const stickerDiv = document.createElement('div');
            stickerDiv.className = 'sticker-item';
            stickerDiv.setAttribute('data-sticker', sticker.url);
            stickerDiv.title = sticker.name;
            
            const img = document.createElement('img');
            img.src = sticker.url;
            img.alt = sticker.name;
            img.onerror = () => img.src = 'https://placehold.co/100x100/8b5cf6/white?text=❓';
            stickerDiv.appendChild(img);
            
            stickerDiv.onclick = () => {
                sendSticker(sticker.url);
                closeStickersModalFunc();
            };
            stickersGrid.appendChild(stickerDiv);
        });
    }
}

function showStickerPacks() {
    if (stickersPacks) stickersPacks.style.display = 'grid';
    if (stickersGridContainer) stickersGridContainer.style.display = 'none';
    currentStickerPack = null;
    loadStickerPacks();
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
        localStorage.setItem('userStatus', 'online');
    } catch (error) {
        showError(getAuthErrorMessage(error));
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
        await result.user.updateProfile({ displayName: name });
        showSuccess();
        localStorage.setItem('userStatus', 'online');
    } catch (error) {
        showError(getAuthErrorMessage(error));
        setLoading(false);
    }
}

function showError(message) {
    if (authError) {
        authError.textContent = message;
        authError.classList.add('active');
    }
}

function hideError() {
    if (authError) authError.classList.remove('active');
}

function showSuccess() {
    if (authSuccess) authSuccess.classList.add('active');
}

function getAuthErrorMessage(error) {
    const messages = {
        'auth/email-already-in-use': 'Этот email уже зарегистрирован',
        'auth/invalid-email': 'Неверный формат email',
        'auth/operation-not-allowed': 'Регистрация отключена',
        'auth/weak-password': 'Пароль слишком слабый',
        'auth/user-disabled': 'Аккаунт заблокирован',
        'auth/user-not-found': 'Пользователь не найден',
        'auth/wrong-password': 'Неверный пароль'
    };
    return messages[error.code] || 'Ошибка авторизации: ' + error.message;
}

function setLoading(isLoading) {
    if (!authLoading) return;
    if (isLoading) {
        authLoading.classList.add('active');
        if (loginBtn) loginBtn.disabled = true;
        if (registerBtn) registerBtn.disabled = true;
    } else {
        authLoading.classList.remove('active');
        if (loginBtn) loginBtn.disabled = false;
        if (registerBtn) registerBtn.disabled = false;
    }
}

// ================================================
// ЗАГРУЗКА ДАННЫХ
// ================================================
async function loadUserData(userId) {
    try {
        setLoading(true);
        cleanupListeners();
        
        const userRef = database.ref(`users/${userId}`);
        const snapshot = await userRef.once('value');
        
        if (snapshot.exists()) {
            // Пользователь существует - загружаем данные
            currentUser = { uid: userId, ...snapshot.val() };
            
            // Восстанавливаем статус из localStorage
            let savedStatus = localStorage.getItem('userStatus');
            if (!savedStatus) {
                savedStatus = 'online';
                localStorage.setItem('userStatus', savedStatus);
            }
            
            // Обновляем статус в Firebase, если он изменился
            if (savedStatus !== currentUser.status) {
                await userRef.update({ 
                    status: savedStatus, 
                    lastActive: Date.now() 
                });
                currentUser.status = savedStatus;
                currentUser.selectedStatus = savedStatus;
            } else {
                await userRef.update({ lastActive: Date.now() });
                currentUser.selectedStatus = currentUser.status;
            }
            
            // Загружаем всех пользователей
            await loadAllUsers();
            
            // Загружаем верифицированные каналы
            await loadVerifiedChannels();
            
            // Настраиваем слушатель верифицированных пользователей
            setupVerifiedUsersListener();
            
            // Загружаем контакты
            const contactsSnapshot = await database.ref(`users/${userId}/contacts`).once('value');
            updateContactsList(contactsSnapshot);
            
            // Загружаем чаты
            const chatsSnapshot = await database.ref('chats').orderByChild(`members/${userId}`).equalTo(true).once('value');
            updateChatsList(chatsSnapshot);
            
            // Настраиваем слушатели
            setupContactsListener();
            setupChatsListener();
            
            // Загружаем аватар, если есть
            if (currentUser.avatar) {
                updateAllAvatars();
            }
            
            console.log('Данные пользователя загружены:', currentUser.displayName);
            
        } else {
            // Новый пользователь - создаем запись
            const user = auth.currentUser;
            const defaultStatus = 'online';
            localStorage.setItem('userStatus', defaultStatus);
            
            // Генерируем уникальный ID
            const customId = "user_" + Math.random().toString(36).substr(2, 9).toUpperCase();
            const joinDate = new Date().toLocaleDateString('ru-RU');
            
            currentUser = {
                uid: userId,
                displayName: user.displayName || "Пользователь",
                email: user.email,
                status: defaultStatus,
                selectedStatus: defaultStatus,
                customId: customId,
                joinDate: joinDate,
                lastActive: Date.now(),
                createdAt: Date.now()
            };
            
            // Сохраняем в Firebase
            await userRef.set(currentUser);
            
            // Загружаем всех пользователей
            await loadAllUsers();
            
            // Загружаем верифицированные каналы
            await loadVerifiedChannels();
            
            // Настраиваем слушатель верифицированных пользователей
            setupVerifiedUsersListener();
            
            // Настраиваем слушатели контактов и чатов
            setupContactsListener();
            setupChatsListener();
            
            console.log('Новый пользователь создан:', currentUser.displayName);
        }
        
        // Инициализируем интерфейс
        initializeInterface();
        
        // Настраиваем загрузку аватара
        setupAvatarUpload();
        
        setLoading(false);
        
    } catch (error) {
        console.error("Ошибка загрузки данных:", error);
        showNotification('Ошибка при загрузке данных');
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
                    lastActive: usersData[userId].lastActive || 0,
                    avatar: usersData[userId].avatar || null  // Убедитесь, что аватар загружается
                };
            }
        }
        
        console.log(`Загружено пользователей: ${Object.keys(allUsers).length}, с аватарами: ${Object.values(allUsers).filter(u => u.avatar).length}`);
        
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
        updateChatsDisplay();
        
        console.log(`Загружено верифицированных пользователей: ${Object.keys(verifiedUsers).length}`);
    });
}

function updateAdminButtonVisibility() {
    if (!adminPanelBtn) return;
    
    const isAdmin = currentUser && verifiedUsers && 
                    verifiedUsers[currentUser.uid] && 
                    verifiedUsers[currentUser.uid].type === 'admin';
    
    adminPanelBtn.style.display = isAdmin ? 'flex' : 'none';
    
    if (isAdmin && adminPanelBtn) {
        adminPanelBtn.onclick = () => openAdminPanel();
    }
}

function cleanupListeners() {
    // Отключаем слушатель контактов
    if (contactsListener && currentUser) {
        database.ref(`users/${currentUser.uid}/contacts`).off('value', contactsListener);
        contactsListener = null;
    }
    
    // Отключаем слушатель чатов
    if (chatsListener) {
        database.ref('chats').off('value', chatsListener);
        chatsListener = null;
    }
    
    // Отключаем слушатели сообщений
    for (const chatId in messageListeners) {
        if (messageListeners[chatId]) {
            if (messageListeners[chatId].added) {
                database.ref(`messages/${chatId}`).off('child_added', messageListeners[chatId].added);
            }
            if (messageListeners[chatId].removed) {
                database.ref(`messages/${chatId}`).off('child_removed', messageListeners[chatId].removed);
            }
        }
    }
    messageListeners = {};
    
    // Очищаем активные слушатели сообщений
    if (activeMessageListeners) {
        for (const chatId in activeMessageListeners) {
            if (activeMessageListeners[chatId]) {
                if (activeMessageListeners[chatId].added) {
                    database.ref(`messages/${chatId}`).off('child_added', activeMessageListeners[chatId].added);
                }
                if (activeMessageListeners[chatId].removed) {
                    database.ref(`messages/${chatId}`).off('child_removed', activeMessageListeners[chatId].removed);
                }
            }
        }
        activeMessageListeners = {};
    }
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
    
    chatsListener = chatsRef.orderByChild(`members/${currentUser.uid}`).equalTo(true).on('value', (snapshot) => {
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
    
    contacts = Object.keys(contactsData).map(userId => {
        const contactData = contactsData[userId];
        const user = allUsers[userId];
        
        return {
            userId: userId,
            displayName: user ? user.displayName : (contactData.displayName || "Неизвестный"),
            customId: user ? user.customId : (contactData.customId || `user_${userId.substr(0, 8)}`),
            status: user ? user.status : (contactData.status || 'offline'),
            lastActive: user ? user.lastActive : (contactData.lastActive || 0),
            addedAt: contactData.addedAt || Date.now(),
            avatar: user ? user.avatar : null  // Добавляем аватар
        };
    });
    
    console.log(`Загружено контактов: ${contacts.length}`);
}

function updateContactsList(snapshot) {
    const contactsData = snapshot.val();
    if (!contactsData || typeof contactsData !== 'object') {
        contacts = [];
        return;
    }
    
    contacts = Object.keys(contactsData).map(userId => {
        const contactData = contactsData[userId];
        const user = allUsers[userId];
        return {
            userId: userId,
            displayName: user ? user.displayName : (contactData.displayName || "Неизвестный"),
            customId: user ? user.customId : (contactData.customId || `user_${userId.substr(0, 8)}`),
            status: user ? user.status : (contactData.status || 'offline'),
            lastActive: user ? user.lastActive : (contactData.lastActive || 0),
            addedAt: contactData.addedAt || Date.now()
        };
    });
}

function updateChatsList(snapshot) {
    const chatsData = snapshot.val();
    chats = [];
    
    if (chatsData) {
        Object.keys(chatsData).forEach(chatId => {
            const chat = chatsData[chatId];
            chat.id = chatId;
            chats.push(chat);
        });
        
        chats.sort((a, b) => (b.lastMessage?.timestamp || b.createdAt) - (a.lastMessage?.timestamp || a.createdAt));
    }
    
    console.log(`Загружено чатов: ${chats.length}`);
}

function updateChatsDisplay() {
    updateHomeChats();
    updateDesktopChats();
    updateMobileChats();
    if (profileChatsCount) profileChatsCount.textContent = chats.length;
}

function updateContactsDisplay() {
    updateDesktopContacts();
    updateMobileContacts();
    if (profileContactsCount) profileContactsCount.textContent = contacts.length;
    updateMobileProfile();
}

// ================================================
// ПОИСК ПОЛЬЗОВАТЕЛЕЙ
// ================================================
function searchUsers(query, currentContacts = []) {
    if (!query || query.trim() === '') return [];
    query = query.toLowerCase().trim();
    const results = [];
    
    for (const userId in allUsers) {
        if (userId === currentUser?.uid) continue;
        const user = allUsers[userId];
        if (!user) continue;
        
        const displayName = (user.displayName || '').toLowerCase();
        const customId = (user.customId || '').toLowerCase();
        
        if (displayName.includes(query) || customId.includes(query) || userId.toLowerCase().includes(query)) {
            results.push({
                userId: userId,
                displayName: user.displayName || "Пользователь",
                customId: user.customId || `user_${userId.substr(0, 8)}`,
                status: user.status || 'offline',
                lastActive: user.lastActive || 0,
                isContact: currentContacts.some(c => c.userId === userId)
            });
        }
    }
    
    results.sort((a, b) => {
        if (a.status === 'online' && b.status !== 'online') return -1;
        if (a.status !== 'online' && b.status === 'online') return 1;
        return (a.displayName || '').localeCompare(b.displayName || '');
    });
    return results;
}

function displaySearchResults(results, containerId, currentContacts = []) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    
    if (!results.length) {
        container.innerHTML = `<div class="no-search-results"><i class="fas fa-user-friends"></i><p>Пользователи не найдены</p></div>`;
        container.classList.add('active');
        return;
    }
    
    results.forEach(result => {
        const div = document.createElement('div');
        div.className = 'search-result-item';
        div.dataset.userId = result.userId;
        
        let statusText = result.status || 'offline';
        let statusClass = '';
        switch (statusText) {
            case 'online': statusClass = 'online'; statusText = 'online'; break;
            case 'away': statusClass = 'away'; statusText = 'away'; break;
            case 'dnd': statusClass = 'dnd'; statusText = 'dnd'; break;
            default: statusClass = 'offline'; statusText = 'offline';
        }
        
        div.innerHTML = `
            <div class="search-result-avatar">${escapeHtml((result.displayName || 'U').charAt(0))}</div>
            <div class="search-result-info">
                <div class="search-result-name">${escapeHtml(result.displayName || 'Пользователь')} ${getVerifiedBadge(result.userId)}</div>
                <div class="search-result-id">${escapeHtml(result.customId || '')}</div>
                <div class="search-result-status ${statusClass}">${statusText}</div>
            </div>
            <button class="add-user-btn" ${result.isContact ? 'disabled' : ''}>${result.isContact ? 'В контактах ✓' : 'Добавить'}</button>
        `;
        
        const btn = div.querySelector('.add-user-btn');
        if (!result.isContact) {
            btn.onclick = async (e) => {
                e.stopPropagation();
                await addContact(result.customId);
                const searchValue = contactSearch ? contactSearch.value : '';
                if (searchValue) {
                    const newResults = searchUsers(searchValue, contacts);
                    displaySearchResults(newResults, containerId, contacts);
                }
            };
        }
        
        div.onclick = () => {
            if (result.isContact) {
                openOrCreatePrivateChat(result.userId);
                const modal = document.getElementById('addContactModal');
                if (modal) modal.classList.remove('active');
            }
        };
        container.appendChild(div);
    });
    container.classList.add('active');
}

// ================================================
// КОНТАКТЫ И ЧАТЫ
// ================================================
async function addContact(targetCustomId) {
    try {
        let targetId = null, targetUser = null;
        for (const id in allUsers) {
            if (allUsers[id].customId === targetCustomId) {
                targetUser = allUsers[id];
                targetId = id;
                break;
            }
        }
        if (!targetUser || targetId === currentUser.uid || contacts.some(c => c.userId === targetId)) return;
        
        await database.ref(`users/${currentUser.uid}/contacts/${targetId}`).set({
            displayName: targetUser.displayName,
            customId: targetUser.customId,
            status: targetUser.status,
            lastActive: targetUser.lastActive || Date.now(),
            addedAt: Date.now()
        });
    } catch (error) {
        console.error(error);
    }
}

async function openOrCreatePrivateChat(targetUserId) {
    try {
        const existing = await findExistingPrivateChat(targetUserId);
        if (existing) {
            openChat(existing);
            return;
        }
        const target = allUsers[targetUserId];
        if (!target) return;
        
        const newChat = {
            name: `${currentUser.displayName} и ${target.displayName}`,
            type: 'private',
            createdBy: currentUser.uid,
            createdAt: Date.now(),
            members: { [currentUser.uid]: true, [targetUserId]: true },
            lastMessage: { text: "Чат создан", timestamp: Date.now(), senderId: currentUser.uid }
        };
        const ref = await database.ref('chats').push(newChat);
        openChat(ref.key);
    } catch (error) {
        console.error(error);
    }
}

async function findExistingPrivateChat(targetUserId) {
    const snap = await database.ref('chats').orderByChild('type').equalTo('private').once('value');
    const data = snap.val();
    if (data) {
        for (const id in data) {
            if (data[id].members?.[currentUser.uid] && data[id].members?.[targetUserId]) return id;
        }
    }
    return null;
}

async function createNewChat() {
    const name = chatNameInput?.value.trim();
    const desc = chatDescriptionInput?.value.trim();
    
    if (selectedChatType === 'channel') {
        await createChannel(false);
        return;
    }
    
    if (selectedChatType !== 'private' && !name) return;
    
    try {
        let newChat;
        if (selectedChatType === 'private') {
            const customId = privateUserId?.value.trim();
            if (!customId) return;
            let target = null, targetId = null;
            for (const id in allUsers) {
                if (allUsers[id].customId === customId) {
                    target = allUsers[id];
                    targetId = id;
                    break;
                }
            }
            if (!target || targetId === currentUser.uid) return;
            
            const existing = await findExistingPrivateChat(targetId);
            if (existing) {
                if (createChatModal) createChatModal.classList.remove('active');
                resetCreateForm();
                openChat(existing);
                return;
            }
            newChat = {
                name: `${currentUser.displayName} и ${target.displayName}`,
                type: 'private',
                createdBy: currentUser.uid,
                createdAt: Date.now(),
                members: { [currentUser.uid]: true, [targetId]: true },
                lastMessage: { text: "Чат создан", timestamp: Date.now(), senderId: currentUser.uid }
            };
        } else {
            newChat = {
                name: name,
                description: desc || '',
                type: selectedChatType,
                createdBy: currentUser.uid,
                createdAt: Date.now(),
                members: { [currentUser.uid]: true },
                lastMessage: { text: "Группа создана", timestamp: Date.now(), senderId: currentUser.uid }
            };
            
            const ref = await database.ref('chats').push(newChat);
            setTimeout(async () => {
                await database.ref(`messages/${ref.key}`).push({
                    text: `🎉 ${currentUser.displayName} создал(а) группу "${name}"`,
                    senderId: 'system',
                    senderName: 'Система',
                    timestamp: Date.now(),
                    type: 'system'
                });
            }, 500);
            if (createChatModal) createChatModal.classList.remove('active');
            resetCreateForm();
            openChat(ref.key);
            return;
        }
        const ref = await database.ref('chats').push(newChat);
        if (createChatModal) createChatModal.classList.remove('active');
        resetCreateForm();
        openChat(ref.key);
    } catch (error) {
        console.error(error);
    }
}

function resetCreateForm() {
    if (chatNameInput) chatNameInput.value = '';
    if (chatDescriptionInput) chatDescriptionInput.value = '';
    if (privateUserId) privateUserId.value = '';
    if (privateUserSearchResults) privateUserSearchResults.innerHTML = '';
    selectedChatType = 'group';
    chatTypeOptions.forEach(opt => {
        opt.classList.remove('active');
        if (opt.dataset.type === 'group') opt.classList.add('active');
    });
    if (chatDescriptionGroup) chatDescriptionGroup.style.display = 'block';
    if (privateChatUser) privateChatUser.style.display = 'none';
    if (chatNameInput) {
        chatNameInput.disabled = false;
        chatNameInput.placeholder = "Введите название";
    }
}

// ================================================
// ОБНОВЛЕНИЕ ИНТЕРФЕЙСА
// ================================================
function updateHomeChats() {
    if (!homeChatsList) return;
    homeChatsList.innerHTML = '';
    if (!chats.length) {
        homeChatsList.innerHTML = '<div class="empty-state"><i class="fas fa-comments"></i><h3>Чатов пока нет</h3><p>Создайте первый чат</p><button class="action-btn" id="createFirstChatBtn"><i class="fas fa-plus-circle"></i> Создать чат</button></div>';
        const btn = document.getElementById('createFirstChatBtn');
        if (btn) btn.onclick = () => {
            if (createChatModal) createChatModal.classList.add('active');
        };
        return;
    }
    chats.forEach(chat => homeChatsList.appendChild(createChatElement(chat)));
}

function createChatElement(chat) {
    const div = document.createElement('div');
    div.className = 'chat-item';
    div.dataset.chatId = chat.id;
    let avatar, name, avatarStyle = '';
    let verifiedBadge = '';
    
    if (chat.type === 'group') {
        avatar = '<i class="fas fa-users"></i>';
        name = chat.name;
    } else if (chat.type === 'channel') {
        avatar = '<i class="fas fa-bullhorn"></i>';
        name = chat.name;
        verifiedBadge = getChannelVerifiedBadge(chat.id);
    } else {
        const otherId = Object.keys(chat.members).find(id => id !== currentUser?.uid);
        const other = allUsers[otherId];
        name = other ? other.displayName : "Неизвестный";
        
        // Показываем аватар другого пользователя
        if (other && other.avatar) {
            avatar = `<img src="${other.avatar}" alt="Avatar" style="width: 100%; height: 100%; border-radius: inherit; object-fit: cover;">`;
            avatarStyle = 'style="padding: 0; overflow: hidden;"';
        } else {
            avatar = other ? other.displayName.charAt(0) : '?';
        }
        verifiedBadge = getVerifiedBadge(otherId);
    }
    
    let lastMsg = "Нет сообщений", lastTime = "";
    if (chat.lastMessage) {
        lastMsg = chat.lastMessage.type === 'photo' ? '📸 Фото' : 
                  (chat.lastMessage.type === 'file' ? '📎 Файл' : 
                  (chat.lastMessage.type === 'sticker' ? '🖼️ Стикер' : 
                  (chat.lastMessage.text || "Сообщение")));
        if (lastMsg.length > 30) lastMsg = lastMsg.substring(0, 30) + '...';
        if (chat.lastMessage.timestamp) lastTime = new Date(chat.lastMessage.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    }
    
    div.innerHTML = `
        <div class="chat-avatar ${chat.type === 'channel' ? 'channel-avatar' : ''}" ${avatarStyle}>${avatar}</div>
        <div class="chat-info">
            <div class="chat-name">${escapeHtml(name)} ${verifiedBadge}</div>
            <div class="last-message">${escapeHtml(lastMsg)}</div>
        </div>
        <div class="chat-meta">
            <div class="chat-time">${lastTime}</div>
        </div>
    `;
    div.onclick = () => openChat(chat.id);
    return div;
}

function updateDesktopChats() {
    if (!desktopChatsList) return;
    desktopChatsList.innerHTML = '';
    if (!chats.length) {
        desktopChatsList.innerHTML = '<div class="empty-state"><i class="fas fa-comments"></i><h3>Чатов нет</h3><p>Создайте первый чат</p></div>';
        return;
    }
    chats.forEach(chat => desktopChatsList.appendChild(createDesktopChatElement(chat)));
}

function createDesktopChatElement(chat) {
    const div = document.createElement('div');
    div.className = 'desktop-chat-item';
    div.dataset.chatId = chat.id;
    if (currentChatId === chat.id) div.classList.add('active');
    let avatar, name, statusColor = '#64748b';
    let verifiedBadge = '';
    let avatarStyle = '';
    
    if (chat.type === 'group') {
        avatar = '<i class="fas fa-users"></i>';
        name = chat.name;
        statusColor = '#10b981';
    } else if (chat.type === 'channel') {
        avatar = '<i class="fas fa-bullhorn"></i>';
        name = chat.name;
        statusColor = '#8b5cf6';
        verifiedBadge = getChannelVerifiedBadge(chat.id);
    } else {
        const otherId = Object.keys(chat.members).find(id => id !== currentUser?.uid);
        const other = allUsers[otherId];
        name = other ? other.displayName : "Неизвестный";
        
        // Показываем аватар другого пользователя
        if (other && other.avatar) {
            avatar = `<img src="${other.avatar}" alt="Avatar" style="width: 100%; height: 100%; border-radius: inherit; object-fit: cover;">`;
            avatarStyle = 'style="padding: 0; overflow: hidden;"';
        } else {
            avatar = other ? other.displayName.charAt(0) : '?';
        }
        
        if (other) {
            switch(other.status) {
                case 'online': statusColor = '#10b981'; break;
                case 'away': statusColor = '#f59e0b'; break;
                case 'dnd': statusColor = '#ef4444'; break;
                default: statusColor = '#64748b';
            }
        }
        verifiedBadge = getVerifiedBadge(otherId);
    }
    
    let lastMsg = "Нет сообщений", lastTime = "";
    if (chat.lastMessage) {
        lastMsg = chat.lastMessage.type === 'photo' ? '📸 Фото' : 
                  (chat.lastMessage.type === 'file' ? '📎 Файл' : 
                  (chat.lastMessage.type === 'sticker' ? '🖼️ Стикер' : 
                  (chat.lastMessage.text || "Сообщение")));
        if (lastMsg.length > 30) lastMsg = lastMsg.substring(0, 30) + '...';
        if (chat.lastMessage.timestamp) lastTime = new Date(chat.lastMessage.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    }
    
    let gradient = '';
    if (chat.type === 'group') gradient = 'linear-gradient(135deg, #10b981, #059669)';
    else if (chat.type === 'channel') gradient = 'linear-gradient(135deg, #8b5cf6, #7c3aed)';
    else gradient = 'linear-gradient(135deg, #3b82f6, #1d4ed8)';
    
    div.innerHTML = `
        <div class="desktop-chat-avatar" style="background: ${gradient}; ${avatarStyle}">${avatar}</div>
        <div class="desktop-chat-info">
            <div class="desktop-chat-name">${escapeHtml(name)} ${verifiedBadge}</div>
            <div class="desktop-chat-last-message" style="color: ${statusColor}">${lastTime ? lastTime + ' • ' + lastMsg : lastMsg}</div>
        </div>
    `;
    div.onclick = () => openChat(chat.id);
    return div;
}

function updateDesktopContacts() {
    if (!desktopContactsList) return;
    desktopContactsList.innerHTML = '';
    if (!contacts.length) {
        desktopContactsList.innerHTML = '<div class="empty-state"><i class="fas fa-user-friends"></i><h3>Контактов нет</h3></div>';
        return;
    }
    [...contacts].sort((a, b) => {
        if (a.status === 'online' && b.status !== 'online') return -1;
        if (a.status === 'away' && b.status !== 'away') return -1;
        if (a.status === 'dnd' && b.status !== 'dnd') return -1;
        return a.displayName.localeCompare(b.displayName);
    }).forEach(c => desktopContactsList.appendChild(createDesktopContactElement(c)));
}

function createDesktopContactElement(contact) {
    const div = document.createElement('div');
    div.className = 'desktop-chat-item';
    div.dataset.userId = contact.userId;
    
    let statusColor = '#94a3b8';
    let statusText = contact.status || 'offline';
    switch(statusText) {
        case 'online': statusColor = '#10b981'; statusText = 'online'; break;
        case 'away': statusColor = '#f59e0b'; statusText = 'away'; break;
        case 'dnd': statusColor = '#ef4444'; statusText = 'не беспокоить'; break;
        default: statusColor = '#94a3b8'; statusText = 'offline';
    }
    
    // Отображаем аватар контакта
    let avatarHtml = '';
    if (contact.avatar) {
        avatarHtml = `<img src="${contact.avatar}" alt="Avatar" style="width: 100%; height: 100%; border-radius: inherit; object-fit: cover;">`;
    } else {
        avatarHtml = escapeHtml(contact.displayName.charAt(0));
    }
    
    div.innerHTML = `
        <div class="desktop-chat-avatar" style="background: linear-gradient(135deg, #f093fb, #f5576c); padding: 0; overflow: hidden; display: flex; align-items: center; justify-content: center;">
            ${avatarHtml}
        </div>
        <div class="desktop-chat-info">
            <div class="desktop-chat-name">${escapeHtml(contact.displayName)} ${getVerifiedBadge(contact.userId)}</div>
            <div class="desktop-chat-last-message" style="color: ${statusColor}">${statusText} • ${contact.customId}</div>
        </div>
    `;
    div.onclick = () => openOrCreatePrivateChat(contact.userId);
    return div;
}

function updateMobileChats() {
    if (!mobileChatsList) return;
    mobileChatsList.innerHTML = '';
    if (!chats.length) {
        mobileChatsList.innerHTML = '<div class="mobile-empty-state"><i class="fas fa-comments"></i><h3>Чатов пока нет</h3><p>Нажмите на кнопку +</p></div>';
        if (chatsCount) chatsCount.textContent = '0';
        return;
    }
    chats.forEach(chat => mobileChatsList.appendChild(createMobileChatElement(chat)));
    if (chatsCount) chatsCount.textContent = chats.length;
}

function createMobileChatElement(chat) {
    const div = document.createElement('div');
    div.className = 'mobile-chat-item';
    div.dataset.chatId = chat.id;
    let avatar, name;
    let verifiedBadge = '';
    let avatarStyle = '';
    
    if (chat.type === 'group') {
        avatar = '<i class="fas fa-users"></i>';
        name = chat.name;
    } else if (chat.type === 'channel') {
        avatar = '<i class="fas fa-bullhorn"></i>';
        name = chat.name;
        verifiedBadge = getChannelVerifiedBadge(chat.id);
    } else {
        const otherId = Object.keys(chat.members).find(id => id !== currentUser?.uid);
        const other = allUsers[otherId];
        name = other ? other.displayName : "Неизвестный";
        
        // Показываем аватар другого пользователя
        if (other && other.avatar) {
            avatar = `<img src="${other.avatar}" alt="Avatar" style="width: 100%; height: 100%; border-radius: inherit; object-fit: cover;">`;
            avatarStyle = 'style="padding: 0; overflow: hidden;"';
        } else {
            avatar = other ? other.displayName.charAt(0) : '?';
        }
        verifiedBadge = getVerifiedBadge(otherId);
    }
    
    let lastMsg = "Нет сообщений", lastTime = "";
    if (chat.lastMessage) {
        lastMsg = chat.lastMessage.type === 'photo' ? '📸 Фото' : 
                  (chat.lastMessage.type === 'file' ? '📎 Файл' : 
                  (chat.lastMessage.type === 'sticker' ? '🖼️ Стикер' : 
                  (chat.lastMessage.text || "Сообщение")));
        if (lastMsg.length > 30) lastMsg = lastMsg.substring(0, 30) + '...';
        if (chat.lastMessage.timestamp) lastTime = new Date(chat.lastMessage.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    }
    
    let avatarClass = '';
    if (chat.type === 'group') avatarClass = 'group';
    else if (chat.type === 'channel') avatarClass = 'channel';
    else avatarClass = 'private';
    
    div.innerHTML = `
        <div class="mobile-chat-avatar ${avatarClass}" ${avatarStyle}>${avatar}</div>
        <div class="mobile-chat-info">
            <div class="mobile-chat-name">${escapeHtml(name)} ${verifiedBadge}</div>
            <div class="mobile-chat-last-message">${escapeHtml(lastMsg)}</div>
        </div>
        <div class="mobile-chat-time">${lastTime}</div>
    `;
    div.onclick = () => openChat(chat.id);
    return div;
}

function updateMobileContacts() {
    if (!mobileContactsList) return;
    mobileContactsList.innerHTML = '';
    if (!contacts.length) {
        mobileContactsList.innerHTML = '<div class="mobile-empty-state"><i class="fas fa-user-friends"></i><h3>Контактов пока нет</h3><p>Добавьте контакты</p></div>';
        if (contactsCount) contactsCount.textContent = '0';
        return;
    }
    contacts.forEach(contact => mobileContactsList.appendChild(createMobileContactElement(contact)));
    if (contactsCount) contactsCount.textContent = contacts.length;
}

function createMobileContactElement(contact) {
    const div = document.createElement('div');
    div.className = 'mobile-contact-item';
    div.dataset.userId = contact.userId;
    
    let statusText = contact.status || 'offline';
    let statusClass = '';
    switch(statusText) {
        case 'online': statusClass = 'online'; statusText = 'online'; break;
        case 'away': statusClass = 'away'; statusText = 'away'; break;
        case 'dnd': statusClass = 'dnd'; statusText = 'не беспокоить'; break;
        default: statusClass = 'offline'; statusText = 'offline';
    }
    
    // Отображаем аватар контакта
    let avatarHtml = '';
    if (contact.avatar) {
        avatarHtml = `<img src="${contact.avatar}" alt="Avatar" style="width: 100%; height: 100%; border-radius: inherit; object-fit: cover;">`;
    } else {
        avatarHtml = escapeHtml(contact.displayName.charAt(0));
    }
    
    div.innerHTML = `
        <div class="mobile-contact-avatar" style="padding: 0; overflow: hidden; display: flex; align-items: center; justify-content: center;">
            ${avatarHtml}
        </div>
        <div class="mobile-contact-info">
            <div class="mobile-contact-name">${escapeHtml(contact.displayName)} ${getVerifiedBadge(contact.userId)}</div>
            <div class="mobile-contact-status-badge ${statusClass}">
                <i class="fas ${statusText === 'online' ? 'fa-circle' : (statusText === 'away' ? 'fa-clock' : 'fa-circle')}"></i> 
                ${statusText}
            </div>
        </div>
    `;
    div.onclick = () => openOrCreatePrivateChat(contact.userId);
    return div;
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
        let statusText = '', statusColor = '#10b981', statusIcon = 'fa-circle';
        switch (currentUser.status) {
            case 'online': statusText = 'online'; statusColor = '#10b981'; statusIcon = 'fa-circle'; break;
            case 'away': statusText = 'away'; statusColor = '#f59e0b'; statusIcon = 'fa-clock'; break;
            case 'dnd': statusText = 'не беспокоить'; statusColor = '#ef4444'; statusIcon = 'fa-minus-circle'; break;
            case 'invisible': statusText = 'невидимка'; statusColor = '#64748b'; statusIcon = 'fa-eye-slash'; break;
            default: statusText = 'offline'; statusColor = '#64748b'; statusIcon = 'fa-circle';
        }
        mobileProfileStatus.innerHTML = `<i class="fas ${statusIcon}"></i> ${statusText}`;
        mobileProfileStatus.style.color = statusColor;
    }
}

// ================================================
// ПРОФИЛЬ
// ================================================
function updateDesktopUserInfo() {
    if (!currentUser) return;
    if (desktopUserAvatar) {
        desktopUserAvatar.textContent = currentUser.displayName.charAt(0);
        desktopUserAvatar.classList.remove('status-online', 'status-away', 'status-dnd', 'status-offline');
        const statusClass = currentUser.status === 'online' ? 'status-online' :
            currentUser.status === 'away' ? 'status-away' :
                currentUser.status === 'dnd' ? 'status-dnd' : 'status-offline';
        desktopUserAvatar.classList.add(statusClass);
    }
    if (desktopUserName) desktopUserName.textContent = currentUser.displayName;
    if (desktopUserStatus) {
        let statusIcon = 'fa-circle', statusColor = '#10b981', statusText = 'online';
        switch (currentUser.status) {
            case 'online': statusIcon = 'fa-circle'; statusColor = '#10b981'; statusText = 'online'; break;
            case 'away': statusIcon = 'fa-clock'; statusColor = '#f59e0b'; statusText = 'away'; break;
            case 'dnd': statusIcon = 'fa-minus-circle'; statusColor = '#ef4444'; statusText = 'не беспокоить'; break;
            case 'invisible': statusIcon = 'fa-eye-slash'; statusColor = '#64748b'; statusText = 'невидимка'; break;
            default: statusIcon = 'fa-circle'; statusColor = '#64748b'; statusText = 'offline';
        }
        desktopUserStatus.innerHTML = `<i class="fas ${statusIcon}"></i><span>${statusText}</span>`;
        desktopUserStatus.style.color = statusColor;
    }
}

function updateUserProfileDisplay() {
    if (!currentUser) return;
    if (profileName) profileName.textContent = currentUser.displayName;
    if (profileUserId) profileUserId.textContent = currentUser.customId;
    const avatar = document.getElementById('profileAvatarLarge');
    if (avatar) avatar.textContent = currentUser.displayName.charAt(0);
    const ps = document.getElementById('profileStatus');
    if (ps) {
        const userStatus = currentUser.selectedStatus || currentUser.status;
        let statusText = 'online', statusClass = 'online';
        switch (userStatus) {
            case 'online': statusText = 'online'; statusClass = 'online'; break;
            case 'away': statusText = 'away'; statusClass = 'away'; break;
            case 'dnd': statusText = 'не беспокоить'; statusClass = 'dnd'; break;
            case 'invisible': statusText = 'невидимка'; statusClass = 'invisible'; break;
            default: statusText = 'offline'; statusClass = 'offline';
        }
        ps.textContent = statusText;
        ps.className = `profile-status ${statusClass}`;
    }
    const jd = document.getElementById('profileJoinDate');
    if (jd) jd.textContent = currentUser.joinDate;
    updateDesktopUserInfo();
}

function updateUserIDs() {
    if (!currentUser) return;
    if (homeUserId) homeUserId.textContent = currentUser.customId;
    if (mobileProfileId) mobileProfileId.textContent = currentUser.customId;
    if (profileUserId) profileUserId.textContent = currentUser.customId;
}

function updateChatHeader() {
    if (!currentChatId) return;
    const chat = chats.find(c => c.id === currentChatId);
    if (!chat) return;
    
    if (chat.type === 'private') {
        const otherId = Object.keys(chat.members).find(id => id !== currentUser?.uid);
        const other = allUsers[otherId];
        if (other && isMobile && chatHeaderName) {
            chatHeaderName.innerHTML = `<span class="chat-header-name-with-badge">${escapeHtml(other.displayName)} ${getVerifiedBadge(otherId)}</span>`;
        } else if (other && desktopChatHeaderName) {
            desktopChatHeaderName.innerHTML = `<span class="chat-header-name-with-badge">${escapeHtml(other.displayName)} ${getVerifiedBadge(otherId)}</span>`;
        }
    } else if (chat.type === 'channel') {
        const badge = getChannelVerifiedBadge(chat.id);
        if (isMobile && chatHeaderName) {
            chatHeaderName.innerHTML = `<span class="chat-header-name-with-badge">${escapeHtml(chat.name)} ${badge}</span>`;
        } else if (desktopChatHeaderName) {
            desktopChatHeaderName.innerHTML = `<span class="chat-header-name-with-badge">${escapeHtml(chat.name)} ${badge}</span>`;
        }
    }
}

function openProfileModal() {
    if (!profileModal || !currentUser) return;
    
    // Обновляем имя с бейджем
    if (profileName) {
        profileName.innerHTML = `${escapeHtml(currentUser.displayName)} ${getVerifiedBadge(currentUser.uid)}`;
    }
    
    // Обновляем ID
    if (profileUserId) profileUserId.textContent = currentUser.customId;
    
    // Обновляем аватар
    const avatar = document.getElementById('profileAvatarLarge');
    if (avatar) {
        if (currentUser.avatar) {
            avatar.innerHTML = `<img src="${currentUser.avatar}" alt="Avatar">`;
        } else {
            avatar.innerHTML = currentUser.displayName.charAt(0);
        }
    }
    
    // Обновляем статус
    const ps = document.getElementById('profileStatus');
    if (ps) {
        const userStatus = currentUser.selectedStatus || currentUser.status;
        let statusText = 'online';
        let statusClass = 'online';
        
        switch(userStatus) {
            case 'online': statusText = 'online'; statusClass = 'online'; break;
            case 'away': statusText = 'away'; statusClass = 'away'; break;
            case 'dnd': statusText = 'не беспокоить'; statusClass = 'dnd'; break;
            case 'invisible': statusText = 'невидимка'; statusClass = 'invisible'; break;
            default: statusText = 'offline'; statusClass = 'offline';
        }
        
        ps.textContent = statusText;
        ps.className = `profile-status ${statusClass}`;
    }
    
    // Обновляем дату регистрации
    const jd = document.getElementById('profileJoinDate');
    if (jd) jd.textContent = currentUser.joinDate;
    
    // Обновляем счетчики
    if (profileContactsCount) profileContactsCount.textContent = contacts.length;
    if (profileChatsCount) profileChatsCount.textContent = chats.length;
    
    // Показываем модальное окно
    profileModal.classList.add('active');
}

window.openUserProfileModal = function(userId) {
    if (!userId || !allUsers[userId]) return;
    
    const user = allUsers[userId];
    
    // Проверяем, есть ли у пользователя аватар
    const userAvatar = user.avatar || null;
    const avatarHtml = userAvatar 
        ? `<img src="${userAvatar}" alt="Avatar" style="width: 100%; height: 100%; border-radius: inherit; object-fit: cover;">` 
        : escapeHtml((user.displayName || 'U').charAt(0));
    
    let statusText = user.status || 'offline';
    let statusClass = 'offline';
    switch(statusText) {
        case 'online': statusText = 'online'; statusClass = 'online'; break;
        case 'away': statusText = 'away'; statusClass = 'away'; break;
        case 'dnd': statusText = 'не беспокоить'; statusClass = 'dnd'; break;
        default: statusText = 'offline'; statusClass = 'offline';
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h3>Профиль пользователя</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body" style="text-align: center;">
                <!-- Аватар пользователя -->
                <div class="profile-avatar-container" style="margin-bottom: 20px;">
                    <div class="profile-avatar-large" style="display: flex; align-items: center; justify-content: center; overflow: hidden;">
                        ${avatarHtml}
                    </div>
                </div>
                
                <!-- Информация о пользователе -->
                <div class="profile-info">
                    <div class="profile-name" style="display: flex; align-items: center; justify-content: center; gap: 8px; flex-wrap: wrap;">
                        ${escapeHtml(user.displayName)} ${getVerifiedBadge(userId)}
                    </div>
                    <div class="profile-status ${statusClass}" style="margin-top: 8px;">
                        ${statusText}
                    </div>
                </div>
                
                <!-- ID пользователя -->
                <div class="user-id-container" style="margin-top: 20px;">
                    <span class="user-id-label">ID:</span>
                    <div class="user-id-value">${user.customId || userId}</div>
                    <button class="copy-id-btn" onclick="navigator.clipboard.writeText('${user.customId || userId}')">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
                
                <!-- Кнопка написания сообщения -->
                <button class="edit-profile-btn" style="margin-top: 20px;" onclick="openOrCreatePrivateChat('${userId}'); document.querySelector('.modal-overlay.active')?.remove()">
                    <i class="fas fa-comment"></i> Написать сообщение
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Закрытие при клике на overlay
    modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
    };
};

async function saveProfileChanges() {
    try {
        const newName = editProfileName?.value.trim();
        const activeStatus = document.querySelector('.status-option.active');
        let newStatus = activeStatus ? activeStatus.dataset.status : 'online';
        
        if (!newName) return;
        
        localStorage.setItem('userSelectedStatus', newStatus);
        
        await database.ref(`users/${currentUser.uid}`).update({
            displayName: newName,
            status: newStatus,
            lastActive: Date.now()
        });
        
        currentUser.displayName = newName;
        currentUser.status = newStatus;
        currentUser.selectedStatus = newStatus;
        
        if (allUsers[currentUser.uid]) {
            allUsers[currentUser.uid].displayName = newName;
            allUsers[currentUser.uid].status = newStatus;
        }
        
        if (editProfileModal) editProfileModal.classList.remove('active');
        updateUserProfileDisplay();
        updateUserIDs();
        updateMobileProfile();
        updateDesktopUserInfo();
        updateContactsDisplay();
        updateChatsDisplay();
    } catch (error) {
        console.error(error);
    }
}

// ================================================
// ФУНКЦИИ ДЛЯ ГРУПП
// ================================================
function addGroupActionButtons() {
    let chatActions = document.querySelector('.chat-actions');
    if (!chatActions) {
        chatActions = document.querySelector('#chatHeaderMobile .chat-actions');
    }
    if (!chatActions) {
        const chatHeader = document.querySelector('.chat-header.desktop') || document.querySelector('.chat-header.mobile');
        if (chatHeader) {
            chatActions = document.createElement('div');
            chatActions.className = 'chat-actions';
            chatHeader.appendChild(chatActions);
        }
    }
    if (!chatActions) return;
    
    const oldBtns = document.querySelector('.group-actions');
    if (oldBtns) oldBtns.remove();
    
    const currentChat = chats.find(c => c.id === currentChatId);
    if (!currentChat || currentChat.type !== 'group') return;
    
    const isCreator = currentChat.createdBy === currentUser?.uid;
    
    const groupActions = document.createElement('div');
    groupActions.className = 'group-actions';
    groupActions.style.display = 'flex';
    groupActions.style.gap = '8px';
    groupActions.style.marginLeft = 'auto';
    
    groupActions.innerHTML = `
        <button class="group-action-btn" id="groupMembersBtn" title="Участники">
            <i class="fas fa-users"></i>
        </button>
        ${isCreator ? `
            <button class="group-action-btn" id="groupAddMembersBtn" title="Добавить участников">
                <i class="fas fa-user-plus"></i>
            </button>
            <button class="group-action-btn" id="groupInviteLinkBtn" title="Ссылка-приглашение">
                <i class="fas fa-link"></i>
            </button>
        ` : ''}
    `;
    chatActions.appendChild(groupActions);
    
    document.getElementById('groupMembersBtn')?.addEventListener('click', () => showGroupMembers(currentChatId));
    if (isCreator) {
        document.getElementById('groupAddMembersBtn')?.addEventListener('click', () => openAddMembersModal(currentChatId));
        document.getElementById('groupInviteLinkBtn')?.addEventListener('click', () => openInviteLinkModal(currentChatId));
    }
}

function addGroupMembersPreview() {
    let chatHeaderInfo = document.querySelector('.chat-header-info');
    if (!chatHeaderInfo) {
        chatHeaderInfo = document.querySelector('#chatHeaderMobile .chat-header-info');
    }
    if (!chatHeaderInfo) return;
    
    const oldPreview = document.getElementById('groupMembersPreview');
    if (oldPreview) oldPreview.remove();
    
    const currentChat = chats.find(c => c.id === currentChatId);
    if (!currentChat || currentChat.type !== 'group') return;
    
    const memberCount = Object.keys(currentChat.members || {}).length;
    
    const membersPreview = document.createElement('div');
    membersPreview.className = 'group-members-preview';
    membersPreview.id = 'groupMembersPreview';
    membersPreview.innerHTML = `
        <div class="members-count-indicator" onclick="showGroupMembers('${currentChatId}')">
            <i class="fas fa-users"></i>
            <span>${memberCount} ${getMemberWord(memberCount)}</span>
            <i class="fas fa-chevron-right"></i>
        </div>
    `;
    
    const nameElement = chatHeaderInfo.querySelector('h2');
    if (nameElement) {
        let titleRow = nameElement.parentNode;
        if (!titleRow.classList.contains('group-title-row')) {
            const wrapper = document.createElement('div');
            wrapper.className = 'group-title-row';
            nameElement.parentNode.insertBefore(wrapper, nameElement);
            wrapper.appendChild(nameElement);
            titleRow = wrapper;
        }
        titleRow.appendChild(membersPreview);
    }
}

function getMemberWord(count) {
    if (count % 10 === 1 && count % 100 !== 11) return "участник";
    if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) return "участника";
    return "участников";
}

function openAddMembersModal(chatId) {
    currentGroupChatId = chatId;
    selectedContactsForGroup.clear();
    loadContactsForSelection();
    if (addMembersModal) addMembersModal.classList.add('active');
}

function loadContactsForSelection() {
    if (!contactsSelectList) return;
    const currentChat = chats.find(c => c.id === currentGroupChatId);
    const existingMemberIds = currentChat ? Object.keys(currentChat.members || {}) : [];
    const availableContacts = contacts.filter(c => !existingMemberIds.includes(c.userId));
    
    if (availableContacts.length === 0) {
        contactsSelectList.innerHTML = '<div class="empty-state"><i class="fas fa-user-friends"></i><h3>Нет доступных контактов</h3></div>';
        return;
    }
    
    contactsSelectList.innerHTML = availableContacts.map(contact => `
        <div class="contact-select-item" data-user-id="${contact.userId}">
            <div class="contact-select-avatar">${escapeHtml(contact.displayName.charAt(0))}</div>
            <div class="contact-select-info">
                <div class="contact-select-name">${escapeHtml(contact.displayName)}</div>
                <div class="contact-select-id">${contact.customId}</div>
            </div>
            <div class="contact-select-checkbox"><i class="fas fa-check"></i></div>
        </div>
    `).join('');
    
    document.querySelectorAll('.contact-select-item').forEach(el => {
        el.onclick = () => {
            const userId = el.dataset.userId;
            if (selectedContactsForGroup.has(userId)) {
                selectedContactsForGroup.delete(userId);
                el.classList.remove('selected');
            } else {
                selectedContactsForGroup.add(userId);
                el.classList.add('selected');
            }
        };
    });
}

async function addMembersToGroup() {
    if (!currentGroupChatId || selectedContactsForGroup.size === 0) return;
    try {
        const updates = {};
        for (const userId of selectedContactsForGroup) updates[`members/${userId}`] = true;
        await database.ref(`chats/${currentGroupChatId}`).update(updates);
        
        const memberNames = Array.from(selectedContactsForGroup).map(id => allUsers[id]?.displayName || id).join(', ');
        await database.ref(`messages/${currentGroupChatId}`).push({
            text: `👋 ${currentUser.displayName} добавил(а) участников: ${memberNames}`,
            senderId: 'system',
            senderName: 'Система',
            timestamp: Date.now(),
            type: 'system'
        });
        
        if (addMembersModal) addMembersModal.classList.remove('active');
        selectedContactsForGroup.clear();
        updateChatsDisplay();
        if (currentChatId === currentGroupChatId) {
            addGroupMembersPreview();
            addGroupActionButtons();
        }
    } catch (error) {
        console.error(error);
    }
}

function showGroupMembers(chatId) {
    const chat = chats.find(c => c.id === chatId);
    if (!chat || chat.type !== 'group') return;
    const memberIds = Object.keys(chat.members || {});
    const isCreator = chat.createdBy === currentUser?.uid;
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h3><i class="fas fa-users"></i> Участники (${memberIds.length})</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                <div class="members-list">
                    ${memberIds.map(memberId => {
        const member = allUsers[memberId];
        if (!member) return '';
        const isCreator_ = chat.createdBy === memberId;
        return `
                            <div class="member-item">
                                <div class="member-avatar">${escapeHtml(member.displayName.charAt(0))}</div>
                                <div class="member-info">
                                    <div class="member-name">${escapeHtml(member.displayName)} ${getVerifiedBadge(memberId)}</div>
                                    <div class="member-status">${member.customId}</div>
                                </div>
                                ${isCreator && !isCreator_ && memberId !== currentUser?.uid ? `
                                    <button class="member-remove-btn" onclick="removeMemberFromGroup('${chatId}', '${memberId}')">
                                        <i class="fas fa-user-minus"></i>
                                    </button>
                                ` : ''}
                            </div>
                        `;
    }).join('')}
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

window.removeMemberFromGroup = async function (chatId, userId) {
    if (!confirm('Исключить участника?')) return;
    try {
        await database.ref(`chats/${chatId}/members/${userId}`).remove();
        await database.ref(`messages/${chatId}`).push({
            text: `🚫 ${currentUser.displayName} исключил(а) ${allUsers[userId]?.displayName || 'участника'}`,
            senderId: 'system',
            senderName: 'Система',
            timestamp: Date.now(),
            type: 'system'
        });
        document.querySelector('.modal-overlay.active')?.remove();
        updateChatsDisplay();
        if (currentChatId === chatId) {
            addGroupMembersPreview();
            addGroupActionButtons();
        }
    } catch (error) {
        console.error(error);
    }
};

async function openInviteLinkModal(chatId) {
    let link = groupInviteLinks[chatId];
    if (!link) {
        link = await generateInviteLink(chatId);
        groupInviteLinks[chatId] = link;
    }
    if (inviteLinkInput) inviteLinkInput.value = link;
    if (inviteLinkModal) inviteLinkModal.classList.add('active');
}

async function handleInviteLink() {
    const urlParams = new URLSearchParams(window.location.search);
    const inviteCode = urlParams.get('code');
    if (!inviteCode || !currentUser) return;
    
    try {
        const snapshot = await database.ref(`groupInvites/${inviteCode}`).once('value');
        const inviteData = snapshot.val();
        if (!inviteData || inviteData.expiresAt < Date.now()) {
            await database.ref(`groupInvites/${inviteCode}`).remove();
            return;
        }
        const chatId = inviteData.chatId;
        const chatRef = database.ref(`chats/${chatId}`);
        const chatSnapshot = await chatRef.once('value');
        const chat = chatSnapshot.val();
        if (!chat || chat.members?.[currentUser.uid]) {
            if (chat) openChat(chatId);
            return;
        }
        await chatRef.update({ [`members/${currentUser.uid}`]: true });
        await database.ref(`messages/${chatId}`).push({
            text: `✨ ${currentUser.displayName} присоединился(ась) по приглашению`,
            senderId: 'system',
            senderName: 'Система',
            timestamp: Date.now(),
            type: 'system'
        });
        await database.ref(`groupInvites/${inviteCode}`).remove();
        openChat(chatId);
        window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
        console.error(error);
    }
}

function initGroupModals() {
    if (closeAddMembersModal) closeAddMembersModal.onclick = () => addMembersModal?.classList.remove('active');
    if (cancelAddMembersBtn) cancelAddMembersBtn.onclick = () => addMembersModal?.classList.remove('active');
    if (confirmAddMembersBtn) confirmAddMembersBtn.onclick = addMembersToGroup;
    if (closeInviteLinkModal) closeInviteLinkModal.onclick = () => inviteLinkModal?.classList.remove('active');
    if (closeInviteModalBtn) closeInviteModalBtn.onclick = () => inviteLinkModal?.classList.remove('active');
    if (copyInviteLinkBtn) copyInviteLinkBtn.onclick = () => {
        if (inviteLinkInput?.value) navigator.clipboard.writeText(inviteLinkInput.value);
    };
}

// ================================================
// НАСТРОЙКИ КАНАЛА
// ================================================
async function openChannelSettings(chatId) {
    const chat = chats.find(c => c.id === chatId);
    if (!chat || chat.type !== 'channel') return;
    
    const canManage = canManageChannel(chatId, currentUser?.uid);
    const isCreator = chat.createdBy === currentUser?.uid;
    const isChannelVerified = verifiedChannels && verifiedChannels[chatId];
    const hasPendingRequest = await checkPendingVerificationRequest(chatId);
    
    // Получаем статистику для монетизации
    const eligibility = await checkMonetizationEligibility(chatId);
    const postCount = await countChannelPosts(chatId);
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.innerHTML = `
        <div class="modal" style="max-width: 600px;">
            <div class="modal-header">
                <h3><i class="fas fa-cog"></i> Настройки канала</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                <div class="channel-settings-tabs">
                    <button class="settings-tab active" data-tab="general">Основные</button>
                    <button class="settings-tab" data-tab="members">Подписчики</button>
                    <button class="settings-tab" data-tab="moderators">Модераторы</button>
                    <button class="settings-tab" data-tab="verification">Верификация</button>
                    <button class="settings-tab" data-tab="stats">Статистика</button>
                </div>
                
                <!-- Вкладка: Основные -->
                <div class="settings-tab-content active" id="generalTab">
                    <div class="form-group">
                        <label>Название канала</label>
                        <input type="text" id="channelEditName" value="${escapeHtml(chat.name)}" placeholder="Название канала" ${!canManage ? 'disabled' : ''}>
                    </div>
                    <div class="form-group">
                        <label>Описание канала</label>
                        <textarea id="channelEditDescription" rows="3" placeholder="Описание канала" ${!canManage ? 'disabled' : ''}>${escapeHtml(chat.description || '')}</textarea>
                    </div>
                    ${isCreator ? `
                        <div class="form-group">
                            <label>Ссылка-приглашение</label>
                            <div class="invite-link-box">
                                <input type="text" id="channelInviteLink" readonly value="${groupInviteLinks[chatId] || 'Загрузка...'}">
                                <button class="copy-invite-btn" id="copyChannelInviteBtn"><i class="fas fa-copy"></i></button>
                            </div>
                            <button class="btn btn-secondary" id="regenerateInviteBtn" style="margin-top: 8px; width: 100%;">Создать новую ссылку</button>
                        </div>
                    ` : ''}
                </div>
                
                <!-- Вкладка: Подписчики -->
                <div class="settings-tab-content" id="membersTab">
                    <div class="search-container" style="margin-bottom: 16px;">
                        <div class="search-input-wrapper">
                            <input type="text" id="channelMembersSearch" placeholder="Поиск подписчиков...">
                        </div>
                    </div>
                    <div class="channel-members-list" id="channelMembersList"></div>
                    ${canManage ? `
                        <button class="btn btn-primary" id="addSubscriberBtn" style="width: 100%; margin-top: 16px;">
                            <i class="fas fa-user-plus"></i> Добавить подписчика
                        </button>
                    ` : ''}
                </div>
                
                <!-- Вкладка: Модераторы -->
                <div class="settings-tab-content" id="moderatorsTab">
                    <div class="channel-moderators-info">
                        <p style="color: var(--text-tertiary); font-size: 13px; margin-bottom: 16px;">
                            <i class="fas fa-info-circle"></i> Модераторы могут отправлять сообщения и управлять подписчиками
                        </p>
                    </div>
                    <div class="channel-moderators-list" id="channelModeratorsList"></div>
                    ${isCreator ? `
                        <button class="btn btn-primary" id="addModeratorBtn" style="width: 100%; margin-top: 16px;">
                            <i class="fas fa-user-shield"></i> Назначить модератора
                        </button>
                    ` : ''}
                </div>
                
                <!-- Вкладка: Верификация и Монетизация -->
                <div class="settings-tab-content" id="verificationTab">
                    <div class="verification-section">
                        ${isChannelVerified ? `
                            <div class="verified-badge-large">
                                <i class="fas fa-check-circle"></i>
                                <h4>Канал верифицирован</h4>
                                <p>Ваш канал имеет официальную галочку</p>
                            </div>
                            
                            <!-- Блок монетизации -->
                            <div class="monetization-section">
                                <h3><i class="fas fa-coins"></i> Монетизация</h3>
                                <div class="monetization-stats">
                                    <div class="monetization-stat">
                                        <i class="fas fa-users"></i>
                                        <span id="monetizationSubscribers">${eligibility.subscribers}</span>
                                        <label>Подписчиков</label>
                                        <div class="progress-bar">
                                            <div class="progress-fill" id="subscribersProgress" style="width: ${Math.min(100, (eligibility.subscribers / 100) * 100)}%"></div>
                                        </div>
                                        <span class="requirement">Нужно: 100</span>
                                    </div>
                                    <div class="monetization-stat">
                                        <i class="fas fa-comment-dots"></i>
                                        <span id="monetizationPosts">${eligibility.posts}</span>
                                        <label>Постов</label>
                                        <div class="progress-bar">
                                            <div class="progress-fill" id="postsProgress" style="width: ${Math.min(100, (eligibility.posts / 30) * 100)}%"></div>
                                        </div>
                                        <span class="requirement">Нужно: 30</span>
                                    </div>
                                </div>
                                
                                ${chat.monetization && chat.monetization.enabled ? `
                                    <div class="monetization-active">
                                        <i class="fas fa-check-circle"></i>
                                        <h4>Монетизация включена!</h4>
                                        <p>Вы получаете доход от рекламы в канале</p>
                                        <div class="monetization-earnings">
                                            <span>Заработано: ${chat.monetization.earnings || 0} ₽</span>
                                            <button class="btn btn-primary" id="withdrawEarningsBtn">Вывести средства</button>
                                        </div>
                                    </div>
                                ` : `
                                    <div class="monetization-requirements">
                                        ${eligibility.eligible ? `
                                            <button class="btn btn-success" id="enableMonetizationBtn">
                                                <i class="fas fa-coins"></i> Включить монетизацию
                                            </button>
                                        ` : `
                                            <button class="btn btn-secondary" disabled>
                                                <i class="fas fa-lock"></i> Требования не выполнены
                                            </button>
                                        `}
                                    </div>
                                `}
                            </div>
                        ` : `
                            <div class="verification-info">
                                <i class="fas fa-info-circle"></i>
                                <p>Подайте заявку на верификацию канала. Верифицированные каналы получают специальную галочку и доступ к монетизации.</p>
                            </div>
                            ${hasPendingRequest ? `
                                <div class="pending-request">
                                    <i class="fas fa-clock"></i>
                                    <h4>Заявка на рассмотрении</h4>
                                    <p>Ваша заявка на верификацию была отправлена администратору. Ожидайте решения.</p>
                                </div>
                            ` : `
                                <button class="btn btn-primary" id="requestVerificationBtn">
                                    <i class="fas fa-certificate"></i> Подать заявку на верификацию
                                </button>
                            `}
                        `}
                    </div>
                </div>
                
                <!-- Вкладка: Статистика -->
                <div class="settings-tab-content" id="statsTab">
                    <div class="channel-stats-detailed">
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fas fa-users"></i></div>
                            <div class="stat-info">
                                <span class="stat-label">Всего подписчиков</span>
                                <span class="stat-value-large" id="statSubscribers">${Object.keys(chat.members || {}).length}</span>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fas fa-user-shield"></i></div>
                            <div class="stat-info">
                                <span class="stat-label">Модераторов</span>
                                <span class="stat-value-large" id="statModerators">${Object.keys(chat.moderators || {}).length}</span>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fas fa-calendar"></i></div>
                            <div class="stat-info">
                                <span class="stat-label">Дата создания</span>
                                <span class="stat-value-large" style="font-size: 14px;">${new Date(chat.createdAt).toLocaleDateString('ru-RU')}</span>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fas fa-comment-dots"></i></div>
                            <div class="stat-info">
                                <span class="stat-label">Всего постов</span>
                                <span class="stat-value-large" style="font-size: 14px;" id="totalPosts">${postCount}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                ${canManage ? '<button class="btn btn-primary" id="saveChannelSettingsBtn">Сохранить изменения</button>' : ''}
                ${isCreator ? '<button class="btn btn-danger" id="deleteChannelBtn">Удалить канал</button>' : ''}
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Загружаем списки
    await loadChannelMembersList(chatId);
    await loadChannelModeratorsList(chatId);
    
    // Ссылка-приглашение
    if (isCreator && groupInviteLinks[chatId]) {
        const inviteInput = document.getElementById('channelInviteLink');
        if (inviteInput) inviteInput.value = groupInviteLinks[chatId];
    } else if (isCreator) {
        const link = await generateInviteLink(chatId);
        groupInviteLinks[chatId] = link;
        const inviteInput = document.getElementById('channelInviteLink');
        if (inviteInput) inviteInput.value = link;
    }
    
    // Настройка вкладок
    const tabs = modal.querySelectorAll('.settings-tab');
    tabs.forEach(tab => {
        tab.onclick = () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const tabName = tab.dataset.tab;
            document.querySelectorAll('.settings-tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`${tabName}Tab`).classList.add('active');
        };
    });
    
    // Поиск подписчиков
    const searchInput = document.getElementById('channelMembersSearch');
    if (searchInput) {
        searchInput.oninput = () => filterChannelMembers(chatId, searchInput.value);
    }
    
    // Сохранение настроек
    const saveBtn = document.getElementById('saveChannelSettingsBtn');
    if (saveBtn) {
        saveBtn.onclick = async () => {
            const newName = document.getElementById('channelEditName')?.value.trim();
            const newDesc = document.getElementById('channelEditDescription')?.value.trim();
            if (!newName) return;
            try {
                await database.ref(`chats/${chatId}`).update({
                    name: newName,
                    description: newDesc || ''
                });
                modal.remove();
                updateChatsDisplay();
                if (currentChatId === chatId) updateChatHeader();
                showNotification('Настройки канала сохранены');
            } catch (error) {
                console.error(error);
                showNotification('Ошибка при сохранении');
            }
        };
    }
    
    // Добавление подписчика
    const addSubscriberBtn = document.getElementById('addSubscriberBtn');
    if (addSubscriberBtn) {
        addSubscriberBtn.onclick = () => openAddSubscriberModal(chatId);
    }
    
    // Добавление модератора
    const addModeratorBtn = document.getElementById('addModeratorBtn');
    if (addModeratorBtn) {
        addModeratorBtn.onclick = () => openAddModeratorModal(chatId);
    }
    
    // Заявка на верификацию
    const requestVerificationBtn = document.getElementById('requestVerificationBtn');
    if (requestVerificationBtn) {
        // Удаляем старые обработчики
        const newBtn = requestVerificationBtn.cloneNode(true);
        requestVerificationBtn.parentNode.replaceChild(newBtn, requestVerificationBtn);

        newBtn.onclick = async (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Кнопка заявки нажата');
            await requestChannelVerification(chatId);
        };
    }
    
    // Включение монетизации
    const enableMonetizationBtn = document.getElementById('enableMonetizationBtn');
    if (enableMonetizationBtn) {
        enableMonetizationBtn.onclick = async () => {
            await enableMonetization(chatId);
            modal.remove();
            showNotification('Монетизация включена!');
        };
    }
    
    // Вывод средств
    const withdrawEarningsBtn = document.getElementById('withdrawEarningsBtn');
    if (withdrawEarningsBtn) {
        withdrawEarningsBtn.onclick = async () => {
            await withdrawEarnings(chatId);
        };
    }
    
    // Копирование ссылки
    const copyInviteBtn = document.getElementById('copyChannelInviteBtn');
    if (copyInviteBtn) {
        copyInviteBtn.onclick = () => {
            const input = document.getElementById('channelInviteLink');
            if (input && input.value) {
                navigator.clipboard.writeText(input.value);
                showNotification('Ссылка скопирована');
            }
        };
    }
    
    // Перегенерация ссылки
    const regenerateBtn = document.getElementById('regenerateInviteBtn');
    if (regenerateBtn) {
        regenerateBtn.onclick = async () => {
            const newLink = await generateInviteLink(chatId);
            groupInviteLinks[chatId] = newLink;
            const input = document.getElementById('channelInviteLink');
            if (input) input.value = newLink;
            showNotification('Новая ссылка создана');
        };
    }
    
    // Удаление канала
    const deleteBtn = document.getElementById('deleteChannelBtn');
    if (deleteBtn) {
        deleteBtn.onclick = async () => {
            if (!confirm('Вы уверены, что хотите удалить канал? Это действие нельзя отменить.')) return;
            try {
                await database.ref(`chats/${chatId}`).remove();
                await database.ref(`messages/${chatId}`).remove();
                modal.remove();
                showHomeScreen();
                showNotification('Канал удален');
            } catch (error) {
                console.error(error);
                showNotification('Ошибка при удалении');
            }
        };
    }
    
    // Закрытие
    const closeBtn = document.getElementById('closeSettingsBtn');
    if (closeBtn) {
        closeBtn.onclick = () => modal.remove();
    }
}

async function loadChannelMembersList(chatId) {
    const container = document.getElementById('channelMembersList');
    if (!container) return;
    
    const snapshot = await database.ref(`chats/${chatId}`).once('value');
    const chat = snapshot.val();
    if (!chat) return;
    
    const members = Object.keys(chat.members || {});
    const canManage = canManageChannel(chatId, currentUser?.uid);
    
    if (members.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-users"></i><h3>Нет подписчиков</h3></div>';
        return;
    }
    
    container.innerHTML = members.map(memberId => {
        const user = allUsers[memberId];
        if (!user) return '';
        const isCreator_ = chat.createdBy === memberId;
        const isModerator = chat.moderators && chat.moderators[memberId];
        
        return `
            <div class="channel-member-item" data-user-id="${memberId}">
                <div class="member-avatar">${escapeHtml((user.displayName || 'U').charAt(0))}</div>
                <div class="member-info">
                    <div class="member-name">
                        ${escapeHtml(user.displayName || 'Пользователь')}
                        ${getVerifiedBadge(memberId)}
                        ${isCreator_ ? '<span class="member-badge creator">👑 Создатель</span>' : ''}
                        ${isModerator ? '<span class="member-badge moderator">🛡️ Модератор</span>' : ''}
                    </div>
                    <div class="member-id">${user.customId || memberId.substring(0, 8)}</div>
                </div>
                ${canManage && !isCreator_ && memberId !== currentUser?.uid ? `
                    <div class="member-actions">
                        ${!isModerator ? `<button class="member-action-btn make-moderator" title="Назначить модератором"><i class="fas fa-user-shield"></i></button>` :
            `<button class="member-action-btn remove-moderator" title="Снять с модератора"><i class="fas fa-user-minus"></i></button>`}
                        <button class="member-action-btn remove-member" title="Исключить из канала"><i class="fas fa-trash"></i></button>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
    
    if (canManage) {
        document.querySelectorAll('.make-moderator').forEach(btn => {
            btn.onclick = async (e) => {
                e.stopPropagation();
                const item = btn.closest('.channel-member-item');
                const userId = item.dataset.userId;
                await makeChannelModerator(chatId, userId);
                await loadChannelMembersList(chatId);
                await loadChannelModeratorsList(chatId);
            };
        });
        
        document.querySelectorAll('.remove-moderator').forEach(btn => {
            btn.onclick = async (e) => {
                e.stopPropagation();
                const item = btn.closest('.channel-member-item');
                const userId = item.dataset.userId;
                await removeChannelModerator(chatId, userId);
                await loadChannelMembersList(chatId);
                await loadChannelModeratorsList(chatId);
            };
        });
        
        document.querySelectorAll('.remove-member').forEach(btn => {
            btn.onclick = async (e) => {
                e.stopPropagation();
                const item = btn.closest('.channel-member-item');
                const userId = item.dataset.userId;
                if (confirm('Исключить пользователя из канала?')) {
                    await removeFromChannel(chatId, userId);
                    await loadChannelMembersList(chatId);
                    await loadChannelModeratorsList(chatId);
                    if (currentChatId === chatId && userId === currentUser?.uid) showHomeScreen();
                }
            };
        });
    }
}

async function loadChannelModeratorsList(chatId) {
    const container = document.getElementById('channelModeratorsList');
    if (!container) return;
    
    const snapshot = await database.ref(`chats/${chatId}`).once('value');
    const chat = snapshot.val();
    if (!chat || !chat.moderators) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-user-shield"></i><h3>Нет модераторов</h3></div>';
        return;
    }
    
    const moderators = Object.keys(chat.moderators);
    const isCreator = chat.createdBy === currentUser?.uid;
    
    if (moderators.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-user-shield"></i><h3>Нет модераторов</h3><p>Назначьте модераторов для управления каналом</p></div>';
        return;
    }
    
    container.innerHTML = moderators.map(modId => {
        const user = allUsers[modId];
        if (!user) return '';
        return `
            <div class="channel-moderator-item" data-user-id="${modId}">
                <div class="moderator-avatar">${escapeHtml((user.displayName || 'U').charAt(0))}</div>
                <div class="moderator-info">
                    <div class="moderator-name">${escapeHtml(user.displayName || 'Пользователь')} ${getVerifiedBadge(modId)}</div>
                    <div class="moderator-id">${user.customId || modId.substring(0, 8)}</div>
                </div>
                ${isCreator && modId !== currentUser?.uid ? `
                    <button class="remove-moderator-btn" title="Снять с модератора">
                        <i class="fas fa-user-minus"></i>
                    </button>
                ` : ''}
            </div>
        `;
    }).join('');
    
    if (isCreator) {
        document.querySelectorAll('.remove-moderator-btn').forEach(btn => {
            btn.onclick = async (e) => {
                e.stopPropagation();
                const item = btn.closest('.channel-moderator-item');
                const userId = item.dataset.userId;
                await removeChannelModerator(chatId, userId);
                await loadChannelMembersList(chatId);
                await loadChannelModeratorsList(chatId);
            };
        });
    }
}

function filterChannelMembers(chatId, query) {
    const items = document.querySelectorAll('.channel-member-item');
    const lowerQuery = query.toLowerCase();
    items.forEach(item => {
        const name = item.querySelector('.member-name')?.textContent.toLowerCase() || '';
        const id = item.querySelector('.member-id')?.textContent.toLowerCase() || '';
        item.style.display = (name.includes(lowerQuery) || id.includes(lowerQuery)) ? 'flex' : 'none';
    });
}

async function openAddSubscriberModal(chatId) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h3><i class="fas fa-user-plus"></i> Добавить подписчика</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>Поиск пользователя</label>
                    <div class="search-container">
                        <div class="search-input-wrapper">
                            <input type="text" id="addSubscriberSearch" placeholder="Введите имя или ID пользователя">
                            <div class="search-loading" id="addSubscriberLoading"><div class="search-spinner"></div></div>
                        </div>
                        <div class="search-results-container" id="addSubscriberResults"></div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" id="cancelAddSubscriberBtn">Отмена</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    const searchInput = document.getElementById('addSubscriberSearch');
    const resultsContainer = document.getElementById('addSubscriberResults');
    const loading = document.getElementById('addSubscriberLoading');
    
    let searchTimeout;
    searchInput.oninput = () => {
        clearTimeout(searchTimeout);
        const query = searchInput.value.trim();
        if (query.length < 2) {
            resultsContainer.classList.remove('active');
            return;
        }
        loading.classList.add('active');
        searchTimeout = setTimeout(async () => {
            const chat = chats.find(c => c.id === chatId);
            const existingMembers = Object.keys(chat.members || {});
            const results = [];
            for (const id in allUsers) {
                if (id !== currentUser?.uid && !existingMembers.includes(id)) {
                    const user = allUsers[id];
                    if (user && (user.displayName?.toLowerCase().includes(query.toLowerCase()) ||
                        user.customId?.toLowerCase().includes(query.toLowerCase()))) {
                        results.push(user);
                    }
                }
            }
            resultsContainer.innerHTML = results.slice(0, 10).map(user => `
                <div class="search-result-item" data-user-id="${user.uid}">
                    <div class="search-result-avatar">${escapeHtml((user.displayName || 'U').charAt(0))}</div>
                    <div class="search-result-info">
                        <div class="search-result-name">${escapeHtml(user.displayName)} ${getVerifiedBadge(user.uid)}</div>
                        <div class="search-result-id">${user.customId}</div>
                    </div>
                    <button class="add-user-btn">Добавить</button>
                </div>
            `).join('');
            if (results.length === 0) {
                resultsContainer.innerHTML = '<div class="no-search-results"><i class="fas fa-user-friends"></i><p>Пользователи не найдены</p></div>';
            }
            resultsContainer.classList.add('active');
            loading.classList.remove('active');
            document.querySelectorAll('#addSubscriberResults .add-user-btn').forEach(btn => {
                btn.onclick = async (e) => {
                    e.stopPropagation();
                    const item = btn.closest('.search-result-item');
                    const userId = item.dataset.userId;
                    await addSubscriberToChannel(chatId, userId);
                    modal.remove();
                };
            });
        }, 300);
    };
    const cancelBtn = document.getElementById('cancelAddSubscriberBtn');
    if (cancelBtn) cancelBtn.onclick = () => modal.remove();
}

async function openAddModeratorModal(chatId) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h3><i class="fas fa-user-shield"></i> Назначить модератора</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>Поиск подписчика</label>
                    <div class="search-container">
                        <div class="search-input-wrapper">
                            <input type="text" id="addModeratorSearch" placeholder="Введите имя или ID подписчика">
                            <div class="search-loading" id="addModeratorLoading"><div class="search-spinner"></div></div>
                        </div>
                        <div class="search-results-container" id="addModeratorResults"></div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" id="cancelAddModeratorBtn">Отмена</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    const searchInput = document.getElementById('addModeratorSearch');
    const resultsContainer = document.getElementById('addModeratorResults');
    const loading = document.getElementById('addModeratorLoading');
    
    let searchTimeout;
    searchInput.oninput = () => {
        clearTimeout(searchTimeout);
        const query = searchInput.value.trim();
        if (query.length < 2) {
            resultsContainer.classList.remove('active');
            return;
        }
        loading.classList.add('active');
        searchTimeout = setTimeout(async () => {
            const chat = chats.find(c => c.id === chatId);
            const members = Object.keys(chat.members || {});
            const moderators = chat.moderators ? Object.keys(chat.moderators) : [];
            const availableMembers = members.filter(m => !moderators.includes(m) && m !== chat.createdBy);
            const results = [];
            for (const id of availableMembers) {
                const user = allUsers[id];
                if (user && (user.displayName?.toLowerCase().includes(query.toLowerCase()) ||
                    user.customId?.toLowerCase().includes(query.toLowerCase()))) {
                    results.push(user);
                }
            }
            resultsContainer.innerHTML = results.slice(0, 10).map(user => `
                <div class="search-result-item" data-user-id="${user.uid}">
                    <div class="search-result-avatar">${escapeHtml((user.displayName || 'U').charAt(0))}</div>
                    <div class="search-result-info">
                        <div class="search-result-name">${escapeHtml(user.displayName)} ${getVerifiedBadge(user.uid)}</div>
                        <div class="search-result-id">${user.customId}</div>
                    </div>
                    <button class="add-user-btn">Назначить</button>
                </div>
            `).join('');
            if (results.length === 0) {
                resultsContainer.innerHTML = '<div class="no-search-results"><i class="fas fa-user-friends"></i><p>Подписчики не найдены</p></div>';
            }
            resultsContainer.classList.add('active');
            loading.classList.remove('active');
            document.querySelectorAll('#addModeratorResults .add-user-btn').forEach(btn => {
                btn.onclick = async (e) => {
                    e.stopPropagation();
                    const item = btn.closest('.search-result-item');
                    const userId = item.dataset.userId;
                    await makeChannelModerator(chatId, userId);
                    modal.remove();
                };
            });
        }, 300);
    };
    const cancelBtn = document.getElementById('cancelAddModeratorBtn');
    if (cancelBtn) cancelBtn.onclick = () => modal.remove();
}

// ================================================
// АДМИН-ПАНЕЛЬ (СТАРАЯ ВЕРСИЯ ДЛЯ СОВМЕСТИМОСТИ)
// ================================================
function setupAdminPanel() {
    if (adminPanelBtn) {
        const isAdmin = currentUser && verifiedUsers && verifiedUsers[currentUser.uid] && verifiedUsers[currentUser.uid].type === 'admin';
        adminPanelBtn.style.display = isAdmin ? 'flex' : 'none';
        if (isAdmin) {
            adminPanelBtn.onclick = () => openAdminPanel();
        }
    }
}

async function giveVerifiedBadge(userId, type) {
    try {
        await database.ref(`verifiedUsers/${userId}`).set({ type, verifiedAt: Date.now(), verifiedBy: currentUser.uid });
        showNotification('Галочка выдана');
        loadVerifiedUsersList();
        if (document.getElementById('adminPanelPage') && adminPanelPage.style.display === 'block') {
            loadVerifiedUsersListAdmin();
            loadAdminUsers();
        }
    } catch (error) {
        console.error(error);
        showNotification('Ошибка');
    }
}

window.removeVerifiedBadge = async function (userId) {
    if (!confirm('Удалить галочку?')) return;
    try {
        await database.ref(`verifiedUsers/${userId}`).remove();
        showNotification('Галочка удалена');
        loadVerifiedUsersList();
        if (document.getElementById('adminPanelPage') && adminPanelPage.style.display === 'block') {
            loadVerifiedUsersListAdmin();
            loadAdminUsers();
        }
    } catch (e) {
        console.error(e);
    }
};

// ================================================
// ОТСЛЕЖИВАНИЕ СТАТУСА
// ================================================
function setupInactivityTracking() {
    const events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
        document.addEventListener(event, () => {
            lastActivityTime = Date.now();
            if (currentUser && (currentUser.status === 'offline' || currentUser.status === 'invisible') && navigator.onLine) {
                const savedStatus = localStorage.getItem('userSelectedStatus') || 'online';
                if (savedStatus !== 'offline' && savedStatus !== 'invisible') setUserStatus(savedStatus);
            }
        });
    });
    
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            if (currentUser && currentUser.status === 'online') setUserStatus('away');
        } else {
            if (currentUser && (currentUser.status === 'away' || currentUser.status === 'offline')) {
                const savedStatus = localStorage.getItem('userSelectedStatus') || 'online';
                if (savedStatus !== 'offline' && savedStatus !== 'invisible') setUserStatus(savedStatus);
            }
            lastActivityTime = Date.now();
        }
    });
    
    window.addEventListener('online', () => {
        if (currentUser) {
            const savedStatus = localStorage.getItem('userSelectedStatus') || 'online';
            if (savedStatus !== 'offline' && savedStatus !== 'invisible') setUserStatus(savedStatus);
        }
    });
    
    window.addEventListener('offline', () => {
        if (currentUser) setUserStatus('offline');
    });
}

function startInactivityMonitoring() {
    if (inactivityTimer) clearInterval(inactivityTimer);
    inactivityTimer = setInterval(async () => {
        if (currentUser && navigator.onLine && !document.hidden) {
            const now = Date.now();
            const inactiveTime = now - lastActivityTime;
            const savedStatus = localStorage.getItem('userSelectedStatus') || 'online';
            
            if (inactiveTime > 30000 && currentUser.status === 'online' && savedStatus === 'online') {
                await setUserStatus('away');
            } else if (inactiveTime > 300000 && (currentUser.status === 'online' || currentUser.status === 'away') && savedStatus === 'online') {
                await setUserStatus('offline');
            } else if (inactiveTime < 30000 && currentUser.status === 'away' && savedStatus === 'online') {
                await setUserStatus('online');
            }
        }
    }, 10000);
}

function stopInactivityMonitoring() {
    if (inactivityTimer) {
        clearInterval(inactivityTimer);
        inactivityTimer = null;
    }
}

async function setUserStatus(status) {
    if (!currentUser) return;
    try {
        if (status !== 'away' && status !== 'offline') {
            localStorage.setItem('userSelectedStatus', status);
        }
        
        await database.ref(`users/${currentUser.uid}`).update({
            status: status,
            lastActive: Date.now()
        });
        currentUser.status = status;
        currentUser.selectedStatus = status;
        
        updateUserProfileDisplay();
        updateDesktopUserInfo();
        updateMobileProfile();
        updateContactsDisplay();
        updateChatsDisplay();
        if (document.getElementById('adminPanelPage') && adminPanelPage.style.display === 'block') {
            loadAdminStats();
            loadAdminUsers();
        }
    } catch (error) {
        console.error("Ошибка обновления статуса:", error);
    }
}

function resetToOnlineStatus() {
    if (currentUser) {
        let savedStatus = localStorage.getItem('userSelectedStatus');
        if (!savedStatus) {
            savedStatus = 'online';
            localStorage.setItem('userSelectedStatus', savedStatus);
        }
        
        if (!document.hidden) {
            database.ref(`users/${currentUser.uid}`).update({
                status: savedStatus,
                lastActive: Date.now()
            });
            currentUser.status = savedStatus;
            currentUser.selectedStatus = savedStatus;
        } else {
            database.ref(`users/${currentUser.uid}`).update({
                status: 'away',
                lastActive: Date.now()
            });
            currentUser.status = 'away';
            currentUser.selectedStatus = savedStatus;
        }
        
        lastActivityTime = Date.now();
        updateUserProfileDisplay();
        updateDesktopUserInfo();
        updateMobileProfile();
        updateContactsDisplay();
        updateChatsDisplay();
    }
}

function startHeartbeat() {
    setInterval(async () => {
        if (currentUser && navigator.onLine && !document.hidden) {
            try {
                await database.ref(`users/${currentUser.uid}`).update({
                    lastActive: Date.now()
                });
            } catch (e) {}
        }
    }, 30000);
}

// ================================================
// ИНИЦИАЛИЗАЦИЯ
// ================================================
function detectMobile() {
    isMobile = window.innerWidth <= 768;
    window.addEventListener('resize', () => {
        if ((window.innerWidth <= 768) !== isMobile) location.reload();
    });
}

function initMobileInterface() {
    if (mobileContainer) mobileContainer.style.display = 'flex';
    if (desktopSidebar) desktopSidebar.style.display = 'none';
    if (desktopEmptyScreen) desktopEmptyScreen.style.display = 'none';
    if (homeScreen) homeScreen.style.display = 'none';
    updateMobileChats();
    updateMobileContacts();
    updateMobileProfile();
    if (currentChatId && chatScreen) {
        chatScreen.style.display = 'flex';
        chatScreen.classList.add('mobile');
    }
}

function initDesktopInterface() {
    if (desktopSidebar) desktopSidebar.style.display = 'flex';
    if (mobileContainer) mobileContainer.style.display = 'none';
    if (homeScreen) homeScreen.style.display = 'none';
    updateDesktopUserInfo();
    if (currentChatId) {
        if (desktopEmptyScreen) desktopEmptyScreen.style.display = 'none';
        if (chatScreen) {
            chatScreen.style.display = 'flex';
            chatScreen.classList.add('desktop');
        }
        if (chatHeaderDesktop) chatHeaderDesktop.style.display = 'flex';
        if (chatHeaderMobile) chatHeaderMobile.style.display = 'none';
    } else {
        if (desktopEmptyScreen) desktopEmptyScreen.style.display = 'flex';
        if (chatScreen) chatScreen.style.display = 'none';
    }
}

function initializeInterface() {
    if (!currentUser) return;
    
    updateUserProfileDisplay();
    updateHomeChats();
    updateDesktopChats();
    updateDesktopContacts();
    updateMobileChats();
    updateMobileContacts();
    updateMobileProfile();
    
    if (desktopSidebarTabs.length) {
        desktopSidebarTabs.forEach(tab => {
            tab.onclick = function () {
                const tabName = this.dataset.tab;
                desktopSidebarTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                if (desktopChatsList) desktopChatsList.style.display = tabName === 'chats' ? 'flex' : 'none';
                if (desktopContactsList) desktopContactsList.style.display = tabName === 'contacts' ? 'flex' : 'none';
            };
        });
        if (desktopSidebarTabs[0]) desktopSidebarTabs[0].click();
    }
    
    if (isMobile) {
        initMobileInterface();
    } else {
        initDesktopInterface();
    }
    
    if (currentChatId) {
        const currentChat = chats.find(c => c.id === currentChatId);
        if (currentChat && currentChat.type === 'group') {
            setTimeout(() => {
                addGroupActionButtons();
                addGroupMembersPreview();
            }, 500);
        } else if (currentChat && currentChat.type === 'channel') {
            setTimeout(() => {
                updateChannelUI();
                addChannelSettingsButton();
                addSubscribersCounter();
                updateChannelSubscribersCount(currentChatId);
            }, 100);
        }
    }
}

function setupMobileInterface() {
    if (mobileNavItems.length) {
        mobileNavItems.forEach(item => {
            item.onclick = () => {
                mobileNavItems.forEach(n => n.classList.remove('active'));
                item.classList.add('active');
                mobileTabs.forEach(t => t.classList.remove('active'));
                document.getElementById(`mobile${item.dataset.tab.charAt(0).toUpperCase() + item.dataset.tab.slice(1)}Tab`)?.classList.add('active');
            };
        });
    }
    
    if (mobileCreateFAB) mobileCreateFAB.onclick = () => {
        if (mobileCreateModal) mobileCreateModal.classList.add('active');
    };
    if (mobileCloseCreateModal) mobileCloseCreateModal.onclick = () => {
        if (mobileCreateModal) mobileCreateModal.classList.remove('active');
    };
    if (mobileCreateModal) mobileCreateModal.onclick = (e) => {
        if (e.target === mobileCreateModal) mobileCreateModal.classList.remove('active');
    };
    
    const typeOpts = document.querySelectorAll('.mobile-chat-type-option');
    typeOpts.forEach(opt => {
        opt.onclick = () => {
            typeOpts.forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
            const forms = ['mobileGroupForm', 'mobilePrivateForm', 'mobileChannelForm'];
            forms.forEach(f => {
                const el = document.getElementById(f);
                if (el) el.classList.remove('active');
            });
            const target = document.getElementById(`mobile${opt.dataset.type.charAt(0).toUpperCase() + opt.dataset.type.slice(1)}Form`);
            if (target) target.classList.add('active');
        };
    });
    
    const privateInput = document.getElementById('mobilePrivateUserId');
    if (privateInput) {
        privateInput.oninput = function () {
            clearTimeout(searchTimeouts.mobile);
            const q = this.value.trim();
            const resDiv = document.getElementById('mobilePrivateSearchResults');
            const btn = document.getElementById('mobileCreatePrivateBtn');
            if (q.length < 1) {
                if (resDiv) resDiv.innerHTML = '';
                if (btn) btn.disabled = true;
                return;
            }
            searchTimeouts.mobile = setTimeout(() => {
                const results = [];
                for (const id in allUsers) {
                    if (id !== currentUser?.uid) {
                        const u = allUsers[id];
                        if (u.displayName?.toLowerCase().includes(q.toLowerCase()) || u.customId?.toLowerCase().includes(q.toLowerCase())) results.push(u);
                    }
                }
                if (resDiv) resDiv.innerHTML = results.slice(0, 5).map(u => `
                    <div class="mobile-search-result-item" data-custom-id="${u.customId}">
                        <div class="mobile-search-result-avatar">${escapeHtml(u.displayName.charAt(0))}</div>
                        <div class="mobile-search-result-info">
                            <div class="mobile-search-result-name">${escapeHtml(u.displayName)}</div>
                            <div class="mobile-search-result-id">${u.customId}</div>
                        </div>
                    </div>
                `).join('');
                if (btn) btn.disabled = false;
                document.querySelectorAll('.mobile-search-result-item').forEach(el => {
                    el.onclick = () => {
                        privateInput.value = el.dataset.customId;
                        if (resDiv) resDiv.innerHTML = '';
                        if (btn) btn.disabled = false;
                    };
                });
            }, 300);
        };
    }
    
    const createGroupBtn = document.getElementById('mobileCreateGroupBtn');
    if (createGroupBtn) {
        createGroupBtn.onclick = async () => {
            const name = document.getElementById('mobileGroupName')?.value.trim();
            if (!name) return;
            const chat = {
                name: name,
                description: document.getElementById('mobileGroupDescription')?.value.trim() || '',
                type: 'group',
                createdBy: currentUser.uid,
                createdAt: Date.now(),
                members: { [currentUser.uid]: true },
                lastMessage: { text: "Группа создана", timestamp: Date.now(), senderId: currentUser.uid }
            };
            const ref = await database.ref('chats').push(chat);
            if (mobileCreateModal) mobileCreateModal.classList.remove('active');
            openChat(ref.key);
        };
    }
    
    const createPrivateBtn = document.getElementById('mobileCreatePrivateBtn');
    if (createPrivateBtn) {
        createPrivateBtn.onclick = async () => {
            const customId = document.getElementById('mobilePrivateUserId')?.value.trim();
            if (!customId) return;
            let targetId = null;
            for (const id in allUsers) {
                if (allUsers[id].customId === customId) {
                    targetId = id;
                    break;
                }
            }
            if (!targetId || targetId === currentUser.uid) return;
            const existing = await findExistingPrivateChat(targetId);
            if (existing) {
                if (mobileCreateModal) mobileCreateModal.classList.remove('active');
                openChat(existing);
                return;
            }
            const chat = {
                name: `${currentUser.displayName} и ${allUsers[targetId].displayName}`,
                type: 'private',
                createdBy: currentUser.uid,
                createdAt: Date.now(),
                members: { [currentUser.uid]: true, [targetId]: true },
                lastMessage: { text: "Чат создан", timestamp: Date.now(), senderId: currentUser.uid }
            };
            const ref = await database.ref('chats').push(chat);
            if (mobileCreateModal) mobileCreateModal.classList.remove('active');
            openChat(ref.key);
        };
    }
    
    const createChannelBtn = document.getElementById('mobileCreateChannelBtn');
    if (createChannelBtn) {
        createChannelBtn.onclick = () => createChannel(true);
    }
    
    if (mobileSearchChats) {
        mobileSearchChats.oninput = (e) => {
            const q = e.target.value.toLowerCase();
            document.querySelectorAll('.mobile-chat-item').forEach(el => {
                const n = el.querySelector('.mobile-chat-name')?.textContent.toLowerCase() || '';
                const m = el.querySelector('.mobile-chat-last-message')?.textContent.toLowerCase() || '';
                el.style.display = (n.includes(q) || m.includes(q)) ? 'flex' : 'none';
            });
        };
    }
    
    if (mobileSearchContacts) {
        mobileSearchContacts.oninput = (e) => {
            const q = e.target.value.toLowerCase();
            document.querySelectorAll('.mobile-contact-item').forEach(el => {
                const n = el.querySelector('.mobile-contact-name')?.textContent.toLowerCase() || '';
                el.style.display = n.includes(q) ? 'flex' : 'none';
            });
        };
    }
    
    if (mobileCopyIdBtn) mobileCopyIdBtn.onclick = () => navigator.clipboard.writeText(mobileProfileId?.textContent || '');
    
    if (mobileEditProfileBtn) {
        mobileEditProfileBtn.onclick = () => {
            if (editProfileModal) {
                editProfileModal.classList.add('active');
                if (editProfileName) editProfileName.value = currentUser?.displayName || '';
                statusOptions.forEach(opt => {
                    opt.classList.remove('active');
                    if (opt.dataset.status === (currentUser?.selectedStatus || currentUser?.status)) opt.classList.add('active');
                });
            }
        };
    }
    
    if (mobileLogoutBtn) mobileLogoutBtn.onclick = logoutUser;
}

function showReplyPreview(sender, text) {
    if (!replyPreviewContainer) return;
    replyPreviewContainer.style.display = 'block';
    replyPreviewContainer.innerHTML = `
        <div class="reply-preview">
            <div class="reply-preview-content">
                <div class="reply-preview-sender"><i class="fas fa-reply"></i> Ответ ${escapeHtml(sender)}</div>
                <div class="reply-preview-text">${escapeHtml(text.length > 100 ? text.substring(0, 100) + '...' : text)}</div>
            </div>
            <button class="reply-preview-close" id="cancelReplyBtn"><i class="fas fa-times"></i></button>
        </div>
    `;
    document.getElementById('cancelReplyBtn')?.addEventListener('click', hideReplyPreview);
}

function setupContextMenuBoundary() {
    if (messagesContainer) {
        messagesContainer.addEventListener('scroll', () => {
            if (messageContextMenu?.classList.contains('active')) messageContextMenu.classList.remove('active');
        });
    }
    window.addEventListener('resize', () => {
        if (messageContextMenu?.classList.contains('active')) messageContextMenu.classList.remove('active');
    });
}

function hideSearchResults(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active');
}

function setSearchLoading(id, loading) {
    const el = document.getElementById(`${id}Loading`);
    if (el) loading ? el.classList.add('active') : el.classList.remove('active');
}

function setupDragAndDrop() {
    if (!messagesContainer) return;
    messagesContainer.ondrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file?.type.startsWith('image/')) showPhotoPreview(file);
    };
    messagesContainer.ondragover = (e) => e.preventDefault();
}

function setupReactionsHandlers() {
    document.addEventListener('click', e => {
        const opt = e.target.closest('.reaction-option');
        if (opt && messageContextMenu?.classList.contains('active')) {
            e.preventDefault();
            const msgId = messageContextMenu.dataset.messageId;
            const emoji = opt.dataset.reaction;
            if (msgId && emoji && currentChatId) {
                toggleReaction(msgId, emoji);
                messageContextMenu.classList.remove('active');
            }
        }
    });
}

async function logoutUser() {
    try {
        cleanupListeners();
        if (currentUser) {
            localStorage.setItem('userStatus', 'offline');
            await database.ref(`users/${currentUser.uid}`).update({ status: "offline", lastActive: Date.now() });
        }
        await auth.signOut();
        currentUser = null;
        chats = [];
        contacts = [];
        currentChatId = null;
        if (connectionCheckInterval) clearInterval(connectionCheckInterval);
        if (inactivityTimer) clearInterval(inactivityTimer);
    } catch (e) {
        console.error(e);
    }
}

function startConnectionMonitoring() {
    if (connectionCheckInterval) clearInterval(connectionCheckInterval);
    connectionCheckInterval = setInterval(async () => {
        if (currentUser && navigator.onLine) {
            try {
                await database.ref(`users/${currentUser.uid}`).update({ lastActive: Date.now() });
            } catch (e) {}
        }
    }, 30000);
}

// ================================================
// ОСНОВНЫЕ ОБРАБОТЧИКИ
// ================================================
function setupEventListeners() {
    authTabs.forEach(tab => {
        tab.onclick = () => {
            const name = tab.dataset.form;
            authTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            if (loginForm) loginForm.classList.remove('active');
            if (registerForm) registerForm.classList.remove('active');
            if (name === 'login') loginForm.classList.add('active');
            else registerForm.classList.add('active');
            hideError();
        };
    });

    const refreshRequestsBtn = document.getElementById('refreshRequestsBtn');
    if (refreshRequestsBtn) {
        refreshRequestsBtn.onclick = () => {
            if (adminPanelPage && adminPanelPage.style.display === 'block') {
                loadPendingVerification();
                showNotification('Список заявок обновлен');
            }
        };
    }
    
    if (loginBtn) loginBtn.onclick = loginUser;
    if (registerBtn) registerBtn.onclick = registerUser;
    if (homeCreateChatBtn) homeCreateChatBtn.onclick = () => {
        if (createChatModal) createChatModal.classList.add('active');
    };
    if (homeAddContactBtn) homeAddContactBtn.onclick = () => {
        if (addContactModal) addContactModal.classList.add('active');
    };
    if (backToHomeBtn) backToHomeBtn.onclick = showHomeScreen;
    if (sendMessageBtn) sendMessageBtn.onclick = sendMessage;
    if (copyHomeIdBtn) copyHomeIdBtn.onclick = () => {
        if (homeUserId) navigator.clipboard.writeText(homeUserId.textContent);
    };
    if (desktopCreateChatIcon) desktopCreateChatIcon.onclick = () => {
        if (createChatModal) createChatModal.classList.add('active');
    };
    if (desktopAddContactIcon) desktopAddContactIcon.onclick = () => {
        if (addContactModal) addContactModal.classList.add('active');
    };
    if (desktopProfileIcon) desktopProfileIcon.onclick = openProfileModal;
    if (desktopSettingsIcon) desktopSettingsIcon.onclick = () => {
        if (editProfileModal) editProfileModal.classList.add('active');
    };
    if (messageInput) {
        messageInput.onkeypress = (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        };
    }
    if (cancelCreateBtn) cancelCreateBtn.onclick = () => {
        if (createChatModal) createChatModal.classList.remove('active');
        resetCreateForm();
    };
    
    chatTypeOptions.forEach(opt => {
        opt.onclick = () => {
            chatTypeOptions.forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
            selectedChatType = opt.dataset.type;
            const isPrivate = selectedChatType === 'private';
            const isChannel = selectedChatType === 'channel';
            if (chatDescriptionGroup) chatDescriptionGroup.style.display = 'block';
            if (privateChatUser) privateChatUser.style.display = isPrivate ? 'block' : 'none';
            if (chatNameInput) {
                chatNameInput.disabled = isPrivate;
                chatNameInput.placeholder = isPrivate ? "Имя чата (автоматически)" : (isChannel ? "Введите название канала" : "Введите название");
            }
        };
    });
    
    if (confirmCreateBtn) confirmCreateBtn.onclick = createNewChat;
    
    if (cancelAddContactBtn) {
        cancelAddContactBtn.onclick = () => {
            if (addContactModal) addContactModal.classList.remove('active');
            if (contactSearch) contactSearch.value = '';
            hideSearchResults('contactSearchResults');
            if (confirmAddContactBtn) confirmAddContactBtn.disabled = true;
        };
    }
    
    if (confirmAddContactBtn) {
        confirmAddContactBtn.onclick = async () => {
            const val = contactSearch?.value.trim();
            if (!val) return;
            const res = searchUsers(val, contacts);
            const found = res.find(r => !r.isContact);
            if (found) {
                await addContact(found.customId);
                if (addContactModal) addContactModal.classList.remove('active');
                if (contactSearch) contactSearch.value = '';
                hideSearchResults('contactSearchResults');
                if (confirmAddContactBtn) confirmAddContactBtn.disabled = true;
            }
        };
    }
    
    if (copyUserIdBtn) copyUserIdBtn.onclick = () => {
        if (profileUserId) navigator.clipboard.writeText(profileUserId.textContent);
    };
    if (logoutBtn) logoutBtn.onclick = logoutUser;
    
    if (editProfileBtn) {
        editProfileBtn.onclick = () => {
            if (profileModal) profileModal.classList.remove('active');
            if (editProfileModal) editProfileModal.classList.add('active');
            if (editProfileName) editProfileName.value = currentUser?.displayName || '';
            const savedStatus = currentUser?.selectedStatus || currentUser?.status || 'online';
            statusOptions.forEach(opt => {
                opt.classList.remove('active');
                if (opt.dataset.status === savedStatus) opt.classList.add('active');
            });
        };
    }
    
    if (cancelEditProfileBtn) cancelEditProfileBtn.onclick = () => {
        if (editProfileModal) editProfileModal.classList.remove('active');
        if (profileModal) profileModal.classList.add('active');
    };
    if (saveProfileBtn) saveProfileBtn.onclick = saveProfileChanges;
    
    statusOptions.forEach(opt => {
        opt.onclick = () => {
            statusOptions.forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
        };
    });
    
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                if (modal.id === 'createChatModal') resetCreateForm();
            }
        };
    });
    
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.onclick = () => {
            const modal = btn.closest('.modal-overlay');
            if (modal) modal.classList.remove('active');
            if (modal?.id === 'createChatModal') resetCreateForm();
        };
    });
    
    document.onkeydown = (e) => {
        if (e.key === 'Escape') {
            if (replyToMessage) hideReplyPreview();
            document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
            if (messageContextMenu) messageContextMenu.classList.remove('active');
            if (mobileCreateModal?.classList.contains('active')) mobileCreateModal.classList.remove('active');
            hideSearchResults('contactSearchResults');
        }
    };
    
    setupContactSearch();
}

function setupContactSearch() {
    if (!contactSearch) return;
    const newSearch = contactSearch.cloneNode(true);
    contactSearch.parentNode.replaceChild(newSearch, contactSearch);
    
    newSearch.oninput = function () {
        clearTimeout(searchTimeouts.modal);
        const q = this.value.trim();
        if (q.length < 1) {
            const resultsContainer = document.getElementById('contactSearchResults');
            if (resultsContainer) {
                resultsContainer.classList.remove('active');
                resultsContainer.style.display = 'none';
            }
            setSearchLoading('contactSearch', false);
            if (confirmAddContactBtn) confirmAddContactBtn.disabled = true;
            return;
        }
        setSearchLoading('contactSearch', true);
        searchTimeouts.modal = setTimeout(() => {
            const res = searchUsers(q, contacts);
            displaySearchResults(res, 'contactSearchResults', contacts);
            setSearchLoading('contactSearch', false);
            if (confirmAddContactBtn) confirmAddContactBtn.disabled = res.length === 0 || !res.some(r => !r.isContact);
        }, 300);
    };
}

// ================================================
// ОБРАБОТЧИК ОТВЕТА
// ================================================
function setupReplyHandler() {
    const replyBtn = document.getElementById('contextReply');
    if (!replyBtn) return;
    
    const newReplyBtn = replyBtn.cloneNode(true);
    replyBtn.parentNode.replaceChild(newReplyBtn, replyBtn);
    
    newReplyBtn.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const menu = document.getElementById('messageContextMenu');
        const msgId = menu?.dataset.messageId;
        
        if (!msgId || !currentChatId) {
            closeContextMenu();
            showNotification('Не удалось определить сообщение');
            return;
        }
        
        const messageDiv = document.querySelector(`.message[data-message-id="${msgId}"]`);
        if (!messageDiv) {
            closeContextMenu();
            showNotification('Сообщение не найдено');
            return;
        }
        
        let text = '';
        const textDiv = messageDiv.querySelector('.message-text');
        if (textDiv && textDiv.textContent) {
            text = textDiv.textContent;
        } else if (messageDiv.querySelector('.message-photo')) {
            text = '📸 Фото';
        } else if (messageDiv.querySelector('.message-file')) {
            text = '📎 Файл';
        } else {
            text = 'Сообщение';
        }
        
        let sender = 'Пользователь';
        const senderSpan = messageDiv.querySelector('.message-sender-name');
        if (senderSpan) {
            sender = senderSpan.textContent.split(' ')[0];
        }
        
        window.replyToMessageGlobal = {
            id: msgId,
            text: text,
            senderName: sender,
            senderId: messageDiv.dataset.senderId
        };
        
        showReplyPreview(sender, text);
        closeContextMenu();
        
        const input = document.getElementById('messageInput');
        if (input) {
            input.focus();
            input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };
}

// ================================================
// ЗАПУСК
// ================================================
document.addEventListener('DOMContentLoaded', function () {
    initializeApp();
    setupInactivityTracking();
    setupReplyHandler();
});

async function initializeApp() {
    setupDragAndDrop();
    setupEventListeners();
    detectMobile();
    setupPhotoUpload();
    setupFileUpload();
    setupAdminPanel();
    setupMobileInterface();
    setupReactionsHandlers();
    setupAttachModal();
    setupStickers();
    initGroupModals();
    setupContextMenuBoundary();
    setupAvatarUpload();
    
    authUnsubscribe = auth.onAuthStateChanged(async (user) => {
        if (user) {
            await loadUserData(user.uid);  // <-- ЗАГРУЗКА ДАННЫХ
            resetToOnlineStatus();
            
            if (authContainer) authContainer.style.display = 'none';
            if (mainContainer) mainContainer.style.display = 'flex';
            
            startConnectionMonitoring();
            startInactivityMonitoring();
            startHeartbeat();
            updateUserIDs();
            handleInviteLink();
            
            if (isMobile) {
                initMobileInterface();
            } else {
                initDesktopInterface();
            }
            
            setupReplyHandler();
            
        } else {
            if (authContainer) authContainer.style.display = 'flex';
            if (mainContainer) mainContainer.style.display = 'none';
            
            if (connectionCheckInterval) {
                clearInterval(connectionCheckInterval);
                connectionCheckInterval = null;
            }
            stopInactivityMonitoring();
        }
    });
}

// ================================================
// ГЛОБАЛЬНЫЕ ЭКСПОРТЫ
// ================================================
window.openChat = openChat;
window.showHomeScreen = showHomeScreen;
window.openUserProfileModal = openUserProfileModal;
window.removeMemberFromGroup = removeMemberFromGroup;
window.removeVerifiedBadge = removeVerifiedBadge;
window.downloadFile = (data, name) => {
    const a = document.createElement('a');
    a.href = data;
    a.download = name;
    a.click();
};
window.showFullPhoto = (src) => {
    if (photoViewModal && fullSizePhoto) {
        fullSizePhoto.src = src;
        photoViewModal.classList.add('active');
    }
};
window.closeContextMenu = closeContextMenu;
window.toggleReaction = toggleReaction;
window.openAdminPanel = openAdminPanel;

window.addEventListener('beforeunload', async () => {
    if (currentUser) {
        localStorage.setItem('userStatus', currentUser.status);
        try {
            await database.ref(`users/${currentUser.uid}`).update({ status: "offline", lastActive: Date.now() });
        } catch (e) {}
    }
    if (authUnsubscribe) authUnsubscribe();
    cleanupListeners();
    if (connectionCheckInterval) clearInterval(connectionCheckInterval);
    if (inactivityTimer) clearInterval(inactivityTimer);
});

window.addEventListener('focus', async () => {
    if (currentUser && navigator.onLine) {
        try {
            await database.ref(`users/${currentUser.uid}`).update({ lastActive: Date.now() });
        } catch (e) {}
        updateUserProfileDisplay();
        updateDesktopUserInfo();
        updateMobileProfile();
    }
});

window.addEventListener('online', async () => {
    if (currentUser) {
        try {
            await database.ref(`users/${currentUser.uid}`).update({ lastActive: Date.now() });
        } catch (e) {}
        updateUserProfileDisplay();
        updateDesktopUserInfo();
        updateMobileProfile();
    }
});

// ================================================
// МОНЕТИЗАЦИЯ КАНАЛОВ
// ================================================

// Подсчет количества постов в канале
async function countChannelPosts(chatId) {
    try {
        const snapshot = await database.ref(`messages/${chatId}`).orderByChild('type').once('value');
        const messages = snapshot.val() || {};
        
        // Считаем только текстовые сообщения (не системные)
        let postCount = 0;
        for (const key in messages) {
            const msg = messages[key];
            if (msg.type === 'text' && msg.senderId !== 'system') {
                postCount++;
            }
        }
        return postCount;
    } catch (error) {
        console.error('Ошибка подсчета постов:', error);
        return 0;
    }
}

// Проверка возможности включения монетизации
async function checkMonetizationEligibility(chatId) {
    const chat = chats.find(c => c.id === chatId);
    if (!chat || chat.type !== 'channel') return false;
    
    const subscriberCount = Object.keys(chat.members || {}).length;
    const postCount = await countChannelPosts(chatId);
    
    return {
        eligible: subscriberCount >= 100 && postCount >= 30,
        subscribers: subscriberCount,
        posts: postCount,
        neededSubscribers: Math.max(0, 100 - subscriberCount),
        neededPosts: Math.max(0, 30 - postCount)
    };
}

// Включение монетизации
async function enableMonetization(chatId) {
    const chat = chats.find(c => c.id === chatId);
    if (!chat || chat.type !== 'channel') {
        showNotification('Это не канал');
        return;
    }
    
    if (chat.createdBy !== currentUser?.uid) {
        showNotification('Только создатель канала может включить монетизацию');
        return;
    }
    
    const eligibility = await checkMonetizationEligibility(chatId);
    if (!eligibility.eligible) {
        showNotification(`Требования не выполнены: нужно еще ${eligibility.neededSubscribers} подписчиков и ${eligibility.neededPosts} постов`);
        return;
    }
    
    try {
        await database.ref(`chats/${chatId}/monetization`).set({
            enabled: true,
            enabledAt: Date.now(),
            earnings: 0,
            withdrawn: 0
        });
        
        // Обновляем локальный массив
        const chatIndex = chats.findIndex(c => c.id === chatId);
        if (chatIndex !== -1) {
            chats[chatIndex].monetization = {
                enabled: true,
                enabledAt: Date.now(),
                earnings: 0,
                withdrawn: 0
            };
        }
        
        showNotification('Монетизация включена!');
        
        // Обновляем интерфейс настроек
        if (currentChatId === chatId) {
            openChannelSettings(chatId);
        }
    } catch (error) {
        console.error('Ошибка включения монетизации:', error);
        showNotification('Ошибка при включении монетизации');
    }
}

// Обновление статистики монетизации в реальном времени
async function updateMonetizationStats(chatId) {
    const chat = chats.find(c => c.id === chatId);
    if (!chat || chat.type !== 'channel') return;
    
    const eligibility = await checkMonetizationEligibility(chatId);
    
    const subscribersSpan = document.getElementById('monetizationSubscribers');
    const postsSpan = document.getElementById('monetizationPosts');
    const subscribersProgress = document.getElementById('subscribersProgress');
    const postsProgress = document.getElementById('postsProgress');
    
    if (subscribersSpan) {
        subscribersSpan.textContent = eligibility.subscribers;
        const subPercent = Math.min(100, (eligibility.subscribers / 100) * 100);
        if (subscribersProgress) subscribersProgress.style.width = subPercent + '%';
    }
    
    if (postsSpan) {
        postsSpan.textContent = eligibility.posts;
        const postsPercent = Math.min(100, (eligibility.posts / 30) * 100);
        if (postsProgress) postsProgress.style.width = postsPercent + '%';
    }
}

// Функция для обновления earnings (вызывается при просмотре рекламы или действиях)
async function addChannelEarnings(chatId, amount) {
    const chat = chats.find(c => c.id === chatId);
    if (!chat || chat.type !== 'channel') return;
    
    if (!chat.monetization || !chat.monetization.enabled) return;
    
    try {
        const newEarnings = (chat.monetization.earnings || 0) + amount;
        await database.ref(`chats/${chatId}/monetization/earnings`).set(newEarnings);
        
        const chatIndex = chats.findIndex(c => c.id === chatId);
        if (chatIndex !== -1) {
            chats[chatIndex].monetization.earnings = newEarnings;
        }
        
        // Обновляем отображение если открыты настройки
        const earningsSpan = document.querySelector('.monetization-earnings span');
        if (earningsSpan) {
            earningsSpan.textContent = `Заработано: ${newEarnings} ₽`;
        }
    } catch (error) {
        console.error('Ошибка добавления earnings:', error);
    }
}

// Вывод средств
async function withdrawEarnings(chatId) {
    const chat = chats.find(c => c.id === chatId);
    if (!chat || chat.type !== 'channel') return;
    
    if (!chat.monetization || !chat.monetization.enabled) {
        showNotification('Монетизация не включена');
        return;
    }
    
    const earnings = chat.monetization.earnings || 0;
    if (earnings < 100) {
        showNotification('Минимальная сумма для вывода - 100 ₽');
        return;
    }
    
    // Здесь будет интеграция с платежной системой
    // Пока просто показываем уведомление
    showNotification(`Запрос на вывод ${earnings} ₽ отправлен. Средства будут зачислены в течение 3-5 рабочих дней.`);
    
    // Сбрасываем earnings после запроса на вывод
    try {
        await database.ref(`chats/${chatId}/monetization/earnings`).set(0);
        await database.ref(`chats/${chatId}/monetization/withdrawn`).set((chat.monetization.withdrawn || 0) + earnings);
        
        const chatIndex = chats.findIndex(c => c.id === chatId);
        if (chatIndex !== -1) {
            chats[chatIndex].monetization.earnings = 0;
            chats[chatIndex].monetization.withdrawn = (chat.monetization.withdrawn || 0) + earnings;
        }
    } catch (error) {
        console.error('Ошибка вывода средств:', error);
    }
}

async function updatePostCount(chatId) {
    const chat = chats.find(c => c.id === chatId);
    if (!chat || chat.type !== 'channel') return;
    
    const postCount = await countChannelPosts(chatId);
    await database.ref(`chats/${chatId}/postCount`).set(postCount);
    
    // Проверяем, не пора ли включить монетизацию
    if (!chat.monetization || !chat.monetization.enabled) {
        const eligibility = await checkMonetizationEligibility(chatId);
        if (eligibility.eligible && chat.createdBy === currentUser?.uid) {
            // Уведомляем создателя, что можно включить монетизацию
            showNotification('Поздравляем! Ваш канал соответствует требованиям для монетизации. Зайдите в настройки канала, чтобы включить.');
        }
    }
}

// ================================================
// ФУНКЦИИ ДЛЯ ЗАГРУЗКИ АВАТАРОК
// ================================================

// Сжатие и обрезка изображения в квадрат 1:1
async function resizeAndCropImage(file, size = 200) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                // Создаем canvas для обрезки
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Устанавливаем размеры (квадрат)
                canvas.width = size;
                canvas.height = size;
                
                // Вычисляем координаты для обрезки (центр изображения)
                const minSize = Math.min(img.width, img.height);
                const startX = (img.width - minSize) / 2;
                const startY = (img.height - minSize) / 2;
                
                // Рисуем обрезанное и масштабированное изображение
                ctx.drawImage(img, startX, startY, minSize, minSize, 0, 0, size, size);
                
                // Получаем base64
                const base64 = canvas.toDataURL('image/jpeg', 0.8);
                resolve(base64);
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Загрузка аватарки
async function uploadAvatar(file) {
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        showNotification('Пожалуйста, выберите изображение');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
        showNotification('Размер изображения не должен превышать 5MB');
        return;
    }
    
    try {
        showNotification('Обработка изображения...');
        
        const compressedAvatar = await resizeAndCropImage(file, 200);
        
        await database.ref(`users/${currentUser.uid}/avatar`).set(compressedAvatar);
        
        currentUser.avatar = compressedAvatar;
        
        // Обновляем allUsers
        if (allUsers[currentUser.uid]) {
            allUsers[currentUser.uid].avatar = compressedAvatar;
        }
        
        updateAllAvatars();
        
        // Обновляем профиль, если он открыт
        const profileModal = document.getElementById('profileModal');
        if (profileModal && profileModal.classList.contains('active')) {
            const profileAvatar = document.getElementById('profileAvatarLarge');
            if (profileAvatar) {
                profileAvatar.innerHTML = `<img src="${compressedAvatar}" alt="Avatar">`;
            }
        }
        
        updateChatsDisplay();
        updateContactsDisplay();
        
        showNotification('Аватар успешно обновлен!');
        
    } catch (error) {
        console.error('Ошибка загрузки аватара:', error);
        showNotification('Ошибка при загрузке аватара');
    }
}

// Обновление всех аватарок в интерфейсе
function updateAllAvatars() {
    if (!currentUser) return;
    
    const avatarUrl = currentUser?.avatar || null;
    const displayName = currentUser?.displayName || 'Пользователь';
    const verifiedBadge = getVerifiedBadge(currentUser?.uid);
    
    // 1. Обновляем аватар в модальном окне профиля (десктоп)
    const profileAvatarLarge = document.getElementById('profileAvatarLarge');
    if (profileAvatarLarge) {
        profileAvatarLarge.innerHTML = '';
        if (avatarUrl) {
            const img = document.createElement('img');
            img.src = avatarUrl;
            img.alt = 'Avatar';
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            img.style.borderRadius = 'inherit';
            profileAvatarLarge.appendChild(img);
        } else {
            profileAvatarLarge.textContent = displayName.charAt(0);
        }
    }
    
    // 2. Обновляем мобильный аватар
    const mobileProfileAvatar = document.getElementById('mobileProfileAvatar');
    if (mobileProfileAvatar) {
        mobileProfileAvatar.innerHTML = '';
        if (avatarUrl) {
            const img = document.createElement('img');
            img.src = avatarUrl;
            img.alt = 'Avatar';
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            img.style.borderRadius = 'inherit';
            mobileProfileAvatar.appendChild(img);
        } else {
            mobileProfileAvatar.textContent = displayName.charAt(0);
        }
    }
    
    // 3. Показываем/скрываем кнопки удаления
    const deleteAvatarBtn = document.getElementById('deleteAvatarBtn');
    if (deleteAvatarBtn) {
        deleteAvatarBtn.style.display = avatarUrl ? 'flex' : 'none';
    }
    
    const mobileDeleteAvatarBtn = document.getElementById('mobileDeleteAvatarBtn');
    if (mobileDeleteAvatarBtn) {
        mobileDeleteAvatarBtn.style.display = avatarUrl ? 'flex' : 'none';
    }
    
    // 4. Обновляем имена с галочками
    const profileName = document.getElementById('profileName');
    if (profileName) {
        profileName.innerHTML = `${escapeHtml(displayName)} ${verifiedBadge}`;
    }
    
    const mobileProfileName = document.getElementById('mobileProfileName');
    if (mobileProfileName) {
        mobileProfileName.innerHTML = `${escapeHtml(displayName)} ${verifiedBadge}`;
    }
    
    // 5. Обновляем десктопную боковую панель
    const desktopUserAvatar = document.getElementById('desktopUserAvatar');
    if (desktopUserAvatar) {
        desktopUserAvatar.style.backgroundImage = '';
        desktopUserAvatar.textContent = '';
        if (avatarUrl) {
            desktopUserAvatar.style.backgroundImage = `url(${avatarUrl})`;
            desktopUserAvatar.style.backgroundSize = 'cover';
            desktopUserAvatar.style.backgroundPosition = 'center';
            desktopUserAvatar.style.backgroundColor = 'transparent';
        } else {
            desktopUserAvatar.textContent = displayName.charAt(0);
        }
    }
    
    // 6. Обновляем имя в десктопной панели
    const desktopUserName = document.getElementById('desktopUserName');
    if (desktopUserName) {
        desktopUserName.textContent = displayName;
    }
    
    // 7. Обновляем статус
    const desktopUserStatus = document.getElementById('desktopUserStatus');
    if (desktopUserStatus) {
        let statusIcon = 'fa-circle';
        let statusColor = '#10b981';
        let statusText = 'online';
        
        switch(currentUser.status) {
            case 'online': statusIcon = 'fa-circle'; statusColor = '#10b981'; statusText = 'online'; break;
            case 'away': statusIcon = 'fa-clock'; statusColor = '#f59e0b'; statusText = 'away'; break;
            case 'dnd': statusIcon = 'fa-minus-circle'; statusColor = '#ef4444'; statusText = 'не беспокоить'; break;
            case 'invisible': statusIcon = 'fa-eye-slash'; statusColor = '#64748b'; statusText = 'невидимка'; break;
            default: statusIcon = 'fa-circle'; statusColor = '#64748b'; statusText = 'offline';
        }
        
        desktopUserStatus.innerHTML = `<i class="fas ${statusIcon}" style="color: ${statusColor};"></i><span>${statusText}</span>`;
    }
    
    const mobileProfileStatus = document.getElementById('mobileProfileStatus');
    if (mobileProfileStatus) {
        let statusIcon = 'fa-circle';
        let statusColor = '#10b981';
        let statusText = 'online';
        
        switch(currentUser.status) {
            case 'online': statusIcon = 'fa-circle'; statusColor = '#10b981'; statusText = 'online'; break;
            case 'away': statusIcon = 'fa-clock'; statusColor = '#f59e0b'; statusText = 'away'; break;
            case 'dnd': statusIcon = 'fa-minus-circle'; statusColor = '#ef4444'; statusText = 'не беспокоить'; break;
            case 'invisible': statusIcon = 'fa-eye-slash'; statusColor = '#64748b'; statusText = 'невидимка'; break;
            default: statusIcon = 'fa-circle'; statusColor = '#64748b'; statusText = 'offline';
        }
        
        mobileProfileStatus.innerHTML = `<i class="fas ${statusIcon}" style="color: ${statusColor};"></i> ${statusText}`;
    }
    
    // 8. Обновляем списки
    updateChatsDisplay();
    updateContactsDisplay();
}

// Инициализация загрузчика аватара
function setupAvatarUpload() {
    // ========== ДЕСКТОПНАЯ ВЕРСИЯ ==========
    const changeAvatarBtn = document.getElementById('changeAvatarBtn');
    const deleteAvatarBtn = document.getElementById('deleteAvatarBtn');
    const avatarUpload = document.getElementById('avatarUpload');
    
    // Кнопка удаления аватара (десктоп)
    if (deleteAvatarBtn) {
        if (currentUser && currentUser.avatar) {
            deleteAvatarBtn.style.display = 'flex';
        } else {
            deleteAvatarBtn.style.display = 'none';
        }
        
        const newDeleteBtn = deleteAvatarBtn.cloneNode(true);
        deleteAvatarBtn.parentNode.replaceChild(newDeleteBtn, deleteAvatarBtn);
        
        newDeleteBtn.onclick = async (e) => {
            e.preventDefault();
            e.stopPropagation();
            await deleteAvatar();
        };
    }
    
    // Кнопка смены аватара (десктоп)
    if (changeAvatarBtn && avatarUpload) {
        const newBtn = changeAvatarBtn.cloneNode(true);
        changeAvatarBtn.parentNode.replaceChild(newBtn, changeAvatarBtn);
        
        newBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            avatarUpload.value = '';
            avatarUpload.click();
        };
        
        avatarUpload.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            await uploadAvatar(file);
            avatarUpload.value = '';
        };
    }
    
    // ========== МОБИЛЬНАЯ ВЕРСИЯ ==========
    const mobileChangeAvatarBtn = document.getElementById('mobileChangeAvatarBtn');
    const mobileDeleteAvatarBtn = document.getElementById('mobileDeleteAvatarBtn');
    const mobileAvatarUpload = document.getElementById('mobileAvatarUpload');
    
    // Кнопка удаления аватара (мобильная)
    if (mobileDeleteAvatarBtn) {
        if (currentUser && currentUser.avatar) {
            mobileDeleteAvatarBtn.style.display = 'flex';
        } else {
            mobileDeleteAvatarBtn.style.display = 'none';
        }
        
        const newMobileDeleteBtn = mobileDeleteAvatarBtn.cloneNode(true);
        mobileDeleteAvatarBtn.parentNode.replaceChild(newMobileDeleteBtn, mobileDeleteAvatarBtn);
        
        newMobileDeleteBtn.onclick = async (e) => {
            e.preventDefault();
            e.stopPropagation();
            await deleteAvatar();
        };
    }
    
    // Кнопка смены аватара (мобильная)
    if (mobileChangeAvatarBtn && mobileAvatarUpload) {
        const newMobileBtn = mobileChangeAvatarBtn.cloneNode(true);
        mobileChangeAvatarBtn.parentNode.replaceChild(newMobileBtn, mobileChangeAvatarBtn);
        
        newMobileBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            mobileAvatarUpload.value = '';
            mobileAvatarUpload.click();
        };
        
        mobileAvatarUpload.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            await uploadAvatar(file);
            mobileAvatarUpload.value = '';
        };
    }
}

// Загрузка аватара при загрузке пользователя
function loadUserAvatar(userId) {
    if (!userId) return;
    
    database.ref(`users/${userId}/avatar`).once('value').then(snapshot => {
        const avatar = snapshot.val();
        if (avatar && currentUser && currentUser.uid === userId) {
            currentUser.avatar = avatar;
            updateAllAvatars();
        }
    });
}
