// ===================== Global constants: =====================
const RANDOM_LIMIT = 1000;

const DEFAULT_ODDS_7 = 0.09;
const DEFAULT_ODDS_GEM = 0.11;
const DEFAULT_ODDS_CHIPS = 0.15;
const DEFAULT_ODDS_BAR = 0.35;
const DEFAULT_ODDS_CHERRY = 0.3;

const DEFAULT_PAYS_7 = 1000;
const DEFAULT_PAYS_GEM = 500;
const DEFAULT_PAYS_CHIPS = 250;
const DEFAULT_PAYS_BAR = 100;
const DEFAULT_PAYS_CHERRY = 50;
const DEFAULT_PAYS_WILDCARD = 1;

// =============================================================

// ===================== Global variables: =====================
var numOfActiveReels = 3;
var currentBet = 1; //set to 1 by default in case the user spins without selecting an amount first
var winAmount = 0; //must stay zero by default
var spinning = false;

// =============================================================

// ===================== Global Objects: =====================
const Results = Object.freeze({
  Seven: 0,
  Bar: 1,
  Cherry: 2,
  Chips: 3,
  Gem: 4,
});

const buttons = document.querySelectorAll(".bet_button");
buttons.forEach((button) => {
  button.addEventListener("click", () => {
    buttons.forEach((button) => button.classList.remove("active"));
    button.classList.add("active");
  });
});

// ===========================================================

// ===================== Global Dictionaries: =====================
// The modifiable odds for each symbol:
var PerSymbolOdds = {
  Seven: DEFAULT_ODDS_7,
  Bar: DEFAULT_ODDS_BAR,
  Cherry: DEFAULT_ODDS_CHERRY,
  Chips: DEFAULT_ODDS_CHIPS,
  Gem: DEFAULT_ODDS_GEM,
};

// The modifiable pays for each symbol:
var SymbolPays = {
  Seven: DEFAULT_PAYS_7,
  Bar: DEFAULT_PAYS_BAR,
  Cherry: DEFAULT_PAYS_CHERRY,
  Chips: DEFAULT_PAYS_CHIPS,
  Gem: DEFAULT_PAYS_GEM,
  Wild: DEFAULT_PAYS_WILDCARD,
};

// ================================================================

// ===================== Global Arrays/Lists: =====================
// These indicies should match the Results enum
const Images = [
  "/assets/icons/Stylized_7.png",
  "/assets/icons/Stylized_BAR.png",
  "/assets/icons/Stylized_Cherry.png",
  "/assets/icons/Stylized_Chips.png",
  "/assets/icons/Stylized_GEM.png",
];

// How many times a symbol should appear within the RNG's set:
var PerSymbolFrequencies = [
  RANDOM_LIMIT * PerSymbolOdds.Seven, // 0th = 7's
  RANDOM_LIMIT * PerSymbolOdds.Gem, // 1st = Gem's
  RANDOM_LIMIT * PerSymbolOdds.Chips, // 2nd = Chips'
  RANDOM_LIMIT * PerSymbolOdds.Bar, // 3rd = Bar's
  RANDOM_LIMIT * PerSymbolOdds.Cherry, // 4th = Cherry's
];

// List of wildcard symbols:
var activeWilds = [Results.Cherry];
// ================================================================

// -----------------------------------------------------------------------
function getNumOfActiveReels() {
  const currentAmtOfReels = numOfActiveReels;
  return currentAmtOfReels;
}

function permutateOdds(inputOdds, numOfOccurences) {
  var result = Math.pow(inputOdds, numOfOccurences);
  return result;
}

function roundToPrecision(value, decimalCount) {
  const pow = Math.pow(10, decimalCount);
  return Math.round((value + Number.EPSILON) * pow) / pow;
}

async function setupPage() {
  const credits = await getCredits();
  document.getElementById("credits").innerText = credits;
}

function doesntHaveEnoughCredits(amountBeingBet, creditsInAccount) {
  const numBet = parseInt(amountBeingBet);
  const numCredits = parseInt(creditsInAccount);

  const notEnoughCredits = numBet > numCredits ? true : false;

  return notEnoughCredits;
}

