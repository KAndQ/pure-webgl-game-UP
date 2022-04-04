const SHUTTLE_MOVE_SPEED = 300.0;
const SHUTTLE_SPEED_UP_SCALE = 3.0;
const SHUTTLE_FIXED_Y = 64;
const BACKGROUND_MOVE_SCALE = 0.5;
const DISTANCE = 358000;
const ACCELERATED = 7;
const INIT_UP_SPEED = 200.0;
const MAX_UP_SPEED = 800;
const MAX_Y_INTERVAL = 500;

const Game = {
    __now__: 0,
    __elapse__: 0,
    __sprites__: [],
    __pause__: false,
    __winSize__: undefined,
};

let shuttle = undefined;
let shuttleLeftMoveFlag = false;
let shuttleRightMoveFlag = false;
let shuttleSpeedUpFlag = false;
let backgrounds = [];
let bricksCache = [];
let runningBricks = [];
let upSpeed = INIT_UP_SPEED;
let isFailed = false;
let isSuccess = false;
let currentDistance = 0;
let yInterval = INIT_UP_SPEED;

function pushBrickToRunning(brick) {
    if (Math.random() < 0.5) {
        brick.position.x = 0;
    } else {
        brick.position.x = Game.__winSize__.width - brick.size.w;
    }

    if (runningBricks.length === 0) {
        brick.position.y = Game.__winSize__.height;
    } else {
        const lastBrick = runningBricks[runningBricks.length - 1];
        brick.position.y = lastBrick.position.y + yInterval;
    }

    brick.isHide = false;
    runningBricks.push(brick);
}

function randomFindBrick() {
    while (true) {
        const brick = bricksCache[Math.floor(Math.random() * bricksCache.length)];
        if (-1 === runningBricks.findIndex((v) => v === brick)) {
            return brick;
        }
    }
}

Game.update = function (time) {
    Game.__elapse__ = (time - Game.__now__) * 0.001;
    Game.__now__ = time;

    currentDistance += upSpeed * Game.__elapse__;

    upSpeed += ACCELERATED * Game.__elapse__;
    if (upSpeed > MAX_UP_SPEED) {
        upSpeed = MAX_UP_SPEED;
    }

    yInterval += ACCELERATED * Game.__elapse__;
    if (yInterval > MAX_Y_INTERVAL) {
        yInterval = MAX_Y_INTERVAL;
    }

    Game.updateBackground();
    Game.updateBricks();
    Game.updateShuttle();
    Game.checkCollision();
    Game.checkSuccess();

    if (isFailed) {
        Game.fail();
    } else if (isSuccess) {
        Game.success();
    }
};

Game.draw = function () {
    const gl = GameGlobal.getGL();

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    Game.__sprites__.forEach(function (v) {
        GameSprite.draw(v);
    });
};

Game.mainLoop = function (time) {
    if (!Game.__pause__) {
        Game.update(time);
    }
    Game.draw();
    requestAnimationFrame(Game.mainLoop);
};

Game.launch = function () {
    console.log("UP Coming...");

    const gl = GameGlobal.getGL();
    Game.__winSize__ = { width: gl.canvas.width, height: gl.canvas.height };

    document.addEventListener("keydown", function (e) {
        if (Game.__pause__) {
            return;
        }

        switch (e.key) {
            case "ArrowLeft":
                if (!shuttleLeftMoveFlag) {
                    shuttleLeftMoveFlag = true;
                    shuttleRightMoveFlag = false;
                }
                break;
            case "ArrowRight":
                if (!shuttleRightMoveFlag) {
                    shuttleLeftMoveFlag = false;
                    shuttleRightMoveFlag = true;
                }
                break;
            case "Shift":
                if (!shuttleSpeedUpFlag) {
                    GameAudio.playKeyDown();
                    shuttleSpeedUpFlag = true;
                }
                break;
        }
    });

    document.addEventListener("keyup", function (e) {
        if (Game.__pause__) {
            return;
        }

        switch (e.key) {
            case "ArrowLeft":
                shuttleLeftMoveFlag = false;
                break;
            case "ArrowRight":
                shuttleRightMoveFlag = false;
                break;
            case "Shift":
                shuttleSpeedUpFlag = false;
                break;
        }
    });

    GameSprite.init();

    for (let i = 1; i <= 2; ++i) {
        const background = GameSprite.createBackground(GameRes.IMG_TILE_BACKGROUND);
        backgrounds.push(background);
        Game.__sprites__.push(background);
    }

    shuttle = GameSprite.createSpaceshipSprite(GameRes.IMG_SHUTTLE_2);
    Game.__sprites__.push(shuttle);

    for (let i = 1; i <= 40; ++i) {
        let sizeType = 0;
        if (i <= 10) {
            sizeType = 0;
        } else if (i <= 20) {
            sizeType = 1;
        } else if (i <= 30) {
            sizeType = 2;
        } else if (i <= 40) {
            sizeType = 3;
        }
        const brick = GameSprite.createBrickSprite(GameRes.IMG_BRICK_1, sizeType);
        brick.isHide = true;
        bricksCache.push(brick);
        Game.__sprites__.push(brick);
    }

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    Game.start();

    Game.__now__ = 0;
    Game.mainLoop(0);

    setInterval(() => {
        console.log(`==>> yInterval = ${yInterval}`);
        console.log(`==>> upSpeed = ${upSpeed}`);
        console.log(`==>> currentDistance = ${currentDistance}`);
    }, 5000);
};

