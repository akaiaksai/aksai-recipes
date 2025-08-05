const app = document.getElementById("app");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const homeBtn = document.getElementById("homeBtn");
const favBtn = document.getElementById("favBtn");

let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

searchBtn.addEventListener("click", () => {
  const query = searchInput.value.trim();
  if (query) {
    loadSearch(query);
  }
});

homeBtn.addEventListener("click", () => {
  app.innerHTML = `<p>Enter a recipe name and click Search.</p>`;
});

favBtn.addEventListener("click", () => {
  loadFavorites();
});

async function loadSearch(query) {
  const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`);
  const data = await res.json();
  if (data.meals) {
    renderMeals(data.meals);
  } else {
    app.innerHTML = `<p>No recipes found for "${query}".</p>`;
  }
}

function renderMeals(meals) {
  app.innerHTML = "";
  meals.forEach(meal => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
      <h3>${meal.strMeal}</h3>
      <button onclick="showDetails('${meal.idMeal}')">View</button>
    `;
    app.appendChild(card);
  });
}

async function showDetails(id) {
  const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
  const data = await res.json();
  const meal = data.meals[0];

  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ing) ingredients.push(`${ing} - ${measure}`);
  }

  app.innerHTML = `
    <div class="card" style="width: 100%; max-width: 500px;">
      <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
      <h2>${meal.strMeal}</h2>
      <h4>Ingredients:</h4>
      <ul>${ingredients.map(i => `<li>${i}</li>`).join('')}</ul>
      <p>${meal.strInstructions.slice(0, 300)}...</p>
      <button onclick="addFavorite('${meal.idMeal}')">Add to Favorites</button>
    </div>
  `;
}

function addFavorite(id) {
  if (!favorites.includes(id)) {
    favorites.push(id);
    localStorage.setItem("favorites", JSON.stringify(favorites));
    alert("Added to favorites");
  } else {
    alert("Already in favorites");
  }
}

async function loadFavorites() {
  app.innerHTML = "";
  if (favorites.length === 0) {
    app.innerHTML = `<p>No favorites yet.</p>`;
    return;
  }

  for (const id of favorites) {
    const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
    const data = await res.json();
    const meal = data.meals[0];

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
      <h3>${meal.strMeal}</h3>
      <button onclick="showDetails('${meal.idMeal}')">View</button>
      <button onclick="removeFavorite('${meal.idMeal}')">Remove</button>
    `;
    app.appendChild(card);
  }
}

function removeFavorite(id) {
  favorites = favorites.filter(favId => favId !== id);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  loadFavorites();
}
