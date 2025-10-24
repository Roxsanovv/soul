// Основной код приложения
class SoulMessenger {
    constructor() {
        this.currentUser = null;
        this.currentChat = null;
        this.chats = [];
        this.messages = [];
        this.allUsers = [];
        this.typingUsers = new Map();
        this.unreadMessages = new Map();
        this.settings = {
            theme: 'dark',
            fontSize: 'medium',
            notifications: true,
            sound: true,
            messageSound: true
        };
        this.isMobile = window.innerWidth <= 768;
        this.newMessagesCount = 0;
        this.currentSearchQuery = '';
        this.currentUsersFilter = 'all';
        this.emojiAvatars = ['😊', '😎', '🤩', '😍', '🤗', '😇', '🥳', '😋', '🤠', '🥰', '😜', '🤪', '😌', '🤓', '🥸', '😏'];
        this.selectedFiles = [];
        this.uploading = false;
        this.lastMessageTime = 0; // Для предотвращения спама звуков
        this.soundCooldown = 1000; // 1 секунда между звуками
        
        // Firebase references
        this.messagesRef = null;
        this.typingRef = null;
        
        // Emoji категории
        this.emojiCategories = {
            smileys: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸', '🤩', '🥳'],
            animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐻‍❄️', '🐨', '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇'],
            food: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠'],
            travel: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🏍', '🛵', '🚲', '🛴', '🛹', '🛼', '🚁', '✈️', '🛩', '🛫', '🛬', '🪂', '💺', '🚀', '🛸', '🚉'],
            objects: ['💡', '🔦', '🕯', '🪔', '📱', '📲', '💻', '⌨️', '🖥', '🖨', '🖱', '🖲', '📞', '📟', '📠', '📺', '📷', '📹', '📼', '🔍', '🔎', '🕰', '⏰', '⏲', '⏱', '🧭', '🎈', '🎉', '🎊'],
            symbols: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️']
        };
        
        // Привязываем контекст для обработчиков событий
        this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
        this.handleBeforeUnload = this.handleBeforeUnload.bind(this);
        this.handleResize = this.handleResize.bind(this);
        
        this.init();
    }
    
    init() {
        // Инициализация обработчиков событий
        this.initEventListeners();
        this.loadSettings();
        this.applySettings();
        this.detectMobile();
        this.initAvatarOptions();
        
        // Проверка состояния аутентификации
        auth.onAuthStateChanged((user) => {
            if (user) {
                this.currentUser = user;
                this.showApp();
                this.loadUserData();
                this.loadChats();
                this.loadAllUsers();
                this.updateUserStatus('online');
            } else {
                this.showAuthScreen();
            }
        });
        
        // Обработка закрытия вкладки/браузера
        window.addEventListener('beforeunload', this.handleBeforeUnload);
        
        // Обработка видимости страницы
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
        
        // Обработка изменения размера окна
        window.addEventListener('resize', this.handleResize);
    }

    // Очистка слушателей
    cleanupListeners() {
        if (this.messagesRef) {
            this.messagesRef.off();
            this.messagesRef = null;
        }
        
        if (this.typingRef) {
            this.typingRef.off();
            this.typingRef = null;
        }
    }

    // Звуковые уведомления
    playMessageSound() {
        if (!this.settings.messageSound) return;
        
        const now = Date.now();
        if (now - this.lastMessageTime < this.soundCooldown) return;
        
        this.lastMessageTime = now;
        
        try {
            const messageSound = document.getElementById('message-sound');
            if (messageSound) {
                messageSound.currentTime = 0;
                messageSound.play().catch(e => {
                    console.log('Не удалось воспроизвести звук сообщения:', e);
                    // Пробуем fallback звук
                    this.playFallbackSound();
                });
            } else {
                this.playFallbackSound();
            }
        } catch (error) {
            console.log('Ошибка воспроизведения звука:', error);
            this.playFallbackSound();
        }
    }
    
    playNotificationSound() {
        if (!this.settings.sound) return;
        
        try {
            const notificationSound = document.getElementById('notification-sound');
            if (notificationSound) {
                notificationSound.currentTime = 0;
                notificationSound.play().catch(e => {
                    console.log('Не удалось воспроизвести звук уведомления:', e);
                    this.playFallbackSound();
                });
            } else {
                this.playFallbackSound();
            }
        } catch (error) {
            console.log('Ошибка воспроизведения звука:', error);
            this.playFallbackSound();
        }
    }
    
    playFallbackSound() {
        try {
            const fallbackSound = document.getElementById('fallback-notification-sound');
            if (fallbackSound) {
                fallbackSound.currentTime = 0;
                fallbackSound.play().catch(e => {
                    console.log('Не удалось воспроизвести fallback звук:', e);
                });
            }
        } catch (error) {
            console.log('Ошибка воспроизведения fallback звука:', error);
        }
    }
    
    // Аутентификация
    async login() {
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value.trim();
        const loginBtn = document.getElementById('login-btn');

        if (!email || !password) {
            this.showNotification('Ошибка', 'Заполните все поля', 'error');
            return;
        }

        this.setButtonLoading(loginBtn, true);

        try {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            console.log('Успешный вход:', userCredential.user);
            this.showNotification('Успех', 'Добро пожаловать!', 'success');
        } catch (error) {
            console.error('Ошибка входа:', error);
            let errorMessage = 'Ошибка входа';
            
            switch (error.code) {
                case 'auth/invalid-email':
                    errorMessage = 'Неверный формат email';
                    break;
                case 'auth/user-disabled':
                    errorMessage = 'Аккаунт заблокирован';
                    break;
                case 'auth/user-not-found':
                    errorMessage = 'Пользователь не найден';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Неверный пароль';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Слишком много попыток. Попробуйте позже';
                    break;
                default:
                    errorMessage = error.message;
            }
            
            this.showNotification('Ошибка входа', errorMessage, 'error');
        } finally {
            this.setButtonLoading(loginBtn, false);
        }
    }

