console.log("Helloooo Mayu");
const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

context.fillStyle = "black";
context.fillRect(0, 0, canvas.width, canvas.height);

class Player {
  // Initializing the player with a position and velocity and rotation
  constructor({ position, velocity }) {
    this.position = position; // {X, Y}
    this.velocity = velocity; // {X, Y}
    this.rotation = 0;
  }

  draw() {
    context.save();

    // To change the direction or position of the player's and rotate canvas like wise
    context.translate(this.position.x, this.position.y);
    context.rotate(this.rotation);
    context.translate(-this.position.x, -this.position.y);

    // To draw red circle at the center of player
    context.beginPath();
    context.arc(this.position.x, this.position.y, 4, 0, Math.PI * 2, false);
    context.fillStyle = "red";
    context.fill();
    context.closePath;

    // To draw player shape triangle
    // context.fillStyle = 'red'
    // context.fillRect(this.position.x, this.position.y, 100, 100)
    context.beginPath();
    context.moveTo(this.position.x, this.position.y - 15);
    context.lineTo(this.position.x - 15, this.position.y + 20);
    context.lineTo(this.position.x + 15, this.position.y + 20);
    context.closePath();

    // To add white stroke to player
    context.strokeStyle = "white";
    context.stroke();
    context.restore(); // restore back to origin
  }

  update() {
    this.draw();

    // Updating the position of the player based on its velocity
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }

  getVertices() {
    //Calculating sine and cosine of the player's rotation angle
    const cos = Math.cos(this.rotation);
    const sin = Math.sin(this.rotation);

    // Return an array of vertex coordinates for the player's shape
    return [
      {
        x: this.position.x + cos * 30 - sin * 0,
        y: this.position.y + sin * 30 + cos * 0,
      },
      {
        x: this.position.x + cos * -10 - sin * 10,
        y: this.position.y + sin * -10 + cos * 10,
      },
      {
        x: this.position.x + cos * -10 - sin * -10,
        y: this.position.y + sin * -10 + cos * -10,
      },
    ];
  }
}

class Projectile {
  // Initializing the projectile with position, velocity and radius
  constructor({ position, velocity }) {
    this.position = position; // {X, Y}
    this.velocity = velocity; // {X, Y}
    this.radius = 4;
  }

  // To draw a circle
  draw() {
    context.beginPath();

    // To draw a projectile to shoot asteroids
    context.arc(
      this.position.x,
      this.position.y,
      this.radius,
      0,
      Math.PI * 2,
      false
    );
    context.closePath();

    context.fillStyle = "white";
    context.fill();
  }

