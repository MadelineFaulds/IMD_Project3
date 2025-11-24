// Testing github ...

// Canvas setup
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

// Set canvas to full screen
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Start screen elements
const startScreen = document.getElementById("startScreen");
const startButton = document.getElementById("startButton");
const crabOptions = document.querySelectorAll(".crab-option");
let selectedCrabSrc = null;
let gameStarted = false;

// Game dimensions
const W = canvas.width;
const H = canvas.height;

// Resize handler
window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  location.reload(); // Reload to reset game with new dimensions
});

// Mouse click handling for victory buttons
canvas.addEventListener('click', (e) => {
  if (!won) return;
  
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  
  // Button dimensions
  const buttonWidth = 500;
  const buttonHeight = 60;
  const button1Y = H / 2 + 20;
  const button2Y = H / 2 + 100;
  const buttonX = W / 2 - buttonWidth / 2;
  
  // Check if clicked on button 1
  if (mouseX >= buttonX && mouseX <= buttonX + buttonWidth &&
      mouseY >= button1Y && mouseY <= button1Y + buttonHeight) {
    won = false; // Continue playing
  }
  // Check if clicked on button 2
  else if (mouseX >= buttonX && mouseX <= buttonX + buttonWidth &&
           mouseY >= button2Y && mouseY <= button2Y + buttonHeight) {
    gameStarted = false;
    startScreen.classList.remove("hidden");
    restart();
  }
});

// Water area
const water_W = W * 0.6;
const water_X = (W - water_W) / 2;

// Crab object
const crab = {
  x: 0,
  y: 0,
  w: 38,
  h: 64
};



// Input handling
const keys = {};
window.addEventListener("keydown", (e) => {
  keys[e.key] = true;
  if ((e.key === "r" || e.key === "R") && dead) restart();
  if (e.key === "h" || e.key === "H") {
    gameStarted = false;
    startScreen.classList.remove("hidden");
    restart();
  }
  // Victory options
  if (won) {
    if (e.key === "1") {
      // Continue playing
      won = false;
    } else if (e.key === "2") {
      // Go home to crab family
      gameStarted = false;
      startScreen.classList.remove("hidden");
      restart();
    }
  }
});
window.addEventListener("keyup", (e) => { 
  keys[e.key] = false; 
});

// Game state
let level = 1;
let speed = 220;
let offset = 0;
const steerSpeed = 260;
let foodItems = [];
let trashItems = [];
let dead = false;
let won = false;
let score = 0;
const MAX_FOOD = 4;
const MAX_TRASH = 4;
let glowTimer = 0;
const GLOW_DURATION = 0.3;
let glowColor = "gold";
let totalTrashConsumed = 0;
let totalFoodConsumed = 0;
let foodPoints = 0;
let trashPoints = 0;
let trash5Consumed = 0;
let deathAnimationTimer = 0;
const DEATH_ANIMATION_DURATION = 0.8;
let deathRotation = 0;

// Food types with different point values for level one and level two...
const FOOD_TYPES_L1 = [
  { name: "food1", img: "food1.png", points: 1, weight: 100, w: 40, h: 35 },
  //{ name: "food2", img: "food2.png", points: 2, weight30, w: 40, h: 55 }
  //{ name: "food3", img: "food3.png", points: 5, weight: 15, w: 100, h: 100 },
  //{ name: "food4", img: "food4.png", points: 3, weight: 5, w: 70, h: 40 }
];

const FOOD_TYPES_L2 = [
  { name: "food1", img: "food1.png", points: 2, weight: 50, w: 40, h: 35 },
  { name: "food2", img: "food2.png", points: 4, weight: 50, w: 40, h: 55 }
  //{ name: "food3", img: "food3.png", points: 15, weight: 25, w: 100, h: 100 },
  //{ name: "food4", img: "food4.png", points: 10, weight: 25, w: 70, h: 40 }
];

const FOOD_TYPES_L3 = [
  { name: "food1", img: "food1.png", points: 2, weight: 33, w: 40, h: 35 },
  { name: "food2", img: "food2.png", points: 4, weight: 33, w: 40, h: 55 },
  //{ name: "food3", img: "food3.png", points: 15, weight: 25, w: 100, h: 100 },
  { name: "food4", img: "food4.png", points: 10, weight: 33, w: 70, h: 40 }
];

