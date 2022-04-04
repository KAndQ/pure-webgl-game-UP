const GameAudio = {
    playKeyDown: function () {
        GameRes.getAudio(GameRes.AUD_CLICK).play();
    },

    playFail: function () {
        GameRes.getAudio(GameRes.AUD_FAIL).play();
    },

    playBGM: function () {
        GameRes.getAudio(GameRes.AUD_BGM).play();
    },
};
