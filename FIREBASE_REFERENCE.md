# Implemented Firebase JS API Reference

By adding a script tag for `js/firebase.js`at the top of your HTML file, you have access to the following functions in any script tags added AFTER the `js/firebase.js`script tag:

#### NOTE:
 - Any function with the `async` keyword MUST be called asyncronously in one of the two following ways:

```
// Method #1: Promise-based .then()
myAsyncFunction(/* paramters */).then((promiseOutput) => {
  // The function's output can be manipulated here
}).catch((error) => {
  // Error, if any
});

// Method #2: Async await in an async function
async myCoolFunction(){
  const promiseOutput = await myAsyncFunction(/* parameters */)
}

```
---

### Get Credits
```async getCredits()```
 - Get credits on logged in account
#### Returns
`number`

---

### Process Gameplay
```async processSpin(numToSpend, creditsWon)```
 - Process a play on the user's account.  This decrements the user's current credits in the DB,  increases the "credits bet" counter, increases the "credits won" amount, and increases the number of plays counter

#### Parameters
- `numToSpend`: `number` Number of credits to spend
- `creditsWon`: `number` Number of credits won

---

### Add Credits
```async addCredits(numCreditsToAdd)```
 - Add Credits to logged in account.

#### Parameters
- `numCreditsToAdd`: `number` Number of credits to add

---

### Remove Credits
```async removeCredits(numCreditsToRemove)```
Remove Credits from logged in account. This should not be used to "Spend" credits, as it does not update the "credits bet" counter

#### Parameters
- `numCreditsToRemove`: `number` Number of credits to remove

---

### Add Wins
```async addWins(wins)```
 - Add Wins to a logged in account.

### Parameters
 - `wins`: `number` Number of wins to add

---

### Add Losses
```async addLosses(losses)```
 - Add Losses to a logged in account.

### Parameters
 - `losses`: `number` Number of losses to add.

---

### Get User Custom Data
```async getUserDocument()```
 - Returns the logged in user's custom data from the database (this is the object that stores all of the information about credits)

#### Returns
```
{
  credits: number,
  creditsBet: number,
  creditsWon: number,
  numPlays: number
}
```

---

### Get User Account Info
```async getUserInfo()```
 - Returns the logged in user's account data from firebase.  This does not contain any custom data

#### Returns
```
{
    uid: string,
    name: string,
    email: string,
    photoURL: string | null
}
```

---
