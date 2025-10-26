// Основные переменные
let currentUser = null;
let currentChat = null;
let users = {};
let chats = {};
let messages = {};

// Переменные для WebRTC
let localStream = null;
let remoteStream = null;
let peerConnection = null;
let isCaller = false;
let isInitiator = false;

// Конфигурация STUN серверов
const pcConfig = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
    ]
};

// DOM элементы
const authScreen = document.getElementById('auth-screen');
const mainScreen = document.getElementById('main-screen');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const showRegisterLink = document.getElementById('show-register');
const showLoginLink = document.getElementById('show-login');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const loginEmail = document.getElementById('login-email');
const loginPassword = document.getElementById('login-password');
const registerName = document.getElementById('register-name');
const registerEmail = document.getElementById('register-email');
const registerPassword = document.getElementById('register-password');
const userName = document.getElementById('user-name');
const userAvatar = document.getElementById('user-avatar');
const chatsList = document.getElementById('chats-list');
const messagesContainer = document.getElementById('messages-container');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const messageInputContainer = document.getElementById('message-input-container');
const newChatBtn = document.getElementById('new-chat-btn');
const settingsBtn = document.getElementById('settings-btn');
const newChatModal = document.getElementById('new-chat-modal');
const closeNewChatModal = document.getElementById('close-new-chat-modal');
const searchUserInput = document.getElementById('search-user-input');
const usersList = document.getElementById('users-list');
const settingsModal = document.getElementById('settings-modal');
const closeSettingsModal = document.getElementById('close-settings-modal');
const settingsAvatar = document.getElementById('settings-avatar');
const settingsName = document.getElementById('settings-name');
const saveProfileBtn = document.getElementById('save-profile-btn');
const logoutBtn = document.getElementById('logout-btn');
const themeOptions = document.querySelectorAll('input[name="theme"]');
const chatActions = document.getElementById('chat-actions');
const voiceCallBtn = document.getElementById('voice-call-btn');
const videoCallBtn = document.getElementById('video-call-btn');
const chatInfoBtn = document.getElementById('chat-info-btn');
const callModal = document.getElementById('call-modal');
const endCallBtn = document.getElementById('end-call-btn');
const muteCallBtn = document.getElementById('mute-call-btn');
const callTitle = document.getElementById('call-title');
const callAvatar = document.getElementById('call-avatar');
const callStatus = document.getElementById('call-status');
const callTimerElement = document.getElementById('call-timer');
const callerName = document.getElementById('caller-name');
const colorOptions = document.querySelectorAll('.color-option');
const chatInfoModal = document.getElementById('chat-info-modal');
const closeChatInfoModal = document.getElementById('close-chat-info-modal');
const chatInfoContent = document.getElementById('chat-info-content');
const createGroupChatBtn = document.getElementById('create-group-chat-btn');

// Элементы для видео звонков
const localVideo = document.createElement('video');
const remoteVideo = document.createElement('video');
localVideo.autoplay = true;
localVideo.muted = true;
localVideo.playsInline = true;
remoteVideo.autoplay = true;
remoteVideo.playsInline = true;

// ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================

// Генератор случайных цветов для аватарок
function generateAvatarColor(userId) {
    const colors = [
        '#8a4fff', '#2196f3', '#e91e63', '#4caf50', 
        '#ff9800', '#9c27b0', '#00bcd4', '#ff5722'
    ];
    const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
}

// Создание аватара на основе имени
function createAvatar(name, color) {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    
    // Фон
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 200, 200);
    
    // Текст
    ctx.fillStyle = 'white';
    ctx.font = 'bold 80px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    ctx.fillText(initials, 100, 100);
    
    return canvas.toDataURL();
}

// Показ уведомления
function showNotification(message, type = 'info', duration = 4000) {
    const container = document.getElementById('notifications-container');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icon = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : '💜';
    
    notification.innerHTML = `
        <div class="notification-content">
            <div class="notification-message">${icon} ${message}</div>
        </div>
        <button class="notification-close">&times;</button>
    `;
    
    container.appendChild(notification);
    
    // Закрытие по клику
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.classList.add('hiding');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    });
    
    // Автоматическое закрытие
    setTimeout(() => {
        if (notification.parentNode) {
            notification.classList.add('hiding');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }, duration);
    
    return notification;
}

// Форматирование времени последнего посещения
function formatLastSeen(timestamp) {
    if (!timestamp) return 'давно';
    
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'только что';
    if (minutes < 60) return `${minutes} мин назад`;
    if (hours < 24) return `${hours} ч назад`;
    return `${days} дн назад`;
}

// Форматирование времени сообщения
function formatMessageTime(timestamp) {
    const now = new Date();
    const messageDate = new Date(timestamp);
    
    if (now.toDateString() === messageDate.toDateString()) {
        return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
        return messageDate.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
    }
}

// Генерация ID чата
function generateChatId(userId1, userId2) {
    return [userId1, userId2].sort().join('_');
}

// Функция для показа/скрытия загрузки
function setButtonLoading(button, isLoading) {
    if (isLoading) {
        button.classList.add('loading');
        button.disabled = true;
    } else {
        button.classList.remove('loading');
        button.disabled = false;
    }
}

// Форматирование длительности звонка
function formatCallDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// ==================== WEBRTC ФУНКЦИИ ====================

// Инициализация WebRTC
async function initializeWebRTC() {
    try {
        // Запрашиваем доступ к медиа устройствам
        localStream = await navigator.mediaDevices.getUserMedia({ 
            video: false, 
            audio: true 
        });
        console.log("Local stream obtained");
    } catch (error) {
        console.error("Error accessing media devices:", error);
        showNotification('Не удалось получить доступ к микрофону', 'error');
    }
}