Game.start = function () {
    Game.__pause__ = false;

    // background
    backgrounds.forEach((background, index) => {
        if (index === 1) {
            background.position.x = Game.__winSize__.width * 0.5;
            background.position.y = background.size.h * 0.5;
        } else {
            background.position.x = Game.__winSize__.width * 0.5;
            background.position.y = background.size.h * 1.5;
        }
    });

    // shuttle
    shuttle.position.x = Game.__winSize__.width * 0.5;
    shuttle.position.y = SHUTTLE_FIXED_Y;

    // bricks
    bricksCache.forEach((brick) => {
        brick.isHide = true;
    });
    runningBricks = [];
    for (let ii = 1; ii <= 3; ++ii) {
        const brick = randomFindBrick();
        pushBrickToRunning(brick);
    }

    yInterval = INIT_UP_SPEED;
    isFailed = false;
    isSuccess = false;
    currentDistance = 0;
    upSpeed = INIT_UP_SPEED;
    shuttleLeftMoveFlag = false;
    shuttleRightMoveFlag = false;
    shuttleSpeedUpFlag = false;
};

Game.fail = function () {};

Game.success = function () {};

Game.updateBackground = function () {
    backgrounds.forEach((v) => {
        v.position.y -= upSpeed * Game.__elapse__ * BACKGROUND_MOVE_SCALE;
    });

    backgrounds.forEach((v, index) => {
        if (v.position.y + v.size.h * 0.5 < 0) {
            const another = backgrounds[(index + 1) % backgrounds.length];
            v.position.y = another.position.y + another.size.h;
        }
    });
};

Game.updateBricks = function () {
    const removeBricks = [];
    runningBricks.forEach((brick) => {
        brick.position.y -= upSpeed * Game.__elapse__;

        if (brick.position.y < -brick.size.h) {
            removeBricks.push(brick);
        }
    });

    removeBricks.forEach((brick) => {
        const index = runningBricks.findIndex((v) => v === brick);
        runningBricks.splice(index, 1);
        brick.isHide = true;

        const newBrick = randomFindBrick();
        pushBrickToRunning(newBrick);
    });
};

Game.updateShuttle = function () {
    let shuttleVel = 0;

    if (shuttleLeftMoveFlag) {
        shuttleVel = -SHUTTLE_MOVE_SPEED;
    }

    if (shuttleRightMoveFlag) {
        shuttleVel = SHUTTLE_MOVE_SPEED;
    }

    if (shuttleSpeedUpFlag) {
        shuttleVel *= SHUTTLE_SPEED_UP_SCALE;
    }

    shuttle.position.x += shuttleVel * Game.__elapse__;

    if (shuttle.position.x < shuttle.size.w * 0.5) {
        shuttle.position.x = shuttle.size.w * 0.5;
    }

    if (shuttle.position.x > Game.__winSize__.width - shuttle.size.w * 0.5) {
        shuttle.position.x = Game.__winSize__.width - shuttle.size.w * 0.5;
    }
};

Game.checkCollision = function () {};

Game.checkSuccess = function () {};
