
async function loadCSV() {

// Check if sessionStorage has saved game data, otherwise load from CSV
const savedGameData = sessionStorage.getItem("gameData");
if (savedGameData) {
  return JSON.parse(savedGameData);
}

  const response = await fetch("Game_List.csv"); // Fetch the CSV file named "Game_List.csv"

  if (!response.ok) { // Check if the file was successfully loaded
    console.error("Failed to load CSV:", response.statusText);
    return [];
  }

  const data = await response.text(); // Convert the CSV file content into text format
  console.log("CSV Raw Data:", data); // Debugging output to verify raw CSV contents

  const rows = data.split("\n").slice(1); // Skip the header row as it is used to lable the coloums
  console.log("CSV Rows:", rows); 

  let gameData = []; // Create an empty array to store extracted game data as objects!

  rows.forEach(row => {
    let columns = row.split(","); // Split each row into separate values using a comma (CSV format)
    if (columns.length >= 6) {
      let title = columns[0].trim(); //.trim() just removes any spaces in front or after title
      let imageURL = columns[1].trim(); // especially here spaces could break my code
      let genre = columns[2].trim().split("|"); //split here allows me to add mult. genres without mult new col.
      let favorited = columns[3]?.trim().toLowerCase() === "true"; // checks if string matched and returns bool
      let rating = columns[4].trim();
      let wishlisted = columns[5]?.trim().toLowerCase() === "true";
      let cost = columns[6].trim()
      gameData.push({ title, imageURL, genre, favorited, rating, wishlisted, cost });
    }
  });

  console.log("Parsed Game Data:", gameData); // Debugging output

//Store in sessionStorage so changes persist within the session
sessionStorage.setItem("gameData", JSON.stringify(gameData));

  return gameData;
}


async function showHomeCards() {
  const cardContainer = document.getElementById("card-container");
  cardContainer.innerHTML = "";
  const templateCard = document.querySelector(".card");

  const gameData = await loadCSV(); // Load the game data from CSV

  gameData.forEach(game => {
    const nextCard = templateCard.cloneNode(true); // Copy template card
    editCardContent(nextCard, game.title, game.imageURL, game.genre); // Populate card
    cardContainer.appendChild(nextCard); // Add to container
  });
}


async function showFavoriteCards() {
  const favoritesContainer = document.getElementById("favorites-container");
  favoritesContainer.innerHTML = ""; // Clear previous content

  // || await loadCSV() is a fallback mechanism in case sessionStorage.getItem("gameData") returns null or undefined
  let gameData = JSON.parse(sessionStorage.getItem("gameData")) || await loadCSV(); 

  const favoriteGames = gameData.filter(game => game.favorited);
  const templateCard = document.querySelector(".card");

  favoriteGames.forEach(game => {
    const nextCard = templateCard.cloneNode(true); // Copy template card
    editCardContent(nextCard, game.title, game.imageURL, [game.rating]); // Populate card
    nextCard.style.display = "block"; // Ensure the card is visible
    favoritesContainer.appendChild(nextCard); // Add to container
    }
  )
}


async function showWishlistCards() {
  const wishlistContainer = document.getElementById("wishlists-container");
  wishlistContainer.innerHTML = ""; // Clear previous content

  // || await loadCSV() is a fallback mechanism in case sessionStorage.getItem("gameData") returns null or undefined
  let gameData = JSON.parse(sessionStorage.getItem("gameData")) || await loadCSV(); 

  const wishlistGames = gameData.filter(game => game.wishlisted);
  const templateCard = document.querySelector(".card");

  wishlistGames.forEach(game => {
    const nextCard = templateCard.cloneNode(true); // Copy template card
    editCardContent(nextCard, game.title, game.imageURL, [game.cost]); // Populate card
    nextCard.style.display = "block"; // Ensure the card is visible
    wishlistContainer.appendChild(nextCard); // Add to container
    }
  )

  console.log("Running showWishlistCards()");
  console.log("Wishlist Games:", wishlistGames);
}


function editCardContent(card, newTitle, newImageURL, newInfo) {
  card.style.display = "block";

  const cardHeader = card.querySelector("h2");
  cardHeader.textContent = newTitle;

  const cardImage = card.querySelector("img");
  cardImage.src = newImageURL;
  cardImage.alt = newTitle + " Poster";

  // Populate the details list dynamically
  const cardList = card.querySelector("ul");
  cardList.innerHTML = ""; // Clear existing list

  newInfo.forEach(detail => {
    const listItem = document.createElement("li");
    listItem.textContent = detail;
    cardList.appendChild(listItem);
  });
  // You can use console.log to help you debug!
  // View the output by right clicking on your website,
  // select "Inspect", then click on the "Console" tab
  console.log("new card:", newTitle, "- html: ", card);
}

// This calls the addCards() function when the page is first loaded
document.addEventListener("DOMContentLoaded", showHomeCards);


let selectedGameTitle = ""; //we can store a selected card title to use later
let selectedGameCard = null; // Keep track of the currently selected card

