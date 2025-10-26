// Конфигурация Firebase - ЗАМЕНИТЕ НА СВОЮ!
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

// Проверка подключения к Firebase
function checkFirebaseConnection() {
    const connectedRef = database.ref(".info/connected");
    connectedRef.on("value", function(snap) {
        if (snap.val() === true) {
            console.log("Connected to Firebase");
        } else {
            console.log("Disconnected from Firebase");
        }
    });
}

// Вызываем проверку подключения
checkFirebaseConnection();
