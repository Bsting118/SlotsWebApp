// -----------------------------------------------------------------------

function register() {
  // Fetch data from the form
  var password = $("#password").val();
  var password2 = $("#verifyPassword").val();
  var email = $("#email").val();
  var firstName = $("#firstName").val();
  var lastName = $("#lastName").val();

  // Verify that the passwords match
  if (password !== password2) {
    $("#errorPlaceholder").html("Passwords do not match");
    return;
  }

  // Verify password length
  if (password.length < 8) {
    $("#errorPlaceholder").html("Password must be at least 8 characters");
    return;
  }

  // Verify email
  if (!email.includes("@")) {
    $("#errorPlaceholder").html("Invalid email address");
    return;
  }

  // Create accountin Firebase
  firebase
    .auth()
    .createUserWithEmailAndPassword(email, password)
    .then(function () {
      // Update the user's display name
      var user = firebase.auth().currentUser;
      user
        .updateProfile({
          displayName: firstName + " " + lastName,
        })
        .then(function () {
          // Set the user's default credits
          return db.collection("users").doc(user.uid).set({
            credits: 100,
            numPlays: 0,
            creditsWon: 0,
            creditsBet: 0,
            wins: 0,
            losses: 0,
          });
        })
        .then(function () {
          // Redirect to the home page
          window.location.href = "login.html";
        })
        .catch(function (error) {
          $("#errorPlaceholder").html(error.message);
        });
    })
    .catch(function (error) {
      $("#errorPlaceholder").html(error.message);
    });
}
