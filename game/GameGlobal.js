const GameGlobal = {};

GameGlobal.getGL = function () {
    if (!gl) {
        const canvas = document.querySelector("#GameCanvas");
        GameGlobal.__gl__ = canvas.getContext("webgl2");
    }

    return GameGlobal.__gl__;
};
