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

// ================================================
// КОНФИГУРАЦИЯ ПАКОВ СТИКЕРОВ
// ================================================
let currentStickerPack = null;
let stickerPacks = {
    // Пример пака стикеров - ЗАМЕНИТЕ НА ВАШИ
    pack1: {
        id: "pack1",
        name: "Boss",
        previewImage: "img/stickers/Boss/sticker7.png", // Картинка-заставка пака
        stickers: [
            { url: "img/stickers/Boss/sticker1.png", name: "Sticker 1" },
            { url: "img/stickers/Boss/sticker2.png", name: "Sticker 2" },
            { url: "img/stickers/Boss/sticker3.png", name: "Sticker 3" },
            { url: "img/stickers/Boss/sticker4.png", name: "Sticker 4" },
            { url: "img/stickers/Boss/sticker5.png", name: "Sticker 5" },
            { url: "img/stickers/Boss/sticker6.png", name: "Sticker 6" },
            { url: "img/stickers/Boss/sticker7.png", name: "Sticker 7" },
            { url: "img/stickers/Boss/sticker8.png", name: "Sticker 8" },
            { url: "img/stickers/Boss/sticker9.png", name: "Sticker 9" }
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
            { url: "img/stickers/Marvel/Venom.png", name: "Vemon" }
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
const quickLoginBtn = document.getElementById('quickLoginBtn');
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
const desktopEmptyCreateChatBtn = document.getElementById('desktopEmptyCreateChatBtn');
const desktopEmptyAddContactBtn = document.getElementById('desktopEmptyAddContactBtn');
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
const notificationsSwitch = document.getElementById('notificationsSwitch');
const themeSwitch = document.getElementById('themeSwitch');

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

const confirmLeaveChatModal = document.getElementById('confirmLeaveChatModal');
const cancelLeaveBtn = document.getElementById('cancelLeaveBtn');
const confirmLeaveBtn = document.getElementById('confirmLeaveBtn');
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
const homeContactsSearch = document.getElementById('homeContactsSearch');
const homeContactsSearchResults = document.getElementById('homeContactsSearchResults');
const homeTabs = document.querySelectorAll('.home-tab');
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

// Групповые модальные окна
const addMembersModal = document.getElementById('addMembersModal');
const closeAddMembersModal = document.getElementById('closeAddMembersModal');
const cancelAddMembersBtn = document.getElementById('cancelAddMembersBtn');
const confirmAddMembersBtn = document.getElementById('confirmAddMembersBtn');
const membersSearch = document.getElementById('membersSearch');
const contactsSelectList = document.getElementById('contactsSelectList');

const inviteLinkModal = document.getElementById('inviteLinkModal');
const closeInviteLinkModal = document.getElementById('closeInviteLinkModal');
const closeInviteModalBtn = document.getElementById('closeInviteModalBtn');
const inviteLinkInput = document.getElementById('inviteLinkInput');
const copyInviteLinkBtn = document.getElementById('copyInviteLinkBtn');

// ================================================
// ИНИЦИАЛИЗАЦИЯ
// ================================================
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupInactivityTracking();
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
    
    authUnsubscribe = auth.onAuthStateChanged(async (user) => {
        if (user) {
            await loadUserData(user.uid);
            resetToOnlineStatus();
            if (authContainer) authContainer.style.display = 'none';
            if (mainContainer) mainContainer.style.display = 'flex';
            showNotification("Добро пожаловать в Spectrum!");
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
// ОТСЛЕЖИВАНИЕ НЕАКТИВНОСТИ
// ================================================
function setupInactivityTracking() {
    // Отслеживаем активность пользователя
    const events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
        document.addEventListener(event, () => {
            lastActivityTime = Date.now();
            if (currentUser && (currentUser.status === 'offline' || currentUser.status === 'invisible') && navigator.onLine) {
                const savedStatus = localStorage.getItem('userSelectedStatus') || 'online';
                if (savedStatus !== 'offline' && savedStatus !== 'invisible') {
                    setUserStatus(savedStatus);
                }
            }
        });
    });
    
    // Отслеживаем видимость страницы
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            if (currentUser && currentUser.status === 'online') {
                setUserStatus('away');
            }
        } else {
            if (currentUser && (currentUser.status === 'away' || currentUser.status === 'offline')) {
                const savedStatus = localStorage.getItem('userSelectedStatus') || 'online';
                if (savedStatus !== 'offline' && savedStatus !== 'invisible') {
                    setUserStatus(savedStatus);
                }
            }
            lastActivityTime = Date.now();
        }
    });
    
    window.addEventListener('online', () => {
        if (currentUser) {
            const savedStatus = localStorage.getItem('userSelectedStatus') || 'online';
            if (savedStatus !== 'offline' && savedStatus !== 'invisible') {
                setUserStatus(savedStatus);
            }
            showNotification("Соединение восстановлено");
        }
    });
    
    window.addEventListener('offline', () => {
        if (currentUser) {
            setUserStatus('offline');
            showNotification("Потеряно соединение");
        }
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
            } 
            else if (inactiveTime > 300000 && (currentUser.status === 'online' || currentUser.status === 'away') && savedStatus === 'online') {
                await setUserStatus('offline');
            }
            else if (inactiveTime < 30000 && currentUser.status === 'away' && savedStatus === 'online') {
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
        
        console.log(`Статус изменён на: ${status}`);
    } catch (error) {
        console.error("Ошибка обновления статуса:", error);
    }
}

function startHeartbeat() {
    setInterval(async () => {
        if (currentUser && navigator.onLine && !document.hidden) {
            try {
                await database.ref(`users/${currentUser.uid}`).update({
                    lastActive: Date.now()
                });
            } catch(e) {}
        }
    }, 30000);
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
    
    if (closeAttachTypeModalBtn) {
        closeAttachTypeModalBtn.onclick = () => closeAttachTypeModal();
    }
    
    if (attachPhotoOptionBtn) {
        attachPhotoOptionBtn.onclick = () => {
            closeAttachTypeModal();
            triggerPhotoUpload();
        };
    }
    
    if (attachFileOptionBtn) {
        attachFileOptionBtn.onclick = () => {
            closeAttachTypeModal();
            triggerFileUpload();
        };
    }
    
    if (attachTypeModal) {
        attachTypeModal.onclick = (e) => {
            if (e.target === attachTypeModal) closeAttachTypeModal();
        };
    }
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
        const MAX_SIZE = 20 * 1024 * 1024;
        if (file.size > MAX_SIZE) { 
            showNotification('❌ Файл слишком большой. Максимум: 20MB'); 
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
        const MAX_SIZE = 20 * 1024 * 1024;
        if (file.size > MAX_SIZE) { 
            showNotification('❌ Файл слишком большой. Максимум: 20MB'); 
            fileInput.remove(); 
            return; 
        }
        showFilePreview(file);
        fileInput.remove();
    };
    fileInput.click();
}

function setupPhotoUpload() {
    if (photoPreviewRemove) {
        photoPreviewRemove.onclick = () => clearPhotoPreview();
    }
    
    if (closePhotoModal) {
        closePhotoModal.onclick = () => { 
            if (photoViewModal) photoViewModal.classList.remove('active'); 
            if (fullSizePhoto) fullSizePhoto.src = ''; 
        };
    }
    
    if (photoViewModal) {
        photoViewModal.onclick = (e) => { 
            if (e.target === photoViewModal) { 
                photoViewModal.classList.remove('active'); 
                fullSizePhoto.src = ''; 
            } 
        };
    }
}

function showPhotoPreview(file) {
    selectedPhoto = file;
    const reader = new FileReader();
    reader.onload = (e) => { if (photoPreview) photoPreview.src = e.target.result; };
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
            if (width > maxWidth) { height *= maxWidth / width; width = maxWidth; }
            if (height > maxHeight) { width *= maxHeight / height; height = maxHeight; }
            const canvas = document.createElement('canvas');
            canvas.width = width; canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
    });
}

function getFileIcon(fileName) {
    const ext = fileName.split('.').pop().toLowerCase();
    const icons = { 
        'pdf': 'fa-file-pdf', 'doc': 'fa-file-word', 'docx': 'fa-file-word', 
        'xls': 'fa-file-excel', 'xlsx': 'fa-file-excel', 'ppt': 'fa-file-powerpoint', 
        'pptx': 'fa-file-powerpoint', 'jpg': 'fa-file-image', 'jpeg': 'fa-file-image', 
        'png': 'fa-file-image', 'gif': 'fa-file-image', 'mp3': 'fa-file-audio', 
        'mp4': 'fa-file-video', 'zip': 'fa-file-archive', 'rar': 'fa-file-archive', 
        'txt': 'fa-file-alt' 
    };
    return icons[ext] || 'fa-file';
}

