// Конфигурация Firebase
const firebaseConfig = {
    // ЗАМЕНИТЕ ЭТИ ДАННЫЕ НА ВАШИ НАСТРОЙКИ FIREBASE
    apiKey: "AIzaSyCjUwwU8iJ5cPx2SphIK-sQESAHSFpUq-U",
    authDomain: "soul-27114.firebaseapp.com",
    databaseURL: "https://soul-27114-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "soul-27114",
    storageBucket: "soul-27114.firebasestorage.app",
    messagingSenderId: "953272175759",
    appId: "1:953272175759:web:c2cee5092180d1e85af4fa"
};

// Инициализация Firebase
firebase.initializeApp(firebaseConfig);

// Ссылки на сервисы Firebase
const auth = firebase.auth();
const database = firebase.database();