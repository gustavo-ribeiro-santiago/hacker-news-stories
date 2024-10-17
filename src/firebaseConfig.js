import { initializeApp } from 'firebase/app';
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: 'AIzaSyAiMwl2LPwdWfzkGHzCM0t73R3uRG4umJE',
    authDomain: 'hacker-news-stories-15c1a.firebaseapp.com',
    projectId: 'hacker-news-stories-15c1a',
    storageBucket: 'hacker-news-stories-15c1a.appspot.com',
    messagingSenderId: '433301205341',
    appId: '1:433301205341:web:1387e224dd6645dae6b8b4',
    measurementId: 'G-4SGT8EVYNM',
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };