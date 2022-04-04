const SHUTTLE_MOVE_SPEED = 200.0;
const SHUTTLE_SPEED_UP_SCALE = 3.0;
const SHUTTLE_FIXED_Y = 64;
const BACKGROUND_MOVE_SCALE = 0.5;

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
let bricks = [];
let upSpeed = 200.0;
let isFailed = false;
let isSuccess = false;

Game.update = function (time) {
    Game.__elapse__ = (time - Game.__now__) * 0.001;
    Game.__now__ = time;
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

        if (i === 1) {
            background.position.x = Game.__winSize__.width * 0.5;
            background.position.y = background.size.h * 0.5;
        } else {
            background.position.x = Game.__winSize__.width * 0.5;
            background.position.y = background.size.h * 1.5;
        }

        Game.__sprites__.push(background);
    }

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
        const brick = GameSprite.createBrickSprite(GameRes.IMG_BRICK_3, sizeType);
        brick.isHide = true;
        bricks.push(brick);

        Game.__sprites__.push(brick);
    }

    shuttle = GameSprite.createSpaceshipSprite(GameRes.IMG_SHUTTLE_2);
    shuttle.position.x = Game.__winSize__.width * 0.5;
    shuttle.position.y = SHUTTLE_FIXED_Y;
    Game.__sprites__.push(shuttle);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    Game.__now__ = 0;
    Game.mainLoop(0);
};

Game.start = function () {
    Game.__pause__ = false;
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

Game.updateBricks = function () {};

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