  update() {
    this.draw();

    // Updating the position of the projectile based on its velocity
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

class Asteroid {
  // Initalizing the asteroid with position, velocity and radius
  constructor({ position, velocity, radius }) {
    this.position = position; // {X, Y}
    this.velocity = velocity; // {X, Y}
    this.radius = radius;
  }

  draw() {
    context.beginPath();

    // To draw asteroid whic will be circle with different size
    context.arc(
      this.position.x,
      this.position.y,
      this.radius,
      0,
      Math.PI * 2,
      false
    );
    context.closePath();

    context.strokeStyle = "white";
    context.stroke();
  }

  update() {
    this.draw();

    // Updating the position of the asteroid based on its velocity
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

// This will create new player on the canvas
const player = new Player({
  position: { x: canvas.width / 2, y: canvas.height / 2 },
  velocity: { x: 0, y: 0 },
});

const keys = {
  l: {
    pressed: false,
  },
  r: {
    pressed: false,
  },
  s: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
};

// Defined const values here
const SPEED = 3;
const ROTATIONAL_SPEED = 0.05;
const FRICTION = 0.95;

const projectiles = [];
const asteroids = [];

// This will create and add asteroids in the array at some intervals
const intervalId = window.setInterval(() => {
  const index = Math.floor(Math.random() * 4);
  let x, y;
  let vx, vy;
  let radius = 50 * Math.random() + 10;

  switch (index) {
    case 0: // left side of the screen
      x = 0 - radius;
      y = Math.random() * canvas.height;
      vx = 1;
      vy = 0;
      break;
    case 1: // bottom side of the screen
      x = Math.random() * canvas.width;
      y = canvas.height + radius;
      vx = 0;
      vy = -1;
      break;
    case 2: // right side of the screen
      x = canvas.width + radius;
      y = Math.random() * canvas.height;
      vx = -1;
      vy = 0;
      break;
    case 3: // top side of the screen
      x = Math.random() * canvas.width;
      y = 0 - radius;
      vx = 0;
      vy = 1;
      break;
  }

  asteroids.push(
    new Asteroid({
      position: {
        x: x,
        y: y,
      },
      velocity: {
        x: vx,
        y: vy,
      },
      radius,
    })
  );

  console.log(asteroids);
}, 3000);

// To check the collision between two asteroids
function circleCollision(circle1, circle2) {
  const xDifference = circle2.position.x - circle1.position.x;
  const yDifference = circle2.position.y - circle1.position.y;

  const distance = Math.sqrt(
    xDifference * xDifference + yDifference * yDifference
  );

  if (distance <= circle1.radius + circle2.radius) {
    return true;
  }

  return false;
}

// Checking if a point x and y its on the line segment
function isPointOnLineSegment(x, y, start, end) {
  return (
    x >= Math.min(start.x, end.x) &&
    x <= Math.max(start.x, end.x) &&
    y >= Math.min(start.y, end.y) &&
    y <= Math.max(start.y, end.y)
  );
}

// To check if asteroid is colliding with a player
function circleTriangleCollision(circle, triangle) {
  // check if the circle is colliding with any of the triangle's edges
  for (let i = 0; i < 3; i++) {
    let start = triangle[i];
    let end = triangle[(i + 1) % 3];

    let dx = end.x - start.x;
    let dy = end.y - start.y;
    let length = Math.sqrt(dx * dx + dy * dy);

    let dot =
      ((circle.position.x - start.x) * dx +
        (circle.position.y - start.y) * dy) /
      Math.pow(length, 2);

    let closestX = start.x + dot * dx;
    let closestY = start.y + dot * dy;

    if (!isPointOnLineSegment(closestX, closestY, start, end)) {
      closestX = closestX < start.x ? start.x : end.x;
      closestY = closestY < start.y ? start.y : end.y;
    }

    dx = closestX - circle.position.x;
    dy = closestY - circle.position.y;

    let distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= circle.radius) {
      return true;
    }
  }
}

function animate() {
  const animationId = window.requestAnimationFrame(animate);

  // Clear the canvas
  context.fillStyle = "black";
  context.fillRect(0, 0, canvas.width, canvas.height);

  player.update();

  // Updating and managing projectile and state
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const projectile = projectiles[i];
    projectile.update();

    // Garbage collection for projectiles
    if (
      projectile.position.x + projectile.radius < 0 ||
      projectile.position.x - projectile.radius > canvas.width ||
      projectile.position.y - projectile.radius > canvas.height ||
      projectile.position.y + projectile.radius < 0
    ) {
      projectiles.splice(i, 1);
    }
  }

  // Updating and managing asteroid
  for (let i = asteroids.length - 1; i >= 0; i--) {
    const asteroid = asteroids[i];
    asteroid.update();

    // Checking for collision between asteroid and player
    if (circleTriangleCollision(asteroid, player.getVertices())) {
      console.log("Game over");
      window.cancelAnimationFrame(animationId);
      clearInterval(intervalId);
      return; // Will exit the animation loop
    }

    // Garbage collection for asteroids
    if (
      asteroid.position.x + asteroid.radius < 0 ||
      asteroid.position.x - asteroid.radius > canvas.width ||
      asteroid.position.y - asteroid.radius > canvas.height ||
      asteroid.position.y + asteroid.radius < 0
    ) {
      asteroids.splice(i, 1);
    }

    // Checking for collision between asteroids and projectiles
    for (let j = projectiles.length - 1; j >= 0; j--) {
      const projectile = projectiles[j];

      if (circleCollision(asteroid, projectile)) {
        asteroids.splice(i, 1);
        projectiles.splice(j, 1);
        break;
      }
    }
  }

  // Will handle the player position
  if (keys.s.pressed) {
    player.velocity.y = -Math.cos(player.rotation) * SPEED;
    player.velocity.x = Math.sin(player.rotation) * SPEED;
  } else if (!keys.s.pressed) {
    player.velocity.x *= FRICTION;
    player.velocity.y *= FRICTION;
  }

  // Will handle the player rotation
  if (keys.r.pressed) player.rotation += ROTATIONAL_SPEED;
  else if (keys.l.pressed) player.rotation -= ROTATIONAL_SPEED;
}

animate();

// writing event listener to move player left right, straigth and shoot the projectile
window.addEventListener("keydown", (event) => {
  switch (event.code) {
    case "ArrowUp":
      keys.s.pressed = true;
      break;
    case "ArrowDown":
      keys.d.pressed = true;
      break;
    case "ArrowLeft":
      keys.l.pressed = true;
      break;
    case "ArrowRight":
      keys.r.pressed = true;
      break;
    case "Space":
      projectiles.push(
        new Projectile({
          position: {
            x: player.position.x + Math.sin(player.rotation) * 15,
            y: player.position.y - Math.cos(player.rotation) * 15,
          },
          velocity: {
            x: Math.sin(player.rotation) * 5,
            y: -Math.cos(player.rotation) * 5,
          },
        })
      );
      break;
  }
});

window.addEventListener("keyup", (event) => {
  switch (event.code) {
    case "ArrowUp":
      keys.s.pressed = false;
      break;
    case "ArrowDown":
      keys.d.pressed = false;
      break;
    case "ArrowLeft":
      keys.l.pressed = false;
      break;
    case "ArrowRight":
      keys.r.pressed = false;
      break;
  }
});
