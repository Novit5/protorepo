const loginForm = document.getElementById("login-form");
const loginMessage = document.getElementById("login-message");

function setLoginMessage(message, type) {
  loginMessage.textContent = message;
  loginMessage.className = `form-message ${type}`;
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  setLoginMessage("Signing in...", "info");

  const { error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    setLoginMessage(error.message, "error");
    return;
  }

  window.location.href = "index.html";
});
