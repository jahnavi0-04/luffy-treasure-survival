const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const mobileControls = document.getElementById("mobileControls");
const joystick = document.getElementById("joystick");
const stick = document.getElementById("stick");
const attackBtn = document.getElementById("attackBtn");
const restartBtn = document.getElementById("restartBtn");
if (mobileControls) mobileControls.style.display = "flex";
if (joystick) joystick.style.display = "none";
if (attackBtn) attackBtn.style.display = "none";
if (restartBtn) restartBtn.style.display = "none";

let gameStarted = false;
let touchMoveX = 0;
let touchMoveY = 0;

const playerImage = new Image(); playerImage.src = "assets/luffy.png";
const enemyImage = new Image(); enemyImage.src = "assets/marine.png";
const zoroImage = new Image(); zoroImage.src = "assets/zoro.png";
const sanjiImage = new Image(); sanjiImage.src = "assets/sanji.png";
const chopperImage = new Image(); chopperImage.src = "assets/chopper.png";
const namiImage = new Image(); namiImage.src = "assets/nami.png";
const usoppImage = new Image(); usoppImage.src = "assets/usopp.png";
const bossImage = new Image(); bossImage.src = "assets/boss.png";
const mapImage = new Image(); mapImage.src = "assets/map.png";
const startScreenImage = new Image(); startScreenImage.src = "assets/startscreen.png";
const islandMap = new Image(); islandMap.src = "assets/island_map.png";
const meatImage = new Image(); meatImage.src = "assets/meat.png";
const chestImage = new Image(); chestImage.src = "assets/chest.png";
const pickupSound = new Audio("assets/sounds/pickup.mp3"); pickupSound.volume = 0.4;
const attackSound = new Audio("assets/sounds/attack.mp3"); attackSound.volume = 0.35;
const bossSpawnSound = new Audio("assets/sounds/boss_spawn.mp3"); bossSpawnSound.volume = 0.5
const bossDefeatSound = new Audio("assets/sounds/boss_defeat.mp3"); bossDefeatSound.volume = 0.85;;
const bgm = new Audio("assets/sounds/bgm.mp3"); bgm.loop = true; bgm.volume = 0.25;

const player = { x: canvas.width * 0.8, y: canvas.height * 0.75, size: 110, speed: 5, hp: 100 };

const zoro = { x: 120, y: 220, size: 100, speed: 3.5, attackRadius: 120, attackCooldown: 0 };
const sanji = { x: 280, y: 220, size: 92, speed: 4, attackRadius: 105, attackCooldown: 0 };
const chopper = { x: 200, y: 310, size: 75, speed: 3.2, healCooldown: 0 };
const nami = { x: 360, y: 300, size: 85, speed: 3.4, lightningCooldown: 0 };
const usopp = { x: 40, y: 300, size: 85, speed: 3.3, shootCooldown: 0 };

const enemies = [];
const gems = [];
const meats = [];
const chests = [];
const projectiles = [];
const hitEffects = [];
const chestEffects = [];
const slashEffects = [];
const kickEffects = [];
const healEffects = [];
const lightningEffects = [];
const shockwaves = [];
const keys = {};

const enemySpawnZones = [
  { x: 220, y: 180 },
  { x: 280, y: 220 },
  { x: 180, y: 260 }
];

const treasureSpawnZones = [
  { x: canvas.width * 0.5, y: canvas.height * 0.4 },
  { x: canvas.width * 0.5, y: canvas.height * 0.6 },
  { x: canvas.width * 0.8, y: canvas.height * 0.75 }
];

let boss = null;
let bossLevel = 1;
let nextBossScore = 250;
let maxEnemies = 1;

let gameOver = false;
let attacking = false;
let attackRadius = 95;
let score = 0;
let highScore = localStorage.getItem("luffyHighScore") || 0;
let screenShake = 0;

// Achievements
let chestsOpened = 0;
let meatCollected = 0;
let bossesDefeated = 0;

let mapsCollected = 0;
let gameStartTime = 0;
let longestRun = localStorage.getItem("longestRun") || 0;

const unlockedAchievements = [];
const achievementPopups = [];

const island = {
  x: 0,
  y: 0,
  width: canvas.width,
  height: canvas.height
};

