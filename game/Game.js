const SHUTTLE_MOVE_SPEED = 300.0;
const SHUTTLE_SPEED_UP_SCALE = 3.0;
const SHUTTLE_FIXED_Y = 58;
const BACKGROUND_MOVE_SCALE = 0.382;
const DISTANCE = 358000;
const DISTANCE_MOVE_SCALE = 2;
const ACCELERATED = 10;
const INIT_UP_SPEED = 200.0;
const MAX_UP_SPEED = 840;
const MAX_Y_INTERVAL = 360;

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
let isInteraction = false;
let shuttleChanged = false;
let brickChangedCount = 0;
let distanceElement = undefined;
let speedElement = undefined;

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
    switch (brickChangedCount) {
        case 0:
            brick.imgId = GameRes.IMG_BRICK_1;
            break;
        case 1:
            brick.imgId = GameRes.IMG_BRICK_2;
            break;
        case 2:
            brick.imgId = GameRes.IMG_BRICK_3;
            break;
        default:
            {
                const r = Math.random();
                if (r <= 0.3) {
                    brick.imgId = GameRes.IMG_BRICK_1;
                } else if (r <= 0.6) {
                    brick.imgId = GameRes.IMG_BRICK_2;
                } else {
                    brick.imgId = GameRes.IMG_BRICK_3;
                }
            }
            break;
    }
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

function intersects(one, two) {
    // const maxax = this.x + this.width;
    // const maxay = this.y + this.height;
    // const maxbx = other.x + other.width;
    // const maxby = other.y + other.height;
    // return !(maxax < other.x || maxbx < this.x || maxay < other.y || maxby < this.y);

    const maxax = one.x + one.w;
    const maxay = one.y + one.h;
    const maxbx = two.x + two.w;
    const maxby = two.y + two.h;
    return !(maxax < two.x || maxbx < one.x || maxay < two.y || maxby < one.y);
}

Game.launch = function () {
    console.log("UP Coming...");

    distanceElement = document.querySelector("#distance");
    speedElement = document.querySelector("#speed");

    const gl = GameGlobal.getGL();
    Game.__winSize__ = { width: gl.canvas.width, height: gl.canvas.height };
    console.log("[SYS] ==>> winSize =", Game.__winSize__);

    document.addEventListener("keydown", function (e) {
        if (!isInteraction) {
            isInteraction = true;
            GameAudio.playBGM();
        }

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
            case "Escape":
                alert("Pause");
                break;
        }
    });

    GameSprite.init();

    for (let i = 1; i <= 3; ++i) {
        const background = GameSprite.createBackground(GameRes.IMG_TILE_BACKGROUND);
        backgrounds.push(background);
        Game.__sprites__.push(background);
    }

    shuttle = GameSprite.createSpaceshipSprite(GameRes.IMG_SHUTTLE_1);
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
        console.log("****************************************");
        console.log(`==>> currentDistance = ${currentDistance.toFixed(1)}`);
        console.log(`==>> yInterval = ${yInterval.toFixed(1)}`);
        console.log(`==>> upSpeed = ${upSpeed.toFixed(1)}`);
        console.log("****************************************");
    }, 5000);
};

Game.start = function () {
    Game.__pause__ = false;

    // background
    backgrounds.forEach((background, index) => {
        background.position.x = Game.__winSize__.width * 0.5;
        background.position.y = background.size.h * (index + 0.5);
    });

    // shuttle
    shuttle.position.x = Game.__winSize__.width * 0.5;
    shuttle.position.y = SHUTTLE_FIXED_Y;
    shuttleChanged = false;
    shuttle.imgId = GameRes.IMG_SHUTTLE_1;

    // bricks
    bricksCache.forEach((brick) => {
        brick.isHide = true;
        brick.imgId = GameRes.IMG_BRICK_1;
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
    brickChangedCount = 0;
};

Game.update = function () {
    currentDistance += upSpeed * Game.__elapse__ * DISTANCE_MOVE_SCALE;

    upSpeed += ACCELERATED * Game.__elapse__;
    if (upSpeed > MAX_UP_SPEED) {
        upSpeed = MAX_UP_SPEED;
    }

    yInterval += ACCELERATED * Game.__elapse__;
    if (yInterval > MAX_Y_INTERVAL) {
        yInterval = MAX_Y_INTERVAL;
    }

    if (!shuttleChanged && currentDistance >= DISTANCE * 0.5) {
        shuttleChanged = true;
        shuttle.imgId = GameRes.IMG_SHUTTLE_2;
    }

    if (brickChangedCount === 0) {
        if (currentDistance >= DISTANCE * 0.25) {
            brickChangedCount++;
        }
    } else if (brickChangedCount === 1) {
        if (currentDistance >= DISTANCE * 0.5) {
            brickChangedCount++;
        }
    } else if (brickChangedCount === 2) {
        if (currentDistance >= DISTANCE * 0.75) {
            brickChangedCount++;
        }
    }

    Game.updateBackground();
    Game.updateBricks();
    Game.updateShuttle();
    Game.checkCollision();
    Game.checkSuccess();

    distanceElement.textContent = `${(currentDistance / 1000).toFixed(2)}/${(DISTANCE / 1000).toFixed(0)} KM`;
    speedElement.textContent = `${(upSpeed * DISTANCE_MOVE_SCALE).toFixed(1)}(${MAX_UP_SPEED * DISTANCE_MOVE_SCALE}) m/s`;

    if (isFailed) {
        Game.fail();
    } else if (isSuccess) {
        Game.success();
    }
};

Game.updateBackground = function () {
    backgrounds.forEach((v) => {
        v.position.y -= upSpeed * Game.__elapse__ * BACKGROUND_MOVE_SCALE;
    });

    backgrounds.forEach((v, index) => {
        if (v.position.y + v.size.h * 0.5 < 0) {
            index = index === 0 ? backgrounds.length - 1 : index - 1;
            const another = backgrounds[index % backgrounds.length];
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

Game.checkCollision = function () {
    // const shuttleRects = [
    //     { x: shuttle.position.x - 7, y: shuttle.position.y - 13, w: 14, h: 29 },
    //     { x: shuttle.position.x - 22, y: shuttle.position.y - 13, w: 44, h: 7 },
    // ];
    // for (const brick of runningBricks) {
    //     const brickRect = { x: brick.position.x, y: brick.position.y, w: brick.size.w, h: brick.size.h };
    //     for (const shuttleRect of shuttleRects) {
    //         if (intersects(shuttleRect, brickRect)) {
    //             isFailed = true;
    //             return;
    //         }
    //     }
    // }
};

Game.checkSuccess = function () {
    if (currentDistance >= DISTANCE && !isFailed) {
        isSuccess = true;
    }
};

Game.fail = function () {
    GameAudio.stopBGM();
    Game.__pause__ = true;
    setTimeout(() => alert("THE SHUTTLE CRASHED!!!\nPlease refresh the PAGE."), 0);
};

Game.success = function () {
    GameAudio.stopBGM();
    Game.__pause__ = true;
    setTimeout(() => alert(`Congratulations!!!\nThe shuttle to achieve ${Math.floor(DISTANCE * 0.001)}KM\nThank you for playing my game.`), 0);
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
    Game.__elapse__ = (time - Game.__now__) * 0.001;
    Game.__now__ = time;

    if (Game.__elapse__ <= 0.2) {
        if (!Game.__pause__) {
            Game.update(time);
        }
    }

    Game.draw();
    requestAnimationFrame(Game.mainLoop);
};
