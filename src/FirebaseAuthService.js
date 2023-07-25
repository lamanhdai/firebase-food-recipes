import firebase from './FirebaseConfig';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  signInWithPopup,
  onAuthStateChanged
} from 'firebase/auth';

const auth = getAuth(firebase);

const registerUser = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
}

const loginUser = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
}

const logoutUser = () => {
  return signOut(auth);
}

const handlerSendPasswordResetEmail = (email) => {
  return sendPasswordResetEmail(auth, email);
}

const loginWithGoogle = () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  return signInWithPopup(auth, provider);
}

const subscribeToAuthChanges = (handleAuthChange) => {
  console.log('subscribe')
  onAuthStateChanged(auth, (user) => {
    handleAuthChange(user)
  })
}

const FirebaseAuthService = () => ({
  registerUser,
  loginUser,
  logoutUser,
  handlerSendPasswordResetEmail,
  loginWithGoogle,
  subscribeToAuthChanges
})

export default FirebaseAuthService();