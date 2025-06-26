let quotes = [];
const LOCAL_STORAGE_KEY = "quoteData";

// DOM references
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const categoryFilter = document.getElementById("categoryFilter");

// Load local data
function loadLocalQuotes() {
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  quotes = saved ? JSON.parse(saved) : [];
}

// Save quotes to local storage
function saveLocalQuotes() {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(quotes));
}

// Notify user of updates
function notifyUser(message) {
  const note = document.createElement("div");
  note.textContent = message;
  note.style.background = "#fff3cd";
  note.style.color = "#856404";
  note.style.border = "1px solid #ffeeba";
  note.style.padding = "10px";
  note.style.marginTop = "15px";
  note.style.borderRadius = "5px";
  document.body.insertBefore(note, document.body.firstChild);
  setTimeout(() => note.remove(), 5000);
}

// Update category dropdown
function updateCategoryDropdown() {
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
  const filtered = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (!filtered.length) {
    quoteDisplay.textContent = "No quotes available.";
    return;
  }

  const random = filtered[Math.floor(Math.random() * filtered.length)];
  quoteDisplay.textContent = `"${random.text}" — [${random.category}]`;
}

// Add a new quote (and POST to mock server)
async function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) {
    alert("Please fill in both fields.");
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newQuote)
    });

    const responseData = await response.json();
    console.log("POST response (mock):", responseData);
    alert("Quote added and sent to server!");
  } catch (error) {
    console.error("Error syncing to server:", error);
    alert("Quote saved locally, but not sent to server.");
  }
}

// ✅ Sync with server, update local storage, handle conflicts
async function syncQuotes() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    const data = await response.json();

    const serverQuotes = data.slice(0, 10).map(post => ({
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
        // New server quote, add it
        quotes.push(serverQuote);
        updated = true;
      } else if (quotes[localIndex].category !== serverQuote.category) {
        // Conflict — resolve by using server version
        quotes[localIndex] = serverQuote;
        updated = true;
        conflictCount++;
      }
    });

    if (updated) {
      saveLocalQuotes();
      updateCategoryDropdown();
      notifyUser(
        `Quotes synced from server.${conflictCount > 0 ? ` ${conflictCount} conflict(s) resolved.` : ""}`
      );
    }

  } catch (err) {
    console.error("Error syncing with server:", err);
    notifyUser("Could not sync with server.");
  }
}

// Initial run
loadLocalQuotes();
updateCategoryDropdown();
showRandomQuote();
syncQuotes(); // 🔄 Immediate sync

// Periodic syncing every 30 seconds
setInterval(syncQuotes, 30000);

// Event listeners
newQuoteBtn.addEventListener("click", showRandomQuote);
categoryFilter.addEventListener("change", showRandomQuote);
