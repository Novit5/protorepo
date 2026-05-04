const userListBody = document.getElementById("user-list-body");
const userListMessage = document.getElementById("user-list-message");
const userEditPanel = document.getElementById("user-edit-panel");
const userEditForm = document.getElementById("user-edit-form");
const cancelEditButton = document.getElementById("cancel-edit-button");

const userColumns = [
  "user_id",
  "fullname",
  "email",
  "user_role",
  "user_stat"
];

let users = [];

async function hashPassword(password) {
  const encoded = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  return hashArray.map(byte => byte.toString(16).padStart(2, "0")).join("");
}

function setUserListMessage(message, type) {
  userListMessage.textContent = message;
  userListMessage.className = `form-message ${type}`;
}

function formatCellValue(value) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return value;
}

function formatUserRole(role) {
  const roleLabels = {
    1: "Admin",
    2: "Program Manager"
  };

  return roleLabels[role] || formatCellValue(role);
}

function formatUserStatus(status) {
  const statusLabels = {
    1: "Active",
    2: "Inactive"
  };

  return statusLabels[status] || formatCellValue(status);
}

function createActionCell(userId) {
  const cell = document.createElement("td");
  const actions = document.createElement("div");
  actions.className = "table-actions";

  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.textContent = "Edit";
  editButton.dataset.action = "edit";
  editButton.dataset.userId = userId;

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.textContent = "Delete";
  deleteButton.className = "button-danger";
  deleteButton.dataset.action = "delete";
  deleteButton.dataset.userId = userId;

  actions.append(editButton, deleteButton);
  cell.appendChild(actions);

  return cell;
}

function closeEditForm() {
  userEditForm.reset();
  document.getElementById("edit-user-id").value = "";
  userEditPanel.classList.add("is-hidden");
}

function openEditForm(user) {
  document.getElementById("edit-user-id").value = user.user_id;
  document.getElementById("edit-fullname").value = formatCellValue(user.fullname) === "-" ? "" : user.fullname;
  document.getElementById("edit-email").value = formatCellValue(user.email) === "-" ? "" : user.email;
  document.getElementById("edit-password").value = "";
  document.getElementById("edit-user-role").value = String(user.user_role || "2");
  document.getElementById("edit-user-stat").value = String(user.user_stat || "1");
  userEditPanel.classList.remove("is-hidden");
  document.getElementById("edit-fullname").focus();
}

async function loadUsers(successMessage) {
  const { data, error } = await supabaseClient
    .from("tbl_user")
    .select(userColumns.join(","))
    .order("fullname", {
      ascending: true
    });

  if (error) {
    setUserListMessage(`Unable to load users: ${error.message}`, "error");
    return;
  }

  users = data || [];
  userListBody.innerHTML = "";

  if (!users.length) {
    setUserListMessage("No users found.", "info");
    return;
  }

  users.forEach(user => {
    const row = document.createElement("tr");

    const fullnameCell = document.createElement("td");
    fullnameCell.textContent = formatCellValue(user.fullname);
    row.appendChild(fullnameCell);

    const emailCell = document.createElement("td");
    emailCell.textContent = formatCellValue(user.email);
    row.appendChild(emailCell);

    const roleCell = document.createElement("td");
    roleCell.textContent = formatUserRole(user.user_role);
    row.appendChild(roleCell);

    const statusCell = document.createElement("td");
    statusCell.textContent = formatUserStatus(user.user_stat);
    row.appendChild(statusCell);

    row.appendChild(createActionCell(user.user_id));

    userListBody.appendChild(row);
  });

  setUserListMessage(successMessage || `${users.length} users loaded.`, "success");
}

userListBody.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-action]");

  if (!button) {
    return;
  }

  const userId = button.dataset.userId;
  const user = users.find(item => String(item.user_id) === String(userId));

  if (!user) {
    setUserListMessage("Selected user was not found. Please reload the page.", "error");
    return;
  }

  if (button.dataset.action === "edit") {
    openEditForm(user);
    return;
  }

  if (!confirm(`Are you sure you want to delete ${user.fullname || user.email}? This action cannot be undone.`)) {
    return;
  }

  button.disabled = true;
  setUserListMessage("Deleting user...", "info");

  const { error } = await supabaseClient
    .from("tbl_user")
    .delete()
    .eq("user_id", userId);

  if (error) {
    button.disabled = false;
    setUserListMessage(`Unable to delete user: ${error.message}`, "error");
    return;
  }

  closeEditForm();
  await loadUsers("User deleted successfully.");
});

userEditForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const userId = document.getElementById("edit-user-id").value;
  const password = document.getElementById("edit-password").value;
  const updates = {
    fullname: document.getElementById("edit-fullname").value.trim(),
    user_role: Number(document.getElementById("edit-user-role").value),
    user_stat: Number(document.getElementById("edit-user-stat").value)
  };

  if (password) {
    updates.password = await hashPassword(password);
  }

  setUserListMessage("Saving user changes...", "info");

  const { error } = await supabaseClient
    .from("tbl_user")
    .update(updates)
    .eq("user_id", userId);

  if (error) {
    setUserListMessage(`Unable to update user: ${error.message}`, "error");
    return;
  }

  closeEditForm();
  await loadUsers("User updated successfully.");
});

cancelEditButton.addEventListener("click", closeEditForm);

loadUsers();