function showGameControls() {
  if (joystick) joystick.style.display = "block";
  if (attackBtn) attackBtn.style.display = "block";
  if (restartBtn) restartBtn.style.display = "none";
}

function showGameOverControls() {
  if (joystick) joystick.style.display = "none";
  if (attackBtn) attackBtn.style.display = "none";
  if (restartBtn) restartBtn.style.display = "block";
}

function hideAllControls() {
  if (joystick) joystick.style.display = "none";
  if (attackBtn) attackBtn.style.display = "none";
  if (restartBtn) restartBtn.style.display = "none";
}

async function startGame() {
  if (!gameStarted && !gameOver) {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }

      if (screen.orientation && screen.orientation.lock) {
        await screen.orientation.lock("landscape");
      }
    } catch (err) {
      console.log("Fullscreen not supported:", err);
    }

    bgm.play().catch(() => {});

    gameStarted = true;
    gameStartTime = Date.now();
    showGameControls();
  }
}

window.addEventListener("click", startGame);
window.addEventListener("touchstart", startGame);

window.addEventListener("click", () => {
  if (gameOver) {
  }
});

if (restartBtn) {
  restartBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    restartGame();
    gameStarted = true;
    gameOver = false;

    bgm.play().catch(() => {});

    showGameControls();
  });
}

function playAttackSound() {
  const sound = new Audio("assets/sounds/attack.mp3");
  sound.volume = 0.35;
  sound.play();
}

function startAttack() {
  if (!gameOver && gameStarted) {
    playAttackSound();

    if (!attacking) {
      attacking = true;
      screenShake = 4;

      setTimeout(() => {
        attacking = false;
      }, 170);
    }
  }
}

window.addEventListener("keydown", (e) => {
  keys[e.key.toLowerCase()] = true;

  if (e.code === "Space") startAttack();
  if (e.key === "Enter") startGame();

  if (e.key.toLowerCase() === "r" && gameOver) {
    restartGame();
    gameStarted = true;
    showGameControls();
  }
});

window.addEventListener("keyup", (e) => {
  keys[e.key.toLowerCase()] = false;
});

if (attackBtn) {
  attackBtn.addEventListener("touchstart", (e) => {
    e.preventDefault();
    e.stopPropagation();
    startAttack();
  });

  attackBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    startAttack();
  });
}

if (joystick && stick) {
  joystick.addEventListener("touchmove", (e) => {
    e.preventDefault();

    const rect = joystick.getBoundingClientRect();
    const touch = e.touches[0];

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let dx = touch.clientX - centerX;
    let dy = touch.clientY - centerY;

    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxDistance = 45;

    if (distance > maxDistance) {
      dx = (dx / distance) * maxDistance;
      dy = (dy / distance) * maxDistance;
    }

    stick.style.left = 32 + dx + "px";
    stick.style.top = 32 + dy + "px";

    touchMoveX = dx / maxDistance;
    touchMoveY = dy / maxDistance;
  });

  joystick.addEventListener("touchend", () => {
    touchMoveX = 0;
    touchMoveY = 0;
    stick.style.left = "32px";
    stick.style.top = "32px";
  });
}

function keepInsideIsland(obj) {
  obj.x = Math.max(0, Math.min(canvas.width - obj.size, obj.x));
  obj.y = Math.max(0, Math.min(canvas.height - obj.size, obj.y));
}

function updateDifficulty() {
  maxEnemies = 1 + Math.floor(score / 300);
  maxEnemies = Math.min(maxEnemies, 5);

  while (enemies.length < maxEnemies) {
    spawnEnemy();
  }
}

function restartGame() {
  hideAllControls();

  player.x = canvas.width * 0.8;
  player.y = canvas.height * 0.75;
  player.hp = 100;

  zoro.x = 120; zoro.y = 220; zoro.attackCooldown = 0;
  sanji.x = 280; sanji.y = 220; sanji.attackCooldown = 0;
  chopper.x = 200; chopper.y = 310; chopper.healCooldown = 0;
  nami.x = 360; nami.y = 300; nami.lightningCooldown = 0;
  usopp.x = 40; usopp.y = 300; usopp.shootCooldown = 0;

  score = 0;
  bossLevel = 1;
  nextBossScore = 250;
  maxEnemies = 1;

  boss = null;
  gameOver = false;
  attacking = false;
  screenShake = 0;
  touchMoveX = 0;
  touchMoveY = 0;

  mapsCollected = 0;
  gameStartTime = Date.now();

  chestsOpened = 0;
  meatCollected = 0;
  bossesDefeated = 0;

  achievementPopups.length = 0;
  unlockedAchievements.length = 0;

  enemies.length = 0;
  gems.length = 0;
  meats.length = 0;
  chests.length = 0;
  projectiles.length = 0;
  hitEffects.length = 0;
  chestEffects.length = 0;
  slashEffects.length = 0;
  kickEffects.length = 0;
  healEffects.length = 0;
  lightningEffects.length = 0;
  shockwaves.length = 0;

  spawnEnemy();
  spawnGem();
}

