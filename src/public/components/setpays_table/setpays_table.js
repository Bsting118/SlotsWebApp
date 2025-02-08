// ===================== Global constants: =====================
// Fetch the pay table data from the server and render it to the page
const setPaysTableHtmlPromise = fetch(
  "/components/setpays_table/setpays_table.html"
);
// =============================================================

// ===================== Global variables: =====================
var calculatedWildValue = 0;
// =============================================================

// -----------------------------------------------------------------------

$(document).ready(async () => {
  // Wait for html promise to resolve
  const html = await setPaysTableHtmlPromise;

  // Wait for buffer to be read
  const text = await html.text();

  // Find target
  const target = $("#setpays-table");

  console.log(target, text);

  // Set inner html
  target.html(text);

  // Reset the input fields and erase last change message when the table is closed out of:
  $("#setpays_table_modal").on("hidden.bs.modal", function (e) {
    // runs when the modal is completely hidden
    const inputFieldIDs = [
      "cherries_value",
      "bars_value",
      "chips_value",
      "gems_value",
      "sevens_value",
    ];
    resetInputFields(inputFieldIDs);

    setChangeStatus("setpays_chng_success", "");
  });
});

// Resets the input fields in a given list:
function resetInputFields(listOfTableFieldsToReset) {
  for (let index = 0; index < listOfTableFieldsToReset.length; index++) {
    $("#" + listOfTableFieldsToReset[index]).prop("value", "");
  }
}

// This will round a number up, even if it is on 0.5.
// To use, select the degree of accuracy using toDecimalPlace
//  -E.g., to round up on 0.5 at the thousandths place, have toDecimalPlace = 3 (=1000th place)
function roundUpOnOrAboveHalf(numToRound, toDecimalPlace) {
  var increment = 1 / Math.pow(10, toDecimalPlace);

  // If the number to round is positive, then add on to positively:
  if (numToRound > 0) {
    return Math.round(numToRound + increment);
  }
  // Else if the number to round is negative, then add on to negatively:
  else if (numToRound < 0) {
    return Math.round(numToRound - increment);
  }
}

// Sets a new status indicating what artificial changes took place, send to a change message element with a ID
function setChangeStatus(changeMsgID, newMessage) {
  // Set the change status message:
  $("#" + changeMsgID).text(newMessage);
}

// Tests if an input number (whose value is a string) is a positive integer:
function isAPositiveInteger(inputNum, includeZero = false) {
  if (includeZero) {
    if (inputNum >= 0 && !isNaN(inputNum) && !inputNum.includes(".")) {
      return true;
    } else {
      return false;
    }
  } else {
    if (inputNum > 0 && !isNaN(inputNum) && !inputNum.includes(".")) {
      return true;
    } else {
      return false;
    }
  }
}

function isVarAString(thisVar) {
  return typeof thisVar == "string" || thisVar instanceof String;
}

function mapValueToSlotsDictionaryField(
  valueID,
  valueToMap,
  thisPayValueDictionary
) {
  if (isVarAString(valueID)) {
    if (valueID.includes("cherry") && valueID.includes("set")) {
      thisPayValueDictionary.Cherry = valueToMap;
    } else if (valueID.includes("bar") && valueID.includes("set")) {
      thisPayValueDictionary.Bar = valueToMap;
    } else if (valueID.includes("chips") && valueID.includes("set")) {
      thisPayValueDictionary.Chips = valueToMap;
    } else if (valueID.includes("gem") && valueID.includes("set")) {
      thisPayValueDictionary.Gem = valueToMap;
    } else if (valueID.includes("seven") && valueID.includes("set")) {
      thisPayValueDictionary.Seven = valueToMap;
    } else if (valueID.includes("cherry")) {
      thisPayValueDictionary.Wild = valueToMap;
    }
  } else {
    console.log(
      "DICTIONARY-ERR: Could not map pay value change due to valueID not being of type STRING."
    );
  }
}