// Создание Peer Connection
function createPeerConnection() {
    try {
        peerConnection = new RTCPeerConnection(pcConfig);
        
        // Добавляем локальный поток
        if (localStream) {
            localStream.getTracks().forEach(track => {
                peerConnection.addTrack(track, localStream);
            });
        }
        
        // Обработчик удаленного потока
        peerConnection.ontrack = (event) => {
            console.log("Remote track received");
            remoteStream = event.streams[0];
            remoteVideo.srcObject = remoteStream;
        };
        
        // Обработчик ICE кандидатов
        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                sendSignalingMessage({
                    type: 'ice-candidate',
                    candidate: event.candidate,
                    chatId: currentChat.id,
                    to: getOtherUserId()
                });
            }
        };
        
        // Обработчик изменения состояния соединения
        peerConnection.onconnectionstatechange = () => {
            console.log("Connection state:", peerConnection.connectionState);
            updateCallStatus(peerConnection.connectionState);
        };
        
        return peerConnection;
    } catch (error) {
        console.error("Error creating peer connection:", error);
        return null;
    }
}

// Отправка сигнального сообщения
function sendSignalingMessage(message) {
    if (!currentChat) return;
    
    const messageId = database.ref('signaling/' + currentChat.id).push().key;
    database.ref('signaling/' + currentChat.id + '/' + messageId).set({
        ...message,
        from: currentUser.uid,
        timestamp: Date.now()
    });
}

// Слушатель сигнальных сообщений
function setupSignalingListener() {
    if (!currentChat) return;
    
    database.ref('signaling/' + currentChat.id).on('child_added', async (snapshot) => {
        const message = snapshot.val();
        
        // Игнорируем собственные сообщения
        if (message.from === currentUser.uid) return;
        
        console.log("Signaling message received:", message.type);
        
        switch (message.type) {
            case 'offer':
                await handleOffer(message.offer);
                break;
            case 'answer':
                await handleAnswer(message.answer);
                break;
            case 'ice-candidate':
                await handleIceCandidate(message.candidate);
                break;
            case 'call-request':
                handleCallRequest(message);
                break;
            case 'call-accepted':
                handleCallAccepted();
                break;
            case 'call-rejected':
                handleCallRejected();
                break;
            case 'call-ended':
                handleCallEnded();
                break;
        }
        
        // Удаляем обработанное сообщение
        snapshot.ref.remove();
    });
}

// Обработка предложения звонка
async function handleOffer(offer) {
    if (!peerConnection) {
        await createPeerConnection();
    }
    
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    
    sendSignalingMessage({
        type: 'answer',
        answer: answer,
        chatId: currentChat.id,
        to: getOtherUserId()
    });
}

// Обработка ответа на звонок
async function handleAnswer(answer) {
    if (peerConnection) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    }
}

// Обработка ICE кандидата
async function handleIceCandidate(candidate) {
    if (peerConnection && peerConnection.remoteDescription) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    }
}

// Получение ID другого пользователя
function getOtherUserId() {
    if (!currentChat) return null;
    return currentChat.participants.find(id => id !== currentUser.uid);
}

// Обновление статуса звонка
function updateCallStatus(state) {
    const statusMap = {
        'new': 'Соединение...',
        'connecting': 'Соединение...',
        'connected': 'Звонок активен',
        'disconnected': 'Соединение прервано',
        'failed': 'Ошибка соединения',
        'closed': 'Звонок завершен'
    };
    
    callStatus.textContent = statusMap[state] || state;
    
    if (state === 'connected') {
        startCallTimer();
        showNotification('Соединение установлено', 'success');
    } else if (state === 'failed' || state === 'disconnected') {
        showNotification('Соединение прервано', 'error');
        endCall();
    }
}

// ==================== ФУНКЦИИ ЗВОНКОВ ====================

// Начало звонка
async function startCall(isVideo = false) {
    if (!currentChat) {
        showNotification('Выберите чат для звонка', 'error');
        return;
    }
    
    try {
        // Запрашиваем медиа устройства
        const constraints = {
            audio: true,
            video: isVideo
        };
        
        localStream = await navigator.mediaDevices.getUserMedia(constraints);
        
        // Создаем Peer Connection
        peerConnection = createPeerConnection();
        if (!peerConnection) {
            throw new Error('Failed to create peer connection');
        }
        
        // Создаем предложение
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        
        // Отправляем запрос на звонок
        sendSignalingMessage({
            type: 'call-request',
            offer: offer,
            isVideo: isVideo,
            chatId: currentChat.id,
            to: getOtherUserId()
        });
        
        // Показываем интерфейс звонка
        showCallInterface(isVideo);
        isInitiator = true;
        
        showNotification('Вызов отправлен', 'info');
        
    } catch (error) {
        console.error("Error starting call:", error);
        showNotification('Не удалось начать звонок: ' + error.message, 'error');
    }
}

// Показать интерфейс звонка
function showCallInterface(isVideo) {
    const otherUserId = getOtherUserId();
    const otherUser = users[otherUserId];
    
    if (otherUser) {
        callTitle.textContent = isVideo ? 'Видеозвонок' : 'Голосовой звонок';
        callAvatar.src = otherUser.avatar;
        callerName.textContent = otherUser.name;
        callStatus.textContent = 'Вызов...';
        callTimerElement.textContent = '00:00';
        
        // Настройка видео элементов
        if (isVideo && localStream) {
            localVideo.srcObject = localStream;
            // Здесь можно добавить localVideo в интерфейс
        }
    }
    
    callModal.classList.add('active');
}

