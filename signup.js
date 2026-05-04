const signupForm = document.getElementById("signup-form");
const signupMessage = document.getElementById("signup-message");

async function hashPassword(password) {
  const encoded = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  return hashArray.map(byte => byte.toString(16).padStart(2, "0")).join("");
}

function setSignupMessage(message, type) {
  signupMessage.textContent = message;
  signupMessage.className = `form-message ${type}`;
}

signupForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const fullname = document.getElementById("full-name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirm-password").value;

  if (password !== confirmPassword) {
    setSignupMessage("Passwords do not match.", "error");
    return;
  }

  setSignupMessage("Creating your account...", "info");

  const redirectUrl = new URL("login.html", window.location.href).href;
  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectUrl,
      data: {
        fullname
      }
    }
  });

  if (error) {
    setSignupMessage(error.message, "error");
    return;
  }

  const passwordHash = await hashPassword(password);
  const { error: profileError } = await supabaseClient
    .from("tbl_user")
    .insert({
      fullname,
      email,
      password: passwordHash
    });

  if (profileError) {
    setSignupMessage(`Account email was sent, but tbl_user was not saved: ${profileError.message}`, "error");
    return;
  }

  signupForm.reset();

  if (data.session) {
    setSignupMessage("Account created. You can now go to the dashboard.", "success");
  } else {
    setSignupMessage("Account created. Check your email to verify your account before logging in.", "success");
  }
});
