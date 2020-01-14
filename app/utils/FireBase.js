import firebase from "firebase/app";

var firebaseConfig = {
  apiKey: "AIzaSyDxEDWj1jYoCHau3xi2RdL-2tA27lNVf0I",
  authDomain: "tenedores-3c0d4.firebaseapp.com",
  databaseURL: "https://tenedores-3c0d4.firebaseio.com",
  projectId: "tenedores-3c0d4",
  storageBucket: "tenedores-3c0d4.appspot.com",
  messagingSenderId: "763303221784",
  appId: "1:763303221784:web:15db37042f5b8cf8ce016d"
};

export const firebaseApp = firebase.initializeApp(firebaseConfig);
