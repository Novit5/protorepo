const loginForm = document.getElementById("login-form");
const loginMessage = document.getElementById("login-message");
const forgotPasswordLink = document.getElementById("forgot-password-link");

async function hashPassword(password) {
  const encoded = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  return hashArray.map(byte => byte.toString(16).padStart(2, "0")).join("");
}

function setLoginMessage(message, type) {
  loginMessage.textContent = message;
  loginMessage.className = `form-message ${type}`;
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  setLoginMessage("Signing in...", "info");

  const passwordHash = await hashPassword(password);
  const { data: userRecord, error: userLookupError } = await supabaseClient
    .from("tbl_user")
    .select("user_id, email")
    .eq("email", email)
    .eq("password", passwordHash)
    .maybeSingle();

  if (userLookupError) {
    setLoginMessage(`Unable to check tbl_user: ${userLookupError.message}`, "error");
    return;
  }

  if (!userRecord) {
    setLoginMessage("Email or password was not found in database.", "error");
    return;
  }

  const { error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    setLoginMessage(`${error.message}. Please verify your email before logging in.`, "error");
    return;
  }

  window.location.href = "index.html";
});

forgotPasswordLink.addEventListener("click", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();

  if (!email) {
    setLoginMessage("Enter your email first, then click Forgot password.", "error");
    return;
  }

  setLoginMessage("Checking your account...", "info");

  const { data: userRecord, error: userLookupError } = await supabaseClient
    .from("tbl_user")
    .select("user_id, email")
    .eq("email", email)
    .maybeSingle();

  if (userLookupError) {
    setLoginMessage(`Unable to check tbl_user: ${userLookupError.message}`, "error");
    return;
  }

  if (!userRecord) {
    setLoginMessage("This email was not found in tbl_user.", "error");
    return;
  }

  const redirectUrl = new URL("reset-password.html", window.location.href).href;
  const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl
  });

  if (error) {
    setLoginMessage(error.message, "error");
    return;
  }

  setLoginMessage("Password reset email sent. Check your inbox.", "success");
});