function spawnEnemy() {
  const zone = enemySpawnZones[Math.floor(Math.random() * enemySpawnZones.length)];
  const enemySpeed = 1.2 + Math.min(score / 1000, 1.1);

  enemies.push({
    x: zone.x + Math.random() * 120 - 60,
    y: zone.y + Math.random() * 120 - 60,
    size: 88,
    speed: enemySpeed
  });
}

function spawnBoss() {
  const bossHp = 600 + bossLevel * 150;

  boss = {
    x: 250,
    y: 180,
    size: 240,
    speed: 1.4 + bossLevel * 0.05,
    hp: bossHp,
    maxHp: bossHp,
    attackCooldown: 180,
    chargeCooldown: 300,
    charging: false,
    chargeTimer: 0,
    chargeDX: 0,
    chargeDY: 0
  };

  bossSpawnSound.currentTime = 0;
  bossSpawnSound.play();

  bossLevel++;
}

function spawnGem() {
  const zone = treasureSpawnZones[Math.floor(Math.random() * treasureSpawnZones.length)];

  gems.push({
    x: zone.x + Math.random() * 140 - 70,
    y: zone.y + Math.random() * 140 - 70,
    size: 20
  });
}

function spawnMeat() {
  if (meats.length >= 1) return;

  const zone = treasureSpawnZones[Math.floor(Math.random() * treasureSpawnZones.length)];

  meats.push({
    x: zone.x + Math.random() * 120 - 60,
    y: zone.y + Math.random() * 120 - 60,
    size: 45
  });
}

function spawnChest() {
  if (chests.length >= 1) return;

  const zone = treasureSpawnZones[Math.floor(Math.random() * treasureSpawnZones.length)];

  chests.push({
    x: zone.x + Math.random() * 160 - 80,
    y: zone.y + Math.random() * 160 - 80,
    size: 55
  });
}

function defeatBoss() {

  bossesDefeated++;

  bossDefeatSound.currentTime = 0;
  bossDefeatSound.play();

  boss = null;
  score += 100 + bossLevel * 25;
  shockwaves.length = 0;
}

function movePlayer() {
  if (keys["w"]) player.y -= player.speed;
  if (keys["s"]) player.y += player.speed;
  if (keys["a"]) player.x -= player.speed;
  if (keys["d"]) player.x += player.speed;

  player.x += touchMoveX * player.speed;
  player.y += touchMoveY * player.speed;

  keepInsideIsland(player);
}

function moveHelper(helper, offsetX, offsetY) {
  const followX = player.x + offsetX;
  const followY = player.y + offsetY;

  const dx = followX - helper.x;
  const dy = followY - helper.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance > 8) {
    helper.x += (dx / distance) * helper.speed;
    helper.y += (dy / distance) * helper.speed;
  }

  keepInsideIsland(helper);
}

function moveZoro() {
  moveHelper(zoro, -90, 65);
  if (zoro.attackCooldown > 0) zoro.attackCooldown--;
  if (zoro.attackCooldown <= 0) zoroAutoAttack();
}

function moveSanji() {
  moveHelper(sanji, 90, 65);
  if (sanji.attackCooldown > 0) sanji.attackCooldown--;
  if (sanji.attackCooldown <= 0) sanjiAutoAttack();
}

function moveChopper() {
  moveHelper(chopper, 0, 130);

  if (chopper.healCooldown > 0) chopper.healCooldown--;

  if (chopper.healCooldown <= 0 && player.hp < 100) {
    player.hp = Math.min(100, player.hp + 2);

    healEffects.push({
      x: player.x + player.size / 2,
      y: player.y + player.size / 2,
      radius: 10,
      life: 25
    });

    chopper.healCooldown = 90;
  }
}

