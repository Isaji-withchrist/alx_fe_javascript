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

// Save to local storage
function saveLocalQuotes() {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(quotes));
}

// Mock fetch from server
async function fetchServerQuotes() {
  try {
    const response = await fetch("serverQuotes.json"); // simulate API
    if (!response.ok) throw new Error("Server error");
    const serverQuotes = await response.json();

    let updated = false;
    serverQuotes.forEach(serverQuote => {
      const exists = quotes.some(localQuote =>
        localQuote.text === serverQuote.text && localQuote.category === serverQuote.category
      );
      if (!exists) {
        quotes.push(serverQuote);
        updated = true;
      }
    });

    if (updated) {
      saveLocalQuotes();
      updateCategoryDropdown();
      notifyUser("Quotes updated from server.");
    }
  } catch (error) {
    console.error("Error syncing with server:", error);
  }
}

// Notify user
function notifyUser(message) {
  const note = document.createElement("div");
  note.textContent = message;
  note.style.background = "#d1ecf1";
  note.style.color = "#0c5460";
  note.style.padding = "10px";
  note.style.marginTop = "15px";
  document.body.insertBefore(note, document.body.firstChild);
  setTimeout(() => note.remove(), 5000);
}

// Update dropdown
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

// Show quote
function showRandomQuote() {
  const selectedCategory = categoryFilter.value;
  const filtered = selectedCategory === "all" ? quotes : quotes.filter(q => q.category === selectedCategory);
  if (!filtered.length) {
    quoteDisplay.textContent = "No quotes available.";
    return;
  }
  const random = filtered[Math.floor(Math.random() * filtered.length)];
  quoteDisplay.textContent = `"${random.text}" — [${random.category}]`;
}

// Add new quote
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) {
    alert("Please fill both fields.");
    return;
  }

  const duplicate = quotes.find(q => q.text === text && q.category === category);
  if (duplicate) {
    alert("This quote already exists.");
    return;
  }

  quotes.push({ text, category });
  saveLocalQuotes();
  updateCategoryDropdown();

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
  alert("Quote added!");
}

// Event Listeners
newQuoteBtn.addEventListener("click", showRandomQuote);
categoryFilter.addEventListener("change", showRandomQuote);

// Initial Load
loadLocalQuotes();
updateCategoryDropdown();
fetchServerQuotes();
showRandomQuote();

// Sync every 30 seconds
setInterval(fetchServerQuotes, 30000);
