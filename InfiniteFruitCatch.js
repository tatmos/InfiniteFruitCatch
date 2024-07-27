let fruits = [];
let maxFruits = 20;
let gameOver = false;
let score = 0;
let missedCount = 0;
const maxMissed = 5;
let handImage;
let osc;
let catchSound;

// メジャースケールの周波数（C4スケール）
const scale = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25];

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
  
  if (!gameOver) {
    if (frameCount % 30 === 0 && fruits.length < maxFruits) {
      fruits.push(createFruit(random(width), 0));
    }

    for (let i = fruits.length - 1; i >= 0; i--) {
      let fruit = fruits[i];
      fruit.y += fruit.speed;
      fruit.speed += 0.2;

      if (fruit.y + fruit.size / 2 >= height) {
        fruit.y = height - fruit.size / 2;
        fruit.speed *= -0.5;
        fruit.bounceCount++;

        let index = floor(map(fruit.x, 0, width, 0, scale.length));
        let freq = scale[index];
        playSound(freq);

        if (fruit.bounceCount == 1) {
          fruit.color = color(255, 165, 0);
        } else if (fruit.bounceCount == 2) {
          fruits.splice(i, 1);
          missedCount++;
        }
      }

      fill(fruit.color);
      ellipse(fruit.x, fruit.y, fruit.size);

      if (dist(mouseX, mouseY, fruit.x, fruit.y) < fruit.size / 2) {
        score += 1;
        fruits.splice(i, 1);
        catchSound.play(); // キャッチ音を再生
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
  if (gameOver) {
    fruits = [];
    gameOver = false;
    score = 0;
    missedCount = 0;
  }
}

function createFruit(x, y) {
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
