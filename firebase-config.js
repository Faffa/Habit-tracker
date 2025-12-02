// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAfJTkqlU9Y5yhn_g_HQXS9dNfOQTIQg3w",
  authDomain: "habit-tracker-58ba9.firebaseapp.com",
  projectId: "habit-tracker-58ba9",
  storageBucket: "habit-tracker-58ba9.appspot.com",
  messagingSenderId: "974837325994",
  appId: "1:974837325994:web:ca99d56003fad33504b0d3"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
