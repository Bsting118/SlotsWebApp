// ===================== Global constants: =====================
// Create the firebase app
// Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
/*======================== BRENDAN STING'S FIREBASE ========================*/
const firebaseConfig = {
  apiKey: "AIzaSyCmW5hA3s4WRDuirTaCqyV5-Z19jlO6WWk",
  authDomain: "slots-web-app-simulator.firebaseapp.com",
  projectId: "slots-web-app-simulator",
  storageBucket: "slots-web-app-simulator.appspot.com",
  messagingSenderId: "956456255033",
  appId: "1:956456255033:web:e0d4efd7fc8e18cb1117e8",
};

// Initialize Firebase
const firebaseApp = firebase.initializeApp(firebaseConfig);
const db = firebaseApp.firestore();
const auth = firebaseApp.auth();
// =============================================================

// ===================== Global variables: =====================
// Monitor the ready-state of the firebase
let firebaseReady = false;
// =============================================================

// -----------------------------------------------------------------------

// Setup a listener to be notified when firebase is ready
firebase.auth().onAuthStateChanged((user) => {
  firebaseReady = true;
});

// Wait for firebase to be setup
// Returns a promise that resolves when firebase is setup
function waitForFirebase() {
  // If firebase is already setup, return a resolved promise
  if (auth.currentUser !== null || firebaseReady) {
    return Promise.resolve();
  }

  // Otherwise, wait for firebase to be setup
  return new Promise((resolve) => {
    firebase.auth().onAuthStateChanged(() => {
      resolve();
    });
  });
}

// Returns true if the user is logged in
async function isLoggedIn() {
  await waitForFirebase();
  return auth.currentUser !== null;
}

// Process a play
// numToSpend: number of credits to spend from the user's account
// creditsWon: number of credits won
async function processSpin(numToSpend, creditsWon) {
  // Wait for firebase to be setup
  await waitForFirebase();

  // Get the currently signed in user
  const user = auth.currentUser;

  // Update the user's credits
  db.collection("users")
    .doc(user.uid)
    .update({
      credits: firebase.firestore.FieldValue.increment(creditsWon - numToSpend),
      creditsBet: firebase.firestore.FieldValue.increment(numToSpend),
      creditsWon: firebase.firestore.FieldValue.increment(creditsWon),
      numPlays: firebase.firestore.FieldValue.increment(1),
    });
}

// Add credits to the signed in user's account
// numCreditsToAdd: number of credits to add to the user's account
async function addCredits(numCreditsToAdd) {
  // Wait for firebase to be setup
  await waitForFirebase();

  // Get the currently signed in user
  const user = auth.currentUser;

  // Update the user's credits
  await db
    .collection("users")
    .doc(user.uid)
    .update({
      credits: firebase.firestore.FieldValue.increment(numCreditsToAdd),
    });
}

// Add wins to the signed in user's account
// wins: number of wins to add to the user's account
async function addWins(wins) {
  //Wait for firebase to be setup
  await waitForFirebase();

  // Get the currently signed in user
  const user = auth.currentUser;

  //Update the user's wins
  await db
    .collection("users")
    .doc(user.uid)
    .update({
      wins: firebase.firestore.FieldValue.increment(wins),
    });
}

// Remove wins from the signed in user's account
// numWinsToRemove: number of wins to remove from the user's account
async function removeWins(numWinsToRemove) {
  // Wait for firebase to be setup
  await waitForFirebase();

  // Get the currently signed in user
  const user = auth.currentUser;

  // Update the user's wins
  await db
    .collection("users")
    .doc(user.uid)
    .update({
      wins: firebase.firestore.FieldValue.increment(-numWinsToRemove),
    });
}

// Add losses to the signed in user's account
// losses: number of losses to add to the user's account
async function addLosses(losses) {
  //Wait for firebase to be setup
  await waitForFirebase();

  // Get the currently signed in user
  const user = auth.currentUser;

  //Update the user's wins
  await db
    .collection("users")
    .doc(user.uid)
    .update({
      losses: firebase.firestore.FieldValue.increment(losses),
    });
}

// Remove losses from the signed in user's account
// numLossesToRemove: number of losses to remove from the user's account
async function removeLosses(numLossesToRemove) {
  // Wait for firebase to be setup
  await waitForFirebase();

  // Get the currently signed in user
  const user = auth.currentUser;

  // Update the user's wins
  await db
    .collection("users")
    .doc(user.uid)
    .update({
      losses: firebase.firestore.FieldValue.increment(-numLossesToRemove),
    });
}

// Get the number of wins for the signed in user
// Returns a promise that resolves to the number of wins
async function getWins() {
  // Wait for firebase to be setup
  await waitForFirebase();

  // Get the currently signed in user
  const user = auth.currentUser;

  // Get the user's number of wins
  return db
    .collection("users")
    .doc(user.uid)
    .get()
    .then(function (doc) {
      return doc.data().wins;
    });
}

