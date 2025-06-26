let quotes = [];
const LOCAL_STORAGE_KEY = "quoteData";

// DOM Elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const categoryFilter = document.getElementById("categoryFilter");

// === Load and Save Local Quotes ===
function loadLocalQuotes() {
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  quotes = saved ? JSON.parse(saved) : [];
}

function saveLocalQuotes() {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(quotes));
}

// === Fetch Quotes from Server (Simulated) ===
async function fetchQuotesFromServer() {
  try {
    const response = await fetch("serverQuotes.json"); // JSON must be hosted locally or served
    if (!response.ok) throw new Error("Could not fetch server quotes");

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
      notifyUser("New quotes synced from the server.");
    }
  } catch (err) {
    console.e
  }}