function moveNami() {
  moveHelper(nami, 150, 120);
  if (nami.lightningCooldown > 0) nami.lightningCooldown--;
  if (nami.lightningCooldown <= 0) namiLightningAttack();
}

function moveUsopp() {
  moveHelper(usopp, -160, 125);
  if (usopp.shootCooldown > 0) usopp.shootCooldown--;
  if (usopp.shootCooldown <= 0) usoppShoot();
}

function zoroAutoAttack() {
  if (boss) {
    const dx = boss.x - zoro.x;
    const dy = boss.y - zoro.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < zoro.attackRadius) {
      boss.hp -= 5;
      slashEffects.push({ x: boss.x, y: boss.y, life: 18, radius: 15 });
      zoro.attackCooldown = 60;
      screenShake = 4;

      if (boss.hp <= 0) defeatBoss();
      return;
    }
  }

  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    const dx = enemy.x - zoro.x;
    const dy = enemy.y - zoro.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < zoro.attackRadius) {
      enemies.splice(i, 1);
      score += 7;
      slashEffects.push({ x: enemy.x, y: enemy.y, life: 18, radius: 15 });
      zoro.attackCooldown = 55;
      screenShake = 4;
      break;
    }
  }
}

function sanjiAutoAttack() {
  if (boss) {
    const dx = boss.x - sanji.x;
    const dy = boss.y - sanji.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < sanji.attackRadius) {
      boss.hp -= 4;
      kickEffects.push({ x: boss.x, y: boss.y, life: 16, radius: 12 });
      sanji.attackCooldown = 42;
      screenShake = 5;

      if (boss.hp <= 0) defeatBoss();
      return;
    }
  }

  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    const dx = enemy.x - sanji.x;
    const dy = enemy.y - sanji.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < sanji.attackRadius) {
      enemies.splice(i, 1);
      score += 6;
      kickEffects.push({ x: enemy.x, y: enemy.y, life: 16, radius: 12 });
      sanji.attackCooldown = 42;
      screenShake = 5;
      break;
    }
  }
}

function namiLightningAttack() {
  let hitSomething = false;

  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    const dx = enemy.x - nami.x;
    const dy = enemy.y - nami.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 260) {
      lightningEffects.push({
        x1: nami.x + nami.size / 2,
        y1: nami.y + nami.size / 2,
        x2: enemy.x + enemy.size / 2,
        y2: enemy.y + enemy.size / 2,
        life: 18
      });

      enemies.splice(i, 1);
      score += 8;
      hitSomething = true;
    }
  }

  if (boss) {
    const dx = boss.x - nami.x;
    const dy = boss.y - nami.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 330) {
      boss.hp -= 10;

      lightningEffects.push({
        x1: nami.x + nami.size / 2,
        y1: nami.y + nami.size / 2,
        x2: boss.x,
        y2: boss.y,
        life: 20
      });

      hitSomething = true;

      if (boss.hp <= 0) defeatBoss();
    }
  }

  if (hitSomething) screenShake = 8;
  nami.lightningCooldown = 150;
}

function usoppShoot() {
  let target = null;
  let closestDistance = 9999;

  enemies.forEach(enemy => {
    const dx = enemy.x - usopp.x;
    const dy = enemy.y - usopp.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < closestDistance) {
      closestDistance = distance;
      target = enemy;
    }
  });

  if (boss) {
    const dx = boss.x - usopp.x;
    const dy = boss.y - usopp.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < closestDistance) {
      closestDistance = distance;
      target = boss;
    }
  }

  if (target && closestDistance < 520) {
    const tx = target.x + (target.size || 0) / 2;
    const ty = target.y + (target.size || 0) / 2;
    const sx = usopp.x + usopp.size / 2;
    const sy = usopp.y + usopp.size / 2;

    const dx = tx - sx;
    const dy = ty - sy;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      projectiles.push({
        x: sx,
        y: sy,
        vx: (dx / distance) * 9,
        vy: (dy / distance) * 9,
        size: 8,
        life: 90
      });
    }

    usopp.shootCooldown = 45;
  } else {
    usopp.shootCooldown = 30;
  }
}

