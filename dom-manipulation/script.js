let quotes = [];

// Load quotes from localStorage or use defaults
function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  } else {
    quotes = [
      { text: "Believe you can and you're halfway there.", category: "Motivation" },
      { text: "Life is what happens when you're busy making other plans.", category: "Life" },
      { text: "The purpose of our lives is to be happy.", category: "Life" },
      { text: "Your limitation—it's only your imagination.", category: "Motivation" },
    ];
    saveQuotes(); // Save defaults
  }
}

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Save currently viewed quote to sessionStorage
function saveLastViewedQuote(quote) {
  sessionStorage.setItem("lastViewedQuote", JSON.stringify(quote));
}

// Load and display the last viewed quote
function loadLastViewedQuote() {
  const last = sessionStorage.getItem("lastViewedQuote");
  if (last) {
    const quote = JSON.parse(last);
    document.getElementById("quoteDisplay").textContent = `"${quote.text}" - [${quote.category}]`;
  }
}

// Populate category dropdown with unique categories
function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");
  const categories = ["all", ...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = "";

  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textCon})
  }

