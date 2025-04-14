

//ADD EXCEPTION CHECKS FOR ALL FETCH CASES TO ENSURE NO THROW OR ROLLBACK

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
    if (columns.length >= 5) {
      let title = columns[0].trim(); //.trim() just removes any spaces in front or after title
      let imageURL = columns[1].trim(); // especially here spaces could break my code
      let genre = columns[2].trim().split("|"); //split here allows me to add mult. genres without mult new col.
      let favorited = columns[3]?.trim().toLowerCase() === "true"; // checks if string matched and returns bool
      let wishlisted = columns[4]?.trim().toLowerCase() === "true";
      gameData.push({ title, imageURL, genre, favorited, wishlisted });
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
    editCardContent(nextCard, game.title, game.imageURL, game.genre); // Populate card
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
    editCardContent(nextCard, game.title, game.imageURL, game.genre); // Populate card
    nextCard.style.display = "block"; // Ensure the card is visible
    wishlistContainer.appendChild(nextCard); // Add to container
    }
  )

  console.log("Running showWishlistCards()");
  console.log("Wishlist Games:", wishlistGames);
}


function editCardContent(card, newTitle, newImageURL, newGenre) {
  card.style.display = "block";

  const cardHeader = card.querySelector("h2");
  cardHeader.textContent = newTitle;

  const cardImage = card.querySelector("img");
  cardImage.src = newImageURL;
  cardImage.alt = newTitle + " Poster";

  // Populate the details list dynamically
  const cardList = card.querySelector("ul");
  cardList.innerHTML = ""; // Clear existing list

  newGenre.forEach(detail => {
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

function selectGame(card) {
  selectedGameTitle = card.querySelector("h2").textContent; // Get game title from the card
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
