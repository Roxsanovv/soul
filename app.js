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

// ================================================
// DOM ЭЛЕМЕНТЫ
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
const desktopUserInfoBtn = document.getElementById('desktopUserInfoBtn');
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
const adminUserSearch = document.getElementById('adminUserSearch');
const adminSearchResults = document.getElementById('adminSearchResults');

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
    setupFileUpload();
    setupAdminPanel();
    setupMobileInterface();
    setupReactionsHandlers();
    setupAttachModal();
    
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
// ФУНКЦИИ ДЛЯ ВЛОЖЕНИЙ
// ================================================
function setupAttachModal() {
    if (!attachBtn) return;
    attachBtn.addEventListener('click', () => showAttachTypeModal());
    if (closeAttachTypeModalBtn) closeAttachTypeModalBtn.addEventListener('click', () => closeAttachTypeModal());
    if (attachPhotoOptionBtn) attachPhotoOptionBtn.addEventListener('click', () => { closeAttachTypeModal(); triggerPhotoUpload(); });
    if (attachFileOptionBtn) attachFileOptionBtn.addEventListener('click', () => { closeAttachTypeModal(); triggerFileUpload(); });
    if (attachTypeModal) attachTypeModal.addEventListener('click', (e) => { if (e.target === attachTypeModal) closeAttachTypeModal(); });
}

function showAttachTypeModal() { if (attachTypeModal) attachTypeModal.classList.add('active'); }
function closeAttachTypeModal() { if (attachTypeModal) attachTypeModal.classList.remove('active'); }

function triggerPhotoUpload() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
    fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const MAX_SIZE = 20 * 1024 * 1024;
        if (file.size > MAX_SIZE) { showNotification('❌ Файл слишком большой. Максимум: 20MB'); fileInput.remove(); return; }
        showPhotoPreview(file);
        fileInput.remove();
    });
    fileInput.click();
}

function triggerFileUpload() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
    fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const MAX_SIZE = 20 * 1024 * 1024;
        if (file.size > MAX_SIZE) { showNotification('❌ Файл слишком большой. Максимум: 20MB'); fileInput.remove(); return; }
        showFilePreview(file);
        fileInput.remove();
    });
    fileInput.click();
}

function setupPhotoUpload() {
    if (photoPreviewRemove) photoPreviewRemove.addEventListener('click', () => clearPhotoPreview());
    if (closePhotoModal) closePhotoModal.addEventListener('click', () => { if (photoViewModal) photoViewModal.classList.remove('active'); if (fullSizePhoto) fullSizePhoto.src = ''; });
    if (photoViewModal) photoViewModal.addEventListener('click', (e) => { if (e.target === photoViewModal) { photoViewModal.classList.remove('active'); fullSizePhoto.src = ''; } });
}

function showPhotoPreview(file) {
    selectedPhoto = file;
    const reader = new FileReader();
    reader.onload = (e) => { if (photoPreview) photoPreview.src = e.target.result; };
    reader.readAsDataURL(file);
    if (photoPreviewName) { const name = file.name.length > 25 ? file.name.substring(0, 22) + '...' : file.name; photoPreviewName.textContent = name; }
    if (photoPreviewSize) { const size = (file.size / 1024).toFixed(1); photoPreviewSize.innerHTML = `<i class="fas fa-image"></i> ${size} KB`; }
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

function showPhotoProgress(percent) { if (photoProgress) { photoProgress.style.display = 'block'; if (photoProgressBar) photoProgressBar.style.width = percent + '%'; if (photoProgressText) photoProgressText.textContent = percent + '%'; } }
function hidePhotoProgress() { if (photoProgress) photoProgress.style.display = 'none'; if (photoProgressBar) photoProgressBar.style.width = '0%'; }

function setupFileUpload() { if (filePreviewRemove) filePreviewRemove.addEventListener('click', () => clearFilePreview()); }

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

function showFileProgress(percent) { if (fileProgress) { fileProgress.style.display = 'block'; if (fileProgressBar) fileProgressBar.style.width = percent + '%'; if (fileProgressText) fileProgressText.textContent = percent + '%'; } }
function hideFileProgress() { if (fileProgress) fileProgress.style.display = 'none'; if (fileProgressBar) fileProgressBar.style.width = '0%'; }

function fileToBase64WithProgress(file, onProgress) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.onprogress = (e) => { if (e.lengthComputable && onProgress) onProgress(e.loaded / e.total); };
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
    if (!name || !email || !password || !confirmPassword) { showError("Пожалуйста, заполните все поля"); return; }
    if (password.length < 6) { showError("Пароль должен содержать минимум 6 символов"); return; }
    if (password !== confirmPassword) { showError("Пароли не совпадают"); return; }
    try { 
        setLoading(true); 
        hideError(); 
        const result = await auth.createUserWithEmailAndPassword(email, password); 
        await result.user.updateProfile({ displayName: name }); 
        showSuccess(); 
    } catch (error) { 
        showError(getAuthErrorMessage(error)); 
        setLoading(false); 
    }
}

