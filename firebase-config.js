// Конфигурация Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCjUwwU8iJ5cPx2SphIK-sQESAHSFpUq-U",
    authDomain: "soul-27114.firebaseapp.com",
    databaseURL: "https://soul-27114-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "soul-27114",
    storageBucket: "soul-27114.firebasestorage.app",
    messagingSenderId: "953272175759",
    appId: "1:953272175759:web:c2cee5092180d1e85af4fa"
};

// Инициализация Firebase
try {
    firebase.initializeApp(firebaseConfig);
    console.log("Firebase initialized successfully");
} catch (error) {
    console.error("Firebase initialization error:", error);
}

// Ссылки на сервисы Firebase
const auth = firebase.auth();
const database = firebase.database();

// Включим отладку аутентификации
auth.useDeviceLanguage();

// Обработка ошибок аутентификации
auth.onAuthStateChanged((user) => {
    console.log("Auth state changed:", user ? "User logged in" : "No user");
});

// Глобальные обработчики ошибок Firebase
auth.onIdTokenChanged((user) => {
    if (user) {
        console.log("User token refreshed");
    }
});

// Проверка подключения к базе данных
database.ref('.info/connected').on('value', (snapshot) => {
    if (snapshot.val() === true) {
        console.log("Connected to Firebase Database");
    } else {
        console.log("Disconnected from Firebase Database");
    }
});
