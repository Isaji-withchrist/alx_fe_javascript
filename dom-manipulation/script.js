let quotes = [];
const LOCAL_STORAGE_KEY = "quoteData";

// DOM references
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const categoryFilter = document.getElementById("categoryFilter");

// Load saved quotes from localStorage
function loadLocalQuotes() {
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  quotes = saved ? JSON.parse(saved) : [];
}

// Save quotes to localStorage
function saveLocalQuotes() {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(quotes));
}

// Notify user of updates
function notifyUser(message) {
  const note = document.createElement("div");
  note.textContent = message;
  note.style.background = "#e8f0fe";
  note.style.color = "#1967d2";
  note.style.padding = "10px";
  note.style.marginTop = "10px";
  note.style.border = "1px solid #aecbfa";
  note.style.borderRadius = "5px";
  document.body.insertBefore(note, document.body.firstChild);
  setTimeout(() => note.remove(), 5000);
}

// Dynamically create the Add Quote form
function createAddQuoteForm() {
  const formContainer = document.createElement("div");
  formContainer.id = "addQuoteForm";
  formContainer.style.marginTop = "20px";

  const quoteInput = document.createElement("input");
  quoteInput.id = "newQuoteText";
  quoteInput.type = "text";
  quoteInput.placeholder = "Enter a new quote";
  quoteInput.style.marginRight = "10px";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";
  categoryInput.style.marginRight = "10px";

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.addEventListener("click", addQuote);

  formContainer.appendChild(quoteInput);
  formContainer.appendChild(categoryInput);
  formContainer.appendChild(addButton);

  document.body.appendChild(formContainer);
}

// Dynamically create Export button
function createExportButton() {
  const exportBtn = document.createElement("button");
  exportBtn.textContent = "Export Quotes as JSON";
  exportBtn.style.marginTop = "15px";
  exportBtn.addEventListener("click", exportToJsonFile);
  document.body.appendChild(exportBtn);
}

// Dynamically create Import file input
function createImportButton() {
  const label = document.createElement("label");
  label.textContent = "Import Quotes from JSON:";
  label.style.display = "block";
  label.style.marginTop = "20px";

  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".json";
  fileInput.addEventListener("change", importFromJsonFile);

  label.appendChild(fileInput);
  document.body.appendChild(label);
}

// Update category dropdown
function populateCategories() {
  const categories = ["all", ...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = "";
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    categoryFilter.appendChild(option);
  });
}

// Show a random quote
function showRandomQuote() {
  const selectedCategory = categoryFilter.value;
  const filtered = filterQuote(selectedCategory);
  if (!filtered.length) {
    quoteDisplay.textContent = "No quotes available.";
    return;
  }

  const random = filtered[Math.floor(Math.random() * filtered.length)];
  quoteDisplay.textContent = `"${random.text}" — [${random.category}]`;
}

// Add a new quote and POST to mock API
async function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) {
    alert("Please enter both quote and category.");
    return;
  }

  const newQuote = { text, category };

  const exists = quotes.some(q => q.text === text && q.category === category);
  if (exists) {
    alert("This quote already exists.");
    return;
  }

  quotes.push(newQuote);
  saveLocalQuotes();
  updateCategoryDropdown();

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newQuote)
    });

    const responseData = await response.json();
    console.log("Mock POST response:", responseData);
    alert("Quote added and sent to server!");
  } catch (error) {
    console.error("POST failed:", error);
    alert("Quote saved locally, but not sent to server.");
  }
}

// ✅ Periodic syncing and conflict resolution
async function syncQuotes() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    const serverData = await response.json();

    const serverQuotes = serverData.slice(0, 10).map(post => ({
      text: post.body,
      category: "General"
    }));

    let updated = false;
    let conflictCount = 0;

    serverQuotes.forEach(serverQuote => {
      const localIndex = quotes.findIndex(
        q => q.text.trim().toLowerCase() === serverQuote.text.trim().toLowerCase()
      );

      if (localIndex === -1) {
        quotes.push(serverQuote);
        updated = true;
      } else if (quotes[localIndex].category !== serverQuote.category) {
        quotes[localIndex] = serverQuote;
        updated = true;
        conflictCount++;
      }
    });

    if (updated) {
      saveLocalQuotes();
      updateCategoryDropdown();
      notifyUser(`Quotes synced from server. ${conflictCount} conflict(s) resolved.`);
    }

  } catch (error) {
    console.error("Sync error:", error);
    notifyUser("Failed to sync quotes from server.");
  }
}

// ✅ Export quotes as JSON file
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const downloadLink = document.createElement("a");
  downloadLink.href = url;
  downloadLink.download = "quotes-export.json";
  downloadLink.click();

  URL.revokeObjectURL(url);
}

// ✅ Import quotes from JSON file
function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function(e) {
    try {
      const importedData = JSON.parse(e.target.result);

      if (!Array.isArray(importedData)) {
        alert("Invalid JSON format. Expected an array.");
        return;
      }

      let addedCount = 0;

      importedData.forEach(importedQuote => {
        if (importedQuote.text && importedQuote.category) {
          const exists = quotes.some(
            q =>
              q.text.trim().toLowerCase() === importedQuote.text.trim().toLowerCase() &&
              q.category.trim().toLowerCase() === importedQuote.category.trim().toLowerCase()
          );

          if (!exists) {
            quotes.push(importedQuote);
            addedCount++;
          }
        }
      });

      if (addedCount > 0) {
        saveLocalQuotes();
        updateCategoryDropdown();
        showRandomQuote();
        notifyUser(`Imported ${addedCount} new quote(s) from file.`);
      } else {
        alert("No new quotes imported. All data already exists.");
      }

    } catch (error) {
      alert("Error reading JSON file.");
      console.error(error);
    }
  };

  reader.readAsText(file);
}

// Initial setup
loadLocalQuotes();
createAddQuoteForm();
createExportButton();
createImportButton();
updateCategoryDropdown();
showRandomQuote();
syncQuotes(); // initial sync

// Event listeners
newQuoteBtn.addEventListener("click", showRandomQuote);
categoryFilter.addEventListener("change", showRandomQuote);

// Periodic sync every 30 seconds
setInterval(syncQuotes, 30000);