function showError(message) { if (authError) { authError.textContent = message; authError.classList.add('active'); } }
function hideError() { if (authError) authError.classList.remove('active'); }
function showSuccess() { if (authSuccess) authSuccess.classList.add('active'); }

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
            await userRef.update({ lastActive: Date.now() });
            currentUser.status = "online";
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
    if (adminPanelBtn) adminPanelBtn.style.display = (currentUser && verifiedUsers && verifiedUsers[currentUser.uid] && verifiedUsers[currentUser.uid].type === 'admin') ? 'flex' : 'none'; 
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
    if (contactsListener && currentUser) database.ref(`users/${currentUser.uid}/contacts`).off('value', contactsListener);
    if (chatsListener) database.ref('chats').off('value', chatsListener);
    Object.values(messageListeners).forEach(fn => { if (typeof fn === 'function') fn(); });
    messageListeners = {};
}

function setupContactsListener() {
    if (!currentUser) return;
    const contactsRef = database.ref(`users/${currentUser.uid}/contacts`);
    if (contactsListener) contactsRef.off('value', contactsListener);
    contactsListener = contactsRef.on('value', (snapshot) => { updateContactsList(snapshot); updateContactsDisplay(); });
}

function setupChatsListener() {
    if (!currentUser) return;
    const chatsRef = database.ref('chats');
    if (chatsListener) chatsRef.off('value', chatsListener);
    chatsListener = chatsRef.orderByChild(`members/${currentUser.uid}`).equalTo(true).on('value', (snapshot) => { updateChatsList(snapshot); updateChatsDisplay(); });
}