function moveProjectiles() {
  for (let p = projectiles.length - 1; p >= 0; p--) {
    const projectile = projectiles[p];

    projectile.x += projectile.vx;
    projectile.y += projectile.vy;
    projectile.life--;

    let hit = false;

    for (let i = enemies.length - 1; i >= 0; i--) {
      const enemy = enemies[i];
      const dx = enemy.x + enemy.size / 2 - projectile.x;
      const dy = enemy.y + enemy.size / 2 - projectile.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < enemy.size / 2) {
        enemies.splice(i, 1);
        score += 6;
        hitEffects.push({ x: projectile.x, y: projectile.y, radius: 8, life: 15 });
        screenShake = 3;
        hit = true;
        break;
      }
    }

    if (!hit && boss) {
      const dx = boss.x - projectile.x;
      const dy = boss.y - projectile.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < boss.size / 2) {
        boss.hp -= 7;
        hitEffects.push({ x: projectile.x, y: projectile.y, radius: 10, life: 15 });
        screenShake = 4;
        hit = true;

        if (boss.hp <= 0) defeatBoss();
      }
    }

    if (
      hit ||
      projectile.life <= 0 ||
      projectile.x < 0 ||
      projectile.x > canvas.width ||
      projectile.y < 0 ||
      projectile.y > canvas.height
    ) {
      projectiles.splice(p, 1);
    }
  }
}

function bossSpecialAttack() {
  if (!boss) return;

  boss.attackCooldown--;

  if (boss.attackCooldown <= 0) {
    shockwaves.push({
      x: boss.x,
      y: boss.y,
      radius: 30,
      maxRadius: 220,
      life: 45,
      alreadyHit: false
    });

    screenShake = 12;
    boss.attackCooldown = Math.max(130, 230 - bossLevel * 8);
  }
}

function updateShockwaves() {
  for (let i = shockwaves.length - 1; i >= 0; i--) {
    const wave = shockwaves[i];

    wave.radius += 5;
    wave.life--;

    const dx = player.x + player.size / 2 - wave.x;
    const dy = player.y + player.size / 2 - wave.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (!wave.alreadyHit && distance < wave.radius && distance > wave.radius - 18) {
      player.hp -= 4;
      wave.alreadyHit = true;
      screenShake = 10;
    }

    if (wave.life <= 0 || wave.radius > wave.maxRadius) {
      shockwaves.splice(i, 1);
    }
  }
}

function bossChargeAttack() {
  if (!boss) return;

  boss.chargeCooldown--;

  if (!boss.charging && boss.chargeCooldown <= 0) {
    const dx = player.x - boss.x;
    const dy = player.y - boss.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      boss.chargeDX = dx / distance;
      boss.chargeDY = dy / distance;
    }

    boss.charging = true;
    boss.chargeTimer = 40;
    screenShake = 15;
  }

  if (boss.charging) {
    boss.x += boss.chargeDX * 12;
    boss.y += boss.chargeDY * 12;
    boss.chargeTimer--;

    const pdx = player.x + player.size / 2 - boss.x;
    const pdy = player.y + player.size / 2 - boss.y;
    const playerDistance = Math.sqrt(pdx * pdx + pdy * pdy);

    if (playerDistance < boss.size / 2) {
      player.hp -= 12;
      screenShake = 20;
      boss.charging = false;
      boss.chargeCooldown = 420;
    }

    if (boss.chargeTimer <= 0) {
      boss.charging = false;
      boss.chargeCooldown = 420;
    }
  }
}

function moveEnemies() {
  enemies.forEach((enemy, index) => {
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      enemy.x += (dx / distance) * enemy.speed;
      enemy.y += (dy / distance) * enemy.speed;
    }

    keepInsideIsland(enemy);

    if (distance < player.size) player.hp -= 0.2;

    if (attacking && distance < attackRadius) {
      enemies.splice(index, 1);
      score += 5;
      hitEffects.push({ x: enemy.x, y: enemy.y, radius: 10, life: 15 });
      screenShake = 7;
    }
  });
}

