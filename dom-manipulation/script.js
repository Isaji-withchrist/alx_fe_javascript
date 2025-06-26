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
  note.style.background = "#e0f7fa";
  note.style.color = "#006064";
  note.style.padding = "10px";
  note.style.marginTop = "15px";
  document.body.insertBefore(note, document.body.firstChild);
  setTimeout(() => note.remove(), 5000);
}

// Update the category dropdown
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

// Show a random quote from the selected category
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

async function addQuote() {
    const text = document.getElementById("newQuoteText").value.trim();
    const category = document.getElementById("newQuoteCategory").value.trim();
  
    if (!text || !category) {
      alert("Please fill in both quote text and category.");
      return;
    }
  
    const newQuote = { text, category };
  
    const exists = quotes.some(q => q.text === text && q.category === category);
    if (exists) {
      alert("This quote already exists.");
      return;
    }
  
    // Add locally
    quotes.push(newQuote);
    saveLocalQuotes();
    updateCategoryDropdown();
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
  
    // 🔄 POST to mock server
    try {
      const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newQuote)
      });
  
      const responseData = await response.json();
      console.log("Server response:", responseData);
      alert("Quote added and sent to server!");
  
    } catch (error) {
      console.error("Error posting quote:", error);
      alert("Quote added locally, but failed to sync with server.");
    }
  }
  

// Fetch quotes from mock API and sync with local
async function fetchQuotesFromServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    const data = await response.json();

    // Take first 10 posts as quotes
    const serverQuotes = data.slice(0, 10).map(post => ({
      text: post.body,
      category: "General"
    }));

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
      notifyUser("New quotes synced from server.");
    }

  } catch (err) {
    console.error("Failed to sync quotes from server:", err);
    notifyUser("Could not sync with server. Try again later.");
  }
}

// Initial setup
loadLocalQuotes();
updateCategoryDropdown();
showRandomQuote();
fetchQuotesFromServer();

// Event listeners
newQuoteBtn.addEventListener("click", showRandomQuote);
categoryFilter.addEventListener("change", showRandomQuote);

// Periodic sync every 30 seconds
setInterval(syncQuotes, 30000);

notifyUser("Quotes synced with server.");

