const Game = {
    __now__: 0,
    __elapse__: 0,
    __sprites__: [],
};

Game.update = function (time) {
    Game.__elapse__ = (time - Game.now) * 0.001;
};

Game.draw = function () {
    const gl = GameGlobal.getGL();

    gl.clearColor(1, 0, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    Game.__sprites__.forEach(function (v) {
        GameSprite.draw(v);
    });
};

Game.mainLoop = function (time) {
    Game.update(time);
    Game.draw();
    requestAnimationFrame(Game.mainLoop);
};

Game.launch = function () {
    console.log("UP Coming...");

    const gl = GameGlobal.getGL();

    GameSprite.init();

    // const background = GameSprite.createBackground(GameRes.IMG_TILE_BACKGROUND);
    // background.position.x = gl.canvas.width * 0.5;
    // background.position.y = gl.canvas.height * 0.5;
    // Game.__sprites__.push(background);

    // for (let i = 0; i < 4; ++i) {
    //     const brick = GameSprite.createBrickSprite(GameRes.IMG_BRICK_1, i);
    //     brick.position.x = 0;
    //     brick.position.y = i * 64;
    //     Game.__sprites__.push(brick);
    // }

    // const shuttle = GameSprite.createSpaceshipSprite(GameRes.IMG_SHUTTLE_1);
    // shuttle.position.x = 290;
    // shuttle.position.y = 250;
    // Game.__sprites__.push(shuttle);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    Game.__now__ = 0;
    Game.mainLoop(0);
};