function getCurrentBet() {
  let activeBetButtonText =
    document.querySelector(".bet_button.active").innerText;
  const betNum = parseInt(activeBetButtonText);

  // Return the value of the bet (as an int):
  return betNum;
}

async function hasInvalidCreditsForBet(betAmount) {
  const credits = await getCredits();
  const insufficientCredits = doesntHaveEnoughCredits(betAmount, credits);
  console.log("HAS INSUFFICIENT CREDITS? ==> " + insufficientCredits);

  return insufficientCredits;
}

async function gambleBetCredits(betAmount, payoutOfSpin) {
  await processSpin(betAmount, payoutOfSpin);
  const newCredits = await getCredits();

  // Give the temporary animation of subtracting their credits as they bet:
  let subtractedCredits = parseInt(
    document.getElementById("credits").innerText
  );
  subtractedCredits -= betAmount;
  document.getElementById("credits").innerText = subtractedCredits;

  // Return the processed amount after gambling:
  return newCredits;
}

async function updateCreditsWon(amountWonOnSpin) {
  var newCreditsWon = parseInt(amountWonOnSpin);

  // Call the API to get the new amount added to the payout:
  const newAccountCredits = await getCredits();

  document.getElementById("creditsWon").innerText = newCreditsWon;
  document.getElementById("credits").innerText = newAccountCredits;
}

function updatePerSymbolFrequencies() {
  // Re-assign:
  PerSymbolFrequencies = [
    RANDOM_LIMIT * PerSymbolOdds.Seven, // 0th = 7's
    RANDOM_LIMIT * PerSymbolOdds.Gem, // 1st = Gem's
    RANDOM_LIMIT * PerSymbolOdds.Chips, // 2nd = Chips'
    RANDOM_LIMIT * PerSymbolOdds.Bar, // 3rd = Bar's
    RANDOM_LIMIT * PerSymbolOdds.Cherry, // 4th = Cherry's
  ];
}

function multiplyPays() {
  document.getElementById("seven_set_value").innerText =
    SymbolPays.Seven * currentBet;
  document.getElementById("gem_set_value").innerText =
    SymbolPays.Gem * currentBet;
  document.getElementById("chips_set_value").innerText =
    SymbolPays.Chips * currentBet;
  document.getElementById("bar_set_value").innerText =
    SymbolPays.Bar * currentBet;
  document.getElementById("cherry_set_value").innerText =
    SymbolPays.Cherry * currentBet;
  document.getElementById("cherry_value").innerText =
    SymbolPays.Wild * currentBet;
}

function checkOutputForMatches(
  outputArray,
  numOfReels,
  minNumOfMatches,
  wildcardArray = null
) {
  var result = false;
  var matchCounter = 0;
  var firstSymbolSeen;
  winAmount = 0;

  if (outputArray != null) {
    if (Array.isArray(outputArray)) {
      for (let index = 0; index < numOfReels; index++) {
        if (index == 0) {
          firstSymbolSeen = outputArray[index];
          matchCounter++;
        } else {
          if (outputArray[index] == firstSymbolSeen) {
            matchCounter++;
          }
        }
      }

      if (matchCounter >= minNumOfMatches) {
        const symbolThatMatched = outputArray[0];
        switch (true) {
          case symbolThatMatched == Results.Seven:
            // Get payout amount for triple 7s
            winAmount = document.getElementById("seven_set_value").innerText;
            break;
          case symbolThatMatched == Results.Bar:
            // Get payout amount for triple Bars
            winAmount = document.getElementById("bar_set_value").innerText;
            break;
          case symbolThatMatched == Results.Cherry:
            // Get payout amount for triple Cherries
            winAmount = document.getElementById("cherry_set_value").innerText;
            break;
          case symbolThatMatched == Results.Chips:
            // Get payout amount for triple Chips
            winAmount = document.getElementById("chips_set_value").innerText;
            break;
          case symbolThatMatched == Results.Gem:
            // Get payout amount for triple Gems
            winAmount = document.getElementById("gem_set_value").innerText;
            break;
          default:
            // Unknown pay symbol; set to nothing:
            winAmount = 0;
            break;
        }
        result = true;
      } else {
        if (wildcardArray != null) {
          if (Array.isArray(wildcardArray)) {
            for (let indexI = 0; indexI < wildcardArray.length; indexI++) {
              let currentWild = wildcardArray[indexI];

              for (let indexJ = 0; indexJ < numOfReels; indexJ++) {
                if (outputArray[indexJ] == currentWild) {
                  winAmount = document.getElementById("cherry_value").innerText;
                  result = true;
                }
              }
            }
          }
        }
      }
    }
  }

  // Return if there's a valid payout/match:
  return result;
}

