const SUPABASE_URL = "https://cvngogaejtlgiuiklxse.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2bmdvZ2FlanRsZ2l1aWtseHNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1MzI3NjEsImV4cCI6MjA5MzEwODc2MX0.TAIWznBwFPX5cOCHvRdk8rOlwBfUqUE-2iclvyDi6co";

const form = document.getElementById("form");
const tableBody = document.getElementById("table-body");

// FETCH DATA
async function loadData() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/activities?select=*`, {
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`
    }
  });

  const data = await res.json();

  tableBody.innerHTML = "";

  data.forEach(row => {
    const tr = document.createElement("tr");

    tr.className = row.status.toLowerCase();

    tr.innerHTML = `
      <td>${row.name}</td>
      <td>${row.activity}</td>
      <td>${row.status}</td>
    `;

    tableBody.appendChild(tr);
  });
}

// ADD DATA
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const newData = {
    name: document.getElementById("name").value,
    activity: document.getElementById("activity").value,
    status: document.getElementById("status").value
  };

  await fetch(`${SUPABASE_URL}/rest/v1/activities`, {
    method: "POST",
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(newData)
  });

  form.reset();
  loadData();
});

// INITIAL LOAD
loadData();