// Attempts to change a pay value using the specified lookup and tag data:
function attemptPayValueChange(
  inputValue,
  inputLookupID,
  outputLookupID,
  payValueDictionary
) {
  console.log("I am executing!");

  if (
    inputValue != null &&
    inputValue.length > 0 &&
    outputLookupID != null &&
    payValueDictionary.constructor == Object
  ) {
    if (isAPositiveInteger(inputValue, true)) {
      $("#" + outputLookupID).text(inputValue);

      // EDIT: Have a Pay Value Dictionary in main(), called SymbolPays { }, that will act as a middleman for remembering pay changes
      //  --> Needed this change as selecting different credit bets would overwrite Pay Table HTML fields and thus nullify any original pay changes
      // Scan outputLookupID to determine which dictionary-write property to map to:
      mapValueToSlotsDictionaryField(
        outputLookupID,
        inputValue,
        payValueDictionary
      );

      $("#" + inputLookupID).prop("value", "");

      console.log(
        "new SymbolPays dictionary: \nSevens: " +
          SymbolPays.Seven +
          "\nBar: " +
          SymbolPays.Bar +
          "\nCherry: " +
          SymbolPays.Cherry +
          "\nChips: " +
          SymbolPays.Chips +
          "\nGem: " +
          SymbolPays.Gem +
          "\nWild: " +
          SymbolPays.Wild
      );

      return 0; // Output completed successfully AND was parsed successfully
    } else {
      console.log(
        "ERROR-SETPAYS: New set value for " +
          inputLookupID.toString() +
          " is invalid. Please ensure the provided value is >= 0."
      );

      return -2; // Output failed to parse
    }
  }

  return -1; // Nothing in output could be parsed
}

// Updates I/O operation counters regarding setting pay values:
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

// This is to be called when "CHANGE" button is pressed:
function changePaysInPayTable(
  symbolPaysDictionary,
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
  const cherryInpValue =
    strCherryInpID != null ? $("#" + strCherryInpID).val() : null;
  const barInpValue = strBarInpID != null ? $("#" + strBarInpID).val() : null;
  const chipInpValue =
    strChipInpID != null ? $("#" + strChipInpID).val() : null;
  const gemInpValue = strGemInpID != null ? $("#" + strGemInpID).val() : null;
  const sevenInpValue =
    strSevenInpID != null ? $("#" + strSevenInpID).val() : null;

  // Have a counter that counts operations completed; if (total # of inputs != total # of successful outputs), then change message should = unsuccessful, else, successful
  var ioCounter = { providedIns: 0, successfulOuts: 0 }; // Object-counter

  /* Check what should and should NOT be updated; based on input being present (length isn't default of none/0-length + null checks): */
  // Cherries:
  let cherryStatusCode = attemptPayValueChange(
    cherryInpValue,
    strCherryInpID,
    strCherryOutID,
    symbolPaysDictionary
  );
  updateOperationCounters(ioCounter, cherryStatusCode);

  if (cherryStatusCode == 0) {
    let singleCherryValue = roundUpOnOrAboveHalf(cherryInpValue / 3, 3);
    calculatedWildValue = singleCherryValue;
    if (strSingleCherryOutID != null) {
      $("#" + strSingleCherryOutID).text(singleCherryValue);
      mapValueToSlotsDictionaryField(
        strSingleCherryOutID,
        calculatedWildValue,
        symbolPaysDictionary
      );
    }
  }

  // Bars:
  let barStatusCode = attemptPayValueChange(
    barInpValue,
    strBarInpID,
    strBarOutID,
    symbolPaysDictionary
  );
  updateOperationCounters(ioCounter, barStatusCode);

  // Chips:
  let chipStatusCode = attemptPayValueChange(
    chipInpValue,
    strChipInpID,
    strChipOutID,
    symbolPaysDictionary
  );
  updateOperationCounters(ioCounter, chipStatusCode);

  // Gems:
  let gemStatusCode = attemptPayValueChange(
    gemInpValue,
    strGemInpID,
    strGemOutID,
    symbolPaysDictionary
  );
  updateOperationCounters(ioCounter, gemStatusCode);

  // Sevens:
  let sevenStatusCode = attemptPayValueChange(
    sevenInpValue,
    strSevenInpID,
    strSevenOutID,
    symbolPaysDictionary
  );
  updateOperationCounters(ioCounter, sevenStatusCode);

  // Adjust CHANGE status based on success rate:
  if (ioCounter.providedIns == ioCounter.successfulOuts) {
    setChangeStatus("setpays_chng_success", "Changes were successful!");
  } else {
    setChangeStatus(
      "setpays_chng_success",
      "Changes failed. Credits must be positive whole numbers."
    );
  }
}

// This manages the parameters sent to the CHANGE button function; this is what is attached to the button foremost:
function changePaysButtonHandler() {
  changePaysInPayTable(
    SymbolPays,
    "cherries_value",
    "bars_value",
    "chips_value",
    "gems_value",
    "sevens_value",
    "cherry_set_value",
    "bar_set_value",
    "chips_set_value",
    "gem_set_value",
    "seven_set_value",
    "cherry_value"
  );
}