// Get the number of losses for the signed in user
// Returns a promise that resolves to the number of losses
async function getLosses() {
  // Wait for firebase to be setup
  await waitForFirebase();

  // Get the currently signed in user
  const user = auth.currentUser;

  // Get the user's number of losses
  return db
    .collection("users")
    .doc(user.uid)
    .get()
    .then(function (doc) {
      return doc.data().losses;
    });
}

// Spend credits from the signed in user's account
// numToSpend: number of credits to spend from the user's account
// @deprecated
async function spendCredits(numToSpend) {
  // Wait for firebase to be setup
  await waitForFirebase();

  // Get the currently signed in user
  const user = auth.currentUser;

  // Update the user's credits
  await db
    .collection("users")
    .doc(user.uid)
    .update({
      credits: firebase.firestore.FieldValue.increment(-numToSpend),
      creditsBet: firebase.firestore.FieldValue.increment(numToSpend),
    });
}

// Remove credits from the signed in user's account
// numCreditsToRemove: number of credits to remove from the user's account
async function removeCredits(numCreditsToRemove) {
  // Wait for firebase to be setup
  await waitForFirebase();

  // Get the currently signed in user
  const user = auth.currentUser;

  // Update the user's credits
  await db
    .collection("users")
    .doc(user.uid)
    .update({
      credits: firebase.firestore.FieldValue.increment(-numCreditsToRemove),
    });
}

// Get the number of credits for the signed in user
// Returns a promise that resolves to the number of credits
async function getCredits() {
  // Wait for firebase to be setup
  await waitForFirebase();

  // Get the currently signed in user
  const user = auth.currentUser;

  // Get the user's credits
  return db
    .collection("users")
    .doc(user.uid)
    .get()
    .then(function (doc) {
      return doc.data().credits;
    });
}

// Add bet credits to the signed in user's account
// numOfBetCredits: number of bet credits to add to the user's account
async function addCreditsBet(numOfBetCredits) {
  //Wait for firebase to be setup
  await waitForFirebase();

  // Get the currently signed in user
  const user = auth.currentUser;

  //Update the user's wins
  await db
    .collection("users")
    .doc(user.uid)
    .update({
      creditsBet: firebase.firestore.FieldValue.increment(numOfBetCredits),
    });
}

// Remove bet credits to the signed in user's account
// numOfBetCreditsToRemove: number of bet credits to remove from the user's account
async function removeCreditsBet(numOfBetCreditsToRemove) {
  //Wait for firebase to be setup
  await waitForFirebase();

  // Get the currently signed in user
  const user = auth.currentUser;

  //Update the user's wins
  await db
    .collection("users")
    .doc(user.uid)
    .update({
      creditsBet: firebase.firestore.FieldValue.increment(
        -numOfBetCreditsToRemove
      ),
    });
}

// Get the number of bet credits for the signed in user
// Returns a promise that resolves to the number of bet credits
async function getCreditsBet() {
  // Wait for firebase to be setup
  await waitForFirebase();

  // Get the currently signed in user
  const user = auth.currentUser;

  // Get the user's bet credits history
  return db
    .collection("users")
    .doc(user.uid)
    .get()
    .then(function (doc) {
      return doc.data().creditsBet;
    });
}

// Add won credits to the signed in user's account
// numOfWonCredits: number of won credits to add to the user's account
async function addCreditsWon(numOfWonCredits) {
  //Wait for firebase to be setup
  await waitForFirebase();

  // Get the currently signed in user
  const user = auth.currentUser;

  //Update the user's wins
  await db
    .collection("users")
    .doc(user.uid)
    .update({
      creditsWon: firebase.firestore.FieldValue.increment(numOfWonCredits),
    });
}

// Remove won credits to the signed in user's account
// numOfWonCreditsToRemove: number of won credits to remove from the user's account
async function removeCreditsWon(numOfWonCreditsToRemove) {
  //Wait for firebase to be setup
  await waitForFirebase();

  // Get the currently signed in user
  const user = auth.currentUser;

  //Update the user's wins
  await db
    .collection("users")
    .doc(user.uid)
    .update({
      creditsWon: firebase.firestore.FieldValue.increment(
        -numOfWonCreditsToRemove
      ),
    });
}

// Get the number of won credits for the signed in user
// Returns a promise that resolves to the number of won credits
async function getCreditsWon() {
  // Wait for firebase to be setup
  await waitForFirebase();

  // Get the currently signed in user
  const user = auth.currentUser;

  // Get the user's won credits history
  return db
    .collection("users")
    .doc(user.uid)
    .get()
    .then(function (doc) {
      return doc.data().creditsWon;
    });
}

// Get entire user's document
// Returns a promise that resolves to the user's document
async function getUserDocument() {
  // Wait for firebase to be setup
  await waitForFirebase();

  // Get the currently signed in user
  const user = auth.currentUser;

  // Get the user's document
  return db
    .collection("users")
    .doc(user.uid)
    .get()
    .then(function (doc) {
      return doc.data();
    });
}

// Get the user's info
// Returns the user's info
async function getUserInfo() {
  // Wait for firebase to be setup
  await waitForFirebase();
  const user = await auth.currentUser;

  return {
    uid: user.uid,
    name: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
  };
}