// Обработка входящего запроса на звонок
function handleCallRequest(message) {
    const otherUserId = getOtherUserId();
    const otherUser = users[otherUserId];
    
    if (!otherUser) return;
    
    // Показываем уведомление о входящем звонке
    showNotification(`Входящий ${message.isVideo ? 'видео' : 'голосовой'} звонок от ${otherUser.name}`, 'info');
    
    // Автоматически принимаем звонок для демонстрации
    setTimeout(() => {
        acceptCall(message);
    }, 2000);
}

// Принятие звонка
async function acceptCall(message) {
    try {
        // Запрашиваем медиа устройства
        const constraints = {
            audio: true,
            video: message.isVideo
        };
        
        localStream = await navigator.mediaDevices.getUserMedia(constraints);
        
        // Создаем Peer Connection
        peerConnection = createPeerConnection();
        if (!peerConnection) {
            throw new Error('Failed to create peer connection');
        }
        
        // Устанавливаем удаленное описание
        await peerConnection.setRemoteDescription(new RTCSessionDescription(message.offer));
        
        // Создаем ответ
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        
        // Отправляем ответ
        sendSignalingMessage({
            type: 'answer',
            answer: answer,
            chatId: currentChat.id,
            to: getOtherUserId()
        });
        
        // Показываем интерфейс звонка
        showCallInterface(message.isVideo);
        isInitiator = false;
        
        showNotification('Звонок принят', 'success');
        
    } catch (error) {
        console.error("Error accepting call:", error);
        showNotification('Не удалось принять звонок', 'error');
        rejectCall();
    }
}

// Завершение звонка
function endCall() {
    // Отправляем сообщение о завершении звонка
    sendSignalingMessage({
        type: 'call-ended',
        chatId: currentChat.id,
        to: getOtherUserId()
    });
    
    // Останавливаем медиа потоки
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localStream = null;
    }
    
    if (remoteStream) {
        remoteStream.getTracks().forEach(track => track.stop());
        remoteStream = null;
    }
    
    // Закрываем Peer Connection
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
    }
    
    // Сбрасываем таймер
    if (callDurationTimer) {
        clearInterval(callDurationTimer);
        callDurationTimer = null;
    }
    
    // Скрываем интерфейс звонка
    callModal.classList.remove('active');
    
    // Записываем звонок в историю
    if (callStartTime) {
        const duration = Math.floor((Date.now() - callStartTime) / 1000);
        createCallMessage(isVideoCall, callStartTime, duration);
        callStartTime = null;
    }
    
    isInitiator = false;
    isVideoCall = false;
    
    showNotification('Звонок завершен', 'info');
}

// Таймер звонка
let callDurationTimer = null;
let callStartTime = null;
let isVideoCall = false;

function startCallTimer() {
    callStartTime = Date.now();
    callDurationTimer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - callStartTime) / 1000);
        callTimerElement.textContent = formatCallDuration(elapsed);
    }, 1000);
}

// Отклонение звонка
function rejectCall() {
    sendSignalingMessage({
        type: 'call-rejected',
        chatId: currentChat.id,
        to: getOtherUserId()
    });
    
    showNotification('Звонок отклонен', 'info');
}

// Обработчики событий звонка
function handleCallAccepted() {
    callStatus.textContent = 'Звонок принят';
    startCallTimer();
}

function handleCallRejected() {
    showNotification('Звонок отклонен', 'error');
    endCall();
}

function handleCallEnded() {
    showNotification('Собеседник завершил звонок', 'info');
    endCall();
}

// Переключение микрофона
function toggleMute() {
    if (localStream) {
        const audioTracks = localStream.getAudioTracks();
        audioTracks.forEach(track => {
            track.enabled = !track.enabled;
        });
        const isMuted = !audioTracks[0].enabled;
        muteCallBtn.classList.toggle('active', isMuted);
        showNotification(isMuted ? 'Микрофон выключен' : 'Микрофон включен', 'info');
    }
}

// ==================== ФУНКЦИИ ПОЛЬЗОВАТЕЛЯ ====================

// Загрузка данных пользователя
function loadUserData() {
    console.log("Loading user data for:", currentUser.uid);
    
    database.ref('users/' + currentUser.uid).once('value')
        .then((snapshot) => {
            const userData = snapshot.val();
            if (userData) {
                console.log("User data found:", userData);
                
                // Обновляем интерфейс
                userName.textContent = userData.name;
                userAvatar.src = userData.avatar;
                settingsName.value = userData.name;
                settingsAvatar.src = userData.avatar;
                
                // Устанавливаем выбранный цвет аватара
                colorOptions.forEach(option => {
                    if (option.dataset.color === (userData.avatarColor || '#8a4fff')) {
                        option.classList.add('active');
                    }
                });
                
                // Переключаем экраны
                authScreen.classList.remove('active');
                mainScreen.classList.add('active');
                
                // Обновляем статус пользователя
                updateUserStatus('online');
                
                // Инициализируем WebRTC
                initializeWebRTC();
                
                // Загружаем пользователей и чаты
                loadUsers();
                loadChats();
                
                // Настраиваем слушатели реального времени
                setupRealtimeListeners();
                
            } else {
                // Если данных пользователя нет, создаем их
                createUserData();
            }
        })
        .catch((error) => {
            console.error("Error loading user data:", error);
            showNotification('Ошибка загрузки данных пользователя', 'error');
        });
}

