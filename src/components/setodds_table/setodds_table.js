// ===================== Global constants: =====================
// Fetch the pay table data from the server and render it to the page
const setOddsTableHtmlPromise = fetch(
  "components/setodds_table/setodds_table.html"
);
// =============================================================

// -----------------------------------------------------------------------

$(document).ready(async () => {
  // Wait for html promise to resolve
  const html = await setOddsTableHtmlPromise;

  // Wait for buffer to be read
  const text = await html.text();

  // Find target
  const target = $("#setodds-table");

  console.log(target, text);

  // Set inner html
  target.html(text);

  // Reset the input fields and erase last change message when the table is closed out of:
  $("#setodds_table_modal").on("hidden.bs.modal", function (e) {
    // runs when the modal is completely hidden
    const inputFieldIDs = [
      "cherries_odds",
      "bars_odds",
      "chips_odds",
      "gems_odds",
      "sevens_odds",
    ];
    resetInputFields(inputFieldIDs);

    setChangeStatus("setodds_chng_success", "");
  });
});

// Resets the input fields in a given list:
function resetInputFields(listOfTableFieldsToReset) {
  for (let index = 0; index < listOfTableFieldsToReset.length; index++) {
    $("#" + listOfTableFieldsToReset[index]).prop("value", "");
  }
}

// Sets a new status indicating what artificial changes took place, send to a change message element with a ID
function setChangeStatus(changeMsgID, newMessage) {
  // Set the change status message:
  $("#" + changeMsgID).text(newMessage);
}

function getDictionaryLength(dictionaryObj) {
  var count = 0;

  if (dictionaryObj.constructor == Object) {
    for (let key in dictionaryObj) {
      if (dictionaryObj.hasOwnProperty(key)) {
        count++;
      }
    }
  }

  return count;
}

function cloneThisDictionary(dictionaryObj) {
  var clonedDictionary = null;

  if (dictionaryObj.constructor == Object) {
    clonedDictionary = { ...dictionaryObj };
  }

  return clonedDictionary;
}

function overrideDictionary(toThisDictionary, usingThisDictionary) {
  if (
    toThisDictionary.constructor == Object &&
    usingThisDictionary.constructor == Object
  ) {
    for (let key in toThisDictionary) {
      if (toThisDictionary.hasOwnProperty(key)) {
        toThisDictionary[key] = usingThisDictionary[key];
      }
    }
  }
}

// Tests if an input number (whose value is a string) is a positive number (can be a decimal b/c it's a %):
function isAPositiveNumber(inputNum, includeZero = false) {
  if (includeZero) {
    if (inputNum >= 0 && !isNaN(inputNum)) {
      return true;
    } else {
      return false;
    }
  } else {
    if (inputNum > 0 && !isNaN(inputNum)) {
      return true;
    } else {
      return false;
    }
  }
}

function mapOddsToSlotsDictionaryField(oddsID, valueToMap, thisOddsDictionary) {
  if (isVarAString(oddsID)) {
    if (oddsID.includes("cherries") && oddsID.includes("odds")) {
      thisOddsDictionary.Cherry = valueToMap;
    } else if (oddsID.includes("bars") && oddsID.includes("odds")) {
      thisOddsDictionary.Bar = valueToMap;
    } else if (oddsID.includes("chips") && oddsID.includes("odds")) {
      thisOddsDictionary.Chips = valueToMap;
    } else if (oddsID.includes("gems") && oddsID.includes("odds")) {
      thisOddsDictionary.Gem = valueToMap;
    } else if (oddsID.includes("sevens") && oddsID.includes("odds")) {
      thisOddsDictionary.Seven = valueToMap;
    }
  } else {
    console.log(
      "DICTIONARY-ERR: Could not map odds percentage change due to oddsID not being of type STRING."
    );
  }
}

