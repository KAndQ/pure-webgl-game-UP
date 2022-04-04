const GameAudio = {
    playKeyDown: function () {
        GameRes.getAudio(GameRes.AUD_CLICK).play();
    },

    playFail: function () {
        GameRes.getAudio(GameRes.AUD_FAIL).play();
    },

    playBGM: function () {
        const audio = GameRes.getAudio(GameRes.AUD_BGM);
        audio.loop = true;
        audio.volume = 0.2;
        audio.play();
    },

    stopBGM: function () {
        const audio = GameRes.getAudio(GameRes.AUD_BGM);
        audio.pause();
    },
};