// Создание данных пользователя при первом входе
function createUserData() {
    const userName = currentUser.displayName || currentUser.email.split('@')[0];
    const avatarColor = generateAvatarColor(currentUser.uid);
    const avatar = createAvatar(userName, avatarColor);
    
    const userData = {
        name: userName,
        email: currentUser.email,
        avatar: avatar,
        avatarColor: avatarColor,
        status: 'online',
        lastSeen: firebase.database.ServerValue.TIMESTAMP,
        createdAt: firebase.database.ServerValue.TIMESTAMP
    };
    
    database.ref('users/' + currentUser.uid).set(userData)
        .then(() => {
            console.log("User data created successfully");
            // Перезагружаем данные
            loadUserData();
        })
        .catch((error) => {
            console.error("Error creating user data:", error);
            showNotification('Ошибка создания профиля', 'error');
        });
}

// Обновление статуса пользователя
function updateUserStatus(status) {
    const updates = {
        status: status,
        lastSeen: firebase.database.ServerValue.TIMESTAMP
    };
    
    database.ref('users/' + currentUser.uid).update(updates)
        .then(() => {
            console.log("User status updated to:", status);
        })
        .catch((error) => {
            console.error("Error updating user status:", error);
        });
}

// Загрузка списка пользователей
function loadUsers() {
    database.ref('users').once('value')
        .then((snapshot) => {
            const usersData = snapshot.val() || {};
            users = usersData;
            console.log("Loaded users:", Object.keys(users).length, users);
            renderUsersList();
        })
        .catch((error) => {
            console.error("Error loading users:", error);
            showNotification('Ошибка загрузки пользователей', 'error');
        });
}

// Принудительное обновление списка пользователей
function refreshUsersList() {
    console.log("Refreshing users list...");
    loadUsers();
}

// Отображение списка пользователей
function renderUsersList(filter = '') {
    usersList.innerHTML = '';
    
    const filteredUsers = Object.keys(users).filter(userId => {
        if (userId === currentUser.uid) return false;
        const user = users[userId];
        if (!user || !user.name) return false;
        
        if (filter) {
            return user.name.toLowerCase().includes(filter.toLowerCase()) || 
                   user.email.toLowerCase().includes(filter.toLowerCase());
        }
        return true;
    });
    
    console.log("Filtered users for search:", filteredUsers.length, filteredUsers.map(id => users[id].name));
    
    if (filteredUsers.length === 0) {
        usersList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">👥</div>
                <p>${filter ? 'Пользователи не найдены' : 'Другие пользователи не найдены'}</p>
                ${!filter ? '<p class="empty-subtitle">Создайте еще один аккаунт для тестирования</p>' : ''}
            </div>
        `;
        return;
    }
    
    filteredUsers.forEach(userId => {
        const user = users[userId];
        const userItem = document.createElement('div');
        userItem.className = 'user-item';
        userItem.innerHTML = `
            <div class="avatar-container">
                <img class="avatar" src="${user.avatar}" alt="Аватар">
                <div class="online-indicator ${user.status === 'online' ? '' : 'offline'}"></div>
            </div>
            <div class="user-details">
                <div class="user-name">${user.name}</div>
                <div class="user-status ${user.status}">${user.status === 'online' ? 'online' : 'был(а) ' + formatLastSeen(user.lastSeen)}</div>
                <div class="user-email">${user.email}</div>
            </div>
        `;
        userItem.addEventListener('click', () => createChat(userId));
        usersList.appendChild(userItem);
    });
}

// ==================== ФУНКЦИИ ЧАТОВ ====================

// Загрузка чатов пользователя
function loadChats() {
    database.ref('userChats/' + currentUser.uid).on('value', (snapshot) => {
        chats = snapshot.val() || {};
        renderChatsList();
    });
}

// Отображение списка чатов
function renderChatsList() {
    chatsList.innerHTML = '';
    
    if (Object.keys(chats).length === 0) {
        chatsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">💬</div>
                <p>Чатов пока нет</p>
                <p class="empty-subtitle">Создайте первый чат, чтобы начать общение</p>
            </div>
        `;
        return;
    }
    
    // Сортируем чаты по времени последнего сообщения
    const sortedChats = Object.keys(chats).sort((a, b) => {
        return (chats[b].lastMessageTime || 0) - (chats[a].lastMessageTime || 0);
    });
    
    sortedChats.forEach(chatId => {
        const chat = chats[chatId];
        
        const chatItem = document.createElement('div');
        chatItem.className = 'chat-item';
        if (currentChat && currentChat.id === chatId) {
            chatItem.classList.add('active');
        }
        
        // Определяем аватар и название чата
        let avatar = '';
        let name = '';
        let status = '';
        let lastMessage = chat.lastMessage || 'Нет сообщений';
        
        if (chat.type === 'private') {
            const otherUserId = chat.participants.find(id => id !== currentUser.uid);
            const otherUser = users[otherUserId];
            if (otherUser) {
                avatar = otherUser.avatar;
                name = otherUser.name;
                status = otherUser.status === 'online' ? 'online' : 'был(а) ' + formatLastSeen(otherUser.lastSeen);
                
                // Улучшенное отображение последнего сообщения
                if (lastMessage.includes('звонок')) {
                    const isVoiceCall = lastMessage.includes('Голосовой');
                    lastMessage = `<span class="call-message-preview">${isVoiceCall ? '📞' : '🎥'} ${lastMessage}</span>`;
                }
            }
        }
        
        const lastMessageTime = chat.lastMessageTime ? formatMessageTime(chat.lastMessageTime) : '';
        
        chatItem.innerHTML = `
            <img class="avatar" src="${avatar}" alt="Аватар чата">
            <div class="chat-info">
                <div class="chat-name">${name}</div>
                <div class="chat-last-message">${lastMessage}</div>
            </div>
            <div class="chat-time">${lastMessageTime}</div>
        `;
        
        chatItem.addEventListener('click', () => openChat(chatId, chat));
        chatsList.appendChild(chatItem);
    });
}