// Attempts to change an odds percentage using the specified lookup and tag data:
function attemptPercentOddsChange(
  inputValue,
  inputLookupID,
  oddsPercentDictionary,
  outputLookupID = null
) {
  // ISSUE IS WITH inputValue.length WHICH IS FOR STRINGS; WE ARE TRYING TO PROCESS DECIMALS!!!

  if (
    inputValue != null &&
    inputValue.length > 0 &&
    oddsPercentDictionary.constructor == Object
  ) {
    // If the percentage in the input field is non-negative or zero:
    if (isAPositiveNumber(inputValue, true)) {
      let decimalOddsValue = Number(inputValue) / 100;

      if (outputLookupID != null) {
        let reelCount = getNumOfActiveReels();
        const roundedDecimalOdds = roundToPrecision(
          permutateOdds(decimalOddsValue, reelCount),
          4
        );
        $("#" + outputLookupID).text(
          roundToPrecision(roundedDecimalOdds * 100, 4)
        );
      }
      // Submit the input to output:
      mapOddsToSlotsDictionaryField(
        inputLookupID,
        decimalOddsValue,
        oddsPercentDictionary
      );
      // Clear the input field:
      $("#" + inputLookupID).prop("value", "");

      return 0; // Output completed successfully AND was parsed successfully
    } else {
      console.log(
        "ERROR-SETODDS: New set value for " +
          inputLookupID.toString() +
          " is invalid. Please ensure the provided value is >= 0."
      );
      // Clear the input field:
      $("#" + inputLookupID).prop("value", "");

      return -2; // Output failed to parse
    }
  }

  return -1; // Nothing in output could be parsed
}

// Updates I/O operation counters regarding setting odd values:
function updateOperationCounters(operationCounterObj, lastStatusCode) {
  // If the input to output was fully successful, count both:
  if (lastStatusCode == 0) {
    operationCounterObj.providedIns = operationCounterObj.providedIns + 1;
    operationCounterObj.successfulOuts = operationCounterObj.successfulOuts + 1;
  }
  // Else if the input was at least there, but failed somehow, count only input:
  else if (lastStatusCode != -1) {
    operationCounterObj.providedIns = operationCounterObj.providedIns + 1;
  }
}

function areNewPercentsOutOf100(newPercentsDict, usingDecimalPercents = false) {
  var result = false;
  let total = 0;

  if (newPercentsDict.constructor == Object) {
    for (let key in newPercentsDict) {
      if (newPercentsDict.hasOwnProperty(key)) {
        total += newPercentsDict[key];
      }
    }

    if (usingDecimalPercents) {
      result = total == 1 ? true : false;
    } else {
      result = total == 100 ? true : false;
    }
  }
  return result;
}

// ---The destination/output should be sent to 'PerSymbolOdds' dictionary object (from home.js)---

