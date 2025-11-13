// Firebase configuration - replace if you have different credentials
const firebaseConfig = {
  apiKey: "AIzaSyCx3Ky5htGk9nNhjCdCZmpf-OW0uR8qwWc",
  authDomain: "student-wellness-tracker.firebaseapp.com",
  projectId: "student-wellness-tracker",
  storageBucket: "student-wellness-tracker.firebasestorage.app",
  messagingSenderId: "941688036362",
  appId: "1:941688036362:web:f1dc370f8a7b8fd181d3f3"
};


// Initialize Firebase (compat)
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