// Создание нового чата
function createChat(otherUserId) {
    if (!users[otherUserId]) {
        showNotification('Пользователь не найден', 'error');
        return;
    }

    const chatId = generateChatId(currentUser.uid, otherUserId);
    
    console.log("Creating chat between:", currentUser.uid, "and", otherUserId);
    
    // Проверяем, существует ли уже такой чат
    database.ref('chats/' + chatId).once('value')
        .then((snapshot) => {
            if (snapshot.exists()) {
                // Чат уже существует, просто открываем его
                const chatData = snapshot.val();
                console.log("Chat already exists:", chatData);
                openChat(chatId, chatData);
                closeNewChatModal.click();
                showNotification('Чат уже существует', 'info');
                return;
            }
            
            // Создаем новый чат
            const chatData = {
                id: chatId,
                type: 'private',
                participants: [currentUser.uid, otherUserId],
                createdAt: firebase.database.ServerValue.TIMESTAMP
            };
            
            console.log("Creating new chat:", chatData);
            
            // Сохраняем чат в базе данных
            return database.ref('chats/' + chatId).set(chatData)
                .then(() => {
                    // Добавляем чат в список чатов пользователей
                    const userChatData = {
                        type: 'private',
                        participants: [currentUser.uid, otherUserId],
                        lastMessage: '',
                        lastMessageTime: firebase.database.ServerValue.TIMESTAMP
                    };
                    
                    return Promise.all([
                        database.ref('userChats/' + currentUser.uid + '/' + chatId).set(userChatData),
                        database.ref('userChats/' + otherUserId + '/' + chatId).set(userChatData)
                    ]);
                })
                .then(() => {
                    openChat(chatId, chatData);
                    closeNewChatModal.click();
                    showNotification(`Чат создан с ${users[otherUserId].name}!`, 'success');
                });
        })
        .catch((error) => {
            console.error("Error creating chat:", error);
            showNotification('Ошибка создания чата: ' + error.message, 'error');
        });
}

