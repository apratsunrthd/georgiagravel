const routes = [
  {
    title: "North Georgia Ridge Ramble",
    region: "north",
    regionLabel: "Blue Ridge Mountains",
    miles: 56,
    elevation: "5,900 ft",
    difficulty: "hard",
    badge: "Hard · 45c tires",
    description: "Chunky gravel and doubletrack above Blue Ridge with sweeping vistas of the Cohuttas. Steep grades, seasonal creeks, and minimal services between towns.",
    surfaces: ["Chunky gravel", "Forest roads", "Punchy climbs"],
    rwgps: "https://ridewithgps.com/routes/46328410",
    strava: "https://www.strava.com/routes/3179287193514702556",
    garmin: "https://connect.garmin.com/modern/course/194521717",
    photo: "https://maps.googleapis.com/maps/api/staticmap?center=Blue+Ridge,GA&zoom=11&size=800x500&maptype=satellite&markers=color:red|Blue+Ridge,GA"
  },
  {
    title: "Cohutta Foothills Figure 8",
    region: "north",
    regionLabel: "Ellijay · Rich Mountain",
    miles: 42,
    elevation: "3,800 ft",
    difficulty: "moderate",
    badge: "Moderate · 40c tires",
    description: "Shady creekside rolls, rhododendron tunnels, and graded forest roads around Rich Mountain. A great intro to North GA gravel with quick bailout options.",
    surfaces: ["Graded gravel", "Creek crossings", "Short climbs"],
    rwgps: "https://ridewithgps.com/routes/46328470",
    strava: "https://www.strava.com/routes/3179289124714745564",
    garmin: "https://connect.garmin.com/modern/course/194521819",
    photo: "https://maps.googleapis.com/maps/api/staticmap?center=Ellijay,GA&zoom=11&size=800x500&maptype=terrain&markers=color:red|Ellijay,GA"
  },
  {
    title: "Silver Comet Gravel Sidetracks",
    region: "central",
    regionLabel: "Smyrna · Paulding Forest",
    miles: 48,
    elevation: "1,650 ft",
    difficulty: "easy",
    badge: "Easy · 38c tires",
    description: "Paved Comet warm-up then detours onto hardpack clay and railbed gravel toward the Alabama line. Gentle grades, bathrooms on trailheads, and plenty of water stops.",
    surfaces: ["Hardpack", "Rail trail", "Clay"],
    rwgps: "https://ridewithgps.com/routes/46328502",
    strava: "https://www.strava.com/routes/3179290441834681630",
    garmin: "https://connect.garmin.com/modern/course/194521932",
    photo: "https://maps.googleapis.com/maps/api/staticmap?center=Rockmart,GA&zoom=11&size=800x500&maptype=roadmap&markers=color:red|Rockmart,GA"
  },
  {
    title: "Savannah River Sandroads",
    region: "coastal",
    regionLabel: "Augusta · Fort Gordon",
    miles: 58,
    elevation: "2,100 ft",
    difficulty: "hard",
    badge: "Hard · 45-50c tires",
    description: "Sand over clay with fast rollers south of Augusta. Expect deep patches after rain, sparse shade, and military training closures—check notices before riding.",
    surfaces: ["Sand", "Clay base", "Fast rollers"],
    rwgps: "https://ridewithgps.com/routes/46328555",
    strava: "https://www.strava.com/routes/3179292415789567792",
    garmin: "https://connect.garmin.com/modern/course/194522018",
    photo: "https://maps.googleapis.com/maps/api/staticmap?center=Augusta,GA&zoom=11&size=800x500&maptype=satellite&markers=color:red|Augusta,GA"
  },
  {
    title: "Pine Mountain Plunge",
    region: "central",
    regionLabel: "Columbus · Pine Mountain",
    miles: 38,
    elevation: "3,200 ft",
    difficulty: "moderate",
    badge: "Moderate · 40c tires",
    description: "Flowy ridgeline gravel and Civilian Conservation Corps-era forest roads above FDR State Park. One water stop mid-route; expect fast descents on loose corners.",
    surfaces: ["Ridgeline gravel", "Forest road", "Loose corners"],
    rwgps: "https://ridewithgps.com/routes/46328593",
    strava: "https://www.strava.com/routes/3179293957834376446",
    garmin: "https://connect.garmin.com/modern/course/194522115",
    photo: "https://maps.googleapis.com/maps/api/staticmap?center=Pine+Mountain,GA&zoom=12&size=800x500&maptype=terrain&markers=color:red|Pine+Mountain,GA"
  },
  {
    title: "Oconee Forest Rollers",
    region: "central",
    regionLabel: "Athens · Watkinsville",
    miles: 34,
    elevation: "1,900 ft",
    difficulty: "easy",
    badge: "Easy · 38c tires",
    description: "Quiet farm roads west of Athens with red clay hardpack, short rollers, and canopy sections through the Oconee Forest. Perfect for sunset spins.",
    surfaces: ["Red clay", "Farm roads", "Shaded lanes"],
    rwgps: "https://ridewithgps.com/routes/46328618",
    strava: "https://www.strava.com/routes/3179295113122683978",
    garmin: "https://connect.garmin.com/modern/course/194522206",
    photo: "https://maps.googleapis.com/maps/api/staticmap?center=Watkinsville,GA&zoom=12&size=800x500&maptype=roadmap&markers=color:red|Watkinsville,GA"
  }
];

const badgeColors = {
  easy: "#65d9ff",
  moderate: "#f4b400",
  hard: "#ff7b72",
};

const difficultyFilter = document.getElementById("difficultyFilter");
const regionFilter = document.getElementById("regionFilter");
const grid = document.getElementById("routeGrid");
const template = document.getElementById("routeCardTemplate");

difficultyFilter.addEventListener("change", render);
regionFilter.addEventListener("change", render);

render();

function render() {
  grid.innerHTML = "";
  const diff = difficultyFilter.value;
  const region = regionFilter.value;

  routes
    .filter((route) => (diff === "all" ? true : route.difficulty === diff))
    .filter((route) => (region === "all" ? true : route.region === region))
    .forEach((route) => grid.appendChild(createCard(route)));
}

function createCard(route) {
  const node = template.content.cloneNode(true);
  const img = node.querySelector(".route-card__image");
  img.src = route.photo;
  img.alt = `${route.title} Google Maps imagery`;

  node.querySelector("[data-badge]").textContent = route.badge;
  node.querySelector("[data-badge]").style.color = badgeColors[route.difficulty];
  node.querySelector("[data-title]").textContent = route.title;
  node.querySelector("[data-region]").textContent = route.regionLabel;
  node.querySelector("[data-description]").textContent = route.description;
  node.querySelector("[data-miles]").textContent = route.miles;
  node.querySelector("[data-elevation]").textContent = route.elevation;

  const surfaces = node.querySelector("[data-surfaces]");
  route.surfaces.forEach((surface) => {
    const li = document.createElement("li");
    li.textContent = surface;
    surfaces.appendChild(li);
  });

  node.querySelector("[data-rwgps]").href = route.rwgps;
  node.querySelector("[data-strava]").href = route.strava;
  node.querySelector("[data-garmin]").href = route.garmin;

  return node;
}
