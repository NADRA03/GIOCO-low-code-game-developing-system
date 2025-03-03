// firebaseConfig.js
const { initializeApp } = require('firebase/app');
const { getStorage } = require('firebase/storage');

const firebaseConfig = {
    apiKey: "AIzaSyDwDKSJxNlk34bWIitFrkIQQH2h08hy0Tc",
    authDomain: "senior-f7beb.firebaseapp.com",
    databaseURL: "https://senior-f7beb-default-rtdb.firebaseio.com",
    projectId: "senior-f7beb",
    storageBucket: "senior-f7beb.appspot.com",
    messagingSenderId: "709973461079",
    appId: "1:709973461079:web:4f190a166758c97becbb12",
    measurementId: "G-57VJ7BNWHV"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);


module.exports = { storage, app };