// Открытие чата
function openChat(chatId, chatData) {
    currentChat = {
        id: chatId,
        ...chatData
    };
    
    // Настраиваем слушатель сигнальных сообщений
    setupSignalingListener();
    
    // Показываем элементы чата
    chatActions.style.display = 'flex';
    messageInputContainer.style.display = 'block';
    
    // Обновляем заголовок чата
    if (chatData.type === 'private') {
        const otherUserId = chatData.participants.find(id => id !== currentUser.uid);
        const otherUser = users[otherUserId];
        if (otherUser) {
            document.getElementById('chat-title').textContent = otherUser.name;
            document.getElementById('chat-avatar').src = otherUser.avatar;
            document.getElementById('chat-status').textContent = otherUser.status === 'online' ? 'online' : 'был(а) ' + formatLastSeen(otherUser.lastSeen);
            
            // Показываем/скрываем индикатор онлайн
            const onlineIndicator = document.getElementById('chat-online-indicator');
            if (otherUser.status === 'online') {
                onlineIndicator.style.display = 'block';
            } else {
                onlineIndicator.style.display = 'none';
            }
        }
    }
    
    // Активируем поле ввода сообщения
    messageInput.disabled = false;
    sendBtn.disabled = true;
    
    // Загружаем сообщения
    loadMessages(chatId);
    
    // Обновляем выделение в списке чатов
    renderChatsList();
    
    // Прокручиваем к последнему сообщению
    setTimeout(() => {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 100);
}

// Загрузка сообщений чата
function loadMessages(chatId) {
    // Очищаем контейнер сообщений
    messagesContainer.innerHTML = '';
    
    database.ref('messages/' + chatId).orderByChild('timestamp').limitToLast(100).on('value', (snapshot) => {
        messagesContainer.innerHTML = '';
        const messagesData = snapshot.val() || {};
        
        // Преобразуем объект в массив и сортируем по времени
        const messagesArray = Object.keys(messagesData).map(key => ({
            id: key,
            ...messagesData[key]
        })).sort((a, b) => a.timestamp - b.timestamp);
        
        if (messagesArray.length === 0) {
            messagesContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">💬</div>
                    <p>Сообщений пока нет</p>
                    <p class="empty-subtitle">Напишите первое сообщение</p>
                </div>
            `;
            return;
        }
        
        messagesArray.forEach(message => {
            renderMessage(message);
        });
        
        // Прокручиваем к последнему сообщению
        if (messagesArray.length > 0) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    });
}

// Отображение сообщения
function renderMessage(message) {
    // Системные сообщения (звонки)
    if (message.type === 'call') {
        renderSystemMessage(message);
        return;
    }
    
    // Обычные сообщения
    const messageElement = document.createElement('div');
    messageElement.className = `message ${message.senderId === currentUser.uid ? 'sent' : 'received'}`;
    
    // Форматируем время
    const time = new Date(message.timestamp);
    const timeString = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    let avatar = '';
    let senderName = '';
    
    if (message.senderId === currentUser.uid) {
        avatar = userAvatar.src;
        senderName = 'Вы';
    } else {
        const sender = users[message.senderId];
        if (sender) {
            avatar = sender.avatar;
            senderName = sender.name;
        }
    }
    
    messageElement.innerHTML = `
        ${message.senderId !== currentUser.uid ? `<img class="message-avatar avatar" src="${avatar}" alt="Аватар">` : ''}
        <div class="message-content">
            ${message.senderId !== currentUser.uid ? `<div class="sender-name">${senderName}</div>` : ''}
            <div class="message-text">${message.text}</div>
            <div class="message-time">${timeString}</div>
        </div>
        ${message.senderId === currentUser.uid ? `<img class="message-avatar avatar" src="${avatar}" alt="Аватар">` : ''}
    `;
    
    messagesContainer.appendChild(messageElement);
}

// Отображение системного сообщения (звонки)
function renderSystemMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.className = 'message system-message';
    
    const time = new Date(message.timestamp);
    const timeString = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    let callIcon = '📞';
    let callText = '';
    
    if (message.callType === 'voice') {
        callIcon = '📞';
        callText = 'Голосовой звонок';
    } else if (message.callType === 'video') {
        callIcon = '🎥';
        callText = 'Видеозвонок';
    }
    
    // Если есть длительность, показываем её
    if (message.duration && message.duration > 0) {
        callText += ` (${formatCallDuration(message.duration)})`;
    } else {
        callText += ' (не отвечен)';
    }
    
    // Определяем, кто инициировал звонок
    let initiatorText = '';
    if (message.senderId === currentUser.uid) {
        initiatorText = 'Вы начали ';
    } else {
        const sender = users[message.senderId];
        if (sender) {
            initiatorText = `${sender.name} начал(а) `;
        }
    }
    
    messageElement.innerHTML = `
        <div class="system-message-content">
            <div class="system-message-icon">${callIcon}</div>
            <div class="system-message-text">
                <div class="system-message-main">${initiatorText}${callText.toLowerCase()}</div>
                <div class="system-message-time">${timeString}</div>
            </div>
        </div>
    `;
    
    messagesContainer.appendChild(messageElement);
}

// Отправка сообщения
function sendMessage() {
    const text = messageInput.value.trim();
    if (!text || !currentChat) return;
    
    const messageId = database.ref('messages/' + currentChat.id).push().key;
    const messageData = {
        id: messageId,
        text: text,
        senderId: currentUser.uid,
        timestamp: Date.now()
    };
    
    // Сохраняем сообщение
    database.ref('messages/' + currentChat.id + '/' + messageId).set(messageData)
        .then(() => {
            // Обновляем последнее сообщение в чате
            const updateData = {
                lastMessage: text.length > 30 ? text.substring(0, 30) + '...' : text,
                lastMessageTime: Date.now()
            };
            
            return database.ref('userChats/' + currentUser.uid + '/' + currentChat.id).update(updateData);
        })
        .then(() => {
            // Обновляем последнее сообщение для других участников
            const updates = {};
            currentChat.participants.forEach(participantId => {
                if (participantId !== currentUser.uid) {
                    updates['userChats/' + participantId + '/' + currentChat.id + '/lastMessage'] = 
                        text.length > 30 ? text.substring(0, 30) + '...' : text;
                    updates['userChats/' + participantId + '/' + currentChat.id + '/lastMessageTime'] = Date.now();
                }
            });
            
            return database.ref().update(updates);
        })
        .then(() => {
            // Очищаем поле ввода
            messageInput.value = '';
            sendBtn.disabled = true;
        })
        .catch((error) => {
            console.error("Error sending message:", error);
            showNotification('Ошибка отправки сообщения', 'error');
        });
}

// Создание сообщения о звонке
function createCallMessage(isVideo, timestamp, duration) {
    if (!currentChat) return;
    
    const messageId = database.ref('messages/' + currentChat.id).push().key;
    const callMessage = {
        id: messageId,
        type: 'call',
        callType: isVideo ? 'video' : 'voice',
        duration: duration,
        timestamp: timestamp,
        senderId: currentUser.uid,
        text: getCallMessageText(isVideo, duration)
    };
    
    database.ref('messages/' + currentChat.id + '/' + messageId).set(callMessage)
        .then(() => {
            // Обновляем последнее сообщение в чате
            const lastMessage = getCallMessageText(isVideo, duration, true);
            updateLastChatMessage(lastMessage);
        })
        .catch(error => {
            console.error("Error creating call message:", error);
        });
}

// Текст для сообщения о звонке
function getCallMessageText(isVideo, duration, short = false) {
    const callName = isVideo ? 'Видеозвонок' : 'Голосовой звонок';
    
    if (short) {
        if (duration === 0) {
            return callName;
        }
        return `${callName} (${formatCallDuration(duration)})`;
    }
    
    if (duration === 0) {
        return `${callName} (не отвечен)`;
    }
    
    return `${callName} (${formatCallDuration(duration)})`;
}

// Обновление последнего сообщения в чате
function updateLastChatMessage(message) {
    if (!currentChat) return;
    
    const updates = {};
    currentChat.participants.forEach(participantId => {
        updates['userChats/' + participantId + '/' + currentChat.id + '/lastMessage'] = message;
        updates['userChats/' + participantId + '/' + currentChat.id + '/lastMessageTime'] = Date.now();
    });
    
    database.ref().update(updates)
        .catch(error => {
            console.error("Error updating last chat message:", error);
        });
}

// ==================== ОБРАБОТЧИКИ СОБЫТИЙ ====================

// Переключение между формами входа и регистрации
showRegisterLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.classList.remove('active');
    registerForm.classList.add('active');
});

showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    registerForm.classList.remove('active');
    loginForm.classList.add('active');
});

// Обработчик входа
loginBtn.addEventListener('click', () => {
    const email = loginEmail.value.trim();
    const password = loginPassword.value;
    
    if (!email || !password) {
        showNotification('Пожалуйста, заполните все поля', 'error');
        return;
    }
    
    setButtonLoading(loginBtn, true);
    
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            currentUser = userCredential.user;
            showNotification('Вход выполнен успешно!', 'success');
            loadUserData();
        })
        .catch((error) => {
            let errorMessage = 'Ошибка входа';
            switch (error.code) {
                case 'auth/user-not-found':
                    errorMessage = 'Пользователь с таким email не найден';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Неверный пароль';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Неверный формат email';
                    break;
                default:
                    errorMessage = 'Ошибка входа: ' + error.message;
            }
            showNotification(errorMessage, 'error');
        })
        .finally(() => {
            setButtonLoading(loginBtn, false);
        });
});

// Обработчик регистрации
registerBtn.addEventListener('click', () => {
    const name = registerName.value.trim();
    const email = registerEmail.value.trim();
    const password = registerPassword.value;
    
    if (!name || !email || !password) {
        showNotification('Пожалуйста, заполните все поля', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('Пароль должен содержать не менее 6 символов', 'error');
        return;
    }
    
    if (name.length < 2) {
        showNotification('Имя должно содержать не менее 2 символов', 'error');
        return;
    }
    
    setButtonLoading(registerBtn, true);
    
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            currentUser = userCredential.user;
            
            // Создаем аватар
            const avatarColor = generateAvatarColor(currentUser.uid);
            const avatar = createAvatar(name, avatarColor);
            
            // Сохраняем данные пользователя в базе данных
            return database.ref('users/' + currentUser.uid).set({
                name: name,
                email: email,
                avatar: avatar,
                avatarColor: avatarColor,
                status: 'online',
                lastSeen: firebase.database.ServerValue.TIMESTAMP,
                createdAt: firebase.database.ServerValue.TIMESTAMP
            });
        })
        .then(() => {
            showNotification('Аккаунт успешно создан!', 'success');
            loadUserData();
        })
        .catch((error) => {
            let errorMessage = 'Ошибка регистрации';
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'Аккаунт с таким email уже существует';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Неверный формат email';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'Пароль слишком простой';
                    break;
                default:
                    errorMessage = 'Ошибка регистрации: ' + error.message;
            }
            showNotification(errorMessage, 'error');
        })
        .finally(() => {
            setButtonLoading(registerBtn, false);
        });
});

// Отправка сообщения
sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

messageInput.addEventListener('input', () => {
    sendBtn.disabled = messageInput.value.trim() === '';
});

// Звонки
voiceCallBtn.addEventListener('click', () => startCall(false));
videoCallBtn.addEventListener('click', () => startCall(true));

// Управление звонком
endCallBtn.addEventListener('click', endCall);
muteCallBtn.addEventListener('click', toggleMute);

// Открытие модального окна нового чата
newChatBtn.addEventListener('click', () => {
    newChatModal.classList.add('active');
    searchUserInput.value = '';
    refreshUsersList();
    searchUserInput.focus();
});

// Закрытие модального окна нового чата
closeNewChatModal.addEventListener('click', () => {
    newChatModal.classList.remove('active');
});

// Поиск пользователей
searchUserInput.addEventListener('input', (e) => {
    renderUsersList(e.target.value);
});

// Открытие модального окна настроек
settingsBtn.addEventListener('click', () => {
    settingsModal.classList.add('active');
});

// Закрытие модального окна настроек
closeSettingsModal.addEventListener('click', () => {
    settingsModal.classList.remove('active');
});

// Изменение цвета аватара
colorOptions.forEach(option => {
    option.addEventListener('click', () => {
        colorOptions.forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
        
        const color = option.dataset.color;
        const name = settingsName.value || userName.textContent;
        const newAvatar = createAvatar(name, color);
        
        settingsAvatar.src = newAvatar;
    });
});

// Сохранение профиля
saveProfileBtn.addEventListener('click', () => {
    const newName = settingsName.value.trim();
    const activeColorOption = document.querySelector('.color-option.active');
    
    if (!activeColorOption) {
        showNotification('Выберите цвет аватара', 'error');
        return;
    }
    
    const activeColor = activeColorOption.dataset.color;
    
    if (!newName) {
        showNotification('Пожалуйста, введите имя', 'error');
        return;
    }
    
    if (newName.length < 2) {
        showNotification('Имя должно содержать не менее 2 символов', 'error');
        return;
    }
    
    setButtonLoading(saveProfileBtn, true);
    
    // Создаем новый аватар
    const newAvatar = createAvatar(newName, activeColor);
    
    // Обновляем данные пользователя
    database.ref('users/' + currentUser.uid).update({
        name: newName,
        avatar: newAvatar,
        avatarColor: activeColor
    })
    .then(() => {
        // Обновляем интерфейс
        userName.textContent = newName;
        userAvatar.src = newAvatar;
        settingsModal.classList.remove('active');
        showNotification('Профиль успешно обновлен!', 'success');
        
        // Обновляем аватары в активных чатах
        renderChatsList();
        if (currentChat) {
            loadMessages(currentChat.id);
        }
    })
    .catch((error) => {
        console.error("Error updating profile:", error);
        showNotification('Ошибка обновления профиля', 'error');
    })
    .finally(() => {
        setButtonLoading(saveProfileBtn, false);
    });
});

// Выход из аккаунта
logoutBtn.addEventListener('click', () => {
    if (confirm('Вы уверены, что хотите выйти?')) {
        // Завершаем активный звонок при выходе
        if (peerConnection) {
            endCall();
        }
        
        auth.signOut()
            .then(() => {
                settingsModal.classList.remove('active');
                showNotification('Вы вышли из аккаунта', 'info');
            })
            .catch((error) => {
                console.error("Error signing out:", error);
                showNotification('Ошибка выхода из аккаунта', 'error');
            });
    }
});

// Переключение темы
themeOptions.forEach(option => {
    option.addEventListener('change', (e) => {
        document.documentElement.setAttribute('data-theme', e.target.value);
        
        // Сохраняем выбор темы в localStorage
        localStorage.setItem('theme', e.target.value);
        
        showNotification(`Тема изменена на ${e.target.value === 'dark' ? 'лавандовую' : 'синюю'}`, 'info');
    });
});

// Информация о чате
chatInfoBtn.addEventListener('click', showChatInfo);

function showChatInfo() {
    if (!currentChat) return;
    
    chatInfoContent.innerHTML = '';
    
    if (currentChat.type === 'private') {
        const otherUserId = currentChat.participants.find(id => id !== currentUser.uid);
        const otherUser = users[otherUserId];
        
        if (otherUser) {
            chatInfoContent.innerHTML = `
                <div class="chat-info-section">
                    <div class="info-avatar">
                        <img src="${otherUser.avatar}" alt="Аватар" class="avatar">
                        <div class="online-indicator ${otherUser.status === 'online' ? '' : 'offline'}"></div>
                    </div>
                    <h4>${otherUser.name}</h4>
                    <p class="user-status">${otherUser.status === 'online' ? 'online' : 'был(а) ' + formatLastSeen(otherUser.lastSeen)}</p>
                </div>
                <div class="chat-info-section">
                    <h5>Контактная информация</h5>
                    <p>Email: ${otherUser.email}</p>
                </div>
            `;
        }
    }
    
    chatInfoModal.classList.add('active');
}

closeChatInfoModal.addEventListener('click', () => {
    chatInfoModal.classList.remove('active');
});

// Создание группового чата (заглушка)
createGroupChatBtn.addEventListener('click', () => {
    showNotification('Функция групповых чатов в разработке', 'info');
});

// Обработчик кнопки обновления списка пользователей
document.getElementById('refresh-users-btn').addEventListener('click', refreshUsersList);

// ==================== СЛУШАТЕЛИ REAL-TIME ====================

// Настройка слушателей реального времени
function setupRealtimeListeners() {
    // Слушатель изменений статуса аутентификации
    auth.onAuthStateChanged((user) => {
        if (!user) {
            // Пользователь вышел
            if (currentUser) {
                updateUserStatus('offline');
            }
            
            authScreen.classList.add('active');
            mainScreen.classList.remove('active');
            currentUser = null;
        }
    });
    
    // Слушатель изменений пользователей для реального обновления
    database.ref('users').on('value', (snapshot) => {
        const newUsers = snapshot.val() || {};
        users = newUsers;
        console.log("Real-time users update:", Object.keys(users).length);
        
        // Обновляем список пользователей в модальном окне, если оно открыто
        if (newChatModal.classList.contains('active')) {
            const currentSearch = searchUserInput.value;
            renderUsersList(currentSearch);
        }
        
        // Обновляем статусы в чатах
        if (currentChat) {
            const otherUserId = currentChat.participants.find(id => id !== currentUser.uid);
            const otherUser = users[otherUserId];
            if (otherUser) {
                document.getElementById('chat-status').textContent = 
                    otherUser.status === 'online' ? 'online' : 'был(а) ' + formatLastSeen(otherUser.lastSeen);
                
                const onlineIndicator = document.getElementById('chat-online-indicator');
                if (otherUser.status === 'online') {
                    onlineIndicator.style.display = 'block';
                } else {
                    onlineIndicator.style.display = 'none';
                }
            }
        }
        
        renderChatsList();
    });
}

// ==================== ИНИЦИАЛИЗАЦИЯ ====================

// Загрузка сохраненной темы
const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);
document.getElementById(`theme-${savedTheme}`).checked = true;

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Проверяем, авторизован ли пользователь
    auth.onAuthStateChanged((user) => {
        if (user) {
            currentUser = user;
            loadUserData();
        } else {
            // Показываем тестовые данные для демонстрации
            loginEmail.value = 'test@test.com';
            loginPassword.value = '123456';
            registerName.value = 'Тестовый Пользователь';
            registerEmail.value = 'test@test.com';
            registerPassword.value = '123456';
        }
    });
    
    // Закрытие модальных окон при клике вне их
    window.addEventListener('click', (e) => {
        if (e.target === newChatModal) {
            closeNewChatModal.click();
        }
        if (e.target === settingsModal) {
            closeSettingsModal.click();
        }
        if (e.target === callModal) {
            // Не закрываем при клике вне области звонка
        }
        if (e.target === chatInfoModal) {
            closeChatInfoModal.click();
        }
    });
});

// Обработка закрытия страницы
window.addEventListener('beforeunload', () => {
    if (currentUser) {
        updateUserStatus('offline');
    }
    
    // Завершаем активный звонок при закрытии страницы
    if (peerConnection) {
        endCall();
    }
});

// Предотвращение потери данных при перезагрузке
window.addEventListener('beforeunload', (e) => {
    if (currentUser) {
        e.preventDefault();
        e.returnValue = '';
    }
});