    async register() {
        const name = document.getElementById('register-name').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value.trim();
        const registerBtn = document.getElementById('register-btn');

        if (!name || !email || !password) {
            this.showNotification('Ошибка', 'Заполните все поля', 'error');
            return;
        }

        if (password.length < 6) {
            this.showNotification('Ошибка', 'Пароль должен содержать минимум 6 символов', 'error');
            return;
        }

        this.setButtonLoading(registerBtn, true);

        try {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // Сохраняем дополнительные данные пользователя
            await database.ref('users/' + user.uid).set({
                name: name,
                email: email,
                username: this.generateUsername(name),
                avatar: '😊',
                status: 'online',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });

            console.log('Успешная регистрация:', user);
            this.showNotification('Успех', 'Аккаунт создан!', 'success');
        } catch (error) {
            console.error('Ошибка регистрации:', error);
            let errorMessage = 'Ошибка регистрации';
            
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'Email уже используется';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Неверный формат email';
                    break;
                case 'auth/operation-not-allowed':
                    errorMessage = 'Регистрация временно отключена';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'Пароль слишком слабый';
                    break;
                default:
                    errorMessage = error.message;
            }
            
            this.showNotification('Ошибка регистрации', errorMessage, 'error');
        } finally {
            this.setButtonLoading(registerBtn, false);
        }
    }

    // Генерация username на основе имени
    generateUsername(name) {
        const baseUsername = name.toLowerCase()
            .replace(/[^a-z0-9]/g, '')
            .substring(0, 15);
        
        const randomSuffix = Math.floor(Math.random() * 1000);
        return `${baseUsername}${randomSuffix}`;
    }

    // Выход из системы
    async logout() {
        try {
            // Очищаем слушатели
            this.cleanupListeners();
            
            if (this.currentUser) {
                await this.updateUserStatus('offline');
            }
            await auth.signOut();
            this.showNotification('Выход', 'Вы вышли из системы', 'info');
        } catch (error) {
            console.error('Ошибка выхода:', error);
            this.showNotification('Ошибка', 'Не удалось выйти из системы', 'error');
        }
    }
    
    handleBeforeUnload() {
        if (this.currentUser) {
            this.updateUserStatus('offline');
        }
    }
    
    handleVisibilityChange() {
        if (this.currentUser) {
            if (document.hidden) {
                this.updateUserStatus('away');
            } else {
                this.updateUserStatus('online');
            }
        }
    }
    
    handleResize() {
        this.detectMobile();
        this.adjustLayout();
    }
    
    initEventListeners() {
        // Переключение между формами входа и регистрации
        document.getElementById('show-register').addEventListener('click', () => {
            this.switchAuthForm('register');
        });
        
        document.getElementById('show-login').addEventListener('click', () => {
            this.switchAuthForm('login');
        });
        
        // Авторизация
        document.getElementById('login-btn').addEventListener('click', () => {
            this.login();
        });
        
        document.getElementById('register-btn').addEventListener('click', () => {
            this.register();
        });
        
        // Вход по Enter
        document.getElementById('login-password').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.login();
        });
        
        document.getElementById('register-password').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.register();
        });
        
        // Выход из системы
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.logout();
        });
        
        // Настройки
        document.getElementById('settings-btn').addEventListener('click', () => {
            this.showSettingsModal();
        });
        
        document.getElementById('close-settings-modal').addEventListener('click', () => {
            this.hideSettingsModal();
        });
        
        document.getElementById('cancel-settings').addEventListener('click', () => {
            this.hideSettingsModal();
        });
        
        document.getElementById('save-settings').addEventListener('click', () => {
            this.saveSettings();
        });
        
        // Профиль
        document.getElementById('user-avatar').addEventListener('click', () => {
            this.showProfileModal();
        });
        
        document.getElementById('user-name').addEventListener('click', () => {
            this.showProfileModal();
        });
        
        document.getElementById('close-profile-modal').addEventListener('click', () => {
            this.hideProfileModal();
        });
        
        document.getElementById('cancel-profile').addEventListener('click', () => {
            this.hideProfileModal();
        });
        
        document.getElementById('save-profile').addEventListener('click', () => {
            this.saveProfile();
        });
        
        // Мобильная навигация
        document.getElementById('mobile-menu-btn').addEventListener('click', () => {
            this.toggleSidebar();
        });
        
        document.getElementById('find-users-btn').addEventListener('click', () => {
            this.showUsersModal();
        });
        
        document.getElementById('back-to-chats').addEventListener('click', () => {
            this.hideChat();
        });
        
        // Мобильные кнопки на главном экране
        document.getElementById('mobile-new-chat').addEventListener('click', () => {
            this.showUsersModal();
        });
        
        document.getElementById('mobile-find-users').addEventListener('click', () => {
            this.showUsersModal();
        });
        
        document.getElementById('mobile-settings').addEventListener('click', () => {
            this.showSettingsModal();
        });
        
        // Отправка сообщения
        document.getElementById('send-btn').addEventListener('click', () => {
            this.sendMessage();
        });
        
        const messageInput = document.getElementById('message-input');
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Автоматическое изменение высоты textarea
        messageInput.addEventListener('input', () => {
            this.handleTyping();
            this.adjustTextareaHeight();
            this.updateCharCount();
        });
        
        // Форматирование текста
        document.querySelectorAll('.btn-format').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.formatText(e.target.dataset.format);
            });
        });
        
        // Создание нового чата
        document.getElementById('new-chat-btn').addEventListener('click', () => {
            this.showUsersModal();
        });
        
        // Закрытие модальных окон
        document.getElementById('close-users-modal').addEventListener('click', () => {
            this.hideUsersModal();
        });
        
        document.getElementById('cancel-users-btn').addEventListener('click', () => {
            this.hideUsersModal();
        });
        
        // Поиск пользователей
        const usersSearch = document.getElementById('users-search');
        usersSearch.addEventListener('input', (e) => {
            this.currentSearchQuery = e.target.value;
            // Применяем фильтр с задержкой для производительности
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                this.applyUsersFilter();
            }, 300);
        });
        
        usersSearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.applyUsersFilter();
            }
        });
        
        document.getElementById('search-users-btn').addEventListener('click', () => {
            this.applyUsersFilter();
        });
        
        // Фильтры пользователей
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setUsersFilter(e.target.dataset.filter);
            });
        });
        
        // Поиск чатов
        const searchInput = document.getElementById('search-input');
        searchInput.addEventListener('input', (e) => {
            this.filterChats(e.target.value);
            this.toggleClearSearch(e.target.value.length > 0);
        });
        
        document.getElementById('clear-search').addEventListener('click', () => {
            searchInput.value = '';
            this.filterChats('');
            this.toggleClearSearch(false);
        });
        
        // Кнопки действий в чате
        document.getElementById('voice-call-btn').addEventListener('click', () => {
            this.showNotification('Голосовой вызов', 'Функция в разработке', 'info');
        });
        
        document.getElementById('video-call-btn').addEventListener('click', () => {
            this.showNotification('Видеозвонок', 'Функция в разработке', 'info');
        });
        
        document.getElementById('chat-info-btn').addEventListener('click', () => {
            this.showChatInfo();
        });
        
        // Прокрутка к новым сообщениям
        document.getElementById('scroll-to-bottom').addEventListener('click', () => {
            this.scrollToBottom();
        });
        
        // Обработка скролла сообщений
        const messagesScroll = document.getElementById('messages-scroll');
        messagesScroll.addEventListener('scroll', () => {
            this.handleMessagesScroll();
        });
        
        // Эмодзи
        document.getElementById('emoji-btn').addEventListener('click', () => {
            this.showEmojiModal();
        });
        
        document.getElementById('close-emoji-modal').addEventListener('click', () => {
            this.hideEmojiModal();
        });
        
        // Категории эмодзи
        document.querySelectorAll('.emoji-category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchEmojiCategory(e.target.dataset.category);
            });
        });
        
        // Медиафайлы
        document.getElementById('media-btn').addEventListener('click', () => {
            this.showMediaModal();
        });
        
        document.getElementById('close-media-modal').addEventListener('click', () => {
            this.hideMediaModal();
        });
        
        document.getElementById('cancel-media').addEventListener('click', () => {
            this.hideMediaModal();
        });
        
        document.getElementById('upload-media').addEventListener('click', () => {
            this.uploadMediaFiles();
        });
        
        // Загрузка файлов
        const mediaUploadArea = document.getElementById('media-upload-area');
        const mediaFileInput = document.getElementById('media-file-input');
        
        mediaUploadArea.addEventListener('click', () => {
            mediaFileInput.click();
        });
        
        mediaFileInput.addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files);
        });
        
        // Drag and drop для файлов
        mediaUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            mediaUploadArea.classList.add('dragover');
        });
        
        mediaUploadArea.addEventListener('dragleave', () => {
            mediaUploadArea.classList.remove('dragover');
        });
        
        mediaUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            mediaUploadArea.classList.remove('dragover');
            this.handleFileSelect(e.dataTransfer.files);
        });
        
        // Просмотр медиа
        document.getElementById('media-viewer-modal').addEventListener('click', (e) => {
            if (e.target.id === 'media-viewer-modal') {
                this.hideMediaViewer();
            }
        });
        
        document.querySelector('.media-viewer-close').addEventListener('click', () => {
            this.hideMediaViewer();
        });
        
        // Закрытие модальных окон при клике вне их
        document.addEventListener('click', (e) => {
            if (e.target.id === 'users-modal') this.hideUsersModal();
            if (e.target.id === 'settings-modal') this.hideSettingsModal();
            if (e.target.id === 'profile-modal') this.hideProfileModal();
            if (e.target.id === 'emoji-modal') this.hideEmojiModal();
            if (e.target.id === 'media-modal') this.hideMediaModal();
        });
        
        // Закрытие уведомлений при клике
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('notification-close')) {
                e.target.closest('.notification').remove();
            }
        });
        
        // Обработка сенсорных жестов
        this.initTouchEvents();
    }
    
    // Эмодзи
    showEmojiModal() {
        document.getElementById('emoji-modal').classList.remove('hidden');
        this.loadEmojiCategory('smileys');
    }
    
    hideEmojiModal() {
        document.getElementById('emoji-modal').classList.add('hidden');
    }
    
    loadEmojiCategory(category) {
        const emojiGrid = document.getElementById('emoji-grid');
        emojiGrid.innerHTML = '';
        
        if (this.emojiCategories[category]) {
            this.emojiCategories[category].forEach(emoji => {
                const emojiElement = document.createElement('div');
                emojiElement.className = 'emoji-item';
                emojiElement.textContent = emoji;
                emojiElement.addEventListener('click', () => {
                    this.insertEmoji(emoji);
                });
                emojiGrid.appendChild(emojiElement);
            });
        }
    }
    
    switchEmojiCategory(category) {
        // Обновляем активную кнопку категории
        document.querySelectorAll('.emoji-category-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');
        
        this.loadEmojiCategory(category);
    }
    
    insertEmoji(emoji) {
        const messageInput = document.getElementById('message-input');
        const start = messageInput.selectionStart;
        const end = messageInput.selectionEnd;
        
        messageInput.setRangeText(emoji, start, end, 'end');
        messageInput.focus();
        this.updateCharCount();
        this.hideEmojiModal();
    }
    
    // Медиафайлы (без Firebase Storage)
    showMediaModal() {
        document.getElementById('media-modal').classList.remove('hidden');
        this.clearMediaPreview();
    }
    
    hideMediaModal() {
        document.getElementById('media-modal').classList.add('hidden');
        this.clearMediaPreview();
        this.uploading = false;
    }
    
    handleFileSelect(files) {
        if (this.uploading) return;
        
        const validFiles = Array.from(files).filter(file => {
            const isImage = file.type.startsWith('image/');
            const isVideo = file.type.startsWith('video/');
            const isValidSize = file.size <= 2 * 1024 * 1024; // 2MB limit для Base64
            
            if (!isImage && !isVideo) {
                this.showNotification('Ошибка', 'Поддерживаются только фото и видео файлы', 'error');
                return false;
            }
            
            if (!isValidSize) {
                this.showNotification('Ошибка', 'Файл слишком большой (макс. 2MB)', 'error');
                return false;
            }
            
            return true;
        });
        
        this.selectedFiles = [...this.selectedFiles, ...validFiles];
        this.renderMediaPreview();
        this.updateUploadButton();
    }
    
    renderMediaPreview() {
        const previewContainer = document.getElementById('media-preview');
        previewContainer.innerHTML = '';
        
        this.selectedFiles.forEach((file, index) => {
            const previewItem = document.createElement('div');
            previewItem.className = 'media-preview-item';
            
            const objectUrl = URL.createObjectURL(file);
            
            if (file.type.startsWith('image/')) {
                previewItem.innerHTML = `
                    <img src="${objectUrl}" alt="Preview">
                    <button class="remove-media" data-index="${index}">×</button>
                `;
            } else if (file.type.startsWith('video/')) {
                previewItem.innerHTML = `
                    <video src="${objectUrl}" muted></video>
                    <button class="remove-media" data-index="${index}">×</button>
                `;
            }
            
            previewContainer.appendChild(previewItem);
            
            // Обработчик удаления файла
            previewItem.querySelector('.remove-media').addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeMediaFile(parseInt(e.target.dataset.index));
            });
        });
    }
    
    removeMediaFile(index) {
        this.selectedFiles.splice(index, 1);
        this.renderMediaPreview();
        this.updateUploadButton();
    }
    
    clearMediaPreview() {
        this.selectedFiles = [];
        document.getElementById('media-preview').innerHTML = '';
        document.getElementById('upload-progress').classList.add('hidden');
        this.updateUploadButton();
    }
    
    updateUploadButton() {
        const uploadBtn = document.getElementById('upload-media');
        uploadBtn.disabled = this.selectedFiles.length === 0 || this.uploading;
    }
    
    async uploadMediaFiles() {
        if (this.uploading || !this.currentChat || this.selectedFiles.length === 0) return;
        
        this.uploading = true;
        this.updateUploadButton();
        
        const progressBar = document.getElementById('upload-progress');
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        
        progressBar.classList.remove('hidden');
        
        try {
            for (let i = 0; i < this.selectedFiles.length; i++) {
                const file = this.selectedFiles[i];
                await this.uploadSingleFile(file, (progress) => {
                    const percent = Math.round(progress);
                    progressFill.style.width = percent + '%';
                    progressText.textContent = `${percent}%`;
                });
            }
            
            this.hideMediaModal();
            this.showNotification('Успех', 'Файлы успешно отправлены', 'success');
            
        } catch (error) {
            console.error('Ошибка загрузки файлов:', error);
            this.showNotification('Ошибка', 'Не удалось загрузить файлы', 'error');
        } finally {
            this.uploading = false;
            progressBar.classList.add('hidden');
        }
    }
    
    async uploadSingleFile(file, progressCallback) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onloadstart = () => {
                progressCallback(10);
            };
            
            reader.onprogress = (e) => {
                if (e.lengthComputable) {
                    const percent = 10 + (e.loaded / e.total) * 80;
                    progressCallback(percent);
                }
            };
            
            reader.onload = async (e) => {
                try {
                    progressCallback(95);
                    
                    let base64Data = e.target.result;
                    
                    // Компрессия для изображений
                    if (file.type.startsWith('image/')) {
                        base64Data = await this.compressImage(base64Data, file.type);
                    }
                    
                    // Создаем сообщение с медиа
                    const message = {
                        type: file.type.startsWith('image/') ? 'image' : 'video',
                        mediaData: base64Data,
                        fileName: file.name,
                        fileSize: file.size,
                        mimeType: file.type,
                        senderId: this.currentUser.uid,
                        timestamp: new Date().toISOString()
                    };
                    
                    // Сохраняем сообщение в базе данных
                    const messagesRef = database.ref('messages/' + this.currentChat.id);
                    await messagesRef.push(message);
                    
                    // Обновляем последнее сообщение в чате
                    const chatRef = database.ref('chats/' + this.currentChat.id);
                    const mediaType = message.type === 'image' ? '📷 Фото' : '🎥 Видео';
                    await chatRef.update({
                        lastMessage: mediaType,
                        lastMessageTime: message.timestamp
                    });
                    
                    progressCallback(100);
                    resolve();
                    
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => {
                reject(new Error('Ошибка чтения файла'));
            };
            
            // Читаем файл как Data URL (Base64)
            reader.readAsDataURL(file);
        });
    }
    
    // Компрессия изображений
    async compressImage(base64Data, mimeType) {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = base64Data;
            
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Максимальные размеры
                const MAX_WIDTH = 800;
                const MAX_HEIGHT = 600;
                
                let { width, height } = img;
                
                // Масштабируем если нужно
                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                
                ctx.drawImage(img, 0, 0, width, height);
                
                // Качество сжатия
                const quality = 0.7;
                resolve(canvas.toDataURL(mimeType, quality));
            };
            
            img.onerror = () => {
                // Если не удалось сжать, возвращаем оригинал
                resolve(base64Data);
            };
        });
    }
    
    // Просмотр медиа
    showMediaViewer(mediaData, mediaType) {
        const viewer = document.getElementById('media-viewer');
        viewer.innerHTML = '';
        
        if (mediaType === 'image') {
            viewer.innerHTML = `<img src="${mediaData}" alt="Просмотр">`;
        } else if (mediaType === 'video') {
            viewer.innerHTML = `<video src="${mediaData}" controls autoplay></video>`;
        }
        
        document.getElementById('media-viewer-modal').classList.remove('hidden');
    }
    
    hideMediaViewer() {
        document.getElementById('media-viewer-modal').classList.add('hidden');
    }
    
    // Инициализация выбора аватарок
    initAvatarOptions() {
        const avatarOptions = document.getElementById('avatar-options');
        avatarOptions.innerHTML = '';
        
        this.emojiAvatars.forEach(emoji => {
            const option = document.createElement('div');
            option.className = 'avatar-option';
            option.textContent = emoji;
            option.addEventListener('click', () => {
                this.selectAvatar(emoji);
            });
            avatarOptions.appendChild(option);
        });
    }
    
    selectAvatar(emoji) {
        // Снимаем выделение со всех опций
        document.querySelectorAll('.avatar-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        
        // Выделяем выбранную опцию
        event.target.classList.add('selected');
        
        // Обновляем превью
        document.getElementById('profile-avatar-preview').textContent = emoji;
    }
    
    // Профиль пользователя
    async showProfileModal() {
        const userRef = database.ref('users/' + this.currentUser.uid);
        const snapshot = await userRef.once('value');
        const userData = snapshot.val();
        
        if (userData) {
            document.getElementById('profile-name').value = userData.name || '';
            document.getElementById('profile-username').value = userData.username || '';
            document.getElementById('profile-bio').value = userData.bio || '';
            
            // Устанавливаем аватарку
            const avatarPreview = document.getElementById('profile-avatar-preview');
            avatarPreview.textContent = userData.avatar || '😊';
            
            // Выделяем текущую аватарку в опциях
            document.querySelectorAll('.avatar-option').forEach(opt => {
                opt.classList.remove('selected');
                if (opt.textContent === (userData.avatar || '😊')) {
                    opt.classList.add('selected');
                }
            });
            
            // Обновляем статистику
            document.getElementById('profile-chats-count').textContent = this.chats.length;
            
            if (userData.createdAt) {
                const joinDate = new Date(userData.createdAt);
                document.getElementById('profile-joined-date').textContent = 
                    Math.floor((Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24)) + ' дн.';
            }
        }
        
        document.getElementById('profile-modal').classList.remove('hidden');
    }
    
    hideProfileModal() {
        document.getElementById('profile-modal').classList.add('hidden');
    }
    
    async saveProfile() {
        const name = document.getElementById('profile-name').value.trim();
        const username = document.getElementById('profile-username').value.trim();
        const bio = document.getElementById('profile-bio').value.trim();
        const selectedAvatar = document.querySelector('.avatar-option.selected');
        const avatar = selectedAvatar ? selectedAvatar.textContent : '😊';
        
        if (!name) {
            this.showNotification('Ошибка', 'Имя не может быть пустым', 'error');
            return;
        }
        
        if (!username) {
            this.showNotification('Ошибка', 'Username не может быть пустым', 'error');
            return;
        }
        
        // Проверка формата username
        const usernameRegex = /^[a-zA-Z0-9_]+$/;
        if (!usernameRegex.test(username)) {
            this.showNotification('Ошибка', 'Username может содержать только латинские буквы, цифры и _', 'error');
            return;
        }
        
        // Проверка длины bio
        if (bio.length > 150) {
            this.showNotification('Ошибка', 'Описание не может превышать 150 символов', 'error');
            return;
        }
        
        try {
            await database.ref('users/' + this.currentUser.uid).update({
                name: name,
                username: username.toLowerCase(),
                bio: bio,
                avatar: avatar,
                updatedAt: new Date().toISOString()
            });
            
            this.hideProfileModal();
            this.showNotification('Профиль', 'Профиль успешно обновлен', 'success');
            this.loadUserData();
            
        } catch (error) {
            console.error('Ошибка обновления профиля:', error);
            this.showNotification('Ошибка', 'Не удалось обновить профиль: ' + error.message, 'error');
        }
    }
    
    // Определение мобильного устройства
    detectMobile() {
        this.isMobile = window.innerWidth <= 768;
        document.body.classList.toggle('mobile', this.isMobile);
    }
    
    // Настройка адаптивного layout
    adjustLayout() {
        if (this.isMobile && this.currentChat) {
            document.querySelector('.sidebar').classList.remove('active');
        }
    }
    
    // Инициализация сенсорных событий
    initTouchEvents() {
        let startX = 0;
        let currentX = 0;
        
        document.addEventListener('touchstart', (e) => {
            if (!this.isMobile) return;
            
            startX = e.touches[0].clientX;
        }, { passive: true });
        
        document.addEventListener('touchmove', (e) => {
            if (!this.isMobile) return;
            
            currentX = e.touches[0].clientX;
        }, { passive: true });
        
        document.addEventListener('touchend', () => {
            if (!this.isMobile) return;
            
            const diff = currentX - startX;
            const threshold = 50;
            
            if (Math.abs(diff) > threshold) {
                if (diff > 0 && this.currentChat) {
                    // Свайп вправо - показать список чатов
                    this.hideChat();
                }
            }
        }, { passive: true });
    }
    
    // Управление боковой панелью на мобильных
    toggleSidebar() {
        const sidebar = document.querySelector('.sidebar');
        sidebar.classList.toggle('active');
        
        if (sidebar.classList.contains('active')) {
            document.body.classList.add('sidebar-open');
        } else {
            document.body.classList.remove('sidebar-open');
        }
    }
    
    hideChat() {
        this.currentChat = null;
        document.getElementById('chat-container').classList.add('hidden');
        document.getElementById('no-chat-selected').classList.remove('hidden');
        
        if (this.isMobile) {
            document.querySelector('.sidebar').classList.add('active');
            document.body.classList.add('sidebar-open');
        }
        
        this.renderChatsList();
    }
    
    // Загрузка всех пользователей
    async loadAllUsers() {
        try {
            const usersRef = database.ref('users');
            usersRef.on('value', (snapshot) => {
                this.allUsers = [];
                const usersData = snapshot.val();
                
                console.log('Данные пользователей из базы:', usersData);
                
                if (usersData) {
                    Object.keys(usersData).forEach(userId => {
                        // Исключаем текущего пользователя из списка
                        if (userId !== this.currentUser.uid) {
                            const userData = usersData[userId];
                            this.allUsers.push({
                                id: userId,
                                name: userData.name || 'Без имени',
                                username: userData.username || 'user',
                                email: userData.email || '',
                                avatar: userData.avatar || '😊',
                                status: userData.status || 'offline',
                                bio: userData.bio || '',
                                createdAt: userData.createdAt,
                                lastSeen: userData.lastSeen
                            });
                        }
                    });
                    
                    console.log(`Загружено пользователей: ${this.allUsers.length}`);
                    this.applyUsersFilter();
                } else {
                    console.log('В базе данных нет пользователей');
                    this.applyUsersFilter();
                }
            }, (error) => {
                console.error('Ошибка загрузки пользователей:', error);
                this.showNotification('Ошибка', 'Не удалось загрузить пользователей', 'error');
            });
        } catch (error) {
            console.error('Критическая ошибка загрузки пользователей:', error);
            this.showNotification('Ошибка', 'Критическая ошибка загрузки пользователей', 'error');
        }
    }
    
    // Поиск пользователей
    applyUsersFilter() {
        const usersList = document.getElementById('users-list');
        const searchTerm = (this.currentSearchQuery || '').toLowerCase().trim();
        const filter = this.currentUsersFilter || 'all';
        
        // Если нет пользователей, показываем сообщение
        if (this.allUsers.length === 0) {
            usersList.innerHTML = `
                <div class="no-results">
                    <div class="no-results-icon">👥</div>
                    <p>Других пользователей пока нет</p>
                    <p class="hint">Пригласите друзей, чтобы начать общение!</p>
                </div>
            `;
            this.updateSearchResultsInfo(0);
            return;
        }
        
        // Если есть поисковый запрос, фильтруем по нему
        let filteredUsers = [...this.allUsers];
        
        if (searchTerm) {
            filteredUsers = this.allUsers.filter(user => {
                const name = (user.name || '').toLowerCase();
                const username = (user.username || '').toLowerCase();
                const email = (user.email || '').toLowerCase();
                
                // Ищем по имени, username или email
                return name.includes(searchTerm) || 
                       username.includes(searchTerm) ||
                       email.includes(searchTerm) ||
                       `@${username}`.includes(searchTerm);
            });
        }
        
        // Применяем дополнительный фильтр
        switch (filter) {
            case 'online':
                filteredUsers = filteredUsers.filter(user => user.status === 'online');
                break;
            case 'recent':
                filteredUsers = filteredUsers.filter(user => this.isRecentUser(user.id));
                break;
            case 'all':
            default:
                // Без дополнительной фильтрации
                break;
        }
        
        this.renderFilteredUsersList(filteredUsers);
        this.updateSearchResultsInfo(filteredUsers.length);
        
        // Показываем сообщение, если ничего не найдено
        if (filteredUsers.length === 0) {
            usersList.innerHTML = `
                <div class="no-results">
                    <div class="no-results-icon">🔍</div>
                    <p>По запросу "<strong>${searchTerm}</strong>" ничего не найдено</p>
                    <p class="hint">Попробуйте изменить запрос или использовать другой фильтр</p>
                </div>
            `;
        }
    }
    
    // Функция для отрисовки отфильтрованного списка
    renderFilteredUsersList(users) {
        const usersList = document.getElementById('users-list');
        usersList.innerHTML = '';
        
        users.forEach(user => {
            const userElement = document.createElement('div');
            userElement.className = 'user-item';
            userElement.dataset.userId = user.id;
            
            userElement.innerHTML = `
                <div class="user-item-avatar ${user.status}">${user.avatar || '😊'}</div>
                <div class="user-item-info">
                    <div class="user-item-name">${user.name}</div>
                    <div class="user-item-username">@${user.username || 'user'}</div>
                    <div class="user-item-status ${user.status}">${this.getStatusText(user.status)}</div>
                </div>
            `;
            
            userElement.addEventListener('click', () => {
                this.createChatWithUser(user);
            });
            
            usersList.appendChild(userElement);
        });
    }
    
    setUsersFilter(filter) {
        // Обновляем активную кнопку фильтра
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        this.currentUsersFilter = filter;
        this.applyUsersFilter();
    }
    
    updateSearchResultsInfo(visibleCount = null) {
        const infoElement = document.getElementById('search-results-info');
        if (!infoElement) return;
        
        const totalCount = this.allUsers.length;
        const count = visibleCount !== null ? visibleCount : totalCount;
        const searchTerm = this.currentSearchQuery;
        
        let infoText = '';
        
        if (searchTerm) {
            if (count === 0) {
                infoText = '';
            } else {
                infoText = `Найдено ${count} пользователей`;
            }
        } else {
            infoText = `Всего пользователей: ${count}`;
        }
        
        infoElement.textContent = infoText;
    }
    
    // Проверка, является ли пользователь недавним
    isRecentUser(userId) {
        return this.chats.some(chat => 
            chat.participants && 
            chat.participants[userId] &&
            chat.lastMessageTime &&
            (Date.now() - new Date(chat.lastMessageTime).getTime()) < 7 * 24 * 60 * 60 * 1000 // 7 дней
        );
    }
    
    // Создание чата с выбранным пользователем
    async createChatWithUser(user) {
        // Проверяем, существует ли уже чат с этим пользователем
        const existingChat = this.chats.find(chat => 
            chat.type === 'private' && 
            chat.participants && 
            chat.participants[user.id]
        );
        
        if (existingChat) {
            this.selectChat(existingChat);
            this.hideUsersModal();
            this.showNotification('Чат открыт', `Продолжение диалога с ${user.name}`, 'info');
            return;
        }
        
        try {
            // Создаем чат
            const chatData = {
                type: 'private',
                name: user.name,
                participants: {
                    [this.currentUser.uid]: true,
                    [user.id]: true
                },
                createdAt: new Date().toISOString(),
                lastMessage: 'Чат создан',
                lastMessageTime: new Date().toISOString()
            };
            
            const newChatRef = database.ref('chats').push();
            await newChatRef.set(chatData);
            
            // Добавляем чат в список чатов пользователей
            await database.ref('userChats/' + this.currentUser.uid + '/' + newChatRef.key).set(true);
            await database.ref('userChats/' + user.id + '/' + newChatRef.key).set(true);
            
            this.hideUsersModal();
            this.showNotification('Чат создан', `Начат чат с ${user.name}`, 'success');
            
        } catch (error) {
            this.showNotification('Ошибка', 'Не удалось создать чат', 'error');
            console.error('Ошибка создания чата:', error);
        }
    }
    
    // Загрузка данных пользователя
    async loadUserData() {
        const userRef = database.ref('users/' + this.currentUser.uid);
        userRef.on('value', (snapshot) => {
            const userData = snapshot.val();
            if (userData) {
                document.getElementById('user-name').textContent = userData.name;
                document.getElementById('user-avatar').textContent = userData.avatar || '😊';
                document.getElementById('user-status').textContent = userData.status;
                
                // Обновляем статус в реальном времени
                const statusElement = document.getElementById('user-status');
                statusElement.className = `user-status status-${userData.status}`;
            }
        });
    }
    
    // Управление статусом пользователя
    async updateUserStatus(status) {
        if (!this.currentUser) return;
        
        try {
            await database.ref('users/' + this.currentUser.uid).update({
                status: status,
                lastSeen: new Date().toISOString()
            });
        } catch (error) {
            console.error('Ошибка обновления статуса:', error);
        }
    }
    
    // Загрузка списка чатов
    async loadChats() {
        const userChatsRef = database.ref('userChats/' + this.currentUser.uid);
        userChatsRef.on('value', (snapshot) => {
            this.chats = [];
            const chatsData = snapshot.val();
            
            if (chatsData) {
                Object.keys(chatsData).forEach(chatId => {
                    const chatRef = database.ref('chats/' + chatId);
                    chatRef.on('value', (chatSnapshot) => {
                        const chatData = chatSnapshot.val();
                        if (chatData) {
                            this.addChatToList(chatId, chatData);
                        }
                    });
                });
            }
            
            this.updateChatsCount();
        });
    }
    
    // Добавление чата в список
    addChatToList(chatId, chatData) {
        const existingChatIndex = this.chats.findIndex(chat => chat.id === chatId);
        
        if (existingChatIndex !== -1) {
            this.chats[existingChatIndex] = { id: chatId, ...chatData };
        } else {
            this.chats.push({ id: chatId, ...chatData });
        }
        
        // Сортируем чаты по времени последнего сообщения
        this.chats.sort((a, b) => {
            const timeA = new Date(a.lastMessageTime || a.createdAt);
            const timeB = new Date(b.lastMessageTime || b.createdAt);
            return timeB - timeA;
        });
        
        this.renderChatsList();
        this.updateChatsCount();
    }
    
    // Отрисовка списка чатов
    renderChatsList() {
        const chatsList = document.getElementById('chats-list');
        chatsList.innerHTML = '';
        
        if (this.chats.length === 0) {
            chatsList.innerHTML = `
                <div class="no-chats">
                    <p>У вас пока нет чатов</p>
                    <p class="hint">Создайте новый чат, чтобы начать общение</p>
                </div>
            `;
            return;
        }
        
        this.chats.forEach(chat => {
            const chatElement = document.createElement('div');
            chatElement.className = 'chat-item';
            if (this.currentChat && this.currentChat.id === chat.id) {
                chatElement.classList.add('active');
            }
            
            // Определяем название чата и аватар
            let chatName = chat.name || 'Чат';
            let lastMessage = chat.lastMessage || 'Нет сообщений';
            let avatarText = this.getInitials(chatName);
            let unreadCount = this.unreadMessages.get(chat.id) || 0;
            
            // Форматируем время последнего сообщения
            let timeText = '';
            if (chat.lastMessageTime) {
                const messageTime = new Date(chat.lastMessageTime);
                timeText = this.formatMessageTime(messageTime);
            }
            
            // Для приватных чатов определяем имя собеседника и аватар
            if (chat.type === 'private') {
                const participantIds = Object.keys(chat.participants || {});
                const otherParticipantId = participantIds.find(id => id !== this.currentUser.uid);
                
                if (otherParticipantId) {
                    // Находим данные пользователя в списке всех пользователей
                    const otherUser = this.allUsers.find(user => user.id === otherParticipantId);
                    if (otherUser) {
                        chatName = otherUser.name;
                        avatarText = otherUser.avatar || this.getInitials(otherUser.name);
                    }
                }
            }
            
            chatElement.innerHTML = `
                <div class="chat-item-avatar">
                    ${avatarText}
                    ${unreadCount > 0 ? `<div class="chat-item-unread">${unreadCount}</div>` : ''}
                </div>
                <div class="chat-item-info">
                    <div class="chat-item-name">${chatName}</div>
                    <div class="chat-item-last-message">${lastMessage}</div>
                    ${timeText ? `<div class="chat-item-time">${timeText}</div>` : ''}
                </div>
            `;
            
            chatElement.addEventListener('click', () => {
                this.selectChat({ id: chat.id, ...chat, name: chatName });
                this.markChatAsRead(chat.id);
            });
            
            chatsList.appendChild(chatElement);
        });
    }
    
    // Фильтрация чатов
    filterChats(query) {
        const chats = document.querySelectorAll('.chat-item');
        const searchTerm = query.toLowerCase();
        
        chats.forEach(chat => {
            const name = chat.querySelector('.chat-item-name').textContent.toLowerCase();
            const lastMessage = chat.querySelector('.chat-item-last-message').textContent.toLowerCase();
            
            if (name.includes(searchTerm) || lastMessage.includes(searchTerm)) {
                chat.style.display = 'flex';
            } else {
                chat.style.display = 'none';
            }
        });
    }
    
    // Выбор чата
    selectChat(chat) {
        // Очищаем предыдущие слушатели
        this.cleanupListeners();
        
        this.currentChat = chat;
        this.renderChatsList();
        this.showChat();
        this.loadMessages(chat.id);
        this.setupTypingListener(chat.id);
        this.markChatAsRead(chat.id);
        this.newMessagesCount = 0;
        this.updateScrollIndicator();
        
        // Обновляем информацию о чате в заголовке
        document.getElementById('chat-title').textContent = chat.name;
        document.getElementById('chat-avatar').textContent = this.getInitials(chat.name);
        
        // Определяем статус собеседника для приватных чатов
        if (chat.type === 'private') {
            const participantIds = Object.keys(chat.participants || {});
            const otherParticipantId = participantIds.find(id => id !== this.currentUser.uid);
            
            if (otherParticipantId) {
                const userRef = database.ref('users/' + otherParticipantId);
                userRef.on('value', (snapshot) => {
                    const userData = snapshot.val();
                    if (userData) {
                        const status = this.getStatusText(userData.status);
                        document.getElementById('chat-status').textContent = status;
                    }
                });
            }
        } else {
            document.getElementById('chat-status').textContent = 'групповой чат';
        }
        
        // На мобильных устройствах скрываем sidebar и показываем чат
        if (this.isMobile) {
            document.querySelector('.sidebar').classList.remove('active');
            document.body.classList.remove('sidebar-open');
        }
        
        // Фокусируемся на поле ввода сообщения
        setTimeout(() => {
            document.getElementById('message-input').focus();
        }, 300);
    }
    
    // Загрузка сообщений чата
    loadMessages(chatId) {
        // Очищаем предыдущие сообщения
        this.messages = [];
        const messagesScroll = document.getElementById('messages-scroll');
        messagesScroll.innerHTML = '<div class="media-loading"><div class="media-loading-spinner"></div>Загрузка сообщений...</div>';

        this.messagesRef = database.ref('messages/' + chatId);
        
        // Используем once для однократного получения и on для новых сообщений
        this.messagesRef.orderByChild('timestamp').once('value').then((snapshot) => {
            messagesScroll.innerHTML = '';
            const messagesData = snapshot.val();
            
            if (messagesData) {
                Object.keys(messagesData).forEach(messageId => {
                    const message = { id: messageId, ...messagesData[messageId] };
                    this.messages.push(message);
                    this.renderMessage(message);
                });
                
                setTimeout(() => this.scrollToBottom(), 100);
            } else {
                messagesScroll.innerHTML = '<div class="no-results"><p>Нет сообщений</p><p class="hint">Начните общение первым!</p></div>';
            }
        });

        // Слушаем только новые сообщения
        this.messagesRef.orderByChild('timestamp').on('child_added', (snapshot) => {
            // Проверяем, нет ли уже такого сообщения
            const newMessage = { id: snapshot.key, ...snapshot.val() };
            const messageExists = this.messages.some(msg => msg.id === newMessage.id);
            
            if (!messageExists) {
                this.messages.push(newMessage);
                this.renderMessage(newMessage);
                
                // Прокрутка к последнему сообщению только если пользователь уже внизу
                if (this.isNearBottom()) {
                    setTimeout(() => this.scrollToBottom(), 100);
                }
                
                // Уведомление о новом сообщении
                if (newMessage.senderId !== this.currentUser.uid) {
                    this.handleNewMessage(newMessage, chatId);
                }
            }
        });
    }
    
    // Отрисовка сообщения
    renderMessage(message) {
        const messagesScroll = document.getElementById('messages-scroll');
        const messageElement = document.createElement('div');
        
        const isSentByMe = message.senderId === this.currentUser.uid;
        messageElement.className = `message ${isSentByMe ? 'sent' : 'received'}`;
        
        // Форматирование времени
        const messageTime = new Date(message.timestamp);
        const timeString = messageTime.toLocaleTimeString('ru-RU', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        let senderName = 'Вы';
        let senderAvatar = '';
        if (!isSentByMe) {
            // Получаем имя отправителя
            const userRef = database.ref('users/' + message.senderId);
            userRef.once('value').then(snapshot => {
                const userData = snapshot.val();
                if (userData) {
                    senderName = userData.name;
                    senderAvatar = userData.avatar || this.getInitials(userData.name);
                    
                    const senderElement = messageElement.querySelector('.message-sender');
                    if (senderElement) {
                        senderElement.innerHTML = `
                            <span class="sender-avatar">${senderAvatar}</span>
                            ${senderName}
                        `;
                    }
                }
            });
        }
        
        // Обработка разных типов сообщений
        let messageContent = '';
        
        if (message.type === 'image' || message.type === 'video') {
            // Медиа-сообщение
            messageContent = this.renderMediaMessage(message);
        } else {
            // Текстовое сообщение
            messageContent = `
                ${!isSentByMe ? `<div class="message-sender"></div>` : ''}
                <div class="message-text">${this.formatMessageText(message.text)}</div>
                <div class="message-time">${timeString}</div>
            `;
        }
        
        messageElement.innerHTML = messageContent;
        messagesScroll.appendChild(messageElement);
    }
    
    // Отрисовка медиа-сообщения
    renderMediaMessage(message) {
        const isSentByMe = message.senderId === this.currentUser.uid;
        const timeString = new Date(message.timestamp).toLocaleTimeString('ru-RU', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        const fileSize = this.formatFileSize(message.fileSize);
        const mediaType = message.type === 'image' ? '📷 Фото' : '🎥 Видео';
        
        return `
            ${!isSentByMe ? `<div class="message-sender"></div>` : ''}
            <div class="message-media">
                ${message.type === 'image' ? 
                    `<img src="${message.mediaData}" alt="${message.fileName}" onclick="soulApp.showMediaViewer('${message.mediaData}', 'image')">` :
                    `<video src="${message.mediaData}" controls onclick="soulApp.showMediaViewer('${message.mediaData}', 'video')"></video>`
                }
                <div class="media-info">
                    <span>${mediaType} • ${fileSize}</span>
                    <button class="media-download" onclick="soulApp.downloadMedia('${message.mediaData}', '${message.fileName}')">Скачать</button>
                </div>
            </div>
            <div class="message-time">${timeString}</div>
        `;
    }
    
    // Скачивание медиа
    downloadMedia(mediaData, fileName) {
        const link = document.createElement('a');
        link.href = mediaData;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    // Форматирование размера файла
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // Форматирование текста сообщения
    formatMessageText(text) {
        // Простое форматирование Markdown-like
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
    }
    
    // Настройка слушателя набора текста
    setupTypingListener(chatId) {
        this.typingRef = database.ref('typing/' + chatId);
        this.typingRef.on('value', (snapshot) => {
            const typingData = snapshot.val();
            this.updateTypingIndicator(typingData);
        });
    }
    
    // Обновление индикатора набора текста
    updateTypingIndicator(typingData) {
        const indicator = document.getElementById('typing-indicator');
        
        if (!typingData) {
            indicator.innerHTML = '';
            return;
        }
        
        const typingUsers = Object.keys(typingData)
            .filter(userId => userId !== this.currentUser.uid && typingData[userId])
            .map(userId => {
                const user = this.allUsers.find(u => u.id === userId);
                return user ? user.name : 'Кто-то';
            });
        
        if (typingUsers.length > 0) {
            const names = typingUsers.join(', ');
            const verb = typingUsers.length === 1 ? 'печатает' : 'печатают';
            indicator.innerHTML = `
                <span>${names} ${verb}</span>
                <div class="typing-dots">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            `;
        } else {
            indicator.innerHTML = '';
        }
    }
    
    // Обработка набора текста
    handleTyping() {
        if (!this.currentChat) return;
        
        const chatId = this.currentChat.id;
        const typingRef = database.ref('typing/' + chatId + '/' + this.currentUser.uid);
        
        // Устанавливаем статус набора
        typingRef.set(true);
        
        // Сбрасываем статус через 2 секунды
        clearTimeout(this.typingTimeout);
        this.typingTimeout = setTimeout(() => {
            typingRef.set(false);
        }, 2000);
    }
    
    // Отправка сообщения
    async sendMessage() {
        const messageInput = document.getElementById('message-input');
        const messageText = messageInput.value.trim();
        
        if (!messageText || !this.currentChat) {
            return;
        }
        
        if (messageText.length > 1000) {
            this.showNotification('Ошибка', 'Сообщение слишком длинное', 'error');
            return;
        }
        
        // Защита от множественной отправки
        const sendBtn = document.getElementById('send-btn');
        if (sendBtn.disabled) return;
        
        sendBtn.disabled = true;
        sendBtn.classList.add('loading');
        
        const message = {
            text: messageText,
            senderId: this.currentUser.uid,
            timestamp: new Date().toISOString()
        };
        
        try {
            // Сохраняем сообщение в базе данных
            const messagesRef = database.ref('messages/' + this.currentChat.id);
            await messagesRef.push(message);
            
            // Обновляем последнее сообщение в чате
            const chatRef = database.ref('chats/' + this.currentChat.id);
            await chatRef.update({
                lastMessage: messageText.length > 50 ? messageText.substring(0, 47) + '...' : messageText,
                lastMessageTime: message.timestamp
            });
            
            // Сбрасываем статус набора текста
            const typingRef = database.ref('typing/' + this.currentChat.id + '/' + this.currentUser.uid);
            await typingRef.set(false);
            
            // Очищаем поле ввода
            messageInput.value = '';
            this.adjustTextareaHeight();
            this.updateCharCount();
            
        } catch (error) {
            this.showNotification('Ошибка', 'Не удалось отправить сообщение', 'error');
            console.error('Ошибка отправки сообщения:', error);
        } finally {
            sendBtn.disabled = false;
            sendBtn.classList.remove('loading');
        }
    }
    
    // Форматирование текста
    formatText(format) {
        const messageInput = document.getElementById('message-input');
        const start = messageInput.selectionStart;
        const end = messageInput.selectionEnd;
        const selectedText = messageInput.value.substring(start, end);
        
        let formattedText = '';
        const symbols = {
            bold: '**',
            italic: '*',
            code: '`'
        };
        
        if (selectedText) {
            formattedText = symbols[format] + selectedText + symbols[format];
            messageInput.setRangeText(formattedText, start, end, 'select');
        } else {
            formattedText = symbols[format] + symbols[format];
            messageInput.setRangeText(formattedText, start, end, 'end');
            messageInput.selectionStart = messageInput.selectionEnd - symbols[format].length;
        }
        
        messageInput.focus();
        this.updateCharCount();
    }
    
    // Настройки
    loadSettings() {
        const savedSettings = localStorage.getItem('soul-settings');
        if (savedSettings) {
            this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
        }
    }
    
    saveSettings() {
        this.settings.theme = document.getElementById('theme-select').value;
        this.settings.fontSize = document.getElementById('font-size-select').value;
        this.settings.notifications = document.getElementById('notifications-enabled').checked;
        this.settings.sound = document.getElementById('sound-enabled').checked;
        this.settings.messageSound = document.getElementById('message-sound-enabled').checked;
        
        localStorage.setItem('soul-settings', JSON.stringify(this.settings));
        this.applySettings();
        this.hideSettingsModal();
        this.showNotification('Настройки', 'Настройки сохранены', 'success');
    }
    
    applySettings() {
        // Тема
        let theme = this.settings.theme;
        if (theme === 'auto') {
            theme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
        }
        document.body.setAttribute('data-theme', theme);
        document.body.setAttribute('data-font-size', this.settings.fontSize);
        
        // Заполняем форму настроек
        document.getElementById('theme-select').value = this.settings.theme;
        document.getElementById('font-size-select').value = this.settings.fontSize;
        document.getElementById('notifications-enabled').checked = this.settings.notifications;
        document.getElementById('sound-enabled').checked = this.settings.sound;
        document.getElementById('message-sound-enabled').checked = this.settings.messageSound;
    }
    
    showSettingsModal() {
        document.getElementById('settings-modal').classList.remove('hidden');
    }
    
    hideSettingsModal() {
        document.getElementById('settings-modal').classList.add('hidden');
    }
    
    // Информация о чате
    showChatInfo() {
        if (!this.currentChat) return;
        
        let info = `Тип: ${this.currentChat.type === 'private' ? 'Приватный чат' : 'Групповой чат'}\n`;
        info += `Создан: ${new Date(this.currentChat.createdAt).toLocaleDateString('ru-RU')}`;
        
        this.showNotification('Информация о чате', info, 'info');
    }
    
    // Вспомогательные функции
    getInitials(name) {
        return name.split(' ').map(word => word[0]).join('').toUpperCase().substring(0, 2);
    }
    
    getStatusText(status) {
        const statusMap = {
            online: 'в сети',
            away: 'отошел',
            offline: 'не в сети'
        };
        return statusMap[status] || status;
    }
    
    formatMessageTime(date) {
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (days === 0) {
            return date.toLocaleTimeString('ru-RU', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        } else if (days === 1) {
            return 'Вчера';
        } else if (days < 7) {
            return date.toLocaleDateString('ru-RU', { weekday: 'short' });
        } else {
            return date.toLocaleDateString('ru-RU');
        }
    }
    
    setButtonLoading(button, isLoading) {
        if (!button) return;
        
        const btnText = button.querySelector('.btn-text');
        const btnLoader = button.querySelector('.btn-loader');
        
        if (!btnText || !btnLoader) return;
        
        if (isLoading) {
            btnText.classList.add('hidden');
            btnLoader.classList.remove('hidden');
            button.disabled = true;
        } else {
            btnText.classList.remove('hidden');
            btnLoader.classList.add('hidden');
            button.disabled = false;
        }
    }
    
    adjustTextareaHeight() {
        const textarea = document.getElementById('message-input');
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
    
    updateCharCount() {
        const textarea = document.getElementById('message-input');
        const count = textarea.value.length;
        const counter = document.getElementById('char-count');
        counter.textContent = `${count}/1000`;
        
        if (count > 900) {
            counter.style.color = 'var(--warning-color)';
        } else if (count > 1000) {
            counter.style.color = 'var(--error-color)';
        } else {
            counter.style.color = 'var(--text-muted)';
        }
    }
    
    toggleClearSearch(show) {
        const clearBtn = document.getElementById('clear-search');
        if (show) {
            clearBtn.classList.remove('hidden');
        } else {
            clearBtn.classList.add('hidden');
        }
    }
    
    switchAuthForm(form) {
        if (form === 'register') {
            document.getElementById('login-form').classList.add('hidden');
            document.getElementById('register-form').classList.remove('hidden');
        } else {
            document.getElementById('register-form').classList.add('hidden');
            document.getElementById('login-form').classList.remove('hidden');
        }
    }
    
    updateChatsCount() {
        document.getElementById('chats-count').textContent = this.chats.length;
    }
    
    scrollToBottom() {
        const messagesScroll = document.getElementById('messages-scroll');
        messagesScroll.scrollTop = messagesScroll.scrollHeight;
        this.hideScrollIndicator();
        this.newMessagesCount = 0;
        this.updateScrollIndicator();
    }
    
    handleMessagesScroll() {
        const messagesScroll = document.getElementById('messages-scroll');
        const scrollIndicator = document.getElementById('scroll-indicator');
        
        const isNearBottom = this.isNearBottom();
        if (isNearBottom) {
            this.hideScrollIndicator();
            this.newMessagesCount = 0;
            this.updateScrollIndicator();
        } else {
            this.showScrollIndicator();
        }
    }
    
    isNearBottom() {
        const messagesScroll = document.getElementById('messages-scroll');
        const threshold = 100;
        return messagesScroll.scrollHeight - messagesScroll.scrollTop - messagesScroll.clientHeight < threshold;
    }
    
    showScrollIndicator() {
        document.getElementById('scroll-indicator').classList.remove('hidden');
    }
    
    hideScrollIndicator() {
        document.getElementById('scroll-indicator').classList.add('hidden');
    }
    
    updateScrollIndicator() {
        const countElement = document.querySelector('.new-messages-count');
        if (countElement) {
            if (this.newMessagesCount > 0) {
                countElement.textContent = this.newMessagesCount > 99 ? '99+' : this.newMessagesCount;
                countElement.style.display = 'flex';
            } else {
                countElement.style.display = 'none';
            }
        }
    }
    
    isChatActive(chatId) {
        return this.currentChat && this.currentChat.id === chatId;
    }
    
    handleNewMessage(message, chatId) {
        // Проверяем, не является ли сообщение старым
        const messageTime = new Date(message.timestamp).getTime();
        const currentTime = Date.now();
        const isOldMessage = (currentTime - messageTime) > 5000; // 5 секунд
        
        if (isOldMessage) {
            return; // Игнорируем старые сообщения
        }
        
        // Проверяем, не отправили ли мы это сообщение
        if (message.senderId === this.currentUser.uid) {
            return;
        }

        // Воспроизводим звук нового сообщения
        if (this.isChatActive(chatId)) {
            // Мы в активном чате - играем звук сообщения
            this.playMessageSound();
        } else {
            // Мы не в активном чате - играем звук уведомления
            this.playNotificationSound();
        }
        
        // Увеличиваем счетчик непрочитанных только если чат не активен
        if (!this.isChatActive(chatId)) {
            const currentCount = this.unreadMessages.get(chatId) || 0;
            this.unreadMessages.set(chatId, currentCount + 1);
            this.renderChatsList();
        }
        
        // Увеличиваем счетчик новых сообщений для индикатора
        if (this.isChatActive(chatId) && !this.isNearBottom()) {
            this.newMessagesCount++;
            this.updateScrollIndicator();
        }
        
        // Показываем уведомление (только если не в активном чате)
        if (!this.isChatActive(chatId) && this.settings.notifications) {
            const sender = this.allUsers.find(user => user.id === message.senderId);
            if (sender) {
                let notificationText = '';
                
                if (message.type === 'image') {
                    notificationText = '📷 Фото';
                } else if (message.type === 'video') {
                    notificationText = '🎥 Видео';
                } else {
                    notificationText = message.text;
                }
                
                this.showNotification(sender.name, notificationText, 'info');
            }
        }
    }
    
    markChatAsRead(chatId) {
        this.unreadMessages.set(chatId, 0);
        this.renderChatsList();
    }
    
    // Управление отображением экранов
    showAuthScreen() {
        document.getElementById('loading-screen').classList.add('hidden');
        document.getElementById('auth-screen').classList.remove('hidden');
        document.getElementById('app').classList.add('hidden');
    }
    
    showApp() {
        document.getElementById('loading-screen').classList.add('hidden');
        document.getElementById('auth-screen').classList.add('hidden');
        document.getElementById('app').classList.remove('hidden');
    }
    
    showChat() {
        document.getElementById('no-chat-selected').classList.add('hidden');
        document.getElementById('chat-container').classList.remove('hidden');
    }
    
    showUsersModal() {
        document.getElementById('users-modal').classList.remove('hidden');
        document.getElementById('users-search').value = '';
        document.getElementById('users-search').focus();
        this.currentSearchQuery = '';
        this.currentUsersFilter = 'all';
        this.applyUsersFilter();
    }
    
    hideUsersModal() {
        document.getElementById('users-modal').classList.add('hidden');
    }
    
    // Система уведомлений
    showNotification(title, message, type = 'info') {
        if (!this.settings.notifications) return;
        
        const notifications = document.getElementById('notifications');
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const icons = {
            info: '💫',
            success: '✅',
            warning: '⚠️',
            error: '❌'
        };
        
        notification.innerHTML = `
            <div class="notification-icon">${icons[type]}</div>
            <div class="notification-content">
                <div class="notification-title">${title}</div>
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        `;
        
        notifications.appendChild(notification);
        
        // Автоматическое удаление через 5 секунд
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        }, 5000);
    }
}

// Инициализация приложения после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    window.soulApp = new SoulMessenger();
});