// This is to be called when "CHANGE" button is pressed:
function changeOddsInAlgorithm(
  symbolOddsDictionary,
  strCherryInpID = null,
  strBarInpID = null,
  strChipInpID = null,
  strGemInpID = null,
  strSevenInpID = null,
  strCherryOutID = null,
  strBarOutID = null,
  strChipOutID = null,
  strGemOutID = null,
  strSevenOutID = null,
  strSingleCherryOutID = null
) {
  // Fetch all input field content from SET PAYS table currently there:
  const cherryInpPercent =
    strCherryInpID != null ? $("#" + strCherryInpID).val() : null;
  const barInpPercent = strBarInpID != null ? $("#" + strBarInpID).val() : null;
  const chipInpPercent =
    strChipInpID != null ? $("#" + strChipInpID).val() : null;
  const gemInpPercent = strGemInpID != null ? $("#" + strGemInpID).val() : null;
  const sevenInpPercent =
    strSevenInpID != null ? $("#" + strSevenInpID).val() : null;

  const clonedOddsDictionary = cloneThisDictionary(symbolOddsDictionary); // {...symbolOddsDictionary};

  // Have a counter that counts operations completed; if (total # of inputs != total # of successful outputs), then change message should = unsuccessful, else, successful
  var ioCounter = { providedIns: 0, successfulOuts: 0 }; // Object-counter

  /* Check what should and should NOT be updated; based on input being present (length isn't default of none/0-length + null checks): */
  // Cherries:
  let cherryStatusCode = attemptPercentOddsChange(
    cherryInpPercent,
    strCherryInpID,
    clonedOddsDictionary,
    strCherryOutID
  );
  if (cherryStatusCode == 0) {
    // Parse the single cherry odds if the set of cherries is valid:
    let cherryDecimalOddsValue = Number(cherryInpPercent) / 100;
    const roundedCherryDecimalOdds = roundToPrecision(
      permutateOdds(cherryDecimalOddsValue, 1),
      4
    );
    $("#" + strSingleCherryOutID).text(
      roundToPrecision(roundedCherryDecimalOdds * 100, 4)
    );
  }

  // Bars:
  let barStatusCode = attemptPercentOddsChange(
    barInpPercent,
    strBarInpID,
    clonedOddsDictionary,
    strBarOutID
  );

  // Chips:
  let chipStatusCode = attemptPercentOddsChange(
    chipInpPercent,
    strChipInpID,
    clonedOddsDictionary,
    strChipOutID
  );

  // Gems:
  let gemStatusCode = attemptPercentOddsChange(
    gemInpPercent,
    strGemInpID,
    clonedOddsDictionary,
    strGemOutID
  );

  // Sevens:
  let sevenStatusCode = attemptPercentOddsChange(
    sevenInpPercent,
    strSevenInpID,
    clonedOddsDictionary,
    strSevenOutID
  );

  // Sum the total percentage in the test/temp. dictionary:
  var isValidPercentTotal = areNewPercentsOutOf100(clonedOddsDictionary, true);

  updateOperationCounters(ioCounter, cherryStatusCode);
  updateOperationCounters(ioCounter, barStatusCode);
  updateOperationCounters(ioCounter, chipStatusCode);
  updateOperationCounters(ioCounter, gemStatusCode);
  updateOperationCounters(ioCounter, sevenStatusCode);

  // Adjust CHANGE status based on success rate:
  if (
    isValidPercentTotal &&
    ioCounter.providedIns == ioCounter.successfulOuts
  ) {
    // symbolOddsDictionary = clonedOddsDictionary;
    overrideDictionary(symbolOddsDictionary, clonedOddsDictionary);
    setChangeStatus("setodds_chng_success", "Changes were successful!");
  } else {
    setChangeStatus(
      "setodds_chng_success",
      "Changes failed. Percentages must be positive numbers and add up to 100%."
    );
  }
}

// This manages the parameters sent to the CHANGE button function; this is what is attached to the button foremost:
function changeOddsButtonHandler() {
  let chosenAlgorithmNum = checkAlgorithmSelection();

  changeOddsInAlgorithm(
    PerSymbolOdds,
    "cherries_odds",
    "bars_odds",
    "chips_odds",
    "gems_odds",
    "sevens_odds",
    "cherries_set_odds",
    "bars_set_odds",
    "chips_set_odds",
    "gems_set_odds",
    "seven_set_odds",
    "cherry_set_odds"
  );
  // checkAlgorithmSelection();
}

function checkAlgorithmSelection() {
  // Get the selected/checked algorithm radio button:
  var checkedAlgorithmRadioButton = document.querySelector(
    'input[type=radio][name="algorithm"]:checked'
  );
  // Get the radio button number of the chosen algorithm button:
  let selectedButtonNumber = checkedAlgorithmRadioButton.value;
  // Store the correct spin function to call from home.js using the selected button number:
  const spinFunctionToUse = "spin" + selectedButtonNumber + "()";

  // Set the "onclick=" property of the SPIN button to this chosen algorithm spin function:
  let mainSpinButton = document.getElementById("spin");
  mainSpinButton.setAttribute("onclick", spinFunctionToUse);

  return selectedButtonNumber;
}