const FOOD_TYPES_L4 = [
  { name: "food1", img: "food1.png", points: 2, weight: 25, w: 40, h: 35 },
  { name: "food2", img: "food2.png", points: 4, weight: 25, w: 40, h: 55 },
  { name: "food3", img: "food3.png", points: 15, weight: 25, w: 100, h: 100 },
  { name: "food4", img: "food4.png", points: 10, weight: 25, w: 70, h: 40 }
];

// Load all food images
const foodImages = {};

FOOD_TYPES_L1.forEach(type => {
  const img = new Image();
  img.src = type.img;
  foodImages[type.name] = img;
});

FOOD_TYPES_L2.forEach(type => {
  const img = new Image();
  img.src = type.img;
  foodImages[type.name] = img;
});

FOOD_TYPES_L3.forEach(type => {
  const img = new Image();
  img.src = type.img;
  foodImages[type.name] = img;
});

FOOD_TYPES_L4.forEach(type => {
  const img = new Image();
  img.src = type.img;
  foodImages[type.name] = img;
});

// ocean bottom
const sand = new Image();
sand.src = "sand.png";  

// corral 
const corral1 = new Image();
corral1.src = "corral1.png"; 

const corral2 = new Image();
corral2.src = "corral2.png"; 



// Trash types with different point penalties
const TRASH_TYPES = [
  { name: "trash1", img: "trash1.png", points: -1, weight: 50, w: 30, h: 40 },
  { name: "trash2", img: "trash2.png", points: -2, weight: 30, w: 70, h: 70 },
  { name: "trash3", img: "trash3.png", points: -3, weight: 15, w: 50, h: 60 },
  { name: "trash4", img: "trash4.png", points: -5, weight: 5, w: 200, h: 200 }
];

// Load all trash images
const trashImages = {};
TRASH_TYPES.forEach(type => {
  const img = new Image();
  img.src = type.img;
  trashImages[type.name] = img;
});

// Utility functions
function rand(min, max) { 
  return Math.random() * (max - min) + min; 
}

function clamp(v, a, b) { 
  return Math.max(a, Math.min(b, v)); 
}

function overlap(a, b) {
  // Reduce crab hitbox by 20% on all sides for more precise collision
  const crabPadding = 0.2;
  const crabX = a.x + (a.w * crabPadding);
  const crabY = a.y + (a.h * crabPadding);
  const crabW = a.w * (1 - crabPadding * 2);
  const crabH = a.h * (1 - crabPadding * 2);
  
  return crabX < b.x + b.w &&
         crabX + crabW > b.x &&
         crabY < b.y + b.h &&
         crabY + crabH > b.y;
}

