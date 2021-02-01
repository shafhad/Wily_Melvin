import firebase from "firebase/app"
require('@firebase/firestore')



  // Your web app's Firebase configuration
 
 var firebaseConfig = {
   /* apiKey: "AIzaSyBixwAWpklglC1LMBCtXDGAW-fbJmHq8y4",
    authDomain: "willy-21cd0.firebaseapp.com",
    projectId: "willy-21cd0",
    storageBucket: "willy-21cd0.appspot.com",
    messagingSenderId: "521738228972",
    appId: "1:521738228972:web:a3a99f6e6d0060bf3001c9"
  };*/
 
 
  apiKey: "AIzaSyCwMKAzykvS0F4i62wFN5T4wNwFSSrXiUo",
  authDomain: "wily-app-95de9.firebaseapp.com",
  databaseURL: "https://wily-app-95de9.firebaseio.com",
  projectId: "wily-app-95de9",
  storageBucket: "wily-app-95de9.appspot.com",
  messagingSenderId: "127149997603",
  appId: "1:127149997603:web:60394c232bdc8b4638fb96"
 };

  // Initialize Firebase
  //if(!firebase.apps.length){
  firebase.initializeApp(firebaseConfig);
  //}
  

  export default firebase.firestore();
 //export default firebaseConfig




 
