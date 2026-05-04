const userListBody = document.getElementById("user-list-body");
const userListMessage = document.getElementById("user-list-message");

const userColumns = [
  "fullname",
  "email",
  "user_role",
  "user_stat"
];

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

function createActionCell() {
  const cell = document.createElement("td");
  const actions = document.createElement("div");
  actions.className = "table-actions";

  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.textContent = "Edit";
  editButton.disabled = true;

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.textContent = "Delete";
  deleteButton.disabled = true;

  actions.append(editButton, deleteButton);
  cell.appendChild(actions);

  return cell;
}

async function loadUsers() {
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

  userListBody.innerHTML = "";

  if (!data.length) {
    setUserListMessage("No users found.", "info");
    return;
  }

  data.forEach(user => {
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

    row.appendChild(createActionCell());

    userListBody.appendChild(row);
  });

  setUserListMessage(`${data.length} users loaded.`, "success");
}

loadUsers();