async function removeUserCredits(amtToRemove) {
  await removeCredits(amtToRemove);
  const newAccountCredits = await getCredits();
  document.getElementById("credits").innerText = newAccountCredits;
}

async function updateWins() {
  await addWins(1);
}

async function updateLosses() {
  await addLosses(1);
}

//Set the current bet to the user selected amount
function setBet(bet) {
  currentBet = bet;
  multiplyPays();
}

// Set the final image for a slot, use jquery for some fancy animations
function setFinal(reel, image) {
  const slot = document.getElementById(`reel-img-${reel}`);
  slot.src = Images[image];

  // Find slot box
  const slotBox = $(slot).parent();

  // Set border css to yellow
  slotBox.css("borderColor", "yellow");
}

// New random image that is different from the current image's src
function newRandomImage(currentSrc) {
  let newSrc = currentSrc;
  while (newSrc === currentSrc) {
    newSrc = Images[Math.floor(Math.random() * Images.length)];
  }
  return newSrc;
}

// Generates a random number from 0 to (exclusiveMax - 1)
function getRandomNumber(exclusiveMax) {
  return Math.floor(Math.random() * exclusiveMax);
}

// Sums up numerical set values up to and including "index"
function sumSetToIndex(set, index) {
  let totalSum = 0;
  for (let i = 0; i < set.length; i++) {
    if (i > index) {
      break;
    } else {
      totalSum += set[i];
    }
  }
  return totalSum;
}

// Reset the slot machine to its default state:
function resetSlotsUI() {
  // Re-enable buttons
  $(".button_container_2 > button").attr("disabled", false);
  $(".button_container_3 > button").attr("disabled", false);
  $("#spin").attr("disabled", false);
  document.getElementById("credits_error_msg").style.display = "none";
  spinning = false;
  return;
}

