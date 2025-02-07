// -----------------------------------------------------------------------

// Check if user is logged in
firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    // User is signed in
    // Redirect to the home page
    window.location.href = "home.html";
  }
});

// Login function
function login() {
  // Fetch data from the form
  var email = $("#email").val();
  var password = $("#password").val();

  // Sign in user
  firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then(function () {
      // Redirect to the home page
      window.location.href = "home.html";
    })

    .catch(function () {
      $("#errorPlaceholder").html("Invalid Email/Password");
    });
}
