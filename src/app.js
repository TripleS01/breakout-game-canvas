
const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById('canvas'));

/** @type {CanvasRenderingContext2D} */
const ctx = canvas.getContext('2d');
ctx.font = '24px Ariel';

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

const STEP_SIZE = 20;
const RATE = 1000 / STEP_SIZE;

const BRICK_WIDTH = 50;
const BRICK_HEIGHT = 15;

const PAD_WIDTH = 100;
const PAD_HEIGHT = 20;

const MOUSE = {
    x: 0,
    y: 0,
};

const SPEED = 300;
const BALL = {
    x: 400,
    y: 300,
    velocity: getVector(SPEED, Math.PI / 4)
};
const BALL_SIZE = 10;
const LIMITS = {
    left: 0 + BALL_SIZE,
    right: WIDTH - BALL_SIZE,
    top: 0 + BALL_SIZE,
    bot: HEIGHT - 50 - BALL_SIZE, //it's 600 - the postion of the pad left(550)
};

const BRICKS = [];
const colors = [
    'black',
    '#9FE2BF',
    'green',
];

canvas.addEventListener('mousemove', onMouseMove);

function getVector(SPEED, direction) {
    return {
        x: Math.cos(direction) * SPEED,
        y: Math.sin(direction) * SPEED,
    }
}

function onMouseMove(event) {
    MOUSE.x = event.offsetX;
    MOUSE.y = event.offsetY;
}

function drawBrick(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, BRICK_WIDTH, BRICK_HEIGHT);
}

function drawPad(x) {
    ctx.fillStyle = 'purple';
    ctx.fillRect(x - PAD_WIDTH / 2, 550, PAD_WIDTH, PAD_HEIGHT);
}

function drawBall(x, y) {
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.arc(x, y, BALL_SIZE, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
}


function clear() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
}

function renderGame() {
    clear();
    for (let segment of BRICKS) {
        if (segment.alive == false) {
            continue;
        }
        drawBrick(segment.x, segment.y, colors[segment.hits]);
    }
    drawPad(MOUSE.x);
    drawBall(BALL.x, BALL.y);
}

function tick() {
    BALL.x += BALL.velocity.x / RATE;
    BALL.y += BALL.velocity.y / RATE;

    if ((BALL.x > LIMITS.right && BALL.velocity.x > 0) || (BALL.x < LIMITS.left && BALL.velocity.x < 0)) {
        BALL.velocity.x *= -1;
    }

    if (BALL.y < LIMITS.top && BALL.velocity.y < 0) {
        BALL.velocity.y *= -1;
    }

    if ((BALL.y > LIMITS.bot
        && BALL.velocity.y > 0)
        && (BALL.y <= LIMITS.bot + BALL_SIZE)
        && (BALL.x >= MOUSE.x - PAD_WIDTH / 2 - 5)
        && (BALL.x <= MOUSE.x + PAD_WIDTH / 2 + 5)
    ) {
        BALL.velocity.y *= -1;

        const x = BALL.velocity.x + 100 * (BALL.x - MOUSE.x) / PAD_WIDTH;
        const y = Math.sqrt(SPEED ** 2 - x ** 2);
        BALL.velocity.x = x;
        BALL.velocity.y = -y;
    }

    for (let segment of BRICKS) {
        if (segment.alive == false) {
            continue;
        }
        checkBrick(segment);
    }
}
function checkBrick(segment) {
    if ((BALL.x + BALL_SIZE > segment.x)
        && (BALL.x - BALL_SIZE < segment.x + BRICK_WIDTH)
        && (BALL.y + BALL_SIZE > segment.y)
        && (BALL.y - BALL_SIZE < segment.y + BRICK_HEIGHT)) {
        segment.hits--;
        if (segment.hits == 0) {
            segment.alive = false;
        }

        if (BALL.x < segment.x && BALL.velocity.x > 0) {
            BALL.velocity.x *= -1;
        } else if (BALL.x > segment.x + BRICK_WIDTH && BALL.velocity.x < 0) {
            BALL.velocity.x *= -1;
        }

        if (BALL.y < segment.y && BALL.velocity.y > 0) {
            BALL.velocity.y *= -1;
        } else if (BALL.y > segment.y + BRICK_HEIGHT && BALL.velocity.y < 0) {
            BALL.velocity.y *= -1;
        }
    }
}

let lastTime = 0;
let delta = 0;

function main(time) {
    delta += time - lastTime;
    lastTime = time;

    if (delta > 1000) {
        delta = 20;
    }
    while (delta >= 20) {
        delta -= 20;
        tick();
    }
    renderGame();

    ctx.fillText(`${time.toFixed(0)} : ${lastTime.toFixed(0)} : ${delta.toFixed(0)}`, 10, 25);
    requestAnimationFrame(main);
}

function start() {
    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 13; col++) {
            BRICKS.push({
                x: col * BRICK_WIDTH * 1.2 + 15,
                y: row * BRICK_HEIGHT * 2 + 100,
                alive: true,
                hits: 2,
            })
        }
    }

    requestAnimationFrame(main);
}

start();