function weightedRandomSelect(types) {
  const totalWeight = types.reduce((sum, type) => sum + type.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (let type of types) {
    random -= type.weight;
    if (random <= 0) {
      return type;
    }
  }
  return types[types.length - 1];
}

// Spawn food
function spawnFood() {

  //different foods for level one and two
  let pool;
  if (level === 1){
        pool = FOOD_TYPES_L1;
  }
  else if (level === 2){ 
        pool = FOOD_TYPES_L2;
  }
  else if (level === 3){ 
        pool = FOOD_TYPES_L3;
  }
  else{ 
        pool = FOOD_TYPES_L4;
  }

  const foodType = weightedRandomSelect(pool);
  const xMin = water_X;
  const xMax = water_X + water_W - foodType.w;
  const newFood = {
    x: rand(xMin, xMax),
    y: -80,
    w: foodType.w,
    h: foodType.h,
    vy: rand(140, 220) + score * 6,
    type: foodType,
    points: foodType.points
  };
  foodItems.push(newFood);
}

// Spawn trash
function spawnTrash() {
  const trashType = weightedRandomSelect(TRASH_TYPES);
  const xMin = water_X;
  const xMax = water_X + water_W - trashType.w;
  const newTrash = {
    x: rand(xMin, xMax),
    y: -80,
    w: trashType.w,
    h: trashType.h,
    vy: rand(140, 220) + score * 6,
    type: trashType,
    points: trashType.points
  };
  trashItems.push(newTrash);
}

// Crab sprite
const CRAB_SCALE_CAP = 1.7;
const crabImg = new Image();

function loadCrabSprite(src) {
  crabImg.src = src;
}

crabImg.onload = () => {
  const maxW = water_W * 0.8;
  const maxH = H * 0.35;
  const fitW = maxW / crabImg.width;
  const fitH = maxH / crabImg.height;
  const scale = Math.min(CRAB_SCALE_CAP, fitW, fitH) * 0.85;

  crab.w = Math.max(10, Math.floor(crabImg.width * scale));
  crab.h = Math.max(10, Math.floor(crabImg.height * scale));
  crab.x = W / 2 - crab.w / 2;
  crab.y = H - crab.h - 40;
};

crabImg.addEventListener('error', () => console.error('Failed to load crab image'));


// Draw function
function draw() {

  // requirement - change backgroupd color - attemtp to change to dark blue at 51 pts...
  //  0 - 50 = level 1
  //   51+   = level 2

   if (level === 2) {
      ctx.fillStyle = "darkblue";
      ctx.fillRect(0, 0, W, H);

   }
   else {

      // Blue water background (full screen)
       ctx.fillStyle = "lightblue";
       ctx.fillRect(0, 0, W, H);
   }

  // ocean bottom = sand plus corral for level 2

  // 5% of screen height
  const sandHeight = H * 0.05; 
  if (sand.complete && sand.naturalWidth > 0) {
    ctx.drawImage(
      sand,
      0, 0, sand.width, sand.height, 
      0, H - sandHeight,                   
      W, sandHeight                        
    );
  }

  // Draw corral for level 2....
  if (level >= 3) {


  //first corral on left -> need to remove white space    
  const corral1Height = H * 0.2; 
  const corral1Width = corral1Height * (corral1.width / corral1.height);

  if (corral1.complete && corral1.naturalWidth > 0) {
    ctx.drawImage(
      corral1,
      0, 0, corral1.width, corral1.height, 
      W * 0.15,
      H - sandHeight - corral1Height,                 
      corral1Width,
      corral1Height                  
    );
  }

  // second corral on the right - need to remove white space
   const corral2Height = H * 0.2; 
   const corral2Width = corral2Height * (corral2.width / corral2.height);
   const margin = 20;

    if (corral2.complete && corral2.naturalWidth > 0) {
    ctx.drawImage(
      corral2,
      0, 0, corral2.width, corral2.height, 
       W - corral2Width - margin, 
       H - corral2Height,              
      corral2Width,
      corral2Height                  
    );
  }
}


  // Draw trash items
  trashItems.forEach(trash => {
    const trashImg = trashImages[trash.type.name];
    if (trashImg && trashImg.complete && trashImg.naturalWidth > 0) {
      ctx.drawImage(trashImg, 0, 0, trashImg.width, trashImg.height, trash.x, trash.y, trash.w, trash.h);
    } else {
      ctx.fillStyle = trash.type.color;
      ctx.fillRect(trash.x, trash.y, trash.w, trash.h);
    }
    
    // Draw point penalty on trash
    ctx.fillStyle = "#fff";
    ctx.font = "lexend";
    ctx.textAlign = "center";
    ctx.fillText(`${trash.points}`, trash.x + trash.w / 2, trash.y + trash.h / 2 + 6);
  });

  // Draw food items
  foodItems.forEach(food => {
    const foodImg = foodImages[food.type.name];
    if (foodImg && foodImg.complete && foodImg.naturalWidth > 0) {
      ctx.drawImage(foodImg, 0, 0, foodImg.width, foodImg.height, food.x, food.y, food.w, food.h);
    } else {
      ctx.fillStyle = food.type.color;
      ctx.fillRect(food.x, food.y, food.w, food.h);
    }
    
    // Draw point value on food
    ctx.fillStyle = "#fff";
    ctx.font = "bold 16px monospace";
    ctx.textAlign = "center";
    ctx.fillText(`+${food.points}`, food.x + food.w / 2, food.y + food.h / 2 + 6);
  });

  // Draw crab
  ctx.textAlign = "left";
  if (crabImg.complete && crabImg.naturalWidth > 0) {
    ctx.save();
    
    // Apply death animation rotation
    if (deathAnimationTimer > 0) {
      // Center the rotation on the crab
      const centerX = crab.x + crab.w / 2;
      const centerY = crab.y + crab.h / 2;
      ctx.translate(centerX, centerY);
      ctx.rotate(deathRotation);
      ctx.translate(-centerX, -centerY);
    }
    
    ctx.drawImage(crabImg, 0, 0, crabImg.width, crabImg.height, crab.x, crab.y, crab.w, crab.h);
    
    ctx.restore();
  } else {
    ctx.fillStyle = "red";
    ctx.fillRect(crab.x, crab.y, crab.w, crab.h);
  }

  // Score and instructions at top
  ctx.fillStyle = "#fff";
  ctx.font = "24px 'Lexend', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`Score: ${score}/150`, W / 2, 35);
  
  // Trash consumed bar (red)
  const barWidth = 300;
  const barHeight = 20;
  const barX = W / 2 - barWidth / 2;
  const barY = 45;
  
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(barX, barY, barWidth, barHeight);
  ctx.fillStyle = "#ef4444";
  const trashProgress = Math.min(trashPoints / 50, 1) * barWidth;
  ctx.fillRect(barX, barY, trashProgress, barHeight);
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;
  ctx.strokeRect(barX, barY, barWidth, barHeight);
  ctx.fillStyle = "#fff";
  ctx.font = "10px 'Lexend', sans-serif";
  ctx.fillText(`Trash Consumed: ${trashPoints}/50`, W / 2, barY + 14);
  
  ctx.font = "12px 'Lexend', sans-serif";
  ctx.fillText("It's okay to be shellfish, catch yourself some food, and avoid ocean pollution!", W / 2, 80);
  ctx.font = "10px 'Lexend', sans-serif";
  ctx.fillText("press H to go home!", W / 2, 95);
  ctx.textAlign = "left";

  // Game over overlay
  if (dead && deathAnimationTimer <= 0) {
    // Semi-transparent full screen overlay
    ctx.fillStyle = "rgba(122, 18, 18, 0.7)";
    ctx.fillRect(0, 0, W, H);
    
    // Death message
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 36px 'Lexend', sans-serif";
    ctx.fillText("You consumed too much ocean pollution!", W / 2, H / 2 - 30);
    ctx.font = "24px 'Lexend', sans-serif";
    ctx.fillText("Press R to Respawn.", W / 2, H / 2 + 30);
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
  }
  
  // Victory overlay
  if (won) {
    // Semi-transparent full screen overlay
    ctx.fillStyle = "rgba(0, 100, 150, 0.85)";
    ctx.fillRect(0, 0, W, H);
    
    // Victory message
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 42px 'Lexend', sans-serif";
    ctx.fillText("Congratulations!", W / 2, H / 2 - 100);
    ctx.font = "28px 'Lexend', sans-serif";
    ctx.fillText("You have collected plenty of food.", W / 2, H / 2 - 40);
    
    // Button styling
    const buttonWidth = 500;
    const buttonHeight = 60;
    const button1Y = H / 2 + 20;
    const button2Y = H / 2 + 100;
    const buttonX = W / 2 - buttonWidth / 2;
    
    // Button 1: Continue playing
    ctx.fillStyle = "#4a9eff";
    ctx.fillRect(buttonX, button1Y, buttonWidth, buttonHeight);
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;
    ctx.strokeRect(buttonX, button1Y, buttonWidth, buttonHeight);
    ctx.fillStyle = "#fff";
    ctx.font = "22px 'Lexend', sans-serif";
    ctx.fillText("Be Shellfish and collect more food", W / 2, button1Y + buttonHeight / 2);
    
    // Button 2: Go home
    ctx.fillStyle = "#2a7acc";
    ctx.fillRect(buttonX, button2Y, buttonWidth, buttonHeight);
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;
    ctx.strokeRect(buttonX, button2Y, buttonWidth, buttonHeight);
    ctx.fillStyle = "#fff";
    ctx.fillText("Go rest with your Crab Family", W / 2, button2Y + buttonHeight / 2);
    
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
  }
}

// Update function
function update(dt) {
  // Update death animation
  if (deathAnimationTimer > 0) {
    deathAnimationTimer -= dt;
    deathRotation += dt * 8; // Spin speed
    return; // Don't update game during death animation
  }
  
  if (dead || won) return;

  offset += speed * dt;
  
  // Update glow timer
  if (glowTimer > 0) {
    glowTimer -= dt;
    if (glowTimer < 0) glowTimer = 0;
  }

  // Movement - crab gets faster as score increases!!
  const left = keys["ArrowLeft"];
  const right = keys["ArrowRight"];
  const dir = (right ? 1 : 0) - (left ? 1 : 0);
  let currentSteerSpeed = steerSpeed + score * 3;
  crab.x += dir * currentSteerSpeed * dt;
  crab.x = clamp(crab.x, 0, W - crab.w);

  // Spawn food
  if (foodItems.length < MAX_FOOD && Math.random() < 0.01) {
    spawnFood();
  }

  // spawn trash
  if (trashItems.length < MAX_TRASH && Math.random() < 0.01) {
    spawnTrash();
  }

  // Update and check food items
  for (let i = foodItems.length - 1; i >= 0; i--) {
    const food = foodItems[i];
    food.y += food.vy * dt;

    // Check collision with crab (gain points)
    if (overlap(crab, food)) {
      score += food.points;
      totalFoodConsumed++;
      foodPoints += food.points;
      speed += 10;
      glowTimer = GLOW_DURATION;
      glowColor = "gold";
      foodItems.splice(i, 1);
      
      // Check victory condition
      if (score >= 150 && !won) {
        won = true;
      }
      continue;
    }

    // Remove if off screen
    if (food.y > H + 40) {
      foodItems.splice(i, 1);
    }
  }

  // Update and check trash items
  for (let i = trashItems.length - 1; i >= 0; i--) {
    const trash = trashItems[i];
    trash.y += trash.vy * dt;

    // Check collision with crab (lose points)
    if (overlap(crab, trash)) {
      score += trash.points;
      if (score < 0) score = 0;
      glowTimer = GLOW_DURATION;
      glowColor = "red";
      
      // Track trash consumption and points
      totalTrashConsumed++;
      trashPoints += Math.abs(trash.points);
      if (trash.points === -5) {
        trash5Consumed++;
      }
      
      // Check death condition - 50 trash points
      if (trashPoints >= 50) {
        dead = true;
        deathAnimationTimer = DEATH_ANIMATION_DURATION;
        deathRotation = 0;
      }
      
      trashItems.splice(i, 1);
      continue;
    }

    // Remove if off screen
    if (trash.y > H + 40) {
      trashItems.splice(i, 1);
    }
  }

  //set the game level according to score...
  if (score > 10 && level === 1) {
  level = 2;
  }
  else if (score > 20 && level === 2) {
  level = 3;
  }
  else if (score > 50 && level === 3) {
  level = 4;
  }

}

// Restart function
function restart() {
  dead = false;
  won = false;
  score = 0;
  speed = 220;
  offset = 0;
  crab.x = W / 2 - crab.w / 2;
  crab.y = H - crab.h - 40;
  foodItems = [];
  trashItems = [];
  totalTrashConsumed = 0;
  totalFoodConsumed = 0;
  foodPoints = 0;
  trashPoints = 0;
  trash5Consumed = 0;
  deathAnimationTimer = 0;
  deathRotation = 0;
  glowTimer = 0;
}

// Game loop
let last = performance.now();
function loop(now) {
  if (!gameStarted) return;
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

// Crab selection logic
crabOptions.forEach(option => {
  option.addEventListener('click', () => {
    crabOptions.forEach(opt => opt.classList.remove('selected'));
    option.classList.add('selected');
    selectedCrabSrc = option.getAttribute('data-crab');
    startButton.disabled = false;
  });
});

// Start button logic
startButton.addEventListener('click', () => {
  if (selectedCrabSrc) {
    startScreen.classList.add('hidden');
    gameStarted = true;
    loadCrabSprite(selectedCrabSrc);
    last = performance.now();
    requestAnimationFrame(loop);
  }
});

// Initialize game loop (but don't start until button pressed)
requestAnimationFrame(loop);
