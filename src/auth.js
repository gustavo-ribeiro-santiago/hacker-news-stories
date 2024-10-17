import { auth } from './firebaseConfig';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from 'firebase/auth';

const provider = new GoogleAuthProvider();

// Sign in with Google function
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider); // Await the sign-in popup
    const user = result.user;
    const idToken = await user.getIdToken(); // Await the ID token

    console.log('Logged in with Google:', user);
    return result; // Return the result so it can be awaited by the caller
  } catch (error) {
    console.error('Error during Google login:', error);
    throw error; // Propagate the error to be handled by the caller
  }
};

// Sign up function
export const signUpWithEmail = (email, password) => {
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log('Signed up:', user);
    })
    .catch((error) => {
      // Firebase error object
      const errorCode = error.code;
      const errorMessage = error.message;

      // Handle the "email already exists" error
      if (errorCode === 'auth/email-already-in-use') {
        console.error('Error: The email is already in use by another account.');
      } else {
        console.error('Sign-up error:', errorMessage);
      }
    });
};

// Sign in with Email function
export const signInWithEmail = (email, password) => {
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      const idToken = user.getIdToken(); // Send this token to your backend for verification
      console.log('Logged in with Email:', user);
    })
    .catch((error) => {
      console.error('Error during Email login:', error);
    });
};

// Sign out function
export const logOut = () => {
  signOut(auth)
    .then(() => {
      console.log('User signed out');
    })
    .catch((error) => {
      console.error('Error during sign-out:', error);
    });
};

// Function to send a request to your backend API with the Firebase token
export const fetchWithAuth = async (url, body = null, method = 'POST') => {
  const user = auth.currentUser; // Get the currently signed-in user
  console.log(url);
  if (user) {
    // Get the user's ID token
    const idToken = await user.getIdToken();

    // Set up the request options
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: idToken, // Include the token in the Authorization header
      },
      body: JSON.stringify(body), // Include the request body if needed
    };

    try {
      console.log('Request Options:', options);
      const response = await fetch(url, options);
      if (!response.ok) {
        console.log(response);
        throw new Error('Network response was not ok');
      }
      return await response.json(); // Return the response data
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  } else {
    throw new Error('User is not authenticated');
  }
};