function updateContactsList(snapshot) {
    const contactsData = snapshot.val();
    if (!contactsData || typeof contactsData !== 'object') { contacts = []; return; }
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
        div.innerHTML = `<div class="search-result-avatar">${escapeHtml(result.displayName.charAt(0))}</div>
            <div class="search-result-info">
                <div class="search-result-name">${escapeHtml(result.displayName)} ${getVerifiedBadge(result.userId)}</div>
                <div class="search-result-id">${result.customId}</div>
                <div class="search-result-status ${result.status}">${result.status}</div>
            </div>
            <button class="add-user-btn" ${result.isContact ? 'disabled' : ''}>${result.isContact ? 'В контактах ✓' : 'Добавить'}</button>`;
        const btn = div.querySelector('.add-user-btn');
        if (!result.isContact) btn.addEventListener('click', async (e) => { 
            e.stopPropagation(); 
            await addContact(result.customId); 
            displaySearchResults(searchUsers(contactSearch?.value || '', currentContacts), containerId, currentContacts); 
        });
        div.addEventListener('click', () => { 
            if (result.isContact) { 
                openOrCreatePrivateChat(result.userId); 
                const modal = document.getElementById('addContactModal'); 
                if (modal) modal.classList.remove('active'); 
            } 
        });
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
// СОЗДАНИЕ ЭЛЕМЕНТОВ СООБЩЕНИЙ
// ================================================
function createMessageElement(message) {
    const isOutgoing = message.senderId === currentUser?.uid;
    const div = document.createElement('div');
    div.className = `message ${isOutgoing ? 'outgoing' : 'incoming'} ${isMobile ? 'mobile' : 'desktop'}`;
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
    let photoHtml = '', fileHtml = '';
    if (message.type === 'photo' && message.photo) photoHtml = `<img src="${message.photo}" class="message-photo" alt="Photo" onclick="window.showFullPhoto && showFullPhoto('${message.photo}')">`;
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
    div.innerHTML = `<div class="message-avatar">${escapeHtml(senderName.charAt(0))}</div>
        <div class="message-content">
            <div class="message-sender">
                <span class="message-sender-name" onclick="openUserProfileModal('${message.senderId}')">${escapeHtml(senderName)} ${getVerifiedBadge(message.senderId)}</span>
                <span class="message-time">${time}</span>
            </div>
            ${replyHtml}
            ${photoHtml}
            ${fileHtml}
            ${message.type !== 'photo' && message.type !== 'file' ? `<div class="message-text">${escapeHtml(message.text)}</div>` : ''}
        </div>`;
    div.addEventListener('dblclick', (e) => { 
        if (!e.target.closest('.message-reactions') && !e.target.closest('.reaction-badge') && !e.target.closest('.message-photo') && !e.target.closest('.message-file') && currentChatId && message.id) 
            toggleReaction(message.id, '❤️'); 
    });
    div.addEventListener('contextmenu', (e) => { 
        e.preventDefault(); 
        showMessageContextMenu(e, message, isOutgoing); 
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
            Object.values(data).forEach((msg, i) => { 
                const el = createMessageElement({ id: Object.keys(data)[i], ...msg }); 
                messagesContainer.appendChild(el); 
            });
            setTimeout(() => scrollToLastMessage('auto'), 100);
        } else messagesContainer.innerHTML = '<div class="empty-state"><i class="fas fa-comments"></i><h3>Нет сообщений</h3><p>Напишите первое сообщение!</p></div>';
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
    if (contextDelete) contextDelete.style.display = isOutgoing ? 'flex' : 'none';
    messageContextMenu.dataset.messageId = message.id;
    messageContextMenu.style.left = e.clientX + 'px';
    messageContextMenu.style.top = e.clientY + 'px';
    messageContextMenu.classList.add('active');
    setTimeout(() => document.addEventListener('click', function closeMenu(ev) { 
        if (!messageContextMenu.contains(ev.target)) { 
            messageContextMenu.classList.remove('active'); 
            document.removeEventListener('click', closeMenu); 
        } 
    }), 10);
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
        if (chatScreen) { 
            chatScreen.style.display = 'flex'; 
            chatScreen.classList.add('mobile'); 
        } 
        if (desktopEmptyScreen) desktopEmptyScreen.style.display = 'none'; 
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
    setTimeout(hideScrollToBottomButton, 500);
    if (messageInput) setTimeout(() => messageInput.focus(), 300);
}

function updateChatHeader() {
    if (!currentChatId) return;
    const chat = chats.find(c => c.id === currentChatId);
    if (!chat || chat.type !== 'private') return;
    const otherId = Object.keys(chat.members).find(id => id !== currentUser?.uid);
    const other = allUsers[otherId];
    if (other && isMobile && chatHeaderName) chatHeaderName.innerHTML = `<span class="chat-header-name-with-badge">${escapeHtml(other.displayName)} ${getVerifiedBadge(otherId)}</span>`;
    else if (other && desktopChatHeaderName) desktopChatHeaderName.innerHTML = `<span class="chat-header-name-with-badge">${escapeHtml(other.displayName)} ${getVerifiedBadge(otherId)}</span>`;
}

function showHomeScreen() {
    currentChatId = null;
    replyToMessage = null;
    hideReplyPreview();
    if (isMobile) { 
        if (chatScreen) chatScreen.style.display = 'none'; 
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
    if (data) for (const id in data) if (data[id].members?.[currentUser.uid] && data[id].members?.[targetUserId]) return id;
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
            for (const id in allUsers) if (allUsers[id].customId === customId) { target = allUsers[id]; targetId = id; break; }
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
                lastMessage: { text: "Чат создан", timestamp: Date.now(), senderId: currentUser.uid } 
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
    chatTypeOptions.forEach(opt => { opt.classList.remove('active'); if (opt.dataset.type === 'group') opt.classList.add('active'); });
    if (chatDescriptionGroup) chatDescriptionGroup.style.display = 'block';
    if (privateChatUser) privateChatUser.style.display = 'none';
    if (chatNameInput) { chatNameInput.disabled = false; chatNameInput.placeholder = "Введите название"; }
}

// ================================================
// КОНТАКТЫ
// ================================================
async function addContact(targetCustomId) {
    try {
        let targetId = null, targetUser = null;
        for (const id in allUsers) if (allUsers[id].customId === targetCustomId) { targetUser = allUsers[id]; targetId = id; break; }
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
        document.getElementById('createFirstChatBtn')?.addEventListener('click', () => { if (createChatModal) createChatModal.classList.add('active'); }); 
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
        return a.displayName.localeCompare(b.displayName); 
    }).forEach(c => homeContactsList.appendChild(createContactElement(c)));
}

function createChatElement(chat) {
    const div = document.createElement('div');
    div.className = 'chat-item';
    div.dataset.chatId = chat.id;
    let avatar, name;
    if (chat.type === 'group') { 
        avatar = '<i class="fas fa-users"></i>'; 
        name = chat.name; 
    } else { 
        const otherId = Object.keys(chat.members).find(id => id !== currentUser?.uid); 
        const other = allUsers[otherId]; 
        avatar = other ? other.displayName.charAt(0) : '?'; 
        name = other ? other.displayName : "Неизвестный"; 
    }
    let lastMsg = "Нет сообщений", lastTime = "";
    if (chat.lastMessage) { 
        lastMsg = chat.lastMessage.type === 'photo' ? '📸 Фото' : (chat.lastMessage.type === 'file' ? '📎 Файл' : (chat.lastMessage.text || "Сообщение")); 
        if (lastMsg.length > 30) lastMsg = lastMsg.substring(0, 30) + '...'; 
        if (chat.lastMessage.timestamp) lastTime = new Date(chat.lastMessage.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }); 
    }
    div.innerHTML = `<div class="chat-avatar ${chat.type === 'group' ? 'group-avatar' : 'private-avatar'}">${avatar}</div>
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
    div.innerHTML = `<div class="contact-avatar">${escapeHtml(contact.displayName.charAt(0))}</div>
        <div class="contact-info">
            <div class="contact-name" onclick="event.stopPropagation(); openUserProfileModal('${contact.userId}')">${escapeHtml(contact.displayName)} ${getVerifiedBadge(contact.userId)}</div>
            <div class="contact-status ${contact.status || 'offline'}">${contact.status || 'offline'}</div>
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
    let avatar, name;
    if (chat.type === 'group') { 
        avatar = '<i class="fas fa-users"></i>'; 
        name = chat.name; 
    } else { 
        const otherId = Object.keys(chat.members).find(id => id !== currentUser?.uid); 
        const other = allUsers[otherId]; 
        avatar = other ? other.displayName.charAt(0) : '?'; 
        name = other ? other.displayName : "Неизвестный"; 
    }
    let lastMsg = "Нет сообщений", lastTime = "";
    if (chat.lastMessage) { 
        lastMsg = chat.lastMessage.type === 'photo' ? '📸 Фото' : (chat.lastMessage.type === 'file' ? '📎 Файл' : (chat.lastMessage.text || "Сообщение")); 
        if (lastMsg.length > 30) lastMsg = lastMsg.substring(0, 30) + '...'; 
        if (chat.lastMessage.timestamp) lastTime = new Date(chat.lastMessage.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }); 
    }
    div.innerHTML = `<div class="desktop-chat-avatar" style="background: ${chat.type === 'group' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)'}">${avatar}</div>
        <div class="desktop-chat-info">
            <div class="desktop-chat-name">${escapeHtml(name)}</div>
            <div class="desktop-chat-last-message">${lastTime ? lastTime + ' • ' + lastMsg : lastMsg}</div>
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
        return a.displayName.localeCompare(b.displayName); 
    }).forEach(c => desktopContactsList.appendChild(createDesktopContactElement(c)));
}

function createDesktopContactElement(contact) {
    const div = document.createElement('div');
    div.className = 'desktop-chat-item';
    div.dataset.userId = contact.userId;
    const color = contact.status === 'online' ? '#10b981' : contact.status === 'away' ? '#f59e0b' : contact.status === 'dnd' ? '#ef4444' : '#94a3b8';
    div.innerHTML = `<div class="desktop-chat-avatar" style="background: linear-gradient(135deg, #f093fb, #f5576c)">${escapeHtml(contact.displayName.charAt(0))}</div>
        <div class="desktop-chat-info">
            <div class="desktop-chat-name">${escapeHtml(contact.displayName)} ${getVerifiedBadge(contact.userId)}</div>
            <div class="desktop-chat-last-message" style="color: ${color}">${contact.status || 'offline'} • ${contact.customId}</div>
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
    let avatar, name;
    if (chat.type === 'group') { 
        avatar = '<i class="fas fa-users"></i>'; 
        name = chat.name; 
    } else { 
        const otherId = Object.keys(chat.members).find(id => id !== currentUser?.uid); 
        const other = allUsers[otherId]; 
        avatar = other ? other.displayName.charAt(0) : '?'; 
        name = other ? other.displayName : "Неизвестный"; 
    }
    let lastMsg = "Нет сообщений", lastTime = "";
    if (chat.lastMessage) { 
        lastMsg = chat.lastMessage.type === 'photo' ? '📸 Фото' : (chat.lastMessage.type === 'file' ? '📎 Файл' : (chat.lastMessage.text || "Сообщение")); 
        if (lastMsg.length > 30) lastMsg = lastMsg.substring(0, 30) + '...'; 
        if (chat.lastMessage.timestamp) lastTime = new Date(chat.lastMessage.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }); 
    }
    div.innerHTML = `<div class="mobile-chat-avatar ${chat.type === 'group' ? 'group' : 'private'}">${avatar}</div>
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
    div.innerHTML = `<div class="mobile-contact-avatar">${escapeHtml(contact.displayName.charAt(0))}</div>
        <div class="mobile-contact-info">
            <div class="mobile-contact-name">${escapeHtml(contact.displayName)} ${getVerifiedBadge(contact.userId)}</div>
            <div class="mobile-contact-status ${contact.status || 'offline'}"><i class="fas fa-circle"></i> ${contact.status || 'offline'}</div>
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
        const s = currentUser.status === 'offline' ? 'offline' : 'online'; 
        mobileProfileStatus.innerHTML = `<i class="fas fa-circle"></i> ${s}`; 
        mobileProfileStatus.style.color = s === 'online' ? '#10b981' : '#64748b'; 
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
        const s = currentUser.status === 'offline' ? 'offline' : 'online'; 
        ps.textContent = s; 
        ps.className = `profile-status ${s}`; 
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
    modal.innerHTML = `<div class="modal">
        <div class="modal-header">
            <h3>Профиль</h3>
            <button class="modal-close" onclick="this.closest('.modal-overlay').remove()"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
            <div class="profile-avatar-large">${escapeHtml(user.displayName.charAt(0))}</div>
            <div class="profile-info">
                <div class="profile-name-with-badge" style="justify-content:center;">${escapeHtml(user.displayName)} ${getVerifiedBadge(userId)}</div>
                <div class="profile-status ${user.status || 'offline'}">${user.status || 'offline'}</div>
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
        const active = document.querySelector('.status-option.active');
        const newStatus = active ? active.dataset.status : 'online';
        if (!newName) { showNotification("Введите имя"); return; }
        await database.ref(`users/${currentUser.uid}`).update({ displayName: newName, status: newStatus, lastActive: Date.now() });
        currentUser.displayName = newName;
        currentUser.status = newStatus;
        if (allUsers[currentUser.uid]) { 
            allUsers[currentUser.uid].displayName = newName; 
            allUsers[currentUser.uid].status = newStatus; 
        }
        if (editProfileModal) editProfileModal.classList.remove('active');
        showNotification("Профиль обновлен!");
        updateUserProfileDisplay();
        updateUserIDs();
        updateMobileProfile();
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
        const s = currentUser.status === 'offline' ? 'offline' : 'online'; 
        ps.textContent = s; 
        ps.className = `profile-status ${s}`; 
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
    if (desktopUserAvatar) desktopUserAvatar.textContent = currentUser.displayName.charAt(0);
    if (desktopUserName) desktopUserName.textContent = currentUser.displayName;
    if (desktopUserStatus) { 
        const s = currentUser.status === 'offline' ? 'offline' : 'online'; 
        desktopUserStatus.innerHTML = `<i class="fas fa-circle"></i><span>${s}</span>`; 
        desktopUserStatus.style.color = s === 'online' ? '#10b981' : '#64748b'; 
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
    if (adminUserSearch) adminUserSearch.oninput = () => { 
        const q = adminUserSearch.value.toLowerCase().trim(); 
        if (q.length < 2) { if (adminSearchResults) adminSearchResults.innerHTML = ''; return; } 
        const res = []; 
        for (const id in allUsers) { 
            const u = allUsers[id]; 
            if (u.displayName?.toLowerCase().includes(q) || u.customId?.toLowerCase().includes(q)) 
                res.push({ userId: id, displayName: u.displayName, customId: u.customId, hasBadge: !!verifiedUsers[id] }); 
        } 
        if (adminSearchResults) adminSearchResults.innerHTML = res.slice(0,5).map(u => `<div class="search-result-item" onclick="selectUserForBadge('${u.userId}','${u.displayName}')">
            <div class="search-result-avatar">${escapeHtml(u.displayName.charAt(0))}</div>
            <div class="search-result-info">
                <div class="search-result-name">${escapeHtml(u.displayName)}</div>
                <div class="search-result-id">${u.customId}</div>
            </div>
            <span style="color:#64748b">${u.hasBadge ? 'Есть галочка' : 'Нет галочки'}</span>
        </div>`).join(''); 
    };
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

window.selectUserForBadge = function(userId, name) { 
    if (badgeUserId) badgeUserId.value = userId; 
    if (adminUserSearch) adminUserSearch.value = ''; 
    if (adminSearchResults) adminSearchResults.innerHTML = ''; 
    showNotification(`Выбран: ${name}`); 
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
    updateHomeContacts(); 
    updateDesktopChats(); 
    updateDesktopContacts(); 
    updateMobileChats(); 
    updateMobileContacts(); 
    updateMobileProfile(); 
    if (isMobile) initMobileInterface(); 
    else initDesktopInterface(); 
}

function setupMobileInterface() {
    if (mobileNavItems.length) mobileNavItems.forEach(item => { 
        item.onclick = () => { 
            mobileNavItems.forEach(n => n.classList.remove('active')); 
            item.classList.add('active'); 
            mobileTabs.forEach(t => t.classList.remove('active')); 
            document.getElementById(`mobile${item.dataset.tab.charAt(0).toUpperCase() + item.dataset.tab.slice(1)}Tab`)?.classList.add('active'); 
        }; 
    });
    
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
    if (privateInput) privateInput.oninput = function() { 
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
    
    document.getElementById('mobileCreateGroupBtn')?.addEventListener('click', async () => { 
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
    });
    
    document.getElementById('mobileCreatePrivateBtn')?.addEventListener('click', async () => { 
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
    });
    
    document.getElementById('mobileCreateChannelBtn')?.addEventListener('click', () => { 
        showNotification("Каналы будут доступны в следующем обновлении"); 
        if (mobileCreateModal) mobileCreateModal.classList.remove('active'); 
    });
    
    if (mobileSearchChats) mobileSearchChats.oninput = (e) => { 
        const q = e.target.value.toLowerCase(); 
        document.querySelectorAll('.mobile-chat-item').forEach(el => { 
            const n = el.querySelector('.mobile-chat-name')?.textContent.toLowerCase() || ''; 
            const m = el.querySelector('.mobile-chat-last-message')?.textContent.toLowerCase() || ''; 
            el.style.display = (n.includes(q) || m.includes(q)) ? 'flex' : 'none'; 
        }); 
    };
    
    if (mobileSearchContacts) mobileSearchContacts.oninput = (e) => { 
        const q = e.target.value.toLowerCase(); 
        document.querySelectorAll('.mobile-contact-item').forEach(el => { 
            const n = el.querySelector('.mobile-contact-name')?.textContent.toLowerCase() || ''; 
            el.style.display = n.includes(q) ? 'flex' : 'none'; 
        }); 
    };
    
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
                if (opt.dataset.status === currentUser?.status) opt.classList.add('active'); 
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
    document.getElementById('cancelReplyBtn')?.addEventListener('click', hideReplyPreview); 
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
if (contextReply) contextReply.onclick = () => { 
    const msgId = messageContextMenu?.dataset.messageId; 
    if (!msgId) return; 
    const el = document.querySelector(`[data-message-id="${msgId}"]`); 
    if (!el) return; 
    const text = el.querySelector('.message-text')?.textContent || ''; 
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

if (contextCopy) contextCopy.onclick = () => { 
    const msgId = messageContextMenu?.dataset.messageId; 
    if (msgId) { 
        const text = document.querySelector(`[data-message-id="${msgId}"] .message-text`)?.textContent || ''; 
        navigator.clipboard.writeText(text); 
        showNotification("Скопировано"); 
        if (messageContextMenu) messageContextMenu.classList.remove('active'); 
    } 
};

if (contextDelete) contextDelete.onclick = () => { 
    const msgId = messageContextMenu?.dataset.messageId; 
    const isOut = messageContextMenu?.dataset.isOutgoing === 'true'; 
    if (!msgId || !currentChatId || !isOut) { 
        if (messageContextMenu) messageContextMenu.classList.remove('active'); 
        return; 
    } 
    const el = document.querySelector(`[data-message-id="${msgId}"]`); 
    if (!el) return; 
    const text = el.querySelector('.message-text')?.textContent || ''; 
    const sender = el.querySelector('.message-sender-name')?.textContent?.split(' ')[0] || ''; 
    showDeleteMessageConfirmation(msgId, currentChatId, text, sender, Date.now()); 
};

function showDeleteMessageConfirmation(msgId, chatId, text, sender, ts) { 
    if (!confirmDeleteMessageModal || !messagePreview) return; 
    messagePreview.innerHTML = `<div class="message-preview-header">
        <div class="message-preview-avatar">${sender?.charAt(0) || '?'}</div>
        <div class="message-preview-sender">${sender || "Вы"}</div>
        <div class="message-preview-time">${new Date(ts).toLocaleTimeString()}</div>
    </div>
    <div class="message-preview-text">${escapeHtml(text)}</div>`;
    confirmDeleteMessageModal.classList.add('active'); 
    if (messageContextMenu) messageContextMenu.classList.remove('active'); 
    if (confirmDeleteBtn) confirmDeleteBtn.onclick = async () => { 
        try { 
            await database.ref(`messages/${chatId}/${msgId}`).remove(); 
            showNotification("Удалено"); 
            document.querySelector(`[data-message-id="${msgId}"]`)?.remove(); 
            confirmDeleteMessageModal.classList.remove('active'); 
        } catch(e) { 
            showNotification("Ошибка"); 
            confirmDeleteMessageModal.classList.remove('active'); 
        } 
    }; 
}

// ================================================
// ВЫХОД ИЗ СИСТЕМЫ
// ================================================
async function logoutUser() {
    try { 
        cleanupListeners(); 
        if (currentUser) await database.ref(`users/${currentUser.uid}`).update({ status: "offline", lastActive: Date.now() }); 
        await auth.signOut(); 
        currentUser = null; 
        chats = []; 
        contacts = []; 
        currentChatId = null; 
        if (connectionCheckInterval) clearInterval(connectionCheckInterval); 
        showNotification("Вы вышли"); 
    } catch(e) { console.error(e); }
}

function startConnectionMonitoring() { 
    if (connectionCheckInterval) clearInterval(connectionCheckInterval); 
    connectionCheckInterval = setInterval(async () => { 
        if (currentUser && navigator.onLine) try { 
            await database.ref(`users/${currentUser.uid}`).update({ lastActive: Date.now(), status: "online" }); 
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
    if (desktopCreateChatBtn) desktopCreateChatBtn.onclick = () => { if (createChatModal) createChatModal.classList.add('active'); };
    if (desktopAddContactBtn) desktopAddContactBtn.onclick = () => { if (addContactModal) addContactModal.classList.add('active'); };
    if (desktopEmptyCreateChatBtn) desktopEmptyCreateChatBtn.onclick = () => { if (createChatModal) createChatModal.classList.add('active'); };
    if (desktopEmptyAddContactBtn) desktopEmptyAddContactBtn.onclick = () => { if (addContactModal) addContactModal.classList.add('active'); };
    if (homeCreateChatBtn) homeCreateChatBtn.onclick = () => { if (createChatModal) createChatModal.classList.add('active'); };
    if (homeAddContactBtn) homeAddContactBtn.onclick = () => { if (addContactModal) addContactModal.classList.add('active'); };
    if (desktopUserInfoBtn) desktopUserInfoBtn.onclick = openProfileModal;
    if (backToHomeBtn) backToHomeBtn.onclick = showHomeScreen;
    if (sendMessageBtn) sendMessageBtn.onclick = sendMessage;
    if (copyHomeIdBtn) copyHomeIdBtn.onclick = () => { if (homeUserId) navigator.clipboard.writeText(homeUserId.textContent); showNotification('ID скопирован!'); };
    
    if (messageInput) messageInput.onkeypress = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };
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
    
    if (cancelAddContactBtn) cancelAddContactBtn.onclick = () => { 
        if (addContactModal) addContactModal.classList.remove('active'); 
        if (contactSearch) contactSearch.value = ''; 
        hideSearchResults('contactSearchResults'); 
        if (confirmAddContactBtn) confirmAddContactBtn.disabled = true; 
    };
    
    if (confirmAddContactBtn) confirmAddContactBtn.onclick = async () => { 
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
    
    if (privateUserId) privateUserId.oninput = () => { 
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
    
    if (copyUserIdBtn) copyUserIdBtn.onclick = () => { if (profileUserId) navigator.clipboard.writeText(profileUserId.textContent); showNotification('ID скопирован!'); };
    if (logoutBtn) logoutBtn.onclick = logoutUser;
    
    if (editProfileBtn) editProfileBtn.onclick = () => { 
        if (profileModal) profileModal.classList.remove('active'); 
        if (editProfileModal) editProfileModal.classList.add('active'); 
        if (editProfileName) editProfileName.value = currentUser?.displayName || ''; 
        statusOptions.forEach(opt => { 
            opt.classList.remove('active'); 
            if (opt.dataset.status === currentUser?.status) opt.classList.add('active'); 
        }); 
    };
    
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
    if (currentUser) try { await database.ref(`users/${currentUser.uid}`).update({ status: "offline", lastActive: Date.now() }); } catch(e) {} 
    if (authUnsubscribe) authUnsubscribe(); 
    cleanupListeners(); 
    if (connectionCheckInterval) clearInterval(connectionCheckInterval); 
});

window.addEventListener('focus', async () => { 
    if (currentUser && navigator.onLine) try { 
        await database.ref(`users/${currentUser.uid}`).update({ status: "online", lastActive: Date.now() }); 
        currentUser.status = "online"; 
        updateUserProfileDisplay(); 
        updateDesktopUserInfo(); 
        updateMobileProfile(); 
    } catch(e) {} 
});

window.addEventListener('online', async () => { 
    if (currentUser) try { 
        await database.ref(`users/${currentUser.uid}`).update({ status: "online", lastActive: Date.now() }); 
        currentUser.status = "online"; 
        updateUserProfileDisplay(); 
        updateDesktopUserInfo(); 
        updateMobileProfile(); 
        showNotification("Соединение восстановлено"); 
    } catch(e) {} 
});

window.addEventListener('offline', async () => { 
    if (currentUser) try { 
        await database.ref(`users/${currentUser.uid}`).update({ status: "offline", lastActive: Date.now() }); 
        currentUser.status = "offline"; 
        updateUserProfileDisplay(); 
        updateDesktopUserInfo(); 
        updateMobileProfile(); 
        showNotification("Потеряно соединение"); 
    } catch(e) {} 
});
