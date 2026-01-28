// Configuração Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDemoKeyChangeThis",
  authDomain: "monety-app.firebaseapp.com",
  projectId: "monety-app",
  storageBucket: "monety-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Configurar persistência
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
  .catch(error => console.error('Erro ao configurar persistência:', error));