function selectGame(card) {
  // If a card is already selected, remove the "selected" class
  if (selectedGameCard) {
    selectedGameCard.classList.remove("selected");
  }

  // If the clicked card is the same as the currently selected card, deselect it
  if (selectedGameCard === card) {
    selectedGameCard = null; // Deselect the card
    selectedGameTitle = ""; // Clear the selected game title
  } else {
    // Otherwise, select the new card
    card.classList.add("selected");
    selectedGameCard = card; // Update the selected card
    selectedGameTitle = card.querySelector("h2").textContent; // Update the selected game title
  }

  console.log("Selected Game:", selectedGameTitle); // Debugging log
}


async function gameDescription() {
  if (!selectedGameTitle) {
    alert("Please select a game first!");
    return;
  }

  const response = await fetch("game_descriptions.json");
  if (!response.ok) {
    console.error("Failed to load descriptions:", response.statusText);
    alert("Description could not be retrieved.");
    return;
  }

  const descriptions = await response.json();
  const description = descriptions[selectedGameTitle]; // Find description in json using stored title
  //                                                      but also ignors the title itself
  if (description) {
    alert(description); // Show the correct game description
  } else {
    alert("No description available for this game.");
  }
}


async function wishlistCard() {
  if (!selectedGameTitle) {
    alert("Please select a game first!");
    return;
  }

  gameData = await loadCSV();
  let game = gameData.find(g => g.title === selectedGameTitle); //find the selected title
  
  if (game.wishlisted === false) { // If the favorite value is false
    game.wishlisted = !game.wishlisted; // Then set it to true
    sessionStorage.setItem("gameData", JSON.stringify(gameData)); //Update sessionStorage
  }

  showWishlistCards();
  console.log(game.wishlisted);
}

async function removeWishlistCard() {
  if (!selectedGameTitle) {
    alert("Please select a wishlisted game first!");
    return;
  }

  gameData = await loadCSV();
  let game = gameData.find(g => g.title === selectedGameTitle); //find the selected title

  if (game.wishlisted === false) { // If the favorite value is false
    alert("Please select a wishlisted game first")
  }

  if (game.wishlisted === true) { // If the favorite value is false
    game.wishlisted = !game.wishlisted; // Then set it to true
    sessionStorage.setItem("gameData", JSON.stringify(gameData)); //Update sessionStorage
  }

  showWishlistCards();
  console.log(game.wishlisted);
}


async function favoriteCard() {
  if (!selectedGameTitle) {
    alert("Please select a game first!");
    return;
  }

  gameData = await loadCSV();
  let game = gameData.find(g => g.title === selectedGameTitle); //find the selected title
  
  if (game.favorited === false) { // If the favorite value is false
    game.favorited = !game.favorited; // Then set it to true
    sessionStorage.setItem("gameData", JSON.stringify(gameData)); //Update sessionStorage
  }

  showFavoriteCards();
  console.log(game.favorited);
}

async function removeFavoriteCard() {
  if (!selectedGameTitle) {
    alert("Please select a favorited game first!");
    return;
  }

  gameData = await loadCSV();
  let game = gameData.find(g => g.title === selectedGameTitle); //find the selected title

  if (game.favorited === false) { // If the favorite value is false
    alert("Please select a favorited game first")
  }

  if (game.favorited === true) { // If the favorite value is false
    game.favorited = !game.favorited; // Then set it to true
    sessionStorage.setItem("gameData", JSON.stringify(gameData)); //Update sessionStorage
  }

  showFavoriteCards();
  console.log(game.favorited);
}

async function rateCard() {
  if (!selectedGameTitle) {
    alert("Please select a favorited game first!");
    return;
  }

  gameData = await loadCSV();
  let game = gameData.find(g => g.title === selectedGameTitle); //find the selected title

  let userInput = prompt("What would you rate this game out of 10?", "0");
  ratingNumber = parseInt(userInput, 10);

  while (1) {
    if (isNaN(ratingNumber)) {
      let userInput = prompt("Please enter a valid number from 0-10.", "0");
      ratingNumber = parseInt(userInput, 10);
    }
    else {
      break;
    }
  }

  if (ratingNumber > 10)
    ratingNumber = 10;
  if (ratingNumber < 0)
    ratingNumber = 0;

  game.rating = "Rating: " + ratingNumber;
  sessionStorage.setItem("gameData", JSON.stringify(gameData));

  showFavoriteCards();
  console.log(ratingNumber);
}

function toggleFilterMenu() {
  let filterMenu = document.getElementById("filter-menu");
    filterMenu.style.display = (filterMenu.style.display === "none" || filterMenu.style.display === "") 
        ? "block" : "none"; //Toggle visability of filter menu
}