function moveBoss() {
  if (!boss || boss.charging) return;

  const dx = player.x - boss.x;
  const dy = player.y - boss.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance > 0) {
    boss.x += (dx / distance) * boss.speed;
    boss.y += (dy / distance) * boss.speed;
  }

  boss.x = Math.max(island.x + boss.size / 2, Math.min(island.x + island.width - boss.size / 2, boss.x));
  boss.y = Math.max(island.y + boss.size / 2, Math.min(island.y + island.height - boss.size / 2, boss.y));

  if (distance < boss.size / 2) player.hp -= 0.25;

  if (attacking && distance < attackRadius + 60) {
    boss.hp -= 6;
    hitEffects.push({ x: boss.x, y: boss.y, radius: 18, life: 20 });
    screenShake = 10;

    if (boss.hp <= 0) defeatBoss();
  }
}

function collectGems() {
  gems.forEach((gem, index) => {
    const dx = player.x - gem.x;
    const dy = player.y - gem.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < player.size) {
      gems.splice(index, 1);
      score += 15;
      mapsCollected++;
      pickupSound.currentTime = 0;
      pickupSound.play();
      spawnGem();
    }
  });
}

function collectMeat() {
  meats.forEach((meat, index) => {
    const dx = player.x - meat.x;
    const dy = player.y - meat.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < player.size) {
      meats.splice(index, 1);

      player.hp = Math.min(100, player.hp + 25);
      meatCollected++;
      pickupSound.currentTime = 0;
      pickupSound.play();
      score += 5;

      healEffects.push({
        x: player.x + player.size / 2,
        y: player.y + player.size / 2,
        radius: 10,
        life: 25
      });

      setTimeout(() => {
        if (!gameOver && gameStarted) spawnMeat();
      }, 7000);
    }
  });
}

function collectChest() {
  chests.forEach((chest, index) => {
    const dx = player.x - chest.x;
    const dy = player.y - chest.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < player.size) {
      chests.splice(index, 1);

      score += 75;
      chestsOpened++;
      pickupSound.currentTime = 0;
      pickupSound.play();

      for (let i = 0; i < 12; i++) {
  chestEffects.push({
    x: chest.x,
    y: chest.y,
    vx: (Math.random() - 0.5) * 8,
    vy: (Math.random() - 0.5) * 8,
    size: 8 + Math.random() * 6,
    life: 40
  });
}

      setTimeout(() => {
        if (!gameOver && gameStarted) spawnChest();
      }, 12000);
    }
  });
}

function unlockAchievement(name) {

  if (unlockedAchievements.includes(name)) return;

  unlockedAchievements.push(name);

  achievementPopups.push({
    text: "🏆 " + name,
    life: 180
  });

}

function checkAchievements() {

  if (score >= 50)
    unlockAchievement("First Voyage");

  if (score >= 500)
    unlockAchievement("Legend of the Seas");

  if (score >= 1000)
    unlockAchievement("Pirate King");

  if (chestsOpened >= 5)
    unlockAchievement("Treasure Hunter");

  if (meatCollected >= 10)
    unlockAchievement("Meat Lover");

  if (bossesDefeated >= 1)
    unlockAchievement("Boss Slayer");

}

