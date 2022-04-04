const GameGlobal = {};

GameGlobal.getGL = function () {
    if (!GameGlobal.__gl__) {
        const canvas = document.querySelector("#GameCanvas");
        GameGlobal.__gl__ = canvas.getContext("webgl2");
    }

    return GameGlobal.__gl__;
};
