const Game = {
    __now__: 0,
    __elapse__: 0,
};

Game.update = function (time) {
    Game.__elapse__ = (time - Game.now) * 0.001;
};

Game.draw = function () {};

Game.mainLoop = function (time) {
    Game.update(time);
    Game.draw();
};

Game.launch = function () {
    console.log("Hello. UP Coming...");

    Game.__now__ = 0;
    Game.mainLoop(0);
    requestAnimationFrame(Game.mainLoop);
};
