const resetPasswordForm = document.getElementById("reset-password-form");
const resetPasswordMessage = document.getElementById("reset-password-message");

async function hashPassword(password) {
  const encoded = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  return hashArray.map(byte => byte.toString(16).padStart(2, "0")).join("");
}

function setResetPasswordMessage(message, type) {
  resetPasswordMessage.textContent = message;
  resetPasswordMessage.className = `form-message ${type}`;
}

resetPasswordForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const newPassword = document.getElementById("new-password").value;
  const confirmNewPassword = document.getElementById("confirm-new-password").value;

  if (newPassword !== confirmNewPassword) {
    setResetPasswordMessage("Passwords do not match.", "error");
    return;
  }

  setResetPasswordMessage("Updating your password...", "info");

  const { data: sessionData } = await supabaseClient.auth.getSession();
  const email = sessionData.session?.user?.email;

  if (!email) {
    setResetPasswordMessage("Password reset session was not found. Please request another reset email.", "error");
    return;
  }

  const { error } = await supabaseClient.auth.updateUser({
    password: newPassword
  });

  if (error) {
    setResetPasswordMessage(error.message, "error");
    return;
  }

  const passwordHash = await hashPassword(newPassword);
  const { error: profileError } = await supabaseClient
    .from("tbl_user")
    .update({
      password: passwordHash
    })
    .eq("email", email);

  if (profileError) {
    setResetPasswordMessage(`Password was updated, but tbl_user was not updated: ${profileError.message}`, "error");
    return;
  }

  resetPasswordForm.reset();
  setResetPasswordMessage("Password updated. You can now sign in.", "success");
});
