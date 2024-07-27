let fruits = [];
let maxFruits = 20;
let gameOver = false;
let gameStarted = false;
let score = 0;
let missedCount = 0;
const maxMissed = 5;
let handImage;
let osc;
let catchSound;
let startTime;

// メジャースケールの周波数（C4スケール）
const scale = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25];
let obstacles = []; // 障害物を格納する配列

function preload() {
  handImage = loadImage('hand.png'); // 手の画像ファイルを用意してください
  catchSound = loadSound('catch.mp3'); // catch.mp3をロード
}

function setup() {
  createCanvas(400, 600);
  frameRate(60);
  osc = new p5.Oscillator('sine');
  osc.start();
  osc.amp(0);
}

function draw() {
  background(220);
  
  if (!gameStarted) {
    // ゲーム開始前のメッセージ
    textSize(32);
    fill(0);
    textAlign(CENTER, CENTER);
    text('Click to Start', width / 2, height / 2);
    return; // ゲームが開始されるまで描画を停止
  }

  if (!gameOver) {
    if (frameCount % 30 === 0 && fruits.length < maxFruits) {
      fruits.push(createFruit());
    }

    // 障害物を描画
    fill(150);
    for (let obs of obstacles) {
      triangle(obs.x - obs.width / 2, obs.y + obs.height / 2,
               obs.x + obs.width / 2, obs.y + obs.height / 2,
               obs.x, obs.y - obs.height / 2);
    }

    for (let i = fruits.length - 1; i >= 0; i--) {
      let fruit = fruits[i];
      fruit.y += fruit.speed;
      fruit.speed += 0.2;

      // 障害物との衝突検出
      for (let obs of obstacles) {
        if (isCollidingWithObstacle(fruit, obs)) {
          fruit.speed *= -0.7; // 速度の反転と減衰
          fruit.x += random(-5, 5); // 横方向に少しずれる
          fruit.color = color(255, 165, 0); // 色を変更
        }
      }

      if (fruit.y + fruit.size / 2 >= height) {
        fruit.y = height - fruit.size / 2;
        fruit.speed *= -0.5;
        fruit.bounceCount++;

        let index = floor(map(fruit.x, 0, width, 0, scale.length));
        let freq = scale[index];
        playSound(freq);

        if (fruit.bounceCount == 2) {
          fruits.splice(i, 1);
          missedCount++;
        }
      }

      fill(fruit.color);
      ellipse(fruit.x, fruit.y, fruit.size);

      if (dist(mouseX, mouseY, fruit.x, fruit.y) < fruit.size / 2) {
        score += 1;
        fruits.splice(i, 1);
        catchSound.play();
      }
    }

    image(handImage, mouseX - handImage.width / 2, mouseY - handImage.height / 2);
    fill(0);
    textSize(16);
    textAlign(LEFT, TOP);
    text(`Score: ${score}`, 10, 10);
    text(`Missed: ${missedCount}`, 10, 30);

    if (missedCount >= maxMissed) {
      gameOver = true;
    }
  } else {
    textSize(32);
    fill(255, 0, 0);
    textAlign(CENTER, CENTER);
    text('Game Over', width / 2, height / 2);
    textSize(16);
    text(`Score: ${score}`, width / 2, height / 2 + 40);
    text(`Missed: ${missedCount}`, width / 2, height / 2 + 60);
    text('Click to Restart', width / 2, height / 2 + 80);
  }
}

function mousePressed() {
  if (!gameStarted) {
    gameStarted = true;
    startGame();
  } else if (gameOver) {
    startGame();
  }
}

function startGame() {
  fruits = [];
  gameOver = false;
  score = 0;
  missedCount = 0;
  startTime = millis(); // ゲーム開始時刻を記録

  // ランダムに障害物を配置
  obstacles = [];
  for (let i = 0; i < 2; i++) {
    obstacles.push({
      x: random(50, width - 50),
      y: random(height / 2, height - 100),
      width: 100,
      height: 50
    });
  }
}

function createFruit() {
  let elapsedTime = millis() - startTime;
  let maxWidth = map(elapsedTime, 0, 60000, 0, width); // 60秒で画面幅全体に
  maxWidth = constrain(maxWidth, 0, width);

  let x = random(width / 2 - maxWidth / 2, width / 2 + maxWidth / 2);
  let y = 0;
  return {
    x: x,
    y: y,
    size: 20,
    speed: 3,
    bounceCount: 0,
    color: color(255, 0, 0)
  };
}

function playSound(freq) {
  osc.freq(freq);
  osc.amp(0.5, 0.1);
  setTimeout(() => {
    osc.amp(0, 0.5);
  }, 100);
}

function isCollidingWithObstacle(fruit, obs) {
  // 障害物の三角形領域とフルーツの当たり判定
  let x1 = obs.x - obs.width / 2;
  let y1 = obs.y + obs.height / 2;
  let x2 = obs.x + obs.width / 2;
  let y2 = y1;
  let x3 = obs.x;
  let y3 = obs.y - obs.height / 2;

  // フルーツの位置
  let x = fruit.x;
  let y = fruit.y;

  // バリューの三角形判定アルゴリズム
  let alpha = ((y2 - y3)*(x - x3) + (x3 - x2)*(y - y3)) / ((y2 - y3)*(x1 - x3) + (x3 - x2)*(y1 - y3));
  let beta = ((y3 - y1)*(x - x3) + (x1 - x3)*(y - y3)) / ((y2 - y3)*(x1 - x3) + (x3 - x2)*(y1 - y3));
  let gamma = 1.0 - alpha - beta;

  return (alpha > 0 && beta > 0 && gamma > 0);
}
