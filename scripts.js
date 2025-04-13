/**
 * Data Catalog Project Starter Code - SEA Stage 2
 *
 * This file is where you should be doing most of your work. You should
 * also make changes to the HTML and CSS files, but we want you to prioritize
 * demonstrating your understanding of data structures, and you'll do that
 * with the JavaScript code you write in this file.
 *
 * The comments in this file are only to help you learn how the starter code
 * works. The instructions for the project are in the README. That said, here
 * are the three things you should do first to learn about the starter code:
 * - 1 - Change something small in index.html or style.css, then reload your
 *    browser and make sure you can see that change.
 * - 2 - On your browser, right click anywhere on the page and select
 *    "Inspect" to open the browser developer tools. Then, go to the "console"
 *    tab in the new window that opened up. This console is where you will see
 *    JavaScript errors and logs, which is extremely helpful for debugging.
 *    (These instructions assume you're using Chrome, opening developer tools
 *    may be different on other browsers. We suggest using Chrome.)
 * - 3 - Add another string to the titles array a few lines down. Reload your
 *    browser and observe what happens. You should see a fourth "card" appear
 *    with the string you added to the array, but a broken image.
 *
 */

// you should use more than just an array of strings to store it all.

//This function now draws out the already paired titles and images im a
//much faster and practical way using a csv file
async function loadCSV() {
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
    if (columns.length >= 3) {
      let title = columns[0].trim(); //.trim() just removes any spaces in front or after title
      let imageURL = columns[1].trim(); // especially here spaces could break my code
      let genre = columns[2].trim().split("|"); //split here allows me to add mult. genres without mult new col.
      gameData.push({ title, imageURL, genre });
    }
  });

  console.log("Parsed Game Data:", gameData); // Debugging output
  return gameData;
}


async function showCards() {
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
document.addEventListener("DOMContentLoaded", showCards);


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


function removeLastCard() {
  titles.pop(); // Remove last item in titles array
  showCards(); // Call showCards again to refresh
}
