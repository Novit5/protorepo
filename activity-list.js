const activityListBody = document.getElementById("activity-list-body");
const activityListMessage = document.getElementById("activity-list-message");

const activityColumns = [
  "title",
  "manager",
  "program",
  "start",
  "end",
  "venue",
  "proposal",
  "logistic",
  "platenum",
  "cost",
  "fund",
  "request",
  "order",
  "payment",
  "liquidation",
  "status",
  "remarks",
  "mov"
];

function setActivityListMessage(message, type) {
  activityListMessage.textContent = message;
  activityListMessage.className = `form-message ${type}`;
}

function formatCellValue(value) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return value;
}

async function loadActivities() {
  const { data, error } = await supabaseClient
    .from("tbl_activity")
    .select(activityColumns.join(","))
    .order("start", {
      ascending: false
    });

  if (error) {
    setActivityListMessage(`Unable to load activities: ${error.message}`, "error");
    return;
  }

  activityListBody.innerHTML = "";

  if (!data.length) {
    setActivityListMessage("No activities found.", "info");
    return;
  }

  data.forEach(activity => {
    const row = document.createElement("tr");

    activityColumns.forEach(column => {
      const cell = document.createElement("td");
      cell.textContent = formatCellValue(activity[column]);
      row.appendChild(cell);
    });

    activityListBody.appendChild(row);
  });

  setActivityListMessage(`${data.length} activities loaded.`, "success");
}

loadActivities();