// ================================================
// ФУНКЦИИ ДЛЯ СТИКЕРОВ (с поддержкой .tgs)
// ================================================
function setupStickers() {
    if (stickerBtn) {
        stickerBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            openStickersModal();
        };
    }
    
    if (closeStickersModal) {
        closeStickersModal.onclick = () => closeStickersModalFunc();
    }
    
    if (stickersModal) {
        stickersModal.onclick = (e) => {
            if (e.target === stickersModal) {
                closeStickersModalFunc();
            }
        };
    }
    
    if (backToPacksBtn) {
        backToPacksBtn.onclick = () => {
            showStickerPacks();
        };
    }
    
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
        stickersPacks.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #94a3b8;">
                <i class="fas fa-smile-wink" style="font-size: 48px; margin-bottom: 15px; display: block;"></i>
                <p>Паки стикеров пока не добавлены</p>
                <p style="font-size: 12px; margin-top: 10px;">Добавьте паки в конфигурацию stickerPacks</p>
            </div>
        `;
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
            <div class="sticker-pack-preview">
                ${previewHtml}
            </div>
            <div class="sticker-pack-name">${escapeHtml(pack.name)}</div>
            <div class="sticker-pack-count">${pack.stickers.length} стикеров</div>
        `;
        
        packDiv.onclick = () => {
            openStickerPack(pack.id);
        };
        
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
        
        pack.stickers.forEach((sticker, index) => {
            const stickerDiv = document.createElement('div');
            stickerDiv.className = 'sticker-item';
            stickerDiv.setAttribute('data-sticker', sticker.url);
            stickerDiv.title = sticker.name;
            
            if (sticker.url.endsWith('.tgs')) {
                // Для .tgs создаем контейнер с уникальным ID
                const tgsId = 'tgs_preview_' + packId + '_' + index;
                stickerDiv.innerHTML = `<div id="${tgsId}" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;"></div>`;
                stickerDiv.style.aspectRatio = '1/1';
                stickerDiv.style.padding = '10px';
                
                // Загружаем анимацию после добавления в DOM
                setTimeout(() => {
                    const container = document.getElementById(tgsId);
                    if (container && typeof lottie !== 'undefined') {
                        fetch(sticker.url)
                            .then(response => response.blob())
                            .then(async blob => {
                                try {
                                    const arrayBuffer = await blob.arrayBuffer();
                                    const uint8Array = new Uint8Array(arrayBuffer);
                                    let animationData;
                                    try {
                                        const decompressed = pako.unsafeInflate(uint8Array);
                                        const jsonString = new TextDecoder().decode(decompressed);
                                        animationData = JSON.parse(jsonString);
                                    } catch (e) {
                                        const jsonString = new TextDecoder().decode(uint8Array);
                                        animationData = JSON.parse(jsonString);
                                    }
                                    
                                    container.innerHTML = '';
                                    lottie.loadAnimation({
                                        container: container,
                                        renderer: 'svg',
                                        loop: true,
                                        autoplay: true,
                                        animationData: animationData
                                    });
                                } catch (err) {
                                    container.innerHTML = '<i class="fas fa-film" style="font-size: 32px; color: #8b5cf6;"></i>';
                                }
                            })
                            .catch(() => {
                                container.innerHTML = '<i class="fas fa-exclamation-triangle" style="font-size: 24px; color: #ef4444;"></i>';
                            });
                    }
                }, 50);
            } else {
                const img = document.createElement('img');
                img.src = sticker.url;
                img.alt = sticker.name;
                img.onerror = () => {
                    img.src = 'https://placehold.co/100x100/8b5cf6/white?text=❓';
                };
                stickerDiv.appendChild(img);
            }
            
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

async function sendSticker(stickerUrl) {
    if (!currentChatId || !stickerUrl) return;
    
    try {
        const wasNearBottom = isUserNearBottom();
        
        // Определяем тип стикера
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
        
        if (replyToMessage && replyToMessage.id) {
            try {
                const replyRef = database.ref(`messages/${currentChatId}/${replyToMessage.id}`);
                const snapshot = await replyRef.once('value');
                if (snapshot.exists()) {
                    const replyData = snapshot.val();
                    stickerMessage.replyTo = {
                        id: replyToMessage.id,
                        text: replyData.text || replyToMessage.text,
                        senderId: replyData.senderId || replyToMessage.senderId,
                        senderName: replyData.senderName || replyToMessage.senderName
                    };
                }
            } catch(e) {}
        }
        
        const messagesRef = database.ref(`messages/${currentChatId}`);
        await messagesRef.push(stickerMessage);
        
        const chatRef = database.ref(`chats/${currentChatId}`);
        await chatRef.update({
            lastMessage: {
                text: isTGS ? '🎬 Анимированный стикер' : '🖼️ Стикер',
                timestamp: Date.now(),
                senderId: currentUser.uid,
                type: 'sticker'
            },
            updatedAt: Date.now()
        });
        
        hideReplyPreview();
        replyToMessage = null;
        
        if (wasNearBottom) {
            setTimeout(() => scrollToLastMessage('smooth'), 100);
        } else {
            showScrollToBottomButton();
        }
        
        closeStickersModalFunc();
        
    } catch (error) {
        console.error("Ошибка при отправке стикера:", error);
        showNotification("Не удалось отправить стикер");
    }
}

// ================================================
// АВТОРИЗАЦИЯ
// ================================================
async function loginUser() {
    const email = loginEmail.value.trim();
    const password = loginPassword.value.trim();
    if (!email || !password) { showError("Пожалуйста, заполните все поля"); return; }
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

async function quickLogin() {
    try { 
        setLoading(true); 
        hideError(); 
        await auth.signInAnonymously(); 
        showSuccess(); 
        localStorage.setItem('userStatus', 'online');
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
    if (!name || !email || !password || !confirmPassword) { showError("Пожалуйста, заполните все поля"); return; }
    if (password.length < 6) { showError("Пароль должен содержать минимум 6 символов"); return; }
    if (password !== confirmPassword) { showError("Пароли не совпадают"); return; }
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
        if (quickLoginBtn) quickLoginBtn.disabled = true; 
    } else { 
        authLoading.classList.remove('active'); 
        if (loginBtn) loginBtn.disabled = false; 
        if (registerBtn) registerBtn.disabled = false; 
        if (quickLoginBtn) quickLoginBtn.disabled = false; 
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
            currentUser = { uid: userId, ...snapshot.val() };
            
            let savedStatus = localStorage.getItem('userStatus');
            if (!savedStatus) {
                savedStatus = 'online';
                localStorage.setItem('userStatus', savedStatus);
            }
            
            if (savedStatus !== currentUser.status) {
                await userRef.update({ status: savedStatus, lastActive: Date.now() });
                currentUser.status = savedStatus;
                currentUser.selectedStatus = savedStatus;
            } else {
                await userRef.update({ lastActive: Date.now() });
                currentUser.selectedStatus = currentUser.status;
            }
            
            await loadAllUsers();
            setupVerifiedUsersListener();
            const contactsSnapshot = await database.ref(`users/${userId}/contacts`).once('value');
            updateContactsList(contactsSnapshot);
            const chatsSnapshot = await database.ref('chats').orderByChild(`members/${userId}`).equalTo(true).once('value');
            updateChatsList(chatsSnapshot);
            setupContactsListener();
            setupChatsListener();
        } else {
            const user = auth.currentUser;
            const defaultStatus = 'online';
            localStorage.setItem('userStatus', defaultStatus);
            
            currentUser = { 
                uid: userId, 
                displayName: user.displayName || "Пользователь", 
                email: user.email, 
                status: defaultStatus,
                selectedStatus: defaultStatus,
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
        showNotification("Ошибка загрузки данных"); 
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
    } catch (error) { console.error("Ошибка загрузки пользователей:", error); }
}

function setupVerifiedUsersListener() {
    if (!currentUser) return;
    const verifiedRef = database.ref('verifiedUsers');
    if (verifiedUsersListener) verifiedRef.off('value', verifiedUsersListener);
    
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
    if (adminPanelBtn) {
        adminPanelBtn.style.display = (currentUser && verifiedUsers && verifiedUsers[currentUser.uid] && verifiedUsers[currentUser.uid].type === 'admin') ? 'flex' : 'none';
    }
}

function getVerifiedBadge(userId) {
    if (!userId || !verifiedUsers || !verifiedUsers[userId]) return '';
    const type = verifiedUsers[userId].type;
    const icons = { 
        'admin': 'fa-check-circle verified-icon admin', 
        'premium': 'fa-star verified-icon premium', 
        'partner': 'fa-handshake verified-icon partner', 
        'celebrity': 'fa-crown verified-icon celebrity' 
    };
    return `<span class="verified-badge"><i class="fas ${icons[type] || 'fa-check-circle verified-icon default'}"></i></span>`;
}

function cleanupListeners() {
    if (contactsListener && currentUser) {
        database.ref(`users/${currentUser.uid}/contacts`).off('value', contactsListener);
        contactsListener = null;
    }
    if (chatsListener) {
        database.ref('chats').off('value', chatsListener);
        chatsListener = null;
    }
    Object.values(messageListeners).forEach(fn => { 
        if (typeof fn === 'function') fn(); 
    });
    messageListeners = {};
}

function setupContactsListener() {
    if (!currentUser) return;
    const contactsRef = database.ref(`users/${currentUser.uid}/contacts`);
    if (contactsListener) contactsRef.off('value', contactsListener);
    
    contactsListener = contactsRef.on('value', (snapshot) => { 
        updateContactsList(snapshot); 
        updateContactsDisplay(); 
    });
}

function setupChatsListener() {
    if (!currentUser) return;
    const chatsRef = database.ref('chats');
    if (chatsListener) chatsRef.off('value', chatsListener);
    
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
            userId, 
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
            if (!messageListeners[chatId]) setupChatListener(chatId); 
            chats.push(chat); 
        });
        chats.sort((a, b) => (b.lastMessage?.timestamp || b.createdAt) - (a.lastMessage?.timestamp || a.createdAt));
    }
}

function setupChatListener(chatId) { 
    if (messageListeners[chatId]) messageListeners[chatId](); 
    messageListeners[chatId] = database.ref(`messages/${chatId}`).orderByChild('timestamp').limitToLast(1).on('value', () => updateChatsDisplay()); 
}

function updateChatsDisplay() { 
    updateHomeChats(); 
    updateDesktopChats(); 
    updateMobileChats(); 
    if (profileChatsCount) profileChatsCount.textContent = chats.length; 
}

function updateContactsDisplay() { 
    updateHomeContacts(); 
    updateDesktopContacts(); 
    updateMobileContacts(); 
    if (profileContactsCount) profileContactsCount.textContent = contacts.length; 
    updateMobileProfile(); 
}

// ================================================
// ПОИСК ПОЛЬЗОВАТЕЛЕЙ
// ================================================
function searchUsers(query, currentContacts = []) {
    query = query.toLowerCase().trim();
    if (!query) return [];
    const results = [];
    
    for (const userId in allUsers) {
        if (userId === currentUser?.uid) continue;
        const user = allUsers[userId];
        if (user.displayName?.toLowerCase().includes(query) || user.customId?.toLowerCase().includes(query) || userId.toLowerCase().includes(query)) {
            results.push({ 
                userId, 
                displayName: user.displayName, 
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
        return a.displayName.localeCompare(b.displayName); 
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
        switch(statusText) {
            case 'online': statusClass = 'online'; statusText = 'online'; break;
            case 'away': statusClass = 'away'; statusText = 'away'; break;
            case 'dnd': statusClass = 'dnd'; statusText = 'dnd'; break;
            default: statusClass = 'offline'; statusText = 'offline';
        }
        
        div.innerHTML = `<div class="search-result-avatar">${escapeHtml(result.displayName.charAt(0))}</div>
            <div class="search-result-info">
                <div class="search-result-name">${escapeHtml(result.displayName)} ${getVerifiedBadge(result.userId)}</div>
                <div class="search-result-id">${result.customId}</div>
                <div class="search-result-status ${statusClass}">${statusText}</div>
            </div>
            <button class="add-user-btn" ${result.isContact ? 'disabled' : ''}>${result.isContact ? 'В контактах ✓' : 'Добавить'}</button>`;
        
        const btn = div.querySelector('.add-user-btn');
        if (!result.isContact) {
            btn.onclick = async (e) => { 
                e.stopPropagation(); 
                await addContact(result.customId); 
                displaySearchResults(searchUsers(contactSearch?.value || '', currentContacts), containerId, currentContacts); 
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

function escapeHtml(text) { 
    if (!text) return ''; 
    const div = document.createElement('div'); 
    div.textContent = text; 
    return div.innerHTML; 
}

// ================================================
// ОТПРАВКА СООБЩЕНИЙ
// ================================================
async function sendMessage() {
    if (selectedPhoto) { await sendPhoto(); return; }
    if (selectedFile) { await sendFile(); return; }
    const text = messageInput?.value.trim();
    if (!text || !currentChatId) return;
    
    try {
        const wasNearBottom = isUserNearBottom();
        const newMessage = { 
            text, 
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
                    const d = snapshot.val(); 
                    newMessage.replyTo = { 
                        id: replyToMessage.id, 
                        text: d.text || replyToMessage.text, 
                        senderId: d.senderId || replyToMessage.senderId, 
                        senderName: d.senderName || replyToMessage.senderName 
                    }; 
                } 
            } catch(e) { 
                newMessage.replyTo = { 
                    id: replyToMessage.id, 
                    text: replyToMessage.text, 
                    senderId: replyToMessage.senderId || "unknown", 
                    senderName: replyToMessage.senderName || "Пользователь" 
                }; 
            }
        }
        
        if (messageInput) messageInput.value = '';
        hideReplyPreview();
        replyToMessage = null;
        if (isMobile && messageInput) messageInput.blur();
        
        await database.ref(`messages/${currentChatId}`).push(newMessage);
        await database.ref(`chats/${currentChatId}`).update({ 
            lastMessage: { 
                text: text.length > 50 ? text.substring(0, 50) + '...' : text, 
                timestamp: Date.now(), 
                senderId: currentUser.uid, 
                type: "text" 
            }, 
            updatedAt: Date.now() 
        });
        
        if (wasNearBottom) setTimeout(() => scrollToLastMessage('smooth'), 100); 
        else showScrollToBottomButton();
    } catch (error) { 
        console.error(error); 
        showNotification("Не удалось отправить сообщение"); 
    }
}

async function sendPhoto() {
    if (!selectedPhoto || !currentChatId) return;
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
        
        if (replyToMessage && replyToMessage.id) { 
            try { 
                const r = await database.ref(`messages/${currentChatId}/${replyToMessage.id}`).once('value'); 
                if (r.exists()) msg.replyTo = { 
                    id: replyToMessage.id, 
                    text: r.val().text || replyToMessage.text, 
                    senderId: r.val().senderId || replyToMessage.senderId, 
                    senderName: r.val().senderName || replyToMessage.senderName 
                }; 
            } catch(e) {} 
        }
        
        await database.ref(`messages/${currentChatId}`).push(msg);
        showPhotoProgress(100);
        await database.ref(`chats/${currentChatId}`).update({ 
            lastMessage: { text: '📸 Фото', timestamp: Date.now(), senderId: currentUser.uid, type: 'photo' }, 
            updatedAt: Date.now() 
        });
        
        clearPhotoPreview(); 
        hideReplyPreview(); 
        replyToMessage = null;
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
        
        if (replyToMessage && replyToMessage.id) { 
            try { 
                const r = await database.ref(`messages/${currentChatId}/${replyToMessage.id}`).once('value'); 
                if (r.exists()) msg.replyTo = { 
                    id: replyToMessage.id, 
                    text: r.val().text || replyToMessage.text, 
                    senderId: r.val().senderId || replyToMessage.senderId, 
                    senderName: r.val().senderName || replyToMessage.senderName 
                }; 
            } catch(e) {} 
        }
        
        await database.ref(`messages/${currentChatId}`).push(msg);
        await database.ref(`chats/${currentChatId}`).update({ 
            lastMessage: { text: `📎 Файл: ${selectedFile.name}`, timestamp: Date.now(), senderId: currentUser.uid, type: 'file' }, 
            updatedAt: Date.now() 
        });
        
        clearFilePreview(); 
        hideReplyPreview(); 
        replyToMessage = null;
        if (wasNearBottom) setTimeout(() => scrollToLastMessage('smooth'), 100); 
        else showScrollToBottomButton();
        setTimeout(hideFileProgress, 1000);
    } catch (error) { 
        console.error(error); 
        hideFileProgress(); 
        showNotification("Не удалось отправить файл"); 
    }
}

// ================================================
// РЕАКЦИИ
// ================================================
async function toggleReaction(messageId, emoji) {
    if (!currentChatId || !messageId || !emoji || !currentUser) return;
    try {
        const reactionId = `${currentUser.uid}_${emoji}`;
        const ref = database.ref(`messages/${currentChatId}/${messageId}/reactions/${reactionId}`);
        const snap = await ref.once('value');
        if (snap.exists()) await ref.remove();
        else await ref.set({ emoji, userId: currentUser.uid, timestamp: Date.now(), userName: currentUser.displayName || "Пользователь" });
    } catch (error) { 
        console.error(error); 
        showNotification("Не удалось добавить реакцию"); 
    }
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

// ================================================
// СОЗДАНИЕ ЭЛЕМЕНТОВ СООБЩЕНИЙ (с поддержкой .tgs)
// ================================================
function createMessageElement(message) {
    const isOutgoing = message.senderId === currentUser?.uid;
    const div = document.createElement('div');
    
    const isSticker = message.type === 'sticker';
    div.className = `message ${isOutgoing ? 'outgoing' : 'incoming'} ${isMobile ? 'mobile' : 'desktop'} ${isSticker ? 'sticker-message' : ''}`;
    div.dataset.messageId = message.id;
    
    const time = new Date(message.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    let senderName = message.senderName || "Пользователь";
    if (allUsers[message.senderId]) senderName = allUsers[message.senderId].displayName;
    let replyHtml = '';
    
    if (message.replyTo) {
        let repliedName = message.replyTo.senderName || "Пользователь";
        if (message.replyTo.senderId && allUsers[message.replyTo.senderId]) repliedName = allUsers[message.replyTo.senderId].displayName;
        replyHtml = `<div class="message-reply" data-reply-to="${message.replyTo.id}">
            <div class="reply-sender"><i class="fas fa-reply"></i> ${escapeHtml(repliedName)}</div>
            <div class="reply-text">${escapeHtml(message.replyTo.text || 'Сообщение удалено')}</div>
        </div>`;
    }
    
    let photoHtml = '', fileHtml = '', stickerHtml = '';
    
    if (message.type === 'photo' && message.photo) {
        photoHtml = `<img src="${message.photo}" class="message-photo" alt="Photo" onclick="window.showFullPhoto && showFullPhoto('${message.photo}')">`;
    }
    
    if (message.type === 'file' && message.fileData) {
        const icon = getFileIcon(message.fileName);
        const size = (message.fileSize / 1024).toFixed(1);
        fileHtml = `<div class="message-file" onclick="downloadFile('${message.fileData}', '${message.fileName}')">
            <i class="fas ${icon}"></i>
            <div class="message-file-info">
                <div class="message-file-name">${escapeHtml(message.fileName)}</div>
                <div class="message-file-size">${size} KB</div>
            </div>
            <i class="fas fa-download"></i>
        </div>`;
    }
    
    // Обработка стикеров (включая .tgs)
    if (message.type === 'sticker' && message.stickerUrl) {
        if (message.stickerUrl.endsWith('.tgs') || message.isTGS) {
            // Для .tgs создаем контейнер с уникальным ID
            const stickerId = 'tgs_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
            stickerHtml = `<div id="${stickerId}" class="tgs-sticker-container" style="width:180px;height:180px;cursor:pointer;"></div>`;
            
            // Откладываем загрузку анимации до добавления в DOM
            setTimeout(() => {
                const container = document.getElementById(stickerId);
                if (container && typeof lottie !== 'undefined') {
                    fetch(message.stickerUrl)
                        .then(response => response.blob())
                        .then(async blob => {
                            try {
                                const arrayBuffer = await blob.arrayBuffer();
                                const uint8Array = new Uint8Array(arrayBuffer);
                                // Пробуем распаковать как gzip
                                let animationData;
                                try {
                                    const decompressed = pako.unsafeInflate(uint8Array);
                                    const jsonString = new TextDecoder().decode(decompressed);
                                    animationData = JSON.parse(jsonString);
                                } catch (e) {
                                    // Если не распаковалось, возможно это уже JSON
                                    const jsonString = new TextDecoder().decode(uint8Array);
                                    animationData = JSON.parse(jsonString);
                                }
                                
                                container.innerHTML = '';
                                lottie.loadAnimation({
                                    container: container,
                                    renderer: 'svg',
                                    loop: true,
                                    autoplay: true,
                                    animationData: animationData
                                });
                            } catch (err) {
                                console.error('TGS load error:', err);
                                container.innerHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:rgba(139,92,246,0.2);border-radius:20px;"><i class="fas fa-film" style="font-size: 48px; color: #8b5cf6;"></i></div>';
                            }
                        })
                        .catch(() => {
                            container.innerHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:rgba(239,68,68,0.2);border-radius:20px;"><i class="fas fa-exclamation-triangle" style="font-size: 32px; color: #ef4444;"></i></div>';
                        });
                } else if (container) {
                    container.innerHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:rgba(139,92,246,0.2);border-radius:20px;"><i class="fas fa-spinner fa-spin" style="font-size: 32px; color: #8b5cf6;"></i></div>';
                }
            }, 50);
        } else {
            stickerHtml = `<img src="${message.stickerUrl}" class="message-sticker" alt="Sticker" onclick="window.showFullPhoto && showFullPhoto('${message.stickerUrl}')">`;
        }
    }
    
    if (isSticker) {
        div.innerHTML = `<div class="message-avatar">${escapeHtml(senderName.charAt(0))}</div>
            <div class="message-content">
                <div class="message-sender">
                    <span class="message-sender-name" onclick="openUserProfileModal('${message.senderId}')">${escapeHtml(senderName)} ${getVerifiedBadge(message.senderId)}</span>
                    <span class="message-time">${time}</span>
                </div>
                ${replyHtml}
                <div class="sticker-wrapper">${stickerHtml}</div>
            </div>`;
    } else {
        div.innerHTML = `<div class="message-avatar">${escapeHtml(senderName.charAt(0))}</div>
            <div class="message-content">
                <div class="message-sender">
                    <span class="message-sender-name" onclick="openUserProfileModal('${message.senderId}')">${escapeHtml(senderName)} ${getVerifiedBadge(message.senderId)}</span>
                    <span class="message-time">${time}</span>
                </div>
                ${replyHtml}
                ${photoHtml}
                ${fileHtml}
                ${message.type !== 'photo' && message.type !== 'file' && message.type !== 'sticker' ? `<div class="message-text">${escapeHtml(message.text)}</div>` : ''}
            </div>`;
    }
    
    // Добавляем обработчик контекстного меню
    div.addEventListener('contextmenu', (e) => { 
        e.preventDefault();
        e.stopPropagation();
        showMessageContextMenu(e, message, isOutgoing);
    });
    
    div.addEventListener('dblclick', (e) => { 
        if (!e.target.closest('.message-reactions') && !e.target.closest('.reaction-badge') && !e.target.closest('.message-photo') && !e.target.closest('.message-file') && !e.target.closest('.message-sticker') && !e.target.closest('.tgs-sticker-container') && currentChatId && message.id) 
            toggleReaction(message.id, '❤️'); 
    });
    
    const replyDiv = div.querySelector('.message-reply');
    if (replyDiv) replyDiv.addEventListener('click', () => scrollToMessage(replyDiv.dataset.replyTo));
    return div;
}

function loadMessages(chatId) {
    if (!messagesContainer) return;
    messagesContainer.innerHTML = '';
    
    database.ref(`messages/${chatId}`).orderByChild('timestamp').once('value').then(snapshot => {
        const data = snapshot.val();
        if (data) {
            const messagesArray = Object.keys(data).map(key => ({ id: key, ...data[key] }));
            messagesArray.sort((a, b) => a.timestamp - b.timestamp);
            messagesArray.forEach(message => {
                messagesContainer.appendChild(createMessageElement(message));
            });
            setTimeout(() => scrollToLastMessage('auto'), 100);
        } else {
            messagesContainer.innerHTML = '<div class="empty-state"><i class="fas fa-comments"></i><h3>Нет сообщений</h3><p>Напишите первое сообщение!</p></div>';
        }
    });
    listenToNewMessages(chatId);
    setupScrollListener();
}

function listenToNewMessages(chatId) {
    if (messageListeners[chatId]) database.ref(`messages/${chatId}`).off('child_added');
    
    messageListeners[chatId] = database.ref(`messages/${chatId}`).orderByChild('timestamp').startAt(Date.now()).on('child_added', snapshot => {
        const msg = { id: snapshot.key, ...snapshot.val() };
        if (!document.querySelector(`[data-message-id="${msg.id}"]`)) {
            messagesContainer.appendChild(createMessageElement(msg));
            if (isUserNearBottom()) setTimeout(() => scrollToLastMessage('smooth'), 50);
            else showScrollToBottomButton();
        }
    });
}

function showMessageContextMenu(e, message, isOutgoing) {
    if (!messageContextMenu) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // Сохраняем ID сообщения и информацию
    messageContextMenu.dataset.messageId = message.id;
    messageContextMenu.dataset.isOutgoing = isOutgoing;
    messageContextMenu.dataset.senderId = message.senderId;
    
    // Показываем/скрываем кнопку удаления
    const deleteItem = document.getElementById('contextDelete');
    if (deleteItem) {
        deleteItem.style.display = (isOutgoing || message.senderId === currentUser?.uid) ? 'flex' : 'none';
    }
    
    // Позиционируем меню
    let left = e.clientX;
    let top = e.clientY;
    
    const menuWidth = 200;
    const menuHeight = 150;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    // Корректировка по горизонтали
    if (left + menuWidth > windowWidth - 10) {
        left = windowWidth - menuWidth - 10;
    }
    if (left < 10) {
        left = 10;
    }
    
    // Корректировка по вертикали
    if (top + menuHeight > windowHeight - 10) {
        top = windowHeight - menuHeight - 10;
    }
    if (top < 10) {
        top = 10;
    }
    
    // Проверка на перекрытие с полем ввода
    const chatInput = document.querySelector('.chat-input-container');
    if (chatInput) {
        const inputRect = chatInput.getBoundingClientRect();
        if (top + menuHeight > inputRect.top - 10) {
            top = inputRect.top - menuHeight - 10;
        }
    }
    
    messageContextMenu.style.left = left + 'px';
    messageContextMenu.style.top = top + 'px';
    messageContextMenu.style.display = 'block';
    messageContextMenu.classList.add('active');
    
    // Закрытие при клике вне
    const closeMenu = (ev) => { 
        if (!messageContextMenu.contains(ev.target)) { 
            messageContextMenu.style.display = 'none';
            messageContextMenu.classList.remove('active'); 
            document.removeEventListener('click', closeMenu);
            document.removeEventListener('contextmenu', closeMenu);
        } 
    };
    setTimeout(() => {
        document.addEventListener('click', closeMenu);
        document.addEventListener('contextmenu', closeMenu);
    }, 10);
}

function isUserNearBottom() {
    if (!messagesContainer) return false;
    return messagesContainer.scrollHeight - messagesContainer.scrollTop - messagesContainer.clientHeight < 100;
}

function scrollToLastMessage(behavior = 'smooth') { 
    if (messagesContainer) setTimeout(() => messagesContainer.scrollTo({ top: messagesContainer.scrollHeight, behavior }), 50); 
}

function scrollToMessage(id) { 
    const el = document.querySelector(`[data-message-id="${id}"]`); 
    if (el) { 
        el.scrollIntoView({ behavior: 'smooth', block: 'center' }); 
        el.style.background = 'rgba(139, 92, 246, 0.3)'; 
        setTimeout(() => el.style.background = '', 2000); 
    } 
}

let scrollBtn = null;
function createScrollToBottomButton() { 
    if (document.getElementById('scroll-btn')) return; 
    const btn = document.createElement('button'); 
    btn.id = 'scroll-btn'; 
    btn.className = 'scroll-to-bottom-btn'; 
    btn.innerHTML = '<i class="fas fa-arrow-down"></i>'; 
    btn.onclick = () => { scrollToLastMessage('smooth'); btn.classList.remove('visible'); }; 
    document.body.appendChild(btn); 
    scrollBtn = btn; 
}

function showScrollToBottomButton() { 
    if (!scrollBtn) createScrollToBottomButton(); 
    if (scrollBtn) scrollBtn.classList.add('visible'); 
}

function hideScrollToBottomButton() { 
    if (scrollBtn) scrollBtn.classList.remove('visible'); 
}

function setupScrollListener() { 
    if (!messagesContainer) return; 
    messagesContainer.onscroll = () => { 
        if (isUserNearBottom()) hideScrollToBottomButton(); 
        else if (messagesContainer.children.length > 0) showScrollToBottomButton(); 
    }; 
}

function setupContextMenuBoundary() {
    if (messagesContainer) {
        messagesContainer.addEventListener('scroll', () => {
            if (messageContextMenu?.classList.contains('active')) {
                messageContextMenu.classList.remove('active');
            }
        });
    }
    
    window.addEventListener('resize', () => {
        if (messageContextMenu?.classList.contains('active')) {
            messageContextMenu.classList.remove('active');
        }
    });
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
    
    console.log("Открываем чат:", chatId, "Тип:", chat.type);
    
    if (isMobile) { 
        if (chatScreen) { 
            chatScreen.style.display = 'flex'; 
            chatScreen.classList.add('mobile'); 
        } 
        if (desktopEmptyScreen) desktopEmptyScreen.style.display = 'none'; 
        if (homeScreen) homeScreen.style.display = 'none';
    } else { 
        if (desktopEmptyScreen) desktopEmptyScreen.style.display = 'none'; 
        if (chatScreen) { 
            chatScreen.style.display = 'flex'; 
            chatScreen.classList.add('desktop'); 
        } 
        document.querySelectorAll('.desktop-chat-item').forEach(i => i.classList.remove('active')); 
        const a = document.querySelector(`.desktop-chat-item[data-chat-id="${chatId}"]`); 
        if (a) a.classList.add('active'); 
    }
    
    let name, desc, avatar, badge = '';
    if (chat.type === 'private') {
        const otherId = Object.keys(chat.members).find(id => id !== currentUser?.uid);
        const other = allUsers[otherId];
        name = other ? other.displayName : "Неизвестный";
        desc = "Личный чат";
        avatar = other ? other.displayName.charAt(0) : '?';
        badge = getVerifiedBadge(otherId);
    } else { 
        name = chat.name; 
        desc = chat.description || "Групповой чат"; 
        avatar = '<i class="fas fa-users"></i>'; 
    }
    
    if (isMobile) { 
        if (chatHeaderName) chatHeaderName.innerHTML = `<span class="chat-header-name-with-badge">${escapeHtml(name)} ${badge}</span>`; 
        if (chatHeaderDescription) chatHeaderDescription.textContent = desc; 
        if (chatHeaderDesktop) chatHeaderDesktop.style.display = 'none'; 
        if (chatHeaderMobile) chatHeaderMobile.style.display = 'flex'; 
    } else { 
        if (desktopChatHeaderName) desktopChatHeaderName.innerHTML = `<span class="chat-header-name-with-badge">${escapeHtml(name)} ${badge}</span>`; 
        if (desktopChatHeaderDescription) desktopChatHeaderDescription.textContent = desc; 
        if (desktopChatAvatar) { 
            desktopChatAvatar.innerHTML = avatar; 
            desktopChatAvatar.style.background = chat.type === 'group' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)'; 
        } 
        if (chatHeaderDesktop) chatHeaderDesktop.style.display = 'flex'; 
        if (chatHeaderMobile) chatHeaderMobile.style.display = 'none'; 
    }
    
    loadMessages(chatId);
    
    if (chat.type === 'group') {
        console.log("Это группа, добавляем кнопки управления...");
        setTimeout(() => {
            forceRefreshGroupUI();
        }, 500);
    }
    
    setTimeout(() => {
        hideScrollToBottomButton();
    }, 200);
    
    if (messageInput) setTimeout(() => messageInput.focus(), 300);
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
    }
}

function showHomeScreen() {
    currentChatId = null;
    replyToMessage = null;
    hideReplyPreview();
    
    if (isMobile) { 
        if (chatScreen) chatScreen.style.display = 'none'; 
        if (homeScreen) homeScreen.style.display = 'block';
    } else { 
        if (chatScreen) chatScreen.style.display = 'none'; 
        if (desktopEmptyScreen) desktopEmptyScreen.style.display = 'flex'; 
        document.querySelectorAll('.desktop-chat-item').forEach(i => i.classList.remove('active')); 
    }
}

async function openOrCreatePrivateChat(targetUserId) {
    try {
        const existing = await findExistingPrivateChat(targetUserId);
        if (existing) { openChat(existing); return; }
        const target = allUsers[targetUserId];
        if (!target) { showNotification("Пользователь не найден"); return; }
        
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
        showNotification("Не удалось создать чат"); 
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
    try {
        if (selectedChatType !== 'private' && !name) { showNotification("Введите название"); return; }
        let newChat;
        
        if (selectedChatType === 'private') {
            const customId = privateUserId?.value.trim();
            if (!customId) { showNotification("Введите ID"); return; }
            let target = null, targetId = null;
            for (const id in allUsers) {
                if (allUsers[id].customId === customId) { target = allUsers[id]; targetId = id; break; }
            }
            if (!target) { showNotification("Пользователь не найден"); return; }
            if (targetId === currentUser.uid) { showNotification("Нельзя с самим собой"); return; }
            
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
                name, 
                description: desc || '', 
                type: selectedChatType, 
                createdBy: currentUser.uid, 
                createdAt: Date.now(), 
                members: { [currentUser.uid]: true }, 
                lastMessage: { text: "Группа создана", timestamp: Date.now(), senderId: currentUser.uid } 
            };
        }
        const ref = await database.ref('chats').push(newChat);
        if (createChatModal) createChatModal.classList.remove('active');
        resetCreateForm();
        openChat(ref.key);
    } catch (error) { 
        console.error(error); 
        showNotification("Ошибка создания"); 
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
// КОНТАКТЫ
// ================================================
async function addContact(targetCustomId) {
    try {
        let targetId = null, targetUser = null;
        for (const id in allUsers) {
            if (allUsers[id].customId === targetCustomId) { targetUser = allUsers[id]; targetId = id; break; }
        }
        if (!targetUser) { showNotification("Пользователь не найден"); return; }
        if (targetId === currentUser.uid) { showNotification("Нельзя добавить себя"); return; }
        if (contacts.some(c => c.userId === targetId)) { showNotification("Уже в контактах"); return; }
        
        await database.ref(`users/${currentUser.uid}/contacts/${targetId}`).set({ 
            displayName: targetUser.displayName, 
            customId: targetUser.customId, 
            status: targetUser.status, 
            lastActive: targetUser.lastActive || Date.now(), 
            addedAt: Date.now() 
        });
        showNotification(`Пользователь ${targetUser.displayName} добавлен в контакты!`);
    } catch (error) { 
        console.error(error); 
        showNotification("Ошибка добавления"); 
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
        if (btn) btn.onclick = () => { if (createChatModal) createChatModal.classList.add('active'); };
        return; 
    }
    chats.forEach(chat => homeChatsList.appendChild(createChatElement(chat)));
}

function updateHomeContacts() {
    if (!homeContactsList) return;
    homeContactsList.innerHTML = '';
    if (!contacts.length) { 
        homeContactsList.innerHTML = '<div class="empty-state"><i class="fas fa-user-friends"></i><h3>Контактов нет</h3><p>Найдите пользователей через поиск</p></div>'; 
        return; 
    }
    [...contacts].sort((a, b) => { 
        if (a.status === 'online' && b.status !== 'online') return -1; 
        if (a.status === 'away' && b.status !== 'away') return -1;
        if (a.status === 'dnd' && b.status !== 'dnd') return -1;
        return a.displayName.localeCompare(b.displayName); 
    }).forEach(c => homeContactsList.appendChild(createContactElement(c)));
}

function createChatElement(chat) {
    const div = document.createElement('div');
    div.className = 'chat-item';
    div.dataset.chatId = chat.id;
    let avatar, name, statusClass = '';
    
    if (chat.type === 'group') { 
        avatar = '<i class="fas fa-users"></i>'; 
        name = chat.name; 
        statusClass = 'status-online';
    } else { 
        const otherId = Object.keys(chat.members).find(id => id !== currentUser?.uid); 
        const other = allUsers[otherId]; 
        avatar = other ? other.displayName.charAt(0) : '?'; 
        name = other ? other.displayName : "Неизвестный";
        
        if (other) {
            switch(other.status) {
                case 'online': statusClass = 'status-online'; break;
                case 'away': statusClass = 'status-away'; break;
                case 'dnd': statusClass = 'status-dnd'; break;
                default: statusClass = 'status-offline';
            }
        }
    }
    
    let lastMsg = "Нет сообщений", lastTime = "";
    if (chat.lastMessage) { 
        lastMsg = chat.lastMessage.type === 'photo' ? '📸 Фото' : (chat.lastMessage.type === 'file' ? '📎 Файл' : (chat.lastMessage.type === 'sticker' ? '🖼️ Стикер' : (chat.lastMessage.text || "Сообщение"))); 
        if (lastMsg.length > 30) lastMsg = lastMsg.substring(0, 30) + '...'; 
        if (chat.lastMessage.timestamp) lastTime = new Date(chat.lastMessage.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }); 
    }
    
    div.innerHTML = `<div class="chat-avatar ${chat.type === 'group' ? 'group-avatar' : 'private-avatar'} ${statusClass}">${avatar}</div>
        <div class="chat-info">
            <div class="chat-name">${escapeHtml(name)}</div>
            <div class="last-message">${escapeHtml(lastMsg)}</div>
        </div>
        <div class="chat-meta">
            <div class="chat-time">${lastTime}</div>
        </div>`;
    div.onclick = () => openChat(chat.id);
    return div;
}

function createContactElement(contact) {
    const div = document.createElement('div');
    div.className = 'contact-item';
    div.dataset.userId = contact.userId;
    
    let statusText = contact.status || 'offline';
    let statusClass = '';
    switch(statusText) {
        case 'online': statusClass = 'online'; statusText = 'online'; break;
        case 'away': statusClass = 'away'; statusText = 'away'; break;
        case 'dnd': statusClass = 'dnd'; statusText = 'не беспокоить'; break;
        default: statusClass = 'offline'; statusText = 'offline';
    }
    
    div.innerHTML = `<div class="contact-avatar">${escapeHtml(contact.displayName.charAt(0))}</div>
        <div class="contact-info">
            <div class="contact-name" onclick="event.stopPropagation(); openUserProfileModal('${contact.userId}')">${escapeHtml(contact.displayName)} ${getVerifiedBadge(contact.userId)}</div>
            <div class="contact-status ${statusClass}">${statusText}</div>
        </div>
        <div class="chat-meta">
            <div class="chat-time">${contact.customId}</div>
        </div>`;
    div.onclick = () => openOrCreatePrivateChat(contact.userId);
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
    
    if (chat.type === 'group') { 
        avatar = '<i class="fas fa-users"></i>'; 
        name = chat.name; 
        statusColor = '#10b981';
    } else { 
        const otherId = Object.keys(chat.members).find(id => id !== currentUser?.uid); 
        const other = allUsers[otherId]; 
        avatar = other ? other.displayName.charAt(0) : '?'; 
        name = other ? other.displayName : "Неизвестный";
        
        if (other) {
            switch(other.status) {
                case 'online': statusColor = '#10b981'; break;
                case 'away': statusColor = '#f59e0b'; break;
                case 'dnd': statusColor = '#ef4444'; break;
                default: statusColor = '#64748b';
            }
        }
    }
    
    let lastMsg = "Нет сообщений", lastTime = "";
    if (chat.lastMessage) { 
        lastMsg = chat.lastMessage.type === 'photo' ? '📸 Фото' : (chat.lastMessage.type === 'file' ? '📎 Файл' : (chat.lastMessage.type === 'sticker' ? '🖼️ Стикер' : (chat.lastMessage.text || "Сообщение"))); 
        if (lastMsg.length > 30) lastMsg = lastMsg.substring(0, 30) + '...'; 
        if (chat.lastMessage.timestamp) lastTime = new Date(chat.lastMessage.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }); 
    }
    
    div.innerHTML = `<div class="desktop-chat-avatar" style="background: ${chat.type === 'group' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)'}">${avatar}</div>
        <div class="desktop-chat-info">
            <div class="desktop-chat-name">${escapeHtml(name)}</div>
            <div class="desktop-chat-last-message" style="color: ${statusColor}">${lastTime ? lastTime + ' • ' + lastMsg : lastMsg}</div>
        </div>`;
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
    
    div.innerHTML = `<div class="desktop-chat-avatar" style="background: linear-gradient(135deg, #f093fb, #f5576c)">${escapeHtml(contact.displayName.charAt(0))}</div>
        <div class="desktop-chat-info">
            <div class="desktop-chat-name">${escapeHtml(contact.displayName)} ${getVerifiedBadge(contact.userId)}</div>
            <div class="desktop-chat-last-message" style="color: ${statusColor}">${statusText} • ${contact.customId}</div>
        </div>`;
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
    let avatar, name, statusClass = '';
    
    if (chat.type === 'group') { 
        avatar = '<i class="fas fa-users"></i>'; 
        name = chat.name; 
        statusClass = 'status-online';
    } else { 
        const otherId = Object.keys(chat.members).find(id => id !== currentUser?.uid); 
        const other = allUsers[otherId]; 
        avatar = other ? other.displayName.charAt(0) : '?'; 
        name = other ? other.displayName : "Неизвестный";
        
        if (other) {
            switch(other.status) {
                case 'online': statusClass = 'status-online'; break;
                case 'away': statusClass = 'status-away'; break;
                case 'dnd': statusClass = 'status-dnd'; break;
                default: statusClass = 'status-offline';
            }
        }
    }
    
    let lastMsg = "Нет сообщений", lastTime = "";
    if (chat.lastMessage) { 
        lastMsg = chat.lastMessage.type === 'photo' ? '📸 Фото' : (chat.lastMessage.type === 'file' ? '📎 Файл' : (chat.lastMessage.type === 'sticker' ? '🖼️ Стикер' : (chat.lastMessage.text || "Сообщение"))); 
        if (lastMsg.length > 30) lastMsg = lastMsg.substring(0, 30) + '...'; 
        if (chat.lastMessage.timestamp) lastTime = new Date(chat.lastMessage.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }); 
    }
    
    div.innerHTML = `<div class="mobile-chat-avatar ${chat.type === 'group' ? 'group' : 'private'} ${statusClass}">${avatar}</div>
        <div class="mobile-chat-info">
            <div class="mobile-chat-name">${escapeHtml(name)}</div>
            <div class="mobile-chat-last-message">${escapeHtml(lastMsg)}</div>
        </div>
        <div class="mobile-chat-time">${lastTime}</div>`;
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
    
    div.innerHTML = `<div class="mobile-contact-avatar">${escapeHtml(contact.displayName.charAt(0))}</div>
        <div class="mobile-contact-info">
            <div class="mobile-contact-name">${escapeHtml(contact.displayName)} ${getVerifiedBadge(contact.userId)}</div>
            <div class="mobile-contact-status ${statusClass}"><i class="fas fa-circle"></i> ${statusText}</div>
        </div>`;
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
        let statusText = '';
        let statusColor = '#10b981';
        let statusIcon = 'fa-circle';
        
        switch(currentUser.status) {
            case 'online':
                statusText = 'online';
                statusColor = '#10b981';
                statusIcon = 'fa-circle';
                break;
            case 'away':
                statusText = 'away';
                statusColor = '#f59e0b';
                statusIcon = 'fa-clock';
                break;
            case 'dnd':
                statusText = 'не беспокоить';
                statusColor = '#ef4444';
                statusIcon = 'fa-minus-circle';
                break;
            case 'invisible':
                statusText = 'невидимка';
                statusColor = '#64748b';
                statusIcon = 'fa-eye-slash';
                break;
            default:
                statusText = 'offline';
                statusColor = '#64748b';
                statusIcon = 'fa-circle';
        }
        
        mobileProfileStatus.innerHTML = `<i class="fas ${statusIcon}"></i> ${statusText}`;
        mobileProfileStatus.style.color = statusColor;
    }
}

// ================================================
// ПРОФИЛЬ
// ================================================
function openProfileModal() {
    if (!profileModal || !currentUser) return;
    if (profileName) profileName.innerHTML = `<span class="profile-name-with-badge">${escapeHtml(currentUser.displayName)} ${getVerifiedBadge(currentUser.uid)}</span>`;
    if (profileUserId) profileUserId.textContent = currentUser.customId;
    const avatar = document.getElementById('profileAvatarLarge');
    if (avatar) avatar.textContent = currentUser.displayName.charAt(0);
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
    const jd = document.getElementById('profileJoinDate');
    if (jd) jd.textContent = currentUser.joinDate;
    if (profileContactsCount) profileContactsCount.textContent = contacts.length;
    if (profileChatsCount) profileChatsCount.textContent = chats.length;
    profileModal.classList.add('active');
}

window.openUserProfileModal = function(userId) {
    if (!userId || !allUsers[userId]) return;
    const user = allUsers[userId];
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    
    let statusText = user.status || 'offline';
    let statusClass = 'offline';
    switch(statusText) {
        case 'online': statusText = 'online'; statusClass = 'online'; break;
        case 'away': statusText = 'away'; statusClass = 'away'; break;
        case 'dnd': statusText = 'не беспокоить'; statusClass = 'dnd'; break;
        default: statusText = 'offline'; statusClass = 'offline';
    }
    
    modal.innerHTML = `<div class="modal">
        <div class="modal-header">
            <h3>Профиль</h3>
            <button class="modal-close" onclick="this.closest('.modal-overlay').remove()"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
            <div class="profile-avatar-large">${escapeHtml(user.displayName.charAt(0))}</div>
            <div class="profile-info">
                <div class="profile-name-with-badge" style="justify-content:center;">${escapeHtml(user.displayName)} ${getVerifiedBadge(userId)}</div>
                <div class="profile-status ${statusClass}">${statusText}</div>
            </div>
            <div class="user-id-container">
                <span class="user-id-label">ID:</span>
                <div class="user-id-value">${user.customId || userId}</div>
            </div>
            <button class="edit-profile-btn" onclick="openOrCreatePrivateChat('${userId}'); document.querySelector('.modal-overlay.active')?.remove()">
                <i class="fas fa-comment"></i> Написать
            </button>
        </div>
    </div>`;
    document.body.appendChild(modal);
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
};

async function saveProfileChanges() {
    try {
        const newName = editProfileName?.value.trim();
        const activeStatus = document.querySelector('.status-option.active');
        let newStatus = activeStatus ? activeStatus.dataset.status : 'online';
        
        if (!newName) { showNotification("Введите имя"); return; }
        
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
        showNotification("Профиль обновлен!");
        updateUserProfileDisplay();
        updateUserIDs();
        updateMobileProfile();
        updateDesktopUserInfo();
        updateContactsDisplay();
        updateChatsDisplay();
        
    } catch (error) { 
        console.error(error); 
        showNotification("Ошибка обновления"); 
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
        let statusText = 'online';
        let statusClass = 'online';
        
        switch(userStatus) {
            case 'online': statusText = 'online'; statusClass = 'online'; break;
            case 'away': statusText = 'away'; statusClass = 'away'; break;
            case 'dnd': statusText = 'не беспокоить'; statusClass = 'dnd'; break;
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
        let statusIcon = 'fa-circle';
        let statusColor = '#10b981';
        let statusText = 'online';
        
        switch(currentUser.status) {
            case 'online':
                statusIcon = 'fa-circle';
                statusColor = '#10b981';
                statusText = 'online';
                break;
            case 'away':
                statusIcon = 'fa-clock';
                statusColor = '#f59e0b';
                statusText = 'away';
                break;
            case 'dnd':
                statusIcon = 'fa-minus-circle';
                statusColor = '#ef4444';
                statusText = 'не беспокоить';
                break;
            case 'invisible':
                statusIcon = 'fa-eye-slash';
                statusColor = '#64748b';
                statusText = 'невидимка';
                break;
            default:
                statusIcon = 'fa-circle';
                statusColor = '#64748b';
                statusText = 'offline';
        }
        
        desktopUserStatus.innerHTML = `<i class="fas ${statusIcon}"></i><span>${statusText}</span>`;
        desktopUserStatus.style.color = statusColor;
    }
}

// ================================================
// УВЕДОМЛЕНИЯ
// ================================================
function showNotification(message) {
    const n = document.createElement('div');
    n.className = 'notification';
    n.textContent = message;
    n.style.cssText = 'position:fixed;top:20px;right:20px;background:linear-gradient(135deg,#667eea,#764ba2);color:white;padding:12px 20px;border-radius:12px;z-index:4000;font-weight:600;animation:slideIn 0.3s ease';
    document.body.appendChild(n);
    setTimeout(() => { 
        n.style.animation = 'slideOut 0.3s ease'; 
        setTimeout(() => n.remove(), 300); 
    }, 3000);
}

// ================================================
// АДМИН-ПАНЕЛЬ
// ================================================
function setupAdminPanel() {
    if (!adminPanelBtn) return;
    adminPanelBtn.onclick = () => { adminPanelModal?.classList.add('active'); loadVerifiedUsersList(); };
    if (closeAdminPanel) closeAdminPanel.onclick = () => adminPanelModal?.classList.remove('active');
    if (giveBadgeBtn) giveBadgeBtn.onclick = () => { const uid = badgeUserId?.value.trim(); const type = badgeType?.value; if (uid) giveVerifiedBadge(uid, type); else showNotification("Введите ID"); };
}

async function loadVerifiedUsersList() {
    if (!verifiedUsersList) return;
    const snap = await database.ref('verifiedUsers').once('value');
    const data = snap.val() || {};
    if (!Object.keys(data).length) { verifiedUsersList.innerHTML = '<div class="empty-state">Нет верифицированных</div>'; return; }
    verifiedUsersList.innerHTML = Object.entries(data).map(([uid, d]) => { 
        const u = allUsers[uid] || { displayName: 'Неизвестный', customId: uid }; 
        const cls = { admin: 'badge-admin', premium: 'badge-premium', partner: 'badge-partner', celebrity: 'badge-celebrity' }[d.type]; 
        const txt = { admin: 'Админ', premium: 'Премиум', partner: 'Партнер', celebrity: 'Знаменитость' }[d.type]; 
        return `<div class="verified-user-item">
            <div class="verified-user-info">
                <div class="verified-user-avatar">${escapeHtml(u.displayName.charAt(0))}</div>
                <div class="verified-user-details">
                    <div class="verified-user-name">${escapeHtml(u.displayName)}</div>
                    <div class="verified-user-id">${u.customId}</div>
                </div>
            </div>
            <span class="verified-user-badge ${cls}">${txt}</span>
            <button class="remove-badge-btn" onclick="removeVerifiedBadge('${uid}')"><i class="fas fa-times"></i></button>
        </div>`;
    }).join('');
}

async function giveVerifiedBadge(userId, type) {
    try { 
        await database.ref(`verifiedUsers/${userId}`).set({ type, verifiedAt: Date.now(), verifiedBy: currentUser.uid }); 
        showNotification(`✅ Галочка выдана`); 
        loadVerifiedUsersList(); 
    } catch (error) { showNotification("❌ Ошибка"); }
}

window.removeVerifiedBadge = async function(userId) { 
    if (!confirm('Удалить галочку?')) return; 
    try { 
        await database.ref(`verifiedUsers/${userId}`).remove(); 
        showNotification("✅ Удалено"); 
        loadVerifiedUsersList(); 
    } catch(e) { showNotification("❌ Ошибка"); } 
};

// ================================================
// ФУНКЦИИ УПРАВЛЕНИЯ
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
    
    console.log("Инициализация интерфейса для пользователя:", currentUser.displayName);
    
    updateUserProfileDisplay(); 
    updateHomeChats(); 
    updateHomeContacts(); 
    updateDesktopChats(); 
    updateDesktopContacts(); 
    updateMobileChats(); 
    updateMobileContacts(); 
    updateMobileProfile(); 
    
    if (homeTabs.length) {
        homeTabs.forEach(tab => {
            tab.onclick = function() {
                const tabName = this.dataset.tab;
                homeTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                document.querySelectorAll('.home-tab-pane').forEach(pane => pane.classList.remove('active'));
                const paneId = `home${tabName.charAt(0).toUpperCase() + tabName.slice(1)}Pane`;
                const activePane = document.getElementById(paneId);
                if (activePane) activePane.classList.add('active');
            };
        });
        if (homeTabs[0]) homeTabs[0].click();
    }
    
    if (desktopSidebarTabs.length) {
        desktopSidebarTabs.forEach(tab => {
            tab.onclick = function() {
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
            console.log("Обновляем групповые кнопки для текущего чата:", currentChatId);
            setTimeout(() => {
                forceRefreshGroupUI();
            }, 500);
        }
    }
    
    window.debugGroupButtons = function() {
        console.log("=== ОТЛАДКА ГРУППОВЫХ КНОПОК ===");
        console.log("currentChatId:", currentChatId);
        if (currentChatId) {
            const chat = chats.find(c => c.id === currentChatId);
            console.log("Текущий чат:", chat);
            if (chat) {
                console.log("Тип чата:", chat.type);
                console.log("Создатель:", chat.createdBy);
                console.log("Текущий пользователь:", currentUser?.uid);
                console.log("Является создателем?", chat.createdBy === currentUser?.uid);
            }
        }
        console.log("Элемент .chat-actions:", document.querySelector('.chat-actions'));
        console.log("Элемент .group-actions:", document.querySelector('.group-actions'));
        console.log("================================");
    };
    
    console.log("Инициализация интерфейса завершена");
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
    
    if (mobileCreateFAB) mobileCreateFAB.onclick = () => { if (mobileCreateModal) mobileCreateModal.classList.add('active'); };
    if (mobileCloseCreateModal) mobileCloseCreateModal.onclick = () => { if (mobileCreateModal) mobileCreateModal.classList.remove('active'); };
    if (mobileCreateModal) mobileCreateModal.onclick = (e) => { if (e.target === mobileCreateModal) mobileCreateModal.classList.remove('active'); };
    
    const typeOpts = document.querySelectorAll('.mobile-chat-type-option');
    typeOpts.forEach(opt => { 
        opt.onclick = () => { 
            typeOpts.forEach(o => o.classList.remove('active')); 
            opt.classList.add('active'); 
            const forms = ['mobileGroupForm', 'mobilePrivateForm', 'mobileChannelForm']; 
            forms.forEach(f => { const el = document.getElementById(f); if (el) el.classList.remove('active'); }); 
            const target = document.getElementById(`mobile${opt.dataset.type.charAt(0).toUpperCase() + opt.dataset.type.slice(1)}Form`); 
            if (target) target.classList.add('active'); 
            if (opt.dataset.type === 'private') setTimeout(() => document.getElementById('mobilePrivateUserId')?.focus(), 100); 
        }; 
    });
    
    const privateInput = document.getElementById('mobilePrivateUserId');
    if (privateInput) {
        privateInput.oninput = function() { 
            clearTimeout(searchTimeouts.mobile); 
            const q = this.value.trim(); 
            const resDiv = document.getElementById('mobilePrivateSearchResults'); 
            const btn = document.getElementById('mobileCreatePrivateBtn'); 
            if (q.length < 1) { if (resDiv) resDiv.innerHTML = ''; if (btn) btn.disabled = true; return; } 
            searchTimeouts.mobile = setTimeout(() => { 
                const results = []; 
                for (const id in allUsers) { 
                    if (id !== currentUser?.uid) { 
                        const u = allUsers[id]; 
                        if (u.displayName?.toLowerCase().includes(q.toLowerCase()) || u.customId?.toLowerCase().includes(q.toLowerCase())) results.push(u); 
                    } 
                } 
                if (resDiv) resDiv.innerHTML = results.slice(0,5).map(u => `<div class="mobile-search-result-item" data-custom-id="${u.customId}">
                    <div class="mobile-search-result-avatar">${escapeHtml(u.displayName.charAt(0))}</div>
                    <div class="mobile-search-result-info">
                        <div class="mobile-search-result-name">${escapeHtml(u.displayName)}</div>
                        <div class="mobile-search-result-id">${u.customId}</div>
                    </div>
                </div>`).join(''); 
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
            if (!name) { showNotification("Введите название"); return; } 
            const chat = { 
                name, 
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
            if (!customId) { showNotification("Введите ID"); return; } 
            let targetId = null; 
            for (const id in allUsers) if (allUsers[id].customId === customId) { targetId = id; break; } 
            if (!targetId) { showNotification("Пользователь не найден"); return; } 
            if (targetId === currentUser.uid) { showNotification("Нельзя с собой"); return; } 
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
        createChannelBtn.onclick = () => { 
            showNotification("Каналы будут доступны в следующем обновлении"); 
            if (mobileCreateModal) mobileCreateModal.classList.remove('active'); 
        };
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
    
    if (mobileCopyIdBtn) mobileCopyIdBtn.onclick = () => { 
        navigator.clipboard.writeText(mobileProfileId?.textContent || ''); 
        showNotification('ID скопирован!'); 
    };
    
    if (mobileEditProfileBtn) mobileEditProfileBtn.onclick = () => { 
        if (editProfileModal) { 
            editProfileModal.classList.add('active'); 
            if (editProfileName) editProfileName.value = currentUser?.displayName || ''; 
            statusOptions.forEach(opt => { 
                opt.classList.remove('active'); 
                if (opt.dataset.status === (currentUser?.selectedStatus || currentUser?.status)) {
                    opt.classList.add('active');
                }
            }); 
        } 
    };
    
    if (mobileLogoutBtn) mobileLogoutBtn.onclick = logoutUser;
    
    if (notificationsSwitch) { 
        notificationsSwitch.checked = localStorage.getItem('notifications') !== 'false'; 
        notificationsSwitch.onchange = (e) => localStorage.setItem('notifications', e.target.checked); 
    }
    
    if (themeSwitch) { 
        themeSwitch.checked = localStorage.getItem('darkTheme') !== 'false'; 
        themeSwitch.onchange = (e) => { 
            document.body.classList.toggle('dark-theme', e.target.checked); 
            localStorage.setItem('darkTheme', e.target.checked); 
        }; 
    }
}

function hideReplyPreview() { 
    if (replyPreviewContainer) { 
        replyPreviewContainer.style.display = 'none'; 
        replyPreviewContainer.innerHTML = ''; 
        replyToMessage = null; 
    } 
}

function showReplyPreview(sender, text) { 
    if (!replyPreviewContainer) return; 
    replyPreviewContainer.style.display = 'block'; 
    replyPreviewContainer.innerHTML = `<div class="reply-preview">
        <div class="reply-preview-content">
            <div class="reply-preview-sender"><i class="fas fa-reply"></i> Ответ ${escapeHtml(sender)}</div>
            <div class="reply-preview-text">${escapeHtml(text.length > 100 ? text.substring(0,100)+'...' : text)}</div>
        </div>
        <button class="reply-preview-close" id="cancelReplyBtn"><i class="fas fa-times"></i></button>
    </div>`; 
    const cancelBtn = document.getElementById('cancelReplyBtn');
    if (cancelBtn) cancelBtn.onclick = hideReplyPreview;
}

function setupHomeContactsSearch() {
    if (!homeContactsSearch) return;
    homeContactsSearch.oninput = function() { 
        clearTimeout(searchTimeouts.home); 
        const q = this.value.trim(); 
        if (q.length < 1) { 
            hideSearchResults('homeContactsSearchResults'); 
            setSearchLoading('homeContactsSearch', false); 
            return; 
        } 
        setSearchLoading('homeContactsSearch', true); 
        searchTimeouts.home = setTimeout(() => { 
            const res = searchUsers(q, contacts); 
            displaySearchResults(res, 'homeContactsSearchResults', contacts); 
            setSearchLoading('homeContactsSearch', false); 
        }, 300); 
    };
    document.addEventListener('click', (e) => { 
        if (!homeContactsSearch?.contains(e.target) && !document.getElementById('homeContactsSearchResults')?.contains(e.target)) 
            hideSearchResults('homeContactsSearchResults'); 
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

// ================================================
// КОНТЕКСТНОЕ МЕНЮ ОБРАБОТЧИКИ
// ================================================
if (contextReply) {
    contextReply.onclick = () => { 
        const msgId = messageContextMenu?.dataset.messageId; 
        if (!msgId) return; 
        const el = document.querySelector(`[data-message-id="${msgId}"]`); 
        if (!el) return; 
        let text = '';
        const textElement = el.querySelector('.message-text');
        if (textElement) {
            text = textElement.textContent;
        } else {
            const photoElement = el.querySelector('.message-photo');
            const fileElement = el.querySelector('.message-file');
            const stickerElement = el.querySelector('.message-sticker');
            
            if (photoElement) text = '📸 Фото';
            else if (fileElement) text = '📎 Файл';
            else if (stickerElement) text = '🖼️ Стикер';
            else text = 'Сообщение';
        }
        
        const sender = el.querySelector('.message-sender-name')?.textContent?.split(' ')[0] || ''; 
        database.ref(`messages/${currentChatId}/${msgId}`).once('value').then(snap => { 
            const d = snap.val(); 
            replyToMessage = { 
                id: msgId, 
                text: d?.text || text, 
                senderId: d?.senderId || null, 
                senderName: d?.senderName || sender 
            }; 
            showReplyPreview(replyToMessage.senderName, replyToMessage.text); 
            if (messageContextMenu) messageContextMenu.classList.remove('active'); 
            if (messageInput) messageInput.focus(); 
        }).catch(() => { 
            replyToMessage = { id: msgId, text, senderId: null, senderName: sender }; 
            showReplyPreview(sender, text); 
            if (messageContextMenu) messageContextMenu.classList.remove('active'); 
            if (messageInput) messageInput.focus(); 
        }); 
    };
}

if (contextCopy) {
    contextCopy.onclick = () => { 
        const msgId = messageContextMenu?.dataset.messageId; 
        if (msgId) { 
            const text = document.querySelector(`[data-message-id="${msgId}"] .message-text`)?.textContent || ''; 
            navigator.clipboard.writeText(text); 
            showNotification("Скопировано"); 
            if (messageContextMenu) messageContextMenu.classList.remove('active'); 
        } 
    };
}

if (contextDelete) {
    contextDelete.onclick = () => { 
        const msgId = messageContextMenu?.dataset.messageId; 
        const isOutgoing = messageContextMenu?.dataset.isOutgoing === 'true';
        const senderId = messageContextMenu?.dataset.senderId;
        
        if (!msgId || !currentChatId) { 
            if (messageContextMenu) messageContextMenu.classList.remove('active'); 
            return; 
        }
        
        if (!isOutgoing && senderId !== currentUser?.uid) {
            showNotification("Вы можете удалять только свои сообщения");
            if (messageContextMenu) messageContextMenu.classList.remove('active');
            return;
        }
        
        const messageElement = document.querySelector(`.message[data-message-id="${msgId}"]`);
        if (!messageElement) return;
        
        let messageText = '';
        const textElement = messageElement.querySelector('.message-text');
        if (textElement) {
            messageText = textElement.textContent;
        } else {
            const photoElement = messageElement.querySelector('.message-photo');
            const fileElement = messageElement.querySelector('.message-file');
            const stickerElement = messageElement.querySelector('.message-sticker');
            
            if (photoElement) messageText = '📸 Фото';
            else if (fileElement) messageText = '📎 Файл';
            else if (stickerElement) messageText = '🖼️ Стикер';
            else messageText = 'Сообщение';
        }
        
        const senderName = messageElement.querySelector('.message-sender-name')?.textContent?.trim() || 'Пользователь';
        
        showDeleteMessageConfirmation(msgId, currentChatId, messageText, senderName, Date.now());
        if (messageContextMenu) messageContextMenu.classList.remove('active');
    };
}

function showDeleteMessageConfirmation(msgId, chatId, text, sender, ts) { 
    if (!confirmDeleteMessageModal || !messagePreview) return; 
    
    messagePreview.innerHTML = `
        <div class="message-preview-header">
            <div class="message-preview-avatar">${escapeHtml(sender?.charAt(0) || '?')}</div>
            <div class="message-preview-sender">${escapeHtml(sender || "Пользователь")}</div>
            <div class="message-preview-time">${new Date(ts).toLocaleTimeString()}</div>
        </div>
        <div class="message-preview-text">${escapeHtml(text.length > 100 ? text.substring(0, 100) + '...' : text)}</div>
    `;
    
    confirmDeleteMessageModal.classList.add('active');
    confirmDeleteMessageModal.dataset.messageId = msgId;
    confirmDeleteMessageModal.dataset.chatId = chatId;
    
    if (confirmDeleteBtn) {
        const newConfirmBtn = confirmDeleteBtn.cloneNode(true);
        confirmDeleteBtn.parentNode.replaceChild(newConfirmBtn, confirmDeleteBtn);
        window.confirmDeleteBtn = newConfirmBtn;
        
        newConfirmBtn.onclick = async () => { 
            const messageId = confirmDeleteMessageModal.dataset.messageId;
            const chatId = confirmDeleteMessageModal.dataset.chatId;
            
            if (!messageId || !chatId) {
                showNotification("Ошибка: сообщение не найдено");
                confirmDeleteMessageModal.classList.remove('active');
                return;
            }
            
            try { 
                await database.ref(`messages/${chatId}/${messageId}`).remove();
                showNotification("✅ Сообщение удалено");
                
                const messageElement = document.querySelector(`.message[data-message-id="${messageId}"]`);
                if (messageElement) {
                    messageElement.remove();
                }
                
                const messagesRef = database.ref(`messages/${chatId}`);
                const snapshot = await messagesRef.once('value');
                if (!snapshot.exists()) {
                    if (messagesContainer) {
                        messagesContainer.innerHTML = '';
                        const emptyDiv = document.createElement('div');
                        emptyDiv.className = 'empty-state';
                        emptyDiv.innerHTML = '<i class="fas fa-comments"></i><h3>Нет сообщений</h3><p>Напишите первое сообщение!</p>';
                        messagesContainer.appendChild(emptyDiv);
                    }
                }
                
                confirmDeleteMessageModal.classList.remove('active');
                
            } catch(e) { 
                console.error("Ошибка удаления:", e);
                showNotification("❌ Не удалось удалить сообщение"); 
                confirmDeleteMessageModal.classList.remove('active');
            } 
        };
    }
    
    if (cancelDeleteBtn) {
        const newCancelBtn = cancelDeleteBtn.cloneNode(true);
        cancelDeleteBtn.parentNode.replaceChild(newCancelBtn, cancelDeleteBtn);
        newCancelBtn.onclick = () => {
            confirmDeleteMessageModal.classList.remove('active');
        };
    }
}

// ================================================
// ФУНКЦИИ ГРУПП
// ================================================
function addGroupActionButtons() {
    console.log("=== addGroupActionButtons вызвана ===");
    
    let chatActions = null;
    
    const desktopChatHeader = document.querySelector('.chat-header.desktop .desktop-chat-header');
    if (desktopChatHeader) {
        let desktopActions = desktopChatHeader.querySelector('.desktop-chat-actions');
        if (!desktopActions) {
            desktopActions = document.createElement('div');
            desktopActions.className = 'desktop-chat-actions';
            desktopActions.style.marginLeft = 'auto';
            desktopActions.style.display = 'flex';
            desktopActions.style.gap = '8px';
            desktopChatHeader.appendChild(desktopActions);
        }
        chatActions = desktopActions;
    }
    
    if (!chatActions) {
        chatActions = document.querySelector('.chat-actions');
    }
    if (!chatActions) {
        chatActions = document.querySelector('.chat-header .chat-actions');
    }
    if (!chatActions) {
        chatActions = document.querySelector('#chatHeaderMobile .chat-actions');
    }
    
    console.log("chatActions найден?", chatActions);
    
    if (!chatActions) {
        const chatHeader = document.querySelector('.chat-header.desktop') || document.querySelector('.chat-header.mobile') || document.querySelector('.chat-header');
        if (chatHeader) {
            chatActions = document.createElement('div');
            chatActions.className = 'chat-actions';
            chatHeader.appendChild(chatActions);
        }
    }
    
    if (!chatActions) {
        console.log("НЕ удалось найти или создать chatActions");
        return;
    }
    
    const oldBtns = document.querySelector('.group-actions');
    if (oldBtns) oldBtns.remove();
    
    const currentChat = chats.find(c => c.id === currentChatId);
    if (!currentChat) {
        console.log("Текущий чат не найден, currentChatId:", currentChatId);
        return;
    }
    
    if (currentChat.type !== 'group') {
        console.log("Чат не является группой, тип:", currentChat.type);
        return;
    }
    
    const isCreator = currentChat.createdBy === currentUser?.uid;
    console.log("Создатель группы:", currentChat.createdBy);
    console.log("Текущий пользователь:", currentUser?.uid);
    console.log("isCreator:", isCreator);
    
    const groupActions = document.createElement('div');
    groupActions.className = 'group-actions';
    groupActions.style.display = 'flex';
    groupActions.style.gap = '8px';
    groupActions.style.marginLeft = 'auto';
    
    const btnStyle = 'width:40px;height:40px;border-radius:12px;background:rgba(139,92,246,0.15);border:1px solid rgba(139,92,246,0.3);color:#c084fc;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s ease;';
    
    let buttonsHtml = `
        <button class="group-action-btn" id="groupMembersBtn" title="Участники" style="${btnStyle}" onmouseover="this.style.background='rgba(139,92,246,0.3)';this.style.transform='translateY(-2px)'" onmouseout="this.style.background='rgba(139,92,246,0.15)';this.style.transform='none'">
            <i class="fas fa-users"></i>
        </button>
    `;
    
    if (isCreator) {
        buttonsHtml = `
            <button class="group-action-btn" id="groupAddMembersBtn" title="Добавить участников" style="${btnStyle}" onmouseover="this.style.background='rgba(139,92,246,0.3)';this.style.transform='translateY(-2px)'" onmouseout="this.style.background='rgba(139,92,246,0.15)';this.style.transform='none'">
                <i class="fas fa-user-plus"></i>
            </button>
            <button class="group-action-btn" id="groupInviteLinkBtn" title="Ссылка-приглашение" style="${btnStyle}" onmouseover="this.style.background='rgba(139,92,246,0.3)';this.style.transform='translateY(-2px)'" onmouseout="this.style.background='rgba(139,92,246,0.15)';this.style.transform='none'">
                <i class="fas fa-link"></i>
            </button>
            <button class="group-action-btn" id="groupMembersBtn" title="Участники" style="${btnStyle}" onmouseover="this.style.background='rgba(139,92,246,0.3)';this.style.transform='translateY(-2px)'" onmouseout="this.style.background='rgba(139,92,246,0.15)';this.style.transform='none'">
                <i class="fas fa-users"></i>
            </button>
        `;
    }
    
    groupActions.innerHTML = buttonsHtml;
    chatActions.appendChild(groupActions);
    
    const membersBtn = document.getElementById('groupMembersBtn');
    if (membersBtn) {
        membersBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log("Кнопка Участники нажата");
            showGroupMembers(currentChatId);
        };
    }
    
    if (isCreator) {
        const addBtn = document.getElementById('groupAddMembersBtn');
        if (addBtn) {
            addBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log("Кнопка Добавить участников нажата");
                openAddMembersModal(currentChatId);
            };
        }
        
        const inviteBtn = document.getElementById('groupInviteLinkBtn');
        if (inviteBtn) {
            inviteBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log("Кнопка Ссылка-приглашение нажата");
                openInviteLinkModal(currentChatId);
            };
        }
    }
    
    console.log("Кнопки группы успешно добавлены");
}

function addGroupMembersPreview() {
    console.log("=== addGroupMembersPreview вызвана ===");
    
    let chatHeaderInfo = null;
    let isDesktop = false;
    
    const desktopHeaderInfo = document.querySelector('.chat-header.desktop .desktop-chat-header-info');
    if (desktopHeaderInfo) {
        chatHeaderInfo = desktopHeaderInfo;
        isDesktop = true;
    }
    
    if (!chatHeaderInfo) {
        chatHeaderInfo = document.querySelector('.chat-header-info');
    }
    if (!chatHeaderInfo) {
        chatHeaderInfo = document.querySelector('#chatHeaderMobile .chat-header-info');
    }
    if (!chatHeaderInfo) {
        chatHeaderInfo = document.querySelector('#chatHeaderDesktop .chat-header-info');
    }
    
    console.log("chatHeaderInfo найден?", chatHeaderInfo, "isDesktop:", isDesktop);
    
    if (!chatHeaderInfo) {
        console.log("chatHeaderInfo не найден");
        return;
    }
    
    const oldPreview = document.getElementById('groupMembersPreview');
    if (oldPreview) oldPreview.remove();
    
    const currentChat = chats.find(c => c.id === currentChatId);
    if (!currentChat || currentChat.type !== 'group') {
        console.log("Не группа или чат не найден");
        return;
    }
    
    const memberIds = Object.keys(currentChat.members || {});
    const memberCount = memberIds.length;
    
    console.log("Участников в группе:", memberCount);
    
    function getMemberWord(count) {
        if (count % 10 === 1 && count % 100 !== 11) return "участник";
        if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) return "участника";
        return "участников";
    }
    
    const membersPreview = document.createElement('div');
    membersPreview.className = 'group-members-preview';
    membersPreview.id = 'groupMembersPreview';
    membersPreview.style.cssText = `
        display: inline-flex;
        align-items: center;
        gap: 6px;
        margin-left: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
        padding: 4px 10px;
        border-radius: 20px;
        background: rgba(139, 92, 246, 0.1);
        flex-shrink: 0;
    `;
    
    membersPreview.innerHTML = `
        <div class="members-count-indicator" onclick="showGroupMembers('${currentChatId}')" 
             style="display: inline-flex; align-items: center; gap: 6px; cursor: pointer;">
            <i class="fas fa-users" style="font-size: ${isDesktop ? '13px' : '12px'}; color: #8b5cf6;"></i>
            <span style="font-size: ${isDesktop ? '13px' : '12px'}; color: #a78bfa; font-weight: 500;">${memberCount} ${getMemberWord(memberCount)}</span>
            <i class="fas fa-chevron-right" style="font-size: 10px; color: #64748b;"></i>
        </div>
    `;
    
    membersPreview.onmouseenter = () => {
        membersPreview.style.background = 'rgba(139, 92, 246, 0.2)';
        membersPreview.style.transform = 'translateY(-1px)';
    };
    membersPreview.onmouseleave = () => {
        membersPreview.style.background = 'rgba(139, 92, 246, 0.1)';
        membersPreview.style.transform = 'translateY(0)';
    };
    
    if (isDesktop) {
        const nameElement = chatHeaderInfo.querySelector('.desktop-chat-header-name');
        if (nameElement) {
            let titleRow = nameElement.parentNode;
            if (!titleRow.classList.contains('group-title-row')) {
                const wrapper = document.createElement('div');
                wrapper.className = 'group-title-row';
                wrapper.style.display = 'flex';
                wrapper.style.alignItems = 'center';
                wrapper.style.flexWrap = 'wrap';
                wrapper.style.gap = '8px';
                wrapper.style.width = '100%';
                nameElement.parentNode.insertBefore(wrapper, nameElement);
                wrapper.appendChild(nameElement);
                titleRow = wrapper;
            }
            titleRow.appendChild(membersPreview);
        } else {
            chatHeaderInfo.appendChild(membersPreview);
        }
    } else {
        const nameElement = chatHeaderInfo.querySelector('h2');
        if (nameElement) {
            let titleRow = nameElement.parentNode;
            if (!titleRow.classList.contains('group-title-row')) {
                const wrapper = document.createElement('div');
                wrapper.className = 'group-title-row';
                wrapper.style.display = 'flex';
                wrapper.style.alignItems = 'center';
                wrapper.style.justifyContent = 'space-between';
                wrapper.style.width = '100%';
                nameElement.parentNode.insertBefore(wrapper, nameElement);
                wrapper.appendChild(nameElement);
                titleRow = wrapper;
            }
            titleRow.appendChild(membersPreview);
        } else {
            chatHeaderInfo.appendChild(membersPreview);
        }
    }
    
    console.log("Индикатор количества участников добавлен справа от названия");
}

function forceRefreshGroupUI() {
    console.log("=== ПРИНУДИТЕЛЬНОЕ ОБНОВЛЕНИЕ ГРУППОВОГО ИНТЕРФЕЙСА ===");
    
    if (!currentChatId) {
        console.log("Нет открытого чата");
        return;
    }
    
    const chat = chats.find(c => c.id === currentChatId);
    if (!chat) {
        console.log("Чат не найден");
        return;
    }
    
    if (chat.type !== 'group') {
        console.log("Чат не является группой");
        return;
    }
    
    const oldGroupActions = document.querySelector('.group-actions');
    if (oldGroupActions) oldGroupActions.remove();
    
    const oldMembersPreview = document.getElementById('groupMembersPreview');
    if (oldMembersPreview) oldMembersPreview.remove();
    
    setTimeout(() => {
        addGroupActionButtons();
        addGroupMembersPreview();
    }, 100);
    
    console.log("Принудительное обновление выполнено");
}

window.forceRefreshGroupUI = forceRefreshGroupUI;

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
        contactsSelectList.innerHTML = '<div class="empty-state"><i class="fas fa-user-friends"></i><h3>Нет доступных контактов</h3><p>Все ваши контакты уже в группе</p></div>';
        return;
    }
    
    contactsSelectList.innerHTML = availableContacts.map(contact => `
        <div class="contact-select-item" data-user-id="${contact.userId}" data-custom-id="${contact.customId}">
            <div class="contact-select-avatar">${escapeHtml(contact.displayName.charAt(0))}</div>
            <div class="contact-select-info">
                <div class="contact-select-name">${escapeHtml(contact.displayName)} ${getVerifiedBadge(contact.userId)}</div>
                <div class="contact-select-id">${contact.customId}</div>
            </div>
            <div class="contact-select-checkbox">
                <i class="fas fa-check"></i>
            </div>
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
    if (!currentGroupChatId || selectedContactsForGroup.size === 0) {
        showNotification("Выберите хотя бы одного участника");
        return;
    }
    
    try {
        const chatRef = database.ref(`chats/${currentGroupChatId}`);
        const snapshot = await chatRef.once('value');
        const chat = snapshot.val();
        
        if (!chat) {
            showNotification("Чат не найден");
            return;
        }
        
        const updates = {};
        const newMembers = [];
        
        for (const userId of selectedContactsForGroup) {
            updates[`members/${userId}`] = true;
            newMembers.push(userId);
        }
        
        await chatRef.update(updates);
        
        const memberNames = newMembers.map(id => allUsers[id]?.displayName || id).join(', ');
        const systemMessage = {
            text: `👋 ${currentUser.displayName} добавил(а) участников: ${memberNames}`,
            senderId: 'system',
            senderName: 'Spectrum',
            timestamp: Date.now(),
            type: 'system'
        };
        
        await database.ref(`messages/${currentGroupChatId}`).push(systemMessage);
        
        showNotification(`✅ Добавлено ${selectedContactsForGroup.size} участников`);
        
        if (addMembersModal) addMembersModal.classList.remove('active');
        selectedContactsForGroup.clear();
        
        updateChatsDisplay();
        if (currentChatId === currentGroupChatId) {
            updateChatHeader();
            addGroupMembersPreview();
            addGroupActionButtons();
        }
        
    } catch (error) {
        console.error(error);
        showNotification("Ошибка при добавлении участников");
    }
}

function showGroupMembers(chatId) {
    const chat = chats.find(c => c.id === chatId);
    if (!chat || chat.type !== 'group') return;
    
    const memberIds = Object.keys(chat.members || {});
    const isCreator = chat.createdBy === currentUser?.uid;
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active members-list-modal';
    
    let membersHtml = '';
    for (const memberId of memberIds) {
        const member = allUsers[memberId];
        if (!member) continue;
        
        const isCurrentCreator = chat.createdBy === memberId;
        const roleText = isCurrentCreator ? 'Создатель' : 'Участник';
        
        membersHtml += `
            <div class="member-item" data-user-id="${memberId}">
                <div class="member-avatar">${escapeHtml(member.displayName.charAt(0))}</div>
                <div class="member-info">
                    <div class="member-name">
                        ${escapeHtml(member.displayName)} ${getVerifiedBadge(memberId)}
                        <span class="member-role">${roleText}</span>
                    </div>
                    <div class="member-status">${member.customId || memberId.substring(0, 8)}</div>
                </div>
                ${isCreator && !isCurrentCreator && memberId !== currentUser?.uid ? `
                    <button class="member-remove-btn" onclick="removeMemberFromGroup('${chatId}', '${memberId}')" title="Исключить">
                        <i class="fas fa-user-minus"></i>
                    </button>
                ` : ''}
            </div>
        `;
    }
    
    modal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h3><i class="fas fa-users"></i> Участники группы (${memberIds.length})</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="members-list">
                    ${membersHtml || '<div class="empty-state">Нет участников</div>'}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
}

window.removeMemberFromGroup = async function(chatId, userId) {
    if (!confirm(`Вы уверены, что хотите исключить ${allUsers[userId]?.displayName || userId} из группы?`)) return;
    
    try {
        await database.ref(`chats/${chatId}/members/${userId}`).remove();
        
        const systemMessage = {
            text: `🚫 ${currentUser.displayName} исключил(а) ${allUsers[userId]?.displayName || 'участника'} из группы`,
            senderId: 'system',
            senderName: 'Система',
            timestamp: Date.now(),
            type: 'system'
        };
        
        await database.ref(`messages/${chatId}`).push(systemMessage);
        showNotification("Участник исключен");
        
        document.querySelector('.members-list-modal')?.remove();
        updateChatsDisplay();
        if (currentChatId === chatId) {
            updateChatHeader();
            addGroupMembersPreview();
            addGroupActionButtons();
        }
        
    } catch (error) {
        console.error(error);
        showNotification("Ошибка при исключении");
    }
};

async function generateInviteLink(chatId) {
    const chat = chats.find(c => c.id === chatId);
    if (!chat || chat.type !== 'group') return null;
    
    const inviteCode = btoa(`${chatId}_${Date.now()}_${Math.random()}`).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
    const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000);
    
    const inviteData = {
        chatId: chatId,
        chatName: chat.name,
        createdBy: currentUser.uid,
        createdAt: Date.now(),
        expiresAt: expiresAt
    };
    
    await database.ref(`groupInvites/${inviteCode}`).set(inviteData);
    groupInviteLinks[chatId] = inviteCode;
    
    return `${window.location.origin}${window.location.pathname}?code=${inviteCode}`;
}

async function openInviteLinkModal(chatId) {
    let link = groupInviteLinks[chatId];
    if (!link) {
        showNotification("Генерация ссылки...");
        link = await generateInviteLink(chatId);
    }
    
    if (inviteLinkInput) inviteLinkInput.value = link || "Ошибка генерации";
    if (inviteLinkModal) inviteLinkModal.classList.add('active');
}

async function handleInviteLink() {
    const urlParams = new URLSearchParams(window.location.search);
    const inviteCode = urlParams.get('code');
    
    if (!inviteCode || !currentUser) return;
    
    try {
        const inviteRef = database.ref(`groupInvites/${inviteCode}`);
        const snapshot = await inviteRef.once('value');
        const inviteData = snapshot.val();
        
        if (!inviteData) {
            showNotification("❌ Приглашение недействительно");
            return;
        }
        
        if (inviteData.expiresAt < Date.now()) {
            showNotification("❌ Срок действия приглашения истек");
            await inviteRef.remove();
            return;
        }
        
        const chatId = inviteData.chatId;
        const chatRef = database.ref(`chats/${chatId}`);
        const chatSnapshot = await chatRef.once('value');
        const chat = chatSnapshot.val();
        
        if (!chat) {
            showNotification("❌ Группа не найдена");
            return;
        }
        
        if (chat.members && chat.members[currentUser.uid]) {
            showNotification("Вы уже состоите в этой группе");
            openChat(chatId);
            return;
        }
        
        await chatRef.update({ [`members/${currentUser.uid}`]: true });
        
        const systemMessage = {
            text: `✨ ${currentUser.displayName} присоединился(ась) к группе по приглашению`,
            senderId: 'system',
            senderName: 'Система',
            timestamp: Date.now(),
            type: 'system'
        };
        
        await database.ref(`messages/${chatId}`).push(systemMessage);
        
        showNotification(`✅ Вы присоединились к группе "${chat.name}"`);
        openChat(chatId);
        
        await inviteRef.remove();
        
        window.history.replaceState({}, document.title, window.location.pathname);
        
    } catch (error) {
        console.error(error);
        showNotification("Ошибка при присоединении к группе");
    }
}

function initGroupModals() {
    if (closeAddMembersModal) {
        closeAddMembersModal.onclick = () => addMembersModal?.classList.remove('active');
    }
    if (cancelAddMembersBtn) {
        cancelAddMembersBtn.onclick = () => addMembersModal?.classList.remove('active');
    }
    if (confirmAddMembersBtn) {
        confirmAddMembersBtn.onclick = addMembersToGroup;
    }
    
    if (closeInviteLinkModal) {
        closeInviteLinkModal.onclick = () => inviteLinkModal?.classList.remove('active');
    }
    if (closeInviteModalBtn) {
        closeInviteModalBtn.onclick = () => inviteLinkModal?.classList.remove('active');
    }
    if (copyInviteLinkBtn) {
        copyInviteLinkBtn.onclick = () => {
            if (inviteLinkInput?.value) {
                navigator.clipboard.writeText(inviteLinkInput.value);
                showNotification("Ссылка скопирована!");
            }
        };
    }
    
    if (addMembersModal) {
        addMembersModal.onclick = (e) => {
            if (e.target === addMembersModal) addMembersModal.classList.remove('active');
        };
    }
    if (inviteLinkModal) {
        inviteLinkModal.onclick = (e) => {
            if (e.target === inviteLinkModal) inviteLinkModal.classList.remove('active');
        };
    }
    
    if (membersSearch) {
        membersSearch.oninput = (e) => {
            const query = e.target.value.toLowerCase().trim();
            const items = document.querySelectorAll('.contact-select-item');
            items.forEach(item => {
                const name = item.querySelector('.contact-select-name')?.textContent.toLowerCase() || '';
                const id = item.querySelector('.contact-select-id')?.textContent.toLowerCase() || '';
                item.style.display = (name.includes(query) || id.includes(query)) ? 'flex' : 'none';
            });
        };
    }
}

// ================================================
// ВЫХОД ИЗ СИСТЕМЫ
// ================================================
async function logoutUser() {
    try { 
        cleanupListeners(); 
        if (currentUser) {
            localStorage.setItem('userStatus', 'offline');
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
        if (connectionCheckInterval) clearInterval(connectionCheckInterval); 
        if (inactivityTimer) clearInterval(inactivityTimer);
        showNotification("Вы вышли"); 
    } catch(e) { console.error(e); }
}

function startConnectionMonitoring() { 
    if (connectionCheckInterval) clearInterval(connectionCheckInterval); 
    connectionCheckInterval = setInterval(async () => { 
        if (currentUser && navigator.onLine) try { 
            await database.ref(`users/${currentUser.uid}`).update({ 
                lastActive: Date.now()
            }); 
        } catch(e) {} 
    }, 30000); 
}

function setupDragAndDrop() { 
    if (!messagesContainer) return; 
    messagesContainer.ondrop = (e) => { 
        e.preventDefault(); 
        const file = e.dataTransfer.files[0]; 
        if (file?.type.startsWith('image/')) showPhotoPreview(file); 
        else showNotification('Перетащите изображение'); 
    }; 
    messagesContainer.ondragover = (e) => e.preventDefault(); 
}

// ================================================
// ОСНОВНЫЕ ОБРАБОТЧИКИ СОБЫТИЙ
// ================================================
function setupEventListeners() {
    authTabs.forEach(tab => { 
        tab.onclick = () => { 
            const name = tab.dataset.form; 
            authTabs.forEach(t => t.classList.remove('active')); 
            tab.classList.add('active'); 
            if (loginForm) loginForm.classList.remove('active'); 
            if (registerForm) registerForm.classList.remove('active'); 
            if (name === 'login') { if (loginForm) loginForm.classList.add('active'); } 
            else { if (registerForm) registerForm.classList.add('active'); } 
            hideError(); 
        }; 
    });
    
    if (loginBtn) loginBtn.onclick = loginUser;
    if (quickLoginBtn) quickLoginBtn.onclick = quickLogin;
    if (registerBtn) registerBtn.onclick = registerUser;
    if (desktopEmptyCreateChatBtn) desktopEmptyCreateChatBtn.onclick = () => { if (createChatModal) createChatModal.classList.add('active'); };
    if (desktopEmptyAddContactBtn) desktopEmptyAddContactBtn.onclick = () => { if (addContactModal) addContactModal.classList.add('active'); };
    if (homeCreateChatBtn) homeCreateChatBtn.onclick = () => { if (createChatModal) createChatModal.classList.add('active'); };
    if (homeAddContactBtn) homeAddContactBtn.onclick = () => { if (addContactModal) addContactModal.classList.add('active'); };
    if (backToHomeBtn) backToHomeBtn.onclick = showHomeScreen;
    if (sendMessageBtn) sendMessageBtn.onclick = sendMessage;
    if (copyHomeIdBtn) copyHomeIdBtn.onclick = () => { if (homeUserId) navigator.clipboard.writeText(homeUserId.textContent); showNotification('ID скопирован!'); };
    
    if (desktopCreateChatIcon) {
        desktopCreateChatIcon.onclick = () => {
            if (createChatModal) createChatModal.classList.add('active');
        };
    }
    
    if (desktopAddContactIcon) {
        desktopAddContactIcon.onclick = () => {
            if (addContactModal) addContactModal.classList.add('active');
        };
    }
    
    if (desktopProfileIcon) {
        desktopProfileIcon.onclick = () => {
            openProfileModal();
        };
    }
    
    if (desktopSettingsIcon) {
        desktopSettingsIcon.onclick = () => {
            if (editProfileModal) editProfileModal.classList.add('active');
        };
    }
    
    if (messageInput) {
        messageInput.onkeypress = (e) => { 
            if (e.key === 'Enter' && !e.shiftKey) { 
                e.preventDefault(); 
                sendMessage(); 
            } 
        };
    }
    
    if (cancelCreateBtn) cancelCreateBtn.onclick = () => { if (createChatModal) createChatModal.classList.remove('active'); resetCreateForm(); };
    
    chatTypeOptions.forEach(opt => { 
        opt.onclick = () => { 
            chatTypeOptions.forEach(o => o.classList.remove('active')); 
            opt.classList.add('active'); 
            selectedChatType = opt.dataset.type; 
            const isPrivate = selectedChatType === 'private'; 
            if (chatDescriptionGroup) chatDescriptionGroup.style.display = isPrivate ? 'none' : 'block'; 
            if (privateChatUser) privateChatUser.style.display = isPrivate ? 'block' : 'none'; 
            if (chatNameInput) { 
                chatNameInput.disabled = isPrivate; 
                chatNameInput.placeholder = isPrivate ? "Имя чата (автоматически)" : "Введите название"; 
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
            if (!val) { showNotification("Введите ID"); return; } 
            const res = searchUsers(val, contacts); 
            const found = res.find(r => !r.isContact); 
            if (found) { 
                await addContact(found.customId); 
                if (addContactModal) addContactModal.classList.remove('active'); 
                if (contactSearch) contactSearch.value = ''; 
                hideSearchResults('contactSearchResults'); 
                if (confirmAddContactBtn) confirmAddContactBtn.disabled = true; 
            } else showNotification("Выберите пользователя из списка"); 
        };
    }
    
    if (privateUserId) {
        privateUserId.oninput = () => { 
            const q = privateUserId.value.toLowerCase().trim(); 
            if (!privateUserSearchResults) return; 
            if (!q) { privateUserSearchResults.style.display = 'none'; return; } 
            const res = []; 
            for (const id in allUsers) { 
                if (id !== currentUser?.uid) { 
                    const u = allUsers[id]; 
                    if (u.displayName.toLowerCase().includes(q) || u.customId?.toLowerCase().includes(q)) res.push(u); 
                } 
            } 
            if (res.length) { 
                privateUserSearchResults.style.display = 'block'; 
                privateUserSearchResults.innerHTML = res.slice(0,5).map(u => `<div class="search-result-item" data-custom-id="${u.customId}">
                    <div class="search-result-avatar">${escapeHtml(u.displayName.charAt(0))}</div>
                    <div class="search-result-info">
                        <div class="search-result-name">${escapeHtml(u.displayName)}</div>
                        <div class="search-result-id">${u.customId}</div>
                    </div>
                </div>`).join(''); 
                document.querySelectorAll('#privateUserSearchResults .search-result-item').forEach(el => { 
                    el.onclick = () => { 
                        if (privateUserId) privateUserId.value = el.dataset.customId; 
                        if (privateUserSearchResults) privateUserSearchResults.style.display = 'none'; 
                    }; 
                }); 
            } else { 
                privateUserSearchResults.innerHTML = '<div class="no-results">Не найдены</div>'; 
                privateUserSearchResults.style.display = 'block'; 
            } 
        };
    }
    
    if (copyUserIdBtn) copyUserIdBtn.onclick = () => { if (profileUserId) navigator.clipboard.writeText(profileUserId.textContent); showNotification('ID скопирован!'); };
    if (logoutBtn) logoutBtn.onclick = logoutUser;
    
    if (editProfileBtn) {
        editProfileBtn.onclick = () => { 
            if (profileModal) profileModal.classList.remove('active'); 
            if (editProfileModal) editProfileModal.classList.add('active'); 
            if (editProfileName) editProfileName.value = currentUser?.displayName || ''; 
            
            const savedStatus = currentUser?.selectedStatus || currentUser?.status || 'online';
            
            statusOptions.forEach(opt => { 
                opt.classList.remove('active'); 
                if (opt.dataset.status === savedStatus) {
                    opt.classList.add('active');
                }
            }); 
        };
    }
    
    if (cancelEditProfileBtn) cancelEditProfileBtn.onclick = () => { if (editProfileModal) editProfileModal.classList.remove('active'); if (profileModal) profileModal.classList.add('active'); };
    if (saveProfileBtn) saveProfileBtn.onclick = saveProfileChanges;
    
    statusOptions.forEach(opt => { 
        opt.onclick = () => { 
            statusOptions.forEach(o => o.classList.remove('active')); 
            opt.classList.add('active'); 
        }; 
    });
    
    if (cancelLeaveBtn) cancelLeaveBtn.onclick = () => { if (confirmLeaveChatModal) confirmLeaveChatModal.classList.remove('active'); };
    if (cancelDeleteBtn) cancelDeleteBtn.onclick = () => { if (confirmDeleteMessageModal) confirmDeleteMessageModal.classList.remove('active'); };
    
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
            if (replyToMessage) { hideReplyPreview(); showNotification("Ответ отменен"); } 
            document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active')); 
            if (messageContextMenu) messageContextMenu.classList.remove('active'); 
            if (mobileCreateModal?.classList.contains('active')) mobileCreateModal.classList.remove('active'); 
            hideSearchResults('homeContactsSearchResults'); 
            hideSearchResults('contactSearchResults'); 
        } 
    };
    
    setupContactSearch();
    setupHomeContactsSearch();
}

function setupContactSearch() {
    if (!contactSearch) return;
    contactSearch.oninput = function() { 
        clearTimeout(searchTimeouts.modal); 
        const q = this.value.trim(); 
        if (q.length < 1) { 
            hideSearchResults('contactSearchResults'); 
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
    document.addEventListener('click', (e) => { 
        if (!contactSearch?.contains(e.target) && !contactSearchResults?.contains(e.target)) hideSearchResults('contactSearchResults'); 
    });
}

window.downloadFile = (data, name) => { const a = document.createElement('a'); a.href = data; a.download = name; a.click(); };
window.showFullPhoto = (src) => { if (photoViewModal && fullSizePhoto) { fullSizePhoto.src = src; photoViewModal.classList.add('active'); } };

window.addEventListener('beforeunload', async () => { 
    if (currentUser) {
        try { 
            await database.ref(`users/${currentUser.uid}`).update({ 
                status: "offline",
                lastActive: Date.now()
            });
            console.log("Статус изменён на offline при закрытии");
        } catch(e) {
            console.error("Ошибка при закрытии:", e);
        }
    }
    if (authUnsubscribe) authUnsubscribe(); 
    cleanupListeners(); 
    if (connectionCheckInterval) clearInterval(connectionCheckInterval); 
    if (inactivityTimer) clearInterval(inactivityTimer);
});

window.addEventListener('focus', async () => { 
    if (currentUser && navigator.onLine) try { 
        await database.ref(`users/${currentUser.uid}`).update({ 
            lastActive: Date.now()
        }); 
        updateUserProfileDisplay(); 
        updateDesktopUserInfo(); 
        updateMobileProfile(); 
    } catch(e) {} 
});

window.addEventListener('online', async () => { 
    if (currentUser) try { 
        await database.ref(`users/${currentUser.uid}`).update({ 
            lastActive: Date.now()
        }); 
        updateUserProfileDisplay(); 
        updateDesktopUserInfo(); 
        updateMobileProfile(); 
        showNotification("Соединение восстановлено"); 
    } catch(e) {} 
});

window.addEventListener('offline', async () => { 
    if (currentUser) try { 
        showNotification("Потеряно соединение"); 
    } catch(e) {} 
});