async function filterByGenre(newGenre) {
  const cardContainer = document.getElementById("card-container");
    cardContainer.innerHTML = ""; // Clear previous cards
 
    let gameData = JSON.parse(sessionStorage.getItem("gameData")) || await loadCSV(); 

    if (newGenre.toLowerCase().trim() === "allgames") {
        showHomeCards(); // Show all games if "All Games" is selected
        return;
    }
  
    const gamesByGenre = gameData.filter(game =>                                            //Here I filter the genres to return true
      game.genre.map(g => g.toLowerCase().trim()).includes(newGenre.toLowerCase().trim())); //If the genre array contains newGenre.
      //.map here reconfigures the genre array so all genres are lowercased with no spaces to limit syntatical error

    console.log("Game Data Before Filtering:", gameData); // Debugging step

    console.log("Filtered Games:", gamesByGenre); // Debugging step

    if (gamesByGenre.length === 0) {
        alert(`No games found for the genre: ${newGenre}`);
        return;
    }

    const templateCard = document.querySelector(".card");

    gamesByGenre.forEach(game => {
        const nextCard = templateCard.cloneNode(true);
        editCardContent(nextCard, game.title, game.imageURL, game.genre);
        cardContainer.appendChild(nextCard);
    });
}

async function filterByLowestRating() {
  const favoritesContainer = document.getElementById("favorites-container"); // Define favoritesContainer
  favoritesContainer.innerHTML = ""; 

  let gameData = JSON.parse(sessionStorage.getItem("gameData")) || await loadCSV(); 

  // Filter only favorited games
  const favoriteGames = gameData.filter(game => game.favorited);

  favoriteGames.forEach(game => {
    let ratingString = game.rating.substring(8);
    game.ratingNumber = isNaN(parseInt(ratingString, 10)) ? 0 : parseInt(ratingString, 10);
  });
  // This will add a new property ratingNumber to each game object
  // This property will be used to sort the games by rating

  // Sort the games by ratingNumber in ascending order
  for (let i = 0; i < favoriteGames.length; i++) {
    let lowest = i;
    for (let j = i + 1; j < favoriteGames.length; j++) {
      if (favoriteGames[j].ratingNumber < favoriteGames[lowest].ratingNumber) {
        lowest = j;
      }
    }
    if (lowest !== i) {
      // Swap
      [favoriteGames[i], favoriteGames[lowest]] = [favoriteGames[lowest], favoriteGames[i]];
    }
  }

  const templateCard = document.querySelector(".card");

  favoriteGames.forEach(game => {
    const nextCard = templateCard.cloneNode(true); // Copy template card
    editCardContent(nextCard, game.title, game.imageURL, [`Rating: ${game.ratingNumber}`]); // Populate card
    nextCard.style.display = "block"; // Ensure the card is visible
    favoritesContainer.appendChild(nextCard); // Add to container
  });
}


async function filterByHighestRating() {
  const favoritesContainer = document.getElementById("favorites-container"); // Define favoritesContainer
  favoritesContainer.innerHTML = ""; 

  let gameData = JSON.parse(sessionStorage.getItem("gameData")) || await loadCSV(); 

  // Filter only favorited games
  const favoriteGames = gameData.filter(game => game.favorited);

  favoriteGames.forEach(game => {
    let ratingString = game.rating.substring(8);
    game.ratingNumber = isNaN(parseInt(ratingString, 10)) ? 0 : parseInt(ratingString, 10);
  });
  // This will add a new property ratingNumber to each game object
  // This property will be used to sort the games by rating

  // Sort the games by ratingNumber in decending order
  for (let i = 0; i < favoriteGames.length; i++) {
    let highest = i;
    for (let j = i + 1; j < favoriteGames.length; j++) {
      if (favoriteGames[j].ratingNumber > favoriteGames[highest].ratingNumber) {
        highest = j;
      }
    }
    if (highest !== i) {
      // Swap
      [favoriteGames[highest], favoriteGames[i]] = [favoriteGames[i], favoriteGames[highest]];
    }
  }

  const templateCard = document.querySelector(".card");

  favoriteGames.forEach(game => {
    const nextCard = templateCard.cloneNode(true); // Copy template card
    editCardContent(nextCard, game.title, game.imageURL, [`Rating: ${game.ratingNumber}`]); // Populate card
    nextCard.style.display = "block"; // Ensure the card is visible
    favoritesContainer.appendChild(nextCard); // Add to container
  });
}

async function filterByCost(newLowCost, newHighCost) {
  const wishlistContainer = document.getElementById("wishlists-container"); // Define wishlistContainer
  wishlistContainer.innerHTML = ""; 

  let gameData = JSON.parse(sessionStorage.getItem("gameData")) || await loadCSV(); 

  // Filter only wishlisted games within the cost range
  const filteredWishlistGames = gameData.filter(game => {
    if (game.wishlisted) {
      let costString = game.cost.substring(7); // Extract the cost value
      let costNumber = parseInt(costString, 10); // Convert cost to a number
      return costNumber >= parseInt(newLowCost, 10) && costNumber <= parseInt(newHighCost, 10);
    }
    return false;
  });

  const templateCard = document.querySelector(".card");

  // Display the filtered games
  filteredWishlistGames.forEach(game => {
    const nextCard = templateCard.cloneNode(true); // Copy template card
    editCardContent(nextCard, game.title, game.imageURL, [`Cost: $${game.cost}`]); // Populate card
    nextCard.style.display = "block"; // Ensure the card is visible
    wishlistContainer.appendChild(nextCard); // Add to container
  });
}