// Spin the wheel!
async function spin1() {
  if (spinning) return;

  // Reset border colors
  $(".reel").css("borderColor", "#51aaa3");
  spinning = true;

  // Reset credits won during a spin:
  document.getElementById("creditsWon").innerText = 0;

  // Disable buttons
  $(".button_container_2 > button").attr("disabled", true);
  $(".button_container_3 > button").attr("disabled", true);
  $("#spin").attr("disabled", true);

  // Validate that we have good credits
  currentBet = getCurrentBet();
  var cantSpin = await hasInvalidCreditsForBet(currentBet);

  // After validation results come back in, check if they can/cannot spin:
  if (cantSpin) {
    document.getElementById("credits_error_msg").style.display = "block";
    // Timeout for 1 second for cool-down:
    setTimeout(() => {
      resetSlotsUI();
    }, 2000);
    return;
  } else {
    console.log("\nBet of " + currentBet + " cr. is valid! Good luck!");
  }

  // Algorithm to determine the prize (V1)
  const output = [Results.Bar, Results.Seven, Results.Cherry];
  updatePerSymbolFrequencies();

  for (let i = 1; i <= numOfActiveReels; i++) {
    let rand = getRandomNumber(RANDOM_LIMIT);
    console.log("Generated the following for reel " + i + ": " + rand);

    switch (true) {
      case rand < sumSetToIndex(PerSymbolFrequencies, 0):
        output[i - 1] = Results.Seven; // Seven = 0
        break;
      case rand < sumSetToIndex(PerSymbolFrequencies, 1):
        output[i - 1] = Results.Gem; // Gem = 4
        break;
      case rand < sumSetToIndex(PerSymbolFrequencies, 2):
        output[i - 1] = Results.Chips; // Chips = 3
        break;
      case rand < sumSetToIndex(PerSymbolFrequencies, 3):
        output[i - 1] = Results.Bar; // Bar = 1
        break;
      default:
        output[i - 1] = Results.Cherry; // Cherry = 2
    }
  }

  // Algorithm should record output to this array
  console.log(
    "Output: " +
      "[" +
      output[0] +
      ", " +
      output[1] +
      ", " +
      output[2] +
      "]" +
      "\n{(0 -> Seven), (4 -> Gem), (3 -> Chip), (1 -> Bar), (2 -> Cherry)}"
  );

  var isPayout = checkOutputForMatches(
    output,
    numOfActiveReels,
    numOfActiveReels,
    activeWilds
  );

  // Deduct credits - Subtract bet credits from user's account and record generated payout to DB:
  gambleBetCredits(currentBet, winAmount);

  // Start "Spinning" the wheel.  This is just a visual effect
  const start = Date.now(); // Start time
  const isSet = [false, false, false]; // Whether or not a slot has been set to the final result
  const interval = setInterval(() => {
    if (Date.now() - start < 1000) {
      // Spin all 3 slots
      for (let i = 0; i < output.length; i++) {
        const slot = document.getElementById(`reel-img-${i}`);
        slot.src = newRandomImage(slot.src);
      }
    } else if (Date.now() - start < 2000) {
      // Set first slot to the first result
      if (!isSet[0]) {
        setFinal(0, output[0]);
        isSet[0] = true;
      }

      // Keep spinning the other slots
      for (let i = 1; i < output.length; i++) {
        const slot = document.getElementById(`reel-img-${i}`);
        slot.src = newRandomImage(slot.src);
      }
    } else if (Date.now() - start < 3000) {
      // Set second slot to the second result
      if (!isSet[1]) {
        setFinal(1, output[1]);
        isSet[1] = true;
      }

      // Keep spinning the last slot
      const slot = document.getElementById(`reel-img-${output.length - 1}`);
      slot.src = newRandomImage(slot.src);
    } else {
      // Set the last slot to the last result
      if (!isSet[2]) {
        setFinal(2, output[2]);
        isSet[2] = true;
      }

      // Clear the interval
      clearInterval(interval);

      const numCherries = output.filter((x) => x === Results.Cherry).length;
      const isSingleCherryPayout = numCherries === 1;
      const isDoubleCherryPayout = numCherries === 2;

      if (isPayout) {
        // Launch Confetti
        confetti({
          particleCount: isSingleCherryPayout
            ? 50
            : isDoubleCherryPayout
            ? 100
            : 200,
          spread: 70,
          origin: { y: 0.6 },
        });

        //The User has won
        updateWins();
      } else {
        //The User has lost
        updateLosses();
      }

      updateCreditsWon(winAmount);

      $(".button_container_2 > button").attr("disabled", false);
      $(".button_container_3 > button").attr("disabled", false);
      $("#spin").attr("disabled", false);
      spinning = false;
    }
  }, 75); // Run every 75ms
}

