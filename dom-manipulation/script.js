// Initial quotes array
let quotes = [
    { text: "Believe you can and you're halfway there.", category: "Motivation" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { text: "The purpose of our lives is to be happy.", category: "Life" },
    { text: "Your limitation—it's only your imagination.", category: "Motivation" },
  ];
  
  const quoteDisplay = document.getElementById("quoteDisplay");
  const newQuoteBtn = document.getElementById("newQuote");
  const categoryFilter = document.getElementById("categoryFilter");
  
  // Initialize categories in dropdown
  function updateCategoryDropdown() {
    // Get unique categories
    const categories = ["all", ...new Set(quotes.map(q => q.category))];
  
    // Clear dropdown
    categoryFilter.innerHTML = "";
  
    // Populate dropdown
    categories.forEach(cat => {
      const option = document.createElement("option");
      option.value = cat;
      option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
      categoryFilter.appendChild(option);
    });
  }
  
  // Show random quote
  function showRandomQuote() {
    const selectedCategory = categoryFilter.value;
  
    const filteredQuotes = selectedCategory === "all"
      ? quotes
      : quotes.filter(q => q.category.toLowerCase() === selectedCategory.toLowerCase());
  
    if (filteredQuotes.length === 0) {
      quoteDisplay.textContent = "No quotes available in this category.";
      return;
    }
  
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const quote = filteredQuotes[randomIndex];
    quoteDisplay.textContent = `"${quote.text}" - [${quote.category}]`;
  }
  
  // Add a new quote
  function addQuote() {
    const text = document.getElementById("newQuoteText").value.trim();
    const category = document.getElementById("newQuoteCategory").value.trim();
  
    if (!text || !category) {
      alert("Please enter both quote text and category.");
      return;
    }
  
    quotes.push({ text, category });
  
    // Update UI
    updateCategoryDropdown();
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
  
    alert("Quote added successfully!");
  }
  
  // Event Listeners
  newQuoteBtn.addEventListener("click", showRandomQuote);
  categoryFilter.addEventListener("change", showRandomQuote);
  
  // Initial call
  updateCategoryDropdown();
  