function drawMap() {
  ctx.drawImage(islandMap, 0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawStartScreen() {
  ctx.drawImage(startScreenImage, 0, 0, canvas.width, canvas.height);
}

function drawPlayer() {
  ctx.drawImage(playerImage, player.x, player.y, player.size, player.size);

  if (attacking) {
    ctx.beginPath();
    ctx.arc(player.x + player.size / 2, player.y + player.size / 2, attackRadius, 0, Math.PI * 2);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 6;
    ctx.stroke();
  }
}

function drawZoro() { ctx.drawImage(zoroImage, zoro.x, zoro.y, zoro.size, zoro.size); }
function drawSanji() { ctx.drawImage(sanjiImage, sanji.x, sanji.y, sanji.size, sanji.size); }
function drawChopper() { ctx.drawImage(chopperImage, chopper.x, chopper.y, chopper.size, chopper.size); }
function drawNami() { ctx.drawImage(namiImage, nami.x, nami.y, nami.size, nami.size); }
function drawUsopp() { ctx.drawImage(usoppImage, usopp.x, usopp.y, usopp.size, usopp.size); }

function drawEnemies() {
  enemies.forEach(enemy => {
    ctx.drawImage(enemyImage, enemy.x, enemy.y, enemy.size, enemy.size);
  });
}

function drawBoss() {
  if (!boss) return;

  ctx.beginPath();
  ctx.arc(boss.x, boss.y, boss.size * 0.65, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,0,0,0.15)";
  ctx.fill();

  if (boss.charging) {
    ctx.beginPath();
    ctx.arc(boss.x, boss.y, boss.size * 0.8, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,0,0,0.35)";
    ctx.fill();
  }

  ctx.drawImage(
    bossImage,
    boss.x - boss.size / 2,
    boss.y - boss.size / 2,
    boss.size,
    boss.size
  );

  ctx.fillStyle = "red";
  ctx.fillRect(canvas.width / 2 - 150, 20, 300, 20);

  ctx.fillStyle = "lime";
  ctx.fillRect(canvas.width / 2 - 150, 20, (boss.hp / boss.maxHp) * 300, 20);

  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  ctx.strokeRect(canvas.width / 2 - 150, 20, 300, 20);

  ctx.fillStyle = "white";
  ctx.font = "24px Arial";
  ctx.fillText("MARINE ADMIRAL", canvas.width / 2 - 90, 18);
}

function drawGems() {
  gems.forEach(gem => {
    ctx.beginPath();
    ctx.arc(gem.x, gem.y, 28, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 230, 80, 0.45)";
    ctx.fill();

    ctx.drawImage(mapImage, gem.x - 20, gem.y - 20, 45, 45);
  });
}

function drawMeats() {
  meats.forEach(meat => {
    ctx.beginPath();
    ctx.arc(meat.x, meat.y, 30, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 90, 60, 0.35)";
    ctx.fill();

    ctx.drawImage(meatImage, meat.x - 22, meat.y - 22, 45, 45);
  });
}

function drawChests() {
  chests.forEach(chest => {
    ctx.beginPath();
    ctx.arc(chest.x, chest.y, 38, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,215,0,0.35)";
    ctx.fill();

    ctx.drawImage(chestImage, chest.x - 30, chest.y - 30, 60, 60);
  });
}

function drawProjectiles() {
  projectiles.forEach(projectile => {
    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.arc(projectile.x, projectile.y, projectile.size, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "orange";
    ctx.lineWidth = 2;
    ctx.stroke();
  });
}

function drawShockwaves() {
  shockwaves.forEach(wave => {
    ctx.beginPath();
    ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255, 40, 40, 0.85)";
    ctx.lineWidth = 8;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(wave.x, wave.y, wave.radius + 12, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255, 160, 80, 0.35)";
    ctx.lineWidth = 4;
    ctx.stroke();
  });
}

function drawEffects() {
  hitEffects.forEach((effect, index) => {
    ctx.beginPath();
    ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 4;
    ctx.stroke();

    effect.radius += 2;
    effect.life--;

    if (effect.life <= 0) hitEffects.splice(index, 1);
  });

  slashEffects.forEach((slash, index) => {
    ctx.beginPath();
    ctx.arc(slash.x, slash.y, slash.radius, -0.7, 0.9);
    ctx.strokeStyle = "lime";
    ctx.lineWidth = 8;
    ctx.stroke();

    slash.radius += 4;
    slash.life--;

    if (slash.life <= 0) slashEffects.splice(index, 1);
  });

  kickEffects.forEach((kick, index) => {
    ctx.beginPath();
    ctx.arc(kick.x, kick.y, kick.radius, 0.2, Math.PI * 1.4);
    ctx.strokeStyle = "orange";
    ctx.lineWidth = 9;
    ctx.stroke();

    kick.radius += 5;
    kick.life--;

    if (kick.life <= 0) kickEffects.splice(index, 1);
  });

  healEffects.forEach((heal, index) => {
    ctx.beginPath();
    ctx.arc(heal.x, heal.y, heal.radius, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(80,255,120,0.9)";
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = "rgba(80,255,120,0.8)";
    ctx.font = "22px Arial";
    ctx.fillText("+HP", heal.x - 20, heal.y - heal.radius);

    heal.radius += 2;
    heal.life--;

    if (heal.life <= 0) healEffects.splice(index, 1);
  });

  lightningEffects.forEach((bolt, index) => {
    ctx.strokeStyle = "rgba(80,220,255,0.95)";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(bolt.x1, bolt.y1);

    const midX = (bolt.x1 + bolt.x2) / 2 + (Math.random() - 0.5) * 40;
    const midY = (bolt.y1 + bolt.y2) / 2 + (Math.random() - 0.5) * 40;

    ctx.lineTo(midX, midY);
    ctx.lineTo(bolt.x2, bolt.y2);
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,120,0.9)";
    ctx.beginPath();
    ctx.arc(bolt.x2, bolt.y2, 18, 0, Math.PI * 2);
    ctx.fill();

    bolt.life--;

    if (bolt.life <= 0) lightningEffects.splice(index, 1);
  });
}

function drawChestEffects() {

  chestEffects.forEach((spark, index) => {

    spark.x += spark.vx;
    spark.y += spark.vy;

    spark.life--;

    ctx.fillStyle = "gold";

    ctx.beginPath();
    ctx.arc(
      spark.x,
      spark.y,
      spark.size,
      0,
      Math.PI * 2
    );
    ctx.fill();

    spark.size *= 0.96;

    if (spark.life <= 0) {
      chestEffects.splice(index, 1);
    }

  });

}

function drawAchievementPopups() {
  achievementPopups.forEach((popup, index) => {
    ctx.fillStyle = "#ffd700";
    ctx.font = "32px Arial";
    ctx.fillText(popup.text, canvas.width / 2 - 120, 120);

    popup.life--;

    if (popup.life <= 0) {
      achievementPopups.splice(index, 1);
    }
  });
}


function drawUI() {
  // Background panel
  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.fillRect(10, 10, 260, 130);

  // HP
  ctx.fillStyle = "white";
  ctx.font = "22px Arial";
  ctx.fillText("❤️ HP: " + Math.floor(player.hp), 20, 40);

  // Score
  ctx.fillText("🗺️ Score: " + score, 20, 70);

  // High Score
  ctx.fillText("🏆 Best: " + highScore, 20, 100);

  // Boss warning
  if (!boss) {
    ctx.fillStyle = "#ffd700";
    ctx.fillText("👑 Boss: " + nextBossScore, 20, 130);
  }
}

function updateHighScore() {
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("luffyHighScore", highScore);
  }
}

function drawGameOver() {
  updateHighScore();

  ctx.fillStyle = "white";
  ctx.font = "60px Arial";
  ctx.fillText("GAME OVER", canvas.width / 2 - 180, canvas.height / 2 - 100);

  ctx.font = "30px Arial";
  ctx.fillText("Final Score: " + score, canvas.width / 2 - 100, canvas.height / 2 - 30);
  ctx.fillText("High Score: " + highScore, canvas.width / 2 - 100, canvas.height / 2 + 10);

  showGameOverControls();
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const shakeX = screenShake > 0 ? (Math.random() - 0.5) * screenShake : 0;
  const shakeY = screenShake > 0 ? (Math.random() - 0.5) * screenShake : 0;

  ctx.save();
  ctx.translate(shakeX, shakeY);

  if (!gameStarted) {
    drawStartScreen();
    ctx.restore();
    requestAnimationFrame(gameLoop);
    return;
  }

  if (!gameOver) {
    if (score >= nextBossScore && !boss) {
      spawnBoss();
      nextBossScore += 300 + (bossLevel * 150);
    }

    updateDifficulty();

    drawMap();

    movePlayer();
    moveZoro();
    moveSanji();
    moveChopper();
    moveNami();
    moveUsopp();
    moveProjectiles();
    moveEnemies();
    moveBoss();
    bossChargeAttack();
    bossSpecialAttack();
    updateShockwaves();
    collectGems();
    collectMeat();
    collectChest();

    drawPlayer();
    drawZoro();
    drawSanji();
    drawChopper();
    drawNami();
    drawUsopp();
    drawEnemies();
    drawBoss();
    drawGems();
    drawMeats();
    drawChests();
    drawProjectiles();
    drawShockwaves();
    drawEffects();
    drawChestEffects();

    if (player.hp <= 0) {
      const runTime = Math.floor((Date.now() - gameStartTime) / 1000);

      if (runTime > longestRun) {
        longestRun = runTime;
        localStorage.setItem("longestRun", longestRun);
      }

      gameOver = true;
      showGameOverControls();
    }

    if (screenShake > 0) screenShake *= 0.85;

    ctx.restore();
    drawUI();

    checkAchievements();
    drawAchievementPopups();

  } else {
    drawMap();
    ctx.restore();
    drawGameOver();
  }

  requestAnimationFrame(gameLoop);
}

spawnEnemy();
spawnGem();
spawnMeat();
spawnChest();
gameLoop();