async function spin2() {
  if (spinning) return;

  // Reset border colors
  $(".reel").css("borderColor", "#51aaa3");
  spinning = true;

  // Reset credits won during a spin:
  document.getElementById("creditsWon").innerText = 0;

  // Disable buttons
  $(".button_container_2 > button").attr("disabled", true);
  $(".button_container_3 > button").attr("disabled", true);
  $("#spin").attr("disabled", true);

  // Validate that we have good credits
  currentBet = getCurrentBet();
  var cantSpin = await hasInvalidCreditsForBet(currentBet);
  console.log("Can user spin? ==> " + cantSpin);

  // After validation results come back in, check if they can/cannot spin:
  if (cantSpin) {
    console.log("INVALID BET! NOT ENOUGH CREDITS!");
    // Timeout for 1 second for cool-down:
    setTimeout(() => {
      resetSlotsUI();
    }, 1000);
    return;
  } else {
    console.log("\nBet of " + currentBet + " cr. is valid! Good luck!");
  }

  // Algorithm to determine the prize (V2)
  const output2 = [Results.Bar, Results.Seven, Results.Cherry];
  updatePerSymbolFrequencies();

  for (let i = 1; i <= 3; i++) {
    let rand = Math.random();
    console.log("Generated the following for reel " + i + ": " + rand);

    switch (true) {
      case rand < PerSymbolOdds.Seven:
        output2[i - 1] = Results.Seven;
        break;
      case rand < PerSymbolOdds.Seven + PerSymbolOdds.Gem:
        output2[i - 1] = Results.Gem;
        break;
      case rand < PerSymbolOdds.Seven + PerSymbolOdds.Gem + PerSymbolOdds.Chips:
        output2[i - 1] = Results.Chips;
        break;
      case rand <
        PerSymbolOdds.Seven +
          PerSymbolOdds.Gem +
          PerSymbolOdds.Chips +
          PerSymbolOdds.Bar:
        output2[i - 1] = Results.Bar;
        break;
      default:
        output2[i - 1] = Results.Cherry;
    }
  }

  // Algorithm should record output to this array
  console.log(
    "Output: " +
      "[" +
      output2[0] +
      ", " +
      output2[1] +
      ", " +
      output2[2] +
      "]" +
      "\n{(0 -> Seven), (4 -> Gem), (3 -> Chip), (1 -> Bar), (2 -> Cherry)}"
  );

  var isPayout = checkOutputForMatches(
    output2,
    numOfActiveReels,
    numOfActiveReels,
    activeWilds
  );

  // Deduct credits - Subtract bet credits from user's account and record generated payout to DB:
  gambleBetCredits(currentBet, winAmount);

  // Start "Spinning" the wheel.  This is just a visual effect
  const start = Date.now(); // Start time
  const isSet = [false, false, false]; // Whether or not a slot has been set to the final result
  const interval = setInterval(() => {
    if (Date.now() - start < 1000) {
      // Spin all 3 slots
      for (let i = 0; i < output2.length; i++) {
        const slot = document.getElementById(`reel-img-${i}`);
        slot.src = newRandomImage(slot.src);
      }
    } else if (Date.now() - start < 2000) {
      // Set first slot to the first result
      if (!isSet[0]) {
        setFinal(0, output2[0]);
        isSet[0] = true;
      }

      // Keep spinning the other slots
      for (let i = 1; i < output2.length; i++) {
        const slot = document.getElementById(`reel-img-${i}`);
        slot.src = newRandomImage(slot.src);
      }
    } else if (Date.now() - start < 3000) {
      // Set second slot to the second result
      if (!isSet[1]) {
        setFinal(1, output2[1]);
        isSet[1] = true;
      }

      // Keep spinning the last slot
      const slot = document.getElementById(`reel-img-${output2.length - 1}`);
      slot.src = newRandomImage(slot.src);
    } else {
      // Set the last slot to the last result
      if (!isSet[2]) {
        setFinal(2, output2[2]);
        isSet[2] = true;
      }

      // Clear the interval
      clearInterval(interval);

      const numCherries = output2.filter((x) => x === Results.Cherry).length;
      const isSingleCherryPayout = numCherries === 1;
      const isDoubleCherryPayout = numCherries === 2;

      if (isPayout) {
        // Launch Confetti
        confetti({
          particleCount: isSingleCherryPayout
            ? 50
            : isDoubleCherryPayout
            ? 100
            : 200,
          spread: 70,
          origin: { y: 0.6 },
        });

        //The User has won
        updateWins();
      } else {
        //The User has lost
        updateLosses();
      }

      updateCreditsWon(winAmount);

      $(".button_container_2 > button").attr("disabled", false);
      $(".button_container_3 > button").attr("disabled", false);
      $("#spin").attr("disabled", false);
      spinning = false;
    }
  }, 75); // Run every 75ms
}

setupPage();
updateCreditsWon(0);
